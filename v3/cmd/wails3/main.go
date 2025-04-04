package main

import (
	"os"
	"runtime/debug"

	"github.com/pkg/browser"

	"github.com/pterm/pterm"
	"github.com/samber/lo"

	"github.com/leaanthony/clir"
	"github.com/wailsapp/wails/v3/internal/commands"
	"github.com/wailsapp/wails/v3/internal/flags"
	"github.com/wailsapp/wails/v3/internal/term"
)

func init() {
	buildInfo, ok := debug.ReadBuildInfo()
	if !ok {
		return
	}
	commands.BuildSettings = lo.Associate(buildInfo.Settings, func(setting debug.BuildSetting) (string, string) {
		return setting.Key, setting.Value
	})
	// Iterate over the Deps and add them to the build settings using a prefix of "mod."
	for _, dep := range buildInfo.Deps {
		commands.BuildSettings["mod."+dep.Path] = dep.Version
	}
}

func main() {
	app := clir.NewCli("wails", "The Wails3 CLI", "v3")
	app.NewSubCommand("docs", "Open the docs").Action(openDocs)
	app.NewSubCommandFunction("init", "Initialise a new project", commands.Init)
	app.NewSubCommandFunction("build", "Build the project", commands.Build)
	app.NewSubCommandFunction("dev", "Run in Dev mode", commands.Dev)
	app.NewSubCommandFunction("package", "Package application", commands.Package)
	app.NewSubCommandFunction("doctor", "System status report", commands.Doctor)
	app.NewSubCommandFunction("releasenotes", "Show release notes", commands.ReleaseNotes)

	task := app.NewSubCommand("task", "Run and list tasks")
	var taskFlags commands.RunTaskOptions
	task.AddFlags(&taskFlags)
	task.Action(func() error {
		return commands.RunTask(&taskFlags, task.OtherArgs())
	})
	task.LongDescription("\nUsage: wails3 task [taskname] [flags]\n\nTasks are defined in the `Taskfile.yaml` file. See https://taskfile.dev for more information.")

	generate := app.NewSubCommand("generate", "Generation tools")
	generate.NewSubCommandFunction("build-assets", "Generate build assets", commands.GenerateBuildAssets)
	generate.NewSubCommandFunction("icons", "Generate icons", commands.GenerateIcons)
	generate.NewSubCommandFunction("syso", "Generate Windows .syso file", commands.GenerateSyso)
	generate.NewSubCommandFunction("runtime", "Generate the pre-built version of the runtime", commands.GenerateRuntime)
	generate.NewSubCommandFunction("webview2bootstrapper", "Generate WebView2 bootstrapper", commands.GenerateWebView2Bootstrapper)
	generate.NewSubCommandFunction("template", "Generate a new template", commands.GenerateTemplate)

	update := app.NewSubCommand("update", "Update tools")
	update.NewSubCommandFunction("build-assets", "Updates the build assets using the given config file", commands.UpdateBuildAssets)
	update.NewSubCommandFunction("cli", "Updates the Wails CLI", commands.UpdateCLI)

	bindgen := generate.NewSubCommand("bindings", "Generate bindings + models")
	var bindgenFlags flags.GenerateBindingsOptions
	bindgen.AddFlags(&bindgenFlags)
	bindgen.Action(func() error {
		return commands.GenerateBindings(&bindgenFlags, bindgen.OtherArgs())
	})
	bindgen.LongDescription("\nUsage: wails3 generate bindings [flags] [patterns...]\n\nPatterns match packages to scan for bound types.\nPattern format is analogous to that of the Go build tool,\ne.g. './...' matches packages in the current directory and all descendants.\nIf no pattern is given, the tool will fall back to the current directory.")
	generate.NewSubCommandFunction("constants", "Generate JS constants from Go", commands.GenerateConstants)
	generate.NewSubCommandFunction(".desktop", "Generate .desktop file", commands.GenerateDotDesktop)
	generate.NewSubCommandFunction("appimage", "Generate Linux AppImage", commands.GenerateAppImage)

	plugin := app.NewSubCommand("service", "Service tools")
	plugin.NewSubCommandFunction("init", "Initialise a new service", commands.ServiceInit)

	tool := app.NewSubCommand("tool", "Various tools")
	tool.NewSubCommandFunction("checkport", "Checks if a port is open. Useful for testing if vite is running.", commands.ToolCheckPort)
	tool.NewSubCommandFunction("watcher", "Watches files and runs a command when they change", commands.Watcher)
	tool.NewSubCommandFunction("cp", "Copy files", commands.Cp)
	tool.NewSubCommandFunction("buildinfo", "Show Build Info", commands.BuildInfo)
	tool.NewSubCommandFunction("package", "Generate Linux packages (deb, rpm, archlinux)", commands.ToolPackage)

	app.NewSubCommandFunction("version", "Print the version", commands.Version)
	app.NewSubCommand("sponsor", "Sponsor the project").Action(openSponsor)

	defer printFooter()

	err := app.Run()
	if err != nil {
		pterm.Error.Println(err)
		os.Exit(1)
	}
}

func printFooter() {
	if !commands.DisableFooter {
		docsLink := term.Hyperlink("https://v3.wails.io/getting-started/your-first-app/", "wails3 docs")

		pterm.Println(pterm.LightGreen("\nNeed documentation? Run: ") + pterm.LightBlue(docsLink))
		// Check if we're in a teminal
		printer := pterm.PrefixPrinter{
			MessageStyle: pterm.NewStyle(pterm.FgLightGreen),
			Prefix: pterm.Prefix{
				Style: pterm.NewStyle(pterm.FgRed, pterm.BgLightWhite),
				Text:  "♥ ",
			},
		}

		linkText := term.Hyperlink("https://github.com/sponsors/leaanthony", "wails3 sponsor")
		printer.Println("If Wails is useful to you or your company, please consider sponsoring the project: " + pterm.LightBlue(linkText))
	}
}

func openDocs() error {
	commands.DisableFooter = true
	return browser.OpenURL("https://v3.wails.io/getting-started/your-first-app/")
}

func openSponsor() error {
	commands.DisableFooter = true
	return browser.OpenURL("https://github.com/sponsors/leaanthony")
}
