import type { TableData, TableCell } from '../lib/bpm';

const isSelected = (cell: TableCell, sourceBpm: number, destBpm: number) =>
  cell.src === sourceBpm && cell.dest === destBpm;

type Props = {
  data: TableData;
  sourceBpm: number;
  destBpm: number;
  onSelect: (src: number, dest: number) => void;
};

export default function BpmList({ data, sourceBpm, destBpm, onSelect }: Props) {
  const row = data.rows.find((item) => item.src === sourceBpm);

  if (!row) {
    return <p className="list-empty">Source BPM hors de la plage.</p>;
  }

  return (
    <div className="list">
      {row.cells.map((cell) => {
        if (!cell.selectable) {
          return null;
        }

        const selected = isSelected(cell, sourceBpm, destBpm);
        const className = [
          'list-item',
          cell.className,
          selected ? 'is-selected' : '',
        ]
          .join(' ')
          .trim();

        return (
          <button
            key={cell.key}
            type="button"
            className={className}
            title={cell.labelText}
            aria-label={cell.labelText}
            onClick={() => onSelect(cell.src, cell.dest)}
          >
            <span className="list-dest">{cell.dest} BPM</span>
            <span className="list-value">{cell.valueTextSigned}%</span>
          </button>
        );
      })}
    </div>
  );
}
