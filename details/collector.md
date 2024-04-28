# Data collection features

**Index:**
- [Feature list](#feature-list)
- [Discussion](#discussion)
    - [Type aliases](#type-aliases)

## Feature list

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

## Discussion

Full method sets include not only methods defined on a named type, but for structs also the method sets of each embedded field, subject to visibility rules. The full method set for a type can be computed by using `typeutil.IntuitiveMethodSet` from package `golang.org/x/tools/go/types/typeutil`. No need to roll a custom algorithm.

Types must be supported in their full complexity. The approach I took is in fact not to collect type information at all: I just scan them to find model imports and warn about unsupported types, then pass the `types.Type` interface directly to the code generator.

Struct flattening means computing the full set of fields of a struct type including those from embedded structs, subject to visibility rules and taking into account JSON field tags.

This is a complex process that we must do ourselves. I had a tentative implementation in my original PR #3347 that was subtly wrong. I don't know whether @abichinger reused this or devised their own. [In my experimental implementation](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/internal/parser/collect/struct.go#L97) I am matching almost line by line [the algorithm from `encoding/json`](https://github.com/golang/go/blob/master/src/encoding/json/encode.go#L1048).

`encoding/json` has quite complex behaviour around `json.Marshaler`s and `encoding.TextMarshaler`s that we need to match. The behaviour is as follows:

- if a type implements `json.Marshaler` either as pointer or as value, marshaling is delegated to that interface: in this case we have no control over the result and we must encode the type in JS/TS as `any`;
- if a type implements `encoding.TextMarshaler` either as pointer or as value, _and does not implement `json.Marshaler`_ in any way, it is marshaled to a string and we must encode the type in JS/TS as `string`;
- if a type is used as a map key and implements `encoding.TextMarshaler` in its exact form, it is marshaled to a string regardless of whether it implements `json.Marshaler`. Map keys are always strings and must be rendered as such.

I have [a reference example](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/internal/parser/collect/_reference/json_marshaler_behaviour.go) that explores `encoding/json`'s behaviour in full. In my implementation, I created [a set of predicate functions](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/internal/parser/collect/properties.go) to deal with all this correctly.

### Type aliases

In my implementation I have full support for Go type aliases, but I discovered that the Go type checker always resolves them. E.g. in the following situation:
```go
type Alias = int

func (srv *Service) Method(param Alias) {}
```
I have support for rendering this:
```ts
// models.ts
type Alias = number;

// Service.ts
export function Method(param: Alias) { /* ... */ }
```
but the output is always like this:
```ts
// models.ts

// Service.ts
export function Method(param: number) { /* ... */ }
```
because the Go type checker forgets the alias in the method signature and replaces it with the `int` type.

In order to pick those up correctly, we need to forgo type-checker signatures and look at method definitions directly in the syntax. This is problematic because when the type comes from another package (e.g. `other.Alias`) we'd have to resolve the name `other` by ourselves. Why is that? The reason is that the name `other` lives in file scope, but the type-checker only gives us package scope, unless we fully typecheck all dependencies, which is too costly.

Therefore: either we give up aliases, or provide a custom implementation for package name resolution. The latter option is a bit too complex for my taste; I also think it would be fragile and subject to breakages as the spec changes, and we should refrain from it.

### Field/const comments

In fact, I do have [an implementation of package name resolution](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/internal/parser/collect/typedef.go#L262) in my experimental code. I use it to retrieve field comments for structs. The problem is that when you have this kind of syntax:
```go
// package foo
type FooStruct struct {
    // AField is an example
    AField int
}

// package bar
type BarStruct foo.FooStruct
```
the Go type-checker will tell you that `BarStruct` is a struct with field `AField`, but will not remember that the field came from `foo.FooStruct`. And we're back at square 1.

I believe the best option is actually not to provide field comments _at all_. It's not a great loss. By the way, they are treated as second-class citizens by the Go doc tool, hence they stop us from relying upon the `go/doc` package to retrieve documentation. I understand that @abichinger had problems with them too.

Enum consts are treated as second-class citizens by the `go/doc` package as well (they are documented in blocks instead of one by one, and sometimes the tool ignores them for unknown reasons). Those, together with fields, are the reason why I have a custom implementation of comment collection instead of using `go/doc`. Should we give up on that too?
