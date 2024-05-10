package api

import (
	"runtime"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//wails:inject t*:export type {
//wails:inject t*:    Button,
//wails:inject t*:    FileFilter,
//wails:inject t*:    MessageDialogOptions,
//wails:inject t*:    OpenFileDialogOptions,
//wails:inject t*:    SaveFileDialogOptions
//wails:inject t*:} from "./models.ts";
type Dialogs struct{}

type Button = struct {
	application.Button
}

type FileFilter = struct {
	application.FileFilter
}

type MessageDialogOptions = struct {
	application.MessageDialogOptions

	// List of button choices to show in the dialog.
	Buttons []Button `json:",omitempty"`
	// Indicates whether the dialog should appear detached from the main window.
	Detached bool `json:",omitempty"`
}

type OpenFileDialogOptions = struct {
	application.OpenFileDialogOptions

	// List of file filters.
	Filters []FileFilter `json:",omitempty"`

	// Indicates whether the dialog should appear detached from the main window.
	Detached bool `json:",omitempty"`
}

type SaveFileDialogOptions = struct {
	application.SaveFileDialogOptions

	// List of file filters.
	Filters []FileFilter `json:",omitempty"`

	// Indicates whether the dialog should appear detached from the main window.
	Detached bool `json:",omitempty"`
}

// Info shows a modal dialog containing an informational message.
func (Dialogs) Info(wnd application.Window, options MessageDialogOptions) string {
	return messageDialog(wnd, &options, application.InfoDialog())
}

// Warning shows a modal dialog containing a warning message.
func (Dialogs) Warning(wnd application.Window, options MessageDialogOptions) string {
	return messageDialog(wnd, &options, application.InfoDialog())
}

// Error shows a modal dialog containing an error message.
func (Dialogs) Error(wnd application.Window, options MessageDialogOptions) string {
	return messageDialog(wnd, &options, application.InfoDialog())
}

// Question shows a modal dialog asking a question.
func (Dialogs) Question(wnd application.Window, options MessageDialogOptions) string {
	return messageDialog(wnd, &options, application.InfoDialog())
}

func messageDialog(wnd application.Window, options *MessageDialogOptions, dialog *application.MessageDialog) string {
	options.DialogType = dialog.DialogType

	if len(options.Buttons) == 0 {
		switch runtime.GOOS {
		case "darwin":
			options.MessageDialogOptions.Buttons = []*application.Button{{Label: "OK", IsDefault: true}}
		}
	} else {
		options.MessageDialogOptions.Buttons = make([]*application.Button, len(options.Buttons))
		for i, btn := range options.Buttons {
			options.MessageDialogOptions.Buttons[i] = &btn.Button
		}
	}

	result := make(chan string, 1) // MUST be buffered.

	for _, btn := range options.MessageDialogOptions.Buttons {
		label := btn.Label
		btn.OnClick(func() { result <- label })
	}

	dialog.MessageDialogOptions = options.MessageDialogOptions

	if !options.Detached {
		if _, ok := wnd.(*application.WebviewWindow); ok {
			dialog.AttachToWindow(wnd)
		}
	}

	dialog.Show()

	return <-result
}

// OpenFile shows a dialog that allows the user
// to select one or more files to open.
// It may throw an exception in case of errors.
// It returns a string in single selection mode,
// an array of strings in multiple selection mode.
func (Dialogs) OpenFile(wnd application.Window, options OpenFileDialogOptions) (any, error) {
	options.OpenFileDialogOptions.Filters = make([]application.FileFilter, len(options.Filters))
	for i, filter := range options.Filters {
		options.OpenFileDialogOptions.Filters[i] = filter.FileFilter
	}

	dialog := application.OpenFileDialogWithOptions(&options.OpenFileDialogOptions)

	if !options.Detached {
		if _, ok := wnd.(*application.WebviewWindow); ok {
			dialog.AttachToWindow(wnd)
		}
	}

	if options.AllowsMultipleSelection {
		return dialog.PromptForMultipleSelection()
	} else {
		return dialog.PromptForSingleSelection()
	}
}

// SaveFile shows a dialog that allows the user
// to select a location where a file should be saved.
// It may throw an exception in case of errors.
func (Dialogs) SaveFile(wnd application.Window, options SaveFileDialogOptions) (string, error) {
	options.SaveFileDialogOptions.Filters = make([]application.FileFilter, len(options.Filters))
	for i, filter := range options.Filters {
		options.SaveFileDialogOptions.Filters[i] = filter.FileFilter
	}

	dialog := application.SaveFileDialogWithOptions(&options.SaveFileDialogOptions)

	if !options.Detached {
		if _, ok := wnd.(*application.WebviewWindow); ok {
			dialog.AttachToWindow(wnd)
		}
	}

	return dialog.PromptForSingleSelection()
}
