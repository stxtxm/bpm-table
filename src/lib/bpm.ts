export type Selection = {
  src: number;
  dest: number;
  labelText: string;
};

export type TableCell = {
  key: string;
  src: number;
  dest: number;
  valueText: string;
  valueTextSigned: string;
  labelText: string;
  className: string;
  selectable: boolean;
};

export type TableRow = {
  src: number;
  cells: TableCell[];
};

export type TableData = {
  bpms: number[];
  rows: TableRow[];
  defaultSelection: Selection | null;
};

export type CalcResult = {
  valueText: string;
  valueTextSigned: string;
  labelText: string;
};

const RANGE = 20;

function absBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function roundPercentScaled(src: number, dest: number, decimals: number): bigint {
  const scale = 10n ** BigInt(decimals);
  const num = BigInt(dest - src) * 100n * scale;
  const den = BigInt(src);
  if (den === 0n) {
    return 0n;
  }

  let quot = num / den;
  const rem = num % den;
  const absRem = absBigInt(rem);
  const absDen = absBigInt(den);

  if (absRem * 2n >= absDen && rem !== 0n) {
    quot += num >= 0n ? 1n : -1n;
  }

  return quot;
}

function formatScaled(scaled: bigint, decimals: number): string {
  const negative = scaled < 0n;
  const abs = negative ? -scaled : scaled;
  const factor = 10n ** BigInt(decimals);
  const intPart = abs / factor;
  const fracPart = abs % factor;

  if (decimals === 0) {
    return `${negative ? '-' : ''}${intPart.toString()}`;
  }

  return `${negative ? '-' : ''}${intPart.toString()}.${fracPart
    .toString()
    .padStart(decimals, '0')}`;
}

function formatScaledWithSign(scaled: bigint, decimals: number): string {
  const sign = scaled < 0n ? '-' : '+';
  const abs = scaled < 0n ? -scaled : scaled;
  return `${sign}${formatScaled(abs, decimals)}`;
}

export function calcPercent(src: number, dest: number): CalcResult | null {
  if (!Number.isFinite(src) || !Number.isFinite(dest) || src <= 0) {
    return null;
  }

  const p2 = roundPercentScaled(src, dest, 2);
  const valueText = formatScaled(p2, 2);
  const valueTextSigned = formatScaledWithSign(p2, 2);
  const labelText = `${src} -> ${dest} = ${valueTextSigned}%`;

  return { valueText, valueTextSigned, labelText };
}

export function buildTable(bpmMin: number, pitchMax: number): TableData {
  const bpms = Array.from({ length: RANGE + 1 }, (_, i) => bpmMin + i);
  const pitchScaled = BigInt(Math.round(pitchMax * 10));

  const inRange = bpms.map((src) =>
    bpms.map((dest) => {
      const p1 = roundPercentScaled(src, dest, 1);
      return absBigInt(p1) <= pitchScaled;
    })
  );

  let defaultSelection: Selection | null = null;

  const rows = bpms.map((src, i) => {
    const cells = bpms.map((dest, j) => {
      const p2 = roundPercentScaled(src, dest, 2);
      const isSame = src === dest;
      const isBlackCross = src % 10 === 0 && dest % 10 === 0;
      const isGray = (src % 10 === 0 || dest % 10 === 0) && !isBlackCross;
      const isInRange = inRange[i][j];

      let baseClass = '';
      if (isSame || isBlackCross) {
        baseClass = 'bpmtable_black';
      } else if (isGray) {
        baseClass = 'bpmtable_gray';
      } else if (isInRange) {
        baseClass = 'bpmtable_greenpitch';
      } else {
        baseClass = 'bpmtable_redpitch';
      }

      const edgeClasses: string[] = [];
      if (isInRange) {
        if (j + 1 < bpms.length && !inRange[i][j + 1]) {
          edgeClasses.push('edge-r');
        }
        if (j - 1 >= 0 && !inRange[i][j - 1]) {
          edgeClasses.push('edge-l');
        }
        if (i - 1 >= 0 && !inRange[i - 1][j]) {
          edgeClasses.push('edge-t');
        }
        if (i + 1 < bpms.length && !inRange[i + 1][j]) {
          edgeClasses.push('edge-b');
        }
      }

      const valueText = isSame ? '' : formatScaled(p2, 2);
      const valueTextSigned = isSame ? '' : formatScaledWithSign(p2, 2);
      const labelText = isSame
        ? ''
        : `${src} -> ${dest} = ${formatScaledWithSign(p2, 2)}%`;

      if (!defaultSelection && src === bpmMin && dest === bpmMin + 1) {
        defaultSelection = { src, dest, labelText };
      }

      return {
        key: `${src}-${dest}`,
        src,
        dest,
        valueText,
        valueTextSigned,
        labelText,
        className: [baseClass, ...edgeClasses].join(' ').trim(),
        selectable: !isSame,
      } satisfies TableCell;
    });

    return { src, cells } satisfies TableRow;
  });

  return { bpms, rows, defaultSelection };
}
