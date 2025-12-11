import type {
    AnyObj,
    Enhancer,
    AnyEnhancer,
    ComposedFromEnhancers,
    SourceConstraintOfEnhancers,
} from "../types";

/**
 * Creates a typed enhancer function.
 *
 * Use this to define enhancers with proper type inference:
 * - The source type S is inferred from your function parameter
 * - The return type R is inferred from what you return
 *
 * @example
 * ```ts
 * const taskBase = makeEnhancer((source: TaskServerData, acc) => ({
 *     id: source.id,
 *     title: source.title,
 *     summary: () => source.body.slice(0, 140),
 * }));
 * ```
 */
export function makeEnhancer<S extends object, R extends AnyObj>(
    fn: (
        source: S,
        acc: AnyObj,
        build: (overrides?: AnyObj) => unknown
    ) => R
): Enhancer<S, R, unknown> {
    return fn as Enhancer<S, R, unknown>;
}

/**
 * Creates a configurable enhancer factory.
 *
 * Use this when your enhancer needs configuration options:
 * - Options can use the SelectorOrValue pattern for flexibility
 * - The source constraint can be specified or inferred
 *
 * @example
 * ```ts
 * const withWatchable = makeBehavior<{ isWatched?: boolean }, Watchable>(
 *     (opts) => (source, acc) => ({
 *         isWatched: source.isWatched ?? false,
 *         watcherType: opts.watcherType,
 *     })
 * );
 * ```
 */
export function makeBehavior<
    SourceConstraint extends object,
    ReturnType extends AnyObj,
    Options = void
>(
    factory: Options extends void
        ? () => Enhancer<SourceConstraint, ReturnType, unknown>
        : (options: Options) => Enhancer<SourceConstraint, ReturnType, unknown>
): typeof factory {
    return factory;
}

/**
 * Composes multiple enhancers into a single domain model.
 *
 * The source data flows through each enhancer in order.
 * Each enhancer receives:
 * - `source`: The original API data
 * - `acc`: Accumulated properties from previous enhancers
 * - `build`: Function to create the final object (for nested models)
 *
 * The final type is automatically inferred as the intersection
 * of all enhancer return types.
 *
 * @example
 * ```ts
 * const task = composeModel(apiData, [
 *     taskBase,
 *     withWatchable({ watcherType: "task" }),
 *     withTimestamps(),
 * ]);
 * // task is typed as TaskBase & Watchable & Timestamped
 * ```
 */
export function composeModel<
    S extends object,
    const E extends readonly AnyEnhancer[]
>(
    source: S & SourceConstraintOfEnhancers<E>,
    enhancers: E
): ComposedFromEnhancers<E> {
    function build(overrides: AnyObj = {}): ComposedFromEnhancers<E> {
        let acc: AnyObj = { ...overrides };

        // Recursive build for nested model creation
        const buildRecursive = (moreOverrides: AnyObj = {}) =>
            build({ ...acc, ...moreOverrides });

        for (const enhancer of enhancers) {
            const partial = enhancer(source, acc, buildRecursive) || {};
            acc = { ...acc, ...partial };
        }

        return acc as ComposedFromEnhancers<E>;
    }

    return build();
}

/**
 * Creates a model factory function for a specific model type.
 *
 * This is useful when you want to create multiple instances
 * of the same model composition.
 *
 * @example
 * ```ts
 * const createTask = createModelFactory<TaskServerData>()([
 *     taskBase,
 *     withWatchable({ watcherType: "task" }),
 * ]);
 *
 * const task1 = createTask(apiData1);
 * const task2 = createTask(apiData2);
 * ```
 */
export function createModelFactory<S extends object>() {
    return function <const E extends readonly AnyEnhancer[]>(enhancers: E) {
        return function (
            source: S & SourceConstraintOfEnhancers<E>
        ): ComposedFromEnhancers<E> {
            return composeModel(source, enhancers);
        };
    };
}
