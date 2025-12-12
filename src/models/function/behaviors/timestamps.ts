import type { Enhancer, SelectorOrValue } from "../types";
import { resolveSelector } from "../types";

/**
 * Timestamped behavior type.
 * Use this in business logic that works with timestamped entities.
 *
 * @example
 * ```ts
 * function sortByNewest<T extends Timestamped>(items: T[]): T[] {
 *     return [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
 * }
 * ```
 */
export type Timestamped = {
    readonly createdAt: Date;
    readonly updatedAt: Date;
};

/**
 * Source data constraint for timestamps behavior.
 * Accepts various date formats from APIs.
 */
export type TimestampedSource = {
    createdAt?: string | number | Date;
    updatedAt?: string | number | Date;
    created_at?: string | number | Date;
    updated_at?: string | number | Date;
};

/**
 * Configuration options for the timestamps behavior.
 */
export type TimestampsOptions<S extends TimestampedSource> = {
    /** Custom selector for createdAt (defaults to source.createdAt or source.created_at) */
    createdAt?: SelectorOrValue<S, string | number | Date>;
    /** Custom selector for updatedAt (defaults to source.updatedAt or source.updated_at) */
    updatedAt?: SelectorOrValue<S, string | number | Date>;
};

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
 * Adds timestamp behavior to a model.
 *
 * Automatically handles different API formats:
 * - createdAt / created_at
 * - updatedAt / updated_at
 * - String, number (epoch), or Date objects
 *
 * @example
 * ```ts
 * const createTask = (data: TaskServerData) =>
 *     composeModel(data, [
 *         taskBase,
 *         withTimestamps(),
 *     ]);
 * ```
 */
export function withTimestamps<S extends TimestampedSource>(
    opts: TimestampsOptions<S> = {}
): Enhancer<S, Timestamped, unknown> {
    return (source): Timestamped => {
        let createdAtValue: string | number | Date | undefined;
        let updatedAtValue: string | number | Date | undefined;

        if (opts.createdAt !== undefined) {
            createdAtValue = resolveSelector(source, opts.createdAt);
        } else {
            createdAtValue = source.createdAt ?? source.created_at;
        }

        if (opts.updatedAt !== undefined) {
            updatedAtValue = resolveSelector(source, opts.updatedAt);
        } else {
            updatedAtValue = source.updatedAt ?? source.updated_at;
        }

        return {
            createdAt: toDate(createdAtValue),
            updatedAt: toDate(updatedAtValue),
        };
    };
}

/**
 * Extended timestamp type that includes soft delete tracking.
 */
export type SoftDeletable = {
    readonly deletedAt: Date | null;
    readonly isDeleted: boolean;
};

/**
 * Source constraint for soft deletable behavior.
 */
export type SoftDeletableSource = {
    deletedAt?: string | number | Date | null;
    deleted_at?: string | number | Date | null;
};

/**
 * Adds soft delete tracking to a model.
 *
 * @example
 * ```ts
 * const createTask = (data: TaskServerData) =>
 *     composeModel(data, [
 *         taskBase,
 *         withTimestamps(),
 *         withSoftDelete(),
 *     ]);
 *
 * // Filter active items
 * const activeTasks = tasks.filter(t => !t.isDeleted);
 * ```
 */
export function withSoftDelete<
    S extends SoftDeletableSource
>(): Enhancer<S, SoftDeletable, unknown> {
    return (source): SoftDeletable => {
        const rawDeletedAt = source.deletedAt ?? source.deleted_at;
        const deletedAt = rawDeletedAt ? toDate(rawDeletedAt) : null;

        return {
            deletedAt,
            isDeleted: deletedAt !== null,
        };
    };
}

export function isTimestamped(obj: unknown): obj is Timestamped {
    return typeof obj === "object" && obj !== null && "createdAt" in obj && "updatedAt" in obj;
}