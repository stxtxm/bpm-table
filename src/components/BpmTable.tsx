import type { Selection, TableData, TableCell } from '../lib/bpm';

const isSelected = (cell: TableCell, selection: Selection | null) =>
  selection ? selection.src === cell.src && selection.dest === cell.dest : false;

type Props = {
  data: TableData;
  selection: Selection | null;
  onSelect: (selection: Selection) => void;
};

export default function BpmTable({ data, selection, onSelect }: Props) {
  return (
    <div className="table-scroll" role="region" aria-label="Table BPM">
      <table className="bpmtable">
        <thead>
          <tr>
            <th className="bpmtable_header corner" aria-hidden="true"></th>
            {data.bpms.map((bpm) => (
              <th
                key={`head-${bpm}`}
                className="bpmtable_header"
                title="BPM de destination"
              >
                {bpm}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row) => (
            <tr key={`row-${row.src}`}>
              <th className="bpmtable_header" title="BPM source">
                {row.src}
              </th>
              {row.cells.map((cell) => {
                const selected = isSelected(cell, selection);
                const className = [cell.className, selected ? 'is-selected' : '']
                  .join(' ')
                  .trim();

                if (!cell.selectable) {
                  return <td key={cell.key} className={className}></td>;
                }

                return (
                  <td
                    key={cell.key}
                    className={className}
                    title={cell.labelText}
                    role="button"
                    tabIndex={0}
                    aria-label={cell.labelText}
                    onClick={() =>
                      onSelect({
                        src: cell.src,
                        dest: cell.dest,
                        labelText: cell.labelText,
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelect({
                          src: cell.src,
                          dest: cell.dest,
                          labelText: cell.labelText,
                        });
                      }
                    }}
                  >
                    {cell.valueText}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
