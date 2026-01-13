/**
 * Clamps a number between a minimum and maximum value.
 * If min > max, the values are swapped automatically.
 * */

export const clamp = (v, min, max) => {
  if (min > max) [min, max] = [max, min];
  return Math.min(max, Math.max(min, v));
};