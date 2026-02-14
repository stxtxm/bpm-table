import { useMemo, useState, useEffect, type KeyboardEvent } from 'react';
import BpmTable from './components/BpmTable';
import BpmList from './components/BpmList';
import {
  buildTable,
  calcPercent,
  type Selection,
  type TableData,
  type TableCell,
} from './lib/bpm';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const BPM_MIN = 40;
const BPM_MAX = 300;
const MOBILE_BREAKPOINT = 900;

const parseIntegerInput = (value: string): number | null => {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : Math.round(parsed);
};

const parseDecimalInput = (value: string): number | null => {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const commitOnEnter = (
  event: KeyboardEvent<HTMLInputElement>,
  commit: (value: string) => void
) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    commit(event.currentTarget.value);
    event.currentTarget.blur();
  }
};

type NumberFieldProps = {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  inputMode: 'numeric' | 'decimal';
  onValueChange: (value: string) => void;
  onCommit: (value: string) => void;
  className?: string;
};

function NumberField({
  label,
  value,
  min,
  max,
  step,
  inputMode,
  onValueChange,
  onCommit,
  className,
}: NumberFieldProps) {
  return (
    <label className={className}>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        onBlur={(event) => onCommit(event.currentTarget.value)}
        onKeyDown={(event) => commitOnEnter(event, onCommit)}
        inputMode={inputMode}
        enterKeyHint="done"
      />
    </label>
  );
}

const getCell = (
  data: TableData,
  src: number,
  dest: number
): TableCell | null => {
  const min = data.bpms[0];
  const max = data.bpms[data.bpms.length - 1];

  if (src < min || src > max || dest < min || dest > max) {
    return null;
  }

  const row = data.rows[src - min];
  if (!row) {
    return null;
  }

  const cell = row.cells[dest - min];
  if (!cell || !cell.selectable) {
    return null;
  }

  return cell;
};

export default function App() {
  const [bpmMin, setBpmMin] = useState(120);
  const [pitchMax, setPitchMax] = useState(6);
  const [sourceBpm, setSourceBpm] = useState(120);
  const [destBpm, setDestBpm] = useState(121);
  const [showTable, setShowTable] = useState(false);
  const [showLookupModule, setShowLookupModule] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [bpmMinInput, setBpmMinInput] = useState('120');
  const [pitchInput, setPitchInput] = useState('6');
  const [sourceInput, setSourceInput] = useState('120');
  const [destInput, setDestInput] = useState('121');

  const data = useMemo(() => buildTable(bpmMin, pitchMax), [bpmMin, pitchMax]);
  const rangeMin = data.bpms[0];
  const rangeMax = data.bpms[data.bpms.length - 1];

  useEffect(() => {
    setBpmMinInput(bpmMin.toString());
    setPitchInput(pitchMax.toString());
    setSourceInput(sourceBpm.toString());
    setDestInput(destBpm.toString());
  }, [bpmMin, pitchMax, sourceBpm, destBpm]);

  useEffect(() => {
    const handler = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const installed = () => setInstallPrompt(null);

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setIsMobileViewport(media.matches);
    update();

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const className = 'lock-scroll';
    if (showTable) {
      window.scrollTo(0, 0);
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      document.body.classList.remove(className);
    };
  }, [showTable]);

  const currentCell = useMemo(
    () => getCell(data, sourceBpm, destBpm),
    [data, sourceBpm, destBpm]
  );

  const calc = useMemo(
    () => calcPercent(sourceBpm, destBpm),
    [sourceBpm, destBpm]
  );

  const selectionLabel = calc ? calc.labelText : '--';
  const lookupValue = calc ? `${calc.valueTextSigned}%` : '--';

  const commitBpmMin = (value: string) => {
    const parsed = parseIntegerInput(value);
    if (parsed === null) {
      setBpmMinInput(bpmMin.toString());
      return;
    }
    const next = clamp(parsed, BPM_MIN, BPM_MAX);
    const nextDest = next < BPM_MAX ? next + 1 : next - 1;
    setBpmMin(next);
    setSourceBpm(next);
    setDestBpm(clamp(nextDest, BPM_MIN, BPM_MAX));
    setBpmMinInput(next.toString());
  };

  const commitPitch = (value: string) => {
    const parsed = parseDecimalInput(value);
    if (parsed === null) {
      setPitchInput(pitchMax.toString());
      return;
    }
    const next = clamp(Math.round(parsed * 10) / 10, 0, 50);
    setPitchMax(next);
    setPitchInput(next.toString());
  };

  const commitSource = (value: string) => {
    const parsed = parseIntegerInput(value);
    if (parsed === null) {
      setSourceInput(sourceBpm.toString());
      return;
    }
    const next = clamp(parsed, BPM_MIN, BPM_MAX);
    setSourceBpm(next);
    setSourceInput(next.toString());
  };

  const commitDest = (value: string) => {
    const parsed = parseIntegerInput(value);
    if (parsed === null) {
      setDestInput(destBpm.toString());
      return;
    }
    const next = clamp(parsed, BPM_MIN, BPM_MAX);
    setDestBpm(next);
    setDestInput(next.toString());
  };

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleTableSelect = (next: Selection) => {
    setSourceBpm(next.src);
    setDestBpm(next.dest);
  };

  const selection = currentCell
    ? ({
        src: currentCell.src,
        dest: currentCell.dest,
        labelText: currentCell.labelText,
      } satisfies Selection)
    : null;

  const metrics = [
    { label: 'Grille', value: `${data.bpms.length} x ${data.bpms.length}` },
    { label: 'Plage', value: `${rangeMin} - ${rangeMax} BPM` },
    { label: 'Coupure pitch', value: `${pitchMax.toFixed(1)}%` },
  ] as const;

  const legendItems = [
    { key: 'ok', className: 'green', label: 'Pitch OK' },
    { key: 'out', className: 'red', label: 'Hors pitch' },
    { key: 'mark', className: 'gray', label: 'Repere 10 BPM' },
  ] as const;

  return (
    <main className={`app ${showTable ? 'is-table-open' : ''}`}>
      <header className="hero">
        <div className="hero-text">
          <div className="brand">
            <img
              className="brand-logo"
              src="/logo-mark.svg"
              alt="BPM TABLE logo"
            />
            <h1 className="brand-title">BPM TABLE</h1>
          </div>
          <p className="hero-subtitle">Conversion BPM precise et instantanee</p>
          {!isMobileViewport && (
            <p className="lead">
              Selectionnez votre BPM source puis lisez la variation a
              destination. Exemples: 125 -&gt; 126 = +0.80% · 122 -&gt; 123 =
              +0.82%
            </p>
          )}
        </div>
      </header>

      <section className="panel controls">
        <div className="controls-header">
          <h2>Module BPM</h2>
          <button
            type="button"
            className="ghost-button ghost-button-compact"
            aria-controls="lookup-module"
            aria-expanded={showLookupModule}
            onClick={() => setShowLookupModule((prev) => !prev)}
          >
            {showLookupModule
              ? 'Masquer source -> destination'
              : 'Afficher source -> destination'}
          </button>
        </div>

        <div className="controls-row">
          <NumberField
            label="BPM minimal"
            min={BPM_MIN}
            max={BPM_MAX}
            step={1}
            value={bpmMinInput}
            onValueChange={setBpmMinInput}
            onCommit={commitBpmMin}
            inputMode="numeric"
          />
          {!isMobileViewport && (
            <div className="legend">
              {legendItems.map((item) => (
                <span key={item.key} className="legend-item">
                  <span className={`swatch ${item.className}`}></span>
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>
        <details className="advanced-pitch">
          <summary>Options avancees</summary>
          <div className="advanced-pitch-body">
            <NumberField
              className="pitch-field"
              label="Crete du pitch (%)"
              min={0}
              max={50}
              step={0.1}
              value={pitchInput}
              onValueChange={setPitchInput}
              onCommit={commitPitch}
              inputMode="decimal"
            />
          </div>
        </details>

        {showLookupModule && (
          <div id="lookup-module" className="lookup-card">
            <div className="lookup-fields">
              <NumberField
                label="BPM source"
                min={BPM_MIN}
                max={BPM_MAX}
                step={1}
                value={sourceInput}
                onValueChange={setSourceInput}
                onCommit={commitSource}
                inputMode="numeric"
              />
              <NumberField
                label="BPM destination"
                min={BPM_MIN}
                max={BPM_MAX}
                step={1}
                value={destInput}
                onValueChange={setDestInput}
                onCommit={commitDest}
                inputMode="numeric"
              />
            </div>
            <div className="lookup-result" role="status" aria-live="polite">
              <div className="lookup-value">{lookupValue}</div>
              <div className="lookup-label">{selectionLabel}</div>
            </div>
          </div>
        )}

      </section>

      <section className="info-panel">
        {metrics.map((metric) => (
          <div key={metric.label} className="hero-metric">
            <span className="metric-label">{metric.label}</span>
            <span className="metric-value">{metric.value}</span>
          </div>
        ))}
        {installPrompt && (
          <button type="button" className="install-button" onClick={handleInstall}>
            Installer l app
          </button>
        )}
      </section>

      <section className="panel mobile-panel">
        <div className="mobile-header">
          <h2>Liste des BPM de destination</h2>
          <button
            type="button"
            className="ghost-button"
            aria-controls="full-table"
            aria-expanded={showTable}
            onClick={() => setShowTable((prev) => !prev)}
          >
            {showTable ? 'Retour a la liste' : 'Afficher tableau complet'}
          </button>
        </div>
        <div className="mobile-list-shell">
          <BpmList
            data={data}
            sourceBpm={sourceBpm}
            destBpm={destBpm}
            onSelect={(src, dest) => {
              setSourceBpm(src);
              setDestBpm(dest);
            }}
          />
        </div>
      </section>

      <section
        id="full-table"
        className="panel table-panel"
        data-visible={showTable ? 'true' : 'false'}
      >
        <div className="table-header">
          <div className="table-title">Tableau complet</div>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setShowTable(false)}
          >
            Retour a la liste
          </button>
        </div>
        <BpmTable data={data} selection={selection} onSelect={handleTableSelect} />
      </section>

      <div className="mobile-bar" role="status" aria-live="polite">
        <div className="mobile-bar-content">
          <div className="mobile-bar-value">{lookupValue}</div>
          <div className="mobile-bar-label">{selectionLabel}</div>
        </div>
      </div>
    </main>
  );
}
