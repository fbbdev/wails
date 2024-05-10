//go:build bundling

//wails:inject export * from "../../../../pkg/runtime/index.js";
//wails:inject
//wails:inject import * as runtime from "../../../../pkg/runtime/index.js";
//wails:inject window.wails = runtime;
//wails:inject
//wails:inject runtime.WML.Enable();
package full

import (
	// Pull in full API.
	_ "github.com/wailsapp/wails/v3/pkg/runtime"
)
