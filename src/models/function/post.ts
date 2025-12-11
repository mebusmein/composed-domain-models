import { withAuthor } from "./behaviors/author";
import { withTimestamps } from "./behaviors/timestamps";
import { withWatchable } from "./behaviors/watchable";
import { composeModel, makeEnhancer } from "./utils/composeModel";
import { withHasMany } from "./utils/relations";

// =============================================================================
// Server Data Types
// =============================================================================

export type CommentServerData = {
    id: string;
    body: string;
    authorId: string;
    authorName: string;
    createdAt: string;
};

export type PostServerData = {
    id: string;
    title: string;
    body: string;
    slug: string;
    published: boolean;
    // Optional relations
    isWatched?: boolean;
    createdAt?: string;
    updatedAt?: string;
    author?: {
        id: string;
        name: string;
        username?: string;
        avatarUrl?: string;
    };
    comments?: CommentServerData[];
    commentsCount?: number;
    likesCount?: number;
    isEdited?: boolean;
    lastEditedBy?: { id: string; name: string } | null;
};

// =============================================================================
// Comment Model
// =============================================================================

const commentBase = makeEnhancer((source: CommentServerData) => ({
    id: source.id,
    body: source.body,

    get preview() {
        return source.body.length > 100
            ? source.body.slice(0, 100) + "..."
            : source.body;
    },
}));

export function createComment(data: CommentServerData) {
    return composeModel(data, [commentBase, withAuthor(), withTimestamps()]);
}

export type Comment = ReturnType<typeof createComment>;

// =============================================================================
// Post Base Enhancer
// =============================================================================

const postBase = makeEnhancer((source: PostServerData) => ({
    id: source.id,
    title: source.title,
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

// =============================================================================
// Post with Comments Relation
// =============================================================================

const withComments = withHasMany<PostServerData, CommentServerData, Comment, "comments">({
    key: "comments",
    from: (s) => s.comments,
    transform: createComment,
});

// =============================================================================
// Composed Types
// =============================================================================

export type Post = ReturnType<typeof createPost>;
export type PostListItem = ReturnType<typeof createPostListItem>;
export type PostDetail = ReturnType<typeof createPostDetail>;

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Basic post for minimal rendering.
 */
export function createPost(data: PostServerData) {
    return composeModel(data, [postBase]);
}

/**
 * Post list item with counts (no full relations loaded).
 * Use for: post listings, feeds.
 */
export function createPostListItem(data: PostServerData) {
    return composeModel(data, [
        postBase,
        withTimestamps(),
        withAuthor(),
        withWatchable({
            watcherType: "post",
            watcherId: (s) => s.id,
        }),
    ]);
}

/**
 * Full post detail with comments loaded.
 * Use for: post detail pages.
 */
export function createPostDetail(data: PostServerData) {
    return composeModel(data, [
        postBase,
        withTimestamps(),
        withAuthor(),
        withComments,
        withWatchable({
            watcherType: "post",
            watcherId: (s) => s.id,
        }),
    ]);
}


