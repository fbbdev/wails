var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// bundle/core/.build/github.com/wailsapp/wails/v3/internal/runtime/core/nanoid.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var nanoid = (size = 21) => {
  let id = "";
  let i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};

// bundle/core/.build/github.com/wailsapp/wails/v3/internal/runtime/core/runtime.js
var runtimeURL = window.location.origin + "/wails/runtime";
function invoke(msg) {
  if (window.chrome) {
    return window.chrome.webview.postMessage(msg);
  } else {
    return window.webkit.messageHandlers.external.postMessage(msg);
  }
}
var objectNames = {
  Call: 0,
  ContextMenu: 4,
  CancelCall: 10
};
var clientId = nanoid();
function newRuntimeCallerWithID(object, windowName) {
  return function(method, args = null) {
    return runtimeCallWithID(object, method, windowName, args);
  };
}
function runtimeCallWithID(objectID, method, windowName, args) {
  let url = new URL(runtimeURL);
  url.searchParams.append("object", objectID);
  url.searchParams.append("method", method);
  let fetchOptions = {
    headers: {}
  };
  if (windowName) {
    fetchOptions.headers["x-wails-window-name"] = windowName;
  }
  if (args) {
    url.searchParams.append("args", JSON.stringify(args));
  }
  fetchOptions.headers["x-wails-client-id"] = clientId;
  return new Promise((resolve, reject) => {
    fetch(url, fetchOptions).then((response) => {
      if (response.ok) {
        if (response.headers.get("Content-Type") && response.headers.get("Content-Type").indexOf("application/json") !== -1) {
          return response.json();
        } else {
          return response.text();
        }
      }
      reject(Error(response.statusText));
    }).then((data) => resolve(data)).catch((error) => reject(error));
  });
}

// bundle/core/.build/github.com/wailsapp/wails/v3/internal/runtime/core/system.js
var system_exports = {};
__export(system_exports, {
  Capabilities: () => Capabilities,
  IsAMD64: () => IsAMD64,
  IsARM: () => IsARM,
  IsARM64: () => IsARM64,
  IsDebug: () => IsDebug,
  IsLinux: () => IsLinux,
  IsMac: () => IsMac,
  IsWindows: () => IsWindows
});
function Capabilities() {
  return fetch("/wails/capabilities").then((response) => response.json());
}
function IsWindows() {
  return window._wails.environment.OS === "windows";
}
function IsLinux() {
  return window._wails.environment.OS === "linux";
}
function IsMac() {
  return window._wails.environment.OS === "darwin";
}
function IsAMD64() {
  return window._wails.environment.Arch === "amd64";
}
function IsARM() {
  return window._wails.environment.Arch === "arm";
}
function IsARM64() {
  return window._wails.environment.Arch === "arm64";
}
function IsDebug() {
  return window._wails.environment.Debug === true;
}

// bundle/core/.build/github.com/wailsapp/wails/v3/internal/runtime/core/contextmenu.js
window.addEventListener("contextmenu", contextMenuHandler);
var call = newRuntimeCallerWithID(objectNames.ContextMenu, "");
var ContextMenuOpen = 0;
function openContextMenu(id, x, y, data) {
  void call(ContextMenuOpen, { id, x, y, data });
}
function contextMenuHandler(event) {
  let element = event.target;
  let customContextMenu = window.getComputedStyle(element).getPropertyValue("--custom-contextmenu");
  customContextMenu = customContextMenu ? customContextMenu.trim() : "";
  if (customContextMenu) {
    event.preventDefault();
    let customContextMenuData = window.getComputedStyle(element).getPropertyValue("--custom-contextmenu-data");
    openContextMenu(customContextMenu, event.clientX, event.clientY, customContextMenuData);
    return;
  }
  processDefaultContextMenu(event);
}
function processDefaultContextMenu(event) {
  if (IsDebug()) {
    return;
  }
  const element = event.target;
  const computedStyle = window.getComputedStyle(element);
  const defaultContextMenuAction = computedStyle.getPropertyValue("--default-contextmenu").trim();
  switch (defaultContextMenuAction) {
    case "show":
      return;
    case "hide":
      event.preventDefault();
      return;
    default:
      if (element.isContentEditable) {
        return;
      }
      const selection = window.getSelection();
      const hasSelection = selection.toString().length > 0;
      if (hasSelection) {
        for (let i = 0; i < selection.rangeCount; i++) {
          const range = selection.getRangeAt(i);
          const rects = range.getClientRects();
          for (let j = 0; j < rects.length; j++) {
            const rect = rects[j];
            if (document.elementFromPoint(rect.left, rect.top) === element) {
              return;
            }
          }
        }
      }
      if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        if (hasSelection || !element.readOnly && !element.disabled) {
          return;
        }
      }
      event.preventDefault();
  }
}

// bundle/core/.build/github.com/wailsapp/wails/v3/internal/runtime/core/flags.js
var flags_exports = {};
__export(flags_exports, {
  GetFlag: () => GetFlag
});
function GetFlag(keyString) {
  try {
    return window._wails.flags[keyString];
  } catch (e) {
    throw new Error("Unable to retrieve flag '" + keyString + "': " + e);
  }
}

// bundle/core/.build/github.com/wailsapp/wails/v3/internal/runtime/core/drag.js
var shouldDrag = false;
var resizable = false;
var resizeEdge = null;
var defaultCursor = "auto";
window._wails = window._wails || {};
window._wails.setResizable = function(value) {
  resizable = value;
};
window._wails.endDrag = function() {
  document.body.style.cursor = "default";
  shouldDrag = false;
};
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mouseup", onMouseUp);
function dragTest(e) {
  let val = window.getComputedStyle(e.target).getPropertyValue("--wails-draggable");
  let mousePressed = e.buttons !== void 0 ? e.buttons : e.which;
  if (!val || val === "" || val.trim() !== "drag" || mousePressed === 0) {
    return false;
  }
  return e.detail === 1;
}
function onMouseDown(e) {
  if (resizeEdge) {
    invoke("resize:" + resizeEdge);
    e.preventDefault();
    return;
  }
  if (dragTest(e)) {
    if (e.offsetX > e.target.clientWidth || e.offsetY > e.target.clientHeight) {
      return;
    }
    shouldDrag = true;
  } else {
    shouldDrag = false;
  }
}
function onMouseUp() {
  shouldDrag = false;
}
function setResize(cursor) {
  document.documentElement.style.cursor = cursor || defaultCursor;
  resizeEdge = cursor;
}
function onMouseMove(e) {
  if (shouldDrag) {
    shouldDrag = false;
    let mousePressed = e.buttons !== void 0 ? e.buttons : e.which;
    if (mousePressed > 0) {
      invoke("drag");
      return;
    }
  }
  if (!resizable || !IsWindows()) {
    return;
  }
  if (defaultCursor == null) {
    defaultCursor = document.documentElement.style.cursor;
  }
  let resizeHandleHeight = GetFlag("system.resizeHandleHeight") || 5;
  let resizeHandleWidth = GetFlag("system.resizeHandleWidth") || 5;
  let cornerExtra = GetFlag("resizeCornerExtra") || 10;
  let rightBorder = window.outerWidth - e.clientX < resizeHandleWidth;
  let leftBorder = e.clientX < resizeHandleWidth;
  let topBorder = e.clientY < resizeHandleHeight;
  let bottomBorder = window.outerHeight - e.clientY < resizeHandleHeight;
  let rightCorner = window.outerWidth - e.clientX < resizeHandleWidth + cornerExtra;
  let leftCorner = e.clientX < resizeHandleWidth + cornerExtra;
  let topCorner = e.clientY < resizeHandleHeight + cornerExtra;
  let bottomCorner = window.outerHeight - e.clientY < resizeHandleHeight + cornerExtra;
  if (!leftBorder && !rightBorder && !topBorder && !bottomBorder && resizeEdge !== void 0) {
    setResize();
  } else if (rightCorner && bottomCorner) setResize("se-resize");
  else if (leftCorner && bottomCorner) setResize("sw-resize");
  else if (leftCorner && topCorner) setResize("nw-resize");
  else if (topCorner && rightCorner) setResize("ne-resize");
  else if (leftBorder) setResize("w-resize");
  else if (topBorder) setResize("n-resize");
  else if (bottomBorder) setResize("s-resize");
  else if (rightBorder) setResize("e-resize");
}

// bundle/core/.build/github.com/wailsapp/wails/v3/internal/runtime/core/call.js
var call_exports = {};
__export(call_exports, {
  ByID: () => ByID,
  ByName: () => ByName,
  Call: () => Call,
  Plugin: () => Plugin
});
window._wails = window._wails || {};
window._wails.callResultHandler = resultHandler;
window._wails.callErrorHandler = errorHandler;
var CallBinding = 0;
var call2 = newRuntimeCallerWithID(objectNames.Call, "");
var cancelCall = newRuntimeCallerWithID(objectNames.CancelCall, "");
var callResponses = /* @__PURE__ */ new Map();
function generateID() {
  let result;
  do {
    result = nanoid();
  } while (callResponses.has(result));
  return result;
}
function resultHandler(id, data, isJSON) {
  const promiseHandler = getAndDeleteResponse(id);
  if (promiseHandler) {
    promiseHandler.resolve(isJSON ? JSON.parse(data) : data);
  }
}
function errorHandler(id, message) {
  const promiseHandler = getAndDeleteResponse(id);
  if (promiseHandler) {
    promiseHandler.reject(message);
  }
}
function getAndDeleteResponse(id) {
  const response = callResponses.get(id);
  callResponses.delete(id);
  return response;
}
function callBinding(type, options = {}) {
  const id = generateID();
  const doCancel = () => {
    return cancelCall(type, { "call-id": id });
  };
  let queuedCancel = false, callRunning = false;
  let p = new Promise((resolve, reject) => {
    options["call-id"] = id;
    callResponses.set(id, { resolve, reject });
    call2(type, options).then((_) => {
      callRunning = true;
      if (queuedCancel) {
        return doCancel();
      }
    }).catch((error) => {
      reject(error);
      callResponses.delete(id);
    });
  });
  p.cancel = () => {
    if (callRunning) {
      return doCancel();
    } else {
      queuedCancel = true;
    }
  };
  return p;
}
function Call(options) {
  return callBinding(CallBinding, options);
}
function ByName(methodName, ...args) {
  return callBinding(CallBinding, {
    methodName,
    args
  });
}
function ByID(methodID, ...args) {
  return callBinding(CallBinding, {
    methodID,
    args
  });
}
function Plugin(pluginName, methodName, ...args) {
  return callBinding(CallBinding, {
    packageName: "wails-plugins",
    structName: pluginName,
    methodName,
    args
  });
}

// bundle/core/.build/github.com/wailsapp/wails/v3/internal/runtime/core/types.js
var types_exports = {};
__export(types_exports, {
  CreateAny: () => CreateAny,
  CreateArray: () => CreateArray,
  CreateByteSlice: () => CreateByteSlice,
  CreateMap: () => CreateMap,
  CreateNullable: () => CreateNullable,
  CreateStruct: () => CreateStruct,
  GarbleAny: () => GarbleAny,
  GarbleArray: () => GarbleArray,
  GarbleMap: () => GarbleMap,
  GarbleNullable: () => GarbleNullable,
  GarbleStruct: () => GarbleStruct,
  UngarbleAny: () => UngarbleAny,
  UngarbleArray: () => UngarbleArray,
  UngarbleMap: () => UngarbleMap,
  UngarbleNullable: () => UngarbleNullable,
  UngarbleStruct: () => UngarbleStruct
});
function CreateAny(source) {
  return (
    /** @type {T} */
    source
  );
}
function GarbleAny(value) {
  return value;
}
function UngarbleAny(value) {
  return value;
}
function CreateByteSlice(source) {
  return (
    /** @type {any} */
    source == null ? "" : source
  );
}
function CreateArray(element) {
  if (element === CreateAny) {
    return (source) => source === null ? [] : source;
  }
  return (source) => {
    if (source === null) {
      return [];
    }
    for (let i = 0; i < source.length; i++) {
      source[i] = element(source[i]);
    }
    return source;
  };
}
function GarbleArray(element) {
  if (element === GarbleAny) {
    return GarbleAny;
  }
  return (value) => value.map(element);
}
function UngarbleArray(element) {
  if (element === UngarbleAny) {
    return UngarbleAny;
  }
  return (value) => {
    if (value === null) {
      return null;
    }
    for (let i = 0; i < value.length; i++) {
      value[i] = element(value[i]);
    }
    return value;
  };
}
function CreateMap(key, value) {
  if (value === CreateAny) {
    return (source) => source === null ? {} : source;
  }
  return (source) => {
    if (source === null) {
      return {};
    }
    for (const key2 in source) {
      source[key2] = value(source[key2]);
    }
    return source;
  };
}
function GarbleMap(key, value) {
  if (value === GarbleAny) {
    return GarbleAny;
  }
  return (map) => {
    const result = {};
    for (const key2 in map) {
      result[key2] = value(map[key2]);
    }
    return result;
  };
}
function UngarbleMap(key, value) {
  if (value === UngarbleAny) {
    return UngarbleAny;
  }
  return (map) => {
    if (map === null) {
      return null;
    }
    for (const key2 in map) {
      map[key2] = value(map[key2]);
    }
    return map;
  };
}
function CreateNullable(element) {
  if (element === CreateAny) {
    return CreateAny;
  }
  return (source) => source === null ? null : element(source);
}
function GarbleNullable(element) {
  if (element === GarbleAny) {
    return GarbleAny;
  }
  return (value) => value === null ? null : element(value);
}
function UngarbleNullable(element) {
  if (element === UngarbleAny) {
    return UngarbleAny;
  }
  return (value) => value === null ? null : element(value);
}
function CreateStruct(createField, ungarbleMap = null) {
  const createFn = (source) => {
    for (const name in createField) {
      if (name in source) {
        source[name] = createField[name](source[name]);
      }
    }
    return source;
  };
  if (ungarbleMap === null) {
    return createFn;
  } else {
    return (source) => {
      const ungarbled = {};
      for (const name in source) {
        if (name in ungarbleMap) {
          ungarbled[ungarbleMap[name]] = source[name];
        } else {
          ungarbled[name] = source[name];
        }
      }
      return createFn(ungarbled);
    };
  }
}
function GarbleStruct(fields) {
  return (value) => {
    const result = {};
    for (const name in fields) {
      const fieldInfo = fields[name];
      result[fieldInfo.to] = fieldInfo.garble(value[name]);
    }
    return result;
  };
}
function UngarbleStruct(fields) {
  return (value) => {
    const result = {};
    for (const name in fields) {
      const fieldInfo = fields[name];
      result[name] = fieldInfo.ungarble(value[fieldInfo.from]);
    }
    return result;
  };
}

// bundle/core/.build/github.com/wailsapp/wails/v3/internal/runtime/core/index.js
window._wails = window._wails || {};
if (!("dispatchWailsEvent" in window._wails)) {
  window._wails.dispatchWailsEvent = function() {
  };
}
window._wails.invoke = invoke;
invoke("wails:runtime:ready");
export {
  call_exports as Call,
  flags_exports as Flags,
  system_exports as System,
  types_exports as Types
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL25hbm9pZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvcnVudGltZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvc3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9jb250ZXh0bWVudS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvZmxhZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2RyYWcuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NhbGwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL3R5cGVzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9pbmRleC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyoqXG4gKiBUaGlzIGNvZGUgZnJhZ21lbnQgaXMgdGFrZW4gZnJvbSBuYW5vaWQgKGh0dHBzOi8vZ2l0aHViLmNvbS9haS9uYW5vaWQpOlxuICpcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICpcbiAqIENvcHlyaWdodCAyMDE3IEFuZHJleSBTaXRuaWsgPGFuZHJleUBzaXRuaWsucnU+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZlxuICogdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpblxuICogdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0b1xuICogdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2ZcbiAqIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcbiAqIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTU1xuICogRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SXG4gKiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVJcbiAqIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOXG4gKiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmxldCB1cmxBbHBoYWJldCA9XG4gICd1c2VhbmRvbS0yNlQxOTgzNDBQWDc1cHhKQUNLVkVSWU1JTkRCVVNIV09MRl9HUVpiZmdoamtscXZ3eXpyaWN0J1xuZXhwb3J0IGxldCBjdXN0b21BbHBoYWJldCA9IChhbHBoYWJldCwgZGVmYXVsdFNpemUgPSAyMSkgPT4ge1xuICByZXR1cm4gKHNpemUgPSBkZWZhdWx0U2l6ZSkgPT4ge1xuICAgIGxldCBpZCA9ICcnXG4gICAgbGV0IGkgPSBzaXplXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWQgKz0gYWxwaGFiZXRbKE1hdGgucmFuZG9tKCkgKiBhbHBoYWJldC5sZW5ndGgpIHwgMF1cbiAgICB9XG4gICAgcmV0dXJuIGlkXG4gIH1cbn1cbmV4cG9ydCBsZXQgbmFub2lkID0gKHNpemUgPSAyMSkgPT4ge1xuICBsZXQgaWQgPSAnJ1xuICBsZXQgaSA9IHNpemVcbiAgd2hpbGUgKGktLSkge1xuICAgIGlkICs9IHVybEFscGhhYmV0WyhNYXRoLnJhbmRvbSgpICogNjQpIHwgMF1cbiAgfVxuICByZXR1cm4gaWRcbn1cbiIsICIvKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuaW1wb3J0IHtuYW5vaWR9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xuXG5jb25zdCBydW50aW1lVVJMID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIFwiL3dhaWxzL3J1bnRpbWVcIjtcblxuLyoqIFNlbmRzIG1lc3NhZ2VzIHRvIHRoZSBiYWNrZW5kICovXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlKG1zZykge1xuICAgIGlmKHdpbmRvdy5jaHJvbWUpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jaHJvbWUud2Vidmlldy5wb3N0TWVzc2FnZShtc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cud2Via2l0Lm1lc3NhZ2VIYW5kbGVycy5leHRlcm5hbC5wb3N0TWVzc2FnZShtc2cpO1xuICAgIH1cbn1cblxuLyoqIE9iamVjdCBOYW1lcyAqL1xuZXhwb3J0IGNvbnN0IG9iamVjdE5hbWVzID0ge1xuICAgIENhbGw6IDAsXG4gICAgQ29udGV4dE1lbnU6IDQsXG4gICAgQ2FuY2VsQ2FsbDogMTAsXG59XG5leHBvcnQgbGV0IGNsaWVudElkID0gbmFub2lkKCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJ1bnRpbWUgY2FsbGVyIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBhIHNwZWNpZmllZCBtZXRob2Qgb24gYSBnaXZlbiBvYmplY3Qgd2l0aGluIGEgc3BlY2lmaWVkIHdpbmRvdyBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRob2QgaXMgdG8gYmUgaW52b2tlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdyBjb250ZXh0IGluIHdoaWNoIHRoZSBtZXRob2Qgc2hvdWxkIGJlIGNhbGxlZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBydW50aW1lIGNhbGxlciBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBtZXRob2QgbmFtZSBhbmQgb3B0aW9uYWxseSBhcmd1bWVudHMgYW5kIGludm9rZXMgdGhlIG1ldGhvZCB3aXRoaW4gdGhlIHNwZWNpZmllZCB3aW5kb3cgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0LCB3aW5kb3dOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZXRob2QsIGFyZ3M9bnVsbCkge1xuICAgICAgICByZXR1cm4gcnVudGltZUNhbGwob2JqZWN0ICsgXCIuXCIgKyBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpO1xuICAgIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBydW50aW1lIGNhbGxlciB3aXRoIHNwZWNpZmllZCBJRC5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IC0gVGhlIG9iamVjdCB0byBpbnZva2UgdGhlIG1ldGhvZCBvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSAtIFRoZSBuZXcgcnVudGltZSBjYWxsZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdCwgd2luZG93TmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAobWV0aG9kLCBhcmdzPW51bGwpIHtcbiAgICAgICAgcmV0dXJuIHJ1bnRpbWVDYWxsV2l0aElEKG9iamVjdCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKTtcbiAgICB9O1xufVxuXG5cbmZ1bmN0aW9uIHJ1bnRpbWVDYWxsKG1ldGhvZCwgd2luZG93TmFtZSwgYXJncykge1xuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJ1bnRpbWVVUkwpO1xuICAgIGlmKCBtZXRob2QgKSB7XG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwibWV0aG9kXCIsIG1ldGhvZCk7XG4gICAgfVxuICAgIGxldCBmZXRjaE9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgIH07XG4gICAgaWYgKHdpbmRvd05hbWUpIHtcbiAgICAgICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcbiAgICB9XG4gICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJhcmdzXCIsIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcbiAgICB9XG4gICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLWNsaWVudC1pZFwiXSA9IGNsaWVudElkO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZmV0Y2godXJsLCBmZXRjaE9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGNvbnRlbnQgdHlwZVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikgJiYgcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikuaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWplY3QoRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcmVzb2x2ZShkYXRhKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcnVudGltZUNhbGxXaXRoSUQob2JqZWN0SUQsIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncykge1xuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJ1bnRpbWVVUkwpO1xuICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwib2JqZWN0XCIsIG9iamVjdElEKTtcbiAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcIm1ldGhvZFwiLCBtZXRob2QpO1xuICAgIGxldCBmZXRjaE9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgIH07XG4gICAgaWYgKHdpbmRvd05hbWUpIHtcbiAgICAgICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcbiAgICB9XG4gICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJhcmdzXCIsIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcbiAgICB9XG4gICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLWNsaWVudC1pZFwiXSA9IGNsaWVudElkO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGZldGNoKHVybCwgZmV0Y2hPcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBjb250ZW50IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpICYmIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9qc29uXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVqZWN0KEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHJlc29sdmUoZGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSk7XG4gICAgfSk7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuLyoqXG4gKiBGZXRjaGVzIGFwcGxpY2F0aW9uIGNhcGFiaWxpdGllcyBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogQGFzeW5jXG4gKiBAZnVuY3Rpb24gQ2FwYWJpbGl0aWVzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgY2FwYWJpbGl0aWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQ2FwYWJpbGl0aWVzKCkge1xuICAgIHJldHVybiBmZXRjaChcIi93YWlscy9jYXBhYmlsaXRpZXNcIikudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cy5cbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIFdpbmRvd3MsIG90aGVyd2lzZSBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzV2luZG93cygpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5PUyA9PT0gXCJ3aW5kb3dzXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgTGludXguXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIExpbnV4LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0xpbnV4KCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcImxpbnV4XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIGEgbWFjT1Mgb3BlcmF0aW5nIHN5c3RlbS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgbWFjT1MsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWFjKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcImRhcndpblwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQU1ENjQoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuQXJjaCA9PT0gXCJhbWQ2NFwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBhcmNoaXRlY3R1cmUgaXMgQVJNLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGFyY2hpdGVjdHVyZSBpcyBBUk0sIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQVJNKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkFyY2ggPT09IFwiYXJtXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0FSTTY0KCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkFyY2ggPT09IFwiYXJtNjRcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgaW4gZGVidWcgbW9kZS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIGluIGRlYnVnIG1vZGUsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNEZWJ1ZygpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5EZWJ1ZyA9PT0gdHJ1ZTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQge25ld1J1bnRpbWVDYWxsZXJXaXRoSUQsIG9iamVjdE5hbWVzfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQge0lzRGVidWd9IGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuXG4vLyBzZXR1cFxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgY29udGV4dE1lbnVIYW5kbGVyKTtcblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0TmFtZXMuQ29udGV4dE1lbnUsICcnKTtcbmNvbnN0IENvbnRleHRNZW51T3BlbiA9IDA7XG5cbmZ1bmN0aW9uIG9wZW5Db250ZXh0TWVudShpZCwgeCwgeSwgZGF0YSkge1xuICAgIHZvaWQgY2FsbChDb250ZXh0TWVudU9wZW4sIHtpZCwgeCwgeSwgZGF0YX0pO1xufVxuXG5mdW5jdGlvbiBjb250ZXh0TWVudUhhbmRsZXIoZXZlbnQpIHtcbiAgICAvLyBDaGVjayBmb3IgY3VzdG9tIGNvbnRleHQgbWVudVxuICAgIGxldCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCBjdXN0b21Db250ZXh0TWVudSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudVwiKTtcbiAgICBjdXN0b21Db250ZXh0TWVudSA9IGN1c3RvbUNvbnRleHRNZW51ID8gY3VzdG9tQ29udGV4dE1lbnUudHJpbSgpIDogXCJcIjtcbiAgICBpZiAoY3VzdG9tQ29udGV4dE1lbnUpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGV0IGN1c3RvbUNvbnRleHRNZW51RGF0YSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudS1kYXRhXCIpO1xuICAgICAgICBvcGVuQ29udGV4dE1lbnUoY3VzdG9tQ29udGV4dE1lbnUsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGN1c3RvbUNvbnRleHRNZW51RGF0YSk7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQpO1xufVxuXG5cbi8qXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IGF1dG87IChkZWZhdWx0KSB3aWxsIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51IGlmIGNvbnRlbnRFZGl0YWJsZSBpcyB0cnVlIE9SIHRleHQgaGFzIGJlZW4gc2VsZWN0ZWQgT1IgZWxlbWVudCBpcyBpbnB1dCBvciB0ZXh0YXJlYVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBzaG93OyB3aWxsIGFsd2F5cyBzaG93IHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBoaWRlOyB3aWxsIGFsd2F5cyBoaWRlIHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuXG5UaGlzIHJ1bGUgaXMgaW5oZXJpdGVkIGxpa2Ugbm9ybWFsIENTUyBydWxlcywgc28gbmVzdGluZyB3b3JrcyBhcyBleHBlY3RlZFxuKi9cbmZ1bmN0aW9uIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQpIHtcblxuICAgIC8vIERlYnVnIGJ1aWxkcyBhbHdheXMgc2hvdyB0aGUgbWVudVxuICAgIGlmIChJc0RlYnVnKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgZGVmYXVsdCBjb250ZXh0IG1lbnVcbiAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbiAgICBjb25zdCBkZWZhdWx0Q29udGV4dE1lbnVBY3Rpb24gPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoXCItLWRlZmF1bHQtY29udGV4dG1lbnVcIikudHJpbSgpO1xuICAgIHN3aXRjaCAoZGVmYXVsdENvbnRleHRNZW51QWN0aW9uKSB7XG4gICAgICAgIGNhc2UgXCJzaG93XCI6XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNhc2UgXCJoaWRlXCI6XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWVcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0ZXh0IGhhcyBiZWVuIHNlbGVjdGVkXG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBoYXNTZWxlY3Rpb24gPSAoc2VsZWN0aW9uLnRvU3RyaW5nKCkubGVuZ3RoID4gMClcbiAgICAgICAgICAgIGlmIChoYXNTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdGlvbi5yYW5nZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdChpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVjdHMgPSByYW5nZS5nZXRDbGllbnRSZWN0cygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlY3RzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gcmVjdHNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChyZWN0LmxlZnQsIHJlY3QudG9wKSA9PT0gZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRhZ25hbWUgaXMgaW5wdXQgb3IgdGV4dGFyZWFcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09IFwiSU5QVVRcIiB8fCBlbGVtZW50LnRhZ05hbWUgPT09IFwiVEVYVEFSRUFcIikge1xuICAgICAgICAgICAgICAgIGlmIChoYXNTZWxlY3Rpb24gfHwgKCFlbGVtZW50LnJlYWRPbmx5ICYmICFlbGVtZW50LmRpc2FibGVkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBoaWRlIGRlZmF1bHQgY29udGV4dCBtZW51XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGZyb20gdGhlIGZsYWcgbWFwLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlTdHJpbmcgLSBUaGUga2V5IHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBmb3IuXG4gKiBAcmV0dXJuIHsqfSAtIFRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRGbGFnKGtleVN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmZsYWdzW2tleVN0cmluZ107XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcmV0cmlldmUgZmxhZyAnXCIgKyBrZXlTdHJpbmcgKyBcIic6IFwiICsgZSk7XG4gICAgfVxufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7aW52b2tlfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQge0lzV2luZG93c30gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5pbXBvcnQge0dldEZsYWd9IGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5cbi8vIFNldHVwXG5sZXQgc2hvdWxkRHJhZyA9IGZhbHNlO1xubGV0IHJlc2l6YWJsZSA9IGZhbHNlO1xubGV0IHJlc2l6ZUVkZ2UgPSBudWxsO1xubGV0IGRlZmF1bHRDdXJzb3IgPSBcImF1dG9cIjtcblxud2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XG5cbndpbmRvdy5fd2FpbHMuc2V0UmVzaXphYmxlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXNpemFibGUgPSB2YWx1ZTtcbn07XG5cbndpbmRvdy5fd2FpbHMuZW5kRHJhZyA9IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbn07XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuXG5cbmZ1bmN0aW9uIGRyYWdUZXN0KGUpIHtcbiAgICBsZXQgdmFsID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZS50YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLXdhaWxzLWRyYWdnYWJsZVwiKTtcbiAgICBsZXQgbW91c2VQcmVzc2VkID0gZS5idXR0b25zICE9PSB1bmRlZmluZWQgPyBlLmJ1dHRvbnMgOiBlLndoaWNoO1xuICAgIGlmICghdmFsIHx8IHZhbCA9PT0gXCJcIiB8fCB2YWwudHJpbSgpICE9PSBcImRyYWdcIiB8fCBtb3VzZVByZXNzZWQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZS5kZXRhaWwgPT09IDE7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGUpIHtcblxuICAgIC8vIENoZWNrIGZvciByZXNpemluZ1xuICAgIGlmIChyZXNpemVFZGdlKSB7XG4gICAgICAgIGludm9rZShcInJlc2l6ZTpcIiArIHJlc2l6ZUVkZ2UpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZHJhZ1Rlc3QoZSkpIHtcbiAgICAgICAgLy8gVGhpcyBjaGVja3MgZm9yIGNsaWNrcyBvbiB0aGUgc2Nyb2xsIGJhclxuICAgICAgICBpZiAoZS5vZmZzZXRYID4gZS50YXJnZXQuY2xpZW50V2lkdGggfHwgZS5vZmZzZXRZID4gZS50YXJnZXQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2hvdWxkRHJhZyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xuICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc2V0UmVzaXplKGN1cnNvcikge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5jdXJzb3IgPSBjdXJzb3IgfHwgZGVmYXVsdEN1cnNvcjtcbiAgICByZXNpemVFZGdlID0gY3Vyc29yO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKSB7XG4gICAgaWYgKHNob3VsZERyYWcpIHtcbiAgICAgICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xuICAgICAgICBsZXQgbW91c2VQcmVzc2VkID0gZS5idXR0b25zICE9PSB1bmRlZmluZWQgPyBlLmJ1dHRvbnMgOiBlLndoaWNoO1xuICAgICAgICBpZiAobW91c2VQcmVzc2VkID4gMCkge1xuICAgICAgICAgICAgaW52b2tlKFwiZHJhZ1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXJlc2l6YWJsZSB8fCAhSXNXaW5kb3dzKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGVmYXVsdEN1cnNvciA9PSBudWxsKSB7XG4gICAgICAgIGRlZmF1bHRDdXJzb3IgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuY3Vyc29yO1xuICAgIH1cbiAgICBsZXQgcmVzaXplSGFuZGxlSGVpZ2h0ID0gR2V0RmxhZyhcInN5c3RlbS5yZXNpemVIYW5kbGVIZWlnaHRcIikgfHwgNTtcbiAgICBsZXQgcmVzaXplSGFuZGxlV2lkdGggPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZVdpZHRoXCIpIHx8IDU7XG5cbiAgICAvLyBFeHRyYSBwaXhlbHMgZm9yIHRoZSBjb3JuZXIgYXJlYXNcbiAgICBsZXQgY29ybmVyRXh0cmEgPSBHZXRGbGFnKFwicmVzaXplQ29ybmVyRXh0cmFcIikgfHwgMTA7XG5cbiAgICBsZXQgcmlnaHRCb3JkZXIgPSB3aW5kb3cub3V0ZXJXaWR0aCAtIGUuY2xpZW50WCA8IHJlc2l6ZUhhbmRsZVdpZHRoO1xuICAgIGxldCBsZWZ0Qm9yZGVyID0gZS5jbGllbnRYIDwgcmVzaXplSGFuZGxlV2lkdGg7XG4gICAgbGV0IHRvcEJvcmRlciA9IGUuY2xpZW50WSA8IHJlc2l6ZUhhbmRsZUhlaWdodDtcbiAgICBsZXQgYm90dG9tQm9yZGVyID0gd2luZG93Lm91dGVySGVpZ2h0IC0gZS5jbGllbnRZIDwgcmVzaXplSGFuZGxlSGVpZ2h0O1xuXG4gICAgLy8gQWRqdXN0IGZvciBjb3JuZXJzXG4gICAgbGV0IHJpZ2h0Q29ybmVyID0gd2luZG93Lm91dGVyV2lkdGggLSBlLmNsaWVudFggPCAocmVzaXplSGFuZGxlV2lkdGggKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IGxlZnRDb3JuZXIgPSBlLmNsaWVudFggPCAocmVzaXplSGFuZGxlV2lkdGggKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IHRvcENvcm5lciA9IGUuY2xpZW50WSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IGJvdHRvbUNvcm5lciA9IHdpbmRvdy5vdXRlckhlaWdodCAtIGUuY2xpZW50WSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG5cbiAgICAvLyBJZiB3ZSBhcmVuJ3Qgb24gYW4gZWRnZSwgYnV0IHdlcmUsIHJlc2V0IHRoZSBjdXJzb3IgdG8gZGVmYXVsdFxuICAgIGlmICghbGVmdEJvcmRlciAmJiAhcmlnaHRCb3JkZXIgJiYgIXRvcEJvcmRlciAmJiAhYm90dG9tQm9yZGVyICYmIHJlc2l6ZUVkZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXRSZXNpemUoKTtcbiAgICB9XG4gICAgLy8gQWRqdXN0ZWQgZm9yIGNvcm5lciBhcmVhc1xuICAgIGVsc2UgaWYgKHJpZ2h0Q29ybmVyICYmIGJvdHRvbUNvcm5lcikgc2V0UmVzaXplKFwic2UtcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGxlZnRDb3JuZXIgJiYgYm90dG9tQ29ybmVyKSBzZXRSZXNpemUoXCJzdy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAobGVmdENvcm5lciAmJiB0b3BDb3JuZXIpIHNldFJlc2l6ZShcIm53LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmICh0b3BDb3JuZXIgJiYgcmlnaHRDb3JuZXIpIHNldFJlc2l6ZShcIm5lLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChsZWZ0Qm9yZGVyKSBzZXRSZXNpemUoXCJ3LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmICh0b3BCb3JkZXIpIHNldFJlc2l6ZShcIm4tcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGJvdHRvbUJvcmRlcikgc2V0UmVzaXplKFwicy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAocmlnaHRCb3JkZXIpIHNldFJlc2l6ZShcImUtcmVzaXplXCIpO1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7bmV3UnVudGltZUNhbGxlcldpdGhJRCwgb2JqZWN0TmFtZXN9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7bmFub2lkfSBmcm9tIFwiLi9uYW5vaWQuanNcIjtcblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xud2luZG93Ll93YWlscy5jYWxsUmVzdWx0SGFuZGxlciA9IHJlc3VsdEhhbmRsZXI7XG53aW5kb3cuX3dhaWxzLmNhbGxFcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXI7XG5cbmNvbnN0IENhbGxCaW5kaW5nID0gMDtcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdE5hbWVzLkNhbGwsICcnKTtcbmNvbnN0IGNhbmNlbENhbGwgPSBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdE5hbWVzLkNhbmNlbENhbGwsICcnKTtcbmxldCBjYWxsUmVzcG9uc2VzID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBJRCB1c2luZyB0aGUgbmFub2lkIGxpYnJhcnkuXG4gKlxuICogQHJldHVybiB7c3RyaW5nfSAtIEEgdW5pcXVlIElEIHRoYXQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGNhbGxSZXNwb25zZXMgc2V0LlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUlEKCkge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZG8ge1xuICAgICAgICByZXN1bHQgPSBuYW5vaWQoKTtcbiAgICB9IHdoaWxlIChjYWxsUmVzcG9uc2VzLmhhcyhyZXN1bHQpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEhhbmRsZXMgdGhlIHJlc3VsdCBvZiBhIGNhbGwgcmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHJlcXVlc3QgdG8gaGFuZGxlIHRoZSByZXN1bHQgZm9yLlxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBUaGUgcmVzdWx0IGRhdGEgb2YgdGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzSlNPTiAtIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkYXRhIGlzIEpTT04gb3Igbm90LlxuICpcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH0gLSBUaGlzIG1ldGhvZCBkb2VzIG5vdCByZXR1cm4gYW55IHZhbHVlLlxuICovXG5mdW5jdGlvbiByZXN1bHRIYW5kbGVyKGlkLCBkYXRhLCBpc0pTT04pIHtcbiAgICBjb25zdCBwcm9taXNlSGFuZGxlciA9IGdldEFuZERlbGV0ZVJlc3BvbnNlKGlkKTtcbiAgICBpZiAocHJvbWlzZUhhbmRsZXIpIHtcbiAgICAgICAgcHJvbWlzZUhhbmRsZXIucmVzb2x2ZShpc0pTT04gPyBKU09OLnBhcnNlKGRhdGEpIDogZGF0YSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEhhbmRsZXMgdGhlIGVycm9yIGZyb20gYSBjYWxsIHJlcXVlc3QuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSBwcm9taXNlIGhhbmRsZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIHJlamVjdCB0aGUgcHJvbWlzZSBoYW5kbGVyIHdpdGguXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gZXJyb3JIYW5kbGVyKGlkLCBtZXNzYWdlKSB7XG4gICAgY29uc3QgcHJvbWlzZUhhbmRsZXIgPSBnZXRBbmREZWxldGVSZXNwb25zZShpZCk7XG4gICAgaWYgKHByb21pc2VIYW5kbGVyKSB7XG4gICAgICAgIHByb21pc2VIYW5kbGVyLnJlamVjdChtZXNzYWdlKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGFuZCByZW1vdmVzIHRoZSByZXNwb25zZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIElEIGZyb20gdGhlIGNhbGxSZXNwb25zZXMgbWFwLlxuICpcbiAqIEBwYXJhbSB7YW55fSBpZCAtIFRoZSBJRCBvZiB0aGUgcmVzcG9uc2UgdG8gYmUgcmV0cmlldmVkIGFuZCByZW1vdmVkLlxuICpcbiAqIEByZXR1cm5zIHthbnl9IFRoZSByZXNwb25zZSBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBJRC5cbiAqL1xuZnVuY3Rpb24gZ2V0QW5kRGVsZXRlUmVzcG9uc2UoaWQpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGNhbGxSZXNwb25zZXMuZ2V0KGlkKTtcbiAgICBjYWxsUmVzcG9uc2VzLmRlbGV0ZShpZCk7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY2FsbCB1c2luZyB0aGUgcHJvdmlkZWQgdHlwZSBhbmQgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IHR5cGUgLSBUaGUgdHlwZSBvZiBjYWxsIHRvIGV4ZWN1dGUuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIC0gQWRkaXRpb25hbCBvcHRpb25zIGZvciB0aGUgY2FsbC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IC0gQSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvciByZWplY3RlZCBiYXNlZCBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjYWxsLiBJdCBhbHNvIGhhcyBhIGNhbmNlbCBtZXRob2QgdG8gY2FuY2VsIGEgbG9uZyBydW5uaW5nIHJlcXVlc3QuXG4gKi9cbmZ1bmN0aW9uIGNhbGxCaW5kaW5nKHR5cGUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGlkID0gZ2VuZXJhdGVJRCgpO1xuICAgIGNvbnN0IGRvQ2FuY2VsID0gKCkgPT4geyByZXR1cm4gY2FuY2VsQ2FsbCh0eXBlLCB7XCJjYWxsLWlkXCI6IGlkfSkgfTtcbiAgICBsZXQgcXVldWVkQ2FuY2VsID0gZmFsc2UsIGNhbGxSdW5uaW5nID0gZmFsc2U7XG4gICAgbGV0IHAgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIG9wdGlvbnNbXCJjYWxsLWlkXCJdID0gaWQ7XG4gICAgICAgIGNhbGxSZXNwb25zZXMuc2V0KGlkLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgICAgY2FsbCh0eXBlLCBvcHRpb25zKS5cbiAgICAgICAgICAgIHRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgICAgICBjYWxsUnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlZENhbmNlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9DYW5jZWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5cbiAgICAgICAgICAgIGNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgY2FsbFJlc3BvbnNlcy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcC5jYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIGlmIChjYWxsUnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGRvQ2FuY2VsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWV1ZWRDYW5jZWwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBwO1xufVxuXG4vKipcbiAqIENhbGwgbWV0aG9kLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gVGhlIG9wdGlvbnMgZm9yIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIFRoZSByZXN1bHQgb2YgdGhlIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYWxsKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgbWV0aG9kIGJ5IG5hbWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIGluIHRoZSBmb3JtYXQgJ3BhY2thZ2Uuc3RydWN0Lm1ldGhvZCcuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgbmFtZSBpcyBub3QgYSBzdHJpbmcgb3IgaXMgbm90IGluIHRoZSBjb3JyZWN0IGZvcm1hdC5cbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgZXhlY3V0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQnlOYW1lKG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIHtcbiAgICAgICAgbWV0aG9kTmFtZSxcbiAgICAgICAgYXJnc1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIGJ5IGl0cyBJRCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBtZXRob2RJRCAtIFRoZSBJRCBvZiB0aGUgbWV0aG9kIHRvIGNhbGwuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEByZXR1cm4geyp9IC0gVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCeUlEKG1ldGhvZElELCAuLi5hcmdzKSB7XG4gICAgcmV0dXJuIGNhbGxCaW5kaW5nKENhbGxCaW5kaW5nLCB7XG4gICAgICAgIG1ldGhvZElELFxuICAgICAgICBhcmdzXG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb24gYSBwbHVnaW4uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsdWdpbk5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGNhbGwuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEByZXR1cm5zIHsqfSAtIFRoZSByZXN1bHQgb2YgdGhlIG1ldGhvZCBjYWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gUGx1Z2luKHBsdWdpbk5hbWUsIG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIHtcbiAgICAgICAgcGFja2FnZU5hbWU6IFwid2FpbHMtcGx1Z2luc1wiLFxuICAgICAgICBzdHJ1Y3ROYW1lOiBwbHVnaW5OYW1lLFxuICAgICAgICBtZXRob2ROYW1lLFxuICAgICAgICBhcmdzXG4gICAgfSk7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuLyoqXG4gKiBDcmVhdGVBbnkgaXMgYSBkdW1teSBjcmVhdGlvbiBmdW5jdGlvbiBmb3Igc2ltcGxlIG9yIHVua25vd24gdHlwZXMuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHthbnl9IHNvdXJjZVxuICogQHJldHVybnMge1R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDcmVhdGVBbnkoc291cmNlKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7VH0gKi8oc291cmNlKTtcbn1cblxuLyoqXG4gKiBHYXJibGVBbnkgaXMgYSBkdW1teSBnYXJibGluZyBmdW5jdGlvbiBmb3Igc2ltcGxlIG9yIHVua25vd24gdHlwZXMuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtUfSB2YWx1ZVxuICogQHJldHVybnMge2FueX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdhcmJsZUFueSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBVbmdhcmJsZUFueSBpcyBhIGR1bW15IHVuZ2FyYmxpbmcgZnVuY3Rpb24gZm9yIHNpbXBsZSBvciB1bmtub3duIHR5cGVzLlxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7YW55fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5nYXJibGVBbnkodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogQ3JlYXRlQnl0ZVNsaWNlIGlzIGEgY3JlYXRpb24gZnVuY3Rpb24gdGhhdCByZXBsYWNlc1xuICogbnVsbCBzdHJpbmdzIHdpdGggZW1wdHkgc3RyaW5ncy5cbiAqIEBwYXJhbSB7YW55fSBzb3VyY2VcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDcmVhdGVCeXRlU2xpY2Uoc291cmNlKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygoc291cmNlID09IG51bGwpID8gXCJcIiA6IHNvdXJjZSk7XG59XG5cbi8qKlxuICogQ3JlYXRlQXJyYXkgdGFrZXMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcnJheVxuICogd2hvc2UgZWxlbWVudHMgYXJlIG9mIHRoYXQgdHlwZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geyhhbnkpID0+IFR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHsoYW55KSA9PiBUW119XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDcmVhdGVBcnJheShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IENyZWF0ZUFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IFtdIDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvdXJjZVtpXSA9IGVsZW1lbnQoc291cmNlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogR2FyYmxlQXJyYXkgdGFrZXMgYSBnYXJibGluZyBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcbiAqIGFuZCByZXR1cm5zIGEgZ2FyYmxpbmcgZnVuY3Rpb24gZm9yIGFuIGFycmF5IHdob3NlIGVsZW1lbnRzXG4gKiBhcmUgb2YgdGhhdCB0eXBlLiBUaGUgaW5wdXQgYXJyYXkgaXMgbmV2ZXIgbW9kaWZpZWQuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHsoVCkgPT4gYW55fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7KHZhbHVlOiBUW10pID0+IGFueVtdfVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2FyYmxlQXJyYXkoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50ID09PSBHYXJibGVBbnkpIHtcbiAgICAgICAgcmV0dXJuIEdhcmJsZUFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbHVlKSA9PiB2YWx1ZS5tYXAoZWxlbWVudCk7XG59XG5cbi8qKlxuICogVW5nYXJibGVBcnJheSB0YWtlcyBhbiB1bmdhcmJsaW5nIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgdW5nYXJibGluZyBmdW5jdGlvbiBmb3IgYSBudWxsYWJsZSBhcnJheSB3aG9zZSBlbGVtZW50c1xuICogYXJlIG9mIHRoYXQgdHlwZS5cbiAqIEBwYXJhbSB7KGFueSkgPT4gYW55fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7KHZhbHVlOiBhbnlbXSB8IG51bGwpID0+IChhbnlbXSB8IG51bGwpfVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5nYXJibGVBcnJheShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IFVuZ2FyYmxlQW55KSB7XG4gICAgICAgIHJldHVybiBVbmdhcmJsZUFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFsdWVbaV0gPSBlbGVtZW50KHZhbHVlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZU1hcCB0YWtlcyBjcmVhdGlvbiBmdW5jdGlvbnMgZm9yIHR3byBhcmJpdHJhcnkgdHlwZXNcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBvYmplY3RcbiAqIHdob3NlIGtleXMgYW5kIHZhbHVlcyBhcmUgb2YgdGhvc2UgdHlwZXMuXG4gKiBAdGVtcGxhdGUgSywgVlxuICogQHBhcmFtIHsoYW55KSA9PiBLfSBrZXlcbiAqIEBwYXJhbSB7KGFueSkgPT4gVn0gdmFsdWVcbiAqIEByZXR1cm5zIHsoYW55KSA9PiB7IFtfOiBLXTogViB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQ3JlYXRlTWFwKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IENyZWF0ZUFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IHt9IDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBzb3VyY2Vba2V5XSA9IHZhbHVlKHNvdXJjZVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogR2FyYmxlTWFwIHRha2VzIGdhcmJsaW5nIGZ1bmN0aW9ucyBmb3IgdHdvIGFyYml0cmFyeSB0eXBlc1xuICogYW5kIHJldHVybnMgYSBnYXJibGluZyBmdW5jdGlvbiBmb3IgYW4gb2JqZWN0XG4gKiB3aG9zZSBrZXlzIGFuZCB2YWx1ZXMgYXJlIG9mIHRob3NlIHR5cGVzLlxuICogVGhlIGlucHV0IG9iamVjdCBpcyBuZXZlciBtb2RpZmllZC5cbiAqIEB0ZW1wbGF0ZSBLLCBWXG4gKiBAcGFyYW0geyhLKSA9PiBhbnl9IGtleVxuICogQHBhcmFtIHsoVikgPT4gYW55fSB2YWx1ZVxuICogQHJldHVybnMgeyhtYXA6IHsgW186IEtdOiBWIH0pID0+IHsgW186IGFueV06IGFueSB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2FyYmxlTWFwKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IEdhcmJsZUFueSkge1xuICAgICAgICByZXR1cm4gR2FyYmxlQW55O1xuICAgIH1cblxuICAgIHJldHVybiAobWFwKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtYXApIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWUobWFwW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBVbmdhcmJsZU1hcCB0YWtlcyB1bmdhcmJsaW5nIGZ1bmN0aW9ucyBmb3IgdHdvIGFyYml0cmFyeSB0eXBlc1xuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgdW5nYXJibGluZyBmdW5jdGlvbiBmb3IgYW4gb2JqZWN0XG4gKiB3aG9zZSBrZXlzIGFuZCB2YWx1ZXMgYXJlIG9mIHRob3NlIHR5cGVzLlxuICogQHBhcmFtIHsoYW55KSA9PiBhbnl9IGtleVxuICogQHBhcmFtIHsoYW55KSA9PiBhbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7KG1hcDogeyBbXzogYW55XTogYW55IH0pID0+IHsgW186IGFueV06IGFueSB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5nYXJibGVNYXAoa2V5LCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gVW5nYXJibGVBbnkpIHtcbiAgICAgICAgcmV0dXJuIFVuZ2FyYmxlQW55O1xuICAgIH1cblxuICAgIHJldHVybiAobWFwKSA9PiB7XG4gICAgICAgIGlmIChtYXAgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG1hcCkge1xuICAgICAgICAgICAgbWFwW2tleV0gPSB2YWx1ZShtYXBba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZU51bGxhYmxlIHRha2VzIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXG4gKiBhbmQgcmV0dXJucyBhIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhIG51bGxhYmxlIHZhbHVlIG9mIHRoYXQgdHlwZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geyhhbnkpID0+IFR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHsoYW55KSA9PiAoVCB8IG51bGwpfVxuICovXG5leHBvcnQgZnVuY3Rpb24gQ3JlYXRlTnVsbGFibGUoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50ID09PSBDcmVhdGVBbnkpIHtcbiAgICAgICAgcmV0dXJuIENyZWF0ZUFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IG51bGwgOiBlbGVtZW50KHNvdXJjZSkpO1xufVxuXG4vKipcbiAqIEdhcmJsZU51bGxhYmxlIHRha2VzIGEgZ2FyYmxpbmcgZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXG4gKiBhbmQgcmV0dXJucyBhIGdhcmJsaW5nIGZ1bmN0aW9uIGZvciBhIG51bGxhYmxlIHZhbHVlIG9mIHRoYXQgdHlwZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geyhUKSA9PiBhbnl9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHsodmFsdWU6IFQgfCBudWxsKSA9PiBhbnl9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHYXJibGVOdWxsYWJsZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IEdhcmJsZUFueSkge1xuICAgICAgICByZXR1cm4gR2FyYmxlQW55O1xuICAgIH1cblxuICAgIHJldHVybiAodmFsdWUpID0+ICh2YWx1ZSA9PT0gbnVsbCA/IG51bGwgOiBlbGVtZW50KHZhbHVlKSk7XG59XG5cbi8qKlxuICogVW5nYXJibGVOdWxsYWJsZSB0YWtlcyBhbiB1bmdhcmJsaW5nIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxuICogYW5kIHJldHVybnMgYW4gdW5nYXJibGluZyBmdW5jdGlvbiBmb3IgYSBudWxsYWJsZSB2YWx1ZSBvZiB0aGF0IHR5cGUuXG4gKiBAcGFyYW0geyhhbnkpID0+IGFueX0gZWxlbWVudFxuICogQHJldHVybnMgeyh2YWx1ZTogYW55IHwgbnVsbCkgPT4gYW55fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5nYXJibGVOdWxsYWJsZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IFVuZ2FyYmxlQW55KSB7XG4gICAgICAgIHJldHVybiBVbmdhcmJsZUFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbHVlKSA9PiAodmFsdWUgPT09IG51bGwgPyBudWxsIDogZWxlbWVudCh2YWx1ZSkpO1xufVxuXG4vKipcbiAqIENyZWF0ZVN0cnVjdCB0YWtlcyBhbiBvYmplY3QgbWFwcGluZyBmaWVsZCBuYW1lcyB0byBjcmVhdGlvbiBmdW5jdGlvbnNcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhIHN0cnVjdC5cbiAqIElmIGFuIHVuZ2FyYmxpbmcgbWFwIGlzIHByb3ZpZGVkLCB0aGUgcmV0dXJuZWQgZnVuY3Rpb25cbiAqIGFkZGl0aW9uYWxseSB1bmdhcmJsZXMgdGhlIGlucHV0IG9iamVjdC5cbiAqIEB0ZW1wbGF0ZSB7eyBbXzogc3RyaW5nXTogKChhbnkpID0+IGFueSkgfX0gVFxuICogQHRlbXBsYXRlIHt7IFtLZXkgaW4ga2V5b2YgVF0/OiBSZXR1cm5UeXBlPFRbS2V5XT4gfX0gVVxuICogQHBhcmFtIHtUfSBjcmVhdGVGaWVsZFxuICogQHBhcmFtIHt7IFtfOiBzdHJpbmddOiBzdHJpbmcgfSB8IG51bGx9IFt1bmdhcmJsZU1hcCA9IG51bGxdXG4gKiBAcmV0dXJucyB7KGFueSkgPT4gVX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENyZWF0ZVN0cnVjdChjcmVhdGVGaWVsZCwgdW5nYXJibGVNYXAgPSBudWxsKSB7XG4gICAgY29uc3QgY3JlYXRlRm4gPSAoc291cmNlKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBjcmVhdGVGaWVsZCkge1xuICAgICAgICAgICAgaWYgKG5hbWUgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgc291cmNlW25hbWVdID0gY3JlYXRlRmllbGRbbmFtZV0oc291cmNlW25hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG5cbiAgICBpZiAodW5nYXJibGVNYXAgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUZuO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoc291cmNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1bmdhcmJsZWQgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSBpbiB1bmdhcmJsZU1hcCkge1xuICAgICAgICAgICAgICAgICAgICB1bmdhcmJsZWRbdW5nYXJibGVNYXBbbmFtZV1dID0gc291cmNlW25hbWVdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVuZ2FyYmxlZFtuYW1lXSA9IHNvdXJjZVtuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlRm4odW5nYXJibGVkKTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbi8qKlxuICogR2FyYmxlU3RydWN0IHRha2VzIGFuIG9iamVjdCBtYXBwaW5nIGZpZWxkIG5hbWVzIHRvIGdhcmJsZWQgbmFtZXNcbiAqIGFuZCBnYXJibGUgZnVuY3Rpb25zIGFuZCByZXR1cm5zIGEgZ2FyYmxpbmcgZnVuY3Rpb24gZm9yIGEgc3RydWN0LlxuICogVGhlIGlucHV0IG9iamVjdCBpcyBuZXZlciBtb2RpZmllZC5cbiAqIEB0ZW1wbGF0ZSB7eyBbXzogc3RyaW5nXTogeyB0bzogc3RyaW5nLCBnYXJibGU6ICgoYW55KSA9PiBhbnkpIH0gfX0gVFxuICogQHBhcmFtIHtUfSBmaWVsZHNcbiAqIEByZXR1cm5zIHsoYW55KSA9PiBhbnl9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHYXJibGVTdHJ1Y3QoZmllbGRzKSB7XG4gICAgcmV0dXJuICh2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIGZpZWxkcykge1xuICAgICAgICAgICAgY29uc3QgZmllbGRJbmZvID0gZmllbGRzW25hbWVdO1xuICAgICAgICAgICAgcmVzdWx0W2ZpZWxkSW5mby50b10gPSBmaWVsZEluZm8uZ2FyYmxlKHZhbHVlW25hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59XG5cbi8qKlxuICogVW5nYXJibGVTdHJ1Y3QgdGFrZXMgYW4gb2JqZWN0IG1hcHBpbmcgZ2FyYmxlZCBuYW1lcyB0byBmaWVsZCBuYW1lc1xuICogYW5kIHVuZ2FyYmxlIGZ1bmN0aW9ucyBhbmQgcmV0dXJucyBhbiB1bmdhcmJsaW5nIGZ1bmN0aW9uIGZvciBhIHN0cnVjdC5cbiAqIFRoZSBpbnB1dCBvYmplY3QgaXMgbmV2ZXIgbW9kaWZpZWQuXG4gKiBAdGVtcGxhdGUge3sgW186IHN0cmluZ106IHsgZnJvbTogc3RyaW5nLCB1bmdhcmJsZTogKChhbnkpID0+IGFueSkgfSB9fSBUXG4gKiBAcGFyYW0ge1R9IGZpZWxkc1xuICogQHJldHVybnMgeyhhbnkpID0+IGFueX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuZ2FyYmxlU3RydWN0KGZpZWxkcykge1xuICAgIHJldHVybiAodmFsdWUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBmaWVsZHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IGZpZWxkc1tuYW1lXTtcbiAgICAgICAgICAgIHJlc3VsdFtuYW1lXSA9IGZpZWxkSW5mby51bmdhcmJsZSh2YWx1ZVtmaWVsZEluZm8uZnJvbV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xuXG5pbXBvcnQgXCIuL2NvbnRleHRtZW51LmpzXCI7XG5pbXBvcnQgXCIuL2RyYWcuanNcIjtcblxuLy8gUmUtZXhwb3J0IChpbnRlcm5hbCkgcHVibGljIEFQSVxuZXhwb3J0ICogYXMgQ2FsbCBmcm9tIFwiLi9jYWxsLmpzXCI7XG5leHBvcnQgKiBhcyBGbGFncyBmcm9tIFwiLi9mbGFncy5qc1wiO1xuZXhwb3J0ICogYXMgU3lzdGVtIGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuZXhwb3J0ICogYXMgVHlwZXMgZnJvbSBcIi4vdHlwZXMuanNcIjtcblxuaW1wb3J0IHtpbnZva2V9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcblxuLy8gUHJvdmlkZSBkdW1teSBldmVudCBsaXN0ZW5lci5cbmlmICghKFwiZGlzcGF0Y2hXYWlsc0V2ZW50XCIgaW4gd2luZG93Ll93YWlscykpIHtcbiAgICB3aW5kb3cuX3dhaWxzLmRpc3BhdGNoV2FpbHNFdmVudCA9IGZ1bmN0aW9uICgpIHt9O1xufVxuXG4vLyBOb3RpZnkgYmFja2VuZFxud2luZG93Ll93YWlscy5pbnZva2UgPSBpbnZva2U7XG5pbnZva2UoXCJ3YWlsczpydW50aW1lOnJlYWR5XCIpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQXlCQSxJQUFJLGNBQ0Y7QUFXSyxJQUFJLFNBQVMsQ0FBQyxPQUFPLE9BQU87QUFDakMsTUFBSSxLQUFLO0FBQ1QsTUFBSSxJQUFJO0FBQ1IsU0FBTyxLQUFLO0FBQ1YsVUFBTSxZQUFhLEtBQUssT0FBTyxJQUFJLEtBQU0sQ0FBQztBQUFBLEVBQzVDO0FBQ0EsU0FBTztBQUNUOzs7QUMvQkEsSUFBTSxhQUFhLE9BQU8sU0FBUyxTQUFTO0FBR3JDLFNBQVMsT0FBTyxLQUFLO0FBQ3hCLE1BQUcsT0FBTyxRQUFRO0FBQ2QsV0FBTyxPQUFPLE9BQU8sUUFBUSxZQUFZLEdBQUc7QUFBQSxFQUNoRCxPQUFPO0FBQ0gsV0FBTyxPQUFPLE9BQU8sZ0JBQWdCLFNBQVMsWUFBWSxHQUFHO0FBQUEsRUFDakU7QUFDSjtB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UUFBUSxLQUFLO0FBQzVEO0FBUU8sU0FBUyxpQkFBaUIsU0FBUztBQUN0QyxNQUFJLFlBQVksYUFBYTtBQUN6QixXQUFPO0FBQUEsRUFDWDtBQUVBLFNBQU8sQ0FBQyxVQUFXLFVBQVUsT0FBTyxPQUFPLFFBQVEsS0FBSztBQUM1RDtBQWFPLFNBQVMsYUFBYSxhQUFhLGNBQWMsTUFBTTtBQUMxRCxRQUFNLFdBQVcsQ0FBQyxXQUFXO0FBQ3pCLGVBQVcsUUFBUSxhQUFhO0FBQzVCLFVBQUksUUFBUSxRQUFRO0FBQ2hCLGVBQU8sSUFBSSxJQUFJLFlBQVksSUFBSSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQUEsTUFDakQ7QUFBQSxJQUNKO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFFQSxNQUFJLGdCQUFnQixNQUFNO0FBQ3RCLFdBQU87QUFBQSxFQUNYLE9BQU87QUFDSCxXQUFPLENBQUMsV0FBVztBQUNmLFlBQU0sWUFBWSxDQUFDO0FBQ25CLGlCQUFXLFFBQVEsUUFBUTtBQUN2QixZQUFJLFFBQVEsYUFBYTtBQUNyQixvQkFBVSxZQUFZLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSTtBQUFBLFFBQzlDLE9BQU87QUFDSCxvQkFBVSxJQUFJLElBQUksT0FBTyxJQUFJO0FBQUEsUUFDakM7QUFBQSxNQUNKO0FBQ0EsYUFBTyxTQUFTLFNBQVM7QUFBQSxJQUM3QjtBQUFBLEVBQ0o7QUFDSjtBQVVPLFNBQVMsYUFBYSxRQUFRO0FBQ2pDLFNBQU8sQ0FBQyxVQUFVO0FBQ2QsVUFBTSxTQUFTLENBQUM7QUFDaEIsZUFBVyxRQUFRLFFBQVE7QUFDdkIsWUFBTSxZQUFZLE9BQU8sSUFBSTtBQUM3QixhQUFPLFVBQVUsRUFBRSxJQUFJLFVBQVUsT0FBTyxNQUFNLElBQUksQ0FBQztBQUFBLElBQ3ZEO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDSjtBQVVPLFNBQVMsZUFBZSxRQUFRO0FBQ25DLFNBQU8sQ0FBQyxVQUFVO0FBQ2QsVUFBTSxTQUFTLENBQUM7QUFDaEIsZUFBVyxRQUFRLFFBQVE7QUFDdkIsWUFBTSxZQUFZLE9BQU8sSUFBSTtBQUM3QixhQUFPLElBQUksSUFBSSxVQUFVLFNBQVMsTUFBTSxVQUFVLElBQUksQ0FBQztBQUFBLElBQzNEO0FBQ0EsV0FBTztBQUFBLEVBQ1g7QUFDSjs7O0FDdFNBLE9BQU8sU0FBUyxPQUFPLFVBQVUsQ0FBQztBQWNsQyxJQUFJLEVBQUUsd0JBQXdCLE9BQU8sU0FBUztBQUMxQyxTQUFPLE9BQU8scUJBQXFCLFdBQVk7QUFBQSxFQUFDO0FBQ3BEO0FBR0EsT0FBTyxPQUFPLFNBQVM7QUFDdkIsT0FBTyxxQkFBcUI7IiwKICAibmFtZXMiOiBbImNhbGwiLCAia2V5Il0KfQo=
