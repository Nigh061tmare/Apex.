// src/scripts/applyPowerHook.js
import { calcPower } from './calcPower.js';

/**
 * Hook universal que aplica el motor de cálculo de Ki, APEX-Ki y estadísticas
 * a cualquier personaje (nuevo, importado, o generado por IA).
 */
export function applyPowerHook(character) {
  return calcPower(character);
}
