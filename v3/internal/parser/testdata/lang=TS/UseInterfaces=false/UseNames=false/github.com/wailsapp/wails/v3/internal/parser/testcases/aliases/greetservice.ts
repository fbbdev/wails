// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

/**
 * GreetService is great
 * @module
 */

import {Call as $Call, Types as $Types} from "/wails/runtime.js";

import * as $models from "./models.ts";

/**
 * Get someone
 */
export function Get(aliasValue: $models.Alias): Promise<$models.Person> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1928502664, aliasValue) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType0($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

/**
 * Get someone quite different
 */
export function GetButDifferent(): Promise<$models.GenericPerson<boolean>> & { cancel(): void } {
    let $resultPromise = $Call.ByID(2240931744) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType1($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

/**
 * Greet a lot of unusual things.
 */
export function Greet($0: $models.EmptyAliasStruct, $1: $models.EmptyStruct): Promise<$models.AliasStruct> & { cancel(): void } {
    let $resultPromise = $Call.ByID(1411160069, $0, $1) as any;
    let $typingPromise = $resultPromise.then(($result) => {
        return $$createType5($result);
    }) as any;
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise;
}

// Private type creation functions
const $$createType0 = $models.Person.createFrom;
const $$createType1 = $models.GenericPerson.createFrom($Types.CreateAny);
const $$createType2 = $Types.CreateArray($Types.CreateAny);
const $$createType3 = $Types.CreateArray($Types.CreateAny);
const $$createType4 = $Types.CreateStruct({
    "NoMoreIdeas": $$createType3,
});
const $$createType5 = $Types.CreateStruct({
    "Foo": $$createType2,
    "Other": $$createType4,
});