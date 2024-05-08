//wails:inject export {
//wails:inject     Application,
//wails:inject     Browser,
//wails:inject     Call,
//wails:inject     Clipboard,
//wails:inject     Dialogs,
//wails:inject     Events,
//wails:inject     Flags,
//wails:inject     Screens,
//wails:inject     System,
//wails:inject     Types,
//wails:inject     Window,
//wails:inject     WML
//wails:inject } from "../../internal/runtime/api/index.js";
package runtime

import (
	"github.com/wailsapp/wails/v3/internal/runtime/api"
)

// Service provides all runtime API services.
var Service = api.Service
