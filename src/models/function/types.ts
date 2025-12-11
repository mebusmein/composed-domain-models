/**
 * Core types for the composable domain model system.
 *
 * The pattern:
 * 1. Define your API response type (e.g., TaskServerData)
 * 2. Create enhancers that transform/extend the data
 * 3. Compose enhancers to build typed domain models
 * 4. Export partial types (like Watchable) for use in business logic
 */

// Base object type
export type AnyObj = Record<string, unknown>;

/**
 * Converts a union type A | B | C into an intersection A & B & C.
 * Used to merge all enhancer return types into a single object type.
 */
export type UnionToIntersection<U> = (
    U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
    ? I
    : never;

/**
 * Utility to resolve/flatten a type for better IDE display.
 * Turns `{ a: string } & { b: number }` into `{ a: string; b: number }`.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/**
 * An Enhancer is a function that:
 * - Receives the source data (S)
 * - Receives the accumulated object so far (acc)
 * - Receives a build function to create nested/related models
 * - Returns a partial object (R) to merge into the final model
 *
 * @template S - The source data type this enhancer can work with
 * @template R - The return type (partial to add to model)
 * @template BuildOut - The final composed type (for recursive builds)
 */
export type Enhancer<
    S extends object = object,
    R extends AnyObj = AnyObj,
    BuildOut = unknown
> = (source: S, acc: AnyObj, build: (overrides?: AnyObj) => BuildOut) => R;

/**
 * A more flexible enhancer type for use in arrays.
 * Uses 'any' for the source to allow composition of enhancers with different constraints.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEnhancer = Enhancer<any, AnyObj, unknown>;

/**
 * Extract the source type constraint from an enhancer.
 */
export type EnhancerSource<E> = E extends Enhancer<infer S, AnyObj, unknown>
    ? S
    : never;

/**
 * Extract the return type from an enhancer.
 * Uses `infer` for source to handle contravariance correctly.
 */
export type EnhancerReturn<E> = E extends Enhancer<infer _S, infer R, unknown>
    ? R
    : never;

/**
 * Given a tuple of enhancers, get the union of their return types.
 * Must infer source type as well due to function parameter contravariance.
 */
export type ReturnUnionOfEnhancers<E extends readonly AnyEnhancer[]> =
    E[number] extends Enhancer<infer _S, infer R, unknown> ? R : never;

/**
 * Given a tuple of enhancers, compute the intersection of all source constraints.
 * This ensures the source data satisfies ALL enhancer requirements.
 */
export type SourceConstraintOfEnhancers<E extends readonly AnyEnhancer[]> =
    UnionToIntersection<EnhancerSource<E[number]>>;

/**
 * The final composed type: intersection of all enhancer returns, prettified.
 */
export type ComposedFromEnhancers<E extends readonly AnyEnhancer[]> =
    UnionToIntersection<ReturnUnionOfEnhancers<E>>


/**
 * Helper type for selector-or-value pattern.
 * Allows configs to be either a static value or a function that extracts from source.
 */
export type SelectorOrValue<S, R> = R | ((source: S) => R);

/**
 * Resolve a SelectorOrValue to its actual value.
 */
export function resolveSelector<S, R>(
    source: S,
    selectorOrValue: SelectorOrValue<S, R>
): R {
    return typeof selectorOrValue === "function"
        ? (selectorOrValue as (source: S) => R)(source)
        : selectorOrValue;
}
