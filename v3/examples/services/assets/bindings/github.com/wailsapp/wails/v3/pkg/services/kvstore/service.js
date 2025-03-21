// @ts-check
// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import {Call as $Call, Create as $Create} from "/wails/runtime.js";

/**
 * Clear deletes all keys from the store. If AutoSave is true, the store is saved to disk.
 * @returns {Promise<void> & { cancel(): void }}
 */
export function Clear() {
    let $resultPromise = /** @type {any} */($Call.ByID(816318109));
    return $resultPromise;
}

/**
 * Delete deletes the given key from the store. If AutoSave is true, the store is saved to disk.
 * @param {string} key
 * @returns {Promise<void> & { cancel(): void }}
 */
export function Delete(key) {
    let $resultPromise = /** @type {any} */($Call.ByID(2889946731, key));
    return $resultPromise;
}

/**
 * Get returns the value for the given key. If key is empty, the entire store is returned.
 * @param {string} key
 * @returns {Promise<any> & { cancel(): void }}
 */
export function Get(key) {
    let $resultPromise = /** @type {any} */($Call.ByID(376909388, key));
    return $resultPromise;
}

/**
 * Load loads the store from disk.
 * If the store is in-memory, i.e. not associated with a file, Load has no effect.
 * If the operation fails, a non-nil error is returned
 * and the store's content and state at call time are preserved.
 * @returns {Promise<void> & { cancel(): void }}
 */
export function Load() {
    let $resultPromise = /** @type {any} */($Call.ByID(1850778156));
    return $resultPromise;
}

/**
 * Save saves the store to disk.
 * If the store is in-memory, i.e. not associated with a file, Save has no effect.
 * @returns {Promise<void> & { cancel(): void }}
 */
export function Save() {
    let $resultPromise = /** @type {any} */($Call.ByID(3572737965));
    return $resultPromise;
}

/**
 * Set sets the value for the given key. If AutoSave is true, the store is saved to disk.
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void> & { cancel(): void }}
 */
export function Set(key, value) {
    let $resultPromise = /** @type {any} */($Call.ByID(2491766752, key, value));
    return $resultPromise;
}
