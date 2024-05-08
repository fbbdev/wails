package api

import "github.com/wailsapp/wails/v3/pkg/application"

//wails:inject export * from "./listener.js";
type Events struct{}

// Emit emits an event using the given event object.
// You can pass in instances of the class `WailsEvent`.
func (Events) Emit(wnd application.Window, event struct {
	Name string `json:"name"`
	Data any    `json:"data"`
}) {
	wevent := application.WailsEvent{
		Name: event.Name,
		Data: event.Data,
	}

	if wnd != nil {
		wevent.Sender = wnd.Name()
	}

	application.Get().Events.Emit(&wevent)
}
