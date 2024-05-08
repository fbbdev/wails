package config

// WailsAppPkgPath is the official import path of Wails v3's application package.
const WailsAppPkgPath = "github.com/wailsapp/wails/v3/pkg/application"

// WailsRuntimePkgPath is the official import path of Wails v3's internal JS runtime package.
const WailsRuntimePkgPath = "github.com/wailsapp/wails/v3/internal/runtime/js"

// SystemPaths holds resolved paths of required system packages.
type SystemPaths struct {
	ContextPackage     string
	ApplicationPackage string
	RuntimePackage     string
}
