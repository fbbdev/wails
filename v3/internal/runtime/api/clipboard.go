package api

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

type Clipboard struct{}

// SetText writes the given string to the Clipboard.
// It returns true if the operation succeeded, false otherwise.
func (Clipboard) SetText(text string) bool {
	return application.Get().Clipboard().SetText(text)
}

// Text retrieves a string from the clipboard.
// If the operation fails, it returns null.
func (Clipboard) Text() *string {
	text, ok := application.Get().Clipboard().Text()
	if !ok {
		return nil
	}

	return &text
}
