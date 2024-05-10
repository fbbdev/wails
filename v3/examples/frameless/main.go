package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
	runtimecore "github.com/wailsapp/wails/v3/pkg/runtime/core"
)

//go:embed assets
var assets embed.FS

func main() {

	app := application.New(application.Options{
		Name:        "Frameless Demo",
		Description: "A demo of frameless windows",
		Assets: application.AssetOptions{
			Handler:    application.AssetFileServerFS(assets),
			Middleware: runtimecore.Bundle,
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Frameless: true,
	})

	err := app.Run()

	if err != nil {
		log.Fatal(err.Error())
	}
}
