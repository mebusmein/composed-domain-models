import { useState } from "react";
import type { Enhancer, SelectorOrValue } from "../types";
import { resolveSelector } from "../types";

/**
 * Watchable behavior type.
 * Use this in business logic that works with watchable entities.
 *
 * @example
 * ```ts
 * function toggleWatch(entity: Watchable) {
 *     return updateWatchStatus(entity.watcherType, entity.watcherId, !entity.isWatched);
 * }
 * ```
 */
export type Watchable = {
    readonly isWatched: boolean;
    readonly watcherType: string;
    readonly watcherId: string;
};

/**
 * Source data constraint for watchable behavior.
 * The source must have an optional isWatched field.
 */
export type WatchableSource = {
    isWatched?: boolean;
};

/**
 * Configuration options for the watchable behavior.
 */
export type WatchableOptions<S extends WatchableSource> = {
    /** The type of watcher (e.g., "task", "post", "comment") */
    watcherType: SelectorOrValue<S, string>;
    /** The ID of the entity being watched */
    watcherId: SelectorOrValue<S, string>;
    /** Override the default isWatched value */
    isWatched?: SelectorOrValue<S, boolean>;
};

/**
 * Adds watchable behavior to a model.
 *
 * The isWatched state is read from:
 * 1. The options.isWatched if provided
 * 2. The accumulated state (acc.isWatched)
 * 3. The source data (source.isWatched)
 * 4. Falls back to false
 *
 * @example
 * ```ts
 * const createTask = (data: TaskServerData) =>
 *     composeModel(data, [
 *         taskBase,
 *         withWatchable({
 *             watcherType: "task",
 *             watcherId: (s) => s.id,
 *         }),
 *     ]);
 * ```
 */
export function withWatchable<S extends WatchableSource>(
    opts: WatchableOptions<S>
): Enhancer<S, Watchable, unknown> {
    return (source, acc): Watchable => {
        const watcherType = resolveSelector(source, opts.watcherType);
        const watcherId = resolveSelector(source, opts.watcherId);

        // Priority: options > acc > source > default
        const isWatched =
            opts.isWatched !== undefined
                ? resolveSelector(source, opts.isWatched)
                : (acc.isWatched as boolean | undefined) ??
                source.isWatched ??
                false;

        return {
            isWatched,
            watcherType,
            watcherId,
        }
    };
}

export function useWatchableToggle(watchable: Watchable) {
    const [isWatched, _setIsWatched] = useState(watchable.isWatched);

    const setIsWatched = (isWatched: boolean) => {
        _setIsWatched(isWatched);
        console.log(`Setting watchable to ${isWatched} for ${watchable.watcherType}:${watchable.watcherId}`);
    };

    return {
        isWatched,
        setIsWatched,
    };
}

export function isWatchable(watchable: unknown): watchable is Watchable {
    return typeof watchable === "object" && watchable !== null && "isWatched" in watchable;
}
