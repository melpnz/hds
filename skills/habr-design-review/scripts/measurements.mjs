const valid = b => Array.isArray(b) && b.length === 4 && b.every(Number.isFinite) && b[2] > 0 && b[3] > 0;
export function gapMeasurement(measurement) {
  if (!['x', 'y'].includes(measurement?.axis)) throw new Error('У измерения зазора нужна axis x или y');
  const result = {};
  for (const side of ['a', 'b']) {
    const { from, to } = measurement[side] || {};
    if (!valid(from) || !valid(to)) throw new Error(`У зазора ${side} нужны обе рамки from и to`);
    const vertical = measurement.axis === 'y', start = vertical ? from[1] + from[3] : from[0] + from[2], end = vertical ? to[1] : to[0];
    if (end < start) throw new Error('Границы зазора перекрываются; проверьте порядок элементов');
    const x = Math.min(from[0], to[0]), y = Math.min(from[1], to[1]);
    const box = [x, y, Math.max(from[0] + from[2], to[0] + to[2]) - x, Math.max(from[1] + from[3], to[1] + to[3]) - y];
    const gap = vertical ? [to[0], start, to[2], end - start] : [start, to[1], end - start, to[3]];
    result[side] = { box, value: end - start, marks: [{ kind: 'el', box: from, label: measurement.fromLabel || 'от' }, { kind: 'el', box: to, label: measurement.toLabel || 'до' }, { kind: 'padding', box: gap, label: `${measurement.label || 'зазор'} ${end - start} px` }] };
  }
  return result;
}
