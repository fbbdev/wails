package application

import "github.com/wailsapp/wails/v3/internal/operatingsystem"

// EnvironmentInfo represents information about the current environment.
//
// Fields:
// - OS: the operating system that the program is running on.
// - Arch: the architecture of the operating system.
// - Debug: indicates whether debug mode is enabled.
// - OSInfo: information about the operating system.
type EnvironmentInfo struct {
	OS           string              // The operating system in use.
	Arch         string              // The architecture of the system.
	Debug        bool                // True if the application is running in debug mode, otherwise false.
	OSInfo       *operatingsystem.OS // Details of the operating system.
	PlatformInfo map[string]any      // Additional platform information.
}
