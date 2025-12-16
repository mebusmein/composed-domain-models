import { combine } from "./utils";

// =============================================================================
// Base Post Model
// =============================================================================

const postBase = ((source: { id: string; title?: string; body: string; slug: string; published: boolean }) => ({
    id: source.id,
    title: source.title ?? "Untitled", // defaults can be provided
    body: source.body,
    slug: source.slug,
    published: source.published,

    // a computed property
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
// Author Extractor
// =============================================================================

type RawTimestamp = string | number | Date;

const withTimestamps = ((source: { createdAt: RawTimestamp; updatedAt: RawTimestamp }) => ({
    createdAt: new Date(source.createdAt), // forcing type to Date
    updatedAt: new Date(source.updatedAt),
}));

type Timestamped = ReturnType<typeof withTimestamps>;

function isTimestamped(obj: unknown): obj is Timestamped {
    return typeof obj === "object" && obj !== null && "createdAt" in obj && "updatedAt" in obj;
}

// =============================================================================
// example of use
// =============================================================================

// Define a domain model factory combining the post base, timestamps, and comments even sub-models are combined
const mapRichPost = combine(
    postBase,
    withTimestamps,
);
type RichPost = ReturnType<typeof mapRichPost>;

const mapSimplePost = combine(postBase);
type SimplePost = ReturnType<typeof mapSimplePost>;

// possible generated type from the server data
type PostServerData = {
    id: string;
    title?: string;
    body: string;
    slug: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
};

const richPostData: PostServerData = {
    id: "1",
    title: "Test",
    body: "Test",
    slug: "test",
    published: true,
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
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
