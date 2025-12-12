import type { AuthorInfo } from "../models/function/behaviors/author";

type AuthorProps = {
  author: AuthorInfo;
};

export function Author({ author }: AuthorProps) {
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
      </div>
    </div>
  );
}
