/*
 _	   __	  _ __
| |	 / /___ _(_) /____
| | /| / / __ `/ / / ___/
| |/ |/ / /_/ / / (__  )
|__/|__/\__,_/_/_/____/
The electron alternative for Go
(c) Lea Anthony 2019-present
*/

// Setup
window._wails = window._wails || {};

import "./contextmenu.js";
import "./drag.js";

// Re-export (internal) public API
export * as Call from "./calls.js";
export * as Flags from "./flags.js";
export * as System from "./system.js";
export * as Types from "./types.js";

import {invoke} from "./runtime.js";

// Notify backend
window._wails.invoke = invoke;
invoke("wails:runtime:ready");
