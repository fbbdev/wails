package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
	runtimeapi "github.com/wailsapp/wails/v3/pkg/runtime"
	runtimebundle "github.com/wailsapp/wails/v3/pkg/runtime/bundle"
)

//go:embed assets/*
var assets embed.FS

func main() {

	app := application.New(application.Options{
		Name:        "Screen Demo",
		Description: "A demo of the Screen API",
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		Windows: application.WindowsOptions{
			WndProcInterceptor:            nil,
			DisableQuitOnLastWindowClosed: false,
			WebviewUserDataPath:           "",
			WebviewBrowserPath:            "",
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
		Title:  "Screen Demo",
		Width:  800,
		Height: 600,
		Mac: application.MacWindow{
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInsetUnified,
			InvisibleTitleBarHeight: 50,
		},
	})

	err := app.Run()

	if err != nil {
		log.Fatal(err.Error())
	}
}
