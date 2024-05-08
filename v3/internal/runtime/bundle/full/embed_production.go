//go:build production

package full

import _ "embed"

//go:embed runtime.js
var RuntimeJS []byte
