import type { Constructor } from "../types";

/**
 * Base model class that all composed models extend from.
 * Stores the original source data for access by mixins.
 */
export class BaseModel<TSource extends object = object> {
    /**
     * The original source data from the API.
     * Protected so mixins can access it.
     */
    protected readonly _source: TSource;

    constructor(source: TSource) {
        this._source = source;
    }

    /**
     * Get the raw source data (useful for serialization).
     */
    toSource(): TSource {
        return this._source;
    }
}

/**
 * Type helper for BaseModel constructor.
 */
export type BaseModelConstructor<TSource extends object> = Constructor<
    BaseModel<TSource>
> & {
    new (source: TSource): BaseModel<TSource>;
};

/**
 * Applies multiple mixins to a base class in sequence.
 *
 * @example
 * ```ts
 * const TaskModel = applyMixins(
 *     TaskBase,
 *     WithWatchable({ watcherType: "task" }),
 *     WithTimestamps(),
 *     WithAuthor(),
 * );
 * ```
 */
export function applyMixins<
    TBase extends Constructor,
    M1 extends (base: TBase) => Constructor
>(Base: TBase, m1: M1): ReturnType<M1>;

export function applyMixins<
    TBase extends Constructor,
    M1 extends (base: TBase) => Constructor,
    M2 extends (base: ReturnType<M1>) => Constructor
>(Base: TBase, m1: M1, m2: M2): ReturnType<M2>;

export function applyMixins<
    TBase extends Constructor,
    M1 extends (base: TBase) => Constructor,
    M2 extends (base: ReturnType<M1>) => Constructor,
    M3 extends (base: ReturnType<M2>) => Constructor
>(Base: TBase, m1: M1, m2: M2, m3: M3): ReturnType<M3>;

export function applyMixins<
    TBase extends Constructor,
    M1 extends (base: TBase) => Constructor,
    M2 extends (base: ReturnType<M1>) => Constructor,
    M3 extends (base: ReturnType<M2>) => Constructor,
    M4 extends (base: ReturnType<M3>) => Constructor
>(Base: TBase, m1: M1, m2: M2, m3: M3, m4: M4): ReturnType<M4>;

export function applyMixins<
    TBase extends Constructor,
    M1 extends (base: TBase) => Constructor,
    M2 extends (base: ReturnType<M1>) => Constructor,
    M3 extends (base: ReturnType<M2>) => Constructor,
    M4 extends (base: ReturnType<M3>) => Constructor,
    M5 extends (base: ReturnType<M4>) => Constructor
>(Base: TBase, m1: M1, m2: M2, m3: M3, m4: M4, m5: M5): ReturnType<M5>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyMixins(Base: Constructor, ...mixins: Array<(base: any) => any>): Constructor {
    return mixins.reduce((acc, mixin) => mixin(acc), Base);
}

/**
 * Creates a factory function for instantiating composed model classes.
 *
 * @example
 * ```ts
 * const createTask = createFactory(TaskModel);
 * const task = createTask(apiData);
 * ```
 */
export function createFactory<
    TSource extends object,
    TClass extends Constructor<BaseModel<TSource>>
>(ModelClass: TClass) {
    return (source: TSource): InstanceType<TClass> => {
        return new ModelClass(source) as InstanceType<TClass>;
    };
}


