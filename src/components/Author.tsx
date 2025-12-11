import type { AuthorInfo } from "../models/function/behaviors/author";
import type { Timestamped } from "../models/function/behaviors/timestamps";

type AuthorProps = {
  author: AuthorInfo;
} & Timestamped;

export function Author({ author, createdAt, updatedAt }: AuthorProps) {
  return (
    <div className="post-card__author">
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt={author.name}
          className="post-card__avatar"
        />
      ) : (
        <div className="post-card__avatar post-card__avatar--placeholder">
          {author.name.charAt(0)}
        </div>
      )}
      <div className="post-card__author-info">
        <span className="post-card__author-name">{author.name}</span>
        <time className="post-card__date">
          {updatedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) ||
            createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
        </time>
      </div>
    </div>
  );
}
