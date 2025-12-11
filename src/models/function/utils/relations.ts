import type { Enhancer, SelectorOrValue } from "../types";
import { resolveSelector } from "../types";

/**
 * Configuration for a single relation.
 */
export type RelationConfig<S extends object, T> = {
    /** Selector to get the raw relation data from source */
    from: SelectorOrValue<S, T | T[] | undefined>;
    /** Transform function to convert raw data to domain model */
    transform?: (item: T) => unknown;
};

/**
 * Creates a has-one relation behavior.
 *
 * @example
 * ```ts
 * const withProject = withHasOne<TaskServerData, ProjectServerData, Project>({
 *     from: (s) => s.project,
 *     transform: createProject,
 * });
 * ```
 */
export function withHasOne<
    S extends object,
    TRaw,
    TModel,
    Key extends string = "relation"
>(config: {
    key: Key;
    from: SelectorOrValue<S, TRaw | null | undefined>;
    transform: (raw: TRaw) => TModel;
}): Enhancer<S, { [K in Key]: TModel | null }, unknown> {
    return (source) => {
        const raw = resolveSelector(source, config.from);
        const value = raw ? config.transform(raw) : null;

        return { [config.key]: value } as { [K in Key]: TModel | null };
    };
}

/**
 * Creates a has-many relation behavior.
 *
 * @example
 * ```ts
 * const withComments = withHasMany<PostServerData, CommentServerData, Comment>({
 *     key: "comments",
 *     from: (s) => s.comments,
 *     transform: createComment,
 * });
 * ```
 */
export function withHasMany<
    S extends object,
    TRaw,
    TModel,
    Key extends string = "relations"
>(config: {
    key: Key;
    from: SelectorOrValue<S, TRaw[] | null | undefined>;
    transform: (raw: TRaw) => TModel;
}): Enhancer<S, { [K in Key]: TModel[] }, unknown> {
    return (source) => {
        const raw = resolveSelector(source, config.from);
        const value = raw ? raw.map(config.transform) : [];

        return { [config.key]: value } as { [K in Key]: TModel[] };
    };
}