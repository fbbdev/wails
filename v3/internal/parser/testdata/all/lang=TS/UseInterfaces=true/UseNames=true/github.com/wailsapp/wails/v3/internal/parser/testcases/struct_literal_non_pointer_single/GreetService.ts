// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

/**
 * GreetService is great
 * @module
 */

import {Call as $Call, Create as $Create} from "@wailsio/runtime";

import * as $models from "./models.ts";

export function ArrayInt($in: number[]): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.ArrayInt", $in);
    return $resultPromise as any;
}

export function BoolInBoolOut($in: boolean): Promise<boolean> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.BoolInBoolOut", $in);
    return $resultPromise as any;
}

export function Float32InFloat32Out($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Float32InFloat32Out", $in);
    return $resultPromise as any;
}

export function Float64InFloat64Out($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Float64InFloat64Out", $in);
    return $resultPromise as any;
}

/**
 * Greet someone
 */
export function Greet(name: string): Promise<string> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Greet", name);
    return $resultPromise as any;
}

export function Int16InIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Int16InIntOut", $in);
    return $resultPromise as any;
}

export function Int16PointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Int16PointerInAndOutput", $in);
    return $resultPromise as any;
}

export function Int32InIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Int32InIntOut", $in);
    return $resultPromise as any;
}

export function Int32PointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Int32PointerInAndOutput", $in);
    return $resultPromise as any;
}

export function Int64InIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Int64InIntOut", $in);
    return $resultPromise as any;
}

export function Int64PointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Int64PointerInAndOutput", $in);
    return $resultPromise as any;
}

export function Int8InIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Int8InIntOut", $in);
    return $resultPromise as any;
}

export function Int8PointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.Int8PointerInAndOutput", $in);
    return $resultPromise as any;
}

export function IntInIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.IntInIntOut", $in);
    return $resultPromise as any;
}

export function IntPointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.IntPointerInAndOutput", $in);
    return $resultPromise as any;
}

export function IntPointerInputNamedOutputs($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.IntPointerInputNamedOutputs", $in);
    return $resultPromise as any;
}

export function MapIntInt($in: { [_: `${number}`]: number } | null): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.MapIntInt", $in);
    return $resultPromise as any;
}

export function MapIntPointerInt($in: { [_: string]: number } | null): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.MapIntPointerInt", $in);
    return $resultPromise as any;
}

export function MapIntSliceInt($in: { [_: `${number}`]: number[] | null } | null): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.MapIntSliceInt", $in);
    return $resultPromise as any;
}

export function MapIntSliceIntInMapIntSliceIntOut($in: { [_: `${number}`]: number[] | null } | null): Promise<{ [_: `${number}`]: number[] | null } | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.MapIntSliceIntInMapIntSliceIntOut", $in);
    return $resultPromise as any;
}

export function NoInputsStringOut(): Promise<string> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.NoInputsStringOut");
    return $resultPromise as any;
}

export function PointerBoolInBoolOut($in: boolean | null): Promise<boolean | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.PointerBoolInBoolOut", $in);
    return $resultPromise as any;
}

export function PointerFloat32InFloat32Out($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.PointerFloat32InFloat32Out", $in);
    return $resultPromise as any;
}

export function PointerFloat64InFloat64Out($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.PointerFloat64InFloat64Out", $in);
    return $resultPromise as any;
}

export function PointerMapIntInt($in: { [_: `${number}`]: number } | null): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.PointerMapIntInt", $in);
    return $resultPromise as any;
}

export function PointerStringInStringOut($in: string | null): Promise<string | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.PointerStringInStringOut", $in);
    return $resultPromise as any;
}

export function StringArrayInputNamedOutput($in: string[] | null): Promise<string[] | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.StringArrayInputNamedOutput", $in);
    return $resultPromise as any;
}

export function StringArrayInputNamedOutputs($in: string[] | null): Promise<string[] | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.StringArrayInputNamedOutputs", $in);
    return $resultPromise as any;
}

export function StringArrayInputStringArrayOut($in: string[] | null): Promise<string[] | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.StringArrayInputStringArrayOut", $in);
    return $resultPromise as any;
}

export function StringArrayInputStringOut($in: string[] | null): Promise<string> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.StringArrayInputStringOut", $in);
    return $resultPromise as any;
}

export function StructInputStructOutput($in: $models.Person): Promise<$models.Person> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.StructInputStructOutput", $in);
    return $resultPromise as any;
}

export function StructPointerInputErrorOutput($in: $models.Person | null): Promise<void> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.StructPointerInputErrorOutput", $in);
    return $resultPromise as any;
}

export function StructPointerInputStructPointerOutput($in: $models.Person | null): Promise<$models.Person | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.StructPointerInputStructPointerOutput", $in);
    return $resultPromise as any;
}

export function UInt16InUIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UInt16InUIntOut", $in);
    return $resultPromise as any;
}

export function UInt16PointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UInt16PointerInAndOutput", $in);
    return $resultPromise as any;
}

export function UInt32InUIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UInt32InUIntOut", $in);
    return $resultPromise as any;
}

export function UInt32PointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UInt32PointerInAndOutput", $in);
    return $resultPromise as any;
}

export function UInt64InUIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UInt64InUIntOut", $in);
    return $resultPromise as any;
}

export function UInt64PointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UInt64PointerInAndOutput", $in);
    return $resultPromise as any;
}

export function UInt8InUIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UInt8InUIntOut", $in);
    return $resultPromise as any;
}

export function UInt8PointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UInt8PointerInAndOutput", $in);
    return $resultPromise as any;
}

export function UIntInUIntOut($in: number): Promise<number> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UIntInUIntOut", $in);
    return $resultPromise as any;
}

export function UIntPointerInAndOutput($in: number | null): Promise<number | null> & { cancel(): void } {
    let $resultPromise = $Call.ByName("main.GreetService.UIntPointerInAndOutput", $in);
    return $resultPromise as any;
}