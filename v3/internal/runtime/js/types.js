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
 * CreateAny is a dummy creation function for simple or unknown types.
 * @template T
 * @param {any} source
 * @returns {T}
 */
export function CreateAny(source) {
    return /** @type {T} */(source);
}

/**
 * GarbleAny is a dummy garbling function for simple or unknown types.
 * @template T
 * @param {T} value
 * @returns {any}
 */
export function GarbleAny(value) {
    return value;
}

/**
 * UngarbleAny is a dummy ungarbling function for simple or unknown types.
 * @param {any} value
 * @returns {any}
 */
export function UngarbleAny(value) {
    return value;
}

/**
 * CreateByteSlice is a creation function that replaces
 * null strings with empty strings.
 * @param {any} source
 * @returns {string}
 */
export function CreateByteSlice(source) {
    return /** @type {any} */((source == null) ? "" : source);
}

/**
 * CreateArray takes a creation function for an arbitrary type
 * and returns an in-place creation function for an array
 * whose elements are of that type.
 * @template T
 * @param {(any) => T} element
 * @returns {(any) => T[]}
 */
export function CreateArray(element) {
    if (element === CreateAny) {
        return (source) => (source === null ? [] : source);
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

/**
 * GarbleArray takes a garbling function for an arbitrary type
 * and returns a garbling function for an array whose elements
 * are of that type. The input array is never modified.
 * @template T
 * @param {(T) => any} element
 * @returns {(value: T[]) => any[]}
 */
export function GarbleArray(element) {
    if (element === GarbleAny) {
        return GarbleAny;
    }

    return (value) => value.map(element);
}

/**
 * UngarbleArray takes an ungarbling function for an arbitrary type
 * and returns an in-place ungarbling function for a nullable array whose elements
 * are of that type.
 * @param {(any) => any} element
 * @returns {(value: any[] | null) => (any[] | null)}
 */
export function UngarbleArray(element) {
    if (element === UngarbleAny) {
        return UngarbleAny;
    }

    return (value) => {
        if (value === null) {
            return null;
        }
        for (let i = 0; i < value.length; i++) {
            value[i] = element(value[i]);
        }
        return value;
    }
}

/**
 * CreateMap takes creation functions for two arbitrary types
 * and returns an in-place creation function for an object
 * whose keys and values are of those types.
 * @template K, V
 * @param {(any) => K} key
 * @param {(any) => V} value
 * @returns {(any) => { [_: K]: V }}
 */
export function CreateMap(key, value) {
    if (value === CreateAny) {
        return (source) => (source === null ? {} : source);
    }

    return (source) => {
        if (source === null) {
            return {};
        }
        for (const key in source) {
            source[key] = value(source[key]);
        }
        return source;
    };
}

/**
 * GarbleMap takes garbling functions for two arbitrary types
 * and returns a garbling function for an object
 * whose keys and values are of those types.
 * The input object is never modified.
 * @template K, V
 * @param {(K) => any} key
 * @param {(V) => any} value
 * @returns {(map: { [_: K]: V }) => { [_: any]: any }}
 */
export function GarbleMap(key, value) {
    if (value === GarbleAny) {
        return GarbleAny;
    }

    return (map) => {
        const result = {};
        for (const key in map) {
            result[key] = value(map[key]);
        }
        return result;
    };
}

/**
 * UngarbleMap takes ungarbling functions for two arbitrary types
 * and returns an in-place ungarbling function for an object
 * whose keys and values are of those types.
 * @param {(any) => any} key
 * @param {(any) => any} value
 * @returns {(map: { [_: any]: any }) => { [_: any]: any }}
 */
export function UngarbleMap(key, value) {
    if (value === UngarbleAny) {
        return UngarbleAny;
    }

    return (map) => {
        if (map === null) {
            return null;
        }
        for (const key in map) {
            map[key] = value(map[key]);
        }
        return map;
    };
}

/**
 * CreateNullable takes a creation function for an arbitrary type
 * and returns a creation function for a nullable value of that type.
 * @template T
 * @param {(any) => T} element
 * @returns {(any) => (T | null)}
 */
export function CreateNullable(element) {
    if (element === CreateAny) {
        return CreateAny;
    }

    return (source) => (source === null ? null : element(source));
}

/**
 * GarbleNullable takes a garbling function for an arbitrary type
 * and returns a garbling function for a nullable value of that type.
 * @template T
 * @param {(T) => any} element
 * @returns {(value: T | null) => any}
 */
export function GarbleNullable(element) {
    if (element === GarbleAny) {
        return GarbleAny;
    }

    return (value) => (value === null ? null : element(value));
}

/**
 * UngarbleNullable takes an ungarbling function for an arbitrary type
 * and returns an ungarbling function for a nullable value of that type.
 * @param {(any) => any} element
 * @returns {(value: any | null) => any}
 */
export function UngarbleNullable(element) {
    if (element === UngarbleAny) {
        return UngarbleAny;
    }

    return (value) => (value === null ? null : element(value));
}

/**
 * CreateStruct takes an object mapping field names to creation functions
 * and returns an in-place creation function for a struct.
 * If an ungarbling map is provided, the returned function
 * additionally ungarbles the input object.
 * @template {{ [_: string]: ((any) => any) }} T
 * @template {{ [Key in keyof T]?: ReturnType<T[Key]> }} U
 * @param {T} createField
 * @param {{ [_: string]: string } | null} [ungarbleMap = null]
 * @returns {(any) => U}
 */
export function CreateStruct(createField, ungarbleMap = null) {
    const createFn = (source) => {
        for (const name in createField) {
            if (name in source) {
                source[name] = createField[name](source[name]);
            }
        }
        return source;
    };

    if (ungarbleMap === null) {
        return createFn;
    } else {
        return (source) => {
            const ungarbled = {};
            for (const name in source) {
                if (name in ungarbleMap) {
                    ungarbled[ungarbleMap[name]] = source[name];
                } else {
                    ungarbled[name] = source[name];
                }
            }
            return createFn(ungarbled);
        };
    }
}

/**
 * GarbleStruct takes an object mapping field names to garbled names
 * and garble functions and returns a garbling function for a struct.
 * The input object is never modified.
 * @template {{ [_: string]: { to: string, garble: ((any) => any) } }} T
 * @param {T} fields
 * @returns {(any) => any}
 */
export function GarbleStruct(fields) {
    return (value) => {
        const result = {};
        for (const name in fields) {
            const fieldInfo = fields[name];
            result[fieldInfo.to] = fieldInfo.garble(value[name]);
        }
        return result;
    };
}

/**
 * UngarbleStruct takes an object mapping garbled names to field names
 * and ungarble functions and returns an ungarbling function for a struct.
 * The input object is never modified.
 * @template {{ [_: string]: { from: string, ungarble: ((any) => any) } }} T
 * @param {T} fields
 * @returns {(any) => any}
 */
export function UngarbleStruct(fields) {
    return (value) => {
        const result = {};
        for (const name in fields) {
            const fieldInfo = fields[name];
            result[name] = fieldInfo.ungarble(value[fieldInfo.from]);
        }
        return result;
    };
}
