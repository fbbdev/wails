package api

import (
	"fmt"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//wails:inject t*:export type {
//wails:inject t*:    Position,
//wails:inject t*:    RGBA,
//wails:inject t*:    LRTB,
//wails:inject t*:    Screen,
//wails:inject t*:    Size,
//wails:inject t*:    Rect,
//wails:inject t*:} from "./models.ts";
//wails:inject t*:
//wails:inject **:import * as self from "./window.js";
//wails:inject
//wails:inject j*:/** @type {any} */
//wails:inject j*:let thisWindow = null;
//wails:inject t*:let thisWindow: any = null;
//wails:inject
//wails:inject **:/**
//wails:inject **: * Returns a window object for the given window name.
//wails:inject j*: * @param {string | null | undefined} [name = ""]
//wails:inject j*: * @returns { { readonly [Key in keyof (typeof self) as Exclude<Key, "Get" | "RGBA">]: (typeof self)[Key] } }
//wails:inject **: */
//wails:inject j*:export function Get(name = null) {
//wails:inject t*:export function Get(name: string | null | undefined = null): { readonly [Key in keyof (typeof self) as Exclude<Key, "Get" | "RGBA">]: (typeof self)[Key] } {
//wails:inject **:    const names = [], wnd = {};
//wails:inject **:    if (name != null && name !== "") {
//wails:inject **:        names.push(name);
//wails:inject **:    } else if (thisWindow !== null) {
//wails:inject **:        // Optimise empty target case for WML.
//wails:inject **:        return thisWindow;
//wails:inject **:    } else {
//wails:inject **:        thisWindow = wnd;
//wails:inject **:    }
//wails:inject **:    for (const key in self) {
//wails:inject **:        if (key !== "Get" && key !== "RGBA") {
//wails:inject **:            const method = self[key];
//wails:inject **:            wnd[key] = (...args) => method(...args, ...names);
//wails:inject **:        }
//wails:inject **:    }
//wails:inject j*:    return /** @type {any} */(Object.freeze(wnd));
//wails:inject t*:    return (Object.freeze(wnd) as any);
//wails:inject **:}
type Window struct{}

type Position = struct {
	X, Y int
}

type RGBA = struct {
	application.RGBA
}

type LRTB = struct {
	*application.LRTB
}

// selectWindow is employed by the methods below to select a window to act upon.
// If the target slice is empty or the first element is the empty string,
// it defaults to the calling window. Otherwise, it looks up a window whose
// name is equal to the first element of the target slice.
// If found, it returns that window; otherwise it returns an error.
func selectWindow(wnd application.Window, targetWindow ...string) (application.Window, error) {
	if len(targetWindow) == 0 || targetWindow[0] == "" {
		return wnd, nil
	} else {
		wnd = application.Get().GetWindowByName(targetWindow[0])
		if wnd == nil {
			return nil, fmt.Errorf("window '%s' not found", targetWindow[0])
		}

		return wnd, nil
	}
}

// Returns the absolute position of the window to the screen.
func (Window) AbsolutePosition(wnd application.Window, targetWindow ...string) (result Position, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		x, y := wnd.AbsolutePosition()
		result = Position{x, y}
	}
	return
}

// Centers the window on the screen.
func (Window) Center(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Center()
	}
	return
}

// Closes the window.
func (Window) Close(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Close()
	}
	return
}

// Disables min/max size constraints.
func (Window) DisableSizeConstraints(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.DisableSizeConstraints()
	}
	return
}

// Enables min/max size constraints.
func (Window) EnableSizeConstraints(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.EnableSizeConstraints()
	}
	return
}

// Focuses the window.
func (Window) Focus(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Focus()
	}
	return
}

// Forces the window to reload the page assets.
func (Window) ForceReload(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.ForceReload()
	}
	return
}

// Switches the window to fullscreen mode.
func (Window) Fullscreen(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Fullscreen()
	}
	return
}

// Returns the size of the four window borders.
func (Window) GetBorderSizes(wnd application.Window, targetWindow ...string) (result LRTB, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = LRTB{wnd.GetBorderSizes()}
	}
	return
}

// Returns the screen that the window is on.
func (Window) GetScreen(wnd application.Window, targetWindow ...string) (result Screen, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result.Screen, err = wnd.GetScreen()
		if result.Screen != nil && err != nil {
			result.Size = Size{result.Screen.Size}
			result.Bounds = Rect{result.Screen.Bounds}
			result.WorkArea = Rect{result.Screen.WorkArea}
		}
	}
	return
}

// Returns the current zoom level of the window.
func (Window) GetZoom(wnd application.Window, targetWindow ...string) (result float64, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = wnd.GetZoom()
	}
	return
}

// Returns the height of the window.
func (Window) Height(wnd application.Window, targetWindow ...string) (result int, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = wnd.Height()
	}
	return
}

// Hides the window.
func (Window) Hide(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Hide()
	}
	return
}

// Returns true if the window is focused.
func (Window) IsFocused(wnd application.Window, targetWindow ...string) (result bool, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = wnd.IsFocused()
	}
	return
}

// Returns true if the window is fullscreen.
func (Window) IsFullscreen(wnd application.Window, targetWindow ...string) (result bool, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = wnd.IsFullscreen()
	}
	return
}

// Returns true if the window is maximised.
func (Window) IsMaximised(wnd application.Window, targetWindow ...string) (result bool, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = wnd.IsMaximised()
	}
	return
}

// Returns true if the window is minimised.
func (Window) IsMinimised(wnd application.Window, targetWindow ...string) (result bool, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = wnd.IsMinimised()
	}
	return
}

// Maximises the window.
func (Window) Maximise(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Maximise()
	}
	return
}

// Minimises the window.
func (Window) Minimise(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Minimise()
	}
	return
}

// Returns the name of the window.
func (Window) Name(wnd application.Window, targetWindow ...string) (result string, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = wnd.Name()
	}
	return
}

// Opens the development tools pane.
func (Window) OpenDevTools(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.OpenDevTools()
	}
	return
}

// Returns the relative position of the window to the screen.
func (Window) RelativePosition(wnd application.Window, targetWindow ...string) (result Position, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		x, y := wnd.RelativePosition()
		result = Position{x, y}
	}
	return
}

// Reloads page assets.
func (Window) Reload(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Reload()
	}
	return
}

// Returns true if the window is resizable.
func (Window) Resizable(wnd application.Window, targetWindow ...string) (result bool, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = wnd.Resizable()
	}
	return
}

// Restores the window to its previous state if it was previously minimised, maximised or fullscreen.
func (Window) Restore(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Restore()
	}
	return
}

// Sets the absolute position of the window to the screen.
func (Window) SetAbsolutePosition(wnd application.Window, x, y int, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetAbsolutePosition(x, y)
	}
	return
}

// Sets the window to be always on top.
func (Window) SetAlwaysOnTop(wnd application.Window, aot bool, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetAlwaysOnTop(aot)
	}
	return
}

// Sets the background colour of the window.
func (Window) SetBackgroundColour(wnd application.Window, colour RGBA, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetBackgroundColour(colour.RGBA)
	}
	return
}

// Removes the window frame and title bar.
func (Window) SetFrameless(wnd application.Window, frameless bool, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetFrameless(frameless)
	}
	return
}

// Enables or disables the system fullscreen button.
func (Window) SetFullscreenButtonEnabled(wnd application.Window, enabled bool, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetFullscreenButtonEnabled(enabled)
	}
	return
}

// Sets the maximum size of the window.
func (Window) SetMaxSize(wnd application.Window, width, height int, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetMaxSize(width, height)
	}
	return
}

// Sets the minimum size of the window.
func (Window) SetMinSize(wnd application.Window, width, height int, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetMinSize(width, height)
	}
	return
}

// Sets the relative position of the window to the screen.
func (Window) SetRelativePosition(wnd application.Window, x, y int, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetRelativePosition(x, y)
	}
	return
}

// Sets whether the window is resizable.
func (Window) SetResizable(wnd application.Window, resizable bool, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetResizable(resizable)
	}
	return
}

// Sets the size of the window.
func (Window) SetSize(wnd application.Window, width, height int, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetSize(width, height)
	}
	return
}

// Sets the title of the window.
func (Window) SetTitle(wnd application.Window, title string, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetTitle(title)
	}
	return
}

// Sets the zoom level of the window.
func (Window) SetZoom(wnd application.Window, magnification float64, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.SetZoom(magnification)
	}
	return
}

// Shows the window.
func (Window) Show(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Show()
	}
	return
}

// Returns the size of the window.
func (Window) Size(wnd application.Window, targetWindow ...string) (result Size, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		w, h := wnd.Size()
		result = Size{application.Size{Width: w, Height: h}}
	}
	return
}

// Toggles the window between fullscreen and normal.
func (Window) ToggleFullscreen(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.ToggleFullscreen()
	}
	return
}

// Toggles the window between maximised and normal.
func (Window) ToggleMaximise(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.ToggleMaximise()
	}
	return
}

// Un-fullscreens the window.
func (Window) UnFullscreen(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.UnFullscreen()
	}
	return
}

// Un-maximises the window.
func (Window) UnMaximise(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.UnMaximise()
	}
	return
}

// Un-minimises the window.
func (Window) UnMinimise(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.UnMinimise()
	}
	return
}

// Returns the width of the window.
func (Window) Width(wnd application.Window, targetWindow ...string) (result int, err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		result = wnd.Width()
	}
	return
}

// Zooms the window.
func (Window) Zoom(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.Zoom()
	}
	return
}

// Increases the zoom level of the webview content.
func (Window) ZoomIn(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.ZoomIn()
	}
	return
}

// Decreases the zoom level of the webview content.
func (Window) ZoomOut(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.ZoomOut()
	}
	return
}

// Resets the zoom level of the webview content.
func (Window) ZoomReset(wnd application.Window, targetWindow ...string) (err error) {
	if wnd, err = selectWindow(wnd, targetWindow...); err == nil {
		wnd.ZoomReset()
	}
	return
}
