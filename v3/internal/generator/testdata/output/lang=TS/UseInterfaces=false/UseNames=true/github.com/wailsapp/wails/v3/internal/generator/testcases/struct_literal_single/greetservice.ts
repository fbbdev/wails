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

export function ArrayInt($in: number[]): $CancellablePromise<void> {
    return $Call.ByName("main.GreetService.ArrayInt", $in);
}

export function BoolInBoolOut($in: boolean): $CancellablePromise<boolean> {
    return $Call.ByName("main.GreetService.BoolInBoolOut", $in);
}

export function Float32InFloat32Out($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.Float32InFloat32Out", $in);
}

export function Float64InFloat64Out($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.Float64InFloat64Out", $in);
}

/**
 * Greet someone
 */
export function Greet(name: string): $CancellablePromise<string> {
    return $Call.ByName("main.GreetService.Greet", name);
}

export function Int16InIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.Int16InIntOut", $in);
}

export function Int16PointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.Int16PointerInAndOutput", $in);
}

export function Int32InIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.Int32InIntOut", $in);
}

export function Int32PointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.Int32PointerInAndOutput", $in);
}

export function Int64InIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.Int64InIntOut", $in);
}

export function Int64PointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.Int64PointerInAndOutput", $in);
}

export function Int8InIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.Int8InIntOut", $in);
}

export function Int8PointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.Int8PointerInAndOutput", $in);
}

export function IntInIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.IntInIntOut", $in);
}

export function IntPointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.IntPointerInAndOutput", $in);
}

export function IntPointerInputNamedOutputs($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.IntPointerInputNamedOutputs", $in);
}

export function MapIntInt($in: { [_: `${number}`]: number }): $CancellablePromise<void> {
    return $Call.ByName("main.GreetService.MapIntInt", $in);
}

export function MapIntIntPointer($in: { [_: `${number}`]: number | null }): $CancellablePromise<void> {
    return $Call.ByName("main.GreetService.MapIntIntPointer", $in);
}

export function MapIntSliceInt($in: { [_: `${number}`]: number[] }): $CancellablePromise<void> {
    return $Call.ByName("main.GreetService.MapIntSliceInt", $in);
}

export function MapIntSliceIntInMapIntSliceIntOut($in: { [_: `${number}`]: number[] }): $CancellablePromise<{ [_: `${number}`]: number[] }> {
    return $Call.ByName("main.GreetService.MapIntSliceIntInMapIntSliceIntOut", $in).then(($result: any) => {
        return $$createType1($result);
    });
}

export function NoInputsStringOut(): $CancellablePromise<string> {
    return $Call.ByName("main.GreetService.NoInputsStringOut");
}

export function PointerBoolInBoolOut($in: boolean | null): $CancellablePromise<boolean | null> {
    return $Call.ByName("main.GreetService.PointerBoolInBoolOut", $in);
}

export function PointerFloat32InFloat32Out($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.PointerFloat32InFloat32Out", $in);
}

export function PointerFloat64InFloat64Out($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.PointerFloat64InFloat64Out", $in);
}

export function PointerMapIntInt($in: { [_: `${number}`]: number } | null): $CancellablePromise<void> {
    return $Call.ByName("main.GreetService.PointerMapIntInt", $in);
}

export function PointerStringInStringOut($in: string | null): $CancellablePromise<string | null> {
    return $Call.ByName("main.GreetService.PointerStringInStringOut", $in);
}

export function StringArrayInputNamedOutput($in: string[]): $CancellablePromise<string[]> {
    return $Call.ByName("main.GreetService.StringArrayInputNamedOutput", $in).then(($result: any) => {
        return $$createType2($result);
    });
}

export function StringArrayInputNamedOutputs($in: string[]): $CancellablePromise<string[]> {
    return $Call.ByName("main.GreetService.StringArrayInputNamedOutputs", $in).then(($result: any) => {
        return $$createType2($result);
    });
}

export function StringArrayInputStringArrayOut($in: string[]): $CancellablePromise<string[]> {
    return $Call.ByName("main.GreetService.StringArrayInputStringArrayOut", $in).then(($result: any) => {
        return $$createType2($result);
    });
}

export function StringArrayInputStringOut($in: string[]): $CancellablePromise<string> {
    return $Call.ByName("main.GreetService.StringArrayInputStringOut", $in);
}

export function StructInputStructOutput($in: $models.Person): $CancellablePromise<$models.Person> {
    return $Call.ByName("main.GreetService.StructInputStructOutput", $in).then(($result: any) => {
        return $$createType3($result);
    });
}

export function StructPointerInputErrorOutput($in: $models.Person | null): $CancellablePromise<void> {
    return $Call.ByName("main.GreetService.StructPointerInputErrorOutput", $in);
}

export function StructPointerInputStructPointerOutput($in: $models.Person | null): $CancellablePromise<$models.Person | null> {
    return $Call.ByName("main.GreetService.StructPointerInputStructPointerOutput", $in).then(($result: any) => {
        return $$createType4($result);
    });
}

export function UInt16InUIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.UInt16InUIntOut", $in);
}

export function UInt16PointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.UInt16PointerInAndOutput", $in);
}

export function UInt32InUIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.UInt32InUIntOut", $in);
}

export function UInt32PointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.UInt32PointerInAndOutput", $in);
}

export function UInt64InUIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.UInt64InUIntOut", $in);
}

export function UInt64PointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.UInt64PointerInAndOutput", $in);
}

export function UInt8InUIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.UInt8InUIntOut", $in);
}

export function UInt8PointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.UInt8PointerInAndOutput", $in);
}

export function UIntInUIntOut($in: number): $CancellablePromise<number> {
    return $Call.ByName("main.GreetService.UIntInUIntOut", $in);
}

export function UIntPointerInAndOutput($in: number | null): $CancellablePromise<number | null> {
    return $Call.ByName("main.GreetService.UIntPointerInAndOutput", $in);
}

// Private type creation functions
const $$createType0 = $Create.Array($Create.Any);
const $$createType1 = $Create.Map($Create.Any, $$createType0);
const $$createType2 = $Create.Array($Create.Any);
const $$createType3 = $models.Person.createFrom;
const $$createType4 = $Create.Nullable($$createType3);
