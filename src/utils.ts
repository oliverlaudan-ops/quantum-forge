const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

export function format(n: number): string {
  if (n < 1000) return Math.floor(n).toString();
  if (n >= 1e15) return n.toExponential(2);
  const tier = Math.min(Math.floor(Math.log10(n) / 3), SUFFIXES.length - 1);
  return (n / Math.pow(1000, tier)).toFixed(1) + SUFFIXES[tier];
}

export function formatRate(n: number): string {
  return `(+${format(n)}/s)`;
}