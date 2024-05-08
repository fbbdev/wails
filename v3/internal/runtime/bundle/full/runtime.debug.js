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
  Call: () => Call_exports,
  Clipboard: () => Clipboard_exports,
  Create: () => Create_exports,
  Dialogs: () => Dialogs_exports,
  Events: () => Events_exports,
  Flags: () => Flags_exports,
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Application.js
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Browser.js
var Browser_exports = {};
__export(Browser_exports, {
  OpenURL: () => OpenURL
});
function OpenURL(url) {
  let $resultPromise = call_exports.ByID(4141408185, url);
  return (
    /** @type {any} */
    $resultPromise
  );
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Call.js
var Call_exports = {};
__export(Call_exports, {
  ByID: () => ByID,
  ByName: () => ByName,
  Call: () => Call,
  Plugin: () => Plugin
});

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Clipboard.js
var Clipboard_exports = {};
__export(Clipboard_exports, {
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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Create.js
var Create_exports = {};
__export(Create_exports, {
  Any: () => Any,
  Array: () => Array,
  Map: () => Map2,
  Nullable: () => Nullable,
  Struct: () => Struct
});

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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Events.js
function Emit(event) {
  let $resultPromise = call_exports.ByID(2480682392, event);
  return (
    /** @type {any} */
    $resultPromise
  );
}

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/Flags.js
var Flags_exports = {};
__export(Flags_exports, {
  GetFlag: () => GetFlag
});

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
  let $resultPromise = call_exports.ByID(2367705532);
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
  let $resultPromise = call_exports.ByID(316757218);
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
  let $resultPromise = call_exports.ByID(3749562017);
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
  let $resultPromise = call_exports.ByID(3752267968);
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
  let $resultPromise = call_exports.ByID(2291282836);
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
  let $resultPromise = call_exports.ByID(681832980, wndName);
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
  let $resultPromise = call_exports.ByID(482312779, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Close(wndName) {
  let $resultPromise = call_exports.ByID(3191520354, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function DisableSizeConstraints(wndName) {
  let $resultPromise = call_exports.ByID(1395077781, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function EnableSizeConstraints(wndName) {
  let $resultPromise = call_exports.ByID(2553320920, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Focus(wndName) {
  let $resultPromise = call_exports.ByID(2609220586, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ForceReload(wndName) {
  let $resultPromise = call_exports.ByID(715746260, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Fullscreen(wndName) {
  let $resultPromise = call_exports.ByID(63601699, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function GetBorderSizes(wndName) {
  let $resultPromise = call_exports.ByID(461264334, wndName);
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
  let $resultPromise = call_exports.ByID(564173982, wndName);
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
  let $resultPromise = call_exports.ByID(642691241, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Height(wndName) {
  let $resultPromise = call_exports.ByID(113969453, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Hide2(wndName) {
  let $resultPromise = call_exports.ByID(202951686, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFocused(wndName) {
  let $resultPromise = call_exports.ByID(1594794399, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFullscreen(wndName) {
  let $resultPromise = call_exports.ByID(966343839, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMaximised(wndName) {
  let $resultPromise = call_exports.ByID(4199691515, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMinimised(wndName) {
  let $resultPromise = call_exports.ByID(3859610369, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Maximise(wndName) {
  let $resultPromise = call_exports.ByID(805285249, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Minimise(wndName) {
  let $resultPromise = call_exports.ByID(734710059, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Name(wndName) {
  let $resultPromise = call_exports.ByID(361737989, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function OpenDevTools(wndName) {
  let $resultPromise = call_exports.ByID(2193847476, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function RelativePosition(wndName) {
  let $resultPromise = call_exports.ByID(4094140857, wndName);
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
  let $resultPromise = call_exports.ByID(3879273051, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Resizable(wndName) {
  let $resultPromise = call_exports.ByID(2856238535, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Restore(wndName) {
  let $resultPromise = call_exports.ByID(166261876, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAbsolutePosition(wndName, x, y) {
  let $resultPromise = call_exports.ByID(2586820796, wndName, x, y);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAlwaysOnTop(wndName, aot) {
  let $resultPromise = call_exports.ByID(3832249857, wndName, aot);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetBackgroundColour(wndName, colour) {
  let $resultPromise = call_exports.ByID(1430453946, wndName, colour);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFrameless(wndName, frameless) {
  let $resultPromise = call_exports.ByID(3774976130, wndName, frameless);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFullscreenButtonEnabled(wndName, enabled) {
  let $resultPromise = call_exports.ByID(3940173704, wndName, enabled);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMaxSize(wndName, width, height) {
  let $resultPromise = call_exports.ByID(3661217553, wndName, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMinSize(wndName, width, height) {
  let $resultPromise = call_exports.ByID(3987667955, wndName, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetRelativePosition(wndName, x, y) {
  let $resultPromise = call_exports.ByID(1841590465, wndName, x, y);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetResizable(wndName, resizable2) {
  let $resultPromise = call_exports.ByID(30739711, wndName, resizable2);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetSize(wndName, width, height) {
  let $resultPromise = call_exports.ByID(2380415039, wndName, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetTitle(wndName, title) {
  let $resultPromise = call_exports.ByID(642113048, wndName, title);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetZoom(wndName, magnification) {
  let $resultPromise = call_exports.ByID(2053983485, wndName, magnification);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Show2(wndName) {
  let $resultPromise = call_exports.ByID(3532573035, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Size2(wndName) {
  let $resultPromise = call_exports.ByID(1948312487, wndName);
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
  let $resultPromise = call_exports.ByID(233165947, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ToggleMaximise(wndName) {
  let $resultPromise = call_exports.ByID(3098216505, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnFullscreen(wndName) {
  let $resultPromise = call_exports.ByID(3321525880, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMaximise(wndName) {
  let $resultPromise = call_exports.ByID(4178114426, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMinimise(wndName) {
  let $resultPromise = call_exports.ByID(1637044160, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Width(wndName) {
  let $resultPromise = call_exports.ByID(1361355346, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Zoom(wndName) {
  let $resultPromise = call_exports.ByID(895309989, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomIn(wndName) {
  let $resultPromise = call_exports.ByID(2139263326, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomOut(wndName) {
  let $resultPromise = call_exports.ByID(4148324127, wndName);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomReset(wndName) {
  let $resultPromise = call_exports.ByID(688305280, wndName);
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
  let $resultPromise = call_exports.ByID(222553826);
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
  let $resultPromise = call_exports.ByID(4054430369);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Close2() {
  let $resultPromise = call_exports.ByID(1436581100);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function DisableSizeConstraints2() {
  let $resultPromise = call_exports.ByID(2510539891);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function EnableSizeConstraints2() {
  let $resultPromise = call_exports.ByID(3150968194);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Focus2() {
  let $resultPromise = call_exports.ByID(3274789872);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ForceReload2() {
  let $resultPromise = call_exports.ByID(147523250);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Fullscreen2() {
  let $resultPromise = call_exports.ByID(3924564473);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function GetBorderSizes2() {
  let $resultPromise = call_exports.ByID(2290953088);
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
  let $resultPromise = call_exports.ByID(3744597424);
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
  let $resultPromise = call_exports.ByID(2677359063);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Height2() {
  let $resultPromise = call_exports.ByID(587157603);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Hide3() {
  let $resultPromise = call_exports.ByID(3874093464);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFocused2() {
  let $resultPromise = call_exports.ByID(526819721);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsFullscreen2() {
  let $resultPromise = call_exports.ByID(1192916705);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMaximised2() {
  let $resultPromise = call_exports.ByID(3036327809);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function IsMinimised2() {
  let $resultPromise = call_exports.ByID(4012281835);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Maximise2() {
  let $resultPromise = call_exports.ByID(3759007799);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Minimise2() {
  let $resultPromise = call_exports.ByID(3548520501);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Name2() {
  let $resultPromise = call_exports.ByID(4207657051);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function OpenDevTools2() {
  let $resultPromise = call_exports.ByID(483671974);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function RelativePosition2() {
  let $resultPromise = call_exports.ByID(3709545923);
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
  let $resultPromise = call_exports.ByID(2833731485);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Resizable2() {
  let $resultPromise = call_exports.ByID(2450946277);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Restore2() {
  let $resultPromise = call_exports.ByID(1151315034);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAbsolutePosition2(x, y) {
  let $resultPromise = call_exports.ByID(3991491842, x, y);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetAlwaysOnTop2(aot) {
  let $resultPromise = call_exports.ByID(3349346155, aot);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetBackgroundColour2(colour) {
  let $resultPromise = call_exports.ByID(2179820576, colour);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFrameless2(frameless) {
  let $resultPromise = call_exports.ByID(4109365080, frameless);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetFullscreenButtonEnabled2(enabled) {
  let $resultPromise = call_exports.ByID(3863568982, enabled);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMaxSize2(width, height) {
  let $resultPromise = call_exports.ByID(3460078551, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetMinSize2(width, height) {
  let $resultPromise = call_exports.ByID(2677919085, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetRelativePosition2(x, y) {
  let $resultPromise = call_exports.ByID(741606115, x, y);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetResizable2(resizable2) {
  let $resultPromise = call_exports.ByID(2835305541, resizable2);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetSize2(width, height) {
  let $resultPromise = call_exports.ByID(3379788393, width, height);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetTitle2(title) {
  let $resultPromise = call_exports.ByID(170953598, title);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function SetZoom2(magnification) {
  let $resultPromise = call_exports.ByID(2794500051, magnification);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Show3() {
  let $resultPromise = call_exports.ByID(2931823121);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Size3() {
  let $resultPromise = call_exports.ByID(1141111433);
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
  let $resultPromise = call_exports.ByID(2212763149);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ToggleMaximise2() {
  let $resultPromise = call_exports.ByID(3144194443);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnFullscreen2() {
  let $resultPromise = call_exports.ByID(1587002506);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMaximise2() {
  let $resultPromise = call_exports.ByID(3889999476);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function UnMinimise2() {
  let $resultPromise = call_exports.ByID(3571636198);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Width2() {
  let $resultPromise = call_exports.ByID(1655239988);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function Zoom2() {
  let $resultPromise = call_exports.ByID(555719923);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomIn2() {
  let $resultPromise = call_exports.ByID(1310434272);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomOut2() {
  let $resultPromise = call_exports.ByID(1755702821);
  return (
    /** @type {any} */
    $resultPromise
  );
}
function ZoomReset2() {
  let $resultPromise = call_exports.ByID(2781467154);
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
  Call_exports as Call,
  Clipboard_exports as Clipboard,
  Create_exports as Create,
  Dialogs_exports as Dialogs,
  Events_exports as Events,
  Flags_exports as Flags,
  Screens_exports as Screens,
  System_exports as System,
  wml_exports as WML,
  Window_exports as Window
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvcGtnL3J1bnRpbWUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvQXBwbGljYXRpb24uanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL25hbm9pZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvcnVudGltZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvc3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9jb250ZXh0bWVudS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvZmxhZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2RyYWcuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NhbGwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NyZWF0ZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvQnJvd3Nlci5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9DYWxsLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL0NsaXBib2FyZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9DcmVhdGUuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvRGlhbG9ncy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9tb2RlbHMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvRXZlbnRzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2V2ZW50X3R5cGVzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2xpc3RlbmVyLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL0ZsYWdzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL1NjcmVlbnMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvU3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL1dpbmRvdy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS93aW5kb3dCeU5hbWUuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvd21sLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL3V0aWxzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYnVuZGxlL2Z1bGwvaW5kZXguanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmV4cG9ydCB7XG4gICAgQXBwbGljYXRpb24sXG4gICAgQnJvd3NlcixcbiAgICBDYWxsLFxuICAgIENsaXBib2FyZCxcbiAgICBDcmVhdGUsXG4gICAgRGlhbG9ncyxcbiAgICBFdmVudHMsXG4gICAgRmxhZ3MsXG4gICAgU2NyZWVucyxcbiAgICBTeXN0ZW0sXG4gICAgV2luZG93LFxuICAgIFdNTFxufSBmcm9tIFwiLi4vLi4vaW50ZXJuYWwvcnVudGltZS9hcGkvaW5kZXguanNcIjtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQgeyBDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZSB9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbi8qKlxuICogSGlkZSBtYWtlcyBhbGwgYXBwbGljYXRpb24gd2luZG93cyBpbnZpc2libGUuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEhpZGUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg3Mjc0NzE2MDIpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFF1aXQgcXVpdHMgdGhlIGFwcGxpY2F0aW9uLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWl0KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTI0NDkyNjk1Myk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2hvdyBtYWtlcyBhbGwgYXBwbGljYXRpb24gd2luZG93cyB2aXNpYmxlLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTaG93KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjI3MDY3NDgzOSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG4iLCAiLyoqXG4gKiBUaGlzIGNvZGUgZnJhZ21lbnQgaXMgdGFrZW4gZnJvbSBuYW5vaWQgKGh0dHBzOi8vZ2l0aHViLmNvbS9haS9uYW5vaWQpOlxuICpcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICpcbiAqIENvcHlyaWdodCAyMDE3IEFuZHJleSBTaXRuaWsgPGFuZHJleUBzaXRuaWsucnU+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZlxuICogdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpblxuICogdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0b1xuICogdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2ZcbiAqIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcbiAqIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTU1xuICogRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SXG4gKiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVJcbiAqIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOXG4gKiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmxldCB1cmxBbHBoYWJldCA9XG4gICd1c2VhbmRvbS0yNlQxOTgzNDBQWDc1cHhKQUNLVkVSWU1JTkRCVVNIV09MRl9HUVpiZmdoamtscXZ3eXpyaWN0J1xuZXhwb3J0IGxldCBjdXN0b21BbHBoYWJldCA9IChhbHBoYWJldCwgZGVmYXVsdFNpemUgPSAyMSkgPT4ge1xuICByZXR1cm4gKHNpemUgPSBkZWZhdWx0U2l6ZSkgPT4ge1xuICAgIGxldCBpZCA9ICcnXG4gICAgbGV0IGkgPSBzaXplXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWQgKz0gYWxwaGFiZXRbKE1hdGgucmFuZG9tKCkgKiBhbHBoYWJldC5sZW5ndGgpIHwgMF1cbiAgICB9XG4gICAgcmV0dXJuIGlkXG4gIH1cbn1cbmV4cG9ydCBsZXQgbmFub2lkID0gKHNpemUgPSAyMSkgPT4ge1xuICBsZXQgaWQgPSAnJ1xuICBsZXQgaSA9IHNpemVcbiAgd2hpbGUgKGktLSkge1xuICAgIGlkICs9IHVybEFscGhhYmV0WyhNYXRoLnJhbmRvbSgpICogNjQpIHwgMF1cbiAgfVxuICByZXR1cm4gaWRcbn1cbiIsICIvKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuaW1wb3J0IHsgbmFub2lkIH0gZnJvbSBcIi4vbmFub2lkLmpzXCI7XG5cbmNvbnN0IHJ1bnRpbWVVUkwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgXCIvd2FpbHMvcnVudGltZVwiO1xuXG4vKiogU2VuZHMgbWVzc2FnZXMgdG8gdGhlIGJhY2tlbmQgKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZva2UobXNnKSB7XG4gICAgaWYod2luZG93LmNocm9tZSkge1xuICAgICAgICByZXR1cm4gd2luZG93LmNocm9tZS53ZWJ2aWV3LnBvc3RNZXNzYWdlKG1zZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy53ZWJraXQubWVzc2FnZUhhbmRsZXJzLmV4dGVybmFsLnBvc3RNZXNzYWdlKG1zZyk7XG4gICAgfVxufVxuXG4vKiogT2JqZWN0IE5hbWVzICovXG5leHBvcnQgY29uc3Qgb2JqZWN0TmFtZXMgPSB7XG4gICAgQ2FsbDogMCxcbiAgICBDb250ZXh0TWVudTogNCxcbiAgICBDYW5jZWxDYWxsOiAxMCxcbn1cbmV4cG9ydCBsZXQgY2xpZW50SWQgPSBuYW5vaWQoKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcnVudGltZSBjYWxsZXIgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGEgc3BlY2lmaWVkIG1ldGhvZCBvbiBhIGdpdmVuIG9iamVjdCB3aXRoaW4gYSBzcGVjaWZpZWQgd2luZG93IGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAtIFRoZSBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGhvZCBpcyB0byBiZSBpbnZva2VkLlxuICogQHBhcmFtIHtzdHJpbmd9IHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IGNvbnRleHQgaW4gd2hpY2ggdGhlIG1ldGhvZCBzaG91bGQgYmUgY2FsbGVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHJ1bnRpbWUgY2FsbGVyIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIG1ldGhvZCBuYW1lIGFuZCBvcHRpb25hbGx5IGFyZ3VtZW50cyBhbmQgaW52b2tlcyB0aGUgbWV0aG9kIHdpdGhpbiB0aGUgc3BlY2lmaWVkIHdpbmRvdyBjb250ZXh0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV3UnVudGltZUNhbGxlcihvYmplY3QsIHdpbmRvd05hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1ldGhvZCwgYXJncz1udWxsKSB7XG4gICAgICAgIHJldHVybiBydW50aW1lQ2FsbChvYmplY3QgKyBcIi5cIiArIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncyk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHJ1bnRpbWUgY2FsbGVyIHdpdGggc3BlY2lmaWVkIElELlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIGludm9rZSB0aGUgbWV0aG9kIG9uLlxuICogQHBhcmFtIHtzdHJpbmd9IHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93LlxuICogQHJldHVybiB7RnVuY3Rpb259IC0gVGhlIG5ldyBydW50aW1lIGNhbGxlciBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0LCB3aW5kb3dOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZXRob2QsIGFyZ3M9bnVsbCkge1xuICAgICAgICByZXR1cm4gcnVudGltZUNhbGxXaXRoSUQob2JqZWN0LCBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpO1xuICAgIH07XG59XG5cblxuZnVuY3Rpb24gcnVudGltZUNhbGwobWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKSB7XG4gICAgbGV0IHVybCA9IG5ldyBVUkwocnVudGltZVVSTCk7XG4gICAgaWYoIG1ldGhvZCApIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJtZXRob2RcIiwgbWV0aG9kKTtcbiAgICB9XG4gICAgbGV0IGZldGNoT3B0aW9ucyA9IHtcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgfTtcbiAgICBpZiAod2luZG93TmFtZSkge1xuICAgICAgICBmZXRjaE9wdGlvbnMuaGVhZGVyc1tcIngtd2FpbHMtd2luZG93LW5hbWVcIl0gPSB3aW5kb3dOYW1lO1xuICAgIH1cbiAgICBpZiAoYXJncykge1xuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcImFyZ3NcIiwgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xuICAgIH1cbiAgICBmZXRjaE9wdGlvbnMuaGVhZGVyc1tcIngtd2FpbHMtY2xpZW50LWlkXCJdID0gY2xpZW50SWQ7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBmZXRjaCh1cmwsIGZldGNoT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgY29udGVudCB0eXBlXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKSAmJiByZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlamVjdChFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiByZXNvbHZlKGRhdGEpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHJlamVjdChlcnJvcikpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBydW50aW1lQ2FsbFdpdGhJRChvYmplY3RJRCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKSB7XG4gICAgbGV0IHVybCA9IG5ldyBVUkwocnVudGltZVVSTCk7XG4gICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJvYmplY3RcIiwgb2JqZWN0SUQpO1xuICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwibWV0aG9kXCIsIG1ldGhvZCk7XG4gICAgbGV0IGZldGNoT3B0aW9ucyA9IHtcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgfTtcbiAgICBpZiAod2luZG93TmFtZSkge1xuICAgICAgICBmZXRjaE9wdGlvbnMuaGVhZGVyc1tcIngtd2FpbHMtd2luZG93LW5hbWVcIl0gPSB3aW5kb3dOYW1lO1xuICAgIH1cbiAgICBpZiAoYXJncykge1xuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcImFyZ3NcIiwgSlNPTi5zdHJpbmdpZnkoYXJncykpO1xuICAgIH1cbiAgICBmZXRjaE9wdGlvbnMuaGVhZGVyc1tcIngtd2FpbHMtY2xpZW50LWlkXCJdID0gY2xpZW50SWQ7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZmV0Y2godXJsLCBmZXRjaE9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGNvbnRlbnQgdHlwZVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikgJiYgcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikuaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWplY3QoRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcmVzb2x2ZShkYXRhKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKTtcbiAgICB9KTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG4vKipcbiAqIEZldGNoZXMgYXBwbGljYXRpb24gY2FwYWJpbGl0aWVzIGZyb20gdGhlIHNlcnZlci5cbiAqXG4gKiBAYXN5bmNcbiAqIEBmdW5jdGlvbiBDYXBhYmlsaXRpZXNcbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBjYXBhYmlsaXRpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYXBhYmlsaXRpZXMoKSB7XG4gICAgcmV0dXJuIGZldGNoKFwiL3dhaWxzL2NhcGFiaWxpdGllc1wiKS50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBXaW5kb3dzLlxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cywgb3RoZXJ3aXNlIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNXaW5kb3dzKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcIndpbmRvd3NcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBMaW51eC5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgTGludXgsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTGludXgoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuT1MgPT09IFwibGludXhcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgYSBtYWNPUyBvcGVyYXRpbmcgc3lzdGVtLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBlbnZpcm9ubWVudCBpcyBtYWNPUywgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNYWMoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuT1MgPT09IFwiZGFyd2luXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGFyY2hpdGVjdHVyZSBpcyBBTUQ2NC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGFyY2hpdGVjdHVyZSBpcyBBTUQ2NCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNBTUQ2NCgpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5BcmNoID09PSBcImFtZDY0XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGFyY2hpdGVjdHVyZSBpcyBBUk0uXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGN1cnJlbnQgYXJjaGl0ZWN0dXJlIGlzIEFSTSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNBUk0oKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuQXJjaCA9PT0gXCJhcm1cIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgQVJNNjQgYXJjaGl0ZWN0dXJlLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIFJldHVybnMgdHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgQVJNNjQgYXJjaGl0ZWN0dXJlLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQVJNNjQoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuQXJjaCA9PT0gXCJhcm02NFwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpcyBpbiBkZWJ1ZyBtb2RlLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSAtIFJldHVybnMgdHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgaW4gZGVidWcgbW9kZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0RlYnVnKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkRlYnVnID09PSB0cnVlO1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7bmV3UnVudGltZUNhbGxlcldpdGhJRCwgb2JqZWN0TmFtZXN9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7SXNEZWJ1Z30gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5cbi8vIHNldHVwXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBjb250ZXh0TWVudUhhbmRsZXIpO1xuXG5jb25zdCBjYWxsID0gbmV3UnVudGltZUNhbGxlcldpdGhJRChvYmplY3ROYW1lcy5Db250ZXh0TWVudSwgJycpO1xuY29uc3QgQ29udGV4dE1lbnVPcGVuID0gMDtcblxuZnVuY3Rpb24gb3BlbkNvbnRleHRNZW51KGlkLCB4LCB5LCBkYXRhKSB7XG4gICAgdm9pZCBjYWxsKENvbnRleHRNZW51T3Blbiwge2lkLCB4LCB5LCBkYXRhfSk7XG59XG5cbmZ1bmN0aW9uIGNvbnRleHRNZW51SGFuZGxlcihldmVudCkge1xuICAgIC8vIENoZWNrIGZvciBjdXN0b20gY29udGV4dCBtZW51XG4gICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IGN1c3RvbUNvbnRleHRNZW51ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tY3VzdG9tLWNvbnRleHRtZW51XCIpO1xuICAgIGN1c3RvbUNvbnRleHRNZW51ID0gY3VzdG9tQ29udGV4dE1lbnUgPyBjdXN0b21Db250ZXh0TWVudS50cmltKCkgOiBcIlwiO1xuICAgIGlmIChjdXN0b21Db250ZXh0TWVudSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsZXQgY3VzdG9tQ29udGV4dE1lbnVEYXRhID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tY3VzdG9tLWNvbnRleHRtZW51LWRhdGFcIik7XG4gICAgICAgIG9wZW5Db250ZXh0TWVudShjdXN0b21Db250ZXh0TWVudSwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSwgY3VzdG9tQ29udGV4dE1lbnVEYXRhKTtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgcHJvY2Vzc0RlZmF1bHRDb250ZXh0TWVudShldmVudCk7XG59XG5cblxuLypcbi0tZGVmYXVsdC1jb250ZXh0bWVudTogYXV0bzsgKGRlZmF1bHQpIHdpbGwgc2hvdyB0aGUgZGVmYXVsdCBjb250ZXh0IG1lbnUgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWUgT1IgdGV4dCBoYXMgYmVlbiBzZWxlY3RlZCBPUiBlbGVtZW50IGlzIGlucHV0IG9yIHRleHRhcmVhXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IHNob3c7IHdpbGwgYWx3YXlzIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51XG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IGhpZGU7IHdpbGwgYWx3YXlzIGhpZGUgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51XG5cblRoaXMgcnVsZSBpcyBpbmhlcml0ZWQgbGlrZSBub3JtYWwgQ1NTIHJ1bGVzLCBzbyBuZXN0aW5nIHdvcmtzIGFzIGV4cGVjdGVkXG4qL1xuZnVuY3Rpb24gcHJvY2Vzc0RlZmF1bHRDb250ZXh0TWVudShldmVudCkge1xuXG4gICAgLy8gRGVidWcgYnVpbGRzIGFsd2F5cyBzaG93IHRoZSBtZW51XG4gICAgaWYgKElzRGVidWcoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHJvY2VzcyBkZWZhdWx0IGNvbnRleHQgbWVudVxuICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuICAgIGNvbnN0IGRlZmF1bHRDb250ZXh0TWVudUFjdGlvbiA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShcIi0tZGVmYXVsdC1jb250ZXh0bWVudVwiKS50cmltKCk7XG4gICAgc3dpdGNoIChkZWZhdWx0Q29udGV4dE1lbnVBY3Rpb24pIHtcbiAgICAgICAgY2FzZSBcInNob3dcIjpcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY2FzZSBcImhpZGVcIjpcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBjb250ZW50RWRpdGFibGUgaXMgdHJ1ZVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNDb250ZW50RWRpdGFibGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRleHQgaGFzIGJlZW4gc2VsZWN0ZWRcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IGhhc1NlbGVjdGlvbiA9IChzZWxlY3Rpb24udG9TdHJpbmcoKS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgaWYgKGhhc1NlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0aW9uLnJhbmdlQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KGkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWN0cyA9IHJhbmdlLmdldENsaWVudFJlY3RzKCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVjdHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY3QgPSByZWN0c1tqXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHJlY3QubGVmdCwgcmVjdC50b3ApID09PSBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGFnbmFtZSBpcyBpbnB1dCBvciB0ZXh0YXJlYVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gXCJJTlBVVFwiIHx8IGVsZW1lbnQudGFnTmFtZSA9PT0gXCJURVhUQVJFQVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhhc1NlbGVjdGlvbiB8fCAoIWVsZW1lbnQucmVhZE9ubHkgJiYgIWVsZW1lbnQuZGlzYWJsZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGhpZGUgZGVmYXVsdCBjb250ZXh0IG1lbnVcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkgZnJvbSB0aGUgZmxhZyBtYXAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleVN0cmluZyAtIFRoZSBrZXkgdG8gcmV0cmlldmUgdGhlIHZhbHVlIGZvci5cbiAqIEByZXR1cm4geyp9IC0gVGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEZsYWcoa2V5U3RyaW5nKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZmxhZ3Nba2V5U3RyaW5nXTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byByZXRyaWV2ZSBmbGFnICdcIiArIGtleVN0cmluZyArIFwiJzogXCIgKyBlKTtcbiAgICB9XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHtpbnZva2V9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7SXNXaW5kb3dzfSBmcm9tIFwiLi9zeXN0ZW0uanNcIjtcbmltcG9ydCB7R2V0RmxhZ30gZnJvbSBcIi4vZmxhZ3MuanNcIjtcblxuLy8gU2V0dXBcbmxldCBzaG91bGREcmFnID0gZmFsc2U7XG5sZXQgcmVzaXphYmxlID0gZmFsc2U7XG5sZXQgcmVzaXplRWRnZSA9IG51bGw7XG5sZXQgZGVmYXVsdEN1cnNvciA9IFwiYXV0b1wiO1xuXG53aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcblxud2luZG93Ll93YWlscy5zZXRSZXNpemFibGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJlc2l6YWJsZSA9IHZhbHVlO1xufTtcblxud2luZG93Ll93YWlscy5lbmREcmFnID0gZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xufTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uTW91c2VEb3duKTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XG5cblxuZnVuY3Rpb24gZHJhZ1Rlc3QoZSkge1xuICAgIGxldCB2YWwgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlLnRhcmdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0td2FpbHMtZHJhZ2dhYmxlXCIpO1xuICAgIGxldCBtb3VzZVByZXNzZWQgPSBlLmJ1dHRvbnMgIT09IHVuZGVmaW5lZCA/IGUuYnV0dG9ucyA6IGUud2hpY2g7XG4gICAgaWYgKCF2YWwgfHwgdmFsID09PSBcIlwiIHx8IHZhbC50cmltKCkgIT09IFwiZHJhZ1wiIHx8IG1vdXNlUHJlc3NlZCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBlLmRldGFpbCA9PT0gMTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZURvd24oZSkge1xuXG4gICAgLy8gQ2hlY2sgZm9yIHJlc2l6aW5nXG4gICAgaWYgKHJlc2l6ZUVkZ2UpIHtcbiAgICAgICAgaW52b2tlKFwicmVzaXplOlwiICsgcmVzaXplRWRnZSk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChkcmFnVGVzdChlKSkge1xuICAgICAgICAvLyBUaGlzIGNoZWNrcyBmb3IgY2xpY2tzIG9uIHRoZSBzY3JvbGwgYmFyXG4gICAgICAgIGlmIChlLm9mZnNldFggPiBlLnRhcmdldC5jbGllbnRXaWR0aCB8fCBlLm9mZnNldFkgPiBlLnRhcmdldC5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzaG91bGREcmFnID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzaG91bGREcmFnID0gZmFsc2U7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBvbk1vdXNlVXAoKSB7XG4gICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBzZXRSZXNpemUoY3Vyc29yKSB7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLmN1cnNvciA9IGN1cnNvciB8fCBkZWZhdWx0Q3Vyc29yO1xuICAgIHJlc2l6ZUVkZ2UgPSBjdXJzb3I7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VNb3ZlKGUpIHtcbiAgICBpZiAoc2hvdWxkRHJhZykge1xuICAgICAgICBzaG91bGREcmFnID0gZmFsc2U7XG4gICAgICAgIGxldCBtb3VzZVByZXNzZWQgPSBlLmJ1dHRvbnMgIT09IHVuZGVmaW5lZCA/IGUuYnV0dG9ucyA6IGUud2hpY2g7XG4gICAgICAgIGlmIChtb3VzZVByZXNzZWQgPiAwKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJkcmFnXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghcmVzaXphYmxlIHx8ICFJc1dpbmRvd3MoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChkZWZhdWx0Q3Vyc29yID09IG51bGwpIHtcbiAgICAgICAgZGVmYXVsdEN1cnNvciA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5jdXJzb3I7XG4gICAgfVxuICAgIGxldCByZXNpemVIYW5kbGVIZWlnaHQgPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZUhlaWdodFwiKSB8fCA1O1xuICAgIGxldCByZXNpemVIYW5kbGVXaWR0aCA9IEdldEZsYWcoXCJzeXN0ZW0ucmVzaXplSGFuZGxlV2lkdGhcIikgfHwgNTtcblxuICAgIC8vIEV4dHJhIHBpeGVscyBmb3IgdGhlIGNvcm5lciBhcmVhc1xuICAgIGxldCBjb3JuZXJFeHRyYSA9IEdldEZsYWcoXCJyZXNpemVDb3JuZXJFeHRyYVwiKSB8fCAxMDtcblxuICAgIGxldCByaWdodEJvcmRlciA9IHdpbmRvdy5vdXRlcldpZHRoIC0gZS5jbGllbnRYIDwgcmVzaXplSGFuZGxlV2lkdGg7XG4gICAgbGV0IGxlZnRCb3JkZXIgPSBlLmNsaWVudFggPCByZXNpemVIYW5kbGVXaWR0aDtcbiAgICBsZXQgdG9wQm9yZGVyID0gZS5jbGllbnRZIDwgcmVzaXplSGFuZGxlSGVpZ2h0O1xuICAgIGxldCBib3R0b21Cb3JkZXIgPSB3aW5kb3cub3V0ZXJIZWlnaHQgLSBlLmNsaWVudFkgPCByZXNpemVIYW5kbGVIZWlnaHQ7XG5cbiAgICAvLyBBZGp1c3QgZm9yIGNvcm5lcnNcbiAgICBsZXQgcmlnaHRDb3JuZXIgPSB3aW5kb3cub3V0ZXJXaWR0aCAtIGUuY2xpZW50WCA8IChyZXNpemVIYW5kbGVXaWR0aCArIGNvcm5lckV4dHJhKTtcbiAgICBsZXQgbGVmdENvcm5lciA9IGUuY2xpZW50WCA8IChyZXNpemVIYW5kbGVXaWR0aCArIGNvcm5lckV4dHJhKTtcbiAgICBsZXQgdG9wQ29ybmVyID0gZS5jbGllbnRZIDwgKHJlc2l6ZUhhbmRsZUhlaWdodCArIGNvcm5lckV4dHJhKTtcbiAgICBsZXQgYm90dG9tQ29ybmVyID0gd2luZG93Lm91dGVySGVpZ2h0IC0gZS5jbGllbnRZIDwgKHJlc2l6ZUhhbmRsZUhlaWdodCArIGNvcm5lckV4dHJhKTtcblxuICAgIC8vIElmIHdlIGFyZW4ndCBvbiBhbiBlZGdlLCBidXQgd2VyZSwgcmVzZXQgdGhlIGN1cnNvciB0byBkZWZhdWx0XG4gICAgaWYgKCFsZWZ0Qm9yZGVyICYmICFyaWdodEJvcmRlciAmJiAhdG9wQm9yZGVyICYmICFib3R0b21Cb3JkZXIgJiYgcmVzaXplRWRnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNldFJlc2l6ZSgpO1xuICAgIH1cbiAgICAvLyBBZGp1c3RlZCBmb3IgY29ybmVyIGFyZWFzXG4gICAgZWxzZSBpZiAocmlnaHRDb3JuZXIgJiYgYm90dG9tQ29ybmVyKSBzZXRSZXNpemUoXCJzZS1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAobGVmdENvcm5lciAmJiBib3R0b21Db3JuZXIpIHNldFJlc2l6ZShcInN3LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChsZWZ0Q29ybmVyICYmIHRvcENvcm5lcikgc2V0UmVzaXplKFwibnctcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKHRvcENvcm5lciAmJiByaWdodENvcm5lcikgc2V0UmVzaXplKFwibmUtcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGxlZnRCb3JkZXIpIHNldFJlc2l6ZShcInctcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKHRvcEJvcmRlcikgc2V0UmVzaXplKFwibi1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAoYm90dG9tQm9yZGVyKSBzZXRSZXNpemUoXCJzLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChyaWdodEJvcmRlcikgc2V0UmVzaXplKFwiZS1yZXNpemVcIik7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHsgbmV3UnVudGltZUNhbGxlcldpdGhJRCwgb2JqZWN0TmFtZXMgfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQgeyBuYW5vaWQgfSBmcm9tIFwiLi9uYW5vaWQuanNcIjtcblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xud2luZG93Ll93YWlscy5jYWxsUmVzdWx0SGFuZGxlciA9IHJlc3VsdEhhbmRsZXI7XG53aW5kb3cuX3dhaWxzLmNhbGxFcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXI7XG5cbmNvbnN0IENhbGxCaW5kaW5nID0gMDtcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdE5hbWVzLkNhbGwsICcnKTtcbmNvbnN0IGNhbmNlbENhbGwgPSBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdE5hbWVzLkNhbmNlbENhbGwsICcnKTtcbmxldCBjYWxsUmVzcG9uc2VzID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBJRCB1c2luZyB0aGUgbmFub2lkIGxpYnJhcnkuXG4gKlxuICogQHJldHVybiB7c3RyaW5nfSAtIEEgdW5pcXVlIElEIHRoYXQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGNhbGxSZXNwb25zZXMgc2V0LlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUlEKCkge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZG8ge1xuICAgICAgICByZXN1bHQgPSBuYW5vaWQoKTtcbiAgICB9IHdoaWxlIChjYWxsUmVzcG9uc2VzLmhhcyhyZXN1bHQpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEhhbmRsZXMgdGhlIHJlc3VsdCBvZiBhIGNhbGwgcmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHJlcXVlc3QgdG8gaGFuZGxlIHRoZSByZXN1bHQgZm9yLlxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBUaGUgcmVzdWx0IGRhdGEgb2YgdGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzSlNPTiAtIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkYXRhIGlzIEpTT04gb3Igbm90LlxuICpcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH0gLSBUaGlzIG1ldGhvZCBkb2VzIG5vdCByZXR1cm4gYW55IHZhbHVlLlxuICovXG5mdW5jdGlvbiByZXN1bHRIYW5kbGVyKGlkLCBkYXRhLCBpc0pTT04pIHtcbiAgICBjb25zdCBwcm9taXNlSGFuZGxlciA9IGdldEFuZERlbGV0ZVJlc3BvbnNlKGlkKTtcbiAgICBpZiAocHJvbWlzZUhhbmRsZXIpIHtcbiAgICAgICAgcHJvbWlzZUhhbmRsZXIucmVzb2x2ZShpc0pTT04gPyBKU09OLnBhcnNlKGRhdGEpIDogZGF0YSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEhhbmRsZXMgdGhlIGVycm9yIGZyb20gYSBjYWxsIHJlcXVlc3QuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSBwcm9taXNlIGhhbmRsZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIHJlamVjdCB0aGUgcHJvbWlzZSBoYW5kbGVyIHdpdGguXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gZXJyb3JIYW5kbGVyKGlkLCBtZXNzYWdlKSB7XG4gICAgY29uc3QgcHJvbWlzZUhhbmRsZXIgPSBnZXRBbmREZWxldGVSZXNwb25zZShpZCk7XG4gICAgaWYgKHByb21pc2VIYW5kbGVyKSB7XG4gICAgICAgIHByb21pc2VIYW5kbGVyLnJlamVjdChtZXNzYWdlKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGFuZCByZW1vdmVzIHRoZSByZXNwb25zZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIElEIGZyb20gdGhlIGNhbGxSZXNwb25zZXMgbWFwLlxuICpcbiAqIEBwYXJhbSB7YW55fSBpZCAtIFRoZSBJRCBvZiB0aGUgcmVzcG9uc2UgdG8gYmUgcmV0cmlldmVkIGFuZCByZW1vdmVkLlxuICpcbiAqIEByZXR1cm5zIHthbnl9IFRoZSByZXNwb25zZSBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBJRC5cbiAqL1xuZnVuY3Rpb24gZ2V0QW5kRGVsZXRlUmVzcG9uc2UoaWQpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGNhbGxSZXNwb25zZXMuZ2V0KGlkKTtcbiAgICBjYWxsUmVzcG9uc2VzLmRlbGV0ZShpZCk7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY2FsbCB1c2luZyB0aGUgcHJvdmlkZWQgdHlwZSBhbmQgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IHR5cGUgLSBUaGUgdHlwZSBvZiBjYWxsIHRvIGV4ZWN1dGUuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIC0gQWRkaXRpb25hbCBvcHRpb25zIGZvciB0aGUgY2FsbC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IC0gQSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvciByZWplY3RlZCBiYXNlZCBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjYWxsLiBJdCBhbHNvIGhhcyBhIGNhbmNlbCBtZXRob2QgdG8gY2FuY2VsIGEgbG9uZyBydW5uaW5nIHJlcXVlc3QuXG4gKi9cbmZ1bmN0aW9uIGNhbGxCaW5kaW5nKHR5cGUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGlkID0gZ2VuZXJhdGVJRCgpO1xuICAgIGNvbnN0IGRvQ2FuY2VsID0gKCkgPT4geyByZXR1cm4gY2FuY2VsQ2FsbCh0eXBlLCB7XCJjYWxsLWlkXCI6IGlkfSkgfTtcbiAgICBsZXQgcXVldWVkQ2FuY2VsID0gZmFsc2UsIGNhbGxSdW5uaW5nID0gZmFsc2U7XG4gICAgbGV0IHAgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIG9wdGlvbnNbXCJjYWxsLWlkXCJdID0gaWQ7XG4gICAgICAgIGNhbGxSZXNwb25zZXMuc2V0KGlkLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgICAgY2FsbCh0eXBlLCBvcHRpb25zKS5cbiAgICAgICAgICAgIHRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgICAgICBjYWxsUnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlZENhbmNlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9DYW5jZWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5cbiAgICAgICAgICAgIGNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgY2FsbFJlc3BvbnNlcy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcC5jYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIGlmIChjYWxsUnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGRvQ2FuY2VsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWV1ZWRDYW5jZWwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBwO1xufVxuXG4vKipcbiAqIENhbGwgbWV0aG9kLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gVGhlIG9wdGlvbnMgZm9yIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIFRoZSByZXN1bHQgb2YgdGhlIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYWxsKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgbWV0aG9kIGJ5IG5hbWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIGluIHRoZSBmb3JtYXQgJ3BhY2thZ2Uuc3RydWN0Lm1ldGhvZCcuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgbmFtZSBpcyBub3QgYSBzdHJpbmcgb3IgaXMgbm90IGluIHRoZSBjb3JyZWN0IGZvcm1hdC5cbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgZXhlY3V0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQnlOYW1lKG5hbWUsIC4uLmFyZ3MpIHtcbiAgICAvLyBQYWNrYWdlIHBhdGhzIG1heSBjb250YWluIGRvdHM6IHNwbGl0IHdpdGggY3VzdG9tIGNvZGVcbiAgICAvLyB0byBlbnN1cmUgb25seSB0aGUgbGFzdCB0d28gZG90cyBhcmUgdGFrZW4gaW50byBhY2NvdW50LlxuICAgIGxldCBtZXRob2REb3QgPSAtMSwgc3RydWN0RG90ID0gLTE7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIG1ldGhvZERvdCA9IG5hbWUubGFzdEluZGV4T2YoXCIuXCIpO1xuICAgICAgICBpZiAobWV0aG9kRG90ID4gMClcbiAgICAgICAgICAgIHN0cnVjdERvdCA9IG5hbWUubGFzdEluZGV4T2YoXCIuXCIsIG1ldGhvZERvdCAtIDEpO1xuICAgIH1cblxuICAgIGlmIChtZXRob2REb3QgPCAwIHx8IHN0cnVjdERvdCA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbEJ5TmFtZSByZXF1aXJlcyBhIHN0cmluZyBpbiB0aGUgZm9ybWF0ICdwYWNrYWdlUGF0aC5zdHJ1Y3QubWV0aG9kJ1wiKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlUGF0aCA9IG5hbWUuc2xpY2UoMCwgc3RydWN0RG90KSxcbiAgICAgICAgICBzdHJ1Y3ROYW1lID0gbmFtZS5zbGljZShzdHJ1Y3REb3QgKyAxLCBtZXRob2REb3QpLFxuICAgICAgICAgIG1ldGhvZE5hbWUgPSBuYW1lLnNsaWNlKG1ldGhvZERvdCArIDEpO1xuXG4gICAgcmV0dXJuIGNhbGxCaW5kaW5nKENhbGxCaW5kaW5nLCB7XG4gICAgICAgIHBhY2thZ2VQYXRoLFxuICAgICAgICBzdHJ1Y3ROYW1lLFxuICAgICAgICBtZXRob2ROYW1lLFxuICAgICAgICBhcmdzXG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2QgYnkgaXRzIElEIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IG1ldGhvZElEIC0gVGhlIElEIG9mIHRoZSBtZXRob2QgdG8gY2FsbC5cbiAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kLlxuICogQHJldHVybiB7Kn0gLSBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJ5SUQobWV0aG9kSUQsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIHtcbiAgICAgICAgbWV0aG9kSUQsXG4gICAgICAgIGFyZ3NcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvbiBhIHBsdWdpbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGx1Z2luTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBwbHVnaW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gY2FsbC5cbiAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kLlxuICogQHJldHVybnMgeyp9IC0gVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQbHVnaW4ocGx1Z2luTmFtZSwgbWV0aG9kTmFtZSwgLi4uYXJncykge1xuICAgIHJldHVybiBjYWxsQmluZGluZyhDYWxsQmluZGluZywge1xuICAgICAgICBwYWNrYWdlTmFtZTogXCJ3YWlscy1wbHVnaW5zXCIsXG4gICAgICAgIHN0cnVjdE5hbWU6IHBsdWdpbk5hbWUsXG4gICAgICAgIG1ldGhvZE5hbWUsXG4gICAgICAgIGFyZ3NcbiAgICB9KTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG4vKipcbiAqIEFueSBpcyBhIGR1bW15IGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBzaW1wbGUgb3IgdW5rbm93biB0eXBlcy5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge2FueX0gc291cmNlXG4gKiBAcmV0dXJucyB7VH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFueShzb3VyY2UpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHtUfSAqLyhzb3VyY2UpO1xufVxuXG4vKipcbiAqIEFycmF5IHRha2VzIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXG4gKiBhbmQgcmV0dXJucyBhbiBpbi1wbGFjZSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJyYXlcbiAqIHdob3NlIGVsZW1lbnRzIGFyZSBvZiB0aGF0IHR5cGUuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHsoYW55KSA9PiBUfSBlbGVtZW50XG4gKiBAcmV0dXJucyB7KGFueSkgPT4gVFtdfVxuICovXG5leHBvcnQgZnVuY3Rpb24gQXJyYXkoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50ID09PSBBbnkpIHtcbiAgICAgICAgcmV0dXJuIChzb3VyY2UpID0+IChzb3VyY2UgPT09IG51bGwgPyBbXSA6IHNvdXJjZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzb3VyY2UpID0+IHtcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzb3VyY2VbaV0gPSBlbGVtZW50KHNvdXJjZVtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9O1xufVxuXG4vKipcbiAqIE1hcCB0YWtlcyBjcmVhdGlvbiBmdW5jdGlvbnMgZm9yIHR3byBhcmJpdHJhcnkgdHlwZXNcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBvYmplY3RcbiAqIHdob3NlIGtleXMgYW5kIHZhbHVlcyBhcmUgb2YgdGhvc2UgdHlwZXMuXG4gKiBAdGVtcGxhdGUgSywgVlxuICogQHBhcmFtIHsoYW55KSA9PiBLfSBrZXlcbiAqIEBwYXJhbSB7KGFueSkgPT4gVn0gdmFsdWVcbiAqIEByZXR1cm5zIHsoYW55KSA9PiB7IFtfOiBLXTogViB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gTWFwKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IEFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IHt9IDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBzb3VyY2Vba2V5XSA9IHZhbHVlKHNvdXJjZVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogTnVsbGFibGUgdGFrZXMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcbiAqIGFuZCByZXR1cm5zIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGEgbnVsbGFibGUgdmFsdWUgb2YgdGhhdCB0eXBlLlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7KGFueSkgPT4gVH0gZWxlbWVudFxuICogQHJldHVybnMgeyhhbnkpID0+IChUIHwgbnVsbCl9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsYWJsZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IEFueSkge1xuICAgICAgICByZXR1cm4gQW55O1xuICAgIH1cblxuICAgIHJldHVybiAoc291cmNlKSA9PiAoc291cmNlID09PSBudWxsID8gbnVsbCA6IGVsZW1lbnQoc291cmNlKSk7XG59XG5cbi8qKlxuICogU3RydWN0IHRha2VzIGFuIG9iamVjdCBtYXBwaW5nIGZpZWxkIG5hbWVzIHRvIGNyZWF0aW9uIGZ1bmN0aW9uc1xuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGEgc3RydWN0LlxuICogQHRlbXBsYXRlIHt7IFtfOiBzdHJpbmddOiAoKGFueSkgPT4gYW55KSB9fSBUXG4gKiBAdGVtcGxhdGUge3sgW0tleSBpbiBrZXlvZiBUXT86IFJldHVyblR5cGU8VFtLZXldPiB9fSBVXG4gKiBAcGFyYW0ge1R9IGNyZWF0ZUZpZWxkXG4gKiBAcmV0dXJucyB7KGFueSkgPT4gVX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cnVjdChjcmVhdGVGaWVsZCkge1xuICAgIGxldCBhbGxBbnkgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgbmFtZSBpbiBjcmVhdGVGaWVsZCkge1xuICAgICAgICBpZiAoY3JlYXRlRmllbGRbbmFtZV0gIT09IEFueSkge1xuICAgICAgICAgICAgYWxsQW55ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYWxsQW55KSB7XG4gICAgICAgIHJldHVybiBBbnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzb3VyY2UpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIGNyZWF0ZUZpZWxkKSB7XG4gICAgICAgICAgICBpZiAobmFtZSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBzb3VyY2VbbmFtZV0gPSBjcmVhdGVGaWVsZFtuYW1lXShzb3VyY2VbbmFtZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xuXG5pbXBvcnQgXCIuL2NvbnRleHRtZW51LmpzXCI7XG5pbXBvcnQgXCIuL2RyYWcuanNcIjtcblxuLy8gUmUtZXhwb3J0IChpbnRlcm5hbCkgcHVibGljIEFQSVxuZXhwb3J0ICogYXMgQ2FsbCBmcm9tIFwiLi9jYWxsLmpzXCI7XG5leHBvcnQgKiBhcyBDcmVhdGUgZnJvbSBcIi4vY3JlYXRlLmpzXCI7XG5leHBvcnQgKiBhcyBGbGFncyBmcm9tIFwiLi9mbGFncy5qc1wiO1xuZXhwb3J0ICogYXMgU3lzdGVtIGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuXG5pbXBvcnQge2ludm9rZX0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG4vLyBQcm92aWRlIGR1bW15IGV2ZW50IGxpc3RlbmVyLlxuaWYgKCEoXCJkaXNwYXRjaFdhaWxzRXZlbnRcIiBpbiB3aW5kb3cuX3dhaWxzKSkge1xuICAgIHdpbmRvdy5fd2FpbHMuZGlzcGF0Y2hXYWlsc0V2ZW50ID0gZnVuY3Rpb24gKCkge307XG59XG5cbi8vIE5vdGlmeSBiYWNrZW5kXG53aW5kb3cuX3dhaWxzLmludm9rZSA9IGludm9rZTtcbmludm9rZShcIndhaWxzOnJ1bnRpbWU6cmVhZHlcIik7XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG4vKipcbiAqIE9wZW5VUkwgb3BlbnMgYSBicm93c2VyIHdpbmRvdyB0byB0aGUgZ2l2ZW4gVVJMLlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPcGVuVVJMKHVybCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDE0MTQwODE4NSwgdXJsKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQgeyBDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZSB9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuLi9jb3JlL2NhbGwuanNcIjtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQgeyBDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZSB9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbi8qKlxuICogU2V0VGV4dCB3cml0ZXMgdGhlIGdpdmVuIHN0cmluZyB0byB0aGUgQ2xpcGJvYXJkLlxuICogSXQgcmV0dXJucyB0cnVlIGlmIHRoZSBvcGVyYXRpb24gc3VjY2VlZGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRUZXh0KHRleHQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDk0MDU3Mzc0OSwgdGV4dCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVGV4dCByZXRyaWV2ZXMgYSBzdHJpbmcgZnJvbSB0aGUgY2xpcGJvYXJkLlxuICogSWYgdGhlIG9wZXJhdGlvbiBmYWlscywgaXQgcmV0dXJucyBudWxsLlxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nIHwgbnVsbD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUZXh0KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjQ5MjM4NjIxKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQgeyBDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZSB9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuLi9jb3JlL2NyZWF0ZS5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgJG1vZGVscyBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuZXhwb3J0IHtNZXNzYWdlRGlhbG9nT3B0aW9ucywgQnV0dG9uLCBGaWxlRmlsdGVyLCBPcGVuRmlsZURpYWxvZ09wdGlvbnMsIFNhdmVGaWxlRGlhbG9nT3B0aW9uc30gZnJvbSBcIi4vbW9kZWxzLmpzXCI7XG5cbi8qKlxuICogRXJyb3Igc2hvd3MgYSBtb2RhbCBkaWFsb2cgY29udGFpbmluZyBhbiBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRXJyb3Iob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjUwODg2Mjg5NSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogSW5mbyBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGFuIGluZm9ybWF0aW9uYWwgbWVzc2FnZS5cbiAqIEBwYXJhbSB7JG1vZGVscy5NZXNzYWdlRGlhbG9nT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEluZm8ob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDA4MzEwODMsIG9wdGlvbnMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE9wZW5GaWxlIHNob3dzIGEgZGlhbG9nIHRoYXQgYWxsb3dzIHRoZSB1c2VyXG4gKiB0byBzZWxlY3Qgb25lIG9yIG1vcmUgZmlsZXMgdG8gb3Blbi5cbiAqIEl0IG1heSB0aHJvdyBhbiBleGNlcHRpb24gaW4gY2FzZSBvZiBlcnJvcnMuXG4gKiBJdCByZXR1cm5zIGEgc3RyaW5nIGluIHNpbmdsZSBzZWxlY3Rpb24gbW9kZSxcbiAqIGFuIGFycmF5IG9mIHN0cmluZ3MgaW4gbXVsdGlwbGUgc2VsZWN0aW9uIG1vZGUuXG4gKiBAcGFyYW0geyRtb2RlbHMuT3BlbkZpbGVEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkZpbGUob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjk1ODU3MTEwMSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUXVlc3Rpb24gc2hvd3MgYSBtb2RhbCBkaWFsb2cgYXNraW5nIGEgcXVlc3Rpb24uXG4gKiBAcGFyYW0geyRtb2RlbHMuTWVzc2FnZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWVzdGlvbihvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMzc4MzgyMzk1LCBvcHRpb25zKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTYXZlRmlsZSBzaG93cyBhIGRpYWxvZyB0aGF0IGFsbG93cyB0aGUgdXNlclxuICogdG8gc2VsZWN0IGEgbG9jYXRpb24gd2hlcmUgYSBmaWxlIHNob3VsZCBiZSBzYXZlZC5cbiAqIEl0IG1heSB0aHJvdyBhbiBleGNlcHRpb24gaW4gY2FzZSBvZiBlcnJvcnMuXG4gKiBAcGFyYW0geyRtb2RlbHMuU2F2ZUZpbGVEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2F2ZUZpbGUob3B0aW9ucykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTQ0MTc3MzY0NCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogV2FybmluZyBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGEgd2FybmluZyBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gV2FybmluZyhvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg5Mzg0NTQxMDUsIG9wdGlvbnMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0IGNsYXNzIEJ1dHRvbiB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBCdXR0b24gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPEJ1dHRvbj59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgQnV0dG9uLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGV4dCB0aGF0IGFwcGVhcnMgd2l0aGluIHRoZSBidXR0b24uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTGFiZWxcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRydWUgaWYgdGhlIGJ1dHRvbiBzaG91bGQgY2FuY2VsIGFuIG9wZXJhdGlvbiB3aGVuIGNsaWNrZWQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIklzQ2FuY2VsXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVHJ1ZSBpZiB0aGUgYnV0dG9uIHNob3VsZCBiZSB0aGUgZGVmYXVsdCBhY3Rpb24gd2hlbiB0aGUgdXNlciBwcmVzc2VzIGVudGVyLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJJc0RlZmF1bHRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgQnV0dG9uIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7QnV0dG9ufVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgQnV0dG9uKC8qKiBAdHlwZSB7UGFydGlhbDxCdXR0b24+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50SW5mbyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBFbnZpcm9ubWVudEluZm8gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPEVudmlyb25tZW50SW5mbz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgRW52aXJvbm1lbnRJbmZvLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKCEoXCJPU1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgb3BlcmF0aW5nIHN5c3RlbSBpbiB1c2UuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiT1NcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQXJjaFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYXJjaGl0ZWN0dXJlIG9mIHRoZSBzeXN0ZW0uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQXJjaFwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJEZWJ1Z1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUcnVlIGlmIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGRlYnVnIG1vZGUsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGVidWdcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlBsYXRmb3JtSW5mb1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBBZGRpdGlvbmFsIHBsYXRmb3JtIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3sgW186IHN0cmluZ106IGFueSB9fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiUGxhdGZvcm1JbmZvXCJdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJPU0luZm9cIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRGV0YWlscyBvZiB0aGUgb3BlcmF0aW5nIHN5c3RlbS5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtPU0luZm99XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJPU0luZm9cIl0gPSAobmV3IE9TSW5mbygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgRW52aXJvbm1lbnRJbmZvIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7RW52aXJvbm1lbnRJbmZvfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDNfMCA9ICQkY3JlYXRlVHlwZTA7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQ0XzAgPSAkJGNyZWF0ZVR5cGUxO1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgaWYgKFwiUGxhdGZvcm1JbmZvXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiUGxhdGZvcm1JbmZvXCJdID0gJCRjcmVhdGVGaWVsZDNfMCgkJHBhcnNlZFNvdXJjZVtcIlBsYXRmb3JtSW5mb1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwiT1NJbmZvXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiT1NJbmZvXCJdID0gJCRjcmVhdGVGaWVsZDRfMCgkJHBhcnNlZFNvdXJjZVtcIk9TSW5mb1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBFbnZpcm9ubWVudEluZm8oLyoqIEB0eXBlIHtQYXJ0aWFsPEVudmlyb25tZW50SW5mbz59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmlsZUZpbHRlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBGaWxlRmlsdGVyIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxGaWxlRmlsdGVyPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBGaWxlRmlsdGVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmlsdGVyIGluZm9ybWF0aW9uLCBlLmcuIFwiSW1hZ2UgRmlsZXMgKCouanBnLCAqLnBuZylcIlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkRpc3BsYXlOYW1lXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgZXh0ZW5zaW9uIHBhdHRlcm5zLCBlLmcuIFwiKi5qcGc7Ki5wbmdcIlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlBhdHRlcm5cIl0gPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBGaWxlRmlsdGVyIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7RmlsZUZpbHRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IEZpbGVGaWx0ZXIoLyoqIEB0eXBlIHtQYXJ0aWFsPEZpbGVGaWx0ZXI+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIExSVEIge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTFJUQiBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8TFJUQj59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgTFJUQi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiTGVmdFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTGVmdFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJSaWdodFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiUmlnaHRcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiVG9wXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJUb3BcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQm90dG9tXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCb3R0b21cIl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBMUlRCIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7TFJUQn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IExSVEIoLyoqIEB0eXBlIHtQYXJ0aWFsPExSVEI+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VEaWFsb2dPcHRpb25zIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IE1lc3NhZ2VEaWFsb2dPcHRpb25zIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxNZXNzYWdlRGlhbG9nT3B0aW9ucz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgTWVzc2FnZURpYWxvZ09wdGlvbnMuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgdGl0bGUgb2YgdGhlIGRpYWxvZyB3aW5kb3cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVGl0bGVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBtYWluIG1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk1lc3NhZ2VcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIExpc3Qgb2YgYnV0dG9uIGNob2ljZXMgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge0J1dHRvbltdIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQnV0dG9uc1wiXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGV0YWNoZWRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTWVzc2FnZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtNZXNzYWdlRGlhbG9nT3B0aW9uc31cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQyXzAgPSAkJGNyZWF0ZVR5cGUzO1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgaWYgKFwiQnV0dG9uc1wiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIkJ1dHRvbnNcIl0gPSAkJGNyZWF0ZUZpZWxkMl8wKCQkcGFyc2VkU291cmNlW1wiQnV0dG9uc1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBNZXNzYWdlRGlhbG9nT3B0aW9ucygvKiogQHR5cGUge1BhcnRpYWw8TWVzc2FnZURpYWxvZ09wdGlvbnM+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9TSW5mbyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBPU0luZm8gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPE9TSW5mbz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgT1NJbmZvLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKCEoXCJJRFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgSUQgb2YgdGhlIE9TLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIklEXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIk5hbWVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIG5hbWUgb2YgdGhlIE9TLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk5hbWVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiVmVyc2lvblwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgdmVyc2lvbiBvZiB0aGUgT1MuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVmVyc2lvblwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJCcmFuZGluZ1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYnJhbmRpbmcgb2YgdGhlIE9TLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJyYW5kaW5nXCJdID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgT1NJbmZvIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7T1NJbmZvfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgT1NJbmZvKC8qKiBAdHlwZSB7UGFydGlhbDxPU0luZm8+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9wZW5GaWxlRGlhbG9nT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBPcGVuRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPE9wZW5GaWxlRGlhbG9nT3B0aW9ucz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgT3BlbkZpbGVEaWFsb2dPcHRpb25zLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjaG9zZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkNhbkNob29zZURpcmVjdG9yaWVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGZpbGVzIGNhbiBiZSBjaG9zZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkNhbkNob29zZUZpbGVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjcmVhdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5DcmVhdGVEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBoaWRkZW4gZmlsZXMgc2hvdWxkIGJlIHNob3duLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJTaG93SGlkZGVuRmlsZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgYWxpYXNlcyBzaG91bGQgYmUgcmVzb2x2ZWQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlJlc29sdmVzQWxpYXNlc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBtdWx0aXBsZSBzZWxlY3Rpb24gaXMgYWxsb3dlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxsb3dzTXVsdGlwbGVTZWxlY3Rpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZXh0ZW5zaW9ucyBzaG91bGQgYmUgaGlkZGVuLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJIaWRlRXh0ZW5zaW9uXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGhpZGRlbiBleHRlbnNpb25zIGNhbiBiZSBzZWxlY3RlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQ2FuU2VsZWN0SGlkZGVuRXh0ZW5zaW9uXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGZpbGUgcGFja2FnZXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZGlyZWN0b3JpZXMuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlRyZWF0c0ZpbGVQYWNrYWdlc0FzRGlyZWN0b3JpZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgb3RoZXIgZmlsZSB0eXBlcyBhcmUgYWxsb3dlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxsb3dzT3RoZXJGaWxlVHlwZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaXRsZSBvZiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlRpdGxlXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBNZXNzYWdlIHRvIHNob3cgaW4gdGhlIGRpYWxvZy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJNZXNzYWdlXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCdXR0b25UZXh0XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEaXJlY3RvcnkgdG8gb3BlbiBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkRpcmVjdG9yeVwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTGlzdCBvZiBmaWxlIGZpbHRlcnMuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7RmlsZUZpbHRlcltdIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRmlsdGVyc1wiXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGV0YWNoZWRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgT3BlbkZpbGVEaWFsb2dPcHRpb25zIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7T3BlbkZpbGVEaWFsb2dPcHRpb25zfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDE0XzAgPSAkJGNyZWF0ZVR5cGU1O1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgaWYgKFwiRmlsdGVyc1wiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIkZpbHRlcnNcIl0gPSAkJGNyZWF0ZUZpZWxkMTRfMCgkJHBhcnNlZFNvdXJjZVtcIkZpbHRlcnNcIl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgT3BlbkZpbGVEaWFsb2dPcHRpb25zKC8qKiBAdHlwZSB7UGFydGlhbDxPcGVuRmlsZURpYWxvZ09wdGlvbnM+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFBvc2l0aW9uIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxQb3NpdGlvbj59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgUG9zaXRpb24uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIlhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiWVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiWVwiXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFBvc2l0aW9uIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7UG9zaXRpb259XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIG5ldyBQb3NpdGlvbigvKiogQHR5cGUge1BhcnRpYWw8UG9zaXRpb24+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJHQkEge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUkdCQSBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8UkdCQT59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgUkdCQS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiUmVkXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJSZWRcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiR3JlZW5cIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkdyZWVuXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIkJsdWVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJsdWVcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQWxwaGFcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkFscGhhXCJdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUkdCQSBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2FueX0gWyQkc291cmNlID0ge31dXG4gICAgICogQHJldHVybnMge1JHQkF9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIG5ldyBSR0JBKC8qKiBAdHlwZSB7UGFydGlhbDxSR0JBPn0gKi8oJCRwYXJzZWRTb3VyY2UpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN0IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFJlY3QgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFJlY3Q+fSBbJCRzb3VyY2UgPSB7fV0gLSBUaGUgc291cmNlIG9iamVjdCB0byBjcmVhdGUgdGhlIFJlY3QuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIlhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiWVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiWVwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJXaWR0aFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiV2lkdGhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiSGVpZ2h0XCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJIZWlnaHRcIl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBSZWN0IGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7UmVjdH1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IFJlY3QoLyoqIEB0eXBlIHtQYXJ0aWFsPFJlY3Q+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhdmVGaWxlRGlhbG9nT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBTYXZlRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFNhdmVGaWxlRGlhbG9nT3B0aW9ucz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgU2F2ZUZpbGVEaWFsb2dPcHRpb25zLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjcmVhdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5DcmVhdGVEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBoaWRkZW4gZmlsZXMgc2hvdWxkIGJlIHNob3duLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJTaG93SGlkZGVuRmlsZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGV4dGVuc2lvbnMgY2FuIGJlIHNlbGVjdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5TZWxlY3RIaWRkZW5FeHRlbnNpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgb3RoZXIgZmlsZSB0eXBlcyBhcmUgYWxsb3dlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxsb3dPdGhlckZpbGVUeXBlc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgZXh0ZW5zaW9uIHNob3VsZCBiZSBoaWRkZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkhpZGVFeHRlbnNpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZmlsZSBwYWNrYWdlcyBzaG91bGQgYmUgdHJlYXRlZCBhcyBkaXJlY3Rvcmllcy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVHJlYXRzRmlsZVBhY2thZ2VzQXNEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRpdGxlIG9mIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVGl0bGVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk1lc3NhZ2VcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERpcmVjdG9yeSB0byBvcGVuIGluIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGlyZWN0b3J5XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEZWZhdWx0IGZpbGVuYW1lIHRvIHVzZSBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkZpbGVuYW1lXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCdXR0b25UZXh0XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBMaXN0IG9mIGZpbGUgZmlsdGVycy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtGaWxlRmlsdGVyW10gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJGaWx0ZXJzXCJdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93LlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJEZXRhY2hlZFwiXSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBTYXZlRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtTYXZlRmlsZURpYWxvZ09wdGlvbnN9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBjb25zdCAkJGNyZWF0ZUZpZWxkMTFfMCA9ICQkY3JlYXRlVHlwZTU7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICBpZiAoXCJGaWx0ZXJzXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiRmlsdGVyc1wiXSA9ICQkY3JlYXRlRmllbGQxMV8wKCQkcGFyc2VkU291cmNlW1wiRmlsdGVyc1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBTYXZlRmlsZURpYWxvZ09wdGlvbnMoLyoqIEB0eXBlIHtQYXJ0aWFsPFNhdmVGaWxlRGlhbG9nT3B0aW9ucz59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2NyZWVuIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNjcmVlbiBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8U2NyZWVuPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBTY3JlZW4uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIklEXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEEgdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiSURcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiTmFtZVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk5hbWVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiU2NhbGVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHNjYWxlIGZhY3RvciBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlNjYWxlXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJYXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIllcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHktY29vcmRpbmF0ZSBvZiB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJZXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIklzUHJpbWFyeVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBXaGV0aGVyIHRoaXMgaXMgdGhlIHByaW1hcnkgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJJc1ByaW1hcnlcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlJvdGF0aW9uXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSByb3RhdGlvbiBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlJvdGF0aW9uXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlNpemVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHNpemUgb2YgdGhlIGRpc3BsYXlcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtTaXplfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiU2l6ZVwiXSA9IChuZXcgU2l6ZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIkJvdW5kc1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYm91bmRzIG9mIHRoZSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7UmVjdH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJvdW5kc1wiXSA9IChuZXcgUmVjdCgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIldvcmtBcmVhXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSB3b3JrIGFyZWEgb2YgdGhlIGRpc3BsYXlcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtSZWN0fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiV29ya0FyZWFcIl0gPSAobmV3IFJlY3QoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNjcmVlbiBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2FueX0gWyQkc291cmNlID0ge31dXG4gICAgICogQHJldHVybnMge1NjcmVlbn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQ3XzAgPSAkJGNyZWF0ZVR5cGU2O1xuICAgICAgICBjb25zdCAkJGNyZWF0ZUZpZWxkOF8wID0gJCRjcmVhdGVUeXBlNztcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDlfMCA9ICQkY3JlYXRlVHlwZTc7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICBpZiAoXCJTaXplXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiU2l6ZVwiXSA9ICQkY3JlYXRlRmllbGQ3XzAoJCRwYXJzZWRTb3VyY2VbXCJTaXplXCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJCb3VuZHNcIiBpbiAkJHBhcnNlZFNvdXJjZSkge1xuICAgICAgICAgICAgJCRwYXJzZWRTb3VyY2VbXCJCb3VuZHNcIl0gPSAkJGNyZWF0ZUZpZWxkOF8wKCQkcGFyc2VkU291cmNlW1wiQm91bmRzXCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJXb3JrQXJlYVwiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIldvcmtBcmVhXCJdID0gJCRjcmVhdGVGaWVsZDlfMCgkJHBhcnNlZFNvdXJjZVtcIldvcmtBcmVhXCJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFNjcmVlbigvKiogQHR5cGUge1BhcnRpYWw8U2NyZWVuPn0gKi8oJCRwYXJzZWRTb3VyY2UpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTaXplIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNpemUgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFNpemU+fSBbJCRzb3VyY2UgPSB7fV0gLSBUaGUgc291cmNlIG9iamVjdCB0byBjcmVhdGUgdGhlIFNpemUuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIldpZHRoXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJXaWR0aFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJIZWlnaHRcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkhlaWdodFwiXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNpemUgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtTaXplfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgU2l6ZSgvKiogQHR5cGUge1BhcnRpYWw8U2l6ZT59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG4vLyBQcml2YXRlIHR5cGUgY3JlYXRpb24gZnVuY3Rpb25zXG5jb25zdCAkJGNyZWF0ZVR5cGUwID0gJENyZWF0ZS5NYXAoJENyZWF0ZS5BbnksICRDcmVhdGUuQW55KTtcbmNvbnN0ICQkY3JlYXRlVHlwZTEgPSBPU0luZm8uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTIgPSBCdXR0b24uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTMgPSAkQ3JlYXRlLkFycmF5KCQkY3JlYXRlVHlwZTIpO1xuY29uc3QgJCRjcmVhdGVUeXBlNCA9IEZpbGVGaWx0ZXIuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTUgPSAkQ3JlYXRlLkFycmF5KCQkY3JlYXRlVHlwZTQpO1xuY29uc3QgJCRjcmVhdGVUeXBlNiA9IFNpemUuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTcgPSBSZWN0LmNyZWF0ZUZyb207XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi9saXN0ZW5lci5qc1wiO1xuXG4vKipcbiAqIEVtaXQgZW1pdHMgYW4gZXZlbnQgdXNpbmcgdGhlIGdpdmVuIGV2ZW50IG9iamVjdC5cbiAqIFlvdSBjYW4gcGFzcyBpbiBpbnN0YW5jZXMgb2YgdGhlIGNsYXNzIGBXYWlsc0V2ZW50YC5cbiAqIEBwYXJhbSB7e1wibmFtZVwiOiBzdHJpbmcsIFwiZGF0YVwiOiBhbnl9fSBldmVudFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbWl0KGV2ZW50KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNDgwNjgyMzkyLCBldmVudCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG4iLCAiXG5leHBvcnQgY29uc3QgRXZlbnRUeXBlcyA9IHtcblx0V2luZG93czoge1xuXHRcdFN5c3RlbVRoZW1lQ2hhbmdlZDogXCJ3aW5kb3dzOlN5c3RlbVRoZW1lQ2hhbmdlZFwiLFxuXHRcdEFQTVBvd2VyU3RhdHVzQ2hhbmdlOiBcIndpbmRvd3M6QVBNUG93ZXJTdGF0dXNDaGFuZ2VcIixcblx0XHRBUE1TdXNwZW5kOiBcIndpbmRvd3M6QVBNU3VzcGVuZFwiLFxuXHRcdEFQTVJlc3VtZUF1dG9tYXRpYzogXCJ3aW5kb3dzOkFQTVJlc3VtZUF1dG9tYXRpY1wiLFxuXHRcdEFQTVJlc3VtZVN1c3BlbmQ6IFwid2luZG93czpBUE1SZXN1bWVTdXNwZW5kXCIsXG5cdFx0QVBNUG93ZXJTZXR0aW5nQ2hhbmdlOiBcIndpbmRvd3M6QVBNUG93ZXJTZXR0aW5nQ2hhbmdlXCIsXG5cdFx0QXBwbGljYXRpb25TdGFydGVkOiBcIndpbmRvd3M6QXBwbGljYXRpb25TdGFydGVkXCIsXG5cdFx0V2ViVmlld05hdmlnYXRpb25Db21wbGV0ZWQ6IFwid2luZG93czpXZWJWaWV3TmF2aWdhdGlvbkNvbXBsZXRlZFwiLFxuXHRcdFdpbmRvd0luYWN0aXZlOiBcIndpbmRvd3M6V2luZG93SW5hY3RpdmVcIixcblx0XHRXaW5kb3dBY3RpdmU6IFwid2luZG93czpXaW5kb3dBY3RpdmVcIixcblx0XHRXaW5kb3dDbGlja0FjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0NsaWNrQWN0aXZlXCIsXG5cdFx0V2luZG93TWF4aW1pc2U6IFwid2luZG93czpXaW5kb3dNYXhpbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWF4aW1pc2U6IFwid2luZG93czpXaW5kb3dVbk1heGltaXNlXCIsXG5cdFx0V2luZG93RnVsbHNjcmVlbjogXCJ3aW5kb3dzOldpbmRvd0Z1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dVbkZ1bGxzY3JlZW46IFwid2luZG93czpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dSZXN0b3JlOiBcIndpbmRvd3M6V2luZG93UmVzdG9yZVwiLFxuXHRcdFdpbmRvd01pbmltaXNlOiBcIndpbmRvd3M6V2luZG93TWluaW1pc2VcIixcblx0XHRXaW5kb3dVbk1pbmltaXNlOiBcIndpbmRvd3M6V2luZG93VW5NaW5pbWlzZVwiLFxuXHRcdFdpbmRvd0Nsb3NlOiBcIndpbmRvd3M6V2luZG93Q2xvc2VcIixcblx0XHRXaW5kb3dTZXRGb2N1czogXCJ3aW5kb3dzOldpbmRvd1NldEZvY3VzXCIsXG5cdFx0V2luZG93S2lsbEZvY3VzOiBcIndpbmRvd3M6V2luZG93S2lsbEZvY3VzXCIsXG5cdFx0V2luZG93RHJhZ0Ryb3A6IFwid2luZG93czpXaW5kb3dEcmFnRHJvcFwiLFxuXHRcdFdpbmRvd0RyYWdFbnRlcjogXCJ3aW5kb3dzOldpbmRvd0RyYWdFbnRlclwiLFxuXHRcdFdpbmRvd0RyYWdMZWF2ZTogXCJ3aW5kb3dzOldpbmRvd0RyYWdMZWF2ZVwiLFxuXHRcdFdpbmRvd0RyYWdPdmVyOiBcIndpbmRvd3M6V2luZG93RHJhZ092ZXJcIixcblx0fSxcblx0TWFjOiB7XG5cdFx0QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQmVjb21lQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllczogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllc1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VJY29uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUljb25cIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZU9jY2x1c2lvblN0YXRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZU9jY2x1c2lvblN0YXRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVNjcmVlblBhcmFtZXRlcnNcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0JhckZyYW1lXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJPcmllbnRhdGlvbjogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJPcmllbnRhdGlvblwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nOiBcIm1hYzpBcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZ1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkSGlkZTogXCJtYWM6QXBwbGljYXRpb25EaWRIaWRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRSZXNpZ25BY3RpdmVOb3RpZmljYXRpb246IFwibWFjOkFwcGxpY2F0aW9uRGlkUmVzaWduQWN0aXZlTm90aWZpY2F0aW9uXCIsXG5cdFx0QXBwbGljYXRpb25EaWRVbmhpZGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVW5oaWRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkVXBkYXRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsQmVjb21lQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxCZWNvbWVBY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxGaW5pc2hMYXVuY2hpbmc6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEZpbmlzaExhdW5jaGluZ1wiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbEhpZGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEhpZGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFJlc2lnbkFjdGl2ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVGVybWluYXRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsVW5oaWRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxVbmhpZGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxVcGRhdGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFVwZGF0ZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlVGhlbWU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlVGhlbWUhXCIsXG5cdFx0QXBwbGljYXRpb25TaG91bGRIYW5kbGVSZW9wZW46IFwibWFjOkFwcGxpY2F0aW9uU2hvdWxkSGFuZGxlUmVvcGVuIVwiLFxuXHRcdFdpbmRvd0RpZEJlY29tZUtleTogXCJtYWM6V2luZG93RGlkQmVjb21lS2V5XCIsXG5cdFx0V2luZG93RGlkQmVjb21lTWFpbjogXCJtYWM6V2luZG93RGlkQmVjb21lTWFpblwiLFxuXHRcdFdpbmRvd0RpZEJlZ2luU2hlZXQ6IFwibWFjOldpbmRvd0RpZEJlZ2luU2hlZXRcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VBbHBoYTogXCJtYWM6V2luZG93RGlkQ2hhbmdlQWxwaGFcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VCYWNraW5nTG9jYXRpb246IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdMb2NhdGlvblwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllc1wiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZU9jY2x1c2lvblN0YXRlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VPY2NsdXNpb25TdGF0ZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuUHJvZmlsZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuUHJvZmlsZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlUHJvcGVydGllczogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VQcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2hhcmluZ1R5cGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNoYXJpbmdUeXBlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU3BhY2VPcmRlcmluZ01vZGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNwYWNlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVGl0bGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVRpdGxlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkQ2hhbmdlVG9vbGJhclwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVZpc2liaWxpdHk6IFwibWFjOldpbmRvd0RpZENoYW5nZVZpc2liaWxpdHlcIixcblx0XHRXaW5kb3dEaWREZW1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dEaWREZW1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93RGlkRW5kU2hlZXQ6IFwibWFjOldpbmRvd0RpZEVuZFNoZWV0XCIsXG5cdFx0V2luZG93RGlkRW50ZXJGdWxsU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRFbnRlckZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRFbnRlclZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dEaWRFbnRlclZlcnNpb25Ccm93c2VyXCIsXG5cdFx0V2luZG93RGlkRXhpdEZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEV4aXRGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkRXhpdFZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dEaWRFeGl0VmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dEaWRFeHBvc2U6IFwibWFjOldpbmRvd0RpZEV4cG9zZVwiLFxuXHRcdFdpbmRvd0RpZEZvY3VzOiBcIm1hYzpXaW5kb3dEaWRGb2N1c1wiLFxuXHRcdFdpbmRvd0RpZE1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dEaWRNaW5pYXR1cml6ZVwiLFxuXHRcdFdpbmRvd0RpZE1vdmU6IFwibWFjOldpbmRvd0RpZE1vdmVcIixcblx0XHRXaW5kb3dEaWRPcmRlck9mZlNjcmVlbjogXCJtYWM6V2luZG93RGlkT3JkZXJPZmZTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRPcmRlck9uU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRPcmRlck9uU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkUmVzaWduS2V5OiBcIm1hYzpXaW5kb3dEaWRSZXNpZ25LZXlcIixcblx0XHRXaW5kb3dEaWRSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dEaWRSZXNpZ25NYWluXCIsXG5cdFx0V2luZG93RGlkUmVzaXplOiBcIm1hYzpXaW5kb3dEaWRSZXNpemVcIixcblx0XHRXaW5kb3dEaWRVcGRhdGU6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZUFscGhhOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVBbHBoYVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXM6IFwibWFjOldpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlU2hhZG93OiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVTaGFkb3dcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVUaXRsZTogXCJtYWM6V2luZG93RGlkVXBkYXRlVGl0bGVcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVUb29sYmFyOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVUb29sYmFyXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlVmlzaWJpbGl0eTogXCJtYWM6V2luZG93RGlkVXBkYXRlVmlzaWJpbGl0eVwiLFxuXHRcdFdpbmRvd1Nob3VsZENsb3NlOiBcIm1hYzpXaW5kb3dTaG91bGRDbG9zZSFcIixcblx0XHRXaW5kb3dXaWxsQmVjb21lS2V5OiBcIm1hYzpXaW5kb3dXaWxsQmVjb21lS2V5XCIsXG5cdFx0V2luZG93V2lsbEJlY29tZU1haW46IFwibWFjOldpbmRvd1dpbGxCZWNvbWVNYWluXCIsXG5cdFx0V2luZG93V2lsbEJlZ2luU2hlZXQ6IFwibWFjOldpbmRvd1dpbGxCZWdpblNoZWV0XCIsXG5cdFx0V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93V2lsbENoYW5nZU9yZGVyaW5nTW9kZVwiLFxuXHRcdFdpbmRvd1dpbGxDbG9zZTogXCJtYWM6V2luZG93V2lsbENsb3NlXCIsXG5cdFx0V2luZG93V2lsbERlbWluaWF0dXJpemU6IFwibWFjOldpbmRvd1dpbGxEZW1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93V2lsbEVudGVyRnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEVudGVyRnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxFbnRlclZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dXaWxsRW50ZXJWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd1dpbGxFeGl0RnVsbFNjcmVlbjogXCJtYWM6V2luZG93V2lsbEV4aXRGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93V2lsbEV4aXRWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd1dpbGxGb2N1czogXCJtYWM6V2luZG93V2lsbEZvY3VzXCIsXG5cdFx0V2luZG93V2lsbE1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dXaWxsTWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dXaWxsTW92ZTogXCJtYWM6V2luZG93V2lsbE1vdmVcIixcblx0XHRXaW5kb3dXaWxsT3JkZXJPZmZTY3JlZW46IFwibWFjOldpbmRvd1dpbGxPcmRlck9mZlNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxPcmRlck9uU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsT3JkZXJPblNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxSZXNpZ25NYWluOiBcIm1hYzpXaW5kb3dXaWxsUmVzaWduTWFpblwiLFxuXHRcdFdpbmRvd1dpbGxSZXNpemU6IFwibWFjOldpbmRvd1dpbGxSZXNpemVcIixcblx0XHRXaW5kb3dXaWxsVW5mb2N1czogXCJtYWM6V2luZG93V2lsbFVuZm9jdXNcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUFscGhhOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQWxwaGFcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlU2hhZG93OiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlU2hhZG93XCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVRpdGxlOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVGl0bGVcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRvb2xiYXJcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVmlzaWJpbGl0eTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVZpc2liaWxpdHlcIixcblx0XHRXaW5kb3dXaWxsVXNlU3RhbmRhcmRGcmFtZTogXCJtYWM6V2luZG93V2lsbFVzZVN0YW5kYXJkRnJhbWVcIixcblx0XHRNZW51V2lsbE9wZW46IFwibWFjOk1lbnVXaWxsT3BlblwiLFxuXHRcdE1lbnVEaWRPcGVuOiBcIm1hYzpNZW51RGlkT3BlblwiLFxuXHRcdE1lbnVEaWRDbG9zZTogXCJtYWM6TWVudURpZENsb3NlXCIsXG5cdFx0TWVudVdpbGxTZW5kQWN0aW9uOiBcIm1hYzpNZW51V2lsbFNlbmRBY3Rpb25cIixcblx0XHRNZW51RGlkU2VuZEFjdGlvbjogXCJtYWM6TWVudURpZFNlbmRBY3Rpb25cIixcblx0XHRNZW51V2lsbEhpZ2hsaWdodEl0ZW06IFwibWFjOk1lbnVXaWxsSGlnaGxpZ2h0SXRlbVwiLFxuXHRcdE1lbnVEaWRIaWdobGlnaHRJdGVtOiBcIm1hYzpNZW51RGlkSGlnaGxpZ2h0SXRlbVwiLFxuXHRcdE1lbnVXaWxsRGlzcGxheUl0ZW06IFwibWFjOk1lbnVXaWxsRGlzcGxheUl0ZW1cIixcblx0XHRNZW51RGlkRGlzcGxheUl0ZW06IFwibWFjOk1lbnVEaWREaXNwbGF5SXRlbVwiLFxuXHRcdE1lbnVXaWxsQWRkSXRlbTogXCJtYWM6TWVudVdpbGxBZGRJdGVtXCIsXG5cdFx0TWVudURpZEFkZEl0ZW06IFwibWFjOk1lbnVEaWRBZGRJdGVtXCIsXG5cdFx0TWVudVdpbGxSZW1vdmVJdGVtOiBcIm1hYzpNZW51V2lsbFJlbW92ZUl0ZW1cIixcblx0XHRNZW51RGlkUmVtb3ZlSXRlbTogXCJtYWM6TWVudURpZFJlbW92ZUl0ZW1cIixcblx0XHRNZW51V2lsbEJlZ2luVHJhY2tpbmc6IFwibWFjOk1lbnVXaWxsQmVnaW5UcmFja2luZ1wiLFxuXHRcdE1lbnVEaWRCZWdpblRyYWNraW5nOiBcIm1hYzpNZW51RGlkQmVnaW5UcmFja2luZ1wiLFxuXHRcdE1lbnVXaWxsRW5kVHJhY2tpbmc6IFwibWFjOk1lbnVXaWxsRW5kVHJhY2tpbmdcIixcblx0XHRNZW51RGlkRW5kVHJhY2tpbmc6IFwibWFjOk1lbnVEaWRFbmRUcmFja2luZ1wiLFxuXHRcdE1lbnVXaWxsVXBkYXRlOiBcIm1hYzpNZW51V2lsbFVwZGF0ZVwiLFxuXHRcdE1lbnVEaWRVcGRhdGU6IFwibWFjOk1lbnVEaWRVcGRhdGVcIixcblx0XHRNZW51V2lsbFBvcFVwOiBcIm1hYzpNZW51V2lsbFBvcFVwXCIsXG5cdFx0TWVudURpZFBvcFVwOiBcIm1hYzpNZW51RGlkUG9wVXBcIixcblx0XHRNZW51V2lsbFNlbmRBY3Rpb25Ub0l0ZW06IFwibWFjOk1lbnVXaWxsU2VuZEFjdGlvblRvSXRlbVwiLFxuXHRcdE1lbnVEaWRTZW5kQWN0aW9uVG9JdGVtOiBcIm1hYzpNZW51RGlkU2VuZEFjdGlvblRvSXRlbVwiLFxuXHRcdFdlYlZpZXdEaWRTdGFydFByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFN0YXJ0UHJvdmlzaW9uYWxOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZFJlY2VpdmVTZXJ2ZXJSZWRpcmVjdEZvclByb3Zpc2lvbmFsTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZFJlY2VpdmVTZXJ2ZXJSZWRpcmVjdEZvclByb3Zpc2lvbmFsTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRGaW5pc2hOYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRDb21taXROYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkQ29tbWl0TmF2aWdhdGlvblwiLFxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ0VudGVyZWQ6IFwibWFjOldpbmRvd0ZpbGVEcmFnZ2luZ0VudGVyZWRcIixcblx0XHRXaW5kb3dGaWxlRHJhZ2dpbmdQZXJmb3JtZWQ6IFwibWFjOldpbmRvd0ZpbGVEcmFnZ2luZ1BlcmZvcm1lZFwiLFxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ0V4aXRlZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nRXhpdGVkXCIsXG5cdH0sXG5cdExpbnV4OiB7XG5cdFx0U3lzdGVtVGhlbWVDaGFuZ2VkOiBcImxpbnV4OlN5c3RlbVRoZW1lQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd0xvYWRDaGFuZ2VkOiBcImxpbnV4OldpbmRvd0xvYWRDaGFuZ2VkXCIsXG5cdFx0V2luZG93RGVsZXRlRXZlbnQ6IFwibGludXg6V2luZG93RGVsZXRlRXZlbnRcIixcblx0XHRXaW5kb3dGb2N1c0luOiBcImxpbnV4OldpbmRvd0ZvY3VzSW5cIixcblx0XHRXaW5kb3dGb2N1c091dDogXCJsaW51eDpXaW5kb3dGb2N1c091dFwiLFxuXHRcdEFwcGxpY2F0aW9uU3RhcnR1cDogXCJsaW51eDpBcHBsaWNhdGlvblN0YXJ0dXBcIixcblx0fSxcblx0Q29tbW9uOiB7XG5cdFx0QXBwbGljYXRpb25TdGFydGVkOiBcImNvbW1vbjpBcHBsaWNhdGlvblN0YXJ0ZWRcIixcblx0XHRXaW5kb3dNYXhpbWlzZTogXCJjb21tb246V2luZG93TWF4aW1pc2VcIixcblx0XHRXaW5kb3dVbk1heGltaXNlOiBcImNvbW1vbjpXaW5kb3dVbk1heGltaXNlXCIsXG5cdFx0V2luZG93RnVsbHNjcmVlbjogXCJjb21tb246V2luZG93RnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd1VuRnVsbHNjcmVlbjogXCJjb21tb246V2luZG93VW5GdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93UmVzdG9yZTogXCJjb21tb246V2luZG93UmVzdG9yZVwiLFxuXHRcdFdpbmRvd01pbmltaXNlOiBcImNvbW1vbjpXaW5kb3dNaW5pbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWluaW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWluaW1pc2VcIixcblx0XHRXaW5kb3dDbG9zaW5nOiBcImNvbW1vbjpXaW5kb3dDbG9zaW5nXCIsXG5cdFx0V2luZG93Wm9vbTogXCJjb21tb246V2luZG93Wm9vbVwiLFxuXHRcdFdpbmRvd1pvb21JbjogXCJjb21tb246V2luZG93Wm9vbUluXCIsXG5cdFx0V2luZG93Wm9vbU91dDogXCJjb21tb246V2luZG93Wm9vbU91dFwiLFxuXHRcdFdpbmRvd1pvb21SZXNldDogXCJjb21tb246V2luZG93Wm9vbVJlc2V0XCIsXG5cdFx0V2luZG93Rm9jdXM6IFwiY29tbW9uOldpbmRvd0ZvY3VzXCIsXG5cdFx0V2luZG93TG9zdEZvY3VzOiBcImNvbW1vbjpXaW5kb3dMb3N0Rm9jdXNcIixcblx0XHRXaW5kb3dTaG93OiBcImNvbW1vbjpXaW5kb3dTaG93XCIsXG5cdFx0V2luZG93SGlkZTogXCJjb21tb246V2luZG93SGlkZVwiLFxuXHRcdFdpbmRvd0RQSUNoYW5nZWQ6IFwiY29tbW9uOldpbmRvd0RQSUNoYW5nZWRcIixcblx0XHRXaW5kb3dGaWxlc0Ryb3BwZWQ6IFwiY29tbW9uOldpbmRvd0ZpbGVzRHJvcHBlZFwiLFxuXHRcdFdpbmRvd1J1bnRpbWVSZWFkeTogXCJjb21tb246V2luZG93UnVudGltZVJlYWR5XCIsXG5cdFx0VGhlbWVDaGFuZ2VkOiBcImNvbW1vbjpUaGVtZUNoYW5nZWRcIixcblx0fSxcbn07XG4iLCAiLy8gQHRzLW5vY2hlY2tcbi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7RXZlbnRUeXBlc30gZnJvbSBcIi4vZXZlbnRfdHlwZXMuanNcIjtcbmV4cG9ydCBjb25zdCBUeXBlcyA9IEV2ZW50VHlwZXM7XG5cbi8vIFNldHVwXG53aW5kb3cuX3dhaWxzID0gd2luZG93Ll93YWlscyB8fCB7fTtcbndpbmRvdy5fd2FpbHMuZGlzcGF0Y2hXYWlsc0V2ZW50ID0gZGlzcGF0Y2hXYWlsc0V2ZW50O1xuXG5jb25zdCBldmVudExpc3RlbmVycyA9IG5ldyBNYXAoKTtcblxuY2xhc3MgTGlzdGVuZXIge1xuICAgIGNvbnN0cnVjdG9yKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcykge1xuICAgICAgICB0aGlzLmV2ZW50TmFtZSA9IGV2ZW50TmFtZTtcbiAgICAgICAgdGhpcy5tYXhDYWxsYmFja3MgPSBtYXhDYWxsYmFja3MgfHwgLTE7XG4gICAgICAgIHRoaXMuQ2FsbGJhY2sgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICBpZiAodGhpcy5tYXhDYWxsYmFja3MgPT09IC0xKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1heENhbGxiYWNrcyAtPSAxO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4Q2FsbGJhY2tzID09PSAwO1xuICAgICAgICB9O1xuICAgIH1cbn1cblxuLyoqXG4gKiBEZXNjcmliZXMgYSBXYWlscyBhcHBsaWNhdGlvbiBldmVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIFdhaWxzRXZlbnQge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgd2FpbHMgZXZlbnQgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHsqfSBbZGF0YV0gLSBBcmJpdHJhcnkgZGF0YSBhc3NvY2lhdGVkIHRvIHRoZSBldmVudC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihuYW1lLCBkYXRhID0gbnVsbCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQXJiaXRyYXJ5IGRhdGEgYXNzb2NpYXRlZCB0byB0aGUgZXZlbnQuXG4gICAgICAgICAqIEB0eXBlIHsqfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoV2FpbHNFdmVudChldmVudCkge1xuICAgIGNvbnN0IHdldmVudCA9IC8qKiBAdHlwZSB7YW55fSAqLyhuZXcgV2FpbHNFdmVudChldmVudC5uYW1lLCBldmVudC5kYXRhKSlcbiAgICBPYmplY3QuYXNzaWduKHdldmVudCwgZXZlbnQpXG4gICAgZXZlbnQgPSB3ZXZlbnQ7XG5cbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50Lm5hbWUpO1xuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgICAgbGV0IHRvUmVtb3ZlID0gbGlzdGVuZXJzLmZpbHRlcihsaXN0ZW5lciA9PiB7XG4gICAgICAgICAgICBsZXQgcmVtb3ZlID0gbGlzdGVuZXIuQ2FsbGJhY2soZXZlbnQpO1xuICAgICAgICAgICAgaWYgKHJlbW92ZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodG9SZW1vdmUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmZpbHRlcihsID0+ICF0b1JlbW92ZS5pbmNsdWRlcyhsKSk7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkgZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50Lm5hbWUpO1xuICAgICAgICAgICAgZWxzZSBldmVudExpc3RlbmVycy5zZXQoZXZlbnQubmFtZSwgbGlzdGVuZXJzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBmb3IgYSBzcGVjaWZpYyBldmVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmb3IuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICogQHBhcmFtIHtudW1iZXJ9IG1heENhbGxiYWNrcyAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiB0aW1lcyB0aGUgY2FsbGJhY2sgY2FuIGJlIGNhbGxlZCBmb3IgdGhlIGV2ZW50LiBPbmNlIHRoZSBtYXhpbXVtIG51bWJlciBpcyByZWFjaGVkLCB0aGUgY2FsbGJhY2sgd2lsbCBubyBsb25nZXIgYmUgY2FsbGVkLlxuICpcbiBAcmV0dXJuIHtmdW5jdGlvbn0gLSBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCBtYXhDYWxsYmFja3MpIHtcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50TmFtZSkgfHwgW107XG4gICAgY29uc3QgdGhpc0xpc3RlbmVyID0gbmV3IExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcyk7XG4gICAgbGlzdGVuZXJzLnB1c2godGhpc0xpc3RlbmVyKTtcbiAgICBldmVudExpc3RlbmVycy5zZXQoZXZlbnROYW1lLCBsaXN0ZW5lcnMpO1xuICAgIHJldHVybiAoKSA9PiBsaXN0ZW5lck9mZih0aGlzTGlzdGVuZXIpO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIHNwZWNpZmllZCBldmVudCBvY2N1cnMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkLiBJdCB0YWtlcyBubyBwYXJhbWV0ZXJzLlxuICogQHJldHVybiB7ZnVuY3Rpb259IC0gQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPbihldmVudE5hbWUsIGNhbGxiYWNrKSB7IHJldHVybiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIC0xKTsgfVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIG9ubHkgb25jZSBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgZXZlbnQgb2NjdXJzLlxuICogQHJldHVybiB7ZnVuY3Rpb259IC0gQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9uY2UoZXZlbnROYW1lLCBjYWxsYmFjaykgeyByZXR1cm4gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCAxKTsgfVxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBsaXN0ZW5lciBmcm9tIHRoZSBldmVudCBsaXN0ZW5lcnMgY29sbGVjdGlvbi5cbiAqIElmIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudCBhcmUgcmVtb3ZlZCwgdGhlIGV2ZW50IGtleSBpcyBkZWxldGVkIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmVyIC0gVGhlIGxpc3RlbmVyIHRvIGJlIHJlbW92ZWQuXG4gKi9cbmZ1bmN0aW9uIGxpc3RlbmVyT2ZmKGxpc3RlbmVyKSB7XG4gICAgY29uc3QgZXZlbnROYW1lID0gbGlzdGVuZXIuZXZlbnROYW1lO1xuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnROYW1lKS5maWx0ZXIobCA9PiBsICE9PSBsaXN0ZW5lcik7XG4gICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDApIGV2ZW50TGlzdGVuZXJzLmRlbGV0ZShldmVudE5hbWUpO1xuICAgIGVsc2UgZXZlbnRMaXN0ZW5lcnMuc2V0KGV2ZW50TmFtZSwgbGlzdGVuZXJzKTtcbn1cblxuXG4vKipcbiAqIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50IG5hbWVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gKiBAcGFyYW0gey4uLnN0cmluZ30gYWRkaXRpb25hbEV2ZW50TmFtZXMgLSBBZGRpdGlvbmFsIGV2ZW50IG5hbWVzIHRvIHJlbW92ZSBsaXN0ZW5lcnMgZm9yLlxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gT2ZmKGV2ZW50TmFtZSwgLi4uYWRkaXRpb25hbEV2ZW50TmFtZXMpIHtcbiAgICBsZXQgZXZlbnRzVG9SZW1vdmUgPSBbZXZlbnROYW1lLCAuLi5hZGRpdGlvbmFsRXZlbnROYW1lc107XG4gICAgZXZlbnRzVG9SZW1vdmUuZm9yRWFjaChldmVudE5hbWUgPT4gZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50TmFtZSkpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAZnVuY3Rpb24gT2ZmQWxsXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9mZkFsbCgpIHsgZXZlbnRMaXN0ZW5lcnMuY2xlYXIoKTsgfVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0ICogZnJvbSBcIi4uL2NvcmUvZmxhZ3MuanNcIjtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQgeyBDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZSB9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmltcG9ydCAqIGFzICRtb2RlbHMgZnJvbSBcIi4vbW9kZWxzLmpzXCI7XG5cbmV4cG9ydCB7U2NyZWVuLCBSZWN0LCBTaXplfSBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuLyoqXG4gKiBHZXRBbGwgcmV0dXJucyBkZXNjcmlwdG9ycyBmb3IgYWxsIHNjcmVlbnMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbltdPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEFsbCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIzNjc3MDU1MzIpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTEoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIEdldEN1cnJlbnQgcmV0dXJucyBhIGRlc2NyaXB0b3IgZm9yIHRoZSBzY3JlZW5cbiAqIHdoZXJlIHRoZSBjdXJyZW50bHkgYWN0aXZlIHdpbmRvdyBpcyBsb2NhdGVkLlxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TY3JlZW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0Q3VycmVudCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMxNjc1NzIxOCk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogR2V0UHJpbWFyeSByZXR1cm5zIGEgZGVzY3JpcHRvciBmb3IgdGhlIHByaW1hcnkgc2NyZWVuLlxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TY3JlZW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0UHJpbWFyeSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM3NDk1NjIwMTcpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTAoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vLyBQcml2YXRlIHR5cGUgY3JlYXRpb24gZnVuY3Rpb25zXG5jb25zdCAkJGNyZWF0ZVR5cGUwID0gJG1vZGVscy5TY3JlZW4uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTEgPSAkQ3JlYXRlLkFycmF5KCQkY3JlYXRlVHlwZTApO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgJG1vZGVscyBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuZXhwb3J0ICogZnJvbSBcIi4uL2NvcmUvc3lzdGVtLmpzXCI7XG5cbi8qKlxuICogRW52aXJvbm1lbnQgcmV0cmlldmVzIGVudmlyb25tZW50IGRldGFpbHMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLkVudmlyb25tZW50SW5mbz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbnZpcm9ubWVudCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM3NTIyNjc5NjgpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTAoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIElzRGFya01vZGUgcmV0cmlldmVzIHN5c3RlbSBkYXJrIG1vZGUgc3RhdHVzLlxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0RhcmtNb2RlKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjI5MTI4MjgzNik7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8vIFByaXZhdGUgdHlwZSBjcmVhdGlvbiBmdW5jdGlvbnNcbmNvbnN0ICQkY3JlYXRlVHlwZTAgPSAkbW9kZWxzLkVudmlyb25tZW50SW5mby5jcmVhdGVGcm9tO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgJG1vZGVscyBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuZXhwb3J0IHtSR0JBfSBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuaW1wb3J0ICogYXMgc2VsZiBmcm9tIFwiLi9XaW5kb3cuanNcIjtcbmltcG9ydCAqIGFzIGJ5TmFtZSBmcm9tIFwiLi93aW5kb3dCeU5hbWUuanNcIjtcblxuLyoqXG4gKiBSZXR1cm5zIGEgd2luZG93IG9iamVjdCBmb3IgdGhlIGdpdmVuIHdpbmRvdyBuYW1lLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm5zIHsgeyByZWFkb25seSBbTWV0aG9kIGluIGtleW9mICh0eXBlb2Ygc2VsZikgYXMgRXhjbHVkZTxNZXRob2QsIFwiR2V0XCI+XTogKHR5cGVvZiBzZWxmKVtNZXRob2RdIH0gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0KG5hbWUpIHtcbiAgICBsZXQgZ2V0TWV0aG9kID0gKGtleSkgPT4gYnlOYW1lW2tleV0uYmluZChudWxsLCBuYW1lKTtcbiAgICBpZiAobmFtZSA9PT0gXCJcIikgeyBnZXRNZXRob2QgPSAoa2V5KSA9PiBzZWxmW2tleV07IH07XG4gICAgY29uc3Qgd25kID0ge307XG4gICAgZm9yIChjb25zdCBtZXRob2QgaW4gc2VsZikge1xuICAgICAgICBpZiAobWV0aG9kICE9PSBcIkdldFwiICYmIG1ldGhvZCAhPT0gXCJSR0JBXCIpIHtcbiAgICAgICAgICAgIHduZFttZXRob2RdID0gZ2V0TWV0aG9kKG1ldGhvZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLyhPYmplY3QuZnJlZXplKHduZCkpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGFic29sdXRlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuUG9zaXRpb24+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQWJzb2x1dGVQb3NpdGlvbigpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIyMjU1MzgyNik7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogQ2VudGVycyB0aGUgd2luZG93IG9uIHRoZSBzY3JlZW4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENlbnRlcigpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQwNTQ0MzAzNjkpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDbG9zZSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE0MzY1ODExMDApO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIERpc2FibGVzIG1pbi9tYXggc2l6ZSBjb25zdHJhaW50cy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRGlzYWJsZVNpemVDb25zdHJhaW50cygpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI1MTA1Mzk4OTEpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgbWluL21heCBzaXplIGNvbnN0cmFpbnRzLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbmFibGVTaXplQ29uc3RyYWludHMoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMTUwOTY4MTk0KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBGb2N1c2VzIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZvY3VzKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzI3NDc4OTg3Mik7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRm9yY2VzIHRoZSB3aW5kb3cgdG8gcmVsb2FkIHRoZSBwYWdlIGFzc2V0cy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9yY2VSZWxvYWQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNDc1MjMyNTApO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFN3aXRjaGVzIHRoZSB3aW5kb3cgdG8gZnVsbHNjcmVlbiBtb2RlLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGdWxsc2NyZWVuKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzkyNDU2NDQ3Myk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgZm91ciB3aW5kb3cgYm9yZGVycy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuTFJUQj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRCb3JkZXJTaXplcygpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIyOTA5NTMwODgpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTEoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNjcmVlbiB0aGF0IHRoZSB3aW5kb3cgaXMgb24uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRTY3JlZW4oKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNzQ0NTk3NDI0KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUyKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50IHpvb20gbGV2ZWwgb2YgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRab29tKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjY3NzM1OTA2Myk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSGVpZ2h0KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNTg3MTU3NjAzKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBIaWRlcyB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIaWRlKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzg3NDA5MzQ2NCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgZm9jdXNlZC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNGb2N1c2VkKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNTI2ODE5NzIxKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmdWxsc2NyZWVuLlxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0Z1bGxzY3JlZW4oKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMTkyOTE2NzA1KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBtYXhpbWlzZWQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWF4aW1pc2VkKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzAzNjMyNzgwOSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWluaW1pc2VkLlxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc01pbmltaXNlZCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQwMTIyODE4MzUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNYXhpbWlzZSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM3NTkwMDc3OTkpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE1pbmltaXNlcyB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNaW5pbWlzZSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM1NDg1MjA1MDEpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG5hbWUgb2YgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOYW1lKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDIwNzY1NzA1MSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogT3BlbnMgdGhlIGRldmVsb3BtZW50IHRvb2xzIHBhbmUuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9wZW5EZXZUb29scygpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQ4MzY3MTk3NCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcmVsYXRpdmUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdyB0byB0aGUgc2NyZWVuLlxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5Qb3NpdGlvbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGl2ZVBvc2l0aW9uKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzcwOTU0NTkyMyk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVsb2FkcyBwYWdlIGFzc2V0cy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gUmVsb2FkKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjgzMzczMTQ4NSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgcmVzaXphYmxlLlxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXNpemFibGUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNDUwOTQ2Mjc3KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXN0b3JlcyB0aGUgd2luZG93IHRvIGl0cyBwcmV2aW91cyBzdGF0ZSBpZiBpdCB3YXMgcHJldmlvdXNseSBtaW5pbWlzZWQsIG1heGltaXNlZCBvciBmdWxsc2NyZWVuLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXN0b3JlKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTE1MTMxNTAzNCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdyB0byB0aGUgc2NyZWVuLlxuICogQHBhcmFtIHtudW1iZXJ9IHhcbiAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEFic29sdXRlUG9zaXRpb24oeCwgeSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzk5MTQ5MTg0MiwgeCwgeSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgd2luZG93IHRvIGJlIGFsd2F5cyBvbiB0b3AuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGFvdFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRBbHdheXNPblRvcChhb3QpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMzNDkzNDYxNTUsIGFvdCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgYmFja2dyb3VuZCBjb2xvdXIgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7JG1vZGVscy5SR0JBfSBjb2xvdXJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0QmFja2dyb3VuZENvbG91cihjb2xvdXIpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIxNzk4MjA1NzYsIGNvbG91cik7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgd2luZG93IGZyYW1lIGFuZCB0aXRsZSBiYXIuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGZyYW1lbGVzc1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRGcmFtZWxlc3MoZnJhbWVsZXNzKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MTA5MzY1MDgwLCBmcmFtZWxlc3MpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgb3IgZGlzYWJsZXMgdGhlIHN5c3RlbSBmdWxsc2NyZWVuIGJ1dHRvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlZFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZChlbmFibGVkKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODYzNTY4OTgyLCBlbmFibGVkKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBtYXhpbXVtIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRNYXhTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM0NjAwNzg1NTEsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1pbmltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldE1pblNpemUod2lkdGgsIGhlaWdodCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjY3NzkxOTA4NSwgd2lkdGgsIGhlaWdodCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgcmVsYXRpdmUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdyB0byB0aGUgc2NyZWVuLlxuICogQHBhcmFtIHtudW1iZXJ9IHhcbiAqIEBwYXJhbSB7bnVtYmVyfSB5XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFJlbGF0aXZlUG9zaXRpb24oeCwgeSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNzQxNjA2MTE1LCB4LCB5KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHdoZXRoZXIgdGhlIHdpbmRvdyBpcyByZXNpemFibGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHJlc2l6YWJsZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZXNpemFibGUocmVzaXphYmxlKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyODM1MzA1NTQxLCByZXNpemFibGUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRTaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMzNzk3ODgzOTMsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHRpdGxlIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0VGl0bGUodGl0bGUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE3MDk1MzU5OCwgdGl0bGUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBtYWduaWZpY2F0aW9uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFpvb20obWFnbmlmaWNhdGlvbikge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjc5NDUwMDA1MSwgbWFnbmlmaWNhdGlvbik7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2hvd3MgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2hvdygpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI5MzE4MjMxMjEpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuU2l6ZT4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTaXplKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTE0MTExMTQzMyk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMygkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogVG9nZ2xlcyB0aGUgd2luZG93IGJldHdlZW4gZnVsbHNjcmVlbiBhbmQgbm9ybWFsLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVGdWxsc2NyZWVuKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjIxMjc2MzE0OSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVG9nZ2xlcyB0aGUgd2luZG93IGJldHdlZW4gbWF4aW1pc2VkIGFuZCBub3JtYWwuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRvZ2dsZU1heGltaXNlKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzE0NDE5NDQ0Myk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVW4tZnVsbHNjcmVlbnMgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5GdWxsc2NyZWVuKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTU4NzAwMjUwNik7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVW4tbWF4aW1pc2VzIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWF4aW1pc2UoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODg5OTk5NDc2KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBVbi1taW5pbWlzZXMgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVW5NaW5pbWlzZSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM1NzE2MzYxOTgpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gV2lkdGgoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNjU1MjM5OTg4KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBab29tcyB0aGUgd2luZG93LlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNTU1NzE5OTIzKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBJbmNyZWFzZXMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdlYnZpZXcgY29udGVudC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbUluKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTMxMDQzNDI3Mik7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRGVjcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvb21PdXQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNzU1NzAyODIxKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXNldHMgdGhlIHpvb20gbGV2ZWwgb2YgdGhlIHdlYnZpZXcgY29udGVudC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbVJlc2V0KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjc4MTQ2NzE1NCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8vIFByaXZhdGUgdHlwZSBjcmVhdGlvbiBmdW5jdGlvbnNcbmNvbnN0ICQkY3JlYXRlVHlwZTAgPSAkbW9kZWxzLlBvc2l0aW9uLmNyZWF0ZUZyb207XG5jb25zdCAkJGNyZWF0ZVR5cGUxID0gJG1vZGVscy5MUlRCLmNyZWF0ZUZyb207XG5jb25zdCAkJGNyZWF0ZVR5cGUyID0gJG1vZGVscy5TY3JlZW4uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTMgPSAkbW9kZWxzLlNpemUuY3JlYXRlRnJvbTtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQgeyBDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZSB9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmltcG9ydCAqIGFzICRtb2RlbHMgZnJvbSBcIi4vbW9kZWxzLmpzXCI7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdyB0byB0aGUgc2NyZWVuLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuUG9zaXRpb24+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQWJzb2x1dGVQb3NpdGlvbih3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg2ODE4MzI5ODAsIHduZE5hbWUpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTAoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIENlbnRlcnMgdGhlIHdpbmRvdyBvbiB0aGUgc2NyZWVuLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQ2VudGVyKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQ4MjMxMjc3OSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDbG9zZSh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMTkxNTIwMzU0LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBEaXNhYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDEzOTUwNzc3ODEsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgbWluL21heCBzaXplIGNvbnN0cmFpbnRzLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRW5hYmxlU2l6ZUNvbnN0cmFpbnRzKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI1NTMzMjA5MjAsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEZvY3VzZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZvY3VzKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI2MDkyMjA1ODYsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEZvcmNlcyB0aGUgd2luZG93IHRvIHJlbG9hZCB0aGUgcGFnZSBhc3NldHMuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGb3JjZVJlbG9hZCh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg3MTU3NDYyNjAsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFN3aXRjaGVzIHRoZSB3aW5kb3cgdG8gZnVsbHNjcmVlbiBtb2RlLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnVsbHNjcmVlbih3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg2MzYwMTY5OSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgZm91ciB3aW5kb3cgYm9yZGVycy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLkxSVEI+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0Qm9yZGVyU2l6ZXMod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDYxMjY0MzM0LCB3bmROYW1lKTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUxKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzY3JlZW4gdGhhdCB0aGUgd2luZG93IGlzIG9uLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuU2NyZWVuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldFNjcmVlbih3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg1NjQxNzM5ODIsIHduZE5hbWUpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTIoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRab29tKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDY0MjY5MTI0MSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8bnVtYmVyPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEhlaWdodCh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMTM5Njk0NTMsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEhpZGVzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIaWRlKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIwMjk1MTY4Niwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgZm9jdXNlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRm9jdXNlZCh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNTk0Nzk0Mzk5LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmdWxsc2NyZWVuLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNGdWxsc2NyZWVuKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDk2NjM0MzgzOSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWF4aW1pc2VkLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNYXhpbWlzZWQod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDE5OTY5MTUxNSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWluaW1pc2VkLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNaW5pbWlzZWQod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzg1OTYxMDM2OSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogTWF4aW1pc2VzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNYXhpbWlzZSh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg4MDUyODUyNDksIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE1pbmltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gTWluaW1pc2Uod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNzM0NzEwMDU5LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE5hbWUod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzYxNzM3OTg5LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBPcGVucyB0aGUgZGV2ZWxvcG1lbnQgdG9vbHMgcGFuZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9wZW5EZXZUb29scyh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMTkzODQ3NDc2LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5Qb3NpdGlvbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGl2ZVBvc2l0aW9uKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQwOTQxNDA4NTcsIHduZE5hbWUpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTAoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIFJlbG9hZHMgcGFnZSBhc3NldHMuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxvYWQod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzg3OTI3MzA1MSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgcmVzaXphYmxlLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gUmVzaXphYmxlKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI4NTYyMzg1MzUsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJlc3RvcmVzIHRoZSB3aW5kb3cgdG8gaXRzIHByZXZpb3VzIHN0YXRlIGlmIGl0IHdhcyBwcmV2aW91c2x5IG1pbmltaXNlZCwgbWF4aW1pc2VkIG9yIGZ1bGxzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXN0b3JlKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE2NjI2MTg3Niwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIHdpbmRvdyB0byB0aGUgc2NyZWVuLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gKiBAcGFyYW0ge251bWJlcn0geVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRBYnNvbHV0ZVBvc2l0aW9uKHduZE5hbWUsIHgsIHkpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI1ODY4MjA3OTYsIHduZE5hbWUsIHgsIHkpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHdpbmRvdyB0byBiZSBhbHdheXMgb24gdG9wLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYW90XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEFsd2F5c09uVG9wKHduZE5hbWUsIGFvdCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzgzMjI0OTg1Nywgd25kTmFtZSwgYW90KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBiYWNrZ3JvdW5kIGNvbG91ciBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEBwYXJhbSB7JG1vZGVscy5SR0JBfSBjb2xvdXJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0QmFja2dyb3VuZENvbG91cih3bmROYW1lLCBjb2xvdXIpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE0MzA0NTM5NDYsIHduZE5hbWUsIGNvbG91cik7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgd2luZG93IGZyYW1lIGFuZCB0aXRsZSBiYXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtib29sZWFufSBmcmFtZWxlc3NcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnJhbWVsZXNzKHduZE5hbWUsIGZyYW1lbGVzcykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc3NDk3NjEzMCwgd25kTmFtZSwgZnJhbWVsZXNzKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBzeXN0ZW0gZnVsbHNjcmVlbiBidXR0b24uXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEZ1bGxzY3JlZW5CdXR0b25FbmFibGVkKHduZE5hbWUsIGVuYWJsZWQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM5NDAxNzM3MDQsIHduZE5hbWUsIGVuYWJsZWQpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1heGltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRNYXhTaXplKHduZE5hbWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM2NjEyMTc1NTMsIHduZE5hbWUsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1pbmltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRNaW5TaXplKHduZE5hbWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM5ODc2Njc5NTUsIHduZE5hbWUsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVsYXRpdmVQb3NpdGlvbih3bmROYW1lLCB4LCB5KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxODQxNTkwNDY1LCB3bmROYW1lLCB4LCB5KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHdoZXRoZXIgdGhlIHdpbmRvdyBpcyByZXNpemFibGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtib29sZWFufSByZXNpemFibGVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVzaXphYmxlKHduZE5hbWUsIHJlc2l6YWJsZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzA3Mzk3MTEsIHduZE5hbWUsIHJlc2l6YWJsZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRTaXplKHduZE5hbWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIzODA0MTUwMzksIHduZE5hbWUsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIHRpdGxlIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRpdGxlKHduZE5hbWUsIHRpdGxlKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg2NDIxMTMwNDgsIHduZE5hbWUsIHRpdGxlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHBhcmFtIHtudW1iZXJ9IG1hZ25pZmljYXRpb25cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0Wm9vbSh3bmROYW1lLCBtYWduaWZpY2F0aW9uKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMDUzOTgzNDg1LCB3bmROYW1lLCBtYWduaWZpY2F0aW9uKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTaG93cyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2hvdyh3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNTMyNTczMDM1LCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TaXplPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNpemUod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTk0ODMxMjQ4Nywgd25kTmFtZSk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMygkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogVG9nZ2xlcyB0aGUgd2luZG93IGJldHdlZW4gZnVsbHNjcmVlbiBhbmQgbm9ybWFsLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVG9nZ2xlRnVsbHNjcmVlbih3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMzMxNjU5NDcsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIG1heGltaXNlZCBhbmQgbm9ybWFsLlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gVG9nZ2xlTWF4aW1pc2Uod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzA5ODIxNjUwNSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVW4tZnVsbHNjcmVlbnMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuRnVsbHNjcmVlbih3bmROYW1lKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMzIxNTI1ODgwLCB3bmROYW1lKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBVbi1tYXhpbWlzZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3bmROYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWF4aW1pc2Uod25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDE3ODExNDQyNiwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVW4tbWluaW1pc2VzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBVbk1pbmltaXNlKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE2MzcwNDQxNjAsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8bnVtYmVyPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFdpZHRoKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDEzNjEzNTUzNDYsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFpvb21zIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tKHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDg5NTMwOTk4OSwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogSW5jcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tSW4od25kTmFtZSkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjEzOTI2MzMyNiwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRGVjcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gd25kTmFtZVxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tT3V0KHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQxNDgzMjQxMjcsIHduZE5hbWUpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJlc2V0cyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2VidmlldyBjb250ZW50LlxuICogQHBhcmFtIHtzdHJpbmd9IHduZE5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbVJlc2V0KHduZE5hbWUpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDY4ODMwNTI4MCwgd25kTmFtZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8vIFByaXZhdGUgdHlwZSBjcmVhdGlvbiBmdW5jdGlvbnNcbmNvbnN0ICQkY3JlYXRlVHlwZTAgPSAkbW9kZWxzLlBvc2l0aW9uLmNyZWF0ZUZyb207XG5jb25zdCAkJGNyZWF0ZVR5cGUxID0gJG1vZGVscy5MUlRCLmNyZWF0ZUZyb207XG5jb25zdCAkJGNyZWF0ZVR5cGUyID0gJG1vZGVscy5TY3JlZW4uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTMgPSAkbW9kZWxzLlNpemUuY3JlYXRlRnJvbTtcbiIsICIvLyBAdHMtbm9jaGVja1xuLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHtPcGVuVVJMfSBmcm9tIFwiLi9Ccm93c2VyLmpzXCI7XG5pbXBvcnQge1F1ZXN0aW9ufSBmcm9tIFwiLi9EaWFsb2dzLmpzXCI7XG5pbXBvcnQge0VtaXQsIFdhaWxzRXZlbnR9IGZyb20gXCIuL0V2ZW50cy5qc1wiO1xuaW1wb3J0IHtjYW5BYm9ydExpc3RlbmVycywgd2hlblJlYWR5fSBmcm9tIFwiLi91dGlscy5qc1wiO1xuaW1wb3J0ICogYXMgV2luZG93IGZyb20gXCIuL1dpbmRvdy5qc1wiO1xuXG4vKipcbiAqIFNlbmRzIGFuIGV2ZW50IHdpdGggdGhlIGdpdmVuIG5hbWUgYW5kIG9wdGlvbmFsIGRhdGEuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byBzZW5kLlxuICogQHBhcmFtIHthbnl9IFtkYXRhPW51bGxdIC0gT3B0aW9uYWwgZGF0YSB0byBzZW5kIGFsb25nIHdpdGggdGhlIGV2ZW50LlxuICpcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBzZW5kRXZlbnQoZXZlbnROYW1lLCBkYXRhPW51bGwpIHtcbiAgICBFbWl0KG5ldyBXYWlsc0V2ZW50KGV2ZW50TmFtZSwgZGF0YSkpO1xufVxuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9uIGEgc3BlY2lmaWVkIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdyB0byBjYWxsIHRoZSBtZXRob2Qgb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gY2FsbC5cbiAqL1xuZnVuY3Rpb24gY2FsbFdpbmRvd01ldGhvZCh3aW5kb3dOYW1lLCBtZXRob2ROYW1lKSB7XG4gICAgY29uc3QgdGFyZ2V0V2luZG93ID0gV2luZG93LkdldCh3aW5kb3dOYW1lKTtcbiAgICBjb25zdCBtZXRob2QgPSB0YXJnZXRXaW5kb3dbbWV0aG9kTmFtZV07XG5cbiAgICBpZiAodHlwZW9mIG1ldGhvZCAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFdpbmRvdyBtZXRob2QgJyR7bWV0aG9kTmFtZX0nIG5vdCBmb3VuZGApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgICAgbWV0aG9kLmNhbGwodGFyZ2V0V2luZG93KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGNhbGxpbmcgd2luZG93IG1ldGhvZCAnJHttZXRob2ROYW1lfSc6IGAsIGUpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXNwb25kcyB0byBhIHRyaWdnZXJpbmcgZXZlbnQgYnkgcnVubmluZyBhcHByb3ByaWF0ZSBXTUwgYWN0aW9ucyBmb3IgdGhlIGN1cnJlbnQgdGFyZ2V0XG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBvbldNTFRyaWdnZXJlZChldikge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBldi5jdXJyZW50VGFyZ2V0O1xuXG4gICAgZnVuY3Rpb24gcnVuRWZmZWN0KGNob2ljZSA9IFwiWWVzXCIpIHtcbiAgICAgICAgaWYgKGNob2ljZSAhPT0gXCJZZXNcIilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zdCBldmVudFR5cGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLWV2ZW50Jyk7XG4gICAgICAgIGNvbnN0IHRhcmdldFdpbmRvdyA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdGFyZ2V0LXdpbmRvdycpIHx8IFwiXCI7XG4gICAgICAgIGNvbnN0IHdpbmRvd01ldGhvZCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtd2luZG93Jyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtb3BlbnVybCcpO1xuXG4gICAgICAgIGlmIChldmVudFR5cGUgIT09IG51bGwpXG4gICAgICAgICAgICBzZW5kRXZlbnQoZXZlbnRUeXBlKTtcbiAgICAgICAgaWYgKHdpbmRvd01ldGhvZCAhPT0gbnVsbClcbiAgICAgICAgICAgIGNhbGxXaW5kb3dNZXRob2QodGFyZ2V0V2luZG93LCB3aW5kb3dNZXRob2QpO1xuICAgICAgICBpZiAodXJsICE9PSBudWxsKVxuICAgICAgICAgICAgdm9pZCBPcGVuVVJMKHVybCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlybSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtY29uZmlybScpO1xuXG4gICAgaWYgKGNvbmZpcm0pIHtcbiAgICAgICAgUXVlc3Rpb24oe1xuICAgICAgICAgICAgVGl0bGU6IFwiQ29uZmlybVwiLFxuICAgICAgICAgICAgTWVzc2FnZTogY29uZmlybSxcbiAgICAgICAgICAgIERldGFjaGVkOiBmYWxzZSxcbiAgICAgICAgICAgIEJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICB7IExhYmVsOiBcIlllc1wiIH0sXG4gICAgICAgICAgICAgICAgeyBMYWJlbDogXCJOb1wiLCBJc0RlZmF1bHQ6IHRydWUgfVxuICAgICAgICAgICAgXVxuICAgICAgICB9KS50aGVuKHJ1bkVmZmVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcnVuRWZmZWN0KCk7XG4gICAgfVxufVxuXG4vKipcbiAqIEB0eXBlIHtzeW1ib2x9XG4gKi9cbmNvbnN0IGNvbnRyb2xsZXIgPSBTeW1ib2woKTtcblxuLyoqXG4gKiBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSBkb2VzIG5vdCBhY3R1YWxseSByZW1lbWJlciBhY3RpdmUgZXZlbnQgbGlzdGVuZXJzOiBpbnN0ZWFkXG4gKiBpdCB0aWVzIHRoZW0gdG8gYW4gQWJvcnRTaWduYWwgYW5kIHVzZXMgYW4gQWJvcnRDb250cm9sbGVyIHRvIHJlbW92ZSB0aGVtIGFsbCBhdCBvbmNlLlxuICovXG5jbGFzcyBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTdG9yZXMgdGhlIEFib3J0Q29udHJvbGxlciB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlbW92ZSBhbGwgY3VycmVudGx5IGFjdGl2ZSBsaXN0ZW5lcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBuYW1lIHtAbGluayBjb250cm9sbGVyfVxuICAgICAgICAgKiBAbWVtYmVyIHtBYm9ydENvbnRyb2xsZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzW2NvbnRyb2xsZXJdID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb3B0aW9ucyBvYmplY3QgZm9yIGFkZEV2ZW50TGlzdGVuZXIgdGhhdCB0aWVzIHRoZSBsaXN0ZW5lclxuICAgICAqIHRvIHRoZSBBYm9ydFNpZ25hbCBmcm9tIHRoZSBjdXJyZW50IEFib3J0Q29udHJvbGxlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgQW4gSFRNTCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdHJpZ2dlcnMgVGhlIGxpc3Qgb2YgYWN0aXZlIFdNTCB0cmlnZ2VyIGV2ZW50cyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50c1xuICAgICAqIEByZXR1cm5zIHtBZGRFdmVudExpc3RlbmVyT3B0aW9uc31cbiAgICAgKi9cbiAgICBzZXQoZWxlbWVudCwgdHJpZ2dlcnMpIHtcbiAgICAgICAgcmV0dXJuIHsgc2lnbmFsOiB0aGlzW2NvbnRyb2xsZXJdLnNpZ25hbCB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3ZvaWR9XG4gICAgICovXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXNbY29udHJvbGxlcl0uYWJvcnQoKTtcbiAgICAgICAgdGhpc1tjb250cm9sbGVyXSA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB9XG59XG5cbi8qKlxuICogQHR5cGUge3N5bWJvbH1cbiAqL1xuY29uc3QgdHJpZ2dlck1hcCA9IFN5bWJvbCgpO1xuXG4vKipcbiAqIEB0eXBlIHtzeW1ib2x9XG4gKi9cbmNvbnN0IGVsZW1lbnRDb3VudCA9IFN5bWJvbCgpO1xuXG4vKipcbiAqIFdlYWtNYXBSZWdpc3RyeSBtYXBzIGFjdGl2ZSB0cmlnZ2VyIGV2ZW50cyB0byBlYWNoIERPTSBlbGVtZW50IHRocm91Z2ggYSBXZWFrTWFwLlxuICogVGhpcyBlbnN1cmVzIHRoYXQgdGhlIG1hcHBpbmcgcmVtYWlucyBwcml2YXRlIHRvIHRoaXMgbW9kdWxlLCB3aGlsZSBzdGlsbCBhbGxvd2luZyBnYXJiYWdlXG4gKiBjb2xsZWN0aW9uIG9mIHRoZSBpbnZvbHZlZCBlbGVtZW50cy5cbiAqL1xuY2xhc3MgV2Vha01hcFJlZ2lzdHJ5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0b3JlcyB0aGUgY3VycmVudCBlbGVtZW50LXRvLXRyaWdnZXIgbWFwcGluZy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG5hbWUge0BsaW5rIHRyaWdnZXJNYXB9XG4gICAgICAgICAqIEBtZW1iZXIge1dlYWtNYXA8SFRNTEVsZW1lbnQsIHN0cmluZ1tdPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcF0gPSBuZXcgV2Vha01hcCgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb3VudHMgdGhlIG51bWJlciBvZiBlbGVtZW50cyB3aXRoIGFjdGl2ZSBXTUwgdHJpZ2dlcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBuYW1lIHtAbGluayBlbGVtZW50Q291bnR9XG4gICAgICAgICAqIEBtZW1iZXIge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbZWxlbWVudENvdW50XSA9IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYWN0aXZlIHRyaWdnZXJzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IEFuIEhUTUwgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHRyaWdnZXJzIFRoZSBsaXN0IG9mIGFjdGl2ZSBXTUwgdHJpZ2dlciBldmVudHMgZm9yIHRoZSBzcGVjaWZpZWQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtBZGRFdmVudExpc3RlbmVyT3B0aW9uc31cbiAgICAgKi9cbiAgICBzZXQoZWxlbWVudCwgdHJpZ2dlcnMpIHtcbiAgICAgICAgdGhpc1tlbGVtZW50Q291bnRdICs9ICF0aGlzW3RyaWdnZXJNYXBdLmhhcyhlbGVtZW50KTtcbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwXS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgaWYgKHRoaXNbZWxlbWVudENvdW50XSA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSkge1xuICAgICAgICAgICAgaWYgKHRoaXNbZWxlbWVudENvdW50XSA8PSAwKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjb25zdCB0cmlnZ2VycyA9IHRoaXNbdHJpZ2dlck1hcF0uZ2V0KGVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpc1tlbGVtZW50Q291bnRdIC09ICh0eXBlb2YgdHJpZ2dlcnMgIT09IFwidW5kZWZpbmVkXCIpO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdHJpZ2dlcnMgfHwgW10pXG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHRyaWdnZXIsIG9uV01MVHJpZ2dlcmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXNbdHJpZ2dlck1hcF0gPSBuZXcgV2Vha01hcCgpO1xuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudF0gPSAwO1xuICAgIH1cbn1cblxuY29uc3QgdHJpZ2dlclJlZ2lzdHJ5ID0gY2FuQWJvcnRMaXN0ZW5lcnMoKSA/IG5ldyBBYm9ydENvbnRyb2xsZXJSZWdpc3RyeSgpIDogbmV3IFdlYWtNYXBSZWdpc3RyeSgpO1xuXG4vKipcbiAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gYWRkV01MTGlzdGVuZXJzKGVsZW1lbnQpIHtcbiAgICBjb25zdCB0cmlnZ2VyUmVnRXhwID0gL1xcUysvZztcbiAgICBjb25zdCB0cmlnZ2VyQXR0ciA9IChlbGVtZW50LmdldEF0dHJpYnV0ZSgnd21sLXRyaWdnZXInKSB8fCBcImNsaWNrXCIpO1xuICAgIGNvbnN0IHRyaWdnZXJzID0gW107XG5cbiAgICBsZXQgbWF0Y2g7XG4gICAgd2hpbGUgKChtYXRjaCA9IHRyaWdnZXJSZWdFeHAuZXhlYyh0cmlnZ2VyQXR0cikpICE9PSBudWxsKVxuICAgICAgICB0cmlnZ2Vycy5wdXNoKG1hdGNoWzBdKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0cmlnZ2VyUmVnaXN0cnkuc2V0KGVsZW1lbnQsIHRyaWdnZXJzKTtcbiAgICBmb3IgKGNvbnN0IHRyaWdnZXIgb2YgdHJpZ2dlcnMpXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0cmlnZ2VyLCBvbldNTFRyaWdnZXJlZCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogU2NoZWR1bGVzIGFuIGF1dG9tYXRpYyByZWxvYWQgb2YgV01MIHRvIGJlIHBlcmZvcm1lZCBhcyBzb29uIGFzIHRoZSBkb2N1bWVudCBpcyBmdWxseSBsb2FkZWQuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFbmFibGUoKSB7XG4gICAgd2hlblJlYWR5KFJlbG9hZCk7XG59XG5cbi8qKlxuICogUmVsb2FkcyB0aGUgV01MIHBhZ2UgYnkgYWRkaW5nIG5lY2Vzc2FyeSBldmVudCBsaXN0ZW5lcnMgYW5kIGJyb3dzZXIgbGlzdGVuZXJzLlxuICpcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gUmVsb2FkKCkge1xuICAgIHRyaWdnZXJSZWdpc3RyeS5yZXNldCgpO1xuICAgIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnW3dtbC1ldmVudF0sIFt3bWwtd2luZG93XSwgW3dtbC1vcGVudXJsXScpLmZvckVhY2goYWRkV01MTGlzdGVuZXJzKTtcbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8qXG4gXyAgICAgX18gICAgIF8gX19cbnwgfCAgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBicm93c2VyIHN1cHBvcnRzIHJlbW92aW5nIGxpc3RlbmVycyBieSB0cmlnZ2VyaW5nIGFuIEFib3J0U2lnbmFsXG4gKiAoc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FdmVudFRhcmdldC9hZGRFdmVudExpc3RlbmVyI3NpZ25hbClcbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FuQWJvcnRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKCFFdmVudFRhcmdldCB8fCAhQWJvcnRTaWduYWwgfHwgIUFib3J0Q29udHJvbGxlcilcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgbGV0IHJlc3VsdCA9IHRydWU7XG5cbiAgICBjb25zdCB0YXJnZXQgPSBuZXcgRXZlbnRUYXJnZXQoKTtcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgKCkgPT4geyByZXN1bHQgPSBmYWxzZTsgfSwgeyBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsIH0pO1xuICAgIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3Rlc3QnKSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKioqXG4gVGhpcyB0ZWNobmlxdWUgZm9yIHByb3BlciBsb2FkIGRldGVjdGlvbiBpcyB0YWtlbiBmcm9tIEhUTVg6XG5cbiBCU0QgMi1DbGF1c2UgTGljZW5zZVxuXG4gQ29weXJpZ2h0IChjKSAyMDIwLCBCaWcgU2t5IFNvZnR3YXJlXG4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cblxuIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuXG4gMS4gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG5cbiAyLiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvblxuIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuXG4gVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCJcbiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBIT0xERVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRVxuIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMXG4gREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1JcbiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUlxuIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksXG4gT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuXG4gKioqL1xuXG5sZXQgaXNSZWFkeSA9IGZhbHNlO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IGlzUmVhZHkgPSB0cnVlKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHdoZW5SZWFkeShjYWxsYmFjaykge1xuICAgIGlmIChpc1JlYWR5IHx8IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgY2FsbGJhY2spO1xuICAgIH1cbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5leHBvcnQgKiBmcm9tIFwiLi4vLi4vLi4vLi4vcGtnL3J1bnRpbWUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgcnVudGltZSBmcm9tIFwiLi4vLi4vLi4vLi4vcGtnL3J1bnRpbWUvaW5kZXguanNcIjtcbndpbmRvdy53YWlscyA9IHJ1bnRpbWU7XG5cbnJ1bnRpbWUuV01MLkVuYWJsZSgpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUN5QkEsSUFBSSxjQUNGO0FBV0ssSUFBSSxTQUFTLENBQUMsT0FBTyxPQUFPO0FBQ2pDLE1BQUksS0FBSztBQUNULE1BQUksSUFBSTtBQUNSLFNBQU8sS0FBSztBQUNWLFVBQU0sWUFBYSxLQUFLLE9BQU8sSUFBSSxLQUFNLENBQUM7QUFBQSxFQUM1QztBQUNBLFNBQU87QUFDVDs7O0FDL0JBLElBQU0sYUFBYSxPQUFPLFNBQVMsU0FBUztBQUdyQyxTQUFTLE9BQU8sS0FBSztBQUN4QixNQUFHLE9BQU8sUUFBUTtBQUNkLFdBQU8sT0FBTyxPQUFPLFFBQVEsWUFBWSxHQUFHO0FBQUEsRUFDaEQsT0FBTztBQUNILFdBQU8sT0FBTyxPQUFPLGdCQUFnQixTQUFTLFlBQVksR0FBRztBQUFBLEVBQ2pFO0FBQ0o7QUFHTyxJQUFNLGNBQWM7QUFBQSxFQUN2QixNQUFNO0FBQUEsRUFDTixhQUFhO0FBQUEsRUFDYixZQUFZO0FBQ2hCO0FBQ08sSUFBSSxXQUFXLE9BQU87QUFzQnRCLFNBQVMsdUJBQXVCLFFBQVEsWUFBWTtBQUN2RCxTQUFPLFNBQVUsUUFBUSxPQUFLLE1BQU07QUFDaEMsV0FBTyxrQkFBa0Is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Q3JCLDZCQUE2QjtBQUFBLElBQzdCLDBCQUEwQjtBQUFBLElBQzFCLHVCQUF1QjtBQUFBLElBQ3ZCLHVCQUF1QjtBQUFBLElBQ3ZCLDJCQUEyQjtBQUFBLElBQzNCLCtCQUErQjtBQUFBLElBQy9CLG9CQUFvQjtBQUFBLElBQ3BCLHFCQUFxQjtBQUFBLElBQ3JCLHFCQUFxQjtBQUFBLElBQ3JCLHNCQUFzQjtBQUFBLElBQ3RCLGdDQUFnQztBQUFBLElBQ2hDLGtDQUFrQztBQUFBLElBQ2xDLG1DQUFtQztBQUFBLElBQ25DLG9DQUFvQztBQUFBLElBQ3BDLCtCQUErQjtBQUFBLElBQy9CLDZCQUE2QjtBQUFBLElBQzdCLHVCQUF1QjtBQUFBLElBQ3ZCLGlDQUFpQztBQUFBLElBQ2pDLDhCQUE4QjtBQUFBLElBQzlCLDRCQUE0QjtBQUFBLElBQzVCLHNDQUFzQztBQUFBLElBQ3RDLDRCQUE0QjtBQUFBLElBQzVCLHNCQUFzQjtBQUFBLElBQ3RCLGtDQUFrQztBQUFBLElBQ2xDLHNCQUFzQjtBQUFBLElBQ3RCLHdCQUF3QjtBQUFBLElBQ3hCLDJCQUEyQjtBQUFBLElBQzNCLHdCQUF3QjtBQUFBLElBQ3hCLG1CQUFtQjtBQUFBLElBQ25CLDBCQUEwQjtBQUFBLElBQzFCLDhCQUE4QjtBQUFBLElBQzlCLHlCQUF5QjtBQUFBLElBQ3pCLDZCQUE2QjtBQUFBLElBQzdCLGlCQUFpQjtBQUFBLElBQ2pCLGdCQUFnQjtBQUFBLElBQ2hCLHNCQUFzQjtBQUFBLElBQ3RCLGVBQWU7QUFBQSxJQUNmLHlCQUF5QjtBQUFBLElBQ3pCLHdCQUF3QjtBQUFBLElBQ3hCLG9CQUFvQjtBQUFBLElBQ3BCLHFCQUFxQjtBQUFBLElBQ3JCLGlCQUFpQjtBQUFBLElBQ2pCLGlCQUFpQjtBQUFBLElBQ2pCLHNCQUFzQjtBQUFBLElBQ3RCLG1DQUFtQztBQUFBLElBQ25DLHFDQUFxQztBQUFBLElBQ3JDLHVCQUF1QjtBQUFBLElBQ3ZCLHNCQUFzQjtBQUFBLElBQ3RCLHdCQUF3QjtBQUFBLElBQ3hCLDJCQUEyQjtBQUFBLElBQzNCLG1CQUFtQjtBQUFBLElBQ25CLHFCQUFxQjtBQUFBLElBQ3JCLHNCQUFzQjtBQUFBLElBQ3RCLHNCQUFzQjtBQUFBLElBQ3RCLDhCQUE4QjtBQUFBLElBQzlCLGlCQUFpQjtBQUFBLElBQ2pCLHlCQUF5QjtBQUFBLElBQ3pCLDJCQUEyQjtBQUFBLElBQzNCLCtCQUErQjtBQUFBLElBQy9CLDBCQUEwQjtBQUFBLElBQzFCLDhCQUE4QjtBQUFBLElBQzlCLGlCQUFpQjtBQUFBLElBQ2pCLHVCQUF1QjtBQUFBLElBQ3ZCLGdCQUFnQjtBQUFBLElBQ2hCLDBCQUEwQjtBQUFBLElBQzFCLHlCQUF5QjtBQUFBLElBQ3pCLHNCQUFzQjtBQUFBLElBQ3RCLGtCQUFrQjtBQUFBLElBQ2xCLG1CQUFtQjtBQUFBLElBQ25CLGtCQUFrQjtBQUFBLElBQ2xCLHVCQUF1QjtBQUFBLElBQ3ZCLG9DQUFvQztBQUFBLElBQ3BDLHNDQUFzQztBQUFBLElBQ3RDLHdCQUF3QjtBQUFBLElBQ3hCLHVCQUF1QjtBQUFBLElBQ3ZCLHlCQUF5QjtBQUFBLElBQ3pCLDRCQUE0QjtBQUFBLElBQzVCLDRCQUE0QjtBQUFBLElBQzVCLGNBQWM7QUFBQSxJQUNkLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLG9CQUFvQjtBQUFBLElBQ3BCLG1CQUFtQjtBQUFBLElBQ25CLHVCQUF1QjtBQUFBLElBQ3ZCLHNCQUFzQjtBQUFBLElBQ3RCLHFCQUFxQjtBQUFBLElBQ3JCLG9CQUFvQjtBQUFBLElBQ3BCLGlCQUFpQjtBQUFBLElBQ2pCLGdCQUFnQjtBQUFBLElBQ2hCLG9CQUFvQjtBQUFBLElBQ3BCLG1CQUFtQjtBQUFBLElBQ25CLHVCQUF1QjtBQUFBLElBQ3ZCLHNCQUFzQjtBQUFBLElBQ3RCLHFCQUFxQjtBQUFBLElBQ3JCLG9CQUFvQjtBQUFBLElBQ3BCLGdCQUFnQjtBQUFBLElBQ2hCLGVBQWU7QUFBQSxJQUNmLGVBQWU7QUFBQSxJQUNmLGNBQWM7QUFBQSxJQUNkLDBCQUEwQjtBQUFBLElBQzFCLHlCQUF5QjtBQUFBLElBQ3pCLHNDQUFzQztBQUFBLElBQ3RDLHlEQUF5RDtBQUFBLElBQ3pELDRCQUE0QjtBQUFBLElBQzVCLDRCQUE0QjtBQUFBLElBQzVCLDJCQUEyQjtBQUFBLElBQzNCLDZCQUE2QjtBQUFBLElBQzdCLDBCQUEwQjtBQUFBLEVBQzNCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixvQkFBb0I7QUFBQSxJQUNwQixtQkFBbUI7QUFBQSxJQUNuQixtQkFBbUI7QUFBQSxJQUNuQixlQUFlO0FBQUEsSUFDZixnQkFBZ0I7QUFBQSxJQUNoQixvQkFBb0I7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1Asb0JBQW9CO0FBQUEsSUFDcEIsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsSUFDbEIsa0JBQWtCO0FBQUEsSUFDbEIsb0JBQW9CO0FBQUEsSUFDcEIsZUFBZTtBQUFBLElBQ2YsZ0JBQWdCO0FBQUEsSUFDaEIsa0JBQWtCO0FBQUEsSUFDbEIsZUFBZTtBQUFBLElBQ2YsWUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2QsZUFBZTtBQUFBLElBQ2YsaUJBQWlCO0FBQUEsSUFDakIsYUFBYTtBQUFBLElBQ2IsaUJBQWlCO0FBQUEsSUFDakIsWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLElBQ1osa0JBQWtCO0FBQUEsSUFDbEIsb0JBQW9CO0FBQUEsSUFDcEIsb0JBQW9CO0FBQUEsSUFDcEIsY0FBYztBQUFBLEVBQ2Y7QUFDRDs7O0FDNUtPLElBQU0sUUFBUTtBQUdyQixPQUFPLFNBQVMsT0FBTyxVQUFVLENBQUM7QUFDbEMsT0FBTyxPQUFPLHFCQUFxQjtBQUVuQyxJQUFNLGlCQUFpQixvQkFBSSxJQUFJO0FBRS9CLElBQU0sV0FBTixNQUFlO0FBQUEsRUFDWCxZQUFZLFdBQVcsVUFBVSxjQUFjO0FBQzNDLFNBQUssWUFBWTtBQUNqQixTQUFLLGVBQWUsZ0JBQWdCO0FBQ3BDLFNBQUssV0FBVyxDQUFDLFNBQVM7QUFDdEIsZUFBUyxJQUFJO0FBQ2IsVUFBSSxLQUFLLGlCQUFpQixHQUFJLFFBQU87QUFDckMsV0FBSyxnQkFBZ0I7QUFDckIsYUFBTyxLQUFLLGlCQUFpQjtBQUFBLElBQ2pDO0FBQUEsRUFDSjtBQUNKO0FBS08sSUFBTSxhQUFOLE1BQWlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTXBCLFlBQVksTUFBTSxPQUFPLE1BQU07QUFLM0IsU0FBSyxPQUFPO0FBTVosU0FBSyxPQUFPO0FBQUEsRUFDaEI7QUFDSjtBQUVBLFNBQVMsbUJBQW1CLE9BQU87QUFDL0IsUUFBTTtBQUFBO0FBQUEsSUFBNEIsSUFBSSxXQUFXLE1BQU0sTUFBTSxNQUFNLElBQUk7QUFBQTtBQUN2RSxTQUFPLE9BQU8sUUFBUSxLQUFLO0FBQzNCLFVBQVE7QUFFUixNQUFJLFlBQVksZUFBZSxJQUFJLE1BQU0sSUFBSTtBQUM3QyxNQUFJLFdBQVc7QUFDWCxRQUFJLFdBQVcsVUFBVSxPQUFPLGNBQVk7QUFDeEMsVUFBSSxTQUFTLFNBQVMsU0FBUyxLQUFLO0FBQ3BDLFVBQUksT0FBUSxRQUFPO0FBQUEsSUFDdkIsQ0FBQztBQUNELFFBQUksU0FBUyxTQUFTLEdBQUc7QUFDckIsa0JBQVksVUFBVSxPQUFPLE9BQUssQ0FBQyxTQUFTLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZELFVBQUksVUFBVSxXQUFXLEVBQUcsZ0JBQWUsT0FBTyxNQUFNLElBQUk7QUFBQSxVQUN2RCxnQkFBZSxJQUFJLE1BQU0sTUFBTSxTQUFTO0FBQUEsSUFDakQ7QUFBQSxFQUNKO0FBQ0o7QUFXTyxTQUFTLFdBQVcsV0FBVyxVQUFVLGNBQWM7QUFDMUQsTUFBSSxZQUFZLGVBQWUsSUFBSSxTQUFTLEtBQUssQ0FBQztBQUNsRCxRQUFNLGVBQWUsSUFBSSxTQUFTLFdBQVcsVUFBVSxZQUFZO0FBQ25FLFlBQVUsS0FBSyxZQUFZO0FBQzNCLGlCQUFlLElBQUksV0FBVyxTQUFTO0FBQ3ZDLFNBQU8sTUFBTSxZQUFZLFlBQVk7QUFDekM7QUFRTyxTQUFTLEdBQUcsV0FBVyxVQUFVO0FBQUUsU0FBTyxXQUFXLFdBQVcsVUFBVSxFQUFFO0FBQUc7QUFTL0UsU0FBUyxLQUFLLFdBQVcsVUFBVTtBQUFFLFNBQU8sV0FBVyxXQUFXLFVBQVUsQ0FBQztBQUFHO0FBUXZGLFNBQVMsWUFBWSxVQUFVO0FBQzNCLFFBQU0sWUFBWSxTQUFTO0FBQzNCLE1BQUksWUFBWSxlQUFlLElBQUksU0FBUyxFQUFFLE9BQU8sT0FBSyxNQUFNLFFBQVE7QUFDeEUsTUFBSSxVQUFVLFdBQVcsRUFBRyxnQkFBZSxPQUFPLFNBQVM7QUFBQSxNQUN0RCxnQkFBZSxJQUFJLFdBQVcsU0FBUztBQUNoRDtBQVVPLFNBQVMsSUFBSSxjQUFjLHNCQUFzQjtBQUNwRCxNQUFJLGlCQUFpQixDQUFDLFdBQVcsR0FBRyxvQkFBb0I7QUFDeEQsaUJBQWUsUUFBUSxDQUFBQyxlQUFhLGVBQWUsT0FBT0EsVUFBUyxDQUFDO0FBQ3hFO0FBUU8sU0FBUyxTQUFTO0FBQUUsaUJBQWUsTUFBTTtBQUFHOzs7QUZsSTVDLFNBQVMsS0FBSyxPQUFPO0FBQ3hCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLEtBQUs7QUFDakQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7OztBR2pCQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBY08sU0FBUyxTQUFTO0FBQ3JCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDLE1BQUksaUJBQWlCLGVBQWUsS0FBSyxDQUFDLFlBQVk7QUFDbEQsV0FBT0MsZUFBYyxPQUFPO0FBQUEsRUFDaEMsQ0FBQztBQUNELGlCQUFlLFNBQVMsZUFBZSxPQUFPLEtBQUssY0FBYztBQUNqRTtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsYUFBYTtBQUN6QixNQUFJLGlCQUFpQixhQUFNLEtBQUssU0FBUztBQUN6QyxNQUFJLGlCQUFpQixlQUFlLEtBQUssQ0FBQyxZQUFZO0FBQ2xELFdBQU9DLGVBQWMsT0FBTztBQUFBLEVBQ2hDLENBQUM7QUFDRCxpQkFBZSxTQUFTLGVBQWUsT0FBTyxLQUFLLGNBQWM7QUFDakU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTLGFBQWE7QUFDekIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUMsTUFBSSxpQkFBaUIsZUFBZSxLQUFLLENBQUMsWUFBWTtBQUNsRCxXQUFPQSxlQUFjLE9BQU87QUFBQSxFQUNoQyxDQUFDO0FBQ0QsaUJBQWUsU0FBUyxlQUFlLE9BQU8sS0FBSyxjQUFjO0FBQ2pFO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBR0EsSUFBTUEsaUJBQXdCLE9BQU87QUFDckMsSUFBTUQsaUJBQWdCLGVBQVEsTUFBTUMsY0FBYTs7O0FDcERqRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWNPLFNBQVMsY0FBYztBQUMxQixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQyxNQUFJLGlCQUFpQixlQUFlLEtBQUssQ0FBQyxZQUFZO0FBQ2xELFdBQU9DLGVBQWMsT0FBTztBQUFBLEVBQ2hDLENBQUM7QUFDRCxpQkFBZSxTQUFTLGVBQWUsT0FBTyxLQUFLLGNBQWM7QUFDakU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTLGFBQWE7QUFDekIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFHQSxJQUFNQSxpQkFBd0IsZ0JBQWdCOzs7QUNqQzlDO0FBQUE7QUFBQSwwQkFBQUM7QUFBQSxFQUFBLGNBQUFDO0FBQUEsRUFBQSxhQUFBQztBQUFBLEVBQUEsOEJBQUFDO0FBQUEsRUFBQSw2QkFBQUM7QUFBQSxFQUFBLGFBQUFDO0FBQUEsRUFBQSxtQkFBQUM7QUFBQSxFQUFBLGtCQUFBQztBQUFBLEVBQUE7QUFBQSx3QkFBQUM7QUFBQSxFQUFBLGlCQUFBQztBQUFBLEVBQUEsZUFBQUM7QUFBQSxFQUFBLGNBQUFDO0FBQUEsRUFBQSxZQUFBQztBQUFBLEVBQUEsaUJBQUFDO0FBQUEsRUFBQSxvQkFBQUM7QUFBQSxFQUFBLG1CQUFBQztBQUFBLEVBQUEsbUJBQUFDO0FBQUEsRUFBQSxnQkFBQUM7QUFBQSxFQUFBLGdCQUFBQztBQUFBLEVBQUEsWUFBQUM7QUFBQSxFQUFBLG9CQUFBQztBQUFBLEVBQUE7QUFBQSwwQkFBQUM7QUFBQSxFQUFBLGNBQUFDO0FBQUEsRUFBQSxpQkFBQUM7QUFBQSxFQUFBLGVBQUFDO0FBQUEsRUFBQSwyQkFBQUM7QUFBQSxFQUFBLHNCQUFBQztBQUFBLEVBQUEsMkJBQUFDO0FBQUEsRUFBQSxvQkFBQUM7QUFBQSxFQUFBLGtDQUFBQztBQUFBLEVBQUEsa0JBQUFDO0FBQUEsRUFBQSxrQkFBQUM7QUFBQSxFQUFBLDJCQUFBQztBQUFBLEVBQUEsb0JBQUFDO0FBQUEsRUFBQSxlQUFBQztBQUFBLEVBQUEsZ0JBQUFDO0FBQUEsRUFBQSxlQUFBQztBQUFBLEVBQUEsWUFBQUM7QUFBQSxFQUFBLFlBQUFDO0FBQUEsRUFBQSx3QkFBQUM7QUFBQSxFQUFBLHNCQUFBQztBQUFBLEVBQUEsb0JBQUFDO0FBQUEsRUFBQSxrQkFBQUM7QUFBQSxFQUFBLGtCQUFBQztBQUFBLEVBQUEsYUFBQUM7QUFBQSxFQUFBLFlBQUFDO0FBQUEsRUFBQSxjQUFBQztBQUFBLEVBQUEsZUFBQUM7QUFBQSxFQUFBLGlCQUFBQztBQUFBOzs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FBQUM7QUFBQSxFQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBQUFDO0FBQUEsRUFBQSxZQUFBQztBQUFBLEVBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWFPLFNBQVMsaUJBQWlCLFNBQVM7QUFDdEMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFdBQVcsT0FBTztBQUNsRCxNQUFJLGlCQUFpQixlQUFlLEtBQUssQ0FBQyxZQUFZO0FBQ2xELFdBQU9DLGVBQWMsT0FBTztBQUFBLEVBQ2hDLENBQUM7QUFDRCxpQkFBZSxTQUFTLGVBQWUsT0FBTyxLQUFLLGNBQWM7QUFDakU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLE9BQU8sU0FBUztBQUM1QixNQUFJLGlCQUFpQixhQUFNLEtBQUssV0FBVyxPQUFPO0FBQ2xEO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxNQUFNLFNBQVM7QUFDM0IsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsdUJBQXVCLFNBQVM7QUFDNUMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsc0JBQXNCLFNBQVM7QUFDM0MsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsTUFBTSxTQUFTO0FBQzNCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLE9BQU87QUFDbkQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLFlBQVksU0FBUztBQUNqQyxNQUFJLGlCQUFpQixhQUFNLEtBQUssV0FBVyxPQUFPO0FBQ2xEO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxXQUFXLFNBQVM7QUFDaEMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVUsT0FBTztBQUNqRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsZUFBZSxTQUFTO0FBQ3BDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxXQUFXLE9BQU87QUFDbEQsTUFBSSxpQkFBaUIsZUFBZSxLQUFLLENBQUMsWUFBWTtBQUNsRCxXQUFPQyxlQUFjLE9BQU87QUFBQSxFQUNoQyxDQUFDO0FBQ0QsaUJBQWUsU0FBUyxlQUFlLE9BQU8sS0FBSyxjQUFjO0FBQ2pFO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxVQUFVLFNBQVM7QUFDL0IsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFdBQVcsT0FBTztBQUNsRCxNQUFJLGlCQUFpQixlQUFlLEtBQUssQ0FBQyxZQUFZO0FBQ2xELFdBQU9DLGVBQWMsT0FBTztBQUFBLEVBQ2hDLENBQUM7QUFDRCxpQkFBZSxTQUFTLGVBQWUsT0FBTyxLQUFLLGNBQWM7QUFDakU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLFFBQVEsU0FBUztBQUM3QixNQUFJLGlCQUFpQixhQUFNLEtBQUssV0FBVyxPQUFPO0FBQ2xEO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxPQUFPLFNBQVM7QUFDNUIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFdBQVcsT0FBTztBQUNsRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVNDLE1BQUssU0FBUztBQUMxQixNQUFJLGlCQUFpQixhQUFNLEtBQUssV0FBVyxPQUFPO0FBQ2xEO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxVQUFVLFNBQVM7QUFDL0IsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsYUFBYSxTQUFTO0FBQ2xDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxXQUFXLE9BQU87QUFDbEQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLFlBQVksU0FBUztBQUNqQyxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxPQUFPO0FBQ25EO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxZQUFZLFNBQVM7QUFDakMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsU0FBUyxTQUFTO0FBQzlCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxXQUFXLE9BQU87QUFDbEQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLFNBQVMsU0FBUztBQUM5QixNQUFJLGlCQUFpQixhQUFNLEtBQUssV0FBVyxPQUFPO0FBQ2xEO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxLQUFLLFNBQVM7QUFDMUIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFdBQVcsT0FBTztBQUNsRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsYUFBYSxTQUFTO0FBQ2xDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLE9BQU87QUFDbkQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLGlCQUFpQixTQUFTO0FBQ3RDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLE9BQU87QUFDbkQsTUFBSSxpQkFBaUIsZUFBZSxLQUFLLENBQUMsWUFBWTtBQUNsRCxXQUFPSCxlQUFjLE9BQU87QUFBQSxFQUNoQyxDQUFDO0FBQ0QsaUJBQWUsU0FBUyxlQUFlLE9BQU8sS0FBSyxjQUFjO0FBQ2pFO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxPQUFPLFNBQVM7QUFDNUIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsVUFBVSxTQUFTO0FBQy9CLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLE9BQU87QUFDbkQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLFFBQVEsU0FBUztBQUM3QixNQUFJLGlCQUFpQixhQUFNLEtBQUssV0FBVyxPQUFPO0FBQ2xEO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBU08sU0FBUyxvQkFBb0IsU0FBUyxHQUFHLEdBQUc7QUFDL0MsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksU0FBUyxHQUFHLENBQUM7QUFDekQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFRTyxTQUFTLGVBQWUsU0FBUyxLQUFLO0FBQ3pDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLFNBQVMsR0FBRztBQUN4RDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQVFPLFNBQVMsb0JBQW9CLFNBQVMsUUFBUTtBQUNqRCxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxTQUFTLE1BQU07QUFDM0Q7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFRTyxTQUFTLGFBQWEsU0FBUyxXQUFXO0FBQzdDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLFNBQVMsU0FBUztBQUM5RDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQVFPLFNBQVMsMkJBQTJCLFNBQVMsU0FBUztBQUN6RCxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxTQUFTLE9BQU87QUFDNUQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFTTyxTQUFTLFdBQVcsU0FBUyxPQUFPLFFBQVE7QUFDL0MsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksU0FBUyxPQUFPLE1BQU07QUFDbEU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFTTyxTQUFTLFdBQVcsU0FBUyxPQUFPLFFBQVE7QUFDL0MsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksU0FBUyxPQUFPLE1BQU07QUFDbEU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFTTyxTQUFTLG9CQUFvQixTQUFTLEdBQUcsR0FBRztBQUMvQyxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxTQUFTLEdBQUcsQ0FBQztBQUN6RDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQVFPLFNBQVMsYUFBYSxTQUFTSSxZQUFXO0FBQzdDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVLFNBQVNBLFVBQVM7QUFDNUQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFTTyxTQUFTLFFBQVEsU0FBUyxPQUFPLFFBQVE7QUFDNUMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksU0FBUyxPQUFPLE1BQU07QUFDbEU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFRTyxTQUFTLFNBQVMsU0FBUyxPQUFPO0FBQ3JDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxXQUFXLFNBQVMsS0FBSztBQUN6RDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQVFPLFNBQVMsUUFBUSxTQUFTLGVBQWU7QUFDNUMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksU0FBUyxhQUFhO0FBQ2xFO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBU0MsTUFBSyxTQUFTO0FBQzFCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLE9BQU87QUFDbkQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTQyxNQUFLLFNBQVM7QUFDMUIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRCxNQUFJLGlCQUFpQixlQUFlLEtBQUssQ0FBQyxZQUFZO0FBQ2xELFdBQU9DLGVBQWMsT0FBTztBQUFBLEVBQ2hDLENBQUM7QUFDRCxpQkFBZSxTQUFTLGVBQWUsT0FBTyxLQUFLLGNBQWM7QUFDakU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLGlCQUFpQixTQUFTO0FBQ3RDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxXQUFXLE9BQU87QUFDbEQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLGVBQWUsU0FBUztBQUNwQyxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxPQUFPO0FBQ25EO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxhQUFhLFNBQVM7QUFDbEMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsV0FBVyxTQUFTO0FBQ2hDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLE9BQU87QUFDbkQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLFdBQVcsU0FBUztBQUNoQyxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxPQUFPO0FBQ25EO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxNQUFNLFNBQVM7QUFDM0IsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsS0FBSyxTQUFTO0FBQzFCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxXQUFXLE9BQU87QUFDbEQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTLE9BQU8sU0FBUztBQUM1QixNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxPQUFPO0FBQ25EO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBT08sU0FBUyxRQUFRLFNBQVM7QUFDN0IsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksT0FBTztBQUNuRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVMsVUFBVSxTQUFTO0FBQy9CLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxXQUFXLE9BQU87QUFDbEQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFHQSxJQUFNUCxpQkFBd0IsU0FBUztBQUN2QyxJQUFNQyxpQkFBd0IsS0FBSztBQUNuQyxJQUFNQyxpQkFBd0IsT0FBTztBQUNyQyxJQUFNSyxpQkFBd0IsS0FBSzs7O0FEemdCNUIsU0FBUyxJQUFJLE1BQU07QUFDdEIsTUFBSSxZQUFZLENBQUMsUUFBUSxxQkFBTyxHQUFHLEVBQUUsS0FBSyxNQUFNLElBQUk7QUFDcEQsTUFBSSxTQUFTLElBQUk7QUFBRSxnQkFBWSxDQUFDLFFBQVEsZUFBSyxHQUFHO0FBQUEsRUFBRztBQUFDO0FBQ3BELFFBQU0sTUFBTSxDQUFDO0FBQ2IsYUFBVyxVQUFVLGdCQUFNO0FBQ3ZCLFFBQUksV0FBVyxTQUFTLFdBQVcsUUFBUTtBQUN2QyxVQUFJLE1BQU0sSUFBSSxVQUFVLE1BQU07QUFBQSxJQUNsQztBQUFBLEVBQ0o7QUFDQTtBQUFBO0FBQUEsSUFBMEIsT0FBTyxPQUFPLEdBQUc7QUFBQTtBQUMvQztBQU1PLFNBQVNDLG9CQUFtQjtBQUMvQixNQUFJLGlCQUFpQixhQUFNLEtBQUssU0FBUztBQUN6QyxNQUFJLGlCQUFpQixlQUFlLEtBQUssQ0FBQyxZQUFZO0FBQ2xELFdBQU9DLGVBQWMsT0FBTztBQUFBLEVBQ2hDLENBQUM7QUFDRCxpQkFBZSxTQUFTLGVBQWUsT0FBTyxLQUFLLGNBQWM7QUFDakU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxVQUFTO0FBQ3JCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsU0FBUTtBQUNwQixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLDBCQUF5QjtBQUNyQyxNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLHlCQUF3QjtBQUNwQyxNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLFNBQVE7QUFDcEIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxlQUFjO0FBQzFCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxTQUFTO0FBQ3pDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsY0FBYTtBQUN6QixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLGtCQUFpQjtBQUM3QixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQyxNQUFJLGlCQUFpQixlQUFlLEtBQUssQ0FBQyxZQUFZO0FBQ2xELFdBQU9DLGVBQWMsT0FBTztBQUFBLEVBQ2hDLENBQUM7QUFDRCxpQkFBZSxTQUFTLGVBQWUsT0FBTyxLQUFLLGNBQWM7QUFDakU7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxhQUFZO0FBQ3hCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDLE1BQUksaUJBQWlCLGVBQWUsS0FBSyxDQUFDLFlBQVk7QUFDbEQsV0FBT0MsZUFBYyxPQUFPO0FBQUEsRUFDaEMsQ0FBQztBQUNELGlCQUFlLFNBQVMsZUFBZSxPQUFPLEtBQUssY0FBYztBQUNqRTtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLFdBQVU7QUFDdEIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxVQUFTO0FBQ3JCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxTQUFTO0FBQ3pDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsUUFBTztBQUNuQixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLGFBQVk7QUFDeEIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFNBQVM7QUFDekM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxnQkFBZTtBQUMzQixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLGVBQWM7QUFDMUIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxlQUFjO0FBQzFCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsWUFBVztBQUN2QixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLFlBQVc7QUFDdkIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxRQUFPO0FBQ25CLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsZ0JBQWU7QUFDM0IsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFNBQVM7QUFDekM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxvQkFBbUI7QUFDL0IsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUMsTUFBSSxpQkFBaUIsZUFBZSxLQUFLLENBQUMsWUFBWTtBQUNsRCxXQUFPdkIsZUFBYyxPQUFPO0FBQUEsRUFDaEMsQ0FBQztBQUNELGlCQUFlLFNBQVMsZUFBZSxPQUFPLEtBQUssY0FBYztBQUNqRTtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVN3QixVQUFTO0FBQ3JCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsYUFBWTtBQUN4QixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLFdBQVU7QUFDdEIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFRTyxTQUFTQyxxQkFBb0IsR0FBRyxHQUFHO0FBQ3RDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLEdBQUcsQ0FBQztBQUNoRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVNDLGdCQUFlLEtBQUs7QUFDaEMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksR0FBRztBQUMvQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVNDLHFCQUFvQixRQUFRO0FBQ3hDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLE1BQU07QUFDbEQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTQyxjQUFhLFdBQVc7QUFDcEMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVksU0FBUztBQUNyRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVNDLDRCQUEyQixTQUFTO0FBQ2hELE1BQUksaUJBQWlCLGFBQU0sS0FBSyxZQUFZLE9BQU87QUFDbkQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFRTyxTQUFTQyxZQUFXLE9BQU8sUUFBUTtBQUN0QyxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxPQUFPLE1BQU07QUFDekQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFRTyxTQUFTQyxZQUFXLE9BQU8sUUFBUTtBQUN0QyxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxPQUFPLE1BQU07QUFDekQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFRTyxTQUFTQyxxQkFBb0IsR0FBRyxHQUFHO0FBQ3RDLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxXQUFXLEdBQUcsQ0FBQztBQUMvQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVNDLGNBQWFDLFlBQVc7QUFDcEMsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFlBQVlBLFVBQVM7QUFDckQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFRTyxTQUFTQyxTQUFRLE9BQU8sUUFBUTtBQUNuQyxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxPQUFPLE1BQU07QUFDekQ7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFPTyxTQUFTQyxVQUFTLE9BQU87QUFDNUIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFdBQVcsS0FBSztBQUNoRDtBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU9PLFNBQVNDLFNBQVEsZUFBZTtBQUNuQyxNQUFJLGlCQUFpQixhQUFNLEtBQUssWUFBWSxhQUFhO0FBQ3pEO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsUUFBTztBQUNuQixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLFFBQU87QUFDbkIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUMsTUFBSSxpQkFBaUIsZUFBZSxLQUFLLENBQUMsWUFBWTtBQUNsRCxXQUFPQyxlQUFjLE9BQU87QUFBQSxFQUNoQyxDQUFDO0FBQ0QsaUJBQWUsU0FBUyxlQUFlLE9BQU8sS0FBSyxjQUFjO0FBQ2pFO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0Msb0JBQW1CO0FBQy9CLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0Msa0JBQWlCO0FBQzdCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsZ0JBQWU7QUFDM0IsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxjQUFhO0FBQ3pCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsY0FBYTtBQUN6QixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLFNBQVE7QUFDcEIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxRQUFPO0FBQ25CLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxTQUFTO0FBQ3pDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBTU8sU0FBU0MsVUFBUztBQUNyQixNQUFJLGlCQUFpQixhQUFNLEtBQUssVUFBVTtBQUMxQztBQUFBO0FBQUEsSUFBMEI7QUFBQTtBQUM5QjtBQU1PLFNBQVNDLFdBQVU7QUFDdEIsTUFBSSxpQkFBaUIsYUFBTSxLQUFLLFVBQVU7QUFDMUM7QUFBQTtBQUFBLElBQTBCO0FBQUE7QUFDOUI7QUFNTyxTQUFTQyxhQUFZO0FBQ3hCLE1BQUksaUJBQWlCLGFBQU0sS0FBSyxVQUFVO0FBQzFDO0FBQUE7QUFBQSxJQUEwQjtBQUFBO0FBQzlCO0FBR0EsSUFBTXBELGlCQUF3QixTQUFTO0FBQ3ZDLElBQU1TLGlCQUF3QixLQUFLO0FBQ25DLElBQU1FLGlCQUF3QixPQUFPO0FBQ3JDLElBQU0rQixpQkFBd0IsS0FBSzs7O0FFaGdCbkM7QUFBQTtBQUFBO0FBQUEsZ0JBQUFXO0FBQUE7OztBQ2lCTyxTQUFTLG9CQUFvQjtBQUNoQyxNQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQztBQUNqQyxXQUFPO0FBRVgsTUFBSSxTQUFTO0FBRWIsUUFBTSxTQUFTLElBQUksWUFBWTtBQUMvQixRQUFNQyxjQUFhLElBQUksZ0JBQWdCO0FBQ3ZDLFNBQU8saUJBQWlCLFFBQVEsTUFBTTtBQUFFLGFBQVM7QUFBQSxFQUFPLEdBQUcsRUFBRSxRQUFRQSxZQUFXLE9BQU8sQ0FBQztBQUN4RixFQUFBQSxZQUFXLE1BQU07QUFDakIsU0FBTyxjQUFjLElBQUksWUFBWSxNQUFNLENBQUM7QUFFNUMsU0FBTztBQUNYO0FBaUNBLElBQUksVUFBVTtBQUNkLFNBQVMsaUJBQWlCLG9CQUFvQixNQUFNLFVBQVUsSUFBSTtBQUUzRCxTQUFTLFVBQVUsVUFBVTtBQUNoQyxNQUFJLFdBQVcsU0FBUyxlQUFlLFlBQVk7QUFDL0MsYUFBUztBQUFBLEVBQ2IsT0FBTztBQUNILGFBQVMsaUJBQWlCLG9CQUFvQixRQUFRO0FBQUEsRUFDMUQ7QUFDSjs7O0FEN0NBLFNBQVMsVUFBVSxXQUFXLE9BQUssTUFBTTtBQUNyQyxPQUFLLElBQUksV0FBVyxXQUFXLElBQUksQ0FBQztBQUN4QztBQU9BLFNBQVMsaUJBQWlCLFlBQVksWUFBWTtBQUM5QyxRQUFNLGVBQXNCLElBQUksVUFBVTtBQUMxQyxRQUFNLFNBQVMsYUFBYSxVQUFVO0FBRXRDLE1BQUksT0FBTyxXQUFXLFlBQVk7QUFDOUIsWUFBUSxNQUFNLGtCQUFrQixVQUFVLGFBQWE7QUFDdkQ7QUFBQSxFQUNKO0FBRUEsTUFBSTtBQUNBLFdBQU8sS0FBSyxZQUFZO0FBQUEsRUFDNUIsU0FBUyxHQUFHO0FBQ1IsWUFBUSxNQUFNLGdDQUFnQyxVQUFVLE9BQU8sQ0FBQztBQUFBLEVBQ3BFO0FBQ0o7QUFRQSxTQUFTLGVBQWUsSUFBSTtBQUN4QixRQUFNLFVBQVUsR0FBRztBQUVuQixXQUFTLFVBQVUsU0FBUyxPQUFPO0FBQy9CLFFBQUksV0FBVztBQUNYO0FBRUosVUFBTSxZQUFZLFFBQVEsYUFBYSxXQUFXO0FBQ2xELFVBQU0sZUFBZSxRQUFRLGFBQWEsbUJBQW1CLEtBQUs7QUFDbEUsVUFBTSxlQUFlLFFBQVEsYUFBYSxZQUFZO0FBQ3RELFVBQU0sTUFBTSxRQUFRLGFBQWEsYUFBYTtBQUU5QyxRQUFJLGNBQWM7QUFDZCxnQkFBVSxTQUFTO0FBQ3ZCLFFBQUksaUJBQWlCO0FBQ2pCLHVCQUFpQixjQUFjLFlBQVk7QUFDL0MsUUFBSSxRQUFRO0FBQ1IsV0FBSyxRQUFRLEdBQUc7QUFBQSxFQUN4QjtBQUVBLFFBQU0sVUFBVSxRQUFRLGFBQWEsYUFBYTtBQUVsRCxNQUFJLFNBQVM7QUFDVCxhQUFTO0FBQUEsTUFDTCxPQUFPO0FBQUEsTUFDUCxTQUFTO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixTQUFTO0FBQUEsUUFDTCxFQUFFLE9BQU8sTUFBTTtBQUFBLFFBQ2YsRUFBRSxPQUFPLE1BQU0sV0FBVyxLQUFLO0FBQUEsTUFDbkM7QUFBQSxJQUNKLENBQUMsRUFBRSxLQUFLLFNBQVM7QUFBQSxFQUNyQixPQUFPO0FBQ0gsY0FBVTtBQUFBLEVBQ2Q7QUFDSjtBQUtBLElBQU0sYUFBYSxPQUFPO0FBTTFCLElBQU0sMEJBQU4sTUFBOEI7QUFBQSxFQUMxQixjQUFjO0FBUVYsU0FBSyxVQUFVLElBQUksSUFBSSxnQkFBZ0I7QUFBQSxFQUMzQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVVBLElBQUksU0FBUyxVQUFVO0FBQ25CLFdBQU8sRUFBRSxRQUFRLEtBQUssVUFBVSxFQUFFLE9BQU87QUFBQSxFQUM3QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9BLFFBQVE7QUFDSixTQUFLLFVBQVUsRUFBRSxNQUFNO0FBQ3ZCLFNBQUssVUFBVSxJQUFJLElBQUksZ0JBQWdCO0FBQUEsRUFDM0M7QUFDSjtBQUtBLElBQU0sYUFBYSxPQUFPO0FBSzFCLElBQU0sZUFBZSxPQUFPO0FBTzVCLElBQU0sa0JBQU4sTUFBc0I7QUFBQSxFQUNsQixjQUFjO0FBUVYsU0FBSyxVQUFVLElBQUksb0JBQUksUUFBUTtBQVMvQixTQUFLLFlBQVksSUFBSTtBQUFBLEVBQ3pCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQVNBLElBQUksU0FBUyxVQUFVO0FBQ25CLFNBQUssWUFBWSxLQUFLLENBQUMsS0FBSyxVQUFVLEVBQUUsSUFBSSxPQUFPO0FBQ25ELFNBQUssVUFBVSxFQUFFLElBQUksU0FBUyxRQUFRO0FBQ3RDLFdBQU8sQ0FBQztBQUFBLEVBQ1o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPQSxRQUFRO0FBQ0osUUFBSSxLQUFLLFlBQVksS0FBSztBQUN0QjtBQUVKLGVBQVcsV0FBVyxTQUFTLEtBQUssaUJBQWlCLEdBQUcsR0FBRztBQUN2RCxVQUFJLEtBQUssWUFBWSxLQUFLO0FBQ3RCO0FBRUosWUFBTSxXQUFXLEtBQUssVUFBVSxFQUFFLElBQUksT0FBTztBQUM3QyxXQUFLLFlBQVksS0FBTSxPQUFPLGFBQWE7QUFFM0MsaUJBQVcsV0FBVyxZQUFZLENBQUM7QUFDL0IsZ0JBQVEsb0JBQW9CLFNBQVMsY0FBYztBQUFBLElBQzNEO0FBRUEsU0FBSyxVQUFVLElBQUksb0JBQUksUUFBUTtBQUMvQixTQUFLLFlBQVksSUFBSTtBQUFBLEVBQ3pCO0FBQ0o7QUFFQSxJQUFNLGtCQUFrQixrQkFBa0IsSUFBSSxJQUFJLHdCQUF3QixJQUFJLElBQUksZ0JBQWdCO0FBUWxHLFNBQVMsZ0JBQWdCLFNBQVM7QUFDOUIsUUFBTSxnQkFBZ0I7QUFDdEIsUUFBTSxjQUFlLFFBQVEsYUFBYSxhQUFhLEtBQUs7QUFDNUQsUUFBTSxXQUFXLENBQUM7QUFFbEIsTUFBSTtBQUNKLFVBQVEsUUFBUSxjQUFjLEtBQUssV0FBVyxPQUFPO0FBQ2pELGFBQVMsS0FBSyxNQUFNLENBQUMsQ0FBQztBQUUxQixRQUFNLFVBQVUsZ0JBQWdCLElBQUksU0FBUyxRQUFRO0FBQ3JELGFBQVcsV0FBVztBQUNsQixZQUFRLGlCQUFpQixTQUFTLGdCQUFnQixPQUFPO0FBQ2pFO0FBT08sU0FBUyxTQUFTO0FBQ3JCLFlBQVVDLE9BQU07QUFDcEI7QUFPTyxTQUFTQSxVQUFTO0FBQ3JCLGtCQUFnQixNQUFNO0FBQ3RCLFdBQVMsS0FBSyxpQkFBaUIsMENBQTBDLEVBQUUsUUFBUSxlQUFlO0FBQ3RHOzs7QUVyUEEsT0FBTyxRQUFRO0FBRVAsWUFBSSxPQUFPOyIsCiAgIm5hbWVzIjogWyJjYWxsIiwgIk1hcCIsICJrZXkiLCAiTWFwIiwgIkVycm9yIiwgIkVycm9yIiwgImV2ZW50TmFtZSIsICIkJGNyZWF0ZVR5cGUxIiwgIiQkY3JlYXRlVHlwZTAiLCAiJCRjcmVhdGVUeXBlMCIsICJBYnNvbHV0ZVBvc2l0aW9uIiwgIkNlbnRlciIsICJDbG9zZSIsICJEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzIiwgIkVuYWJsZVNpemVDb25zdHJhaW50cyIsICJGb2N1cyIsICJGb3JjZVJlbG9hZCIsICJGdWxsc2NyZWVuIiwgIkdldEJvcmRlclNpemVzIiwgIkdldFNjcmVlbiIsICJHZXRab29tIiwgIkhlaWdodCIsICJIaWRlIiwgIklzRm9jdXNlZCIsICJJc0Z1bGxzY3JlZW4iLCAiSXNNYXhpbWlzZWQiLCAiSXNNaW5pbWlzZWQiLCAiTWF4aW1pc2UiLCAiTWluaW1pc2UiLCAiTmFtZSIsICJPcGVuRGV2VG9vbHMiLCAiUmVsYXRpdmVQb3NpdGlvbiIsICJSZWxvYWQiLCAiUmVzaXphYmxlIiwgIlJlc3RvcmUiLCAiU2V0QWJzb2x1dGVQb3NpdGlvbiIsICJTZXRBbHdheXNPblRvcCIsICJTZXRCYWNrZ3JvdW5kQ29sb3VyIiwgIlNldEZyYW1lbGVzcyIsICJTZXRGdWxsc2NyZWVuQnV0dG9uRW5hYmxlZCIsICJTZXRNYXhTaXplIiwgIlNldE1pblNpemUiLCAiU2V0UmVsYXRpdmVQb3NpdGlvbiIsICJTZXRSZXNpemFibGUiLCAiU2V0U2l6ZSIsICJTZXRUaXRsZSIsICJTZXRab29tIiwgIlNob3ciLCAiU2l6ZSIsICJUb2dnbGVGdWxsc2NyZWVuIiwgIlRvZ2dsZU1heGltaXNlIiwgIlVuRnVsbHNjcmVlbiIsICJVbk1heGltaXNlIiwgIlVuTWluaW1pc2UiLCAiV2lkdGgiLCAiWm9vbSIsICJab29tSW4iLCAiWm9vbU91dCIsICJab29tUmVzZXQiLCAiSGlkZSIsICJTaG93IiwgIlNpemUiLCAiJCRjcmVhdGVUeXBlMCIsICIkJGNyZWF0ZVR5cGUxIiwgIiQkY3JlYXRlVHlwZTIiLCAiSGlkZSIsICJyZXNpemFibGUiLCAiU2hvdyIsICJTaXplIiwgIiQkY3JlYXRlVHlwZTMiLCAiQWJzb2x1dGVQb3NpdGlvbiIsICIkJGNyZWF0ZVR5cGUwIiwgIkNlbnRlciIsICJDbG9zZSIsICJEaXNhYmxlU2l6ZUNvbnN0cmFpbnRzIiwgIkVuYWJsZVNpemVDb25zdHJhaW50cyIsICJGb2N1cyIsICJGb3JjZVJlbG9hZCIsICJGdWxsc2NyZWVuIiwgIkdldEJvcmRlclNpemVzIiwgIiQkY3JlYXRlVHlwZTEiLCAiR2V0U2NyZWVuIiwgIiQkY3JlYXRlVHlwZTIiLCAiR2V0Wm9vbSIsICJIZWlnaHQiLCAiSGlkZSIsICJJc0ZvY3VzZWQiLCAiSXNGdWxsc2NyZWVuIiwgIklzTWF4aW1pc2VkIiwgIklzTWluaW1pc2VkIiwgIk1heGltaXNlIiwgIk1pbmltaXNlIiwgIk5hbWUiLCAiT3BlbkRldlRvb2xzIiwgIlJlbGF0aXZlUG9zaXRpb24iLCAiUmVsb2FkIiwgIlJlc2l6YWJsZSIsICJSZXN0b3JlIiwgIlNldEFic29sdXRlUG9zaXRpb24iLCAiU2V0QWx3YXlzT25Ub3AiLCAiU2V0QmFja2dyb3VuZENvbG91ciIsICJTZXRGcmFtZWxlc3MiLCAiU2V0RnVsbHNjcmVlbkJ1dHRvbkVuYWJsZWQiLCAiU2V0TWF4U2l6ZSIsICJTZXRNaW5TaXplIiwgIlNldFJlbGF0aXZlUG9zaXRpb24iLCAiU2V0UmVzaXphYmxlIiwgInJlc2l6YWJsZSIsICJTZXRTaXplIiwgIlNldFRpdGxlIiwgIlNldFpvb20iLCAiU2hvdyIsICJTaXplIiwgIiQkY3JlYXRlVHlwZTMiLCAiVG9nZ2xlRnVsbHNjcmVlbiIsICJUb2dnbGVNYXhpbWlzZSIsICJVbkZ1bGxzY3JlZW4iLCAiVW5NYXhpbWlzZSIsICJVbk1pbmltaXNlIiwgIldpZHRoIiwgIlpvb20iLCAiWm9vbUluIiwgIlpvb21PdXQiLCAiWm9vbVJlc2V0IiwgIlJlbG9hZCIsICJjb250cm9sbGVyIiwgIlJlbG9hZCJdCn0K
