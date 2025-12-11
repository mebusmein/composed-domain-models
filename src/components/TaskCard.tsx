import type { WatchableTask } from "../models/function/task";
import { useWatchableToggle } from "../models/function/behaviors/watchable";
import { Author } from "./Author";

type TaskCardProps = {
  task: WatchableTask;
};

const priorityColors = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#ef4444",
};

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export function TaskCard({ task }: TaskCardProps) {
  const { isWatched, setIsWatched } = useWatchableToggle(task);

  return (
    <article className="task-card">
      <header className="task-card__header">
        <Author
          author={task.author}
          createdAt={task.createdAt}
          updatedAt={task.updatedAt}
        />
        <div className="task-card__status-badge" data-status={task.status}>
          {statusLabels[task.status]}
        </div>
        <button
          className={`watch-btn ${isWatched ? "watching" : ""}`}
          onClick={() => setIsWatched(!isWatched)}
          title={isWatched ? "Unwatch" : "Watch"}
        >
          {isWatched ? "★" : "☆"}
        </button>
      </header>

      <h3 className="task-card__title">{task.title}</h3>
      <p className="task-card__body">{task.summary}</p>

      <footer className="task-card__footer">
        <span
          className="task-card__priority"
          style={{ color: priorityColors[task.priority] }}
        >
          ● {task.priority}
        </span>
        <div className="task-card__tags">
          {task.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
}
