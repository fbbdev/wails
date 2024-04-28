# Feature set proposal

**Index:**
- [Introduction](#introduction)
- [The List](#the-list™)
    - [General](#general-details)
    - [Runtime](#runtime-details)
    - [Package loading](#package-loading-details)
    - [Static analysis](#static-analysis-details)
    - [Data collection](#data-collection-details)
    - [Code generation](#code-generation-details)
    - [Output code layout](#output-code-layout-details)
    - [Test suite](#test-suite-details)

## Introduction

In the following paragraphs I shall propose a reasoned list of features for the binding generator. Each block has a link leading to a subpage with more details.

_Essential_ features are what I personally consider the bare minimum the generator needs to support.

_Optional_ features do not make or break the user experience. Some of them are nice to have; some others have non-trivial cost and we may want to discuss about that.

_Rejection candidates_ are features I believe to be either bad for maintainability, too complex or too costly.

Of course all of this is meant as a proposal to discuss.

My experimental branch implements the full feature set described below (essential + optional) and even some of the rejection candidates.

## The List™

### General [[details](details/general.md)]

- Essential:
    - sane fallbacks for each unsupported construct;
    - emit a message for each unsupported construct;
    - emit a message for each unrecoverable error.
- Optional:
    - concurrency;
    - verbose logging mode with debug messages;
    - dry run mode (no output files, just logging);
    - warning/error deduplication;
    - spinner with status messages.

### Runtime [[details](details/runtime.md)]

- Essential:
    - use package path in method names (to avoid collisions).
- Optional:
    - allow non-struct _named_ types.
- Rejection candidates:
    - allow non-pointers;
    - allow generic bound types.

### Package loading [[details](details/loader.md)]

- Essential:
    - accurate package path resolution, taking into account workspace, modules and vendoring;
- Optional:
    - accept package patterns (e.g. `./...`);
    - accept _multiple_ package patterns;
    - accept build flags (e.g. `-tags ...`);
    - minimise type-checking activity;
    - warn when package loading may take a long time.

### Static analysis [[details](details/analyser.md)]

- Essential: (~current feature set)
    - detect static calls to `application.New`,
    - within a given finite set of packages,
    - whose argument is a struct literal,
    - whose field `Bind` is initialized by a slice literal,
    - whose elements have _concrete types_;
    - warn about unsupported expressions;
    - warn about unsupported types.
- Optional:
    - complete detection of bound types within a given finite set of packages (requires changes to the runtime).
- Rejection candidates:
    - detection within an unspecified set of packages (e.g. the whole dependency graph);
    - handling more cases than essential, but not all.

### Data collection [[details](details/collector.md)]

- Essential:
    - accurate identifier resolution (delegate to type-checker);
    - compute full and accurate method sets;
    - collect full type information;
    - flatten structs with embedded type following `encoding/json` behaviour strictly;
    - detect `encoding/json.Marshaler` implementations;
    - detect `encoding.TextMarshaler` implementations;
    - collect enum constants for basic named types;
    - collect comments for methods;
    - collect comments for model types;
    - collect comments for packages;
    - warn about unsupported types at any depth.
- Optional:
    - collect type aliases (needs discussion);
    - collect comments for struct fields;
    - collect comments for enum consts.

### Code generation [[details](details/generator.md)]

- Essential:
    - fully prevent collisions between user-provided and generated identifiers;
    - generate full and correct representations for all types supported by `encoding/json`;
    - fall back to `any` for all unsupported types (including all interface types and all JSON `Marshaler`s);
    - translate non-struct types to typescript aliases (@typedef in JS);
    - translate `TextMarshaler`s to string types when appropriate;
    - initialise model classes to zero values;
    - adhere strictly to JSDoc syntax for comments (requires escaping comment text).
- Optional:
    - support for generics using typescript templates;
    - translation code for return values (like createFrom for model classes, but for all types);
    - output nicely formatted code.
- Rejection candidates:
    - class inheritance for embedded types (this produces a mismatch with Go's flat view of types);
    - convert Go doc comment formatting to JSDoc formatting (the risk of getting it wrong is high; comments are just a convenience feature anyways).

### Output code layout [[details](details/layout.md)]

- Essential:
    - clean, understandable scheme.
- Optional:
    - per-package JS/TS index files;
    - global JS/TS index files;
    - dedicated file for unexported model types;
    - minimise collisions with a naming scheme based on package paths;
    - report easily detectable file name collisions (i.e. bound type named `models` vs models file).
- Rejection candidates:
    - completely prevent file name collisions (requires complex and unfriendly naming schemes);
    - report _all_ file name collisions (increases complexity).

### Test suite [[details](details/tests.md)]

- Optional:
    - split Go code and generator output:
        - Go code goes in a folder named e.g. `testcases`;
        - output stays in `testdata`;
    - split output into separate folders for each configuration instead of mixing files with different names;
    - pick up test cases and want/got files automatically (using `os.ReadDir`) so that test code does not need further updates;
    - future: test error/warning messages?
