# Package loading features

**Index:**
- [Feature list](#feature-list)
- [Discussion](#discussion)

## Feature list

- Essential:
    - accurate package path resolution, taking into account workspace, modules and vendoring;
- Optional:
    - accept package patterns (e.g. `./...`);
    - accept _multiple_ package patterns;
    - accept build flags (e.g. `-tags ...`);
    - minimise type-checking activity;
    - warn when package loading may take a long time.

## Discussion

The essential feature set is provided by package `golang.org/x/tools/go/packages`. See [here](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/internal/parser/load.go) for an example implementation.

> This package is not free of problems. Its configuration API is very coarse and package loading tends to be slow; however, it embeds a lot of knowledge about the inner workings of the Go toolchain and it is extremely important for maintainability to avoid custom implementations here. Per my understanding, @abichinger modified his PR to call `go list` directly for performance reasons. Unfortunately, this puts a massive burden on maintainers: the CLI of the Go tool is not stable and looking at the source code for `golang.org/x/tools/go/packages` reveals a lot of version-dependent special cases.

Because type-checking requires up-to-date compiler caches, package loading can take a lot of time when running for the first time or just after wails updates (what's going on behind the scenes is that Go recompiles the Wails application package, which can be extremely slow on platforms that use CGO). After this process completes, package loading becomes very fast.

From a usability perspective, it is important to let the user know that they have to wait. On my experimental branch I use a pterm spinner to report status, and if package loading does not finish within 5 seconds I display [an additional warning](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/internal/parser/generate.go#L104).

Using `golang.org/x/tools/go/packages` enables the generator to accept Go package patterns, e.g. `./...` or `github.com/wailsapp/wails/v3/...`. In my implementation, I use this to let developers generate unified bindings for many packages at once.

It is also possible to pass build flags to the package loader. In my implementation, a developer could run for example
```
wails3 generate bindings -f '-tags abcd'
```
to select Go files that match the given tag.

> If I got it right (but please @abichinger confirm this), @abichinger's implementation passes all Go files in a package to the type-checker, without caring taking build settings into account. Although this makes a lot of sense from a binding generation POV, it can cause type-checking errors. I believe it's better to take build settings into account and let the end-users handle this. Giving them control over build flags should be enough.

The feature “minimise type-checking activity” refers to the ability to load some packages in syntax only mode, as full type-checking is costly.

In my implementation, I load packages specified on the command-line with full type-checking. Their dependencies are loaded from the compiler cache, which is faster.

If I discover bound types that live in another package, I load that package in syntax-only mode and extract comments from there.

> It is important to avoid type-checking packages in more than one session, as type-checker objects are canonical only w.r.t. a single type-checking session. The risk is to have multiple objects around mapping to the same bound type or model type, and then generate duplicated code.
