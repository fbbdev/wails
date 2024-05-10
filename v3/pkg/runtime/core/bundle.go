//go:build !bundling

package runtimecore

import (
	"bytes"
	"net/http"
	"time"

	"github.com/wailsapp/wails/v3/internal/runtime/bundle/core"
)

// Bundle serves a bundled version of the Wails JS runtime core
// at URL '/wails/runtime.js'.
func Bundle(next http.Handler) http.Handler {
	startTime := time.Now()
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if req.URL.Path == "/wails/runtime.js" {
			rw.Header().Set("Content-Type", "application/javascript")
			http.ServeContent(rw, req, "", startTime, bytes.NewReader(core.RuntimeJS))
			return
		}

		next.ServeHTTP(rw, req)
	})
}
