import type { FullTask, Task, WatchableTask } from "../models/function/task";
import { isWatchable } from "../models/function/behaviors/watchable";
import { Author } from "./Author";
import { isAuthored } from "../models/function/behaviors/author";
import { isTimestamped } from "../models/function/behaviors/timestamps";
import { Timestamps } from "./Timestamps";
import { WatchToggle } from "./WatchToggle";

type TaskCardProps = {
  task: FullTask | WatchableTask | Task;
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
  const isWatchableTask = isWatchable(task);
  const isAuthoredTask = isAuthored(task);
  const isTimestampedTask = isTimestamped(task);

  return (
    <article className="task-card">
      <header className="task-card__header">
        {isAuthoredTask && <Author author={task.author} />}
        {isTimestampedTask && (
          <Timestamps createdAt={task.createdAt} updatedAt={task.updatedAt} />
        )}
        <div className="task-card__status-badge" data-status={task.status}>
          {statusLabels[task.status]}
        </div>
        {isWatchableTask && <WatchToggle watchable={task} />}
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
