//go:build bundling

//wails:inject export * from "../../../../pkg/runtime/core/index.js";
package core

import (
	// Pull in core code.
	_ "github.com/wailsapp/wails/v3/pkg/runtime/core"
)
