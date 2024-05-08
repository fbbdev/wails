package runtime

import (
	"github.com/wailsapp/wails/v3/internal/operatingsystem"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//wails:inject export * from "../../internal/runtime/js/system.js";
type System struct{}

// IsDarkMode retrieves system dark mode status.
func (System) IsDarkMode() bool {
	return application.Get().IsDarkMode()
}

type EnvironmentInfo struct {
	application.EnvironmentInfo

	OSInfo OSInfo // Details of the operating system.
}

type OSInfo struct {
	*operatingsystem.OS
}

// Environment retrieves environment details.
func (System) Environment() EnvironmentInfo {
	env := application.Get().Environment()
	return EnvironmentInfo{
		EnvironmentInfo: env,
		OSInfo:          OSInfo{env.OSInfo},
	}
}
