// @ts-check
// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

/**
 * GreetService is great
 * @module
 */

import {Call as $Call, Types as $Types} from "/wails/runtime.js";

import * as $models from "./models.js";

/**
 * Make a cycle.
 * @returns {Promise<[$models.Cyclic, $models.GenericCyclic<$models.GenericCyclic<number>>]> & { cancel(): void }}
 */
export function MakeCycles() {
    let $resultPromise = /** @type {any} */($Call.ByName("main.GreetService.MakeCycles"));
    return $resultPromise;
}