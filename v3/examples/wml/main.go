package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/runtimeapi"
	runtimebundle "github.com/wailsapp/wails/v3/pkg/runtimeapi/bundle/full"
)

//go:embed assets/*
var assets embed.FS

func main() {

	app := application.New(application.Options{
		Name:        "Wails ML Demo",
		Description: "A demo of the Wails ML API",
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		Assets: application.AssetOptions{
			Handler:    application.AssetFileServerFS(assets),
			Middleware: runtimebundle.Full,
		},
		Bind: []application.Service{
			runtimeapi.Service,
		},
	})

	app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Title:  "Wails ML Demo",
		Width:  1280,
		Height: 1024,
		Mac: application.MacWindow{
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInsetUnified,
			InvisibleTitleBarHeight: 50,
		},
	})

	app.Events.On("button-pressed", func(_ *application.WailsEvent) {
		println("Button Pressed!")
	})
	app.Events.On("hover", func(_ *application.WailsEvent) {
		println("Hover time!")
	})

	err := app.Run()

	if err != nil {
		log.Fatal(err.Error())
	}
}
