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
import * as nobindingshere$0 from "../no_bindings_here/models.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unused imports
import * as $models from "./models.js";

/**
 * Get someone.
 */
export function Get(aliasValue: $models.Alias): $CancellablePromise<$models.Person> {
    return $Call.ByID(1928502664, aliasValue).then(($result: any) => {
        return $$createType0($result);
    });
}

/**
 * Apparently, aliases are all the rage right now.
 */
export function GetButAliased(p: $models.AliasedPerson): $CancellablePromise<$models.StrangelyAliasedPerson> {
    return $Call.ByID(1896499664, p).then(($result: any) => {
        return $$createType0($result);
    });
}

/**
 * Get someone quite different.
 */
export function GetButDifferent(): $CancellablePromise<$models.GenericPerson<boolean>> {
    return $Call.ByID(2240931744).then(($result: any) => {
        return $$createType1($result);
    });
}

export function GetButForeignPrivateAlias(): $CancellablePromise<nobindingshere$0.PrivatePerson> {
    return $Call.ByID(643456960).then(($result: any) => {
        return $$createType2($result);
    });
}

export function GetButGenericAliases(): $CancellablePromise<$models.AliasGroup> {
    return $Call.ByID(914093800).then(($result: any) => {
        return $$createType3($result);
    });
}

/**
 * Greet a lot of unusual things.
 */
export function Greet($0: $models.EmptyAliasStruct, $1: $models.EmptyStruct): $CancellablePromise<$models.AliasStruct> {
    return $Call.ByID(1411160069, $0, $1).then(($result: any) => {
        return $$createType7($result);
    });
}

// Private type creation functions
const $$createType0 = $models.Person.createFrom;
const $$createType1 = $models.GenericPerson.createFrom($Create.Any);
const $$createType2 = nobindingshere$0.personImpl.createFrom;
const $$createType3 = $models.AliasGroup.createFrom;
const $$createType4 = $Create.Array($Create.Any);
const $$createType5 = $Create.Array($Create.Any);
const $$createType6 = $Create.Struct({
    "NoMoreIdeas": $$createType5,
});
const $$createType7 = $Create.Struct({
    "Foo": $$createType4,
    "Other": $$createType6,
});
