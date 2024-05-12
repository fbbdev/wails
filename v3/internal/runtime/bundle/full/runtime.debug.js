var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// bundle/full/.build/github.com/wailsapp/wails/v3/pkg/runtime/index.js
var runtime_exports = {};
__export(runtime_exports, {
  Application: () => application_exports,
  Browser: () => browser_exports,
  Call: () => call_exports2,
  Clipboard: () => clipboard_exports,
  Dialogs: () => dialogs_exports,
  Events: () => events_exports,
  Flags: () => flags_exports2,
  Screens: () => screens_exports,
  System: () => system_exports2,
  Types: () => types_exports2,
  WML: () => wml_exports,
  Window: () => window_exports
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/application.js
var application_exports = {};
__export(application_exports, {
  Hide: () => Hide,
  Quit: () => Quit,
  Show: () => Show
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/nanoid.js
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var nanoid = (size = 21) => {
  let id = "";
  let i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/runtime.js
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/system.js
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/contextmenu.js
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/flags.js
function GetFlag(keyString) {
  try {
    return window._wails.flags[keyString];
  } catch (e) {
    throw new Error("Unable to retrieve flag '" + keyString + "': " + e);
  }
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/drag.js
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/call.js
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/types.js
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/index.js
window._wails = window._wails || {};
if (!("dispatchWailsEvent" in window._wails)) {
  window._wails.dispatchWailsEvent = function() {
  };
}
window._wails.invoke = invoke;
invoke("wails:runtime:ready");

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/application.js
function Hide() {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(727471602)
  );
  return $resultPromise;
}
function Quit() {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1244926953)
  );
  return $resultPromise;
}
function Show() {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2270674839)
  );
  return $resultPromise;
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/browser.js
var browser_exports = {};
__export(browser_exports, {
  OpenURL: () => OpenURL
});
function OpenURL(url) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(4141408185, url)
  );
  return $resultPromise;
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/call.js
var call_exports2 = {};
__export(call_exports2, {
  ByID: () => ByID,
  ByName: () => ByName,
  Call: () => Call,
  Plugin: () => Plugin
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/clipboard.js
var clipboard_exports = {};
__export(clipboard_exports, {
  SetText: () => SetText,
  Text: () => Text
});
function SetText(text) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(940573749, text)
  );
  return $resultPromise;
}
function Text() {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(249238621)
  );
  return $resultPromise;
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/dialogs.js
var dialogs_exports = {};
__export(dialogs_exports, {
  Error: () => Error2,
  Info: () => Info,
  OpenFile: () => OpenFile,
  Question: () => Question,
  SaveFile: () => SaveFile,
  Warning: () => Warning
});
function Error2(options) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2508862895, options)
  );
  return $resultPromise;
}
function Info(options) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(40831083, options)
  );
  return $resultPromise;
}
function OpenFile(options) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2958571101, options)
  );
  return $resultPromise;
}
function Question(options) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1378382395, options)
  );
  return $resultPromise;
}
function SaveFile(options) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1441773644, options)
  );
  return $resultPromise;
}
function Warning(options) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(938454105, options)
  );
  return $resultPromise;
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/events.js
var events_exports = {};
__export(events_exports, {
  Emit: () => Emit,
  Off: () => Off,
  OffAll: () => OffAll,
  On: () => On,
  OnMultiple: () => OnMultiple,
  Once: () => Once,
  Types: () => Types,
  WailsEvent: () => WailsEvent
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/event_types.js
var EventTypes = {
  Windows: {
    SystemThemeChanged: "windows:SystemThemeChanged",
    APMPowerStatusChange: "windows:APMPowerStatusChange",
    APMSuspend: "windows:APMSuspend",
    APMResumeAutomatic: "windows:APMResumeAutomatic",
    APMResumeSuspend: "windows:APMResumeSuspend",
    APMPowerSettingChange: "windows:APMPowerSettingChange",
    ApplicationStarted: "windows:ApplicationStarted",
    WebViewNavigationCompleted: "windows:WebViewNavigationCompleted",
    WindowInactive: "windows:WindowInactive",
    WindowActive: "windows:WindowActive",
    WindowClickActive: "windows:WindowClickActive",
    WindowMaximise: "windows:WindowMaximise",
    WindowUnMaximise: "windows:WindowUnMaximise",
    WindowFullscreen: "windows:WindowFullscreen",
    WindowUnFullscreen: "windows:WindowUnFullscreen",
    WindowRestore: "windows:WindowRestore",
    WindowMinimise: "windows:WindowMinimise",
    WindowUnMinimise: "windows:WindowUnMinimise",
    WindowClose: "windows:WindowClose",
    WindowSetFocus: "windows:WindowSetFocus",
    WindowKillFocus: "windows:WindowKillFocus",
    WindowDragDrop: "windows:WindowDragDrop",
    WindowDragEnter: "windows:WindowDragEnter",
    WindowDragLeave: "windows:WindowDragLeave",
    WindowDragOver: "windows:WindowDragOver"
  },
  Mac: {
    ApplicationDidBecomeActive: "mac:ApplicationDidBecomeActive",
    ApplicationDidChangeBackingProperties: "mac:ApplicationDidChangeBackingProperties",
    ApplicationDidChangeEffectiveAppearance: "mac:ApplicationDidChangeEffectiveAppearance",
    ApplicationDidChangeIcon: "mac:ApplicationDidChangeIcon",
    ApplicationDidChangeOcclusionState: "mac:ApplicationDidChangeOcclusionState",
    ApplicationDidChangeScreenParameters: "mac:ApplicationDidChangeScreenParameters",
    ApplicationDidChangeStatusBarFrame: "mac:ApplicationDidChangeStatusBarFrame",
    ApplicationDidChangeStatusBarOrientation: "mac:ApplicationDidChangeStatusBarOrientation",
    ApplicationDidFinishLaunching: "mac:ApplicationDidFinishLaunching",
    ApplicationDidHide: "mac:ApplicationDidHide",
    ApplicationDidResignActiveNotification: "mac:ApplicationDidResignActiveNotification",
    ApplicationDidUnhide: "mac:ApplicationDidUnhide",
    ApplicationDidUpdate: "mac:ApplicationDidUpdate",
    ApplicationWillBecomeActive: "mac:ApplicationWillBecomeActive",
    ApplicationWillFinishLaunching: "mac:ApplicationWillFinishLaunching",
    ApplicationWillHide: "mac:ApplicationWillHide",
    ApplicationWillResignActive: "mac:ApplicationWillResignActive",
    ApplicationWillTerminate: "mac:ApplicationWillTerminate",
    ApplicationWillUnhide: "mac:ApplicationWillUnhide",
    ApplicationWillUpdate: "mac:ApplicationWillUpdate",
    ApplicationDidChangeTheme: "mac:ApplicationDidChangeTheme!",
    ApplicationShouldHandleReopen: "mac:ApplicationShouldHandleReopen!",
    WindowDidBecomeKey: "mac:WindowDidBecomeKey",
    WindowDidBecomeMain: "mac:WindowDidBecomeMain",
    WindowDidBeginSheet: "mac:WindowDidBeginSheet",
    WindowDidChangeAlpha: "mac:WindowDidChangeAlpha",
    WindowDidChangeBackingLocation: "mac:WindowDidChangeBackingLocation",
    WindowDidChangeBackingProperties: "mac:WindowDidChangeBackingProperties",
    WindowDidChangeCollectionBehavior: "mac:WindowDidChangeCollectionBehavior",
    WindowDidChangeEffectiveAppearance: "mac:WindowDidChangeEffectiveAppearance",
    WindowDidChangeOcclusionState: "mac:WindowDidChangeOcclusionState",
    WindowDidChangeOrderingMode: "mac:WindowDidChangeOrderingMode",
    WindowDidChangeScreen: "mac:WindowDidChangeScreen",
    WindowDidChangeScreenParameters: "mac:WindowDidChangeScreenParameters",
    WindowDidChangeScreenProfile: "mac:WindowDidChangeScreenProfile",
    WindowDidChangeScreenSpace: "mac:WindowDidChangeScreenSpace",
    WindowDidChangeScreenSpaceProperties: "mac:WindowDidChangeScreenSpaceProperties",
    WindowDidChangeSharingType: "mac:WindowDidChangeSharingType",
    WindowDidChangeSpace: "mac:WindowDidChangeSpace",
    WindowDidChangeSpaceOrderingMode: "mac:WindowDidChangeSpaceOrderingMode",
    WindowDidChangeTitle: "mac:WindowDidChangeTitle",
    WindowDidChangeToolbar: "mac:WindowDidChangeToolbar",
    WindowDidChangeVisibility: "mac:WindowDidChangeVisibility",
    WindowDidDeminiaturize: "mac:WindowDidDeminiaturize",
    WindowDidEndSheet: "mac:WindowDidEndSheet",
    WindowDidEnterFullScreen: "mac:WindowDidEnterFullScreen",
    WindowDidEnterVersionBrowser: "mac:WindowDidEnterVersionBrowser",
    WindowDidExitFullScreen: "mac:WindowDidExitFullScreen",
    WindowDidExitVersionBrowser: "mac:WindowDidExitVersionBrowser",
    WindowDidExpose: "mac:WindowDidExpose",
    WindowDidFocus: "mac:WindowDidFocus",
    WindowDidMiniaturize: "mac:WindowDidMiniaturize",
    WindowDidMove: "mac:WindowDidMove",
    WindowDidOrderOffScreen: "mac:WindowDidOrderOffScreen",
    WindowDidOrderOnScreen: "mac:WindowDidOrderOnScreen",
    WindowDidResignKey: "mac:WindowDidResignKey",
    WindowDidResignMain: "mac:WindowDidResignMain",
    WindowDidResize: "mac:WindowDidResize",
    WindowDidUpdate: "mac:WindowDidUpdate",
    WindowDidUpdateAlpha: "mac:WindowDidUpdateAlpha",
    WindowDidUpdateCollectionBehavior: "mac:WindowDidUpdateCollectionBehavior",
    WindowDidUpdateCollectionProperties: "mac:WindowDidUpdateCollectionProperties",
    WindowDidUpdateShadow: "mac:WindowDidUpdateShadow",
    WindowDidUpdateTitle: "mac:WindowDidUpdateTitle",
    WindowDidUpdateToolbar: "mac:WindowDidUpdateToolbar",
    WindowDidUpdateVisibility: "mac:WindowDidUpdateVisibility",
    WindowShouldClose: "mac:WindowShouldClose!",
    WindowWillBecomeKey: "mac:WindowWillBecomeKey",
    WindowWillBecomeMain: "mac:WindowWillBecomeMain",
    WindowWillBeginSheet: "mac:WindowWillBeginSheet",
    WindowWillChangeOrderingMode: "mac:WindowWillChangeOrderingMode",
    WindowWillClose: "mac:WindowWillClose",
    WindowWillDeminiaturize: "mac:WindowWillDeminiaturize",
    WindowWillEnterFullScreen: "mac:WindowWillEnterFullScreen",
    WindowWillEnterVersionBrowser: "mac:WindowWillEnterVersionBrowser",
    WindowWillExitFullScreen: "mac:WindowWillExitFullScreen",
    WindowWillExitVersionBrowser: "mac:WindowWillExitVersionBrowser",
    WindowWillFocus: "mac:WindowWillFocus",
    WindowWillMiniaturize: "mac:WindowWillMiniaturize",
    WindowWillMove: "mac:WindowWillMove",
    WindowWillOrderOffScreen: "mac:WindowWillOrderOffScreen",
    WindowWillOrderOnScreen: "mac:WindowWillOrderOnScreen",
    WindowWillResignMain: "mac:WindowWillResignMain",
    WindowWillResize: "mac:WindowWillResize",
    WindowWillUnfocus: "mac:WindowWillUnfocus",
    WindowWillUpdate: "mac:WindowWillUpdate",
    WindowWillUpdateAlpha: "mac:WindowWillUpdateAlpha",
    WindowWillUpdateCollectionBehavior: "mac:WindowWillUpdateCollectionBehavior",
    WindowWillUpdateCollectionProperties: "mac:WindowWillUpdateCollectionProperties",
    WindowWillUpdateShadow: "mac:WindowWillUpdateShadow",
    WindowWillUpdateTitle: "mac:WindowWillUpdateTitle",
    WindowWillUpdateToolbar: "mac:WindowWillUpdateToolbar",
    WindowWillUpdateVisibility: "mac:WindowWillUpdateVisibility",
    WindowWillUseStandardFrame: "mac:WindowWillUseStandardFrame",
    MenuWillOpen: "mac:MenuWillOpen",
    MenuDidOpen: "mac:MenuDidOpen",
    MenuDidClose: "mac:MenuDidClose",
    MenuWillSendAction: "mac:MenuWillSendAction",
    MenuDidSendAction: "mac:MenuDidSendAction",
    MenuWillHighlightItem: "mac:MenuWillHighlightItem",
    MenuDidHighlightItem: "mac:MenuDidHighlightItem",
    MenuWillDisplayItem: "mac:MenuWillDisplayItem",
    MenuDidDisplayItem: "mac:MenuDidDisplayItem",
    MenuWillAddItem: "mac:MenuWillAddItem",
    MenuDidAddItem: "mac:MenuDidAddItem",
    MenuWillRemoveItem: "mac:MenuWillRemoveItem",
    MenuDidRemoveItem: "mac:MenuDidRemoveItem",
    MenuWillBeginTracking: "mac:MenuWillBeginTracking",
    MenuDidBeginTracking: "mac:MenuDidBeginTracking",
    MenuWillEndTracking: "mac:MenuWillEndTracking",
    MenuDidEndTracking: "mac:MenuDidEndTracking",
    MenuWillUpdate: "mac:MenuWillUpdate",
    MenuDidUpdate: "mac:MenuDidUpdate",
    MenuWillPopUp: "mac:MenuWillPopUp",
    MenuDidPopUp: "mac:MenuDidPopUp",
    MenuWillSendActionToItem: "mac:MenuWillSendActionToItem",
    MenuDidSendActionToItem: "mac:MenuDidSendActionToItem",
    WebViewDidStartProvisionalNavigation: "mac:WebViewDidStartProvisionalNavigation",
    WebViewDidReceiveServerRedirectForProvisionalNavigation: "mac:WebViewDidReceiveServerRedirectForProvisionalNavigation",
    WebViewDidFinishNavigation: "mac:WebViewDidFinishNavigation",
    WebViewDidCommitNavigation: "mac:WebViewDidCommitNavigation",
    WindowFileDraggingEntered: "mac:WindowFileDraggingEntered",
    WindowFileDraggingPerformed: "mac:WindowFileDraggingPerformed",
    WindowFileDraggingExited: "mac:WindowFileDraggingExited"
  },
  Linux: {
    SystemThemeChanged: "linux:SystemThemeChanged",
    WindowLoadChanged: "linux:WindowLoadChanged",
    WindowDeleteEvent: "linux:WindowDeleteEvent",
    WindowFocusIn: "linux:WindowFocusIn",
    WindowFocusOut: "linux:WindowFocusOut",
    ApplicationStartup: "linux:ApplicationStartup"
  },
  Common: {
    ApplicationStarted: "common:ApplicationStarted",
    WindowMaximise: "common:WindowMaximise",
    WindowUnMaximise: "common:WindowUnMaximise",
    WindowFullscreen: "common:WindowFullscreen",
    WindowUnFullscreen: "common:WindowUnFullscreen",
    WindowRestore: "common:WindowRestore",
    WindowMinimise: "common:WindowMinimise",
    WindowUnMinimise: "common:WindowUnMinimise",
    WindowClosing: "common:WindowClosing",
    WindowZoom: "common:WindowZoom",
    WindowZoomIn: "common:WindowZoomIn",
    WindowZoomOut: "common:WindowZoomOut",
    WindowZoomReset: "common:WindowZoomReset",
    WindowFocus: "common:WindowFocus",
    WindowLostFocus: "common:WindowLostFocus",
    WindowShow: "common:WindowShow",
    WindowHide: "common:WindowHide",
    WindowDPIChanged: "common:WindowDPIChanged",
    WindowFilesDropped: "common:WindowFilesDropped",
    WindowRuntimeReady: "common:WindowRuntimeReady",
    ThemeChanged: "common:ThemeChanged"
  }
};

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/listener.js
var Types = EventTypes;
window._wails = window._wails || {};
window._wails.dispatchWailsEvent = dispatchWailsEvent;
var eventListeners = /* @__PURE__ */ new Map();
var Listener = class {
  constructor(eventName, callback, maxCallbacks) {
    this.eventName = eventName;
    this.maxCallbacks = maxCallbacks || -1;
    this.Callback = (data) => {
      callback(data);
      if (this.maxCallbacks === -1) return false;
      this.maxCallbacks -= 1;
      return this.maxCallbacks === 0;
    };
  }
};
var WailsEvent = class {
  /**
   * Constructs a new wails event instance.
   * @param {string} name - The name of the event.
   * @param {*} [data] - Arbitrary data associated to the event.
   */
  constructor(name, data = null) {
    this.name = name;
    this.data = data;
  }
};
function dispatchWailsEvent(event) {
  const wevent = (
    /** @type {any} */
    new WailsEvent(event.name, event.data)
  );
  Object.assign(wevent, event);
  event = wevent;
  let listeners = eventListeners.get(event.name);
  if (listeners) {
    let toRemove = listeners.filter((listener) => {
      let remove = listener.Callback(event);
      if (remove) return true;
    });
    if (toRemove.length > 0) {
      listeners = listeners.filter((l) => !toRemove.includes(l));
      if (listeners.length === 0) eventListeners.delete(event.name);
      else eventListeners.set(event.name, listeners);
    }
  }
}
function OnMultiple(eventName, callback, maxCallbacks) {
  let listeners = eventListeners.get(eventName) || [];
  const thisListener = new Listener(eventName, callback, maxCallbacks);
  listeners.push(thisListener);
  eventListeners.set(eventName, listeners);
  return () => listenerOff(thisListener);
}
function On(eventName, callback) {
  return OnMultiple(eventName, callback, -1);
}
function Once(eventName, callback) {
  return OnMultiple(eventName, callback, 1);
}
function listenerOff(listener) {
  const eventName = listener.eventName;
  let listeners = eventListeners.get(eventName).filter((l) => l !== listener);
  if (listeners.length === 0) eventListeners.delete(eventName);
  else eventListeners.set(eventName, listeners);
}
function Off(eventName, ...additionalEventNames) {
  let eventsToRemove = [eventName, ...additionalEventNames];
  eventsToRemove.forEach((eventName2) => eventListeners.delete(eventName2));
}
function OffAll() {
  eventListeners.clear();
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/events.js
function Emit(event) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2480682392, event)
  );
  return $resultPromise;
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/flags.js
var flags_exports2 = {};
__export(flags_exports2, {
  GetFlag: () => GetFlag
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/screens.js
var screens_exports = {};
__export(screens_exports, {
  GetAll: () => GetAll,
  GetCurrent: () => GetCurrent,
  GetPrimary: () => GetPrimary
});
function GetAll() {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2367705532)
  );
  let $typingPromise = (
    /** @type {any} */
    $resultPromise.then(($result) => {
      return $$createType0($result);
    })
  );
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return $typingPromise;
}
function GetCurrent() {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(316757218)
  );
  return $resultPromise;
}
function GetPrimary() {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3749562017)
  );
  return $resultPromise;
}
var $$createType0 = types_exports.CreateArray(types_exports.CreateAny);

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/system.js
var system_exports2 = {};
__export(system_exports2, {
  Capabilities: () => Capabilities,
  Environment: () => Environment,
  IsAMD64: () => IsAMD64,
  IsARM: () => IsARM,
  IsARM64: () => IsARM64,
  IsDarkMode: () => IsDarkMode,
  IsDebug: () => IsDebug,
  IsLinux: () => IsLinux,
  IsMac: () => IsMac,
  IsWindows: () => IsWindows
});
function Environment() {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3752267968)
  );
  let $typingPromise = (
    /** @type {any} */
    $resultPromise.then(($result) => {
      return $$createType1($result);
    })
  );
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return $typingPromise;
}
function IsDarkMode() {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2291282836)
  );
  return $resultPromise;
}
var $$createType02 = types_exports.CreateMap(types_exports.CreateAny, types_exports.CreateAny);
var $$createType1 = types_exports.CreateStruct({
  "PlatformInfo": $$createType02
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/types.js
var types_exports2 = {};
__export(types_exports2, {
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/window.js
var window_exports = {};
__export(window_exports, {
  AbsolutePosition: () => AbsolutePosition,
  Center: () => Center,
  Close: () => Close,
  DisableSizeConstraints: () => DisableSizeConstraints,
  EnableSizeConstraints: () => EnableSizeConstraints,
  Focus: () => Focus,
  ForceReload: () => ForceReload,
  Fullscreen: () => Fullscreen,
  Get: () => Get,
  GetBorderSizes: () => GetBorderSizes,
  GetScreen: () => GetScreen,
  GetZoom: () => GetZoom,
  Height: () => Height,
  Hide: () => Hide2,
  IsFocused: () => IsFocused,
  IsFullscreen: () => IsFullscreen,
  IsMaximised: () => IsMaximised,
  IsMinimised: () => IsMinimised,
  Maximise: () => Maximise,
  Minimise: () => Minimise,
  Name: () => Name,
  OpenDevTools: () => OpenDevTools,
  RelativePosition: () => RelativePosition,
  Reload: () => Reload,
  Resizable: () => Resizable,
  Restore: () => Restore,
  SetAbsolutePosition: () => SetAbsolutePosition,
  SetAlwaysOnTop: () => SetAlwaysOnTop,
  SetBackgroundColour: () => SetBackgroundColour,
  SetFrameless: () => SetFrameless,
  SetFullscreenButtonEnabled: () => SetFullscreenButtonEnabled,
  SetMaxSize: () => SetMaxSize,
  SetMinSize: () => SetMinSize,
  SetRelativePosition: () => SetRelativePosition,
  SetResizable: () => SetResizable,
  SetSize: () => SetSize,
  SetTitle: () => SetTitle,
  SetZoom: () => SetZoom,
  Show: () => Show2,
  Size: () => Size,
  ToggleFullscreen: () => ToggleFullscreen,
  ToggleMaximise: () => ToggleMaximise,
  UnFullscreen: () => UnFullscreen,
  UnMaximise: () => UnMaximise,
  UnMinimise: () => UnMinimise,
  Width: () => Width,
  Zoom: () => Zoom,
  ZoomIn: () => ZoomIn,
  ZoomOut: () => ZoomOut,
  ZoomReset: () => ZoomReset
});
var thisWindow = null;
function Get(name = null) {
  const names = [], wnd = {};
  if (name != null && name !== "") {
    names.push(name);
  } else if (thisWindow !== null) {
    return thisWindow;
  } else {
    thisWindow = wnd;
  }
  for (const key in window_exports) {
    if (key !== "Get" && key !== "RGBA") {
      const method = window_exports[key];
      wnd[key] = (...args) => method(...args, ...names);
    }
  }
  return (
    /** @type {any} */
    Object.freeze(wnd)
  );
}
function AbsolutePosition(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(222553826, targetWindow)
  );
  return $resultPromise;
}
function Center(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(4054430369, targetWindow)
  );
  return $resultPromise;
}
function Close(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1436581100, targetWindow)
  );
  return $resultPromise;
}
function DisableSizeConstraints(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2510539891, targetWindow)
  );
  return $resultPromise;
}
function EnableSizeConstraints(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3150968194, targetWindow)
  );
  return $resultPromise;
}
function Focus(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3274789872, targetWindow)
  );
  return $resultPromise;
}
function ForceReload(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(147523250, targetWindow)
  );
  return $resultPromise;
}
function Fullscreen(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3924564473, targetWindow)
  );
  return $resultPromise;
}
function GetBorderSizes(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2290953088, targetWindow)
  );
  return $resultPromise;
}
function GetScreen(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3744597424, targetWindow)
  );
  return $resultPromise;
}
function GetZoom(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2677359063, targetWindow)
  );
  return $resultPromise;
}
function Height(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(587157603, targetWindow)
  );
  return $resultPromise;
}
function Hide2(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3874093464, targetWindow)
  );
  return $resultPromise;
}
function IsFocused(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(526819721, targetWindow)
  );
  return $resultPromise;
}
function IsFullscreen(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1192916705, targetWindow)
  );
  return $resultPromise;
}
function IsMaximised(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3036327809, targetWindow)
  );
  return $resultPromise;
}
function IsMinimised(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(4012281835, targetWindow)
  );
  return $resultPromise;
}
function Maximise(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3759007799, targetWindow)
  );
  return $resultPromise;
}
function Minimise(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3548520501, targetWindow)
  );
  return $resultPromise;
}
function Name(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(4207657051, targetWindow)
  );
  return $resultPromise;
}
function OpenDevTools(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(483671974, targetWindow)
  );
  return $resultPromise;
}
function RelativePosition(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3709545923, targetWindow)
  );
  return $resultPromise;
}
function Reload(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2833731485, targetWindow)
  );
  return $resultPromise;
}
function Resizable(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2450946277, targetWindow)
  );
  return $resultPromise;
}
function Restore(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1151315034, targetWindow)
  );
  return $resultPromise;
}
function SetAbsolutePosition(x, y, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3991491842, x, y, targetWindow)
  );
  return $resultPromise;
}
function SetAlwaysOnTop(aot, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3349346155, aot, targetWindow)
  );
  return $resultPromise;
}
function SetBackgroundColour(colour, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2179820576, colour, targetWindow)
  );
  return $resultPromise;
}
function SetFrameless(frameless, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(4109365080, frameless, targetWindow)
  );
  return $resultPromise;
}
function SetFullscreenButtonEnabled(enabled, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3863568982, enabled, targetWindow)
  );
  return $resultPromise;
}
function SetMaxSize(width, height, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3460078551, width, height, targetWindow)
  );
  return $resultPromise;
}
function SetMinSize(width, height, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2677919085, width, height, targetWindow)
  );
  return $resultPromise;
}
function SetRelativePosition(x, y, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(741606115, x, y, targetWindow)
  );
  return $resultPromise;
}
function SetResizable(resizable2, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2835305541, resizable2, targetWindow)
  );
  return $resultPromise;
}
function SetSize(width, height, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3379788393, width, height, targetWindow)
  );
  return $resultPromise;
}
function SetTitle(title, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(170953598, title, targetWindow)
  );
  return $resultPromise;
}
function SetZoom(magnification, ...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2794500051, magnification, targetWindow)
  );
  return $resultPromise;
}
function Show2(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2931823121, targetWindow)
  );
  return $resultPromise;
}
function Size(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1141111433, targetWindow)
  );
  return $resultPromise;
}
function ToggleFullscreen(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2212763149, targetWindow)
  );
  return $resultPromise;
}
function ToggleMaximise(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3144194443, targetWindow)
  );
  return $resultPromise;
}
function UnFullscreen(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1587002506, targetWindow)
  );
  return $resultPromise;
}
function UnMaximise(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3889999476, targetWindow)
  );
  return $resultPromise;
}
function UnMinimise(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(3571636198, targetWindow)
  );
  return $resultPromise;
}
function Width(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1655239988, targetWindow)
  );
  return $resultPromise;
}
function Zoom(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(555719923, targetWindow)
  );
  return $resultPromise;
}
function ZoomIn(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1310434272, targetWindow)
  );
  return $resultPromise;
}
function ZoomOut(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(1755702821, targetWindow)
  );
  return $resultPromise;
}
function ZoomReset(...targetWindow) {
  let $resultPromise = (
    /** @type {any} */
    call_exports.ByID(2781467154, targetWindow)
  );
  return $resultPromise;
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/wml.js
var wml_exports = {};
__export(wml_exports, {
  Enable: () => Enable,
  Reload: () => Reload2
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/utils.js
function canAbortListeners() {
  if (!EventTarget || !AbortSignal || !AbortController)
    return false;
  let result = true;
  const target = new EventTarget();
  const controller2 = new AbortController();
  target.addEventListener("test", () => {
    result = false;
  }, { signal: controller2.signal });
  controller2.abort();
  target.dispatchEvent(new CustomEvent("test"));
  return result;
}
var isReady = false;
document.addEventListener("DOMContentLoaded", () => isReady = true);
function whenReady(callback) {
  if (isReady || document.readyState === "complete") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/wml.js
function sendEvent(eventName, data = null) {
  Emit(new WailsEvent(eventName, data));
}
function callWindowMethod(windowName, methodName) {
  const targetWindow = Get(windowName);
  const method = targetWindow[methodName];
  if (typeof method !== "function") {
    console.error(`Window method '${methodName}' not found`);
    return;
  }
  try {
    method.call(targetWindow);
  } catch (e) {
    console.error(`Error calling window method '${methodName}': `, e);
  }
}
function onWMLTriggered(ev) {
  const element = ev.currentTarget;
  function runEffect(choice = "Yes") {
    if (choice !== "Yes")
      return;
    const eventType = element.getAttribute("wml-event");
    const targetWindow = element.getAttribute("wml-target-window") || "";
    const windowMethod = element.getAttribute("wml-window");
    const url = element.getAttribute("wml-openurl");
    if (eventType !== null)
      sendEvent(eventType);
    if (windowMethod !== null)
      callWindowMethod(targetWindow, windowMethod);
    if (url !== null)
      void OpenURL(url);
  }
  const confirm = element.getAttribute("wml-confirm");
  if (confirm) {
    Question({
      Title: "Confirm",
      Message: confirm,
      Detached: false,
      Buttons: [
        { Label: "Yes" },
        { Label: "No", IsDefault: true }
      ]
    }).then(runEffect);
  } else {
    runEffect();
  }
}
var controller = Symbol();
var AbortControllerRegistry = class {
  constructor() {
    this[controller] = new AbortController();
  }
  /**
   * Returns an options object for addEventListener that ties the listener
   * to the AbortSignal from the current AbortController.
   *
   * @param {HTMLElement} element An HTML element
   * @param {string[]} triggers The list of active WML trigger events for the specified elements
   * @returns {AddEventListenerOptions}
   */
  set(element, triggers) {
    return { signal: this[controller].signal };
  }
  /**
   * Removes all registered event listeners.
   *
   * @returns {void}
   */
  reset() {
    this[controller].abort();
    this[controller] = new AbortController();
  }
};
var triggerMap = Symbol();
var elementCount = Symbol();
var WeakMapRegistry = class {
  constructor() {
    this[triggerMap] = /* @__PURE__ */ new WeakMap();
    this[elementCount] = 0;
  }
  /**
   * Sets the active triggers for the specified element.
   *
   * @param {HTMLElement} element An HTML element
   * @param {string[]} triggers The list of active WML trigger events for the specified element
   * @returns {AddEventListenerOptions}
   */
  set(element, triggers) {
    this[elementCount] += !this[triggerMap].has(element);
    this[triggerMap].set(element, triggers);
    return {};
  }
  /**
   * Removes all registered event listeners.
   *
   * @returns {void}
   */
  reset() {
    if (this[elementCount] <= 0)
      return;
    for (const element of document.body.querySelectorAll("*")) {
      if (this[elementCount] <= 0)
        break;
      const triggers = this[triggerMap].get(element);
      this[elementCount] -= typeof triggers !== "undefined";
      for (const trigger of triggers || [])
        element.removeEventListener(trigger, onWMLTriggered);
    }
    this[triggerMap] = /* @__PURE__ */ new WeakMap();
    this[elementCount] = 0;
  }
};
var triggerRegistry = canAbortListeners() ? new AbortControllerRegistry() : new WeakMapRegistry();
function addWMLListeners(element) {
  const triggerRegExp = /\S+/g;
  const triggerAttr = element.getAttribute("wml-trigger") || "click";
  const triggers = [];
  let match;
  while ((match = triggerRegExp.exec(triggerAttr)) !== null)
    triggers.push(match[0]);
  const options = triggerRegistry.set(element, triggers);
  for (const trigger of triggers)
    element.addEventListener(trigger, onWMLTriggered, options);
}
function Enable() {
  whenReady(Reload2);
}
function Reload2() {
  triggerRegistry.reset();
  document.body.querySelectorAll("[wml-event], [wml-window], [wml-openurl]").forEach(addWMLListeners);
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/bundle/full/index.js
window.wails = runtime_exports;
wml_exports.Enable();
export {
  application_exports as Application,
  browser_exports as Browser,
  call_exports2 as Call,
  clipboard_exports as Clipboard,
  dialogs_exports as Dialogs,
  events_exports as Events,
  flags_exports2 as Flags,
  screens_exports as Screens,
  system_exports2 as System,
  types_exports2 as Types,
  wml_exports as WML,
  window_exports as Window
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvcGtnL3J1bnRpbWUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvYXBwbGljYXRpb24uanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL25hbm9pZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvcnVudGltZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvc3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9jb250ZXh0bWVudS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvZmxhZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2RyYWcuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NhbGwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL3R5cGVzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9pbmRleC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9icm93c2VyLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2NhbGwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvY2xpcGJvYXJkLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2RpYWxvZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvZXZlbnRzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2V2ZW50X3R5cGVzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2xpc3RlbmVyLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2ZsYWdzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL3NjcmVlbnMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvc3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL3R5cGVzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL3dpbmRvdy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS93bWwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvdXRpbHMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9idW5kbGUvZnVsbC9pbmRleC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuZXhwb3J0IHtcbiAgICBBcHBsaWNhdGlvbixcbiAgICBCcm93c2VyLFxuICAgIENhbGwsXG4gICAgQ2xpcGJvYXJkLFxuICAgIERpYWxvZ3MsXG4gICAgRXZlbnRzLFxuICAgIEZsYWdzLFxuICAgIFNjcmVlbnMsXG4gICAgU3lzdGVtLFxuICAgIFR5cGVzLFxuICAgIFdpbmRvdyxcbiAgICBXTUxcbn0gZnJvbSBcIi4uLy4uL2ludGVybmFsL3J1bnRpbWUvYXBpL2luZGV4LmpzXCI7XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHtDYWxsIGFzICRDYWxsLCBUeXBlcyBhcyAkVHlwZXN9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbi8qKlxuICogSGlkZSBtYWtlcyBhbGwgYXBwbGljYXRpb24gd2luZG93cyBpbnZpc2libGUuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEhpZGUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoNzI3NDcxNjAyKSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFF1aXQgcXVpdHMgdGhlIGFwcGxpY2F0aW9uLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWl0KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDEyNDQ5MjY5NTMpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogU2hvdyBtYWtlcyBhbGwgYXBwbGljYXRpb24gd2luZG93cyB2aXNpYmxlLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTaG93KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDIyNzA2NzQ4MzkpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG4iLCAiLyoqXG4gKiBUaGlzIGNvZGUgZnJhZ21lbnQgaXMgdGFrZW4gZnJvbSBuYW5vaWQgKGh0dHBzOi8vZ2l0aHViLmNvbS9haS9uYW5vaWQpOlxuICpcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICpcbiAqIENvcHlyaWdodCAyMDE3IEFuZHJleSBTaXRuaWsgPGFuZHJleUBzaXRuaWsucnU+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZlxuICogdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpblxuICogdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0b1xuICogdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2ZcbiAqIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcbiAqIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTU1xuICogRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SXG4gKiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVJcbiAqIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOXG4gKiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmxldCB1cmxBbHBoYWJldCA9XG4gICd1c2VhbmRvbS0yNlQxOTgzNDBQWDc1cHhKQUNLVkVSWU1JTkRCVVNIV09MRl9HUVpiZmdoamtscXZ3eXpyaWN0J1xuZXhwb3J0IGxldCBjdXN0b21BbHBoYWJldCA9IChhbHBoYWJldCwgZGVmYXVsdFNpemUgPSAyMSkgPT4ge1xuICByZXR1cm4gKHNpemUgPSBkZWZhdWx0U2l6ZSkgPT4ge1xuICAgIGxldCBpZCA9ICcnXG4gICAgbGV0IGkgPSBzaXplXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWQgKz0gYWxwaGFiZXRbKE1hdGgucmFuZG9tKCkgKiBhbHBoYWJldC5sZW5ndGgpIHwgMF1cbiAgICB9XG4gICAgcmV0dXJuIGlkXG4gIH1cbn1cbmV4cG9ydCBsZXQgbmFub2lkID0gKHNpemUgPSAyMSkgPT4ge1xuICBsZXQgaWQgPSAnJ1xuICBsZXQgaSA9IHNpemVcbiAgd2hpbGUgKGktLSkge1xuICAgIGlkICs9IHVybEFscGhhYmV0WyhNYXRoLnJhbmRvbSgpICogNjQpIHwgMF1cbiAgfVxuICByZXR1cm4gaWRcbn1cbiIsICIvKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuaW1wb3J0IHtuYW5vaWR9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xuXG5jb25zdCBydW50aW1lVVJMID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIFwiL3dhaWxzL3J1bnRpbWVcIjtcblxuLyoqIFNlbmRzIG1lc3NhZ2VzIHRvIHRoZSBiYWNrZW5kICovXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlKG1zZykge1xuICAgIGlmKHdpbmRvdy5jaHJvbWUpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jaHJvbWUud2Vidmlldy5wb3N0TWVzc2FnZShtc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cud2Via2l0Lm1lc3NhZ2VIYW5kbGVycy5leHRlcm5hbC5wb3N0TWVzc2FnZShtc2cpO1xuICAgIH1cbn1cblxuLyoqIE9iamVjdCBOYW1lcyAqL1xuZXhwb3J0IGNvbnN0IG9iamVjdE5hbWVzID0ge1xuICAgIENhbGw6IDAsXG4gICAgQ29udGV4dE1lbnU6IDQsXG4gICAgQ2FuY2VsQ2FsbDogMTAsXG59XG5leHBvcnQgbGV0IGNsaWVudElkID0gbmFub2lkKCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJ1bnRpbWUgY2FsbGVyIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBhIHNwZWNpZmllZCBtZXRob2Qgb24gYSBnaXZlbiBvYmplY3Qgd2l0aGluIGEgc3BlY2lmaWVkIHdpbmRvdyBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRob2QgaXMgdG8gYmUgaW52b2tlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdyBjb250ZXh0IGluIHdoaWNoIHRoZSBtZXRob2Qgc2hvdWxkIGJlIGNhbGxlZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBydW50aW1lIGNhbGxlciBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBtZXRob2QgbmFtZSBhbmQgb3B0aW9uYWxseSBhcmd1bWVudHMgYW5kIGludm9rZXMgdGhlIG1ldGhvZCB3aXRoaW4gdGhlIHNwZWNpZmllZCB3aW5kb3cgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0LCB3aW5kb3dOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZXRob2QsIGFyZ3M9bnVsbCkge1xuICAgICAgICByZXR1cm4gcnVudGltZUNhbGwob2JqZWN0ICsgXCIuXCIgKyBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpO1xuICAgIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBydW50aW1lIGNhbGxlciB3aXRoIHNwZWNpZmllZCBJRC5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IC0gVGhlIG9iamVjdCB0byBpbnZva2UgdGhlIG1ldGhvZCBvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSAtIFRoZSBuZXcgcnVudGltZSBjYWxsZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdCwgd2luZG93TmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAobWV0aG9kLCBhcmdzPW51bGwpIHtcbiAgICAgICAgcmV0dXJuIHJ1bnRpbWVDYWxsV2l0aElEKG9iamVjdCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKTtcbiAgICB9O1xufVxuXG5cbmZ1bmN0aW9uIHJ1bnRpbWVDYWxsKG1ldGhvZCwgd2luZG93TmFtZSwgYXJncykge1xuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJ1bnRpbWVVUkwpO1xuICAgIGlmKCBtZXRob2QgKSB7XG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwibWV0aG9kXCIsIG1ldGhvZCk7XG4gICAgfVxuICAgIGxldCBmZXRjaE9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgIH07XG4gICAgaWYgKHdpbmRvd05hbWUpIHtcbiAgICAgICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcbiAgICB9XG4gICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJhcmdzXCIsIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcbiAgICB9XG4gICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLWNsaWVudC1pZFwiXSA9IGNsaWVudElkO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZmV0Y2godXJsLCBmZXRjaE9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGNvbnRlbnQgdHlwZVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikgJiYgcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikuaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWplY3QoRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcmVzb2x2ZShkYXRhKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcnVudGltZUNhbGxXaXRoSUQob2JqZWN0SUQsIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncykge1xuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJ1bnRpbWVVUkwpO1xuICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwib2JqZWN0XCIsIG9iamVjdElEKTtcbiAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcIm1ldGhvZFwiLCBtZXRob2QpO1xuICAgIGxldCBmZXRjaE9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgIH07XG4gICAgaWYgKHdpbmRvd05hbWUpIHtcbiAgICAgICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcbiAgICB9XG4gICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJhcmdzXCIsIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcbiAgICB9XG4gICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLWNsaWVudC1pZFwiXSA9IGNsaWVudElkO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGZldGNoKHVybCwgZmV0Y2hPcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBjb250ZW50IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpICYmIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9qc29uXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVqZWN0KEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHJlc29sdmUoZGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSk7XG4gICAgfSk7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuLyoqXG4gKiBGZXRjaGVzIGFwcGxpY2F0aW9uIGNhcGFiaWxpdGllcyBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogQGFzeW5jXG4gKiBAZnVuY3Rpb24gQ2FwYWJpbGl0aWVzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgY2FwYWJpbGl0aWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQ2FwYWJpbGl0aWVzKCkge1xuICAgIHJldHVybiBmZXRjaChcIi93YWlscy9jYXBhYmlsaXRpZXNcIikudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cy5cbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIFdpbmRvd3MsIG90aGVyd2lzZSBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzV2luZG93cygpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5PUyA9PT0gXCJ3aW5kb3dzXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgTGludXguXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIExpbnV4LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0xpbnV4KCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcImxpbnV4XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIGEgbWFjT1Mgb3BlcmF0aW5nIHN5c3RlbS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgbWFjT1MsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWFjKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcImRhcndpblwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQU1ENjQoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuQXJjaCA9PT0gXCJhbWQ2NFwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBhcmNoaXRlY3R1cmUgaXMgQVJNLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGFyY2hpdGVjdHVyZSBpcyBBUk0sIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQVJNKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkFyY2ggPT09IFwiYXJtXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0FSTTY0KCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkFyY2ggPT09IFwiYXJtNjRcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgaW4gZGVidWcgbW9kZS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIGluIGRlYnVnIG1vZGUsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNEZWJ1ZygpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5EZWJ1ZyA9PT0gdHJ1ZTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQge25ld1J1bnRpbWVDYWxsZXJXaXRoSUQsIG9iamVjdE5hbWVzfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQge0lzRGVidWd9IGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuXG4vLyBzZXR1cFxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgY29udGV4dE1lbnVIYW5kbGVyKTtcblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0TmFtZXMuQ29udGV4dE1lbnUsICcnKTtcbmNvbnN0IENvbnRleHRNZW51T3BlbiA9IDA7XG5cbmZ1bmN0aW9uIG9wZW5Db250ZXh0TWVudShpZCwgeCwgeSwgZGF0YSkge1xuICAgIHZvaWQgY2FsbChDb250ZXh0TWVudU9wZW4sIHtpZCwgeCwgeSwgZGF0YX0pO1xufVxuXG5mdW5jdGlvbiBjb250ZXh0TWVudUhhbmRsZXIoZXZlbnQpIHtcbiAgICAvLyBDaGVjayBmb3IgY3VzdG9tIGNvbnRleHQgbWVudVxuICAgIGxldCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCBjdXN0b21Db250ZXh0TWVudSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudVwiKTtcbiAgICBjdXN0b21Db250ZXh0TWVudSA9IGN1c3RvbUNvbnRleHRNZW51ID8gY3VzdG9tQ29udGV4dE1lbnUudHJpbSgpIDogXCJcIjtcbiAgICBpZiAoY3VzdG9tQ29udGV4dE1lbnUpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGV0IGN1c3RvbUNvbnRleHRNZW51RGF0YSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudS1kYXRhXCIpO1xuICAgICAgICBvcGVuQ29udGV4dE1lbnUoY3VzdG9tQ29udGV4dE1lbnUsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGN1c3RvbUNvbnRleHRNZW51RGF0YSk7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQpO1xufVxuXG5cbi8qXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IGF1dG87IChkZWZhdWx0KSB3aWxsIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51IGlmIGNvbnRlbnRFZGl0YWJsZSBpcyB0cnVlIE9SIHRleHQgaGFzIGJlZW4gc2VsZWN0ZWQgT1IgZWxlbWVudCBpcyBpbnB1dCBvciB0ZXh0YXJlYVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBzaG93OyB3aWxsIGFsd2F5cyBzaG93IHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBoaWRlOyB3aWxsIGFsd2F5cyBoaWRlIHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuXG5UaGlzIHJ1bGUgaXMgaW5oZXJpdGVkIGxpa2Ugbm9ybWFsIENTUyBydWxlcywgc28gbmVzdGluZyB3b3JrcyBhcyBleHBlY3RlZFxuKi9cbmZ1bmN0aW9uIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQpIHtcblxuICAgIC8vIERlYnVnIGJ1aWxkcyBhbHdheXMgc2hvdyB0aGUgbWVudVxuICAgIGlmIChJc0RlYnVnKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgZGVmYXVsdCBjb250ZXh0IG1lbnVcbiAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbiAgICBjb25zdCBkZWZhdWx0Q29udGV4dE1lbnVBY3Rpb24gPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoXCItLWRlZmF1bHQtY29udGV4dG1lbnVcIikudHJpbSgpO1xuICAgIHN3aXRjaCAoZGVmYXVsdENvbnRleHRNZW51QWN0aW9uKSB7XG4gICAgICAgIGNhc2UgXCJzaG93XCI6XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNhc2UgXCJoaWRlXCI6XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWVcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0ZXh0IGhhcyBiZWVuIHNlbGVjdGVkXG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBoYXNTZWxlY3Rpb24gPSAoc2VsZWN0aW9uLnRvU3RyaW5nKCkubGVuZ3RoID4gMClcbiAgICAgICAgICAgIGlmIChoYXNTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdGlvbi5yYW5nZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdChpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVjdHMgPSByYW5nZS5nZXRDbGllbnRSZWN0cygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlY3RzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gcmVjdHNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChyZWN0LmxlZnQsIHJlY3QudG9wKSA9PT0gZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRhZ25hbWUgaXMgaW5wdXQgb3IgdGV4dGFyZWFcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09IFwiSU5QVVRcIiB8fCBlbGVtZW50LnRhZ05hbWUgPT09IFwiVEVYVEFSRUFcIikge1xuICAgICAgICAgICAgICAgIGlmIChoYXNTZWxlY3Rpb24gfHwgKCFlbGVtZW50LnJlYWRPbmx5ICYmICFlbGVtZW50LmRpc2FibGVkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBoaWRlIGRlZmF1bHQgY29udGV4dCBtZW51XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGZyb20gdGhlIGZsYWcgbWFwLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlTdHJpbmcgLSBUaGUga2V5IHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBmb3IuXG4gKiBAcmV0dXJuIHsqfSAtIFRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRGbGFnKGtleVN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmZsYWdzW2tleVN0cmluZ107XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcmV0cmlldmUgZmxhZyAnXCIgKyBrZXlTdHJpbmcgKyBcIic6IFwiICsgZSk7XG4gICAgfVxufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7aW52b2tlfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQge0lzV2luZG93c30gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5pbXBvcnQge0dldEZsYWd9IGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5cbi8vIFNldHVwXG5sZXQgc2hvdWxkRHJhZyA9IGZhbHNlO1xubGV0IHJlc2l6YWJsZSA9IGZhbHNlO1xubGV0IHJlc2l6ZUVkZ2UgPSBudWxsO1xubGV0IGRlZmF1bHRDdXJzb3IgPSBcImF1dG9cIjtcblxud2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XG5cbndpbmRvdy5fd2FpbHMuc2V0UmVzaXphYmxlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXNpemFibGUgPSB2YWx1ZTtcbn07XG5cbndpbmRvdy5fd2FpbHMuZW5kRHJhZyA9IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbn07XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuXG5cbmZ1bmN0aW9uIGRyYWdUZXN0KGUpIHtcbiAgICBsZXQgdmFsID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZS50YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLXdhaWxzLWRyYWdnYWJsZVwiKTtcbiAgICBsZXQgbW91c2VQcmVzc2VkID0gZS5idXR0b25zICE9PSB1bmRlZmluZWQgPyBlLmJ1dHRvbnMgOiBlLndoaWNoO1xuICAgIGlmICghdmFsIHx8IHZhbCA9PT0gXCJcIiB8fCB2YWwudHJpbSgpICE9PSBcImRyYWdcIiB8fCBtb3VzZVByZXNzZWQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZS5kZXRhaWwgPT09IDE7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGUpIHtcblxuICAgIC8vIENoZWNrIGZvciByZXNpemluZ1xuICAgIGlmIChyZXNpemVFZGdlKSB7XG4gICAgICAgIGludm9rZShcInJlc2l6ZTpcIiArIHJlc2l6ZUVkZ2UpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZHJhZ1Rlc3QoZSkpIHtcbiAgICAgICAgLy8gVGhpcyBjaGVja3MgZm9yIGNsaWNrcyBvbiB0aGUgc2Nyb2xsIGJhclxuICAgICAgICBpZiAoZS5vZmZzZXRYID4gZS50YXJnZXQuY2xpZW50V2lkdGggfHwgZS5vZmZzZXRZID4gZS50YXJnZXQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2hvdWxkRHJhZyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xuICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc2V0UmVzaXplKGN1cnNvcikge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5jdXJzb3IgPSBjdXJzb3IgfHwgZGVmYXVsdEN1cnNvcjtcbiAgICByZXNpemVFZGdlID0gY3Vyc29yO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKSB7XG4gICAgaWYgKHNob3VsZERyYWcpIHtcbiAgICAgICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xuICAgICAgICBsZXQgbW91c2VQcmVzc2VkID0gZS5idXR0b25zICE9PSB1bmRlZmluZWQgPyBlLmJ1dHRvbnMgOiBlLndoaWNoO1xuICAgICAgICBpZiAobW91c2VQcmVzc2VkID4gMCkge1xuICAgICAgICAgICAgaW52b2tlKFwiZHJhZ1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXJlc2l6YWJsZSB8fCAhSXNXaW5kb3dzKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGVmYXVsdEN1cnNvciA9PSBudWxsKSB7XG4gICAgICAgIGRlZmF1bHRDdXJzb3IgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuY3Vyc29yO1xuICAgIH1cbiAgICBsZXQgcmVzaXplSGFuZGxlSGVpZ2h0ID0gR2V0RmxhZyhcInN5c3RlbS5yZXNpemVIYW5kbGVIZWlnaHRcIikgfHwgNTtcbiAgICBsZXQgcmVzaXplSGFuZGxlV2lkdGggPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZVdpZHRoXCIpIHx8IDU7XG5cbiAgICAvLyBFeHRyYSBwaXhlbHMgZm9yIHRoZSBjb3JuZXIgYXJlYXNcbiAgICBsZXQgY29ybmVyRXh0cmEgPSBHZXRGbGFnKFwicmVzaXplQ29ybmVyRXh0cmFcIikgfHwgMTA7XG5cbiAgICBsZXQgcmlnaHRCb3JkZXIgPSB3aW5kb3cub3V0ZXJXaWR0aCAtIGUuY2xpZW50WCA8IHJlc2l6ZUhhbmRsZVdpZHRoO1xuICAgIGxldCBsZWZ0Qm9yZGVyID0gZS5jbGllbnRYIDwgcmVzaXplSGFuZGxlV2lkdGg7XG4gICAgbGV0IHRvcEJvcmRlciA9IGUuY2xpZW50WSA8IHJlc2l6ZUhhbmRsZUhlaWdodDtcbiAgICBsZXQgYm90dG9tQm9yZGVyID0gd2luZG93Lm91dGVySGVpZ2h0IC0gZS5jbGllbnRZIDwgcmVzaXplSGFuZGxlSGVpZ2h0O1xuXG4gICAgLy8gQWRqdXN0IGZvciBjb3JuZXJzXG4gICAgbGV0IHJpZ2h0Q29ybmVyID0gd2luZG93Lm91dGVyV2lkdGggLSBlLmNsaWVudFggPCAocmVzaXplSGFuZGxlV2lkdGggKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IGxlZnRDb3JuZXIgPSBlLmNsaWVudFggPCAocmVzaXplSGFuZGxlV2lkdGggKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IHRvcENvcm5lciA9IGUuY2xpZW50WSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IGJvdHRvbUNvcm5lciA9IHdpbmRvdy5vdXRlckhlaWdodCAtIGUuY2xpZW50WSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG5cbiAgICAvLyBJZiB3ZSBhcmVuJ3Qgb24gYW4gZWRnZSwgYnV0IHdlcmUsIHJlc2V0IHRoZSBjdXJzb3IgdG8gZGVmYXVsdFxuICAgIGlmICghbGVmdEJvcmRlciAmJiAhcmlnaHRCb3JkZXIgJiYgIXRvcEJvcmRlciAmJiAhYm90dG9tQm9yZGVyICYmIHJlc2l6ZUVkZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXRSZXNpemUoKTtcbiAgICB9XG4gICAgLy8gQWRqdXN0ZWQgZm9yIGNvcm5lciBhcmVhc1xuICAgIGVsc2UgaWYgKHJpZ2h0Q29ybmVyICYmIGJvdHRvbUNvcm5lcikgc2V0UmVzaXplKFwic2UtcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGxlZnRDb3JuZXIgJiYgYm90dG9tQ29ybmVyKSBzZXRSZXNpemUoXCJzdy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAobGVmdENvcm5lciAmJiB0b3BDb3JuZXIpIHNldFJlc2l6ZShcIm53LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmICh0b3BDb3JuZXIgJiYgcmlnaHRDb3JuZXIpIHNldFJlc2l6ZShcIm5lLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChsZWZ0Qm9yZGVyKSBzZXRSZXNpemUoXCJ3LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmICh0b3BCb3JkZXIpIHNldFJlc2l6ZShcIm4tcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGJvdHRvbUJvcmRlcikgc2V0UmVzaXplKFwicy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAocmlnaHRCb3JkZXIpIHNldFJlc2l6ZShcImUtcmVzaXplXCIpO1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7bmV3UnVudGltZUNhbGxlcldpdGhJRCwgb2JqZWN0TmFtZXN9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7bmFub2lkfSBmcm9tIFwiLi9uYW5vaWQuanNcIjtcblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xud2luZG93Ll93YWlscy5jYWxsUmVzdWx0SGFuZGxlciA9IHJlc3VsdEhhbmRsZXI7XG53aW5kb3cuX3dhaWxzLmNhbGxFcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXI7XG5cbmNvbnN0IENhbGxCaW5kaW5nID0gMDtcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdE5hbWVzLkNhbGwsICcnKTtcbmNvbnN0IGNhbmNlbENhbGwgPSBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdE5hbWVzLkNhbmNlbENhbGwsICcnKTtcbmxldCBjYWxsUmVzcG9uc2VzID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBJRCB1c2luZyB0aGUgbmFub2lkIGxpYnJhcnkuXG4gKlxuICogQHJldHVybiB7c3RyaW5nfSAtIEEgdW5pcXVlIElEIHRoYXQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGNhbGxSZXNwb25zZXMgc2V0LlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUlEKCkge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZG8ge1xuICAgICAgICByZXN1bHQgPSBuYW5vaWQoKTtcbiAgICB9IHdoaWxlIChjYWxsUmVzcG9uc2VzLmhhcyhyZXN1bHQpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEhhbmRsZXMgdGhlIHJlc3VsdCBvZiBhIGNhbGwgcmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHJlcXVlc3QgdG8gaGFuZGxlIHRoZSByZXN1bHQgZm9yLlxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBUaGUgcmVzdWx0IGRhdGEgb2YgdGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzSlNPTiAtIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkYXRhIGlzIEpTT04gb3Igbm90LlxuICpcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH0gLSBUaGlzIG1ldGhvZCBkb2VzIG5vdCByZXR1cm4gYW55IHZhbHVlLlxuICovXG5mdW5jdGlvbiByZXN1bHRIYW5kbGVyKGlkLCBkYXRhLCBpc0pTT04pIHtcbiAgICBjb25zdCBwcm9taXNlSGFuZGxlciA9IGdldEFuZERlbGV0ZVJlc3BvbnNlKGlkKTtcbiAgICBpZiAocHJvbWlzZUhhbmRsZXIpIHtcbiAgICAgICAgcHJvbWlzZUhhbmRsZXIucmVzb2x2ZShpc0pTT04gPyBKU09OLnBhcnNlKGRhdGEpIDogZGF0YSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEhhbmRsZXMgdGhlIGVycm9yIGZyb20gYSBjYWxsIHJlcXVlc3QuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSBwcm9taXNlIGhhbmRsZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIHJlamVjdCB0aGUgcHJvbWlzZSBoYW5kbGVyIHdpdGguXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gZXJyb3JIYW5kbGVyKGlkLCBtZXNzYWdlKSB7XG4gICAgY29uc3QgcHJvbWlzZUhhbmRsZXIgPSBnZXRBbmREZWxldGVSZXNwb25zZShpZCk7XG4gICAgaWYgKHByb21pc2VIYW5kbGVyKSB7XG4gICAgICAgIHByb21pc2VIYW5kbGVyLnJlamVjdChtZXNzYWdlKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGFuZCByZW1vdmVzIHRoZSByZXNwb25zZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIElEIGZyb20gdGhlIGNhbGxSZXNwb25zZXMgbWFwLlxuICpcbiAqIEBwYXJhbSB7YW55fSBpZCAtIFRoZSBJRCBvZiB0aGUgcmVzcG9uc2UgdG8gYmUgcmV0cmlldmVkIGFuZCByZW1vdmVkLlxuICpcbiAqIEByZXR1cm5zIHthbnl9IFRoZSByZXNwb25zZSBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBJRC5cbiAqL1xuZnVuY3Rpb24gZ2V0QW5kRGVsZXRlUmVzcG9uc2UoaWQpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGNhbGxSZXNwb25zZXMuZ2V0KGlkKTtcbiAgICBjYWxsUmVzcG9uc2VzLmRlbGV0ZShpZCk7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY2FsbCB1c2luZyB0aGUgcHJvdmlkZWQgdHlwZSBhbmQgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IHR5cGUgLSBUaGUgdHlwZSBvZiBjYWxsIHRvIGV4ZWN1dGUuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIC0gQWRkaXRpb25hbCBvcHRpb25zIGZvciB0aGUgY2FsbC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IC0gQSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvciByZWplY3RlZCBiYXNlZCBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjYWxsLiBJdCBhbHNvIGhhcyBhIGNhbmNlbCBtZXRob2QgdG8gY2FuY2VsIGEgbG9uZyBydW5uaW5nIHJlcXVlc3QuXG4gKi9cbmZ1bmN0aW9uIGNhbGxCaW5kaW5nKHR5cGUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGlkID0gZ2VuZXJhdGVJRCgpO1xuICAgIGNvbnN0IGRvQ2FuY2VsID0gKCkgPT4geyByZXR1cm4gY2FuY2VsQ2FsbCh0eXBlLCB7XCJjYWxsLWlkXCI6IGlkfSkgfTtcbiAgICBsZXQgcXVldWVkQ2FuY2VsID0gZmFsc2UsIGNhbGxSdW5uaW5nID0gZmFsc2U7XG4gICAgbGV0IHAgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIG9wdGlvbnNbXCJjYWxsLWlkXCJdID0gaWQ7XG4gICAgICAgIGNhbGxSZXNwb25zZXMuc2V0KGlkLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgICAgY2FsbCh0eXBlLCBvcHRpb25zKS5cbiAgICAgICAgICAgIHRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgICAgICBjYWxsUnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlZENhbmNlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9DYW5jZWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5cbiAgICAgICAgICAgIGNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgY2FsbFJlc3BvbnNlcy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcC5jYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIGlmIChjYWxsUnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGRvQ2FuY2VsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWV1ZWRDYW5jZWwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBwO1xufVxuXG4vKipcbiAqIENhbGwgbWV0aG9kLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gVGhlIG9wdGlvbnMgZm9yIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIFRoZSByZXN1bHQgb2YgdGhlIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYWxsKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgbWV0aG9kIGJ5IG5hbWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIGluIHRoZSBmb3JtYXQgJ3BhY2thZ2Uuc3RydWN0Lm1ldGhvZCcuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgbmFtZSBpcyBub3QgYSBzdHJpbmcgb3IgaXMgbm90IGluIHRoZSBjb3JyZWN0IGZvcm1hdC5cbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgZXhlY3V0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQnlOYW1lKG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIHtcbiAgICAgICAgbWV0aG9kTmFtZSxcbiAgICAgICAgYXJnc1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIGJ5IGl0cyBJRCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBtZXRob2RJRCAtIFRoZSBJRCBvZiB0aGUgbWV0aG9kIHRvIGNhbGwuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEByZXR1cm4geyp9IC0gVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCeUlEKG1ldGhvZElELCAuLi5hcmdzKSB7XG4gICAgcmV0dXJuIGNhbGxCaW5kaW5nKENhbGxCaW5kaW5nLCB7XG4gICAgICAgIG1ldGhvZElELFxuICAgICAgICBhcmdzXG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb24gYSBwbHVnaW4uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsdWdpbk5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGNhbGwuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEByZXR1cm5zIHsqfSAtIFRoZSByZXN1bHQgb2YgdGhlIG1ldGhvZCBjYWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gUGx1Z2luKHBsdWdpbk5hbWUsIG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIHtcbiAgICAgICAgcGFja2FnZU5hbWU6IFwid2FpbHMtcGx1Z2luc1wiLFxuICAgICAgICBzdHJ1Y3ROYW1lOiBwbHVnaW5OYW1lLFxuICAgICAgICBtZXRob2ROYW1lLFxuICAgICAgICBhcmdzXG4gICAgfSk7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuLyoqXG4gKiBDcmVhdGVBbnkgaXMgYSBkdW1teSBjcmVhdGlvbiBmdW5jdGlvbiBmb3Igc2ltcGxlIG9yIHVua25vd24gdHlwZXMuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHthbnl9IHNvdXJjZVxuICogQHJldHVybnMge1R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDcmVhdGVBbnkoc291cmNlKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7VH0gKi8oc291cmNlKTtcbn1cblxuLyoqXG4gKiBHYXJibGVBbnkgaXMgYSBkdW1teSBnYXJibGluZyBmdW5jdGlvbiBmb3Igc2ltcGxlIG9yIHVua25vd24gdHlwZXMuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtUfSB2YWx1ZVxuICogQHJldHVybnMge2FueX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdhcmJsZUFueSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBVbmdhcmJsZUFueSBpcyBhIGR1bW15IHVuZ2FyYmxpbmcgZnVuY3Rpb24gZm9yIHNpbXBsZSBvciB1bmtub3duIHR5cGVzLlxuICogQHBhcmFtIHthbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7YW55fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5nYXJibGVBbnkodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogQ3JlYXRlQnl0ZVNsaWNlIGlzIGEgY3JlYXRpb24gZnVuY3Rpb24gdGhhdCByZXBsYWNlc1xuICogbnVsbCBzdHJpbmdzIHdpdGggZW1wdHkgc3RyaW5ncy5cbiAqIEBwYXJhbSB7YW55fSBzb3VyY2VcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDcmVhdGVCeXRlU2xpY2Uoc291cmNlKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygoc291cmNlID09IG51bGwpID8gXCJcIiA6IHNvdXJjZSk7XG59XG5cbi8qKlxuICogQ3JlYXRlQXJyYXkgdGFrZXMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcnJheVxuICogd2hvc2UgZWxlbWVudHMgYXJlIG9mIHRoYXQgdHlwZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geyhhbnkpID0+IFR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHsoYW55KSA9PiBUW119XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDcmVhdGVBcnJheShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IENyZWF0ZUFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IFtdIDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvdXJjZVtpXSA9IGVsZW1lbnQoc291cmNlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogR2FyYmxlQXJyYXkgdGFrZXMgYSBnYXJibGluZyBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcbiAqIGFuZCByZXR1cm5zIGEgZ2FyYmxpbmcgZnVuY3Rpb24gZm9yIGFuIGFycmF5IHdob3NlIGVsZW1lbnRzXG4gKiBhcmUgb2YgdGhhdCB0eXBlLiBUaGUgaW5wdXQgYXJyYXkgaXMgbmV2ZXIgbW9kaWZpZWQuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHsoVCkgPT4gYW55fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7KHZhbHVlOiBUW10pID0+IGFueVtdfVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2FyYmxlQXJyYXkoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50ID09PSBHYXJibGVBbnkpIHtcbiAgICAgICAgcmV0dXJuIEdhcmJsZUFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbHVlKSA9PiB2YWx1ZS5tYXAoZWxlbWVudCk7XG59XG5cbi8qKlxuICogVW5nYXJibGVBcnJheSB0YWtlcyBhbiB1bmdhcmJsaW5nIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgdW5nYXJibGluZyBmdW5jdGlvbiBmb3IgYSBudWxsYWJsZSBhcnJheSB3aG9zZSBlbGVtZW50c1xuICogYXJlIG9mIHRoYXQgdHlwZS5cbiAqIEBwYXJhbSB7KGFueSkgPT4gYW55fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7KHZhbHVlOiBhbnlbXSB8IG51bGwpID0+IChhbnlbXSB8IG51bGwpfVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5nYXJibGVBcnJheShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IFVuZ2FyYmxlQW55KSB7XG4gICAgICAgIHJldHVybiBVbmdhcmJsZUFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFsdWVbaV0gPSBlbGVtZW50KHZhbHVlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZU1hcCB0YWtlcyBjcmVhdGlvbiBmdW5jdGlvbnMgZm9yIHR3byBhcmJpdHJhcnkgdHlwZXNcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBvYmplY3RcbiAqIHdob3NlIGtleXMgYW5kIHZhbHVlcyBhcmUgb2YgdGhvc2UgdHlwZXMuXG4gKiBAdGVtcGxhdGUgSywgVlxuICogQHBhcmFtIHsoYW55KSA9PiBLfSBrZXlcbiAqIEBwYXJhbSB7KGFueSkgPT4gVn0gdmFsdWVcbiAqIEByZXR1cm5zIHsoYW55KSA9PiB7IFtfOiBLXTogViB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQ3JlYXRlTWFwKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IENyZWF0ZUFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IHt9IDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBzb3VyY2Vba2V5XSA9IHZhbHVlKHNvdXJjZVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogR2FyYmxlTWFwIHRha2VzIGdhcmJsaW5nIGZ1bmN0aW9ucyBmb3IgdHdvIGFyYml0cmFyeSB0eXBlc1xuICogYW5kIHJldHVybnMgYSBnYXJibGluZyBmdW5jdGlvbiBmb3IgYW4gb2JqZWN0XG4gKiB3aG9zZSBrZXlzIGFuZCB2YWx1ZXMgYXJlIG9mIHRob3NlIHR5cGVzLlxuICogVGhlIGlucHV0IG9iamVjdCBpcyBuZXZlciBtb2RpZmllZC5cbiAqIEB0ZW1wbGF0ZSBLLCBWXG4gKiBAcGFyYW0geyhLKSA9PiBhbnl9IGtleVxuICogQHBhcmFtIHsoVikgPT4gYW55fSB2YWx1ZVxuICogQHJldHVybnMgeyhtYXA6IHsgW186IEtdOiBWIH0pID0+IHsgW186IGFueV06IGFueSB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2FyYmxlTWFwKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IEdhcmJsZUFueSkge1xuICAgICAgICByZXR1cm4gR2FyYmxlQW55O1xuICAgIH1cblxuICAgIHJldHVybiAobWFwKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtYXApIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWUobWFwW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBVbmdhcmJsZU1hcCB0YWtlcyB1bmdhcmJsaW5nIGZ1bmN0aW9ucyBmb3IgdHdvIGFyYml0cmFyeSB0eXBlc1xuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgdW5nYXJibGluZyBmdW5jdGlvbiBmb3IgYW4gb2JqZWN0XG4gKiB3aG9zZSBrZXlzIGFuZCB2YWx1ZXMgYXJlIG9mIHRob3NlIHR5cGVzLlxuICogQHBhcmFtIHsoYW55KSA9PiBhbnl9IGtleVxuICogQHBhcmFtIHsoYW55KSA9PiBhbnl9IHZhbHVlXG4gKiBAcmV0dXJucyB7KG1hcDogeyBbXzogYW55XTogYW55IH0pID0+IHsgW186IGFueV06IGFueSB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5nYXJibGVNYXAoa2V5LCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gVW5nYXJibGVBbnkpIHtcbiAgICAgICAgcmV0dXJuIFVuZ2FyYmxlQW55O1xuICAgIH1cblxuICAgIHJldHVybiAobWFwKSA9PiB7XG4gICAgICAgIGlmIChtYXAgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIG1hcCkge1xuICAgICAgICAgICAgbWFwW2tleV0gPSB2YWx1ZShtYXBba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZU51bGxhYmxlIHRha2VzIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXG4gKiBhbmQgcmV0dXJucyBhIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhIG51bGxhYmxlIHZhbHVlIG9mIHRoYXQgdHlwZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geyhhbnkpID0+IFR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHsoYW55KSA9PiAoVCB8IG51bGwpfVxuICovXG5leHBvcnQgZnVuY3Rpb24gQ3JlYXRlTnVsbGFibGUoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50ID09PSBDcmVhdGVBbnkpIHtcbiAgICAgICAgcmV0dXJuIENyZWF0ZUFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IG51bGwgOiBlbGVtZW50KHNvdXJjZSkpO1xufVxuXG4vKipcbiAqIEdhcmJsZU51bGxhYmxlIHRha2VzIGEgZ2FyYmxpbmcgZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXG4gKiBhbmQgcmV0dXJucyBhIGdhcmJsaW5nIGZ1bmN0aW9uIGZvciBhIG51bGxhYmxlIHZhbHVlIG9mIHRoYXQgdHlwZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geyhUKSA9PiBhbnl9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHsodmFsdWU6IFQgfCBudWxsKSA9PiBhbnl9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHYXJibGVOdWxsYWJsZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IEdhcmJsZUFueSkge1xuICAgICAgICByZXR1cm4gR2FyYmxlQW55O1xuICAgIH1cblxuICAgIHJldHVybiAodmFsdWUpID0+ICh2YWx1ZSA9PT0gbnVsbCA/IG51bGwgOiBlbGVtZW50KHZhbHVlKSk7XG59XG5cbi8qKlxuICogVW5nYXJibGVOdWxsYWJsZSB0YWtlcyBhbiB1bmdhcmJsaW5nIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxuICogYW5kIHJldHVybnMgYW4gdW5nYXJibGluZyBmdW5jdGlvbiBmb3IgYSBudWxsYWJsZSB2YWx1ZSBvZiB0aGF0IHR5cGUuXG4gKiBAcGFyYW0geyhhbnkpID0+IGFueX0gZWxlbWVudFxuICogQHJldHVybnMgeyh2YWx1ZTogYW55IHwgbnVsbCkgPT4gYW55fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5nYXJibGVOdWxsYWJsZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IFVuZ2FyYmxlQW55KSB7XG4gICAgICAgIHJldHVybiBVbmdhcmJsZUFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHZhbHVlKSA9PiAodmFsdWUgPT09IG51bGwgPyBudWxsIDogZWxlbWVudCh2YWx1ZSkpO1xufVxuXG4vKipcbiAqIENyZWF0ZVN0cnVjdCB0YWtlcyBhbiBvYmplY3QgbWFwcGluZyBmaWVsZCBuYW1lcyB0byBjcmVhdGlvbiBmdW5jdGlvbnNcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhIHN0cnVjdC5cbiAqIElmIGFuIHVuZ2FyYmxpbmcgbWFwIGlzIHByb3ZpZGVkLCB0aGUgcmV0dXJuZWQgZnVuY3Rpb25cbiAqIGFkZGl0aW9uYWxseSB1bmdhcmJsZXMgdGhlIGlucHV0IG9iamVjdC5cbiAqIEB0ZW1wbGF0ZSB7eyBbXzogc3RyaW5nXTogKChhbnkpID0+IGFueSkgfX0gVFxuICogQHRlbXBsYXRlIHt7IFtLZXkgaW4ga2V5b2YgVF0/OiBSZXR1cm5UeXBlPFRbS2V5XT4gfX0gVVxuICogQHBhcmFtIHtUfSBjcmVhdGVGaWVsZFxuICogQHBhcmFtIHt7IFtfOiBzdHJpbmddOiBzdHJpbmcgfSB8IG51bGx9IFt1bmdhcmJsZU1hcCA9IG51bGxdXG4gKiBAcmV0dXJucyB7KGFueSkgPT4gVX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENyZWF0ZVN0cnVjdChjcmVhdGVGaWVsZCwgdW5nYXJibGVNYXAgPSBudWxsKSB7XG4gICAgY29uc3QgY3JlYXRlRm4gPSAoc291cmNlKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBjcmVhdGVGaWVsZCkge1xuICAgICAgICAgICAgaWYgKG5hbWUgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgc291cmNlW25hbWVdID0gY3JlYXRlRmllbGRbbmFtZV0oc291cmNlW25hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG5cbiAgICBpZiAodW5nYXJibGVNYXAgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUZuO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoc291cmNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1bmdhcmJsZWQgPSB7fTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSBpbiB1bmdhcmJsZU1hcCkge1xuICAgICAgICAgICAgICAgICAgICB1bmdhcmJsZWRbdW5nYXJibGVNYXBbbmFtZV1dID0gc291cmNlW25hbWVdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVuZ2FyYmxlZFtuYW1lXSA9IHNvdXJjZVtuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY3JlYXRlRm4odW5nYXJibGVkKTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbi8qKlxuICogR2FyYmxlU3RydWN0IHRha2VzIGFuIG9iamVjdCBtYXBwaW5nIGZpZWxkIG5hbWVzIHRvIGdhcmJsZWQgbmFtZXNcbiAqIGFuZCBnYXJibGUgZnVuY3Rpb25zIGFuZCByZXR1cm5zIGEgZ2FyYmxpbmcgZnVuY3Rpb24gZm9yIGEgc3RydWN0LlxuICogVGhlIGlucHV0IG9iamVjdCBpcyBuZXZlciBtb2RpZmllZC5cbiAqIEB0ZW1wbGF0ZSB7eyBbXzogc3RyaW5nXTogeyB0bzogc3RyaW5nLCBnYXJibGU6ICgoYW55KSA9PiBhbnkpIH0gfX0gVFxuICogQHBhcmFtIHtUfSBmaWVsZHNcbiAqIEByZXR1cm5zIHsoYW55KSA9PiBhbnl9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHYXJibGVTdHJ1Y3QoZmllbGRzKSB7XG4gICAgcmV0dXJuICh2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIGZpZWxkcykge1xuICAgICAgICAgICAgY29uc3QgZmllbGRJbmZvID0gZmllbGRzW25hbWVdO1xuICAgICAgICAgICAgcmVzdWx0W2ZpZWxkSW5mby50b10gPSBmaWVsZEluZm8uZ2FyYmxlKHZhbHVlW25hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG59XG5cbi8qKlxuICogVW5nYXJibGVTdHJ1Y3QgdGFrZXMgYW4gb2JqZWN0IG1hcHBpbmcgZ2FyYmxlZCBuYW1lcyB0byBmaWVsZCBuYW1lc1xuICogYW5kIHVuZ2FyYmxlIGZ1bmN0aW9ucyBhbmQgcmV0dXJucyBhbiB1bmdhcmJsaW5nIGZ1bmN0aW9uIGZvciBhIHN0cnVjdC5cbiAqIFRoZSBpbnB1dCBvYmplY3QgaXMgbmV2ZXIgbW9kaWZpZWQuXG4gKiBAdGVtcGxhdGUge3sgW186IHN0cmluZ106IHsgZnJvbTogc3RyaW5nLCB1bmdhcmJsZTogKChhbnkpID0+IGFueSkgfSB9fSBUXG4gKiBAcGFyYW0ge1R9IGZpZWxkc1xuICogQHJldHVybnMgeyhhbnkpID0+IGFueX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuZ2FyYmxlU3RydWN0KGZpZWxkcykge1xuICAgIHJldHVybiAodmFsdWUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBmaWVsZHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkSW5mbyA9IGZpZWxkc1tuYW1lXTtcbiAgICAgICAgICAgIHJlc3VsdFtuYW1lXSA9IGZpZWxkSW5mby51bmdhcmJsZSh2YWx1ZVtmaWVsZEluZm8uZnJvbV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xuXG5pbXBvcnQgXCIuL2NvbnRleHRtZW51LmpzXCI7XG5pbXBvcnQgXCIuL2RyYWcuanNcIjtcblxuLy8gUmUtZXhwb3J0IChpbnRlcm5hbCkgcHVibGljIEFQSVxuZXhwb3J0ICogYXMgQ2FsbCBmcm9tIFwiLi9jYWxsLmpzXCI7XG5leHBvcnQgKiBhcyBGbGFncyBmcm9tIFwiLi9mbGFncy5qc1wiO1xuZXhwb3J0ICogYXMgU3lzdGVtIGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuZXhwb3J0ICogYXMgVHlwZXMgZnJvbSBcIi4vdHlwZXMuanNcIjtcblxuaW1wb3J0IHtpbnZva2V9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcblxuLy8gUHJvdmlkZSBkdW1teSBldmVudCBsaXN0ZW5lci5cbmlmICghKFwiZGlzcGF0Y2hXYWlsc0V2ZW50XCIgaW4gd2luZG93Ll93YWlscykpIHtcbiAgICB3aW5kb3cuX3dhaWxzLmRpc3BhdGNoV2FpbHNFdmVudCA9IGZ1bmN0aW9uICgpIHt9O1xufVxuXG4vLyBOb3RpZnkgYmFja2VuZFxud2luZG93Ll93YWlscy5pbnZva2UgPSBpbnZva2U7XG5pbnZva2UoXCJ3YWlsczpydW50aW1lOnJlYWR5XCIpO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgVHlwZXMgYXMgJFR5cGVzfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG4vKipcbiAqIE9wZW5VUkwgb3BlbnMgYSBicm93c2VyIHdpbmRvdyB0byB0aGUgZ2l2ZW4gVVJMLlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPcGVuVVJMKHVybCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDQxNDE0MDgxODUsIHVybCkpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIFR5cGVzIGFzICRUeXBlc30gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0ICogZnJvbSBcIi4uL2NvcmUvY2FsbC5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgVHlwZXMgYXMgJFR5cGVzfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG4vKipcbiAqIFNldFRleHQgd3JpdGVzIHRoZSBnaXZlbiBzdHJpbmcgdG8gdGhlIENsaXBib2FyZC5cbiAqIEl0IHJldHVybnMgdHJ1ZSBpZiB0aGUgb3BlcmF0aW9uIHN1Y2NlZWRlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0VGV4dCh0ZXh0KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoOTQwNTczNzQ5LCB0ZXh0KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFRleHQgcmV0cmlldmVzIGEgc3RyaW5nIGZyb20gdGhlIGNsaXBib2FyZC5cbiAqIElmIHRoZSBvcGVyYXRpb24gZmFpbHMsIGl0IHJldHVybnMgbnVsbC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZyB8IG51bGw+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVGV4dCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgyNDkyMzg2MjEpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHtDYWxsIGFzICRDYWxsLCBUeXBlcyBhcyAkVHlwZXN9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmltcG9ydCAqIGFzICRtb2RlbHMgZnJvbSBcIi4vbW9kZWxzLmpzXCI7XG5cbi8qKlxuICogRXJyb3Igc2hvd3MgYSBtb2RhbCBkaWFsb2cgY29udGFpbmluZyBhbiBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRXJyb3Iob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDI1MDg4NjI4OTUsIG9wdGlvbnMpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogSW5mbyBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGFuIGluZm9ybWF0aW9uYWwgbWVzc2FnZS5cbiAqIEBwYXJhbSB7JG1vZGVscy5NZXNzYWdlRGlhbG9nT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEluZm8ob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDQwODMxMDgzLCBvcHRpb25zKSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIE9wZW5GaWxlIHNob3dzIGEgZGlhbG9nIHRoYXQgYWxsb3dzIHRoZSB1c2VyXG4gKiB0byBzZWxlY3Qgb25lIG9yIG1vcmUgZmlsZXMgdG8gb3Blbi5cbiAqIEl0IG1heSB0aHJvdyBhbiBleGNlcHRpb24gaW4gY2FzZSBvZiBlcnJvcnMuXG4gKiBJdCByZXR1cm5zIGEgc3RyaW5nIGluIHNpbmdsZSBzZWxlY3Rpb24gbW9kZSxcbiAqIGFuIGFycmF5IG9mIHN0cmluZ3MgaW4gbXVsdGlwbGUgc2VsZWN0aW9uIG1vZGUuXG4gKiBAcGFyYW0geyRtb2RlbHMuT3BlbkZpbGVEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDI5NTg1NzExMDEsIG9wdGlvbnMpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogUXVlc3Rpb24gc2hvd3MgYSBtb2RhbCBkaWFsb2cgYXNraW5nIGEgcXVlc3Rpb24uXG4gKiBAcGFyYW0geyRtb2RlbHMuTWVzc2FnZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWVzdGlvbihvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMTM3ODM4MjM5NSwgb3B0aW9ucykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBTYXZlRmlsZSBzaG93cyBhIGRpYWxvZyB0aGF0IGFsbG93cyB0aGUgdXNlclxuICogdG8gc2VsZWN0IGEgbG9jYXRpb24gd2hlcmUgYSBmaWxlIHNob3VsZCBiZSBzYXZlZC5cbiAqIEl0IG1heSB0aHJvdyBhbiBleGNlcHRpb24gaW4gY2FzZSBvZiBlcnJvcnMuXG4gKiBAcGFyYW0geyRtb2RlbHMuU2F2ZUZpbGVEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2F2ZUZpbGUob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDE0NDE3NzM2NDQsIG9wdGlvbnMpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogV2FybmluZyBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGEgd2FybmluZyBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gV2FybmluZyhvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoOTM4NDU0MTA1LCBvcHRpb25zKSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgVHlwZXMgYXMgJFR5cGVzfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi9saXN0ZW5lci5qc1wiO1xuXG4vKipcbiAqIEVtaXQgZW1pdHMgYW4gZXZlbnQgdXNpbmcgdGhlIGdpdmVuIGV2ZW50IG9iamVjdC5cbiAqIFlvdSBjYW4gcGFzcyBpbiBpbnN0YW5jZXMgb2YgdGhlIGNsYXNzIGBXYWlsc0V2ZW50YC5cbiAqIEBwYXJhbSB7e1wibmFtZVwiOiBzdHJpbmcsIFwiZGF0YVwiOiBhbnl9fSBldmVudFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbWl0KGV2ZW50KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMjQ4MDY4MjM5MiwgZXZlbnQpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG4iLCAiXG5leHBvcnQgY29uc3QgRXZlbnRUeXBlcyA9IHtcblx0V2luZG93czoge1xuXHRcdFN5c3RlbVRoZW1lQ2hhbmdlZDogXCJ3aW5kb3dzOlN5c3RlbVRoZW1lQ2hhbmdlZFwiLFxuXHRcdEFQTVBvd2VyU3RhdHVzQ2hhbmdlOiBcIndpbmRvd3M6QVBNUG93ZXJTdGF0dXNDaGFuZ2VcIixcblx0XHRBUE1TdXNwZW5kOiBcIndpbmRvd3M6QVBNU3VzcGVuZFwiLFxuXHRcdEFQTVJlc3VtZUF1dG9tYXRpYzogXCJ3aW5kb3dzOkFQTVJlc3VtZUF1dG9tYXRpY1wiLFxuXHRcdEFQTVJlc3VtZVN1c3BlbmQ6IFwid2luZG93czpBUE1SZXN1bWVTdXNwZW5kXCIsXG5cdFx0QVBNUG93ZXJTZXR0aW5nQ2hhbmdlOiBcIndpbmRvd3M6QVBNUG93ZXJTZXR0aW5nQ2hhbmdlXCIsXG5cdFx0QXBwbGljYXRpb25TdGFydGVkOiBcIndpbmRvd3M6QXBwbGljYXRpb25TdGFydGVkXCIsXG5cdFx0V2ViVmlld05hdmlnYXRpb25Db21wbGV0ZWQ6IFwid2luZG93czpXZWJWaWV3TmF2aWdhdGlvbkNvbXBsZXRlZFwiLFxuXHRcdFdpbmRvd0luYWN0aXZlOiBcIndpbmRvd3M6V2luZG93SW5hY3RpdmVcIixcblx0XHRXaW5kb3dBY3RpdmU6IFwid2luZG93czpXaW5kb3dBY3RpdmVcIixcblx0XHRXaW5kb3dDbGlja0FjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0NsaWNrQWN0aXZlXCIsXG5cdFx0V2luZG93TWF4aW1pc2U6IFwid2luZG93czpXaW5kb3dNYXhpbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWF4aW1pc2U6IFwid2luZG93czpXaW5kb3dVbk1heGltaXNlXCIsXG5cdFx0V2luZG93RnVsbHNjcmVlbjogXCJ3aW5kb3dzOldpbmRvd0Z1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dVbkZ1bGxzY3JlZW46IFwid2luZG93czpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dSZXN0b3JlOiBcIndpbmRvd3M6V2luZG93UmVzdG9yZVwiLFxuXHRcdFdpbmRvd01pbmltaXNlOiBcIndpbmRvd3M6V2luZG93TWluaW1pc2VcIixcblx0XHRXaW5kb3dVbk1pbmltaXNlOiBcIndpbmRvd3M6V2luZG93VW5NaW5pbWlzZVwiLFxuXHRcdFdpbmRvd0Nsb3NlOiBcIndpbmRvd3M6V2luZG93Q2xvc2VcIixcblx0XHRXaW5kb3dTZXRGb2N1czogXCJ3aW5kb3dzOldpbmRvd1NldEZvY3VzXCIsXG5cdFx0V2luZG93S2lsbEZvY3VzOiBcIndpbmRvd3M6V2luZG93S2lsbEZvY3VzXCIsXG5cdFx0V2luZG93RHJhZ0Ryb3A6IFwid2luZG93czpXaW5kb3dEcmFnRHJvcFwiLFxuXHRcdFdpbmRvd0RyYWdFbnRlcjogXCJ3aW5kb3dzOldpbmRvd0RyYWdFbnRlclwiLFxuXHRcdFdpbmRvd0RyYWdMZWF2ZTogXCJ3aW5kb3dzOldpbmRvd0RyYWdMZWF2ZVwiLFxuXHRcdFdpbmRvd0RyYWdPdmVyOiBcIndpbmRvd3M6V2luZG93RHJhZ092ZXJcIixcblx0fSxcblx0TWFjOiB7XG5cdFx0QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQmVjb21lQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllczogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllc1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VJY29uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUljb25cIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZU9jY2x1c2lvblN0YXRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZU9jY2x1c2lvblN0YXRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVNjcmVlblBhcmFtZXRlcnNcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJPcmllbnRhdGlvbjogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJPcmllbnRhdGlvblwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiBcIm1hYzpBcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZ1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkSGlkZTogXCJtYWM6QXBwbGljYXRpb25EaWRIaWRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRSZXNpZ25BY3RpdmVOb3RpZmljYXRpb246IFwibWFjOkFwcGxpY2F0aW9uRGlkUmVzaWduQWN0aXZlTm90aWZpY2F0aW9uXCIsXG5cdFx0QXBwbGljYXRpb25EaWRVbmhpZGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVW5oaWRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVXBkYXRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsQmVjb21lQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxCZWNvbWVBY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxGaW5pc2hMYXVuY2hpbmc6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEZpbmlzaExhdW5jaGluZ1wiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbEhpZGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEhpZGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFJlc2lnbkFjdGl2ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVGVybWluYXRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsVW5oaWRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxVbmhpZGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFVwZGF0ZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlVGhlbWU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlVGhlbWUhXCIsXG5cdFx0QXBwbGljYXRpb25TaG91bGRIYW5kbGVSZW9wZW46IFwibWFjOkFwcGxpY2F0aW9uU2hvdWxkSGFuZGxlUmVvcGVuIVwiLFxuXHRcdFdpbmRvd0RpZEJlY29tZUtleTogXCJtYWM6V2luZG93RGlkQmVjb21lS2V5XCIsXG5cdFx0V2luZG93RGlkQmVjb21lTWFpbjogXCJtYWM6V2luZG93RGlkQmVjb21lTWFpblwiLFxuXHRcdFdpbmRvd0RpZEJlZ2luU2hlZXQ6IFwibWFjOldpbmRvd0RpZEJlZ2luU2hlZXRcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VBbHBoYTogXCJtYWM6V2luZG93RGlkQ2hhbmdlQWxwaGFcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VCYWNraW5nTG9jYXRpb246IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdMb2NhdGlvblwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllc1wiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZU9jY2x1c2lvblN0YXRlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VPY2NsdXNpb25TdGF0ZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuUHJvZmlsZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuUHJvZmlsZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlUHJvcGVydGllczogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VQcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2hhcmluZ1R5cGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNoYXJpbmdUeXBlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2VPcmRlcmluZ01vZGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVGl0bGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVRpdGxlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlVG9vbGJhclwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVZpc2liaWxpdHk6IFwibWFjOldpbmRvd0RpZENoYW5nZVZpc2liaWxpdHlcIixcblx0XHRXaW5kb3dEaWREZW1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dEaWREZW1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93RGlkRW5kU2hlZXQ6IFwibWFjOldpbmRvd0RpZEVuZFNoZWV0XCIsXG5cdFx0V2luZG93RGlkRW50ZXJGdWxsU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRFbnRlckZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRFbnRlclZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dEaWRFbnRlclZlcnNpb25Ccm93c2VyXCIsXG5cdFx0V2luZG93RGlkRXhpdEZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEV4aXRGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkRXhpdFZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dEaWRFeGl0VmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dEaWRFeHBvc2U6IFwibWFjOldpbmRvd0RpZEV4cG9zZVwiLFxuXHRcdFdpbmRvd0RpZEZvY3VzOiBcIm1hYzpXaW5kb3dEaWRGb2N1c1wiLFxuXHRcdFdpbmRvd0RpZE1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dEaWRNaW5pYXR1cml6ZVwiLFxuXHRcdFdpbmRvd0RpZE1vdmU6IFwibWFjOldpbmRvd0RpZE1vdmVcIixcblx0XHRXaW5kb3dEaWRPcmRlck9mZlNjcmVlbjogXCJtYWM6V2luZG93RGlkT3JkZXJPZmZTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRPcmRlck9uU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRPcmRlck9uU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkUmVzaWduS2V5OiBcIm1hYzpXaW5kb3dEaWRSZXNpZ25LZXlcIixcblx0XHRXaW5kb3dEaWRSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dEaWRSZXNpZ25NYWluXCIsXG5cdFx0V2luZG93RGlkUmVzaXplOiBcIm1hYzpXaW5kb3dEaWRSZXNpemVcIixcblx0XHRXaW5kb3dEaWRVcGRhdGU6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZUFscGhhOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVBbHBoYVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXM6IFwibWFjOldpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlU2hhZG93OiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVTaGFkb3dcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVUaXRsZTogXCJtYWM6V2luZG93RGlkVXBkYXRlVGl0bGVcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVUb29sYmFyOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVUb29sYmFyXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlVmlzaWJpbGl0eTogXCJtYWM6V2luZG93RGlkVXBkYXRlVmlzaWJpbGl0eVwiLFxuXHRcdFdpbmRvd1Nob3VsZENsb3NlOiBcIm1hYzpXaW5kb3dTaG91bGRDbG9zZSFcIixcblx0XHRXaW5kb3dXaWxsQmVjb21lS2V5OiBcIm1hYzpXaW5kb3dXaWxsQmVjb21lS2V5XCIsXG5cdFx0V2luZG93V2lsbEJlY29tZU1haW46IFwibWFjOldpbmRvd1dpbGxCZWNvbWVNYWluXCIsXG5cdFx0V2luZG93V2lsbEJlZ2luU2hlZXQ6IFwibWFjOldpbmRvd1dpbGxCZWdpblNoZWV0XCIsXG5cdFx0V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZVwiLFxuXHRcdFdpbmRvd1dpbGxDbG9zZTogXCJtYWM6V2luZG93V2lsbENsb3NlXCIsXG5cdFx0V2luZG93V2lsbERlbWluaWF0dXJpemU6IFwibWFjOldpbmRvd1dpbGxEZW1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93V2lsbEVudGVyRnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEVudGVyRnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxFbnRlclZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dXaWxsRW50ZXJWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd1dpbGxFeGl0RnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEV4aXRGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd1dpbGxGb2N1czogXCJtYWM6V2luZG93V2lsbEZvY3VzXCIsXG5cdFx0V2luZG93V2lsbE1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dXaWxsTWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dXaWxsTW92ZTogXCJtYWM6V2luZG93V2lsbE1vdmVcIixcblx0XHRXaW5kb3dXaWxsT3JkZXJPZmZTY3JlZW46IFwibWFjOldpbmRvd1dpbGxPcmRlck9mZlNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxPcmRlck9uU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsT3JkZXJPblNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dXaWxsUmVzaWduTWFpblwiLFxuXHRcdFdpbmRvd1dpbGxSZXNpemU6IFwibWFjOldpbmRvd1dpbGxSZXNpemVcIixcblx0XHRXaW5kb3dXaWxsVW5mb2N1czogXCJtYWM6V2luZG93V2lsbFVuZm9jdXNcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUFscGhhOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQWxwaGFcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlU2hhZG93OiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlU2hhZG93XCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVRpdGxlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVGl0bGVcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRvb2xiYXJcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVmlzaWJpbGl0eTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVZpc2liaWxpdHlcIixcblx0XHRXaW5kb3dXaWxsVXNlU3RhbmRhcmRGcmFtZTogXCJtYWM6V2luZG93V2lsbFVzZVN0YW5kYXJkRnJhbWVcIixcblx0XHRNZW51V2lsbE9wZW46IFwibWFjOk1lbnVXaWxsT3BlblwiLFxuXHRcdE1lbnVEaWRPcGVuOiBcIm1hYzpNZW51RGlkT3BlblwiLFxuXHRcdE1lbnVEaWRDbG9zZTogXCJtYWM6TWVudURpZENsb3NlXCIsXG5cdFx0TWVudVdpbGxTZW5kQWN0aW9uOiBcIm1hYzpNZW51V2lsbFNlbmRBY3Rpb25cIixcblx0XHRNZW51RGlkU2VuZEFjdGlvbjogXCJtYWM6TWVudURpZFNlbmRBY3Rpb25cIixcblx0XHRNZW51V2lsbEhpZ2hsaWdodEl0ZW06IFwibWFjOk1lbnVXaWxsSGlnaGxpZ2h0SXRlbVwiLFxuXHRcdE1lbnVEaWRIaWdobGlnaHRJdGVtOiBcIm1hYzpNZW51RGlkSGlnaGxpZ2h0SXRlbVwiLFxuXHRcdE1lbnVXaWxsRGlzcGxheUl0ZW06IFwibWFjOk1lbnVXaWxsRGlzcGxheUl0ZW1cIixcblx0XHRNZW51RGlkRGlzcGxheUl0ZW06IFwibWFjOk1lbnVEaWREaXNwbGF5SXRlbVwiLFxuXHRcdE1lbnVXaWxsQWRkSXRlbTogXCJtYWM6TWVudVdpbGxBZGRJdGVtXCIsXG5cdFx0TWVudURpZEFkZEl0ZW06IFwibWFjOk1lbnVEaWRBZGRJdGVtXCIsXG5cdFx0TWVudVdpbGxSZW1vdmVJdGVtOiBcIm1hYzpNZW51V2lsbFJlbW92ZUl0ZW1cIixcblx0XHRNZW51RGlkUmVtb3ZlSXRlbTogXCJtYWM6TWVudURpZFJlbW92ZUl0ZW1cIixcblx0XHRNZW51V2lsbEJlZ2luVHJhY2tpbmc6IFwibWFjOk1lbnVXaWxsQmVnaW5UcmFja2luZ1wiLFxuXHRcdE1lbnVEaWRCZWdpblRyYWNraW5nOiBcIm1hYzpNZW51RGlkQmVnaW5UcmFja2luZ1wiLFxuXHRcdE1lbnVXaWxsRW5kVHJhY2tpbmc6IFwibWFjOk1lbnVXaWxsRW5kVHJhY2tpbmdcIixcblx0XHRNZW51RGlkRW5kVHJhY2tpbmc6IFwibWFjOk1lbnVEaWRFbmRUcmFja2luZ1wiLFxuXHRcdE1lbnVXaWxsVXBkYXRlOiBcIm1hYzpNZW51V2lsbFVwZGF0ZVwiLFxuXHRcdE1lbnVEaWRVcGRhdGU6IFwibWFjOk1lbnVEaWRVcGRhdGVcIixcblx0XHRNZW51V2lsbFBvcFVwOiBcIm1hYzpNZW51V2lsbFBvcFVwXCIsXG5cdFx0TWVudURpZFBvcFVwOiBcIm1hYzpNZW51RGlkUG9wVXBcIixcblx0XHRNZW51V2lsbFNlbmRBY3Rpb25Ub0l0ZW06IFwibWFjOk1lbnVXaWxsU2VuZEFjdGlvblRvSXRlbVwiLFxuXHRcdE1lbnVEaWRTZW5kQWN0aW9uVG9JdGVtOiBcIm1hYzpNZW51RGlkU2VuZEFjdGlvblRvSXRlbVwiLFxuXHRcdFdlYlZpZXdEaWRTdGFydFByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFN0YXJ0UHJvdmlzaW9uYWxOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZFJlY2VpdmVTZXJ2ZXJSZWRpcmVjdEZvclByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFJlY2VpdmVTZXJ2ZXJSZWRpcmVjdEZvclByb3Zpc2lvbmFsTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRGaW5pc2hOYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRDb21taXROYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkQ29tbWl0TmF2aWdhdGlvblwiLFxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ0VudGVyZWQ6IFwibWFjOldpbmRvd0ZpbGVEcmFnZ2luZ0VudGVyZWRcIixcblx0XHRXaW5kb3dGaWxlRHJhZ2dpbmdQZXJmb3JtZWQ6IFwibWFjOldpbmRvd0ZpbGVEcmFnZ2luZ1BlcmZvcm1lZFwiLFxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ0V4aXRlZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nRXhpdGVkXCIsXG5cdH0sXG5cdExpbnV4OiB7XG5cdFx0U3lzdGVtVGhlbWVDaGFuZ2VkOiBcImxpbnV4OlN5c3RlbVRoZW1lQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd0xvYWRDaGFuZ2VkOiBcImxpbnV4OldpbmRvd0xvYWRDaGFuZ2VkXCIsXG5cdFx0V2luZG93RGVsZXRlRXZlbnQ6IFwibGludXg6V2luZG93RGVsZXRlRXZlbnRcIixcblx0XHRXaW5kb3dGb2N1c0luOiBcImxpbnV4OldpbmRvd0ZvY3VzSW5cIixcblx0XHRXaW5kb3dGb2N1c091dDogXCJsaW51eDpXaW5kb3dGb2N1c091dFwiLFxuXHRcdEFwcGxpY2F0aW9uU3RhcnR1cDogXCJsaW51eDpBcHBsaWNhdGlvblN0YXJ0dXBcIixcblx0fSxcblx0Q29tbW9uOiB7XG5cdFx0QXBwbGljYXRpb25TdGFydGVkOiBcImNvbW1vbjpBcHBsaWNhdGlvblN0YXJ0ZWRcIixcblx0XHRXaW5kb3dNYXhpbWlzZTogXCJjb21tb246V2luZG93TWF4aW1pc2VcIixcblx0XHRXaW5kb3dVbk1heGltaXNlOiBcImNvbW1vbjpXaW5kb3dVbk1heGltaXNlXCIsXG5cdFx0V2luZG93RnVsbHNjcmVlbjogXCJjb21tb246V2luZG93RnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd1VuRnVsbHNjcmVlbjogXCJjb21tb246V2luZG93VW5GdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93UmVzdG9yZTogXCJjb21tb246V2luZG93UmVzdG9yZVwiLFxuXHRcdFdpbmRvd01pbmltaXNlOiBcImNvbW1vbjpXaW5kb3dNaW5pbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWluaW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWluaW1pc2VcIixcblx0XHRXaW5kb3dDbG9zaW5nOiBcImNvbW1vbjpXaW5kb3dDbG9zaW5nXCIsXG5cdFx0V2luZG93Wm9vbTogXCJjb21tb246V2luZG93Wm9vbVwiLFxuXHRcdFdpbmRvd1pvb21JbjogXCJjb21tb246V2luZG93Wm9vbUluXCIsXG5cdFx0V2luZG93Wm9vbU91dDogXCJjb21tb246V2luZG93Wm9vbU91dFwiLFxuXHRcdFdpbmRvd1pvb21SZXNldDogXCJjb21tb246V2luZG93Wm9vbVJlc2V0XCIsXG5cdFx0V2luZG93Rm9jdXM6IFwiY29tbW9uOldpbmRvd0ZvY3VzXCIsXG5cdFx0V2luZG93TG9zdEZvY3VzOiBcImNvbW1vbjpXaW5kb3dMb3N0Rm9jdXNcIixcblx0XHRXaW5kb3dTaG93OiBcImNvbW1vbjpXaW5kb3dTaG93XCIsXG5cdFx0V2luZG93SGlkZTogXCJjb21tb246V2luZG93SGlkZVwiLFxuXHRcdFdpbmRvd0RQSUNoYW5nZWQ6IFwiY29tbW9uOldpbmRvd0RQSUNoYW5nZWRcIixcblx0XHRXaW5kb3dGaWxlc0Ryb3BwZWQ6IFwiY29tbW9uOldpbmRvd0ZpbGVzRHJvcHBlZFwiLFxuXHRcdFdpbmRvd1J1bnRpbWVSZWFkeTogXCJjb21tb246V2luZG93UnVudGltZVJlYWR5XCIsXG5cdFx0VGhlbWVDaGFuZ2VkOiBcImNvbW1vbjpUaGVtZUNoYW5nZWRcIixcblx0fSxcbn07XG4iLCAiLy8gQHRzLW5vY2hlY2tcbi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7RXZlbnRUeXBlc30gZnJvbSBcIi4vZXZlbnRfdHlwZXMuanNcIjtcbmV4cG9ydCBjb25zdCBUeXBlcyA9IEV2ZW50VHlwZXM7XG5cbi8vIFNldHVwXG53aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcbndpbmRvdy5fd2FpbHMuZGlzcGF0Y2hXYWlsc0V2ZW50ID0gZGlzcGF0Y2hXYWlsc0V2ZW50O1xuXG5jb25zdCBldmVudExpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuY2xhc3MgTGlzdGVuZXIge1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcykge1xuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgdGhpcy5tYXhDYWxsYmFja3MgPSBtYXhDYWxsYmFja3MgfHwgLTE7XG4gICAgICAgIHRoaXMuQ2FsbGJhY2sgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICBpZiAodGhpcy5tYXhDYWxsYmFja3MgPT09IC0xKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1heENhbGxiYWNrcyAtPSAxO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4Q2FsbGJhY2tzID09PSAwO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgYSBXYWlscyBhcHBsaWNhdGlvbiBldmVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFdhaWxzRXZlbnQge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgd2FpbHMgZXZlbnQgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHsqfSBbZGF0YV0gLSBBcmJpdHJhcnkgZGF0YSBhc3NvY2lhdGVkIHRvIHRoZSBldmVudC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhID0gbnVsbCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQXJiaXRyYXJ5IGRhdGEgYXNzb2NpYXRlZCB0byB0aGUgZXZlbnQuXG4gICAgICAgICAqIEB0eXBlIHsqfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoV2FpbHNFdmVudChldmVudCkge1xuICAgIGNvbnN0IHdldmVudCA9IC8qKiBAdHlwZSB7YW55fSAqLyhuZXcgV2FpbHNFdmVudChldmVudC5uYW1lLCBldmVudC5kYXRhKSlcbiAgICBPYmplY3QuYXNzaWduKHdldmVudCwgZXZlbnQpXG4gICAgZXZlbnQgPSB3ZXZlbnQ7XG5cbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50Lm5hbWUpO1xuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgbGV0IHRvUmVtb3ZlID0gbGlzdGVuZXJzLmZpbHRlcihsaXN0ZW5lciA9PiB7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlID0gbGlzdGVuZXIuQ2FsbGJhY2soZXZlbnQpO1xuICAgICAgICAgICAgaWYgKHJlbW92ZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodG9SZW1vdmUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmZpbHRlcihsID0+ICF0b1JlbW92ZS5pbmNsdWRlcyhsKSk7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkgZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50Lm5hbWUpO1xuICAgICAgICAgICAgZWxzZSBldmVudExpc3RlbmVycy5zZXQoZXZlbnQubmFtZSwgbGlzdGVuZXJzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBmb3IgYSBzcGVjaWZpYyBldmVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmb3IuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICogQHBhcmFtIHtudW1iZXJ9IG1heENhbGxiYWNrcyAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiB0aW1lcyB0aGUgY2FsbGJhY2sgY2FuIGJlIGNhbGxlZCBmb3IgdGhlIGV2ZW50LiBPbmNlIHRoZSBtYXhpbXVtIG51bWJlciBpcyByZWFjaGVkLCB0aGUgY2FsbGJhY2sgd2lsbCBubyBsb25nZXIgYmUgY2FsbGVkLlxuICpcbiBAcmV0dXJuIHtmdW5jdGlvbn0gLSBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCBtYXhDYWxsYmFja3MpIHtcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50TmFtZSkgfHwgW107XG4gICAgY29uc3QgdGhpc0xpc3RlbmVyID0gbmV3IExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcyk7XG4gICAgbGlzdGVuZXJzLnB1c2godGhpc0xpc3RlbmVyKTtcbiAgICBldmVudExpc3RlbmVycy5zZXQoZXZlbnROYW1lLCBsaXN0ZW5lcnMpO1xuICAgIHJldHVybiAoKSA9PiBsaXN0ZW5lck9mZih0aGlzTGlzdGVuZXIpO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIHNwZWNpZmllZCBldmVudCBvY2N1cnMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkLiBJdCB0YWtlcyBubyBwYXJhbWV0ZXJzLlxuICogQHJldHVybiB7ZnVuY3Rpb259IC0gQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPbihldmVudE5hbWUsIGNhbGxiYWNrKSB7IHJldHVybiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIC0xKTsgfVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIG9ubHkgb25jZSBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgZXZlbnQgb2NjdXJzLlxuICogQHJldHVybiB7ZnVuY3Rpb259IC0gQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9uY2UoZXZlbnROYW1lLCBjYWxsYmFjaykgeyByZXR1cm4gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCAxKTsgfVxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBsaXN0ZW5lciBmcm9tIHRoZSBldmVudCBsaXN0ZW5lcnMgY29sbGVjdGlvbi5cbiAqIElmIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudCBhcmUgcmVtb3ZlZCwgdGhlIGV2ZW50IGtleSBpcyBkZWxldGVkIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmVyIC0gVGhlIGxpc3RlbmVyIHRvIGJlIHJlbW92ZWQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlbmVyT2ZmKGxpc3RlbmVyKSB7XG4gICAgY29uc3QgZXZlbnROYW1lID0gbGlzdGVuZXIuZXZlbnROYW1lO1xuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnROYW1lKS5maWx0ZXIobCA9PiBsICE9PSBsaXN0ZW5lcik7XG4gICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDApIGV2ZW50TGlzdGVuZXJzLmRlbGV0ZShldmVudE5hbWUpO1xuICAgIGVsc2UgZXZlbnRMaXN0ZW5lcnMuc2V0KGV2ZW50TmFtZSwgbGlzdGVuZXJzKTtcbn1cblxuXG4vKipcbiAqIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IG5hbWVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gKiBAcGFyYW0gey4uLnN0cmluZ30gYWRkaXRpb25hbEV2ZW50TmFtZXMgLSBBZGRpdGlvbmFsIGV2ZW50IG5hbWVzIHRvIHJlbW92ZSBsaXN0ZW5lcnMgZm9yLlxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gT2ZmKGV2ZW50TmFtZSwgLi4uYWRkaXRpb25hbEV2ZW50TmFtZXMpIHtcbiAgICBsZXQgZXZlbnRzVG9SZW1vdmUgPSBbZXZlbnROYW1lLCAuLi5hZGRpdGlvbmFsRXZlbnROYW1lc107XG4gICAgZXZlbnRzVG9SZW1vdmUuZm9yRWFjaChldmVudE5hbWUgPT4gZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50TmFtZSkpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAZnVuY3Rpb24gT2ZmQWxsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9mZkFsbCgpIHsgZXZlbnRMaXN0ZW5lcnMuY2xlYXIoKTsgfVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgVHlwZXMgYXMgJFR5cGVzfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi4vY29yZS9mbGFncy5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgVHlwZXMgYXMgJFR5cGVzfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG4vKipcbiAqIEdldEFsbCByZXR1cm5zIGRlc2NyaXB0b3JzIGZvciBhbGwgc2NyZWVucy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuU2NyZWVuW10+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0QWxsKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDIzNjc3MDU1MzIpKTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAkdHlwaW5nUHJvbWlzZTtcbn1cblxuLyoqXG4gKiBHZXRDdXJyZW50IHJldHVybnMgYSBkZXNjcmlwdG9yIGZvciB0aGUgc2NyZWVuXG4gKiB3aGVyZSB0aGUgY3VycmVudGx5IGFjdGl2ZSB3aW5kb3cgaXMgbG9jYXRlZC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuU2NyZWVuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEN1cnJlbnQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMzE2NzU3MjE4KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIEdldFByaW1hcnkgcmV0dXJucyBhIGRlc2NyaXB0b3IgZm9yIHRoZSBwcmltYXJ5IHNjcmVlbi5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuU2NyZWVuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldFByaW1hcnkoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMzc0OTU2MjAxNykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLy8gUHJpdmF0ZSB0eXBlIGNyZWF0aW9uIGZ1bmN0aW9uc1xuY29uc3QgJCRjcmVhdGVUeXBlMCA9ICRUeXBlcy5DcmVhdGVBcnJheSgkVHlwZXMuQ3JlYXRlQW55KTtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIFR5cGVzIGFzICRUeXBlc30gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgJG1vZGVscyBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuZXhwb3J0ICogZnJvbSBcIi4uL2NvcmUvc3lzdGVtLmpzXCI7XG5cbi8qKlxuICogRW52aXJvbm1lbnQgcmV0cmlldmVzIGVudmlyb25tZW50IGRldGFpbHMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLkVudmlyb25tZW50SW5mbz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbnZpcm9ubWVudCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgzNzUyMjY3OTY4KSk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTEoJHJlc3VsdCk7XG4gICAgfSkpO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gJHR5cGluZ1Byb21pc2U7XG59XG5cbi8qKlxuICogSXNEYXJrTW9kZSByZXRyaWV2ZXMgc3lzdGVtIGRhcmsgbW9kZSBzdGF0dXMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRGFya01vZGUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMjI5MTI4MjgzNikpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLy8gUHJpdmF0ZSB0eXBlIGNyZWF0aW9uIGZ1bmN0aW9uc1xuY29uc3QgJCRjcmVhdGVUeXBlMCA9ICRUeXBlcy5DcmVhdGVNYXAoJFR5cGVzLkNyZWF0ZUFueSwgJFR5cGVzLkNyZWF0ZUFueSk7XG5jb25zdCAkJGNyZWF0ZVR5cGUxID0gJFR5cGVzLkNyZWF0ZVN0cnVjdCh7XG4gICAgXCJQbGF0Zm9ybUluZm9cIjogJCRjcmVhdGVUeXBlMCxcbn0pO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgVHlwZXMgYXMgJFR5cGVzfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi4vY29yZS90eXBlcy5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgVHlwZXMgYXMgJFR5cGVzfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gXCIuL3dpbmRvdy5qc1wiO1xuXG4vKiogQHR5cGUge2FueX0gKi9cbmxldCB0aGlzV2luZG93ID0gbnVsbDtcblxuLyoqXG4gKiBSZXR1cm5zIGEgd2luZG93IG9iamVjdCBmb3IgdGhlIGdpdmVuIHdpbmRvdyBuYW1lLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkfSBbbmFtZSA9IFwiXCJdXG4gKiBAcmV0dXJucyB7IHsgcmVhZG9ubHkgW0tleSBpbiBrZXlvZiAodHlwZW9mIHNlbGYpIGFzIEV4Y2x1ZGU8S2V5LCBcIkdldFwiIHwgXCJSR0JBXCI+XTogKHR5cGVvZiBzZWxmKVtLZXldIH0gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0KG5hbWUgPSBudWxsKSB7XG4gICAgY29uc3QgbmFtZXMgPSBbXSwgd25kID0ge307XG4gICAgaWYgKG5hbWUgIT0gbnVsbCAmJiBuYW1lICE9PSBcIlwiKSB7XG4gICAgICAgIG5hbWVzLnB1c2gobmFtZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzV2luZG93ICE9PSBudWxsKSB7XG4gICAgICAgIC8vIE9wdGltaXNlIGVtcHR5IHRhcmdldCBjYXNlIGZvciBXTUwuXG4gICAgICAgIHJldHVybiB0aGlzV2luZG93O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNXaW5kb3cgPSB3bmQ7XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IGluIHNlbGYpIHtcbiAgICAgICAgaWYgKGtleSAhPT0gXCJHZXRcIiAmJiBrZXkgIT09IFwiUkdCQVwiKSB7XG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSBzZWxmW2tleV07XG4gICAgICAgICAgICB3bmRba2V5XSA9ICguLi5hcmdzKSA9PiBtZXRob2QoLi4uYXJncywgLi4ubmFtZXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oT2JqZWN0LmZyZWV6ZSh3bmQpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuUG9zaXRpb24+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQWJzb2x1dGVQb3NpdGlvbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgyMjI1NTM4MjYsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBDZW50ZXJzIHRoZSB3aW5kb3cgb24gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDZW50ZXIoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoNDA1NDQzMDM2OSwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENsb3NlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDE0MzY1ODExMDAsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBEaXNhYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRGlzYWJsZVNpemVDb25zdHJhaW50cyguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgyNTEwNTM5ODkxLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogRW5hYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRW5hYmxlU2l6ZUNvbnN0cmFpbnRzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDMxNTA5NjgxOTQsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBGb2N1c2VzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9jdXMoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMzI3NDc4OTg3MiwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIEZvcmNlcyB0aGUgd2luZG93IHRvIHJlbG9hZCB0aGUgcGFnZSBhc3NldHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9yY2VSZWxvYWQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMTQ3NTIzMjUwLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogU3dpdGNoZXMgdGhlIHdpbmRvdyB0byBmdWxsc2NyZWVuIG1vZGUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnVsbHNjcmVlbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgzOTI0NTY0NDczLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgZm91ciB3aW5kb3cgYm9yZGVycy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5MUlRCPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEJvcmRlclNpemVzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDIyOTA5NTMwODgsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzY3JlZW4gdGhhdCB0aGUgd2luZG93IGlzIG9uLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRTY3JlZW4oLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMzc0NDU5NzQyNCwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0Wm9vbSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgyNjc3MzU5MDYzLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIZWlnaHQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoNTg3MTU3NjAzLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogSGlkZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIaWRlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDM4NzQwOTM0NjQsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmb2N1c2VkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRm9jdXNlZCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCg1MjY4MTk3MjEsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmdWxsc2NyZWVuLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRnVsbHNjcmVlbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgxMTkyOTE2NzA1LCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWF4aW1pc2VkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWF4aW1pc2VkKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDMwMzYzMjc4MDksIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBtaW5pbWlzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNaW5pbWlzZWQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoNDAxMjI4MTgzNSwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIE1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1heGltaXNlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDM3NTkwMDc3OTksIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWlzZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNaW5pbWlzZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgzNTQ4NTIwNTAxLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gTmFtZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCg0MjA3NjU3MDUxLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogT3BlbnMgdGhlIGRldmVsb3BtZW50IHRvb2xzIHBhbmUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkRldlRvb2xzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDQ4MzY3MTk3NCwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5Qb3NpdGlvbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGl2ZVBvc2l0aW9uKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDM3MDk1NDU5MjMsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZWxvYWRzIHBhZ2UgYXNzZXRzLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlbG9hZCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgyODMzNzMxNDg1LCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgcmVzaXphYmxlLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlc2l6YWJsZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgyNDUwOTQ2Mjc3LCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogUmVzdG9yZXMgdGhlIHdpbmRvdyB0byBpdHMgcHJldmlvdXMgc3RhdGUgaWYgaXQgd2FzIHByZXZpb3VzbHkgbWluaW1pc2VkLCBtYXhpbWlzZWQgb3IgZnVsbHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXN0b3JlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDExNTEzMTUwMzQsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRBYnNvbHV0ZVBvc2l0aW9uKHgsIHksIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDM5OTE0OTE4NDIsIHgsIHksIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSB3aW5kb3cgdG8gYmUgYWx3YXlzIG9uIHRvcC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYW90XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0QWx3YXlzT25Ub3AoYW90LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgzMzQ5MzQ2MTU1LCBhb3QsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBiYWNrZ3JvdW5kIGNvbG91ciBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHskbW9kZWxzLlJHQkF9IGNvbG91clxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEJhY2tncm91bmRDb2xvdXIoY29sb3VyLCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgyMTc5ODIwNTc2LCBjb2xvdXIsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSB3aW5kb3cgZnJhbWUgYW5kIHRpdGxlIGJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZnJhbWVsZXNzXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnJhbWVsZXNzKGZyYW1lbGVzcywgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoNDEwOTM2NTA4MCwgZnJhbWVsZXNzLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogRW5hYmxlcyBvciBkaXNhYmxlcyB0aGUgc3lzdGVtIGZ1bGxzY3JlZW4gYnV0dG9uLlxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnVsbHNjcmVlbkJ1dHRvbkVuYWJsZWQoZW5hYmxlZCwgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMzg2MzU2ODk4MiwgZW5hYmxlZCwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1heGltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0TWF4U2l6ZSh3aWR0aCwgaGVpZ2h0LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgzNDYwMDc4NTUxLCB3aWR0aCwgaGVpZ2h0LCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbWluaW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRNaW5TaXplKHdpZHRoLCBoZWlnaHQsIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDI2Nzc5MTkwODUsIHdpZHRoLCBoZWlnaHQsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZWxhdGl2ZVBvc2l0aW9uKHgsIHksIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDc0MTYwNjExNSwgeCwgeSwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFNldHMgd2hldGhlciB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzaXphYmxlXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVzaXphYmxlKHJlc2l6YWJsZSwgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMjgzNTMwNTU0MSwgcmVzaXphYmxlLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0U2l6ZSh3aWR0aCwgaGVpZ2h0LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgzMzc5Nzg4MzkzLCB3aWR0aCwgaGVpZ2h0LCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgdGl0bGUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRpdGxlKHRpdGxlLCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgxNzA5NTM1OTgsIHRpdGxlLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IG1hZ25pZmljYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRab29tKG1hZ25pZmljYXRpb24sIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDI3OTQ1MDAwNTEsIG1hZ25pZmljYXRpb24sIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBTaG93cyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNob3coLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMjkzMTgyMzEyMSwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TaXplPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNpemUoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMTE0MTExMTQzMywgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIGZ1bGxzY3JlZW4gYW5kIG5vcm1hbC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVGdWxsc2NyZWVuKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDIyMTI3NjMxNDksIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBtYXhpbWlzZWQgYW5kIG5vcm1hbC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVNYXhpbWlzZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgzMTQ0MTk0NDQzLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogVW4tZnVsbHNjcmVlbnMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBVbkZ1bGxzY3JlZW4oLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMTU4NzAwMjUwNiwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFVuLW1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWF4aW1pc2UoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMzg4OTk5OTQ3NiwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFVuLW1pbmltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWluaW1pc2UoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gLyoqIEB0eXBlIHthbnl9ICovKCRDYWxsLkJ5SUQoMzU3MTYzNjE5OCwgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBXaWR0aCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgxNjU1MjM5OTg4LCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogWm9vbXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDU1NTcxOTkyMywgdGFyZ2V0V2luZG93KSk7XG4gICAgcmV0dXJuICRyZXN1bHRQcm9taXNlO1xufVxuXG4vKipcbiAqIEluY3JlYXNlcyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2VidmlldyBjb250ZW50LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvb21JbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgxMzEwNDM0MjcyLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogRGVjcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbU91dCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAvKiogQHR5cGUge2FueX0gKi8oJENhbGwuQnlJRCgxNzU1NzAyODIxLCB0YXJnZXRXaW5kb3cpKTtcbiAgICByZXR1cm4gJHJlc3VsdFByb21pc2U7XG59XG5cbi8qKlxuICogUmVzZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbVJlc2V0KC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9IC8qKiBAdHlwZSB7YW55fSAqLygkQ2FsbC5CeUlEKDI3ODE0NjcxNTQsIHRhcmdldFdpbmRvdykpO1xuICAgIHJldHVybiAkcmVzdWx0UHJvbWlzZTtcbn1cbiIsICIvLyBAdHMtbm9jaGVja1xuLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHtPcGVuVVJMfSBmcm9tIFwiLi9icm93c2VyLmpzXCI7XG5pbXBvcnQge1F1ZXN0aW9ufSBmcm9tIFwiLi9kaWFsb2dzLmpzXCI7XG5pbXBvcnQge0VtaXQsIFdhaWxzRXZlbnR9IGZyb20gXCIuL2V2ZW50cy5qc1wiO1xuaW1wb3J0IHtjYW5BYm9ydExpc3RlbmVycywgd2hlblJlYWR5fSBmcm9tIFwiLi91dGlscy5qc1wiO1xuaW1wb3J0ICogYXMgV2luZG93IGZyb20gXCIuL3dpbmRvdy5qc1wiO1xuXG4vKipcbiAqIFNlbmRzIGFuIGV2ZW50IHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG9wdGlvbmFsIGRhdGEuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byBzZW5kLlxuICogQHBhcmFtIHthbnl9IFtkYXRhPW51bGxdIC0gT3B0aW9uYWwgZGF0YSB0byBzZW5kIGFsb25nIHdpdGggdGhlIGV2ZW50LlxuICpcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBzZW5kRXZlbnQoZXZlbnROYW1lLCBkYXRhPW51bGwpIHtcbiAgICBFbWl0KG5ldyBXYWlsc0V2ZW50KGV2ZW50TmFtZSwgZGF0YSkpO1xufVxuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9uIGEgc3BlY2lmaWVkIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdyB0byBjYWxsIHRoZSBtZXRob2Qgb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gY2FsbC5cbiAqL1xuZnVuY3Rpb24gY2FsbFdpbmRvd01ldGhvZCh3aW5kb3dOYW1lLCBtZXRob2ROYW1lKSB7XG4gICAgY29uc3QgdGFyZ2V0V2luZG93ID0gV2luZG93LkdldCh3aW5kb3dOYW1lKTtcbiAgICBjb25zdCBtZXRob2QgPSB0YXJnZXRXaW5kb3dbbWV0aG9kTmFtZV07XG5cbiAgICBpZiAodHlwZW9mIG1ldGhvZCAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFdpbmRvdyBtZXRob2QgJyR7bWV0aG9kTmFtZX0nIG5vdCBmb3VuZGApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgbWV0aG9kLmNhbGwodGFyZ2V0V2luZG93KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGNhbGxpbmcgd2luZG93IG1ldGhvZCAnJHttZXRob2ROYW1lfSc6IGAsIGUpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXNwb25kcyB0byBhIHRyaWdnZXJpbmcgZXZlbnQgYnkgcnVubmluZyBhcHByb3ByaWF0ZSBXTUwgYWN0aW9ucyBmb3IgdGhlIGN1cnJlbnQgdGFyZ2V0XG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBvbldNTFRyaWdnZXJlZChldikge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBldi5jdXJyZW50VGFyZ2V0O1xuXG4gICAgZnVuY3Rpb24gcnVuRWZmZWN0KGNob2ljZSA9IFwiWWVzXCIpIHtcbiAgICAgICAgaWYgKGNob2ljZSAhPT0gXCJZZXNcIilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zdCBldmVudFR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLWV2ZW50Jyk7XG4gICAgICAgIGNvbnN0IHRhcmdldFdpbmRvdyA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdGFyZ2V0LXdpbmRvdycpIHx8IFwiXCI7XG4gICAgICAgIGNvbnN0IHdpbmRvd01ldGhvZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtd2luZG93Jyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtb3BlbnVybCcpO1xuXG4gICAgICAgIGlmIChldmVudFR5cGUgIT09IG51bGwpXG4gICAgICAgICAgICBzZW5kRXZlbnQoZXZlbnRUeXBlKTtcbiAgICAgICAgaWYgKHdpbmRvd01ldGhvZCAhPT0gbnVsbClcbiAgICAgICAgICAgIGNhbGxXaW5kb3dNZXRob2QodGFyZ2V0V2luZG93LCB3aW5kb3dNZXRob2QpO1xuICAgICAgICBpZiAodXJsICE9PSBudWxsKVxuICAgICAgICAgICAgdm9pZCBPcGVuVVJMKHVybCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlybSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtY29uZmlybScpO1xuXG4gICAgaWYgKGNvbmZpcm0pIHtcbiAgICAgICAgUXVlc3Rpb24oe1xuICAgICAgICAgICAgVGl0bGU6IFwiQ29uZmlybVwiLFxuICAgICAgICAgICAgTWVzc2FnZTogY29uZmlybSxcbiAgICAgICAgICAgIERldGFjaGVkOiBmYWxzZSxcbiAgICAgICAgICAgIEJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICB7IExhYmVsOiBcIlllc1wiIH0sXG4gICAgICAgICAgICAgICAgeyBMYWJlbDogXCJOb1wiLCBJc0RlZmF1bHQ6IHRydWUgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KS50aGVuKHJ1bkVmZmVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcnVuRWZmZWN0KCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEB0eXBlIHtzeW1ib2x9XG4gKi9cbmNvbnN0IGNvbnRyb2xsZXIgPSBTeW1ib2woKTtcblxuLyoqXG4gKiBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSBkb2VzIG5vdCBhY3R1YWxseSByZW1lbWJlciBhY3RpdmUgZXZlbnQgbGlzdGVuZXJzOiBpbnN0ZWFkXG4gKiBpdCB0aWVzIHRoZW0gdG8gYW4gQWJvcnRTaWduYWwgYW5kIHVzZXMgYW4gQWJvcnRDb250cm9sbGVyIHRvIHJlbW92ZSB0aGVtIGFsbCBhdCBvbmNlLlxuICovXG5jbGFzcyBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdG9yZXMgdGhlIEFib3J0Q29udHJvbGxlciB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlbW92ZSBhbGwgY3VycmVudGx5IGFjdGl2ZSBsaXN0ZW5lcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBuYW1lIHtAbGluayBjb250cm9sbGVyfVxuICAgICAgICAgKiBAbWVtYmVyIHtBYm9ydENvbnRyb2xsZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzW2NvbnRyb2xsZXJdID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb3B0aW9ucyBvYmplY3QgZm9yIGFkZEV2ZW50TGlzdGVuZXIgdGhhdCB0aWVzIHRoZSBsaXN0ZW5lclxuICAgICAqIHRvIHRoZSBBYm9ydFNpZ25hbCBmcm9tIHRoZSBjdXJyZW50IEFib3J0Q29udHJvbGxlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgQW4gSFRNTCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdHJpZ2dlcnMgVGhlIGxpc3Qgb2YgYWN0aXZlIFdNTCB0cmlnZ2VyIGV2ZW50cyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50c1xuICAgICAqIEByZXR1cm5zIHtBZGRFdmVudExpc3RlbmVyT3B0aW9uc31cbiAgICAgKi9cbiAgICBzZXQoZWxlbWVudCwgdHJpZ2dlcnMpIHtcbiAgICAgICAgcmV0dXJuIHsgc2lnbmFsOiB0aGlzW2NvbnRyb2xsZXJdLnNpZ25hbCB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3ZvaWR9XG4gICAgICovXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXNbY29udHJvbGxlcl0uYWJvcnQoKTtcbiAgICAgICAgdGhpc1tjb250cm9sbGVyXSA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB9XG59XG5cbi8qKlxuICogQHR5cGUge3N5bWJvbH1cbiAqL1xuY29uc3QgdHJpZ2dlck1hcCA9IFN5bWJvbCgpO1xuXG4vKipcbiAqIEB0eXBlIHtzeW1ib2x9XG4gKi9cbmNvbnN0IGVsZW1lbnRDb3VudCA9IFN5bWJvbCgpO1xuXG4vKipcbiAqIFdlYWtNYXBSZWdpc3RyeSBtYXBzIGFjdGl2ZSB0cmlnZ2VyIGV2ZW50cyB0byBlYWNoIERPTSBlbGVtZW50IHRocm91Z2ggYSBXZWFrTWFwLlxuICogVGhpcyBlbnN1cmVzIHRoYXQgdGhlIG1hcHBpbmcgcmVtYWlucyBwcml2YXRlIHRvIHRoaXMgbW9kdWxlLCB3aGlsZSBzdGlsbCBhbGxvd2luZyBnYXJiYWdlXG4gKiBjb2xsZWN0aW9uIG9mIHRoZSBpbnZvbHZlZCBlbGVtZW50cy5cbiAqL1xuY2xhc3MgV2Vha01hcFJlZ2lzdHJ5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0b3JlcyB0aGUgY3VycmVudCBlbGVtZW50LXRvLXRyaWdnZXIgbWFwcGluZy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG5hbWUge0BsaW5rIHRyaWdnZXJNYXB9XG4gICAgICAgICAqIEBtZW1iZXIge1dlYWtNYXA8SFRNTEVsZW1lbnQsIHN0cmluZ1tdPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcF0gPSBuZXcgV2Vha01hcCgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3VudHMgdGhlIG51bWJlciBvZiBlbGVtZW50cyB3aXRoIGFjdGl2ZSBXTUwgdHJpZ2dlcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBuYW1lIHtAbGluayBlbGVtZW50Q291bnR9XG4gICAgICAgICAqIEBtZW1iZXIge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbZWxlbWVudENvdW50XSA9IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYWN0aXZlIHRyaWdnZXJzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IEFuIEhUTUwgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHRyaWdnZXJzIFRoZSBsaXN0IG9mIGFjdGl2ZSBXTUwgdHJpZ2dlciBldmVudHMgZm9yIHRoZSBzcGVjaWZpZWQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtBZGRFdmVudExpc3RlbmVyT3B0aW9uc31cbiAgICAgKi9cbiAgICBzZXQoZWxlbWVudCwgdHJpZ2dlcnMpIHtcbiAgICAgICAgdGhpc1tlbGVtZW50Q291bnRdICs9ICF0aGlzW3RyaWdnZXJNYXBdLmhhcyhlbGVtZW50KTtcbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwXS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgaWYgKHRoaXNbZWxlbWVudENvdW50XSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSkge1xuICAgICAgICAgICAgaWYgKHRoaXNbZWxlbWVudENvdW50XSA8PSAwKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjb25zdCB0cmlnZ2VycyA9IHRoaXNbdHJpZ2dlck1hcF0uZ2V0KGVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpc1tlbGVtZW50Q291bnRdIC09ICh0eXBlb2YgdHJpZ2dlcnMgIT09IFwidW5kZWZpbmVkXCIpO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdHJpZ2dlcnMgfHwgW10pXG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRyaWdnZXIsIG9uV01MVHJpZ2dlcmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcF0gPSBuZXcgV2Vha01hcCgpO1xuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudF0gPSAwO1xuICAgIH1cbn1cblxuY29uc3QgdHJpZ2dlclJlZ2lzdHJ5ID0gY2FuQWJvcnRMaXN0ZW5lcnMoKSA/IG5ldyBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSgpIDogbmV3IFdlYWtNYXBSZWdpc3RyeSgpO1xuXG4vKipcbiAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gYWRkV01MTGlzdGVuZXJzKGVsZW1lbnQpIHtcbiAgICBjb25zdCB0cmlnZ2VyUmVnRXhwID0gL1xcUysvZztcbiAgICBjb25zdCB0cmlnZ2VyQXR0ciA9IChlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLXRyaWdnZXInKSB8fCBcImNsaWNrXCIpO1xuICAgIGNvbnN0IHRyaWdnZXJzID0gW107XG5cbiAgICBsZXQgbWF0Y2g7XG4gICAgd2hpbGUgKChtYXRjaCA9IHRyaWdnZXJSZWdFeHAuZXhlYyh0cmlnZ2VyQXR0cikpICE9PSBudWxsKVxuICAgICAgICB0cmlnZ2Vycy5wdXNoKG1hdGNoWzBdKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0cmlnZ2VyUmVnaXN0cnkuc2V0KGVsZW1lbnQsIHRyaWdnZXJzKTtcbiAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdHJpZ2dlcnMpXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0cmlnZ2VyLCBvbldNTFRyaWdnZXJlZCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogU2NoZWR1bGVzIGFuIGF1dG9tYXRpYyByZWxvYWQgb2YgV01MIHRvIGJlIHBlcmZvcm1lZCBhcyBzb29uIGFzIHRoZSBkb2N1bWVudCBpcyBmdWxseSBsb2FkZWQuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbmFibGUoKSB7XG4gICAgd2hlblJlYWR5KFJlbG9hZCk7XG59XG5cbi8qKlxuICogUmVsb2FkcyB0aGUgV01MIHBhZ2UgYnkgYWRkaW5nIG5lY2Vzc2FyeSBldmVudCBsaXN0ZW5lcnMgYW5kIGJyb3dzZXIgbGlzdGVuZXJzLlxuICpcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gUmVsb2FkKCkge1xuICAgIHRyaWdnZXJSZWdpc3RyeS5yZXNldCgpO1xuICAgIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnW3dtbC1ldmVudF0sIFt3bWwtd2luZG93XSwgW3dtbC1vcGVudXJsXScpLmZvckVhY2goYWRkV01MTGlzdGVuZXJzKTtcbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8qXG4gXyAgICAgX18gICAgIF8gX19cbnwgfCAgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBicm93c2VyIHN1cHBvcnRzIHJlbW92aW5nIGxpc3RlbmVycyBieSB0cmlnZ2VyaW5nIGFuIEFib3J0U2lnbmFsXG4gKiAoc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FdmVudFRhcmdldC9hZGRFdmVudExpc3RlbmVyI3NpZ25hbClcbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FuQWJvcnRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKCFFdmVudFRhcmdldCB8fCAhQWJvcnRTaWduYWwgfHwgIUFib3J0Q29udHJvbGxlcilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBuZXcgRXZlbnRUYXJnZXQoKTtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgKCkgPT4geyByZXN1bHQgPSBmYWxzZTsgfSwgeyBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pO1xuICAgIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3Rlc3QnKSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKioqXG4gVGhpcyB0ZWNobmlxdWUgZm9yIHByb3BlciBsb2FkIGRldGVjdGlvbiBpcyB0YWtlbiBmcm9tIEhUTVg6XG5cbiBCU0QgMi1DbGF1c2UgTGljZW5zZVxuXG4gQ29weXJpZ2h0IChjKSAyMDIwLCBCaWcgU2t5IFNvZnR3YXJlXG4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gMS4gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG5cbiAyLiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvblxuIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG4gVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCJcbiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRVxuIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMXG4gREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1JcbiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUlxuIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksXG4gT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuXG4gKioqL1xuXG5sZXQgaXNSZWFkeSA9IGZhbHNlO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IGlzUmVhZHkgPSB0cnVlKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW5SZWFkeShjYWxsYmFjaykge1xuICAgIGlmIChpc1JlYWR5IHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgY2FsbGJhY2spO1xuICAgIH1cbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5leHBvcnQgKiBmcm9tIFwiLi4vLi4vLi4vLi4vcGtnL3J1bnRpbWUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgcnVudGltZSBmcm9tIFwiLi4vLi4vLi4vLi4vcGtnL3J1bnRpbWUvaW5kZXguanNcIjtcbndpbmRvdy53YWlscyA9IHJ1bnRpbWU7XG5cbnJ1bnRpbWUuV01MLkVuYWJsZSgpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FBQUE7QUFBQSxFQUFBO0FBQUE7QUFBQTtBQUFB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LElBQ3ZCLHVCQUF1QjtBQUFBLElBQ3ZCLDJCQUEyQjtBQUFBLElBQzNCLCtCQUErQjtBQUFBLElBQy9CLG9CQUFvQjtBQUFBLElBQ3BCLHFCQUFxQjtBQUFBLElBQ3JCLHFCQUFxQjtBQUFBLElBQ3JCLHNCQUFzQjtBQUFBLElBQ3RCLGdDQUFnQztBQUFBLElBQ2hDLGtDQUFrQztBQUFBLElBQ2xDLG1DQUFtQztBQUFBLElBQ25DLG9DQUFvQztBQUFBLElBQ3BDLCtCQUErQjtBQUFBLElBQy9CLDZCQUE2QjtBQUFBLElBQzdCLHVCQUF1QjtBQUFBLElBQ3ZCLGlDQUFpQztBQUFBLElBQ2pDLDhCQUE4QjtBQUFBLElBQzlCLDRCQUE0QjtBQUFBLElBQzVCLHNDQUFzQztBQUFBLElBQ3RDLDRCQUE0QjtBQUFBLElBQzVCLHNCQUFzQjtBQUFBLElBQ3RCLGtDQUFrQztBQUFBLElBQ2xDLHNCQUFzQjtBQUFBLElBQ3RCLHdCQUF3QjtBQUFBLElBQ3hCLDJCQUEyQjtBQUFBLElBQzNCLHdCQUF3QjtBQUFBLElBQ3hCLG1CQUFtQjtBQUFBLElBQ25CLDBCQUEwQjtBQUFBLElBQzFCLDhCQUE4QjtBQUFBLElBQzlCLHlCQUF5QjtBQUFBLElBQ3pCLDZCQUE2QjtBQUFBLElBQzdCLGlCQUFpQjtBQUFBLElBQ2pCLGdCQUFnQjtBQUFBLElBQ2hCLHNCQUFzQjtBQUFBLElBQ3RCLGVBQWU7QUFBQSxJQUNmLHlCQUF5QjtBQUFBLElBQ3pCLHdCQUF3QjtBQUFBLElBQ3hCLG9CQUFvQjtBQUFBLElBQ3BCLHFCQUFxQjtBQUFBLElBQ3JCLGlCQUFpQjtBQUFBLElBQ2pCLGlCQUFpQjtBQUFBLElBQ2pCLHNCQUFzQjtBQUFBLElBQ3RCLG1DQUFtQztBQUFBLElBQ25DLHFDQUFxQztBQUFBLElBQ3JDLHVCQUF1QjtBQUFBLElBQ3ZCLHNCQUFzQjtBQUFBLElBQ3RCLHdCQUF3QjtBQUFBLElBQ3hCLDJCQUEyQjtBQUFBLElBQzNCLG1CQUFtQjtBQUFBLElBQ25CLHFCQUFxQjtBQUFBLElBQ3JCLHNCQUFzQjtBQUFBLElBQ3RCLHNCQUFzQjtBQUFBLElBQ3RCLDhCQUE4QjtBQUFBLElBQzlCLGlCQUFpQjtBQUFBLElBQ2pCLHlCQUF5QjtBQUFBLElBQ3pCLDJCQUEyQjtBQUFBLElBQzNCLCtCQUErQjtBQUFBLElBQy9CLDBCQUEwQjtBQUFBLElBQzFCLDhCQUE4QjtBQUFBLElBQzlCLGlCQUFpQjtBQUFBLElBQ2pCLHVCQUF1QjtBQUFBLElBQ3ZCLGdCQUFnQjtBQUFBLElBQ2hCLDBCQUEwQjtBQUFBLElBQzFCLHlCQUF5QjtBQUFBLElBQ3pCLHNCQUFzQjtBQUFBLElBQ3RCLGtCQUFrQjtBQUFBLElBQ2xCLG1CQUFtQjtBQUFBLElBQ25CLGtCQUFrQjtBQUFBLElBQ2xCLHVCQUF1QjtBQUFBLElBQ3ZCLG9DQUFvQztBQUFBLElBQ3BDLHNDQUFzQztBQUFBLElBQ3RDLHdCQUF3QjtBQUFBLElBQ3hCLHVCQUF1QjtBQUFBLElBQ3ZCLHlCQUF5QjtBQUFBLElBQ3pCLDRCQUE0QjtBQUFBLElBQzVCLDRCQUE0QjtBQUFBLElBQzVCLGNBQWM7QUFBQSxJQUNkLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLG9CQUFvQjtBQUFBLElBQ3BCLG1CQUFtQjtBQUFBLElBQ25CLHVCQUF1QjtBQUFBLElBQ3ZCLHNCQUFzQjtBQUFBLElBQ3RCLHFCQUFxQjtBQUFBLElBQ3JCLG9CQUFvQjtBQUFBLElBQ3BCLGlCQUFpQjtBQUFBLElBQ2pCLGdCQUFnQjtBQUFBLElBQ2hCLG9CQUFvQjtBQUFBLElBQ3BCLG1CQUFtQjtBQUFBLElBQ25CLHVCQUF1QjtBQUFBLElBQ3ZCLHNCQUFzQjtBQUFBLElBQ3RCLHFCQUFxQjtBQUFBLElBQ3JCLG9CQUFvQjtBQUFBLElBQ3BCLGdCQUFnQjtBQUFBLElBQ2hCLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLGNBQWM7QUFBQSxJQUNkLDBCQUEwQjtBQUFBLElBQzFCLHlCQUF5QjtBQUFBLElBQ3pCLHNDQUFzQztBQUFBLElBQ3RDLHlEQUF5RDtBQUFBLElBQ3pELDRCQUE0QjtBQUFBLElBQzVCLDRCQUE0QjtBQUFBLElBQzVCLDJCQUEyQjtBQUFBLElBQzNCLDZCQUE2QjtBQUFBLElBQzdCLDBCQUEwQjtBQUFBLEVBQzNCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixvQkFBb0I7QUFBQSxJQUNwQixtQkFBbUI7QUFBQSxJQUNuQixtQkFBbUI7QUFBQSxJQUNuQixlQUFlO0FBQUEsSUFDZixnQkFBZ0I7QUFBQSxJQUNoQixvQkFBb0I7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1Asb0JBQW9CO0FBQUEsSUFDcEIsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsSUFDbEIsa0JBQWtCO0FBQUEsSUFDbEIsb0JBQW9CO0FBQUEsSUFDcEIsZUFBZTtBQUFBLElBQ2YsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsSUFDbEIsZUFBZTtBQUFBLElBQ2YsWUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QsZUFBZTtBQUFBLElBQ2YsaUJBQWlCO0FBQUEsSUFDakIsYUFBYTtBQUFBLElBQ2IsaUJBQWlCO0FBQUEsSUFDakIsWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLElBQ1osa0JBQWtCO0FBQUEsSUFDbEIsb0JBQW9CO0FBQUEsSUFDcEIsb0JBQW9CO0FBQUEsSUFDcEIsY0FBYztBQUFBLEVBQ2Y7QUFDRDs7O0FDNUtPLElBQU0sUUFBUTtBQUdyQixPQUFPLFNBQVMsT0FBTyxVQUFVLENBQUM7QUFDbEMsT0FBTyxPQUFPLHFCQUFxQjtBQUVuQyxJQUFNLGlCQUFpQixvQkFBSSxJQUFJO0FBRS9CLElBQU0sV0FBTixNQUFlO0FBQUEsRUFDWCxZQUFZLFdBQVcsVUFBVSxjQUFjO0FBQzNDLFNBQUssWUFBWTtBQUNqQixTQUFLLGVBQWUsZ0JBQWdCO0FBQ3BDLFNBQUssV0FBVyxDQUFDLFNBQVM7QUFDdEIsZUFBUyxJQUFJO0FBQ2IsVUFBSSxLQUFLLGlCQUFpQixHQUFJLFFBQU87QUFDckMsV0FBSyxnQkFBZ0I7QUFDckIsYUFBTyxLQUFLLGlCQUFpQjtBQUFBLElBQ2pDO0FBQUEsRUFDSjtBQUNKO0FBS08sSUFBTSxhQUFOLE1BQWlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTXBCLFlBQVksTUFBTSxPQUFPLE1BQU07QUFLM0IsU0FBSyxPQUFPO0FBTVosU0FBSyxPQUFPO0FBQUEsRUFDaEI7QUFDSjtBQUVBLFNBQVMsbUJBQW1CLE9BQU87QUFDL0IsUUFBTTtBQUFBO0FBQUEsSUFBNEIsSUFBSSxXQUFXLE1BQU0sTUFBTSxNQUFNLElBQUk7QUFBQTtBQUN2RSxTQUFPLE9BQU8sUUFBUSxLQUFLO0FBQzNCLFVBQVE7QUFFUixNQUFJLFlBQVksZUFBZSxJQUFJLE1BQU0sSUFBSTtBQUM3QyxNQUFJLFdBQVc7QUFDWCxRQUFJLFdBQVcsVUFBVSxPQUFPLGNBQVk7QUFDeEMsVUFBSSxTQUFTLFNBQVMsU0FBUyxLQUFLO0FBQ3BDLFVBQUksT0FBUSxRQUFPO0FBQUEsSUFDdkIsQ0FBQztBQUNELFFBQUksU0FBUyxTQUFTLEdBQUc7QUFDckIsa0JBQVksVUFBVSxPQUFPLE9BQUssQ0FBQyxTQUFTLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZELFVBQUksVUFBVSxXQUFXLEVBQUcsZ0JBQWUsT0FBTyxNQUFNLElBQUk7QUFBQSxVQUN2RCxnQkFBZSxJQUFJLE1BQU0sTUFBTSxTQUFTO0FBQUEsSUFDakQ7QUFBQSxFQUNKO0FBQ0o7QUFXTyxTQUFTLFdBQVcsV0FBVyxVQUFVLGNBQWM7QUFDMUQsTUFBSSxZQUFZLGVBQWUsSUFBSSxTQUFTLEtBQUssQ0FBQztBQUNsRCxRQUFNLGVBQWUsSUFBSSxTQUFTLFdBQVcsVUFBVSxZQUFZO0FBQ25FLFlBQVUsS0FBSyxZQUFZO0FBQzNCLGlCQUFlLElBQUksV0FBVyxTQUFTO0FBQ3ZDLFNBQU8sTUFBTSxZQUFZLFlBQVk7QUFDekM7QUFRTyxTQUFTLEdBQUcsV0FBVyxVQUFVO0FBQUUsU0FBTyxXQUFXLFdBQVcsVUFBVSxFQUFFO0FBQUc7QUFTL0UsU0FBUyxLQUFLLFdBQVcsVUFBVTtBQUFFLFNBQU8sV0FBVyxXQUFXLFVBQVUsQ0FBQztBQUFHO0FBUXZGLFNBQVMsWUFBWSxVQUFVO0FBQzNCLFFBQU0sWUFBWSxTQUFTO0FBQzNCLE1BQUksWUFBWSxlQUFlLElBQUksU0FBUyxFQUFFLE9BQU8sT0FBSyxNQUFNLFFBQVE7QUFDeEUsTUFBSSxVQUFVLFdBQVcsRUFBRyxnQkFBZSxPQUFPLFNBQVM7QUFBQSxNQUN0RCxnQkFBZSxJQUFJLFdBQVcsU0FBUztBQUNoRDtBQVVPLFNBQVMsSUFBSSxjQUFjLHNCQUFzQjtBQUNwRCxNQUFJLGlCQUFpQixDQUFDLFdBQVcsR0FBRyxvQkFBb0I7QUFDeEQsaUJBQWUsUUFBUSxDQUFBQyxlQUFhLGVBQWUsT0FBT0EsVUFBUyxDQUFDO0FBQ3hFO0FBUU8sU0FBUyxTQUFTO0FBQUUsaUJBQWUsTUFBTTtBQUFHOzs7QUZsSTVDLFNBQVMsS0FBSyxPQUFPO0FBQ3hCLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLEtBQUs7QUFBQTtBQUNwRSxTQUFPO0FBQ1g7OztBR2pCQSxJQUFBQyxpQkFBQTtBQUFBLFNBQUFBLGdCQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWU8sU0FBUyxTQUFTO0FBQ3JCLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxVQUFVO0FBQUE7QUFDN0QsTUFBSTtBQUFBO0FBQUEsSUFBb0MsZUFBZSxLQUFLLENBQUMsWUFBWTtBQUNyRSxhQUFPLGNBQWMsT0FBTztBQUFBLElBQ2hDLENBQUM7QUFBQTtBQUNELGlCQUFlLFNBQVMsZUFBZSxPQUFPLEtBQUssY0FBYztBQUNqRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLGFBQWE7QUFDekIsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFNBQVM7QUFBQTtBQUM1RCxTQUFPO0FBQ1g7QUFNTyxTQUFTLGFBQWE7QUFDekIsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFVBQVU7QUFBQTtBQUM3RCxTQUFPO0FBQ1g7QUFHQSxJQUFNLGdCQUFnQixjQUFPLFlBQVksY0FBTyxTQUFTOzs7QUN6Q3pELElBQUFDLGtCQUFBO0FBQUEsU0FBQUEsaUJBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBY08sU0FBUyxjQUFjO0FBQzFCLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxVQUFVO0FBQUE7QUFDN0QsTUFBSTtBQUFBO0FBQUEsSUFBb0MsZUFBZSxLQUFLLENBQUMsWUFBWTtBQUNyRSxhQUFPLGNBQWMsT0FBTztBQUFBLElBQ2hDLENBQUM7QUFBQTtBQUNELGlCQUFlLFNBQVMsZUFBZSxPQUFPLEtBQUssY0FBYztBQUNqRSxTQUFPO0FBQ1g7QUFNTyxTQUFTLGFBQWE7QUFDekIsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFVBQVU7QUFBQTtBQUM3RCxTQUFPO0FBQ1g7QUFHQSxJQUFNQyxpQkFBZ0IsY0FBTyxVQUFVLGNBQU8sV0FBVyxjQUFPLFNBQVM7QUFDekUsSUFBTSxnQkFBZ0IsY0FBTyxhQUFhO0FBQUEsRUFDdEMsZ0JBQWdCQTtBQUNwQixDQUFDOzs7QUNwQ0QsSUFBQUMsaUJBQUE7QUFBQSxTQUFBQSxnQkFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBQUFDO0FBQUEsRUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQUFBQztBQUFBLEVBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBV0EsSUFBSSxhQUFhO0FBT1YsU0FBUyxJQUFJLE9BQU8sTUFBTTtBQUM3QixRQUFNLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUN6QixNQUFJLFFBQVEsUUFBUSxTQUFTLElBQUk7QUFDN0IsVUFBTSxLQUFLLElBQUk7QUFBQSxFQUNuQixXQUFXLGVBQWUsTUFBTTtBQUU1QixXQUFPO0FBQUEsRUFDWCxPQUFPO0FBQ0gsaUJBQWE7QUFBQSxFQUNqQjtBQUNBLGFBQVcsT0FBTyxnQkFBTTtBQUNwQixRQUFJLFFBQVEsU0FBUyxRQUFRLFFBQVE7QUFDakMsWUFBTSxTQUFTLGVBQUssR0FBRztBQUN2QixVQUFJLEdBQUcsSUFBSSxJQUFJLFNBQVMsT0FBTyxHQUFHLE1BQU0sR0FBRyxLQUFLO0FBQUEsSUFDcEQ7QUFBQSxFQUNKO0FBQ0E7QUFBQTtBQUFBLElBQTBCLE9BQU8sT0FBTyxHQUFHO0FBQUE7QUFDL0M7QUFPTyxTQUFTLG9CQUFvQixjQUFjO0FBQzlDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxXQUFXLFlBQVk7QUFBQTtBQUMxRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLFVBQVUsY0FBYztBQUNwQyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxZQUFZO0FBQUE7QUFDM0UsU0FBTztBQUNYO0FBT08sU0FBUyxTQUFTLGNBQWM7QUFDbkMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsMEJBQTBCLGNBQWM7QUFDcEQsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMseUJBQXlCLGNBQWM7QUFDbkQsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsU0FBUyxjQUFjO0FBQ25DLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLGVBQWUsY0FBYztBQUN6QyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssV0FBVyxZQUFZO0FBQUE7QUFDMUUsU0FBTztBQUNYO0FBT08sU0FBUyxjQUFjLGNBQWM7QUFDeEMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsa0JBQWtCLGNBQWM7QUFDNUMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsYUFBYSxjQUFjO0FBQ3ZDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLFdBQVcsY0FBYztBQUNyQyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxZQUFZO0FBQUE7QUFDM0UsU0FBTztBQUNYO0FBT08sU0FBUyxVQUFVLGNBQWM7QUFDcEMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFdBQVcsWUFBWTtBQUFBO0FBQzFFLFNBQU87QUFDWDtBQU9PLFNBQVNDLFNBQVEsY0FBYztBQUNsQyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxZQUFZO0FBQUE7QUFDM0UsU0FBTztBQUNYO0FBT08sU0FBUyxhQUFhLGNBQWM7QUFDdkMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFdBQVcsWUFBWTtBQUFBO0FBQzFFLFNBQU87QUFDWDtBQU9PLFNBQVMsZ0JBQWdCLGNBQWM7QUFDMUMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsZUFBZSxjQUFjO0FBQ3pDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLGVBQWUsY0FBYztBQUN6QyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxZQUFZO0FBQUE7QUFDM0UsU0FBTztBQUNYO0FBT08sU0FBUyxZQUFZLGNBQWM7QUFDdEMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsWUFBWSxjQUFjO0FBQ3RDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLFFBQVEsY0FBYztBQUNsQyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxZQUFZO0FBQUE7QUFDM0UsU0FBTztBQUNYO0FBT08sU0FBUyxnQkFBZ0IsY0FBYztBQUMxQyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssV0FBVyxZQUFZO0FBQUE7QUFDMUUsU0FBTztBQUNYO0FBT08sU0FBUyxvQkFBb0IsY0FBYztBQUM5QyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxZQUFZO0FBQUE7QUFDM0UsU0FBTztBQUNYO0FBT08sU0FBUyxVQUFVLGNBQWM7QUFDcEMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsYUFBYSxjQUFjO0FBQ3ZDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLFdBQVcsY0FBYztBQUNyQyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxZQUFZO0FBQUE7QUFDM0UsU0FBTztBQUNYO0FBU08sU0FBUyxvQkFBb0IsR0FBRyxNQUFNLGNBQWM7QUFDdkQsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksR0FBRyxHQUFHLFlBQVk7QUFBQTtBQUNqRixTQUFPO0FBQ1g7QUFRTyxTQUFTLGVBQWUsUUFBUSxjQUFjO0FBQ2pELE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLEtBQUssWUFBWTtBQUFBO0FBQ2hGLFNBQU87QUFDWDtBQVFPLFNBQVMsb0JBQW9CLFdBQVcsY0FBYztBQUN6RCxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxRQUFRLFlBQVk7QUFBQTtBQUNuRixTQUFPO0FBQ1g7QUFRTyxTQUFTLGFBQWEsY0FBYyxjQUFjO0FBQ3JELE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFdBQVcsWUFBWTtBQUFBO0FBQ3RGLFNBQU87QUFDWDtBQVFPLFNBQVMsMkJBQTJCLFlBQVksY0FBYztBQUNqRSxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxTQUFTLFlBQVk7QUFBQTtBQUNwRixTQUFPO0FBQ1g7QUFTTyxTQUFTLFdBQVcsT0FBTyxXQUFXLGNBQWM7QUFDdkQsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksT0FBTyxRQUFRLFlBQVk7QUFBQTtBQUMxRixTQUFPO0FBQ1g7QUFTTyxTQUFTLFdBQVcsT0FBTyxXQUFXLGNBQWM7QUFDdkQsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksT0FBTyxRQUFRLFlBQVk7QUFBQTtBQUMxRixTQUFPO0FBQ1g7QUFTTyxTQUFTLG9CQUFvQixHQUFHLE1BQU0sY0FBYztBQUN2RCxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssV0FBVyxHQUFHLEdBQUcsWUFBWTtBQUFBO0FBQ2hGLFNBQU87QUFDWDtBQVFPLFNBQVMsYUFBYUMsZUFBYyxjQUFjO0FBQ3JELE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZQSxZQUFXLFlBQVk7QUFBQTtBQUN0RixTQUFPO0FBQ1g7QUFTTyxTQUFTLFFBQVEsT0FBTyxXQUFXLGNBQWM7QUFDcEQsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksT0FBTyxRQUFRLFlBQVk7QUFBQTtBQUMxRixTQUFPO0FBQ1g7QUFRTyxTQUFTLFNBQVMsVUFBVSxjQUFjO0FBQzdDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxXQUFXLE9BQU8sWUFBWTtBQUFBO0FBQ2pGLFNBQU87QUFDWDtBQVFPLFNBQVMsUUFBUSxrQkFBa0IsY0FBYztBQUNwRCxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxlQUFlLFlBQVk7QUFBQTtBQUMxRixTQUFPO0FBQ1g7QUFPTyxTQUFTQyxTQUFRLGNBQWM7QUFDbEMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsUUFBUSxjQUFjO0FBQ2xDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLG9CQUFvQixjQUFjO0FBQzlDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLGtCQUFrQixjQUFjO0FBQzVDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLGdCQUFnQixjQUFjO0FBQzFDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLGNBQWMsY0FBYztBQUN4QyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxZQUFZO0FBQUE7QUFDM0UsU0FBTztBQUNYO0FBT08sU0FBUyxjQUFjLGNBQWM7QUFDeEMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsU0FBUyxjQUFjO0FBQ25DLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLFFBQVEsY0FBYztBQUNsQyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssV0FBVyxZQUFZO0FBQUE7QUFDMUUsU0FBTztBQUNYO0FBT08sU0FBUyxVQUFVLGNBQWM7QUFDcEMsTUFBSTtBQUFBO0FBQUEsSUFBb0MsYUFBTSxLQUFLLFlBQVksWUFBWTtBQUFBO0FBQzNFLFNBQU87QUFDWDtBQU9PLFNBQVMsV0FBVyxjQUFjO0FBQ3JDLE1BQUk7QUFBQTtBQUFBLElBQW9DLGFBQU0sS0FBSyxZQUFZLFlBQVk7QUFBQTtBQUMzRSxTQUFPO0FBQ1g7QUFPTyxTQUFTLGFBQWEsY0FBYztBQUN2QyxNQUFJO0FBQUE7QUFBQSxJQUFvQyxhQUFNLEtBQUssWUFBWSxZQUFZO0FBQUE7QUFDM0UsU0FBTztBQUNYOzs7QUM5aEJBO0FBQUE7QUFBQTtBQUFBLGdCQUFBQztBQUFBOzs7QUNpQk8sU0FBUyxvQkFBb0I7QUFDaEMsTUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUM7QUFDakMsV0FBTztBQUVYLE1BQUksU0FBUztBQUViLFFBQU0sU0FBUyxJQUFJLFlBQVk7QUFDL0IsUUFBTUMsY0FBYSxJQUFJLGdCQUFnQjtBQUN2QyxTQUFPLGlCQUFpQixRQUFRLE1BQU07QUFBRSxhQUFTO0FBQUEsRUFBTyxHQUFHLEVBQUUsUUFBUUEsWUFBVyxPQUFPLENBQUM7QUFDeEYsRUFBQUEsWUFBVyxNQUFNO0FBQ2pCLFNBQU8sY0FBYyxJQUFJLFlBQVksTUFBTSxDQUFDO0FBRTVDLFNBQU87QUFDWDtBQWlDQSxJQUFJLFVBQVU7QUFDZCxTQUFTLGlCQUFpQixvQkFBb0IsTUFBTSxVQUFVLElBQUk7QUFFM0QsU0FBUyxVQUFVLFVBQVU7QUFDaEMsTUFBSSxXQUFXLFNBQVMsZUFBZSxZQUFZO0FBQy9DLGFBQVM7QUFBQSxFQUNiLE9BQU87QUFDSCxhQUFTLGlCQUFpQixvQkFBb0IsUUFBUTtBQUFBLEVBQzFEO0FBQ0o7OztBRDdDQSxTQUFTLFVBQVUsV0FBVyxPQUFLLE1BQU07QUFDckMsT0FBSyxJQUFJLFdBQVcsV0FBVyxJQUFJLENBQUM7QUFDeEM7QUFPQSxTQUFTLGlCQUFpQixZQUFZLFlBQVk7QUFDOUMsUUFBTSxlQUFzQixJQUFJLFVBQVU7QUFDMUMsUUFBTSxTQUFTLGFBQWEsVUFBVTtBQUV0QyxNQUFJLE9BQU8sV0FBVyxZQUFZO0FBQzlCLFlBQVEsTUFBTSxrQkFBa0IsVUFBVSxhQUFhO0FBQ3ZEO0FBQUEsRUFDSjtBQUVBLE1BQUk7QUFDQSxXQUFPLEtBQUssWUFBWTtBQUFBLEVBQzVCLFNBQVMsR0FBRztBQUNSLFlBQVEsTUFBTSxnQ0FBZ0MsVUFBVSxPQUFPLENBQUM7QUFBQSxFQUNwRTtBQUNKO0FBUUEsU0FBUyxlQUFlLElBQUk7QUFDeEIsUUFBTSxVQUFVLEdBQUc7QUFFbkIsV0FBUyxVQUFVLFNBQVMsT0FBTztBQUMvQixRQUFJLFdBQVc7QUFDWDtBQUVKLFVBQU0sWUFBWSxRQUFRLGFBQWEsV0FBVztBQUNsRCxVQUFNLGVBQWUsUUFBUSxhQUFhLG1CQUFtQixLQUFLO0FBQ2xFLFVBQU0sZUFBZSxRQUFRLGFBQWEsWUFBWTtBQUN0RCxVQUFNLE1BQU0sUUFBUSxhQUFhLGFBQWE7QUFFOUMsUUFBSSxjQUFjO0FBQ2QsZ0JBQVUsU0FBUztBQUN2QixRQUFJLGlCQUFpQjtBQUNqQix1QkFBaUIsY0FBYyxZQUFZO0FBQy9DLFFBQUksUUFBUTtBQUNSLFdBQUssUUFBUSxHQUFHO0FBQUEsRUFDeEI7QUFFQSxRQUFNLFVBQVUsUUFBUSxhQUFhLGFBQWE7QUFFbEQsTUFBSSxTQUFTO0FBQ1QsYUFBUztBQUFBLE1BQ0wsT0FBTztBQUFBLE1BQ1AsU0FBUztBQUFBLE1BQ1QsVUFBVTtBQUFBLE1BQ1YsU0FBUztBQUFBLFFBQ0wsRUFBRSxPQUFPLE1BQU07QUFBQSxRQUNmLEVBQUUsT0FBTyxNQUFNLFdBQVcsS0FBSztBQUFBLE1BQ25DO0FBQUEsSUFDSixDQUFDLEVBQUUsS0FBSyxTQUFTO0FBQUEsRUFDckIsT0FBTztBQUNILGNBQVU7QUFBQSxFQUNkO0FBQ0o7QUFLQSxJQUFNLGFBQWEsT0FBTztBQU0xQixJQUFNLDBCQUFOLE1BQThCO0FBQUEsRUFDMUIsY0FBYztBQVFWLFNBQUssVUFBVSxJQUFJLElBQUksZ0JBQWdCO0FBQUEsRUFDM0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFVQSxJQUFJLFNBQVMsVUFBVTtBQUNuQixXQUFPLEVBQUUsUUFBUSxLQUFLLFVBQVUsRUFBRSxPQUFPO0FBQUEsRUFDN0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPQSxRQUFRO0FBQ0osU0FBSyxVQUFVLEVBQUUsTUFBTTtBQUN2QixTQUFLLFVBQVUsSUFBSSxJQUFJLGdCQUFnQjtBQUFBLEVBQzNDO0FBQ0o7QUFLQSxJQUFNLGFBQWEsT0FBTztBQUsxQixJQUFNLGVBQWUsT0FBTztBQU81QixJQUFNLGtCQUFOLE1BQXNCO0FBQUEsRUFDbEIsY0FBYztBQVFWLFNBQUssVUFBVSxJQUFJLG9CQUFJLFFBQVE7QUFTL0IsU0FBSyxZQUFZLElBQUk7QUFBQSxFQUN6QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFTQSxJQUFJLFNBQVMsVUFBVTtBQUNuQixTQUFLLFlBQVksS0FBSyxDQUFDLEtBQUssVUFBVSxFQUFFLElBQUksT0FBTztBQUNuRCxTQUFLLFVBQVUsRUFBRSxJQUFJLFNBQVMsUUFBUTtBQUN0QyxXQUFPLENBQUM7QUFBQSxFQUNaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBT0EsUUFBUTtBQUNKLFFBQUksS0FBSyxZQUFZLEtBQUs7QUFDdEI7QUFFSixlQUFXLFdBQVcsU0FBUyxLQUFLLGlCQUFpQixHQUFHLEdBQUc7QUFDdkQsVUFBSSxLQUFLLFlBQVksS0FBSztBQUN0QjtBQUVKLFlBQU0sV0FBVyxLQUFLLFVBQVUsRUFBRSxJQUFJLE9BQU87QUFDN0MsV0FBSyxZQUFZLEtBQU0sT0FBTyxhQUFhO0FBRTNDLGlCQUFXLFdBQVcsWUFBWSxDQUFDO0FBQy9CLGdCQUFRLG9CQUFvQixTQUFTLGNBQWM7QUFBQSxJQUMzRDtBQUVBLFNBQUssVUFBVSxJQUFJLG9CQUFJLFFBQVE7QUFDL0IsU0FBSyxZQUFZLElBQUk7QUFBQSxFQUN6QjtBQUNKO0FBRUEsSUFBTSxrQkFBa0Isa0JBQWtCLElBQUksSUFBSSx3QkFBd0IsSUFBSSxJQUFJLGdCQUFnQjtBQVFsRyxTQUFTLGdCQUFnQixTQUFTO0FBQzlCLFFBQU0sZ0JBQWdCO0FBQ3RCLFFBQU0sY0FBZSxRQUFRLGFBQWEsYUFBYSxLQUFLO0FBQzVELFFBQU0sV0FBVyxDQUFDO0FBRWxCLE1BQUk7QUFDSixVQUFRLFFBQVEsY0FBYyxLQUFLLFdBQVcsT0FBTztBQUNqRCxhQUFTLEtBQUssTUFBTSxDQUFDLENBQUM7QUFFMUIsUUFBTSxVQUFVLGdCQUFnQixJQUFJLFNBQVMsUUFBUTtBQUNyRCxhQUFXLFdBQVc7QUFDbEIsWUFBUSxpQkFBaUIsU0FBUyxnQkFBZ0IsT0FBTztBQUNqRTtBQU9PLFNBQVMsU0FBUztBQUNyQixZQUFVQyxPQUFNO0FBQ3BCO0FBT08sU0FBU0EsVUFBUztBQUNyQixrQkFBZ0IsTUFBTTtBQUN0QixXQUFTLEtBQUssaUJBQWlCLDBDQUEwQyxFQUFFLFFBQVEsZUFBZTtBQUN0Rzs7O0FFclBBLE9BQU8sUUFBUTtBQUVQLFlBQUksT0FBTzsiLAogICJuYW1lcyI6IFsiY2FsbF9leHBvcnRzIiwgImZsYWdzX2V4cG9ydHMiLCAic3lzdGVtX2V4cG9ydHMiLCAidHlwZXNfZXhwb3J0cyIsICJjYWxsIiwgImtleSIsICJjYWxsX2V4cG9ydHMiLCAiRXJyb3IiLCAiRXJyb3IiLCAiZXZlbnROYW1lIiwgImZsYWdzX2V4cG9ydHMiLCAic3lzdGVtX2V4cG9ydHMiLCAiJCRjcmVhdGVUeXBlMCIsICJ0eXBlc19leHBvcnRzIiwgIkhpZGUiLCAiU2hvdyIsICJIaWRlIiwgInJlc2l6YWJsZSIsICJTaG93IiwgIlJlbG9hZCIsICJjb250cm9sbGVyIiwgIlJlbG9hZCJdCn0K
