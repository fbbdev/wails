package api

import (
	"fmt"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type windowByName struct{}

// Returns the absolute position of the window to the screen.
func (windowByName) AbsolutePosition(wndName string) (_ Position, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.AbsolutePosition(wnd), nil
}

// Centers the window on the screen.
func (windowByName) Center(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Center(wnd)
	return nil
}

// Closes the window.
func (windowByName) Close(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Close(wnd)
	return nil
}

// Disables min/max size constraints.
func (windowByName) DisableSizeConstraints(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.DisableSizeConstraints(wnd)
	return nil
}

// Enables min/max size constraints.
func (windowByName) EnableSizeConstraints(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.EnableSizeConstraints(wnd)
	return nil
}

// Focuses the window.
func (windowByName) Focus(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Focus(wnd)
	return nil
}

// Forces the window to reload the page assets.
func (windowByName) ForceReload(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.ForceReload(wnd)
	return nil
}

// Switches the window to fullscreen mode.
func (windowByName) Fullscreen(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Fullscreen(wnd)
	return nil
}

// Returns the size of the four window borders.
func (windowByName) GetBorderSizes(wndName string) (_ LRTB, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.GetBorderSizes(wnd), nil
}

// Returns the screen that the window is on.
func (windowByName) GetScreen(wndName string) (_ Screen, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.GetScreen(wnd)
}

// Returns the current zoom level of the window.
func (windowByName) GetZoom(wndName string) (_ float64, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.GetZoom(wnd), nil
}

// Returns the height of the window.
func (windowByName) Height(wndName string) (_ int, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.Height(wnd), nil
}

// Hides the window.
func (windowByName) Hide(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Hide(wnd)
	return nil
}

// Returns true if the window is focused.
func (windowByName) IsFocused(wndName string) (_ bool, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.IsFocused(wnd), nil
}

// Returns true if the window is fullscreen.
func (windowByName) IsFullscreen(wndName string) (_ bool, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.IsFullscreen(wnd), nil
}

// Returns true if the window is maximised.
func (windowByName) IsMaximised(wndName string) (_ bool, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.IsMaximised(wnd), nil
}

// Returns true if the window is minimised.
func (windowByName) IsMinimised(wndName string) (_ bool, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.IsMinimised(wnd), nil
}

// Maximises the window.
func (windowByName) Maximise(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Maximise(wnd)
	return nil
}

// Minimises the window.
func (windowByName) Minimise(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Minimise(wnd)
	return nil
}

// Returns the name of the window.
func (windowByName) Name(wndName string) (_ string, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.Name(wnd), nil
}

// Opens the development tools pane.
func (windowByName) OpenDevTools(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.OpenDevTools(wnd)
	return nil
}

// Returns the relative position of the window to the screen.
func (windowByName) RelativePosition(wndName string) (_ Position, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.RelativePosition(wnd), nil
}

// Reloads page assets.
func (windowByName) Reload(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Reload(wnd)
	return nil
}

// Returns true if the window is resizable.
func (windowByName) Resizable(wndName string) (_ bool, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.Resizable(wnd), nil
}

// Restores the window to its previous state if it was previously minimised, maximised or fullscreen.
func (windowByName) Restore(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Restore(wnd)
	return nil
}

// Sets the absolute position of the window to the screen.
func (windowByName) SetAbsolutePosition(wndName string, x, y int) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetAbsolutePosition(wnd, x, y)
	return nil
}

// Sets the window to be always on top.
func (windowByName) SetAlwaysOnTop(wndName string, aot bool) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetAlwaysOnTop(wnd, aot)
	return nil
}

// Sets the background colour of the window.
func (windowByName) SetBackgroundColour(wndName string, colour RGBA) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetBackgroundColour(wnd, colour)
	return nil
}

// Removes the window frame and title bar.
func (windowByName) SetFrameless(wndName string, frameless bool) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetFrameless(wnd, frameless)
	return nil
}

// Enables or disables the system fullscreen button.
func (windowByName) SetFullscreenButtonEnabled(wndName string, enabled bool) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetFullscreenButtonEnabled(wnd, enabled)
	return nil
}

// Sets the maximum size of the window.
func (windowByName) SetMaxSize(wndName string, width, height int) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetMaxSize(wnd, width, height)
	return nil
}

// Sets the minimum size of the window.
func (windowByName) SetMinSize(wndName string, width, height int) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetMinSize(wnd, width, height)
	return nil
}

// Sets the relative position of the window to the screen.
func (windowByName) SetRelativePosition(wndName string, x, y int) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetRelativePosition(wnd, x, y)
	return nil
}

// Sets whether the window is resizable.
func (windowByName) SetResizable(wndName string, resizable bool) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetResizable(wnd, resizable)
	return nil
}

// Sets the size of the window.
func (windowByName) SetSize(wndName string, width, height int) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetSize(wnd, width, height)
	return nil
}

// Sets the title of the window.
func (windowByName) SetTitle(wndName string, title string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetTitle(wnd, title)
	return nil
}

// Sets the zoom level of the window.
func (windowByName) SetZoom(wndName string, magnification float64) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.SetZoom(wnd, magnification)
	return nil
}

// Shows the window.
func (windowByName) Show(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Show(wnd)
	return nil
}

// Returns the size of the window.
func (windowByName) Size(wndName string) (_ Size, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.Size(wnd), nil
}

// Toggles the window between fullscreen and normal.
func (windowByName) ToggleFullscreen(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.ToggleFullscreen(wnd)
	return nil
}

// Toggles the window between maximised and normal.
func (windowByName) ToggleMaximise(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.ToggleMaximise(wnd)
	return nil
}

// Un-fullscreens the window.
func (windowByName) UnFullscreen(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.UnFullscreen(wnd)
	return nil
}

// Un-maximises the window.
func (windowByName) UnMaximise(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.UnMaximise(wnd)
	return nil
}

// Un-minimises the window.
func (windowByName) UnMinimise(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.UnMinimise(wnd)
	return nil
}

// Returns the width of the window.
func (windowByName) Width(wndName string) (_ int, err error) {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		err = fmt.Errorf("window '%s' not found", wndName)
		return
	}

	return Window{}.Width(wnd), nil
}

// Zooms the window.
func (windowByName) Zoom(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.Zoom(wnd)
	return nil
}

// Increases the zoom level of the webview content.
func (windowByName) ZoomIn(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.ZoomIn(wnd)
	return nil
}

// Decreases the zoom level of the webview content.
func (windowByName) ZoomOut(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.ZoomOut(wnd)
	return nil
}

// Resets the zoom level of the webview content.
func (windowByName) ZoomReset(wndName string) error {
	wnd := application.Get().GetWindowByName(wndName)
	if wnd == nil {
		return fmt.Errorf("window '%s' not found", wndName)
	}

	Window{}.ZoomReset(wnd)
	return nil
}
