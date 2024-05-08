package api

import (
	"fmt"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type Screens struct{}

type Screen = struct {
	*application.Screen

	Size     Size // The size of the display
	Bounds   Rect // The bounds of the display
	WorkArea Rect // The work area of the display
}

type Rect = struct {
	application.Rect
}

type Size = struct {
	application.Size
}

// GetAll returns descriptors for all screens.
func (Screens) GetAll() ([]Screen, error) {
	screens, err := application.Get().GetScreens()
	if err != nil {
		return nil, err
	}

	result := make([]Screen, len(screens))
	for i, screen := range screens {
		result[i] = Screen{
			Screen:   screen,
			Size:     Size{screen.Size},
			Bounds:   Rect{screen.Bounds},
			WorkArea: Rect{screen.WorkArea},
		}
	}

	return result, nil
}

// GetPrimary returns a descriptor for the primary screen.
func (Screens) GetPrimary() (Screen, error) {
	screen, err := application.Get().GetPrimaryScreen()
	return Screen{
		Screen:   screen,
		Size:     Size{screen.Size},
		Bounds:   Rect{screen.Bounds},
		WorkArea: Rect{screen.WorkArea},
	}, err
}

// GetCurrent returns a descriptor for the screen
// where the currently active window is located.
func (Screens) GetCurrent() (Screen, error) {
	wnd := application.Get().CurrentWindow()
	if wnd == nil {
		return Screen{}, fmt.Errorf("no screen is currently active")
	}

	screen, err := wnd.GetScreen()
	return Screen{
		Screen:   screen,
		Size:     Size{screen.Size},
		Bounds:   Rect{screen.Bounds},
		WorkArea: Rect{screen.WorkArea},
	}, err
}
