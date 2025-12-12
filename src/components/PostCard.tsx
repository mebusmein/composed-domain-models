import type { PostListItem } from "../models/function/post";
import { Author } from "./Author";
import { Timestamps } from "./Timestamps";
import { WatchToggle } from "./WatchToggle";

type PostCardProps = {
  post: PostListItem;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <header className="post-card__header">
        <Author author={post.author} />
        <Timestamps createdAt={post.createdAt} updatedAt={post.updatedAt} />
        <WatchToggle watchable={post} />
      </header>

      <h3 className="post-card__title">{post.title}</h3>
      <p className="post-card__excerpt">{post.excerpt}</p>

      <footer className="post-card__footer">
        {post.isDraft && <span className="post-card__draft-badge">Draft</span>}
      </footer>
    </article>
  );
}
