// @ts-check
// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import { Call as $Call, CancellablePromise as $CancellablePromise } from "/wails/runtime.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as otherpackage$0 from "./otherpackage/models.js";

/**
 * @param {string} $0
 * @returns {$CancellablePromise<void>}
 */
function InternalMethod($0) {
    return $Call.ByID(3518775569, $0);
}

/**
 * @param {otherpackage$0.Dummy} $0
 * @returns {$CancellablePromise<void>}
 */
export function VisibleMethod($0) {
    return $Call.ByID(474018228, $0);
}

/**
 * @param {string} arg
 * @returns {Promise<void>}
 */
export async function CustomMethod(arg) {
    await InternalMethod("Hello " + arg + "!");
}
