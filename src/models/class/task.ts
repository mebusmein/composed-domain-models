import {
    BaseModel,
    applyMixins,
    createFactory,
    WithWatchable,
    WithTimestamps,
    WithAuthor,
    type IWatchable,
    type ITimestamped,
    type IAuthored,
    type WatchableSource,
    type TimestampedSource,
    type AuthoredSource,
} from "./mixins";

// =============================================================================
// Server Data Types (what the API returns)
// =============================================================================

export interface TaskServerData
    extends WatchableSource,
        TimestampedSource,
        AuthoredSource {
    id: string;
    title: string;
    body: string;
    status: "todo" | "in_progress" | "done";
    priority?: "low" | "medium" | "high";
    tags?: string[];
    assignee?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    projectId?: string;
}

// =============================================================================
// Base Task Class
// =============================================================================

/**
 * Base Task class with core properties.
 * This is the foundation that mixins extend.
 */
export class TaskBase extends BaseModel<TaskServerData> {
    get id(): string {
        return this._source.id;
    }

    get title(): string {
        return this._source.title;
    }

    get body(): string {
        return this._source.body;
    }

    get status(): "todo" | "in_progress" | "done" {
        return this._source.status;
    }

    get priority(): "low" | "medium" | "high" {
        return this._source.priority ?? "medium";
    }

    get tags(): string[] {
        return this._source.tags ?? [];
    }

    // Computed properties
    get summary(): string {
        return this.body.length > 140
            ? this.body.slice(0, 140) + "..."
            : this.body;
    }

    get isCompleted(): boolean {
        return this.status === "done";
    }

    get isHighPriority(): boolean {
        return this.priority === "high";
    }
}

// =============================================================================
// Composed Model Classes
// =============================================================================

/**
 * Basic Task - just the core properties.
 */
export const Task = TaskBase;
export type Task = InstanceType<typeof Task>;

/**
 * Task with watchable behavior.
 */
export const WatchableTask = applyMixins(
    TaskBase,
    WithWatchable<TaskServerData>({
        watcherType: "task",
        watcherId: (s) => s.id,
    })
);
export type WatchableTask = InstanceType<typeof WatchableTask>;

/**
 * Task with timestamps.
 */
export const TimestampedTask = applyMixins(
    TaskBase,
    WithTimestamps<TaskServerData>()
);
export type TimestampedTask = InstanceType<typeof TimestampedTask>;

/**
 * Task with author info.
 */
export const AuthoredTask = applyMixins(
    TaskBase,
    WithAuthor<TaskServerData>()
);
export type AuthoredTask = InstanceType<typeof AuthoredTask>;

/**
 * Full Task with all behaviors.
 * The type is: TaskBase & IWatchable & ITimestamped & IAuthored
 */
export const FullTask = applyMixins(
    TaskBase,
    WithWatchable<TaskServerData>({
        watcherType: "task",
        watcherId: (s) => s.id,
    }),
    WithTimestamps<TaskServerData>(),
    WithAuthor<TaskServerData>()
);
export type FullTask = InstanceType<typeof FullTask>;

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Creates a basic Task instance.
 */
export const createTask = createFactory<TaskServerData, typeof Task>(Task);

/**
 * Creates a WatchableTask instance.
 */
export const createWatchableTask = createFactory<
    TaskServerData,
    typeof WatchableTask
>(WatchableTask);

/**
 * Creates a TimestampedTask instance.
 */
export const createTimestampedTask = createFactory<
    TaskServerData,
    typeof TimestampedTask
>(TimestampedTask);

/**
 * Creates a FullTask instance with all behaviors.
 */
export const createFullTask = createFactory<TaskServerData, typeof FullTask>(
    FullTask
);

// =============================================================================
// Business Logic Examples (using behavior interfaces)
// =============================================================================

/**
 * Works with ANY model that implements IWatchable.
 */
export function toggleWatch(entity: IWatchable): void {
    console.log(
        `Toggling watch for ${entity.watcherType}:${entity.watcherId} (currently: ${entity.isWatched})`
    );
}

/**
 * Works with ANY model that implements ITimestamped.
 */
export function formatDate(entity: ITimestamped): string {
    return `Created: ${entity.createdAt.toLocaleDateString()}`;
}

/**
 * Works with ANY model that implements IAuthored.
 */
export function showAuthor(entity: IAuthored): string {
    return `By ${entity.author.name}`;
}


