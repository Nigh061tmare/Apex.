export function createInitialCombatState(roster, config = {}) {
  // Separates rosterProfile from runtimeCombatState to prevent master DB mutation
  return roster.map(char => {
    if (!char) return null;
    const clone = JSON.parse(JSON.stringify(char)); // deep clone to prevent contamination
    
    // Inject runtime fields directly so SimulationEngine doesn't need to change its property access
    return {
      ...clone,
      runtimeId: crypto.randomUUID(),
      originalRefId: char.id,
      hp: config.customHp !== undefined ? config.customHp : 100,
      stm: config.customStm !== undefined ? config.customStm : 100,
      ki: config.customKi !== undefined ? config.customKi : 100,
      vitalStatus: 'alive-optimal', // 'alive-optimal', 'alive-critical', 'ko', 'dead', 'erased', 'retreat'
      combatOutcome: 'pending',     // 'pending', 'victory', 'defeat', 'retreat', 'draw'
      missionOutcome: 'pending',    // 'pending', 'success', 'failure', 'partial'
      activeBuffs: [],
      activeDebuffs: [],
      cooldowns: {}
    };
  }).filter(Boolean);
}
