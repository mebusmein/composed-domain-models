/* eslint-disable @typescript-eslint/no-unused-vars */

// =============================================================================
// Base Comment Model
// =============================================================================

import { assertArray, combine, withMany, withOne, type WithMany, type WithOne } from "./utils";

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

function isComment(obj: unknown): obj is BaseComment {
    return typeof obj === "object" && obj !== null && "id" in obj && "body" in obj;
}

// type can be extracted from its mapper function.
type BaseComment = ReturnType<typeof commentBase>;

// =============================================================================
// Base Author Model
// =============================================================================

const authorBase = ((source: { id: string; name: string; username?: string; avatarUrl?: string }) => ({
    id: source.id,
    name: source.name,
    username: source.username,
    avatarUrl: source.avatarUrl,
}));

type BaseAuthor = ReturnType<typeof authorBase>;

// =============================================================================
// Base Post Model
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
// example of use
// =============================================================================

// example of using withMany to combine multiple comments into an array
const mapRichPost = combine(
    postBase,
    withMany("comments", commentBase),
);
type RichPost = ReturnType<typeof mapRichPost>;

const mapSimplePost = combine(postBase);
type SimplePost = ReturnType<typeof mapSimplePost>;

// pull a custom type from the factory
const richPostData = {
    id: "1",
    title: "Test",
    body: "Test",
    slug: "test",
    published: true,
    comments: [{ id: "1", body: "Test", authorId: "1", authorName: "Test", createdAt: "2021-01-01", updatedAt: "2021-01-01" }],
};

const simplePost = mapSimplePost(richPostData);

const richPost = mapRichPost(richPostData);


// example of using withOne to combine a single author into an object
const mapCommentWithAuthor = combine(
    commentBase,
    withOne("author", authorBase),
);
type CommentWithAuthor = ReturnType<typeof mapCommentWithAuthor>;

const commentWithAuthorData = {
    id: "1",
    body: "Test",
    author: { id: "1", name: "Test", username: "test", avatarUrl: "https://example.com/avatar.png" },
};

const commentWithAuthor = mapCommentWithAuthor(commentWithAuthorData);

// the target key can be overridden to a different key than the source key
const mapPostWithCommentsAsNotes = combine(
    postBase,
    withMany("comments", commentBase, "notes"),
);
type PostWithCommentsAsNotes = ReturnType<typeof mapPostWithCommentsAsNotes>;
const postWithCommentsAsNotes = mapPostWithCommentsAsNotes(richPostData);

const mapCommentWithAuthorWithDifferentKey = combine(
    commentBase,
    withOne("author", authorBase, "test"),
);
type CommentWithAuthorWithDifferentKey = ReturnType<typeof mapCommentWithAuthorWithDifferentKey>;
const commentWithAuthorWithDifferentKey = mapCommentWithAuthorWithDifferentKey(commentWithAuthorData);

// typehelpers can be created for making it easier to create reusable functions or components.
type WithComments = WithMany<"comments", BaseComment>;
type WithAuthor = WithOne<"author", BaseAuthor>;

// whe giving multiple keys it wil create e discriminatory union type. this can be usefull if you want to create a reusable function but the data can be on diferent keys but not both at the same time.
type WithCommentsOrNotes = WithMany<"comments" | "notes", BaseComment>;

// custom assert helpers can be created to check if an array is of a certain type.
function isComments(array: unknown) {
    return assertArray<BaseComment>(array);
}