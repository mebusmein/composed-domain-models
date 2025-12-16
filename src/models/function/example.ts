/**
 * Example: Using the Curried composeModel Pattern
 *
 * This file demonstrates how the improved API works with
 * automatic source and output type inference.
 */

import { composeModel, extractor } from "./compose";
import {
  createTask,
  createWatchableTask,
  createFullTask,
  type TaskSource,
  type WatchableTaskSource,
  type FullTaskSource,
} from "./models/task";

// =============================================================================
// How Source Types Are Inferred
// =============================================================================

/**
 * Each extractor defines what it needs from the source.
 * When composed, all requirements are merged into an intersection type.
 */

// Extractor 1: Needs { id: string }
const withId = extractor<{ id: string }, { id: string }>(
  (source) => ({ id: source.id })
);

// Extractor 2: Needs { title: string }
const withTitle = extractor<{ title: string }, { title: string }>(
  (source) => ({ title: source.title })
);

type CreatedAtSource = {
  createdAt: string;
} | {
  created_at: string;
};

// Extractor 3: Needs { c reatedAt: string }
const withCreated = extractor<CreatedAtSource, { createdAt: Date }>(
  (source) => ({ createdAt: new Date(source.createdAt ?? source.created_at) })
);

// Composed factory - source type is { id: string } & { title: string } & { createdAt: string }
const createItem = composeModel(withId, withTitle, withCreated);

// TypeScript enforces the complete source type:
const item = createItem({
  id: "1",
  title: "Test",
  createdAt: "2024-01-01",
});

// Output type is { id: string } & { title: string } & { createdAt: Date }
console.log(item.id);        // string
console.log(item.title);     // string
console.log(item.createdAt); // Date

// =============================================================================
// Using the Task Factories
// =============================================================================

// Basic task - only needs TaskBaseSource
const basicTask = createTask({
  id: "1",
  title: "Fix bug",
  body: "The login page has an issue",
  status: "todo",
  // priority and tags are optional
});

console.log(basicTask.id);          // "1"
console.log(basicTask.summary);     // "The login page has an issue"
console.log(basicTask.isCompleted); // false

// Watchable task - needs TaskBaseSource + TimestampedSource + AuthoredSource + WatchableSource
const watchableTask = createWatchableTask({
  id: "2",
  title: "Add feature",
  body: "Users want dark mode",
  status: "in_progress",
  priority: "high",
  // Timestamps (can be camelCase or snake_case)
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-02T15:30:00Z",
  // Author (supports multiple patterns)
  author: {
    id: "user1",
    name: "Alice",
    avatarUrl: "https://example.com/alice.jpg",
  },
  // Watchable
  isWatched: true,
});

console.log(watchableTask.author.name);        // "Alice"
console.log(watchableTask.createdAt);          // Date object
console.log(watchableTask.isWatched);          // true
console.log(watchableTask.watcherType);        // "task"

// Full task - needs everything
const fullTask = createFullTask({
  id: "3",
  title: "Refactor",
  body: "Clean up the codebase",
  status: "done",
  priority: "low",
  tags: ["tech-debt", "cleanup"],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-10",
  author: { id: "user2", name: "Bob" },
  isWatched: false,
  // Additional fields for full task
  assignee: { id: "user3", name: "Charlie" },
  projectId: "project-123",
});

console.log(fullTask.assignee?.name);  // "Charlie"
console.log(fullTask.isAssigned);      // true
console.log(fullTask.projectId);       // "project-123"
console.log(fullTask.hasProject);      // true

// =============================================================================
// Source Type Inference Demo
// =============================================================================

/**
 * The source types are automatically inferred.
 * You can use them for API response typing.
 */

// This is what createTask expects:
const taskSource: TaskSource = {
  id: "1",
  title: "Task",
  body: "Description",
  status: "todo",
};

// This is what createWatchableTask expects (includes timestamps, author, watchable):
const watchableTaskSource: WatchableTaskSource = {
  id: "1",
  title: "Task",
  body: "Description",
  status: "todo",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  // author is optional in AuthoredSource, but if provided, id is required
  author: { id: "user1" },
};

// This is what createFullTask expects (everything):
const fullTaskSource: FullTaskSource = {
  id: "1",
  title: "Task",
  body: "Description",
  status: "todo",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  author: { id: "user1" },
  // assignee and projectId are optional
};

// =============================================================================
// Extending Factories
// =============================================================================

import { withTimestamps } from "./extractors";

// Extend the basic task factory with timestamps
const createTaskWithTimestamps = createTask.extend(withTimestamps());

// Now it requires TaskBaseSource + TimestampedSource
const taskWithTimestamps = createTaskWithTimestamps({
  id: "1",
  title: "Task",
  body: "Description",
  status: "todo",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
});

console.log(taskWithTimestamps.createdAt); // Date

// =============================================================================
// Type Safety Examples
// =============================================================================

// ❌ This would be a compile error - missing required 'id' field
// const invalidTask = createTask({
//   title: "Task",
//   body: "Description",
//   status: "todo",
// });

// ❌ This would be a compile error - status must be "todo" | "in_progress" | "done"
// const invalidStatus = createTask({
//   id: "1",
//   title: "Task",
//   body: "Description",
//   status: "invalid",
// });

// ❌ This would be a compile error - createdAt required for watchable task
// const missingTimestamp = createWatchableTask({
//   id: "1",
//   title: "Task",
//   body: "Description",
//   status: "todo",
//   author: { id: "user1" },
//   // Missing createdAt and updatedAt!
// });
