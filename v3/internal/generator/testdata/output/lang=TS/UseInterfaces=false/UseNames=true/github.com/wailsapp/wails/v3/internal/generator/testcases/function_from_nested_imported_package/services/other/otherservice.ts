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
 */
export function Yay(): $CancellablePromise<$models.Address | null> {
    return $Call.ByName("github.com/wailsapp/wails/v3/internal/generator/testcases/function_from_nested_imported_package/services/other.OtherService.Yay").then(($result: any) => {
        return $$createType1($result);
    });
}

// Private type creation functions
const $$createType0 = $models.Address.createFrom;
const $$createType1 = $Create.Nullable($$createType0);
