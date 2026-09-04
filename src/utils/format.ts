export const formatCost = (cost: number): string =>
  !Number.isFinite(cost) ? '∞' : Number.isInteger(cost) ? String(cost) : cost.toFixed(2);

export const formatInt = (n: number): string => n.toLocaleString('en-US');
