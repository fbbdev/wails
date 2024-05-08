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
  Create: () => create_exports2,
  Dialogs: () => dialogs_exports,
  Events: () => events_exports,
  Flags: () => flags_exports2,
  Screens: () => screens_exports,
  System: () => system_exports2,
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
function ByName(name, ...args) {
  let methodDot = -1, structDot = -1;
  if (typeof name === "string") {
    methodDot = name.lastIndexOf(".");
    if (methodDot > 0)
      structDot = name.lastIndexOf(".", methodDot - 1);
  }
  if (methodDot < 0 || structDot < 0) {
    throw new Error("CallByName requires a string in the format 'packagePath.struct.method'");
  }
  const packagePath = name.slice(0, structDot), structName = name.slice(structDot + 1, methodDot), methodName = name.slice(methodDot + 1);
  return callBinding(CallBinding, {
    packagePath,
    structName,
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/create.js
var create_exports = {};
__export(create_exports, {
  Any: () => Any,
  Array: () => Array,
  Map: () => Map2,
  Nullable: () => Nullable,
  Struct: () => Struct
});
function Any(source) {
  return (
    /** @type {T} */
    source
  );
}
function Array(element) {
  if (element === Any) {
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
function Map2(key, value) {
  if (value === Any) {
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
function Nullable(element) {
  if (element === Any) {
    return Any;
  }
  return (source) => source === null ? null : element(source);
}
function Struct(createField) {
  let allAny = true;
  for (const name in createField) {
    if (createField[name] !== Any) {
      allAny = false;
      break;
    }
  }
  if (allAny) {
    return Any;
  }
  return (source) => {
    for (const name in createField) {
      if (name in source) {
        source[name] = createField[name](source[name]);
      }
    }
    return source;
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
  let $resultPromise = call_exports.ByID(727471602);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Quit() {
  let $resultPromise = call_exports.ByID(1244926953);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Show() {
  let $resultPromise = call_exports.ByID(2270674839);
  return (
    /** @type {any} */
    $resultPromise
  );
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/browser.js
var browser_exports = {};
__export(browser_exports, {
  OpenURL: () => OpenURL
});
function OpenURL(url) {
  let $resultPromise = call_exports.ByID(4141408185, url);
  return (
    /** @type {any} */
    $resultPromise
  );
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
  let $resultPromise = call_exports.ByID(940573749, text);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Text() {
  let $resultPromise = call_exports.ByID(249238621);
  return (
    /** @type {any} */
    $resultPromise
  );
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/create.js
var create_exports2 = {};
__export(create_exports2, {
  Any: () => Any,
  Array: () => Array,
  Map: () => Map2,
  Nullable: () => Nullable,
  Struct: () => Struct
});

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
  let $resultPromise = call_exports.ByID(2508862895, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Info(options) {
  let $resultPromise = call_exports.ByID(40831083, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function OpenFile(options) {
  let $resultPromise = call_exports.ByID(2958571101, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Question(options) {
  let $resultPromise = call_exports.ByID(1378382395, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SaveFile(options) {
  let $resultPromise = call_exports.ByID(1441773644, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Warning(options) {
  let $resultPromise = call_exports.ByID(938454105, options);
  return (
    /** @type {any} */
    $resultPromise
  );
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
  let $resultPromise = call_exports.ByID(2480682392, event);
  return (
    /** @type {any} */
    $resultPromise
  );
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
  let $resultPromise = call_exports.ByID(2367705532);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType0($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function GetCurrent() {
  let $resultPromise = call_exports.ByID(316757218);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function GetPrimary() {
  let $resultPromise = call_exports.ByID(3749562017);
  return (
    /** @type {any} */
    $resultPromise
  );
}
var $$createType0 = create_exports.Array(create_exports.Any);

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
  let $resultPromise = call_exports.ByID(3752267968);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType1($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function IsDarkMode() {
  let $resultPromise = call_exports.ByID(2291282836);
  return (
    /** @type {any} */
    $resultPromise
  );
}
var $$createType02 = create_exports.Map(create_exports.Any, create_exports.Any);
var $$createType1 = create_exports.Struct({
  "PlatformInfo": $$createType02
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
  let $resultPromise = call_exports.ByID(222553826, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Center(...targetWindow) {
  let $resultPromise = call_exports.ByID(4054430369, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Close(...targetWindow) {
  let $resultPromise = call_exports.ByID(1436581100, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function DisableSizeConstraints(...targetWindow) {
  let $resultPromise = call_exports.ByID(2510539891, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function EnableSizeConstraints(...targetWindow) {
  let $resultPromise = call_exports.ByID(3150968194, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Focus(...targetWindow) {
  let $resultPromise = call_exports.ByID(3274789872, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ForceReload(...targetWindow) {
  let $resultPromise = call_exports.ByID(147523250, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Fullscreen(...targetWindow) {
  let $resultPromise = call_exports.ByID(3924564473, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function GetBorderSizes(...targetWindow) {
  let $resultPromise = call_exports.ByID(2290953088, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function GetScreen(...targetWindow) {
  let $resultPromise = call_exports.ByID(3744597424, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function GetZoom(...targetWindow) {
  let $resultPromise = call_exports.ByID(2677359063, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Height(...targetWindow) {
  let $resultPromise = call_exports.ByID(587157603, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Hide2(...targetWindow) {
  let $resultPromise = call_exports.ByID(3874093464, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFocused(...targetWindow) {
  let $resultPromise = call_exports.ByID(526819721, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFullscreen(...targetWindow) {
  let $resultPromise = call_exports.ByID(1192916705, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMaximised(...targetWindow) {
  let $resultPromise = call_exports.ByID(3036327809, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMinimised(...targetWindow) {
  let $resultPromise = call_exports.ByID(4012281835, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Maximise(...targetWindow) {
  let $resultPromise = call_exports.ByID(3759007799, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Minimise(...targetWindow) {
  let $resultPromise = call_exports.ByID(3548520501, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Name(...targetWindow) {
  let $resultPromise = call_exports.ByID(4207657051, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function OpenDevTools(...targetWindow) {
  let $resultPromise = call_exports.ByID(483671974, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function RelativePosition(...targetWindow) {
  let $resultPromise = call_exports.ByID(3709545923, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Reload(...targetWindow) {
  let $resultPromise = call_exports.ByID(2833731485, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Resizable(...targetWindow) {
  let $resultPromise = call_exports.ByID(2450946277, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Restore(...targetWindow) {
  let $resultPromise = call_exports.ByID(1151315034, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAbsolutePosition(x, y, ...targetWindow) {
  let $resultPromise = call_exports.ByID(3991491842, x, y, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAlwaysOnTop(aot, ...targetWindow) {
  let $resultPromise = call_exports.ByID(3349346155, aot, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetBackgroundColour(colour, ...targetWindow) {
  let $resultPromise = call_exports.ByID(2179820576, colour, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFrameless(frameless, ...targetWindow) {
  let $resultPromise = call_exports.ByID(4109365080, frameless, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFullscreenButtonEnabled(enabled, ...targetWindow) {
  let $resultPromise = call_exports.ByID(3863568982, enabled, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMaxSize(width, height, ...targetWindow) {
  let $resultPromise = call_exports.ByID(3460078551, width, height, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMinSize(width, height, ...targetWindow) {
  let $resultPromise = call_exports.ByID(2677919085, width, height, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetRelativePosition(x, y, ...targetWindow) {
  let $resultPromise = call_exports.ByID(741606115, x, y, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetResizable(resizable2, ...targetWindow) {
  let $resultPromise = call_exports.ByID(2835305541, resizable2, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetSize(width, height, ...targetWindow) {
  let $resultPromise = call_exports.ByID(3379788393, width, height, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetTitle(title, ...targetWindow) {
  let $resultPromise = call_exports.ByID(170953598, title, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetZoom(magnification, ...targetWindow) {
  let $resultPromise = call_exports.ByID(2794500051, magnification, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Show2(...targetWindow) {
  let $resultPromise = call_exports.ByID(2931823121, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Size(...targetWindow) {
  let $resultPromise = call_exports.ByID(1141111433, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ToggleFullscreen(...targetWindow) {
  let $resultPromise = call_exports.ByID(2212763149, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ToggleMaximise(...targetWindow) {
  let $resultPromise = call_exports.ByID(3144194443, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnFullscreen(...targetWindow) {
  let $resultPromise = call_exports.ByID(1587002506, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMaximise(...targetWindow) {
  let $resultPromise = call_exports.ByID(3889999476, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMinimise(...targetWindow) {
  let $resultPromise = call_exports.ByID(3571636198, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Width(...targetWindow) {
  let $resultPromise = call_exports.ByID(1655239988, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Zoom(...targetWindow) {
  let $resultPromise = call_exports.ByID(555719923, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomIn(...targetWindow) {
  let $resultPromise = call_exports.ByID(1310434272, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomOut(...targetWindow) {
  let $resultPromise = call_exports.ByID(1755702821, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomReset(...targetWindow) {
  let $resultPromise = call_exports.ByID(2781467154, targetWindow);
  return (
    /** @type {any} */
    $resultPromise
  );
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
  create_exports2 as Create,
  dialogs_exports as Dialogs,
  events_exports as Events,
  flags_exports2 as Flags,
  screens_exports as Screens,
  system_exports2 as System,
  wml_exports as WML,
  window_exports as Window
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvcGtnL3J1bnRpbWUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvYXBwbGljYXRpb24uanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL25hbm9pZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvcnVudGltZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvc3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9jb250ZXh0bWVudS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvZmxhZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2RyYWcuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NhbGwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NyZWF0ZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvYnJvd3Nlci5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9jYWxsLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2NsaXBib2FyZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9jcmVhdGUuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvZGlhbG9ncy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9ldmVudHMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvZXZlbnRfdHlwZXMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvbGlzdGVuZXIuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvZmxhZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvc2NyZWVucy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9zeXN0ZW0uanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvd2luZG93LmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL3dtbC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS91dGlscy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2J1bmRsZS9mdWxsL2luZGV4LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5leHBvcnQge1xuICAgIEFwcGxpY2F0aW9uLFxuICAgIEJyb3dzZXIsXG4gICAgQ2FsbCxcbiAgICBDbGlwYm9hcmQsXG4gICAgQ3JlYXRlLFxuICAgIERpYWxvZ3MsXG4gICAgRXZlbnRzLFxuICAgIEZsYWdzLFxuICAgIFNjcmVlbnMsXG4gICAgU3lzdGVtLFxuICAgIFdpbmRvdyxcbiAgICBXTUxcbn0gZnJvbSBcIi4uLy4uL2ludGVybmFsL3J1bnRpbWUvYXBpL2luZGV4LmpzXCI7XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHtDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZX0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuLyoqXG4gKiBIaWRlIG1ha2VzIGFsbCBhcHBsaWNhdGlvbiB3aW5kb3dzIGludmlzaWJsZS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSGlkZSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDcyNzQ3MTYwMik7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUXVpdCBxdWl0cyB0aGUgYXBwbGljYXRpb24uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFF1aXQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMjQ0OTI2OTUzKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTaG93IG1ha2VzIGFsbCBhcHBsaWNhdGlvbiB3aW5kb3dzIHZpc2libGUuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNob3coKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMjcwNjc0ODM5KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cbiIsICIvKipcbiAqIFRoaXMgY29kZSBmcmFnbWVudCBpcyB0YWtlbiBmcm9tIG5hbm9pZCAoaHR0cHM6Ly9naXRodWIuY29tL2FpL25hbm9pZCk6XG4gKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IDIwMTcgQW5kcmV5IFNpdG5payA8YW5kcmV5QHNpdG5pay5ydT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mXG4gKiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluXG4gKiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvXG4gKiB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZlxuICogdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLFxuICogc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTXG4gKiBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1JcbiAqIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUlxuICogSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU5cbiAqIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxubGV0IHVybEFscGhhYmV0ID1cbiAgJ3VzZWFuZG9tLTI2VDE5ODM0MFBYNzVweEpBQ0tWRVJZTUlOREJVU0hXT0xGX0dRWmJmZ2hqa2xxdnd5enJpY3QnXG5leHBvcnQgbGV0IGN1c3RvbUFscGhhYmV0ID0gKGFscGhhYmV0LCBkZWZhdWx0U2l6ZSA9IDIxKSA9PiB7XG4gIHJldHVybiAoc2l6ZSA9IGRlZmF1bHRTaXplKSA9PiB7XG4gICAgbGV0IGlkID0gJydcbiAgICBsZXQgaSA9IHNpemVcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZCArPSBhbHBoYWJldFsoTWF0aC5yYW5kb20oKSAqIGFscGhhYmV0Lmxlbmd0aCkgfCAwXVxuICAgIH1cbiAgICByZXR1cm4gaWRcbiAgfVxufVxuZXhwb3J0IGxldCBuYW5vaWQgPSAoc2l6ZSA9IDIxKSA9PiB7XG4gIGxldCBpZCA9ICcnXG4gIGxldCBpID0gc2l6ZVxuICB3aGlsZSAoaS0tKSB7XG4gICAgaWQgKz0gdXJsQWxwaGFiZXRbKE1hdGgucmFuZG9tKCkgKiA2NCkgfCAwXVxuICB9XG4gIHJldHVybiBpZFxufVxuIiwgIi8qXG4gXyAgICAgX18gICAgIF8gX19cbnwgfCAgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5pbXBvcnQge25hbm9pZH0gZnJvbSBcIi4vbmFub2lkLmpzXCI7XG5cbmNvbnN0IHJ1bnRpbWVVUkwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgXCIvd2FpbHMvcnVudGltZVwiO1xuXG4vKiogU2VuZHMgbWVzc2FnZXMgdG8gdGhlIGJhY2tlbmQgKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZva2UobXNnKSB7XG4gICAgaWYod2luZG93LmNocm9tZSkge1xuICAgICAgICByZXR1cm4gd2luZG93LmNocm9tZS53ZWJ2aWV3LnBvc3RNZXNzYWdlKG1zZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy53ZWJraXQubWVzc2FnZUhhbmRsZXJzLmV4dGVybmFsLnBvc3RNZXNzYWdlKG1zZyk7XG4gICAgfVxufVxuXG4vKiogT2JqZWN0IE5hbWVzICovXG5leHBvcnQgY29uc3Qgb2JqZWN0TmFtZXMgPSB7XG4gICAgQ2FsbDogMCxcbiAgICBDb250ZXh0TWVudTogNCxcbiAgICBDYW5jZWxDYWxsOiAxMCxcbn1cbmV4cG9ydCBsZXQgY2xpZW50SWQgPSBuYW5vaWQoKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcnVudGltZSBjYWxsZXIgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGEgc3BlY2lmaWVkIG1ldGhvZCBvbiBhIGdpdmVuIG9iamVjdCB3aXRoaW4gYSBzcGVjaWZpZWQgd2luZG93IGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAtIFRoZSBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGhvZCBpcyB0byBiZSBpbnZva2VkLlxuICogQHBhcmFtIHtzdHJpbmd9IHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IGNvbnRleHQgaW4gd2hpY2ggdGhlIG1ldGhvZCBzaG91bGQgYmUgY2FsbGVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHJ1bnRpbWUgY2FsbGVyIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIG1ldGhvZCBuYW1lIGFuZCBvcHRpb25hbGx5IGFyZ3VtZW50cyBhbmQgaW52b2tlcyB0aGUgbWV0aG9kIHdpdGhpbiB0aGUgc3BlY2lmaWVkIHdpbmRvdyBjb250ZXh0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV3UnVudGltZUNhbGxlcihvYmplY3QsIHdpbmRvd05hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1ldGhvZCwgYXJncz1udWxsKSB7XG4gICAgICAgIHJldHVybiBydW50aW1lQ2FsbChvYmplY3QgKyBcIi5cIiArIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncyk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHJ1bnRpbWUgY2FsbGVyIHdpdGggc3BlY2lmaWVkIElELlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIGludm9rZSB0aGUgbWV0aG9kIG9uLlxuICogQHBhcmFtIHtzdHJpbmd9IHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93LlxuICogQHJldHVybiB7RnVuY3Rpb259IC0gVGhlIG5ldyBydW50aW1lIGNhbGxlciBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0LCB3aW5kb3dOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZXRob2QsIGFyZ3M9bnVsbCkge1xuICAgICAgICByZXR1cm4gcnVudGltZUNhbGxXaXRoSUQob2JqZWN0LCBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpO1xuICAgIH07XG59XG5cblxuZnVuY3Rpb24gcnVudGltZUNhbGwobWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKSB7XG4gICAgbGV0IHVybCA9IG5ldyBVUkwocnVudGltZVVSTCk7XG4gICAgaWYoIG1ldGhvZCApIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJtZXRob2RcIiwgbWV0aG9kKTtcbiAgICB9XG4gICAgbGV0IGZldGNoT3B0aW9ucyA9IHtcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgfTtcbiAgICBpZiAod2luZG93TmFtZSkge1xuICAgICAgICBmZXRjaE9wdGlvbnMuaGVhZGVyc1tcIngtd2FpbHMtd2luZG93LW5hbWVcIl0gPSB3aW5kb3dOYW1lO1xuICAgIH1cbiAgICBpZiAoYXJncykge1xuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcImFyZ3NcIiwgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xuICAgIH1cbiAgICBmZXRjaE9wdGlvbnMuaGVhZGVyc1tcIngtd2FpbHMtY2xpZW50LWlkXCJdID0gY2xpZW50SWQ7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBmZXRjaCh1cmwsIGZldGNoT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgY29udGVudCB0eXBlXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKSAmJiByZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlamVjdChFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiByZXNvbHZlKGRhdGEpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHJlamVjdChlcnJvcikpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBydW50aW1lQ2FsbFdpdGhJRChvYmplY3RJRCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKSB7XG4gICAgbGV0IHVybCA9IG5ldyBVUkwocnVudGltZVVSTCk7XG4gICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJvYmplY3RcIiwgb2JqZWN0SUQpO1xuICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwibWV0aG9kXCIsIG1ldGhvZCk7XG4gICAgbGV0IGZldGNoT3B0aW9ucyA9IHtcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgfTtcbiAgICBpZiAod2luZG93TmFtZSkge1xuICAgICAgICBmZXRjaE9wdGlvbnMuaGVhZGVyc1tcIngtd2FpbHMtd2luZG93LW5hbWVcIl0gPSB3aW5kb3dOYW1lO1xuICAgIH1cbiAgICBpZiAoYXJncykge1xuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcImFyZ3NcIiwgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xuICAgIH1cbiAgICBmZXRjaE9wdGlvbnMuaGVhZGVyc1tcIngtd2FpbHMtY2xpZW50LWlkXCJdID0gY2xpZW50SWQ7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZmV0Y2godXJsLCBmZXRjaE9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGNvbnRlbnQgdHlwZVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikgJiYgcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikuaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWplY3QoRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcmVzb2x2ZShkYXRhKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKTtcbiAgICB9KTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG4vKipcbiAqIEZldGNoZXMgYXBwbGljYXRpb24gY2FwYWJpbGl0aWVzIGZyb20gdGhlIHNlcnZlci5cbiAqXG4gKiBAYXN5bmNcbiAqIEBmdW5jdGlvbiBDYXBhYmlsaXRpZXNcbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBjYXBhYmlsaXRpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYXBhYmlsaXRpZXMoKSB7XG4gICAgcmV0dXJuIGZldGNoKFwiL3dhaWxzL2NhcGFiaWxpdGllc1wiKS50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBXaW5kb3dzLlxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cywgb3RoZXJ3aXNlIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNXaW5kb3dzKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcIndpbmRvd3NcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBMaW51eC5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgTGludXgsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTGludXgoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuT1MgPT09IFwibGludXhcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgYSBtYWNPUyBvcGVyYXRpbmcgc3lzdGVtLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBlbnZpcm9ubWVudCBpcyBtYWNPUywgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNYWMoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuT1MgPT09IFwiZGFyd2luXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGFyY2hpdGVjdHVyZSBpcyBBTUQ2NC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGFyY2hpdGVjdHVyZSBpcyBBTUQ2NCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNBTUQ2NCgpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5BcmNoID09PSBcImFtZDY0XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGFyY2hpdGVjdHVyZSBpcyBBUk0uXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGN1cnJlbnQgYXJjaGl0ZWN0dXJlIGlzIEFSTSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNBUk0oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuQXJjaCA9PT0gXCJhcm1cIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgQVJNNjQgYXJjaGl0ZWN0dXJlLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIFJldHVybnMgdHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgQVJNNjQgYXJjaGl0ZWN0dXJlLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQVJNNjQoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuQXJjaCA9PT0gXCJhcm02NFwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpcyBpbiBkZWJ1ZyBtb2RlLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIFJldHVybnMgdHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgaW4gZGVidWcgbW9kZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0RlYnVnKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkRlYnVnID09PSB0cnVlO1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7bmV3UnVudGltZUNhbGxlcldpdGhJRCwgb2JqZWN0TmFtZXN9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7SXNEZWJ1Z30gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5cbi8vIHNldHVwXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBjb250ZXh0TWVudUhhbmRsZXIpO1xuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcldpdGhJRChvYmplY3ROYW1lcy5Db250ZXh0TWVudSwgJycpO1xuY29uc3QgQ29udGV4dE1lbnVPcGVuID0gMDtcblxuZnVuY3Rpb24gb3BlbkNvbnRleHRNZW51KGlkLCB4LCB5LCBkYXRhKSB7XG4gICAgdm9pZCBjYWxsKENvbnRleHRNZW51T3Blbiwge2lkLCB4LCB5LCBkYXRhfSk7XG59XG5cbmZ1bmN0aW9uIGNvbnRleHRNZW51SGFuZGxlcihldmVudCkge1xuICAgIC8vIENoZWNrIGZvciBjdXN0b20gY29udGV4dCBtZW51XG4gICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IGN1c3RvbUNvbnRleHRNZW51ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tY3VzdG9tLWNvbnRleHRtZW51XCIpO1xuICAgIGN1c3RvbUNvbnRleHRNZW51ID0gY3VzdG9tQ29udGV4dE1lbnUgPyBjdXN0b21Db250ZXh0TWVudS50cmltKCkgOiBcIlwiO1xuICAgIGlmIChjdXN0b21Db250ZXh0TWVudSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsZXQgY3VzdG9tQ29udGV4dE1lbnVEYXRhID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tY3VzdG9tLWNvbnRleHRtZW51LWRhdGFcIik7XG4gICAgICAgIG9wZW5Db250ZXh0TWVudShjdXN0b21Db250ZXh0TWVudSwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgY3VzdG9tQ29udGV4dE1lbnVEYXRhKTtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcHJvY2Vzc0RlZmF1bHRDb250ZXh0TWVudShldmVudCk7XG59XG5cblxuLypcbi0tZGVmYXVsdC1jb250ZXh0bWVudTogYXV0bzsgKGRlZmF1bHQpIHdpbGwgc2hvdyB0aGUgZGVmYXVsdCBjb250ZXh0IG1lbnUgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWUgT1IgdGV4dCBoYXMgYmVlbiBzZWxlY3RlZCBPUiBlbGVtZW50IGlzIGlucHV0IG9yIHRleHRhcmVhXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IHNob3c7IHdpbGwgYWx3YXlzIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51XG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IGhpZGU7IHdpbGwgYWx3YXlzIGhpZGUgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51XG5cblRoaXMgcnVsZSBpcyBpbmhlcml0ZWQgbGlrZSBub3JtYWwgQ1NTIHJ1bGVzLCBzbyBuZXN0aW5nIHdvcmtzIGFzIGV4cGVjdGVkXG4qL1xuZnVuY3Rpb24gcHJvY2Vzc0RlZmF1bHRDb250ZXh0TWVudShldmVudCkge1xuXG4gICAgLy8gRGVidWcgYnVpbGRzIGFsd2F5cyBzaG93IHRoZSBtZW51XG4gICAgaWYgKElzRGVidWcoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyBkZWZhdWx0IGNvbnRleHQgbWVudVxuICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuICAgIGNvbnN0IGRlZmF1bHRDb250ZXh0TWVudUFjdGlvbiA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShcIi0tZGVmYXVsdC1jb250ZXh0bWVudVwiKS50cmltKCk7XG4gICAgc3dpdGNoIChkZWZhdWx0Q29udGV4dE1lbnVBY3Rpb24pIHtcbiAgICAgICAgY2FzZSBcInNob3dcIjpcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY2FzZSBcImhpZGVcIjpcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBjb250ZW50RWRpdGFibGUgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNDb250ZW50RWRpdGFibGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRleHQgaGFzIGJlZW4gc2VsZWN0ZWRcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IGhhc1NlbGVjdGlvbiA9IChzZWxlY3Rpb24udG9TdHJpbmcoKS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgaWYgKGhhc1NlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0aW9uLnJhbmdlQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KGkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWN0cyA9IHJhbmdlLmdldENsaWVudFJlY3RzKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVjdHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY3QgPSByZWN0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHJlY3QubGVmdCwgcmVjdC50b3ApID09PSBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGFnbmFtZSBpcyBpbnB1dCBvciB0ZXh0YXJlYVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gXCJJTlBVVFwiIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gXCJURVhUQVJFQVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc1NlbGVjdGlvbiB8fCAoIWVsZW1lbnQucmVhZE9ubHkgJiYgIWVsZW1lbnQuZGlzYWJsZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGhpZGUgZGVmYXVsdCBjb250ZXh0IG1lbnVcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkgZnJvbSB0aGUgZmxhZyBtYXAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleVN0cmluZyAtIFRoZSBrZXkgdG8gcmV0cmlldmUgdGhlIHZhbHVlIGZvci5cbiAqIEByZXR1cm4geyp9IC0gVGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEZsYWcoa2V5U3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZmxhZ3Nba2V5U3RyaW5nXTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byByZXRyaWV2ZSBmbGFnICdcIiArIGtleVN0cmluZyArIFwiJzogXCIgKyBlKTtcbiAgICB9XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHtpbnZva2V9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7SXNXaW5kb3dzfSBmcm9tIFwiLi9zeXN0ZW0uanNcIjtcbmltcG9ydCB7R2V0RmxhZ30gZnJvbSBcIi4vZmxhZ3MuanNcIjtcblxuLy8gU2V0dXBcbmxldCBzaG91bGREcmFnID0gZmFsc2U7XG5sZXQgcmVzaXphYmxlID0gZmFsc2U7XG5sZXQgcmVzaXplRWRnZSA9IG51bGw7XG5sZXQgZGVmYXVsdEN1cnNvciA9IFwiYXV0b1wiO1xuXG53aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcblxud2luZG93Ll93YWlscy5zZXRSZXNpemFibGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJlc2l6YWJsZSA9IHZhbHVlO1xufTtcblxud2luZG93Ll93YWlscy5lbmREcmFnID0gZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xufTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uTW91c2VEb3duKTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XG5cblxuZnVuY3Rpb24gZHJhZ1Rlc3QoZSkge1xuICAgIGxldCB2YWwgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlLnRhcmdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0td2FpbHMtZHJhZ2dhYmxlXCIpO1xuICAgIGxldCBtb3VzZVByZXNzZWQgPSBlLmJ1dHRvbnMgIT09IHVuZGVmaW5lZCA/IGUuYnV0dG9ucyA6IGUud2hpY2g7XG4gICAgaWYgKCF2YWwgfHwgdmFsID09PSBcIlwiIHx8IHZhbC50cmltKCkgIT09IFwiZHJhZ1wiIHx8IG1vdXNlUHJlc3NlZCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBlLmRldGFpbCA9PT0gMTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZURvd24oZSkge1xuXG4gICAgLy8gQ2hlY2sgZm9yIHJlc2l6aW5nXG4gICAgaWYgKHJlc2l6ZUVkZ2UpIHtcbiAgICAgICAgaW52b2tlKFwicmVzaXplOlwiICsgcmVzaXplRWRnZSk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChkcmFnVGVzdChlKSkge1xuICAgICAgICAvLyBUaGlzIGNoZWNrcyBmb3IgY2xpY2tzIG9uIHRoZSBzY3JvbGwgYmFyXG4gICAgICAgIGlmIChlLm9mZnNldFggPiBlLnRhcmdldC5jbGllbnRXaWR0aCB8fCBlLm9mZnNldFkgPiBlLnRhcmdldC5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzaG91bGREcmFnID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzaG91bGREcmFnID0gZmFsc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbk1vdXNlVXAoKSB7XG4gICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBzZXRSZXNpemUoY3Vyc29yKSB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLmN1cnNvciA9IGN1cnNvciB8fCBkZWZhdWx0Q3Vyc29yO1xuICAgIHJlc2l6ZUVkZ2UgPSBjdXJzb3I7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VNb3ZlKGUpIHtcbiAgICBpZiAoc2hvdWxkRHJhZykge1xuICAgICAgICBzaG91bGREcmFnID0gZmFsc2U7XG4gICAgICAgIGxldCBtb3VzZVByZXNzZWQgPSBlLmJ1dHRvbnMgIT09IHVuZGVmaW5lZCA/IGUuYnV0dG9ucyA6IGUud2hpY2g7XG4gICAgICAgIGlmIChtb3VzZVByZXNzZWQgPiAwKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJkcmFnXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghcmVzaXphYmxlIHx8ICFJc1dpbmRvd3MoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkZWZhdWx0Q3Vyc29yID09IG51bGwpIHtcbiAgICAgICAgZGVmYXVsdEN1cnNvciA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5jdXJzb3I7XG4gICAgfVxuICAgIGxldCByZXNpemVIYW5kbGVIZWlnaHQgPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZUhlaWdodFwiKSB8fCA1O1xuICAgIGxldCByZXNpemVIYW5kbGVXaWR0aCA9IEdldEZsYWcoXCJzeXN0ZW0ucmVzaXplSGFuZGxlV2lkdGhcIikgfHwgNTtcblxuICAgIC8vIEV4dHJhIHBpeGVscyBmb3IgdGhlIGNvcm5lciBhcmVhc1xuICAgIGxldCBjb3JuZXJFeHRyYSA9IEdldEZsYWcoXCJyZXNpemVDb3JuZXJFeHRyYVwiKSB8fCAxMDtcblxuICAgIGxldCByaWdodEJvcmRlciA9IHdpbmRvdy5vdXRlcldpZHRoIC0gZS5jbGllbnRYIDwgcmVzaXplSGFuZGxlV2lkdGg7XG4gICAgbGV0IGxlZnRCb3JkZXIgPSBlLmNsaWVudFggPCByZXNpemVIYW5kbGVXaWR0aDtcbiAgICBsZXQgdG9wQm9yZGVyID0gZS5jbGllbnRZIDwgcmVzaXplSGFuZGxlSGVpZ2h0O1xuICAgIGxldCBib3R0b21Cb3JkZXIgPSB3aW5kb3cub3V0ZXJIZWlnaHQgLSBlLmNsaWVudFkgPCByZXNpemVIYW5kbGVIZWlnaHQ7XG5cbiAgICAvLyBBZGp1c3QgZm9yIGNvcm5lcnNcbiAgICBsZXQgcmlnaHRDb3JuZXIgPSB3aW5kb3cub3V0ZXJXaWR0aCAtIGUuY2xpZW50WCA8IChyZXNpemVIYW5kbGVXaWR0aCArIGNvcm5lckV4dHJhKTtcbiAgICBsZXQgbGVmdENvcm5lciA9IGUuY2xpZW50WCA8IChyZXNpemVIYW5kbGVXaWR0aCArIGNvcm5lckV4dHJhKTtcbiAgICBsZXQgdG9wQ29ybmVyID0gZS5jbGllbnRZIDwgKHJlc2l6ZUhhbmRsZUhlaWdodCArIGNvcm5lckV4dHJhKTtcbiAgICBsZXQgYm90dG9tQ29ybmVyID0gd2luZG93Lm91dGVySGVpZ2h0IC0gZS5jbGllbnRZIDwgKHJlc2l6ZUhhbmRsZUhlaWdodCArIGNvcm5lckV4dHJhKTtcblxuICAgIC8vIElmIHdlIGFyZW4ndCBvbiBhbiBlZGdlLCBidXQgd2VyZSwgcmVzZXQgdGhlIGN1cnNvciB0byBkZWZhdWx0XG4gICAgaWYgKCFsZWZ0Qm9yZGVyICYmICFyaWdodEJvcmRlciAmJiAhdG9wQm9yZGVyICYmICFib3R0b21Cb3JkZXIgJiYgcmVzaXplRWRnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNldFJlc2l6ZSgpO1xuICAgIH1cbiAgICAvLyBBZGp1c3RlZCBmb3IgY29ybmVyIGFyZWFzXG4gICAgZWxzZSBpZiAocmlnaHRDb3JuZXIgJiYgYm90dG9tQ29ybmVyKSBzZXRSZXNpemUoXCJzZS1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAobGVmdENvcm5lciAmJiBib3R0b21Db3JuZXIpIHNldFJlc2l6ZShcInN3LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChsZWZ0Q29ybmVyICYmIHRvcENvcm5lcikgc2V0UmVzaXplKFwibnctcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKHRvcENvcm5lciAmJiByaWdodENvcm5lcikgc2V0UmVzaXplKFwibmUtcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGxlZnRCb3JkZXIpIHNldFJlc2l6ZShcInctcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKHRvcEJvcmRlcikgc2V0UmVzaXplKFwibi1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAoYm90dG9tQm9yZGVyKSBzZXRSZXNpemUoXCJzLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChyaWdodEJvcmRlcikgc2V0UmVzaXplKFwiZS1yZXNpemVcIik7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHtuZXdSdW50aW1lQ2FsbGVyV2l0aElELCBvYmplY3ROYW1lc30gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuaW1wb3J0IHtuYW5vaWR9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xuXG4vLyBTZXR1cFxud2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XG53aW5kb3cuX3dhaWxzLmNhbGxSZXN1bHRIYW5kbGVyID0gcmVzdWx0SGFuZGxlcjtcbndpbmRvdy5fd2FpbHMuY2FsbEVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlcjtcblxuY29uc3QgQ2FsbEJpbmRpbmcgPSAwO1xuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0TmFtZXMuQ2FsbCwgJycpO1xuY29uc3QgY2FuY2VsQ2FsbCA9IG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0TmFtZXMuQ2FuY2VsQ2FsbCwgJycpO1xubGV0IGNhbGxSZXNwb25zZXMgPSBuZXcgTWFwKCk7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdW5pcXVlIElEIHVzaW5nIHRoZSBuYW5vaWQgbGlicmFyeS5cbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gQSB1bmlxdWUgSUQgdGhhdCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgY2FsbFJlc3BvbnNlcyBzZXQuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlSUQoKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBkbyB7XG4gICAgICAgIHJlc3VsdCA9IG5hbm9pZCgpO1xuICAgIH0gd2hpbGUgKGNhbGxSZXNwb25zZXMuaGFzKHJlc3VsdCkpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogSGFuZGxlcyB0aGUgcmVzdWx0IG9mIGEgY2FsbCByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgcmVxdWVzdCB0byBoYW5kbGUgdGhlIHJlc3VsdCBmb3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIFRoZSByZXN1bHQgZGF0YSBvZiB0aGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNKU09OIC0gSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRhdGEgaXMgSlNPTiBvciBub3QuXG4gKlxuICogQHJldHVybiB7dW5kZWZpbmVkfSAtIFRoaXMgbWV0aG9kIGRvZXMgbm90IHJldHVybiBhbnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHJlc3VsdEhhbmRsZXIoaWQsIGRhdGEsIGlzSlNPTikge1xuICAgIGNvbnN0IHByb21pc2VIYW5kbGVyID0gZ2V0QW5kRGVsZXRlUmVzcG9uc2UoaWQpO1xuICAgIGlmIChwcm9taXNlSGFuZGxlcikge1xuICAgICAgICBwcm9taXNlSGFuZGxlci5yZXNvbHZlKGlzSlNPTiA/IEpTT04ucGFyc2UoZGF0YSkgOiBkYXRhKTtcbiAgICB9XG59XG5cbi8qKlxuICogSGFuZGxlcyB0aGUgZXJyb3IgZnJvbSBhIGNhbGwgcmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHByb21pc2UgaGFuZGxlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIGVycm9yIG1lc3NhZ2UgdG8gcmVqZWN0IHRoZSBwcm9taXNlIGhhbmRsZXIgd2l0aC5cbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5mdW5jdGlvbiBlcnJvckhhbmRsZXIoaWQsIG1lc3NhZ2UpIHtcbiAgICBjb25zdCBwcm9taXNlSGFuZGxlciA9IGdldEFuZERlbGV0ZVJlc3BvbnNlKGlkKTtcbiAgICBpZiAocHJvbWlzZUhhbmRsZXIpIHtcbiAgICAgICAgcHJvbWlzZUhhbmRsZXIucmVqZWN0KG1lc3NhZ2UpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYW5kIHJlbW92ZXMgdGhlIHJlc3BvbnNlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gSUQgZnJvbSB0aGUgY2FsbFJlc3BvbnNlcyBtYXAuXG4gKlxuICogQHBhcmFtIHthbnl9IGlkIC0gVGhlIElEIG9mIHRoZSByZXNwb25zZSB0byBiZSByZXRyaWV2ZWQgYW5kIHJlbW92ZWQuXG4gKlxuICogQHJldHVybnMge2FueX0gVGhlIHJlc3BvbnNlIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIElELlxuICovXG5mdW5jdGlvbiBnZXRBbmREZWxldGVSZXNwb25zZShpZCkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gY2FsbFJlc3BvbnNlcy5nZXQoaWQpO1xuICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBjYWxsIHVzaW5nIHRoZSBwcm92aWRlZCB0eXBlIGFuZCBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gdHlwZSAtIFRoZSB0eXBlIG9mIGNhbGwgdG8gZXhlY3V0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBBZGRpdGlvbmFsIG9wdGlvbnMgZm9yIHRoZSBjYWxsLlxuICogQHJldHVybiB7UHJvbWlzZX0gLSBBIHByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9yIHJlamVjdGVkIGJhc2VkIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNhbGwuIEl0IGFsc28gaGFzIGEgY2FuY2VsIG1ldGhvZCB0byBjYW5jZWwgYSBsb25nIHJ1bm5pbmcgcmVxdWVzdC5cbiAqL1xuZnVuY3Rpb24gY2FsbEJpbmRpbmcodHlwZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgaWQgPSBnZW5lcmF0ZUlEKCk7XG4gICAgY29uc3QgZG9DYW5jZWwgPSAoKSA9PiB7IHJldHVybiBjYW5jZWxDYWxsKHR5cGUsIHtcImNhbGwtaWRcIjogaWR9KSB9O1xuICAgIGxldCBxdWV1ZWRDYW5jZWwgPSBmYWxzZSwgY2FsbFJ1bm5pbmcgPSBmYWxzZTtcbiAgICBsZXQgcCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgb3B0aW9uc1tcImNhbGwtaWRcIl0gPSBpZDtcbiAgICAgICAgY2FsbFJlc3BvbnNlcy5zZXQoaWQsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgICBjYWxsKHR5cGUsIG9wdGlvbnMpLlxuICAgICAgICAgICAgdGhlbigoXykgPT4ge1xuICAgICAgICAgICAgICAgIGNhbGxSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWVkQ2FuY2VsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb0NhbmNlbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLlxuICAgICAgICAgICAgY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICBjYWxsUmVzcG9uc2VzLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBwLmNhbmNlbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKGNhbGxSdW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9DYW5jZWwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXVlZENhbmNlbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHA7XG59XG5cbi8qKlxuICogQ2FsbCBtZXRob2QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBUaGUgb3B0aW9ucyBmb3IgdGhlIG1ldGhvZC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gVGhlIHJlc3VsdCBvZiB0aGUgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENhbGwob3B0aW9ucykge1xuICAgIHJldHVybiBjYWxsQmluZGluZyhDYWxsQmluZGluZywgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBtZXRob2QgYnkgbmFtZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgaW4gdGhlIGZvcm1hdCAncGFja2FnZS5zdHJ1Y3QubWV0aG9kJy5cbiAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kLlxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBuYW1lIGlzIG5vdCBhIHN0cmluZyBvciBpcyBub3QgaW4gdGhlIGNvcnJlY3QgZm9ybWF0LlxuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHQgb2YgdGhlIG1ldGhvZCBleGVjdXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCeU5hbWUobmFtZSwgLi4uYXJncykge1xuICAgIC8vIFBhY2thZ2UgcGF0aHMgbWF5IGNvbnRhaW4gZG90czogc3BsaXQgd2l0aCBjdXN0b20gY29kZVxuICAgIC8vIHRvIGVuc3VyZSBvbmx5IHRoZSBsYXN0IHR3byBkb3RzIGFyZSB0YWtlbiBpbnRvIGFjY291bnQuXG4gICAgbGV0IG1ldGhvZERvdCA9IC0xLCBzdHJ1Y3REb3QgPSAtMTtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgbWV0aG9kRG90ID0gbmFtZS5sYXN0SW5kZXhPZihcIi5cIik7XG4gICAgICAgIGlmIChtZXRob2REb3QgPiAwKVxuICAgICAgICAgICAgc3RydWN0RG90ID0gbmFtZS5sYXN0SW5kZXhPZihcIi5cIiwgbWV0aG9kRG90IC0gMSk7XG4gICAgfVxuXG4gICAgaWYgKG1ldGhvZERvdCA8IDAgfHwgc3RydWN0RG90IDwgMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsQnlOYW1lIHJlcXVpcmVzIGEgc3RyaW5nIGluIHRoZSBmb3JtYXQgJ3BhY2thZ2VQYXRoLnN0cnVjdC5tZXRob2QnXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhY2thZ2VQYXRoID0gbmFtZS5zbGljZSgwLCBzdHJ1Y3REb3QpLFxuICAgICAgICAgIHN0cnVjdE5hbWUgPSBuYW1lLnNsaWNlKHN0cnVjdERvdCArIDEsIG1ldGhvZERvdCksXG4gICAgICAgICAgbWV0aG9kTmFtZSA9IG5hbWUuc2xpY2UobWV0aG9kRG90ICsgMSk7XG5cbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIHtcbiAgICAgICAgcGFja2FnZVBhdGgsXG4gICAgICAgIHN0cnVjdE5hbWUsXG4gICAgICAgIG1ldGhvZE5hbWUsXG4gICAgICAgIGFyZ3NcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBieSBpdHMgSUQgd2l0aCB0aGUgc3BlY2lmaWVkIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbWV0aG9kSUQgLSBUaGUgSUQgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJuIHsqfSAtIFRoZSByZXN1bHQgb2YgdGhlIG1ldGhvZCBjYWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQnlJRChtZXRob2RJRCwgLi4uYXJncykge1xuICAgIHJldHVybiBjYWxsQmluZGluZyhDYWxsQmluZGluZywge1xuICAgICAgICBtZXRob2RJRCxcbiAgICAgICAgYXJnc1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9uIGEgcGx1Z2luLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbHVnaW5OYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHBsdWdpbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2ROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJucyB7Kn0gLSBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBsdWdpbihwbHVnaW5OYW1lLCBtZXRob2ROYW1lLCAuLi5hcmdzKSB7XG4gICAgcmV0dXJuIGNhbGxCaW5kaW5nKENhbGxCaW5kaW5nLCB7XG4gICAgICAgIHBhY2thZ2VOYW1lOiBcIndhaWxzLXBsdWdpbnNcIixcbiAgICAgICAgc3RydWN0TmFtZTogcGx1Z2luTmFtZSxcbiAgICAgICAgbWV0aG9kTmFtZSxcbiAgICAgICAgYXJnc1xuICAgIH0pO1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbi8qKlxuICogQW55IGlzIGEgZHVtbXkgY3JlYXRpb24gZnVuY3Rpb24gZm9yIHNpbXBsZSBvciB1bmtub3duIHR5cGVzLlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7YW55fSBzb3VyY2VcbiAqIEByZXR1cm5zIHtUfVxuICovXG5leHBvcnQgZnVuY3Rpb24gQW55KHNvdXJjZSkge1xuICAgIHJldHVybiAvKiogQHR5cGUge1R9ICovKHNvdXJjZSk7XG59XG5cbi8qKlxuICogQXJyYXkgdGFrZXMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcnJheVxuICogd2hvc2UgZWxlbWVudHMgYXJlIG9mIHRoYXQgdHlwZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geyhhbnkpID0+IFR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHsoYW55KSA9PiBUW119XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IEFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IFtdIDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvdXJjZVtpXSA9IGVsZW1lbnQoc291cmNlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogTWFwIHRha2VzIGNyZWF0aW9uIGZ1bmN0aW9ucyBmb3IgdHdvIGFyYml0cmFyeSB0eXBlc1xuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIG9iamVjdFxuICogd2hvc2Uga2V5cyBhbmQgdmFsdWVzIGFyZSBvZiB0aG9zZSB0eXBlcy5cbiAqIEB0ZW1wbGF0ZSBLLCBWXG4gKiBAcGFyYW0geyhhbnkpID0+IEt9IGtleVxuICogQHBhcmFtIHsoYW55KSA9PiBWfSB2YWx1ZVxuICogQHJldHVybnMgeyhhbnkpID0+IHsgW186IEtdOiBWIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNYXAoa2V5LCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gQW55KSB7XG4gICAgICAgIHJldHVybiAoc291cmNlKSA9PiAoc291cmNlID09PSBudWxsID8ge30gOiBzb3VyY2UpO1xuICAgIH1cblxuICAgIHJldHVybiAoc291cmNlKSA9PiB7XG4gICAgICAgIGlmIChzb3VyY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIHNvdXJjZVtrZXldID0gdmFsdWUoc291cmNlW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBOdWxsYWJsZSB0YWtlcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxuICogYW5kIHJldHVybnMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYSBudWxsYWJsZSB2YWx1ZSBvZiB0aGF0IHR5cGUuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHsoYW55KSA9PiBUfSBlbGVtZW50XG4gKiBAcmV0dXJucyB7KGFueSkgPT4gKFQgfCBudWxsKX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bGxhYmxlKGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudCA9PT0gQW55KSB7XG4gICAgICAgIHJldHVybiBBbnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzb3VyY2UpID0+IChzb3VyY2UgPT09IG51bGwgPyBudWxsIDogZWxlbWVudChzb3VyY2UpKTtcbn1cblxuLyoqXG4gKiBTdHJ1Y3QgdGFrZXMgYW4gb2JqZWN0IG1hcHBpbmcgZmllbGQgbmFtZXMgdG8gY3JlYXRpb24gZnVuY3Rpb25zXG4gKiBhbmQgcmV0dXJucyBhbiBpbi1wbGFjZSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYSBzdHJ1Y3QuXG4gKiBAdGVtcGxhdGUge3sgW186IHN0cmluZ106ICgoYW55KSA9PiBhbnkpIH19IFRcbiAqIEB0ZW1wbGF0ZSB7eyBbS2V5IGluIGtleW9mIFRdPzogUmV0dXJuVHlwZTxUW0tleV0+IH19IFVcbiAqIEBwYXJhbSB7VH0gY3JlYXRlRmllbGRcbiAqIEByZXR1cm5zIHsoYW55KSA9PiBVfVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RydWN0KGNyZWF0ZUZpZWxkKSB7XG4gICAgbGV0IGFsbEFueSA9IHRydWU7XG4gICAgZm9yIChjb25zdCBuYW1lIGluIGNyZWF0ZUZpZWxkKSB7XG4gICAgICAgIGlmIChjcmVhdGVGaWVsZFtuYW1lXSAhPT0gQW55KSB7XG4gICAgICAgICAgICBhbGxBbnkgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbGxBbnkpIHtcbiAgICAgICAgcmV0dXJuIEFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gY3JlYXRlRmllbGQpIHtcbiAgICAgICAgICAgIGlmIChuYW1lIGluIHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHNvdXJjZVtuYW1lXSA9IGNyZWF0ZUZpZWxkW25hbWVdKHNvdXJjZVtuYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9O1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vLyBTZXR1cFxud2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XG5cbmltcG9ydCBcIi4vY29udGV4dG1lbnUuanNcIjtcbmltcG9ydCBcIi4vZHJhZy5qc1wiO1xuXG4vLyBSZS1leHBvcnQgKGludGVybmFsKSBwdWJsaWMgQVBJXG5leHBvcnQgKiBhcyBDYWxsIGZyb20gXCIuL2NhbGwuanNcIjtcbmV4cG9ydCAqIGFzIENyZWF0ZSBmcm9tIFwiLi9jcmVhdGUuanNcIjtcbmV4cG9ydCAqIGFzIEZsYWdzIGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5leHBvcnQgKiBhcyBTeXN0ZW0gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5cbmltcG9ydCB7aW52b2tlfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5cbi8vIFByb3ZpZGUgZHVtbXkgZXZlbnQgbGlzdGVuZXIuXG5pZiAoIShcImRpc3BhdGNoV2FpbHNFdmVudFwiIGluIHdpbmRvdy5fd2FpbHMpKSB7XG4gICAgd2luZG93Ll93YWlscy5kaXNwYXRjaFdhaWxzRXZlbnQgPSBmdW5jdGlvbiAoKSB7fTtcbn1cblxuLy8gTm90aWZ5IGJhY2tlbmRcbndpbmRvdy5fd2FpbHMuaW52b2tlID0gaW52b2tlO1xuaW52b2tlKFwid2FpbHM6cnVudGltZTpyZWFkeVwiKTtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG4vKipcbiAqIE9wZW5VUkwgb3BlbnMgYSBicm93c2VyIHdpbmRvdyB0byB0aGUgZ2l2ZW4gVVJMLlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPcGVuVVJMKHVybCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDE0MTQwODE4NSwgdXJsKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi4vY29yZS9jYWxsLmpzXCI7XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHtDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZX0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuLyoqXG4gKiBTZXRUZXh0IHdyaXRlcyB0aGUgZ2l2ZW4gc3RyaW5nIHRvIHRoZSBDbGlwYm9hcmQuXG4gKiBJdCByZXR1cm5zIHRydWUgaWYgdGhlIG9wZXJhdGlvbiBzdWNjZWVkZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRleHQodGV4dCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoOTQwNTczNzQ5LCB0ZXh0KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBUZXh0IHJldHJpZXZlcyBhIHN0cmluZyBmcm9tIHRoZSBjbGlwYm9hcmQuXG4gKiBJZiB0aGUgb3BlcmF0aW9uIGZhaWxzLCBpdCByZXR1cm5zIG51bGwuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmcgfCBudWxsPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRleHQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNDkyMzg2MjEpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGV9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuLi9jb3JlL2NyZWF0ZS5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGV9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmltcG9ydCAqIGFzICRtb2RlbHMgZnJvbSBcIi4vbW9kZWxzLmpzXCI7XG5cbi8qKlxuICogRXJyb3Igc2hvd3MgYSBtb2RhbCBkaWFsb2cgY29udGFpbmluZyBhbiBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRXJyb3Iob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjUwODg2Mjg5NSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogSW5mbyBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGFuIGluZm9ybWF0aW9uYWwgbWVzc2FnZS5cbiAqIEBwYXJhbSB7JG1vZGVscy5NZXNzYWdlRGlhbG9nT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEluZm8ob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDA4MzEwODMsIG9wdGlvbnMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE9wZW5GaWxlIHNob3dzIGEgZGlhbG9nIHRoYXQgYWxsb3dzIHRoZSB1c2VyXG4gKiB0byBzZWxlY3Qgb25lIG9yIG1vcmUgZmlsZXMgdG8gb3Blbi5cbiAqIEl0IG1heSB0aHJvdyBhbiBleGNlcHRpb24gaW4gY2FzZSBvZiBlcnJvcnMuXG4gKiBJdCByZXR1cm5zIGEgc3RyaW5nIGluIHNpbmdsZSBzZWxlY3Rpb24gbW9kZSxcbiAqIGFuIGFycmF5IG9mIHN0cmluZ3MgaW4gbXVsdGlwbGUgc2VsZWN0aW9uIG1vZGUuXG4gKiBAcGFyYW0geyRtb2RlbHMuT3BlbkZpbGVEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjk1ODU3MTEwMSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUXVlc3Rpb24gc2hvd3MgYSBtb2RhbCBkaWFsb2cgYXNraW5nIGEgcXVlc3Rpb24uXG4gKiBAcGFyYW0geyRtb2RlbHMuTWVzc2FnZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWVzdGlvbihvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMzc4MzgyMzk1LCBvcHRpb25zKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTYXZlRmlsZSBzaG93cyBhIGRpYWxvZyB0aGF0IGFsbG93cyB0aGUgdXNlclxuICogdG8gc2VsZWN0IGEgbG9jYXRpb24gd2hlcmUgYSBmaWxlIHNob3VsZCBiZSBzYXZlZC5cbiAqIEl0IG1heSB0aHJvdyBhbiBleGNlcHRpb24gaW4gY2FzZSBvZiBlcnJvcnMuXG4gKiBAcGFyYW0geyRtb2RlbHMuU2F2ZUZpbGVEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2F2ZUZpbGUob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTQ0MTc3MzY0NCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogV2FybmluZyBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGEgd2FybmluZyBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gV2FybmluZyhvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg5Mzg0NTQxMDUsIG9wdGlvbnMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGV9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuL2xpc3RlbmVyLmpzXCI7XG5cbi8qKlxuICogRW1pdCBlbWl0cyBhbiBldmVudCB1c2luZyB0aGUgZ2l2ZW4gZXZlbnQgb2JqZWN0LlxuICogWW91IGNhbiBwYXNzIGluIGluc3RhbmNlcyBvZiB0aGUgY2xhc3MgYFdhaWxzRXZlbnRgLlxuICogQHBhcmFtIHt7XCJuYW1lXCI6IHN0cmluZywgXCJkYXRhXCI6IGFueX19IGV2ZW50XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVtaXQoZXZlbnQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI0ODA2ODIzOTIsIGV2ZW50KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cbiIsICJcbmV4cG9ydCBjb25zdCBFdmVudFR5cGVzID0ge1xuXHRXaW5kb3dzOiB7XG5cdFx0U3lzdGVtVGhlbWVDaGFuZ2VkOiBcIndpbmRvd3M6U3lzdGVtVGhlbWVDaGFuZ2VkXCIsXG5cdFx0QVBNUG93ZXJTdGF0dXNDaGFuZ2U6IFwid2luZG93czpBUE1Qb3dlclN0YXR1c0NoYW5nZVwiLFxuXHRcdEFQTVN1c3BlbmQ6IFwid2luZG93czpBUE1TdXNwZW5kXCIsXG5cdFx0QVBNUmVzdW1lQXV0b21hdGljOiBcIndpbmRvd3M6QVBNUmVzdW1lQXV0b21hdGljXCIsXG5cdFx0QVBNUmVzdW1lU3VzcGVuZDogXCJ3aW5kb3dzOkFQTVJlc3VtZVN1c3BlbmRcIixcblx0XHRBUE1Qb3dlclNldHRpbmdDaGFuZ2U6IFwid2luZG93czpBUE1Qb3dlclNldHRpbmdDaGFuZ2VcIixcblx0XHRBcHBsaWNhdGlvblN0YXJ0ZWQ6IFwid2luZG93czpBcHBsaWNhdGlvblN0YXJ0ZWRcIixcblx0XHRXZWJWaWV3TmF2aWdhdGlvbkNvbXBsZXRlZDogXCJ3aW5kb3dzOldlYlZpZXdOYXZpZ2F0aW9uQ29tcGxldGVkXCIsXG5cdFx0V2luZG93SW5hY3RpdmU6IFwid2luZG93czpXaW5kb3dJbmFjdGl2ZVwiLFxuXHRcdFdpbmRvd0FjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0FjdGl2ZVwiLFxuXHRcdFdpbmRvd0NsaWNrQWN0aXZlOiBcIndpbmRvd3M6V2luZG93Q2xpY2tBY3RpdmVcIixcblx0XHRXaW5kb3dNYXhpbWlzZTogXCJ3aW5kb3dzOldpbmRvd01heGltaXNlXCIsXG5cdFx0V2luZG93VW5NYXhpbWlzZTogXCJ3aW5kb3dzOldpbmRvd1VuTWF4aW1pc2VcIixcblx0XHRXaW5kb3dGdWxsc2NyZWVuOiBcIndpbmRvd3M6V2luZG93RnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd1VuRnVsbHNjcmVlbjogXCJ3aW5kb3dzOldpbmRvd1VuRnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd1Jlc3RvcmU6IFwid2luZG93czpXaW5kb3dSZXN0b3JlXCIsXG5cdFx0V2luZG93TWluaW1pc2U6IFwid2luZG93czpXaW5kb3dNaW5pbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWluaW1pc2U6IFwid2luZG93czpXaW5kb3dVbk1pbmltaXNlXCIsXG5cdFx0V2luZG93Q2xvc2U6IFwid2luZG93czpXaW5kb3dDbG9zZVwiLFxuXHRcdFdpbmRvd1NldEZvY3VzOiBcIndpbmRvd3M6V2luZG93U2V0Rm9jdXNcIixcblx0XHRXaW5kb3dLaWxsRm9jdXM6IFwid2luZG93czpXaW5kb3dLaWxsRm9jdXNcIixcblx0XHRXaW5kb3dEcmFnRHJvcDogXCJ3aW5kb3dzOldpbmRvd0RyYWdEcm9wXCIsXG5cdFx0V2luZG93RHJhZ0VudGVyOiBcIndpbmRvd3M6V2luZG93RHJhZ0VudGVyXCIsXG5cdFx0V2luZG93RHJhZ0xlYXZlOiBcIndpbmRvd3M6V2luZG93RHJhZ0xlYXZlXCIsXG5cdFx0V2luZG93RHJhZ092ZXI6IFwid2luZG93czpXaW5kb3dEcmFnT3ZlclwiLFxuXHR9LFxuXHRNYWM6IHtcblx0XHRBcHBsaWNhdGlvbkRpZEJlY29tZUFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUVmZmVjdGl2ZUFwcGVhcmFuY2VcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUljb246IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlSWNvblwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVNjcmVlblBhcmFtZXRlcnM6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlU2NyZWVuUGFyYW1ldGVyc1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlU3RhdHVzQmFyRnJhbWU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlU3RhdHVzQmFyRnJhbWVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uXCIsXG5cdFx0QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IFwibWFjOkFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nXCIsXG5cdFx0QXBwbGljYXRpb25EaWRIaWRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZEhpZGVcIixcblx0XHRBcHBsaWNhdGlvbkRpZFJlc2lnbkFjdGl2ZU5vdGlmaWNhdGlvbjogXCJtYWM6QXBwbGljYXRpb25EaWRSZXNpZ25BY3RpdmVOb3RpZmljYXRpb25cIixcblx0XHRBcHBsaWNhdGlvbkRpZFVuaGlkZTogXCJtYWM6QXBwbGljYXRpb25EaWRVbmhpZGVcIixcblx0XHRBcHBsaWNhdGlvbkRpZFVwZGF0ZTogXCJtYWM6QXBwbGljYXRpb25EaWRVcGRhdGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxCZWNvbWVBY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEJlY29tZUFjdGl2ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbEZpbmlzaExhdW5jaGluZzogXCJtYWM6QXBwbGljYXRpb25XaWxsRmluaXNoTGF1bmNoaW5nXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsSGlkZTogXCJtYWM6QXBwbGljYXRpb25XaWxsSGlkZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFJlc2lnbkFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsUmVzaWduQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsVGVybWluYXRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxUZXJtaW5hdGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxVbmhpZGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFVuaGlkZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFVwZGF0ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVXBkYXRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VUaGVtZTogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VUaGVtZSFcIixcblx0XHRBcHBsaWNhdGlvblNob3VsZEhhbmRsZVJlb3BlbjogXCJtYWM6QXBwbGljYXRpb25TaG91bGRIYW5kbGVSZW9wZW4hXCIsXG5cdFx0V2luZG93RGlkQmVjb21lS2V5OiBcIm1hYzpXaW5kb3dEaWRCZWNvbWVLZXlcIixcblx0XHRXaW5kb3dEaWRCZWNvbWVNYWluOiBcIm1hYzpXaW5kb3dEaWRCZWNvbWVNYWluXCIsXG5cdFx0V2luZG93RGlkQmVnaW5TaGVldDogXCJtYWM6V2luZG93RGlkQmVnaW5TaGVldFwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUFscGhhOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VBbHBoYVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUJhY2tpbmdMb2NhdGlvbjogXCJtYWM6V2luZG93RGlkQ2hhbmdlQmFja2luZ0xvY2F0aW9uXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlQmFja2luZ1Byb3BlcnRpZXM6IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VDb2xsZWN0aW9uQmVoYXZpb3JcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOldpbmRvd0RpZENoYW5nZU9jY2x1c2lvblN0YXRlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlT3JkZXJpbmdNb2RlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VPcmRlcmluZ01vZGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW46IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnM6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnNcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW5Qcm9maWxlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5Qcm9maWxlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VQcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTaGFyaW5nVHlwZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2hhcmluZ1R5cGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTcGFjZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU3BhY2VcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTcGFjZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU3BhY2VPcmRlcmluZ01vZGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VUaXRsZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlVGl0bGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VUb29sYmFyOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VUb29sYmFyXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVmlzaWJpbGl0eTogXCJtYWM6V2luZG93RGlkQ2hhbmdlVmlzaWJpbGl0eVwiLFxuXHRcdFdpbmRvd0RpZERlbWluaWF0dXJpemU6IFwibWFjOldpbmRvd0RpZERlbWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dEaWRFbmRTaGVldDogXCJtYWM6V2luZG93RGlkRW5kU2hlZXRcIixcblx0XHRXaW5kb3dEaWRFbnRlckZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEVudGVyRnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZEVudGVyVmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd0RpZEVudGVyVmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dEaWRFeGl0RnVsbFNjcmVlbjogXCJtYWM6V2luZG93RGlkRXhpdEZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRFeGl0VmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd0RpZEV4aXRWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd0RpZEV4cG9zZTogXCJtYWM6V2luZG93RGlkRXhwb3NlXCIsXG5cdFx0V2luZG93RGlkRm9jdXM6IFwibWFjOldpbmRvd0RpZEZvY3VzXCIsXG5cdFx0V2luZG93RGlkTWluaWF0dXJpemU6IFwibWFjOldpbmRvd0RpZE1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93RGlkTW92ZTogXCJtYWM6V2luZG93RGlkTW92ZVwiLFxuXHRcdFdpbmRvd0RpZE9yZGVyT2ZmU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRPcmRlck9mZlNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZE9yZGVyT25TY3JlZW46IFwibWFjOldpbmRvd0RpZE9yZGVyT25TY3JlZW5cIixcblx0XHRXaW5kb3dEaWRSZXNpZ25LZXk6IFwibWFjOldpbmRvd0RpZFJlc2lnbktleVwiLFxuXHRcdFdpbmRvd0RpZFJlc2lnbk1haW46IFwibWFjOldpbmRvd0RpZFJlc2lnbk1haW5cIixcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwibWFjOldpbmRvd0RpZFJlc2l6ZVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZTogXCJtYWM6V2luZG93RGlkVXBkYXRlXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlQWxwaGE6IFwibWFjOldpbmRvd0RpZFVwZGF0ZUFscGhhXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3JcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllczogXCJtYWM6V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVTaGFkb3c6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVNoYWRvd1wiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZVRpdGxlOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVUaXRsZVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZVRvb2xiYXI6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVRvb2xiYXJcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVWaXNpYmlsaXR5OiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVWaXNpYmlsaXR5XCIsXG5cdFx0V2luZG93U2hvdWxkQ2xvc2U6IFwibWFjOldpbmRvd1Nob3VsZENsb3NlIVwiLFxuXHRcdFdpbmRvd1dpbGxCZWNvbWVLZXk6IFwibWFjOldpbmRvd1dpbGxCZWNvbWVLZXlcIixcblx0XHRXaW5kb3dXaWxsQmVjb21lTWFpbjogXCJtYWM6V2luZG93V2lsbEJlY29tZU1haW5cIixcblx0XHRXaW5kb3dXaWxsQmVnaW5TaGVldDogXCJtYWM6V2luZG93V2lsbEJlZ2luU2hlZXRcIixcblx0XHRXaW5kb3dXaWxsQ2hhbmdlT3JkZXJpbmdNb2RlOiBcIm1hYzpXaW5kb3dXaWxsQ2hhbmdlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93V2lsbENsb3NlOiBcIm1hYzpXaW5kb3dXaWxsQ2xvc2VcIixcblx0XHRXaW5kb3dXaWxsRGVtaW5pYXR1cml6ZTogXCJtYWM6V2luZG93V2lsbERlbWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dXaWxsRW50ZXJGdWxsU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsRW50ZXJGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbEVudGVyVmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd1dpbGxFbnRlclZlcnNpb25Ccm93c2VyXCIsXG5cdFx0V2luZG93V2lsbEV4aXRGdWxsU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsRXhpdEZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dXaWxsRXhpdFZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dXaWxsRXhpdFZlcnNpb25Ccm93c2VyXCIsXG5cdFx0V2luZG93V2lsbEZvY3VzOiBcIm1hYzpXaW5kb3dXaWxsRm9jdXNcIixcblx0XHRXaW5kb3dXaWxsTWluaWF0dXJpemU6IFwibWFjOldpbmRvd1dpbGxNaW5pYXR1cml6ZVwiLFxuXHRcdFdpbmRvd1dpbGxNb3ZlOiBcIm1hYzpXaW5kb3dXaWxsTW92ZVwiLFxuXHRcdFdpbmRvd1dpbGxPcmRlck9mZlNjcmVlbjogXCJtYWM6V2luZG93V2lsbE9yZGVyT2ZmU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbE9yZGVyT25TY3JlZW46IFwibWFjOldpbmRvd1dpbGxPcmRlck9uU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbFJlc2lnbk1haW46IFwibWFjOldpbmRvd1dpbGxSZXNpZ25NYWluXCIsXG5cdFx0V2luZG93V2lsbFJlc2l6ZTogXCJtYWM6V2luZG93V2lsbFJlc2l6ZVwiLFxuXHRcdFdpbmRvd1dpbGxVbmZvY3VzOiBcIm1hYzpXaW5kb3dXaWxsVW5mb2N1c1wiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGU6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlQWxwaGE6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVBbHBoYVwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3I6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3JcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXM6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllc1wiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVTaGFkb3c6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVTaGFkb3dcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVGl0bGU6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVUaXRsZVwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVUb29sYmFyOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVG9vbGJhclwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVWaXNpYmlsaXR5OiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVmlzaWJpbGl0eVwiLFxuXHRcdFdpbmRvd1dpbGxVc2VTdGFuZGFyZEZyYW1lOiBcIm1hYzpXaW5kb3dXaWxsVXNlU3RhbmRhcmRGcmFtZVwiLFxuXHRcdE1lbnVXaWxsT3BlbjogXCJtYWM6TWVudVdpbGxPcGVuXCIsXG5cdFx0TWVudURpZE9wZW46IFwibWFjOk1lbnVEaWRPcGVuXCIsXG5cdFx0TWVudURpZENsb3NlOiBcIm1hYzpNZW51RGlkQ2xvc2VcIixcblx0XHRNZW51V2lsbFNlbmRBY3Rpb246IFwibWFjOk1lbnVXaWxsU2VuZEFjdGlvblwiLFxuXHRcdE1lbnVEaWRTZW5kQWN0aW9uOiBcIm1hYzpNZW51RGlkU2VuZEFjdGlvblwiLFxuXHRcdE1lbnVXaWxsSGlnaGxpZ2h0SXRlbTogXCJtYWM6TWVudVdpbGxIaWdobGlnaHRJdGVtXCIsXG5cdFx0TWVudURpZEhpZ2hsaWdodEl0ZW06IFwibWFjOk1lbnVEaWRIaWdobGlnaHRJdGVtXCIsXG5cdFx0TWVudVdpbGxEaXNwbGF5SXRlbTogXCJtYWM6TWVudVdpbGxEaXNwbGF5SXRlbVwiLFxuXHRcdE1lbnVEaWREaXNwbGF5SXRlbTogXCJtYWM6TWVudURpZERpc3BsYXlJdGVtXCIsXG5cdFx0TWVudVdpbGxBZGRJdGVtOiBcIm1hYzpNZW51V2lsbEFkZEl0ZW1cIixcblx0XHRNZW51RGlkQWRkSXRlbTogXCJtYWM6TWVudURpZEFkZEl0ZW1cIixcblx0XHRNZW51V2lsbFJlbW92ZUl0ZW06IFwibWFjOk1lbnVXaWxsUmVtb3ZlSXRlbVwiLFxuXHRcdE1lbnVEaWRSZW1vdmVJdGVtOiBcIm1hYzpNZW51RGlkUmVtb3ZlSXRlbVwiLFxuXHRcdE1lbnVXaWxsQmVnaW5UcmFja2luZzogXCJtYWM6TWVudVdpbGxCZWdpblRyYWNraW5nXCIsXG5cdFx0TWVudURpZEJlZ2luVHJhY2tpbmc6IFwibWFjOk1lbnVEaWRCZWdpblRyYWNraW5nXCIsXG5cdFx0TWVudVdpbGxFbmRUcmFja2luZzogXCJtYWM6TWVudVdpbGxFbmRUcmFja2luZ1wiLFxuXHRcdE1lbnVEaWRFbmRUcmFja2luZzogXCJtYWM6TWVudURpZEVuZFRyYWNraW5nXCIsXG5cdFx0TWVudVdpbGxVcGRhdGU6IFwibWFjOk1lbnVXaWxsVXBkYXRlXCIsXG5cdFx0TWVudURpZFVwZGF0ZTogXCJtYWM6TWVudURpZFVwZGF0ZVwiLFxuXHRcdE1lbnVXaWxsUG9wVXA6IFwibWFjOk1lbnVXaWxsUG9wVXBcIixcblx0XHRNZW51RGlkUG9wVXA6IFwibWFjOk1lbnVEaWRQb3BVcFwiLFxuXHRcdE1lbnVXaWxsU2VuZEFjdGlvblRvSXRlbTogXCJtYWM6TWVudVdpbGxTZW5kQWN0aW9uVG9JdGVtXCIsXG5cdFx0TWVudURpZFNlbmRBY3Rpb25Ub0l0ZW06IFwibWFjOk1lbnVEaWRTZW5kQWN0aW9uVG9JdGVtXCIsXG5cdFx0V2ViVmlld0RpZFN0YXJ0UHJvdmlzaW9uYWxOYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkU3RhcnRQcm92aXNpb25hbE5hdmlnYXRpb25cIixcblx0XHRXZWJWaWV3RGlkUmVjZWl2ZVNlcnZlclJlZGlyZWN0Rm9yUHJvdmlzaW9uYWxOYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkUmVjZWl2ZVNlcnZlclJlZGlyZWN0Rm9yUHJvdmlzaW9uYWxOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZEZpbmlzaE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRGaW5pc2hOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZENvbW1pdE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRDb21taXROYXZpZ2F0aW9uXCIsXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZFwiLFxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ1BlcmZvcm1lZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nUGVyZm9ybWVkXCIsXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRXhpdGVkOiBcIm1hYzpXaW5kb3dGaWxlRHJhZ2dpbmdFeGl0ZWRcIixcblx0fSxcblx0TGludXg6IHtcblx0XHRTeXN0ZW1UaGVtZUNoYW5nZWQ6IFwibGludXg6U3lzdGVtVGhlbWVDaGFuZ2VkXCIsXG5cdFx0V2luZG93TG9hZENoYW5nZWQ6IFwibGludXg6V2luZG93TG9hZENoYW5nZWRcIixcblx0XHRXaW5kb3dEZWxldGVFdmVudDogXCJsaW51eDpXaW5kb3dEZWxldGVFdmVudFwiLFxuXHRcdFdpbmRvd0ZvY3VzSW46IFwibGludXg6V2luZG93Rm9jdXNJblwiLFxuXHRcdFdpbmRvd0ZvY3VzT3V0OiBcImxpbnV4OldpbmRvd0ZvY3VzT3V0XCIsXG5cdFx0QXBwbGljYXRpb25TdGFydHVwOiBcImxpbnV4OkFwcGxpY2F0aW9uU3RhcnR1cFwiLFxuXHR9LFxuXHRDb21tb246IHtcblx0XHRBcHBsaWNhdGlvblN0YXJ0ZWQ6IFwiY29tbW9uOkFwcGxpY2F0aW9uU3RhcnRlZFwiLFxuXHRcdFdpbmRvd01heGltaXNlOiBcImNvbW1vbjpXaW5kb3dNYXhpbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWF4aW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWF4aW1pc2VcIixcblx0XHRXaW5kb3dGdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dGdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93VW5GdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dSZXN0b3JlOiBcImNvbW1vbjpXaW5kb3dSZXN0b3JlXCIsXG5cdFx0V2luZG93TWluaW1pc2U6IFwiY29tbW9uOldpbmRvd01pbmltaXNlXCIsXG5cdFx0V2luZG93VW5NaW5pbWlzZTogXCJjb21tb246V2luZG93VW5NaW5pbWlzZVwiLFxuXHRcdFdpbmRvd0Nsb3Npbmc6IFwiY29tbW9uOldpbmRvd0Nsb3NpbmdcIixcblx0XHRXaW5kb3dab29tOiBcImNvbW1vbjpXaW5kb3dab29tXCIsXG5cdFx0V2luZG93Wm9vbUluOiBcImNvbW1vbjpXaW5kb3dab29tSW5cIixcblx0XHRXaW5kb3dab29tT3V0OiBcImNvbW1vbjpXaW5kb3dab29tT3V0XCIsXG5cdFx0V2luZG93Wm9vbVJlc2V0OiBcImNvbW1vbjpXaW5kb3dab29tUmVzZXRcIixcblx0XHRXaW5kb3dGb2N1czogXCJjb21tb246V2luZG93Rm9jdXNcIixcblx0XHRXaW5kb3dMb3N0Rm9jdXM6IFwiY29tbW9uOldpbmRvd0xvc3RGb2N1c1wiLFxuXHRcdFdpbmRvd1Nob3c6IFwiY29tbW9uOldpbmRvd1Nob3dcIixcblx0XHRXaW5kb3dIaWRlOiBcImNvbW1vbjpXaW5kb3dIaWRlXCIsXG5cdFx0V2luZG93RFBJQ2hhbmdlZDogXCJjb21tb246V2luZG93RFBJQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd0ZpbGVzRHJvcHBlZDogXCJjb21tb246V2luZG93RmlsZXNEcm9wcGVkXCIsXG5cdFx0V2luZG93UnVudGltZVJlYWR5OiBcImNvbW1vbjpXaW5kb3dSdW50aW1lUmVhZHlcIixcblx0XHRUaGVtZUNoYW5nZWQ6IFwiY29tbW9uOlRoZW1lQ2hhbmdlZFwiLFxuXHR9LFxufTtcbiIsICIvLyBAdHMtbm9jaGVja1xuLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHtFdmVudFR5cGVzfSBmcm9tIFwiLi9ldmVudF90eXBlcy5qc1wiO1xuZXhwb3J0IGNvbnN0IFR5cGVzID0gRXZlbnRUeXBlcztcblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xud2luZG93Ll93YWlscy5kaXNwYXRjaFdhaWxzRXZlbnQgPSBkaXNwYXRjaFdhaWxzRXZlbnQ7XG5cbmNvbnN0IGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG5jbGFzcyBMaXN0ZW5lciB7XG4gICAgY29uc3RydWN0b3IoZXZlbnROYW1lLCBjYWxsYmFjaywgbWF4Q2FsbGJhY2tzKSB7XG4gICAgICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0aGlzLm1heENhbGxiYWNrcyA9IG1heENhbGxiYWNrcyB8fCAtMTtcbiAgICAgICAgdGhpcy5DYWxsYmFjayA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1heENhbGxiYWNrcyA9PT0gLTEpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubWF4Q2FsbGJhY2tzIC09IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhDYWxsYmFja3MgPT09IDA7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vKipcbiAqIERlc2NyaWJlcyBhIFdhaWxzIGFwcGxpY2F0aW9uIGV2ZW50LlxuICovXG5leHBvcnQgY2xhc3MgV2FpbHNFdmVudCB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyB3YWlscyBldmVudCBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0geyp9IFtkYXRhXSAtIEFyYml0cmFyeSBkYXRhIGFzc29jaWF0ZWQgdG8gdGhlIGV2ZW50LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGRhdGEgPSBudWxsKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmJpdHJhcnkgZGF0YSBhc3NvY2lhdGVkIHRvIHRoZSBldmVudC5cbiAgICAgICAgICogQHR5cGUgeyp9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hXYWlsc0V2ZW50KGV2ZW50KSB7XG4gICAgY29uc3Qgd2V2ZW50ID0gLyoqIEB0eXBlIHthbnl9ICovKG5ldyBXYWlsc0V2ZW50KGV2ZW50Lm5hbWUsIGV2ZW50LmRhdGEpKVxuICAgIE9iamVjdC5hc3NpZ24od2V2ZW50LCBldmVudClcbiAgICBldmVudCA9IHdldmVudDtcblxuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnQubmFtZSk7XG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICBsZXQgdG9SZW1vdmUgPSBsaXN0ZW5lcnMuZmlsdGVyKGxpc3RlbmVyID0+IHtcbiAgICAgICAgICAgIGxldCByZW1vdmUgPSBsaXN0ZW5lci5DYWxsYmFjayhldmVudCk7XG4gICAgICAgICAgICBpZiAocmVtb3ZlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0b1JlbW92ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuZmlsdGVyKGwgPT4gIXRvUmVtb3ZlLmluY2x1ZGVzKGwpKTtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSBldmVudExpc3RlbmVycy5kZWxldGUoZXZlbnQubmFtZSk7XG4gICAgICAgICAgICBlbHNlIGV2ZW50TGlzdGVuZXJzLnNldChldmVudC5uYW1lLCBsaXN0ZW5lcnMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIHNwZWNpZmljIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZvci5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4Q2FsbGJhY2tzIC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIHRpbWVzIHRoZSBjYWxsYmFjayBjYW4gYmUgY2FsbGVkIGZvciB0aGUgZXZlbnQuIE9uY2UgdGhlIG1heGltdW0gbnVtYmVyIGlzIHJlYWNoZWQsIHRoZSBjYWxsYmFjayB3aWxsIG5vIGxvbmdlciBiZSBjYWxsZWQuXG4gKlxuIEByZXR1cm4ge2Z1bmN0aW9ufSAtIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIHdpbGwgdW5yZWdpc3RlciB0aGUgY2FsbGJhY2sgZnJvbSB0aGUgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcykge1xuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnROYW1lKSB8fCBbXTtcbiAgICBjb25zdCB0aGlzTGlzdGVuZXIgPSBuZXcgTGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgbWF4Q2FsbGJhY2tzKTtcbiAgICBsaXN0ZW5lcnMucHVzaCh0aGlzTGlzdGVuZXIpO1xuICAgIGV2ZW50TGlzdGVuZXJzLnNldChldmVudE5hbWUsIGxpc3RlbmVycyk7XG4gICAgcmV0dXJuICgpID0+IGxpc3RlbmVyT2ZmKHRoaXNMaXN0ZW5lcik7XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgc3BlY2lmaWVkIGV2ZW50IG9jY3Vycy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQuIEl0IHRha2VzIG5vIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gLSBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHsgcmV0dXJuIE9uTXVsdGlwbGUoZXZlbnROYW1lLCBjYWxsYmFjaywgLTEpOyB9XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgb25seSBvbmNlIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBldmVudCBvY2N1cnMuXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gLSBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gT25jZShldmVudE5hbWUsIGNhbGxiYWNrKSB7IHJldHVybiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIDEpOyB9XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGxpc3RlbmVyIGZyb20gdGhlIGV2ZW50IGxpc3RlbmVycyBjb2xsZWN0aW9uLlxuICogSWYgYWxsIGxpc3RlbmVycyBmb3IgdGhlIGV2ZW50IGFyZSByZW1vdmVkLCB0aGUgZXZlbnQga2V5IGlzIGRlbGV0ZWQgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbGlzdGVuZXIgLSBUaGUgbGlzdGVuZXIgdG8gYmUgcmVtb3ZlZC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuZXJPZmYobGlzdGVuZXIpIHtcbiAgICBjb25zdCBldmVudE5hbWUgPSBsaXN0ZW5lci5ldmVudE5hbWU7XG4gICAgbGV0IGxpc3RlbmVycyA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudE5hbWUpLmZpbHRlcihsID0+IGwgIT09IGxpc3RlbmVyKTtcbiAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkgZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50TmFtZSk7XG4gICAgZWxzZSBldmVudExpc3RlbmVycy5zZXQoZXZlbnROYW1lLCBsaXN0ZW5lcnMpO1xufVxuXG5cbi8qKlxuICogUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgbmFtZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byByZW1vdmUgbGlzdGVuZXJzIGZvci5cbiAqIEBwYXJhbSB7Li4uc3RyaW5nfSBhZGRpdGlvbmFsRXZlbnROYW1lcyAtIEFkZGl0aW9uYWwgZXZlbnQgbmFtZXMgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPZmYoZXZlbnROYW1lLCAuLi5hZGRpdGlvbmFsRXZlbnROYW1lcykge1xuICAgIGxldCBldmVudHNUb1JlbW92ZSA9IFtldmVudE5hbWUsIC4uLmFkZGl0aW9uYWxFdmVudE5hbWVzXTtcbiAgICBldmVudHNUb1JlbW92ZS5mb3JFYWNoKGV2ZW50TmFtZSA9PiBldmVudExpc3RlbmVycy5kZWxldGUoZXZlbnROYW1lKSk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBmdW5jdGlvbiBPZmZBbGxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gT2ZmQWxsKCkgeyBldmVudExpc3RlbmVycy5jbGVhcigpOyB9XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHtDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZX0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0ICogZnJvbSBcIi4uL2NvcmUvZmxhZ3MuanNcIjtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG4vKipcbiAqIEdldEFsbCByZXR1cm5zIGRlc2NyaXB0b3JzIGZvciBhbGwgc2NyZWVucy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuU2NyZWVuW10+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0QWxsKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjM2NzcwNTUzMik7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogR2V0Q3VycmVudCByZXR1cm5zIGEgZGVzY3JpcHRvciBmb3IgdGhlIHNjcmVlblxuICogd2hlcmUgdGhlIGN1cnJlbnRseSBhY3RpdmUgd2luZG93IGlzIGxvY2F0ZWQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRDdXJyZW50KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzE2NzU3MjE4KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBHZXRQcmltYXJ5IHJldHVybnMgYSBkZXNjcmlwdG9yIGZvciB0aGUgcHJpbWFyeSBzY3JlZW4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRQcmltYXJ5KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc0OTU2MjAxNyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8vIFByaXZhdGUgdHlwZSBjcmVhdGlvbiBmdW5jdGlvbnNcbmNvbnN0ICQkY3JlYXRlVHlwZTAgPSAkQ3JlYXRlLkFycmF5KCRDcmVhdGUuQW55KTtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi4vY29yZS9zeXN0ZW0uanNcIjtcblxuLyoqXG4gKiBFbnZpcm9ubWVudCByZXRyaWV2ZXMgZW52aXJvbm1lbnQgZGV0YWlscy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuRW52aXJvbm1lbnRJbmZvPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVudmlyb25tZW50KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc1MjI2Nzk2OCk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMSgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogSXNEYXJrTW9kZSByZXRyaWV2ZXMgc3lzdGVtIGRhcmsgbW9kZSBzdGF0dXMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRGFya01vZGUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMjkxMjgyODM2KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLy8gUHJpdmF0ZSB0eXBlIGNyZWF0aW9uIGZ1bmN0aW9uc1xuY29uc3QgJCRjcmVhdGVUeXBlMCA9ICRDcmVhdGUuTWFwKCRDcmVhdGUuQW55LCAkQ3JlYXRlLkFueSk7XG5jb25zdCAkJGNyZWF0ZVR5cGUxID0gJENyZWF0ZS5TdHJ1Y3Qoe1xuICAgIFwiUGxhdGZvcm1JbmZvXCI6ICQkY3JlYXRlVHlwZTAsXG59KTtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gXCIuL3dpbmRvdy5qc1wiO1xuXG4vKiogQHR5cGUge2FueX0gKi9cbmxldCB0aGlzV2luZG93ID0gbnVsbDtcblxuLyoqXG4gKiBSZXR1cm5zIGEgd2luZG93IG9iamVjdCBmb3IgdGhlIGdpdmVuIHdpbmRvdyBuYW1lLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkfSBbbmFtZSA9IFwiXCJdXG4gKiBAcmV0dXJucyB7IHsgcmVhZG9ubHkgW0tleSBpbiBrZXlvZiAodHlwZW9mIHNlbGYpIGFzIEV4Y2x1ZGU8S2V5LCBcIkdldFwiIHwgXCJSR0JBXCI+XTogKHR5cGVvZiBzZWxmKVtLZXldIH0gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0KG5hbWUgPSBudWxsKSB7XG4gICAgY29uc3QgbmFtZXMgPSBbXSwgd25kID0ge307XG4gICAgaWYgKG5hbWUgIT0gbnVsbCAmJiBuYW1lICE9PSBcIlwiKSB7XG4gICAgICAgIG5hbWVzLnB1c2gobmFtZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzV2luZG93ICE9PSBudWxsKSB7XG4gICAgICAgIC8vIE9wdGltaXNlIGVtcHR5IHRhcmdldCBjYXNlIGZvciBXTUwuXG4gICAgICAgIHJldHVybiB0aGlzV2luZG93O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNXaW5kb3cgPSB3bmQ7XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IGluIHNlbGYpIHtcbiAgICAgICAgaWYgKGtleSAhPT0gXCJHZXRcIiAmJiBrZXkgIT09IFwiUkdCQVwiKSB7XG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSBzZWxmW2tleV07XG4gICAgICAgICAgICB3bmRba2V5XSA9ICguLi5hcmdzKSA9PiBtZXRob2QoLi4uYXJncywgLi4ubmFtZXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oT2JqZWN0LmZyZWV6ZSh3bmQpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuUG9zaXRpb24+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQWJzb2x1dGVQb3NpdGlvbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIyMjU1MzgyNiwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBDZW50ZXJzIHRoZSB3aW5kb3cgb24gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDZW50ZXIoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MDU0NDMwMzY5LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENsb3NlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTQzNjU4MTEwMCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBEaXNhYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRGlzYWJsZVNpemVDb25zdHJhaW50cyguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI1MTA1Mzk4OTEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRW5hYmxlU2l6ZUNvbnN0cmFpbnRzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzE1MDk2ODE5NCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBGb2N1c2VzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9jdXMoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMjc0Nzg5ODcyLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEZvcmNlcyB0aGUgd2luZG93IHRvIHJlbG9hZCB0aGUgcGFnZSBhc3NldHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9yY2VSZWxvYWQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNDc1MjMyNTAsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU3dpdGNoZXMgdGhlIHdpbmRvdyB0byBmdWxsc2NyZWVuIG1vZGUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnVsbHNjcmVlbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM5MjQ1NjQ0NzMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgZm91ciB3aW5kb3cgYm9yZGVycy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5MUlRCPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEJvcmRlclNpemVzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjI5MDk1MzA4OCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzY3JlZW4gdGhhdCB0aGUgd2luZG93IGlzIG9uLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRTY3JlZW4oLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNzQ0NTk3NDI0LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0Wm9vbSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI2NzczNTkwNjMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIZWlnaHQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg1ODcxNTc2MDMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogSGlkZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIaWRlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzg3NDA5MzQ2NCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmb2N1c2VkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRm9jdXNlZCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDUyNjgxOTcyMSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmdWxsc2NyZWVuLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRnVsbHNjcmVlbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDExOTI5MTY3MDUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWF4aW1pc2VkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWF4aW1pc2VkKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzAzNjMyNzgwOSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBtaW5pbWlzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNaW5pbWlzZWQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MDEyMjgxODM1LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1heGltaXNlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc1OTAwNzc5OSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBNaW5pbWlzZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNaW5pbWlzZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM1NDg1MjA1MDEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gTmFtZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQyMDc2NTcwNTEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogT3BlbnMgdGhlIGRldmVsb3BtZW50IHRvb2xzIHBhbmUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkRldlRvb2xzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDgzNjcxOTc0LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5Qb3NpdGlvbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGl2ZVBvc2l0aW9uKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzcwOTU0NTkyMywgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZWxvYWRzIHBhZ2UgYXNzZXRzLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlbG9hZCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI4MzM3MzE0ODUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgcmVzaXphYmxlLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlc2l6YWJsZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI0NTA5NDYyNzcsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVzdG9yZXMgdGhlIHdpbmRvdyB0byBpdHMgcHJldmlvdXMgc3RhdGUgaWYgaXQgd2FzIHByZXZpb3VzbHkgbWluaW1pc2VkLCBtYXhpbWlzZWQgb3IgZnVsbHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXN0b3JlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTE1MTMxNTAzNCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRBYnNvbHV0ZVBvc2l0aW9uKHgsIHksIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzk5MTQ5MTg0MiwgeCwgeSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSB3aW5kb3cgdG8gYmUgYWx3YXlzIG9uIHRvcC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYW90XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0QWx3YXlzT25Ub3AoYW90LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMzNDkzNDYxNTUsIGFvdCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBiYWNrZ3JvdW5kIGNvbG91ciBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHskbW9kZWxzLlJHQkF9IGNvbG91clxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEJhY2tncm91bmRDb2xvdXIoY29sb3VyLCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIxNzk4MjA1NzYsIGNvbG91ciwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSB3aW5kb3cgZnJhbWUgYW5kIHRpdGxlIGJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZnJhbWVsZXNzXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnJhbWVsZXNzKGZyYW1lbGVzcywgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MTA5MzY1MDgwLCBmcmFtZWxlc3MsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBvciBkaXNhYmxlcyB0aGUgc3lzdGVtIGZ1bGxzY3JlZW4gYnV0dG9uLlxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnVsbHNjcmVlbkJ1dHRvbkVuYWJsZWQoZW5hYmxlZCwgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODYzNTY4OTgyLCBlbmFibGVkLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1heGltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0TWF4U2l6ZSh3aWR0aCwgaGVpZ2h0LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM0NjAwNzg1NTEsIHdpZHRoLCBoZWlnaHQsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbWluaW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRNaW5TaXplKHdpZHRoLCBoZWlnaHQsIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjY3NzkxOTA4NSwgd2lkdGgsIGhlaWdodCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZWxhdGl2ZVBvc2l0aW9uKHgsIHksIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNzQxNjA2MTE1LCB4LCB5LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgd2hldGhlciB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzaXphYmxlXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVzaXphYmxlKHJlc2l6YWJsZSwgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyODM1MzA1NTQxLCByZXNpemFibGUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0U2l6ZSh3aWR0aCwgaGVpZ2h0LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMzNzk3ODgzOTMsIHdpZHRoLCBoZWlnaHQsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgdGl0bGUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRpdGxlKHRpdGxlLCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE3MDk1MzU5OCwgdGl0bGUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IG1hZ25pZmljYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRab29tKG1hZ25pZmljYXRpb24sIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjc5NDUwMDA1MSwgbWFnbmlmaWNhdGlvbiwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTaG93cyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNob3coLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyOTMxODIzMTIxLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TaXplPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNpemUoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMTQxMTExNDMzLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIGZ1bGxzY3JlZW4gYW5kIG5vcm1hbC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVGdWxsc2NyZWVuKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjIxMjc2MzE0OSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBtYXhpbWlzZWQgYW5kIG5vcm1hbC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVNYXhpbWlzZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMxNDQxOTQ0NDMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVW4tZnVsbHNjcmVlbnMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBVbkZ1bGxzY3JlZW4oLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNTg3MDAyNTA2LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFVuLW1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWF4aW1pc2UoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODg5OTk5NDc2LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFVuLW1pbmltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWluaW1pc2UoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNTcxNjM2MTk4LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBXaWR0aCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE2NTUyMzk5ODgsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogWm9vbXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNTU1NzE5OTIzLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEluY3JlYXNlcyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2VidmlldyBjb250ZW50LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvb21JbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDEzMTA0MzQyNzIsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRGVjcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbU91dCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE3NTU3MDI4MjEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVzZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbVJlc2V0KC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjc4MTQ2NzE1NCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cbiIsICIvLyBAdHMtbm9jaGVja1xuLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHtPcGVuVVJMfSBmcm9tIFwiLi9icm93c2VyLmpzXCI7XG5pbXBvcnQge1F1ZXN0aW9ufSBmcm9tIFwiLi9kaWFsb2dzLmpzXCI7XG5pbXBvcnQge0VtaXQsIFdhaWxzRXZlbnR9IGZyb20gXCIuL2V2ZW50cy5qc1wiO1xuaW1wb3J0IHtjYW5BYm9ydExpc3RlbmVycywgd2hlblJlYWR5fSBmcm9tIFwiLi91dGlscy5qc1wiO1xuaW1wb3J0ICogYXMgV2luZG93IGZyb20gXCIuL3dpbmRvdy5qc1wiO1xuXG4vKipcbiAqIFNlbmRzIGFuIGV2ZW50IHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG9wdGlvbmFsIGRhdGEuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byBzZW5kLlxuICogQHBhcmFtIHthbnl9IFtkYXRhPW51bGxdIC0gT3B0aW9uYWwgZGF0YSB0byBzZW5kIGFsb25nIHdpdGggdGhlIGV2ZW50LlxuICpcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBzZW5kRXZlbnQoZXZlbnROYW1lLCBkYXRhPW51bGwpIHtcbiAgICBFbWl0KG5ldyBXYWlsc0V2ZW50KGV2ZW50TmFtZSwgZGF0YSkpO1xufVxuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9uIGEgc3BlY2lmaWVkIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdyB0byBjYWxsIHRoZSBtZXRob2Qgb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gY2FsbC5cbiAqL1xuZnVuY3Rpb24gY2FsbFdpbmRvd01ldGhvZCh3aW5kb3dOYW1lLCBtZXRob2ROYW1lKSB7XG4gICAgY29uc3QgdGFyZ2V0V2luZG93ID0gV2luZG93LkdldCh3aW5kb3dOYW1lKTtcbiAgICBjb25zdCBtZXRob2QgPSB0YXJnZXRXaW5kb3dbbWV0aG9kTmFtZV07XG5cbiAgICBpZiAodHlwZW9mIG1ldGhvZCAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFdpbmRvdyBtZXRob2QgJyR7bWV0aG9kTmFtZX0nIG5vdCBmb3VuZGApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgbWV0aG9kLmNhbGwodGFyZ2V0V2luZG93KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGNhbGxpbmcgd2luZG93IG1ldGhvZCAnJHttZXRob2ROYW1lfSc6IGAsIGUpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXNwb25kcyB0byBhIHRyaWdnZXJpbmcgZXZlbnQgYnkgcnVubmluZyBhcHByb3ByaWF0ZSBXTUwgYWN0aW9ucyBmb3IgdGhlIGN1cnJlbnQgdGFyZ2V0XG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBvbldNTFRyaWdnZXJlZChldikge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBldi5jdXJyZW50VGFyZ2V0O1xuXG4gICAgZnVuY3Rpb24gcnVuRWZmZWN0KGNob2ljZSA9IFwiWWVzXCIpIHtcbiAgICAgICAgaWYgKGNob2ljZSAhPT0gXCJZZXNcIilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zdCBldmVudFR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLWV2ZW50Jyk7XG4gICAgICAgIGNvbnN0IHRhcmdldFdpbmRvdyA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdGFyZ2V0LXdpbmRvdycpIHx8IFwiXCI7XG4gICAgICAgIGNvbnN0IHdpbmRvd01ldGhvZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtd2luZG93Jyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtb3BlbnVybCcpO1xuXG4gICAgICAgIGlmIChldmVudFR5cGUgIT09IG51bGwpXG4gICAgICAgICAgICBzZW5kRXZlbnQoZXZlbnRUeXBlKTtcbiAgICAgICAgaWYgKHdpbmRvd01ldGhvZCAhPT0gbnVsbClcbiAgICAgICAgICAgIGNhbGxXaW5kb3dNZXRob2QodGFyZ2V0V2luZG93LCB3aW5kb3dNZXRob2QpO1xuICAgICAgICBpZiAodXJsICE9PSBudWxsKVxuICAgICAgICAgICAgdm9pZCBPcGVuVVJMKHVybCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlybSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtY29uZmlybScpO1xuXG4gICAgaWYgKGNvbmZpcm0pIHtcbiAgICAgICAgUXVlc3Rpb24oe1xuICAgICAgICAgICAgVGl0bGU6IFwiQ29uZmlybVwiLFxuICAgICAgICAgICAgTWVzc2FnZTogY29uZmlybSxcbiAgICAgICAgICAgIERldGFjaGVkOiBmYWxzZSxcbiAgICAgICAgICAgIEJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICB7IExhYmVsOiBcIlllc1wiIH0sXG4gICAgICAgICAgICAgICAgeyBMYWJlbDogXCJOb1wiLCBJc0RlZmF1bHQ6IHRydWUgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KS50aGVuKHJ1bkVmZmVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcnVuRWZmZWN0KCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEB0eXBlIHtzeW1ib2x9XG4gKi9cbmNvbnN0IGNvbnRyb2xsZXIgPSBTeW1ib2woKTtcblxuLyoqXG4gKiBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSBkb2VzIG5vdCBhY3R1YWxseSByZW1lbWJlciBhY3RpdmUgZXZlbnQgbGlzdGVuZXJzOiBpbnN0ZWFkXG4gKiBpdCB0aWVzIHRoZW0gdG8gYW4gQWJvcnRTaWduYWwgYW5kIHVzZXMgYW4gQWJvcnRDb250cm9sbGVyIHRvIHJlbW92ZSB0aGVtIGFsbCBhdCBvbmNlLlxuICovXG5jbGFzcyBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdG9yZXMgdGhlIEFib3J0Q29udHJvbGxlciB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlbW92ZSBhbGwgY3VycmVudGx5IGFjdGl2ZSBsaXN0ZW5lcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBuYW1lIHtAbGluayBjb250cm9sbGVyfVxuICAgICAgICAgKiBAbWVtYmVyIHtBYm9ydENvbnRyb2xsZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzW2NvbnRyb2xsZXJdID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb3B0aW9ucyBvYmplY3QgZm9yIGFkZEV2ZW50TGlzdGVuZXIgdGhhdCB0aWVzIHRoZSBsaXN0ZW5lclxuICAgICAqIHRvIHRoZSBBYm9ydFNpZ25hbCBmcm9tIHRoZSBjdXJyZW50IEFib3J0Q29udHJvbGxlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgQW4gSFRNTCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdHJpZ2dlcnMgVGhlIGxpc3Qgb2YgYWN0aXZlIFdNTCB0cmlnZ2VyIGV2ZW50cyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50c1xuICAgICAqIEByZXR1cm5zIHtBZGRFdmVudExpc3RlbmVyT3B0aW9uc31cbiAgICAgKi9cbiAgICBzZXQoZWxlbWVudCwgdHJpZ2dlcnMpIHtcbiAgICAgICAgcmV0dXJuIHsgc2lnbmFsOiB0aGlzW2NvbnRyb2xsZXJdLnNpZ25hbCB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3ZvaWR9XG4gICAgICovXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXNbY29udHJvbGxlcl0uYWJvcnQoKTtcbiAgICAgICAgdGhpc1tjb250cm9sbGVyXSA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB9XG59XG5cbi8qKlxuICogQHR5cGUge3N5bWJvbH1cbiAqL1xuY29uc3QgdHJpZ2dlck1hcCA9IFN5bWJvbCgpO1xuXG4vKipcbiAqIEB0eXBlIHtzeW1ib2x9XG4gKi9cbmNvbnN0IGVsZW1lbnRDb3VudCA9IFN5bWJvbCgpO1xuXG4vKipcbiAqIFdlYWtNYXBSZWdpc3RyeSBtYXBzIGFjdGl2ZSB0cmlnZ2VyIGV2ZW50cyB0byBlYWNoIERPTSBlbGVtZW50IHRocm91Z2ggYSBXZWFrTWFwLlxuICogVGhpcyBlbnN1cmVzIHRoYXQgdGhlIG1hcHBpbmcgcmVtYWlucyBwcml2YXRlIHRvIHRoaXMgbW9kdWxlLCB3aGlsZSBzdGlsbCBhbGxvd2luZyBnYXJiYWdlXG4gKiBjb2xsZWN0aW9uIG9mIHRoZSBpbnZvbHZlZCBlbGVtZW50cy5cbiAqL1xuY2xhc3MgV2Vha01hcFJlZ2lzdHJ5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0b3JlcyB0aGUgY3VycmVudCBlbGVtZW50LXRvLXRyaWdnZXIgbWFwcGluZy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG5hbWUge0BsaW5rIHRyaWdnZXJNYXB9XG4gICAgICAgICAqIEBtZW1iZXIge1dlYWtNYXA8SFRNTEVsZW1lbnQsIHN0cmluZ1tdPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcF0gPSBuZXcgV2Vha01hcCgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3VudHMgdGhlIG51bWJlciBvZiBlbGVtZW50cyB3aXRoIGFjdGl2ZSBXTUwgdHJpZ2dlcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBuYW1lIHtAbGluayBlbGVtZW50Q291bnR9XG4gICAgICAgICAqIEBtZW1iZXIge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbZWxlbWVudENvdW50XSA9IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYWN0aXZlIHRyaWdnZXJzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IEFuIEhUTUwgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHRyaWdnZXJzIFRoZSBsaXN0IG9mIGFjdGl2ZSBXTUwgdHJpZ2dlciBldmVudHMgZm9yIHRoZSBzcGVjaWZpZWQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtBZGRFdmVudExpc3RlbmVyT3B0aW9uc31cbiAgICAgKi9cbiAgICBzZXQoZWxlbWVudCwgdHJpZ2dlcnMpIHtcbiAgICAgICAgdGhpc1tlbGVtZW50Q291bnRdICs9ICF0aGlzW3RyaWdnZXJNYXBdLmhhcyhlbGVtZW50KTtcbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwXS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgaWYgKHRoaXNbZWxlbWVudENvdW50XSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSkge1xuICAgICAgICAgICAgaWYgKHRoaXNbZWxlbWVudENvdW50XSA8PSAwKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjb25zdCB0cmlnZ2VycyA9IHRoaXNbdHJpZ2dlck1hcF0uZ2V0KGVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpc1tlbGVtZW50Q291bnRdIC09ICh0eXBlb2YgdHJpZ2dlcnMgIT09IFwidW5kZWZpbmVkXCIpO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdHJpZ2dlcnMgfHwgW10pXG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRyaWdnZXIsIG9uV01MVHJpZ2dlcmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcF0gPSBuZXcgV2Vha01hcCgpO1xuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudF0gPSAwO1xuICAgIH1cbn1cblxuY29uc3QgdHJpZ2dlclJlZ2lzdHJ5ID0gY2FuQWJvcnRMaXN0ZW5lcnMoKSA/IG5ldyBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSgpIDogbmV3IFdlYWtNYXBSZWdpc3RyeSgpO1xuXG4vKipcbiAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gYWRkV01MTGlzdGVuZXJzKGVsZW1lbnQpIHtcbiAgICBjb25zdCB0cmlnZ2VyUmVnRXhwID0gL1xcUysvZztcbiAgICBjb25zdCB0cmlnZ2VyQXR0ciA9IChlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLXRyaWdnZXInKSB8fCBcImNsaWNrXCIpO1xuICAgIGNvbnN0IHRyaWdnZXJzID0gW107XG5cbiAgICBsZXQgbWF0Y2g7XG4gICAgd2hpbGUgKChtYXRjaCA9IHRyaWdnZXJSZWdFeHAuZXhlYyh0cmlnZ2VyQXR0cikpICE9PSBudWxsKVxuICAgICAgICB0cmlnZ2Vycy5wdXNoKG1hdGNoWzBdKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0cmlnZ2VyUmVnaXN0cnkuc2V0KGVsZW1lbnQsIHRyaWdnZXJzKTtcbiAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdHJpZ2dlcnMpXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0cmlnZ2VyLCBvbldNTFRyaWdnZXJlZCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogU2NoZWR1bGVzIGFuIGF1dG9tYXRpYyByZWxvYWQgb2YgV01MIHRvIGJlIHBlcmZvcm1lZCBhcyBzb29uIGFzIHRoZSBkb2N1bWVudCBpcyBmdWxseSBsb2FkZWQuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbmFibGUoKSB7XG4gICAgd2hlblJlYWR5KFJlbG9hZCk7XG59XG5cbi8qKlxuICogUmVsb2FkcyB0aGUgV01MIHBhZ2UgYnkgYWRkaW5nIG5lY2Vzc2FyeSBldmVudCBsaXN0ZW5lcnMgYW5kIGJyb3dzZXIgbGlzdGVuZXJzLlxuICpcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gUmVsb2FkKCkge1xuICAgIHRyaWdnZXJSZWdpc3RyeS5yZXNldCgpO1xuICAgIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnW3dtbC1ldmVudF0sIFt3bWwtd2luZG93XSwgW3dtbC1vcGVudXJsXScpLmZvckVhY2goYWRkV01MTGlzdGVuZXJzKTtcbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8qXG4gXyAgICAgX18gICAgIF8gX19cbnwgfCAgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBicm93c2VyIHN1cHBvcnRzIHJlbW92aW5nIGxpc3RlbmVycyBieSB0cmlnZ2VyaW5nIGFuIEFib3J0U2lnbmFsXG4gKiAoc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FdmVudFRhcmdldC9hZGRFdmVudExpc3RlbmVyI3NpZ25hbClcbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FuQWJvcnRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKCFFdmVudFRhcmdldCB8fCAhQWJvcnRTaWduYWwgfHwgIUFib3J0Q29udHJvbGxlcilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBuZXcgRXZlbnRUYXJnZXQoKTtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgKCkgPT4geyByZXN1bHQgPSBmYWxzZTsgfSwgeyBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pO1xuICAgIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3Rlc3QnKSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKioqXG4gVGhpcyB0ZWNobmlxdWUgZm9yIHByb3BlciBsb2FkIGRldGVjdGlvbiBpcyB0YWtlbiBmcm9tIEhUTVg6XG5cbiBCU0QgMi1DbGF1c2UgTGljZW5zZVxuXG4gQ29weXJpZ2h0IChjKSAyMDIwLCBCaWcgU2t5IFNvZnR3YXJlXG4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gMS4gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG5cbiAyLiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvblxuIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG4gVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCJcbiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRVxuIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMXG4gREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1JcbiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUlxuIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksXG4gT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuXG4gKioqL1xuXG5sZXQgaXNSZWFkeSA9IGZhbHNlO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IGlzUmVhZHkgPSB0cnVlKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW5SZWFkeShjYWxsYmFjaykge1xuICAgIGlmIChpc1JlYWR5IHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgY2FsbGJhY2spO1xuICAgIH1cbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5leHBvcnQgKiBmcm9tIFwiLi4vLi4vLi4vLi4vcGtnL3J1bnRpbWUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgcnVudGltZSBmcm9tIFwiLi4vLi4vLi4vLi4vcGtnL3J1bnRpbWUvaW5kZXguanNcIjtcbndpbmRvdy53YWlscyA9IHJ1bnRpbWU7XG5cbnJ1bnRpbWUuV01MLkVuYWJsZSgpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FBQUE7QUFBQSxFQUFBO0FBQUEsZ0JBQUFDO0FBQUEsRUFBQTtBQUFBO0FBQUEsZUFBQUM7QUFBQSxFQUFBO0FBQUEsZ0JBQUFDO0FBQUEsRUFBQTtBQUFBO0FBQUE7OztBQ0FBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDeUJBLElBQUksY0FDRjtBQVdLLElBQUksU0FBUyxDQUFDLE9BQU8sT0FBTztBQUNqQyxNQUFJLEtBQUs7QUFDVCxNQUFJLElBQUk7QUFDUixTQUFPLEtBQUs7QUFDVixVQUFNLFlBQWEsS0FBSyxPQUFPLElBQUksS0FBTSxDQUFDO0FBQUEsRUFDNUM7QUFDQSxTQUFPO0FBQ1Q7OztBQy9CQSxJQUFNLGFBQWEsT0FBTyxTQUFTLFNBQVM7QUFHckMsU0FBUyxPQUFPLEtBQUs7QUFDeEIsTUFBRyxPQUFPLFFBQVE7QUFDZCxXQUFPLE9BQU8sT0FBTyxRQUFRLFlBQVksR0FBRztBQUFBLEVBQ2hELE9BQU87QUFDSCxXQUFPLE9BQU8sT0FBTyxn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QUE2QjtBQUFBLElBQzdCLGdDQUFnQztBQUFBLElBQ2hDLHFCQUFxQjtBQUFBLElBQ3JCLDZCQUE2QjtBQUFBLElBQzdCLDBCQUEwQjtBQUFBLElBQzFCLHVCQUF1QjtBQUFBLElBQ3ZCLHVCQUF1QjtBQUFBLElBQ3ZCLDJCQUEyQjtBQUFBLElBQzNCLCtCQUErQjtBQUFBLElBQy9CLG9CQUFvQjtBQUFBLElBQ3BCLHFCQUFxQjtBQUFBLElBQ3JCLHFCQUFxQjtBQUFBLElBQ3JCLHNCQUFzQjtBQUFBLElBQ3RCLGdDQUFnQztBQUFBLElBQ2hDLGtDQUFrQztBQUFBLElBQ2xDLG1DQUFtQztBQUFBLElBQ25DLG9DQUFvQztBQUFBLElBQ3BDLCtCQUErQjtBQUFBLElBQy9CLDZCQUE2QjtBQUFBLElBQzdCLHVCQUF1QjtBQUFBLElBQ3ZCLGlDQUFpQztBQUFBLElBQ2pDLDhCQUE4QjtBQUFBLElBQzlCLDRCQUE0QjtBQUFBLElBQzVCLHNDQUFzQztBQUFBLElBQ3RDLDRCQUE0QjtBQUFBLElBQzVCLHNCQUFzQjtBQUFBLElBQ3RCLGtDQUFrQztBQUFBLElBQ2xDLHNCQUFzQjtBQUFBLElBQ3RCLHdCQUF3QjtBQUFBLElBQ3hCLDJCQUEyQjtBQUFBLElBQzNCLHdCQUF3QjtBQUFBLElBQ3hCLG1CQUFtQjtBQUFBLElBQ25CLDBCQUEwQjtBQUFBLElBQzFCLDhCQUE4QjtBQUFBLElBQzlCLHlCQUF5QjtBQUFBLElBQ3pCLDZCQUE2QjtBQUFBLElBQzdCLGlCQUFpQjtBQUFBLElBQ2pCLGdCQUFnQjtBQUFBLElBQ2hCLHNCQUFzQjtBQUFBLElBQ3RCLGVBQWU7QUFBQSxJQUNmLHlCQUF5QjtBQUFBLElBQ3pCLHdCQUF3QjtBQUFBLElBQ3hCLG9CQUFvQjtBQUFBLElBQ3BCLHFCQUFxQjtBQUFBLElBQ3JCLGlCQUFpQjtBQUFBLElBQ2pCLGlCQUFpQjtBQUFBLElBQ2pCLHNCQUFzQjtBQUFBLElBQ3RCLG1DQUFtQztBQUFBLElBQ25DLHFDQUFxQztBQUFBLElBQ3JDLHVCQUF1QjtBQUFBLElBQ3ZCLHNCQUFz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ZUFBVyxXQUFXLFNBQVMsS0FBSyxpQkFBaUIsR0FBRyxHQUFHO0FBQ3ZELFVBQUksS0FBSyxZQUFZLEtBQUs7QUFDdEI7QUFFSixZQUFNLFdBQVcsS0FBSyxVQUFVLEVBQUUsSUFBSSxPQUFPO0FBQzdDLFdBQUssWUFBWSxLQUFNLE9BQU8sYUFBYTtBQUUzQyxpQkFBVyxXQUFXLFlBQVksQ0FBQztBQUMvQixnQkFBUSxvQkFBb0IsU0FBUyxjQUFjO0FBQUEsSUFDM0Q7QUFFQSxTQUFLLFVBQVUsSUFBSSxvQkFBSSxRQUFRO0FBQy9CLFNBQUssWUFBWSxJQUFJO0FBQUEsRUFDekI7QUFDSjtBQUVBLElBQU0sa0JBQWtCLGtCQUFrQixJQUFJLElBQUksd0JBQXdCLElBQUksSUFBSSxnQkFBZ0I7QUFRbEcsU0FBUyxnQkFBZ0IsU0FBUztBQUM5QixRQUFNLGdCQUFnQjtBQUN0QixRQUFNLGNBQWUsUUFBUSxhQUFhLGFBQWEsS0FBSztBQUM1RCxRQUFNLFdBQVcsQ0FBQztBQUVsQixNQUFJO0FBQ0osVUFBUSxRQUFRLGNBQWMsS0FBSyxXQUFXLE9BQU87QUFDakQsYUFBUyxLQUFLLE1BQU0sQ0FBQyxDQUFDO0FBRTFCLFFBQU0sVUFBVSxnQkFBZ0IsSUFBSSxTQUFTLFFBQVE7QUFDckQsYUFBVyxXQUFXO0FBQ2xCLFlBQVEsaUJBQWlCLFNBQVMsZ0JBQWdCLE9BQU87QUFDakU7QUFPTyxTQUFTLFNBQVM7QUFDckIsWUFBVUMsT0FBTTtBQUNwQjtBQU9PLFNBQVNBLFVBQVM7QUFDckIsa0JBQWdCLE1BQU07QUFDdEIsV0FBUyxLQUFLLGlCQUFpQiwwQ0FBMEMsRUFBRSxRQUFRLGVBQWU7QUFDdEc7OztBRXJQQSxPQUFPLFFBQVE7QUFFUCxZQUFJLE9BQU87IiwKICAibmFtZXMiOiBbImNhbGxfZXhwb3J0cyIsICJjcmVhdGVfZXhwb3J0cyIsICJmbGFnc19leHBvcnRzIiwgInN5c3RlbV9leHBvcnRzIiwgImNhbGwiLCAiTWFwIiwgImtleSIsICJjYWxsX2V4cG9ydHMiLCAiY3JlYXRlX2V4cG9ydHMiLCAiTWFwIiwgIkVycm9yIiwgIkVycm9yIiwgImV2ZW50TmFtZSIsICJmbGFnc19leHBvcnRzIiwgInN5c3RlbV9leHBvcnRzIiwgIiQkY3JlYXRlVHlwZTAiLCAiSGlkZSIsICJTaG93IiwgIkhpZGUiLCAicmVzaXphYmxlIiwgIlNob3ciLCAiUmVsb2FkIiwgImNvbnRyb2xsZXIiLCAiUmVsb2FkIl0KfQo=
