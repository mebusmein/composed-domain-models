import {
    BaseModel,
    applyMixins,
    createFactory,
    WithWatchable,
    WithTimestamps,
    WithAuthor,
    type WatchableSource,
    type TimestampedSource,
    type AuthoredSource,
} from "./mixins";

// =============================================================================
// Server Data Types
// =============================================================================

export interface PostServerData
    extends WatchableSource,
        TimestampedSource,
        AuthoredSource {
    id: string;
    title: string;
    body: string;
    slug: string;
    published: boolean;
    commentsCount?: number;
    likesCount?: number;
}

// =============================================================================
// Base Post Class
// =============================================================================

export class PostBase extends BaseModel<PostServerData> {
    get id(): string {
        return this._source.id;
    }

    get title(): string {
        return this._source.title;
    }

    get body(): string {
        return this._source.body;
    }

    get slug(): string {
        return this._source.slug;
    }

    get published(): boolean {
        return this._source.published;
    }

    get commentsCount(): number {
        return this._source.commentsCount ?? 0;
    }

    get likesCount(): number {
        return this._source.likesCount ?? 0;
    }

    // Computed properties
    get excerpt(): string {
        return this.body.length > 280
            ? this.body.slice(0, 280) + "..."
            : this.body;
    }

    get url(): string {
        return `/posts/${this.slug}`;
    }

    get isDraft(): boolean {
        return !this.published;
    }
}

// =============================================================================
// Composed Model Classes
// =============================================================================

/**
 * Basic Post.
 */
export const Post = PostBase;
export type Post = InstanceType<typeof Post>;

/**
 * Post for list views with all common behaviors.
 */
export const PostListItem = applyMixins(
    PostBase,
    WithTimestamps<PostServerData>(),
    WithAuthor<PostServerData>(),
    WithWatchable<PostServerData>({
        watcherType: "post",
        watcherId: (s) => s.id,
    })
);
export type PostListItem = InstanceType<typeof PostListItem>;

// =============================================================================
// Factory Functions
// =============================================================================

export const createPost = createFactory<PostServerData, typeof Post>(Post);

export const createPostListItem = createFactory<
    PostServerData,
    typeof PostListItem
>(PostListItem);


