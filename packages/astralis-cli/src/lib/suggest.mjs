/* Pure and dependency-free: validate-core runs in the browser too. */

/** Levenshtein distance, giving up (returning `cap`) once it can't come in under it. */
export function editDistance(a, b, cap = Infinity) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (row[j] < rowMin) rowMin = row[j];
    }
    if (rowMin >= cap) return cap;
    prev = row;
  }
  return Math.min(prev[b.length], cap);
}

/** The nearest candidate within edit distance 2, for "did you mean" hints; null if none. */
export function suggest(value, candidates) {
  let best = null;
  let bestDistance = 3;
  for (const candidate of candidates) {
    if (Math.abs(candidate.length - value.length) >= bestDistance) continue;
    const distance = editDistance(value, candidate, bestDistance);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}
