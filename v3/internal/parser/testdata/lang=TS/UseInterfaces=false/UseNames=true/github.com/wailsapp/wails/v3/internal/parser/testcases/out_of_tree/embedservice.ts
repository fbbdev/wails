// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

/**
 * EmbedService is tricky.
 * @module
 */

import {Call as $Call, Create as $Create} from "/wails/runtime.js";

import * as nobindingshere$0 from "../no_bindings_here/models.ts";

/**
 * LikeThisOne is an example method that does nothing.
 */
export function LikeThisOne(): Promise<[nobindingshere$0.Person, nobindingshere$0.Impersonator, nobindingshere$0.HowDifferent<boolean>, nobindingshere$0.PrivatePerson]> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.EmbedService.LikeThisOne");
    let $typingPromise = $resultPromise.then(($result) => {
        $result[0] = $$createType0($result[0]);
        $result[1] = $$createType1($result[1]);
        $result[2] = $$createType2($result[2]);
        $result[3] = $$createType3($result[3]);
        return $result;
    });
    $typingPromise.cancel = $resultPromise.cancel.bind($resultPromise);
    return $typingPromise as any;
}

/**
 * LikeThisOtherOne does nothing as well, but is different.
 */
export function LikeThisOtherOne(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.EmbedService.LikeThisOtherOne");
    return $resultPromise as any;
}

// Private type creation functions
const $$createType0 = nobindingshere$0.Person.createFrom;
const $$createType1 = nobindingshere$0.Impersonator.createFrom;
const $$createType2 = nobindingshere$0.HowDifferent.createFrom($Create.Any);
const $$createType3 = nobindingshere$0.PrivatePerson.createFrom;