# Static analyser features

**Index:**
- [Feature list](#feature-list)
- [Discussion](#discussion)
    - [Rejection candidates](#rejection-candidates)

## Feature list

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

## Discussion

Static analysis refers to the process of discovering bound types. There are many ways to approach this.

The minimal one is a more robust version of the current one:
- look for calls to `application.New` in packages listed on the command line;
- require its argument to be a struct literal;
- require the `Bind` field value in this literal to be a slice literal;
- use type-checking information to resolve the type of each element of the slice;
- mark pointers to named, _concrete_ types as bound types;
- emit a warning about all other types.

This is just a few lines of code with the type-checker. It is very restrictive for developers, but solid and well-defined.

Alternatively, one might go for a completely different technique. An example of this is provided in [a second experimental branch](https://github.com/fbbdev/wails/tree/feat/bindgen_v2_light) in my fork.

This technique requires all bound types to be wrapped by a dedicated opaque struct:
```go
// Service wraps a bound type instance.
// The zero value of Service is invalid.
// Valid values may only be obtained by calling [NewService].
type Service struct {
	instance any
}

// NewService returns a Service value wrapping the given pointer.
// If T is not a named type, the returned value is invalid.
func NewService[T any](instance *T) Service {
	return Service{instance}
}

func (s Service) Instance() any {
	return s.instance
}

```
The application might be initialised like this:
```go
app := application.New(application.Options{
    Bind: []application.Service{
        application.NewService(&GreetService{}),
    },
})
```
Or like this:
```go
options := application.Options{}
options.Bind = []application.Service{
    application.NewService(&GreetService{}),
}
app := application.New(options)
```
Because the only way to construct `Service` values is to call `NewService`, the type checker now guarantees that _whenever a bound type reaches `application.New`, `NewService` must have been instantiated with that type._

The static analyser then needs just to iterate over all instantiations of `NewService` and extract their type parameter:

- if the type is named and concrete, mark it for generation;
- otherwise emit a warning.

This is requires just [~80 lines of code](https://github.com/fbbdev/wails/blob/feat/bindgen_v2_light/v3/internal/parser/analyse.go), delivering complete accuracy over the given set of packages and maximum flexibility for the developer.

Personally, I favour the latter approach.

### Rejection candidates

There is a lot of middle ground in between the two approaches described above. That ground is a maintainance minefield.

**First,** people may (and in fact _do_) ask to automatically detect calls to `application.New` (or `application.NewService`) outside the main package. Because of limitations in `golang.org/x/tools/go/packages`, this requires full type-checking for _all dependencies,_ which can be really slow, or alternatively custom identifier resolution, which is fragile.

However, 99.9% of the time those calls live in subpackages of the main package. The correct solution is therefore to support Go package patterns, so that people may generate bindings for `'[whatever main is]/...'` and catch the calls they actually want. For even greater flexibility, we can support passing _multiple_ patterns on the command line (one or many makes no difference anyways; already supported in my implementation).

In my implementation, the [default package if no command-line argument is given](https://github.com/fbbdev/wails/blob/feat/bindgen_v2_light/v3/internal/commands/bindings.go#L25) is `'.'` (the current folder). This is the standard for all Go tools, but we might want to consider setting it to `'./...'` for convenience. I think some feedback from the community would be good here.

**Second,** under the former approach people may start asking for more flexbility. For example, they might want to be able to assign a variable to the `Bind` field, or pass a variable to `application.New`, or they might want to assign an interface-typed variable as a binding and have the analyser discover its static type...

The problem is: where does this stop?

There is literally an infinite amount of ways to assign values to that field, of ever growing complexity.

So, either cases are added one by one, until the analyser becomes un unmaintainable mess, or we go for a fully general solution that can handle cases of any complexity.

[I have done that](https://github.com/fbbdev/wails/tree/feat/bindgen_v2/v3/internal/parser/analyse). The result clocks in at ~2000 LOCs. It is capable of seeing through the spaghetti code [here](https://github.com/fbbdev/wails/tree/feat/bindgen_v2/v3/internal/parser/testcases/complex_expressions) and detect all 12 bound types. It is an unmaintainable beast (although mayyybe not a mess? :wink:). I strongly recommend not to adopt it.

Conceptually, it is very simple. It looks for assignments to the `Bind` field, wherever they may happen. It parses the assigned expression until it finds a variable; then queues that variable for analysis together with some information about how to obtain a binding from that variable. Then looks for assignments to that variable. And so on.

But if you take a good look at the code, you realise that it is in practice a stripped down go compiler, together with a very limited virtual machine that executes go programs very loosely, forgetting all operations except those that produce bindings.

It is packed full of branches handling special cases, because the Go language specification has a load of those. The Go language specification is going to change for sure, probably even in short time, and then the analyser will be broken again.

I can't even be sure it is fully correct, because it is too much code to assess. For sure, it is not complete:

- it cannot detect bindings assigned from function parameters. Why? Because in order to do that, it should find call sites for functions, and this is a completely different league. Doing that reliably requires compiling all source code to SSA form, and a big step up in complexity;
- it can find bindings stored in map elements, but not in map keys. Why? Because I didn't think of that. Is it easy to add? Yes. Should we add it? No, we should drop this thing altogether.

> [My first tentative analyser](https://github.com/fbbdev/wails/blob/1b3cb96dfb4e395b9170029e55b7922cb630a62d/v3/internal/parser/analyse.go), that @abichinger incorporated in his PR, was a bit more powerful than the essential feature set. It had ad-hoc support for an arbitrary selection of simpler cases. As I explained above, I believe this is bad for maintainers and must be avoided.
