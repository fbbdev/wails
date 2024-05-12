package render

import (
	"fmt"
	"go/types"
	"slices"
	"strings"
	"text/template"

	"github.com/wailsapp/wails/v3/internal/parser/collect"
)

// SkipUngarble returns true if the given array of types requires no ungarbling code.
func (m *module) SkipUngarble(ts []types.Type) bool {
	for _, typ := range ts {
		if m.IsGarbled(typ) {
			return false
		}
	}
	return true
}

// JSUngarble renders JS/TS code that ungarbles an instance
// of the given type.
//
// JSUngarble's output may be incorrect
// if m.Imports.AddType has not been called for the given type.
func (m *module) JSUngarble(typ types.Type) string {
	return m.JSUngarbleWithParams(typ, "")
}

// JSUngarbleWithParams renders JS/TS code that ungarbles an instance
// of the given type. For generic types, it renders parameterised code.
//
// JSUngarbleWithParams's output may be incorrect
// if m.Imports.AddType has not been called for the given type.
func (m *module) JSUngarbleWithParams(typ types.Type, params string) string {
	if len(params) > 0 && !m.hasTypeParams(typ) {
		// Forget params for non-generic types.
		params = ""
	}

	switch t := typ.(type) {
	case *types.Alias:
		return m.JSUngarbleWithParams(types.Unalias(typ), params)

	case *types.Array, *types.Pointer, *types.Slice:
		df := m.deferred(ungarble, typ)
		if df != "" {
			return df
		}

		ungarbleElement := m.JSUngarbleWithParams(typ.(interface{ Elem() types.Type }).Elem(), params)
		if ungarbleElement != "$Types.UngarbleAny" {
			return m.defer_(ungarble, typ, params)
		}

	case *types.Map:
		df := m.deferred(ungarble, typ)
		if df == "" {
			m.JSUngarbleWithParams(t.Key(), params)
			m.JSUngarbleWithParams(t.Elem(), params)
			df = m.defer_(ungarble, typ, params)
		}

		return df

	case *types.Named:
		if t.Obj().Pkg() == nil {
			// Builtin named type: ungarble underlying type.
			return m.JSUngarbleWithParams(t.Underlying(), params)
		}

		if collect.IsAny(typ) || collect.IsString(typ) || !m.IsGarbled(typ) {
			break
		}

		df := m.deferred(ungarble, typ)
		if df == "" {
			if t.TypeArgs() != nil && t.TypeArgs().Len() > 0 {
				// Defer type args.
				for i := range t.TypeArgs().Len() {
					m.JSUngarbleWithParams(t.TypeArgs().At(i), params)
				}
			}

			df = m.defer_(ungarble, typ, params)

			m.JSUngarbleWithParams(t.Underlying(), params)
		}

		return df

	case *types.Struct:
		df := m.deferred(ungarble, typ)
		if df != "" {
			return df
		}

		info := m.collector.Struct(t)
		info.Collect()

		defer_ := false
		for _, field := range info.Fields {
			ungarbleField := m.JSUngarbleWithParams(field.Type, params)
			if field.JSName != field.JsonName || ungarbleField != "$Types.UngarbleAny" {
				defer_ = true
			}
		}

		if defer_ {
			return m.defer_(ungarble, typ, params)
		}

	case *types.TypeParam:
		return fmt.Sprintf("$$ungarbleParam%s", typeparam(t.Index(), t.Obj().Name()))
	}

	return "$Types.UngarbleAny"
}

// DeferredUngarbles returns the list of deferred ungarbling functions
// for the given module.
func (m *module) DeferredUngarbles() []string {
	result := make([]string, m.deferrals.Len())

	m.deferrals.Iterate(func(key types.Type, value any) {
		df := value.(*deferral)
		if !df.kinds[ungarble] {
			return
		}

		pre := ""
		params := df.params[ungarble]
		if params != "" {
			pre = params + " => "
		}

		switch t := key.(type) {
		case *types.Array, *types.Slice:
			result[df.index] = fmt.Sprintf("%s$Types.UngarbleArray(%s)", pre, m.JSUngarbleWithParams(t.(interface{ Elem() types.Type }).Elem(), params))

		case *types.Map:
			result[df.index] = fmt.Sprintf(
				"%s$Types.UngarbleMap(%s, %s)",
				pre,
				m.JSUngarbleWithParams(t.Key(), params),
				m.JSUngarbleWithParams(t.Elem(), params),
			)

		case *types.Named:
			result[df.index] = fmt.Sprintf(`
function $$initUngarbleType%d(...args) {
    if ($$ungarbleType%d === $$initUngarbleType%d) {
        $$ungarbleType%d = %s%s;
    }
    return $$ungarbleType%d(...args);
}`,
				df.index,
				df.index, df.index,
				df.index, pre, m.JSUngarbleWithParams(t.Underlying(), params),
				df.index,
			)[1:] // Remove initial newline.

		case *types.Pointer:
			result[df.index] = fmt.Sprintf("%s$Types.UngarbleNullable(%s)", pre, m.JSUngarbleWithParams(t.Elem(), params))

		case *types.Struct:
			info := m.collector.Struct(t)
			info.Collect()

			var builder strings.Builder
			builder.WriteString(pre)
			builder.WriteString("$Types.UngarbleStruct({")

			for _, field := range info.Fields {
				ungarbleField := m.JSUngarbleWithParams(field.Type, params)

				builder.WriteString("\n    \"")
				template.JSEscape(&builder, []byte(field.JSName))
				builder.WriteString("\": { from: \"")
				template.JSEscape(&builder, []byte(field.JsonName))
				builder.WriteString("\", ungarble: ")
				builder.WriteString(ungarbleField)
				builder.WriteString(" },")
			}

			if len(info.Fields) > 0 {
				builder.WriteRune('\n')
			}
			builder.WriteString("})")

			result[df.index] = builder.String()

		default:
			result[df.index] = pre + "$Types.UngarbleAny"
		}
	})

	// Cleanup result slice.
	return slices.DeleteFunc(result, func(s string) bool {
		return s == ""
	})
}
