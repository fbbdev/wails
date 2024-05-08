//wails:inject export * from "../../../../pkg/runtimeapi/index.js";
//wails:inject
//wails:inject import * as runtime from "../../../../pkg/runtimeapi/index.js";
//wails:inject window.wails = runtime;
//wails:inject
//wails:inject runtime.WML.Enable();
package full

import (
	// Pull in full code.
	_ "github.com/wailsapp/wails/v3/pkg/runtimeapi"
)
