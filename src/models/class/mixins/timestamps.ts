import type { Constructor, SelectorOrValue } from "../types";
import { resolveSelector } from "../types";
import type { BaseModel } from "./base";

/**
 * Timestamped behavior interface.
 */
export interface ITimestamped {
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

/**
 * Source data constraint for timestamps mixin.
 */
export interface TimestampedSource {
    createdAt?: string | number | Date;
    updatedAt?: string | number | Date;
    created_at?: string | number | Date;
    updated_at?: string | number | Date;
}

/**
 * Configuration options for the timestamps mixin.
 */
export interface TimestampsOptions<TSource extends TimestampedSource> {
    createdAt?: SelectorOrValue<TSource, string | number | Date>;
    updatedAt?: SelectorOrValue<TSource, string | number | Date>;
}

/**
 * Converts various date formats to a Date object.
 */
function toDate(value: string | number | Date | undefined): Date {
    if (value === undefined) {
        return new Date();
    }
    if (value instanceof Date) {
        return value;
    }
    return new Date(value);
}

/**
 * Mixin that adds timestamp behavior to a model class.
 *
 * @example
 * ```ts
 * const TimestampedTask = WithTimestamps()(TaskBase);
 * ```
 */
export function WithTimestamps<TSource extends TimestampedSource>(
    opts: TimestampsOptions<TSource> = {}
) {
    return <TBase extends Constructor<BaseModel<TSource>>>(Base: TBase) => {
        return class Timestamped extends Base implements ITimestamped {
            get createdAt(): Date {
                if (opts.createdAt !== undefined) {
                    return toDate(resolveSelector(this._source, opts.createdAt));
                }
                return toDate(this._source.createdAt ?? this._source.created_at);
            }

            get updatedAt(): Date {
                if (opts.updatedAt !== undefined) {
                    return toDate(resolveSelector(this._source, opts.updatedAt));
                }
                return toDate(this._source.updatedAt ?? this._source.updated_at);
            }
        };
    };
}

/**
 * Soft deletable behavior interface.
 */
export interface ISoftDeletable {
    readonly deletedAt: Date | null;
    readonly isDeleted: boolean;
}

/**
 * Source constraint for soft deletable mixin.
 */
export interface SoftDeletableSource {
    deletedAt?: string | number | Date | null;
    deleted_at?: string | number | Date | null;
}

/**
 * Mixin that adds soft delete tracking to a model class.
 */
export function WithSoftDelete<TSource extends SoftDeletableSource>() {
    return <TBase extends Constructor<BaseModel<TSource>>>(Base: TBase) => {
        return class SoftDeletable extends Base implements ISoftDeletable {
            get deletedAt(): Date | null {
                const raw = this._source.deletedAt ?? this._source.deleted_at;
                return raw ? toDate(raw) : null;
            }

            get isDeleted(): boolean {
                return this.deletedAt !== null;
            }
        };
    };
}

/**
 * Type guard for timestamped objects.
 */
export function isTimestamped(obj: unknown): obj is ITimestamped {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "createdAt" in obj &&
        "updatedAt" in obj
    );
}

