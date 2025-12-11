import type { PostListItem } from "../models/function/post";
import { useWatchableToggle } from "../models/function/behaviors/watchable";
import { Author } from "./Author";

type PostCardProps = {
  post: PostListItem;
};

export function PostCard({ post }: PostCardProps) {
  const { isWatched, setIsWatched } = useWatchableToggle(post);

  return (
    <article className="post-card">
      <header className="post-card__header">
        <Author
          author={post.author}
          createdAt={post.createdAt}
          updatedAt={post.updatedAt}
        />
        <button
          className={`watch-btn ${isWatched ? "watching" : ""}`}
          onClick={() => setIsWatched(!isWatched)}
          title={isWatched ? "Unwatch" : "Watch"}
        >
          {isWatched ? "★" : "☆"}
        </button>
      </header>

      <h3 className="post-card__title">{post.title}</h3>
      <p className="post-card__excerpt">{post.excerpt}</p>

      <footer className="post-card__footer">
        {post.isDraft && <span className="post-card__draft-badge">Draft</span>}
      </footer>
    </article>
  );
}
