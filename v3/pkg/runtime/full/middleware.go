package runtimebundle

import (
	"net/http"
	"strings"

	"github.com/wailsapp/wails/v3/internal/runtime/bundle/full"
)

func Full(next http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if strings.HasPrefix(req.URL.Path, "/wails/") {
			// Strip the /wails prefix
			req.URL.Path = req.URL.Path[6:]
			if req.URL.Path == "/runtime.js" {
				rw.Header().Set("Content-Type", "application/javascript")
				rw.Write(full.RuntimeJS)
				return
			}
			return
		}
		next.ServeHTTP(rw, req)
	})
}
