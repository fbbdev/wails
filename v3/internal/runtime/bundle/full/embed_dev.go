//go:build !production

package full

import _ "embed"

//go:embed runtime.debug.js
var RuntimeJS []byte
