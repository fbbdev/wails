package render

import (
	"fmt"
	"go/types"
	"slices"
	"strings"
	"text/template"

	"github.com/wailsapp/wails/v3/internal/parser/collect"
)

// IsGarbledModel returns true if the given model requires garbling/ungarbling code.
func (m *module) IsGarbledModel(model *collect.ModelInfo) bool {
	if model.Type != nil {
		return m.IsGarbled(model.Type)
	}

	for _, decl := range model.Fields {
		for _, field := range decl {
			if field.JSName != field.JsonName || m.IsGarbled(field.StructField.Type) {
				return true
			}
		}
	}

	return false
}

// IsGarbled returns true if the given type requires garbling/ungarbling code.
func (m *module) IsGarbled(typ types.Type) bool {
	return m.isGarbledImpl(typ, make(map[*types.TypeName]bool))
}

// isGarbledImpl provides the actual implementation of IsGarbled.
// The visited parameter is used to break cycles.
func (m *module) isGarbledImpl(typ types.Type, visited map[*types.TypeName]bool) bool {
	switch t := typ.(type) {
	case *types.Alias:
		return m.isGarbledImpl(types.Unalias(typ), visited)

	case *types.Array, *types.Pointer, *types.Slice:
		return m.isGarbledImpl(typ.(interface{ Elem() types.Type }).Elem(), visited)

	case *types.Map:
		return m.isGarbledImpl(t.Elem(), visited) || m.isGarbledImpl(t.Key(), visited)

	case *types.Named:
		if visited[t.Obj()] {
			return false
		}
		visited[t.Obj()] = true

		if t.Obj().Pkg() == nil {
			// Builtin named type: query underlying type.
			return m.isGarbledImpl(t.Underlying(), visited)
		}

		if collect.IsAny(typ) || collect.IsString(typ) {
			break
		} else {
			return m.isGarbledImpl(t.Underlying(), visited)
		}

	case *types.Struct:
		info := m.collector.Struct(t)
		info.Collect()

		for _, field := range info.Fields {
			if field.JSName != field.JsonName || m.isGarbledImpl(field.Type, visited) {
				return true
			}
		}
	}

	return false
}

// JSGarble renders JS/TS code that garbles an instance
// of the given type.
//
// JSGarble's output may be incorrect
// if m.Imports.AddType has not been called for the given type.
func (m *module) JSGarble(typ types.Type) string {
	return m.JSGarbleWithParams(typ, "")
}

// JSGarbleWithParams renders JS/TS code that garbles an instance
// of the given type. For generic types, it renders parameterised code.
//
// JSGarbleWithParams's output may be incorrect
// if m.Imports.AddType has not been called for the given type.
func (m *module) JSGarbleWithParams(typ types.Type, params string) string {
	if len(params) > 0 && !m.hasTypeParams(typ) {
		// Forget params for non-generic types.
		params = ""
	}

	switch t := typ.(type) {
	case *types.Alias:
		return m.JSGarbleWithParams(types.Unalias(typ), params)

	case *types.Array, *types.Pointer, *types.Slice:
		df := m.deferred(garble, typ)
		if df != "" {
			return df
		}

		garbleElement := m.JSGarbleWithParams(typ.(interface{ Elem() types.Type }).Elem(), params)
		if garbleElement != "$Types.GarbleAny" {
			return m.defer_(garble, typ, params)
		}

	case *types.Map:
		df := m.deferred(garble, typ)
		if df == "" {
			m.JSGarbleWithParams(t.Key(), params)
			m.JSGarbleWithParams(t.Elem(), params)
			df = m.defer_(garble, typ, params)
		}

		return df

	case *types.Named:
		if t.Obj().Pkg() == nil {
			// Builtin named type: garble underlying type.
			return m.JSGarbleWithParams(t.Underlying(), params)
		}

		if collect.IsAny(typ) || collect.IsString(typ) || !m.IsGarbled(typ) {
			break
		}

		df := m.deferred(garble, typ)
		if df == "" {
			if t.TypeArgs() != nil && t.TypeArgs().Len() > 0 {
				// Defer type args.
				for i := range t.TypeArgs().Len() {
					m.JSGarbleWithParams(t.TypeArgs().At(i), params)
				}
			}

			df = m.defer_(garble, typ, params)

			if m.UseInterfaces || !collect.IsClass(typ) {
				m.JSGarbleWithParams(t.Underlying(), params)
			}
		}

		return df

	case *types.Struct:
		df := m.deferred(garble, typ)
		if df != "" {
			return df
		}

		info := m.collector.Struct(t)
		info.Collect()

		defer_ := false
		for _, field := range info.Fields {
			garbleField := m.JSGarbleWithParams(field.Type, params)
			if field.JSName != field.JsonName || garbleField != "$Types.GarbleAny" {
				defer_ = true
			}
		}

		if defer_ {
			return m.defer_(garble, typ, params)
		}

	case *types.TypeParam:
		return fmt.Sprintf("$$garbleParam%s", typeparam(t.Index(), t.Obj().Name()))
	}

	return "$Types.GarbleAny"
}

// DeferredGarbles returns the list of deferred garbling functions
// for the given module.
func (m *module) DeferredGarbles() []string {
	result := make([]string, m.deferrals.Len())

	m.deferrals.Iterate(func(key types.Type, value any) {
		df := value.(*deferral)
		if !df.kinds[garble] {
			return
		}

		pre := ""
		params := df.params[garble]
		if params != "" {
			pre = params + " => "
		}

		switch t := key.(type) {
		case *types.Array, *types.Slice:
			result[df.index] = fmt.Sprintf("%s$Types.GarbleArray(%s)", pre, m.JSGarbleWithParams(t.(interface{ Elem() types.Type }).Elem(), params))

		case *types.Map:
			result[df.index] = fmt.Sprintf(
				"%s$Types.GarbleMap(%s, %s)",
				pre,
				m.JSGarbleWithParams(t.Key(), params),
				m.JSGarbleWithParams(t.Elem(), params),
			)

		case *types.Named:
			if m.UseInterfaces || !collect.IsClass(key) {
				result[df.index] = fmt.Sprintf(`
function $$initGarbleType%d(...args) {
    if ($$garbleType%d === $$initGarbleType%d) {
        $$garbleType%d = %s%s;
    }
    return $$garbleType%d(...args);
}`,
					df.index,
					df.index, df.index,
					df.index, pre, m.JSGarbleWithParams(t.Underlying(), params),
					df.index,
				)[1:] // Remove initial newline.
				break
			}

			var builder strings.Builder

			builder.WriteString(pre)

			if t.Obj().Pkg().Path() == m.Imports.Self {
				if t.Obj().Exported() && m.Imports.ImportModels {
					builder.WriteString("$models.")
				} else if !t.Obj().Exported() && m.Imports.ImportInternal {
					builder.WriteString("$internal.")
				}
			} else {
				builder.WriteString(jsimport(m.Imports.External[t.Obj().Pkg().Path()]))
				builder.WriteRune('.')
			}
			builder.WriteString(jsid(t.Obj().Name()))
			builder.WriteString(".garble")

			if t.TypeArgs() != nil && t.TypeArgs().Len() > 0 {
				builder.WriteString("(")
				for i := range t.TypeArgs().Len() {
					if i > 0 {
						builder.WriteString(", ")
					}
					builder.WriteString(m.JSGarbleWithParams(t.TypeArgs().At(i), params))
				}
				builder.WriteString(")")
			}

			result[df.index] = builder.String()

		case *types.Pointer:
			result[df.index] = fmt.Sprintf("%s$Types.GarbleNullable(%s)", pre, m.JSGarbleWithParams(t.Elem(), params))

		case *types.Struct:
			info := m.collector.Struct(t)
			info.Collect()

			var builder strings.Builder
			builder.WriteString(pre)
			builder.WriteString("$Types.GarbleStruct({")

			for _, field := range info.Fields {
				garbleField := m.JSGarbleWithParams(field.Type, params)

				builder.WriteString("\n    \"")
				template.JSEscape(&builder, []byte(field.JSName))
				builder.WriteString("\": { to: \"")
				template.JSEscape(&builder, []byte(field.JsonName))
				builder.WriteString("\", garble: ")
				builder.WriteString(garbleField)
				builder.WriteString(" },")
			}

			if len(info.Fields) > 0 {
				builder.WriteRune('\n')
			}
			builder.WriteString("})")

			result[df.index] = builder.String()

		default:
			result[df.index] = pre + "$Types.GarbleAny"
		}
	})

	// Cleanup result slice.
	return slices.DeleteFunc(result, func(s string) bool {
		return s == ""
	})
}
