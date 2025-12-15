/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */


// =============================================================================
// Combine Function
// =============================================================================

type AnyFn = (arg: any) => any;

type Arg<F> = F extends (arg: infer A) => any ? A : never;
type Ret<F> = F extends (arg: any) => infer R ? R : never;

type CombineArgs<Fns extends AnyFn[]> =
    Fns extends [infer FirstFn extends AnyFn, ...infer RestFns extends AnyFn[]]
    ? [CombineArgs<RestFns>] extends [(arg: infer RestArg) => any]
    ? (arg: Prettify<Arg<FirstFn> & RestArg>) => any
    : (arg: Prettify<Arg<FirstFn>>) => any
    : (arg: {}) => any;

type CombineReturn<Fns extends AnyFn[]> =
    Fns extends [infer FirstFn, ...infer RestFns]
    ? FirstFn extends AnyFn
    ? RestFns extends AnyFn[]
    ? Prettify<Ret<FirstFn> & CombineReturn<RestFns>>
    : Prettify<Ret<FirstFn>>
    : never
    : {};

type Combine<Fns extends AnyFn[]> =
    [CombineArgs<Fns>] extends [(arg: infer A) => any]
    ? (arg: Prettify<A>) => CombineReturn<Fns>
    : never;

/**
 * `Prettify<T>` expands and simplifies inferred intersections of object types, making them easier to read in editor hovers/hints.
 * See: https://stackoverflow.com/questions/61132262/how-to-see-the-real-object-type-of-a-typescript-type
 */
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

export function combine<Fns extends AnyFn[]>(
    ...fns: Fns
): Combine<Fns> {
    return ((arg: any) => {
        return Object.assign({}, ...fns.map(fn => fn(arg)));
    }) as any;
}

// =============================================================================
// With Has Many Function
// =============================================================================

export function withMany<
    TRaw,
    TModel,
    Key extends string = "relations"
>(
    key: Key,
    transform: (raw: TRaw) => TModel
): (source: { [k in Key]: TRaw[] }) => { [k in Key]: TModel[] } {
    return (source) => {
        const raws = (source as any)[key] as TRaw[] | undefined;
        const value = Array.isArray(raws) ? raws.map(transform) : [];
        return { [key]: value } as { [K in Key]: TModel[] };
    };
}

// =============================================================================
// Server Data Types
// =============================================================================

export type CommentServerData = {
    id: string;
    body: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
};

export type PostServerData = {
    id: string;
    title?: string;
    body: string;
    slug: string;
    published: boolean;
    // Optional relations
    createdAt: string;
    updatedAt: string;
    author?: {
        id: string;
        name: string;
        username?: string;
        avatarUrl?: string;
    };
    comments: CommentServerData[];
};

// =============================================================================
// Comment Model
// =============================================================================

const commentBase = ((source: { id: string; body: string }) => ({
    id: source.id,
    body: source.body,

    // a computed property
    get preview() {
        return source.body.length > 100
            ? source.body.slice(0, 100) + "..."
            : source.body;
    },
}));

type BaseComment = ReturnType<typeof commentBase>;

// =============================================================================
// Post Base Enhancer
// =============================================================================

const postBase = ((source: { id: string; title?: string; body: string; slug: string; published: boolean }) => ({
    id: source.id,
    title: source.title ?? "Untitled", // defaults can be provided
    body: source.body,
    slug: source.slug,
    published: source.published,

    get excerpt() {
        return source.body.length > 280
            ? source.body.slice(0, 280) + "..."
            : source.body;
    },

    get url() {
        return `/posts/${source.slug}`;
    },

    get isDraft() {
        return !source.published;
    },
}));

type BasePost = ReturnType<typeof postBase>;

// =============================================================================
// Timestamps Extractor
// =============================================================================

// the source can be a discriminated union of two objects this will force the source to be one or the other
type TimestampedSource = {
    createdAt: string | number | Date;
    updatedAt: string | number | Date;
} | {
    created_at: string | number | Date;
    updated_at: string | number | Date;
};

const withTimestamps = (source: TimestampedSource) => {
    let createdAtRaw: string | number | Date | undefined;
    let updatedAtRaw: string | number | Date | undefined;

    if ("createdAt" in source && "updatedAt" in source) {
        createdAtRaw = source.createdAt;
        updatedAtRaw = source.updatedAt;
    } else if ("created_at" in source && "updated_at" in source) {
        createdAtRaw = source.created_at;
        updatedAtRaw = source.updated_at;
    } else {
        throw new Error("Source does not contain recognizable timestamp fields.");
    }

    return {
        createdAt: new Date(createdAtRaw),
        updatedAt: new Date(updatedAtRaw),
    };
};

type Timestamped = ReturnType<typeof withTimestamps>;

const isTimestamped = (obj: unknown): obj is Timestamped => {
    return typeof obj === "object" && obj !== null && "createdAt" in obj && "updatedAt" in obj && obj.createdAt instanceof Date && obj.updatedAt instanceof Date;
};

// =============================================================================
// example of use
// =============================================================================

// Define a domain model factory combining the post base, timestamps, and comments even sub-models are combined
const mapRichPost = combine(
    postBase,
    withTimestamps,
    withMany("comments", combine(
        commentBase,
        withTimestamps,
    )),
);
type RichPost = ReturnType<typeof mapRichPost>;

const mapSimplePost = combine(postBase);
type SimplePost = ReturnType<typeof mapSimplePost>;

// pull a custom type from the factory

const richPostData: PostServerData = {
    id: "1",
    title: "Test",
    body: "Test",
    slug: "test",
    published: true,
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
    comments: [{ id: "1", body: "Test", authorId: "1", authorName: "Test", createdAt: "2021-01-01", updatedAt: "2021-01-01" }],
};

const simplePost = mapSimplePost(richPostData);

const richPost = mapRichPost(richPostData);

// functions can handle multiple versions of the same data they are allowed to "request partial features"
function logTime(model: Timestamped) {
    console.log(`Created at: ${model.createdAt}, Updated at: ${model.updatedAt}`);
}

function renderSimplePostUiElement(post: BasePost) {
    return console.log(`Excerpt: ${post.excerpt}`);
}

function renderPostUiWithOptionalTimestamps(post: BasePost & Partial<Timestamped>) {
    if (isTimestamped(post)) logTime(post);
    renderSimplePostUiElement(post);
}

logTime(richPost);
// Created at: 2021-01-01, Updated at: 2021-01-01
logTime(simplePost);
// ts Error: Argument of type 'SimplePost' is not assignable to parameter of type 'Timestamped'.

renderSimplePostUiElement(simplePost);
// Excerpt: Test
renderSimplePostUiElement(richPost);
// Excerpt: Test

renderPostUiWithOptionalTimestamps(simplePost);
// Excerpt: Test
renderPostUiWithOptionalTimestamps(richPost);
// Created at: 2021-01-01, Updated at: 2021-01-01
// Excerpt: Test
