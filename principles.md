# Design principles proposal

**Index:**
- [Introduction](#introduction)
- [Minimising exposure to the Go language specification and toolchain](#minimising-exposure-to-the-go-language-specification-and-toolchain)
- [Modular code layout](#modular-code-layout)
    - [Results of my experiment](#results-of-my-experiment)

## Introduction

In writing this, my primary concerns are to improve UX and maximise long-term maintainability.

As a takeaway from the analysis outlined in the first document, I propose to adopt the following principles:

- no silent failures;
- reasoned choice of feature set, especially as regards rejected features, to reduce the risk of feature creep;
- minimal exposure to the Go language specification and details about toolchain behaviour;
- modular code layout with minimal coupling between logically independent parts.

The following two paragraphs expand a bit upon the latest two points.

## Minimising exposure to the Go language specification and toolchain

As I remarked in the previous document, the binding generator needs to embed quite a lot of knowledge about Go syntax, the behaviour of Go programs, the Go type system and the layout of Go packages.

Unfortunately, the Go language specification and the tooling around it are unstable targets and represent a big liability for maintainers.

The Go stability guarantee is geared towards people who develop _in_ Go, i.e. it guarantees that existing programs shall always remain valid and keep their current behaviour. This is very different from developing tools _for_ Go, as the spec is enriched and amended often, new programs become valid and acquire new behaviours.

A further source of difficulties is that the spec has accumulated over time a lot of special cases that must be handled with dedicated code, increasing complexity and hurting maintainability.

Package loading and package path resolution have also changed a lot in the past (think about the introduction of Go modules). Above all, the behaviour of the Go toolchain changes frequently and there is _absolutely no stability guarantee_ about the command line interface of the `go` tool.

It is therefore very important to insulate Wails' code from all of this as much as possible; in particular:

- package loading (including path resolution, code parsing and type checking) should be delegated entirely to the package `golang.org/x/tools/go/packages`;
- identifier resolution and type deduction should be delegated to the std package `go/types`;
- direct handling of syntax should be minimized.

Using `golang.org/x/tools/go/packages` also unlocks access to the go compiler cache, with a significant speedup when loading dependencies of the main packages.

It is true that the API is quite inflexible and there are situations in which it will perform more work than needed, leading to inefficiencies, but I believe maintainability concerns should override all performance considerations in this case.

## Modular code layout

There are many interdependencies between the tasks that the generator has to perform, but reducing coupling between its various parts is essential to improve maintainability.

Some activities are easier to isolate, namely:

- package loading,
- bound type discovery,
- data collection for methods,
- code rendering,

the first two being the lowest hanging fruits. On the other hand, strong interdependencies exist among the following activities:

- package data caching,
- data collection for param/result/field types,
- data collection for models and enums,

which are therefore much harder to isolate.

### Results of my experiment

In my [experimental code](https://github.com/fbbdev/wails/tree/feat/bindgen_v2/v3/internal/parser) I managed to split the generator cleanly along the subdivision outlined at the start of my analysis (in fact, I came up with that subdivision while looking for a good way to split code). There is:

- one exported function dedicated to package loading, living in its own file;
- one subpackage dedicated to static analysis (i.e. bound type discovery);
- one subpackage dedicated to data collection;
- one subpackage dedicated to code generation.

File creation and message logging are pluggable with dedicated interfaces, to facilitate integration with the CLI tool and end-to-end testing. I implemented end-to-end testing for generated files, but not for error messages at the moment.

Apart from the package loader func, all other content of the root parser package is just glue code that coordinates activities.

All distinct parts interact over documented APIs.

The package loader and the static analyser are completely independent of everything else.

In developing the data collector, I adhered strictly to the following two policies:

- the data collector must not depend upon the code generator;
- the data collector must only deal with data that originates in Go code, without performing any further computation.

As a result, the code generator subpackage is the unique source of truth for every choice that affects JS/TS output, including how name collisions are managed.

I did not manage to make the code generator completely independent of the data collector. There might be some space for improvement there, but the dependency is very limited and should not be harmful.

The code generator still suffers greatly from code duplication, which causes _a lot_ of problems when updating it. I managed to centralise type rendering with configuration-independent code, but there are still two important sources of duplication:

- various kinds of types (e.g. slices and arrays, aliases and named types...) have almost identical rendering code, but Go type switches make it hard to share;
- JS and TS modes are different enough to warrant disjoint templates, but they still have a lot of common parts.

The former issue could be solved by finding a way to split code into shared methods.

As regards the latter, there are probably ways to optimise the code layout of Go templates and it would be nice if someone more knowledgeable could have a look at this.
