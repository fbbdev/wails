var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// bundle/full/.build/github.com/wailsapp/wails/v3/pkg/runtime/index.js
var runtime_exports = {};
__export(runtime_exports, {
  Application: () => Application_exports,
  Browser: () => Browser_exports,
  Call: () => calls_exports,
  Clipboard: () => Clipboard_exports,
  Dialogs: () => Dialogs_exports,
  Events: () => Events_exports,
  Flags: () => flags_exports,
  Screens: () => Screens_exports,
  System: () => System_exports,
  WML: () => wml_exports,
  Window: () => Window_exports
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Application.js
var Application_exports = {};
__export(Application_exports, {
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
  } else if (rightCorner && bottomCorner)
    setResize("se-resize");
  else if (leftCorner && bottomCorner)
    setResize("sw-resize");
  else if (leftCorner && topCorner)
    setResize("nw-resize");
  else if (topCorner && rightCorner)
    setResize("ne-resize");
  else if (leftBorder)
    setResize("w-resize");
  else if (topBorder)
    setResize("n-resize");
  else if (bottomBorder)
    setResize("s-resize");
  else if (rightBorder)
    setResize("e-resize");
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/core/calls.js
var calls_exports = {};
__export(calls_exports, {
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Application.js
function Hide() {
  let $resultPromise = calls_exports.ByID(727471602);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Quit() {
  let $resultPromise = calls_exports.ByID(1244926953);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Show() {
  let $resultPromise = calls_exports.ByID(2270674839);
  return (
    /** @type {any} */
    $resultPromise
  );
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Browser.js
var Browser_exports = {};
__export(Browser_exports, {
  OpenURL: () => OpenURL
});
function OpenURL(url) {
  let $resultPromise = calls_exports.ByID(4141408185, url);
  return (
    /** @type {any} */
    $resultPromise
  );
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Clipboard.js
var Clipboard_exports = {};
__export(Clipboard_exports, {
  SetText: () => SetText,
  Text: () => Text
});
function SetText(text) {
  let $resultPromise = calls_exports.ByID(940573749, text);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Text() {
  let $resultPromise = calls_exports.ByID(249238621);
  return (
    /** @type {any} */
    $resultPromise
  );
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Dialogs.js
var Dialogs_exports = {};
__export(Dialogs_exports, {
  Button: () => Button,
  Error: () => Error2,
  FileFilter: () => FileFilter,
  Info: () => Info,
  MessageDialogOptions: () => MessageDialogOptions,
  OpenFile: () => OpenFile,
  OpenFileDialogOptions: () => OpenFileDialogOptions,
  Question: () => Question,
  SaveFile: () => SaveFile,
  SaveFileDialogOptions: () => SaveFileDialogOptions,
  Warning: () => Warning
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/models.js
var Button = class _Button {
  /**
   * Creates a new Button instance.
   * @param {Partial<Button>} [$$source = {}] - The source object to create the Button.
   */
  constructor($$source = {}) {
    if (
      /** @type {any} */
      false
    ) {
      this["Label"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["IsCancel"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["IsDefault"] = false;
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new Button instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {Button}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new _Button(
      /** @type {Partial<Button>} */
      $$parsedSource
    );
  }
};
var EnvironmentInfo = class _EnvironmentInfo {
  /**
   * Creates a new EnvironmentInfo instance.
   * @param {Partial<EnvironmentInfo>} [$$source = {}] - The source object to create the EnvironmentInfo.
   */
  constructor($$source = {}) {
    if (!("OS" in $$source)) {
      this["OS"] = "";
    }
    if (!("Arch" in $$source)) {
      this["Arch"] = "";
    }
    if (!("Debug" in $$source)) {
      this["Debug"] = false;
    }
    if (!("PlatformInfo" in $$source)) {
      this["PlatformInfo"] = {};
    }
    if (!("OSInfo" in $$source)) {
      this["OSInfo"] = new OSInfo();
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new EnvironmentInfo instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {EnvironmentInfo}
   */
  static createFrom($$source = {}) {
    const $$createField3_0 = $$createType0;
    const $$createField4_0 = $$createType1;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("PlatformInfo" in $$parsedSource) {
      $$parsedSource["PlatformInfo"] = $$createField3_0($$parsedSource["PlatformInfo"]);
    }
    if ("OSInfo" in $$parsedSource) {
      $$parsedSource["OSInfo"] = $$createField4_0($$parsedSource["OSInfo"]);
    }
    return new _EnvironmentInfo(
      /** @type {Partial<EnvironmentInfo>} */
      $$parsedSource
    );
  }
};
var FileFilter = class _FileFilter {
  /**
   * Creates a new FileFilter instance.
   * @param {Partial<FileFilter>} [$$source = {}] - The source object to create the FileFilter.
   */
  constructor($$source = {}) {
    if (
      /** @type {any} */
      false
    ) {
      this["DisplayName"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Pattern"] = "";
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new FileFilter instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {FileFilter}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new _FileFilter(
      /** @type {Partial<FileFilter>} */
      $$parsedSource
    );
  }
};
var LRTB = class _LRTB {
  /**
   * Creates a new LRTB instance.
   * @param {Partial<LRTB>} [$$source = {}] - The source object to create the LRTB.
   */
  constructor($$source = {}) {
    if (!("Left" in $$source)) {
      this["Left"] = 0;
    }
    if (!("Right" in $$source)) {
      this["Right"] = 0;
    }
    if (!("Top" in $$source)) {
      this["Top"] = 0;
    }
    if (!("Bottom" in $$source)) {
      this["Bottom"] = 0;
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new LRTB instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {LRTB}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new _LRTB(
      /** @type {Partial<LRTB>} */
      $$parsedSource
    );
  }
};
var MessageDialogOptions = class _MessageDialogOptions {
  /**
   * Creates a new MessageDialogOptions instance.
   * @param {Partial<MessageDialogOptions>} [$$source = {}] - The source object to create the MessageDialogOptions.
   */
  constructor($$source = {}) {
    if (
      /** @type {any} */
      false
    ) {
      this["Title"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Message"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Buttons"] = [];
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Detached"] = false;
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new MessageDialogOptions instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {MessageDialogOptions}
   */
  static createFrom($$source = {}) {
    const $$createField2_0 = $$createType3;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("Buttons" in $$parsedSource) {
      $$parsedSource["Buttons"] = $$createField2_0($$parsedSource["Buttons"]);
    }
    return new _MessageDialogOptions(
      /** @type {Partial<MessageDialogOptions>} */
      $$parsedSource
    );
  }
};
var OSInfo = class _OSInfo {
  /**
   * Creates a new OSInfo instance.
   * @param {Partial<OSInfo>} [$$source = {}] - The source object to create the OSInfo.
   */
  constructor($$source = {}) {
    if (!("ID" in $$source)) {
      this["ID"] = "";
    }
    if (!("Name" in $$source)) {
      this["Name"] = "";
    }
    if (!("Version" in $$source)) {
      this["Version"] = "";
    }
    if (!("Branding" in $$source)) {
      this["Branding"] = "";
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new OSInfo instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {OSInfo}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new _OSInfo(
      /** @type {Partial<OSInfo>} */
      $$parsedSource
    );
  }
};
var OpenFileDialogOptions = class _OpenFileDialogOptions {
  /**
   * Creates a new OpenFileDialogOptions instance.
   * @param {Partial<OpenFileDialogOptions>} [$$source = {}] - The source object to create the OpenFileDialogOptions.
   */
  constructor($$source = {}) {
    if (
      /** @type {any} */
      false
    ) {
      this["CanChooseDirectories"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["CanChooseFiles"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["CanCreateDirectories"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["ShowHiddenFiles"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["ResolvesAliases"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["AllowsMultipleSelection"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["HideExtension"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["CanSelectHiddenExtension"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["TreatsFilePackagesAsDirectories"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["AllowsOtherFileTypes"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Title"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Message"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["ButtonText"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Directory"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Filters"] = [];
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Detached"] = false;
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new OpenFileDialogOptions instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {OpenFileDialogOptions}
   */
  static createFrom($$source = {}) {
    const $$createField14_0 = $$createType5;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("Filters" in $$parsedSource) {
      $$parsedSource["Filters"] = $$createField14_0($$parsedSource["Filters"]);
    }
    return new _OpenFileDialogOptions(
      /** @type {Partial<OpenFileDialogOptions>} */
      $$parsedSource
    );
  }
};
var Position = class _Position {
  /**
   * Creates a new Position instance.
   * @param {Partial<Position>} [$$source = {}] - The source object to create the Position.
   */
  constructor($$source = {}) {
    if (!("X" in $$source)) {
      this["X"] = 0;
    }
    if (!("Y" in $$source)) {
      this["Y"] = 0;
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new Position instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {Position}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new _Position(
      /** @type {Partial<Position>} */
      $$parsedSource
    );
  }
};
var RGBA = class _RGBA {
  /**
   * Creates a new RGBA instance.
   * @param {Partial<RGBA>} [$$source = {}] - The source object to create the RGBA.
   */
  constructor($$source = {}) {
    if (!("Red" in $$source)) {
      this["Red"] = 0;
    }
    if (!("Green" in $$source)) {
      this["Green"] = 0;
    }
    if (!("Blue" in $$source)) {
      this["Blue"] = 0;
    }
    if (!("Alpha" in $$source)) {
      this["Alpha"] = 0;
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new RGBA instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {RGBA}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new _RGBA(
      /** @type {Partial<RGBA>} */
      $$parsedSource
    );
  }
};
var Rect = class _Rect {
  /**
   * Creates a new Rect instance.
   * @param {Partial<Rect>} [$$source = {}] - The source object to create the Rect.
   */
  constructor($$source = {}) {
    if (!("X" in $$source)) {
      this["X"] = 0;
    }
    if (!("Y" in $$source)) {
      this["Y"] = 0;
    }
    if (!("Width" in $$source)) {
      this["Width"] = 0;
    }
    if (!("Height" in $$source)) {
      this["Height"] = 0;
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new Rect instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {Rect}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new _Rect(
      /** @type {Partial<Rect>} */
      $$parsedSource
    );
  }
};
var SaveFileDialogOptions = class _SaveFileDialogOptions {
  /**
   * Creates a new SaveFileDialogOptions instance.
   * @param {Partial<SaveFileDialogOptions>} [$$source = {}] - The source object to create the SaveFileDialogOptions.
   */
  constructor($$source = {}) {
    if (
      /** @type {any} */
      false
    ) {
      this["CanCreateDirectories"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["ShowHiddenFiles"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["CanSelectHiddenExtension"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["AllowOtherFileTypes"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["HideExtension"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["TreatsFilePackagesAsDirectories"] = false;
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Title"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Message"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Directory"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Filename"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["ButtonText"] = "";
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Filters"] = [];
    }
    if (
      /** @type {any} */
      false
    ) {
      this["Detached"] = false;
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new SaveFileDialogOptions instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {SaveFileDialogOptions}
   */
  static createFrom($$source = {}) {
    const $$createField11_0 = $$createType5;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("Filters" in $$parsedSource) {
      $$parsedSource["Filters"] = $$createField11_0($$parsedSource["Filters"]);
    }
    return new _SaveFileDialogOptions(
      /** @type {Partial<SaveFileDialogOptions>} */
      $$parsedSource
    );
  }
};
var Screen = class _Screen {
  /**
   * Creates a new Screen instance.
   * @param {Partial<Screen>} [$$source = {}] - The source object to create the Screen.
   */
  constructor($$source = {}) {
    if (!("ID" in $$source)) {
      this["ID"] = "";
    }
    if (!("Name" in $$source)) {
      this["Name"] = "";
    }
    if (!("Scale" in $$source)) {
      this["Scale"] = 0;
    }
    if (!("X" in $$source)) {
      this["X"] = 0;
    }
    if (!("Y" in $$source)) {
      this["Y"] = 0;
    }
    if (!("IsPrimary" in $$source)) {
      this["IsPrimary"] = false;
    }
    if (!("Rotation" in $$source)) {
      this["Rotation"] = 0;
    }
    if (!("Size" in $$source)) {
      this["Size"] = new Size();
    }
    if (!("Bounds" in $$source)) {
      this["Bounds"] = new Rect();
    }
    if (!("WorkArea" in $$source)) {
      this["WorkArea"] = new Rect();
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new Screen instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {Screen}
   */
  static createFrom($$source = {}) {
    const $$createField7_0 = $$createType6;
    const $$createField8_0 = $$createType7;
    const $$createField9_0 = $$createType7;
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    if ("Size" in $$parsedSource) {
      $$parsedSource["Size"] = $$createField7_0($$parsedSource["Size"]);
    }
    if ("Bounds" in $$parsedSource) {
      $$parsedSource["Bounds"] = $$createField8_0($$parsedSource["Bounds"]);
    }
    if ("WorkArea" in $$parsedSource) {
      $$parsedSource["WorkArea"] = $$createField9_0($$parsedSource["WorkArea"]);
    }
    return new _Screen(
      /** @type {Partial<Screen>} */
      $$parsedSource
    );
  }
};
var Size = class _Size {
  /**
   * Creates a new Size instance.
   * @param {Partial<Size>} [$$source = {}] - The source object to create the Size.
   */
  constructor($$source = {}) {
    if (!("Width" in $$source)) {
      this["Width"] = 0;
    }
    if (!("Height" in $$source)) {
      this["Height"] = 0;
    }
    Object.assign(this, $$source);
  }
  /**
   * Creates a new Size instance from a string or object.
   * @param {any} [$$source = {}]
   * @returns {Size}
   */
  static createFrom($$source = {}) {
    let $$parsedSource = typeof $$source === "string" ? JSON.parse($$source) : $$source;
    return new _Size(
      /** @type {Partial<Size>} */
      $$parsedSource
    );
  }
};
var $$createType0 = create_exports.Map(create_exports.Any, create_exports.Any);
var $$createType1 = OSInfo.createFrom;
var $$createType2 = Button.createFrom;
var $$createType3 = create_exports.Array($$createType2);
var $$createType4 = FileFilter.createFrom;
var $$createType5 = create_exports.Array($$createType4);
var $$createType6 = Size.createFrom;
var $$createType7 = Rect.createFrom;

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Dialogs.js
function Error2(options) {
  let $resultPromise = calls_exports.ByID(2508862895, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Info(options) {
  let $resultPromise = calls_exports.ByID(40831083, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function OpenFile(options) {
  let $resultPromise = calls_exports.ByID(2958571101, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Question(options) {
  let $resultPromise = calls_exports.ByID(1378382395, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SaveFile(options) {
  let $resultPromise = calls_exports.ByID(1441773644, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Warning(options) {
  let $resultPromise = calls_exports.ByID(938454105, options);
  return (
    /** @type {any} */
    $resultPromise
  );
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Events.js
var Events_exports = {};
__export(Events_exports, {
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
      if (this.maxCallbacks === -1)
        return false;
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
      if (remove)
        return true;
    });
    if (toRemove.length > 0) {
      listeners = listeners.filter((l) => !toRemove.includes(l));
      if (listeners.length === 0)
        eventListeners.delete(event.name);
      else
        eventListeners.set(event.name, listeners);
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
  if (listeners.length === 0)
    eventListeners.delete(eventName);
  else
    eventListeners.set(eventName, listeners);
}
function Off(eventName, ...additionalEventNames) {
  let eventsToRemove = [eventName, ...additionalEventNames];
  eventsToRemove.forEach((eventName2) => eventListeners.delete(eventName2));
}
function OffAll() {
  eventListeners.clear();
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Events.js
function Emit(event) {
  let $resultPromise = calls_exports.ByID(2480682392, event);
  return (
    /** @type {any} */
    $resultPromise
  );
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Screens.js
var Screens_exports = {};
__export(Screens_exports, {
  GetAll: () => GetAll,
  GetCurrent: () => GetCurrent,
  GetPrimary: () => GetPrimary,
  Rect: () => Rect,
  Screen: () => Screen,
  Size: () => Size
});
function GetAll() {
  let $resultPromise = calls_exports.ByID(2367705532);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType12($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function GetCurrent() {
  let $resultPromise = calls_exports.ByID(316757218);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType02($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function GetPrimary() {
  let $resultPromise = calls_exports.ByID(3749562017);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType02($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
var $$createType02 = Screen.createFrom;
var $$createType12 = create_exports.Array($$createType02);

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/System.js
var System_exports = {};
__export(System_exports, {
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
  let $resultPromise = calls_exports.ByID(3752267968);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType03($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function IsDarkMode() {
  let $resultPromise = calls_exports.ByID(2291282836);
  return (
    /** @type {any} */
    $resultPromise
  );
}
var $$createType03 = EnvironmentInfo.createFrom;

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Window.js
var Window_exports = {};
__export(Window_exports, {
  AbsolutePosition: () => AbsolutePosition2,
  Center: () => Center2,
  Close: () => Close2,
  DisableSizeConstraints: () => DisableSizeConstraints2,
  EnableSizeConstraints: () => EnableSizeConstraints2,
  Focus: () => Focus2,
  ForceReload: () => ForceReload2,
  Fullscreen: () => Fullscreen2,
  Get: () => Get,
  GetBorderSizes: () => GetBorderSizes2,
  GetScreen: () => GetScreen2,
  GetZoom: () => GetZoom2,
  Height: () => Height2,
  Hide: () => Hide3,
  IsFocused: () => IsFocused2,
  IsFullscreen: () => IsFullscreen2,
  IsMaximised: () => IsMaximised2,
  IsMinimised: () => IsMinimised2,
  Maximise: () => Maximise2,
  Minimise: () => Minimise2,
  Name: () => Name2,
  OpenDevTools: () => OpenDevTools2,
  RGBA: () => RGBA,
  RelativePosition: () => RelativePosition2,
  Reload: () => Reload2,
  Resizable: () => Resizable2,
  Restore: () => Restore2,
  SetAbsolutePosition: () => SetAbsolutePosition2,
  SetAlwaysOnTop: () => SetAlwaysOnTop2,
  SetBackgroundColour: () => SetBackgroundColour2,
  SetFrameless: () => SetFrameless2,
  SetFullscreenButtonEnabled: () => SetFullscreenButtonEnabled2,
  SetMaxSize: () => SetMaxSize2,
  SetMinSize: () => SetMinSize2,
  SetRelativePosition: () => SetRelativePosition2,
  SetResizable: () => SetResizable2,
  SetSize: () => SetSize2,
  SetTitle: () => SetTitle2,
  SetZoom: () => SetZoom2,
  Show: () => Show3,
  Size: () => Size3,
  ToggleFullscreen: () => ToggleFullscreen2,
  ToggleMaximise: () => ToggleMaximise2,
  UnFullscreen: () => UnFullscreen2,
  UnMaximise: () => UnMaximise2,
  UnMinimise: () => UnMinimise2,
  Width: () => Width2,
  Zoom: () => Zoom2,
  ZoomIn: () => ZoomIn2,
  ZoomOut: () => ZoomOut2,
  ZoomReset: () => ZoomReset2
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/windowByName.js
var windowByName_exports = {};
__export(windowByName_exports, {
  AbsolutePosition: () => AbsolutePosition,
  Center: () => Center,
  Close: () => Close,
  DisableSizeConstraints: () => DisableSizeConstraints,
  EnableSizeConstraints: () => EnableSizeConstraints,
  Focus: () => Focus,
  ForceReload: () => ForceReload,
  Fullscreen: () => Fullscreen,
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
  Size: () => Size2,
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
function AbsolutePosition(wndName) {
  let $resultPromise = calls_exports.ByID(681832980, wndName);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType04($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function Center(wndName) {
  let $resultPromise = calls_exports.ByID(482312779, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Close(wndName) {
  let $resultPromise = calls_exports.ByID(3191520354, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function DisableSizeConstraints(wndName) {
  let $resultPromise = calls_exports.ByID(1395077781, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function EnableSizeConstraints(wndName) {
  let $resultPromise = calls_exports.ByID(2553320920, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Focus(wndName) {
  let $resultPromise = calls_exports.ByID(2609220586, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ForceReload(wndName) {
  let $resultPromise = calls_exports.ByID(715746260, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Fullscreen(wndName) {
  let $resultPromise = calls_exports.ByID(63601699, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function GetBorderSizes(wndName) {
  let $resultPromise = calls_exports.ByID(461264334, wndName);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType13($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function GetScreen(wndName) {
  let $resultPromise = calls_exports.ByID(564173982, wndName);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType22($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function GetZoom(wndName) {
  let $resultPromise = calls_exports.ByID(642691241, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Height(wndName) {
  let $resultPromise = calls_exports.ByID(113969453, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Hide2(wndName) {
  let $resultPromise = calls_exports.ByID(202951686, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFocused(wndName) {
  let $resultPromise = calls_exports.ByID(1594794399, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFullscreen(wndName) {
  let $resultPromise = calls_exports.ByID(966343839, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMaximised(wndName) {
  let $resultPromise = calls_exports.ByID(4199691515, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMinimised(wndName) {
  let $resultPromise = calls_exports.ByID(3859610369, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Maximise(wndName) {
  let $resultPromise = calls_exports.ByID(805285249, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Minimise(wndName) {
  let $resultPromise = calls_exports.ByID(734710059, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Name(wndName) {
  let $resultPromise = calls_exports.ByID(361737989, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function OpenDevTools(wndName) {
  let $resultPromise = calls_exports.ByID(2193847476, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function RelativePosition(wndName) {
  let $resultPromise = calls_exports.ByID(4094140857, wndName);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType04($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function Reload(wndName) {
  let $resultPromise = calls_exports.ByID(3879273051, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Resizable(wndName) {
  let $resultPromise = calls_exports.ByID(2856238535, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Restore(wndName) {
  let $resultPromise = calls_exports.ByID(166261876, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAbsolutePosition(wndName, x, y) {
  let $resultPromise = calls_exports.ByID(2586820796, wndName, x, y);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAlwaysOnTop(wndName, aot) {
  let $resultPromise = calls_exports.ByID(3832249857, wndName, aot);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetBackgroundColour(wndName, colour) {
  let $resultPromise = calls_exports.ByID(1430453946, wndName, colour);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFrameless(wndName, frameless) {
  let $resultPromise = calls_exports.ByID(3774976130, wndName, frameless);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFullscreenButtonEnabled(wndName, enabled) {
  let $resultPromise = calls_exports.ByID(3940173704, wndName, enabled);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMaxSize(wndName, width, height) {
  let $resultPromise = calls_exports.ByID(3661217553, wndName, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMinSize(wndName, width, height) {
  let $resultPromise = calls_exports.ByID(3987667955, wndName, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetRelativePosition(wndName, x, y) {
  let $resultPromise = calls_exports.ByID(1841590465, wndName, x, y);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetResizable(wndName, resizable2) {
  let $resultPromise = calls_exports.ByID(30739711, wndName, resizable2);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetSize(wndName, width, height) {
  let $resultPromise = calls_exports.ByID(2380415039, wndName, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetTitle(wndName, title) {
  let $resultPromise = calls_exports.ByID(642113048, wndName, title);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetZoom(wndName, magnification) {
  let $resultPromise = calls_exports.ByID(2053983485, wndName, magnification);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Show2(wndName) {
  let $resultPromise = calls_exports.ByID(3532573035, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Size2(wndName) {
  let $resultPromise = calls_exports.ByID(1948312487, wndName);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType32($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function ToggleFullscreen(wndName) {
  let $resultPromise = calls_exports.ByID(233165947, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ToggleMaximise(wndName) {
  let $resultPromise = calls_exports.ByID(3098216505, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnFullscreen(wndName) {
  let $resultPromise = calls_exports.ByID(3321525880, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMaximise(wndName) {
  let $resultPromise = calls_exports.ByID(4178114426, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMinimise(wndName) {
  let $resultPromise = calls_exports.ByID(1637044160, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Width(wndName) {
  let $resultPromise = calls_exports.ByID(1361355346, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Zoom(wndName) {
  let $resultPromise = calls_exports.ByID(895309989, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomIn(wndName) {
  let $resultPromise = calls_exports.ByID(2139263326, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomOut(wndName) {
  let $resultPromise = calls_exports.ByID(4148324127, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomReset(wndName) {
  let $resultPromise = calls_exports.ByID(688305280, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
var $$createType04 = Position.createFrom;
var $$createType13 = LRTB.createFrom;
var $$createType22 = Screen.createFrom;
var $$createType32 = Size.createFrom;

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Window.js
function Get(name) {
  const wnd = {};
  for (const method in Window_exports) {
    if (method !== "Get") {
      wnd[method] = windowByName_exports[method].bind(null, name);
    }
  }
  return (
    /** @type {any} */
    Object.freeze(wnd)
  );
}
function AbsolutePosition2() {
  let $resultPromise = calls_exports.ByID(222553826);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType05($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function Center2() {
  let $resultPromise = calls_exports.ByID(4054430369);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Close2() {
  let $resultPromise = calls_exports.ByID(1436581100);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function DisableSizeConstraints2() {
  let $resultPromise = calls_exports.ByID(2510539891);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function EnableSizeConstraints2() {
  let $resultPromise = calls_exports.ByID(3150968194);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Focus2() {
  let $resultPromise = calls_exports.ByID(3274789872);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ForceReload2() {
  let $resultPromise = calls_exports.ByID(147523250);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Fullscreen2() {
  let $resultPromise = calls_exports.ByID(3924564473);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function GetBorderSizes2() {
  let $resultPromise = calls_exports.ByID(2290953088);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType14($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function GetScreen2() {
  let $resultPromise = calls_exports.ByID(3744597424);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType23($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function GetZoom2() {
  let $resultPromise = calls_exports.ByID(2677359063);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Height2() {
  let $resultPromise = calls_exports.ByID(587157603);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Hide3() {
  let $resultPromise = calls_exports.ByID(3874093464);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFocused2() {
  let $resultPromise = calls_exports.ByID(526819721);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFullscreen2() {
  let $resultPromise = calls_exports.ByID(1192916705);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMaximised2() {
  let $resultPromise = calls_exports.ByID(3036327809);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMinimised2() {
  let $resultPromise = calls_exports.ByID(4012281835);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Maximise2() {
  let $resultPromise = calls_exports.ByID(3759007799);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Minimise2() {
  let $resultPromise = calls_exports.ByID(3548520501);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Name2() {
  let $resultPromise = calls_exports.ByID(4207657051);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function OpenDevTools2() {
  let $resultPromise = calls_exports.ByID(483671974);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function RelativePosition2() {
  let $resultPromise = calls_exports.ByID(3709545923);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType05($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function Reload2() {
  let $resultPromise = calls_exports.ByID(2833731485);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Resizable2() {
  let $resultPromise = calls_exports.ByID(2450946277);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Restore2() {
  let $resultPromise = calls_exports.ByID(1151315034);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAbsolutePosition2(x, y) {
  let $resultPromise = calls_exports.ByID(3991491842, x, y);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAlwaysOnTop2(aot) {
  let $resultPromise = calls_exports.ByID(3349346155, aot);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetBackgroundColour2(colour) {
  let $resultPromise = calls_exports.ByID(2179820576, colour);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFrameless2(frameless) {
  let $resultPromise = calls_exports.ByID(4109365080, frameless);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFullscreenButtonEnabled2(enabled) {
  let $resultPromise = calls_exports.ByID(3863568982, enabled);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMaxSize2(width, height) {
  let $resultPromise = calls_exports.ByID(3460078551, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMinSize2(width, height) {
  let $resultPromise = calls_exports.ByID(2677919085, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetRelativePosition2(x, y) {
  let $resultPromise = calls_exports.ByID(741606115, x, y);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetResizable2(resizable2) {
  let $resultPromise = calls_exports.ByID(2835305541, resizable2);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetSize2(width, height) {
  let $resultPromise = calls_exports.ByID(3379788393, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetTitle2(title) {
  let $resultPromise = calls_exports.ByID(170953598, title);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetZoom2(magnification) {
  let $resultPromise = calls_exports.ByID(2794500051, magnification);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Show3() {
  let $resultPromise = calls_exports.ByID(2931823121);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Size3() {
  let $resultPromise = calls_exports.ByID(1141111433);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType33($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function ToggleFullscreen2() {
  let $resultPromise = calls_exports.ByID(2212763149);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ToggleMaximise2() {
  let $resultPromise = calls_exports.ByID(3144194443);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnFullscreen2() {
  let $resultPromise = calls_exports.ByID(1587002506);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMaximise2() {
  let $resultPromise = calls_exports.ByID(3889999476);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMinimise2() {
  let $resultPromise = calls_exports.ByID(3571636198);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Width2() {
  let $resultPromise = calls_exports.ByID(1655239988);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Zoom2() {
  let $resultPromise = calls_exports.ByID(555719923);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomIn2() {
  let $resultPromise = calls_exports.ByID(1310434272);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomOut2() {
  let $resultPromise = calls_exports.ByID(1755702821);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomReset2() {
  let $resultPromise = calls_exports.ByID(2781467154);
  return (
    /** @type {any} */
    $resultPromise
  );
}
var $$createType05 = Position.createFrom;
var $$createType14 = LRTB.createFrom;
var $$createType23 = Screen.createFrom;
var $$createType33 = Size.createFrom;

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/wml.js
var wml_exports = {};
__export(wml_exports, {
  Enable: () => Enable,
  Reload: () => Reload3
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
  whenReady(Reload3);
}
function Reload3() {
  triggerRegistry.reset();
  document.body.querySelectorAll("[wml-event], [wml-window], [wml-openurl]").forEach(addWMLListeners);
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/bundle/full/index.js
window.wails = runtime_exports;
wml_exports.Enable();
export {
  Application_exports as Application,
  Browser_exports as Browser,
  calls_exports as Call,
  Clipboard_exports as Clipboard,
  Dialogs_exports as Dialogs,
  Events_exports as Events,
  flags_exports as Flags,
  Screens_exports as Screens,
  System_exports as System,
  wml_exports as WML,
  Window_exports as Window
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvcGtnL3J1bnRpbWUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvQXBwbGljYXRpb24uanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL25hbm9pZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvcnVudGltZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvc3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9jb250ZXh0bWVudS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvZmxhZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2RyYWcuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NhbGxzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9jcmVhdGUuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2luZGV4LmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL0Jyb3dzZXIuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvQ2xpcGJvYXJkLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL0RpYWxvZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvbW9kZWxzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL0V2ZW50cy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9ldmVudF90eXBlcy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9saXN0ZW5lci5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9TY3JlZW5zLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL1N5c3RlbS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9XaW5kb3cuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvd2luZG93QnlOYW1lLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL3dtbC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS91dGlscy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2J1bmRsZS9mdWxsL2luZGV4LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5leHBvcnQge1xuICAgIEFwcGxpY2F0aW9uLFxuICAgIEJyb3dzZXIsXG4gICAgQ2FsbCxcbiAgICBDbGlwYm9hcmQsXG4gICAgQ3JlYXRlLFxuICAgIERpYWxvZ3MsXG4gICAgRXZlbnRzLFxuICAgIEZsYWdzLFxuICAgIFNjcmVlbnMsXG4gICAgU3lzdGVtLFxuICAgIFdpbmRvdyxcbiAgICBXTUxcbn0gZnJvbSBcIi4uLy4uL2ludGVybmFsL3J1bnRpbWUvYXBpL2luZGV4LmpzXCI7XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG4vKipcbiAqIEhpZGUgbWFrZXMgYWxsIGFwcGxpY2F0aW9uIHdpbmRvd3MgaW52aXNpYmxlLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIaWRlKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNzI3NDcxNjAyKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBRdWl0IHF1aXRzIHRoZSBhcHBsaWNhdGlvbi5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gUXVpdCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDEyNDQ5MjY5NTMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNob3cgbWFrZXMgYWxsIGFwcGxpY2F0aW9uIHdpbmRvd3MgdmlzaWJsZS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2hvdygpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIyNzA2NzQ4MzkpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIi8qKlxuICogVGhpcyBjb2RlIGZyYWdtZW50IGlzIHRha2VuIGZyb20gbmFub2lkIChodHRwczovL2dpdGh1Yi5jb20vYWkvbmFub2lkKTpcbiAqXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNyBBbmRyZXkgU2l0bmlrIDxhbmRyZXlAc2l0bmlrLnJ1PlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2ZcbiAqIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW5cbiAqIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG9cbiAqIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mXG4gKiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sXG4gKiBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1NcbiAqIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUlxuICogQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSXG4gKiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTlxuICogQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5sZXQgdXJsQWxwaGFiZXQgPVxuICAndXNlYW5kb20tMjZUMTk4MzQwUFg3NXB4SkFDS1ZFUllNSU5EQlVTSFdPTEZfR1FaYmZnaGprbHF2d3l6cmljdCdcbmV4cG9ydCBsZXQgY3VzdG9tQWxwaGFiZXQgPSAoYWxwaGFiZXQsIGRlZmF1bHRTaXplID0gMjEpID0+IHtcbiAgcmV0dXJuIChzaXplID0gZGVmYXVsdFNpemUpID0+IHtcbiAgICBsZXQgaWQgPSAnJ1xuICAgIGxldCBpID0gc2l6ZVxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGlkICs9IGFscGhhYmV0WyhNYXRoLnJhbmRvbSgpICogYWxwaGFiZXQubGVuZ3RoKSB8IDBdXG4gICAgfVxuICAgIHJldHVybiBpZFxuICB9XG59XG5leHBvcnQgbGV0IG5hbm9pZCA9IChzaXplID0gMjEpID0+IHtcbiAgbGV0IGlkID0gJydcbiAgbGV0IGkgPSBzaXplXG4gIHdoaWxlIChpLS0pIHtcbiAgICBpZCArPSB1cmxBbHBoYWJldFsoTWF0aC5yYW5kb20oKSAqIDY0KSB8IDBdXG4gIH1cbiAgcmV0dXJuIGlkXG59XG4iLCAiLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cbmltcG9ydCB7IG5hbm9pZCB9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xuXG5jb25zdCBydW50aW1lVVJMID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIFwiL3dhaWxzL3J1bnRpbWVcIjtcblxuLyoqIFNlbmRzIG1lc3NhZ2VzIHRvIHRoZSBiYWNrZW5kICovXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlKG1zZykge1xuICAgIGlmKHdpbmRvdy5jaHJvbWUpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jaHJvbWUud2Vidmlldy5wb3N0TWVzc2FnZShtc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cud2Via2l0Lm1lc3NhZ2VIYW5kbGVycy5leHRlcm5hbC5wb3N0TWVzc2FnZShtc2cpO1xuICAgIH1cbn1cblxuLyoqIE9iamVjdCBOYW1lcyAqL1xuZXhwb3J0IGNvbnN0IG9iamVjdE5hbWVzID0ge1xuICAgIENhbGw6IDAsXG4gICAgQ29udGV4dE1lbnU6IDQsXG4gICAgQ2FuY2VsQ2FsbDogMTAsXG59XG5leHBvcnQgbGV0IGNsaWVudElkID0gbmFub2lkKCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJ1bnRpbWUgY2FsbGVyIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBhIHNwZWNpZmllZCBtZXRob2Qgb24gYSBnaXZlbiBvYmplY3Qgd2l0aGluIGEgc3BlY2lmaWVkIHdpbmRvdyBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRob2QgaXMgdG8gYmUgaW52b2tlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdyBjb250ZXh0IGluIHdoaWNoIHRoZSBtZXRob2Qgc2hvdWxkIGJlIGNhbGxlZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBydW50aW1lIGNhbGxlciBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBtZXRob2QgbmFtZSBhbmQgb3B0aW9uYWxseSBhcmd1bWVudHMgYW5kIGludm9rZXMgdGhlIG1ldGhvZCB3aXRoaW4gdGhlIHNwZWNpZmllZCB3aW5kb3cgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0LCB3aW5kb3dOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZXRob2QsIGFyZ3M9bnVsbCkge1xuICAgICAgICByZXR1cm4gcnVudGltZUNhbGwob2JqZWN0ICsgXCIuXCIgKyBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpO1xuICAgIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBydW50aW1lIGNhbGxlciB3aXRoIHNwZWNpZmllZCBJRC5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IC0gVGhlIG9iamVjdCB0byBpbnZva2UgdGhlIG1ldGhvZCBvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSAtIFRoZSBuZXcgcnVudGltZSBjYWxsZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdCwgd2luZG93TmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAobWV0aG9kLCBhcmdzPW51bGwpIHtcbiAgICAgICAgcmV0dXJuIHJ1bnRpbWVDYWxsV2l0aElEKG9iamVjdCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKTtcbiAgICB9O1xufVxuXG5cbmZ1bmN0aW9uIHJ1bnRpbWVDYWxsKG1ldGhvZCwgd2luZG93TmFtZSwgYXJncykge1xuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJ1bnRpbWVVUkwpO1xuICAgIGlmKCBtZXRob2QgKSB7XG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwibWV0aG9kXCIsIG1ldGhvZCk7XG4gICAgfVxuICAgIGxldCBmZXRjaE9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgIH07XG4gICAgaWYgKHdpbmRvd05hbWUpIHtcbiAgICAgICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcbiAgICB9XG4gICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJhcmdzXCIsIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcbiAgICB9XG4gICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLWNsaWVudC1pZFwiXSA9IGNsaWVudElkO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZmV0Y2godXJsLCBmZXRjaE9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGNvbnRlbnQgdHlwZVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikgJiYgcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikuaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWplY3QoRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcmVzb2x2ZShkYXRhKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcnVudGltZUNhbGxXaXRoSUQob2JqZWN0SUQsIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncykge1xuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJ1bnRpbWVVUkwpO1xuICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwib2JqZWN0XCIsIG9iamVjdElEKTtcbiAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcIm1ldGhvZFwiLCBtZXRob2QpO1xuICAgIGxldCBmZXRjaE9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgIH07XG4gICAgaWYgKHdpbmRvd05hbWUpIHtcbiAgICAgICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcbiAgICB9XG4gICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJhcmdzXCIsIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcbiAgICB9XG4gICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLWNsaWVudC1pZFwiXSA9IGNsaWVudElkO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGZldGNoKHVybCwgZmV0Y2hPcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBjb250ZW50IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpICYmIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9qc29uXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVqZWN0KEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHJlc29sdmUoZGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSk7XG4gICAgfSk7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuLyoqXG4gKiBGZXRjaGVzIGFwcGxpY2F0aW9uIGNhcGFiaWxpdGllcyBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogQGFzeW5jXG4gKiBAZnVuY3Rpb24gQ2FwYWJpbGl0aWVzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgY2FwYWJpbGl0aWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQ2FwYWJpbGl0aWVzKCkge1xuICAgIHJldHVybiBmZXRjaChcIi93YWlscy9jYXBhYmlsaXRpZXNcIikudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cy5cbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIFdpbmRvd3MsIG90aGVyd2lzZSBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzV2luZG93cygpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5PUyA9PT0gXCJ3aW5kb3dzXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgTGludXguXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIExpbnV4LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0xpbnV4KCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcImxpbnV4XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIGEgbWFjT1Mgb3BlcmF0aW5nIHN5c3RlbS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgbWFjT1MsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWFjKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcImRhcndpblwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQU1ENjQoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuQXJjaCA9PT0gXCJhbWQ2NFwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBhcmNoaXRlY3R1cmUgaXMgQVJNLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGFyY2hpdGVjdHVyZSBpcyBBUk0sIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQVJNKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkFyY2ggPT09IFwiYXJtXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0FSTTY0KCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkFyY2ggPT09IFwiYXJtNjRcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgaW4gZGVidWcgbW9kZS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIGluIGRlYnVnIG1vZGUsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNEZWJ1ZygpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5EZWJ1ZyA9PT0gdHJ1ZTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQge25ld1J1bnRpbWVDYWxsZXJXaXRoSUQsIG9iamVjdE5hbWVzfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQge0lzRGVidWd9IGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuXG4vLyBzZXR1cFxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgY29udGV4dE1lbnVIYW5kbGVyKTtcblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0TmFtZXMuQ29udGV4dE1lbnUsICcnKTtcbmNvbnN0IENvbnRleHRNZW51T3BlbiA9IDA7XG5cbmZ1bmN0aW9uIG9wZW5Db250ZXh0TWVudShpZCwgeCwgeSwgZGF0YSkge1xuICAgIHZvaWQgY2FsbChDb250ZXh0TWVudU9wZW4sIHtpZCwgeCwgeSwgZGF0YX0pO1xufVxuXG5mdW5jdGlvbiBjb250ZXh0TWVudUhhbmRsZXIoZXZlbnQpIHtcbiAgICAvLyBDaGVjayBmb3IgY3VzdG9tIGNvbnRleHQgbWVudVxuICAgIGxldCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCBjdXN0b21Db250ZXh0TWVudSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudVwiKTtcbiAgICBjdXN0b21Db250ZXh0TWVudSA9IGN1c3RvbUNvbnRleHRNZW51ID8gY3VzdG9tQ29udGV4dE1lbnUudHJpbSgpIDogXCJcIjtcbiAgICBpZiAoY3VzdG9tQ29udGV4dE1lbnUpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGV0IGN1c3RvbUNvbnRleHRNZW51RGF0YSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudS1kYXRhXCIpO1xuICAgICAgICBvcGVuQ29udGV4dE1lbnUoY3VzdG9tQ29udGV4dE1lbnUsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGN1c3RvbUNvbnRleHRNZW51RGF0YSk7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQpO1xufVxuXG5cbi8qXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IGF1dG87IChkZWZhdWx0KSB3aWxsIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51IGlmIGNvbnRlbnRFZGl0YWJsZSBpcyB0cnVlIE9SIHRleHQgaGFzIGJlZW4gc2VsZWN0ZWQgT1IgZWxlbWVudCBpcyBpbnB1dCBvciB0ZXh0YXJlYVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBzaG93OyB3aWxsIGFsd2F5cyBzaG93IHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBoaWRlOyB3aWxsIGFsd2F5cyBoaWRlIHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuXG5UaGlzIHJ1bGUgaXMgaW5oZXJpdGVkIGxpa2Ugbm9ybWFsIENTUyBydWxlcywgc28gbmVzdGluZyB3b3JrcyBhcyBleHBlY3RlZFxuKi9cbmZ1bmN0aW9uIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQpIHtcblxuICAgIC8vIERlYnVnIGJ1aWxkcyBhbHdheXMgc2hvdyB0aGUgbWVudVxuICAgIGlmIChJc0RlYnVnKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgZGVmYXVsdCBjb250ZXh0IG1lbnVcbiAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbiAgICBjb25zdCBkZWZhdWx0Q29udGV4dE1lbnVBY3Rpb24gPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoXCItLWRlZmF1bHQtY29udGV4dG1lbnVcIikudHJpbSgpO1xuICAgIHN3aXRjaCAoZGVmYXVsdENvbnRleHRNZW51QWN0aW9uKSB7XG4gICAgICAgIGNhc2UgXCJzaG93XCI6XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNhc2UgXCJoaWRlXCI6XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWVcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0ZXh0IGhhcyBiZWVuIHNlbGVjdGVkXG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBoYXNTZWxlY3Rpb24gPSAoc2VsZWN0aW9uLnRvU3RyaW5nKCkubGVuZ3RoID4gMClcbiAgICAgICAgICAgIGlmIChoYXNTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdGlvbi5yYW5nZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdChpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVjdHMgPSByYW5nZS5nZXRDbGllbnRSZWN0cygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlY3RzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gcmVjdHNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChyZWN0LmxlZnQsIHJlY3QudG9wKSA9PT0gZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRhZ25hbWUgaXMgaW5wdXQgb3IgdGV4dGFyZWFcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09IFwiSU5QVVRcIiB8fCBlbGVtZW50LnRhZ05hbWUgPT09IFwiVEVYVEFSRUFcIikge1xuICAgICAgICAgICAgICAgIGlmIChoYXNTZWxlY3Rpb24gfHwgKCFlbGVtZW50LnJlYWRPbmx5ICYmICFlbGVtZW50LmRpc2FibGVkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBoaWRlIGRlZmF1bHQgY29udGV4dCBtZW51XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGZyb20gdGhlIGZsYWcgbWFwLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlTdHJpbmcgLSBUaGUga2V5IHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBmb3IuXG4gKiBAcmV0dXJuIHsqfSAtIFRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRGbGFnKGtleVN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmZsYWdzW2tleVN0cmluZ107XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcmV0cmlldmUgZmxhZyAnXCIgKyBrZXlTdHJpbmcgKyBcIic6IFwiICsgZSk7XG4gICAgfVxufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7aW52b2tlfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQge0lzV2luZG93c30gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5pbXBvcnQge0dldEZsYWd9IGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5cbi8vIFNldHVwXG5sZXQgc2hvdWxkRHJhZyA9IGZhbHNlO1xubGV0IHJlc2l6YWJsZSA9IGZhbHNlO1xubGV0IHJlc2l6ZUVkZ2UgPSBudWxsO1xubGV0IGRlZmF1bHRDdXJzb3IgPSBcImF1dG9cIjtcblxud2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XG5cbndpbmRvdy5fd2FpbHMuc2V0UmVzaXphYmxlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXNpemFibGUgPSB2YWx1ZTtcbn07XG5cbndpbmRvdy5fd2FpbHMuZW5kRHJhZyA9IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbn07XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuXG5cbmZ1bmN0aW9uIGRyYWdUZXN0KGUpIHtcbiAgICBsZXQgdmFsID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZS50YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLXdhaWxzLWRyYWdnYWJsZVwiKTtcbiAgICBsZXQgbW91c2VQcmVzc2VkID0gZS5idXR0b25zICE9PSB1bmRlZmluZWQgPyBlLmJ1dHRvbnMgOiBlLndoaWNoO1xuICAgIGlmICghdmFsIHx8IHZhbCA9PT0gXCJcIiB8fCB2YWwudHJpbSgpICE9PSBcImRyYWdcIiB8fCBtb3VzZVByZXNzZWQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZS5kZXRhaWwgPT09IDE7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGUpIHtcblxuICAgIC8vIENoZWNrIGZvciByZXNpemluZ1xuICAgIGlmIChyZXNpemVFZGdlKSB7XG4gICAgICAgIGludm9rZShcInJlc2l6ZTpcIiArIHJlc2l6ZUVkZ2UpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZHJhZ1Rlc3QoZSkpIHtcbiAgICAgICAgLy8gVGhpcyBjaGVja3MgZm9yIGNsaWNrcyBvbiB0aGUgc2Nyb2xsIGJhclxuICAgICAgICBpZiAoZS5vZmZzZXRYID4gZS50YXJnZXQuY2xpZW50V2lkdGggfHwgZS5vZmZzZXRZID4gZS50YXJnZXQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2hvdWxkRHJhZyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xuICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc2V0UmVzaXplKGN1cnNvcikge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5jdXJzb3IgPSBjdXJzb3IgfHwgZGVmYXVsdEN1cnNvcjtcbiAgICByZXNpemVFZGdlID0gY3Vyc29yO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKSB7XG4gICAgaWYgKHNob3VsZERyYWcpIHtcbiAgICAgICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xuICAgICAgICBsZXQgbW91c2VQcmVzc2VkID0gZS5idXR0b25zICE9PSB1bmRlZmluZWQgPyBlLmJ1dHRvbnMgOiBlLndoaWNoO1xuICAgICAgICBpZiAobW91c2VQcmVzc2VkID4gMCkge1xuICAgICAgICAgICAgaW52b2tlKFwiZHJhZ1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXJlc2l6YWJsZSB8fCAhSXNXaW5kb3dzKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGVmYXVsdEN1cnNvciA9PSBudWxsKSB7XG4gICAgICAgIGRlZmF1bHRDdXJzb3IgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuY3Vyc29yO1xuICAgIH1cbiAgICBsZXQgcmVzaXplSGFuZGxlSGVpZ2h0ID0gR2V0RmxhZyhcInN5c3RlbS5yZXNpemVIYW5kbGVIZWlnaHRcIikgfHwgNTtcbiAgICBsZXQgcmVzaXplSGFuZGxlV2lkdGggPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZVdpZHRoXCIpIHx8IDU7XG5cbiAgICAvLyBFeHRyYSBwaXhlbHMgZm9yIHRoZSBjb3JuZXIgYXJlYXNcbiAgICBsZXQgY29ybmVyRXh0cmEgPSBHZXRGbGFnKFwicmVzaXplQ29ybmVyRXh0cmFcIikgfHwgMTA7XG5cbiAgICBsZXQgcmlnaHRCb3JkZXIgPSB3aW5kb3cub3V0ZXJXaWR0aCAtIGUuY2xpZW50WCA8IHJlc2l6ZUhhbmRsZVdpZHRoO1xuICAgIGxldCBsZWZ0Qm9yZGVyID0gZS5jbGllbnRYIDwgcmVzaXplSGFuZGxlV2lkdGg7XG4gICAgbGV0IHRvcEJvcmRlciA9IGUuY2xpZW50WSA8IHJlc2l6ZUhhbmRsZUhlaWdodDtcbiAgICBsZXQgYm90dG9tQm9yZGVyID0gd2luZG93Lm91dGVySGVpZ2h0IC0gZS5jbGllbnRZIDwgcmVzaXplSGFuZGxlSGVpZ2h0O1xuXG4gICAgLy8gQWRqdXN0IGZvciBjb3JuZXJzXG4gICAgbGV0IHJpZ2h0Q29ybmVyID0gd2luZG93Lm91dGVyV2lkdGggLSBlLmNsaWVudFggPCAocmVzaXplSGFuZGxlV2lkdGggKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IGxlZnRDb3JuZXIgPSBlLmNsaWVudFggPCAocmVzaXplSGFuZGxlV2lkdGggKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IHRvcENvcm5lciA9IGUuY2xpZW50WSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IGJvdHRvbUNvcm5lciA9IHdpbmRvdy5vdXRlckhlaWdodCAtIGUuY2xpZW50WSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG5cbiAgICAvLyBJZiB3ZSBhcmVuJ3Qgb24gYW4gZWRnZSwgYnV0IHdlcmUsIHJlc2V0IHRoZSBjdXJzb3IgdG8gZGVmYXVsdFxuICAgIGlmICghbGVmdEJvcmRlciAmJiAhcmlnaHRCb3JkZXIgJiYgIXRvcEJvcmRlciAmJiAhYm90dG9tQm9yZGVyICYmIHJlc2l6ZUVkZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXRSZXNpemUoKTtcbiAgICB9XG4gICAgLy8gQWRqdXN0ZWQgZm9yIGNvcm5lciBhcmVhc1xuICAgIGVsc2UgaWYgKHJpZ2h0Q29ybmVyICYmIGJvdHRvbUNvcm5lcikgc2V0UmVzaXplKFwic2UtcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGxlZnRDb3JuZXIgJiYgYm90dG9tQ29ybmVyKSBzZXRSZXNpemUoXCJzdy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAobGVmdENvcm5lciAmJiB0b3BDb3JuZXIpIHNldFJlc2l6ZShcIm53LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmICh0b3BDb3JuZXIgJiYgcmlnaHRDb3JuZXIpIHNldFJlc2l6ZShcIm5lLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChsZWZ0Qm9yZGVyKSBzZXRSZXNpemUoXCJ3LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmICh0b3BCb3JkZXIpIHNldFJlc2l6ZShcIm4tcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGJvdHRvbUJvcmRlcikgc2V0UmVzaXplKFwicy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAocmlnaHRCb3JkZXIpIHNldFJlc2l6ZShcImUtcmVzaXplXCIpO1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7IG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQsIG9iamVjdE5hbWVzIH0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuaW1wb3J0IHsgbmFub2lkIH0gZnJvbSBcIi4vbmFub2lkLmpzXCI7XG5cbi8vIFNldHVwXG53aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcbndpbmRvdy5fd2FpbHMuY2FsbFJlc3VsdEhhbmRsZXIgPSByZXN1bHRIYW5kbGVyO1xud2luZG93Ll93YWlscy5jYWxsRXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyO1xuXG5jb25zdCBDYWxsQmluZGluZyA9IDA7XG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcldpdGhJRChvYmplY3ROYW1lcy5DYWxsLCAnJyk7XG5jb25zdCBjYW5jZWxDYWxsID0gbmV3UnVudGltZUNhbGxlcldpdGhJRChvYmplY3ROYW1lcy5DYW5jZWxDYWxsLCAnJyk7XG5sZXQgY2FsbFJlc3BvbnNlcyA9IG5ldyBNYXAoKTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSB1bmlxdWUgSUQgdXNpbmcgdGhlIG5hbm9pZCBsaWJyYXJ5LlxuICpcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBBIHVuaXF1ZSBJRCB0aGF0IGRvZXMgbm90IGV4aXN0IGluIHRoZSBjYWxsUmVzcG9uc2VzIHNldC5cbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVJRCgpIHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGRvIHtcbiAgICAgICAgcmVzdWx0ID0gbmFub2lkKCk7XG4gICAgfSB3aGlsZSAoY2FsbFJlc3BvbnNlcy5oYXMocmVzdWx0KSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIHRoZSByZXN1bHQgb2YgYSBjYWxsIHJlcXVlc3QuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSByZXF1ZXN0IHRvIGhhbmRsZSB0aGUgcmVzdWx0IGZvci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhIC0gVGhlIHJlc3VsdCBkYXRhIG9mIHRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtib29sZWFufSBpc0pTT04gLSBJbmRpY2F0ZXMgd2hldGhlciB0aGUgZGF0YSBpcyBKU09OIG9yIG5vdC5cbiAqXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9IC0gVGhpcyBtZXRob2QgZG9lcyBub3QgcmV0dXJuIGFueSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gcmVzdWx0SGFuZGxlcihpZCwgZGF0YSwgaXNKU09OKSB7XG4gICAgY29uc3QgcHJvbWlzZUhhbmRsZXIgPSBnZXRBbmREZWxldGVSZXNwb25zZShpZCk7XG4gICAgaWYgKHByb21pc2VIYW5kbGVyKSB7XG4gICAgICAgIHByb21pc2VIYW5kbGVyLnJlc29sdmUoaXNKU09OID8gSlNPTi5wYXJzZShkYXRhKSA6IGRhdGEpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBIYW5kbGVzIHRoZSBlcnJvciBmcm9tIGEgY2FsbCByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgcHJvbWlzZSBoYW5kbGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgZXJyb3IgbWVzc2FnZSB0byByZWplY3QgdGhlIHByb21pc2UgaGFuZGxlciB3aXRoLlxuICpcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGVycm9ySGFuZGxlcihpZCwgbWVzc2FnZSkge1xuICAgIGNvbnN0IHByb21pc2VIYW5kbGVyID0gZ2V0QW5kRGVsZXRlUmVzcG9uc2UoaWQpO1xuICAgIGlmIChwcm9taXNlSGFuZGxlcikge1xuICAgICAgICBwcm9taXNlSGFuZGxlci5yZWplY3QobWVzc2FnZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhbmQgcmVtb3ZlcyB0aGUgcmVzcG9uc2UgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBJRCBmcm9tIHRoZSBjYWxsUmVzcG9uc2VzIG1hcC5cbiAqXG4gKiBAcGFyYW0ge2FueX0gaWQgLSBUaGUgSUQgb2YgdGhlIHJlc3BvbnNlIHRvIGJlIHJldHJpZXZlZCBhbmQgcmVtb3ZlZC5cbiAqXG4gKiBAcmV0dXJucyB7YW55fSBUaGUgcmVzcG9uc2Ugb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gSUQuXG4gKi9cbmZ1bmN0aW9uIGdldEFuZERlbGV0ZVJlc3BvbnNlKGlkKSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBjYWxsUmVzcG9uc2VzLmdldChpZCk7XG4gICAgY2FsbFJlc3BvbnNlcy5kZWxldGUoaWQpO1xuICAgIHJldHVybiByZXNwb25zZTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIGNhbGwgdXNpbmcgdGhlIHByb3ZpZGVkIHR5cGUgYW5kIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfSB0eXBlIC0gVGhlIHR5cGUgb2YgY2FsbCB0byBleGVjdXRlLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSAtIEFkZGl0aW9uYWwgb3B0aW9ucyBmb3IgdGhlIGNhbGwuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSAtIEEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQgYmFzZWQgb24gdGhlIHJlc3VsdCBvZiB0aGUgY2FsbC4gSXQgYWxzbyBoYXMgYSBjYW5jZWwgbWV0aG9kIHRvIGNhbmNlbCBhIGxvbmcgcnVubmluZyByZXF1ZXN0LlxuICovXG5mdW5jdGlvbiBjYWxsQmluZGluZyh0eXBlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBpZCA9IGdlbmVyYXRlSUQoKTtcbiAgICBjb25zdCBkb0NhbmNlbCA9ICgpID0+IHsgcmV0dXJuIGNhbmNlbENhbGwodHlwZSwge1wiY2FsbC1pZFwiOiBpZH0pIH07XG4gICAgbGV0IHF1ZXVlZENhbmNlbCA9IGZhbHNlLCBjYWxsUnVubmluZyA9IGZhbHNlO1xuICAgIGxldCBwID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBvcHRpb25zW1wiY2FsbC1pZFwiXSA9IGlkO1xuICAgICAgICBjYWxsUmVzcG9uc2VzLnNldChpZCwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gICAgICAgIGNhbGwodHlwZSwgb3B0aW9ucykuXG4gICAgICAgICAgICB0aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgY2FsbFJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZWRDYW5jZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvQ2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuXG4gICAgICAgICAgICBjYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHAuY2FuY2VsID0gKCkgPT4ge1xuICAgICAgICBpZiAoY2FsbFJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBkb0NhbmNlbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcXVldWVkQ2FuY2VsID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcDtcbn1cblxuLyoqXG4gKiBDYWxsIG1ldGhvZC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIFRoZSBvcHRpb25zIGZvciB0aGUgbWV0aG9kLlxuICogQHJldHVybnMge09iamVjdH0gLSBUaGUgcmVzdWx0IG9mIHRoZSBjYWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQ2FsbChvcHRpb25zKSB7XG4gICAgcmV0dXJuIGNhbGxCaW5kaW5nKENhbGxCaW5kaW5nLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBhIG1ldGhvZCBieSBuYW1lLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCBpbiB0aGUgZm9ybWF0ICdwYWNrYWdlLnN0cnVjdC5tZXRob2QnLlxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2QuXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIG5hbWUgaXMgbm90IGEgc3RyaW5nIG9yIGlzIG5vdCBpbiB0aGUgY29ycmVjdCBmb3JtYXQuXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGV4ZWN1dGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJ5TmFtZShuYW1lLCAuLi5hcmdzKSB7XG4gICAgLy8gUGFja2FnZSBwYXRocyBtYXkgY29udGFpbiBkb3RzOiBzcGxpdCB3aXRoIGN1c3RvbSBjb2RlXG4gICAgLy8gdG8gZW5zdXJlIG9ubHkgdGhlIGxhc3QgdHdvIGRvdHMgYXJlIHRha2VuIGludG8gYWNjb3VudC5cbiAgICBsZXQgbWV0aG9kRG90ID0gLTEsIHN0cnVjdERvdCA9IC0xO1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBtZXRob2REb3QgPSBuYW1lLmxhc3RJbmRleE9mKFwiLlwiKTtcbiAgICAgICAgaWYgKG1ldGhvZERvdCA+IDApXG4gICAgICAgICAgICBzdHJ1Y3REb3QgPSBuYW1lLmxhc3RJbmRleE9mKFwiLlwiLCBtZXRob2REb3QgLSAxKTtcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kRG90IDwgMCB8fCBzdHJ1Y3REb3QgPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbGxCeU5hbWUgcmVxdWlyZXMgYSBzdHJpbmcgaW4gdGhlIGZvcm1hdCAncGFja2FnZVBhdGguc3RydWN0Lm1ldGhvZCdcIik7XG4gICAgfVxuXG4gICAgY29uc3QgcGFja2FnZVBhdGggPSBuYW1lLnNsaWNlKDAsIHN0cnVjdERvdCksXG4gICAgICAgICAgc3RydWN0TmFtZSA9IG5hbWUuc2xpY2Uoc3RydWN0RG90ICsgMSwgbWV0aG9kRG90KSxcbiAgICAgICAgICBtZXRob2ROYW1lID0gbmFtZS5zbGljZShtZXRob2REb3QgKyAxKTtcblxuICAgIHJldHVybiBjYWxsQmluZGluZyhDYWxsQmluZGluZywge1xuICAgICAgICBwYWNrYWdlUGF0aCxcbiAgICAgICAgc3RydWN0TmFtZSxcbiAgICAgICAgbWV0aG9kTmFtZSxcbiAgICAgICAgYXJnc1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIGJ5IGl0cyBJRCB3aXRoIHRoZSBzcGVjaWZpZWQgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBtZXRob2RJRCAtIFRoZSBJRCBvZiB0aGUgbWV0aG9kIHRvIGNhbGwuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEByZXR1cm4geyp9IC0gVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCeUlEKG1ldGhvZElELCAuLi5hcmdzKSB7XG4gICAgcmV0dXJuIGNhbGxCaW5kaW5nKENhbGxCaW5kaW5nLCB7XG4gICAgICAgIG1ldGhvZElELFxuICAgICAgICBhcmdzXG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb24gYSBwbHVnaW4uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsdWdpbk5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcGx1Z2luLlxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHRvIGNhbGwuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEByZXR1cm5zIHsqfSAtIFRoZSByZXN1bHQgb2YgdGhlIG1ldGhvZCBjYWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gUGx1Z2luKHBsdWdpbk5hbWUsIG1ldGhvZE5hbWUsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIHtcbiAgICAgICAgcGFja2FnZU5hbWU6IFwid2FpbHMtcGx1Z2luc1wiLFxuICAgICAgICBzdHJ1Y3ROYW1lOiBwbHVnaW5OYW1lLFxuICAgICAgICBtZXRob2ROYW1lLFxuICAgICAgICBhcmdzXG4gICAgfSk7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuLyoqXG4gKiBBbnkgaXMgYSBkdW1teSBjcmVhdGlvbiBmdW5jdGlvbiBmb3Igc2ltcGxlIG9yIHVua25vd24gdHlwZXMuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHthbnl9IHNvdXJjZVxuICogQHJldHVybnMge1R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBbnkoc291cmNlKSB7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7VH0gKi8oc291cmNlKTtcbn1cblxuLyoqXG4gKiBBcnJheSB0YWtlcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFycmF5XG4gKiB3aG9zZSBlbGVtZW50cyBhcmUgb2YgdGhhdCB0eXBlLlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7KGFueSkgPT4gVH0gZWxlbWVudFxuICogQHJldHVybnMgeyhhbnkpID0+IFRbXX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5KGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudCA9PT0gQW55KSB7XG4gICAgICAgIHJldHVybiAoc291cmNlKSA9PiAoc291cmNlID09PSBudWxsID8gW10gOiBzb3VyY2UpO1xuICAgIH1cblxuICAgIHJldHVybiAoc291cmNlKSA9PiB7XG4gICAgICAgIGlmIChzb3VyY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc291cmNlW2ldID0gZWxlbWVudChzb3VyY2VbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBNYXAgdGFrZXMgY3JlYXRpb24gZnVuY3Rpb25zIGZvciB0d28gYXJiaXRyYXJ5IHR5cGVzXG4gKiBhbmQgcmV0dXJucyBhbiBpbi1wbGFjZSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gb2JqZWN0XG4gKiB3aG9zZSBrZXlzIGFuZCB2YWx1ZXMgYXJlIG9mIHRob3NlIHR5cGVzLlxuICogQHRlbXBsYXRlIEssIFZcbiAqIEBwYXJhbSB7KGFueSkgPT4gS30ga2V5XG4gKiBAcGFyYW0geyhhbnkpID0+IFZ9IHZhbHVlXG4gKiBAcmV0dXJucyB7KGFueSkgPT4geyBbXzogS106IFYgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1hcChrZXksIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSBBbnkpIHtcbiAgICAgICAgcmV0dXJuIChzb3VyY2UpID0+IChzb3VyY2UgPT09IG51bGwgPyB7fSA6IHNvdXJjZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzb3VyY2UpID0+IHtcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgc291cmNlW2tleV0gPSB2YWx1ZShzb3VyY2Vba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9O1xufVxuXG4vKipcbiAqIE51bGxhYmxlIHRha2VzIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXG4gKiBhbmQgcmV0dXJucyBhIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhIG51bGxhYmxlIHZhbHVlIG9mIHRoYXQgdHlwZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geyhhbnkpID0+IFR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHsoYW55KSA9PiAoVCB8IG51bGwpfVxuICovXG5leHBvcnQgZnVuY3Rpb24gTnVsbGFibGUoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50ID09PSBBbnkpIHtcbiAgICAgICAgcmV0dXJuIEFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IG51bGwgOiBlbGVtZW50KHNvdXJjZSkpO1xufVxuXG4vKipcbiAqIFN0cnVjdCB0YWtlcyBhbiBvYmplY3QgbWFwcGluZyBmaWVsZCBuYW1lcyB0byBjcmVhdGlvbiBmdW5jdGlvbnNcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhIHN0cnVjdC5cbiAqIEB0ZW1wbGF0ZSB7eyBbXzogc3RyaW5nXTogKChhbnkpID0+IGFueSkgfX0gVFxuICogQHRlbXBsYXRlIHt7IFtLZXkgaW4ga2V5b2YgVF0/OiBSZXR1cm5UeXBlPFRbS2V5XT4gfX0gVVxuICogQHBhcmFtIHtUfSBjcmVhdGVGaWVsZFxuICogQHJldHVybnMgeyhhbnkpID0+IFV9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJ1Y3QoY3JlYXRlRmllbGQpIHtcbiAgICBsZXQgYWxsQW55ID0gdHJ1ZTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gY3JlYXRlRmllbGQpIHtcbiAgICAgICAgaWYgKGNyZWF0ZUZpZWxkW25hbWVdICE9PSBBbnkpIHtcbiAgICAgICAgICAgIGFsbEFueSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFsbEFueSkge1xuICAgICAgICByZXR1cm4gQW55O1xuICAgIH1cblxuICAgIHJldHVybiAoc291cmNlKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBpbiBjcmVhdGVGaWVsZCkge1xuICAgICAgICAgICAgaWYgKG5hbWUgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgc291cmNlW25hbWVdID0gY3JlYXRlRmllbGRbbmFtZV0oc291cmNlW25hbWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8vIFNldHVwXG53aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcblxuaW1wb3J0IFwiLi9jb250ZXh0bWVudS5qc1wiO1xuaW1wb3J0IFwiLi9kcmFnLmpzXCI7XG5cbi8vIFJlLWV4cG9ydCAoaW50ZXJuYWwpIHB1YmxpYyBBUElcbmV4cG9ydCAqIGFzIENhbGwgZnJvbSBcIi4vY2FsbHMuanNcIjtcbmV4cG9ydCAqIGFzIENyZWF0ZSBmcm9tIFwiLi9jcmVhdGUuanNcIjtcbmV4cG9ydCAqIGFzIEZsYWdzIGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5leHBvcnQgKiBhcyBTeXN0ZW0gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5cbmltcG9ydCB7aW52b2tlfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5cbi8vIFByb3ZpZGUgZHVtbXkgZXZlbnQgbGlzdGVuZXIuXG5pZiAoIShcImRpc3BhdGNoV2FpbHNFdmVudFwiIGluIHdpbmRvdy5fd2FpbHMpKSB7XG4gICAgd2luZG93Ll93YWlscy5kaXNwYXRjaFdhaWxzRXZlbnQgPSBmdW5jdGlvbiAoKSB7fTtcbn1cblxuLy8gTm90aWZ5IGJhY2tlbmRcbndpbmRvdy5fd2FpbHMuaW52b2tlID0gaW52b2tlO1xuaW52b2tlKFwid2FpbHM6cnVudGltZTpyZWFkeVwiKTtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQgeyBDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZSB9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbi8qKlxuICogT3BlblVSTCBvcGVucyBhIGJyb3dzZXIgd2luZG93IHRvIHRoZSBnaXZlbiBVUkwuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9wZW5VUkwodXJsKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MTQxNDA4MTg1LCB1cmwpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuLyoqXG4gKiBTZXRUZXh0IHdyaXRlcyB0aGUgZ2l2ZW4gc3RyaW5nIHRvIHRoZSBDbGlwYm9hcmQuXG4gKiBJdCByZXR1cm5zIHRydWUgaWYgdGhlIG9wZXJhdGlvbiBzdWNjZWVkZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRleHQodGV4dCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoOTQwNTczNzQ5LCB0ZXh0KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBUZXh0IHJldHJpZXZlcyBhIHN0cmluZyBmcm9tIHRoZSBjbGlwYm9hcmQuXG4gKiBJZiB0aGUgb3BlcmF0aW9uIGZhaWxzLCBpdCByZXR1cm5zIG51bGwuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmcgfCBudWxsPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRleHQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNDkyMzg2MjEpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgJG1vZGVscyBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuZXhwb3J0IHtNZXNzYWdlRGlhbG9nT3B0aW9ucywgQnV0dG9uLCBGaWxlRmlsdGVyLCBPcGVuRmlsZURpYWxvZ09wdGlvbnMsIFNhdmVGaWxlRGlhbG9nT3B0aW9uc30gZnJvbSBcIi4vbW9kZWxzLmpzXCI7XG5cbi8qKlxuICogRXJyb3Igc2hvd3MgYSBtb2RhbCBkaWFsb2cgY29udGFpbmluZyBhbiBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRXJyb3Iob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjUwODg2Mjg5NSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogSW5mbyBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGFuIGluZm9ybWF0aW9uYWwgbWVzc2FnZS5cbiAqIEBwYXJhbSB7JG1vZGVscy5NZXNzYWdlRGlhbG9nT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEluZm8ob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDA4MzEwODMsIG9wdGlvbnMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE9wZW5GaWxlIHNob3dzIGEgZGlhbG9nIHRoYXQgYWxsb3dzIHRoZSB1c2VyXG4gKiB0byBzZWxlY3Qgb25lIG9yIG1vcmUgZmlsZXMgdG8gb3Blbi5cbiAqIEl0IG1heSB0aHJvdyBhbiBleGNlcHRpb24gaW4gY2FzZSBvZiBlcnJvcnMuXG4gKiBJdCByZXR1cm5zIGEgc3RyaW5nIGluIHNpbmdsZSBzZWxlY3Rpb24gbW9kZSxcbiAqIGFuIGFycmF5IG9mIHN0cmluZ3MgaW4gbXVsdGlwbGUgc2VsZWN0aW9uIG1vZGUuXG4gKiBAcGFyYW0geyRtb2RlbHMuT3BlbkZpbGVEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjk1ODU3MTEwMSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUXVlc3Rpb24gc2hvd3MgYSBtb2RhbCBkaWFsb2cgYXNraW5nIGEgcXVlc3Rpb24uXG4gKiBAcGFyYW0geyRtb2RlbHMuTWVzc2FnZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWVzdGlvbihvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMzc4MzgyMzk1LCBvcHRpb25zKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTYXZlRmlsZSBzaG93cyBhIGRpYWxvZyB0aGF0IGFsbG93cyB0aGUgdXNlclxuICogdG8gc2VsZWN0IGEgbG9jYXRpb24gd2hlcmUgYSBmaWxlIHNob3VsZCBiZSBzYXZlZC5cbiAqIEl0IG1heSB0aHJvdyBhbiBleGNlcHRpb24gaW4gY2FzZSBvZiBlcnJvcnMuXG4gKiBAcGFyYW0geyRtb2RlbHMuU2F2ZUZpbGVEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2F2ZUZpbGUob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTQ0MTc3MzY0NCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogV2FybmluZyBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGEgd2FybmluZyBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gV2FybmluZyhvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg5Mzg0NTQxMDUsIG9wdGlvbnMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0IGNsYXNzIEJ1dHRvbiB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBCdXR0b24gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPEJ1dHRvbj59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgQnV0dG9uLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGV4dCB0aGF0IGFwcGVhcnMgd2l0aGluIHRoZSBidXR0b24uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTGFiZWxcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRydWUgaWYgdGhlIGJ1dHRvbiBzaG91bGQgY2FuY2VsIGFuIG9wZXJhdGlvbiB3aGVuIGNsaWNrZWQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIklzQ2FuY2VsXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVHJ1ZSBpZiB0aGUgYnV0dG9uIHNob3VsZCBiZSB0aGUgZGVmYXVsdCBhY3Rpb24gd2hlbiB0aGUgdXNlciBwcmVzc2VzIGVudGVyLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJJc0RlZmF1bHRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgQnV0dG9uIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7QnV0dG9ufVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgQnV0dG9uKC8qKiBAdHlwZSB7UGFydGlhbDxCdXR0b24+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50SW5mbyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBFbnZpcm9ubWVudEluZm8gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPEVudmlyb25tZW50SW5mbz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgRW52aXJvbm1lbnRJbmZvLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKCEoXCJPU1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgb3BlcmF0aW5nIHN5c3RlbSBpbiB1c2UuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiT1NcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQXJjaFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYXJjaGl0ZWN0dXJlIG9mIHRoZSBzeXN0ZW0uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQXJjaFwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJEZWJ1Z1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUcnVlIGlmIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGRlYnVnIG1vZGUsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGVidWdcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlBsYXRmb3JtSW5mb1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBBZGRpdGlvbmFsIHBsYXRmb3JtIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3sgW186IHN0cmluZ106IGFueSB9fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiUGxhdGZvcm1JbmZvXCJdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJPU0luZm9cIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRGV0YWlscyBvZiB0aGUgb3BlcmF0aW5nIHN5c3RlbS5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtPU0luZm99XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJPU0luZm9cIl0gPSAobmV3IE9TSW5mbygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgRW52aXJvbm1lbnRJbmZvIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7RW52aXJvbm1lbnRJbmZvfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDNfMCA9ICQkY3JlYXRlVHlwZTA7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQ0XzAgPSAkJGNyZWF0ZVR5cGUxO1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgaWYgKFwiUGxhdGZvcm1JbmZvXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiUGxhdGZvcm1JbmZvXCJdID0gJCRjcmVhdGVGaWVsZDNfMCgkJHBhcnNlZFNvdXJjZVtcIlBsYXRmb3JtSW5mb1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwiT1NJbmZvXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiT1NJbmZvXCJdID0gJCRjcmVhdGVGaWVsZDRfMCgkJHBhcnNlZFNvdXJjZVtcIk9TSW5mb1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBFbnZpcm9ubWVudEluZm8oLyoqIEB0eXBlIHtQYXJ0aWFsPEVudmlyb25tZW50SW5mbz59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmlsZUZpbHRlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBGaWxlRmlsdGVyIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxGaWxlRmlsdGVyPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBGaWxlRmlsdGVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmlsdGVyIGluZm9ybWF0aW9uLCBlLmcuIFwiSW1hZ2UgRmlsZXMgKCouanBnLCAqLnBuZylcIlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkRpc3BsYXlOYW1lXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgZXh0ZW5zaW9uIHBhdHRlcm5zLCBlLmcuIFwiKi5qcGc7Ki5wbmdcIlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlBhdHRlcm5cIl0gPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBGaWxlRmlsdGVyIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7RmlsZUZpbHRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IEZpbGVGaWx0ZXIoLyoqIEB0eXBlIHtQYXJ0aWFsPEZpbGVGaWx0ZXI+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIExSVEIge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTFJUQiBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8TFJUQj59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgTFJUQi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiTGVmdFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTGVmdFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJSaWdodFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiUmlnaHRcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiVG9wXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJUb3BcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQm90dG9tXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCb3R0b21cIl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBMUlRCIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7TFJUQn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IExSVEIoLyoqIEB0eXBlIHtQYXJ0aWFsPExSVEI+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VEaWFsb2dPcHRpb25zIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IE1lc3NhZ2VEaWFsb2dPcHRpb25zIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxNZXNzYWdlRGlhbG9nT3B0aW9ucz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgTWVzc2FnZURpYWxvZ09wdGlvbnMuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgdGl0bGUgb2YgdGhlIGRpYWxvZyB3aW5kb3cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVGl0bGVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBtYWluIG1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk1lc3NhZ2VcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIExpc3Qgb2YgYnV0dG9uIGNob2ljZXMgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge0J1dHRvbltdIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQnV0dG9uc1wiXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGV0YWNoZWRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTWVzc2FnZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtNZXNzYWdlRGlhbG9nT3B0aW9uc31cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQyXzAgPSAkJGNyZWF0ZVR5cGUzO1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgaWYgKFwiQnV0dG9uc1wiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIkJ1dHRvbnNcIl0gPSAkJGNyZWF0ZUZpZWxkMl8wKCQkcGFyc2VkU291cmNlW1wiQnV0dG9uc1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBNZXNzYWdlRGlhbG9nT3B0aW9ucygvKiogQHR5cGUge1BhcnRpYWw8TWVzc2FnZURpYWxvZ09wdGlvbnM+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9TSW5mbyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBPU0luZm8gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPE9TSW5mbz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgT1NJbmZvLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKCEoXCJJRFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgSUQgb2YgdGhlIE9TLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIklEXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIk5hbWVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIG5hbWUgb2YgdGhlIE9TLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk5hbWVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiVmVyc2lvblwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgdmVyc2lvbiBvZiB0aGUgT1MuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVmVyc2lvblwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJCcmFuZGluZ1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYnJhbmRpbmcgb2YgdGhlIE9TLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJyYW5kaW5nXCJdID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgT1NJbmZvIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7T1NJbmZvfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgT1NJbmZvKC8qKiBAdHlwZSB7UGFydGlhbDxPU0luZm8+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9wZW5GaWxlRGlhbG9nT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBPcGVuRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPE9wZW5GaWxlRGlhbG9nT3B0aW9ucz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgT3BlbkZpbGVEaWFsb2dPcHRpb25zLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjaG9zZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkNhbkNob29zZURpcmVjdG9yaWVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGZpbGVzIGNhbiBiZSBjaG9zZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkNhbkNob29zZUZpbGVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjcmVhdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5DcmVhdGVEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBoaWRkZW4gZmlsZXMgc2hvdWxkIGJlIHNob3duLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJTaG93SGlkZGVuRmlsZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgYWxpYXNlcyBzaG91bGQgYmUgcmVzb2x2ZWQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlJlc29sdmVzQWxpYXNlc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBtdWx0aXBsZSBzZWxlY3Rpb24gaXMgYWxsb3dlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxsb3dzTXVsdGlwbGVTZWxlY3Rpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZXh0ZW5zaW9ucyBzaG91bGQgYmUgaGlkZGVuLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJIaWRlRXh0ZW5zaW9uXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGhpZGRlbiBleHRlbnNpb25zIGNhbiBiZSBzZWxlY3RlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQ2FuU2VsZWN0SGlkZGVuRXh0ZW5zaW9uXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGZpbGUgcGFja2FnZXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZGlyZWN0b3JpZXMuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlRyZWF0c0ZpbGVQYWNrYWdlc0FzRGlyZWN0b3JpZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgb3RoZXIgZmlsZSB0eXBlcyBhcmUgYWxsb3dlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxsb3dzT3RoZXJGaWxlVHlwZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaXRsZSBvZiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlRpdGxlXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBNZXNzYWdlIHRvIHNob3cgaW4gdGhlIGRpYWxvZy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJNZXNzYWdlXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCdXR0b25UZXh0XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEaXJlY3RvcnkgdG8gb3BlbiBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkRpcmVjdG9yeVwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTGlzdCBvZiBmaWxlIGZpbHRlcnMuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7RmlsZUZpbHRlcltdIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRmlsdGVyc1wiXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGV0YWNoZWRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgT3BlbkZpbGVEaWFsb2dPcHRpb25zIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7T3BlbkZpbGVEaWFsb2dPcHRpb25zfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDE0XzAgPSAkJGNyZWF0ZVR5cGU1O1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgaWYgKFwiRmlsdGVyc1wiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIkZpbHRlcnNcIl0gPSAkJGNyZWF0ZUZpZWxkMTRfMCgkJHBhcnNlZFNvdXJjZVtcIkZpbHRlcnNcIl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgT3BlbkZpbGVEaWFsb2dPcHRpb25zKC8qKiBAdHlwZSB7UGFydGlhbDxPcGVuRmlsZURpYWxvZ09wdGlvbnM+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFBvc2l0aW9uIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxQb3NpdGlvbj59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgUG9zaXRpb24uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIlhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiWVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiWVwiXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFBvc2l0aW9uIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7UG9zaXRpb259XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIG5ldyBQb3NpdGlvbigvKiogQHR5cGUge1BhcnRpYWw8UG9zaXRpb24+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJHQkEge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUkdCQSBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8UkdCQT59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgUkdCQS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiUmVkXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJSZWRcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiR3JlZW5cIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkdyZWVuXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIkJsdWVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJsdWVcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQWxwaGFcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkFscGhhXCJdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUkdCQSBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2FueX0gWyQkc291cmNlID0ge31dXG4gICAgICogQHJldHVybnMge1JHQkF9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIG5ldyBSR0JBKC8qKiBAdHlwZSB7UGFydGlhbDxSR0JBPn0gKi8oJCRwYXJzZWRTb3VyY2UpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN0IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFJlY3QgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFJlY3Q+fSBbJCRzb3VyY2UgPSB7fV0gLSBUaGUgc291cmNlIG9iamVjdCB0byBjcmVhdGUgdGhlIFJlY3QuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIlhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiWVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiWVwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJXaWR0aFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiV2lkdGhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiSGVpZ2h0XCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJIZWlnaHRcIl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBSZWN0IGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7UmVjdH1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IFJlY3QoLyoqIEB0eXBlIHtQYXJ0aWFsPFJlY3Q+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhdmVGaWxlRGlhbG9nT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBTYXZlRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFNhdmVGaWxlRGlhbG9nT3B0aW9ucz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgU2F2ZUZpbGVEaWFsb2dPcHRpb25zLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjcmVhdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5DcmVhdGVEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBoaWRkZW4gZmlsZXMgc2hvdWxkIGJlIHNob3duLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJTaG93SGlkZGVuRmlsZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGV4dGVuc2lvbnMgY2FuIGJlIHNlbGVjdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5TZWxlY3RIaWRkZW5FeHRlbnNpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgb3RoZXIgZmlsZSB0eXBlcyBhcmUgYWxsb3dlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxsb3dPdGhlckZpbGVUeXBlc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgZXh0ZW5zaW9uIHNob3VsZCBiZSBoaWRkZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkhpZGVFeHRlbnNpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZmlsZSBwYWNrYWdlcyBzaG91bGQgYmUgdHJlYXRlZCBhcyBkaXJlY3Rvcmllcy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVHJlYXRzRmlsZVBhY2thZ2VzQXNEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRpdGxlIG9mIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVGl0bGVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk1lc3NhZ2VcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERpcmVjdG9yeSB0byBvcGVuIGluIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGlyZWN0b3J5XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEZWZhdWx0IGZpbGVuYW1lIHRvIHVzZSBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkZpbGVuYW1lXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCdXR0b25UZXh0XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBMaXN0IG9mIGZpbGUgZmlsdGVycy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtGaWxlRmlsdGVyW10gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJGaWx0ZXJzXCJdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93LlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJEZXRhY2hlZFwiXSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBTYXZlRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtTYXZlRmlsZURpYWxvZ09wdGlvbnN9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBjb25zdCAkJGNyZWF0ZUZpZWxkMTFfMCA9ICQkY3JlYXRlVHlwZTU7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICBpZiAoXCJGaWx0ZXJzXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiRmlsdGVyc1wiXSA9ICQkY3JlYXRlRmllbGQxMV8wKCQkcGFyc2VkU291cmNlW1wiRmlsdGVyc1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBTYXZlRmlsZURpYWxvZ09wdGlvbnMoLyoqIEB0eXBlIHtQYXJ0aWFsPFNhdmVGaWxlRGlhbG9nT3B0aW9ucz59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2NyZWVuIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNjcmVlbiBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8U2NyZWVuPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBTY3JlZW4uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIklEXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEEgdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiSURcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiTmFtZVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk5hbWVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiU2NhbGVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHNjYWxlIGZhY3RvciBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlNjYWxlXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJYXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIllcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHktY29vcmRpbmF0ZSBvZiB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJZXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIklzUHJpbWFyeVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBXaGV0aGVyIHRoaXMgaXMgdGhlIHByaW1hcnkgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJJc1ByaW1hcnlcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlJvdGF0aW9uXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSByb3RhdGlvbiBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlJvdGF0aW9uXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlNpemVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHNpemUgb2YgdGhlIGRpc3BsYXlcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtTaXplfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiU2l6ZVwiXSA9IChuZXcgU2l6ZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIkJvdW5kc1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYm91bmRzIG9mIHRoZSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7UmVjdH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJvdW5kc1wiXSA9IChuZXcgUmVjdCgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIldvcmtBcmVhXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSB3b3JrIGFyZWEgb2YgdGhlIGRpc3BsYXlcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtSZWN0fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiV29ya0FyZWFcIl0gPSAobmV3IFJlY3QoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNjcmVlbiBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2FueX0gWyQkc291cmNlID0ge31dXG4gICAgICogQHJldHVybnMge1NjcmVlbn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQ3XzAgPSAkJGNyZWF0ZVR5cGU2O1xuICAgICAgICBjb25zdCAkJGNyZWF0ZUZpZWxkOF8wID0gJCRjcmVhdGVUeXBlNztcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDlfMCA9ICQkY3JlYXRlVHlwZTc7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICBpZiAoXCJTaXplXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiU2l6ZVwiXSA9ICQkY3JlYXRlRmllbGQ3XzAoJCRwYXJzZWRTb3VyY2VbXCJTaXplXCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJCb3VuZHNcIiBpbiAkJHBhcnNlZFNvdXJjZSkge1xuICAgICAgICAgICAgJCRwYXJzZWRTb3VyY2VbXCJCb3VuZHNcIl0gPSAkJGNyZWF0ZUZpZWxkOF8wKCQkcGFyc2VkU291cmNlW1wiQm91bmRzXCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJXb3JrQXJlYVwiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIldvcmtBcmVhXCJdID0gJCRjcmVhdGVGaWVsZDlfMCgkJHBhcnNlZFNvdXJjZVtcIldvcmtBcmVhXCJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFNjcmVlbigvKiogQHR5cGUge1BhcnRpYWw8U2NyZWVuPn0gKi8oJCRwYXJzZWRTb3VyY2UpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTaXplIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNpemUgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFNpemU+fSBbJCRzb3VyY2UgPSB7fV0gLSBUaGUgc291cmNlIG9iamVjdCB0byBjcmVhdGUgdGhlIFNpemUuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIldpZHRoXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJXaWR0aFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJIZWlnaHRcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkhlaWdodFwiXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNpemUgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtTaXplfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgU2l6ZSgvKiogQHR5cGUge1BhcnRpYWw8U2l6ZT59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG4vLyBQcml2YXRlIHR5cGUgY3JlYXRpb24gZnVuY3Rpb25zXG5jb25zdCAkJGNyZWF0ZVR5cGUwID0gJENyZWF0ZS5NYXAoJENyZWF0ZS5BbnksICRDcmVhdGUuQW55KTtcbmNvbnN0ICQkY3JlYXRlVHlwZTEgPSBPU0luZm8uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTIgPSBCdXR0b24uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTMgPSAkQ3JlYXRlLkFycmF5KCQkY3JlYXRlVHlwZTIpO1xuY29uc3QgJCRjcmVhdGVUeXBlNCA9IEZpbGVGaWx0ZXIuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTUgPSAkQ3JlYXRlLkFycmF5KCQkY3JlYXRlVHlwZTQpO1xuY29uc3QgJCRjcmVhdGVUeXBlNiA9IFNpemUuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTcgPSBSZWN0LmNyZWF0ZUZyb207XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi9saXN0ZW5lci5qc1wiO1xuXG4vKipcbiAqIEVtaXQgZW1pdHMgYW4gZXZlbnQgdXNpbmcgdGhlIGdpdmVuIGV2ZW50IG9iamVjdC5cbiAqIFlvdSBjYW4gcGFzcyBpbiBpbnN0YW5jZXMgb2YgdGhlIGNsYXNzIGBXYWlsc0V2ZW50YC5cbiAqIEBwYXJhbSB7e1wibmFtZVwiOiBzdHJpbmcsIFwiZGF0YVwiOiBhbnl9fSBldmVudFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbWl0KGV2ZW50KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNDgwNjgyMzkyLCBldmVudCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG4iLCAiXG5leHBvcnQgY29uc3QgRXZlbnRUeXBlcyA9IHtcblx0V2luZG93czoge1xuXHRcdFN5c3RlbVRoZW1lQ2hhbmdlZDogXCJ3aW5kb3dzOlN5c3RlbVRoZW1lQ2hhbmdlZFwiLFxuXHRcdEFQTVBvd2VyU3RhdHVzQ2hhbmdlOiBcIndpbmRvd3M6QVBNUG93ZXJTdGF0dXNDaGFuZ2VcIixcblx0XHRBUE1TdXNwZW5kOiBcIndpbmRvd3M6QVBNU3VzcGVuZFwiLFxuXHRcdEFQTVJlc3VtZUF1dG9tYXRpYzogXCJ3aW5kb3dzOkFQTVJlc3VtZUF1dG9tYXRpY1wiLFxuXHRcdEFQTVJlc3VtZVN1c3BlbmQ6IFwid2luZG93czpBUE1SZXN1bWVTdXNwZW5kXCIsXG5cdFx0QVBNUG93ZXJTZXR0aW5nQ2hhbmdlOiBcIndpbmRvd3M6QVBNUG93ZXJTZXR0aW5nQ2hhbmdlXCIsXG5cdFx0QXBwbGljYXRpb25TdGFydGVkOiBcIndpbmRvd3M6QXBwbGljYXRpb25TdGFydGVkXCIsXG5cdFx0V2ViVmlld05hdmlnYXRpb25Db21wbGV0ZWQ6IFwid2luZG93czpXZWJWaWV3TmF2aWdhdGlvbkNvbXBsZXRlZFwiLFxuXHRcdFdpbmRvd0luYWN0aXZlOiBcIndpbmRvd3M6V2luZG93SW5hY3RpdmVcIixcblx0XHRXaW5kb3dBY3RpdmU6IFwid2luZG93czpXaW5kb3dBY3RpdmVcIixcblx0XHRXaW5kb3dDbGlja0FjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0NsaWNrQWN0aXZlXCIsXG5cdFx0V2luZG93TWF4aW1pc2U6IFwid2luZG93czpXaW5kb3dNYXhpbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWF4aW1pc2U6IFwid2luZG93czpXaW5kb3dVbk1heGltaXNlXCIsXG5cdFx0V2luZG93RnVsbHNjcmVlbjogXCJ3aW5kb3dzOldpbmRvd0Z1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dVbkZ1bGxzY3JlZW46IFwid2luZG93czpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dSZXN0b3JlOiBcIndpbmRvd3M6V2luZG93UmVzdG9yZVwiLFxuXHRcdFdpbmRvd01pbmltaXNlOiBcIndpbmRvd3M6V2luZG93TWluaW1pc2VcIixcblx0XHRXaW5kb3dVbk1pbmltaXNlOiBcIndpbmRvd3M6V2luZG93VW5NaW5pbWlzZVwiLFxuXHRcdFdpbmRvd0Nsb3NlOiBcIndpbmRvd3M6V2luZG93Q2xvc2VcIixcblx0XHRXaW5kb3dTZXRGb2N1czogXCJ3aW5kb3dzOldpbmRvd1NldEZvY3VzXCIsXG5cdFx0V2luZG93S2lsbEZvY3VzOiBcIndpbmRvd3M6V2luZG93S2lsbEZvY3VzXCIsXG5cdFx0V2luZG93RHJhZ0Ryb3A6IFwid2luZG93czpXaW5kb3dEcmFnRHJvcFwiLFxuXHRcdFdpbmRvd0RyYWdFbnRlcjogXCJ3aW5kb3dzOldpbmRvd0RyYWdFbnRlclwiLFxuXHRcdFdpbmRvd0RyYWdMZWF2ZTogXCJ3aW5kb3dzOldpbmRvd0RyYWdMZWF2ZVwiLFxuXHRcdFdpbmRvd0RyYWdPdmVyOiBcIndpbmRvd3M6V2luZG93RHJhZ092ZXJcIixcblx0fSxcblx0TWFjOiB7XG5cdFx0QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQmVjb21lQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllczogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllc1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VJY29uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUljb25cIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZU9jY2x1c2lvblN0YXRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZU9jY2x1c2lvblN0YXRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVNjcmVlblBhcmFtZXRlcnNcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJPcmllbnRhdGlvbjogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJPcmllbnRhdGlvblwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiBcIm1hYzpBcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZ1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkSGlkZTogXCJtYWM6QXBwbGljYXRpb25EaWRIaWRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRSZXNpZ25BY3RpdmVOb3RpZmljYXRpb246IFwibWFjOkFwcGxpY2F0aW9uRGlkUmVzaWduQWN0aXZlTm90aWZpY2F0aW9uXCIsXG5cdFx0QXBwbGljYXRpb25EaWRVbmhpZGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVW5oaWRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVXBkYXRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsQmVjb21lQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxCZWNvbWVBY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxGaW5pc2hMYXVuY2hpbmc6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEZpbmlzaExhdW5jaGluZ1wiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbEhpZGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEhpZGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFJlc2lnbkFjdGl2ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVGVybWluYXRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsVW5oaWRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxVbmhpZGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFVwZGF0ZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlVGhlbWU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlVGhlbWUhXCIsXG5cdFx0QXBwbGljYXRpb25TaG91bGRIYW5kbGVSZW9wZW46IFwibWFjOkFwcGxpY2F0aW9uU2hvdWxkSGFuZGxlUmVvcGVuIVwiLFxuXHRcdFdpbmRvd0RpZEJlY29tZUtleTogXCJtYWM6V2luZG93RGlkQmVjb21lS2V5XCIsXG5cdFx0V2luZG93RGlkQmVjb21lTWFpbjogXCJtYWM6V2luZG93RGlkQmVjb21lTWFpblwiLFxuXHRcdFdpbmRvd0RpZEJlZ2luU2hlZXQ6IFwibWFjOldpbmRvd0RpZEJlZ2luU2hlZXRcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VBbHBoYTogXCJtYWM6V2luZG93RGlkQ2hhbmdlQWxwaGFcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VCYWNraW5nTG9jYXRpb246IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdMb2NhdGlvblwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllc1wiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZU9jY2x1c2lvblN0YXRlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VPY2NsdXNpb25TdGF0ZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuUHJvZmlsZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuUHJvZmlsZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlUHJvcGVydGllczogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VQcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2hhcmluZ1R5cGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNoYXJpbmdUeXBlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2VPcmRlcmluZ01vZGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVGl0bGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVRpdGxlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlVG9vbGJhclwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVZpc2liaWxpdHk6IFwibWFjOldpbmRvd0RpZENoYW5nZVZpc2liaWxpdHlcIixcblx0XHRXaW5kb3dEaWREZW1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dEaWREZW1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93RGlkRW5kU2hlZXQ6IFwibWFjOldpbmRvd0RpZEVuZFNoZWV0XCIsXG5cdFx0V2luZG93RGlkRW50ZXJGdWxsU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRFbnRlckZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRFbnRlclZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dEaWRFbnRlclZlcnNpb25Ccm93c2VyXCIsXG5cdFx0V2luZG93RGlkRXhpdEZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEV4aXRGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkRXhpdFZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dEaWRFeGl0VmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dEaWRFeHBvc2U6IFwibWFjOldpbmRvd0RpZEV4cG9zZVwiLFxuXHRcdFdpbmRvd0RpZEZvY3VzOiBcIm1hYzpXaW5kb3dEaWRGb2N1c1wiLFxuXHRcdFdpbmRvd0RpZE1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dEaWRNaW5pYXR1cml6ZVwiLFxuXHRcdFdpbmRvd0RpZE1vdmU6IFwibWFjOldpbmRvd0RpZE1vdmVcIixcblx0XHRXaW5kb3dEaWRPcmRlck9mZlNjcmVlbjogXCJtYWM6V2luZG93RGlkT3JkZXJPZmZTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRPcmRlck9uU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRPcmRlck9uU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkUmVzaWduS2V5OiBcIm1hYzpXaW5kb3dEaWRSZXNpZ25LZXlcIixcblx0XHRXaW5kb3dEaWRSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dEaWRSZXNpZ25NYWluXCIsXG5cdFx0V2luZG93RGlkUmVzaXplOiBcIm1hYzpXaW5kb3dEaWRSZXNpemVcIixcblx0XHRXaW5kb3dEaWRVcGRhdGU6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZUFscGhhOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVBbHBoYVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXM6IFwibWFjOldpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlU2hhZG93OiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVTaGFkb3dcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVUaXRsZTogXCJtYWM6V2luZG93RGlkVXBkYXRlVGl0bGVcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVUb29sYmFyOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVUb29sYmFyXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlVmlzaWJpbGl0eTogXCJtYWM6V2luZG93RGlkVXBkYXRlVmlzaWJpbGl0eVwiLFxuXHRcdFdpbmRvd1Nob3VsZENsb3NlOiBcIm1hYzpXaW5kb3dTaG91bGRDbG9zZSFcIixcblx0XHRXaW5kb3dXaWxsQmVjb21lS2V5OiBcIm1hYzpXaW5kb3dXaWxsQmVjb21lS2V5XCIsXG5cdFx0V2luZG93V2lsbEJlY29tZU1haW46IFwibWFjOldpbmRvd1dpbGxCZWNvbWVNYWluXCIsXG5cdFx0V2luZG93V2lsbEJlZ2luU2hlZXQ6IFwibWFjOldpbmRvd1dpbGxCZWdpblNoZWV0XCIsXG5cdFx0V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZVwiLFxuXHRcdFdpbmRvd1dpbGxDbG9zZTogXCJtYWM6V2luZG93V2lsbENsb3NlXCIsXG5cdFx0V2luZG93V2lsbERlbWluaWF0dXJpemU6IFwibWFjOldpbmRvd1dpbGxEZW1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93V2lsbEVudGVyRnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEVudGVyRnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxFbnRlclZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dXaWxsRW50ZXJWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd1dpbGxFeGl0RnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEV4aXRGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd1dpbGxGb2N1czogXCJtYWM6V2luZG93V2lsbEZvY3VzXCIsXG5cdFx0V2luZG93V2lsbE1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dXaWxsTWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dXaWxsTW92ZTogXCJtYWM6V2luZG93V2lsbE1vdmVcIixcblx0XHRXaW5kb3dXaWxsT3JkZXJPZmZTY3JlZW46IFwibWFjOldpbmRvd1dpbGxPcmRlck9mZlNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxPcmRlck9uU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsT3JkZXJPblNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dXaWxsUmVzaWduTWFpblwiLFxuXHRcdFdpbmRvd1dpbGxSZXNpemU6IFwibWFjOldpbmRvd1dpbGxSZXNpemVcIixcblx0XHRXaW5kb3dXaWxsVW5mb2N1czogXCJtYWM6V2luZG93V2lsbFVuZm9jdXNcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUFscGhhOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQWxwaGFcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlU2hhZG93OiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlU2hhZG93XCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVRpdGxlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVGl0bGVcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRvb2xiYXJcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVmlzaWJpbGl0eTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVZpc2liaWxpdHlcIixcblx0XHRXaW5kb3dXaWxsVXNlU3RhbmRhcmRGcmFtZTogXCJtYWM6V2luZG93V2lsbFVzZVN0YW5kYXJkRnJhbWVcIixcblx0XHRNZW51V2lsbE9wZW46IFwibWFjOk1lbnVXaWxsT3BlblwiLFxuXHRcdE1lbnVEaWRPcGVuOiBcIm1hYzpNZW51RGlkT3BlblwiLFxuXHRcdE1lbnVEaWRDbG9zZTogXCJtYWM6TWVudURpZENsb3NlXCIsXG5cdFx0TWVudVdpbGxTZW5kQWN0aW9uOiBcIm1hYzpNZW51V2lsbFNlbmRBY3Rpb25cIixcblx0XHRNZW51RGlkU2VuZEFjdGlvbjogXCJtYWM6TWVudURpZFNlbmRBY3Rpb25cIixcblx0XHRNZW51V2lsbEhpZ2hsaWdodEl0ZW06IFwibWFjOk1lbnVXaWxsSGlnaGxpZ2h0SXRlbVwiLFxuXHRcdE1lbnVEaWRIaWdobGlnaHRJdGVtOiBcIm1hYzpNZW51RGlkSGlnaGxpZ2h0SXRlbVwiLFxuXHRcdE1lbnVXaWxsRGlzcGxheUl0ZW06IFwibWFjOk1lbnVXaWxsRGlzcGxheUl0ZW1cIixcblx0XHRNZW51RGlkRGlzcGxheUl0ZW06IFwibWFjOk1lbnVEaWREaXNwbGF5SXRlbVwiLFxuXHRcdE1lbnVXaWxsQWRkSXRlbTogXCJtYWM6TWVudVdpbGxBZGRJdGVtXCIsXG5cdFx0TWVudURpZEFkZEl0ZW06IFwibWFjOk1lbnVEaWRBZGRJdGVtXCIsXG5cdFx0TWVudVdpbGxSZW1vdmVJdGVtOiBcIm1hYzpNZW51V2lsbFJlbW92ZUl0ZW1cIixcblx0XHRNZW51RGlkUmVtb3ZlSXRlbTogXCJtYWM6TWVudURpZFJlbW92ZUl0ZW1cIixcblx0XHRNZW51V2lsbEJlZ2luVHJhY2tpbmc6IFwibWFjOk1lbnVXaWxsQmVnaW5UcmFja2luZ1wiLFxuXHRcdE1lbnVEaWRCZWdpblRyYWNraW5nOiBcIm1hYzpNZW51RGlkQmVnaW5UcmFja2luZ1wiLFxuXHRcdE1lbnVXaWxsRW5kVHJhY2tpbmc6IFwibWFjOk1lbnVXaWxsRW5kVHJhY2tpbmdcIixcblx0XHRNZW51RGlkRW5kVHJhY2tpbmc6IFwibWFjOk1lbnVEaWRFbmRUcmFja2luZ1wiLFxuXHRcdE1lbnVXaWxsVXBkYXRlOiBcIm1hYzpNZW51V2lsbFVwZGF0ZVwiLFxuXHRcdE1lbnVEaWRVcGRhdGU6IFwibWFjOk1lbnVEaWRVcGRhdGVcIixcblx0XHRNZW51V2lsbFBvcFVwOiBcIm1hYzpNZW51V2lsbFBvcFVwXCIsXG5cdFx0TWVudURpZFBvcFVwOiBcIm1hYzpNZW51RGlkUG9wVXBcIixcblx0XHRNZW51V2lsbFNlbmRBY3Rpb25Ub0l0ZW06IFwibWFjOk1lbnVXaWxsU2VuZEFjdGlvblRvSXRlbVwiLFxuXHRcdE1lbnVEaWRTZW5kQWN0aW9uVG9JdGVtOiBcIm1hYzpNZW51RGlkU2VuZEFjdGlvblRvSXRlbVwiLFxuXHRcdFdlYlZpZXdEaWRTdGFydFByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFN0YXJ0UHJvdmlzaW9uYWxOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZFJlY2VpdmVTZXJ2ZXJSZWRpcmVjdEZvclByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFJlY2VpdmVTZXJ2ZXJSZWRpcmVjdEZvclByb3Zpc2lvbmFsTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRGaW5pc2hOYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRDb21taXROYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkQ29tbWl0TmF2aWdhdGlvblwiLFxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ0VudGVyZWQ6IFwibWFjOldpbmRvd0ZpbGVEcmFnZ2luZ0VudGVyZWRcIixcblx0XHRXaW5kb3dGaWxlRHJhZ2dpbmdQZXJmb3JtZWQ6IFwibWFjOldpbmRvd0ZpbGVEcmFnZ2luZ1BlcmZvcm1lZFwiLFxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ0V4aXRlZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nRXhpdGVkXCIsXG5cdH0sXG5cdExpbnV4OiB7XG5cdFx0U3lzdGVtVGhlbWVDaGFuZ2VkOiBcImxpbnV4OlN5c3RlbVRoZW1lQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd0xvYWRDaGFuZ2VkOiBcImxpbnV4OldpbmRvd0xvYWRDaGFuZ2VkXCIsXG5cdFx0V2luZG93RGVsZXRlRXZlbnQ6IFwibGludXg6V2luZG93RGVsZXRlRXZlbnRcIixcblx0XHRXaW5kb3dGb2N1c0luOiBcImxpbnV4OldpbmRvd0ZvY3VzSW5cIixcblx0XHRXaW5kb3dGb2N1c091dDogXCJsaW51eDpXaW5kb3dGb2N1c091dFwiLFxuXHRcdEFwcGxpY2F0aW9uU3RhcnR1cDogXCJsaW51eDpBcHBsaWNhdGlvblN0YXJ0dXBcIixcblx0fSxcblx0Q29tbW9uOiB7XG5cdFx0QXBwbGljYXRpb25TdGFydGVkOiBcImNvbW1vbjpBcHBsaWNhdGlvblN0YXJ0ZWRcIixcblx0XHRXaW5kb3dNYXhpbWlzZTogXCJjb21tb246V2luZG93TWF4aW1pc2VcIixcblx0XHRXaW5kb3dVbk1heGltaXNlOiBcImNvbW1vbjpXaW5kb3dVbk1heGltaXNlXCIsXG5cdFx0V2luZG93RnVsbHNjcmVlbjogXCJjb21tb246V2luZG93RnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd1VuRnVsbHNjcmVlbjogXCJjb21tb246V2luZG93VW5GdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93UmVzdG9yZTogXCJjb21tb246V2luZG93UmVzdG9yZVwiLFxuXHRcdFdpbmRvd01pbmltaXNlOiBcImNvbW1vbjpXaW5kb3dNaW5pbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWluaW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWluaW1pc2VcIixcblx0XHRXaW5kb3dDbG9zaW5nOiBcImNvbW1vbjpXaW5kb3dDbG9zaW5nXCIsXG5cdFx0V2luZG93Wm9vbTogXCJjb21tb246V2luZG93Wm9vbVwiLFxuXHRcdFdpbmRvd1pvb21JbjogXCJjb21tb246V2luZG93Wm9vbUluXCIsXG5cdFx0V2luZG93Wm9vbU91dDogXCJjb21tb246V2luZG93Wm9vbU91dFwiLFxuXHRcdFdpbmRvd1pvb21SZXNldDogXCJjb21tb246V2luZG93Wm9vbVJlc2V0XCIsXG5cdFx0V2luZG93Rm9jdXM6IFwiY29tbW9uOldpbmRvd0ZvY3VzXCIsXG5cdFx0V2luZG93TG9zdEZvY3VzOiBcImNvbW1vbjpXaW5kb3dMb3N0Rm9jdXNcIixcblx0XHRXaW5kb3dTaG93OiBcImNvbW1vbjpXaW5kb3dTaG93XCIsXG5cdFx0V2luZG93SGlkZTogXCJjb21tb246V2luZG93SGlkZVwiLFxuXHRcdFdpbmRvd0RQSUNoYW5nZWQ6IFwiY29tbW9uOldpbmRvd0RQSUNoYW5nZWRcIixcblx0XHRXaW5kb3dGaWxlc0Ryb3BwZWQ6IFwiY29tbW9uOldpbmRvd0ZpbGVzRHJvcHBlZFwiLFxuXHRcdFdpbmRvd1J1bnRpbWVSZWFkeTogXCJjb21tb246V2luZG93UnVudGltZVJlYWR5XCIsXG5cdFx0VGhlbWVDaGFuZ2VkOiBcImNvbW1vbjpUaGVtZUNoYW5nZWRcIixcblx0fSxcbn07XG4iLCAiLy8gQHRzLW5vY2hlY2tcbi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7RXZlbnRUeXBlc30gZnJvbSBcIi4vZXZlbnRfdHlwZXMuanNcIjtcbmV4cG9ydCBjb25zdCBUeXBlcyA9IEV2ZW50VHlwZXM7XG5cbi8vIFNldHVwXG53aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcbndpbmRvdy5fd2FpbHMuZGlzcGF0Y2hXYWlsc0V2ZW50ID0gZGlzcGF0Y2hXYWlsc0V2ZW50O1xuXG5jb25zdCBldmVudExpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuY2xhc3MgTGlzdGVuZXIge1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcykge1xuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgdGhpcy5tYXhDYWxsYmFja3MgPSBtYXhDYWxsYmFja3MgfHwgLTE7XG4gICAgICAgIHRoaXMuQ2FsbGJhY2sgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICBpZiAodGhpcy5tYXhDYWxsYmFja3MgPT09IC0xKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1heENhbGxiYWNrcyAtPSAxO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4Q2FsbGJhY2tzID09PSAwO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgYSBXYWlscyBhcHBsaWNhdGlvbiBldmVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFdhaWxzRXZlbnQge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgd2FpbHMgZXZlbnQgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHsqfSBbZGF0YV0gLSBBcmJpdHJhcnkgZGF0YSBhc3NvY2lhdGVkIHRvIHRoZSBldmVudC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhID0gbnVsbCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQXJiaXRyYXJ5IGRhdGEgYXNzb2NpYXRlZCB0byB0aGUgZXZlbnQuXG4gICAgICAgICAqIEB0eXBlIHsqfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoV2FpbHNFdmVudChldmVudCkge1xuICAgIGNvbnN0IHdldmVudCA9IC8qKiBAdHlwZSB7YW55fSAqLyhuZXcgV2FpbHNFdmVudChldmVudC5uYW1lLCBldmVudC5kYXRhKSlcbiAgICBPYmplY3QuYXNzaWduKHdldmVudCwgZXZlbnQpXG4gICAgZXZlbnQgPSB3ZXZlbnQ7XG5cbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50Lm5hbWUpO1xuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgbGV0IHRvUmVtb3ZlID0gbGlzdGVuZXJzLmZpbHRlcihsaXN0ZW5lciA9PiB7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlID0gbGlzdGVuZXIuQ2FsbGJhY2soZXZlbnQpO1xuICAgICAgICAgICAgaWYgKHJlbW92ZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodG9SZW1vdmUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmZpbHRlcihsID0+ICF0b1JlbW92ZS5pbmNsdWRlcyhsKSk7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkgZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50Lm5hbWUpO1xuICAgICAgICAgICAgZWxzZSBldmVudExpc3RlbmVycy5zZXQoZXZlbnQubmFtZSwgbGlzdGVuZXJzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBmb3IgYSBzcGVjaWZpYyBldmVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmb3IuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICogQHBhcmFtIHtudW1iZXJ9IG1heENhbGxiYWNrcyAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiB0aW1lcyB0aGUgY2FsbGJhY2sgY2FuIGJlIGNhbGxlZCBmb3IgdGhlIGV2ZW50LiBPbmNlIHRoZSBtYXhpbXVtIG51bWJlciBpcyByZWFjaGVkLCB0aGUgY2FsbGJhY2sgd2lsbCBubyBsb25nZXIgYmUgY2FsbGVkLlxuICpcbiBAcmV0dXJuIHtmdW5jdGlvbn0gLSBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCBtYXhDYWxsYmFja3MpIHtcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50TmFtZSkgfHwgW107XG4gICAgY29uc3QgdGhpc0xpc3RlbmVyID0gbmV3IExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcyk7XG4gICAgbGlzdGVuZXJzLnB1c2godGhpc0xpc3RlbmVyKTtcbiAgICBldmVudExpc3RlbmVycy5zZXQoZXZlbnROYW1lLCBsaXN0ZW5lcnMpO1xuICAgIHJldHVybiAoKSA9PiBsaXN0ZW5lck9mZih0aGlzTGlzdGVuZXIpO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIHNwZWNpZmllZCBldmVudCBvY2N1cnMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkLiBJdCB0YWtlcyBubyBwYXJhbWV0ZXJzLlxuICogQHJldHVybiB7ZnVuY3Rpb259IC0gQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPbihldmVudE5hbWUsIGNhbGxiYWNrKSB7IHJldHVybiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIC0xKTsgfVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIG9ubHkgb25jZSBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgZXZlbnQgb2NjdXJzLlxuICogQHJldHVybiB7ZnVuY3Rpb259IC0gQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9uY2UoZXZlbnROYW1lLCBjYWxsYmFjaykgeyByZXR1cm4gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCAxKTsgfVxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBsaXN0ZW5lciBmcm9tIHRoZSBldmVudCBsaXN0ZW5lcnMgY29sbGVjdGlvbi5cbiAqIElmIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudCBhcmUgcmVtb3ZlZCwgdGhlIGV2ZW50IGtleSBpcyBkZWxldGVkIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmVyIC0gVGhlIGxpc3RlbmVyIHRvIGJlIHJlbW92ZWQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlbmVyT2ZmKGxpc3RlbmVyKSB7XG4gICAgY29uc3QgZXZlbnROYW1lID0gbGlzdGVuZXIuZXZlbnROYW1lO1xuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnROYW1lKS5maWx0ZXIobCA9PiBsICE9PSBsaXN0ZW5lcik7XG4gICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDApIGV2ZW50TGlzdGVuZXJzLmRlbGV0ZShldmVudE5hbWUpO1xuICAgIGVsc2UgZXZlbnRMaXN0ZW5lcnMuc2V0KGV2ZW50TmFtZSwgbGlzdGVuZXJzKTtcbn1cblxuXG4vKipcbiAqIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IG5hbWVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gKiBAcGFyYW0gey4uLnN0cmluZ30gYWRkaXRpb25hbEV2ZW50TmFtZXMgLSBBZGRpdGlvbmFsIGV2ZW50IG5hbWVzIHRvIHJlbW92ZSBsaXN0ZW5lcnMgZm9yLlxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gT2ZmKGV2ZW50TmFtZSwgLi4uYWRkaXRpb25hbEV2ZW50TmFtZXMpIHtcbiAgICBsZXQgZXZlbnRzVG9SZW1vdmUgPSBbZXZlbnROYW1lLCAuLi5hZGRpdGlvbmFsRXZlbnROYW1lc107XG4gICAgZXZlbnRzVG9SZW1vdmUuZm9yRWFjaChldmVudE5hbWUgPT4gZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50TmFtZSkpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAZnVuY3Rpb24gT2ZmQWxsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9mZkFsbCgpIHsgZXZlbnRMaXN0ZW5lcnMuY2xlYXIoKTsgfVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgJG1vZGVscyBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuZXhwb3J0IHtTY3JlZW4sIFJlY3QsIFNpemV9IGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG4vKipcbiAqIEdldEFsbCByZXR1cm5zIGRlc2NyaXB0b3JzIGZvciBhbGwgc2NyZWVucy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuU2NyZWVuW10+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0QWxsKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjM2NzcwNTUzMik7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMSgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogR2V0Q3VycmVudCByZXR1cm5zIGEgZGVzY3JpcHRvciBmb3IgdGhlIHNjcmVlblxuICogd2hlcmUgdGhlIGN1cnJlbnRseSBhY3RpdmUgd2luZG93IGlzIGxvY2F0ZWQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRDdXJyZW50KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzE2NzU3MjE4KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUwKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBHZXRQcmltYXJ5IHJldHVybnMgYSBkZXNjcmlwdG9yIGZvciB0aGUgcHJpbWFyeSBzY3JlZW4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRQcmltYXJ5KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc0OTU2MjAxNyk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8vIFByaXZhdGUgdHlwZSBjcmVhdGlvbiBmdW5jdGlvbnNcbmNvbnN0ICQkY3JlYXRlVHlwZTAgPSAkbW9kZWxzLlNjcmVlbi5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlMSA9ICRDcmVhdGUuQXJyYXkoJCRjcmVhdGVUeXBlMCk7XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi4vY29yZS9zeXN0ZW0uanNcIjtcblxuLyoqXG4gKiBFbnZpcm9ubWVudCByZXRyaWV2ZXMgZW52aXJvbm1lbnQgZGV0YWlscy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuRW52aXJvbm1lbnRJbmZvPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVudmlyb25tZW50KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc1MjI2Nzk2OCk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogSXNEYXJrTW9kZSByZXRyaWV2ZXMgc3lzdGVtIGRhcmsgbW9kZSBzdGF0dXMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRGFya01vZGUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMjkxMjgyODM2KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLy8gUHJpdmF0ZSB0eXBlIGNyZWF0aW9uIGZ1bmN0aW9uc1xuY29uc3QgJCRjcmVhdGVUeXBlMCA9ICRtb2RlbHMuRW52aXJvbm1lbnRJbmZvLmNyZWF0ZUZyb207XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5leHBvcnQge1JHQkF9IGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gXCIuL1dpbmRvdy5qc1wiO1xuaW1wb3J0ICogYXMgYnlOYW1lIGZyb20gXCIuL3dpbmRvd0J5TmFtZS5qc1wiO1xuXG4vKipcbiAqIFJldHVybnMgYSB3aW5kb3cgb2JqZWN0IGZvciB0aGUgZ2l2ZW4gd2luZG93IG5hbWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHJldHVybnMgeyB7IHJlYWRvbmx5IFtNZXRob2QgaW4ga2V5b2YgKHR5cGVvZiBzZWxmKSBhcyBFeGNsdWRlPE1ldGhvZCwgXCJHZXRcIj5dOiAodHlwZW9mIHNlbGYpW01ldGhvZF0gfSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXQobmFtZSkge1xuICAgIGxldCBnZXRNZXRob2QgPSAoa2V5KSA9PiBieU5hbWVba2V5XS5iaW5kKG51bGwsIG5hbWUpO1xuICAgIGlmIChuYW1lID09PSBcIlwiKSB7IGdldE1ldGhvZCA9IChrZXkpID0+IHNlbGZba2V5XTsgfTtcbiAgICBjb25zdCB3bmQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IG1ldGhvZCBpbiBzZWxmKSB7XG4gICAgICAgIGlmIChtZXRob2QgIT09IFwiR2V0XCIgJiYgbWV0aG9kICE9PSBcIlJHQkFcIikge1xuICAgICAgICAgICAgd25kW21ldGhvZF0gPSBnZXRNZXRob2QobWV0aG9kKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKE9iamVjdC5mcmVlemUod25kKSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdyB0byB0aGUgc2NyZWVuLlxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5Qb3NpdGlvbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBYnNvbHV0ZVBvc2l0aW9uKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjIyNTUzODI2KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUwKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBDZW50ZXJzIHRoZSB3aW5kb3cgb24gdGhlIHNjcmVlbi5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQ2VudGVyKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDA1NDQzMDM2OSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENsb3NlKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTQzNjU4MTEwMCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRGlzYWJsZXMgbWluL21heCBzaXplIGNvbnN0cmFpbnRzLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjUxMDUzOTg5MSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVuYWJsZVNpemVDb25zdHJhaW50cygpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMxNTA5NjgxOTQpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEZvY3VzZXMgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9jdXMoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMjc0Nzg5ODcyKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBGb3JjZXMgdGhlIHdpbmRvdyB0byByZWxvYWQgdGhlIHBhZ2UgYXNzZXRzLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGb3JjZVJlbG9hZCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE0NzUyMzI1MCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU3dpdGNoZXMgdGhlIHdpbmRvdyB0byBmdWxsc2NyZWVuIG1vZGUuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZ1bGxzY3JlZW4oKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzOTI0NTY0NDczKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzaXplIG9mIHRoZSBmb3VyIHdpbmRvdyBib3JkZXJzLlxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5MUlRCPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEJvcmRlclNpemVzKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjI5MDk1MzA4OCk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMSgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2NyZWVuIHRoYXQgdGhlIHdpbmRvdyBpcyBvbi5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuU2NyZWVuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldFNjcmVlbigpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM3NDQ1OTc0MjQpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTIoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8bnVtYmVyPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldFpvb20oKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNjc3MzU5MDYzKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIZWlnaHQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg1ODcxNTc2MDMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEhpZGVzIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEhpZGUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODc0MDkzNDY0KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmb2N1c2VkLlxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0ZvY3VzZWQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg1MjY4MTk3MjEpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIGZ1bGxzY3JlZW4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRnVsbHNjcmVlbigpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDExOTI5MTY3MDUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIG1heGltaXNlZC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNYXhpbWlzZWQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMDM2MzI3ODA5KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBtaW5pbWlzZWQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWluaW1pc2VkKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDAxMjI4MTgzNSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogTWF4aW1pc2VzIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1heGltaXNlKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc1OTAwNzc5OSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogTWluaW1pc2VzIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1pbmltaXNlKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzU0ODUyMDUwMSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE5hbWUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MjA3NjU3MDUxKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBPcGVucyB0aGUgZGV2ZWxvcG1lbnQgdG9vbHMgcGFuZS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkRldlRvb2xzKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDgzNjcxOTc0KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlBvc2l0aW9uPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlbGF0aXZlUG9zaXRpb24oKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNzA5NTQ1OTIzKTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUwKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZWxvYWRzIHBhZ2UgYXNzZXRzLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxvYWQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyODMzNzMxNDg1KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyByZXNpemFibGUuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlc2l6YWJsZSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI0NTA5NDYyNzcpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJlc3RvcmVzIHRoZSB3aW5kb3cgdG8gaXRzIHByZXZpb3VzIHN0YXRlIGlmIGl0IHdhcyBwcmV2aW91c2x5IG1pbmltaXNlZCwgbWF4aW1pc2VkIG9yIGZ1bGxzY3JlZW4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlc3RvcmUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMTUxMzE1MDM0KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0QWJzb2x1dGVQb3NpdGlvbih4LCB5KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzOTkxNDkxODQyLCB4LCB5KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSB3aW5kb3cgdG8gYmUgYWx3YXlzIG9uIHRvcC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYW90XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEFsd2F5c09uVG9wKGFvdCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzM0OTM0NjE1NSwgYW90KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBiYWNrZ3JvdW5kIGNvbG91ciBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHskbW9kZWxzLlJHQkF9IGNvbG91clxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRCYWNrZ3JvdW5kQ29sb3VyKGNvbG91cikge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjE3OTgyMDU3NiwgY29sb3VyKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSB3aW5kb3cgZnJhbWUgYW5kIHRpdGxlIGJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZnJhbWVsZXNzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEZyYW1lbGVzcyhmcmFtZWxlc3MpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQxMDkzNjUwODAsIGZyYW1lbGVzcyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBvciBkaXNhYmxlcyB0aGUgc3lzdGVtIGZ1bGxzY3JlZW4gYnV0dG9uLlxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEZ1bGxzY3JlZW5CdXR0b25FbmFibGVkKGVuYWJsZWQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM4NjM1Njg5ODIsIGVuYWJsZWQpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1heGltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldE1heFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzQ2MDA3ODU1MSwgd2lkdGgsIGhlaWdodCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbWluaW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0TWluU2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNjc3OTE5MDg1LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVsYXRpdmVQb3NpdGlvbih4LCB5KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg3NDE2MDYxMTUsIHgsIHkpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgd2hldGhlciB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzaXphYmxlXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFJlc2l6YWJsZShyZXNpemFibGUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI4MzUzMDU1NDEsIHJlc2l6YWJsZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzM3OTc4ODM5Mywgd2lkdGgsIGhlaWdodCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgdGl0bGUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRUaXRsZSh0aXRsZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTcwOTUzNTk4LCB0aXRsZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IG1hZ25pZmljYXRpb25cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0Wm9vbShtYWduaWZpY2F0aW9uKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNzk0NTAwMDUxLCBtYWduaWZpY2F0aW9uKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTaG93cyB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTaG93KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjkzMTgyMzEyMSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TaXplPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNpemUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMTQxMTExNDMzKTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUzKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBmdWxsc2NyZWVuIGFuZCBub3JtYWwuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRvZ2dsZUZ1bGxzY3JlZW4oKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMjEyNzYzMTQ5KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBtYXhpbWlzZWQgYW5kIG5vcm1hbC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVG9nZ2xlTWF4aW1pc2UoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMTQ0MTk0NDQzKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBVbi1mdWxsc2NyZWVucyB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBVbkZ1bGxzY3JlZW4oKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNTg3MDAyNTA2KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBVbi1tYXhpbWlzZXMgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5NYXhpbWlzZSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM4ODk5OTk0NzYpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFVuLW1pbmltaXNlcyB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBVbk1pbmltaXNlKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzU3MTYzNjE5OCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBXaWR0aCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE2NTUyMzk5ODgpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFpvb21zIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvb20oKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg1NTU3MTk5MjMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEluY3JlYXNlcyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2VidmlldyBjb250ZW50LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tSW4oKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMzEwNDM0MjcyKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBEZWNyZWFzZXMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdlYnZpZXcgY29udGVudC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbU91dCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE3NTU3MDI4MjEpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJlc2V0cyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2VidmlldyBjb250ZW50LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tUmVzZXQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNzgxNDY3MTU0KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLy8gUHJpdmF0ZSB0eXBlIGNyZWF0aW9uIGZ1bmN0aW9uc1xuY29uc3QgJCRjcmVhdGVUeXBlMCA9ICRtb2RlbHMuUG9zaXRpb24uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTEgPSAkbW9kZWxzLkxSVEIuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTIgPSAkbW9kZWxzLlNjcmVlbi5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlMyA9ICRtb2RlbHMuU2l6ZS5jcmVhdGVGcm9tO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgJG1vZGVscyBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5Qb3NpdGlvbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBYnNvbHV0ZVBvc2l0aW9uKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDY4MTgzMjk4MCwgd25kTmFtZSk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogQ2VudGVycyB0aGUgd2luZG93IG9uIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDZW50ZXIod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDgyMzEyNzc5LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBDbG9zZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENsb3NlKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMxOTE1MjAzNTQsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIERpc2FibGVzIG1pbi9tYXggc2l6ZSBjb25zdHJhaW50cy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERpc2FibGVTaXplQ29uc3RyYWludHMod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTM5NTA3Nzc4MSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbmFibGVTaXplQ29uc3RyYWludHMod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjU1MzMyMDkyMCwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRm9jdXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9jdXMod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjYwOTIyMDU4Niwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRm9yY2VzIHRoZSB3aW5kb3cgdG8gcmVsb2FkIHRoZSBwYWdlIGFzc2V0cy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZvcmNlUmVsb2FkKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDcxNTc0NjI2MCwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU3dpdGNoZXMgdGhlIHdpbmRvdyB0byBmdWxsc2NyZWVuIG1vZGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGdWxsc2NyZWVuKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDYzNjAxNjk5LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzaXplIG9mIHRoZSBmb3VyIHdpbmRvdyBib3JkZXJzLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuTFJUQj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRCb3JkZXJTaXplcyh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0NjEyNjQzMzQsIHduZE5hbWUpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTEoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNjcmVlbiB0aGF0IHRoZSB3aW5kb3cgaXMgb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TY3JlZW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0U2NyZWVuKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDU2NDE3Mzk4Miwgd25kTmFtZSk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMigkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudCB6b29tIGxldmVsIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8bnVtYmVyPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldFpvb20od25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNjQyNjkxMjQxLCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSGVpZ2h0KHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDExMzk2OTQ1Mywgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogSGlkZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEhpZGUod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjAyOTUxNjg2LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmb2N1c2VkLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNGb2N1c2VkKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE1OTQ3OTQzOTksIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGlzIGZ1bGxzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0Z1bGxzY3JlZW4od25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoOTY2MzQzODM5LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBtYXhpbWlzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc01heGltaXNlZCh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MTk5NjkxNTE1LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBtaW5pbWlzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc01pbmltaXNlZCh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODU5NjEwMzY5LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBNYXhpbWlzZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1heGltaXNlKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDgwNTI4NTI0OSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogTWluaW1pc2VzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNaW5pbWlzZSh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg3MzQ3MTAwNTksIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG5hbWUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gTmFtZSh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNjE3Mzc5ODksIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE9wZW5zIHRoZSBkZXZlbG9wbWVudCB0b29scyBwYW5lLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkRldlRvb2xzKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIxOTM4NDc0NzYsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlBvc2l0aW9uPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlbGF0aXZlUG9zaXRpb24od25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDA5NDE0MDg1Nywgd25kTmFtZSk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVsb2FkcyBwYWdlIGFzc2V0cy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlbG9hZCh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODc5MjczMDUxLCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyByZXNpemFibGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXNpemFibGUod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjg1NjIzODUzNSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVzdG9yZXMgdGhlIHdpbmRvdyB0byBpdHMgcHJldmlvdXMgc3RhdGUgaWYgaXQgd2FzIHByZXZpb3VzbHkgbWluaW1pc2VkLCBtYXhpbWlzZWQgb3IgZnVsbHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlc3RvcmUod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTY2MjYxODc2LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtudW1iZXJ9IHhcbiAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEFic29sdXRlUG9zaXRpb24od25kTmFtZSwgeCwgeSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjU4NjgyMDc5Niwgd25kTmFtZSwgeCwgeSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgd2luZG93IHRvIGJlIGFsd2F5cyBvbiB0b3AuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtib29sZWFufSBhb3RcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0QWx3YXlzT25Ub3Aod25kTmFtZSwgYW90KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODMyMjQ5ODU3LCB3bmROYW1lLCBhb3QpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIGJhY2tncm91bmQgY29sb3VyIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHskbW9kZWxzLlJHQkF9IGNvbG91clxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRCYWNrZ3JvdW5kQ29sb3VyKHduZE5hbWUsIGNvbG91cikge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTQzMDQ1Mzk0Niwgd25kTmFtZSwgY29sb3VyKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSB3aW5kb3cgZnJhbWUgYW5kIHRpdGxlIGJhci5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZyYW1lbGVzc1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRGcmFtZWxlc3Mod25kTmFtZSwgZnJhbWVsZXNzKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNzc0OTc2MTMwLCB3bmROYW1lLCBmcmFtZWxlc3MpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgb3IgZGlzYWJsZXMgdGhlIHN5c3RlbSBmdWxsc2NyZWVuIGJ1dHRvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZWRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnVsbHNjcmVlbkJ1dHRvbkVuYWJsZWQod25kTmFtZSwgZW5hYmxlZCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzk0MDE3MzcwNCwgd25kTmFtZSwgZW5hYmxlZCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbWF4aW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldE1heFNpemUod25kTmFtZSwgd2lkdGgsIGhlaWdodCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzY2MTIxNzU1Mywgd25kTmFtZSwgd2lkdGgsIGhlaWdodCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbWluaW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldE1pblNpemUod25kTmFtZSwgd2lkdGgsIGhlaWdodCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzk4NzY2Nzk1NSwgd25kTmFtZSwgd2lkdGgsIGhlaWdodCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgcmVsYXRpdmUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdyB0byB0aGUgc2NyZWVuLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gKiBAcGFyYW0ge251bWJlcn0geVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZWxhdGl2ZVBvc2l0aW9uKHduZE5hbWUsIHgsIHkpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE4NDE1OTA0NjUsIHduZE5hbWUsIHgsIHkpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgd2hldGhlciB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlc2l6YWJsZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZXNpemFibGUod25kTmFtZSwgcmVzaXphYmxlKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMDczOTcxMSwgd25kTmFtZSwgcmVzaXphYmxlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFNpemUod25kTmFtZSwgd2lkdGgsIGhlaWdodCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjM4MDQxNTAzOSwgd25kTmFtZSwgd2lkdGgsIGhlaWdodCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgdGl0bGUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0VGl0bGUod25kTmFtZSwgdGl0bGUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDY0MjExMzA0OCwgd25kTmFtZSwgdGl0bGUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcGFyYW0ge251bWJlcn0gbWFnbmlmaWNhdGlvblxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRab29tKHduZE5hbWUsIG1hZ25pZmljYXRpb24pIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIwNTM5ODM0ODUsIHduZE5hbWUsIG1hZ25pZmljYXRpb24pO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNob3dzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTaG93KHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM1MzI1NzMwMzUsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNpemU+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2l6ZSh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxOTQ4MzEyNDg3LCB3bmROYW1lKTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUzKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBmdWxsc2NyZWVuIGFuZCBub3JtYWwuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVGdWxsc2NyZWVuKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIzMzE2NTk0Nywgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVG9nZ2xlcyB0aGUgd2luZG93IGJldHdlZW4gbWF4aW1pc2VkIGFuZCBub3JtYWwuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVNYXhpbWlzZSh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMDk4MjE2NTA1LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBVbi1mdWxsc2NyZWVucyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5GdWxsc2NyZWVuKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMzMjE1MjU4ODAsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFVuLW1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5NYXhpbWlzZSh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MTc4MTE0NDI2LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBVbi1taW5pbWlzZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWluaW1pc2Uod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTYzNzA0NDE2MCwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gV2lkdGgod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTM2MTM1NTM0Niwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogWm9vbXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvb20od25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoODk1MzA5OTg5LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBJbmNyZWFzZXMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdlYnZpZXcgY29udGVudC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvb21Jbih3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMTM5MjYzMzI2LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBEZWNyZWFzZXMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdlYnZpZXcgY29udGVudC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvb21PdXQod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDE0ODMyNDEyNywgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVzZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tUmVzZXQod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNjg4MzA1MjgwLCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLy8gUHJpdmF0ZSB0eXBlIGNyZWF0aW9uIGZ1bmN0aW9uc1xuY29uc3QgJCRjcmVhdGVUeXBlMCA9ICRtb2RlbHMuUG9zaXRpb24uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTEgPSAkbW9kZWxzLkxSVEIuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTIgPSAkbW9kZWxzLlNjcmVlbi5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlMyA9ICRtb2RlbHMuU2l6ZS5jcmVhdGVGcm9tO1xuIiwgIi8vIEB0cy1ub2NoZWNrXG4vKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQge09wZW5VUkx9IGZyb20gXCIuL0Jyb3dzZXIuanNcIjtcbmltcG9ydCB7UXVlc3Rpb259IGZyb20gXCIuL0RpYWxvZ3MuanNcIjtcbmltcG9ydCB7RW1pdCwgV2FpbHNFdmVudH0gZnJvbSBcIi4vRXZlbnRzLmpzXCI7XG5pbXBvcnQge2NhbkFib3J0TGlzdGVuZXJzLCB3aGVuUmVhZHl9IGZyb20gXCIuL3V0aWxzLmpzXCI7XG5pbXBvcnQgKiBhcyBXaW5kb3cgZnJvbSBcIi4vV2luZG93LmpzXCI7XG5cbi8qKlxuICogU2VuZHMgYW4gZXZlbnQgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgb3B0aW9uYWwgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHNlbmQuXG4gKiBAcGFyYW0ge2FueX0gW2RhdGE9bnVsbF0gLSBPcHRpb25hbCBkYXRhIHRvIHNlbmQgYWxvbmcgd2l0aCB0aGUgZXZlbnQuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIHNlbmRFdmVudChldmVudE5hbWUsIGRhdGE9bnVsbCkge1xuICAgIEVtaXQobmV3IFdhaWxzRXZlbnQoZXZlbnROYW1lLCBkYXRhKSk7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb24gYSBzcGVjaWZpZWQgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IHRvIGNhbGwgdGhlIG1ldGhvZCBvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2ROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICovXG5mdW5jdGlvbiBjYWxsV2luZG93TWV0aG9kKHdpbmRvd05hbWUsIG1ldGhvZE5hbWUpIHtcbiAgICBjb25zdCB0YXJnZXRXaW5kb3cgPSBXaW5kb3cuR2V0KHdpbmRvd05hbWUpO1xuICAgIGNvbnN0IG1ldGhvZCA9IHRhcmdldFdpbmRvd1ttZXRob2ROYW1lXTtcblxuICAgIGlmICh0eXBlb2YgbWV0aG9kICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgV2luZG93IG1ldGhvZCAnJHttZXRob2ROYW1lfScgbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBtZXRob2QuY2FsbCh0YXJnZXRXaW5kb3cpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgY2FsbGluZyB3aW5kb3cgbWV0aG9kICcke21ldGhvZE5hbWV9JzogYCwgZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlc3BvbmRzIHRvIGEgdHJpZ2dlcmluZyBldmVudCBieSBydW5uaW5nIGFwcHJvcHJpYXRlIFdNTCBhY3Rpb25zIGZvciB0aGUgY3VycmVudCB0YXJnZXRcbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIG9uV01MVHJpZ2dlcmVkKGV2KSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGV2LmN1cnJlbnRUYXJnZXQ7XG5cbiAgICBmdW5jdGlvbiBydW5FZmZlY3QoY2hvaWNlID0gXCJZZXNcIikge1xuICAgICAgICBpZiAoY2hvaWNlICE9PSBcIlllc1wiKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtZXZlbnQnKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0V2luZG93ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC10YXJnZXQtd2luZG93JykgfHwgXCJcIjtcbiAgICAgICAgY29uc3Qgd2luZG93TWV0aG9kID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC13aW5kb3cnKTtcbiAgICAgICAgY29uc3QgdXJsID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1vcGVudXJsJyk7XG5cbiAgICAgICAgaWYgKGV2ZW50VHlwZSAhPT0gbnVsbClcbiAgICAgICAgICAgIHNlbmRFdmVudChldmVudFR5cGUpO1xuICAgICAgICBpZiAod2luZG93TWV0aG9kICE9PSBudWxsKVxuICAgICAgICAgICAgY2FsbFdpbmRvd01ldGhvZCh0YXJnZXRXaW5kb3csIHdpbmRvd01ldGhvZCk7XG4gICAgICAgIGlmICh1cmwgIT09IG51bGwpXG4gICAgICAgICAgICB2b2lkIE9wZW5VUkwodXJsKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maXJtID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1jb25maXJtJyk7XG5cbiAgICBpZiAoY29uZmlybSkge1xuICAgICAgICBRdWVzdGlvbih7XG4gICAgICAgICAgICBUaXRsZTogXCJDb25maXJtXCIsXG4gICAgICAgICAgICBNZXNzYWdlOiBjb25maXJtLFxuICAgICAgICAgICAgRGV0YWNoZWQ6IGZhbHNlLFxuICAgICAgICAgICAgQnV0dG9uczogW1xuICAgICAgICAgICAgICAgIHsgTGFiZWw6IFwiWWVzXCIgfSxcbiAgICAgICAgICAgICAgICB7IExhYmVsOiBcIk5vXCIsIElzRGVmYXVsdDogdHJ1ZSB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pLnRoZW4ocnVuRWZmZWN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBydW5FZmZlY3QoKTtcbiAgICB9XG59XG5cbi8qKlxuICogQHR5cGUge3N5bWJvbH1cbiAqL1xuY29uc3QgY29udHJvbGxlciA9IFN5bWJvbCgpO1xuXG4vKipcbiAqIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IGRvZXMgbm90IGFjdHVhbGx5IHJlbWVtYmVyIGFjdGl2ZSBldmVudCBsaXN0ZW5lcnM6IGluc3RlYWRcbiAqIGl0IHRpZXMgdGhlbSB0byBhbiBBYm9ydFNpZ25hbCBhbmQgdXNlcyBhbiBBYm9ydENvbnRyb2xsZXIgdG8gcmVtb3ZlIHRoZW0gYWxsIGF0IG9uY2UuXG4gKi9cbmNsYXNzIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0b3JlcyB0aGUgQWJvcnRDb250cm9sbGVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVtb3ZlIGFsbCBjdXJyZW50bHkgYWN0aXZlIGxpc3RlbmVycy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG5hbWUge0BsaW5rIGNvbnRyb2xsZXJ9XG4gICAgICAgICAqIEBtZW1iZXIge0Fib3J0Q29udHJvbGxlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbY29udHJvbGxlcl0gPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBvcHRpb25zIG9iamVjdCBmb3IgYWRkRXZlbnRMaXN0ZW5lciB0aGF0IHRpZXMgdGhlIGxpc3RlbmVyXG4gICAgICogdG8gdGhlIEFib3J0U2lnbmFsIGZyb20gdGhlIGN1cnJlbnQgQWJvcnRDb250cm9sbGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBBbiBIVE1MIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB0cmlnZ2VycyBUaGUgbGlzdCBvZiBhY3RpdmUgV01MIHRyaWdnZXIgZXZlbnRzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnRzXG4gICAgICogQHJldHVybnMge0FkZEV2ZW50TGlzdGVuZXJPcHRpb25zfVxuICAgICAqL1xuICAgIHNldChlbGVtZW50LCB0cmlnZ2Vycykge1xuICAgICAgICByZXR1cm4geyBzaWduYWw6IHRoaXNbY29udHJvbGxlcl0uc2lnbmFsIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpc1tjb250cm9sbGVyXS5hYm9ydCgpO1xuICAgICAgICB0aGlzW2NvbnRyb2xsZXJdID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAdHlwZSB7c3ltYm9sfVxuICovXG5jb25zdCB0cmlnZ2VyTWFwID0gU3ltYm9sKCk7XG5cbi8qKlxuICogQHR5cGUge3N5bWJvbH1cbiAqL1xuY29uc3QgZWxlbWVudENvdW50ID0gU3ltYm9sKCk7XG5cbi8qKlxuICogV2Vha01hcFJlZ2lzdHJ5IG1hcHMgYWN0aXZlIHRyaWdnZXIgZXZlbnRzIHRvIGVhY2ggRE9NIGVsZW1lbnQgdGhyb3VnaCBhIFdlYWtNYXAuXG4gKiBUaGlzIGVuc3VyZXMgdGhhdCB0aGUgbWFwcGluZyByZW1haW5zIHByaXZhdGUgdG8gdGhpcyBtb2R1bGUsIHdoaWxlIHN0aWxsIGFsbG93aW5nIGdhcmJhZ2VcbiAqIGNvbGxlY3Rpb24gb2YgdGhlIGludm9sdmVkIGVsZW1lbnRzLlxuICovXG5jbGFzcyBXZWFrTWFwUmVnaXN0cnkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcmVzIHRoZSBjdXJyZW50IGVsZW1lbnQtdG8tdHJpZ2dlciBtYXBwaW5nLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbmFtZSB7QGxpbmsgdHJpZ2dlck1hcH1cbiAgICAgICAgICogQG1lbWJlciB7V2Vha01hcDxIVE1MRWxlbWVudCwgc3RyaW5nW10+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwXSA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvdW50cyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHdpdGggYWN0aXZlIFdNTCB0cmlnZ2Vycy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG5hbWUge0BsaW5rIGVsZW1lbnRDb3VudH1cbiAgICAgICAgICogQG1lbWJlciB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpc1tlbGVtZW50Q291bnRdID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBhY3RpdmUgdHJpZ2dlcnMgZm9yIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgQW4gSFRNTCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdHJpZ2dlcnMgVGhlIGxpc3Qgb2YgYWN0aXZlIFdNTCB0cmlnZ2VyIGV2ZW50cyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50XG4gICAgICogQHJldHVybnMge0FkZEV2ZW50TGlzdGVuZXJPcHRpb25zfVxuICAgICAqL1xuICAgIHNldChlbGVtZW50LCB0cmlnZ2Vycykge1xuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudF0gKz0gIXRoaXNbdHJpZ2dlck1hcF0uaGFzKGVsZW1lbnQpO1xuICAgICAgICB0aGlzW3RyaWdnZXJNYXBdLnNldChlbGVtZW50LCB0cmlnZ2Vycyk7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxuICAgICAqL1xuICAgIHJlc2V0KCkge1xuICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRdIDw9IDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRdIDw9IDApXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IHRyaWdnZXJzID0gdGhpc1t0cmlnZ2VyTWFwXS5nZXQoZWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzW2VsZW1lbnRDb3VudF0gLT0gKHR5cGVvZiB0cmlnZ2VycyAhPT0gXCJ1bmRlZmluZWRcIik7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycyB8fCBbXSlcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHJpZ2dlciwgb25XTUxUcmlnZ2VyZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwXSA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICAgIHRoaXNbZWxlbWVudENvdW50XSA9IDA7XG4gICAgfVxufVxuXG5jb25zdCB0cmlnZ2VyUmVnaXN0cnkgPSBjYW5BYm9ydExpc3RlbmVycygpID8gbmV3IEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5KCkgOiBuZXcgV2Vha01hcFJlZ2lzdHJ5KCk7XG5cbi8qKlxuICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBhZGRXTUxMaXN0ZW5lcnMoZWxlbWVudCkge1xuICAgIGNvbnN0IHRyaWdnZXJSZWdFeHAgPSAvXFxTKy9nO1xuICAgIGNvbnN0IHRyaWdnZXJBdHRyID0gKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdHJpZ2dlcicpIHx8IFwiY2xpY2tcIik7XG4gICAgY29uc3QgdHJpZ2dlcnMgPSBbXTtcblxuICAgIGxldCBtYXRjaDtcbiAgICB3aGlsZSAoKG1hdGNoID0gdHJpZ2dlclJlZ0V4cC5leGVjKHRyaWdnZXJBdHRyKSkgIT09IG51bGwpXG4gICAgICAgIHRyaWdnZXJzLnB1c2gobWF0Y2hbMF0pO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRyaWdnZXJSZWdpc3RyeS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xuICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycylcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRyaWdnZXIsIG9uV01MVHJpZ2dlcmVkLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgYW4gYXV0b21hdGljIHJlbG9hZCBvZiBXTUwgdG8gYmUgcGVyZm9ybWVkIGFzIHNvb24gYXMgdGhlIGRvY3VtZW50IGlzIGZ1bGx5IGxvYWRlZC5cbiAqXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVuYWJsZSgpIHtcbiAgICB3aGVuUmVhZHkoUmVsb2FkKTtcbn1cblxuLyoqXG4gKiBSZWxvYWRzIHRoZSBXTUwgcGFnZSBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycyBhbmQgYnJvd3NlciBsaXN0ZW5lcnMuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxvYWQoKSB7XG4gICAgdHJpZ2dlclJlZ2lzdHJ5LnJlc2V0KCk7XG4gICAgZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbd21sLWV2ZW50XSwgW3dtbC13aW5kb3ddLCBbd21sLW9wZW51cmxdJykuZm9yRWFjaChhZGRXTUxMaXN0ZW5lcnMpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgcmVtb3ZpbmcgbGlzdGVuZXJzIGJ5IHRyaWdnZXJpbmcgYW4gQWJvcnRTaWduYWxcbiAqIChzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0V2ZW50VGFyZ2V0L2FkZEV2ZW50TGlzdGVuZXIjc2lnbmFsKVxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5BYm9ydExpc3RlbmVycygpIHtcbiAgICBpZiAoIUV2ZW50VGFyZ2V0IHx8ICFBYm9ydFNpZ25hbCB8fCAhQWJvcnRDb250cm9sbGVyKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcblxuICAgIGNvbnN0IHRhcmdldCA9IG5ldyBFdmVudFRhcmdldCgpO1xuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCAoKSA9PiB7IHJlc3VsdCA9IGZhbHNlOyB9LCB7IHNpZ25hbDogY29udHJvbGxlci5zaWduYWwgfSk7XG4gICAgY29udHJvbGxlci5hYm9ydCgpO1xuICAgIHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgndGVzdCcpKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKipcbiBUaGlzIHRlY2huaXF1ZSBmb3IgcHJvcGVyIGxvYWQgZGV0ZWN0aW9uIGlzIHRha2VuIGZyb20gSFRNWDpcblxuIEJTRCAyLUNsYXVzZSBMaWNlbnNlXG5cbiBDb3B5cmlnaHQgKGMpIDIwMjAsIEJpZyBTa3kgU29mdHdhcmVcbiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG4gUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cblxuIDIuIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cbiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFXG4gRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUxcbiBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUlxuIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSXG4gQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSxcbiBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG5cbiAqKiovXG5cbmxldCBpc1JlYWR5ID0gZmFsc2U7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gaXNSZWFkeSA9IHRydWUpO1xuXG5leHBvcnQgZnVuY3Rpb24gd2hlblJlYWR5KGNhbGxiYWNrKSB7XG4gICAgaWYgKGlzUmVhZHkgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBjYWxsYmFjayk7XG4gICAgfVxufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmV4cG9ydCAqIGZyb20gXCIuLi8uLi8uLi8uLi9wa2cvcnVudGltZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyBydW50aW1lIGZyb20gXCIuLi8uLi8uLi8uLi9wa2cvcnVudGltZS9pbmRleC5qc1wiO1xud2luZG93LndhaWxzID0gcnVudGltZTtcblxucnVudGltZS5XTUwuRW5hYmxlKCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ3lCQSxJQUFJLGNBQ0Y7QUFXSyxJQUFJLFNBQVMsQ0FBQyxPQUFPLE9BQU87QUFDakMsTUFBSSxLQUFLO0FBQ1QsTUFBSSxJQUFJO0FBQ1IsU0FBTyxLQUFLO0FBQ1YsVUFBTSxZQUFhLEtBQUssT0FBTyxJQUFJLEtBQU0sQ0FBQztBQUFBLEVBQzVDO0FBQ0EsU0FBTztBQUNUOzs7QUMvQkEsSUFBTSxhQUFhLE9BQU8sU0FBUyxTQUFTO0FBR3JDLFNBQVMsT0FBTyxLQUFLO0FBQ3hCLE1BQUcsT0FBTyxRQUFRO0FBQ2QsV0FBTyxPQUFPLE9BQU8sUUFBUSxZQUFZLEdBQUc7QUFBQSxFQUNoRCxPQUFPO0FBQ0gsV0FBTyxPQUFPLE9BQU8sZ0JBQWdCLFNBQVMsWUFBWSxHQUFHO0FBQUEsRUFDakU7QUFDSjtBQUdPLElBQU0sY0FBYztBQUFBLEVBQ3ZCLE1BQU07QUFBQSxFQUNOLGFBQWE7QUFBQSxFQUNiLFlBQVk7QUFDaEI7QUFDTyxJQUFJLFdBQVcsT0FBTztBQXNCdEIsU0FBUyx1QkFBdUIsUUFBUSxZQUFZO0FBQ3ZELFNBQU8sU0FBVSxRQUFRLE9BQUssTUFBTTtBQUNoQyxXQUFPLGtCQUFrQixRQUFRLFFBQVEsWUFBWSxJQUFJO0FBQUEsRUFDN0Q7QUFDSjtBQXFDQSxTQUFTLGtCQUFrQixV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SUFDcEIscUJBQXFCO0FBQUEsSUFDckIscUJBQXFCO0FBQUEsSUFDckIsc0JBQXNCO0FBQUEsSUFDdEIsZ0NBQWdDO0FBQUEsSUFDaEMsa0NBQWtDO0FBQUEsSUFDbEMsbUNBQW1DO0FBQUEsSUFDbkMsb0NBQW9DO0FBQUEsSUFDcEMsK0JBQStCO0FBQUEsSUFDL0IsNkJBQTZCO0FBQUEsSUFDN0IsdUJBQXVCO0FBQUEsSUFDdkIsaUNBQWlDO0FBQUEsSUFDakMsOEJBQThCO0FBQUEsSUFDOUIsNEJBQTRCO0FBQUEsSUFDNUIsc0NBQXNDO0FBQUEsSUFDdEMsNEJBQTRCO0FBQUEsSUFDNUIsc0JBQXNCO0FBQUEsSUFDdEIsa0NBQWtDO0FBQUEsSUFDbEMsc0JBQXNCO0FBQUEsSUFDdEIsd0JBQXdCO0FBQUEsSUFDeEIsMkJBQTJCO0FBQUEsSUFDM0Isd0JBQXdCO0FBQUEsSUFDeEIsbUJBQW1CO0FBQUEsSUFDbkIsMEJBQTBCO0FBQUEsSUFDMUIsOEJBQThCO0FBQUEsSUFDOUIseUJBQXlCO0FBQUEsSUFDekIsNkJBQTZCO0FBQUEsSUFDN0IsaUJBQWlCO0FBQUEsSUFDakIsZ0JBQWdCO0FBQUEsSUFDaEIsc0JBQXNCO0FBQUEsSUFDdEIsZUFBZTtBQUFBLElBQ2YseUJBQXlCO0FBQUEsSUFDekIsd0JBQXdCO0FBQUEsSUFDeEIsb0JBQW9CO0FBQUEsSUFDcEIscUJBQXFCO0FBQUEsSUFDckIsaUJBQWlCO0FBQUEsSUFDakIsaUJBQWlCO0FBQUEsSUFDakIsc0JBQXNCO0FBQUEsSUFDdEIsbUNBQW1DO0FBQUEsSUFDbkMscUNBQXFDO0FBQUEsSUFDckMsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIsd0JBQXdCO0FBQUEsSUFDeEIsMkJBQTJCO0FBQUEsSUFDM0IsbUJBQW1CO0FBQUEsSUFDbkIscUJBQXFCO0FBQUEsSUFDckIsc0JBQXNCO0FBQUEsSUFDdEIsc0JBQXNCO0FBQUEsSUFDdEIsOEJBQThCO0FBQUEsSUFDOUIsaUJBQWlCO0FBQUEsSUFDakIseUJBQXlCO0FBQUEsSUFDekIsMkJBQTJCO0FBQUEsSUFDM0IsK0JBQStCO0FBQUEsSUFDL0IsMEJBQTBCO0FBQUEsSUFDMUIsOEJBQThCO0FBQUEsSUFDOUIsaUJBQWlCO0FBQUEsSUFDakIsdUJBQXVCO0FBQUEsSUFDdkIsZ0JBQWdCO0FBQUEsSUFDaEIsMEJBQTBCO0FBQUEsSUFDMUIseUJBQXlCO0FBQUEsSUFDekIsc0JBQXNCO0FBQUEsSUFDdEIsa0JBQWtCO0FBQUEsSUFDbEIsbUJBQW1CO0FBQUEsSUFDbkIsa0JBQWtCO0FBQUEsSUFDbEIsdUJBQXVCO0FBQUEsSUFDdkIsb0NBQW9DO0FBQUEsSUFDcEMsc0NBQXNDO0FBQUEsSUFDdEMsd0JBQXdCO0FBQUEsSUFDeEIsdUJBQXVCO0FBQUEsSUFDdkIseUJBQXlCO0FBQUEsSUFDekIsNEJBQTRCO0FBQUEsSUFDNUIsNEJBQTRCO0FBQUEsSUFDNUIsY0FBYztBQUFBLElBQ2QsYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLElBQ2Qsb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIscUJBQXFCO0FBQUEsSUFDckIsb0JBQW9CO0FBQUEsSUFDcEIsaUJBQWlCO0FBQUEsSUFDakIsZ0JBQWdCO0FBQUEsSUFDaEIsb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIscUJBQXFCO0FBQUEsSUFDckIsb0JBQW9CO0FBQUEsSUFDcEIsZ0JBQWdCO0FBQUEsSUFDaEIsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsY0FBYztBQUFBLElBQ2QsMEJBQTBCO0FBQUEsSUFDMUIseUJBQXlCO0FBQUEsSUFDekIsc0NBQXNDO0FBQUEsSUFDdEMseURBQXlEO0FBQUEsSUFDekQsNEJBQTRCO0FBQUEsSUFDNUIsNEJBQTRCO0FBQUEsSUFDNUIsMkJBQTJCO0FBQUEsSUFDM0IsNkJBQTZCO0FBQUEsSUFDN0IsMEJBQTBCO0FBQUEsRUFD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V0FBVyxLQUFLLFVBQVUsRUFBRSxJQUFJLE9BQU87QUFDN0MsV0FBSyxZQUFZLEtBQU0sT0FBTyxhQUFhO0FBRTNDLGlCQUFXLFdBQVcsWUFBWSxDQUFDO0FBQy9CLGdCQUFRLG9CQUFvQixTQUFTLGNBQWM7QUFBQSxJQUMzRDtBQUVBLFNBQUssVUFBVSxJQUFJLG9CQUFJLFFBQVE7QUFDL0IsU0FBSyxZQUFZLElBQUk7QUFBQSxFQUN6QjtBQUNKO0FBRUEsSUFBTSxrQkFBa0Isa0JBQWtCLElBQUksSUFBSSx3QkFBd0IsSUFBSSxJQUFJLGdCQUFnQjtBQVFsRyxTQUFTLGdCQUFnQixTQUFTO0FBQzlCLFFBQU0sZ0JBQWdCO0FBQ3RCLFFBQU0sY0FBZSxRQUFRLGFBQWEsYUFBYSxLQUFLO0FBQzVELFFBQU0sV0FBVyxDQUFDO0FBRWxCLE1BQUk7QUFDSixVQUFRLFFBQVEsY0FBYyxLQUFLLFdBQVcsT0FBTztBQUNqRCxhQUFTLEtBQUssTUFBTSxDQUFDLENBQUM7QUFFMUIsUUFBTSxVQUFVLGdCQUFnQixJQUFJLFNBQVMsUUFBUTtBQUNyRCxhQUFXLFdBQVc7QUFDbEIsWUFBUSxpQkFBaUIsU0FBUyxnQkFBZ0IsT0FBTztBQUNqRTtBQU9PLFNBQVMsU0FBUztBQUNyQixZQUFVQyxPQUFNO0FBQ3BCO0FBT08sU0FBU0EsVUFBUztBQUNyQixrQkFBZ0IsTUFBTTtBQUN0QixXQUFTLEtBQUssaUJBQWlCLDBDQUEwQyxFQUFFLFFBQVEsZUFBZTtBQUN0Rzs7O0FFclBBLE9BQU8sUUFBUTtBQUVQLFlBQUksT0FBTzsiLAogICJuYW1lcyI6IFsiY2FsbCIsICJNYXAiLCAia2V5IiwgIkVycm9yIiwgIkVycm9yIiwgImV2ZW50TmFtZSIsICIkJGNyZWF0ZVR5cGUxIiwgIiQkY3JlYXRlVHlwZTAiLCAiJCRjcmVhdGVUeXBlMCIsICJBYnNvbHV0ZVBvc2l0aW9uIiwgIkNlbnRlciIsICJDbG9zZSIsICJEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzIiwgIkVuYWJsZVNpemVDb25zdHJhaW50cyIsICJGb2N1cyIsICJGb3JjZVJlbG9hZCIsICJGdWxsc2NyZWVuIiwgIkdldEJvcmRlclNpemVzIiwgIkdldFNjcmVlbiIsICJHZXRab29tIiwgIkhlaWdodCIsICJIaWRlIiwgIklzRm9jdXNlZCIsICJJc0Z1bGxzY3JlZW4iLCAiSXNNYXhpbWlzZWQiLCAiSXNNaW5pbWlzZWQiLCAiTWF4aW1pc2UiLCAiTWluaW1pc2UiLCAiTmFtZSIsICJPcGVuRGV2VG9vbHMiLCAiUmVsYXRpdmVQb3NpdGlvbiIsICJSZWxvYWQiLCAiUmVzaXphYmxlIiwgIlJlc3RvcmUiLCAiU2V0QWJzb2x1dGVQb3NpdGlvbiIsICJTZXRBbHdheXNPblRvcCIsICJTZXRCYWNrZ3JvdW5kQ29sb3VyIiwgIlNldEZyYW1lbGVzcyIsICJTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZCIsICJTZXRNYXhTaXplIiwgIlNldE1pblNpemUiLCAiU2V0UmVsYXRpdmVQb3NpdGlvbiIsICJTZXRSZXNpemFibGUiLCAiU2V0U2l6ZSIsICJTZXRUaXRsZSIsICJTZXRab29tIiwgIlNob3ciLCAiU2l6ZSIsICJUb2dnbGVGdWxsc2NyZWVuIiwgIlRvZ2dsZU1heGltaXNlIiwgIlVuRnVsbHNjcmVlbiIsICJVbk1heGltaXNlIiwgIlVuTWluaW1pc2UiLCAiV2lkdGgiLCAiWm9vbSIsICJab29tSW4iLCAiWm9vbU91dCIsICJab29tUmVzZXQiLCAiSGlkZSIsICJTaG93IiwgIlNpemUiLCAiJCRjcmVhdGVUeXBlMCIsICIkJGNyZWF0ZVR5cGUxIiwgIiQkY3JlYXRlVHlwZTIiLCAiSGlkZSIsICJyZXNpemFibGUiLCAiU2hvdyIsICJTaXplIiwgIiQkY3JlYXRlVHlwZTMiLCAiQWJzb2x1dGVQb3NpdGlvbiIsICIkJGNyZWF0ZVR5cGUwIiwgIkNlbnRlciIsICJDbG9zZSIsICJEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzIiwgIkVuYWJsZVNpemVDb25zdHJhaW50cyIsICJGb2N1cyIsICJGb3JjZVJlbG9hZCIsICJGdWxsc2NyZWVuIiwgIkdldEJvcmRlclNpemVzIiwgIiQkY3JlYXRlVHlwZTEiLCAiR2V0U2NyZWVuIiwgIiQkY3JlYXRlVHlwZTIiLCAiR2V0Wm9vbSIsICJIZWlnaHQiLCAiSGlkZSIsICJJc0ZvY3VzZWQiLCAiSXNGdWxsc2NyZWVuIiwgIklzTWF4aW1pc2VkIiwgIklzTWluaW1pc2VkIiwgIk1heGltaXNlIiwgIk1pbmltaXNlIiwgIk5hbWUiLCAiT3BlbkRldlRvb2xzIiwgIlJlbGF0aXZlUG9zaXRpb24iLCAiUmVsb2FkIiwgIlJlc2l6YWJsZSIsICJSZXN0b3JlIiwgIlNldEFic29sdXRlUG9zaXRpb24iLCAiU2V0QWx3YXlzT25Ub3AiLCAiU2V0QmFja2dyb3VuZENvbG91ciIsICJTZXRGcmFtZWxlc3MiLCAiU2V0RnVsbHNjcmVlbkJ1dHRvbkVuYWJsZWQiLCAiU2V0TWF4U2l6ZSIsICJTZXRNaW5TaXplIiwgIlNldFJlbGF0aXZlUG9zaXRpb24iLCAiU2V0UmVzaXphYmxlIiwgInJlc2l6YWJsZSIsICJTZXRTaXplIiwgIlNldFRpdGxlIiwgIlNldFpvb20iLCAiU2hvdyIsICJTaXplIiwgIiQkY3JlYXRlVHlwZTMiLCAiVG9nZ2xlRnVsbHNjcmVlbiIsICJUb2dnbGVNYXhpbWlzZSIsICJVbkZ1bGxzY3JlZW4iLCAiVW5NYXhpbWlzZSIsICJVbk1pbmltaXNlIiwgIldpZHRoIiwgIlpvb20iLCAiWm9vbUluIiwgIlpvb21PdXQiLCAiWm9vbVJlc2V0IiwgIlJlbG9hZCIsICJjb250cm9sbGVyIiwgIlJlbG9hZCJdCn0K
