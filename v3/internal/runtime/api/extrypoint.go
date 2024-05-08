//wails:internal
//wails:include *.js
//wails:inject export {Call, Flags, Types} from "../core/index.js";
//wails:inject export * as WML from "./wml.js";
package api

import (
	// Pull in core code.
	_ "github.com/wailsapp/wails/v3/internal/runtime/core"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func Service() application.Service {
	return application.NewCombinedService(
		application.NewService(&Application{}),
		application.NewService(&Browser{}),
		application.NewService(&Clipboard{}),
		application.NewService(&Dialogs{}),
		application.NewService(&Events{}),
		application.NewService(&Screens{}),
		application.NewService(&System{}),
		application.NewService(&Window{}),
		application.NewService(&windowByName{}),
	)
}
