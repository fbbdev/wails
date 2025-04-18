// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

/**
 * GreetService is great
 * @module
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import { Call as $Call, CancellablePromise as $CancellablePromise, Create as $Create } from "/wails/runtime.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as $models from "./models.js";

/**
 * Greet does XYZ
 */
export function Greet(name: string): $CancellablePromise<string> {
    return $Call.ByName("main.GreetService.Greet", name);
}

/**
 * NewPerson creates a new person
 */
export function NewPerson(name: string): $CancellablePromise<$models.Person | null> {
    return $Call.ByName("main.GreetService.NewPerson", name).then(($result: any) => {
        return $$createType1($result);
    });
}

// Private type creation functions
const $$createType0 = $models.Person.createFrom;
const $$createType1 = $Create.Nullable($$createType0);
