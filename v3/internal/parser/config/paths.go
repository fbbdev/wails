package config

// WailsAppPkgPath is the official import path of Wails v3's application package.
const WailsAppPkgPath = "github.com/wailsapp/wails/v3/pkg/application"

// WailsRuntimePkgPaths is the set of official import patterns for Wails v3's JS runtime.
var WailsRuntimePkgPaths = []string{
	"github.com/wailsapp/wails/v3/internal/runtime/...",
	"github.com/wailsapp/wails/v3/pkg/runtime/...",
}

// WailsRuntimeCorePkgPath is the official import path of Wails v3's internal JS runtime core package.
const WailsRuntimeCorePkgPath = "github.com/wailsapp/wails/v3/internal/runtime/core"

// SystemPaths holds resolved paths of required system packages.
type SystemPaths struct {
	ContextPackage     string
	ApplicationPackage string
	RuntimeCorePackage string
	RuntimePackages    []string
}
