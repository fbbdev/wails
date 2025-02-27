/*
 _	   __	  _ __
| |	 / /___ _(_) /____
| | /| / / __ `/ / / ___/
| |/ |/ / /_/ / / (__  )
|__/|__/\__,_/_/_/____/
The electron alternative for Go
(c) Lea Anthony 2019-present
*/

const TYPED_EVENTS_MODULE = "\0wailsio_runtime_events_typed";

/**
 * A plugin that monkey-patches the wails runtime to support typed custom events.
 *
 * @param {string} [bindingsRoot="@bindings"] - The root import path for generated bindings
 */
export default function wailsTypedEventsPlugin(bindingsRoot = "@bindings") {
    let bindingsId = null,
        runtimeId = null,
        eventsId = null;

    return {
        name: "wails-typed-events",
        async buildStart() {
            const bindingsPath = `${bindingsRoot}/github.com/wailsapp/wails/v3/internal/eventcreate.js`;
            let resolution = await this.resolve(bindingsPath);
            if (!resolution || resolution.external) {
                this.warn(`Event bindings module not found at import specifier '${bindingsPath}'. Please verify that the wails tool is up to date and the binding generator runs successfully. If you moved the bindings to a custom location or have a custom vite config, you might need to reconfigure the '@bindings' alias or supply the root path as the first argument to \`wailsTypedEventsPlugin\``);
                return;
            }
            bindingsId = resolution.id;

            resolution = await this.resolve("@wailsio/runtime");
            if (!resolution || resolution.external) { return; }
            runtimeId = resolution.id;

            resolution = await this.resolve("./events.js", runtimeId);
            if (!resolution || resolution.external) {
                this.warn("Could not resolve events module within @wailsio/runtime package. Please verify that the module is correctly installed and up to date.");
                return;
            }

            eventsId = resolution.id;
        },
        resolveId: {
            order: 'pre',
            handler(id, importer) {
                if (
                    runtimeId === null
                    || eventsId === null
                    || importer !== runtimeId
                    || id !== "./events.js"
                ) {
                    return;
                }

                return TYPED_EVENTS_MODULE;
            }
        },
        load(id) {
            if (id === TYPED_EVENTS_MODULE) {
                return (
                    `import ${JSON.stringify(bindingsId)};\n`
                    + `export * from ${JSON.stringify(eventsId)};`
                );
            }
        }
    }
}
