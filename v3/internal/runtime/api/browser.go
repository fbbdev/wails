package api

import "github.com/wailsapp/wails/v3/pkg/application"

type Browser struct{}

// OpenURL opens a browser window to the given URL.
func (Browser) OpenURL(url string) error {
	return application.Get().BrowserOpenURL(url)
}
