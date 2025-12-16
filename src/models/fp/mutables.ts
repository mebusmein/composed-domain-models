// =============================================================================
// Mutable relationships
// =============================================================================
//
// we can use techniques like currying to create reusable functions that can be used with different arguments.
// this is useful when we want to create a reusable function that can be used with different models.
// like watched or pinned.

// =============================================================================
// Base Comment Model
// =============================================================================

import { combine } from "./utils";

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

// type can be extracted from its mapper function.
type BaseComment = ReturnType<typeof commentBase>;

// =============================================================================
// Watched
// =============================================================================

export const WatchedType = {
    Comment: "comment",
    Post: "post",
    Task: "task",
} as const;

export type WatchedType = typeof WatchedType[keyof typeof WatchedType];

// example of using curried functions to use the same function with different arguments
// Like injecting a type on a mutable
const withWatched = <M extends WatchedType>(modelType: M) => ((source: { watchId: string; }) => ({
    watchId: source.watchId,
    watchedType: modelType,
    isWatched: !!source.watchId,
}));

type Watched = ReturnType<ReturnType<typeof withWatched>>;

// =============================================================================
// Likable
// =============================================================================

const withLike = <M extends string, IDKey extends string = "id">(modelType: M, modelId = "id" as IDKey) => ((source: { [k in IDKey]: string; } & { liked: boolean }) => ({
    isLiked: source.liked,
    likedType: modelType,
    likedId: source[modelId],
}));


// =============================================================================
// example of use
// =============================================================================


const mapWatchedComment = combine(
    commentBase,
    withWatched(WatchedType.Comment)
);

const watchedCommentData = {
    id: "1",
    body: "Nice post!",
    watchId: "watcher-34",
};

const watchedComment = mapWatchedComment(watchedCommentData);

const mapLikableWithCustomId = combine(
    commentBase,
    withLike("comment", "commentId")
);

const likableWithCustomIdData = {
    id: "2",
    body: "Nice post!",
    liked: true,
    commentId: "2",
};

const likableWithCustomId = mapLikableWithCustomId(likableWithCustomIdData);
const brokenLikableWithCustomId = mapLikableWithCustomId(likableCommentData);