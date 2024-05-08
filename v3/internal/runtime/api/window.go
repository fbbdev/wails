package api

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

//wails:inject jc:export {RGBA} from "./models.js";
//wails:inject tc:export {RGBA} from "./models.ts";
//wails:inject
//wails:inject j*:import * as self from "./Window.js";
//wails:inject t*:import * as self from "./Window.ts";
//wails:inject j*:import * as byName from "./windowByName.js";
//wails:inject t*:import * as byName from "./windowByName.ts";
//wails:inject
//wails:inject **:/**
//wails:inject **: * Returns a window object for the given window name.
//wails:inject j*: * @param {string} name
//wails:inject j*: * @returns { { readonly [Method in keyof (typeof self) as Exclude<Method, "Get">]: (typeof self)[Method] } }
//wails:inject **: */
//wails:inject j*:export function Get(name) {
//wails:inject t*:export function Get(name: string): { readonly [Method in keyof (typeof self) as Exclude<Method, "Get">]: (typeof self)[Method] } {
//wails:inject **:    const wnd = {};
//wails:inject **:    for (const method in self) {
//wails:inject **:        if (method !== "Get") {
//wails:inject **:            wnd[method] = byName[method].bind(null, name);
//wails:inject **:        }
//wails:inject **:    }
//wails:inject j*:    return /** @type {any} */(Object.freeze(wnd));
//wails:inject t*:    return (Object.freeze(wnd) as any);
//wails:inject **:}
type Window struct{}

type Position struct {
	X, Y int
}

type RGBA struct {
	application.RGBA
}

type LRTB struct {
	*application.LRTB
}

// Returns the absolute position of the window to the screen.
func (Window) AbsolutePosition(wnd application.Window) Position {
	x, y := wnd.AbsolutePosition()
	return Position{x, y}
}

// Centers the window on the screen.
func (Window) Center(wnd application.Window) {
	wnd.Center()
}

// Closes the window.
func (Window) Close(wnd application.Window) {
	wnd.Close()
}

// Disables min/max size constraints.
func (Window) DisableSizeConstraints(wnd application.Window) {
	wnd.DisableSizeConstraints()
}

// Enables min/max size constraints.
func (Window) EnableSizeConstraints(wnd application.Window) {
	wnd.EnableSizeConstraints()
}

// Focuses the window.
func (Window) Focus(wnd application.Window) {
	wnd.Focus()
}

// Forces the window to reload the page assets.
func (Window) ForceReload(wnd application.Window) {
	wnd.ForceReload()
}

// Switches the window to fullscreen mode.
func (Window) Fullscreen(wnd application.Window) {
	wnd.Fullscreen()
}

// Returns the size of the four window borders.
func (Window) GetBorderSizes(wnd application.Window) LRTB {
	return LRTB{wnd.GetBorderSizes()}
}

// Returns the screen that the window is on.
func (Window) GetScreen(wnd application.Window) (Screen, error) {
	screen, err := wnd.GetScreen()
	return Screen{
		Screen:   screen,
		Size:     Size{screen.Size},
		Bounds:   Rect{screen.Bounds},
		WorkArea: Rect{screen.WorkArea},
	}, err
}

// Returns the current zoom level of the window.
func (Window) GetZoom(wnd application.Window) float64 {
	return wnd.GetZoom()
}

// Returns the height of the window.
func (Window) Height(wnd application.Window) int {
	return wnd.Height()
}

// Hides the window.
func (Window) Hide(wnd application.Window) {
	wnd.Hide()
}

// Returns true if the window is focused.
func (Window) IsFocused(wnd application.Window) bool {
	return wnd.IsFocused()
}

// Returns true if the window is fullscreen.
func (Window) IsFullscreen(wnd application.Window) bool {
	return wnd.IsFullscreen()
}

// Returns true if the window is maximised.
func (Window) IsMaximised(wnd application.Window) bool {
	return wnd.IsMaximised()
}

// Returns true if the window is minimised.
func (Window) IsMinimised(wnd application.Window) bool {
	return wnd.IsMinimised()
}

// Maximises the window.
func (Window) Maximise(wnd application.Window) {
	wnd.Maximise()
}

// Minimises the window.
func (Window) Minimise(wnd application.Window) {
	wnd.Minimise()
}

// Returns the name of the window.
func (Window) Name(wnd application.Window) string {
	return wnd.Name()
}

// Opens the development tools pane.
func (Window) OpenDevTools(wnd application.Window) {
	wnd.OpenDevTools()
}

// Returns the relative position of the window to the screen.
func (Window) RelativePosition(wnd application.Window) Position {
	x, y := wnd.RelativePosition()
	return Position{x, y}
}

// Reloads page assets.
func (Window) Reload(wnd application.Window) {
	wnd.Reload()
}

// Returns true if the window is resizable.
func (Window) Resizable(wnd application.Window) bool {
	return wnd.Resizable()
}

// Restores the window to its previous state if it was previously minimised, maximised or fullscreen.
func (Window) Restore(wnd application.Window) {
	wnd.Restore()
}

// Sets the absolute position of the window to the screen.
func (Window) SetAbsolutePosition(wnd application.Window, x, y int) {
	wnd.SetAbsolutePosition(x, y)
}

// Sets the window to be always on top.
func (Window) SetAlwaysOnTop(wnd application.Window, aot bool) {
	wnd.SetAlwaysOnTop(aot)
}

// Sets the background colour of the window.
func (Window) SetBackgroundColour(wnd application.Window, colour RGBA) {
	wnd.SetBackgroundColour(colour.RGBA)
}

// Removes the window frame and title bar.
func (Window) SetFrameless(wnd application.Window, frameless bool) {
	wnd.SetFrameless(frameless)
}

// Enables or disables the system fullscreen button.
func (Window) SetFullscreenButtonEnabled(wnd application.Window, enabled bool) {
	wnd.SetFullscreenButtonEnabled(enabled)
}

// Sets the maximum size of the window.
func (Window) SetMaxSize(wnd application.Window, width, height int) {
	wnd.SetMaxSize(width, height)
}

// Sets the minimum size of the window.
func (Window) SetMinSize(wnd application.Window, width, height int) {
	wnd.SetMinSize(width, height)
}

// Sets the relative position of the window to the screen.
func (Window) SetRelativePosition(wnd application.Window, x, y int) {
	wnd.SetRelativePosition(x, y)
}

// Sets whether the window is resizable.
func (Window) SetResizable(wnd application.Window, resizable bool) {
	wnd.SetResizable(resizable)
}

// Sets the size of the window.
func (Window) SetSize(wnd application.Window, width, height int) {
	wnd.SetSize(width, height)
}

// Sets the title of the window.
func (Window) SetTitle(wnd application.Window, title string) {
	wnd.SetTitle(title)
}

// Sets the zoom level of the window.
func (Window) SetZoom(wnd application.Window, magnification float64) {
	wnd.SetZoom(magnification)
}

// Shows the window.
func (Window) Show(wnd application.Window) {
	wnd.Show()
}

// Returns the size of the window.
func (Window) Size(wnd application.Window) Size {
	w, h := wnd.Size()
	return Size{application.Size{Width: w, Height: h}}
}

// Toggles the window between fullscreen and normal.
func (Window) ToggleFullscreen(wnd application.Window) {
	wnd.ToggleFullscreen()
}

// Toggles the window between maximised and normal.
func (Window) ToggleMaximise(wnd application.Window) {
	wnd.ToggleMaximise()
}

// Un-fullscreens the window.
func (Window) UnFullscreen(wnd application.Window) {
	wnd.UnFullscreen()
}

// Un-maximises the window.
func (Window) UnMaximise(wnd application.Window) {
	wnd.UnMaximise()
}

// Un-minimises the window.
func (Window) UnMinimise(wnd application.Window) {
	wnd.UnMinimise()
}

// Returns the width of the window.
func (Window) Width(wnd application.Window) int {
	return wnd.Width()
}

// Zooms the window.
func (Window) Zoom(wnd application.Window) {
	wnd.Zoom()
}

// Increases the zoom level of the webview content.
func (Window) ZoomIn(wnd application.Window) {
	wnd.ZoomIn()
}

// Decreases the zoom level of the webview content.
func (Window) ZoomOut(wnd application.Window) {
	wnd.ZoomOut()
}

// Resets the zoom level of the webview content.
func (Window) ZoomReset(wnd application.Window) {
	wnd.ZoomReset()
}
