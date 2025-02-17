// @ts-check
// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import {Call as $Call, Create as $Create} from "/wails/runtime.js";

/**
 * Delete deletes the key from the store. If AutoSave is true, the store is saved to disk.
 * @param {string} key
 * @returns {Promise<void> & { cancel(): void }}
 */
export function Delete(key) {
    let $resultPromise = /** @type {any} */($Call.ByID(1029952841, key));
    return $resultPromise;
}

/**
 * Get returns the value for the given key. If key is empty, the entire store is returned.
 * @param {string} key
 * @returns {Promise<any> & { cancel(): void }}
 */
export function Get(key) {
    let $resultPromise = /** @type {any} */($Call.ByID(3017738442, key));
    return $resultPromise;
}

/**
 * Save saves the store to disk
 * @returns {Promise<void> & { cancel(): void }}
 */
export function Save() {
    let $resultPromise = /** @type {any} */($Call.ByID(840897339));
    return $resultPromise;
}

/**
 * Set sets the value for the given key. If AutoSave is true, the store is saved to disk.
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void> & { cancel(): void }}
 */
export function Set(key, value) {
    let $resultPromise = /** @type {any} */($Call.ByID(2329265830, key, value));
    return $resultPromise;
}
