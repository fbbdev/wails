// @ts-check
// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

import {Create as $Create} from "@wailsio/runtime";

import * as $internal from "./internal.js";

export class Embedded1 {
    /**
     * Creates a new Embedded1 instance.
     * @param {Partial<Embedded1>} [$$source = {}] - The source object to create the Embedded1.
     */
    constructor($$source = {}) {
        if (!("Friends" in $$source)) {
            /**
             * Friends should be shadowed in Person by a field of lesser depth
             * @member
             * @type {number}
             */
            this["Friends"] = 0;
        }
        if (!("Vanish" in $$source)) {
            /**
             * Vanish should be omitted from Person because there is another field with same depth and no tag
             * @member
             * @type {number}
             */
            this["Vanish"] = 0;
        }
        if (!("StillThere" in $$source)) {
            /**
             * StillThere should be shadowed in Person by other field with same depth and a json tag
             * @member
             * @type {string}
             */
            this["StillThere"] = "";
        }
        if (!("NamingThingsIsHard" in $$source)) {
            /**
             * NamingThingsIsHard is a law of programming
             * @member
             * @type {`${boolean}`}
             */
            this["NamingThingsIsHard"] = "false";
        }

        Object.assign(this, $$source);
    }

    /**
     * Creates a new Embedded1 instance from a string or object.
     * @param {any} [$$source = {}]
     * @returns {Embedded1}
     */
    static createFrom($$source = {}) {
        let $$parsedSource = typeof $$source === 'string' ? JSON.parse($$source) : $$source;
        return new Embedded1(/** @type {Partial<Embedded1>} */($$parsedSource));
    }
}

/**
 * @typedef {string} Embedded3
 */

/**
 * Person represents a person
 */
export class Person {
    /**
     * Creates a new Person instance.
     * @param {Partial<Person>} [$$source = {}] - The source object to create the Person.
     */
    constructor($$source = {}) {
        if (/** @type {any} */(false)) {
            /**
             * Titles is optional in JSON
             * @member
             * @type {Title[] | undefined}
             */
            this["Titles"] = [];
        }
        if (!("Names" in $$source)) {
            /**
             * Names has a
             * multiline comment
             * @member
             * @type {string[]}
             */
            this["Names"] = [];
        }
        if (!("Partner" in $$source)) {
            /**
             * Partner has a custom and complex JSON key
             * @member
             * @type {Person | null}
             */
            this["Partner"] = null;
        }
        if (!("Friends" in $$source)) {
            /**
             * @member
             * @type {(Person | null)[]}
             */
            this["Friends"] = [];
        }
        if (!("NamingThingsIsHard" in $$source)) {
            /**
             * NamingThingsIsHard is a law of programming
             * @member
             * @type {`${boolean}`}
             */
            this["NamingThingsIsHard"] = "false";
        }
        if (!("StillThere" in $$source)) {
            /**
             * StillThereButRenamed should shadow in Person the other field with same depth and no json tag
             * @member
             * @type {Embedded3 | null}
             */
            this["StillThere"] = null;
        }
        if (!("-" in $$source)) {
            /**
             * StrangeNumber maps to "-"
             * @member
             * @type {number}
             */
            this["-"] = 0;
        }
        if (!("Embedded3" in $$source)) {
            /**
             * Embedded3 should appear with key "Embedded3"
             * @member
             * @type {Embedded3}
             */
            this["Embedded3"] = "";
        }
        if (!("StrangerNumber" in $$source)) {
            /**
             * StrangerNumber is serialized as a string
             * @member
             * @type {`${number}`}
             */
            this["StrangerNumber"] = "0";
        }
        if (/** @type {any} */(false)) {
            /**
             * StrangestString is optional and serialized as a JSON string
             * @member
             * @type {`"${string}"` | undefined}
             */
            this["StrangestString"] = '""';
        }
        if (/** @type {any} */(false)) {
            /**
             * StringStrangest is serialized as a JSON string and optional
             * @member
             * @type {`"${string}"` | undefined}
             */
            this["StringStrangest"] = '""';
        }
        if (/** @type {any} */(false)) {
            /**
             * embedded4 should be optional and appear with key "emb4"
             * @member
             * @type {$internal.embedded4 | undefined}
             */
            this["emb4"] = (new $internal.embedded4());
        }

        Object.assign(this, $$source);
    }

    /**
     * Creates a new Person instance from a string or object.
     * @param {any} [$$source = {}]
     * @returns {Person}
     */
    static createFrom($$source = {}) {
        const $$createField0_0 = $$createType0;
        const $$createField1_0 = $$createType1;
        const $$createField2_0 = $$createType3;
        const $$createField3_0 = $$createType4;
        const $$createField11_0 = $$createType5;
        let $$parsedSource = typeof $$source === 'string' ? JSON.parse($$source) : $$source;
        if ("Titles" in $$parsedSource) {
            $$parsedSource["Titles"] = $$createField0_0($$parsedSource["Titles"]);
        }
        if ("Names" in $$parsedSource) {
            $$parsedSource["Names"] = $$createField1_0($$parsedSource["Names"]);
        }
        if ("Partner" in $$parsedSource) {
            $$parsedSource["Partner"] = $$createField2_0($$parsedSource["Partner"]);
        }
        if ("Friends" in $$parsedSource) {
            $$parsedSource["Friends"] = $$createField3_0($$parsedSource["Friends"]);
        }
        if ("emb4" in $$parsedSource) {
            $$parsedSource["emb4"] = $$createField11_0($$parsedSource["emb4"]);
        }
        return new Person(/** @type {Partial<Person>} */($$parsedSource));
    }
}

/**
 * Title is a title
 * @readonly
 * @enum {string}
 */
export const Title = {
    /**
     * Mister is a title
     */
    Mister: "Mr",
    Miss: "Miss",
    Ms: "Ms",
    Mrs: "Mrs",
    Dr: "Dr",
};

// Private type creation functions
const $$createType0 = $Create.Array($Create.Any);
const $$createType1 = $Create.Array($Create.Any);
const $$createType2 = Person.createFrom;
const $$createType3 = $Create.Nullable($$createType2);
const $$createType4 = $Create.Array($$createType3);
const $$createType5 = $internal.embedded4.createFrom;