# Runtime features

**Index:**
- [Feature list](#feature-list)
- [Discussion](#discussion)
    - [Use of package paths](#use-of-package-paths)
    - [Allowing non-struct named types](#allowing-non-struct-named-types)
    - [Rejection candidates](#rejection-candidates)

## Feature list

- Essential:
    - use package path in method names (to avoid collisions).
- Optional:
    - allow non-struct _named_ types.
- Rejection candidates:
    - allow non-pointers;
    - allow generic bound types.

## Discussion

These features refer to the runtime binding call engine (in the application package).

### Use of package paths

Fully qualified method names (from which IDs are computed) should use package paths instead of package names to reduce the risk of collisions. It is my understanding that this has been proposed by @abichinger too in his PR.

Package paths _must_ be used as they are, without replacing slashes with other symbols, as this approach might still produce collisions.

Because package paths may contain dots, a change in the JS runtime is required for calls by name: FQNs must be split only at the last two dots instead of using `String.prototype.split` directly (see [here](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/internal/runtime/desktop/%40wailsio/runtime/src/calls.js#L139)).

One important detail to keep in mind is that at runtime Go does not store the path of the main package, using just the string `"main"`. This is not a problem as main packages are not importable, hence no collision may arise. However, it requires [special handling on the generator side](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/internal/parser/collect/bindings.go#L153).

### Allowing non-struct _named_ types

I marked this feature as optional but I strongly recommend adopting it.

Go supports customised methods on all _named_ types (defs of the form `type namedType otherType`). For example, a named func type might have arbitrary methods, which have nothing to do with the actual function value.

The binding runtime currently rejects all _non-struct_ types, probably to catch unsupported types like funcs.
Instead, it should reject only _non-named_ types. To catch those, [it suffices to check whether the type name property is empty](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/pkg/application/bindings.go#L413).

### Rejection candidates

The binding runtime currently rejects non-pointer types. I support this approach because pointer types expose more methods than non-pointer types. Although a non-pointer value can easily be converted to a pointer value through reflection, I believe it is better to make developers aware of this rather than perform hidden magic.

Generic bound types can be recognised by the fact that their type string contains a type param list wrapped in brackets (`[...]`). There is no specification for the format of this param list, hence no robust way to match JS methods to their Go counterparts. I propose to [reject generic bound types](https://github.com/fbbdev/wails/blob/feat/bindgen_v2/v3/pkg/application/bindings.go#L235) at least until the `reflect` package supports them in a well-defined way, or even conclusively. Users who need them may easily wrap them as embedded fields in another struct.
