## Review: Class-Based Mixins vs. Functional Composition

### Approach 1: Class-Based Mixins (`class/`)

**Pattern Overview:**

- Uses a `BaseModel<TSource>` that stores raw API data in `_source`
- Mixin functions like `WithAuthor()`, `WithTimestamps()` return class factories
- `applyMixins()` chains mixins together into a composed class
- Properties are accessed via getters on the class instance

```48:86:src/models/class/base.ts
export function applyMixins<
    TBase extends Constructor,
    M1 extends (base: TBase) => Constructor
>(Base: TBase, m1: M1): ReturnType<M1>;
// ... overloads for up to 5 mixins ...

export function applyMixins(Base: Constructor, ...mixins: Array<(base: any) => any>): Constructor {
    return mixins.reduce((acc, mixin) => mixin(acc), Base);
}
```

### Approach 2: Functional Composition (`function/`)

**Pattern Overview:**

- Uses `Enhancer<S, R>` functions that take source data and return plain objects
- `composeModel()` merges all enhancer results into a single object
- No classes — just object spreading and function composition
- Types are inferred from `ReturnType<typeof createModel>`

```typescript
export function composeModel<
  S extends object,
  const E extends readonly AnyEnhancer[]
>(
  source: S & SourceConstraintOfEnhancers<E>,
  enhancers: E
): ComposedFromEnhancers<E> {
  function build(overrides: AnyObj = {}): ComposedFromEnhancers<E> {
    let acc: AnyObj = { ...overrides };
    // ...
    for (const enhancer of enhancers) {
      const partial = enhancer(source, acc, buildRecursive) || {};
      acc = { ...acc, ...partial };
    }
    return acc as ComposedFromEnhancers<E>;
  }
  return build();
}
```

---

## Comparison

| Aspect               | Class-Based Mixins                               | Functional Composition               |
| -------------------- | ------------------------------------------------ | ------------------------------------ |
| **Mental Model**     | OOP, inheritance chain                           | FP, data transformation pipeline     |
| **Lazy Evaluation**  | ✅ Getters are lazy by default                   | ⚠️ Must use getter syntax explicitly |
| **Caching**          | ✅ Easy with private fields (`_authorCache`)     | ❌ Need external memoization         |
| **Type Inference**   | ⚠️ Requires explicit overloads for `applyMixins` | ✅ Automatic via `const E` arrays    |
| **Bundle Size**      | Larger (class prototypes)                        | Smaller (plain objects)              |
| **Tree-Shaking**     | ❌ Harder                                        | ✅ Easier                            |
| **Serialization**    | Need `.toSource()` method                        | Objects are naturally serializable   |
| **Runtime Identity** | `instanceof` works                               | No class identity                    |
| **Testing**          | Requires instantiation                           | Easy to test pure functions          |
| **Debugging**        | Class names in stack traces                      | Anonymous objects                    |
| **Code Complexity**  | Higher (mixin type gymnastics)                   | Lower (simpler types)                |

---

## Pros & Cons

### Class-Based Mixins

**✅ Pros:**

1. **Encapsulation**: Private fields, proper `this` binding, clear boundaries
2. **Lazy getters with caching**: Easy to compute once and store

   ```typescript
   private _authorCache?: AuthorInfo;

   get author(): AuthorInfo {
       if (!this._authorCache) {
           this._authorCache = extractAuthor(this._source, opts);
       }
       return this._authorCache;
   }
   ```

3. **Familiar to OOP developers**: Standard JavaScript class patterns
4. **Better debugging**: Class names appear in devtools and error stacks
5. **`instanceof` checks**: Can use runtime type checking if needed

**❌ Cons:**

1. **Complex type gymnastics**: The `applyMixins` overloads are verbose and limited
2. **Inheritance chain complexity**: Deep prototype chains can be confusing
3. **Harder to serialize**: Need explicit `toSource()` or JSON handling
4. **Less tree-shakeable**: Classes carry prototype baggage
5. **Mutable by accident**: Nothing prevents `(task as any).id = "hacked"`

---

### Functional Composition

**✅ Pros:**

1. **Simpler type inference**: `const E extends readonly AnyEnhancer[]` with `ComposedFromEnhancers<E>` works cleanly
2. **Plain objects**: Easy to serialize, log, spread, or pass around
3. **Highly composable**: Enhancers are just functions, easy to compose

   ```typescript
   export function createFullTask(data: TaskServerData) {
     return composeModel(data, [
       taskBase,
       withWatchable({ watcherType: "task", watcherId: (s) => s.id }),
       withTimestamps(),
       withAuthor(),
       withAssignee,
       withProject,
     ]);
   }
   ```

4. **Better tree-shaking**: Only used enhancers end up in the bundle
5. **Functional testing**: Pure functions are easy to unit test
6. **React-friendly**: Plain objects work well with React's shallow comparison

**❌ Cons:**

1. **No lazy evaluation by default**: All properties are computed upfront unless you use getters
2. **No built-in caching**: Computed values must be memoized externally
3. **No encapsulation**: All properties are public and spreadable
4. **Anonymous in debugger**: Objects show as `Object` in devtools (no class name)
5. **No `instanceof`**: Can't do runtime type checks (but type guards work)

---

## My Recommendation: **Functional Composition**

For a React + TypeScript frontend consuming backend data, I recommend the **functional approach** for these reasons:

### 1. **Better TypeScript Experience**

The functional approach has cleaner type inference. You don't need manual overloads — the types "just work":

```typescript
// Types are automatically inferred
export type FullTask = ReturnType<typeof createFullTask>;
```

### 2. **Aligns with React Patterns**

React favors immutable data and plain objects. The functional models:

- Work naturally with React's reconciliation
- Serialize easily for React Query / SWR caches
- No hidden class identity issues

### 3. **Simpler Mental Model**

Data flows in, transformed object flows out. No prototype chains, no `this` binding concerns:

```typescript
const task = composeModel(apiData, [taskBase, withTimestamps(), withAuthor()]);
// task is just { id, title, createdAt, author, ... }
```

### 4. **Smaller Bundle & Better Tree-Shaking**

Classes carry prototype overhead. Plain objects are lighter and unused enhancers get eliminated.

### 5. **Easier Testing**

Enhancers are pure functions — easy to test in isolation:

```typescript
test("withTimestamps converts strings to Dates", () => {
  const result = withTimestamps()({ createdAt: "2024-01-01" }, {}, () => {});
  expect(result.createdAt).toBeInstanceOf(Date);
});
```

---

## When to Use Class-Based Instead

Consider the class-based approach if:

1. **You need expensive computed properties** that should be cached (the getter + private cache pattern is elegant)
2. **Your team is more comfortable with OOP** and class-based patterns
3. **You need `instanceof` checks** for runtime type discrimination
4. **You're building a shared library** where class names in stack traces help debugging

---

## Potential Improvements to the Functional Approach

If you go with functional, consider adding:

1. **Lazy getter support** via a helper:

   ```typescript
   const lazy = <T>(fn: () => T) => {
     let cached: T | undefined;
     return () => cached ?? (cached = fn());
   };
   ```

2. **Frozen objects** for true immutability:

   ```typescript
   return Object.freeze(acc) as ComposedFromEnhancers<E>;
   ```

3. **Source preservation** (like the class approach has `toSource()`):
   ```typescript
   const withSource = makeEnhancer((source) => ({ _source: source }));
   ```

---

**Bottom line**: The functional approach is cleaner, more TypeScript-idiomatic, and better suited for React frontends. The class-based approach isn't wrong — it just carries more complexity for minimal benefit in this context.
