//go:build production

package core

import _ "embed"

//go:embed runtime.js
var RuntimeJS []byte
