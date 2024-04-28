# Output code layout

**Index:**
- [Feature list](#feature-list)
- [Discussion](#discussion)
    - [Internal models](#internal-models)
    - [Rejection candidates](#rejection-candidates)

## Feature list

- Essential:
    - clean, understandable scheme.
- Optional:
    - minimise collisions with a naming scheme based on package paths;
    - report easily detectable file name collisions (i.e. bound type named `models` vs models file).
    - per-package JS/TS index files;
    - global JS/TS index files;
    - dedicated file for unexported model types;
- Rejection candidates:
    - completely prevent file name collisions (requires complex and unfriendly naming schemes);
    - report _all_ file name collisions (increases complexity).

## Discussion

I think we all agree about the essential feature. Whatever layout and file naming scheme we choose, people will have to type those paths and names in their import declarations, hence it needs to be easy on the eyes.

That said, the current scheme has many potential problems with naming collisions between packages, and although it's not gonna be a very frequent occurrence, I believe it is better to improve this.

Go guarantees uniqueness of package paths, hence the obvious solution is to include package paths into the scheme. The question is how.

@abichinger (please correct me if I'm wrong) proposes a scheme based on the following two rules:
- main package and its subpackages stay as they are now;
- all other packages go into folders whose name is obtained from the package path by replacing slashes with hyphens, e.g. `github.com/wailsapp/wails` becomes `github.com-wailsapp-wails`.

In my implementation I took a more radical approach. An example of output code layout is available [here](https://github.com/fbbdev/wails/tree/feat/bindgen_v2/v3/examples/binding/assets/bindings).

The rules are:

- package paths are used in full to create a folder hierarchy, e.g. files for `github.com/wailsapp/wails` have path `[output dir]/github.com/wailsapp/wails/[filename]`;
- each package gets an index file that facilitates importing it fully: `import * as wails from "./bindings/github.com/wailsapp/wails/index.js"` (when using bundlers the index.js part can probably be omitted);
- to keep things easy, I create “shortcut” files at top-level for each package name that import all packages of the same name;

for example, if someone used to import a service like this:
```js
import * as GreetService from "./bindings/main/GreetService.js"
```
it now becomes either
```js
import * as GreetService from "./bindings/[full path of main package]/GreetService.js"
```
or
```js
import {GreetService} from "./bindings/[full path of main package]/index.js"
```
or
```js
import {GreetService} from "./bindings/main.js"
```
or even
```js
import {main} from "./bindings/index.js"
// use main.GreetService
```

What if there are two packages named e.g. `data`? The shortcut file named `data.js` will look like this:
```js
export * from "./[package path #1]/index.js";
export * from "./[package path #2]/index.js";
```
Since the probability of collisions between types of different packages is much lower, most of the time this will effectively merge the two packages in a safe way.

If there are collisions, some types in package no.1 will be shadowed by those in package no.2, but now people can work around this by using full import paths in JS.

Anyways, the experimental generator emits a warning when performing this kind of merge.

All of this works in TS as well, with different extensions.

### Internal models

In my implementation, I generate two model files:

- the traditional `models.js` for exported types;
- an additional `internal.js` for unexported types.

The difference being that package index files (`index.js/ts`) expose only exported models. Users can still access unexported types by importing `internal.js` explicitly.

### Rejection candidates

I propose we avoid looking for a way to completely prevent collisions. This would most probably require a complex naming scheme and hurt user experience just to solve a rare issue.

My approach leaves the door open to the following kinds of collisions:

- service named `models` collides with `models.js` file: I warn about this and suggest the user changes either the name of the service, or that of the models file;
- service named `internal` collides with `internal.js` file: same as the previous case;
- service named `index` collides with `index.js` file: same as the previous cases;
- service named e.g. `service` collides with subpackage folder named `service.js`;
- `models.js` file collides with subpackage folder named `models.js`;
- same but for `internals.js`, `index.js`.

I suppose the last three possibilities are exceedingly rare: who adds an extension to their package folder? Anyways, catching them and warning about these would be quite costly. I suggest we do not attempt that, and instead let the filesystem throw an error when it detects a folder-file collision.
