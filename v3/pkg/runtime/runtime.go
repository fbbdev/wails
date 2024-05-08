//wails:include js/*.js
//wails:include j*:wml_js/*.js
//wails:include t*:wml_ts/*.js
//wails:inject export { Call, Flags } from "../../internal/runtime/js/index.js";
//wails:inject export * as WML from "./wml.js";
package runtime

import (
	// Pull in core code.
	_ "github.com/wailsapp/wails/v3/internal/runtime/js"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func Service() application.Service {
	return application.NewCombinedService(
		application.NewService(&Application{}),
		application.NewService(&Browser{}),
		application.NewService(&Clipboard{}),
		application.NewService(&Dialog{}),
		application.NewService(&Events{}),
		application.NewService(&Screens{}),
		application.NewService(&System{}),
		application.NewService(&Window{}),
		application.NewService(&windowByName{}),
	)
}
