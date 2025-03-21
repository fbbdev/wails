// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import { Create as $Create } from "/wails/runtime.js";

/**
 * OtherPerson is like a person, but different.
 */
export class OtherPerson<T> {
    /**
     * They have a name as well.
     */
    "Name": string;

    /**
     * But they may have many differences.
     */
    "Differences": T[];

    /** Creates a new OtherPerson instance. */
    constructor($$source: Partial<OtherPerson<T>> = {}) {
        if (!("Name" in $$source)) {
            this["Name"] = "";
        }
        if (!("Differences" in $$source)) {
            this["Differences"] = [];
        }

        Object.assign(this, $$source);
    }

    /**
     * Given creation functions for each type parameter,
     * returns a creation function for a concrete instance
     * of the generic class OtherPerson.
     */
    static createFrom<T = any>($$createParamT: (source: any) => T): ($$source?: any) => OtherPerson<T> {
        const $$createField1_0 = $$createType0($$createParamT);
        return ($$source: any = {}) => {
            let $$parsedSource = typeof $$source === 'string' ? JSON.parse($$source) : $$source;
            if ("Differences" in $$parsedSource) {
                $$parsedSource["Differences"] = $$createField1_0($$parsedSource["Differences"]);
            }
            return new OtherPerson<T>($$parsedSource as Partial<OtherPerson<T>>);
        };
    }
}

// Private type creation functions
const $$createType0 = ($$createParamT: any) => $Create.Array($$createParamT);
