package render

import (
	"fmt"
	"go/types"

	"github.com/wailsapp/wails/v3/internal/flags"
	"github.com/wailsapp/wails/v3/internal/parser/collect"
	"golang.org/x/tools/go/types/typeutil"
)

// module gathers data that is used when rendering a single JS/TS module.
type module struct {
	*Renderer
	*flags.GenerateBindingsOptions

	Imports *collect.ImportMap

	deferrals typeutil.Map
}

type deferralKind int

const (
	create deferralKind = iota
	garble
	ungarble
)

var deferralName = [...]string{
	create:   "create",
	garble:   "garble",
	ungarble: "ungarble",
}

type deferral struct {
	index  int
	params [3]string
	kinds  [3]bool
}

func (m *module) deferred(kind deferralKind, typ types.Type) string {
	df, _ := m.deferrals.At(typ).(*deferral)

	if df != nil && df.kinds[kind] {
		return fmt.Sprintf("$$%sType%d%s", deferralName[kind], df.index, df.params[kind])
	}

	return ""
}

func (m *module) defer_(kind deferralKind, typ types.Type, params string) string {
	df, _ := m.deferrals.At(typ).(*deferral)

	if df == nil {
		df = &deferral{index: m.deferrals.Len()}
		m.deferrals.Set(typ, df)
	}

	df.params[kind] = params
	df.kinds[kind] = true
	return fmt.Sprintf("$$%sType%d%s", deferralName[kind], df.index, df.params[kind])
}
