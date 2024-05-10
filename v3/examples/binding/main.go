package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
	runtimecore "github.com/wailsapp/wails/v3/pkg/runtime/core"
)

//go:embed assets/*
var assets embed.FS

func main() {
	app := application.New(application.Options{
		Bind: []application.Service{
			application.NewService(&GreetService{}),
		},
		Assets: application.AssetOptions{
			Handler:    application.AssetFileServerFS(assets),
			Middleware: runtimecore.Bundle,
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		URL:             "/",
		DevToolsEnabled: true,
	})

	err := app.Run()

	if err != nil {
		log.Fatal(err)
	}

}
