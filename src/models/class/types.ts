/**
 * Core types for the class-based composable domain model system.
 *
 * Uses the mixin pattern to compose behaviors into model classes.
 */

/**
 * Generic constructor type for mixin constraints.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = object> = new (...args: any[]) => T;

/**
 * A Mixin is a function that takes a base class and returns an extended class.
 * This allows composing multiple behaviors into a single class.
 */
export type Mixin<TBase extends Constructor, TExtension> = (
    Base: TBase
) => Constructor<InstanceType<TBase> & TExtension> & TBase;

/**
 * Extract the instance type from a mixin function.
 */
export type MixinInstance<M> = M extends Mixin<Constructor, infer T> ? T : never;

/**
 * Converts a union type A | B | C into an intersection A & B & C.
 */
export type UnionToIntersection<U> = (
    U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
    ? I
    : never;

/**
 * Helper type for selector-or-value pattern.
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

