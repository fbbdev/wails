package config

// WailsAppPkgPath is the canonical import path of Wails v3's application package.
const WailsAppPkgPath = "github.com/wailsapp/wails/v3/pkg/application"

// WailsRuntimePkgPaths is the set of canonical import patterns for Wails v3's JS runtime.
var WailsRuntimePkgPaths = []string{
	"github.com/wailsapp/wails/v3/internal/runtime/...",
	"github.com/wailsapp/wails/v3/pkg/runtime/...",
}

// WailsCoreRuntimePkgPath is the canonical import path of Wails v3's internal core JS runtime package.
const WailsCoreRuntimePkgPath = "github.com/wailsapp/wails/v3/pkg/runtime/core"

// WailsFullRuntimePkgPath is the canonical import path of Wails v3's public JS runtime package.
const WailsFullRuntimePkgPath = "github.com/wailsapp/wails/v3/pkg/runtime"

// SystemPaths holds resolved paths of required system packages.
type SystemPaths struct {
	ContextPackage     string
	ApplicationPackage string
	CoreRuntimePackage string
	FullRuntimePackage string
	RuntimePackages    []string
}
