/**
 * Dependency-free QR Code Model 2 encoder (ISO/IEC 18004): versions 1–40,
 * levels L/M/Q/H, one segment per string in the densest mode that fits it
 * (numeric, alphanumeric, or UTF-8 bytes without an ECI header).
 */

export type QrErrorLevel = "L" | "M" | "Q" | "H";

export interface QrMatrix {
  version: number;
  mask: number;
  size: number;
  /** Row-major: `modules[y][x]` is true for a dark module. */
  modules: boolean[][];
}

export interface QrEncodeOptions {
  /** Force a mask (0–7) instead of choosing the lowest-penalty one. */
  mask?: number;
  /** Smallest version to consider (1–40). */
  minVersion?: number;
}

const LEVEL_INDEX: Record<QrErrorLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
const FORMAT_BITS: Record<QrErrorLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

// Indexed [level][version]; index 0 is unused.
const ECC_PER_BLOCK: readonly (readonly number[])[] = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

const ECC_BLOCKS: readonly (readonly number[])[] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

const ALPHANUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

interface Mode {
  indicator: number;
  /** Character-count field width for versions 1–9, 10–26, 27–40. */
  countBits: readonly [number, number, number];
}

const NUMERIC: Mode = { indicator: 0x1, countBits: [10, 12, 14] };
const ALNUM: Mode = { indicator: 0x2, countBits: [9, 11, 13] };
const BYTE: Mode = { indicator: 0x4, countBits: [8, 16, 16] };

interface Segment {
  mode: Mode;
  count: number;
  bits: number[];
}

function pushBits(out: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) out.push((value >>> i) & 1);
}

function makeSegment(text: string): Segment {
  const bits: number[] = [];
  if (/^[0-9]*$/.test(text)) {
    for (let i = 0; i < text.length; i += 3) {
      const chunk = text.slice(i, i + 3);
      pushBits(bits, Number(chunk), chunk.length * 3 + 1);
    }
    return { mode: NUMERIC, count: text.length, bits };
  }
  if ([...text].every((ch) => ALPHANUMERIC.includes(ch))) {
    for (let i = 0; i + 1 < text.length; i += 2) {
      pushBits(bits, ALPHANUMERIC.indexOf(text[i]) * 45 + ALPHANUMERIC.indexOf(text[i + 1]), 11);
    }
    if (text.length % 2 === 1) pushBits(bits, ALPHANUMERIC.indexOf(text[text.length - 1]), 6);
    return { mode: ALNUM, count: text.length, bits };
  }
  const bytes = new TextEncoder().encode(text);
  for (const b of bytes) pushBits(bits, b, 8);
  return { mode: BYTE, count: bytes.length, bits };
}

function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2;
    result -= (25 * align - 10) * align - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

function dataCodewords(version: number, level: number): number {
  return (
    Math.floor(rawDataModules(version) / 8) -
    ECC_PER_BLOCK[level][version] * ECC_BLOCKS[level][version]
  );
}

function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const step = Math.floor((version * 8 + count * 3 + 5) / (count * 4 - 4)) * 2;
  const result = [6];
  for (let pos = version * 4 + 17 - 7; result.length < count; pos -= step) {
    result.splice(1, 0, pos);
  }
  return result;
}

/* ---- Reed–Solomon over GF(2^8), primitive polynomial 0x11D ---- */

function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree - 1).fill(0);
  result.push(1);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function rsRemainder(data: readonly number[], divisor: readonly number[]): number[] {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] ^= gfMultiply(coef, factor);
    });
  }
  return result;
}

function addEccAndInterleave(data: number[], version: number, level: number): number[] {
  const numBlocks = ECC_BLOCKS[level][version];
  const eccLen = ECC_PER_BLOCK[level][version];
  const rawCodewords = Math.floor(rawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const divisor = rsDivisor(eccLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortBlockLen - eccLen + (i < numShortBlocks ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, divisor);
    // Placeholder so short and long blocks share column indices; skipped below.
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - eccLen || j >= numShortBlocks) result.push(block[i]);
    });
  }
  return result;
}

/* ---- Matrix construction ---- */

class Grid {
  readonly size: number;
  readonly modules: boolean[][];
  readonly reserved: boolean[][];

  constructor(size: number) {
    this.size = size;
    this.modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    this.reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  }

  setFunction(x: number, y: number, dark: boolean): void {
    this.modules[y][x] = dark;
    this.reserved[y][x] = true;
  }
}

function drawFunctionPatterns(grid: Grid, version: number): void {
  const { size } = grid;
  for (let i = 0; i < size; i++) {
    grid.setFunction(6, i, i % 2 === 0);
    grid.setFunction(i, 6, i % 2 === 0);
  }

  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= size || y < 0 || y >= size) continue;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        grid.setFunction(x, y, dist !== 2 && dist !== 4);
      }
    }
  }

  const align = alignmentPositions(version);
  const last = align.length - 1;
  align.forEach((ay, i) => {
    align.forEach((ax, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          grid.setFunction(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    });
  });

  // Reserve the format areas now; the real bits are written per mask.
  drawFormatBits(grid, "M", 0);

  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      grid.setFunction(a, b, dark);
      grid.setFunction(b, a, dark);
    }
  }
}

function drawFormatBits(grid: Grid, level: QrErrorLevel, mask: number): void {
  const data = (FORMAT_BITS[level] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const bit = (i: number) => ((bits >>> i) & 1) === 1;
  const { size } = grid;

  for (let i = 0; i <= 5; i++) grid.setFunction(8, i, bit(i));
  grid.setFunction(8, 7, bit(6));
  grid.setFunction(8, 8, bit(7));
  grid.setFunction(7, 8, bit(8));
  for (let i = 9; i < 15; i++) grid.setFunction(14 - i, 8, bit(i));

  for (let i = 0; i < 8; i++) grid.setFunction(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) grid.setFunction(8, size - 15 + i, bit(i));
  grid.setFunction(8, size - 8, true);
}

function drawCodewords(grid: Grid, codewords: readonly number[]): void {
  const { size } = grid;
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const y = upward ? size - 1 - vert : vert;
        if (grid.reserved[y][x] || i >= codewords.length * 8) continue;
        grid.modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
        i++;
      }
    }
  }
}

const MASKS: readonly ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function applyMask(grid: Grid, mask: number): void {
  const fn = MASKS[mask];
  for (let y = 0; y < grid.size; y++) {
    for (let x = 0; x < grid.size; x++) {
      if (!grid.reserved[y][x] && fn(x, y)) grid.modules[y][x] = !grid.modules[y][x];
    }
  }
}

/** The four penalty rules of ISO/IEC 18004 §7.8.3. */
function penalty(modules: readonly (readonly boolean[])[]): number {
  const size = modules.length;
  const at = (x: number, y: number, vertical: boolean) => (vertical ? modules[x][y] : modules[y][x]);
  let score = 0;

  for (const vertical of [false, true]) {
    for (let y = 0; y < size; y++) {
      let run = 1;
      let window = 0;
      for (let x = 0; x < size; x++) {
        const dark = at(x, y, vertical);
        if (x > 0) {
          if (dark === at(x - 1, y, vertical)) {
            run++;
          } else {
            if (run >= 5) score += run - 2;
            run = 1;
          }
        }
        // 1:1:3:1:1 finder look-alike with four light modules on either side.
        window = ((window << 1) | (dark ? 1 : 0)) & 0x7ff;
        if (x >= 10 && (window === 0x5d0 || window === 0x05d)) score += 40;
      }
      if (run >= 5) score += run - 2;
    }
  }

  let dark = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const c = modules[y][x];
      if (c) dark++;
      if (
        x < size - 1 &&
        y < size - 1 &&
        c === modules[y][x + 1] &&
        c === modules[y + 1][x] &&
        c === modules[y + 1][x + 1]
      ) {
        score += 3;
      }
    }
  }
  score += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
  return score;
}

/**
 * Encode `text` into a QR module matrix. Throws a RangeError when the text
 * does not fit version 40 at the requested level.
 */
export function encodeQr(text: string, level: QrErrorLevel = "M", options: QrEncodeOptions = {}): QrMatrix {
  const lv = LEVEL_INDEX[level];
  const segment = makeSegment(text);

  let version = Math.max(1, Math.min(40, options.minVersion ?? 1));
  let bitLength = 0;
  for (; ; version++) {
    const countBits = segment.mode.countBits[version < 10 ? 0 : version < 27 ? 1 : 2];
    bitLength = 4 + countBits + segment.bits.length;
    if (segment.count < 1 << countBits && bitLength <= dataCodewords(version, lv) * 8) break;
    if (version >= 40) throw new RangeError("QR code data too long");
  }

  const bits: number[] = [];
  pushBits(bits, segment.mode.indicator, 4);
  pushBits(bits, segment.count, segment.mode.countBits[version < 10 ? 0 : version < 27 ? 1 : 2]);
  bits.push(...segment.bits);

  const capacity = dataCodewords(version, lv) * 8;
  pushBits(bits, 0, Math.min(4, capacity - bits.length));
  pushBits(bits, 0, (8 - (bits.length % 8)) % 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    data.push(byte);
  }
  for (let pad = 0xec; data.length < capacity / 8; pad ^= 0xec ^ 0x11) data.push(pad);

  const grid = new Grid(version * 4 + 17);
  drawFunctionPatterns(grid, version);
  drawCodewords(grid, addEccAndInterleave(data, version, lv));

  let mask = options.mask ?? -1;
  if (mask < 0) {
    let best = Infinity;
    for (let m = 0; m < 8; m++) {
      applyMask(grid, m);
      drawFormatBits(grid, level, m);
      const score = penalty(grid.modules);
      if (score < best) {
        best = score;
        mask = m;
      }
      applyMask(grid, m);
    }
  }
  applyMask(grid, mask);
  drawFormatBits(grid, level, mask);

  return { version, mask, size: grid.size, modules: grid.modules };
}

/**
 * One SVG path for every dark module, offset by `margin` quiet-zone modules;
 * horizontal runs merge into one rectangle each.
 */
export function qrPath(matrix: QrMatrix, margin = 0): string {
  let d = "";
  matrix.modules.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      if (!row[x]) {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < row.length && row[x + run]) run++;
      d += `M${x + margin} ${y + margin}h${run}v1h-${run}z`;
      x += run;
    }
  });
  return d;
}
