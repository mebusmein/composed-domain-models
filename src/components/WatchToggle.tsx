import {
  useWatchableToggle,
  type Watchable,
} from "../models/function/behaviors/watchable";

type WatchToggleProps = {
  watchable: Watchable;
};

export function WatchToggle({ watchable }: WatchToggleProps) {
  const { isWatched, setIsWatched } = useWatchableToggle(watchable);
  return (
    <button
      className={`watch-btn ${isWatched ? "watching" : ""}`}
      onClick={() => setIsWatched(!isWatched)}
      title={isWatched ? "Unwatch" : "Watch"}
    >
      {isWatched ? "★" : "☆"}
    </button>
  );
}
