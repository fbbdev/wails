package render

import (
	"fmt"
	"go/types"
	"slices"
	"strings"
	"text/template"

	"github.com/wailsapp/wails/v3/internal/parser/collect"
)

// SkipCreate returns true if the given array of types needs no creation code.
func (m *module) SkipCreate(ts []types.Type) bool {
	for _, typ := range ts {
		if m.NeedsCreate(typ) {
			return false
		}
	}
	return true
}

// NeedsCreate returns true if the given type needs some creation code.
func (m *module) NeedsCreate(typ types.Type) bool {
	return m.needsCreateImpl(typ, make(map[*types.TypeName]bool))
}

// needsCreateImpl provides the actual implementation of NeedsCreate.
// The visited parameter is used to break cycles.
func (m *module) needsCreateImpl(typ types.Type, visited map[*types.TypeName]bool) bool {
	switch t := typ.(type) {
	case *types.Alias, *types.Named:
		obj := typ.(interface{ Obj() *types.TypeName }).Obj()
		if visited[obj] {
			return false
		}
		visited[obj] = true

		if obj.Pkg() == nil {
			// Builtin alias or named type: render underlying type.
			return m.needsCreateImpl(t.Underlying(), visited)
		}

		if collect.IsAny(t) || collect.IsString(t) {
			break
		} else if collect.IsClass(t) {
			return true
		} else if _, isAlias := typ.(*types.Alias); isAlias {
			return m.needsCreateImpl(types.Unalias(t), visited)
		} else {
			return m.needsCreateImpl(t.Underlying(), visited)
		}

	case *types.Array, *types.Pointer:
		return m.needsCreateImpl(typ.(interface{ Elem() types.Type }).Elem(), visited)

	case *types.Map, *types.Slice:
		return true

	case *types.Struct:
		info := m.collector.Struct(t)
		info.Collect()

		for _, field := range info.Fields {
			if field.JSName != field.JsonName || m.needsCreateImpl(field.Type, visited) {
				return true
			}
		}

	case *types.TypeParam:
		return true
	}

	return false
}

// JSCreate renders JS/TS code that creates an instance
// of the given type from JSON data.
//
// JSCreate's output may be incorrect
// if m.Imports.AddType has not been called for the given type.
func (m *module) JSCreate(typ types.Type) string {
	return m.JSCreateWithParams(typ, "")
}

// JSCreateWithParams renders JS/TS code that creates an instance
// of the given type from JSON data. For generic types,
// it renders parameterised code.
//
// JSCreateWithParams's output may be incorrect
// if m.Imports.AddType has not been called for the given type.
func (m *module) JSCreateWithParams(typ types.Type, params string) string {
	if len(params) > 0 && !m.hasTypeParams(typ) {
		// Forget params for non-generic types.
		params = ""
	}

	switch t := typ.(type) {
	case *types.Alias:
		return m.JSCreateWithParams(types.Unalias(typ), params)

	case *types.Array, *types.Pointer:
		df := m.deferred(create, typ)
		if df != "" {
			return df
		}

		createElement := m.JSCreateWithParams(typ.(interface{ Elem() types.Type }).Elem(), params)
		if createElement != "$Types.CreateAny" {
			return m.defer_(create, typ, params)
		}

	case *types.Map:
		df := m.deferred(create, typ)
		if df == "" {
			m.JSCreateWithParams(t.Key(), params)
			m.JSCreateWithParams(t.Elem(), params)
			df = m.defer_(create, typ, params)
		}

		return df

	case *types.Named:
		if t.Obj().Pkg() == nil {
			// Builtin named type: render underlying type.
			return m.JSCreateWithParams(t.Underlying(), params)
		}

		if collect.IsAny(typ) || collect.IsString(typ) || !m.NeedsCreate(typ) {
			break
		}

		df := m.deferred(create, typ)
		if df == "" {
			if t.TypeArgs() != nil && t.TypeArgs().Len() > 0 {
				// Defer type args.
				for i := range t.TypeArgs().Len() {
					m.JSCreateWithParams(t.TypeArgs().At(i), params)
				}
			}

			df = m.defer_(create, typ, params)

			if !collect.IsClass(typ) {
				m.JSCreateWithParams(t.Underlying(), params)
			}
		}

		return df

	case *types.Slice:
		if types.Identical(typ, typeByteSlice) {
			return "$Types.CreateByteSlice"
		}

		df := m.deferred(create, typ)
		if df == "" {
			m.JSCreateWithParams(t.Elem(), params)
			df = m.defer_(create, typ, params)
		}

		return df

	case *types.Struct:
		df := m.deferred(create, typ)
		if df != "" {
			return df
		}

		info := m.collector.Struct(t)
		info.Collect()

		defer_ := false
		for _, field := range info.Fields {
			createField := m.JSCreateWithParams(field.Type, params)
			if field.JSName != field.JsonName || createField != "$Types.CreateAny" {
				defer_ = true
			}
		}

		if defer_ {
			return m.defer_(create, typ, params)
		}

	case *types.TypeParam:
		return fmt.Sprintf("$$createParam%s", typeparam(t.Index(), t.Obj().Name()))
	}

	return "$Types.CreateAny"
}

// DeferredCreates returns the list of deferred create functions
// for the given module.
func (m *module) DeferredCreates() []string {
	result := make([]string, m.deferrals.Len())

	m.deferrals.Iterate(func(key types.Type, value any) {
		df := value.(*deferral)
		if !df.kinds[create] {
			return
		}

		pre := ""
		params := df.params[create]
		if params != "" {
			pre = params + " => "
		}

		switch t := key.(type) {
		case *types.Array, *types.Slice:
			result[df.index] = fmt.Sprintf("%s$Types.CreateArray(%s)", pre, m.JSCreateWithParams(t.(interface{ Elem() types.Type }).Elem(), params))

		case *types.Map:
			result[df.index] = fmt.Sprintf(
				"%s$Types.CreateMap(%s, %s)",
				pre,
				m.JSCreateWithParams(t.Key(), params),
				m.JSCreateWithParams(t.Elem(), params),
			)

		case *types.Named:
			if !collect.IsClass(key) {
				result[df.index] = fmt.Sprintf(`
function $$initCreateType%d(...args) {
    if ($$createType%d === $$initCreateType%d) {
        $$createType%d = %s%s;
    }
    return $$createType%d(...args);
}`,
					df.index,
					df.index, df.index,
					df.index, pre, m.JSCreateWithParams(t.Underlying(), params),
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
			builder.WriteString(".createFrom")

			if t.TypeArgs() != nil && t.TypeArgs().Len() > 0 {
				builder.WriteString("(")
				for i := range t.TypeArgs().Len() {
					if i > 0 {
						builder.WriteString(", ")
					}
					builder.WriteString(m.JSCreateWithParams(t.TypeArgs().At(i), params))
				}
				builder.WriteString(")")
			}

			result[df.index] = builder.String()

		case *types.Pointer:
			result[df.index] = fmt.Sprintf("%s$Types.CreateNullable(%s)", pre, m.JSCreateWithParams(t.Elem(), params))

		case *types.Struct:
			info := m.collector.Struct(t)
			info.Collect()

			type ungarbleEntry struct{ from, to string }
			ungarbleMap := make([]ungarbleEntry, 0, len(info.Fields))

			var builder strings.Builder
			builder.WriteString(pre)
			builder.WriteString("$Types.CreateStruct({")

			for i, field := range info.Fields {
				if field.JSName != field.JsonName {
					ungarbleMap = append(ungarbleMap, ungarbleEntry{field.JsonName, field.JSName})
				}

				createField := m.JSCreateWithParams(field.Type, params)
				if createField == "$Types.CreateAny" {
					continue
				}

				if i > 0 {
					builder.WriteRune(',')
				}
				builder.WriteString("\n    \"")
				template.JSEscape(&builder, []byte(field.JSName))
				builder.WriteString("\": ")
				builder.WriteString(createField)
			}

			if len(info.Fields) > 0 {
				builder.WriteRune('\n')
			}
			builder.WriteRune('}')

			if len(ungarbleMap) > 0 {
				builder.WriteString(", {")

				for i, entry := range ungarbleMap {
					if i > 0 {
						builder.WriteRune(',')
					}
					builder.WriteString("\n    \"")
					template.JSEscape(&builder, []byte(entry.from))
					builder.WriteString("\": \"")
					template.JSEscape(&builder, []byte(entry.to))
					builder.WriteRune('"')
				}

				builder.WriteString("\n}")
			}

			builder.WriteRune(')')

			result[df.index] = builder.String()

		default:
			result[df.index] = pre + "$Types.CreateAny"
		}
	})

	// Cleanup result slice.
	return slices.DeleteFunc(result, func(s string) bool {
		return s == ""
	})
}

// hasTypeParams returns true if the given type depends upon type parameters.
func (m *module) hasTypeParams(typ types.Type) bool {
	switch t := typ.(type) {
	case *types.Alias:
		if t.Obj().Pkg() == nil {
			// Builtin alias: these are never rendered as templates.
			return false
		}

		return m.hasTypeParams(types.Unalias(typ))

	case *types.Array, *types.Pointer, *types.Slice:
		return m.hasTypeParams(typ.(interface{ Elem() types.Type }).Elem())

	case *types.Map:
		return m.hasTypeParams(t.Key()) || m.hasTypeParams(t.Elem())

	case *types.Named:
		if t.Obj().Pkg() == nil {
			// Builtin named type: these are never rendered as templates.
			return false
		}

		if targs := t.TypeArgs(); targs != nil {
			for i := range targs.Len() {
				if m.hasTypeParams(targs.At(i)) {
					return true
				}
			}
		}

	case *types.Struct:
		info := m.collector.Struct(t)
		info.Collect()

		for _, field := range info.Fields {
			if m.hasTypeParams(field.Type) {
				return true
			}
		}

	case *types.TypeParam:
		return true
	}

	return false
}
