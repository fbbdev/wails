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

// bundle/full/.build/github.com/wailsapp/wails/v3/internal/runtime/api/dialogs.js
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvcGtnL3J1bnRpbWUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvYXBwbGljYXRpb24uanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL25hbm9pZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvcnVudGltZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvc3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvY29yZS9jb250ZXh0bWVudS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvZmxhZ3MuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2RyYWcuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NhbGwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9jb3JlL2NyZWF0ZS5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2NvcmUvaW5kZXguanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvYnJvd3Nlci5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9jYWxsLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2NsaXBib2FyZC5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9jcmVhdGUuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvZGlhbG9ncy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS9tb2RlbHMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvZXZlbnRzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2V2ZW50X3R5cGVzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2xpc3RlbmVyLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL2ZsYWdzLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL3NjcmVlbnMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvc3lzdGVtLmpzIiwgIi5idWlsZC9naXRodWIuY29tL3dhaWxzYXBwL3dhaWxzL3YzL2ludGVybmFsL3J1bnRpbWUvYXBpL3dpbmRvdy5qcyIsICIuYnVpbGQvZ2l0aHViLmNvbS93YWlsc2FwcC93YWlscy92My9pbnRlcm5hbC9ydW50aW1lL2FwaS93bWwuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9hcGkvdXRpbHMuanMiLCAiLmJ1aWxkL2dpdGh1Yi5jb20vd2FpbHNhcHAvd2FpbHMvdjMvaW50ZXJuYWwvcnVudGltZS9idW5kbGUvZnVsbC9pbmRleC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuZXhwb3J0IHtcbiAgICBBcHBsaWNhdGlvbixcbiAgICBCcm93c2VyLFxuICAgIENhbGwsXG4gICAgQ2xpcGJvYXJkLFxuICAgIENyZWF0ZSxcbiAgICBEaWFsb2dzLFxuICAgIEV2ZW50cyxcbiAgICBGbGFncyxcbiAgICBTY3JlZW5zLFxuICAgIFN5c3RlbSxcbiAgICBXaW5kb3csXG4gICAgV01MXG59IGZyb20gXCIuLi8uLi9pbnRlcm5hbC9ydW50aW1lL2FwaS9pbmRleC5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGV9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbi8qKlxuICogSGlkZSBtYWtlcyBhbGwgYXBwbGljYXRpb24gd2luZG93cyBpbnZpc2libGUuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEhpZGUoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg3Mjc0NzE2MDIpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFF1aXQgcXVpdHMgdGhlIGFwcGxpY2F0aW9uLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWl0KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTI0NDkyNjk1Myk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2hvdyBtYWtlcyBhbGwgYXBwbGljYXRpb24gd2luZG93cyB2aXNpYmxlLlxuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTaG93KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjI3MDY3NDgzOSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG4iLCAiLyoqXG4gKiBUaGlzIGNvZGUgZnJhZ21lbnQgaXMgdGFrZW4gZnJvbSBuYW5vaWQgKGh0dHBzOi8vZ2l0aHViLmNvbS9haS9uYW5vaWQpOlxuICpcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICpcbiAqIENvcHlyaWdodCAyMDE3IEFuZHJleSBTaXRuaWsgPGFuZHJleUBzaXRuaWsucnU+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZlxuICogdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpblxuICogdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0b1xuICogdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2ZcbiAqIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcbiAqIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTU1xuICogRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SXG4gKiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVJcbiAqIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOXG4gKiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmxldCB1cmxBbHBoYWJldCA9XG4gICd1c2VhbmRvbS0yNlQxOTgzNDBQWDc1cHhKQUNLVkVSWU1JTkRCVVNIV09MRl9HUVpiZmdoamtscXZ3eXpyaWN0J1xuZXhwb3J0IGxldCBjdXN0b21BbHBoYWJldCA9IChhbHBoYWJldCwgZGVmYXVsdFNpemUgPSAyMSkgPT4ge1xuICByZXR1cm4gKHNpemUgPSBkZWZhdWx0U2l6ZSkgPT4ge1xuICAgIGxldCBpZCA9ICcnXG4gICAgbGV0IGkgPSBzaXplXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWQgKz0gYWxwaGFiZXRbKE1hdGgucmFuZG9tKCkgKiBhbHBoYWJldC5sZW5ndGgpIHwgMF1cbiAgICB9XG4gICAgcmV0dXJuIGlkXG4gIH1cbn1cbmV4cG9ydCBsZXQgbmFub2lkID0gKHNpemUgPSAyMSkgPT4ge1xuICBsZXQgaWQgPSAnJ1xuICBsZXQgaSA9IHNpemVcbiAgd2hpbGUgKGktLSkge1xuICAgIGlkICs9IHVybEFscGhhYmV0WyhNYXRoLnJhbmRvbSgpICogNjQpIHwgMF1cbiAgfVxuICByZXR1cm4gaWRcbn1cbiIsICIvKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuaW1wb3J0IHtuYW5vaWR9IGZyb20gXCIuL25hbm9pZC5qc1wiO1xuXG5jb25zdCBydW50aW1lVVJMID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIFwiL3dhaWxzL3J1bnRpbWVcIjtcblxuLyoqIFNlbmRzIG1lc3NhZ2VzIHRvIHRoZSBiYWNrZW5kICovXG5leHBvcnQgZnVuY3Rpb24gaW52b2tlKG1zZykge1xuICAgIGlmKHdpbmRvdy5jaHJvbWUpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jaHJvbWUud2Vidmlldy5wb3N0TWVzc2FnZShtc2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cud2Via2l0Lm1lc3NhZ2VIYW5kbGVycy5leHRlcm5hbC5wb3N0TWVzc2FnZShtc2cpO1xuICAgIH1cbn1cblxuLyoqIE9iamVjdCBOYW1lcyAqL1xuZXhwb3J0IGNvbnN0IG9iamVjdE5hbWVzID0ge1xuICAgIENhbGw6IDAsXG4gICAgQ29udGV4dE1lbnU6IDQsXG4gICAgQ2FuY2VsQ2FsbDogMTAsXG59XG5leHBvcnQgbGV0IGNsaWVudElkID0gbmFub2lkKCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHJ1bnRpbWUgY2FsbGVyIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBhIHNwZWNpZmllZCBtZXRob2Qgb24gYSBnaXZlbiBvYmplY3Qgd2l0aGluIGEgc3BlY2lmaWVkIHdpbmRvdyBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRob2QgaXMgdG8gYmUgaW52b2tlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdyBjb250ZXh0IGluIHdoaWNoIHRoZSBtZXRob2Qgc2hvdWxkIGJlIGNhbGxlZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBydW50aW1lIGNhbGxlciBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBtZXRob2QgbmFtZSBhbmQgb3B0aW9uYWxseSBhcmd1bWVudHMgYW5kIGludm9rZXMgdGhlIG1ldGhvZCB3aXRoaW4gdGhlIHNwZWNpZmllZCB3aW5kb3cgY29udGV4dC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5ld1J1bnRpbWVDYWxsZXIob2JqZWN0LCB3aW5kb3dOYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChtZXRob2QsIGFyZ3M9bnVsbCkge1xuICAgICAgICByZXR1cm4gcnVudGltZUNhbGwob2JqZWN0ICsgXCIuXCIgKyBtZXRob2QsIHdpbmRvd05hbWUsIGFyZ3MpO1xuICAgIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBydW50aW1lIGNhbGxlciB3aXRoIHNwZWNpZmllZCBJRC5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IC0gVGhlIG9iamVjdCB0byBpbnZva2UgdGhlIG1ldGhvZCBvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB3aW5kb3dOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHdpbmRvdy5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSAtIFRoZSBuZXcgcnVudGltZSBjYWxsZXIgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdCwgd2luZG93TmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAobWV0aG9kLCBhcmdzPW51bGwpIHtcbiAgICAgICAgcmV0dXJuIHJ1bnRpbWVDYWxsV2l0aElEKG9iamVjdCwgbWV0aG9kLCB3aW5kb3dOYW1lLCBhcmdzKTtcbiAgICB9O1xufVxuXG5cbmZ1bmN0aW9uIHJ1bnRpbWVDYWxsKG1ldGhvZCwgd2luZG93TmFtZSwgYXJncykge1xuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJ1bnRpbWVVUkwpO1xuICAgIGlmKCBtZXRob2QgKSB7XG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwibWV0aG9kXCIsIG1ldGhvZCk7XG4gICAgfVxuICAgIGxldCBmZXRjaE9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgIH07XG4gICAgaWYgKHdpbmRvd05hbWUpIHtcbiAgICAgICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcbiAgICB9XG4gICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJhcmdzXCIsIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcbiAgICB9XG4gICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLWNsaWVudC1pZFwiXSA9IGNsaWVudElkO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZmV0Y2godXJsLCBmZXRjaE9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGNvbnRlbnQgdHlwZVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikgJiYgcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJDb250ZW50LVR5cGVcIikuaW5kZXhPZihcImFwcGxpY2F0aW9uL2pzb25cIikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWplY3QoRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gcmVzb2x2ZShkYXRhKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiByZWplY3QoZXJyb3IpKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcnVudGltZUNhbGxXaXRoSUQob2JqZWN0SUQsIG1ldGhvZCwgd2luZG93TmFtZSwgYXJncykge1xuICAgIGxldCB1cmwgPSBuZXcgVVJMKHJ1bnRpbWVVUkwpO1xuICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKFwib2JqZWN0XCIsIG9iamVjdElEKTtcbiAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZChcIm1ldGhvZFwiLCBtZXRob2QpO1xuICAgIGxldCBmZXRjaE9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgIH07XG4gICAgaWYgKHdpbmRvd05hbWUpIHtcbiAgICAgICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLXdpbmRvdy1uYW1lXCJdID0gd2luZG93TmFtZTtcbiAgICB9XG4gICAgaWYgKGFyZ3MpIHtcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoXCJhcmdzXCIsIEpTT04uc3RyaW5naWZ5KGFyZ3MpKTtcbiAgICB9XG4gICAgZmV0Y2hPcHRpb25zLmhlYWRlcnNbXCJ4LXdhaWxzLWNsaWVudC1pZFwiXSA9IGNsaWVudElkO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGZldGNoKHVybCwgZmV0Y2hPcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBjb250ZW50IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpICYmIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KFwiQ29udGVudC1UeXBlXCIpLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9qc29uXCIpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVqZWN0KEVycm9yKHJlc3BvbnNlLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHJlc29sdmUoZGF0YSkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gcmVqZWN0KGVycm9yKSk7XG4gICAgfSk7XG59XG4iLCAiLypcbiBfXHQgICBfX1x0ICBfIF9fXG58IHxcdCAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qIGpzaGludCBlc3ZlcnNpb246IDkgKi9cblxuLyoqXG4gKiBGZXRjaGVzIGFwcGxpY2F0aW9uIGNhcGFiaWxpdGllcyBmcm9tIHRoZSBzZXJ2ZXIuXG4gKlxuICogQGFzeW5jXG4gKiBAZnVuY3Rpb24gQ2FwYWJpbGl0aWVzXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgY2FwYWJpbGl0aWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQ2FwYWJpbGl0aWVzKCkge1xuICAgIHJldHVybiBmZXRjaChcIi93YWlscy9jYXBhYmlsaXRpZXNcIikudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgV2luZG93cy5cbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlzIFdpbmRvd3MsIG90aGVyd2lzZSBmYWxzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzV2luZG93cygpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5PUyA9PT0gXCJ3aW5kb3dzXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IG9wZXJhdGluZyBzeXN0ZW0gaXMgTGludXguXG4gKlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBvcGVyYXRpbmcgc3lzdGVtIGlzIExpbnV4LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0xpbnV4KCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcImxpbnV4XCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIGEgbWFjT1Mgb3BlcmF0aW5nIHN5c3RlbS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgZW52aXJvbm1lbnQgaXMgbWFjT1MsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWFjKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50Lk9TID09PSBcImRhcndpblwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCBhcmNoaXRlY3R1cmUgaXMgQU1ENjQsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQU1ENjQoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5fd2FpbHMuZW52aXJvbm1lbnQuQXJjaCA9PT0gXCJhbWQ2NFwiO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgY3VycmVudCBhcmNoaXRlY3R1cmUgaXMgQVJNLlxuICpcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBjdXJyZW50IGFyY2hpdGVjdHVyZSBpcyBBUk0sIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzQVJNKCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkFyY2ggPT09IFwiYXJtXCI7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIEFSTTY0IGFyY2hpdGVjdHVyZSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0FSTTY0KCkge1xuICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmVudmlyb25tZW50LkFyY2ggPT09IFwiYXJtNjRcIjtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQgaXMgaW4gZGVidWcgbW9kZS5cbiAqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBSZXR1cm5zIHRydWUgaWYgdGhlIGVudmlyb25tZW50IGlzIGluIGRlYnVnIG1vZGUsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNEZWJ1ZygpIHtcbiAgICByZXR1cm4gd2luZG93Ll93YWlscy5lbnZpcm9ubWVudC5EZWJ1ZyA9PT0gdHJ1ZTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQge25ld1J1bnRpbWVDYWxsZXJXaXRoSUQsIG9iamVjdE5hbWVzfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQge0lzRGVidWd9IGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuXG4vLyBzZXR1cFxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgY29udGV4dE1lbnVIYW5kbGVyKTtcblxuY29uc3QgY2FsbCA9IG5ld1J1bnRpbWVDYWxsZXJXaXRoSUQob2JqZWN0TmFtZXMuQ29udGV4dE1lbnUsICcnKTtcbmNvbnN0IENvbnRleHRNZW51T3BlbiA9IDA7XG5cbmZ1bmN0aW9uIG9wZW5Db250ZXh0TWVudShpZCwgeCwgeSwgZGF0YSkge1xuICAgIHZvaWQgY2FsbChDb250ZXh0TWVudU9wZW4sIHtpZCwgeCwgeSwgZGF0YX0pO1xufVxuXG5mdW5jdGlvbiBjb250ZXh0TWVudUhhbmRsZXIoZXZlbnQpIHtcbiAgICAvLyBDaGVjayBmb3IgY3VzdG9tIGNvbnRleHQgbWVudVxuICAgIGxldCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCBjdXN0b21Db250ZXh0TWVudSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudVwiKTtcbiAgICBjdXN0b21Db250ZXh0TWVudSA9IGN1c3RvbUNvbnRleHRNZW51ID8gY3VzdG9tQ29udGV4dE1lbnUudHJpbSgpIDogXCJcIjtcbiAgICBpZiAoY3VzdG9tQ29udGV4dE1lbnUpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGV0IGN1c3RvbUNvbnRleHRNZW51RGF0YSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpLmdldFByb3BlcnR5VmFsdWUoXCItLWN1c3RvbS1jb250ZXh0bWVudS1kYXRhXCIpO1xuICAgICAgICBvcGVuQ29udGV4dE1lbnUoY3VzdG9tQ29udGV4dE1lbnUsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFksIGN1c3RvbUNvbnRleHRNZW51RGF0YSk7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQpO1xufVxuXG5cbi8qXG4tLWRlZmF1bHQtY29udGV4dG1lbnU6IGF1dG87IChkZWZhdWx0KSB3aWxsIHNob3cgdGhlIGRlZmF1bHQgY29udGV4dCBtZW51IGlmIGNvbnRlbnRFZGl0YWJsZSBpcyB0cnVlIE9SIHRleHQgaGFzIGJlZW4gc2VsZWN0ZWQgT1IgZWxlbWVudCBpcyBpbnB1dCBvciB0ZXh0YXJlYVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBzaG93OyB3aWxsIGFsd2F5cyBzaG93IHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuLS1kZWZhdWx0LWNvbnRleHRtZW51OiBoaWRlOyB3aWxsIGFsd2F5cyBoaWRlIHRoZSBkZWZhdWx0IGNvbnRleHQgbWVudVxuXG5UaGlzIHJ1bGUgaXMgaW5oZXJpdGVkIGxpa2Ugbm9ybWFsIENTUyBydWxlcywgc28gbmVzdGluZyB3b3JrcyBhcyBleHBlY3RlZFxuKi9cbmZ1bmN0aW9uIHByb2Nlc3NEZWZhdWx0Q29udGV4dE1lbnUoZXZlbnQpIHtcblxuICAgIC8vIERlYnVnIGJ1aWxkcyBhbHdheXMgc2hvdyB0aGUgbWVudVxuICAgIGlmIChJc0RlYnVnKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFByb2Nlc3MgZGVmYXVsdCBjb250ZXh0IG1lbnVcbiAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbiAgICBjb25zdCBkZWZhdWx0Q29udGV4dE1lbnVBY3Rpb24gPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoXCItLWRlZmF1bHQtY29udGV4dG1lbnVcIikudHJpbSgpO1xuICAgIHN3aXRjaCAoZGVmYXVsdENvbnRleHRNZW51QWN0aW9uKSB7XG4gICAgICAgIGNhc2UgXCJzaG93XCI6XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNhc2UgXCJoaWRlXCI6XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgY29udGVudEVkaXRhYmxlIGlzIHRydWVcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0ZXh0IGhhcyBiZWVuIHNlbGVjdGVkXG4gICAgICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBoYXNTZWxlY3Rpb24gPSAoc2VsZWN0aW9uLnRvU3RyaW5nKCkubGVuZ3RoID4gMClcbiAgICAgICAgICAgIGlmIChoYXNTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdGlvbi5yYW5nZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdChpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVjdHMgPSByYW5nZS5nZXRDbGllbnRSZWN0cygpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHJlY3RzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gcmVjdHNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChyZWN0LmxlZnQsIHJlY3QudG9wKSA9PT0gZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRhZ25hbWUgaXMgaW5wdXQgb3IgdGV4dGFyZWFcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09IFwiSU5QVVRcIiB8fCBlbGVtZW50LnRhZ05hbWUgPT09IFwiVEVYVEFSRUFcIikge1xuICAgICAgICAgICAgICAgIGlmIChoYXNTZWxlY3Rpb24gfHwgKCFlbGVtZW50LnJlYWRPbmx5ICYmICFlbGVtZW50LmRpc2FibGVkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBoaWRlIGRlZmF1bHQgY29udGV4dCBtZW51XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGZyb20gdGhlIGZsYWcgbWFwLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlTdHJpbmcgLSBUaGUga2V5IHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBmb3IuXG4gKiBAcmV0dXJuIHsqfSAtIFRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRGbGFnKGtleVN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuX3dhaWxzLmZsYWdzW2tleVN0cmluZ107XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmFibGUgdG8gcmV0cmlldmUgZmxhZyAnXCIgKyBrZXlTdHJpbmcgKyBcIic6IFwiICsgZSk7XG4gICAgfVxufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7aW52b2tlfSBmcm9tIFwiLi9ydW50aW1lLmpzXCI7XG5pbXBvcnQge0lzV2luZG93c30gZnJvbSBcIi4vc3lzdGVtLmpzXCI7XG5pbXBvcnQge0dldEZsYWd9IGZyb20gXCIuL2ZsYWdzLmpzXCI7XG5cbi8vIFNldHVwXG5sZXQgc2hvdWxkRHJhZyA9IGZhbHNlO1xubGV0IHJlc2l6YWJsZSA9IGZhbHNlO1xubGV0IHJlc2l6ZUVkZ2UgPSBudWxsO1xubGV0IGRlZmF1bHRDdXJzb3IgPSBcImF1dG9cIjtcblxud2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XG5cbndpbmRvdy5fd2FpbHMuc2V0UmVzaXphYmxlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXNpemFibGUgPSB2YWx1ZTtcbn07XG5cbndpbmRvdy5fd2FpbHMuZW5kRHJhZyA9IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbn07XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbk1vdXNlRG93bik7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXApO1xuXG5cbmZ1bmN0aW9uIGRyYWdUZXN0KGUpIHtcbiAgICBsZXQgdmFsID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZS50YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLXdhaWxzLWRyYWdnYWJsZVwiKTtcbiAgICBsZXQgbW91c2VQcmVzc2VkID0gZS5idXR0b25zICE9PSB1bmRlZmluZWQgPyBlLmJ1dHRvbnMgOiBlLndoaWNoO1xuICAgIGlmICghdmFsIHx8IHZhbCA9PT0gXCJcIiB8fCB2YWwudHJpbSgpICE9PSBcImRyYWdcIiB8fCBtb3VzZVByZXNzZWQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gZS5kZXRhaWwgPT09IDE7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGUpIHtcblxuICAgIC8vIENoZWNrIGZvciByZXNpemluZ1xuICAgIGlmIChyZXNpemVFZGdlKSB7XG4gICAgICAgIGludm9rZShcInJlc2l6ZTpcIiArIHJlc2l6ZUVkZ2UpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZHJhZ1Rlc3QoZSkpIHtcbiAgICAgICAgLy8gVGhpcyBjaGVja3MgZm9yIGNsaWNrcyBvbiB0aGUgc2Nyb2xsIGJhclxuICAgICAgICBpZiAoZS5vZmZzZXRYID4gZS50YXJnZXQuY2xpZW50V2lkdGggfHwgZS5vZmZzZXRZID4gZS50YXJnZXQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2hvdWxkRHJhZyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKCkge1xuICAgIHNob3VsZERyYWcgPSBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc2V0UmVzaXplKGN1cnNvcikge1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5jdXJzb3IgPSBjdXJzb3IgfHwgZGVmYXVsdEN1cnNvcjtcbiAgICByZXNpemVFZGdlID0gY3Vyc29yO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKSB7XG4gICAgaWYgKHNob3VsZERyYWcpIHtcbiAgICAgICAgc2hvdWxkRHJhZyA9IGZhbHNlO1xuICAgICAgICBsZXQgbW91c2VQcmVzc2VkID0gZS5idXR0b25zICE9PSB1bmRlZmluZWQgPyBlLmJ1dHRvbnMgOiBlLndoaWNoO1xuICAgICAgICBpZiAobW91c2VQcmVzc2VkID4gMCkge1xuICAgICAgICAgICAgaW52b2tlKFwiZHJhZ1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXJlc2l6YWJsZSB8fCAhSXNXaW5kb3dzKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZGVmYXVsdEN1cnNvciA9PSBudWxsKSB7XG4gICAgICAgIGRlZmF1bHRDdXJzb3IgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuY3Vyc29yO1xuICAgIH1cbiAgICBsZXQgcmVzaXplSGFuZGxlSGVpZ2h0ID0gR2V0RmxhZyhcInN5c3RlbS5yZXNpemVIYW5kbGVIZWlnaHRcIikgfHwgNTtcbiAgICBsZXQgcmVzaXplSGFuZGxlV2lkdGggPSBHZXRGbGFnKFwic3lzdGVtLnJlc2l6ZUhhbmRsZVdpZHRoXCIpIHx8IDU7XG5cbiAgICAvLyBFeHRyYSBwaXhlbHMgZm9yIHRoZSBjb3JuZXIgYXJlYXNcbiAgICBsZXQgY29ybmVyRXh0cmEgPSBHZXRGbGFnKFwicmVzaXplQ29ybmVyRXh0cmFcIikgfHwgMTA7XG5cbiAgICBsZXQgcmlnaHRCb3JkZXIgPSB3aW5kb3cub3V0ZXJXaWR0aCAtIGUuY2xpZW50WCA8IHJlc2l6ZUhhbmRsZVdpZHRoO1xuICAgIGxldCBsZWZ0Qm9yZGVyID0gZS5jbGllbnRYIDwgcmVzaXplSGFuZGxlV2lkdGg7XG4gICAgbGV0IHRvcEJvcmRlciA9IGUuY2xpZW50WSA8IHJlc2l6ZUhhbmRsZUhlaWdodDtcbiAgICBsZXQgYm90dG9tQm9yZGVyID0gd2luZG93Lm91dGVySGVpZ2h0IC0gZS5jbGllbnRZIDwgcmVzaXplSGFuZGxlSGVpZ2h0O1xuXG4gICAgLy8gQWRqdXN0IGZvciBjb3JuZXJzXG4gICAgbGV0IHJpZ2h0Q29ybmVyID0gd2luZG93Lm91dGVyV2lkdGggLSBlLmNsaWVudFggPCAocmVzaXplSGFuZGxlV2lkdGggKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IGxlZnRDb3JuZXIgPSBlLmNsaWVudFggPCAocmVzaXplSGFuZGxlV2lkdGggKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IHRvcENvcm5lciA9IGUuY2xpZW50WSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG4gICAgbGV0IGJvdHRvbUNvcm5lciA9IHdpbmRvdy5vdXRlckhlaWdodCAtIGUuY2xpZW50WSA8IChyZXNpemVIYW5kbGVIZWlnaHQgKyBjb3JuZXJFeHRyYSk7XG5cbiAgICAvLyBJZiB3ZSBhcmVuJ3Qgb24gYW4gZWRnZSwgYnV0IHdlcmUsIHJlc2V0IHRoZSBjdXJzb3IgdG8gZGVmYXVsdFxuICAgIGlmICghbGVmdEJvcmRlciAmJiAhcmlnaHRCb3JkZXIgJiYgIXRvcEJvcmRlciAmJiAhYm90dG9tQm9yZGVyICYmIHJlc2l6ZUVkZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXRSZXNpemUoKTtcbiAgICB9XG4gICAgLy8gQWRqdXN0ZWQgZm9yIGNvcm5lciBhcmVhc1xuICAgIGVsc2UgaWYgKHJpZ2h0Q29ybmVyICYmIGJvdHRvbUNvcm5lcikgc2V0UmVzaXplKFwic2UtcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGxlZnRDb3JuZXIgJiYgYm90dG9tQ29ybmVyKSBzZXRSZXNpemUoXCJzdy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAobGVmdENvcm5lciAmJiB0b3BDb3JuZXIpIHNldFJlc2l6ZShcIm53LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmICh0b3BDb3JuZXIgJiYgcmlnaHRDb3JuZXIpIHNldFJlc2l6ZShcIm5lLXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmIChsZWZ0Qm9yZGVyKSBzZXRSZXNpemUoXCJ3LXJlc2l6ZVwiKTtcbiAgICBlbHNlIGlmICh0b3BCb3JkZXIpIHNldFJlc2l6ZShcIm4tcmVzaXplXCIpO1xuICAgIGVsc2UgaWYgKGJvdHRvbUJvcmRlcikgc2V0UmVzaXplKFwicy1yZXNpemVcIik7XG4gICAgZWxzZSBpZiAocmlnaHRCb3JkZXIpIHNldFJlc2l6ZShcImUtcmVzaXplXCIpO1xufVxuIiwgIi8qXG4gX1x0ICAgX19cdCAgXyBfX1xufCB8XHQgLyAvX19fIF8oXykgL19fX19cbnwgfCAvfCAvIC8gX18gYC8gLyAvIF9fXy9cbnwgfC8gfC8gLyAvXy8gLyAvIChfXyAgKVxufF9fL3xfXy9cXF9fLF8vXy9fL19fX18vXG5UaGUgZWxlY3Ryb24gYWx0ZXJuYXRpdmUgZm9yIEdvXG4oYykgTGVhIEFudGhvbnkgMjAxOS1wcmVzZW50XG4qL1xuXG4vKiBqc2hpbnQgZXN2ZXJzaW9uOiA5ICovXG5cbmltcG9ydCB7bmV3UnVudGltZUNhbGxlcldpdGhJRCwgb2JqZWN0TmFtZXN9IGZyb20gXCIuL3J1bnRpbWUuanNcIjtcbmltcG9ydCB7bmFub2lkfSBmcm9tIFwiLi9uYW5vaWQuanNcIjtcblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xud2luZG93Ll93YWlscy5jYWxsUmVzdWx0SGFuZGxlciA9IHJlc3VsdEhhbmRsZXI7XG53aW5kb3cuX3dhaWxzLmNhbGxFcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXI7XG5cbmNvbnN0IENhbGxCaW5kaW5nID0gMDtcbmNvbnN0IGNhbGwgPSBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdE5hbWVzLkNhbGwsICcnKTtcbmNvbnN0IGNhbmNlbENhbGwgPSBuZXdSdW50aW1lQ2FsbGVyV2l0aElEKG9iamVjdE5hbWVzLkNhbmNlbENhbGwsICcnKTtcbmxldCBjYWxsUmVzcG9uc2VzID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHVuaXF1ZSBJRCB1c2luZyB0aGUgbmFub2lkIGxpYnJhcnkuXG4gKlxuICogQHJldHVybiB7c3RyaW5nfSAtIEEgdW5pcXVlIElEIHRoYXQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGNhbGxSZXNwb25zZXMgc2V0LlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUlEKCkge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZG8ge1xuICAgICAgICByZXN1bHQgPSBuYW5vaWQoKTtcbiAgICB9IHdoaWxlIChjYWxsUmVzcG9uc2VzLmhhcyhyZXN1bHQpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEhhbmRsZXMgdGhlIHJlc3VsdCBvZiBhIGNhbGwgcmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBUaGUgaWQgb2YgdGhlIHJlcXVlc3QgdG8gaGFuZGxlIHRoZSByZXN1bHQgZm9yLlxuICogQHBhcmFtIHtzdHJpbmd9IGRhdGEgLSBUaGUgcmVzdWx0IGRhdGEgb2YgdGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGlzSlNPTiAtIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkYXRhIGlzIEpTT04gb3Igbm90LlxuICpcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH0gLSBUaGlzIG1ldGhvZCBkb2VzIG5vdCByZXR1cm4gYW55IHZhbHVlLlxuICovXG5mdW5jdGlvbiByZXN1bHRIYW5kbGVyKGlkLCBkYXRhLCBpc0pTT04pIHtcbiAgICBjb25zdCBwcm9taXNlSGFuZGxlciA9IGdldEFuZERlbGV0ZVJlc3BvbnNlKGlkKTtcbiAgICBpZiAocHJvbWlzZUhhbmRsZXIpIHtcbiAgICAgICAgcHJvbWlzZUhhbmRsZXIucmVzb2x2ZShpc0pTT04gPyBKU09OLnBhcnNlKGRhdGEpIDogZGF0YSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEhhbmRsZXMgdGhlIGVycm9yIGZyb20gYSBjYWxsIHJlcXVlc3QuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gVGhlIGlkIG9mIHRoZSBwcm9taXNlIGhhbmRsZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBlcnJvciBtZXNzYWdlIHRvIHJlamVjdCB0aGUgcHJvbWlzZSBoYW5kbGVyIHdpdGguXG4gKlxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gZXJyb3JIYW5kbGVyKGlkLCBtZXNzYWdlKSB7XG4gICAgY29uc3QgcHJvbWlzZUhhbmRsZXIgPSBnZXRBbmREZWxldGVSZXNwb25zZShpZCk7XG4gICAgaWYgKHByb21pc2VIYW5kbGVyKSB7XG4gICAgICAgIHByb21pc2VIYW5kbGVyLnJlamVjdChtZXNzYWdlKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGFuZCByZW1vdmVzIHRoZSByZXNwb25zZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIElEIGZyb20gdGhlIGNhbGxSZXNwb25zZXMgbWFwLlxuICpcbiAqIEBwYXJhbSB7YW55fSBpZCAtIFRoZSBJRCBvZiB0aGUgcmVzcG9uc2UgdG8gYmUgcmV0cmlldmVkIGFuZCByZW1vdmVkLlxuICpcbiAqIEByZXR1cm5zIHthbnl9IFRoZSByZXNwb25zZSBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBJRC5cbiAqL1xuZnVuY3Rpb24gZ2V0QW5kRGVsZXRlUmVzcG9uc2UoaWQpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGNhbGxSZXNwb25zZXMuZ2V0KGlkKTtcbiAgICBjYWxsUmVzcG9uc2VzLmRlbGV0ZShpZCk7XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgY2FsbCB1c2luZyB0aGUgcHJvdmlkZWQgdHlwZSBhbmQgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ9IHR5cGUgLSBUaGUgdHlwZSBvZiBjYWxsIHRvIGV4ZWN1dGUuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIC0gQWRkaXRpb25hbCBvcHRpb25zIGZvciB0aGUgY2FsbC5cbiAqIEByZXR1cm4ge1Byb21pc2V9IC0gQSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvciByZWplY3RlZCBiYXNlZCBvbiB0aGUgcmVzdWx0IG9mIHRoZSBjYWxsLiBJdCBhbHNvIGhhcyBhIGNhbmNlbCBtZXRob2QgdG8gY2FuY2VsIGEgbG9uZyBydW5uaW5nIHJlcXVlc3QuXG4gKi9cbmZ1bmN0aW9uIGNhbGxCaW5kaW5nKHR5cGUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGlkID0gZ2VuZXJhdGVJRCgpO1xuICAgIGNvbnN0IGRvQ2FuY2VsID0gKCkgPT4geyByZXR1cm4gY2FuY2VsQ2FsbCh0eXBlLCB7XCJjYWxsLWlkXCI6IGlkfSkgfTtcbiAgICBsZXQgcXVldWVkQ2FuY2VsID0gZmFsc2UsIGNhbGxSdW5uaW5nID0gZmFsc2U7XG4gICAgbGV0IHAgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIG9wdGlvbnNbXCJjYWxsLWlkXCJdID0gaWQ7XG4gICAgICAgIGNhbGxSZXNwb25zZXMuc2V0KGlkLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgICAgY2FsbCh0eXBlLCBvcHRpb25zKS5cbiAgICAgICAgICAgIHRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgICAgICBjYWxsUnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlZENhbmNlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9DYW5jZWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5cbiAgICAgICAgICAgIGNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgY2FsbFJlc3BvbnNlcy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcC5jYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIGlmIChjYWxsUnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGRvQ2FuY2VsKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWV1ZWRDYW5jZWwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBwO1xufVxuXG4vKipcbiAqIENhbGwgbWV0aG9kLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gVGhlIG9wdGlvbnMgZm9yIHRoZSBtZXRob2QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIFRoZSByZXN1bHQgb2YgdGhlIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYWxsKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGEgbWV0aG9kIGJ5IG5hbWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIGluIHRoZSBmb3JtYXQgJ3BhY2thZ2Uuc3RydWN0Lm1ldGhvZCcuXG4gKiBAcGFyYW0gey4uLip9IGFyZ3MgLSBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIG1ldGhvZC5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgbmFtZSBpcyBub3QgYSBzdHJpbmcgb3IgaXMgbm90IGluIHRoZSBjb3JyZWN0IGZvcm1hdC5cbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgZXhlY3V0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQnlOYW1lKG5hbWUsIC4uLmFyZ3MpIHtcbiAgICAvLyBQYWNrYWdlIHBhdGhzIG1heSBjb250YWluIGRvdHM6IHNwbGl0IHdpdGggY3VzdG9tIGNvZGVcbiAgICAvLyB0byBlbnN1cmUgb25seSB0aGUgbGFzdCB0d28gZG90cyBhcmUgdGFrZW4gaW50byBhY2NvdW50LlxuICAgIGxldCBtZXRob2REb3QgPSAtMSwgc3RydWN0RG90ID0gLTE7XG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIG1ldGhvZERvdCA9IG5hbWUubGFzdEluZGV4T2YoXCIuXCIpO1xuICAgICAgICBpZiAobWV0aG9kRG90ID4gMClcbiAgICAgICAgICAgIHN0cnVjdERvdCA9IG5hbWUubGFzdEluZGV4T2YoXCIuXCIsIG1ldGhvZERvdCAtIDEpO1xuICAgIH1cblxuICAgIGlmIChtZXRob2REb3QgPCAwIHx8IHN0cnVjdERvdCA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbEJ5TmFtZSByZXF1aXJlcyBhIHN0cmluZyBpbiB0aGUgZm9ybWF0ICdwYWNrYWdlUGF0aC5zdHJ1Y3QubWV0aG9kJ1wiKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlUGF0aCA9IG5hbWUuc2xpY2UoMCwgc3RydWN0RG90KSxcbiAgICAgICAgICBzdHJ1Y3ROYW1lID0gbmFtZS5zbGljZShzdHJ1Y3REb3QgKyAxLCBtZXRob2REb3QpLFxuICAgICAgICAgIG1ldGhvZE5hbWUgPSBuYW1lLnNsaWNlKG1ldGhvZERvdCArIDEpO1xuXG4gICAgcmV0dXJuIGNhbGxCaW5kaW5nKENhbGxCaW5kaW5nLCB7XG4gICAgICAgIHBhY2thZ2VQYXRoLFxuICAgICAgICBzdHJ1Y3ROYW1lLFxuICAgICAgICBtZXRob2ROYW1lLFxuICAgICAgICBhcmdzXG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2QgYnkgaXRzIElEIHdpdGggdGhlIHNwZWNpZmllZCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IG1ldGhvZElEIC0gVGhlIElEIG9mIHRoZSBtZXRob2QgdG8gY2FsbC5cbiAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kLlxuICogQHJldHVybiB7Kn0gLSBUaGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgY2FsbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJ5SUQobWV0aG9kSUQsIC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gY2FsbEJpbmRpbmcoQ2FsbEJpbmRpbmcsIHtcbiAgICAgICAgbWV0aG9kSUQsXG4gICAgICAgIGFyZ3NcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDYWxscyBhIG1ldGhvZCBvbiBhIHBsdWdpbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGx1Z2luTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBwbHVnaW4uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtZXRob2QgdG8gY2FsbC5cbiAqIEBwYXJhbSB7Li4uKn0gYXJncyAtIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgbWV0aG9kLlxuICogQHJldHVybnMgeyp9IC0gVGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGNhbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQbHVnaW4ocGx1Z2luTmFtZSwgbWV0aG9kTmFtZSwgLi4uYXJncykge1xuICAgIHJldHVybiBjYWxsQmluZGluZyhDYWxsQmluZGluZywge1xuICAgICAgICBwYWNrYWdlTmFtZTogXCJ3YWlscy1wbHVnaW5zXCIsXG4gICAgICAgIHN0cnVjdE5hbWU6IHBsdWdpbk5hbWUsXG4gICAgICAgIG1ldGhvZE5hbWUsXG4gICAgICAgIGFyZ3NcbiAgICB9KTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG4vKipcbiAqIEFueSBpcyBhIGR1bW15IGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBzaW1wbGUgb3IgdW5rbm93biB0eXBlcy5cbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge2FueX0gc291cmNlXG4gKiBAcmV0dXJucyB7VH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFueShzb3VyY2UpIHtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHtUfSAqLyhzb3VyY2UpO1xufVxuXG4vKipcbiAqIEFycmF5IHRha2VzIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGFuIGFyYml0cmFyeSB0eXBlXG4gKiBhbmQgcmV0dXJucyBhbiBpbi1wbGFjZSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJyYXlcbiAqIHdob3NlIGVsZW1lbnRzIGFyZSBvZiB0aGF0IHR5cGUuXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHsoYW55KSA9PiBUfSBlbGVtZW50XG4gKiBAcmV0dXJucyB7KGFueSkgPT4gVFtdfVxuICovXG5leHBvcnQgZnVuY3Rpb24gQXJyYXkoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50ID09PSBBbnkpIHtcbiAgICAgICAgcmV0dXJuIChzb3VyY2UpID0+IChzb3VyY2UgPT09IG51bGwgPyBbXSA6IHNvdXJjZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzb3VyY2UpID0+IHtcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc291cmNlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzb3VyY2VbaV0gPSBlbGVtZW50KHNvdXJjZVtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICB9O1xufVxuXG4vKipcbiAqIE1hcCB0YWtlcyBjcmVhdGlvbiBmdW5jdGlvbnMgZm9yIHR3byBhcmJpdHJhcnkgdHlwZXNcbiAqIGFuZCByZXR1cm5zIGFuIGluLXBsYWNlIGNyZWF0aW9uIGZ1bmN0aW9uIGZvciBhbiBvYmplY3RcbiAqIHdob3NlIGtleXMgYW5kIHZhbHVlcyBhcmUgb2YgdGhvc2UgdHlwZXMuXG4gKiBAdGVtcGxhdGUgSywgVlxuICogQHBhcmFtIHsoYW55KSA9PiBLfSBrZXlcbiAqIEBwYXJhbSB7KGFueSkgPT4gVn0gdmFsdWVcbiAqIEByZXR1cm5zIHsoYW55KSA9PiB7IFtfOiBLXTogViB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gTWFwKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IEFueSkge1xuICAgICAgICByZXR1cm4gKHNvdXJjZSkgPT4gKHNvdXJjZSA9PT0gbnVsbCA/IHt9IDogc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNvdXJjZSkgPT4ge1xuICAgICAgICBpZiAoc291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBzb3VyY2Vba2V5XSA9IHZhbHVlKHNvdXJjZVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG59XG5cbi8qKlxuICogTnVsbGFibGUgdGFrZXMgYSBjcmVhdGlvbiBmdW5jdGlvbiBmb3IgYW4gYXJiaXRyYXJ5IHR5cGVcbiAqIGFuZCByZXR1cm5zIGEgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGEgbnVsbGFibGUgdmFsdWUgb2YgdGhhdCB0eXBlLlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7KGFueSkgPT4gVH0gZWxlbWVudFxuICogQHJldHVybnMgeyhhbnkpID0+IChUIHwgbnVsbCl9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBOdWxsYWJsZShlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQgPT09IEFueSkge1xuICAgICAgICByZXR1cm4gQW55O1xuICAgIH1cblxuICAgIHJldHVybiAoc291cmNlKSA9PiAoc291cmNlID09PSBudWxsID8gbnVsbCA6IGVsZW1lbnQoc291cmNlKSk7XG59XG5cbi8qKlxuICogU3RydWN0IHRha2VzIGFuIG9iamVjdCBtYXBwaW5nIGZpZWxkIG5hbWVzIHRvIGNyZWF0aW9uIGZ1bmN0aW9uc1xuICogYW5kIHJldHVybnMgYW4gaW4tcGxhY2UgY3JlYXRpb24gZnVuY3Rpb24gZm9yIGEgc3RydWN0LlxuICogQHRlbXBsYXRlIHt7IFtfOiBzdHJpbmddOiAoKGFueSkgPT4gYW55KSB9fSBUXG4gKiBAdGVtcGxhdGUge3sgW0tleSBpbiBrZXlvZiBUXT86IFJldHVyblR5cGU8VFtLZXldPiB9fSBVXG4gKiBAcGFyYW0ge1R9IGNyZWF0ZUZpZWxkXG4gKiBAcmV0dXJucyB7KGFueSkgPT4gVX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN0cnVjdChjcmVhdGVGaWVsZCkge1xuICAgIGxldCBhbGxBbnkgPSB0cnVlO1xuICAgIGZvciAoY29uc3QgbmFtZSBpbiBjcmVhdGVGaWVsZCkge1xuICAgICAgICBpZiAoY3JlYXRlRmllbGRbbmFtZV0gIT09IEFueSkge1xuICAgICAgICAgICAgYWxsQW55ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYWxsQW55KSB7XG4gICAgICAgIHJldHVybiBBbnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChzb3VyY2UpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIGluIGNyZWF0ZUZpZWxkKSB7XG4gICAgICAgICAgICBpZiAobmFtZSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBzb3VyY2VbbmFtZV0gPSBjcmVhdGVGaWVsZFtuYW1lXShzb3VyY2VbbmFtZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfTtcbn1cbiIsICIvKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLy8gU2V0dXBcbndpbmRvdy5fd2FpbHMgPSB3aW5kb3cuX3dhaWxzIHx8IHt9O1xuXG5pbXBvcnQgXCIuL2NvbnRleHRtZW51LmpzXCI7XG5pbXBvcnQgXCIuL2RyYWcuanNcIjtcblxuLy8gUmUtZXhwb3J0IChpbnRlcm5hbCkgcHVibGljIEFQSVxuZXhwb3J0ICogYXMgQ2FsbCBmcm9tIFwiLi9jYWxsLmpzXCI7XG5leHBvcnQgKiBhcyBDcmVhdGUgZnJvbSBcIi4vY3JlYXRlLmpzXCI7XG5leHBvcnQgKiBhcyBGbGFncyBmcm9tIFwiLi9mbGFncy5qc1wiO1xuZXhwb3J0ICogYXMgU3lzdGVtIGZyb20gXCIuL3N5c3RlbS5qc1wiO1xuXG5pbXBvcnQge2ludm9rZX0gZnJvbSBcIi4vcnVudGltZS5qc1wiO1xuXG4vLyBQcm92aWRlIGR1bW15IGV2ZW50IGxpc3RlbmVyLlxuaWYgKCEoXCJkaXNwYXRjaFdhaWxzRXZlbnRcIiBpbiB3aW5kb3cuX3dhaWxzKSkge1xuICAgIHdpbmRvdy5fd2FpbHMuZGlzcGF0Y2hXYWlsc0V2ZW50ID0gZnVuY3Rpb24gKCkge307XG59XG5cbi8vIE5vdGlmeSBiYWNrZW5kXG53aW5kb3cuX3dhaWxzLmludm9rZSA9IGludm9rZTtcbmludm9rZShcIndhaWxzOnJ1bnRpbWU6cmVhZHlcIik7XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHtDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZX0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuLyoqXG4gKiBPcGVuVVJMIG9wZW5zIGEgYnJvd3NlciB3aW5kb3cgdG8gdGhlIGdpdmVuIFVSTC5cbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlblVSTCh1cmwpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQxNDE0MDgxODUsIHVybCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHtDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZX0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0ICogZnJvbSBcIi4uL2NvcmUvY2FsbC5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGV9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbi8qKlxuICogU2V0VGV4dCB3cml0ZXMgdGhlIGdpdmVuIHN0cmluZyB0byB0aGUgQ2xpcGJvYXJkLlxuICogSXQgcmV0dXJucyB0cnVlIGlmIHRoZSBvcGVyYXRpb24gc3VjY2VlZGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRUZXh0KHRleHQpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDk0MDU3Mzc0OSwgdGV4dCk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVGV4dCByZXRyaWV2ZXMgYSBzdHJpbmcgZnJvbSB0aGUgY2xpcGJvYXJkLlxuICogSWYgdGhlIG9wZXJhdGlvbiBmYWlscywgaXQgcmV0dXJucyBudWxsLlxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nIHwgbnVsbD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUZXh0KCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjQ5MjM4NjIxKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi4vY29yZS9jcmVhdGUuanNcIjtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5leHBvcnQge01lc3NhZ2VEaWFsb2dPcHRpb25zLCBCdXR0b24sIEZpbGVGaWx0ZXIsIE9wZW5GaWxlRGlhbG9nT3B0aW9ucywgU2F2ZUZpbGVEaWFsb2dPcHRpb25zfSBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuLyoqXG4gKiBFcnJvciBzaG93cyBhIG1vZGFsIGRpYWxvZyBjb250YWluaW5nIGFuIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0geyRtb2RlbHMuTWVzc2FnZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFcnJvcihvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyNTA4ODYyODk1LCBvcHRpb25zKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBJbmZvIHNob3dzIGEgbW9kYWwgZGlhbG9nIGNvbnRhaW5pbmcgYW4gaW5mb3JtYXRpb25hbCBtZXNzYWdlLlxuICogQHBhcmFtIHskbW9kZWxzLk1lc3NhZ2VEaWFsb2dPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSW5mbyhvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MDgzMTA4Mywgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogT3BlbkZpbGUgc2hvd3MgYSBkaWFsb2cgdGhhdCBhbGxvd3MgdGhlIHVzZXJcbiAqIHRvIHNlbGVjdCBvbmUgb3IgbW9yZSBmaWxlcyB0byBvcGVuLlxuICogSXQgbWF5IHRocm93IGFuIGV4Y2VwdGlvbiBpbiBjYXNlIG9mIGVycm9ycy5cbiAqIEl0IHJldHVybnMgYSBzdHJpbmcgaW4gc2luZ2xlIHNlbGVjdGlvbiBtb2RlLFxuICogYW4gYXJyYXkgb2Ygc3RyaW5ncyBpbiBtdWx0aXBsZSBzZWxlY3Rpb24gbW9kZS5cbiAqIEBwYXJhbSB7JG1vZGVscy5PcGVuRmlsZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPcGVuRmlsZShvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyOTU4NTcxMTAxLCBvcHRpb25zKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBRdWVzdGlvbiBzaG93cyBhIG1vZGFsIGRpYWxvZyBhc2tpbmcgYSBxdWVzdGlvbi5cbiAqIEBwYXJhbSB7JG1vZGVscy5NZXNzYWdlRGlhbG9nT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFF1ZXN0aW9uKG9wdGlvbnMpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDEzNzgzODIzOTUsIG9wdGlvbnMpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNhdmVGaWxlIHNob3dzIGEgZGlhbG9nIHRoYXQgYWxsb3dzIHRoZSB1c2VyXG4gKiB0byBzZWxlY3QgYSBsb2NhdGlvbiB3aGVyZSBhIGZpbGUgc2hvdWxkIGJlIHNhdmVkLlxuICogSXQgbWF5IHRocm93IGFuIGV4Y2VwdGlvbiBpbiBjYXNlIG9mIGVycm9ycy5cbiAqIEBwYXJhbSB7JG1vZGVscy5TYXZlRmlsZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTYXZlRmlsZShvcHRpb25zKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNDQxNzczNjQ0LCBvcHRpb25zKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBXYXJuaW5nIHNob3dzIGEgbW9kYWwgZGlhbG9nIGNvbnRhaW5pbmcgYSB3YXJuaW5nIG1lc3NhZ2UuXG4gKiBAcGFyYW0geyRtb2RlbHMuTWVzc2FnZURpYWxvZ09wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBXYXJuaW5nKG9wdGlvbnMpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDkzODQ1NDEwNSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHtDcmVhdGUgYXMgJENyZWF0ZX0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0IGNsYXNzIEJ1dHRvbiB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBCdXR0b24gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPEJ1dHRvbj59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgQnV0dG9uLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGV4dCB0aGF0IGFwcGVhcnMgd2l0aGluIHRoZSBidXR0b24uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTGFiZWxcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRydWUgaWYgdGhlIGJ1dHRvbiBzaG91bGQgY2FuY2VsIGFuIG9wZXJhdGlvbiB3aGVuIGNsaWNrZWQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIklzQ2FuY2VsXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVHJ1ZSBpZiB0aGUgYnV0dG9uIHNob3VsZCBiZSB0aGUgZGVmYXVsdCBhY3Rpb24gd2hlbiB0aGUgdXNlciBwcmVzc2VzIGVudGVyLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJJc0RlZmF1bHRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgQnV0dG9uIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7QnV0dG9ufVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgQnV0dG9uKC8qKiBAdHlwZSB7UGFydGlhbDxCdXR0b24+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50SW5mbyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBFbnZpcm9ubWVudEluZm8gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPEVudmlyb25tZW50SW5mbz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgRW52aXJvbm1lbnRJbmZvLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKCEoXCJPU1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgb3BlcmF0aW5nIHN5c3RlbSBpbiB1c2UuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiT1NcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQXJjaFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYXJjaGl0ZWN0dXJlIG9mIHRoZSBzeXN0ZW0uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQXJjaFwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJEZWJ1Z1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUcnVlIGlmIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGRlYnVnIG1vZGUsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGVidWdcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlBsYXRmb3JtSW5mb1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBBZGRpdGlvbmFsIHBsYXRmb3JtIGluZm9ybWF0aW9uLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3sgW186IHN0cmluZ106IGFueSB9fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiUGxhdGZvcm1JbmZvXCJdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJPU0luZm9cIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRGV0YWlscyBvZiB0aGUgb3BlcmF0aW5nIHN5c3RlbS5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtPU0luZm99XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJPU0luZm9cIl0gPSAobmV3IE9TSW5mbygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgRW52aXJvbm1lbnRJbmZvIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7RW52aXJvbm1lbnRJbmZvfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDNfMCA9ICQkY3JlYXRlVHlwZTA7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQ0XzAgPSAkJGNyZWF0ZVR5cGUxO1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgaWYgKFwiUGxhdGZvcm1JbmZvXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiUGxhdGZvcm1JbmZvXCJdID0gJCRjcmVhdGVGaWVsZDNfMCgkJHBhcnNlZFNvdXJjZVtcIlBsYXRmb3JtSW5mb1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFwiT1NJbmZvXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiT1NJbmZvXCJdID0gJCRjcmVhdGVGaWVsZDRfMCgkJHBhcnNlZFNvdXJjZVtcIk9TSW5mb1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBFbnZpcm9ubWVudEluZm8oLyoqIEB0eXBlIHtQYXJ0aWFsPEVudmlyb25tZW50SW5mbz59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmlsZUZpbHRlciB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBGaWxlRmlsdGVyIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxGaWxlRmlsdGVyPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBGaWxlRmlsdGVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmlsdGVyIGluZm9ybWF0aW9uLCBlLmcuIFwiSW1hZ2UgRmlsZXMgKCouanBnLCAqLnBuZylcIlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkRpc3BsYXlOYW1lXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgZXh0ZW5zaW9uIHBhdHRlcm5zLCBlLmcuIFwiKi5qcGc7Ki5wbmdcIlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlBhdHRlcm5cIl0gPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBGaWxlRmlsdGVyIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7RmlsZUZpbHRlcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IEZpbGVGaWx0ZXIoLyoqIEB0eXBlIHtQYXJ0aWFsPEZpbGVGaWx0ZXI+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIExSVEIge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTFJUQiBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8TFJUQj59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgTFJUQi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiTGVmdFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiTGVmdFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJSaWdodFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiUmlnaHRcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiVG9wXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJUb3BcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQm90dG9tXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCb3R0b21cIl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBMUlRCIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7TFJUQn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IExSVEIoLyoqIEB0eXBlIHtQYXJ0aWFsPExSVEI+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VEaWFsb2dPcHRpb25zIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IE1lc3NhZ2VEaWFsb2dPcHRpb25zIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxNZXNzYWdlRGlhbG9nT3B0aW9ucz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgTWVzc2FnZURpYWxvZ09wdGlvbnMuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgdGl0bGUgb2YgdGhlIGRpYWxvZyB3aW5kb3cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVGl0bGVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSBtYWluIG1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk1lc3NhZ2VcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIExpc3Qgb2YgYnV0dG9uIGNob2ljZXMgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge0J1dHRvbltdIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQnV0dG9uc1wiXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGV0YWNoZWRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgTWVzc2FnZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtNZXNzYWdlRGlhbG9nT3B0aW9uc31cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQyXzAgPSAkJGNyZWF0ZVR5cGUzO1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgaWYgKFwiQnV0dG9uc1wiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIkJ1dHRvbnNcIl0gPSAkJGNyZWF0ZUZpZWxkMl8wKCQkcGFyc2VkU291cmNlW1wiQnV0dG9uc1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBNZXNzYWdlRGlhbG9nT3B0aW9ucygvKiogQHR5cGUge1BhcnRpYWw8TWVzc2FnZURpYWxvZ09wdGlvbnM+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9TSW5mbyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBPU0luZm8gaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPE9TSW5mbz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgT1NJbmZvLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKCEoXCJJRFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgSUQgb2YgdGhlIE9TLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIklEXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIk5hbWVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIG5hbWUgb2YgdGhlIE9TLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk5hbWVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiVmVyc2lvblwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgdmVyc2lvbiBvZiB0aGUgT1MuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVmVyc2lvblwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJCcmFuZGluZ1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYnJhbmRpbmcgb2YgdGhlIE9TLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJyYW5kaW5nXCJdID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgT1NJbmZvIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7T1NJbmZvfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgT1NJbmZvKC8qKiBAdHlwZSB7UGFydGlhbDxPU0luZm8+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9wZW5GaWxlRGlhbG9nT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBPcGVuRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPE9wZW5GaWxlRGlhbG9nT3B0aW9ucz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgT3BlbkZpbGVEaWFsb2dPcHRpb25zLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjaG9zZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkNhbkNob29zZURpcmVjdG9yaWVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGZpbGVzIGNhbiBiZSBjaG9zZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkNhbkNob29zZUZpbGVzXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjcmVhdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5DcmVhdGVEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBoaWRkZW4gZmlsZXMgc2hvdWxkIGJlIHNob3duLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJTaG93SGlkZGVuRmlsZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgYWxpYXNlcyBzaG91bGQgYmUgcmVzb2x2ZWQuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlJlc29sdmVzQWxpYXNlc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBtdWx0aXBsZSBzZWxlY3Rpb24gaXMgYWxsb3dlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxsb3dzTXVsdGlwbGVTZWxlY3Rpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZXh0ZW5zaW9ucyBzaG91bGQgYmUgaGlkZGVuLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJIaWRlRXh0ZW5zaW9uXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGhpZGRlbiBleHRlbnNpb25zIGNhbiBiZSBzZWxlY3RlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQ2FuU2VsZWN0SGlkZGVuRXh0ZW5zaW9uXCJdID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGZpbGUgcGFja2FnZXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZGlyZWN0b3JpZXMuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlRyZWF0c0ZpbGVQYWNrYWdlc0FzRGlyZWN0b3JpZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgb3RoZXIgZmlsZSB0eXBlcyBhcmUgYWxsb3dlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxsb3dzT3RoZXJGaWxlVHlwZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaXRsZSBvZiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlRpdGxlXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBNZXNzYWdlIHRvIHNob3cgaW4gdGhlIGRpYWxvZy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJNZXNzYWdlXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCdXR0b25UZXh0XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEaXJlY3RvcnkgdG8gb3BlbiBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkRpcmVjdG9yeVwiXSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTGlzdCBvZiBmaWxlIGZpbHRlcnMuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7RmlsZUZpbHRlcltdIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRmlsdGVyc1wiXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIGFwcGVhciBkZXRhY2hlZCBmcm9tIHRoZSBtYWluIHdpbmRvdy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGV0YWNoZWRcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgT3BlbkZpbGVEaWFsb2dPcHRpb25zIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7T3BlbkZpbGVEaWFsb2dPcHRpb25zfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDE0XzAgPSAkJGNyZWF0ZVR5cGU1O1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgaWYgKFwiRmlsdGVyc1wiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIkZpbHRlcnNcIl0gPSAkJGNyZWF0ZUZpZWxkMTRfMCgkJHBhcnNlZFNvdXJjZVtcIkZpbHRlcnNcIl0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgT3BlbkZpbGVEaWFsb2dPcHRpb25zKC8qKiBAdHlwZSB7UGFydGlhbDxPcGVuRmlsZURpYWxvZ09wdGlvbnM+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFBvc2l0aW9uIGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7UGFydGlhbDxQb3NpdGlvbj59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgUG9zaXRpb24uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIlhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiWVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiWVwiXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFBvc2l0aW9uIGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7UG9zaXRpb259XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIG5ldyBQb3NpdGlvbigvKiogQHR5cGUge1BhcnRpYWw8UG9zaXRpb24+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJHQkEge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUkdCQSBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8UkdCQT59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgUkdCQS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGlmICghKFwiUmVkXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJSZWRcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiR3JlZW5cIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkdyZWVuXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIkJsdWVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJsdWVcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiQWxwaGFcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkFscGhhXCJdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgJCRzb3VyY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUkdCQSBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2FueX0gWyQkc291cmNlID0ge31dXG4gICAgICogQHJldHVybnMge1JHQkF9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBsZXQgJCRwYXJzZWRTb3VyY2UgPSB0eXBlb2YgJCRzb3VyY2UgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSgkJHNvdXJjZSkgOiAkJHNvdXJjZTtcbiAgICAgICAgcmV0dXJuIG5ldyBSR0JBKC8qKiBAdHlwZSB7UGFydGlhbDxSR0JBPn0gKi8oJCRwYXJzZWRTb3VyY2UpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN0IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFJlY3QgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFJlY3Q+fSBbJCRzb3VyY2UgPSB7fV0gLSBUaGUgc291cmNlIG9iamVjdCB0byBjcmVhdGUgdGhlIFJlY3QuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIlhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiWVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiWVwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJXaWR0aFwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiV2lkdGhcIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiSGVpZ2h0XCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJIZWlnaHRcIl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBSZWN0IGluc3RhbmNlIGZyb20gYSBzdHJpbmcgb3Igb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7YW55fSBbJCRzb3VyY2UgPSB7fV1cbiAgICAgKiBAcmV0dXJucyB7UmVjdH1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICByZXR1cm4gbmV3IFJlY3QoLyoqIEB0eXBlIHtQYXJ0aWFsPFJlY3Q+fSAqLygkJHBhcnNlZFNvdXJjZSkpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhdmVGaWxlRGlhbG9nT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBTYXZlRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFNhdmVGaWxlRGlhbG9nT3B0aW9ucz59IFskJHNvdXJjZSA9IHt9XSAtIFRoZSBzb3VyY2Ugb2JqZWN0IHRvIGNyZWF0ZSB0aGUgU2F2ZUZpbGVEaWFsb2dPcHRpb25zLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIGlmIGRpcmVjdG9yaWVzIGNhbiBiZSBjcmVhdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5DcmVhdGVEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiBoaWRkZW4gZmlsZXMgc2hvdWxkIGJlIHNob3duLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJTaG93SGlkZGVuRmlsZXNcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgaGlkZGVuIGV4dGVuc2lvbnMgY2FuIGJlIHNlbGVjdGVkLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJDYW5TZWxlY3RIaWRkZW5FeHRlbnNpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgb3RoZXIgZmlsZSB0eXBlcyBhcmUgYWxsb3dlZC5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiQWxsb3dPdGhlckZpbGVUeXBlc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEluZGljYXRlcyBpZiB0aGUgZXh0ZW5zaW9uIHNob3VsZCBiZSBoaWRkZW4uXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbiB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkhpZGVFeHRlbnNpb25cIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBJbmRpY2F0ZXMgaWYgZmlsZSBwYWNrYWdlcyBzaG91bGQgYmUgdHJlYXRlZCBhcyBkaXJlY3Rvcmllcy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFuIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVHJlYXRzRmlsZVBhY2thZ2VzQXNEaXJlY3Rvcmllc1wiXSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRpdGxlIG9mIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiVGl0bGVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1lc3NhZ2UgdG8gc2hvdyBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk1lc3NhZ2VcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvKiogQHR5cGUge2FueX0gKi8oZmFsc2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERpcmVjdG9yeSB0byBvcGVuIGluIHRoZSBkaWFsb2cuXG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nIHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiRGlyZWN0b3J5XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBEZWZhdWx0IGZpbGVuYW1lIHRvIHVzZSBpbiB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkZpbGVuYW1lXCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUZXh0IHRvIGRpc3BsYXkgb24gdGhlIGJ1dHRvbi5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJCdXR0b25UZXh0XCJdID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoLyoqIEB0eXBlIHthbnl9ICovKGZhbHNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBMaXN0IG9mIGZpbGUgZmlsdGVycy5cbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtGaWxlRmlsdGVyW10gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJGaWx0ZXJzXCJdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC8qKiBAdHlwZSB7YW55fSAqLyhmYWxzZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGRpYWxvZyBzaG91bGQgYXBwZWFyIGRldGFjaGVkIGZyb20gdGhlIG1haW4gd2luZG93LlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW4gfCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJEZXRhY2hlZFwiXSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCAkJHNvdXJjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBTYXZlRmlsZURpYWxvZ09wdGlvbnMgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtTYXZlRmlsZURpYWxvZ09wdGlvbnN9XG4gICAgICovXG4gICAgc3RhdGljIGNyZWF0ZUZyb20oJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBjb25zdCAkJGNyZWF0ZUZpZWxkMTFfMCA9ICQkY3JlYXRlVHlwZTU7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICBpZiAoXCJGaWx0ZXJzXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiRmlsdGVyc1wiXSA9ICQkY3JlYXRlRmllbGQxMV8wKCQkcGFyc2VkU291cmNlW1wiRmlsdGVyc1wiXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBTYXZlRmlsZURpYWxvZ09wdGlvbnMoLyoqIEB0eXBlIHtQYXJ0aWFsPFNhdmVGaWxlRGlhbG9nT3B0aW9ucz59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2NyZWVuIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNjcmVlbiBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0ge1BhcnRpYWw8U2NyZWVuPn0gWyQkc291cmNlID0ge31dIC0gVGhlIHNvdXJjZSBvYmplY3QgdG8gY3JlYXRlIHRoZSBTY3JlZW4uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIklEXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEEgdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiSURcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiTmFtZVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIk5hbWVcIl0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICghKFwiU2NhbGVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHNjYWxlIGZhY3RvciBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlNjYWxlXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlhcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHgtY29vcmRpbmF0ZSBvZiB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJYXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIllcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHktY29vcmRpbmF0ZSBvZiB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZSByZWN0YW5nbGVcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJZXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIklzUHJpbWFyeVwiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBXaGV0aGVyIHRoaXMgaXMgdGhlIHByaW1hcnkgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJJc1ByaW1hcnlcIl0gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlJvdGF0aW9uXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSByb3RhdGlvbiBvZiB0aGUgZGlzcGxheVxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIlJvdGF0aW9uXCJdID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIlNpemVcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogVGhlIHNpemUgb2YgdGhlIGRpc3BsYXlcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtTaXplfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiU2l6ZVwiXSA9IChuZXcgU2l6ZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIkJvdW5kc1wiIGluICQkc291cmNlKSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgYm91bmRzIG9mIHRoZSBkaXNwbGF5XG4gICAgICAgICAgICAgKiBAbWVtYmVyXG4gICAgICAgICAgICAgKiBAdHlwZSB7UmVjdH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkJvdW5kc1wiXSA9IChuZXcgUmVjdCgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIShcIldvcmtBcmVhXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRoZSB3b3JrIGFyZWEgb2YgdGhlIGRpc3BsYXlcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtSZWN0fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzW1wiV29ya0FyZWFcIl0gPSAobmV3IFJlY3QoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNjcmVlbiBpbnN0YW5jZSBmcm9tIGEgc3RyaW5nIG9yIG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2FueX0gWyQkc291cmNlID0ge31dXG4gICAgICogQHJldHVybnMge1NjcmVlbn1cbiAgICAgKi9cbiAgICBzdGF0aWMgY3JlYXRlRnJvbSgkJHNvdXJjZSA9IHt9KSB7XG4gICAgICAgIGNvbnN0ICQkY3JlYXRlRmllbGQ3XzAgPSAkJGNyZWF0ZVR5cGU2O1xuICAgICAgICBjb25zdCAkJGNyZWF0ZUZpZWxkOF8wID0gJCRjcmVhdGVUeXBlNztcbiAgICAgICAgY29uc3QgJCRjcmVhdGVGaWVsZDlfMCA9ICQkY3JlYXRlVHlwZTc7XG4gICAgICAgIGxldCAkJHBhcnNlZFNvdXJjZSA9IHR5cGVvZiAkJHNvdXJjZSA9PT0gJ3N0cmluZycgPyBKU09OLnBhcnNlKCQkc291cmNlKSA6ICQkc291cmNlO1xuICAgICAgICBpZiAoXCJTaXplXCIgaW4gJCRwYXJzZWRTb3VyY2UpIHtcbiAgICAgICAgICAgICQkcGFyc2VkU291cmNlW1wiU2l6ZVwiXSA9ICQkY3JlYXRlRmllbGQ3XzAoJCRwYXJzZWRTb3VyY2VbXCJTaXplXCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJCb3VuZHNcIiBpbiAkJHBhcnNlZFNvdXJjZSkge1xuICAgICAgICAgICAgJCRwYXJzZWRTb3VyY2VbXCJCb3VuZHNcIl0gPSAkJGNyZWF0ZUZpZWxkOF8wKCQkcGFyc2VkU291cmNlW1wiQm91bmRzXCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJXb3JrQXJlYVwiIGluICQkcGFyc2VkU291cmNlKSB7XG4gICAgICAgICAgICAkJHBhcnNlZFNvdXJjZVtcIldvcmtBcmVhXCJdID0gJCRjcmVhdGVGaWVsZDlfMCgkJHBhcnNlZFNvdXJjZVtcIldvcmtBcmVhXCJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFNjcmVlbigvKiogQHR5cGUge1BhcnRpYWw8U2NyZWVuPn0gKi8oJCRwYXJzZWRTb3VyY2UpKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTaXplIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNpemUgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIHtQYXJ0aWFsPFNpemU+fSBbJCRzb3VyY2UgPSB7fV0gLSBUaGUgc291cmNlIG9iamVjdCB0byBjcmVhdGUgdGhlIFNpemUuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoJCRzb3VyY2UgPSB7fSkge1xuICAgICAgICBpZiAoIShcIldpZHRoXCIgaW4gJCRzb3VyY2UpKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZW1iZXJcbiAgICAgICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXNbXCJXaWR0aFwiXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEoXCJIZWlnaHRcIiBpbiAkJHNvdXJjZSkpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1lbWJlclxuICAgICAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpc1tcIkhlaWdodFwiXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsICQkc291cmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNpemUgaW5zdGFuY2UgZnJvbSBhIHN0cmluZyBvciBvYmplY3QuXG4gICAgICogQHBhcmFtIHthbnl9IFskJHNvdXJjZSA9IHt9XVxuICAgICAqIEByZXR1cm5zIHtTaXplfVxuICAgICAqL1xuICAgIHN0YXRpYyBjcmVhdGVGcm9tKCQkc291cmNlID0ge30pIHtcbiAgICAgICAgbGV0ICQkcGFyc2VkU291cmNlID0gdHlwZW9mICQkc291cmNlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UoJCRzb3VyY2UpIDogJCRzb3VyY2U7XG4gICAgICAgIHJldHVybiBuZXcgU2l6ZSgvKiogQHR5cGUge1BhcnRpYWw8U2l6ZT59ICovKCQkcGFyc2VkU291cmNlKSk7XG4gICAgfVxufVxuXG4vLyBQcml2YXRlIHR5cGUgY3JlYXRpb24gZnVuY3Rpb25zXG5jb25zdCAkJGNyZWF0ZVR5cGUwID0gJENyZWF0ZS5NYXAoJENyZWF0ZS5BbnksICRDcmVhdGUuQW55KTtcbmNvbnN0ICQkY3JlYXRlVHlwZTEgPSBPU0luZm8uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTIgPSBCdXR0b24uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTMgPSAkQ3JlYXRlLkFycmF5KCQkY3JlYXRlVHlwZTIpO1xuY29uc3QgJCRjcmVhdGVUeXBlNCA9IEZpbGVGaWx0ZXIuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTUgPSAkQ3JlYXRlLkFycmF5KCQkY3JlYXRlVHlwZTQpO1xuY29uc3QgJCRjcmVhdGVUeXBlNiA9IFNpemUuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTcgPSBSZWN0LmNyZWF0ZUZyb207XG4iLCAiLy8gQHRzLWNoZWNrXG4vLyBDeW5oeXJjaHd5ZCB5IGZmZWlsIGhvbiB5biBhd3RvbWF0aWcuIFBFSURJV0NIIFx1MDBDMiBNT0RJV0xcbi8vIFRoaXMgZmlsZSBpcyBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZC4gRE8gTk9UIEVESVRcblxuaW1wb3J0IHtDYWxsIGFzICRDYWxsLCBDcmVhdGUgYXMgJENyZWF0ZX0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcblxuZXhwb3J0ICogZnJvbSBcIi4vbGlzdGVuZXIuanNcIjtcblxuLyoqXG4gKiBFbWl0IGVtaXRzIGFuIGV2ZW50IHVzaW5nIHRoZSBnaXZlbiBldmVudCBvYmplY3QuXG4gKiBZb3UgY2FuIHBhc3MgaW4gaW5zdGFuY2VzIG9mIHRoZSBjbGFzcyBgV2FpbHNFdmVudGAuXG4gKiBAcGFyYW0ge3tcIm5hbWVcIjogc3RyaW5nLCBcImRhdGFcIjogYW55fX0gZXZlbnRcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRW1pdChldmVudCkge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjQ4MDY4MjM5MiwgZXZlbnQpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuIiwgIlxuZXhwb3J0IGNvbnN0IEV2ZW50VHlwZXMgPSB7XG5cdFdpbmRvd3M6IHtcblx0XHRTeXN0ZW1UaGVtZUNoYW5nZWQ6IFwid2luZG93czpTeXN0ZW1UaGVtZUNoYW5nZWRcIixcblx0XHRBUE1Qb3dlclN0YXR1c0NoYW5nZTogXCJ3aW5kb3dzOkFQTVBvd2VyU3RhdHVzQ2hhbmdlXCIsXG5cdFx0QVBNU3VzcGVuZDogXCJ3aW5kb3dzOkFQTVN1c3BlbmRcIixcblx0XHRBUE1SZXN1bWVBdXRvbWF0aWM6IFwid2luZG93czpBUE1SZXN1bWVBdXRvbWF0aWNcIixcblx0XHRBUE1SZXN1bWVTdXNwZW5kOiBcIndpbmRvd3M6QVBNUmVzdW1lU3VzcGVuZFwiLFxuXHRcdEFQTVBvd2VyU2V0dGluZ0NoYW5nZTogXCJ3aW5kb3dzOkFQTVBvd2VyU2V0dGluZ0NoYW5nZVwiLFxuXHRcdEFwcGxpY2F0aW9uU3RhcnRlZDogXCJ3aW5kb3dzOkFwcGxpY2F0aW9uU3RhcnRlZFwiLFxuXHRcdFdlYlZpZXdOYXZpZ2F0aW9uQ29tcGxldGVkOiBcIndpbmRvd3M6V2ViVmlld05hdmlnYXRpb25Db21wbGV0ZWRcIixcblx0XHRXaW5kb3dJbmFjdGl2ZTogXCJ3aW5kb3dzOldpbmRvd0luYWN0aXZlXCIsXG5cdFx0V2luZG93QWN0aXZlOiBcIndpbmRvd3M6V2luZG93QWN0aXZlXCIsXG5cdFx0V2luZG93Q2xpY2tBY3RpdmU6IFwid2luZG93czpXaW5kb3dDbGlja0FjdGl2ZVwiLFxuXHRcdFdpbmRvd01heGltaXNlOiBcIndpbmRvd3M6V2luZG93TWF4aW1pc2VcIixcblx0XHRXaW5kb3dVbk1heGltaXNlOiBcIndpbmRvd3M6V2luZG93VW5NYXhpbWlzZVwiLFxuXHRcdFdpbmRvd0Z1bGxzY3JlZW46IFwid2luZG93czpXaW5kb3dGdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93VW5GdWxsc2NyZWVuOiBcIndpbmRvd3M6V2luZG93VW5GdWxsc2NyZWVuXCIsXG5cdFx0V2luZG93UmVzdG9yZTogXCJ3aW5kb3dzOldpbmRvd1Jlc3RvcmVcIixcblx0XHRXaW5kb3dNaW5pbWlzZTogXCJ3aW5kb3dzOldpbmRvd01pbmltaXNlXCIsXG5cdFx0V2luZG93VW5NaW5pbWlzZTogXCJ3aW5kb3dzOldpbmRvd1VuTWluaW1pc2VcIixcblx0XHRXaW5kb3dDbG9zZTogXCJ3aW5kb3dzOldpbmRvd0Nsb3NlXCIsXG5cdFx0V2luZG93U2V0Rm9jdXM6IFwid2luZG93czpXaW5kb3dTZXRGb2N1c1wiLFxuXHRcdFdpbmRvd0tpbGxGb2N1czogXCJ3aW5kb3dzOldpbmRvd0tpbGxGb2N1c1wiLFxuXHRcdFdpbmRvd0RyYWdEcm9wOiBcIndpbmRvd3M6V2luZG93RHJhZ0Ryb3BcIixcblx0XHRXaW5kb3dEcmFnRW50ZXI6IFwid2luZG93czpXaW5kb3dEcmFnRW50ZXJcIixcblx0XHRXaW5kb3dEcmFnTGVhdmU6IFwid2luZG93czpXaW5kb3dEcmFnTGVhdmVcIixcblx0XHRXaW5kb3dEcmFnT3ZlcjogXCJ3aW5kb3dzOldpbmRvd0RyYWdPdmVyXCIsXG5cdH0sXG5cdE1hYzoge1xuXHRcdEFwcGxpY2F0aW9uRGlkQmVjb21lQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZEJlY29tZUFjdGl2ZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlQmFja2luZ1Byb3BlcnRpZXM6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlQmFja2luZ1Byb3BlcnRpZXNcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZUVmZmVjdGl2ZUFwcGVhcmFuY2U6IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlRWZmZWN0aXZlQXBwZWFyYW5jZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlSWNvbjogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VJY29uXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VPY2NsdXNpb25TdGF0ZTogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VPY2NsdXNpb25TdGF0ZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlU2NyZWVuUGFyYW1ldGVyczogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VTY3JlZW5QYXJhbWV0ZXJzXCIsXG5cdFx0QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJGcmFtZTogXCJtYWM6QXBwbGljYXRpb25EaWRDaGFuZ2VTdGF0dXNCYXJGcmFtZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkQ2hhbmdlU3RhdHVzQmFyT3JpZW50YXRpb246IFwibWFjOkFwcGxpY2F0aW9uRGlkQ2hhbmdlU3RhdHVzQmFyT3JpZW50YXRpb25cIixcblx0XHRBcHBsaWNhdGlvbkRpZEZpbmlzaExhdW5jaGluZzogXCJtYWM6QXBwbGljYXRpb25EaWRGaW5pc2hMYXVuY2hpbmdcIixcblx0XHRBcHBsaWNhdGlvbkRpZEhpZGU6IFwibWFjOkFwcGxpY2F0aW9uRGlkSGlkZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkUmVzaWduQWN0aXZlTm90aWZpY2F0aW9uOiBcIm1hYzpBcHBsaWNhdGlvbkRpZFJlc2lnbkFjdGl2ZU5vdGlmaWNhdGlvblwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkVW5oaWRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZFVuaGlkZVwiLFxuXHRcdEFwcGxpY2F0aW9uRGlkVXBkYXRlOiBcIm1hYzpBcHBsaWNhdGlvbkRpZFVwZGF0ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbEJlY29tZUFjdGl2ZTogXCJtYWM6QXBwbGljYXRpb25XaWxsQmVjb21lQWN0aXZlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsRmluaXNoTGF1bmNoaW5nOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxGaW5pc2hMYXVuY2hpbmdcIixcblx0XHRBcHBsaWNhdGlvbldpbGxIaWRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxIaWRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsUmVzaWduQWN0aXZlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxSZXNpZ25BY3RpdmVcIixcblx0XHRBcHBsaWNhdGlvbldpbGxUZXJtaW5hdGU6IFwibWFjOkFwcGxpY2F0aW9uV2lsbFRlcm1pbmF0ZVwiLFxuXHRcdEFwcGxpY2F0aW9uV2lsbFVuaGlkZTogXCJtYWM6QXBwbGljYXRpb25XaWxsVW5oaWRlXCIsXG5cdFx0QXBwbGljYXRpb25XaWxsVXBkYXRlOiBcIm1hYzpBcHBsaWNhdGlvbldpbGxVcGRhdGVcIixcblx0XHRBcHBsaWNhdGlvbkRpZENoYW5nZVRoZW1lOiBcIm1hYzpBcHBsaWNhdGlvbkRpZENoYW5nZVRoZW1lIVwiLFxuXHRcdEFwcGxpY2F0aW9uU2hvdWxkSGFuZGxlUmVvcGVuOiBcIm1hYzpBcHBsaWNhdGlvblNob3VsZEhhbmRsZVJlb3BlbiFcIixcblx0XHRXaW5kb3dEaWRCZWNvbWVLZXk6IFwibWFjOldpbmRvd0RpZEJlY29tZUtleVwiLFxuXHRcdFdpbmRvd0RpZEJlY29tZU1haW46IFwibWFjOldpbmRvd0RpZEJlY29tZU1haW5cIixcblx0XHRXaW5kb3dEaWRCZWdpblNoZWV0OiBcIm1hYzpXaW5kb3dEaWRCZWdpblNoZWV0XCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlQWxwaGE6IFwibWFjOldpbmRvd0RpZENoYW5nZUFscGhhXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlQmFja2luZ0xvY2F0aW9uOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VCYWNraW5nTG9jYXRpb25cIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VCYWNraW5nUHJvcGVydGllczogXCJtYWM6V2luZG93RGlkQ2hhbmdlQmFja2luZ1Byb3BlcnRpZXNcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VDb2xsZWN0aW9uQmVoYXZpb3I6IFwibWFjOldpbmRvd0RpZENoYW5nZUNvbGxlY3Rpb25CZWhhdmlvclwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZUVmZmVjdGl2ZUFwcGVhcmFuY2U6IFwibWFjOldpbmRvd0RpZENoYW5nZUVmZmVjdGl2ZUFwcGVhcmFuY2VcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VPY2NsdXNpb25TdGF0ZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlT2NjbHVzaW9uU3RhdGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VPcmRlcmluZ01vZGU6IFwibWFjOldpbmRvd0RpZENoYW5nZU9yZGVyaW5nTW9kZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlbjogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkQ2hhbmdlU2NyZWVuUGFyYW1ldGVyczogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuUGFyYW1ldGVyc1wiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNjcmVlblByb2ZpbGU6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblByb2ZpbGVcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZTogXCJtYWM6V2luZG93RGlkQ2hhbmdlU2NyZWVuU3BhY2VcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VTY3JlZW5TcGFjZVByb3BlcnRpZXM6IFwibWFjOldpbmRvd0RpZENoYW5nZVNjcmVlblNwYWNlUHJvcGVydGllc1wiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNoYXJpbmdUeXBlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTaGFyaW5nVHlwZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNwYWNlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTcGFjZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVNwYWNlT3JkZXJpbmdNb2RlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VTcGFjZU9yZGVyaW5nTW9kZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVRpdGxlOiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VUaXRsZVwiLFxuXHRcdFdpbmRvd0RpZENoYW5nZVRvb2xiYXI6IFwibWFjOldpbmRvd0RpZENoYW5nZVRvb2xiYXJcIixcblx0XHRXaW5kb3dEaWRDaGFuZ2VWaXNpYmlsaXR5OiBcIm1hYzpXaW5kb3dEaWRDaGFuZ2VWaXNpYmlsaXR5XCIsXG5cdFx0V2luZG93RGlkRGVtaW5pYXR1cml6ZTogXCJtYWM6V2luZG93RGlkRGVtaW5pYXR1cml6ZVwiLFxuXHRcdFdpbmRvd0RpZEVuZFNoZWV0OiBcIm1hYzpXaW5kb3dEaWRFbmRTaGVldFwiLFxuXHRcdFdpbmRvd0RpZEVudGVyRnVsbFNjcmVlbjogXCJtYWM6V2luZG93RGlkRW50ZXJGdWxsU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkRW50ZXJWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93RGlkRW50ZXJWZXJzaW9uQnJvd3NlclwiLFxuXHRcdFdpbmRvd0RpZEV4aXRGdWxsU2NyZWVuOiBcIm1hYzpXaW5kb3dEaWRFeGl0RnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZEV4aXRWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93RGlkRXhpdFZlcnNpb25Ccm93c2VyXCIsXG5cdFx0V2luZG93RGlkRXhwb3NlOiBcIm1hYzpXaW5kb3dEaWRFeHBvc2VcIixcblx0XHRXaW5kb3dEaWRGb2N1czogXCJtYWM6V2luZG93RGlkRm9jdXNcIixcblx0XHRXaW5kb3dEaWRNaW5pYXR1cml6ZTogXCJtYWM6V2luZG93RGlkTWluaWF0dXJpemVcIixcblx0XHRXaW5kb3dEaWRNb3ZlOiBcIm1hYzpXaW5kb3dEaWRNb3ZlXCIsXG5cdFx0V2luZG93RGlkT3JkZXJPZmZTY3JlZW46IFwibWFjOldpbmRvd0RpZE9yZGVyT2ZmU2NyZWVuXCIsXG5cdFx0V2luZG93RGlkT3JkZXJPblNjcmVlbjogXCJtYWM6V2luZG93RGlkT3JkZXJPblNjcmVlblwiLFxuXHRcdFdpbmRvd0RpZFJlc2lnbktleTogXCJtYWM6V2luZG93RGlkUmVzaWduS2V5XCIsXG5cdFx0V2luZG93RGlkUmVzaWduTWFpbjogXCJtYWM6V2luZG93RGlkUmVzaWduTWFpblwiLFxuXHRcdFdpbmRvd0RpZFJlc2l6ZTogXCJtYWM6V2luZG93RGlkUmVzaXplXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVBbHBoYTogXCJtYWM6V2luZG93RGlkVXBkYXRlQWxwaGFcIixcblx0XHRXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uQmVoYXZpb3I6IFwibWFjOldpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvclwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzOiBcIm1hYzpXaW5kb3dEaWRVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllc1wiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZVNoYWRvdzogXCJtYWM6V2luZG93RGlkVXBkYXRlU2hhZG93XCIsXG5cdFx0V2luZG93RGlkVXBkYXRlVGl0bGU6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVRpdGxlXCIsXG5cdFx0V2luZG93RGlkVXBkYXRlVG9vbGJhcjogXCJtYWM6V2luZG93RGlkVXBkYXRlVG9vbGJhclwiLFxuXHRcdFdpbmRvd0RpZFVwZGF0ZVZpc2liaWxpdHk6IFwibWFjOldpbmRvd0RpZFVwZGF0ZVZpc2liaWxpdHlcIixcblx0XHRXaW5kb3dTaG91bGRDbG9zZTogXCJtYWM6V2luZG93U2hvdWxkQ2xvc2UhXCIsXG5cdFx0V2luZG93V2lsbEJlY29tZUtleTogXCJtYWM6V2luZG93V2lsbEJlY29tZUtleVwiLFxuXHRcdFdpbmRvd1dpbGxCZWNvbWVNYWluOiBcIm1hYzpXaW5kb3dXaWxsQmVjb21lTWFpblwiLFxuXHRcdFdpbmRvd1dpbGxCZWdpblNoZWV0OiBcIm1hYzpXaW5kb3dXaWxsQmVnaW5TaGVldFwiLFxuXHRcdFdpbmRvd1dpbGxDaGFuZ2VPcmRlcmluZ01vZGU6IFwibWFjOldpbmRvd1dpbGxDaGFuZ2VPcmRlcmluZ01vZGVcIixcblx0XHRXaW5kb3dXaWxsQ2xvc2U6IFwibWFjOldpbmRvd1dpbGxDbG9zZVwiLFxuXHRcdFdpbmRvd1dpbGxEZW1pbmlhdHVyaXplOiBcIm1hYzpXaW5kb3dXaWxsRGVtaW5pYXR1cml6ZVwiLFxuXHRcdFdpbmRvd1dpbGxFbnRlckZ1bGxTY3JlZW46IFwibWFjOldpbmRvd1dpbGxFbnRlckZ1bGxTY3JlZW5cIixcblx0XHRXaW5kb3dXaWxsRW50ZXJWZXJzaW9uQnJvd3NlcjogXCJtYWM6V2luZG93V2lsbEVudGVyVmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dXaWxsRXhpdEZ1bGxTY3JlZW46IFwibWFjOldpbmRvd1dpbGxFeGl0RnVsbFNjcmVlblwiLFxuXHRcdFdpbmRvd1dpbGxFeGl0VmVyc2lvbkJyb3dzZXI6IFwibWFjOldpbmRvd1dpbGxFeGl0VmVyc2lvbkJyb3dzZXJcIixcblx0XHRXaW5kb3dXaWxsRm9jdXM6IFwibWFjOldpbmRvd1dpbGxGb2N1c1wiLFxuXHRcdFdpbmRvd1dpbGxNaW5pYXR1cml6ZTogXCJtYWM6V2luZG93V2lsbE1pbmlhdHVyaXplXCIsXG5cdFx0V2luZG93V2lsbE1vdmU6IFwibWFjOldpbmRvd1dpbGxNb3ZlXCIsXG5cdFx0V2luZG93V2lsbE9yZGVyT2ZmU2NyZWVuOiBcIm1hYzpXaW5kb3dXaWxsT3JkZXJPZmZTY3JlZW5cIixcblx0XHRXaW5kb3dXaWxsT3JkZXJPblNjcmVlbjogXCJtYWM6V2luZG93V2lsbE9yZGVyT25TY3JlZW5cIixcblx0XHRXaW5kb3dXaWxsUmVzaWduTWFpbjogXCJtYWM6V2luZG93V2lsbFJlc2lnbk1haW5cIixcblx0XHRXaW5kb3dXaWxsUmVzaXplOiBcIm1hYzpXaW5kb3dXaWxsUmVzaXplXCIsXG5cdFx0V2luZG93V2lsbFVuZm9jdXM6IFwibWFjOldpbmRvd1dpbGxVbmZvY3VzXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVBbHBoYTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZUFscGhhXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvcjogXCJtYWM6V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25CZWhhdmlvclwiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVDb2xsZWN0aW9uUHJvcGVydGllczogXCJtYWM6V2luZG93V2lsbFVwZGF0ZUNvbGxlY3Rpb25Qcm9wZXJ0aWVzXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVNoYWRvdzogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVNoYWRvd1wiLFxuXHRcdFdpbmRvd1dpbGxVcGRhdGVUaXRsZTogXCJtYWM6V2luZG93V2lsbFVwZGF0ZVRpdGxlXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVRvb2xiYXI6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVUb29sYmFyXCIsXG5cdFx0V2luZG93V2lsbFVwZGF0ZVZpc2liaWxpdHk6IFwibWFjOldpbmRvd1dpbGxVcGRhdGVWaXNpYmlsaXR5XCIsXG5cdFx0V2luZG93V2lsbFVzZVN0YW5kYXJkRnJhbWU6IFwibWFjOldpbmRvd1dpbGxVc2VTdGFuZGFyZEZyYW1lXCIsXG5cdFx0TWVudVdpbGxPcGVuOiBcIm1hYzpNZW51V2lsbE9wZW5cIixcblx0XHRNZW51RGlkT3BlbjogXCJtYWM6TWVudURpZE9wZW5cIixcblx0XHRNZW51RGlkQ2xvc2U6IFwibWFjOk1lbnVEaWRDbG9zZVwiLFxuXHRcdE1lbnVXaWxsU2VuZEFjdGlvbjogXCJtYWM6TWVudVdpbGxTZW5kQWN0aW9uXCIsXG5cdFx0TWVudURpZFNlbmRBY3Rpb246IFwibWFjOk1lbnVEaWRTZW5kQWN0aW9uXCIsXG5cdFx0TWVudVdpbGxIaWdobGlnaHRJdGVtOiBcIm1hYzpNZW51V2lsbEhpZ2hsaWdodEl0ZW1cIixcblx0XHRNZW51RGlkSGlnaGxpZ2h0SXRlbTogXCJtYWM6TWVudURpZEhpZ2hsaWdodEl0ZW1cIixcblx0XHRNZW51V2lsbERpc3BsYXlJdGVtOiBcIm1hYzpNZW51V2lsbERpc3BsYXlJdGVtXCIsXG5cdFx0TWVudURpZERpc3BsYXlJdGVtOiBcIm1hYzpNZW51RGlkRGlzcGxheUl0ZW1cIixcblx0XHRNZW51V2lsbEFkZEl0ZW06IFwibWFjOk1lbnVXaWxsQWRkSXRlbVwiLFxuXHRcdE1lbnVEaWRBZGRJdGVtOiBcIm1hYzpNZW51RGlkQWRkSXRlbVwiLFxuXHRcdE1lbnVXaWxsUmVtb3ZlSXRlbTogXCJtYWM6TWVudVdpbGxSZW1vdmVJdGVtXCIsXG5cdFx0TWVudURpZFJlbW92ZUl0ZW06IFwibWFjOk1lbnVEaWRSZW1vdmVJdGVtXCIsXG5cdFx0TWVudVdpbGxCZWdpblRyYWNraW5nOiBcIm1hYzpNZW51V2lsbEJlZ2luVHJhY2tpbmdcIixcblx0XHRNZW51RGlkQmVnaW5UcmFja2luZzogXCJtYWM6TWVudURpZEJlZ2luVHJhY2tpbmdcIixcblx0XHRNZW51V2lsbEVuZFRyYWNraW5nOiBcIm1hYzpNZW51V2lsbEVuZFRyYWNraW5nXCIsXG5cdFx0TWVudURpZEVuZFRyYWNraW5nOiBcIm1hYzpNZW51RGlkRW5kVHJhY2tpbmdcIixcblx0XHRNZW51V2lsbFVwZGF0ZTogXCJtYWM6TWVudVdpbGxVcGRhdGVcIixcblx0XHRNZW51RGlkVXBkYXRlOiBcIm1hYzpNZW51RGlkVXBkYXRlXCIsXG5cdFx0TWVudVdpbGxQb3BVcDogXCJtYWM6TWVudVdpbGxQb3BVcFwiLFxuXHRcdE1lbnVEaWRQb3BVcDogXCJtYWM6TWVudURpZFBvcFVwXCIsXG5cdFx0TWVudVdpbGxTZW5kQWN0aW9uVG9JdGVtOiBcIm1hYzpNZW51V2lsbFNlbmRBY3Rpb25Ub0l0ZW1cIixcblx0XHRNZW51RGlkU2VuZEFjdGlvblRvSXRlbTogXCJtYWM6TWVudURpZFNlbmRBY3Rpb25Ub0l0ZW1cIixcblx0XHRXZWJWaWV3RGlkU3RhcnRQcm92aXNpb25hbE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRTdGFydFByb3Zpc2lvbmFsTmF2aWdhdGlvblwiLFxuXHRcdFdlYlZpZXdEaWRSZWNlaXZlU2VydmVyUmVkaXJlY3RGb3JQcm92aXNpb25hbE5hdmlnYXRpb246IFwibWFjOldlYlZpZXdEaWRSZWNlaXZlU2VydmVyUmVkaXJlY3RGb3JQcm92aXNpb25hbE5hdmlnYXRpb25cIixcblx0XHRXZWJWaWV3RGlkRmluaXNoTmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZEZpbmlzaE5hdmlnYXRpb25cIixcblx0XHRXZWJWaWV3RGlkQ29tbWl0TmF2aWdhdGlvbjogXCJtYWM6V2ViVmlld0RpZENvbW1pdE5hdmlnYXRpb25cIixcblx0XHRXaW5kb3dGaWxlRHJhZ2dpbmdFbnRlcmVkOiBcIm1hYzpXaW5kb3dGaWxlRHJhZ2dpbmdFbnRlcmVkXCIsXG5cdFx0V2luZG93RmlsZURyYWdnaW5nUGVyZm9ybWVkOiBcIm1hYzpXaW5kb3dGaWxlRHJhZ2dpbmdQZXJmb3JtZWRcIixcblx0XHRXaW5kb3dGaWxlRHJhZ2dpbmdFeGl0ZWQ6IFwibWFjOldpbmRvd0ZpbGVEcmFnZ2luZ0V4aXRlZFwiLFxuXHR9LFxuXHRMaW51eDoge1xuXHRcdFN5c3RlbVRoZW1lQ2hhbmdlZDogXCJsaW51eDpTeXN0ZW1UaGVtZUNoYW5nZWRcIixcblx0XHRXaW5kb3dMb2FkQ2hhbmdlZDogXCJsaW51eDpXaW5kb3dMb2FkQ2hhbmdlZFwiLFxuXHRcdFdpbmRvd0RlbGV0ZUV2ZW50OiBcImxpbnV4OldpbmRvd0RlbGV0ZUV2ZW50XCIsXG5cdFx0V2luZG93Rm9jdXNJbjogXCJsaW51eDpXaW5kb3dGb2N1c0luXCIsXG5cdFx0V2luZG93Rm9jdXNPdXQ6IFwibGludXg6V2luZG93Rm9jdXNPdXRcIixcblx0XHRBcHBsaWNhdGlvblN0YXJ0dXA6IFwibGludXg6QXBwbGljYXRpb25TdGFydHVwXCIsXG5cdH0sXG5cdENvbW1vbjoge1xuXHRcdEFwcGxpY2F0aW9uU3RhcnRlZDogXCJjb21tb246QXBwbGljYXRpb25TdGFydGVkXCIsXG5cdFx0V2luZG93TWF4aW1pc2U6IFwiY29tbW9uOldpbmRvd01heGltaXNlXCIsXG5cdFx0V2luZG93VW5NYXhpbWlzZTogXCJjb21tb246V2luZG93VW5NYXhpbWlzZVwiLFxuXHRcdFdpbmRvd0Z1bGxzY3JlZW46IFwiY29tbW9uOldpbmRvd0Z1bGxzY3JlZW5cIixcblx0XHRXaW5kb3dVbkZ1bGxzY3JlZW46IFwiY29tbW9uOldpbmRvd1VuRnVsbHNjcmVlblwiLFxuXHRcdFdpbmRvd1Jlc3RvcmU6IFwiY29tbW9uOldpbmRvd1Jlc3RvcmVcIixcblx0XHRXaW5kb3dNaW5pbWlzZTogXCJjb21tb246V2luZG93TWluaW1pc2VcIixcblx0XHRXaW5kb3dVbk1pbmltaXNlOiBcImNvbW1vbjpXaW5kb3dVbk1pbmltaXNlXCIsXG5cdFx0V2luZG93Q2xvc2luZzogXCJjb21tb246V2luZG93Q2xvc2luZ1wiLFxuXHRcdFdpbmRvd1pvb206IFwiY29tbW9uOldpbmRvd1pvb21cIixcblx0XHRXaW5kb3dab29tSW46IFwiY29tbW9uOldpbmRvd1pvb21JblwiLFxuXHRcdFdpbmRvd1pvb21PdXQ6IFwiY29tbW9uOldpbmRvd1pvb21PdXRcIixcblx0XHRXaW5kb3dab29tUmVzZXQ6IFwiY29tbW9uOldpbmRvd1pvb21SZXNldFwiLFxuXHRcdFdpbmRvd0ZvY3VzOiBcImNvbW1vbjpXaW5kb3dGb2N1c1wiLFxuXHRcdFdpbmRvd0xvc3RGb2N1czogXCJjb21tb246V2luZG93TG9zdEZvY3VzXCIsXG5cdFx0V2luZG93U2hvdzogXCJjb21tb246V2luZG93U2hvd1wiLFxuXHRcdFdpbmRvd0hpZGU6IFwiY29tbW9uOldpbmRvd0hpZGVcIixcblx0XHRXaW5kb3dEUElDaGFuZ2VkOiBcImNvbW1vbjpXaW5kb3dEUElDaGFuZ2VkXCIsXG5cdFx0V2luZG93RmlsZXNEcm9wcGVkOiBcImNvbW1vbjpXaW5kb3dGaWxlc0Ryb3BwZWRcIixcblx0XHRXaW5kb3dSdW50aW1lUmVhZHk6IFwiY29tbW9uOldpbmRvd1J1bnRpbWVSZWFkeVwiLFxuXHRcdFRoZW1lQ2hhbmdlZDogXCJjb21tb246VGhlbWVDaGFuZ2VkXCIsXG5cdH0sXG59O1xuIiwgIi8vIEB0cy1ub2NoZWNrXG4vKlxuIF9cdCAgIF9fXHQgIF8gX19cbnwgfFx0IC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQge0V2ZW50VHlwZXN9IGZyb20gXCIuL2V2ZW50X3R5cGVzLmpzXCI7XG5leHBvcnQgY29uc3QgVHlwZXMgPSBFdmVudFR5cGVzO1xuXG4vLyBTZXR1cFxud2luZG93Ll93YWlscyA9IHdpbmRvdy5fd2FpbHMgfHwge307XG53aW5kb3cuX3dhaWxzLmRpc3BhdGNoV2FpbHNFdmVudCA9IGRpc3BhdGNoV2FpbHNFdmVudDtcblxuY29uc3QgZXZlbnRMaXN0ZW5lcnMgPSBuZXcgTWFwKCk7XG5cbmNsYXNzIExpc3RlbmVyIHtcbiAgICBjb25zdHJ1Y3RvcihldmVudE5hbWUsIGNhbGxiYWNrLCBtYXhDYWxsYmFja3MpIHtcbiAgICAgICAgdGhpcy5ldmVudE5hbWUgPSBldmVudE5hbWU7XG4gICAgICAgIHRoaXMubWF4Q2FsbGJhY2tzID0gbWF4Q2FsbGJhY2tzIHx8IC0xO1xuICAgICAgICB0aGlzLkNhbGxiYWNrID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEpO1xuICAgICAgICAgICAgaWYgKHRoaXMubWF4Q2FsbGJhY2tzID09PSAtMSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5tYXhDYWxsYmFja3MgLT0gMTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1heENhbGxiYWNrcyA9PT0gMDtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbi8qKlxuICogRGVzY3JpYmVzIGEgV2FpbHMgYXBwbGljYXRpb24gZXZlbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBXYWlsc0V2ZW50IHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IHdhaWxzIGV2ZW50IGluc3RhbmNlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7Kn0gW2RhdGFdIC0gQXJiaXRyYXJ5IGRhdGEgYXNzb2NpYXRlZCB0byB0aGUgZXZlbnQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobmFtZSwgZGF0YSA9IG51bGwpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFyYml0cmFyeSBkYXRhIGFzc29jaWF0ZWQgdG8gdGhlIGV2ZW50LlxuICAgICAgICAgKiBAdHlwZSB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkaXNwYXRjaFdhaWxzRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCB3ZXZlbnQgPSAvKiogQHR5cGUge2FueX0gKi8obmV3IFdhaWxzRXZlbnQoZXZlbnQubmFtZSwgZXZlbnQuZGF0YSkpXG4gICAgT2JqZWN0LmFzc2lnbih3ZXZlbnQsIGV2ZW50KVxuICAgIGV2ZW50ID0gd2V2ZW50O1xuXG4gICAgbGV0IGxpc3RlbmVycyA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudC5uYW1lKTtcbiAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIGxldCB0b1JlbW92ZSA9IGxpc3RlbmVycy5maWx0ZXIobGlzdGVuZXIgPT4ge1xuICAgICAgICAgICAgbGV0IHJlbW92ZSA9IGxpc3RlbmVyLkNhbGxiYWNrKGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChyZW1vdmUpIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRvUmVtb3ZlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5maWx0ZXIobCA9PiAhdG9SZW1vdmUuaW5jbHVkZXMobCkpO1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IDApIGV2ZW50TGlzdGVuZXJzLmRlbGV0ZShldmVudC5uYW1lKTtcbiAgICAgICAgICAgIGVsc2UgZXZlbnRMaXN0ZW5lcnMuc2V0KGV2ZW50Lm5hbWUsIGxpc3RlbmVycyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgc3BlY2lmaWMgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudCB0byByZWdpc3RlciB0aGUgY2FsbGJhY2sgZm9yLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBtYXhDYWxsYmFja3MgLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgdGltZXMgdGhlIGNhbGxiYWNrIGNhbiBiZSBjYWxsZWQgZm9yIHRoZSBldmVudC4gT25jZSB0aGUgbWF4aW11bSBudW1iZXIgaXMgcmVhY2hlZCwgdGhlIGNhbGxiYWNrIHdpbGwgbm8gbG9uZ2VyIGJlIGNhbGxlZC5cbiAqXG4gQHJldHVybiB7ZnVuY3Rpb259IC0gQSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgd2lsbCB1bnJlZ2lzdGVyIHRoZSBjYWxsYmFjayBmcm9tIHRoZSBldmVudC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9uTXVsdGlwbGUoZXZlbnROYW1lLCBjYWxsYmFjaywgbWF4Q2FsbGJhY2tzKSB7XG4gICAgbGV0IGxpc3RlbmVycyA9IGV2ZW50TGlzdGVuZXJzLmdldChldmVudE5hbWUpIHx8IFtdO1xuICAgIGNvbnN0IHRoaXNMaXN0ZW5lciA9IG5ldyBMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBtYXhDYWxsYmFja3MpO1xuICAgIGxpc3RlbmVycy5wdXNoKHRoaXNMaXN0ZW5lcik7XG4gICAgZXZlbnRMaXN0ZW5lcnMuc2V0KGV2ZW50TmFtZSwgbGlzdGVuZXJzKTtcbiAgICByZXR1cm4gKCkgPT4gbGlzdGVuZXJPZmYodGhpc0xpc3RlbmVyKTtcbn1cblxuLyoqXG4gKiBSZWdpc3RlcnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBzcGVjaWZpZWQgZXZlbnQgb2NjdXJzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBleGVjdXRlZC4gSXQgdGFrZXMgbm8gcGFyYW1ldGVycy5cbiAqIEByZXR1cm4ge2Z1bmN0aW9ufSAtIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIHdpbGwgdW5yZWdpc3RlciB0aGUgY2FsbGJhY2sgZnJvbSB0aGUgZXZlbnQuICovXG5leHBvcnQgZnVuY3Rpb24gT24oZXZlbnROYW1lLCBjYWxsYmFjaykgeyByZXR1cm4gT25NdWx0aXBsZShldmVudE5hbWUsIGNhbGxiYWNrLCAtMSk7IH1cblxuLyoqXG4gKiBSZWdpc3RlcnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBvbmx5IG9uY2UgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGV2ZW50IG9jY3Vycy5cbiAqIEByZXR1cm4ge2Z1bmN0aW9ufSAtIEEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIHdpbGwgdW5yZWdpc3RlciB0aGUgY2FsbGJhY2sgZnJvbSB0aGUgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPbmNlKGV2ZW50TmFtZSwgY2FsbGJhY2spIHsgcmV0dXJuIE9uTXVsdGlwbGUoZXZlbnROYW1lLCBjYWxsYmFjaywgMSk7IH1cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgbGlzdGVuZXIgZnJvbSB0aGUgZXZlbnQgbGlzdGVuZXJzIGNvbGxlY3Rpb24uXG4gKiBJZiBhbGwgbGlzdGVuZXJzIGZvciB0aGUgZXZlbnQgYXJlIHJlbW92ZWQsIHRoZSBldmVudCBrZXkgaXMgZGVsZXRlZCBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBsaXN0ZW5lciAtIFRoZSBsaXN0ZW5lciB0byBiZSByZW1vdmVkLlxuICovXG5mdW5jdGlvbiBsaXN0ZW5lck9mZihsaXN0ZW5lcikge1xuICAgIGNvbnN0IGV2ZW50TmFtZSA9IGxpc3RlbmVyLmV2ZW50TmFtZTtcbiAgICBsZXQgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnMuZ2V0KGV2ZW50TmFtZSkuZmlsdGVyKGwgPT4gbCAhPT0gbGlzdGVuZXIpO1xuICAgIGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSBldmVudExpc3RlbmVycy5kZWxldGUoZXZlbnROYW1lKTtcbiAgICBlbHNlIGV2ZW50TGlzdGVuZXJzLnNldChldmVudE5hbWUsIGxpc3RlbmVycyk7XG59XG5cblxuLyoqXG4gKiBSZW1vdmVzIGV2ZW50IGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudCBuYW1lcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlbW92ZSBsaXN0ZW5lcnMgZm9yLlxuICogQHBhcmFtIHsuLi5zdHJpbmd9IGFkZGl0aW9uYWxFdmVudE5hbWVzIC0gQWRkaXRpb25hbCBldmVudCBuYW1lcyB0byByZW1vdmUgbGlzdGVuZXJzIGZvci5cbiAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9mZihldmVudE5hbWUsIC4uLmFkZGl0aW9uYWxFdmVudE5hbWVzKSB7XG4gICAgbGV0IGV2ZW50c1RvUmVtb3ZlID0gW2V2ZW50TmFtZSwgLi4uYWRkaXRpb25hbEV2ZW50TmFtZXNdO1xuICAgIGV2ZW50c1RvUmVtb3ZlLmZvckVhY2goZXZlbnROYW1lID0+IGV2ZW50TGlzdGVuZXJzLmRlbGV0ZShldmVudE5hbWUpKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQGZ1bmN0aW9uIE9mZkFsbFxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBPZmZBbGwoKSB7IGV2ZW50TGlzdGVuZXJzLmNsZWFyKCk7IH1cbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5leHBvcnQgKiBmcm9tIFwiLi4vY29yZS9mbGFncy5qc1wiO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGV9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmltcG9ydCAqIGFzICRtb2RlbHMgZnJvbSBcIi4vbW9kZWxzLmpzXCI7XG5cbmV4cG9ydCB7U2NyZWVuLCBSZWN0LCBTaXplfSBmcm9tIFwiLi9tb2RlbHMuanNcIjtcblxuLyoqXG4gKiBHZXRBbGwgcmV0dXJucyBkZXNjcmlwdG9ycyBmb3IgYWxsIHNjcmVlbnMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbltdPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEFsbCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIzNjc3MDU1MzIpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTEoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIEdldEN1cnJlbnQgcmV0dXJucyBhIGRlc2NyaXB0b3IgZm9yIHRoZSBzY3JlZW5cbiAqIHdoZXJlIHRoZSBjdXJyZW50bHkgYWN0aXZlIHdpbmRvdyBpcyBsb2NhdGVkLlxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TY3JlZW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0Q3VycmVudCgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMxNjc1NzIxOCk7XG4gICAgbGV0ICR0eXBpbmdQcm9taXNlID0gJHJlc3VsdFByb21pc2UudGhlbigoJHJlc3VsdCkgPT4ge1xuICAgICAgICByZXR1cm4gJCRjcmVhdGVUeXBlMCgkcmVzdWx0KTtcbiAgICB9KTtcbiAgICAkdHlwaW5nUHJvbWlzZS5jYW5jZWwgPSAkcmVzdWx0UHJvbWlzZS5jYW5jZWwuYmluZCgkcmVzdWx0UHJvbWlzZSk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkdHlwaW5nUHJvbWlzZSk7XG59XG5cbi8qKlxuICogR2V0UHJpbWFyeSByZXR1cm5zIGEgZGVzY3JpcHRvciBmb3IgdGhlIHByaW1hcnkgc2NyZWVuLlxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TY3JlZW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0UHJpbWFyeSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM3NDk1NjIwMTcpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTAoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vLyBQcml2YXRlIHR5cGUgY3JlYXRpb24gZnVuY3Rpb25zXG5jb25zdCAkJGNyZWF0ZVR5cGUwID0gJG1vZGVscy5TY3JlZW4uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTEgPSAkQ3JlYXRlLkFycmF5KCQkY3JlYXRlVHlwZTApO1xuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmltcG9ydCB7Q2FsbCBhcyAkQ2FsbCwgQ3JlYXRlIGFzICRDcmVhdGV9IGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XG5cbmltcG9ydCAqIGFzICRtb2RlbHMgZnJvbSBcIi4vbW9kZWxzLmpzXCI7XG5cbmV4cG9ydCAqIGZyb20gXCIuLi9jb3JlL3N5c3RlbS5qc1wiO1xuXG4vKipcbiAqIEVudmlyb25tZW50IHJldHJpZXZlcyBlbnZpcm9ubWVudCBkZXRhaWxzLlxuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5FbnZpcm9ubWVudEluZm8+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRW52aXJvbm1lbnQoKSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNzUyMjY3OTY4KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUwKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBJc0RhcmtNb2RlIHJldHJpZXZlcyBzeXN0ZW0gZGFyayBtb2RlIHN0YXR1cy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNEYXJrTW9kZSgpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIyOTEyODI4MzYpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vLyBQcml2YXRlIHR5cGUgY3JlYXRpb24gZnVuY3Rpb25zXG5jb25zdCAkJGNyZWF0ZVR5cGUwID0gJG1vZGVscy5FbnZpcm9ubWVudEluZm8uY3JlYXRlRnJvbTtcbiIsICIvLyBAdHMtY2hlY2tcbi8vIEN5bmh5cmNod3lkIHkgZmZlaWwgaG9uIHluIGF3dG9tYXRpZy4gUEVJRElXQ0ggXHUwMEMyIE1PRElXTFxuLy8gVGhpcyBmaWxlIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkLiBETyBOT1QgRURJVFxuXG5pbXBvcnQge0NhbGwgYXMgJENhbGwsIENyZWF0ZSBhcyAkQ3JlYXRlfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyAkbW9kZWxzIGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5leHBvcnQge1JHQkF9IGZyb20gXCIuL21vZGVscy5qc1wiO1xuXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gXCIuL3dpbmRvdy5qc1wiO1xuXG4vKiogQHR5cGUge2FueX0gKi9cbmxldCB0aGlzV2luZG93ID0gbnVsbDtcblxuLyoqXG4gKiBSZXR1cm5zIGEgd2luZG93IG9iamVjdCBmb3IgdGhlIGdpdmVuIHdpbmRvdyBuYW1lLlxuICogQHBhcmFtIHtzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkfSBbbmFtZSA9IFwiXCJdXG4gKiBAcmV0dXJucyB7IHsgcmVhZG9ubHkgW0tleSBpbiBrZXlvZiAodHlwZW9mIHNlbGYpIGFzIEV4Y2x1ZGU8S2V5LCBcIkdldFwiIHwgXCJSR0JBXCI+XTogKHR5cGVvZiBzZWxmKVtLZXldIH0gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0KG5hbWUgPSBudWxsKSB7XG4gICAgY29uc3QgbmFtZXMgPSBbXSwgd25kID0ge307XG4gICAgaWYgKG5hbWUgIT0gbnVsbCAmJiBuYW1lICE9PSBcIlwiKSB7XG4gICAgICAgIG5hbWVzLnB1c2gobmFtZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzV2luZG93ICE9PSBudWxsKSB7XG4gICAgICAgIC8vIE9wdGltaXNlIGVtcHR5IHRhcmdldCBjYXNlIGZvciBXTUwuXG4gICAgICAgIHJldHVybiB0aGlzV2luZG93O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXNXaW5kb3cgPSB3bmQ7XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IGluIHNlbGYpIHtcbiAgICAgICAgaWYgKGtleSAhPT0gXCJHZXRcIiAmJiBrZXkgIT09IFwiUkdCQVwiKSB7XG4gICAgICAgICAgICBjb25zdCBtZXRob2QgPSBzZWxmW2tleV07XG4gICAgICAgICAgICB3bmRba2V5XSA9ICguLi5hcmdzKSA9PiBtZXRob2QoLi4uYXJncywgLi4ubmFtZXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oT2JqZWN0LmZyZWV6ZSh3bmQpKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPCRtb2RlbHMuUG9zaXRpb24+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gQWJzb2x1dGVQb3NpdGlvbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIyMjU1MzgyNiwgdGFyZ2V0V2luZG93KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUwKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBDZW50ZXJzIHRoZSB3aW5kb3cgb24gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDZW50ZXIoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MDU0NDMwMzY5LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIENsb3NlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENsb3NlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTQzNjU4MTEwMCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBEaXNhYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRGlzYWJsZVNpemVDb25zdHJhaW50cyguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI1MTA1Mzk4OTEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBtaW4vbWF4IHNpemUgY29uc3RyYWludHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRW5hYmxlU2l6ZUNvbnN0cmFpbnRzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzE1MDk2ODE5NCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBGb2N1c2VzIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9jdXMoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzMjc0Nzg5ODcyLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEZvcmNlcyB0aGUgd2luZG93IHRvIHJlbG9hZCB0aGUgcGFnZSBhc3NldHMuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRm9yY2VSZWxvYWQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNDc1MjMyNTAsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU3dpdGNoZXMgdGhlIHdpbmRvdyB0byBmdWxsc2NyZWVuIG1vZGUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gRnVsbHNjcmVlbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM5MjQ1NjQ0NzMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgZm91ciB3aW5kb3cgYm9yZGVycy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5MUlRCPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEJvcmRlclNpemVzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjI5MDk1MzA4OCwgdGFyZ2V0V2luZG93KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUxKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzY3JlZW4gdGhhdCB0aGUgd2luZG93IGlzIG9uLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTwkbW9kZWxzLlNjcmVlbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRTY3JlZW4oLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNzQ0NTk3NDI0LCB0YXJnZXRXaW5kb3cpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTIoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0Wm9vbSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI2NzczNTkwNjMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIZWlnaHQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg1ODcxNTc2MDMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogSGlkZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIaWRlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzg3NDA5MzQ2NCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmb2N1c2VkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRm9jdXNlZCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDUyNjgxOTcyMSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBmdWxsc2NyZWVuLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzRnVsbHNjcmVlbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDExOTI5MTY3MDUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgbWF4aW1pc2VkLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElzTWF4aW1pc2VkKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzAzNjMyNzgwOSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBpcyBtaW5pbWlzZWQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNNaW5pbWlzZWQoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MDEyMjgxODM1LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIE1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1heGltaXNlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzc1OTAwNzc5OSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBNaW5pbWlzZXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNaW5pbWlzZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM1NDg1MjA1MDEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gTmFtZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDQyMDc2NTcwNTEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogT3BlbnMgdGhlIGRldmVsb3BtZW50IHRvb2xzIHBhbmUuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gT3BlbkRldlRvb2xzKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNDgzNjcxOTc0LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIG9mIHRoZSB3aW5kb3cgdG8gdGhlIHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5Qb3NpdGlvbj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxhdGl2ZVBvc2l0aW9uKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzcwOTU0NTkyMywgdGFyZ2V0V2luZG93KTtcbiAgICBsZXQgJHR5cGluZ1Byb21pc2UgPSAkcmVzdWx0UHJvbWlzZS50aGVuKCgkcmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiAkJGNyZWF0ZVR5cGUwKCRyZXN1bHQpO1xuICAgIH0pO1xuICAgICR0eXBpbmdQcm9taXNlLmNhbmNlbCA9ICRyZXN1bHRQcm9taXNlLmNhbmNlbC5iaW5kKCRyZXN1bHRQcm9taXNlKTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCR0eXBpbmdQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZWxvYWRzIHBhZ2UgYXNzZXRzLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlbG9hZCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI4MzM3MzE0ODUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgaXMgcmVzaXphYmxlLlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlc2l6YWJsZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDI0NTA5NDYyNzcsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVzdG9yZXMgdGhlIHdpbmRvdyB0byBpdHMgcHJldmlvdXMgc3RhdGUgaWYgaXQgd2FzIHByZXZpb3VzbHkgbWluaW1pc2VkLCBtYXhpbWlzZWQgb3IgZnVsbHNjcmVlbi5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXN0b3JlKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMTE1MTMxNTAzNCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBhYnNvbHV0ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRBYnNvbHV0ZVBvc2l0aW9uKHgsIHksIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMzk5MTQ5MTg0MiwgeCwgeSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSB3aW5kb3cgdG8gYmUgYWx3YXlzIG9uIHRvcC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYW90XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0QWx3YXlzT25Ub3AoYW90LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMzNDkzNDYxNTUsIGFvdCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSBiYWNrZ3JvdW5kIGNvbG91ciBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHskbW9kZWxzLlJHQkF9IGNvbG91clxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldEJhY2tncm91bmRDb2xvdXIoY29sb3VyLCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDIxNzk4MjA1NzYsIGNvbG91ciwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIHRoZSB3aW5kb3cgZnJhbWUgYW5kIHRpdGxlIGJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZnJhbWVsZXNzXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnJhbWVsZXNzKGZyYW1lbGVzcywgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCg0MTA5MzY1MDgwLCBmcmFtZWxlc3MsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRW5hYmxlcyBvciBkaXNhYmxlcyB0aGUgc3lzdGVtIGZ1bGxzY3JlZW4gYnV0dG9uLlxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0RnVsbHNjcmVlbkJ1dHRvbkVuYWJsZWQoZW5hYmxlZCwgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODYzNTY4OTgyLCBlbmFibGVkLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgdGhlIG1heGltdW0gc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0TWF4U2l6ZSh3aWR0aCwgaGVpZ2h0LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDM0NjAwNzg1NTEsIHdpZHRoLCBoZWlnaHQsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgbWluaW11bSBzaXplIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRNaW5TaXplKHdpZHRoLCBoZWlnaHQsIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjY3NzkxOTA4NSwgd2lkdGgsIGhlaWdodCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBvZiB0aGUgd2luZG93IHRvIHRoZSBzY3JlZW4uXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHBhcmFtIHtudW1iZXJ9IHlcbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRSZWxhdGl2ZVBvc2l0aW9uKHgsIHksIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNzQxNjA2MTE1LCB4LCB5LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFNldHMgd2hldGhlciB0aGUgd2luZG93IGlzIHJlc2l6YWJsZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzaXphYmxlXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0UmVzaXphYmxlKHJlc2l6YWJsZSwgLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyODM1MzA1NTQxLCByZXNpemFibGUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgc2l6ZSBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2V0U2l6ZSh3aWR0aCwgaGVpZ2h0LCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMzNzk3ODgzOTMsIHdpZHRoLCBoZWlnaHQsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgdGl0bGUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFRpdGxlKHRpdGxlLCAuLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE3MDk1MzU5OCwgdGl0bGUsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2luZG93LlxuICogQHBhcmFtIHtudW1iZXJ9IG1hZ25pZmljYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZXRab29tKG1hZ25pZmljYXRpb24sIC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjc5NDUwMDA1MSwgbWFnbmlmaWNhdGlvbiwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBTaG93cyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNob3coLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgyOTMxODIzMTIxLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNpemUgb2YgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8JG1vZGVscy5TaXplPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNpemUoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxMTQxMTExNDMzLCB0YXJnZXRXaW5kb3cpO1xuICAgIGxldCAkdHlwaW5nUHJvbWlzZSA9ICRyZXN1bHRQcm9taXNlLnRoZW4oKCRyZXN1bHQpID0+IHtcbiAgICAgICAgcmV0dXJuICQkY3JlYXRlVHlwZTMoJHJlc3VsdCk7XG4gICAgfSk7XG4gICAgJHR5cGluZ1Byb21pc2UuY2FuY2VsID0gJHJlc3VsdFByb21pc2UuY2FuY2VsLmJpbmQoJHJlc3VsdFByb21pc2UpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHR5cGluZ1Byb21pc2UpO1xufVxuXG4vKipcbiAqIFRvZ2dsZXMgdGhlIHdpbmRvdyBiZXR3ZWVuIGZ1bGxzY3JlZW4gYW5kIG5vcm1hbC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVGdWxsc2NyZWVuKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjIxMjc2MzE0OSwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLyoqXG4gKiBUb2dnbGVzIHRoZSB3aW5kb3cgYmV0d2VlbiBtYXhpbWlzZWQgYW5kIG5vcm1hbC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGVNYXhpbWlzZSguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDMxNDQxOTQ0NDMsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogVW4tZnVsbHNjcmVlbnMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBVbkZ1bGxzY3JlZW4oLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgxNTg3MDAyNTA2LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFVuLW1heGltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWF4aW1pc2UoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzODg5OTk5NDc2LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFVuLW1pbmltaXNlcyB0aGUgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVuTWluaW1pc2UoLi4udGFyZ2V0V2luZG93KSB7XG4gICAgbGV0ICRyZXN1bHRQcm9taXNlID0gJENhbGwuQnlJRCgzNTcxNjM2MTk4LCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSB3aW5kb3cuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBXaWR0aCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE2NTUyMzk5ODgsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogWm9vbXMgdGhlIHdpbmRvdy5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHRhcmdldFdpbmRvd1xuICogQHJldHVybnMge1Byb21pc2U8dm9pZD4gJiB7IGNhbmNlbCgpOiB2b2lkIH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBab29tKC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoNTU1NzE5OTIzLCB0YXJnZXRXaW5kb3cpO1xuICAgIHJldHVybiAvKiogQHR5cGUge2FueX0gKi8oJHJlc3VsdFByb21pc2UpO1xufVxuXG4vKipcbiAqIEluY3JlYXNlcyB0aGUgem9vbSBsZXZlbCBvZiB0aGUgd2VidmlldyBjb250ZW50LlxuICogQHBhcmFtIHtzdHJpbmdbXX0gdGFyZ2V0V2luZG93XG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPiAmIHsgY2FuY2VsKCk6IHZvaWQgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFpvb21JbiguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDEzMTA0MzQyNzIsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogRGVjcmVhc2VzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbU91dCguLi50YXJnZXRXaW5kb3cpIHtcbiAgICBsZXQgJHJlc3VsdFByb21pc2UgPSAkQ2FsbC5CeUlEKDE3NTU3MDI4MjEsIHRhcmdldFdpbmRvdyk7XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7YW55fSAqLygkcmVzdWx0UHJvbWlzZSk7XG59XG5cbi8qKlxuICogUmVzZXRzIHRoZSB6b29tIGxldmVsIG9mIHRoZSB3ZWJ2aWV3IGNvbnRlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSB0YXJnZXRXaW5kb3dcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+ICYgeyBjYW5jZWwoKTogdm9pZCB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gWm9vbVJlc2V0KC4uLnRhcmdldFdpbmRvdykge1xuICAgIGxldCAkcmVzdWx0UHJvbWlzZSA9ICRDYWxsLkJ5SUQoMjc4MTQ2NzE1NCwgdGFyZ2V0V2luZG93KTtcbiAgICByZXR1cm4gLyoqIEB0eXBlIHthbnl9ICovKCRyZXN1bHRQcm9taXNlKTtcbn1cblxuLy8gUHJpdmF0ZSB0eXBlIGNyZWF0aW9uIGZ1bmN0aW9uc1xuY29uc3QgJCRjcmVhdGVUeXBlMCA9ICRtb2RlbHMuUG9zaXRpb24uY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTEgPSAkbW9kZWxzLkxSVEIuY3JlYXRlRnJvbTtcbmNvbnN0ICQkY3JlYXRlVHlwZTIgPSAkbW9kZWxzLlNjcmVlbi5jcmVhdGVGcm9tO1xuY29uc3QgJCRjcmVhdGVUeXBlMyA9ICRtb2RlbHMuU2l6ZS5jcmVhdGVGcm9tO1xuIiwgIi8vIEB0cy1ub2NoZWNrXG4vKlxuIF8gICAgIF9fICAgICBfIF9fXG58IHwgIC8gL19fXyBfKF8pIC9fX19fXG58IHwgL3wgLyAvIF9fIGAvIC8gLyBfX18vXG58IHwvIHwvIC8gL18vIC8gLyAoX18gIClcbnxfXy98X18vXFxfXyxfL18vXy9fX19fL1xuVGhlIGVsZWN0cm9uIGFsdGVybmF0aXZlIGZvciBHb1xuKGMpIExlYSBBbnRob255IDIwMTktcHJlc2VudFxuKi9cblxuLyoganNoaW50IGVzdmVyc2lvbjogOSAqL1xuXG5pbXBvcnQge09wZW5VUkx9IGZyb20gXCIuL2Jyb3dzZXIuanNcIjtcbmltcG9ydCB7UXVlc3Rpb259IGZyb20gXCIuL2RpYWxvZ3MuanNcIjtcbmltcG9ydCB7RW1pdCwgV2FpbHNFdmVudH0gZnJvbSBcIi4vZXZlbnRzLmpzXCI7XG5pbXBvcnQge2NhbkFib3J0TGlzdGVuZXJzLCB3aGVuUmVhZHl9IGZyb20gXCIuL3V0aWxzLmpzXCI7XG5pbXBvcnQgKiBhcyBXaW5kb3cgZnJvbSBcIi4vd2luZG93LmpzXCI7XG5cbi8qKlxuICogU2VuZHMgYW4gZXZlbnQgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgb3B0aW9uYWwgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHNlbmQuXG4gKiBAcGFyYW0ge2FueX0gW2RhdGE9bnVsbF0gLSBPcHRpb25hbCBkYXRhIHRvIHNlbmQgYWxvbmcgd2l0aCB0aGUgZXZlbnQuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIHNlbmRFdmVudChldmVudE5hbWUsIGRhdGE9bnVsbCkge1xuICAgIEVtaXQobmV3IFdhaWxzRXZlbnQoZXZlbnROYW1lLCBkYXRhKSk7XG59XG5cbi8qKlxuICogQ2FsbHMgYSBtZXRob2Qgb24gYSBzcGVjaWZpZWQgd2luZG93LlxuICogQHBhcmFtIHtzdHJpbmd9IHdpbmRvd05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgd2luZG93IHRvIGNhbGwgdGhlIG1ldGhvZCBvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2ROYW1lIC0gVGhlIG5hbWUgb2YgdGhlIG1ldGhvZCB0byBjYWxsLlxuICovXG5mdW5jdGlvbiBjYWxsV2luZG93TWV0aG9kKHdpbmRvd05hbWUsIG1ldGhvZE5hbWUpIHtcbiAgICBjb25zdCB0YXJnZXRXaW5kb3cgPSBXaW5kb3cuR2V0KHdpbmRvd05hbWUpO1xuICAgIGNvbnN0IG1ldGhvZCA9IHRhcmdldFdpbmRvd1ttZXRob2ROYW1lXTtcblxuICAgIGlmICh0eXBlb2YgbWV0aG9kICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgV2luZG93IG1ldGhvZCAnJHttZXRob2ROYW1lfScgbm90IGZvdW5kYCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBtZXRob2QuY2FsbCh0YXJnZXRXaW5kb3cpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgY2FsbGluZyB3aW5kb3cgbWV0aG9kICcke21ldGhvZE5hbWV9JzogYCwgZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIFJlc3BvbmRzIHRvIGEgdHJpZ2dlcmluZyBldmVudCBieSBydW5uaW5nIGFwcHJvcHJpYXRlIFdNTCBhY3Rpb25zIGZvciB0aGUgY3VycmVudCB0YXJnZXRcbiAqXG4gKiBAcGFyYW0ge0V2ZW50fSBldlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIG9uV01MVHJpZ2dlcmVkKGV2KSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGV2LmN1cnJlbnRUYXJnZXQ7XG5cbiAgICBmdW5jdGlvbiBydW5FZmZlY3QoY2hvaWNlID0gXCJZZXNcIikge1xuICAgICAgICBpZiAoY2hvaWNlICE9PSBcIlllc1wiKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50VHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtZXZlbnQnKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0V2luZG93ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC10YXJnZXQtd2luZG93JykgfHwgXCJcIjtcbiAgICAgICAgY29uc3Qgd2luZG93TWV0aG9kID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC13aW5kb3cnKTtcbiAgICAgICAgY29uc3QgdXJsID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1vcGVudXJsJyk7XG5cbiAgICAgICAgaWYgKGV2ZW50VHlwZSAhPT0gbnVsbClcbiAgICAgICAgICAgIHNlbmRFdmVudChldmVudFR5cGUpO1xuICAgICAgICBpZiAod2luZG93TWV0aG9kICE9PSBudWxsKVxuICAgICAgICAgICAgY2FsbFdpbmRvd01ldGhvZCh0YXJnZXRXaW5kb3csIHdpbmRvd01ldGhvZCk7XG4gICAgICAgIGlmICh1cmwgIT09IG51bGwpXG4gICAgICAgICAgICB2b2lkIE9wZW5VUkwodXJsKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maXJtID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dtbC1jb25maXJtJyk7XG5cbiAgICBpZiAoY29uZmlybSkge1xuICAgICAgICBRdWVzdGlvbih7XG4gICAgICAgICAgICBUaXRsZTogXCJDb25maXJtXCIsXG4gICAgICAgICAgICBNZXNzYWdlOiBjb25maXJtLFxuICAgICAgICAgICAgRGV0YWNoZWQ6IGZhbHNlLFxuICAgICAgICAgICAgQnV0dG9uczogW1xuICAgICAgICAgICAgICAgIHsgTGFiZWw6IFwiWWVzXCIgfSxcbiAgICAgICAgICAgICAgICB7IExhYmVsOiBcIk5vXCIsIElzRGVmYXVsdDogdHJ1ZSB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pLnRoZW4ocnVuRWZmZWN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBydW5FZmZlY3QoKTtcbiAgICB9XG59XG5cbi8qKlxuICogQHR5cGUge3N5bWJvbH1cbiAqL1xuY29uc3QgY29udHJvbGxlciA9IFN5bWJvbCgpO1xuXG4vKipcbiAqIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IGRvZXMgbm90IGFjdHVhbGx5IHJlbWVtYmVyIGFjdGl2ZSBldmVudCBsaXN0ZW5lcnM6IGluc3RlYWRcbiAqIGl0IHRpZXMgdGhlbSB0byBhbiBBYm9ydFNpZ25hbCBhbmQgdXNlcyBhbiBBYm9ydENvbnRyb2xsZXIgdG8gcmVtb3ZlIHRoZW0gYWxsIGF0IG9uY2UuXG4gKi9cbmNsYXNzIEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0b3JlcyB0aGUgQWJvcnRDb250cm9sbGVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVtb3ZlIGFsbCBjdXJyZW50bHkgYWN0aXZlIGxpc3RlbmVycy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG5hbWUge0BsaW5rIGNvbnRyb2xsZXJ9XG4gICAgICAgICAqIEBtZW1iZXIge0Fib3J0Q29udHJvbGxlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXNbY29udHJvbGxlcl0gPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBvcHRpb25zIG9iamVjdCBmb3IgYWRkRXZlbnRMaXN0ZW5lciB0aGF0IHRpZXMgdGhlIGxpc3RlbmVyXG4gICAgICogdG8gdGhlIEFib3J0U2lnbmFsIGZyb20gdGhlIGN1cnJlbnQgQWJvcnRDb250cm9sbGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBBbiBIVE1MIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ1tdfSB0cmlnZ2VycyBUaGUgbGlzdCBvZiBhY3RpdmUgV01MIHRyaWdnZXIgZXZlbnRzIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnRzXG4gICAgICogQHJldHVybnMge0FkZEV2ZW50TGlzdGVuZXJPcHRpb25zfVxuICAgICAqL1xuICAgIHNldChlbGVtZW50LCB0cmlnZ2Vycykge1xuICAgICAgICByZXR1cm4geyBzaWduYWw6IHRoaXNbY29udHJvbGxlcl0uc2lnbmFsIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpc1tjb250cm9sbGVyXS5hYm9ydCgpO1xuICAgICAgICB0aGlzW2NvbnRyb2xsZXJdID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAdHlwZSB7c3ltYm9sfVxuICovXG5jb25zdCB0cmlnZ2VyTWFwID0gU3ltYm9sKCk7XG5cbi8qKlxuICogQHR5cGUge3N5bWJvbH1cbiAqL1xuY29uc3QgZWxlbWVudENvdW50ID0gU3ltYm9sKCk7XG5cbi8qKlxuICogV2Vha01hcFJlZ2lzdHJ5IG1hcHMgYWN0aXZlIHRyaWdnZXIgZXZlbnRzIHRvIGVhY2ggRE9NIGVsZW1lbnQgdGhyb3VnaCBhIFdlYWtNYXAuXG4gKiBUaGlzIGVuc3VyZXMgdGhhdCB0aGUgbWFwcGluZyByZW1haW5zIHByaXZhdGUgdG8gdGhpcyBtb2R1bGUsIHdoaWxlIHN0aWxsIGFsbG93aW5nIGdhcmJhZ2VcbiAqIGNvbGxlY3Rpb24gb2YgdGhlIGludm9sdmVkIGVsZW1lbnRzLlxuICovXG5jbGFzcyBXZWFrTWFwUmVnaXN0cnkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcmVzIHRoZSBjdXJyZW50IGVsZW1lbnQtdG8tdHJpZ2dlciBtYXBwaW5nLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbmFtZSB7QGxpbmsgdHJpZ2dlck1hcH1cbiAgICAgICAgICogQG1lbWJlciB7V2Vha01hcDxIVE1MRWxlbWVudCwgc3RyaW5nW10+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwXSA9IG5ldyBXZWFrTWFwKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvdW50cyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHdpdGggYWN0aXZlIFdNTCB0cmlnZ2Vycy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG5hbWUge0BsaW5rIGVsZW1lbnRDb3VudH1cbiAgICAgICAgICogQG1lbWJlciB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpc1tlbGVtZW50Q291bnRdID0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBhY3RpdmUgdHJpZ2dlcnMgZm9yIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgQW4gSFRNTCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmdbXX0gdHJpZ2dlcnMgVGhlIGxpc3Qgb2YgYWN0aXZlIFdNTCB0cmlnZ2VyIGV2ZW50cyBmb3IgdGhlIHNwZWNpZmllZCBlbGVtZW50XG4gICAgICogQHJldHVybnMge0FkZEV2ZW50TGlzdGVuZXJPcHRpb25zfVxuICAgICAqL1xuICAgIHNldChlbGVtZW50LCB0cmlnZ2Vycykge1xuICAgICAgICB0aGlzW2VsZW1lbnRDb3VudF0gKz0gIXRoaXNbdHJpZ2dlck1hcF0uaGFzKGVsZW1lbnQpO1xuICAgICAgICB0aGlzW3RyaWdnZXJNYXBdLnNldChlbGVtZW50LCB0cmlnZ2Vycyk7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxuICAgICAqL1xuICAgIHJlc2V0KCkge1xuICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRdIDw9IDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvckFsbCgnKicpKSB7XG4gICAgICAgICAgICBpZiAodGhpc1tlbGVtZW50Q291bnRdIDw9IDApXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IHRyaWdnZXJzID0gdGhpc1t0cmlnZ2VyTWFwXS5nZXQoZWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzW2VsZW1lbnRDb3VudF0gLT0gKHR5cGVvZiB0cmlnZ2VycyAhPT0gXCJ1bmRlZmluZWRcIik7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycyB8fCBbXSlcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHJpZ2dlciwgb25XTUxUcmlnZ2VyZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1t0cmlnZ2VyTWFwXSA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICAgIHRoaXNbZWxlbWVudENvdW50XSA9IDA7XG4gICAgfVxufVxuXG5jb25zdCB0cmlnZ2VyUmVnaXN0cnkgPSBjYW5BYm9ydExpc3RlbmVycygpID8gbmV3IEFib3J0Q29udHJvbGxlclJlZ2lzdHJ5KCkgOiBuZXcgV2Vha01hcFJlZ2lzdHJ5KCk7XG5cbi8qKlxuICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBhZGRXTUxMaXN0ZW5lcnMoZWxlbWVudCkge1xuICAgIGNvbnN0IHRyaWdnZXJSZWdFeHAgPSAvXFxTKy9nO1xuICAgIGNvbnN0IHRyaWdnZXJBdHRyID0gKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3bWwtdHJpZ2dlcicpIHx8IFwiY2xpY2tcIik7XG4gICAgY29uc3QgdHJpZ2dlcnMgPSBbXTtcblxuICAgIGxldCBtYXRjaDtcbiAgICB3aGlsZSAoKG1hdGNoID0gdHJpZ2dlclJlZ0V4cC5leGVjKHRyaWdnZXJBdHRyKSkgIT09IG51bGwpXG4gICAgICAgIHRyaWdnZXJzLnB1c2gobWF0Y2hbMF0pO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRyaWdnZXJSZWdpc3RyeS5zZXQoZWxlbWVudCwgdHJpZ2dlcnMpO1xuICAgIGZvciAoY29uc3QgdHJpZ2dlciBvZiB0cmlnZ2VycylcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRyaWdnZXIsIG9uV01MVHJpZ2dlcmVkLCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgYW4gYXV0b21hdGljIHJlbG9hZCBvZiBXTUwgdG8gYmUgcGVyZm9ybWVkIGFzIHNvb24gYXMgdGhlIGRvY3VtZW50IGlzIGZ1bGx5IGxvYWRlZC5cbiAqXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEVuYWJsZSgpIHtcbiAgICB3aGVuUmVhZHkoUmVsb2FkKTtcbn1cblxuLyoqXG4gKiBSZWxvYWRzIHRoZSBXTUwgcGFnZSBieSBhZGRpbmcgbmVjZXNzYXJ5IGV2ZW50IGxpc3RlbmVycyBhbmQgYnJvd3NlciBsaXN0ZW5lcnMuXG4gKlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZWxvYWQoKSB7XG4gICAgdHJpZ2dlclJlZ2lzdHJ5LnJlc2V0KCk7XG4gICAgZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbd21sLWV2ZW50XSwgW3dtbC13aW5kb3ddLCBbd21sLW9wZW51cmxdJykuZm9yRWFjaChhZGRXTUxMaXN0ZW5lcnMpO1xufVxuIiwgIi8vIEB0cy1jaGVja1xuLypcbiBfICAgICBfXyAgICAgXyBfX1xufCB8ICAvIC9fX18gXyhfKSAvX19fX1xufCB8IC98IC8gLyBfXyBgLyAvIC8gX19fL1xufCB8LyB8LyAvIC9fLyAvIC8gKF9fICApXG58X18vfF9fL1xcX18sXy9fL18vX19fXy9cblRoZSBlbGVjdHJvbiBhbHRlcm5hdGl2ZSBmb3IgR29cbihjKSBMZWEgQW50aG9ueSAyMDE5LXByZXNlbnRcbiovXG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgcmVtb3ZpbmcgbGlzdGVuZXJzIGJ5IHRyaWdnZXJpbmcgYW4gQWJvcnRTaWduYWxcbiAqIChzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0V2ZW50VGFyZ2V0L2FkZEV2ZW50TGlzdGVuZXIjc2lnbmFsKVxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5BYm9ydExpc3RlbmVycygpIHtcbiAgICBpZiAoIUV2ZW50VGFyZ2V0IHx8ICFBYm9ydFNpZ25hbCB8fCAhQWJvcnRDb250cm9sbGVyKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgcmVzdWx0ID0gdHJ1ZTtcblxuICAgIGNvbnN0IHRhcmdldCA9IG5ldyBFdmVudFRhcmdldCgpO1xuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCAoKSA9PiB7IHJlc3VsdCA9IGZhbHNlOyB9LCB7IHNpZ25hbDogY29udHJvbGxlci5zaWduYWwgfSk7XG4gICAgY29udHJvbGxlci5hYm9ydCgpO1xuICAgIHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgndGVzdCcpKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKipcbiBUaGlzIHRlY2huaXF1ZSBmb3IgcHJvcGVyIGxvYWQgZGV0ZWN0aW9uIGlzIHRha2VuIGZyb20gSFRNWDpcblxuIEJTRCAyLUNsYXVzZSBMaWNlbnNlXG5cbiBDb3B5cmlnaHQgKGMpIDIwMjAsIEJpZyBTa3kgU29mdHdhcmVcbiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG4gUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG5cbiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cblxuIDIuIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG5cbiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkVcbiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIEhPTERFUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFXG4gRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUxcbiBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUlxuIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSXG4gQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSxcbiBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG5cbiAqKiovXG5cbmxldCBpc1JlYWR5ID0gZmFsc2U7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4gaXNSZWFkeSA9IHRydWUpO1xuXG5leHBvcnQgZnVuY3Rpb24gd2hlblJlYWR5KGNhbGxiYWNrKSB7XG4gICAgaWYgKGlzUmVhZHkgfHwgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBjYWxsYmFjayk7XG4gICAgfVxufVxuIiwgIi8vIEB0cy1jaGVja1xuLy8gQ3luaHlyY2h3eWQgeSBmZmVpbCBob24geW4gYXd0b21hdGlnLiBQRUlESVdDSCBcdTAwQzIgTU9ESVdMXG4vLyBUaGlzIGZpbGUgaXMgYXV0b21hdGljYWxseSBnZW5lcmF0ZWQuIERPIE5PVCBFRElUXG5cbmV4cG9ydCAqIGZyb20gXCIuLi8uLi8uLi8uLi9wa2cvcnVudGltZS9pbmRleC5qc1wiO1xuXG5pbXBvcnQgKiBhcyBydW50aW1lIGZyb20gXCIuLi8uLi8uLi8uLi9wa2cvcnVudGltZS9pbmRleC5qc1wiO1xud2luZG93LndhaWxzID0gcnVudGltZTtcblxucnVudGltZS5XTUwuRW5hYmxlKCk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQUFBQTtBQUFBLEVBQUE7QUFBQSxnQkFBQUM7QUFBQSxFQUFBO0FBQUE7QUFBQSxlQUFBQztBQUFBLEVBQUE7QUFBQSxnQkFBQUM7QUFBQSxFQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUN5QkEsSUFBSSxjQUNGO0FBV0ssSUFBSSxTQUFTLENBQUMsT0FBTyxPQUFPO0FBQ2pDLE1BQUksS0FBSztBQUNULE1BQUksSUFBSTtBQUNSLFNBQU8sS0FBSztBQUNWLFVBQU0sWUFBYSxLQUFLLE9BQU8sSUFBSSxLQUFNLENBQUM7QUFBQSxFQUM1QztBQUNBLFNBQU87QUFDVDs7O0FDL0JBLElBQU0sYUFBYSxPQUFPLFNBQVMsU0FBUztBQUdyQyxTQUFTLE9BQU8sS0FBSztBQUN4QixNQUFHLE9BQU8sUUFBUTtBQUNkLFdBQU8sT0FBTyxPQUFPLFFBQVEsWUFBWSxHQUFHO0FBQUEsRUFDaEQsT0FBTztBQUNILFdBQU8sT0FBTyxPQUFPLGdCQUFnQixTQUFTLFlBQVksR0FBRztBQUFBLEVBQ2pFO0FBQ0o7QUFHTyxJQUFNLGNBQWM7QUFBQSxFQUN2QixNQUFNO0FBQUEsRUFDTixhQUFhO0FBQUEsRUFDYixZQUFZO0FBQ2hCO0FBQ08sSUFBSSxXQUFXLE9BQU87QUFzQnRCLFNBQVMsdUJBQXVCLFFBQVEsWUFBWTtBQUN2RCxTQUFPLFNBQVUsUUFBUSxPQUFLLE1BQU07QUFDaEMsV0FBTyxrQkFBa0IsUUFBUSxRQUFRLFlBQVksSUFBSTtBQUFBLEVBQzdEO0FBQ0o7QUFxQ0EsU0FBUyxrQkFBa0IsVUFB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O0FBQUEsSUFDN0IsMEJBQTBCO0FBQUEsSUFDMUIsdUJBQXVCO0FBQUEsSUFDdkIsdUJBQXVCO0FBQUEsSUFDdkIsMkJBQTJCO0FBQUEsSUFDM0IsK0JBQStCO0FBQUEsSUFDL0Isb0JBQW9CO0FBQUEsSUFDcEIscUJBQXFCO0FBQUEsSUFDckIscUJBQXFCO0FBQUEsSUFDckIsc0JBQXNCO0FBQUEsSUFDdEIsZ0NBQWdDO0FBQUEsSUFDaEMsa0NBQWtDO0FBQUEsSUFDbEMsbUNBQW1DO0FBQUEsSUFDbkMsb0NBQW9DO0FBQUEsSUFDcEMsK0JBQStCO0FBQUEsSUFDL0IsNkJBQTZCO0FBQUEsSUFDN0IsdUJBQXVCO0FBQUEsSUFDdkIsaUNBQWlDO0FBQUEsSUFDakMsOEJBQThCO0FBQUEsSUFDOUIsNEJBQTRCO0FBQUEsSUFDNUIsc0NBQXNDO0FBQUEsSUFDdEMsNEJBQTRCO0FBQUEsSUFDNUIsc0JBQXNCO0FBQUEsSUFDdEIsa0NBQWtDO0FBQUEsSUFDbEMsc0JBQXNCO0FBQUEsSUFDdEIsd0JBQXdCO0FBQUEsSUFDeEIsMkJBQTJCO0FBQUEsSUFDM0Isd0JBQXdCO0FBQUEsSUFDeEIsbUJBQW1CO0FBQUEsSUFDbkIsMEJBQTBCO0FBQUEsSUFDMUIsOEJBQThCO0FBQUEsSUFDOUIseUJBQXlCO0FBQUEsSUFDekIsNkJBQTZCO0FBQUEsSUFDN0IsaUJBQWlCO0FBQUEsSUFDakIsZ0JBQWdCO0FBQUEsSUFDaEIsc0JBQXNCO0FBQUEsSUFDdEIsZUFBZTtBQUFBLElBQ2YseUJBQXlCO0FBQUEsSUFDekIsd0JBQXdCO0FBQUEsSUFDeEIsb0JBQW9CO0FBQUEsSUFDcEIscUJBQXFCO0FBQUEsSUFDckIsaUJBQWlCO0FBQUEsSUFDakIsaUJBQWlCO0FBQUEsSUFDakIsc0JBQXNCO0FBQUEsSUFDdEIsbUNBQW1DO0FBQUEsSUFDbkMscUNBQXFDO0FBQUEsSUFDckMsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIsd0JBQXdCO0FBQUEsSUFDeEIsMkJBQTJCO0FBQUEsSUFDM0IsbUJBQW1CO0FBQUEsSUFDbkIscUJBQXFCO0FBQUEsSUFDckIsc0JBQXNCO0FBQUEsSUFDdEIsc0JBQXNCO0FBQUEsSUFDdEIsOEJBQThCO0FBQUEsSUFDOUIsaUJBQWlCO0FBQUEsSUFDakIseUJBQXlCO0FBQUEsSUFDekIsMkJBQTJCO0FBQUEsSUFDM0IsK0JBQStCO0FBQUEsSUFDL0IsMEJBQTBCO0FBQUEsSUFDMUIsOEJBQThCO0FBQUEsSUFDOUIsaUJBQWlCO0FBQUEsSUFDakIsdUJBQXVCO0FBQUEsSUFDdkIsZ0JBQWdCO0FBQUEsSUFDaEIsMEJBQTBCO0FBQUEsSUFDMUIseUJBQXlCO0FBQUEsSUFDekIsc0JBQXNCO0FBQUEsSUFDdEIsa0JBQWtCO0FBQUEsSUFDbEIsbUJBQW1CO0FBQUEsSUFDbkIsa0JBQWtCO0FBQUEsSUFDbEIsdUJBQXVCO0FBQUEsSUFDdkIsb0NBQW9DO0FBQUEsSUFDcEMsc0NBQXNDO0FBQUEsSUFDdEMsd0JBQXdCO0FBQUEsSUFDeEIsdUJBQXVCO0FBQUEsSUFDdkIseUJBQXlCO0FBQUEsSUFDekIsNEJBQTRCO0FBQUEsSUFDNUIsNEJBQTRCO0FBQUEsSUFDNUIsY0FBYztBQUFBLElBQ2QsYUFBYTtBQUFBLElBQ2IsY0FBYztBQUFBLElBQ2Qsb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIscUJBQXFCO0FBQUEsSUFDckIsb0JBQW9CO0FBQUEsSUFDcEIsaUJBQWlCO0FBQUEsSUFDakIsZ0JBQWdCO0FBQUEsSUFDaEIsb0JBQW9CO0FBQUEsSUFDcEIsbUJBQW1CO0FBQUEsSUFDbkIsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsSUFDdEIscUJBQXFCO0FBQUEsSUFDckIsb0JBQW9CO0FBQUEsSUFDcEIsZ0JBQWdCO0FBQUEsSUFDaEIsZUFBZTtBQUFBLElBQ2YsZUFBZTtBQUFBLElBQ2YsY0FBYztBQUFBLElBQ2QsMEJBQTBCO0FBQUEsSUFDMUIseUJBQXlCO0FBQUEsSUFDekIsc0NBQXNDO0FB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LE9BQU87QUFDN0MsV0FBSyxZQUFZLEtBQU0sT0FBTyxhQUFhO0FBRTNDLGlCQUFXLFdBQVcsWUFBWSxDQUFDO0FBQy9CLGdCQUFRLG9CQUFvQixTQUFTLGNBQWM7QUFBQSxJQUMzRDtBQUVBLFNBQUssVUFBVSxJQUFJLG9CQUFJLFFBQVE7QUFDL0IsU0FBSyxZQUFZLElBQUk7QUFBQSxFQUN6QjtBQUNKO0FBRUEsSUFBTSxrQkFBa0Isa0JBQWtCLElBQUksSUFBSSx3QkFBd0IsSUFBSSxJQUFJLGdCQUFnQjtBQVFsRyxTQUFTLGdCQUFnQixTQUFTO0FBQzlCLFFBQU0sZ0JBQWdCO0FBQ3RCLFFBQU0sY0FBZSxRQUFRLGFBQWEsYUFBYSxLQUFLO0FBQzVELFFBQU0sV0FBVyxDQUFDO0FBRWxCLE1BQUk7QUFDSixVQUFRLFFBQVEsY0FBYyxLQUFLLFdBQVcsT0FBTztBQUNqRCxhQUFTLEtBQUssTUFBTSxDQUFDLENBQUM7QUFFMUIsUUFBTSxVQUFVLGdCQUFnQixJQUFJLFNBQVMsUUFBUTtBQUNyRCxhQUFXLFdBQVc7QUFDbEIsWUFBUSxpQkFBaUIsU0FBUyxnQkFBZ0IsT0FBTztBQUNqRTtBQU9PLFNBQVMsU0FBUztBQUNyQixZQUFVQyxPQUFNO0FBQ3BCO0FBT08sU0FBU0EsVUFBUztBQUNyQixrQkFBZ0IsTUFBTTtBQUN0QixXQUFTLEtBQUssaUJBQWlCLDBDQUEwQyxFQUFFLFFBQVEsZUFBZTtBQUN0Rzs7O0FFclBBLE9BQU8sUUFBUTtBQUVQLFlBQUksT0FBTzsiLAogICJuYW1lcyI6IFsiY2FsbF9leHBvcnRzIiwgImNyZWF0ZV9leHBvcnRzIiwgImZsYWdzX2V4cG9ydHMiLCAic3lzdGVtX2V4cG9ydHMiLCAiY2FsbCIsICJNYXAiLCAia2V5IiwgImNhbGxfZXhwb3J0cyIsICJjcmVhdGVfZXhwb3J0cyIsICJNYXAiLCAiRXJyb3IiLCAiRXJyb3IiLCAiZXZlbnROYW1lIiwgImZsYWdzX2V4cG9ydHMiLCAiJCRjcmVhdGVUeXBlMSIsICIkJGNyZWF0ZVR5cGUwIiwgInN5c3RlbV9leHBvcnRzIiwgIiQkY3JlYXRlVHlwZTAiLCAiSGlkZSIsICJTaG93IiwgIlNpemUiLCAiJCRjcmVhdGVUeXBlMCIsICIkJGNyZWF0ZVR5cGUxIiwgIiQkY3JlYXRlVHlwZTIiLCAiSGlkZSIsICJyZXNpemFibGUiLCAiU2hvdyIsICJTaXplIiwgIiQkY3JlYXRlVHlwZTMiLCAiUmVsb2FkIiwgImNvbnRyb2xsZXIiLCAiUmVsb2FkIl0KfQo=
