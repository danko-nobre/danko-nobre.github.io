export function mapRange(
  n: number,
  start: number,
  stop: number,
  start2: number,
  stop2: number,
) {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
