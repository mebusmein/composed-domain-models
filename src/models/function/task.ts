import { composeModel, makeEnhancer, createModelFactory } from "./utils/composeModel";
import { withWatchable } from "./behaviors/watchable";
import { withTimestamps } from "./behaviors/timestamps";
import { withAuthor } from "./behaviors/author";

// =============================================================================
// Server Data Types (what the API returns)
// =============================================================================

export type TaskServerData = {
    id: string;
    title: string;
    body: string;
    status: "todo" | "in_progress" | "done";
    priority?: "low" | "medium" | "high";
    // Optional fields from different API endpoints
    isWatched?: boolean;
    createdAt?: string;
    updatedAt?: string;
    author?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    assignee?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    projectId?: string;
    tags?: string[];
};

// =============================================================================
// Base Enhancer (core task properties)
// =============================================================================

/**
 * Core task enhancer - adds fundamental task properties and methods.
 */
export const taskBase = makeEnhancer((source: TaskServerData) => ({
    id: source.id,
    title: source.title,
    body: source.body,
    status: source.status,
    priority: source.priority ?? "medium",
    tags: source.tags ?? [],

    // Computed properties
    get summary() {
        return source.body.length > 140
            ? source.body.slice(0, 140) + "..."
            : source.body;
    },

    get isCompleted() {
        return source.status === "done";
    },

    get isHighPriority() {
        return source.priority === "high";
    },
}));

// =============================================================================
// Optional Enhancers
// =============================================================================

/**
 * Adds assignee info to task.
 */
export const withAssignee = makeEnhancer((source: TaskServerData) => ({
    assignee: source.assignee
        ? {
            id: source.assignee.id,
            name: source.assignee.name,
            avatarUrl: source.assignee.avatarUrl,
        }
        : null,
    get isAssigned() {
        return source.assignee !== undefined;
    },
}));

/**
 * Adds project reference to task.
 */
export const withProject = makeEnhancer((source: TaskServerData) => ({
    projectId: source.projectId ?? null,
    get hasProject() {
        return source.projectId !== undefined;
    },
}));

// =============================================================================
// Composed Types (inferred from enhancer combinations)
// =============================================================================

/** Basic task with just core properties */
export type Task = ReturnType<typeof createTask>;

/** Task with watching capability */
export type WatchableTask = ReturnType<typeof createWatchableTask>;

/** Full task with all relations */
export type FullTask = ReturnType<typeof createFullTask>;

// =============================================================================
// Factory Functions (different compositions for different use cases)
// =============================================================================

/**
 * Creates a basic task model.
 * Use for: list views, minimal data needs.
 */
export function createTask(data: TaskServerData) {
    return composeModel(data, [taskBase]);
}

/**
 * Creates a task with watch functionality.
 * Use for: task lists where users can watch/unwatch.
 */
export function createWatchableTask(data: TaskServerData) {
    return composeModel(data, [
        taskBase,
        withAuthor(),
        withTimestamps(),
        withWatchable({
            watcherType: "task",
            watcherId: (s) => s.id,
        }),
    ]);
}

/**
 * Creates a task with timestamps.
 * Use for: activity feeds, audit logs.
 */
export function createTimestampedTask(data: TaskServerData) {
    return composeModel(data, [taskBase, withTimestamps()]);
}

/**
 * Creates a full task with all relations.
 * Use for: detail views, full task data.
 */
export function createFullTask(data: TaskServerData) {
    return composeModel(data, [
        taskBase,
        withWatchable({
            watcherType: "task",
            watcherId: (s) => s.id,
        }),
        withTimestamps(),
        withAuthor(),
        withAssignee,
        withProject,
    ]);
}

// =============================================================================
// Alternative: Using createModelFactory for reusable factories
// =============================================================================

/**
 * Pre-configured factory for watchable tasks.
 * More efficient when creating many instances.
 */
export const watchableTaskFactory = createModelFactory<TaskServerData>()([
    taskBase,
    withWatchable({
        watcherType: "task",
        watcherId: (s) => s.id,
    }),
]);