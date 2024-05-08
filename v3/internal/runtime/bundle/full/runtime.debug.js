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
  RGBA: () => RGBA,
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
  for (const key in Window_exports) {
    if (key !== "Get" && key !== "RGBA") {
      const method = Window_exports[key];
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
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType04($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
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
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType13($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
  );
}
function GetScreen(...targetWindow) {
  let $resultPromise = call_exports.ByID(3744597424, targetWindow);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType22($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
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
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType04($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
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
function Size2(...targetWindow) {
  let $resultPromise = call_exports.ByID(1141111433, targetWindow);
  let $typingPromise = $resultPromise.then(($result) => {
    return $$createType32($result);
  });
  $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
  return (
    /** @type {any} */
    $typingPromise
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
var $$createType04 = Position.createFrom;
var $$createType13 = LRTB.createFrom;
var $$createType22 = Screen.createFrom;
var $$createType32 = Size.createFrom;

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvcGtnL3J1bnRpbWUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvQXBwbGljYXRpb24uanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL25hbm9pZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvcnVudGltZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvc3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9jb250ZXh0bWVudS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvZmxhZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2RyYWcuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NhbGwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NyZWF0ZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvQnJvd3Nlci5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9DYWxsLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL0NsaXBib2FyZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9DcmVhdGUuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvRGlhbG9ncy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9tb2RlbHMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvRXZlbnRzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2V2ZW50X3R5cGVzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2xpc3RlbmVyLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL0ZsYWdzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL1NjcmVlbnMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvU3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL1dpbmRvdy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS93bWwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvdXRpbHMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9idW5kbGUvZnVsbC9pbmRleC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuZXhwb3J0IHtcbiAgICBBcHBsaWNhdGlvbixcbiAgICBCcm93c2VyLFxuICAgIENhbGwsXG4gICAgQ2xpcGJvYXJkLFxuICAgIENyZWF0ZSxcbiAgICBEaWFsb2dzLFxuICAgIEV2ZW50cyxcbiAgICBGbGFncyxcbiAgICBTY3JlZW5zLFxuICAgIFN5c3RlbSxcbiAgICBXaW5kb3csXG4gICAgV01MXG59IGZyb20gXCIuLi8uLi9pbnRlcm5hbC9ydW50aW1lL2FwaS9pbmRleC5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuLyoqXG4gKiBIaWRlIG1ha2VzIGFsbCBhcHBsaWNhdGlvbiB3aW5kb3dzIGludmlzaWJsZS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSGlkZSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDcyNzQ3MTYwMik7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUXVpdCBxdWl0cyB0aGUgYXBwbGljYXRpb24uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFF1aXQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMjQ0OTI2OTUzKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTaG93IG1ha2VzIGFsbCBhcHBsaWNhdGlvbiB3aW5kb3dzIHZpc2libGUuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNob3coKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMjcwNjc0ODM5KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cbiIsICIvKipcbiAqIFRoaXMgY29kZSBmcmFnbWVudCBpcyB0YWtlbiBmcm9tIG5hbm9pZCAoaHR0cHM6Ly9naXRodWIuY29tL2FpL25hbm9pZCk6XG4gKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IDIwMTcgQW5kcmV5IFNpdG5payA8YW5kcmV5QHNpdG5pay5ydT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mXG4gKiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluXG4gKiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvXG4gKiB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZlxuICogdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLFxuICogc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTXG4gKiBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1JcbiAqIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUlxuICogSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU5cbiAqIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxubGV0IHVybEFscGhhYmV0ID1cbiAgJ3VzZWFuZG9tLTI2VDE5ODM0MFBYNzVweEpBQ0tWRVJZTUlOREJVU0hXT0xGX0dRWmJmZ2hqa2xxdnd5enJpY3QnXG5leHBvcnQgbGV0IGN1c3RvbUFscGhhYmV0ID0gKGFscGhhYmV0LCBkZWZhdWx0U2l6ZSA9IDIxKSA9PiB7XG4gIHJldHVybiAoc2l6ZSA9IGRlZmF1bHRTaXplKSA9PiB7XG4gICAgbGV0IGlkID0gJydcbiAgICBsZXQgaSA9IHNpemVcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZCArPSBhbHBoYWJldFsoTWF0aC5yYW5kb20oKSAqIGFscGhhYmV0Lmxlbmd0aCkgfCAwXVxuICAgIH1cbiAgICByZXR1cm4gaWRcbiAgfVxufVxuZXhwb3J0IGxldCBuYW5vaWQgPSAoc2l6ZSA9IDIxKSA9PiB7XG4gIGxldCBpZCA9ICcnXG4gIGxldCBpID0gc2l6ZVxuICB3aGlsZSAoaS0tKSB7XG4gICAgaWQgKz0gdXJsQWxwaGFiZXRbKE1hdGgucmFuZG9tKCkgKiA2NCkgfCAwXVxuICB9XG4gIHJldHVybiBpZFxufVxuIiwgIi8qXG4gXyAgICAgX18gICAgIF8gX19cbnwgfCAgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5pbXBvcnQgeyBuYW5vaWQgfSBmcm9tIFwiLi9uYW5vaWQuanNcIjtcblxuY29uc3QgcnVudGltZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyBcIi93YWlscy9ydW50aW1lXCI7XG5cbi8qKiBTZW5kcyBtZXNzYWdlcyB0byB0aGUgYmFja2VuZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludm9rZShtc2cpIHtcbiAgICBpZih3aW5kb3cuY2hyb21lKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuY2hyb21lLndlYnZpZXcucG9zdE1lc3NhZ2UobXNnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gd2luZG93LndlYmtpdC5tZXNzYWdlSGFuZGxlcnMuZXh0ZXJuYWwucG9zdE1lc3NhZ2UobXNnKTtcbiAgICB9XG59XG5cbi8qKiBPYmplY3QgTmFtZXMgKi9cbmV4cG9ydCBjb25zdCBvYmplY3ROYW1lcyA9IHtcbiAgICBDYWxsOiAwLFxuICAgIENvbnRleHRNZW51OiA0LFxuICAgIENhbmNlbENhbGw6IDEwLFxufVxuZXhwb3J0IGxldCBjbGllbnRJZCA9IG5hbm9pZCgpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBydW50aW1lIGNhbGxlciBmdW5jdGlvbiB0aGF0IGludm9rZXMgYSBzcGVjaWZpZWQgbWV0aG9kIG9uIGEgZ2l2ZW4gb2JqZWN0IHdpdGhpbiBhIHNwZWNpZmllZCB3aW5kb3cgY29udGV4dC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IC0gVGhlIG9iamVjdCBvbiB3aGljaCB0aGUgbWV0aG9kIGlzIHRvIGJlIGludm9rZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gd2luZG93TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB3aW5kb3cgY29udGV4dCBpbiB3aGljaCB0aGUgbWV0aG9kIHNob3VsZCBiZSBjYWxsZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgcnVudGltZSBjYWxsZXIgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgbWV0aG9kIG5hbWUgYW5kIG9wdGlvbmFsbHkgYXJndW1lbnRzIGFuZCBpbnZva2VzIHRoZSBtZXRob2Qgd2l0aGluIHRoZSBzcGVjaWZpZWQgd2luZG93IGNvbnRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXdSdW50aW1lQ2FsbGVyKG9iamVjdCwgd2luZG93TmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAobWV0aG9kLCBhcmdzPW51bGwpIHtcbiAgICAgICAgcmV0dXJuIHJ1bnRpbWVDYWxsKG9iamVjdCArIFwiLlwiICsgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcnVudGltZSBjYWxsZXIgd2l0aCBzcGVjaWZpZWQgSUQuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9iamVjdCAtIFRoZSBvYmplY3QgdG8gaW52b2tlIHRoZSBtZXRob2Qgb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gd2luZG93TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB3aW5kb3cuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gLSBUaGUgbmV3IHJ1bnRpbWUgY2FsbGVyIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbmV3UnVudGltZUNhbGxlcldpdGhJRChvYmplY3QsIHdpbmRvd05hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1ldGhvZCwgYXJncz1udWxsKSB7XG4gICAgICAgIHJldHVybiBydW50aW1lQ2FsbFdpdGhJRChvYmplY3QsIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncyk7XG4gICAgfTtcbn1cblxuXG5mdW5jdGlvbiBydW50aW1lQ2FsbChtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpIHtcbiAgICBsZXQgdXJsID0gbmV3IFVSTChydW50aW1lVVJMKTtcbiAgICBpZiggbWV0aG9kICkge1xuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcIm1ldGhvZFwiLCBtZXRob2QpO1xuICAgIH1cbiAgICBsZXQgZmV0Y2hPcHRpb25zID0ge1xuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICB9O1xuICAgIGlmICh3aW5kb3dOYW1lKSB7XG4gICAgICAgIGZldGNoT3B0aW9ucy5oZWFkZXJzW1wieC13YWlscy13aW5kb3ctbmFtZVwiXSA9IHdpbmRvd05hbWU7XG4gICAgfVxuICAgIGlmIChhcmdzKSB7XG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwiYXJnc1wiLCBKU09OLnN0cmluZ2lmeShhcmdzKSk7XG4gICAgfVxuICAgIGZldGNoT3B0aW9ucy5oZWFkZXJzW1wieC13YWlscy1jbGllbnQtaWRcIl0gPSBjbGllbnRJZDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGZldGNoKHVybCwgZmV0Y2hPcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBjb250ZW50IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpICYmIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9qc29uXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVqZWN0KEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHJlc29sdmUoZGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHJ1bnRpbWVDYWxsV2l0aElEKG9iamVjdElELCBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpIHtcbiAgICBsZXQgdXJsID0gbmV3IFVSTChydW50aW1lVVJMKTtcbiAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcIm9iamVjdFwiLCBvYmplY3RJRCk7XG4gICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJtZXRob2RcIiwgbWV0aG9kKTtcbiAgICBsZXQgZmV0Y2hPcHRpb25zID0ge1xuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICB9O1xuICAgIGlmICh3aW5kb3dOYW1lKSB7XG4gICAgICAgIGZldGNoT3B0aW9ucy5oZWFkZXJzW1wieC13YWlscy13aW5kb3ctbmFtZVwiXSA9IHdpbmRvd05hbWU7XG4gICAgfVxuICAgIGlmIChhcmdzKSB7XG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwiYXJnc1wiLCBKU09OLnN0cmluZ2lmeShhcmdzKSk7XG4gICAgfVxuICAgIGZldGNoT3B0aW9ucy5oZWFkZXJzW1wieC13YWlscy1jbGllbnQtaWRcIl0gPSBjbGllbnRJZDtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBmZXRjaCh1cmwsIGZldGNoT3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgY29udGVudCB0eXBlXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKSAmJiByZXNwb25zZS5oZWFkZXJzLmdldChcIkNvbnRlbnQtVHlwZVwiKS5pbmRleE9mKFwiYXBwbGljYXRpb24vanNvblwiKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlamVjdChFcnJvcihyZXNwb25zZS5zdGF0dXNUZXh0KSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiByZXNvbHZlKGRhdGEpKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHJlamVjdChlcnJvcikpO1xuICAgIH0pO1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbi8qKlxuICogRmV0Y2hlcyBhcHBsaWNhdGlvbiBjYXBhYmlsaXRpZXMgZnJvbSB0aGUgc2VydmVyLlxuICpcbiAqIEBhc3luY1xuICogQGZ1bmN0aW9uIENhcGFiaWxpdGllc1xuICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGNhcGFiaWxpdGllcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENhcGFiaWxpdGllcygpIHtcbiAgICByZXR1cm4gZmV0Y2goXCIvd2FpbHMvY2FwYWJpbGl0aWVzXCIpLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIFdpbmRvd3MuXG4gKlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgb3BlcmF0aW5nIHN5c3RlbSBpcyBXaW5kb3dzLCBvdGhlcndpc2UgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc1dpbmRvd3MoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuT1MgPT09IFwid2luZG93c1wiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIExpbnV4LlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgb3BlcmF0aW5nIHN5c3RlbSBpcyBMaW51eCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNMaW51eCgpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5PUyA9PT0gXCJsaW51eFwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpcyBhIG1hY09TIG9wZXJhdGluZyBzeXN0ZW0uXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIG1hY09TLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc01hYygpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5PUyA9PT0gXCJkYXJ3aW5cIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgYXJjaGl0ZWN0dXJlIGlzIEFNRDY0LlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgYXJjaGl0ZWN0dXJlIGlzIEFNRDY0LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0FNRDY0KCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkFyY2ggPT09IFwiYW1kNjRcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgYXJjaGl0ZWN0dXJlIGlzIEFSTS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgY3VycmVudCBhcmNoaXRlY3R1cmUgaXMgQVJNLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0FSTSgpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5BcmNoID09PSBcImFybVwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBpcyBBUk02NCBhcmNoaXRlY3R1cmUuXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59IC0gUmV0dXJucyB0cnVlIGlmIHRoZSBlbnZpcm9ubWVudCBpcyBBUk02NCBhcmNoaXRlY3R1cmUsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNBUk02NCgpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5BcmNoID09PSBcImFybTY0XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIGluIGRlYnVnIG1vZGUuXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59IC0gUmV0dXJucyB0cnVlIGlmIHRoZSBlbnZpcm9ubWVudCBpcyBpbiBkZWJ1ZyBtb2RlLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRGVidWcoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuRGVidWcgPT09IHRydWU7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHtuZXdSdW50aW1lQ2FsbGVyV2l0aElELCBvYmplY3ROYW1lc30gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuaW1wb3J0IHtJc0RlYnVnfSBmcm9tIFwiLi9zeXN0ZW0uanNcIjtcblxuLy8gc2V0dXBcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGNvbnRleHRNZW51SGFuZGxlcik7XG5cbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdE5hbWVzLkNvbnRleHRNZW51LCAnJyk7XG5jb25zdCBDb250ZXh0TWVudU9wZW4gPSAwO1xuXG5mdW5jdGlvbiBvcGVuQ29udGV4dE1lbnUoaWQsIHgsIHksIGRhdGEpIHtcbiAgICB2b2lkIGNhbGwoQ29udGV4dE1lbnVPcGVuLCB7aWQsIHgsIHksIGRhdGF9KTtcbn1cblxuZnVuY3Rpb24gY29udGV4dE1lbnVIYW5kbGVyKGV2ZW50KSB7XG4gICAgLy8gQ2hlY2sgZm9yIGN1c3RvbSBjb250ZXh0IG1lbnVcbiAgICBsZXQgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgY3VzdG9tQ29udGV4dE1lbnUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1jdXN0b20tY29udGV4dG1lbnVcIik7XG4gICAgY3VzdG9tQ29udGV4dE1lbnUgPSBjdXN0b21Db250ZXh0TWVudSA/IGN1c3RvbUNvbnRleHRNZW51LnRyaW0oKSA6IFwiXCI7XG4gICAgaWYgKGN1c3RvbUNvbnRleHRNZW51KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGxldCBjdXN0b21Db250ZXh0TWVudURhdGEgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1jdXN0b20tY29udGV4dG1lbnUtZGF0YVwiKTtcbiAgICAgICAgb3BlbkNvbnRleHRNZW51KGN1c3RvbUNvbnRleHRNZW51LCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZLCBjdXN0b21Db250ZXh0TWVudURhdGEpO1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBwcm9jZXNzRGVmYXVsdENvbnRleHRNZW51KGV2ZW50KTtcbn1cblxuXG4vKlxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBhdXRvOyAoZGVmYXVsdCkgd2lsbCBzaG93IHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudSBpZiBjb250ZW50RWRpdGFibGUgaXMgdHJ1ZSBPUiB0ZXh0IGhhcyBiZWVuIHNlbGVjdGVkIE9SIGVsZW1lbnQgaXMgaW5wdXQgb3IgdGV4dGFyZWFcbi0tZGVmYXVsdC1jb250ZXh0bWVudTogc2hvdzsgd2lsbCBhbHdheXMgc2hvdyB0aGUgZGVmYXVsdCBjb250ZXh0IG1lbnVcbi0tZGVmYXVsdC1jb250ZXh0bWVudTogaGlkZTsgd2lsbCBhbHdheXMgaGlkZSB0aGUgZGVmYXVsdCBjb250ZXh0IG1lbnVcblxuVGhpcyBydWxlIGlzIGluaGVyaXRlZCBsaWtlIG5vcm1hbCBDU1MgcnVsZXMsIHNvIG5lc3Rpbmcgd29ya3MgYXMgZXhwZWN0ZWRcbiovXG5mdW5jdGlvbiBwcm9jZXNzRGVmYXVsdENvbnRleHRNZW51KGV2ZW50KSB7XG5cbiAgICAvLyBEZWJ1ZyBidWlsZHMgYWx3YXlzIHNob3cgdGhlIG1lbnVcbiAgICBpZiAoSXNEZWJ1ZygpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQcm9jZXNzIGRlZmF1bHQgY29udGV4dCBtZW51XG4gICAgY29uc3QgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICBjb25zdCBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG4gICAgY29uc3QgZGVmYXVsdENvbnRleHRNZW51QWN0aW9uID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1kZWZhdWx0LWNvbnRleHRtZW51XCIpLnRyaW0oKTtcbiAgICBzd2l0Y2ggKGRlZmF1bHRDb250ZXh0TWVudUFjdGlvbikge1xuICAgICAgICBjYXNlIFwic2hvd1wiOlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlIFwiaGlkZVwiOlxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGNvbnRlbnRFZGl0YWJsZSBpcyB0cnVlXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc0NvbnRlbnRFZGl0YWJsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGV4dCBoYXMgYmVlbiBzZWxlY3RlZFxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgY29uc3QgaGFzU2VsZWN0aW9uID0gKHNlbGVjdGlvbi50b1N0cmluZygpLmxlbmd0aCA+IDApXG4gICAgICAgICAgICBpZiAoaGFzU2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rpb24ucmFuZ2VDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoaSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY3RzID0gcmFuZ2UuZ2V0Q2xpZW50UmVjdHMoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWN0cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IHJlY3RzW2pdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQocmVjdC5sZWZ0LCByZWN0LnRvcCkgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0YWduYW1lIGlzIGlucHV0IG9yIHRleHRhcmVhXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lID09PSBcIklOUFVUXCIgfHwgZWxlbWVudC50YWdOYW1lID09PSBcIlRFWFRBUkVBXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzU2VsZWN0aW9uIHx8ICghZWxlbWVudC5yZWFkT25seSAmJiAhZWxlbWVudC5kaXNhYmxlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaGlkZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSBmcm9tIHRoZSBmbGFnIG1hcC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5U3RyaW5nIC0gVGhlIGtleSB0byByZXRyaWV2ZSB0aGUgdmFsdWUgZm9yLlxuICogQHJldHVybiB7Kn0gLSBUaGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0RmxhZyhrZXlTdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Ll93YWlscy5mbGFnc1trZXlTdHJpbmddO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIGZsYWcgJ1wiICsga2V5U3RyaW5nICsgXCInOiBcIiArIGUpO1xuICAgIH1cbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQge2ludm9rZX0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuaW1wb3J0IHtJc1dpbmRvd3N9IGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuaW1wb3J0IHtHZXRGbGFnfSBmcm9tIFwiLi9mbGFncy5qc1wiO1xuXG4vLyBTZXR1cFxubGV0IHNob3VsZERyYWcgPSBmYWxzZTtcbmxldCByZXNpemFibGUgPSBmYWxzZTtcbmxldCByZXNpemVFZGdlID0gbnVsbDtcbmxldCBkZWZhdWx0Q3Vyc29yID0gXCJhdXRvXCI7XG5cbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xuXG53aW5kb3cuX3dhaWxzLnNldFJlc2l6YWJsZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmVzaXphYmxlID0gdmFsdWU7XG59O1xuXG53aW5kb3cuX3dhaWxzLmVuZERyYWcgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdkZWZhdWx0JztcbiAgICBzaG91bGREcmFnID0gZmFsc2U7XG59O1xuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Nb3VzZURvd24pO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcblxuXG5mdW5jdGlvbiBkcmFnVGVzdChlKSB7XG4gICAgbGV0IHZhbCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGUudGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS13YWlscy1kcmFnZ2FibGVcIik7XG4gICAgbGV0IG1vdXNlUHJlc3NlZCA9IGUuYnV0dG9ucyAhPT0gdW5kZWZpbmVkID8gZS5idXR0b25zIDogZS53aGljaDtcbiAgICBpZiAoIXZhbCB8fCB2YWwgPT09IFwiXCIgfHwgdmFsLnRyaW0oKSAhPT0gXCJkcmFnXCIgfHwgbW91c2VQcmVzc2VkID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGUuZGV0YWlsID09PSAxO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlRG93bihlKSB7XG5cbiAgICAvLyBDaGVjayBmb3IgcmVzaXppbmdcbiAgICBpZiAocmVzaXplRWRnZSkge1xuICAgICAgICBpbnZva2UoXCJyZXNpemU6XCIgKyByZXNpemVFZGdlKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGRyYWdUZXN0KGUpKSB7XG4gICAgICAgIC8vIFRoaXMgY2hlY2tzIGZvciBjbGlja3Mgb24gdGhlIHNjcm9sbCBiYXJcbiAgICAgICAgaWYgKGUub2Zmc2V0WCA+IGUudGFyZ2V0LmNsaWVudFdpZHRoIHx8IGUub2Zmc2V0WSA+IGUudGFyZ2V0LmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNob3VsZERyYWcgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VVcCgpIHtcbiAgICBzaG91bGREcmFnID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHNldFJlc2l6ZShjdXJzb3IpIHtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuY3Vyc29yID0gY3Vyc29yIHx8IGRlZmF1bHRDdXJzb3I7XG4gICAgcmVzaXplRWRnZSA9IGN1cnNvcjtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZSkge1xuICAgIGlmIChzaG91bGREcmFnKSB7XG4gICAgICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbiAgICAgICAgbGV0IG1vdXNlUHJlc3NlZCA9IGUuYnV0dG9ucyAhPT0gdW5kZWZpbmVkID8gZS5idXR0b25zIDogZS53aGljaDtcbiAgICAgICAgaWYgKG1vdXNlUHJlc3NlZCA+IDApIHtcbiAgICAgICAgICAgIGludm9rZShcImRyYWdcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFyZXNpemFibGUgfHwgIUlzV2luZG93cygpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGRlZmF1bHRDdXJzb3IgPT0gbnVsbCkge1xuICAgICAgICBkZWZhdWx0Q3Vyc29yID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLmN1cnNvcjtcbiAgICB9XG4gICAgbGV0IHJlc2l6ZUhhbmRsZUhlaWdodCA9IEdldEZsYWcoXCJzeXN0ZW0ucmVzaXplSGFuZGxlSGVpZ2h0XCIpIHx8IDU7XG4gICAgbGV0IHJlc2l6ZUhhbmRsZVdpZHRoID0gR2V0RmxhZyhcInN5c3RlbS5yZXNpemVIYW5kbGVXaWR0aFwiKSB8fCA1O1xuXG4gICAgLy8gRXh0cmEgcGl4ZWxzIGZvciB0aGUgY29ybmVyIGFyZWFzXG4gICAgbGV0IGNvcm5lckV4dHJhID0gR2V0RmxhZyhcInJlc2l6ZUNvcm5lckV4dHJhXCIpIHx8IDEwO1xuXG4gICAgbGV0IHJpZ2h0Qm9yZGVyID0gd2luZG93Lm91dGVyV2lkdGggLSBlLmNsaWVudFggPCByZXNpemVIYW5kbGVXaWR0aDtcbiAgICBsZXQgbGVmdEJvcmRlciA9IGUuY2xpZW50WCA8IHJlc2l6ZUhhbmRsZVdpZHRoO1xuICAgIGxldCB0b3BCb3JkZXIgPSBlLmNsaWVudFkgPCByZXNpemVIYW5kbGVIZWlnaHQ7XG4gICAgbGV0IGJvdHRvbUJvcmRlciA9IHdpbmRvdy5vdXRlckhlaWdodCAtIGUuY2xpZW50WSA8IHJlc2l6ZUhhbmRsZUhlaWdodDtcblxuICAgIC8vIEFkanVzdCBmb3IgY29ybmVyc1xuICAgIGxldCByaWdodENvcm5lciA9IHdpbmRvdy5vdXRlcldpZHRoIC0gZS5jbGllbnRYIDwgKHJlc2l6ZUhhbmRsZVdpZHRoICsgY29ybmVyRXh0cmEpO1xuICAgIGxldCBsZWZ0Q29ybmVyID0gZS5jbGllbnRYIDwgKHJlc2l6ZUhhbmRsZVdpZHRoICsgY29ybmVyRXh0cmEpO1xuICAgIGxldCB0b3BDb3JuZXIgPSBlLmNsaWVudFkgPCAocmVzaXplSGFuZGxlSGVpZ2h0ICsgY29ybmVyRXh0cmEpO1xuICAgIGxldCBib3R0b21Db3JuZXIgPSB3aW5kb3cub3V0ZXJIZWlnaHQgLSBlLmNsaWVudFkgPCAocmVzaXplSGFuZGxlSGVpZ2h0ICsgY29ybmVyRXh0cmEpO1xuXG4gICAgLy8gSWYgd2UgYXJlbid0IG9uIGFuIGVkZ2UsIGJ1dCB3ZXJlLCByZXNldCB0aGUgY3Vyc29yIHRvIGRlZmF1bHRcbiAgICBpZiAoIWxlZnRCb3JkZXIgJiYgIXJpZ2h0Qm9yZGVyICYmICF0b3BCb3JkZXIgJiYgIWJvdHRvbUJvcmRlciAmJiByZXNpemVFZGdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2V0UmVzaXplKCk7XG4gICAgfVxuICAgIC8vIEFkanVzdGVkIGZvciBjb3JuZXIgYXJlYXNcbiAgICBlbHNlIGlmIChyaWdodENvcm5lciAmJiBib3R0b21Db3JuZXIpIHNldFJlc2l6ZShcInNlLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChsZWZ0Q29ybmVyICYmIGJvdHRvbUNvcm5lcikgc2V0UmVzaXplKFwic3ctcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGxlZnRDb3JuZXIgJiYgdG9wQ29ybmVyKSBzZXRSZXNpemUoXCJudy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAodG9wQ29ybmVyICYmIHJpZ2h0Q29ybmVyKSBzZXRSZXNpemUoXCJuZS1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAobGVmdEJvcmRlcikgc2V0UmVzaXplKFwidy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAodG9wQm9yZGVyKSBzZXRSZXNpemUoXCJuLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChib3R0b21Cb3JkZXIpIHNldFJlc2l6ZShcInMtcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKHJpZ2h0Qm9yZGVyKSBzZXRSZXNpemUoXCJlLXJlc2l6ZVwiKTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQgeyBuZXdSdW50aW1lQ2FsbGVyV2l0aElELCBvYmplY3ROYW1lcyB9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7IG5hbm9pZCB9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xuXG4vLyBTZXR1cFxud2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XG53aW5kb3cuX3dhaWxzLmNhbGxSZXN1bHRIYW5kbGVyID0gcmVzdWx0SGFuZGxlcjtcbndpbmRvdy5fd2FpbHMuY2FsbEVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlcjtcblxuY29uc3QgQ2FsbEJpbmRpbmcgPSAwO1xuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0TmFtZXMuQ2FsbCwgJycpO1xuY29uc3QgY2FuY2VsQ2FsbCA9IG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0TmFtZXMuQ2FuY2VsQ2FsbCwgJycpO1xubGV0IGNhbGxSZXNwb25zZXMgPSBuZXcgTWFwKCk7XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgdW5pcXVlIElEIHVzaW5nIHRoZSBuYW5vaWQgbGlicmFyeS5cbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gQSB1bmlxdWUgSUQgdGhhdCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgY2FsbFJlc3BvbnNlcyBzZXQuXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlSUQoKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBkbyB7XG4gICAgICAgIHJlc3VsdCA9IG5hbm9pZCgpO1xuICAgIH0gd2hpbGUgKGNhbGxSZXNwb25zZXMuaGFzKHJlc3VsdCkpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogSGFuZGxlcyB0aGUgcmVzdWx0IG9mIGEgY2FsbCByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFRoZSBpZCBvZiB0aGUgcmVxdWVzdCB0byBoYW5kbGUgdGhlIHJlc3VsdCBmb3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YSAtIFRoZSByZXN1bHQgZGF0YSBvZiB0aGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNKU09OIC0gSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRhdGEgaXMgSlNPTiBvciBub3QuXG4gKlxuICogQHJldHVybiB7dW5kZWZpbmVkfSAtIFRoaXMgbWV0aG9kIGRvZXMgbm90IHJldHVybiBhbnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHJlc3VsdEhhbmRsZXIoaWQsIGRhdGEsIGlzSlNPTikge1xuICAgIGNvbnN0IHByb21pc2VIYW5kbGVyID0gZ2V0QW5kRGVsZXRlUmVzcG9uc2UoaWQpO1xuICAgIGlmIChwcm9taXNlSGFuZGxlcikge1xuICAgICAgICBwcm9taXNlSGFuZGxlci5yZXNvbHZlKGlzSlNPTiA/IEpTT04ucGFyc2UoZGF0YSkgOiBkYXRhKTtcbiAgICB9XG59XG5cbi8qKlxuICogSGFuZGxlcyB0aGUgZXJyb3IgZnJvbSBhIGNhbGwgcmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHByb21pc2UgaGFuZGxlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIC0gVGhlIGVycm9yIG1lc3NhZ2UgdG8gcmVqZWN0IHRoZSBwcm9taXNlIGhhbmRsZXIgd2l0aC5cbiAqXG4gKiBAcmV0dXJuIHt2b2lkfVxuICovXG5mdW5jdGlvbiBlcnJvckhhbmRsZXIoaWQsIG1lc3NhZ2UpIHtcbiAgICBjb25zdCBwcm9taXNlSGFuZGxlciA9IGdldEFuZERlbGV0ZVJlc3BvbnNlKGlkKTtcbiAgICBpZiAocHJvbWlzZUhhbmRsZXIpIHtcbiAgICAgICAgcHJvbWlzZUhhbmRsZXIucmVqZWN0KG1lc3NhZ2UpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYW5kIHJlbW92ZXMgdGhlIHJlc3BvbnNlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gSUQgZnJvbSB0aGUgY2FsbFJlc3BvbnNlcyBtYXAuXG4gKlxuICogQHBhcmFtIHthbnl9IGlkIC0gVGhlIElEIG9mIHRoZSByZXNwb25zZSB0byBiZSByZXRyaWV2ZWQgYW5kIHJlbW92ZWQuXG4gKlxuICogQHJldHVybnMge2FueX0gVGhlIHJlc3BvbnNlIG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIElELlxuICovXG5mdW5jdGlvbiBnZXRBbmREZWxldGVSZXNwb25zZShpZCkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gY2FsbFJlc3BvbnNlcy5nZXQoaWQpO1xuICAgIGNhbGxSZXNwb25zZXMuZGVsZXRlKGlkKTtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBjYWxsIHVzaW5nIHRoZSBwcm92aWRlZCB0eXBlIGFuZCBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gdHlwZSAtIFRoZSB0eXBlIG9mIGNhbGwgdG8gZXhlY3V0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBBZGRpdGlvbmFsIG9wdGlvbnMgZm9yIHRoZSBjYWxsLlxuICogQHJldHVybiB7UHJvbWlzZX0gLSBBIHByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9yIHJlamVjdGVkIGJhc2VkIG9uIHRoZSByZXN1bHQgb2YgdGhlIGNhbGwuIEl0IGFsc28gaGFzIGEgY2FuY2VsIG1ldGhvZCB0byBjYW5jZWwgYSBsb25nIHJ1bm5pbmcgcmVxdWVzdC5cbiAqL1xuZnVuY3Rpb24gY2FsbEJpbmRpbmcodHlwZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgaWQgPSBnZW5lcmF0ZUlEKCk7XG4gICAgY29uc3QgZG9DYW5jZWwgPSAoKSA9PiB7IHJldHVybiBjYW5jZWxDYWxsKHR5cGUsIHtcImNhbGwtaWRcIjogaWR9KSB9O1xuICAgIGxldCBxdWV1ZWRDYW5jZWwgPSBmYWxzZSwgY2FsbFJ1bm5pbmcgPSBmYWxzZTtcbiAgICBsZXQgcCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgb3B0aW9uc1tcImNhbGwtaWRcIl0gPSBpZDtcbiAgICAgICAgY2FsbFJlc3BvbnNlcy5zZXQoaWQsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgICBjYWxsKHR5cGUsIG9wdGlvbnMpLlxuICAgICAgICAgICAgdGhlbigoXykgPT4ge1xuICAgICAgICAgICAgICAgIGNhbGxSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWVkQ2FuY2VsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb0NhbmNlbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLlxuICAgICAgICAgICAgY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICBjYWxsUmVzcG9uc2VzLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBwLmNhbmNlbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKGNhbGxSdW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9DYW5jZWwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXVlZENhbmNlbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIHA7XG59XG5cbi8qKlxuICogQ2FsbCBtZXRob2QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBUaGUgb3B0aW9ucyBmb3IgdGhlIG1ldGhvZC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gVGhlIHJlc3VsdCBvZiB0aGUgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENhbGwob3B0aW9ucykge1xuICAgIHJldHVybiBjYWxsQmluZGluZyhDYWxsQmluZGluZywgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgYSBtZXRob2QgYnkgbmFtZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgaW4gdGhlIGZvcm1hdCAncGFja2FnZS5zdHJ1Y3QubWV0aG9kJy5cbiAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kLlxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBuYW1lIGlzIG5vdCBhIHN0cmluZyBvciBpcyBub3QgaW4gdGhlIGNvcnJlY3QgZm9ybWF0LlxuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHQgb2YgdGhlIG1ldGhvZCBleGVjdXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCeU5hbWUobmFtZSwgLi4uYXJncykge1xuICAgIC8vIFBhY2thZ2UgcGF0aHMgbWF5IGNvbnRhaW4gZG90czogc3BsaXQgd2l0aCBjdXN0b20gY29kZVxuICAgIC8vIHRvIGVuc3VyZSBvbmx5IHRoZSBsYXN0IHR3byBkb3RzIGFyZSB0YWtlbiBpbnRvIGFjY291bnQuXG4gICAgbGV0IG1ldGhvZERvdCA9IC0xLCBzdHJ1Y3REb3QgPSAtMTtcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgbWV0aG9kRG90ID0gbmFtZS5sYXN0SW5kZXhPZihcIi5cIik7XG4gICAgICAgIGlmIChtZXRob2REb3QgPiAwKVxuICAgICAgICAgICAgc3RydWN0RG90ID0gbmFtZS5sYXN0SW5kZXhPZihcIi5cIiwgbWV0aG9kRG90IC0gMSk7XG4gICAgfVxuXG4gICAgaWYgKG1ldGhvZERvdCA8IDAgfHwgc3RydWN0RG90IDwgMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsQnlOYW1lIHJlcXVpcmVzIGEgc3RyaW5nIGluIHRoZSBmb3JtYXQgJ3BhY2thZ2VQYXRoLnN0cnVjdC5tZXRob2QnXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhY2thZ2VQYXRoID0gbmFtZS5zbGljZSgwLCBzdHJ1Y3REb3QpLFxuICAgICAgICAgIHN0cnVjdE5hbWUgPSBuYW1lLnNsaWNlKHN0cnVjdERvdCArIDEsIG1ldGhvZERvdCksXG4gICAgICAgICAgbWV0aG9kTmFtZSA9IG5hbWUuc2xpY2UobWV0aG9kRG90ICsgMSk7XG5cbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIHtcbiAgICAgICAgcGFja2FnZVBhdGgsXG4gICAgICAgIHN0cnVjdE5hbWUsXG4gICAgICAgIG1ldGhvZE5hbWUsXG4gICAgICAgIGFyZ3NcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBieSBpdHMgSUQgd2l0aCB0aGUgc3BlY2lmaWVkIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbWV0aG9kSUQgLSBUaGUgSUQgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJuIHsqfSAtIFRoZSByZXN1bHQgb2YgdGhlIG1ldGhvZCBjYWxsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQnlJRChtZXRob2RJRCwgLi4uYXJncykge1xuICAgIHJldHVybiBjYWxsQmluZGluZyhDYWxsQmluZGluZywge1xuICAgICAgICBtZXRob2RJRCxcbiAgICAgICAgYXJnc1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENhbGxzIGEgbWV0aG9kIG9uIGEgcGx1Z2luLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwbHVnaW5OYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHBsdWdpbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2ROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICogQHBhcmFtIHsuLi4qfSBhcmdzIC0gVGhlIGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJucyB7Kn0gLSBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBsdWdpbihwbHVnaW5OYW1lLCBtZXRob2ROYW1lLCAuLi5hcmdzKSB7XG4gICAgcmV0dXJuIGNhbGxCaW5kaW5nKENhbGxCaW5kaW5nLCB7XG4gICAgICAgIHBhY2thZ2VOYW1lOiBcIndhaWxzLXBsdWdpbnNcIixcbiAgICAgICAgc3RydWN0TmFtZTogcGx1Z2luTmFtZSxcbiAgICAgICAgbWV0aG9kTmFtZSxcbiAgICAgICAgYXJnc1xuICAgIH0pO1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbi8qKlxuICogQW55IGlzIGEgZHVtbXkgY3JlYXRpb24gZnVuY3Rpb24gZm9yIHNpbXBsZSBvciB1bmtub3duIHR5cGVzLlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7YW55fSBzb3VyY2VcbiAqIEByZXR1cm5zIHtUfVxuICovXG5leHBvcnQgZnVuY3Rpb24gQW55KHNvdXJjZSkge1xuICAgIHJldHVybiAvKiogQHR5cGUge1R9ICovKHNvdXJjZSk7XG59XG5cbi8qKlxuICogQXJyYXkgdGFrZXMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcnJheVxuICogd2hvc2UgZWxlbWVudHMgYXJlIG9mIHRoYXQgdHlwZS5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0geyhhbnkpID0+IFR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHsoYW55KSA9PiBUW119XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IEFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IFtdIDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNvdXJjZVtpXSA9IGVsZW1lbnQoc291cmNlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogTWFwIHRha2VzIGNyZWF0aW9uIGZ1bmN0aW9ucyBmb3IgdHdvIGFyYml0cmFyeSB0eXBlc1xuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIG9iamVjdFxuICogd2hvc2Uga2V5cyBhbmQgdmFsdWVzIGFyZSBvZiB0aG9zZSB0eXBlcy5cbiAqIEB0ZW1wbGF0ZSBLLCBWXG4gKiBAcGFyYW0geyhhbnkpID0+IEt9IGtleVxuICogQHBhcmFtIHsoYW55KSA9PiBWfSB2YWx1ZVxuICogQHJldHVybnMgeyhhbnkpID0+IHsgW186IEtdOiBWIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNYXAoa2V5LCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gQW55KSB7XG4gICAgICAgIHJldHVybiAoc291cmNlKSA9PiAoc291cmNlID09PSBudWxsID8ge30gOiBzb3VyY2UpO1xuICAgIH1cblxuICAgIHJldHVybiAoc291cmNlKSA9PiB7XG4gICAgICAgIGlmIChzb3VyY2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIHNvdXJjZVtrZXldID0gdmFsdWUoc291cmNlW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBOdWxsYWJsZSB0YWtlcyBhIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBhcmJpdHJhcnkgdHlwZVxuICogYW5kIHJldHVybnMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYSBudWxsYWJsZSB2YWx1ZSBvZiB0aGF0IHR5cGUuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHsoYW55KSA9PiBUfSBlbGVtZW50XG4gKiBAcmV0dXJucyB7KGFueSkgPT4gKFQgfCBudWxsKX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE51bGxhYmxlKGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudCA9PT0gQW55KSB7XG4gICAgICAgIHJldHVybiBBbnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzb3VyY2UpID0+IChzb3VyY2UgPT09IG51bGwgPyBudWxsIDogZWxlbWVudChzb3VyY2UpKTtcbn1cblxuLyoqXG4gKiBTdHJ1Y3QgdGFrZXMgYW4gb2JqZWN0IG1hcHBpbmcgZmllbGQgbmFtZXMgdG8gY3JlYXRpb24gZnVuY3Rpb25zXG4gKiBhbmQgcmV0dXJucyBhbiBpbi1wbGFjZSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYSBzdHJ1Y3QuXG4gKiBAdGVtcGxhdGUge3sgW186IHN0cmluZ106ICgoYW55KSA9PiBhbnkpIH19IFRcbiAqIEB0ZW1wbGF0ZSB7eyBbS2V5IGluIGtleW9mIFRdPzogUmV0dXJuVHlwZTxUW0tleV0+IH19IFVcbiAqIEBwYXJhbSB7VH0gY3JlYXRlRmllbGRcbiAqIEByZXR1cm5zIHsoYW55KSA9PiBVfVxuICovXG5leHBvcnQgZnVuY3Rpb24gU3RydWN0KGNyZWF0ZUZpZWxkKSB7XG4gICAgbGV0IGFsbEFueSA9IHRydWU7XG4gICAgZm9yIChjb25zdCBuYW1lIGluIGNyZWF0ZUZpZWxkKSB7XG4gICAgICAgIGlmIChjcmVhdGVGaWVsZFtuYW1lXSAhPT0gQW55KSB7XG4gICAgICAgICAgICBhbGxBbnkgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbGxBbnkpIHtcbiAgICAgICAgcmV0dXJuIEFueTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gY3JlYXRlRmllbGQpIHtcbiAgICAgICAgICAgIGlmIChuYW1lIGluIHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHNvdXJjZVtuYW1lXSA9IGNyZWF0ZUZpZWxkW25hbWVdKHNvdXJjZVtuYW1lXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9O1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vLyBTZXR1cFxud2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XG5cbmltcG9ydCBcIi4vY29udGV4dG1lbnUuanNcIjtcbmltcG9ydCBcIi4vZHJhZy5qc1wiO1xuXG4vLyBSZS1leHBvcnQgKGludGVybmFsKSBwdWJsaWMgQVBJXG5leHBvcnQgKiBhcyBDYWxsIGZyb20gXCIuL2NhbGwuanNcIjtcbmV4cG9ydCAqIGFzIENyZWF0ZSBmcm9tIFwiLi9jcmVhdGUuanNcIjtcbmV4cG9ydCAqIGFzIEZsYWdzIGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5leHBvcnQgKiBhcyBTeXN0ZW0gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5cbmltcG9ydCB7aW52b2tlfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5cbi8vIFByb3ZpZGUgZHVtbXkgZXZlbnQgbGlzdGVuZXIuXG5pZiAoIShcImRpc3BhdGNoV2FpbHNFdmVudFwiIGluIHdpbmRvdy5fd2FpbHMpKSB7XG4gICAgd2luZG93Ll93YWlscy5kaXNwYXRjaFdhaWxzRXZlbnQgPSBmdW5jdGlvbiAoKSB7fTtcbn1cblxuLy8gTm90aWZ5IGJhY2tlbmRcbndpbmRvdy5fd2FpbHMuaW52b2tlID0gaW52b2tlO1xuaW52b2tlKFwid2FpbHM6cnVudGltZTpyZWFkeVwiKTtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQgeyBDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZSB9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbi8qKlxuICogT3BlblVSTCBvcGVucyBhIGJyb3dzZXIgd2luZG93IHRvIHRoZSBnaXZlbiBVUkwuXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9wZW5VUkwodXJsKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MTQxNDA4MTg1LCB1cmwpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0ICogZnJvbSBcIi4uL2NvcmUvY2FsbC5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuLyoqXG4gKiBTZXRUZXh0IHdyaXRlcyB0aGUgZ2l2ZW4gc3RyaW5nIHRvIHRoZSBDbGlwYm9hcmQuXG4gKiBJdCByZXR1cm5zIHRydWUgaWYgdGhlIG9wZXJhdGlvbiBzdWNjZWVkZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRleHQodGV4dCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoOTQwNTczNzQ5LCB0ZXh0KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBUZXh0IHJldHJpZXZlcyBhIHN0cmluZyBmcm9tIHRoZSBjbGlwYm9hcmQuXG4gKiBJZiB0aGUgb3BlcmF0aW9uIGZhaWxzLCBpdCByZXR1cm5zIG51bGwuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmcgfCBudWxsPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRleHQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNDkyMzg2MjEpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0ICogZnJvbSBcIi4uL2NvcmUvY3JlYXRlLmpzXCI7XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5leHBvcnQge01lc3NhZ2VEaWFsb2dPcHRpb25zLCBCdXR0b24sIEZpbGVGaWx0ZXIsIE9wZW5GaWxlRGlhbG9nT3B0aW9ucywgU2F2ZUZpbGVEaWFsb2dPcHRpb25zfSBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuLyoqXG4gKiBFcnJvciBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGFuIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0geyRtb2RlbHMuTWVzc2FnZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFcnJvcihvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNTA4ODYyODk1LCBvcHRpb25zKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBJbmZvIHNob3dzIGEgbW9kYWwgZGlhbG9nIGNvbnRhaW5pbmcgYW4gaW5mb3JtYXRpb25hbCBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSW5mbyhvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MDgzMTA4Mywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogT3BlbkZpbGUgc2hvd3MgYSBkaWFsb2cgdGhhdCBhbGxvd3MgdGhlIHVzZXJcbiAqIHRvIHNlbGVjdCBvbmUgb3IgbW9yZSBmaWxlcyB0byBvcGVuLlxuICogSXQgbWF5IHRocm93IGFuIGV4Y2VwdGlvbiBpbiBjYXNlIG9mIGVycm9ycy5cbiAqIEl0IHJldHVybnMgYSBzdHJpbmcgaW4gc2luZ2xlIHNlbGVjdGlvbiBtb2RlLFxuICogYW4gYXJyYXkgb2Ygc3RyaW5ncyBpbiBtdWx0aXBsZSBzZWxlY3Rpb24gbW9kZS5cbiAqIEBwYXJhbSB7JG1vZGVscy5PcGVuRmlsZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPcGVuRmlsZShvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyOTU4NTcxMTAxLCBvcHRpb25zKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBRdWVzdGlvbiBzaG93cyBhIG1vZGFsIGRpYWxvZyBhc2tpbmcgYSBxdWVzdGlvbi5cbiAqIEBwYXJhbSB7JG1vZGVscy5NZXNzYWdlRGlhbG9nT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFF1ZXN0aW9uKG9wdGlvbnMpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDEzNzgzODIzOTUsIG9wdGlvbnMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNhdmVGaWxlIHNob3dzIGEgZGlhbG9nIHRoYXQgYWxsb3dzIHRoZSB1c2VyXG4gKiB0byBzZWxlY3QgYSBsb2NhdGlvbiB3aGVyZSBhIGZpbGUgc2hvdWxkIGJlIHNhdmVkLlxuICogSXQgbWF5IHRocm93IGFuIGV4Y2VwdGlvbiBpbiBjYXNlIG9mIGVycm9ycy5cbiAqIEBwYXJhbSB7JG1vZGVscy5TYXZlRmlsZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTYXZlRmlsZShvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNDQxNzczNjQ0LCBvcHRpb25zKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBXYXJuaW5nIHNob3dzIGEgbW9kYWwgZGlhbG9nIGNvbnRhaW5pbmcgYSB3YXJuaW5nIG1lc3NhZ2UuXG4gKiBAcGFyYW0geyRtb2RlbHMuTWVzc2FnZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBXYXJuaW5nKG9wdGlvbnMpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDkzODQ1NDEwNSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgY2xhc3MgQnV0dG9uIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEJ1dHRvbiBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8QnV0dG9uPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBCdXR0b24uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUZXh0IHRoYXQgYXBwZWFycyB3aXRoaW4gdGhlIGJ1dHRvbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJMYWJlbFwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVHJ1ZSBpZiB0aGUgYnV0dG9uIHNob3VsZCBjYW5jZWwgYW4gb3BlcmF0aW9uIHdoZW4gY2xpY2tlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiSXNDYW5jZWxcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUcnVlIGlmIHRoZSBidXR0b24gc2hvdWxkIGJlIHRoZSBkZWZhdWx0IGFjdGlvbiB3aGVuIHRoZSB1c2VyIHByZXNzZXMgZW50ZXIuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIklzRGVmYXVsdFwiXSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBCdXR0b24gaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtCdXR0b259XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIG5ldyBCdXR0b24oLyoqIEB0eXBlIHtQYXJ0aWFsPEJ1dHRvbj59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRW52aXJvbm1lbnRJbmZvIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEVudmlyb25tZW50SW5mbyBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8RW52aXJvbm1lbnRJbmZvPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBFbnZpcm9ubWVudEluZm8uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIk9TXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBvcGVyYXRpbmcgc3lzdGVtIGluIHVzZS5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJPU1wiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJBcmNoXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBhcmNoaXRlY3R1cmUgb2YgdGhlIHN5c3RlbS5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJBcmNoXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIkRlYnVnXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRydWUgaWYgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gZGVidWcgbW9kZSwgb3RoZXJ3aXNlIGZhbHNlLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJEZWJ1Z1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiUGxhdGZvcm1JbmZvXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEFkZGl0aW9uYWwgcGxhdGZvcm0gaW5mb3JtYXRpb24uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7eyBbXzogc3RyaW5nXTogYW55IH19XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJQbGF0Zm9ybUluZm9cIl0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIk9TSW5mb1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEZXRhaWxzIG9mIHRoZSBvcGVyYXRpbmcgc3lzdGVtLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge09TSW5mb31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk9TSW5mb1wiXSA9IChuZXcgT1NJbmZvKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBFbnZpcm9ubWVudEluZm8gaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtFbnZpcm9ubWVudEluZm99XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBjb25zdCAkJGNyZWF0ZUZpZWxkM18wID0gJCRjcmVhdGVUeXBlMDtcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDRfMCA9ICQkY3JlYXRlVHlwZTE7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICBpZiAoXCJQbGF0Zm9ybUluZm9cIiBpbiAkJHBhcnNlZFNvdXJjZSkge1xuICAgICAgICAgICAgJCRwYXJzZWRTb3VyY2VbXCJQbGF0Zm9ybUluZm9cIl0gPSAkJGNyZWF0ZUZpZWxkM18wKCQkcGFyc2VkU291cmNlW1wiUGxhdGZvcm1JbmZvXCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJPU0luZm9cIiBpbiAkJHBhcnNlZFNvdXJjZSkge1xuICAgICAgICAgICAgJCRwYXJzZWRTb3VyY2VbXCJPU0luZm9cIl0gPSAkJGNyZWF0ZUZpZWxkNF8wKCQkcGFyc2VkU291cmNlW1wiT1NJbmZvXCJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEVudmlyb25tZW50SW5mbygvKiogQHR5cGUge1BhcnRpYWw8RW52aXJvbm1lbnRJbmZvPn0gKi8oJCRwYXJzZWRTb3VyY2UpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGaWxlRmlsdGVyIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEZpbGVGaWx0ZXIgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPEZpbGVGaWx0ZXI+fSBbJCRzb3VyY2UgPSB7fV0gLSBUaGUgc291cmNlIG9iamVjdCB0byBjcmVhdGUgdGhlIEZpbGVGaWx0ZXIuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBGaWx0ZXIgaW5mb3JtYXRpb24sIGUuZy4gXCJJbWFnZSBGaWxlcyAoKi5qcGcsICoucG5nKVwiXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGlzcGxheU5hbWVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFNlbWljb2xvbiBzZXBhcmF0ZWQgbGlzdCBvZiBleHRlbnNpb24gcGF0dGVybnMsIGUuZy4gXCIqLmpwZzsqLnBuZ1wiXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiUGF0dGVyblwiXSA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEZpbGVGaWx0ZXIgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtGaWxlRmlsdGVyfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgRmlsZUZpbHRlcigvKiogQHR5cGUge1BhcnRpYWw8RmlsZUZpbHRlcj59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTFJUQiB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBMUlRCIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxMUlRCPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBMUlRCLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKCEoXCJMZWZ0XCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJMZWZ0XCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlJpZ2h0XCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJSaWdodFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJUb3BcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlRvcFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJCb3R0b21cIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJvdHRvbVwiXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IExSVEIgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtMUlRCfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgTFJUQigvKiogQHR5cGUge1BhcnRpYWw8TFJUQj59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWVzc2FnZURpYWxvZ09wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTWVzc2FnZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPE1lc3NhZ2VEaWFsb2dPcHRpb25zPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBNZXNzYWdlRGlhbG9nT3B0aW9ucy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSB0aXRsZSBvZiB0aGUgZGlhbG9nIHdpbmRvdy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJUaXRsZVwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIG1haW4gbWVzc2FnZSB0byBzaG93IGluIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTWVzc2FnZVwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTGlzdCBvZiBidXR0b24gY2hvaWNlcyB0byBzaG93IGluIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7QnV0dG9uW10gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCdXR0b25zXCJdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93LlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJEZXRhY2hlZFwiXSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBNZXNzYWdlRGlhbG9nT3B0aW9ucyBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2FueX0gWyQkc291cmNlID0ge31dXG4gICAgICogQHJldHVybnMge01lc3NhZ2VEaWFsb2dPcHRpb25zfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDJfMCA9ICQkY3JlYXRlVHlwZTM7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICBpZiAoXCJCdXR0b25zXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiQnV0dG9uc1wiXSA9ICQkY3JlYXRlRmllbGQyXzAoJCRwYXJzZWRTb3VyY2VbXCJCdXR0b25zXCJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IE1lc3NhZ2VEaWFsb2dPcHRpb25zKC8qKiBAdHlwZSB7UGFydGlhbDxNZXNzYWdlRGlhbG9nT3B0aW9ucz59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT1NJbmZvIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IE9TSW5mbyBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8T1NJbmZvPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBPU0luZm8uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIklEXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBJRCBvZiB0aGUgT1MuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiSURcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiTmFtZVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgT1MuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTmFtZVwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJWZXJzaW9uXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSB2ZXJzaW9uIG9mIHRoZSBPUy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJWZXJzaW9uXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIkJyYW5kaW5nXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBicmFuZGluZyBvZiB0aGUgT1MuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQnJhbmRpbmdcIl0gPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBPU0luZm8gaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtPU0luZm99XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIG5ldyBPU0luZm8oLyoqIEB0eXBlIHtQYXJ0aWFsPE9TSW5mbz59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgT3BlbkZpbGVEaWFsb2dPcHRpb25zIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IE9wZW5GaWxlRGlhbG9nT3B0aW9ucyBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8T3BlbkZpbGVEaWFsb2dPcHRpb25zPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBPcGVuRmlsZURpYWxvZ09wdGlvbnMuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZGlyZWN0b3JpZXMgY2FuIGJlIGNob3Nlbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQ2FuQ2hvb3NlRGlyZWN0b3JpZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZmlsZXMgY2FuIGJlIGNob3Nlbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQ2FuQ2hvb3NlRmlsZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZGlyZWN0b3JpZXMgY2FuIGJlIGNyZWF0ZWQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkNhbkNyZWF0ZURpcmVjdG9yaWVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGhpZGRlbiBmaWxlcyBzaG91bGQgYmUgc2hvd24uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlNob3dIaWRkZW5GaWxlc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBhbGlhc2VzIHNob3VsZCBiZSByZXNvbHZlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiUmVzb2x2ZXNBbGlhc2VzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIG11bHRpcGxlIHNlbGVjdGlvbiBpcyBhbGxvd2VkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJBbGxvd3NNdWx0aXBsZVNlbGVjdGlvblwiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBleHRlbnNpb25zIHNob3VsZCBiZSBoaWRkZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkhpZGVFeHRlbnNpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGV4dGVuc2lvbnMgY2FuIGJlIHNlbGVjdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5TZWxlY3RIaWRkZW5FeHRlbnNpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZmlsZSBwYWNrYWdlcyBzaG91bGQgYmUgdHJlYXRlZCBhcyBkaXJlY3Rvcmllcy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVHJlYXRzRmlsZVBhY2thZ2VzQXNEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBvdGhlciBmaWxlIHR5cGVzIGFyZSBhbGxvd2VkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJBbGxvd3NPdGhlckZpbGVUeXBlc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRpdGxlIG9mIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVGl0bGVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk1lc3NhZ2VcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRleHQgdG8gZGlzcGxheSBvbiB0aGUgYnV0dG9uLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJ1dHRvblRleHRcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERpcmVjdG9yeSB0byBvcGVuIGluIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGlyZWN0b3J5XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBMaXN0IG9mIGZpbGUgZmlsdGVycy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtGaWxlRmlsdGVyW10gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJGaWx0ZXJzXCJdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93LlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJEZXRhY2hlZFwiXSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBPcGVuRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtPcGVuRmlsZURpYWxvZ09wdGlvbnN9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBjb25zdCAkJGNyZWF0ZUZpZWxkMTRfMCA9ICQkY3JlYXRlVHlwZTU7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICBpZiAoXCJGaWx0ZXJzXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiRmlsdGVyc1wiXSA9ICQkY3JlYXRlRmllbGQxNF8wKCQkcGFyc2VkU291cmNlW1wiRmlsdGVyc1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBPcGVuRmlsZURpYWxvZ09wdGlvbnMoLyoqIEB0eXBlIHtQYXJ0aWFsPE9wZW5GaWxlRGlhbG9nT3B0aW9ucz59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgUG9zaXRpb24ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUG9zaXRpb24gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFBvc2l0aW9uPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBQb3NpdGlvbi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiWFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiWFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJZXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJZXCJdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUG9zaXRpb24gaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtQb3NpdGlvbn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IFBvc2l0aW9uKC8qKiBAdHlwZSB7UGFydGlhbDxQb3NpdGlvbj59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgUkdCQSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBSR0JBIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxSR0JBPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBSR0JBLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKCEoXCJSZWRcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlJlZFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJHcmVlblwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiR3JlZW5cIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQmx1ZVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQmx1ZVwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJBbHBoYVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxwaGFcIl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBSR0JBIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7UkdCQX1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IFJHQkEoLyoqIEB0eXBlIHtQYXJ0aWFsPFJHQkE+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlY3Qge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUmVjdCBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8UmVjdD59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgUmVjdC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiWFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiWFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJZXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJZXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIldpZHRoXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJXaWR0aFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJIZWlnaHRcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkhlaWdodFwiXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFJlY3QgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtSZWN0fVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgUmVjdCgvKiogQHR5cGUge1BhcnRpYWw8UmVjdD59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2F2ZUZpbGVEaWFsb2dPcHRpb25zIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNhdmVGaWxlRGlhbG9nT3B0aW9ucyBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8U2F2ZUZpbGVEaWFsb2dPcHRpb25zPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBTYXZlRmlsZURpYWxvZ09wdGlvbnMuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZGlyZWN0b3JpZXMgY2FuIGJlIGNyZWF0ZWQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkNhbkNyZWF0ZURpcmVjdG9yaWVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGhpZGRlbiBmaWxlcyBzaG91bGQgYmUgc2hvd24uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlNob3dIaWRkZW5GaWxlc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBoaWRkZW4gZXh0ZW5zaW9ucyBjYW4gYmUgc2VsZWN0ZWQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkNhblNlbGVjdEhpZGRlbkV4dGVuc2lvblwiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBvdGhlciBmaWxlIHR5cGVzIGFyZSBhbGxvd2VkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJBbGxvd090aGVyRmlsZVR5cGVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIHRoZSBleHRlbnNpb24gc2hvdWxkIGJlIGhpZGRlbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiSGlkZUV4dGVuc2lvblwiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBmaWxlIHBhY2thZ2VzIHNob3VsZCBiZSB0cmVhdGVkIGFzIGRpcmVjdG9yaWVzLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJUcmVhdHNGaWxlUGFja2FnZXNBc0RpcmVjdG9yaWVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGl0bGUgb2YgdGhlIGRpYWxvZy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJUaXRsZVwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTWVzc2FnZSB0byBzaG93IGluIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTWVzc2FnZVwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRGlyZWN0b3J5IHRvIG9wZW4gaW4gdGhlIGRpYWxvZy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJEaXJlY3RvcnlcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERlZmF1bHQgZmlsZW5hbWUgdG8gdXNlIGluIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRmlsZW5hbWVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRleHQgdG8gZGlzcGxheSBvbiB0aGUgYnV0dG9uLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJ1dHRvblRleHRcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIExpc3Qgb2YgZmlsZSBmaWx0ZXJzLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge0ZpbGVGaWx0ZXJbXSB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkZpbHRlcnNcIl0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgZGlhbG9nIHNob3VsZCBhcHBlYXIgZGV0YWNoZWQgZnJvbSB0aGUgbWFpbiB3aW5kb3cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkRldGFjaGVkXCJdID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNhdmVGaWxlRGlhbG9nT3B0aW9ucyBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2FueX0gWyQkc291cmNlID0ge31dXG4gICAgICogQHJldHVybnMge1NhdmVGaWxlRGlhbG9nT3B0aW9uc31cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQxMV8wID0gJCRjcmVhdGVUeXBlNTtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIGlmIChcIkZpbHRlcnNcIiBpbiAkJHBhcnNlZFNvdXJjZSkge1xuICAgICAgICAgICAgJCRwYXJzZWRTb3VyY2VbXCJGaWx0ZXJzXCJdID0gJCRjcmVhdGVGaWVsZDExXzAoJCRwYXJzZWRTb3VyY2VbXCJGaWx0ZXJzXCJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFNhdmVGaWxlRGlhbG9nT3B0aW9ucygvKiogQHR5cGUge1BhcnRpYWw8U2F2ZUZpbGVEaWFsb2dPcHRpb25zPn0gKi8oJCRwYXJzZWRTb3VyY2UpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTY3JlZW4ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgU2NyZWVuIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxTY3JlZW4+fSBbJCRzb3VyY2UgPSB7fV0gLSBUaGUgc291cmNlIG9iamVjdCB0byBjcmVhdGUgdGhlIFNjcmVlbi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiSURcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQSB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIGRpc3BsYXlcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJJRFwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJOYW1lXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBuYW1lIG9mIHRoZSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTmFtZVwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJTY2FsZVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgc2NhbGUgZmFjdG9yIG9mIHRoZSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiU2NhbGVcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiWFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgeC1jb29yZGluYXRlIG9mIHRoZSB0b3AtbGVmdCBjb3JuZXIgb2YgdGhlIHJlY3RhbmdsZVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiWVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgeS1jb29yZGluYXRlIG9mIHRoZSB0b3AtbGVmdCBjb3JuZXIgb2YgdGhlIHJlY3RhbmdsZVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIllcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiSXNQcmltYXJ5XCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFdoZXRoZXIgdGhpcyBpcyB0aGUgcHJpbWFyeSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIklzUHJpbWFyeVwiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiUm90YXRpb25cIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHJvdGF0aW9uIG9mIHRoZSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiUm90YXRpb25cIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiU2l6ZVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgc2l6ZSBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge1NpemV9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJTaXplXCJdID0gKG5ldyBTaXplKCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQm91bmRzXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBib3VuZHMgb2YgdGhlIGRpc3BsYXlcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtSZWN0fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQm91bmRzXCJdID0gKG5ldyBSZWN0KCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiV29ya0FyZWFcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHdvcmsgYXJlYSBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge1JlY3R9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJXb3JrQXJlYVwiXSA9IChuZXcgUmVjdCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgU2NyZWVuIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7U2NyZWVufVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDdfMCA9ICQkY3JlYXRlVHlwZTY7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQ4XzAgPSAkJGNyZWF0ZVR5cGU3O1xuICAgICAgICBjb25zdCAkJGNyZWF0ZUZpZWxkOV8wID0gJCRjcmVhdGVUeXBlNztcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIGlmIChcIlNpemVcIiBpbiAkJHBhcnNlZFNvdXJjZSkge1xuICAgICAgICAgICAgJCRwYXJzZWRTb3VyY2VbXCJTaXplXCJdID0gJCRjcmVhdGVGaWVsZDdfMCgkJHBhcnNlZFNvdXJjZVtcIlNpemVcIl0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcIkJvdW5kc1wiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIkJvdW5kc1wiXSA9ICQkY3JlYXRlRmllbGQ4XzAoJCRwYXJzZWRTb3VyY2VbXCJCb3VuZHNcIl0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcIldvcmtBcmVhXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiV29ya0FyZWFcIl0gPSAkJGNyZWF0ZUZpZWxkOV8wKCQkcGFyc2VkU291cmNlW1wiV29ya0FyZWFcIl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgU2NyZWVuKC8qKiBAdHlwZSB7UGFydGlhbDxTY3JlZW4+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNpemUge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgU2l6ZSBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8U2l6ZT59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgU2l6ZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiV2lkdGhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIldpZHRoXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIkhlaWdodFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiSGVpZ2h0XCJdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgU2l6ZSBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2FueX0gWyQkc291cmNlID0ge31dXG4gICAgICogQHJldHVybnMge1NpemV9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIG5ldyBTaXplKC8qKiBAdHlwZSB7UGFydGlhbDxTaXplPn0gKi8oJCRwYXJzZWRTb3VyY2UpKTtcbiAgICB9XG59XG5cbi8vIFByaXZhdGUgdHlwZSBjcmVhdGlvbiBmdW5jdGlvbnNcbmNvbnN0ICQkY3JlYXRlVHlwZTAgPSAkQ3JlYXRlLk1hcCgkQ3JlYXRlLkFueSwgJENyZWF0ZS5BbnkpO1xuY29uc3QgJCRjcmVhdGVUeXBlMSA9IE9TSW5mby5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlMiA9IEJ1dHRvbi5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlMyA9ICRDcmVhdGUuQXJyYXkoJCRjcmVhdGVUeXBlMik7XG5jb25zdCAkJGNyZWF0ZVR5cGU0ID0gRmlsZUZpbHRlci5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlNSA9ICRDcmVhdGUuQXJyYXkoJCRjcmVhdGVUeXBlNCk7XG5jb25zdCAkJGNyZWF0ZVR5cGU2ID0gU2l6ZS5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlNyA9IFJlY3QuY3JlYXRlRnJvbTtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQgeyBDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZSB9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuL2xpc3RlbmVyLmpzXCI7XG5cbi8qKlxuICogRW1pdCBlbWl0cyBhbiBldmVudCB1c2luZyB0aGUgZ2l2ZW4gZXZlbnQgb2JqZWN0LlxuICogWW91IGNhbiBwYXNzIGluIGluc3RhbmNlcyBvZiB0aGUgY2xhc3MgYFdhaWxzRXZlbnRgLlxuICogQHBhcmFtIHt7XCJuYW1lXCI6IHN0cmluZywgXCJkYXRhXCI6IGFueX19IGV2ZW50XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVtaXQoZXZlbnQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI0ODA2ODIzOTIsIGV2ZW50KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cbiIsICJcbmV4cG9ydCBjb25zdCBFdmVudFR5cGVzID0ge1xuXHRXaW5kb3dzOiB7XG5cdFx0U3lzdGVtVGhlbWVDaGFuZ2VkOiBcIndpbmRvd3M6U3lzdGVtVGhlbWVDaGFuZ2VkXCIsXG5cdFx0QVBNUG93ZXJTdGF0dXNDaGFuZ2U6IFwid2luZG93czpBUE1Qb3dlclN0YXR1c0NoYW5nZVwiLFxuXHRcdEFQTVN1c3BlbmQ6IFwid2luZG93czpBUE1TdXNwZW5kXCIsXG5cdFx0QVBNUmVzdW1lQXV0b21hdGljOiBcIndpbmRvd3M6QVBNUmVzdW1lQXV0b21hdGljXCIsXG5cdFx0QVBNUmVzdW1lU3VzcGVuZDogXCJ3aW5kb3dzOkFQTVJlc3VtZVN1c3BlbmRcIixcblx0XHRBUE1Qb3dlclNldHRpbmdDaGFuZ2U6IFwid2luZG93czpBUE1Qb3dlclNldHRpbmdDaGFuZ2VcIixcblx0XHRBcHBsaWNhdGlvblN0YXJ0ZWQ6IFwid2luZG93czpBcHBsaWNhdGlvblN0YXJ0ZWRcIixcblx0XHRXZWJWaWV3TmF2aWdhdGlvbkNvbXBsZXRlZDogXCJ3aW5kb3dzOldlYlZpZXdOYXZpZ2F0aW9uQ29tcGxldGVkXCIsXG5cdFx0V2luZG93SW5hY3RpdmU6IFwid2luZG93czpXaW5kb3dJbmFjdGl2ZVwiLFxuXHRcdFdpbmRvd0FjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0FjdGl2ZVwiLFxuXHRcdFdpbmRvd0NsaWNrQWN0aXZlOiBcIndpbmRvd3M6V2luZG93Q2xpY2tBY3RpdmVcIixcblx0XHRXaW5kb3dNYXhpbWlzZTogXCJ3aW5kb3dzOldpbmRvd01heGltaXNlXCIsXG5cdFx0V2luZG93VW5NYXhpbWlzZTogXCJ3aW5kb3dzOldpbmRvd1VuTWF4aW1pc2VcIixcblx0XHRXaW5kb3dGdWxsc2NyZWVuOiBcIndpbmRvd3M6V2luZG93RnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd1VuRnVsbHNjcmVlbjogXCJ3aW5kb3dzOldpbmRvd1VuRnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd1Jlc3RvcmU6IFwid2luZG93czpXaW5kb3dSZXN0b3JlXCIsXG5cdFx0V2luZG93TWluaW1pc2U6IFwid2luZG93czpXaW5kb3dNaW5pbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWluaW1pc2U6IFwid2luZG93czpXaW5kb3dVbk1pbmltaXNlXCIsXG5cdFx0V2luZG93Q2xvc2U6IFwid2luZG93czpXaW5kb3dDbG9zZVwiLFxuXHRcdFdpbmRvd1NldEZvY3VzOiBcIndpbmRvd3M6V2luZG93U2V0Rm9jdXNcIixcblx0XHRXaW5kb3dLaWxsRm9jdXM6IFwid2luZG93czpXaW5kb3dLaWxsRm9jdXNcIixcblx0XHRXaW5kb3dEcmFnRHJvcDogXCJ3aW5kb3dzOldpbmRvd0RyYWdEcm9wXCIsXG5cdFx0V2luZG93RHJhZ0VudGVyOiBcIndpbmRvd3M6V2luZG93RHJhZ0VudGVyXCIsXG5cdFx0V2luZG93RHJhZ0xlYXZlOiBcIndpbmRvd3M6V2luZG93RHJhZ0xlYXZlXCIsXG5cdFx0V2luZG93RHJhZ092ZXI6IFwid2luZG93czpXaW5kb3dEcmFnT3ZlclwiLFxuXHR9LFxuXHRNYWM6IHtcblx0XHRBcHBsaWNhdGlvbkRpZEJlY29tZUFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25EaWRCZWNvbWVBY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZUVmZmVjdGl2ZUFwcGVhcmFuY2VcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUljb246IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlSWNvblwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVNjcmVlblBhcmFtZXRlcnM6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlU2NyZWVuUGFyYW1ldGVyc1wiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlU3RhdHVzQmFyRnJhbWU6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlU3RhdHVzQmFyRnJhbWVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVN0YXR1c0Jhck9yaWVudGF0aW9uXCIsXG5cdFx0QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmc6IFwibWFjOkFwcGxpY2F0aW9uRGlkRmluaXNoTGF1bmNoaW5nXCIsXG5cdFx0QXBwbGljYXRpb25EaWRIaWRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZEhpZGVcIixcblx0XHRBcHBsaWNhdGlvbkRpZFJlc2lnbkFjdGl2ZU5vdGlmaWNhdGlvbjogXCJtYWM6QXBwbGljYXRpb25EaWRSZXNpZ25BY3RpdmVOb3RpZmljYXRpb25cIixcblx0XHRBcHBsaWNhdGlvbkRpZFVuaGlkZTogXCJtYWM6QXBwbGljYXRpb25EaWRVbmhpZGVcIixcblx0XHRBcHBsaWNhdGlvbkRpZFVwZGF0ZTogXCJtYWM6QXBwbGljYXRpb25EaWRVcGRhdGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxCZWNvbWVBY3RpdmU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbEJlY29tZUFjdGl2ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbEZpbmlzaExhdW5jaGluZzogXCJtYWM6QXBwbGljYXRpb25XaWxsRmluaXNoTGF1bmNoaW5nXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsSGlkZTogXCJtYWM6QXBwbGljYXRpb25XaWxsSGlkZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFJlc2lnbkFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsUmVzaWduQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsVGVybWluYXRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxUZXJtaW5hdGVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxVbmhpZGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFVuaGlkZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFVwZGF0ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVXBkYXRlXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VUaGVtZTogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VUaGVtZSFcIixcblx0XHRBcHBsaWNhdGlvblNob3VsZEhhbmRsZVJlb3BlbjogXCJtYWM6QXBwbGljYXRpb25TaG91bGRIYW5kbGVSZW9wZW4hXCIsXG5cdFx0V2luZG93RGlkQmVjb21lS2V5OiBcIm1hYzpXaW5kb3dEaWRCZWNvbWVLZXlcIixcblx0XHRXaW5kb3dEaWRCZWNvbWVNYWluOiBcIm1hYzpXaW5kb3dEaWRCZWNvbWVNYWluXCIsXG5cdFx0V2luZG93RGlkQmVnaW5TaGVldDogXCJtYWM6V2luZG93RGlkQmVnaW5TaGVldFwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUFscGhhOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VBbHBoYVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUJhY2tpbmdMb2NhdGlvbjogXCJtYWM6V2luZG93RGlkQ2hhbmdlQmFja2luZ0xvY2F0aW9uXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlQmFja2luZ1Byb3BlcnRpZXM6IFwibWFjOldpbmRvd0RpZENoYW5nZUJhY2tpbmdQcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VDb2xsZWN0aW9uQmVoYXZpb3JcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VFZmZlY3RpdmVBcHBlYXJhbmNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGU6IFwibWFjOldpbmRvd0RpZENoYW5nZU9jY2x1c2lvblN0YXRlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlT3JkZXJpbmdNb2RlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VPcmRlcmluZ01vZGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW46IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnM6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblBhcmFtZXRlcnNcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW5Qcm9maWxlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5Qcm9maWxlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VQcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTaGFyaW5nVHlwZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2hhcmluZ1R5cGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTcGFjZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU3BhY2VcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTcGFjZU9yZGVyaW5nTW9kZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU3BhY2VPcmRlcmluZ01vZGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VUaXRsZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlVGl0bGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VUb29sYmFyOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VUb29sYmFyXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlVmlzaWJpbGl0eTogXCJtYWM6V2luZG93RGlkQ2hhbmdlVmlzaWJpbGl0eVwiLFxuXHRcdFdpbmRvd0RpZERlbWluaWF0dXJpemU6IFwibWFjOldpbmRvd0RpZERlbWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dEaWRFbmRTaGVldDogXCJtYWM6V2luZG93RGlkRW5kU2hlZXRcIixcblx0XHRXaW5kb3dEaWRFbnRlckZ1bGxTY3JlZW46IFwibWFjOldpbmRvd0RpZEVudGVyRnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZEVudGVyVmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd0RpZEVudGVyVmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dEaWRFeGl0RnVsbFNjcmVlbjogXCJtYWM6V2luZG93RGlkRXhpdEZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dEaWRFeGl0VmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd0RpZEV4aXRWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd0RpZEV4cG9zZTogXCJtYWM6V2luZG93RGlkRXhwb3NlXCIsXG5cdFx0V2luZG93RGlkRm9jdXM6IFwibWFjOldpbmRvd0RpZEZvY3VzXCIsXG5cdFx0V2luZG93RGlkTWluaWF0dXJpemU6IFwibWFjOldpbmRvd0RpZE1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93RGlkTW92ZTogXCJtYWM6V2luZG93RGlkTW92ZVwiLFxuXHRcdFdpbmRvd0RpZE9yZGVyT2ZmU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRPcmRlck9mZlNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZE9yZGVyT25TY3JlZW46IFwibWFjOldpbmRvd0RpZE9yZGVyT25TY3JlZW5cIixcblx0XHRXaW5kb3dEaWRSZXNpZ25LZXk6IFwibWFjOldpbmRvd0RpZFJlc2lnbktleVwiLFxuXHRcdFdpbmRvd0RpZFJlc2lnbk1haW46IFwibWFjOldpbmRvd0RpZFJlc2lnbk1haW5cIixcblx0XHRXaW5kb3dEaWRSZXNpemU6IFwibWFjOldpbmRvd0RpZFJlc2l6ZVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZTogXCJtYWM6V2luZG93RGlkVXBkYXRlXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlQWxwaGE6IFwibWFjOldpbmRvd0RpZFVwZGF0ZUFscGhhXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvbkJlaGF2aW9yOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3JcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllczogXCJtYWM6V2luZG93RGlkVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXNcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVTaGFkb3c6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVNoYWRvd1wiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZVRpdGxlOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVUaXRsZVwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZVRvb2xiYXI6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVRvb2xiYXJcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVWaXNpYmlsaXR5OiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVWaXNpYmlsaXR5XCIsXG5cdFx0V2luZG93U2hvdWxkQ2xvc2U6IFwibWFjOldpbmRvd1Nob3VsZENsb3NlIVwiLFxuXHRcdFdpbmRvd1dpbGxCZWNvbWVLZXk6IFwibWFjOldpbmRvd1dpbGxCZWNvbWVLZXlcIixcblx0XHRXaW5kb3dXaWxsQmVjb21lTWFpbjogXCJtYWM6V2luZG93V2lsbEJlY29tZU1haW5cIixcblx0XHRXaW5kb3dXaWxsQmVnaW5TaGVldDogXCJtYWM6V2luZG93V2lsbEJlZ2luU2hlZXRcIixcblx0XHRXaW5kb3dXaWxsQ2hhbmdlT3JkZXJpbmdNb2RlOiBcIm1hYzpXaW5kb3dXaWxsQ2hhbmdlT3JkZXJpbmdNb2RlXCIsXG5cdFx0V2luZG93V2lsbENsb3NlOiBcIm1hYzpXaW5kb3dXaWxsQ2xvc2VcIixcblx0XHRXaW5kb3dXaWxsRGVtaW5pYXR1cml6ZTogXCJtYWM6V2luZG93V2lsbERlbWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dXaWxsRW50ZXJGdWxsU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsRW50ZXJGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbEVudGVyVmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd1dpbGxFbnRlclZlcnNpb25Ccm93c2VyXCIsXG5cdFx0V2luZG93V2lsbEV4aXRGdWxsU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsRXhpdEZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dXaWxsRXhpdFZlcnNpb25Ccm93c2VyOiBcIm1hYzpXaW5kb3dXaWxsRXhpdFZlcnNpb25Ccm93c2VyXCIsXG5cdFx0V2luZG93V2lsbEZvY3VzOiBcIm1hYzpXaW5kb3dXaWxsRm9jdXNcIixcblx0XHRXaW5kb3dXaWxsTWluaWF0dXJpemU6IFwibWFjOldpbmRvd1dpbGxNaW5pYXR1cml6ZVwiLFxuXHRcdFdpbmRvd1dpbGxNb3ZlOiBcIm1hYzpXaW5kb3dXaWxsTW92ZVwiLFxuXHRcdFdpbmRvd1dpbGxPcmRlck9mZlNjcmVlbjogXCJtYWM6V2luZG93V2lsbE9yZGVyT2ZmU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbE9yZGVyT25TY3JlZW46IFwibWFjOldpbmRvd1dpbGxPcmRlck9uU2NyZWVuXCIsXG5cdFx0V2luZG93V2lsbFJlc2lnbk1haW46IFwibWFjOldpbmRvd1dpbGxSZXNpZ25NYWluXCIsXG5cdFx0V2luZG93V2lsbFJlc2l6ZTogXCJtYWM6V2luZG93V2lsbFJlc2l6ZVwiLFxuXHRcdFdpbmRvd1dpbGxVbmZvY3VzOiBcIm1hYzpXaW5kb3dXaWxsVW5mb2N1c1wiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGU6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlQWxwaGE6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVBbHBoYVwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3I6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3JcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlQ29sbGVjdGlvblByb3BlcnRpZXM6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllc1wiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVTaGFkb3c6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVTaGFkb3dcIixcblx0XHRXaW5kb3dXaWxsVXBkYXRlVGl0bGU6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVUaXRsZVwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVUb29sYmFyOiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVG9vbGJhclwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVWaXNpYmlsaXR5OiBcIm1hYzpXaW5kb3dXaWxsVXBkYXRlVmlzaWJpbGl0eVwiLFxuXHRcdFdpbmRvd1dpbGxVc2VTdGFuZGFyZEZyYW1lOiBcIm1hYzpXaW5kb3dXaWxsVXNlU3RhbmRhcmRGcmFtZVwiLFxuXHRcdE1lbnVXaWxsT3BlbjogXCJtYWM6TWVudVdpbGxPcGVuXCIsXG5cdFx0TWVudURpZE9wZW46IFwibWFjOk1lbnVEaWRPcGVuXCIsXG5cdFx0TWVudURpZENsb3NlOiBcIm1hYzpNZW51RGlkQ2xvc2VcIixcblx0XHRNZW51V2lsbFNlbmRBY3Rpb246IFwibWFjOk1lbnVXaWxsU2VuZEFjdGlvblwiLFxuXHRcdE1lbnVEaWRTZW5kQWN0aW9uOiBcIm1hYzpNZW51RGlkU2VuZEFjdGlvblwiLFxuXHRcdE1lbnVXaWxsSGlnaGxpZ2h0SXRlbTogXCJtYWM6TWVudVdpbGxIaWdobGlnaHRJdGVtXCIsXG5cdFx0TWVudURpZEhpZ2hsaWdodEl0ZW06IFwibWFjOk1lbnVEaWRIaWdobGlnaHRJdGVtXCIsXG5cdFx0TWVudVdpbGxEaXNwbGF5SXRlbTogXCJtYWM6TWVudVdpbGxEaXNwbGF5SXRlbVwiLFxuXHRcdE1lbnVEaWREaXNwbGF5SXRlbTogXCJtYWM6TWVudURpZERpc3BsYXlJdGVtXCIsXG5cdFx0TWVudVdpbGxBZGRJdGVtOiBcIm1hYzpNZW51V2lsbEFkZEl0ZW1cIixcblx0XHRNZW51RGlkQWRkSXRlbTogXCJtYWM6TWVudURpZEFkZEl0ZW1cIixcblx0XHRNZW51V2lsbFJlbW92ZUl0ZW06IFwibWFjOk1lbnVXaWxsUmVtb3ZlSXRlbVwiLFxuXHRcdE1lbnVEaWRSZW1vdmVJdGVtOiBcIm1hYzpNZW51RGlkUmVtb3ZlSXRlbVwiLFxuXHRcdE1lbnVXaWxsQmVnaW5UcmFja2luZzogXCJtYWM6TWVudVdpbGxCZWdpblRyYWNraW5nXCIsXG5cdFx0TWVudURpZEJlZ2luVHJhY2tpbmc6IFwibWFjOk1lbnVEaWRCZWdpblRyYWNraW5nXCIsXG5cdFx0TWVudVdpbGxFbmRUcmFja2luZzogXCJtYWM6TWVudVdpbGxFbmRUcmFja2luZ1wiLFxuXHRcdE1lbnVEaWRFbmRUcmFja2luZzogXCJtYWM6TWVudURpZEVuZFRyYWNraW5nXCIsXG5cdFx0TWVudVdpbGxVcGRhdGU6IFwibWFjOk1lbnVXaWxsVXBkYXRlXCIsXG5cdFx0TWVudURpZFVwZGF0ZTogXCJtYWM6TWVudURpZFVwZGF0ZVwiLFxuXHRcdE1lbnVXaWxsUG9wVXA6IFwibWFjOk1lbnVXaWxsUG9wVXBcIixcblx0XHRNZW51RGlkUG9wVXA6IFwibWFjOk1lbnVEaWRQb3BVcFwiLFxuXHRcdE1lbnVXaWxsU2VuZEFjdGlvblRvSXRlbTogXCJtYWM6TWVudVdpbGxTZW5kQWN0aW9uVG9JdGVtXCIsXG5cdFx0TWVudURpZFNlbmRBY3Rpb25Ub0l0ZW06IFwibWFjOk1lbnVEaWRTZW5kQWN0aW9uVG9JdGVtXCIsXG5cdFx0V2ViVmlld0RpZFN0YXJ0UHJvdmlzaW9uYWxOYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkU3RhcnRQcm92aXNpb25hbE5hdmlnYXRpb25cIixcblx0XHRXZWJWaWV3RGlkUmVjZWl2ZVNlcnZlclJlZGlyZWN0Rm9yUHJvdmlzaW9uYWxOYXZpZ2F0aW9uOiBcIm1hYzpXZWJWaWV3RGlkUmVjZWl2ZVNlcnZlclJlZGlyZWN0Rm9yUHJvdmlzaW9uYWxOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZEZpbmlzaE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRGaW5pc2hOYXZpZ2F0aW9uXCIsXG5cdFx0V2ViVmlld0RpZENvbW1pdE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRDb21taXROYXZpZ2F0aW9uXCIsXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nRW50ZXJlZFwiLFxuXHRcdFdpbmRvd0ZpbGVEcmFnZ2luZ1BlcmZvcm1lZDogXCJtYWM6V2luZG93RmlsZURyYWdnaW5nUGVyZm9ybWVkXCIsXG5cdFx0V2luZG93RmlsZURyYWdnaW5nRXhpdGVkOiBcIm1hYzpXaW5kb3dGaWxlRHJhZ2dpbmdFeGl0ZWRcIixcblx0fSxcblx0TGludXg6IHtcblx0XHRTeXN0ZW1UaGVtZUNoYW5nZWQ6IFwibGludXg6U3lzdGVtVGhlbWVDaGFuZ2VkXCIsXG5cdFx0V2luZG93TG9hZENoYW5nZWQ6IFwibGludXg6V2luZG93TG9hZENoYW5nZWRcIixcblx0XHRXaW5kb3dEZWxldGVFdmVudDogXCJsaW51eDpXaW5kb3dEZWxldGVFdmVudFwiLFxuXHRcdFdpbmRvd0ZvY3VzSW46IFwibGludXg6V2luZG93Rm9jdXNJblwiLFxuXHRcdFdpbmRvd0ZvY3VzT3V0OiBcImxpbnV4OldpbmRvd0ZvY3VzT3V0XCIsXG5cdFx0QXBwbGljYXRpb25TdGFydHVwOiBcImxpbnV4OkFwcGxpY2F0aW9uU3RhcnR1cFwiLFxuXHR9LFxuXHRDb21tb246IHtcblx0XHRBcHBsaWNhdGlvblN0YXJ0ZWQ6IFwiY29tbW9uOkFwcGxpY2F0aW9uU3RhcnRlZFwiLFxuXHRcdFdpbmRvd01heGltaXNlOiBcImNvbW1vbjpXaW5kb3dNYXhpbWlzZVwiLFxuXHRcdFdpbmRvd1VuTWF4aW1pc2U6IFwiY29tbW9uOldpbmRvd1VuTWF4aW1pc2VcIixcblx0XHRXaW5kb3dGdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dGdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93VW5GdWxsc2NyZWVuOiBcImNvbW1vbjpXaW5kb3dVbkZ1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dSZXN0b3JlOiBcImNvbW1vbjpXaW5kb3dSZXN0b3JlXCIsXG5cdFx0V2luZG93TWluaW1pc2U6IFwiY29tbW9uOldpbmRvd01pbmltaXNlXCIsXG5cdFx0V2luZG93VW5NaW5pbWlzZTogXCJjb21tb246V2luZG93VW5NaW5pbWlzZVwiLFxuXHRcdFdpbmRvd0Nsb3Npbmc6IFwiY29tbW9uOldpbmRvd0Nsb3NpbmdcIixcblx0XHRXaW5kb3dab29tOiBcImNvbW1vbjpXaW5kb3dab29tXCIsXG5cdFx0V2luZG93Wm9vbUluOiBcImNvbW1vbjpXaW5kb3dab29tSW5cIixcblx0XHRXaW5kb3dab29tT3V0OiBcImNvbW1vbjpXaW5kb3dab29tT3V0XCIsXG5cdFx0V2luZG93Wm9vbVJlc2V0OiBcImNvbW1vbjpXaW5kb3dab29tUmVzZXRcIixcblx0XHRXaW5kb3dGb2N1czogXCJjb21tb246V2luZG93Rm9jdXNcIixcblx0XHRXaW5kb3dMb3N0Rm9jdXM6IFwiY29tbW9uOldpbmRvd0xvc3RGb2N1c1wiLFxuXHRcdFdpbmRvd1Nob3c6IFwiY29tbW9uOldpbmRvd1Nob3dcIixcblx0XHRXaW5kb3dIaWRlOiBcImNvbW1vbjpXaW5kb3dIaWRlXCIsXG5cdFx0V2luZG93RFBJQ2hhbmdlZDogXCJjb21tb246V2luZG93RFBJQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd0ZpbGVzRHJvcHBlZDogXCJjb21tb246V2luZG93RmlsZXNEcm9wcGVkXCIsXG5cdFx0V2luZG93UnVudGltZVJlYWR5OiBcImNvbW1vbjpXaW5kb3dSdW50aW1lUmVhZHlcIixcblx0XHRUaGVtZUNoYW5nZWQ6IFwiY29tbW9uOlRoZW1lQ2hhbmdlZFwiLFxuXHR9LFxufTtcbiIsICIvLyBAdHMtbm9jaGVja1xuLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuaW1wb3J0IHtFdmVudFR5cGVzfSBmcm9tIFwiLi9ldmVudF90eXBlcy5qc1wiO1xuZXhwb3J0IGNvbnN0IFR5cGVzID0gRXZlbnRUeXBlcztcblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xud2luZG93Ll93YWlscy5kaXNwYXRjaFdhaWxzRXZlbnQgPSBkaXNwYXRjaFdhaWxzRXZlbnQ7XG5cbmNvbnN0IGV2ZW50TGlzdGVuZXJzID0gbmV3IE1hcCgpO1xuXG5jbGFzcyBMaXN0ZW5lciB7XG4gICAgY29uc3RydWN0b3IoZXZlbnROYW1lLCBjYWxsYmFjaywgbWF4Q2FsbGJhY2tzKSB7XG4gICAgICAgIHRoaXMuZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgICAgICB0aGlzLm1heENhbGxiYWNrcyA9IG1heENhbGxiYWNrcyB8fCAtMTtcbiAgICAgICAgdGhpcy5DYWxsYmFjayA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1heENhbGxiYWNrcyA9PT0gLTEpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubWF4Q2FsbGJhY2tzIC09IDE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXhDYWxsYmFja3MgPT09IDA7XG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vKipcbiAqIERlc2NyaWJlcyBhIFdhaWxzIGFwcGxpY2F0aW9uIGV2ZW50LlxuICovXG5leHBvcnQgY2xhc3MgV2FpbHNFdmVudCB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyB3YWlscyBldmVudCBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0geyp9IFtkYXRhXSAtIEFyYml0cmFyeSBkYXRhIGFzc29jaWF0ZWQgdG8gdGhlIGV2ZW50LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG5hbWUsIGRhdGEgPSBudWxsKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmJpdHJhcnkgZGF0YSBhc3NvY2lhdGVkIHRvIHRoZSBldmVudC5cbiAgICAgICAgICogQHR5cGUgeyp9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hXYWlsc0V2ZW50KGV2ZW50KSB7XG4gICAgY29uc3Qgd2V2ZW50ID0gLyoqIEB0eXBlIHthbnl9ICovKG5ldyBXYWlsc0V2ZW50KGV2ZW50Lm5hbWUsIGV2ZW50LmRhdGEpKVxuICAgIE9iamVjdC5hc3NpZ24od2V2ZW50LCBldmVudClcbiAgICBldmVudCA9IHdldmVudDtcblxuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnQubmFtZSk7XG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgICBsZXQgdG9SZW1vdmUgPSBsaXN0ZW5lcnMuZmlsdGVyKGxpc3RlbmVyID0+IHtcbiAgICAgICAgICAgIGxldCByZW1vdmUgPSBsaXN0ZW5lci5DYWxsYmFjayhldmVudCk7XG4gICAgICAgICAgICBpZiAocmVtb3ZlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0b1JlbW92ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuZmlsdGVyKGwgPT4gIXRvUmVtb3ZlLmluY2x1ZGVzKGwpKTtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSBldmVudExpc3RlbmVycy5kZWxldGUoZXZlbnQubmFtZSk7XG4gICAgICAgICAgICBlbHNlIGV2ZW50TGlzdGVuZXJzLnNldChldmVudC5uYW1lLCBsaXN0ZW5lcnMpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIHNwZWNpZmljIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZvci5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyB0cmlnZ2VyZWQuXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4Q2FsbGJhY2tzIC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIHRpbWVzIHRoZSBjYWxsYmFjayBjYW4gYmUgY2FsbGVkIGZvciB0aGUgZXZlbnQuIE9uY2UgdGhlIG1heGltdW0gbnVtYmVyIGlzIHJlYWNoZWQsIHRoZSBjYWxsYmFjayB3aWxsIG5vIGxvbmdlciBiZSBjYWxsZWQuXG4gKlxuIEByZXR1cm4ge2Z1bmN0aW9ufSAtIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIHdpbGwgdW5yZWdpc3RlciB0aGUgY2FsbGJhY2sgZnJvbSB0aGUgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIG1heENhbGxiYWNrcykge1xuICAgIGxldCBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycy5nZXQoZXZlbnROYW1lKSB8fCBbXTtcbiAgICBjb25zdCB0aGlzTGlzdGVuZXIgPSBuZXcgTGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjaywgbWF4Q2FsbGJhY2tzKTtcbiAgICBsaXN0ZW5lcnMucHVzaCh0aGlzTGlzdGVuZXIpO1xuICAgIGV2ZW50TGlzdGVuZXJzLnNldChldmVudE5hbWUsIGxpc3RlbmVycyk7XG4gICAgcmV0dXJuICgpID0+IGxpc3RlbmVyT2ZmKHRoaXNMaXN0ZW5lcik7XG59XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgc3BlY2lmaWVkIGV2ZW50IG9jY3Vycy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQuIEl0IHRha2VzIG5vIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gLSBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHsgcmV0dXJuIE9uTXVsdGlwbGUoZXZlbnROYW1lLCBjYWxsYmFjaywgLTEpOyB9XG5cbi8qKlxuICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgb25seSBvbmNlIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBldmVudCBvY2N1cnMuXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gLSBBIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLCB3aWxsIHVucmVnaXN0ZXIgdGhlIGNhbGxiYWNrIGZyb20gdGhlIGV2ZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gT25jZShldmVudE5hbWUsIGNhbGxiYWNrKSB7IHJldHVybiBPbk11bHRpcGxlKGV2ZW50TmFtZSwgY2FsbGJhY2ssIDEpOyB9XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGxpc3RlbmVyIGZyb20gdGhlIGV2ZW50IGxpc3RlbmVycyBjb2xsZWN0aW9uLlxuICogSWYgYWxsIGxpc3RlbmVycyBmb3IgdGhlIGV2ZW50IGFyZSByZW1vdmVkLCB0aGUgZXZlbnQga2V5IGlzIGRlbGV0ZWQgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gbGlzdGVuZXIgLSBUaGUgbGlzdGVuZXIgdG8gYmUgcmVtb3ZlZC5cbiAqL1xuZnVuY3Rpb24gbGlzdGVuZXJPZmYobGlzdGVuZXIpIHtcbiAgICBjb25zdCBldmVudE5hbWUgPSBsaXN0ZW5lci5ldmVudE5hbWU7XG4gICAgbGV0IGxpc3RlbmVycyA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudE5hbWUpLmZpbHRlcihsID0+IGwgIT09IGxpc3RlbmVyKTtcbiAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkgZXZlbnRMaXN0ZW5lcnMuZGVsZXRlKGV2ZW50TmFtZSk7XG4gICAgZWxzZSBldmVudExpc3RlbmVycy5zZXQoZXZlbnROYW1lLCBsaXN0ZW5lcnMpO1xufVxuXG5cbi8qKlxuICogUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQgbmFtZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byByZW1vdmUgbGlzdGVuZXJzIGZvci5cbiAqIEBwYXJhbSB7Li4uc3RyaW5nfSBhZGRpdGlvbmFsRXZlbnROYW1lcyAtIEFkZGl0aW9uYWwgZXZlbnQgbmFtZXMgdG8gcmVtb3ZlIGxpc3RlbmVycyBmb3IuXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPZmYoZXZlbnROYW1lLCAuLi5hZGRpdGlvbmFsRXZlbnROYW1lcykge1xuICAgIGxldCBldmVudHNUb1JlbW92ZSA9IFtldmVudE5hbWUsIC4uLmFkZGl0aW9uYWxFdmVudE5hbWVzXTtcbiAgICBldmVudHNUb1JlbW92ZS5mb3JFYWNoKGV2ZW50TmFtZSA9PiBldmVudExpc3RlbmVycy5kZWxldGUoZXZlbnROYW1lKSk7XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBmdW5jdGlvbiBPZmZBbGxcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gT2ZmQWxsKCkgeyBldmVudExpc3RlbmVycy5jbGVhcigpOyB9XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi4vY29yZS9mbGFncy5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7IENhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuaW1wb3J0ICogYXMgJG1vZGVscyBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuZXhwb3J0IHtTY3JlZW4sIFJlY3QsIFNpemV9IGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG4vKipcbiAqIEdldEFsbCByZXR1cm5zIGRlc2NyaXB0b3JzIGZvciBhbGwgc2NyZWVucy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuU2NyZWVuW10+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0QWxsKCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjM2NzcwNTUzMik7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMSgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogR2V0Q3VycmVudCByZXR1cm5zIGEgZGVzY3JpcHRvciBmb3IgdGhlIHNjcmVlblxuICogd2hlcmUgdGhlIGN1cnJlbnRseSBhY3RpdmUgd2luZG93IGlzIGxvY2F0ZWQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRDdXJyZW50KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzE2NzU3MjE4KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUwKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBHZXRQcmltYXJ5IHJldHVybnMgYSBkZXNjcmlwdG9yIGZvciB0aGUgcHJpbWFyeSBzY3JlZW4uXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRQcmltYXJ5KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc0OTU2MjAxNyk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8vIFByaXZhdGUgdHlwZSBjcmVhdGlvbiBmdW5jdGlvbnNcbmNvbnN0ICQkY3JlYXRlVHlwZTAgPSAkbW9kZWxzLlNjcmVlbi5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlMSA9ICRDcmVhdGUuQXJyYXkoJCRjcmVhdGVUeXBlMCk7XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi4vY29yZS9zeXN0ZW0uanNcIjtcblxuLyoqXG4gKiBFbnZpcm9ubWVudCByZXRyaWV2ZXMgZW52aXJvbm1lbnQgZGV0YWlscy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuRW52aXJvbm1lbnRJbmZvPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVudmlyb25tZW50KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc1MjI2Nzk2OCk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogSXNEYXJrTW9kZSByZXRyaWV2ZXMgc3lzdGVtIGRhcmsgbW9kZSBzdGF0dXMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRGFya01vZGUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyMjkxMjgyODM2KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLy8gUHJpdmF0ZSB0eXBlIGNyZWF0aW9uIGZ1bmN0aW9uc1xuY29uc3QgJCRjcmVhdGVUeXBlMCA9ICRtb2RlbHMuRW52aXJvbm1lbnRJbmZvLmNyZWF0ZUZyb207XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHsgQ2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGUgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5leHBvcnQge1JHQkF9IGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gXCIuL1dpbmRvdy5qc1wiO1xuXG4vKiogQHR5cGUge2FueX0gKi9cbmxldCB0aGlzV2luZG93ID0gbnVsbDtcblxuLyoqXG4gKiBSZXR1cm5zIGEgd2luZG93IG9iamVjdCBmb3IgdGhlIGdpdmVuIHdpbmRvdyBuYW1lLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkfSBbbmFtZSA9IFwiXCJdXG4gKiBAcmV0dXJucyB7IHsgcmVhZG9ubHkgW0tleSBpbiBrZXlvZiAodHlwZW9mIHNlbGYpIGFzIEV4Y2x1ZGU8S2V5LCBcIkdldFwiIHwgXCJSR0JBXCI+XTogKHR5cGVvZiBzZWxmKVtLZXldIH0gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0KG5hbWUgPSBudWxsKSB7XG4gICAgY29uc3QgbmFtZXMgPSBbXSwgd25kID0ge307XG4gICAgaWYgKG5hbWUgIT0gbnVsbCAmJiBuYW1lICE9PSBcIlwiKSB7XG4gICAgICAgIG5hbWVzLnB1c2gobmFtZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzV2luZG93ICE9PSBudWxsKSB7XG4gICAgICAgIC8vIE9wdGltaXNlIGVtcHR5IHRhcmdldCBjYXNlIGZvciBXTUwuXG4gICAgICAgIHJldHVybiB0aGlzV2luZG93O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNXaW5kb3cgPSB3bmQ7XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IGluIHNlbGYpIHtcbiAgICAgICAgaWYgKGtleSAhPT0gXCJHZXRcIiAmJiBrZXkgIT09IFwiUkdCQVwiKSB7XG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSBzZWxmW2tleV07XG4gICAgICAgICAgICB3bmRba2V5XSA9ICguLi5hcmdzKSA9PiBtZXRob2QoLi4uYXJncywgLi4ubmFtZXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oT2JqZWN0LmZyZWV6ZSh3bmQpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuUG9zaXRpb24+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQWJzb2x1dGVQb3NpdGlvbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIyMjU1MzgyNiwgdGFyZ2V0V2luZG93KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUwKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBDZW50ZXJzIHRoZSB3aW5kb3cgb24gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDZW50ZXIoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MDU0NDMwMzY5LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENsb3NlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTQzNjU4MTEwMCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBEaXNhYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRGlzYWJsZVNpemVDb25zdHJhaW50cyguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI1MTA1Mzk4OTEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRW5hYmxlU2l6ZUNvbnN0cmFpbnRzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzE1MDk2ODE5NCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBGb2N1c2VzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9jdXMoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMjc0Nzg5ODcyLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEZvcmNlcyB0aGUgd2luZG93IHRvIHJlbG9hZCB0aGUgcGFnZSBhc3NldHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9yY2VSZWxvYWQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNDc1MjMyNTAsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU3dpdGNoZXMgdGhlIHdpbmRvdyB0byBmdWxsc2NyZWVuIG1vZGUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnVsbHNjcmVlbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM5MjQ1NjQ0NzMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgZm91ciB3aW5kb3cgYm9yZGVycy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5MUlRCPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEJvcmRlclNpemVzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjI5MDk1MzA4OCwgdGFyZ2V0V2luZG93KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUxKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzY3JlZW4gdGhhdCB0aGUgd2luZG93IGlzIG9uLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRTY3JlZW4oLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNzQ0NTk3NDI0LCB0YXJnZXRXaW5kb3cpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTIoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0Wm9vbSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI2NzczNTkwNjMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIZWlnaHQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg1ODcxNTc2MDMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogSGlkZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIaWRlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzg3NDA5MzQ2NCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmb2N1c2VkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRm9jdXNlZCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDUyNjgxOTcyMSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmdWxsc2NyZWVuLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRnVsbHNjcmVlbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDExOTI5MTY3MDUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWF4aW1pc2VkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWF4aW1pc2VkKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzAzNjMyNzgwOSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBtaW5pbWlzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNaW5pbWlzZWQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MDEyMjgxODM1LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1heGltaXNlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc1OTAwNzc5OSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBNaW5pbWlzZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNaW5pbWlzZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM1NDg1MjA1MDEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gTmFtZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQyMDc2NTcwNTEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogT3BlbnMgdGhlIGRldmVsb3BtZW50IHRvb2xzIHBhbmUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkRldlRvb2xzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDgzNjcxOTc0LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5Qb3NpdGlvbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGl2ZVBvc2l0aW9uKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzcwOTU0NTkyMywgdGFyZ2V0V2luZG93KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUwKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZWxvYWRzIHBhZ2UgYXNzZXRzLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlbG9hZCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI4MzM3MzE0ODUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgcmVzaXphYmxlLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlc2l6YWJsZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI0NTA5NDYyNzcsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVzdG9yZXMgdGhlIHdpbmRvdyB0byBpdHMgcHJldmlvdXMgc3RhdGUgaWYgaXQgd2FzIHByZXZpb3VzbHkgbWluaW1pc2VkLCBtYXhpbWlzZWQgb3IgZnVsbHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXN0b3JlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTE1MTMxNTAzNCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRBYnNvbHV0ZVBvc2l0aW9uKHgsIHksIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzk5MTQ5MTg0MiwgeCwgeSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSB3aW5kb3cgdG8gYmUgYWx3YXlzIG9uIHRvcC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYW90XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0QWx3YXlzT25Ub3AoYW90LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMzNDkzNDYxNTUsIGFvdCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBiYWNrZ3JvdW5kIGNvbG91ciBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHskbW9kZWxzLlJHQkF9IGNvbG91clxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEJhY2tncm91bmRDb2xvdXIoY29sb3VyLCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIxNzk4MjA1NzYsIGNvbG91ciwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSB3aW5kb3cgZnJhbWUgYW5kIHRpdGxlIGJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZnJhbWVsZXNzXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnJhbWVsZXNzKGZyYW1lbGVzcywgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MTA5MzY1MDgwLCBmcmFtZWxlc3MsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBvciBkaXNhYmxlcyB0aGUgc3lzdGVtIGZ1bGxzY3JlZW4gYnV0dG9uLlxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnVsbHNjcmVlbkJ1dHRvbkVuYWJsZWQoZW5hYmxlZCwgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODYzNTY4OTgyLCBlbmFibGVkLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1heGltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0TWF4U2l6ZSh3aWR0aCwgaGVpZ2h0LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM0NjAwNzg1NTEsIHdpZHRoLCBoZWlnaHQsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbWluaW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRNaW5TaXplKHdpZHRoLCBoZWlnaHQsIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjY3NzkxOTA4NSwgd2lkdGgsIGhlaWdodCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZWxhdGl2ZVBvc2l0aW9uKHgsIHksIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNzQxNjA2MTE1LCB4LCB5LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgd2hldGhlciB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzaXphYmxlXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVzaXphYmxlKHJlc2l6YWJsZSwgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyODM1MzA1NTQxLCByZXNpemFibGUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0U2l6ZSh3aWR0aCwgaGVpZ2h0LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMzNzk3ODgzOTMsIHdpZHRoLCBoZWlnaHQsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgdGl0bGUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRpdGxlKHRpdGxlLCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE3MDk1MzU5OCwgdGl0bGUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IG1hZ25pZmljYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRab29tKG1hZ25pZmljYXRpb24sIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjc5NDUwMDA1MSwgbWFnbmlmaWNhdGlvbiwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTaG93cyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNob3coLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyOTMxODIzMTIxLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TaXplPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNpemUoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMTQxMTExNDMzLCB0YXJnZXRXaW5kb3cpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTMoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIGZ1bGxzY3JlZW4gYW5kIG5vcm1hbC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVGdWxsc2NyZWVuKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjIxMjc2MzE0OSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBtYXhpbWlzZWQgYW5kIG5vcm1hbC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVNYXhpbWlzZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMxNDQxOTQ0NDMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVW4tZnVsbHNjcmVlbnMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBVbkZ1bGxzY3JlZW4oLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNTg3MDAyNTA2LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFVuLW1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWF4aW1pc2UoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODg5OTk5NDc2LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFVuLW1pbmltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWluaW1pc2UoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNTcxNjM2MTk4LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBXaWR0aCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE2NTUyMzk5ODgsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogWm9vbXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNTU1NzE5OTIzLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEluY3JlYXNlcyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2VidmlldyBjb250ZW50LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvb21JbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDEzMTA0MzQyNzIsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRGVjcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbU91dCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE3NTU3MDI4MjEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVzZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbVJlc2V0KC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjc4MTQ2NzE1NCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLy8gUHJpdmF0ZSB0eXBlIGNyZWF0aW9uIGZ1bmN0aW9uc1xuY29uc3QgJCRjcmVhdGVUeXBlMCA9ICRtb2RlbHMuUG9zaXRpb24uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTEgPSAkbW9kZWxzLkxSVEIuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTIgPSAkbW9kZWxzLlNjcmVlbi5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlMyA9ICRtb2RlbHMuU2l6ZS5jcmVhdGVGcm9tO1xuIiwgIi8vIEB0cy1ub2NoZWNrXG4vKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQge09wZW5VUkx9IGZyb20gXCIuL0Jyb3dzZXIuanNcIjtcbmltcG9ydCB7UXVlc3Rpb259IGZyb20gXCIuL0RpYWxvZ3MuanNcIjtcbmltcG9ydCB7RW1pdCwgV2FpbHNFdmVudH0gZnJvbSBcIi4vRXZlbnRzLmpzXCI7XG5pbXBvcnQge2NhbkFib3J0TGlzdGVuZXJzLCB3aGVuUmVhZHl9IGZyb20gXCIuL3V0aWxzLmpzXCI7XG5pbXBvcnQgKiBhcyBXaW5kb3cgZnJvbSBcIi4vV2luZG93LmpzXCI7XG5cbi8qKlxuICogU2VuZHMgYW4gZXZlbnQgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgb3B0aW9uYWwgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHNlbmQuXG4gKiBAcGFyYW0ge2FueX0gW2RhdGE9bnVsbF0gLSBPcHRpb25hbCBkYXRhIHRvIHNlbmQgYWxvbmcgd2l0aCB0aGUgZXZlbnQuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIHNlbmRFdmVudChldmVudE5hbWUsIGRhdGE9bnVsbCkge1xuICAgIEVtaXQobmV3IFdhaWxzRXZlbnQoZXZlbnROYW1lLCBkYXRhKSk7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb24gYSBzcGVjaWZpZWQgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IHRvIGNhbGwgdGhlIG1ldGhvZCBvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2ROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICovXG5mdW5jdGlvbiBjYWxsV2luZG93TWV0aG9kKHdpbmRvd05hbWUsIG1ldGhvZE5hbWUpIHtcbiAgICBjb25zdCB0YXJnZXRXaW5kb3cgPSBXaW5kb3cuR2V0KHdpbmRvd05hbWUpO1xuICAgIGNvbnN0IG1ldGhvZCA9IHRhcmdldFdpbmRvd1ttZXRob2ROYW1lXTtcblxuICAgIGlmICh0eXBlb2YgbWV0aG9kICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgV2luZG93IG1ldGhvZCAnJHttZXRob2ROYW1lfScgbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBtZXRob2QuY2FsbCh0YXJnZXRXaW5kb3cpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgY2FsbGluZyB3aW5kb3cgbWV0aG9kICcke21ldGhvZE5hbWV9JzogYCwgZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlc3BvbmRzIHRvIGEgdHJpZ2dlcmluZyBldmVudCBieSBydW5uaW5nIGFwcHJvcHJpYXRlIFdNTCBhY3Rpb25zIGZvciB0aGUgY3VycmVudCB0YXJnZXRcbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIG9uV01MVHJpZ2dlcmVkKGV2KSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGV2LmN1cnJlbnRUYXJnZXQ7XG5cbiAgICBmdW5jdGlvbiBydW5FZmZlY3QoY2hvaWNlID0gXCJZZXNcIikge1xuICAgICAgICBpZiAoY2hvaWNlICE9PSBcIlllc1wiKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtZXZlbnQnKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0V2luZG93ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC10YXJnZXQtd2luZG93JykgfHwgXCJcIjtcbiAgICAgICAgY29uc3Qgd2luZG93TWV0aG9kID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC13aW5kb3cnKTtcbiAgICAgICAgY29uc3QgdXJsID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1vcGVudXJsJyk7XG5cbiAgICAgICAgaWYgKGV2ZW50VHlwZSAhPT0gbnVsbClcbiAgICAgICAgICAgIHNlbmRFdmVudChldmVudFR5cGUpO1xuICAgICAgICBpZiAod2luZG93TWV0aG9kICE9PSBudWxsKVxuICAgICAgICAgICAgY2FsbFdpbmRvd01ldGhvZCh0YXJnZXRXaW5kb3csIHdpbmRvd01ldGhvZCk7XG4gICAgICAgIGlmICh1cmwgIT09IG51bGwpXG4gICAgICAgICAgICB2b2lkIE9wZW5VUkwodXJsKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maXJtID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1jb25maXJtJyk7XG5cbiAgICBpZiAoY29uZmlybSkge1xuICAgICAgICBRdWVzdGlvbih7XG4gICAgICAgICAgICBUaXRsZTogXCJDb25maXJtXCIsXG4gICAgICAgICAgICBNZXNzYWdlOiBjb25maXJtLFxuICAgICAgICAgICAgRGV0YWNoZWQ6IGZhbHNlLFxuICAgICAgICAgICAgQnV0dG9uczogW1xuICAgICAgICAgICAgICAgIHsgTGFiZWw6IFwiWWVzXCIgfSxcbiAgICAgICAgICAgICAgICB7IExhYmVsOiBcIk5vXCIsIElzRGVmYXVsdDogdHJ1ZSB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pLnRoZW4ocnVuRWZmZWN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBydW5FZmZlY3QoKTtcbiAgICB9XG59XG5cbi8qKlxuICogQHR5cGUge3N5bWJvbH1cbiAqL1xuY29uc3QgY29udHJvbGxlciA9IFN5bWJvbCgpO1xuXG4vKipcbiAqIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IGRvZXMgbm90IGFjdHVhbGx5IHJlbWVtYmVyIGFjdGl2ZSBldmVudCBsaXN0ZW5lcnM6IGluc3RlYWRcbiAqIGl0IHRpZXMgdGhlbSB0byBhbiBBYm9ydFNpZ25hbCBhbmQgdXNlcyBhbiBBYm9ydENvbnRyb2xsZXIgdG8gcmVtb3ZlIHRoZW0gYWxsIGF0IG9uY2UuXG4gKi9cbmNsYXNzIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0b3JlcyB0aGUgQWJvcnRDb250cm9sbGVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVtb3ZlIGFsbCBjdXJyZW50bHkgYWN0aXZlIGxpc3RlbmVycy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG5hbWUge0BsaW5rIGNvbnRyb2xsZXJ9XG4gICAgICAgICAqIEBtZW1iZXIge0Fib3J0Q29udHJvbGxlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbY29udHJvbGxlcl0gPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBvcHRpb25zIG9iamVjdCBmb3IgYWRkRXZlbnRMaXN0ZW5lciB0aGF0IHRpZXMgdGhlIGxpc3RlbmVyXG4gICAgICogdG8gdGhlIEFib3J0U2lnbmFsIGZyb20gdGhlIGN1cnJlbnQgQWJvcnRDb250cm9sbGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBBbiBIVE1MIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB0cmlnZ2VycyBUaGUgbGlzdCBvZiBhY3RpdmUgV01MIHRyaWdnZXIgZXZlbnRzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnRzXG4gICAgICogQHJldHVybnMge0FkZEV2ZW50TGlzdGVuZXJPcHRpb25zfVxuICAgICAqL1xuICAgIHNldChlbGVtZW50LCB0cmlnZ2Vycykge1xuICAgICAgICByZXR1cm4geyBzaWduYWw6IHRoaXNbY29udHJvbGxlcl0uc2lnbmFsIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpc1tjb250cm9sbGVyXS5hYm9ydCgpO1xuICAgICAgICB0aGlzW2NvbnRyb2xsZXJdID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAdHlwZSB7c3ltYm9sfVxuICovXG5jb25zdCB0cmlnZ2VyTWFwID0gU3ltYm9sKCk7XG5cbi8qKlxuICogQHR5cGUge3N5bWJvbH1cbiAqL1xuY29uc3QgZWxlbWVudENvdW50ID0gU3ltYm9sKCk7XG5cbi8qKlxuICogV2Vha01hcFJlZ2lzdHJ5IG1hcHMgYWN0aXZlIHRyaWdnZXIgZXZlbnRzIHRvIGVhY2ggRE9NIGVsZW1lbnQgdGhyb3VnaCBhIFdlYWtNYXAuXG4gKiBUaGlzIGVuc3VyZXMgdGhhdCB0aGUgbWFwcGluZyByZW1haW5zIHByaXZhdGUgdG8gdGhpcyBtb2R1bGUsIHdoaWxlIHN0aWxsIGFsbG93aW5nIGdhcmJhZ2VcbiAqIGNvbGxlY3Rpb24gb2YgdGhlIGludm9sdmVkIGVsZW1lbnRzLlxuICovXG5jbGFzcyBXZWFrTWFwUmVnaXN0cnkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcmVzIHRoZSBjdXJyZW50IGVsZW1lbnQtdG8tdHJpZ2dlciBtYXBwaW5nLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbmFtZSB7QGxpbmsgdHJpZ2dlck1hcH1cbiAgICAgICAgICogQG1lbWJlciB7V2Vha01hcDxIVE1MRWxlbWVudCwgc3RyaW5nW10+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwXSA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvdW50cyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHdpdGggYWN0aXZlIFdNTCB0cmlnZ2Vycy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG5hbWUge0BsaW5rIGVsZW1lbnRDb3VudH1cbiAgICAgICAgICogQG1lbWJlciB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpc1tlbGVtZW50Q291bnRdID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBhY3RpdmUgdHJpZ2dlcnMgZm9yIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgQW4gSFRNTCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdHJpZ2dlcnMgVGhlIGxpc3Qgb2YgYWN0aXZlIFdNTCB0cmlnZ2VyIGV2ZW50cyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50XG4gICAgICogQHJldHVybnMge0FkZEV2ZW50TGlzdGVuZXJPcHRpb25zfVxuICAgICAqL1xuICAgIHNldChlbGVtZW50LCB0cmlnZ2Vycykge1xuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudF0gKz0gIXRoaXNbdHJpZ2dlck1hcF0uaGFzKGVsZW1lbnQpO1xuICAgICAgICB0aGlzW3RyaWdnZXJNYXBdLnNldChlbGVtZW50LCB0cmlnZ2Vycyk7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxuICAgICAqL1xuICAgIHJlc2V0KCkge1xuICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRdIDw9IDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRdIDw9IDApXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IHRyaWdnZXJzID0gdGhpc1t0cmlnZ2VyTWFwXS5nZXQoZWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzW2VsZW1lbnRDb3VudF0gLT0gKHR5cGVvZiB0cmlnZ2VycyAhPT0gXCJ1bmRlZmluZWRcIik7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycyB8fCBbXSlcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHJpZ2dlciwgb25XTUxUcmlnZ2VyZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwXSA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICAgIHRoaXNbZWxlbWVudENvdW50XSA9IDA7XG4gICAgfVxufVxuXG5jb25zdCB0cmlnZ2VyUmVnaXN0cnkgPSBjYW5BYm9ydExpc3RlbmVycygpID8gbmV3IEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5KCkgOiBuZXcgV2Vha01hcFJlZ2lzdHJ5KCk7XG5cbi8qKlxuICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBhZGRXTUxMaXN0ZW5lcnMoZWxlbWVudCkge1xuICAgIGNvbnN0IHRyaWdnZXJSZWdFeHAgPSAvXFxTKy9nO1xuICAgIGNvbnN0IHRyaWdnZXJBdHRyID0gKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdHJpZ2dlcicpIHx8IFwiY2xpY2tcIik7XG4gICAgY29uc3QgdHJpZ2dlcnMgPSBbXTtcblxuICAgIGxldCBtYXRjaDtcbiAgICB3aGlsZSAoKG1hdGNoID0gdHJpZ2dlclJlZ0V4cC5leGVjKHRyaWdnZXJBdHRyKSkgIT09IG51bGwpXG4gICAgICAgIHRyaWdnZXJzLnB1c2gobWF0Y2hbMF0pO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRyaWdnZXJSZWdpc3RyeS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xuICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycylcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRyaWdnZXIsIG9uV01MVHJpZ2dlcmVkLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgYW4gYXV0b21hdGljIHJlbG9hZCBvZiBXTUwgdG8gYmUgcGVyZm9ybWVkIGFzIHNvb24gYXMgdGhlIGRvY3VtZW50IGlzIGZ1bGx5IGxvYWRlZC5cbiAqXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVuYWJsZSgpIHtcbiAgICB3aGVuUmVhZHkoUmVsb2FkKTtcbn1cblxuLyoqXG4gKiBSZWxvYWRzIHRoZSBXTUwgcGFnZSBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycyBhbmQgYnJvd3NlciBsaXN0ZW5lcnMuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxvYWQoKSB7XG4gICAgdHJpZ2dlclJlZ2lzdHJ5LnJlc2V0KCk7XG4gICAgZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbd21sLWV2ZW50XSwgW3dtbC13aW5kb3ddLCBbd21sLW9wZW51cmxdJykuZm9yRWFjaChhZGRXTUxMaXN0ZW5lcnMpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgcmVtb3ZpbmcgbGlzdGVuZXJzIGJ5IHRyaWdnZXJpbmcgYW4gQWJvcnRTaWduYWxcbiAqIChzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0V2ZW50VGFyZ2V0L2FkZEV2ZW50TGlzdGVuZXIjc2lnbmFsKVxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5BYm9ydExpc3RlbmVycygpIHtcbiAgICBpZiAoIUV2ZW50VGFyZ2V0IHx8ICFBYm9ydFNpZ25hbCB8fCAhQWJvcnRDb250cm9sbGVyKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcblxuICAgIGNvbnN0IHRhcmdldCA9IG5ldyBFdmVudFRhcmdldCgpO1xuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCAoKSA9PiB7IHJlc3VsdCA9IGZhbHNlOyB9LCB7IHNpZ25hbDogY29udHJvbGxlci5zaWduYWwgfSk7XG4gICAgY29udHJvbGxlci5hYm9ydCgpO1xuICAgIHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgndGVzdCcpKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKipcbiBUaGlzIHRlY2huaXF1ZSBmb3IgcHJvcGVyIGxvYWQgZGV0ZWN0aW9uIGlzIHRha2VuIGZyb20gSFRNWDpcblxuIEJTRCAyLUNsYXVzZSBMaWNlbnNlXG5cbiBDb3B5cmlnaHQgKGMpIDIwMjAsIEJpZyBTa3kgU29mdHdhcmVcbiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG4gUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cblxuIDIuIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cbiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFXG4gRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUxcbiBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUlxuIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSXG4gQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSxcbiBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG5cbiAqKiovXG5cbmxldCBpc1JlYWR5ID0gZmFsc2U7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gaXNSZWFkeSA9IHRydWUpO1xuXG5leHBvcnQgZnVuY3Rpb24gd2hlblJlYWR5KGNhbGxiYWNrKSB7XG4gICAgaWYgKGlzUmVhZHkgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBjYWxsYmFjayk7XG4gICAgfVxufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmV4cG9ydCAqIGZyb20gXCIuLi8uLi8uLi8uLi9wa2cvcnVudGltZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyBydW50aW1lIGZyb20gXCIuLi8uLi8uLi8uLi9wa2cvcnVudGltZS9pbmRleC5qc1wiO1xud2luZG93LndhaWxzID0gcnVudGltZTtcblxucnVudGltZS5XTUwuRW5hYmxlKCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ3lCQSxJQUFJLGNBQ0Y7QUFXSyxJQUFJLFNBQVMsQ0FBQyxPQUFPLE9BQU87QUFDakMsTUFBSSxLQUFLO0FBQ1QsTUFBSSxJQUFJO0FBQ1IsU0FBTyxLQUFLO0FBQ1YsVUFBTSxZQUFhLEtBQUssT0FBTyxJQUFJLEtBQU0sQ0FBQztBQUFBLEVBQzVDO0FBQ0EsU0FBTztBQUNUOzs7QUMvQkEsSUFBTSxhQUFhLE9BQU8sU0FBUyxTQUFTO0FBR3JDLFNBQVMsT0FBTyxLQUFLO0FBQ3hCLE1BQUcsT0FBTyxRQUFRO0FBQ2QsV0FBTyxPQUFPLE9BQU8sUUFBUSxZQUFZLEdBQUc7QUFBQSxFQUNoRCxPQUFPO0FBQ0gsV0FBTyxPQUFPLE9BQU8sZ0JBQWdCLFNBQVMsWUFBWSxHQUFHO0FBQUEsRUFDakU7QUFDSjtBQUdPLElBQU0sY0FBYztBQUFBLEVBQ3ZCLE1BQU07QUFBQSxFQUNOLGFBQWE7QUFBQSxFQUNiLFlBQVk7QUFDaEI7QUFDTyxJQUFJLFdBQVcsT0FBTztBQXNCdEIsU0FBUyx1QkFBdUIsUUFBUSxZQUFZO0FBQ3ZELFNBQU8sU0FBVSxRQUFRLE9BQUssTUFBTTtBQUNoQyxXQUFPLGtCQUFrQixRQUFRLFFBQVEsWUFBWSxJQUFJO0FBQUEsRUFDN0Q7QUFDSjtBQXFDQSxTQUFTLGtCQUFrQixVQUFVLFFBQVEsWUFBWSxNQUFN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dkIsMkJBQTJCO0FBQUEsSUFDM0IsK0JBQStCO0FBQUEsSUFDL0Isb0JBQW9CO0FBQUEsSUFDcEIscUJBQXFCO0FBQUEsSUFDckIscUJBQXFCO0FBQUEsSUFDckIsc0JBQXNCO0FBQUEsSUFDdEIsZ0NBQWdDO0FBQUEsSUFDaEMsa0NBQWtDO0FBQUEsSUFDbEMsbUNBQW1DO0FBQUEsSUFDbkMsb0NBQW9DO0FBQUEsSUFDcEMsK0JBQStCO0FBQUEsSUFDL0IsNkJBQTZCO0FBQUEsSUFDN0IsdUJBQXVCO0FBQUEsSUFDdkIsaUNBQWlDO0FBQUEsSUFDakMsOEJBQThCO0FBQUEsSUFDOUIsNEJBQTRCO0FBQUEsSUFDNUIsc0NBQXNDO0FBQUEsSUFDdEMsNEJBQTRCO0FBQUEsSUFDNUIsc0JBQXNCO0FBQUEsSUFDdEIsa0NBQWtDO0FBQUEsSUFDbEMsc0JBQXNCO0FBQUEsSUFDdEIsd0JBQXdCO0FBQUEsSUFDeEIsMkJBQTJCO0FBQUEsSUFDM0Isd0JBQXdCO0FBQUEsSUFDeEIsbUJBQW1CO0FBQUEsSUFDbkIsMEJBQTBCO0FBQUEsSUFDMUIsOEJBQThCO0FBQUEsSUFDOUIseUJBQXlCO0FBQUEsSUFDekIsNkJBQTZCO0FBQUEsSUFDN0IsaUJBQWlCO0FBQUEsSUFDakIsZ0JBQWdCO0FBQUEsSUFDaEIsc0JBQXNCO0FBQUEsSUFDdEIsZUFBZTtBQUFBLElBQ2YseUJBQXlCO0FBQUEsSUFDekIsd0JBQXdCO0FBQUEsSUFDeEIsb0JBQW9CO0FBQUEsSUFDcEIscUJBQXFCO0FBQUEsSUFDckIsaUJBQWlCO0FBQUEsSUFDakIsaUJBQWlCO0FBQUEsSUFDakIsc0JBQXNCO0FBQUEsSUFDdEIsbUNBQW1DO0FBQUEsSUFDbkMscUNBQXFDO0FBQUEsSUFDckMsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIsd0JBQXdCO0FBQUEsSUFDeEIsMkJBQTJCO0FBQUEsSUFDM0IsbUJBQW1CO0FBQUEsSUFDbkIscUJBQXFCO0FBQUEsSUFDckIsc0JBQXNCO0FBQUEsSUFDdEIsc0JBQXNCO0FBQUEsSUFDdEIsOEJBQThCO0FBQUEsSUFDOUIsaUJBQWlCO0FBQUEsSUFDakIseUJBQXlCO0FBQUEsSUFDekIsMkJBQTJCO0FBQUEsSUFDM0IsK0JBQStCO0FBQUEsSUFDL0IsMEJBQTBCO0FBQUEsSUFDMUIsOEJBQThCO0FBQUEsSUFDOUIsaUJBQWlCO0FBQUEsSUFDakIsdUJBQXVCO0FBQUEsSUFDdkIsZ0JBQWdCO0FBQUEsSUFDaEIsMEJBQTBCO0FBQUEsSUFDMUIseUJBQXlCO0FBQUEsSUFDekIsc0JBQXNCO0FBQUEsSUFDdEIsa0JBQWtCO0FBQUEsSUFDbEIsbUJBQW1CO0FBQUEsSUFDbkIsa0JBQWtCO0FBQUEsSUFDbEIsdUJBQXVCO0FBQUEsSUFDdkIsb0NBQW9DO0FBQUEsSUFDcEMsc0NBQXNDO0FBQUEsSUFDdEMsd0JBQXdCO0FBQUEsSUFDeEIsdUJBQXVCO0FBQUEsSUFDdkIseUJBQXlCO0FBQUEsSUFDekIsNEJBQTRCO0FBQUEsSUFDNUIsNEJBQTRCO0FBQUEsSUFDNUIsY0FBYztBQUFBLElBQ2QsYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLElBQ2Qsb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIscUJBQXFCO0FBQUEsSUFDckIsb0JBQW9CO0FBQUEsSUFDcEIsaUJBQWlCO0FBQUEsSUFDakIsZ0JBQWdCO0FBQUEsSUFDaEIsb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIscUJBQXFCO0FBQUEsSUFDckIsb0JBQW9CO0FBQUEsSUFDcEIsZ0JBQWdCO0FBQUEsSUFDaEIsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsY0FBYztBQUFBLElBQ2QsMEJBQTBCO0FBQUEsSUFDMUIseUJBQXlCO0FBQUEsSUFDekIsc0NBQXNDO0FBQUEsSUFDdEMseURBQXlEO0FBQUEsSUFDekQsNEJBQTRCO0FBQUEsSUFDNUIsNEJBQTRCO0FBQUEsSUFDNUIs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QUssVUFBVSxJQUFJLG9CQUFJLFFBQVE7QUFDL0IsU0FBSyxZQUFZLElBQUk7QUFBQSxFQUN6QjtBQUNKO0FBRUEsSUFBTSxrQkFBa0Isa0JBQWtCLElBQUksSUFBSSx3QkFBd0IsSUFBSSxJQUFJLGdCQUFnQjtBQVFsRyxTQUFTLGdCQUFnQixTQUFTO0FBQzlCLFFBQU0sZ0JBQWdCO0FBQ3RCLFFBQU0sY0FBZSxRQUFRLGFBQWEsYUFBYSxLQUFLO0FBQzVELFFBQU0sV0FBVyxDQUFDO0FBRWxCLE1BQUk7QUFDSixVQUFRLFFBQVEsY0FBYyxLQUFLLFdBQVcsT0FBTztBQUNqRCxhQUFTLEtBQUssTUFBTSxDQUFDLENBQUM7QUFFMUIsUUFBTSxVQUFVLGdCQUFnQixJQUFJLFNBQVMsUUFBUTtBQUNyRCxhQUFXLFdBQVc7QUFDbEIsWUFBUSxpQkFBaUIsU0FBUyxnQkFBZ0IsT0FBTztBQUNqRTtBQU9PLFNBQVMsU0FBUztBQUNyQixZQUFVQyxPQUFNO0FBQ3BCO0FBT08sU0FBU0EsVUFBUztBQUNyQixrQkFBZ0IsTUFBTTtBQUN0QixXQUFTLEtBQUssaUJBQWlCLDBDQUEwQyxFQUFFLFFBQVEsZUFBZTtBQUN0Rzs7O0FFclBBLE9BQU8sUUFBUTtBQUVQLFlBQUksT0FBTzsiLAogICJuYW1lcyI6IFsiY2FsbCIsICJNYXAiLCAia2V5IiwgIk1hcCIsICJFcnJvciIsICJFcnJvciIsICJldmVudE5hbWUiLCAiJCRjcmVhdGVUeXBlMSIsICIkJGNyZWF0ZVR5cGUwIiwgIiQkY3JlYXRlVHlwZTAiLCAiSGlkZSIsICJTaG93IiwgIlNpemUiLCAiJCRjcmVhdGVUeXBlMCIsICIkJGNyZWF0ZVR5cGUxIiwgIiQkY3JlYXRlVHlwZTIiLCAiSGlkZSIsICJyZXNpemFibGUiLCAiU2hvdyIsICJTaXplIiwgIiQkY3JlYXRlVHlwZTMiLCAiUmVsb2FkIiwgImNvbnRyb2xsZXIiLCAiUmVsb2FkIl0KfQo=
