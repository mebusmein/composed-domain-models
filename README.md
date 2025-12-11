# Composable Domain Models

A comparison of two approaches for building type-safe, composable domain models from backend API responses in TypeScript/React applications.

## Overview

This project demonstrates two patterns for transforming raw API data into rich, typed domain models with reusable behaviors:

1. **Class-Based Mixins** (`src/models/class/`) - OOP approach using TypeScript class mixins
2. **Functional Composition** (`src/models/function/`) - FP approach using enhancer functions

Both approaches solve the same problem: how to map untyped or loosely-typed API responses into strongly-typed domain objects with computed properties and reusable behaviors.

## Quick Start

```bash
npm install
npm run dev
```

## The Problem

Traditional domain model classes suffer from:

- **Massive boilerplate** - getter/setter for every property
- **Weak typing** - `fromJson(json: any)` loses type safety
- **Poor composability** - inheritance-only, can't mix behaviors
- **Mixed concerns** - data mapping, access, and business logic in one class

```typescript
// Traditional approach - lots of boilerplate
class Note extends TimeStamps {
  private id: string;
  private text: string;
  // ... 10 more fields

  fromJson(json: any): Note {
    this.id = json.id ? json.id : null;
    // ... repeated for each field
  }

  getId(): string {
    return this.id;
  }
  setId(value: string) {
    this.id = value;
  }
  // ... getter/setter for each field
}
```

## Solution 1: Class-Based Mixins

Uses TypeScript's mixin pattern to compose behaviors into classes.

### Structure

```
src/models/class/
├── mixins/
│   ├── base.ts        # BaseModel + applyMixins helper
│   ├── author.ts      # WithAuthor() mixin
│   ├── timestamps.ts  # WithTimestamps() mixin
│   └── watchable.ts   # WithWatchable() mixin
├── task.ts            # Task model compositions
└── post.ts            # Post model compositions
```

### Usage

```typescript
import {
  BaseModel,
  applyMixins,
  WithTimestamps,
  WithAuthor,
  WithWatchable,
} from "./mixins";

// Define your API response type
interface TaskServerData {
  id: string;
  title: string;
  created_at: string;
  author?: { id: string; name: string };
  isWatched?: boolean;
}

// Create base class
class TaskBase extends BaseModel<TaskServerData> {
  get id() {
    return this._source.id;
  }
  get title() {
    return this._source.title;
  }
}

// Compose with mixins
const FullTask = applyMixins(
  TaskBase,
  WithTimestamps<TaskServerData>(),
  WithAuthor<TaskServerData>(),
  WithWatchable<TaskServerData>({
    watcherType: "task",
    watcherId: (s) => s.id,
  })
);

// Create instances
const task = new FullTask(apiData);
console.log(task.title, task.createdAt, task.author.name);
```

### Pros

- Encapsulation with private fields
- Lazy getters with built-in caching
- Familiar OOP patterns
- `instanceof` checks work
- Class names in debugger/stack traces

### Cons

- Complex type gymnastics for `applyMixins`
- Limited to 5 mixins without more overloads
- Harder to serialize
- Prototype chain overhead

---

## Solution 2: Functional Composition

Uses pure functions (enhancers) that transform source data into domain objects.

### Structure

```
src/models/function/
├── behaviors/
│   ├── author.ts      # withAuthor() enhancer
│   ├── timestamps.ts  # withTimestamps() enhancer
│   └── watchable.ts   # withWatchable() enhancer
├── utils/
│   ├── composeModel.ts # Core composition utility
│   └── relations.ts    # withHasOne/withHasMany helpers
├── task.ts             # Task model compositions
└── post.ts             # Post model compositions
```

### Usage

```typescript
import { composeModel, makeEnhancer } from "./utils/composeModel";
import { withTimestamps } from "./behaviors/timestamps";
import { withAuthor } from "./behaviors/author";

// Define your API response type
type TaskServerData = {
  id: string;
  title: string;
  created_at?: string;
  author?: { id: string; name: string };
};

// Create base enhancer
const taskBase = makeEnhancer((source: TaskServerData) => ({
  id: source.id,
  title: source.title,
  get summary() {
    return source.title.slice(0, 50);
  },
}));

// Compose model
function createTask(data: TaskServerData) {
  return composeModel(data, [taskBase, withTimestamps(), withAuthor()]);
}

// Types are inferred automatically
type Task = ReturnType<typeof createTask>;

// Create instances
const task = createTask(apiData);
console.log(task.title, task.createdAt, task.author.name);
```

### Pros

- Cleaner type inference (no manual overloads)
- Plain objects - easy to serialize
- Unlimited composition
- Better tree-shaking
- Simpler mental model
- React-friendly (immutable data)

### Cons

- No built-in caching for computed values
- No encapsulation (all properties public)
- Anonymous objects in debugger
- No `instanceof` checks

---

## Comparison Table

| Aspect                | Class-Based            | Functional           |
| --------------------- | ---------------------- | -------------------- |
| **Type Inference**    | Manual overloads       | Automatic            |
| **Lazy Evaluation**   | Built-in getters       | Explicit getters     |
| **Caching**           | Private field pattern  | External memoization |
| **Bundle Size**       | Larger                 | Smaller              |
| **Tree-Shaking**      | Harder                 | Easier               |
| **Serialization**     | `.toSource()` needed   | Natural JSON         |
| **Testing**           | Requires instantiation | Pure functions       |
| **Debugging**         | Class names visible    | Anonymous objects    |
| **Composition Limit** | 5 (needs overloads)    | Unlimited            |

---

## Reusable Behaviors

Both approaches provide the same reusable behaviors:

### Timestamps

Handles various date formats (`createdAt`, `created_at`, ISO strings, timestamps):

```typescript
// Functional
withTimestamps();
withTimestamps({ createdAt: (s) => s.custom_date_field });

// Class-based
WithTimestamps<SourceType>();
```

### Author

Extracts author info from various API patterns (`author`, `user`, `authorId`):

```typescript
// Functional
withAuthor();
withAuthor({ authorName: (s) => s.user.displayName });

// Class-based
WithAuthor<SourceType>();
```

### Watchable

Adds watch/follow state tracking:

```typescript
// Functional
withWatchable({ watcherType: "task", watcherId: (s) => s.id });

// Class-based
WithWatchable<SourceType>({ watcherType: "task", watcherId: (s) => s.id });
```

### Relations (Functional only)

```typescript
const withComments = withHasMany<PostData, CommentData, Comment, "comments">({
  key: "comments",
  from: (s) => s.comments,
  transform: createComment,
});
```

---

## Recommendation

**For React + TypeScript frontends, we recommend the Functional Composition approach:**

1. **Better TypeScript experience** - Types infer automatically
2. **Aligns with React patterns** - Immutable data, plain objects
3. **Simpler mental model** - Data in, object out
4. **Smaller bundles** - Better tree-shaking
5. **Easier testing** - Pure functions

Use Class-Based when:

- You need expensive computed properties with caching
- Your team prefers OOP patterns
- You need `instanceof` checks
- You want class names in stack traces

---

## Project Structure

```
src/
├── models/
│   ├── class/           # Class-based mixin approach
│   │   ├── mixins/      # Reusable mixin functions
│   │   ├── task.ts      # Task model
│   │   └── post.ts      # Post model
│   └── function/        # Functional composition approach
│       ├── behaviors/   # Reusable enhancer functions
│       ├── utils/       # Core utilities
│       ├── task.ts      # Task model
│       └── post.ts      # Post model
├── components/          # React components using the models
├── api.ts              # Mock API data
└── App.tsx             # Demo application
```

---

## License

MIT
