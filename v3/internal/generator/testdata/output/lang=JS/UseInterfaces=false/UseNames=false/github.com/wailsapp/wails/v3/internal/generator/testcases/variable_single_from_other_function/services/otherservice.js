// @ts-check
// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

/**
 * OtherService is a struct
 * that does things
 * @module
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import { Call as $Call, CancellablePromise as $CancellablePromise, Create as $Create } from "/wails/runtime.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as $models from "./models.js";

/**
 * Yay does this and that
 * @returns {$CancellablePromise<$models.Address | null>}
 */
export function Yay() {
    return $Call.ByID(1491748400).then(/** @type {($result: any) => any} */(($result) => {
        return $$createType1($result);
    }));
}

// Private type creation functions
const $$createType0 = $models.Address.createFrom;
const $$createType1 = $Create.Nullable($$createType0);
