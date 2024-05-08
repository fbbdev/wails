package runtime

import "github.com/wailsapp/wails/v3/pkg/application"

type Application struct{}

// Hide makes all application windows invisible.
func (Application) Hide() {
	application.Get().Hide()
}

// Show makes all application windows visible.
func (Application) Show() {
	application.Get().Show()
}

// Quit quits the application.
func (Application) Quit() {
	application.Get().Quit()
}
