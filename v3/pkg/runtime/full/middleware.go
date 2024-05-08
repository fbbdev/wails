package runtimebundle

import (
	"net/http"
	"strings"

	"github.com/wailsapp/wails/v3/internal/runtime/bundle/full"
)

func Full(next http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		if strings.HasPrefix(req.URL.Path, "/wails/") {
			if req.URL.Path[6:] == "/runtime.js" {
				rw.Header().Set("Content-Type", "application/javascript")
				rw.Write(full.RuntimeJS)
				return
			}
		}
		next.ServeHTTP(rw, req)
	})
}
