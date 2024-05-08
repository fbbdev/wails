package api

import (
	"github.com/wailsapp/wails/v3/internal/operatingsystem"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//wails:inject export * from "../core/system.js";
type System struct{}

type EnvironmentInfo = struct {
	application.EnvironmentInfo

	OSInfo OSInfo // Details of the operating system.
}

type OSInfo = struct {
	*operatingsystem.OS
}

// IsDarkMode retrieves system dark mode status.
func (System) IsDarkMode() bool {
	return application.Get().IsDarkMode()
}

// Environment retrieves environment details.
func (System) Environment() EnvironmentInfo {
	env := application.Get().Environment()
	return EnvironmentInfo{
		EnvironmentInfo: env,
		OSInfo:          OSInfo{env.OSInfo},
	}
}
