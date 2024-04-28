# Code generation features

**Index:**
- [Feature list](#feature-list)
- [Discussion](#discussion)
    - [Translation code for return values](#translation-code-for-return-values)

## Feature list

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

## Discussion

For preventing identifier collisions, my approach is to use the (beautiful) fact that JS identifiers may contain '$' signs, whereas Go identifiers may not. This provides a kind of namespacing feature: if you add e.g. two '$$' signs in front of an identifier, it is never going to collide with one that has just one '$' or none at all.

Field/param types must be supported in their full complexity and right from the outset, taking into account how `encoding/json` translates them. The tricky parts here are maps, whose keys are always strings, and byte slices, which are translated to strings.

In my implementation I removed anonymous models: anonymous structs can be rendered inline as TS object types. For example the following method:
```go
func (s Service) Method(param struct{ A int; B bool })
```
produces the following TS code (and equivalent JSDoc for JS mode):
```ts
export function Method(param: { "A": number, "B": boolean })
```

Initialisation code for model classes refers to setting their fields to their Go zero values. This was already present in my original PR. For enums, @abichinger selects the first constant and uses it as default value. However, I think it is safer to use the actual Go zero value, because that's what the Go side expects. Maybe we could generate an additional private field `$zero` in each enum and assign the zero value to it?

In my implementation I took great care to ensure output code is properly formatted. However, this makes templates very delicate, as every little edit may break formatting unexpectedly. It might be better not to give any guarantee about this.

### Translation code for return values

Let's say a method returns a `Person`. We declare it in TS (and equivalent JS) like this:
```ts
export function GetPerson(): Promise<Person>
```
However, the binding call does not actually return an instance of the `Person` class: it returns a JSON object that matches the expected structure of the `Person` class. In interface mode, this is no problem; but in class mode, it is a typing violation.

In my experimental branch I have a feature that translates returned values to their proper types. It minimises the amount of work done: for example it generates no code at all for types that do not require it.

One important point to take into account here is that `encoding/json` translates `nil` slices to `null` JSON values. This is unfortunate because `nil` slices are perfectly valid empty slices in Go, but `null` is not a valid array in JS/TS. In this case, the result translation feature in my implementation injects a null check and replaces null values with empty arrays.
