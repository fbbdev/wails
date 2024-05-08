// @ts-check
// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

/**
 * GreetService is great
 * @module
 */

import {Call as $Call, Create as $Create} from "/wails/runtime.js";

import * as $models from "./models.js";

/**
 * Get someone
 * @param {$models.Alias} aliasValue
 * @returns {Promise<$models.Person> & { cancel(): void }}
 */
export function Get(aliasValue) {
    let $resultPromise = $Call.ByName("main.GreetService.Get", aliasValue);
    return /** @type {any} */($resultPromise);
}

/**
 * Get someone quite different
 * @returns {Promise<$models.GenericPerson<boolean>> & { cancel(): void }}
 */
export function GetButDifferent() {
    let $resultPromise = $Call.ByName("main.GreetService.GetButDifferent");
    return /** @type {any} */($resultPromise);
}

/**
 * Greet a lot of unusual things.
 * @param {$models.EmptyAliasStruct} $0
 * @param {$models.AliasStruct} $1
 * @param {$models.EmptyStruct} $2
 * @returns {Promise<void> & { cancel(): void }}
 */
export function Greet($0, $1, $2) {
    let $resultPromise = $Call.ByName("main.GreetService.Greet", $0, $1, $2);
    return /** @type {any} */($resultPromise);
}