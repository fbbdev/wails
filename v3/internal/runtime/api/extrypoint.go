//wails:include *.js
//wails:inject import * as WML from "./wml.js";
//wails:inject export { WML };
package api

import (
	// Pull in core code.
	_ "github.com/wailsapp/wails/v3/internal/runtime/core"

	"github.com/wailsapp/wails/v3/pkg/application"
)

var Service = application.NewCombinedService(
	application.NewService(&Application{}),
	application.NewService(&Browser{}),
	application.NewService(&Call{}),
	application.NewService(&Clipboard{}),
	application.NewService(&Dialogs{}),
	application.NewService(&Events{}),
	application.NewService(&Flags{}),
	application.NewService(&Screens{}),
	application.NewService(&System{}),
	application.NewService(&Types{}),
	application.NewService(&Window{}),
)
