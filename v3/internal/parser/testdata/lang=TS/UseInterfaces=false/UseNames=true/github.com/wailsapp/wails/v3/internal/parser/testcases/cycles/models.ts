// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT

import {Types as $Types} from "/wails/runtime.js";

export type Alias = Cyclic | null;

export type Cyclic = { [_: string]: Alias }[];

export type GenericCyclic<T> = {"X": GenericCyclic<T | null> | null, "Y": (T | null)[]}[];