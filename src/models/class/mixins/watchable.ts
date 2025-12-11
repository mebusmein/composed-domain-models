import type { Constructor, SelectorOrValue } from "../types";
import { resolveSelector } from "../types";
import type { BaseModel } from "./base";

/**
 * Watchable behavior interface.
 * Use this in business logic that works with watchable entities.
 */
export interface IWatchable {
    readonly isWatched: boolean;
    readonly watcherType: string;
    readonly watcherId: string;
}

/**
 * Source data constraint for watchable mixin.
 */
export interface WatchableSource {
    isWatched?: boolean;
}

/**
 * Configuration options for the watchable mixin.
 */
export interface WatchableOptions<TSource extends WatchableSource> {
    /** The type of watcher (e.g., "task", "post", "comment") */
    watcherType: SelectorOrValue<TSource, string>;
    /** The ID of the entity being watched */
    watcherId: SelectorOrValue<TSource, string>;
    /** Override the default isWatched value */
    isWatched?: SelectorOrValue<TSource, boolean>;
}

/**
 * Mixin that adds watchable behavior to a model class.
 *
 * @example
 * ```ts
 * const WatchableTask = WithWatchable<TaskSource>({
 *     watcherType: "task",
 *     watcherId: (s) => s.id,
 * })(TaskBase);
 * ```
 */
export function WithWatchable<TSource extends WatchableSource>(
    opts: WatchableOptions<TSource>
) {
    return <TBase extends Constructor<BaseModel<TSource>>>(Base: TBase) => {
        return class Watchable extends Base implements IWatchable {
            get isWatched(): boolean {
                if (opts.isWatched !== undefined) {
                    return resolveSelector(this._source, opts.isWatched);
                }
                return this._source.isWatched ?? false;
            }

            get watcherType(): string {
                return resolveSelector(this._source, opts.watcherType);
            }

            get watcherId(): string {
                return resolveSelector(this._source, opts.watcherId);
            }
        };
    };
}

/**
 * Type guard to check if an object implements IWatchable.
 */
export function isWatchable(obj: unknown): obj is IWatchable {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "isWatched" in obj &&
        "watcherType" in obj &&
        "watcherId" in obj
    );
}

