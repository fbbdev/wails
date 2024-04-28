# Analysis of existing code

**Index:**
- [Areas of concern](#areas-of-concern)
- [Layout of the current system](#layout-of-the-current-system)
- [Limitations of the current system](#limitations-of-the-current-system)
    - [Package loading and parsing](#package-loading-and-parsing)
    - [Static analysis](#static-analysis)
    - [Data collection](#data-collection)
    - [Code generation](#code-generation)

## Areas of concern

Binding generation comprises four principal areas of concern:

1. **Package loading** including root package(s), in-tree and out-of-tree dependencies.
2. **Static analysis** for bound type discovery.
3. **Data collection** regarding methods and models, their structure and interdependencies.
4. **Code generation** for the various output modes (Names/IDs, JS/TS/TS interfaces, ...).

Each area requires some specific knowledge:

1. **Package loading** (including parsing) requires knowledge about the Go toolchain and distribution, mapping import paths to the filesystem, code layout, and Go syntax.
2. **Static analysis** requires knowledge about name resolution, expression typing and program behaviour.
3. **Data collection** requires knowledge about name resolution, the structure of Go types, their relationships and how they map to their defining syntax (for doc comment retrieval), as well as about the behaviour of the std package `encoding/json` (for structure flattening and field naming).
4. **Code generation** requires knowledge about JS and TS syntax, code layout, browser support for various features, interaction with the wails runtime, and again the behaviour of `encoding/json` (for type rendering). It also needs to know how to detect and prevent naming collisions
    - within user-provided identifiers,
    - within generated identifiers,
    - between user-provided and generated identifiers.

> Of course there might be more to it but I should have touched upon the most important subjects.

## Layout of the current system

The current parser conflates the first three areas under the concept of 'parsing'. Everything is grouped in one giant file (`parser.go`).

Code generation is split between models, which use templates from the package `text/templates`, and bindings whose output is assembled directly by Go code. Bindings suffer from a lot of duplicated code that must be kept in sync whenever a change is made.

JS/TS type rendering is interspersed with parsing code and suffers from some code duplication issues as well.

## Limitations of the current system

As regards functionality, the problems whose impact is the greatest are:
- incorrect identifier resolution algorithm;
- incomplete computation of method sets (for bound types);
- non-compliance with `encoding/json` (for model types);
- broken rendering of param/field/return types.

From a UX perspective, there are two major problems:
- unreported failures: besides buggy behaviour, the parser often gives up without any warning message upon encountering constructs it can't handle, and produces incorrect or incomplete results;
- package name collisions: this is a well-known limitation; although this kind of collision is not so common, it is certainly much better in the long run to guarantee correct output (or appropriate error messages) in every situation.

As regards maintainability and extensibility, the greatest liabilities are code layout, excessive coupling and code duplication:
- the code is dense, complex, hard to follow without IDE code navigation;
- hard coupling between various methods makes it hard to fix/extend them:
    - functionality that should be grouped in one place is in some cases split between various places;
    - some methods depend on other methods behaving in a very specific way, without clearly defined interfaces.
- code duplication makes it very easy to introduce additional bugs while fixing other bugs or adding functionality.

The following paragraphs discuss in detail problems with each part of the system, following the subdivision introduced above.

### Package loading and parsing

Parsing is delegated to the std package `go/parser` and the `go/build` package is used to map import paths to the filesystem. Everything else is currently handled with custom code. The primary limitations are:

- It seems some packages are cached by name, potentially leading to conflicts between identically named packages.
- Package name resolution relies upon wrong assumptions and may fail in but the most simple circumstances.
- Package loading code is intermixed with identifier resolution code.
- Packages may be loaded multiple times even when they are already cached.

Here is a list of lower-level bugs:

- Qualified identifier resolution works by scanning imports from _all_ files in the importing package: this may lead to incorrect results when distinct files import distinct packages with the same name.
- Imports from each file are scanned in source order without giving precedence to named ones.
- For unnamed imports, the assumption is made that the name of the package coincides with the base element of the path; this is not guaranteed by the Go specification and may lead to incorrect results.
- Once the package directory is found, all files within are parsed without any filtering. The Go toolchain, on the other hand, applies a non-trivial filtering algorithm.
- When multiple packages are found within a directory, it seems one is picked at random instead of rejecting the whole directory as the Go toolchain does.

### Static analysis

The static analyser that discovers bound types is quite limited, although probably it was never intended to be extremely powerful and is of course good enough for many use cases.

It begins by gathering static calls to `application.New` but is based entirely upon string comparisons. It makes no effort to check whether the name `application` actually resolves to the Wails application package, nor does it check whether the application packages has been imported under a different name.

The unique argument to the call must be a struct literal, and the field `Bind` must be initialised by a slice literal.

It makes some attempts at resolving the type of binding expressions, be they struct literals, function calls, variables, or variables whose assigned value is a function call. This is all quite fragile because:
- it has no notion of scope;
- identifier resolution is partly based on deprecated functionality from the `go/parser` package, partly provided by a custom incorrect implementation, as discussed in the previous subsection;
- it cannot handle alias types;
- it cannot handle struct fields or method calls;
- it does not report failures;
- it may panic unexpectedly in some cases, for example if it finds a selector expression whose receiver is not an identifier.

The static analysis algorithm contains some additional and unrelated type/constant parsing code.

### Data collection

The data collection system that gathers information about methods and types is entirely based on syntactic analysis. It shares some of the shortcomings listed above for the static analyser.

It cannot handle type aliases nor any other non-struct defined types, like the following ones:

```go
type Alias = OtherType
type NamedNumber int
```

It relies on deprecated object resolution from the `go/parser` package. Like the static analyser, it may panic unexpectedly in some corner cases and often gives up without any warning.

**As regards structs,** it does not support embedded fields and in general does not match the behaviour of `encoding/json`: as a result, generated code does not match the actual shape of parameters and return values.

**As regards methods,** it only recognises those whose receiver type is syntactically identical to the bound type, missing all methods derived from embedded fields, as well as those whose receiver is a type alias. It discards variadic parameters.

**As regards param/field/result types,** it gathers a limited amount of information and forgoes completely types with complex structure. For example, it treats a slice of pointers as identical to a pointer to slice; multi-dimensional slices are treated as one-dimensional.

It relies upon string equality to identify basic types, which is problematic because many of them are _not_ keywords and may be overridden, leading to incorrect results.

### Code generation

An important problem with the code generator is code duplication. In many cases there is no single source of truth defining how a certain feature should be rendered, and this makes maintenance and extension very difficult.

Output code layout is very simple, which is a plus, but cannot handle multiple packages with the same name.

The generator for bindings has some subtle errors:
- sometimes it fails at computing the correct relative path for imports;
- sometimes it fails to determine the correct namespace identifier for model types;
- it outputs incorrect code when there are multiple results;
- it cannot handle variadic methods and blank argument names.

The generator for models works fine but is limited by the insufficient data collection phase (see above). It has method stubs for initializing model classes from JSON data, but not a full implementation (nested classes are not taken into account).

Both generators do not escape doc comments: if a doc comment contains the comment terminator `*/`, the output will be invalid JS/TS. If a doc comment contains newlines, the resulting comments may not follow JSDoc syntax.

Both generators have problems with name collisions. The main sources of collisions are:
- imported call runtime vs user-defined identifiers
- package import names vs user-defined identifiers
- anonymous struct names (of the form `anonX`) vs user-defined struct names
- keyword identifier translation vs user-defined identifiers (e.g. when the identifier `try` is translated to `_try` it may collide with another user-provided identifier).

The biggest limitation, that affects both bindings and models, is param/result/field type rendering, which is completely broken. This is due:
- partly to the problems with type info collection discussed above;
- partly to completely missing code in some places.
Only the most simple types work without any errors.

Moreover, there is again unnecessary duplication. Type rendering code for methods and models has different bugs. For example, slice rendering is working partially for methods, but not at all for models.
