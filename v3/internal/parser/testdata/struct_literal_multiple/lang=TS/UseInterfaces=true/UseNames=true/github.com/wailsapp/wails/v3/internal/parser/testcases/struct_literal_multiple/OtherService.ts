// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

import {Call as $Call, Create as $Create} from "@wailsio/runtime";

export function Hello(): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.OtherService.Hello");
    return $resultPromise as any;
}