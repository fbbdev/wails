package operatingsystem

// OS contains information about the operating system
type OS struct {
	ID       string // The ID of the OS.
	Name     string // The name of the OS.
	Version  string // The version of the OS.
	Branding string // The branding of the OS.
}

func (o *OS) AsLogSlice() []any {
	return []any{
		"ID", o.ID,
		"Name", o.Name,
		"Version", o.Version,
		"Branding", o.Branding,
	}
}

// Info retrieves information about the current platform
func Info() (*OS, error) {
	return platformInfo()
}
