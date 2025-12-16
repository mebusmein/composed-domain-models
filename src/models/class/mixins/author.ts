import type { Constructor, SelectorOrValue } from "../types";
import { resolveSelector } from "../types";
import type { BaseModel } from "./base";

/**
 * Author info type.
 */
export interface AuthorInfo {
    readonly id: string;
    readonly name: string;
    readonly avatarUrl?: string;
}

/**
 * Authored behavior interface.
 */
export interface IAuthored {
    readonly author: AuthorInfo;
}

/**
 * Source data constraint for author mixin.
 */
export interface AuthoredSource {
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
}

/**
 * Configuration options for the author mixin.
 */
export interface AuthorOptions<TSource extends AuthoredSource> {
    author?: SelectorOrValue<TSource, AuthorInfo>;
    authorId?: SelectorOrValue<TSource, string>;
    authorName?: SelectorOrValue<TSource, string>;
    avatarUrl?: SelectorOrValue<TSource, string | undefined>;
}

/**
 * Extracts author info from source data.
 */
function extractAuthor<TSource extends AuthoredSource>(
    source: TSource,
    opts: AuthorOptions<TSource>
): AuthorInfo {
    if (opts.author !== undefined) {
        return resolveSelector(source, opts.author);
    }

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
                : authorObj.avatarUrl ?? authorObj.avatar_url ?? authorObj.avatar;

        return { id: authorObj.id, name, avatarUrl };
    }

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
 * Mixin that adds author behavior to a model class.
 *
 * @example
 * ```ts
 * const AuthoredTask = WithAuthor()(TaskBase);
 * ```
 */
export function WithAuthor<TSource extends AuthoredSource>(
    opts: AuthorOptions<TSource> = {}
) {
    return <TBase extends Constructor<BaseModel<TSource>>>(Base: TBase) => {
        return class Authored extends Base implements IAuthored {
            private _authorCache?: AuthorInfo;

            get author(): AuthorInfo {
                if (!this._authorCache) {
                    this._authorCache = extractAuthor(this._source, opts);
                }
                return this._authorCache;
            }
        };
    };
}

/**
 * Type guard for authored objects.
 */
export function isAuthored(obj: unknown): obj is IAuthored {
    return typeof obj === "object" && obj !== null && "author" in obj;
}


