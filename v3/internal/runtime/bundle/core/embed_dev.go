//go:build !production

package core

import _ "embed"

//go:embed runtime.debug.js
var RuntimeJS []byte
