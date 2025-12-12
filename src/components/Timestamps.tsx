import type { Timestamped } from "../models/function/behaviors/timestamps";

type TimestampsProps = Timestamped;

export function Timestamps({ createdAt, updatedAt }: TimestampsProps) {
  return (
    <div className="timestamps">
      <span className="timestamps__created-at">
        {createdAt.toLocaleDateString()}
      </span>
      <span className="timestamps__updated-at">
        {updatedAt.toLocaleDateString()}
      </span>
    </div>
  );
}
