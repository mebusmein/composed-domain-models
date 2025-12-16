/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */


// =============================================================================
// Combine Function
// =============================================================================

type AnyFn = (arg: any) => any;

type Arg<F> = F extends (arg: infer A) => any ? A : never;
type Ret<F> = F extends (arg: any) => infer R ? R : never;

type CombineArgs<Fns extends AnyFn[]> =
    Fns extends [infer FirstFn extends AnyFn, ...infer RestFns extends AnyFn[]]
    ? [CombineArgs<RestFns>] extends [(arg: infer RestArg) => any]
    ? (arg: Prettify<Arg<FirstFn> & RestArg>) => any
    : (arg: Prettify<Arg<FirstFn>>) => any
    : (arg: {}) => any;

type CombineReturn<Fns extends AnyFn[]> =
    Fns extends [infer FirstFn, ...infer RestFns]
    ? FirstFn extends AnyFn
    ? RestFns extends AnyFn[]
    ? Prettify<Ret<FirstFn> & CombineReturn<RestFns>>
    : Prettify<Ret<FirstFn>>
    : never
    : {};

type Combine<Fns extends AnyFn[]> =
    [CombineArgs<Fns>] extends [(arg: infer A) => any]
    ? (arg: Prettify<A>) => CombineReturn<Fns>
    : never;

/**
 * `Prettify<T>` expands and simplifies inferred intersections of object types, making them easier to read in editor hovers/hints.
 * See: https://stackoverflow.com/questions/61132262/how-to-see-the-real-object-type-of-a-typescript-type
 */
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

export function combine<Fns extends AnyFn[]>(
    ...fns: Fns
): Combine<Fns> {
    return ((arg: any) => {
        return Object.assign({}, ...fns.map(fn => fn(arg)));
    }) as any;
}

// =============================================================================
// With Has Many Function
// =============================================================================

export function withMany<
    TRaw,
    TModel,
    Key extends string = "relations",
    TKey extends string = Key
>(
    key: Key,
    transform: (raw: TRaw) => TModel,
    targetKey?: TKey
): (source: { [k in Key]: TRaw[] }) => { [k in TKey]: TModel[] } {
    return (source) => {
        const raws = (source as any)[key] as TRaw[] | undefined;
        const value = Array.isArray(raws) ? raws.map(transform) : [];
        return { [targetKey || key]: value } as { [K in TKey]: TModel[] };
    };
}

export type WithMany<Key extends string, TModel> =
    Key extends any
    ? { [k in Key]: TModel[] }
    : never;


// helper to create e assert functions that can check that an array is of a certain type.
export function assertArray<T>(array: unknown): array is T[] {
    return Array.isArray(array) && array.every(item => item !== null && item !== undefined);
}

// =============================================================================
// With One Function
// =============================================================================

export type WithOne<Key extends string, TModel> =
    Key extends any
    ? { [k in Key]: TModel }
    : never;

export function withOne<
    TRaw,
    TModel,
    Key extends string = "relation",
    TKey extends string = Key
>(
    key: Key,
    transform: (raw: TRaw) => TModel,
    targetKey?: TKey
): (source: { [k in Key]: TRaw }) => { [k in TKey]: TModel } {
    return (source) => {
        const raw = (source as any)[key] as TRaw | undefined;
        const value = raw ? transform(raw) : undefined;
        return { [targetKey || key]: value } as { [K in TKey]: TModel };
    };
}