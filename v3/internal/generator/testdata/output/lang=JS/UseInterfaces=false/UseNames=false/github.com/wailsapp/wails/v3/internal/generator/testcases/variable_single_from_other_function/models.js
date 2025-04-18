// @ts-check
// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import { Create as $Create } from "/wails/runtime.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as services$0 from "./services/models.js";

/**
 * Person is a person!
 * They have a name and an address
 */
export class Person {
    /**
     * Creates a new Person instance.
     * @param {Partial<Person>} [$$source = {}] - The source object to create the Person.
     */
    constructor($$source = {}) {
        if (!("Name" in $$source)) {
            /**
             * @member
             * @type {string}
             */
            this["Name"] = "";
        }
        if (!("Address" in $$source)) {
            /**
             * @member
             * @type {services$0.Address | null}
             */
            this["Address"] = null;
        }

        Object.assign(this, $$source);
    }

    /**
     * Creates a new Person instance from a string or object.
     * @param {any} [$$source = {}]
     * @returns {Person}
     */
    static createFrom($$source = {}) {
        const $$createField1_0 = $$createType1;
        let $$parsedSource = typeof $$source === 'string' ? JSON.parse($$source) : $$source;
        if ("Address" in $$parsedSource) {
            $$parsedSource["Address"] = $$createField1_0($$parsedSource["Address"]);
        }
        return new Person(/** @type {Partial<Person>} */($$parsedSource));
    }
}

// Private type creation functions
const $$createType0 = services$0.Address.createFrom;
const $$createType1 = $Create.Nullable($$createType0);
