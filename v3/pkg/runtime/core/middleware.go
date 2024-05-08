package runtimebundle

import (
	"net/http"
	"strings"

	"github.com/wailsapp/wails/v3/internal/runtime/bundle/core"
)

func Core(next http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if strings.HasPrefix(req.URL.Path, "/wails/") {
			if req.URL.Path[6:] == "/runtime.js" {
				rw.Header().Set("Content-Type", "application/javascript")
				rw.Write(core.RuntimeJS)
				return
			}
		}
		next.ServeHTTP(rw, req)
	})
}
