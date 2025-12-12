import type { Enhancer, SelectorOrValue } from "../types";
import { resolveSelector } from "../types";

/**
 * Minimal author info embedded in the model.
 */
export type AuthorInfo = {
    readonly id: string;
    readonly name: string;
    readonly avatarUrl?: string;
};

/**
 * Authored behavior type.
 * Use this in business logic that works with authored entities.
 *
 * @example
 * ```ts
 * function isOwnContent<T extends Authored>(entity: T, currentUserId: string): boolean {
 *     return entity.author.id === currentUserId;
 * }
 * ```
 */
export type Authored = {
    readonly author: AuthorInfo;
};

/**
 * Source data constraint for author behavior.
 * Supports various common API patterns.
 */
export type AuthoredSource = {
    author?: {
        id: string;
        name?: string;
        username?: string;
        displayName?: string;
        avatar?: string;
        avatarUrl?: string;
        avatar_url?: string;
    };
    authorId?: string;
    author_id?: string;
    userId?: string;
    user_id?: string;
    user?: {
        id: string;
        name?: string;
        username?: string;
        displayName?: string;
        avatar?: string;
        avatarUrl?: string;
        avatar_url?: string;
    };
};

/**
 * Configuration options for the author behavior.
 */
export type AuthorOptions<S extends AuthoredSource> = {
    /** Custom selector for author info */
    author?: SelectorOrValue<S, AuthorInfo>;
    /** Custom selector for author ID (used if author is not provided) */
    authorId?: SelectorOrValue<S, string>;
    /** Custom selector for author name */
    authorName?: SelectorOrValue<S, string>;
    /** Custom selector for avatar URL */
    avatarUrl?: SelectorOrValue<S, string | undefined>;
};

/**
 * Extracts author info from common API patterns.
 */
function extractAuthor<S extends AuthoredSource>(
    source: S,
    opts: AuthorOptions<S>
): AuthorInfo {
    // If full author is provided via options, use it
    if (opts.author !== undefined) {
        return resolveSelector(source, opts.author);
    }

    // Try to get from embedded author/user object
    const authorObj = source.author ?? source.user;
    if (authorObj) {
        const name =
            opts.authorName !== undefined
                ? resolveSelector(source, opts.authorName)
                : authorObj.displayName ??
                authorObj.name ??
                authorObj.username ??
                "Unknown";

        const avatarUrl =
            opts.avatarUrl !== undefined
                ? resolveSelector(source, opts.avatarUrl)
                : authorObj.avatarUrl ??
                authorObj.avatar_url ??
                authorObj.avatar;

        return {
            id: authorObj.id,
            name,
            avatarUrl,
        };
    }

    // Fall back to ID-only author
    const authorId =
        opts.authorId !== undefined
            ? resolveSelector(source, opts.authorId)
            : source.authorId ??
            source.author_id ??
            source.userId ??
            source.user_id ??
            "unknown";

    const authorName =
        opts.authorName !== undefined
            ? resolveSelector(source, opts.authorName)
            : "Unknown";

    return {
        id: authorId,
        name: authorName,
        avatarUrl: opts.avatarUrl
            ? resolveSelector(source, opts.avatarUrl)
            : undefined,
    };
}

/**
 * Adds author behavior to a model.
 *
 * Automatically handles different API patterns:
 * - Embedded author object
 * - Embedded user object
 * - Just authorId/userId reference
 *
 * @example
 * ```ts
 * const createPost = (data: PostServerData) =>
 *     composeModel(data, [
 *         postBase,
 *         withAuthor(),
 *     ]);
 *
 * // Use in business logic
 * if (isOwnContent(post, currentUser.id)) {
 *     showEditButton();
 * }
 * ```
 */
export function withAuthor<S extends AuthoredSource>(
    opts: AuthorOptions<S> = {}
): Enhancer<S, Authored, unknown> {
    return (source): Authored => {
        return {
            author: extractAuthor(source, opts),
        };
    };
}

export function isAuthored(obj: unknown): obj is Authored {
    return typeof obj === "object" && obj !== null && "author" in obj;
}