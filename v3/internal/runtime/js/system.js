/*
 _	   __	  _ __
| |	 / /___ _(_) /____
| | /| / / __ `/ / / ___/
| |/ |/ / /_/ / / (__  )
|__/|__/\__,_/_/_/____/
The electron alternative for Go
(c) Lea Anthony 2019-present
*/

/* jshint esversion: 9 */

/**
 * Fetches application capabilities from the server.
 *
 * @async
 * @function Capabilities
 * @returns {Promise<any>} A promise that resolves to an object containing the capabilities.
 */
export function Capabilities() {
    return fetch("/wails/capabilities").then((response) => response.json());
}

/**
 * Checks if the current operating system is Windows.
 *
 * @return {boolean} True if the operating system is Windows, otherwise false.
 */
export function IsWindows() {
    return window._wails.environment.OS === "windows";
}

/**
 * Checks if the current operating system is Linux.
 *
 * @returns {boolean} Returns true if the current operating system is Linux, false otherwise.
 */
export function IsLinux() {
    return window._wails.environment.OS === "linux";
}

/**
 * Checks if the current environment is a macOS operating system.
 *
 * @returns {boolean} True if the environment is macOS, false otherwise.
 */
export function IsMac() {
    return window._wails.environment.OS === "darwin";
}

/**
 * Checks if the current environment architecture is AMD64.
 * @returns {boolean} True if the current environment architecture is AMD64, false otherwise.
 */
export function IsAMD64() {
    return window._wails.environment.Arch === "amd64";
}

/**
 * Checks if the current architecture is ARM.
 *
 * @returns {boolean} True if the current architecture is ARM, false otherwise.
 */
export function IsARM() {
    return window._wails.environment.Arch === "arm";
}

/**
 * Checks if the current environment is ARM64 architecture.
 *
 * @returns {boolean} - Returns true if the environment is ARM64 architecture, otherwise returns false.
 */
export function IsARM64() {
    return window._wails.environment.Arch === "arm64";
}

/**
 * Checks if the current environment is in debug mode.
 *
 * @returns {boolean} - Returns true if the environment is in debug mode, otherwise returns false.
 */
export function IsDebug() {
    return window._wails.environment.Debug === true;
}
