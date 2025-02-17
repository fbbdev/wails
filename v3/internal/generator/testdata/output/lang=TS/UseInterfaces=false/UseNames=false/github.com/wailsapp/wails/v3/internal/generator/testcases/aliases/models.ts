// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import {Create as $Create} from "/wails/runtime.js";

/**
 * A nice type Alias.
 */
export type Alias = number;

/**
 * A struct alias.
 * This should be rendered as a typedef or interface in every mode.
 */
export interface AliasStruct {
    /**
     * A field with a comment.
     */
    "Foo": number[];

    /**
     * Definitely not Foo.
     */
    "Bar"?: string;
    "Baz"?: string;

    /**
     * A nested alias struct.
     */
    "Other": OtherAliasStruct;
}

/**
 * An empty struct alias.
 */
export interface EmptyAliasStruct {
}

/**
 * An empty struct.
 */
export class EmptyStruct {

    /** Creates a new EmptyStruct instance. */
    constructor($$source: Partial<EmptyStruct> = {}) {

        Object.assign(this, $$source);
    }

    /**
     * Creates a new EmptyStruct instance from a string or object.
     */
    static createFrom($$source: any = {}): EmptyStruct {
        let $$parsedSource = typeof $$source === 'string' ? JSON.parse($$source) : $$source;
        return new EmptyStruct($$parsedSource as Partial<EmptyStruct>);
    }
}

/**
 * A generic struct containing an alias.
 */
export class GenericPerson<T> {
    "Name"?: T;
    "AliasedField": Alias;

    /** Creates a new GenericPerson instance. */
    constructor($$source: Partial<GenericPerson<T>> = {}) {
        if (!("AliasedField" in $$source)) {
            this["AliasedField"] = 0;
        }

        Object.assign(this, $$source);
    }

    /**
     * Given creation functions for each type parameter,
     * returns a creation function for a concrete instance
     * of the generic class GenericPerson.
     */
    static createFrom<T>($$createParamT: (source: any) => T): ($$source?: any) => GenericPerson<T> {
        const $$createField0_0 = $$createParamT;
        return ($$source: any = {}) => {
            let $$parsedSource = typeof $$source === 'string' ? JSON.parse($$source) : $$source;
            if ("Name" in $$parsedSource) {
                $$parsedSource["Name"] = $$createField0_0($$parsedSource["Name"]);
            }
            return new GenericPerson<T>($$parsedSource as Partial<GenericPerson<T>>);
        };
    }
}

/**
 * Another struct alias.
 */
export interface OtherAliasStruct {
    "NoMoreIdeas": number[];
}

/**
 * A non-generic struct containing an alias.
 */
export class Person {
    /**
     * The Person's name.
     */
    "Name": string;

    /**
     * A random alias field.
     */
    "AliasedField": Alias;

    /** Creates a new Person instance. */
    constructor($$source: Partial<Person> = {}) {
        if (!("Name" in $$source)) {
            this["Name"] = "";
        }
        if (!("AliasedField" in $$source)) {
            this["AliasedField"] = 0;
        }

        Object.assign(this, $$source);
    }

    /**
     * Creates a new Person instance from a string or object.
     */
    static createFrom($$source: any = {}): Person {
        let $$parsedSource = typeof $$source === 'string' ? JSON.parse($$source) : $$source;
        return new Person($$parsedSource as Partial<Person>);
    }
}

/**
 * A class alias.
 */
export const AliasedPerson = Person;

/**
 * A class alias.
 */
export type AliasedPerson = Person;

/**
 * Another class alias, but ordered after its aliased class.
 */
export const StrangelyAliasedPerson = Person;

/**
 * Another class alias, but ordered after its aliased class.
 */
export type StrangelyAliasedPerson = Person;
