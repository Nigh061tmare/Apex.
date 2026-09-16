# 📋 INFORME TÉCNICO: Superficie de API del Motor de Combate APEX
## Fecha: 15/09/2026 | Repositorio: `Z:\apex-powerscaling-engine`
## Propósito: Integración de nuevas mecánicas biológicas canon (Zenkai, regeneración Namekiana, energía perpetua androide, etc.)

> **NOTA**: Este documento es de SOLO LECTURA. No modifica ningún archivo del repositorio.
> Todas las firmas, nombres de funciones, parámetros y valores de retorno están citados literalmente del código fuente.

---

## 0. ESTRUCTURA GENERAL DEL REPOSITORIO

- **Framework**: React 19 + Vite 6, tipo módulo ESM (`"type": "module"` en `package.json`)
- **Motor de IA**: OpenCode (variables `BUILTIN_OPENROUTER_KEYS`, `BUILTIN_OPENCODE_KEYS` en `simulationEngine.js`)
- **Servidor backend**: Express (`server.cjs`)
- **Despliegue**: Vercel (`npx vercel --prod --yes --token $VERCEL_TOKEN`)
- **Roster canónico oficial**: `ROSTER_NIVELES_PODER_CORREGIDO_V22.json` (737,728 bytes, baseline V22 congelado)
- **Roster activo dinámico**: `src/data/characters.js` (6,804 bytes, carga dinámica diferida vía `rosterLoader.js`)

---

## 1. LISTA COMPLETA DE ARCHIVOS EN `src/lib/` Y `src/services/`

### 1.1 `src/lib/` (12 archivos)

| Archivo | Exports principales | Propósito |
|---|---|---|
| `apexFusionEngine.js` | `FUSION_METHODS`, `generateFusedName()`, `calculateFusionKi()`, `deriveFusionTier()`, `forgeHybridTechniques()`, `fuseCharacters()` | Motor de fusión (Potara, Metamoru, What-If). Calcula Ki fusionado y nombres canónicos/What-If. |
| `apexImagePlaceholders.js` | `getFranchiseTheme()`, `getInitials()`, `hashString()`, `buildFranchisePlaceholder()`, `buildUserPlaceholder()` | Genera placeholders visuales para personajes según franquicia. |
| `apexImageResolver.js` | `isUsable()`, `resolveCharacterImage()`, `resolveCharacterImageOrPlaceholder()`, `resolveNpcImage()`, `resolveUserAvatar()`, `hasRealImage()`, `IMAGE_INDEX_SIZE`, `FORM_IMAGE_INDEX_SIZE` | Resuelve imágenes de personajes con fallback a placeholders. |
| `apexTierSystem.js` | `TIER_ORDER[]`, `APEX_KI_LOG10_ANCHORS{}`, `TEMP_PROFILES{}`, `SCOUTER_ENERGY_ANCHORS{}`, `getTierRank()`, `getTierLog10()`, `getBaseApexKiLog10()`, `getScouterEnergy()`, `getScaledScouterEnergy()`, `formatApexKiFromLog10()`, `formatApexKi()`, `formatSourceKi()`, `calculateQuality()`, `calculateScores()`, `getEstimatedTierFromApexKi()` | **Núcleo del sistema de Tiers y Ki**. Tabla de órden de tiers, anclajes log10, formato de números, cálculo de calidad y scores. Ver Sección 3. |
| `characterImages.js` | `getCharacterImage()`, `getCharacterImageWithFallback()`, `getNpcImage()`, `getUserAvatar()`, `CHARACTER_IMAGES_COUNT` | Abstracción de imágenes de personajes y NPCs. |
| `chronicleContracts.js` | `CHRONICLE_VERSION`, `CHRONICLE_CONTINUITY_MODES`, `SCENE_TYPES`, `RELATIONSHIP_TYPES`, `CHRONICLE_TONES`, `CHRONICLE_PRESET_TEMPLATES[]`, `createTrainingProgressState()`, `createFactionState()`, `createNPCState()`, `createChronicleScene()`, `createChronicleState()`, `advanceChronicleScene()`, `compactChronicleHistory()`, `generateChronicleRecap()`, `CHRONICLE_RULES_PRESETS[]`, `generateSceneBranchOptions()`, `BIOMECHANICAL_CONDITIONS{}`, `applyBiomechanicalInjury()`, `healCharacterInjuries()`, `TACTICAL_ACTIONS[]`, `ENVIRONMENTAL_HAZARDS[]`, `rollTacticalContingency()` | **Sistema de crónicas narrativas**. 12 tipos de escena, facciones, PNJs, relaciones, progreso de entrenamiento, lesiones biomecánicas persistentes, tiradas tácticas D20 híbridas. Ver Sección 7. |
| `combatStateResolver.js` | `findStateInCharacter()`, `resolveCombatState()` | **Resolver único de estado de combate**. Prioriza `numericStats.apexKi` real sobre anclajes de tier. Ver Sección 2. |
| `crossFranchiseBridge.js` | `DEFAULT_BRIDGE_CONFIG`, `ENERGY_SYSTEM_MAP`, `getTierDistance()`, `evaluateInterdimensionalModifiers()` | Puente entre franquicias. Mapea sistemas de energía entre universos. |
| `dailyMatchup.js` | `getDailySeed()`, `hashNumber()`, `dateLabel()`, `getDailyMatchup()`, `buildShareableUrl()`, `parseShareableUrl()` | Sistema de combates diarios y URLs compartibles. |
| `externalEntityFramework.js` | `VALID_EXTERNAL_ENTITY_TYPES[]`, `QUALITATIVE_RESONANCE_LEVELS[]`, `QUALITATIVE_SUMMON_STATES[]`, `classifyExternalEntity()`, `getBodilyForms()`, `getExternalEntities()`, `validateExternalEntityReference()`, `resolveExternalEntityAvailability()`, `selectContextualExternalEntity()`, `resolveExternalEntityCombatState()`, `getExternalEntityUiModel()` | **Framework de entidades externas** (summons, stands, shikigamis, mechs, ghost warriors). `bodyStatIsolation: true` por defecto. Ver Sección 8. |
| `simulationContractsV2.js` | `ENGINE_VERSION_V2`, `RULESET_VERSION_V2`, `ROSTER_VERSION_CANONICAL`, `SOURCE_TYPES{}`, `ACTION_SOURCES[]`, `PERSISTENCE_MODES{}`, `UI_BADGES{}`, `ORACLE_FAMILIES{}`, `createDeterministicPRNG()`, `createSimulationSnapshotV2()`, `createCombatState()`, `createTemporalAwakeningState()`, `createFusionCombatState()`, `createAbsorptionState()`, `createEventEntityState()`, `createCampaignState()`, `deriveDeterministicFusionName()`, `validateKnownFusionAlias()`, `resolveAnatomicalPenalty()`, `CANONICAL_TECHNIQUE_SAGA_RESTRICTIONS{}` | **Contratos de simulación V2**. Tres capas de arquitectura (Canonical Roster Fact / Scenario & Oracle / Simulation Outcome). Ver Sección 5. |
| `simulationIntegrityValidator.js` | (no inspeccionado en detalle; importado por `combatSimulationCore.js` como `validateSimulationIntegrity`) | Validador de integridad de simulación. |

### 1.2 `src/services/` (17 archivos)

| Archivo | Exports principales | Propósito |
|---|---|---|
| `aiMatchmakerCore.js` | `parseMatchupPrompt()`, `generateApexDetailedCharacter()` | Parser de lenguaje natural de prompts de combate. Detecta modo, modificadores, eventos Oráculo, escenarios y formas solicitadas. Genera personajes detallados APEX. |
| `apexPowerScalingCore.js` | `TIER_ORDER[]`, `assert()`, `normalizeText()`, `makeVariantId()`, `tierIndex()`, `clamp01()`, `withinTierQuality()`, `calculateApexPL()`, `comparePL()`, `assertMonotonic()`, `calculateApexKiEquivalent()` | **Cálculo invariant de PL**. Ordinal de combate: `PL = rank * 101 + quality`. `withinTierQuality` usa pesos: ap 0.62, speed 0.12, durability 0.12, form 0.06, battleIQ 0.05, haxReliability 0.03. |
| `cloudSyncService.js` | `CloudSync` (instancia) | Sincronización con la nube. |
| `combatSimulationCore.js` | `RULE_AUTHORITY_HIERARCHY[]`, `STANDARD_EXTERNAL_ITEMS{}`, `ORACLE_EVENT_CONFIG{}`, `ORACLE_EVENT_PERMISSIONS{}`, `canUseState()`, `canUseAbility()`, `canUseItem()`, `useExternalItem()`, `canCombineStates()`, `getBaseAdvantage()`, `createCombatSnapshot()`, `validateCombatSnapshot()`, `validateUserSelections()`, `resolveFusingCombatants()`, `triggerOracleEvent()`, `executeCombatSimulation()`, `synthesizeNarrativeFromValidatedLog()` | **Núcleo de simulación de combate**. Snapshot congelado, permisos, Oracle Events, ejecución de turnos. Ver Sección 4 y 5. |
| `franchiseHelper.js` | `FRANCHISE_GROUPS[]`, `groupCharactersByFranchise()`, `getFranchiseCategoriesList()`, `UNIVERSE_PRESETS[]`, `DB_PACKS[]`, `THEME_PACKS[]` | Clasificación automática de personajes por franquicia y universo. |
| `i18n.js` | `SUPPORTED_LANGUAGES[]`, `TRANSLATIONS{}`, `getTranslation()`, `translateCombatChronicle()` | Internacionalización (es/en). |
| `modelRouter.js` | `FREE_MODEL_CATALOG{}`, `classifyTask()`, `selectModel()`, `buildOpenCodeTaskPayload()` | Enrutamiento de tareas a modelos de IA gratuitos. |
| `narrativeFormatter.js` | `NARRATIVE_TEMPLATES{}`, `formatCombatEvent()`, `enrichMatchNarrative()` | Plantillas narrativas para eventos de combate (STRIKE_HEAVY, ENERGY_BLAST, HAX_ABILITY, TRANSFORMATION, DEFENSE_GUARD). |
| `needsReviewService.js` | `V25_PENDING_GATES{}`, `getCharacterNeedsReviewNotice()`, `isCharacterInNeedsReview()`, `getNeedsReviewWarningText()`, `formatNeedsReviewSimulationNotice()` | Servicio de revisión editorial. NO aplica cambios automáticos. |
| `obsidianBridge.js` | `ObsidianBridge` (`formatForObsidian()`) | Puente bidireccional con Obsidian. Genera frontmatter YAML, wikilinks `[[...]]` y tags. |
| `scouterEngine.js` | `KNOWN_CANON_DB_LEVELS[]`, `getCharacterSignatureVariance()`, `getBaseEnergyFromTier()`, `getSpeedFactor()`, `getDurabilityFactor()`, `getHaxBiqFactor()`, `getFeatsAndStrengthFactor()`, `getPowerLevelFormulaBreakdown()`, `calculateScouterReading()` | **Motor Scouter y Power Level**. Fórmula universal: `PL = BaseEnergy(Tier) × SpeedFactor × DurabilityMod × HaxBIQMod × FormMultiplier`. Ver Sección 3. |
| `semanticSearch.js` | `searchCharactersByConcept()` | Búsqueda semántica por conceptos, hax, arquetipos y hazañas. |
| `simulationEngine.js` | `resolveMaxOutputTokens()`, `BUILTIN_OPENROUTER_KEYS[]`, `BUILTIN_OPENCODE_KEYS[]`, `resolveCandidateApiKeys()`, `SimulationEngine` (objeto con `generateMasterPrompt()`) | **Generador de prompts de simulación**. Detecta modo automáticamente (maratón, novela, relámpago, torneo, etc.). Ver Sección 4. |
| `soundFx.js` | `SoundFX` (instancia) | Sistema de efectos de sonido. |
| `synergyEngine.js` | `RAID_BOSS_TIERS[]`, `calculateSquadSynergy()` | Sinergias de escuadrón y escalado de Raid Boss. 6 niveles de buff (1.20x a 5.00x). |
| `translatorService.js` | `translateWithGoogle()`, `translateArrayWithGoogle()`, `translateCharacterSheet()` | Traducción vía Google Translate API. |
| `uxFeedback.js` | `apexNotify()`, `apexNotifyError()`, `apexNotifySuccess()`, `patchNativeAlerts()` | Sistema de notificaciones UI. |

---

## 2. `src/lib/combatStateResolver.js` — El Resolver Central de Combate

### 2.1 Firma principal

```javascript
// LÍNEA 146
export function resolveCombatState(character, activeStateId = 'base', scenario = {}) {
```

**Parámetros:**
- `character` (objeto): Personaje completo del roster con `forms`, `numericStats`, `tier`, etc.
- `activeStateId` (string, default `'base'`): ID de la forma/estado activo.
- `scenario` (objeto, default `{}`): Contexto de escenario (pasa `allCharacters`).

**Retorno: Objeto con las siguientes claves exactas** (líneas 545-577):

```javascript
return {
    characterId,          // string: "id-trimmed"
    activeStateId,        // string: 'base' o stateObj.id
    stateName,            // string: nombre de la forma activa

    tierExact,            // string: tier activo (ej: "5-A")
    tierRank,             // int|null: índice en TIER_ORDER
    withinTierScore,      // int 0-100: calidad dentro del tier
    powerKey,             // int: tierRank * 101 + withinTierScore
    apexScore,            // string: "rank.XX" o null

    baseApexKiLog10,      // float|null: log10 del Ki base
    currentApexKiLog10,   // float|null: log10 del Ki con forma activa
    apexKiDisplay,        // string: formateado (ej: "82.500.000.000 Ki")
    apexKiRaw,            // number|null: valor numérico bruto
    apexKiStatus,         // string: 'resolved' | 'unresolved' | 'transcendent' | 'boundless'

    scalingMethod,        // string: método de escalado usado
    formMultiplier,       // float: multiplicador de forma (1.0 = base)
    multiplierDisplay,    // string: "×1" o "×50"

    sourceKiBase,         // number|null: Ki Scouter base
    sourceKiCurrent,      // number|null: Ki Scouter con forma
    sourceKiDisplay,      // string: formateado
    sourceKiStatus,       // string: 'verified' | 'character-stats' | 'canonical-db' | etc.

    activeStats,          // object: stats modificados (ap, speed, durability, formControl, battleIQ, haxReliability)
    statModifiers,        // object: modificadores de la forma activa

    specialMechanics,     // array: mecánicas especiales (character + state merged)
    warnings,             // array<string>: advertencias de calibración
    manualReviewRequired  // boolean: true si warnings.length > 0 || apexKiStatus === 'unresolved'
};
```

### 2.2 Cómo calcula/prioriza `numericStats.apexKi`

**Línea 173**: Se extrae el Ki real calibrado del personaje:
```javascript
const realKi = character.numericStats?.apexKi || character.baseKiNumeric || character.apexKi || character.ki;
```

**Líneas 174-176**: Se convierte a log10:
```javascript
const baseApexKiLog10 = validPositive(realKi)
    ? Math.log10(realKi)
    : (baseTierRank !== null ? getBaseApexKiLog10(cleanBaseTier, baseWithinTierScore) : null);
```

**Principio constitucional** (comentario líneas 169-172):
> "PREFERIR el Ki real calibrado del roster (patrón de oro) sobre el ancla del tier. Antes se usaba SIEMPRE `getBaseApexKiLog10(tier)`, cuyos anclajes estaban inflados (ej. 'Low 2-C' = log10 50) → personajes con tier alto mostraban 10^50 aunque su APEX-Ki real fuera 10^11. Ahora se usa `log10(Ki real)` cuando existe."

### 2.3 Algoritmo de escalado de forma (6 prioridades, P1-P7)

Cuando `isTrulyBase === false` y existe `stateObj`:

1. **P1 - `explicitMult`** (línea 315): `stateObj.apexKiMultiplier` o `stateObj.multiplier` numérico. `formMultiplier = explicitMult`, `currentApexKiLog10 = baseApexKiLog10 + log10(formMultiplier)`.
2. **P2 - `explicit apexKi`** (línea 324): Si `stateObj.apexKi` existe, `formMultiplier = stateObj.apexKi / baseKi`.
3. **P4 - `FORM_SCALING_CONFIG` alias lookup** (línea 332): Busca coincidencia más específica en `FORM_SCALING_CONFIG[universeKey]` usando `candidateSegments` del nombre/forma.
4. **P5 - `active-tier`** (línea 402): Si la forma tiene `tierExact` diferente al base, calcula `formMultiplier = 10^(targetLog10 - baseApexKiLog10)`.
5. **P6 - `db-source-ratio`** (línea 434): Si `sourceKiCurrent / sourceKiBase > 0`, usa la ratio como multiplicador.
6. **P7 - `unresolved` fallback** (línea 446): `formMultiplier = 1.0`, `currentApexKiLog10 = baseApexKiLog10`.

### 2.4 `manualReviewRequired`

**Línea 576**:
```javascript
manualReviewRequired: warnings.length > 0 || apexKiStatus === 'unresolved'
```

Se genera `warnings.push(...)` cuando:
- Tier base no reconocido en `TIER_ORDER` (línea 162)
- Forma/Estado no encontrado en el árbol de formas (línea 252)
- Forma sin escalado APEX configurado (línea 447)

### 2.5 Función `findStateInCharacter`

```javascript
// LÍNEA 116
export function findStateInCharacter(character, stateId) {
```

Busca en 12 colecciones posibles: `forms`, `transformations`, `states`, `modes`, `variants`, `powerUps`, `releases`, `armors`, `fusions`, `absorptions`, `awakenings`, `fusionMethods`.

---

## 3. `src/services/scouterEngine.js` — Motor Scouter y Power Level

### 3.1 Firma de `getCharacterSignatureVariance` (CÓPIA LITERAL)

```javascript
// LÍNEAS 154-164
export function getCharacterSignatureVariance(char) {
  if (!char) return 1.0;
  let hash = 0;
  const str = `${char.id || ''}_${char.name || ''}_${char.alias || ''}_${typeof char.speed === 'object' ? JSON.stringify(char.speed) : char.speed || ''}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const norm = Math.abs(hash % 1000) / 1000;
  return 0.88 + (norm * 0.36); // Genera una modulación natural entre 0.88x y 1.24x
}
```

**Propósito**: Genera una varianza contextual determinística basada en la firma única del personaje (id + name + alias + speed). Evita números planos o por defecto idénticos entre diferentes luchadores. El retorno es siempre `float` entre `0.88` y `1.24`.

### 3.2 Todas las funciones exportadas de `scouterEngine.js`

| Función | Firma | Propósito |
|---|---|---|
| `KNOWN_CANON_DB_LEVELS` | `export const KNOWN_CANON_DB_LEVELS: [...]` | Array de ~100 patrones regex con `base`, `max`, `name`, `pattern`, `calculatedOnly`. Mapeo canónico exacto de personajes DB. |
| `getCharacterSignatureVariance` | `(char) => number` | Varianza determinística 0.88x-1.24x por personaje. |
| `getBaseEnergyFromTier` | `(tierStr = '', character = null) => { value, label, joules }` | Energía base por tier con modulación de firma. Devuelve `Infinity` para Tier 1-A/0. |
| `getSpeedFactor` | `(speedStr = '') => { factor, label }` | Factor de velocidad (1.0 a 5.0). MFTL+ = 3.5x, FTL+ = 2.2x, Hipersónico = 1.15x, etc. |
| `getDurabilityFactor` | `(durabilityStr = '', haxTags = []) => { factor, label }` | Factor de durabilidad (1.0 a 2.0). Inmortalidad +0.4, Regeneración +0.25, Adaptación +0.2. |
| `getHaxBiqFactor` | `(battleIQStr = '', haxTags = []) => { factor, label }` | Factor Hax+IQ (1.0 a 2.2). 8+ haxTags = +0.4, Battle IQ 'genio' = +0.3. |
| `getFeatsAndStrengthFactor` | `(feats = [], strength = {}, arsenal = {}) => { factor, label }` | Factor de hazañas y fuerza (1.0 a 2.5). Hazaña multiversal = +0.3, fuerza inconmensurable = +0.25. |
| `getPowerLevelFormulaBreakdown` | `(character, activeFormId) => { ... }` | **Desglose completo de la fórmula**: retorna ~30 claves incluyendo `apexPL`, `apexKi`, `apexKiRaw`, `finalPowerLevel`, `formMultiplier`, `combatModifiers.initiative/dodgeChance/hitChance`, `formulaExpression`, `closestDbComparison`. |
| `calculateScouterReading` | `(character, activeFormId) => { rawValue, formatted, rank, isOverload }` | Calcula y formatea la lectura Scouter. |

### 3.3 Fórmula universal del Scouter (del comentario de archivo, línea 5-6)

```
PL = BaseEnergy(Tier) × SpeedFactor × DurabilityMod × HaxBIQMod × FormMultiplier
```

---

## 4. MOTOR DE SIMULACIÓN DE COMBATE: FSM Y FASES

### 4.1 ¿Existe una FSM de fases?

**No existe una FSM implementada como clase o máquina de estados finitos en código.** Las fases de combate están definidas como datos, no como código ejecutable con estados.

### 4.2 Definición de fases en `combatResolutionEngine.js`

```javascript
// LÍNEAS 7-20
export const COMBAT_RESOLUTION_ORDER = [
    "Fase 0 — Validación de Escena (Presencia física, consciencia, bandos, distancias, collateral_risk y rehenes/civiles)",
    "Fase 1 — Estados de Inicio de Turno (Aplicación de DoTs, sangrados, drenajes de energía y penalizaciones)",
    "Fase 2 — Pasivas Automáticas (Regeneración base, auras, absorción continua, divine_resonance, sin anulación total gratuita)",
    "Fase 3 — Campo de Batalla y Entorno (Hazard zones, space_folded, containment_field, radiación, clima y oxígeno)",
    "Fase 4 — Iniciativa, Velocidad y Percepción (Cálculo de velocidad cinética/relativa, precognición y emboscadas)",
    "Fase 5 — Sinergias de Equipo (Validación de tags, miembros conscientes, rango métrico y roles tácticos)",
    "Fase 6 — Declaración de Acción (Validación de restricciones: focus_broken, transformation_locked, joint_lock, cooldowns)",
    "Fase 7 — Validación de Combo (Comprobación de triggers, recursos de todos los integrantes y counter-tags del rival)",
    "Fase 8 — Resolución de Defensas por Capas (Posición -> Física -> Barrera -> Energía -> Biología -> Mente -> Alma -> Espacio -> Causalidad)",
    "Fase 9 — Daño, Estados y Consecuencias (Daño directo, daño a barreras, lesiones anatómicas, exposición de núcleos y entorno)",
    "Fase 10 — Transformaciones y Fases de Boss (Limit break, berserker_escalation, desperation_protocol y transición de Boss)",
    "Fase 11 — Fin de Turno (Regeneración con coste real, recuperación parcial, decremento de cooldowns y actualización de Combat Log)"
];
```

**12 fases (0-11)**. Son cadenas descriptivas, no funciones ejecutables. La resolución se ejecuta en el prompt generado por `simulationEngine.js`.

### 4.3 Función que resuelve la simulación: `executeCombatSimulation`

```javascript
// LÍNEA 1556 de src/services/combatSimulationCore.js
export function executeCombatSimulation(snapshot) {
```

**Parámetro**: `snapshot` (objeto `SimulationSnapshotV2` congelado).
**Retorno**: Log de combate estructurado con turnos, fases, biometrics y veredicto.

### 4.4 `createCombatState` — Estructura de estado de combate runtime

```javascript
// LÍNEAS 407-446 de src/services/simulationContractsV2.js
export function createCombatState({
    hp = 100,
    maxHp = 100,
    stamina = 100,
    maxStamina = 100,
    kiReserve = 100,
    activeForm = 'base',
    activePowerTree = 'standard',
    activeBuffs = [],
    activeDebuffs = [],
    injuries = [],
    combatCapabilities = {
        canUseTwoHands: true,
        movementEfficiency: 1.0,
        perceptionEfficiency: 1.0,
        reactionEfficiency: 1.0
    },
    haxStates = {},
    externalEntities = [],
    objectiveStatus = 'in_progress',
    timelineStatus = 'stable'
} = {}) {
```

**Retorno**: Objeto congelado con `hp`, `maxHp`, `stamina`, `maxStamina`, `kiReserve`, `activeForm`, `activePowerTree`, `activeBuffs`, `activeDebuffs`, `injuries`, `combatCapabilities`, `haxStates`, `externalEntities`, `objectiveStatus`, `timelineStatus`.

### 4.5 `createCombatSnapshot` — Snapshot congelado pre-simulación

```javascript
// LÍNEA 1006 de src/services/combatSimulationCore.js
export function createCombatSnapshot({
    scenario = {},
    teamA = [],
    teamB = [],
    selectedOracleEvents = [],
    allCharacters = [],
    userSelections = {}
} = {}) {
```

**Proceso**:
1. Para cada combatiente, llama `resolveCombatState(char, 'base', { allCharacters })` (línea 1052)
2. Si el resultado tiene `manualReviewRequired`, aplica fallback con `fallbackTier` (línea 1058)
3. Asigna `hp: 100`, `stamina: 100` a cada participante (línea 1103-1104)
4. Construye `itemInventory` con objetos externos (`senzu-bean`, `standard-healing-capsule`)
5. Retorna `SimulationSnapshotV2` congelado con `participants`, `permissions`, `oracleEvents`, `itemInventory`

### 4.6 Sistema de Boss en 3 fases (`BOSS_SYSTEM_STRUCTURE`)

```javascript
// LÍNEAS 163-182 de src/data/combatResolutionEngine.js
export const BOSS_SYSTEM_STRUCTURE = {
    phase1: {
        name: "Fase 1: Máscara de Control & Observación",
        mechanic: "boss_analysis",
        effect: "El Boss reduce daño de técnicas repetidas en un 20%..."
    },
    phase2: {
        name: "Fase 2: Quiebre de Contención & Escalada",
        trigger: "HP < 60% o daño al orgullo del Boss",
        mechanic: "world_breaking_pressure / hazard_zone",
        effect: "Aumento de AP pero pérdida de precisión..."
    },
    phase3: {
        name: "Fase 3: Protocolo de Desesperación / Forma Verdadera",
        trigger: "HP < 25%",
        mechanic: "desperation_protocol",
        effect: "+35% AP, +20% velocidad, acceso a Finisher final.",
        mandatoryWeakness: "exposed_core obligatorio..."
    }
};
```

---

## 5. SISTEMA DE STAMINA

### 5.1 Definición de `staminaProfile`

**`staminaProfile` NO se define como constante única en código JS.** Existe como propiedad de cada personaje individual en los datos JSON (`src/data/characters.js`, `src/data/apex_golden_enriched_all.json`).

**Estructura típica en JSON** (patrón observado en `apex_golden_enriched_all.json`, múltiples personajes):
```json
"staminaProfile": {
    "basePool": 100,
    "recoveryRate": 6,
    "exhaustionThreshold": 15,
    "recoveryRatePerTurn": 6
}
```

**Variantes observadas**:
- Algunos personajes usan `recoveryRatePerTurn` en lugar de `recoveryRate`
- `basePool` varía (50-200 según personaje)
- `exhaustionThreshold` típicamente entre 15-30

**Default fallback** (línea 316-317 de `apexGoldenStandardFixer.js`):
```javascript
if (!fixed.staminaProfile || typeof fixed.staminaProfile !== 'object') {
    fixed.staminaProfile = { basePool: 100, recoveryRate: 5, exhaustionThreshold: 20 };
}
```

### 5.2 Cómo se consume la stamina

1. **En `createCombatState`** (simulationContractsV2.js): `stamina` y `maxStamina` se inicializan a 100 cada uno por defecto, pero se sobrescriben con datos del personaje en `createCombatSnapshot` si existen.

2. **En UNIFIED_RESOURCE_POOLS** (combatResolutionEngine.js, línea 25-71):
```javascript
export const UNIFIED_RESOURCE_POOLS = {
    stamina: {
        name: "Stamina / Capacidad Física",
        desc: "Gasto en CQC pesado (10-25), esquivas consecutivas (5-15), grappling (10/turno) y combos marciales (25-45). Si <20% aplica exhaustion_state.",
        defaultMax: 100
    },
    ...
};
```

3. **Consumo narrativo en prompts**: `simulationEngine.js` genera instrucciones como:
   - "Gasto en CQC pesado (10-25), esquivas consecutivas (5-15)..."
   - "Si <20% aplica `exhaustion_state`"
   - El `exhaustion_state` causa `-20% velocidad, -15% AP y bloqueo de formas de control fino` (PERSISTENT_COMBAT_STATUSES, línea 196)

4. **En la Fase 11** del orden de resolución: "Regeneración con coste real, recuperación parcial, decremento de cooldowns"

### 5.3 `staminaProfile` en UI

En `src/components/CharacterModal.jsx` (línea 1027):
```jsx
<span className="text-cyan-300 font-bold font-mono">{formData.staminaProfile?.basePool || 100} HP (Rec: {formData.staminaProfile?.recoveryRate || 6}/s)</span>
```

---

## 6. SISTEMA DE PASIVAS / PASIVAS BIOLÓGICAS EN COMBATE

### 6.1 ¿Dónde se definen?

Las pasivas biológicas se definen en el **arsenal de cada personaje** como:
```json
"arsenal": {
    "passives": [
        {
            "id": "passive-zenkai-01",
            "name": "Zenkai Reactivo",
            "desc": "Incrementa poder tras sobrevivir y sanar de lesiones graves."
        }
    ]
}
```

### 6.2 ¿Cómo se aplican en combate?

**No hay un sistema de ejecución automática de pasivas en el código.** Las pasivas son **datos que el LLM lee y aplica durante la simulación** a través del prompt generado por `simulationEngine.js`.

El flujo es:
1. `createCombatSnapshot()` extrae `allowedAbilities` del personaje (línea 1080-1082):
```javascript
const abilities = (Array.isArray(char.arsenal) ? char.arsenal.map(a => a.id || a.name || a) : [])
    .concat(Array.isArray(char.techniques) ? char.techniques.map(t => t.id || t.name || t) : []);
```
2. `generateMasterPrompt()` en `simulationEngine.js` formatea las pasivas para el LLM (línea 431):
```javascript
const passives = char.arsenal?.passives?.map(p => `✦ PASIVA: ${p.name}: ${p.desc}`).join('\n') || 'Ninguna';
```
3. El LLM aplica las pasivas durante la narración según las **Reglas de Oro** (Regla 1: "Saiyajins: Zenkai Reactivo, Voluntad Inquebrantable, Adaptación Marcial, Orgullo de Guerrero").

### 6.3 Reglas constitucionales de pasivas biológicas (Regla de Oro 1 de `simulationEngine.js`, líneas 264-270)

- **Saiyajins**: Zenkai Reactivo, Voluntad Inquebrantable, Adaptación Marcial, Orgullo de Guerrero. **PROHIBIDO** asimilación genética biológica o absorción celular.
- **Bio-Androides/Majin/Parásitos (Cell, Majin Buu, Moro, Baby)**: ÚNICOS autorizados para Absorción Celular/Genética, Asimilación de ADN, Regeneración Extrema Atómica y Mimetismo Biológico.
- **Demonios/Muertos Maldiciones (Muzan, Akaza, DIO, Sukuna, Mahito)**: Regeneración Celular Maldita, Consumo de Sangre y Manipulación de Carne.
- **Deidades/Hakaishin (Beerus, Whis, Zeno)**: Aura Divina Trascendental, Borrado Conceptual (Hakai), Juicio Cósmico.

### 6.4 Pasivas en `tagMechanicsSystem.js`

```javascript
// src/data/tagMechanicsSystem.js - LÍNEAS 5-30+
export const TAG_SYNERGIES = [
    { id: "syn-ki-divino", name: "Resonancia de Ki Divino", requiredTags: ["Ki Divino"], minMatches: 2, effect: "..." },
    { id: "syn-simbiosis-absorcion", name: "Simbiosis de Absorción", requiredTags: ["Absorbedor Orgánico", "Regenerador Celular"], minMatches: 2, effect: "..." },
    // ... más sinergias por tags
];
```

---

## 7. `src/data/`: ARCHIVOS JSON RELEVANTES (NOMBRES + TAMAÑOS)

### 7.1 Archivos de roster y personajes principales

| Archivo | Tamaño | Propósito |
|---|---|---|
| `ROSTER_NIVELES_PODER_CORREGIDO_V22.json` | 737,728 bytes | **Baseline oficial V22** (congelado, 769 personajes, 68 parches auditados). |
| `ROSTER_NIVELES_PODER_CORREGIDO_V23.json` | — | Versión incremental V23 (existente en disco). |
| `ROSTER_NIVELES_PODER_CORREGIDO_V24.json` | — | Versión incremental V24. |
| `ROSTER_NIVELES_PODER_CORREGIDO_V25.json` | — | Versión incremental V25. |
| `ROSTER_NIVELES_PODER_CORREGIDO_V26.json` | — | Versión incremental V26 (rango actual del roster). |
| `characters.js` | 6,804 bytes | **Roster activo dinámico**. Exporta `INITIAL_CHARACTERS` y `DEPRECATED_RECORD_IDS`. Carga diferida vía `rosterLoader.js`. |
| `characters_backup_*.js` | Varios | Backups de auditoría del roster (timestamps en nombres). |

### 7.2 Datos de simulación y perfiles tácticos

| Archivo | Tamaño | Propósito |
|---|---|---|
| `tacticalProfiles.json` | 11,772,067 bytes (~11.2 MB) | **Perfiles tácticos masivos** con staminaProfile, haxTags, habilidades, debilidades. |
| `apex_golden_enriched_all.json` | 10,541,669 bytes (~10 MB) | **Roster enriquecido dorado** con staminaProfile, formScaling, todos los campos de la ficha perfecta. |
| `combatResolutionEngine.js` | 23,989 bytes | Orden de resolución (12 fases), pools de recursos, resistencias, HAX_LAYERS_HIERARCHY, boss system, PERSISTENT_COMBAT_STATUSES (48 estados), TIER_DIFFERENCE_RULES, ULTIMATE_REQUIREMENTS, CANONICAL_TECHNIQUE_SAGA_RESTRICTIONS. |
| `arenasArtifactsBosses.js` | 466+ bytes | Arenas dinámicas, artefactos, raid bosses, balance rules. |
| `tagMechanicsSystem.js` | 2,532+ bytes | Sistema de sinergias por tags, mecánicas de enemigos, hax tags. |
| `scenarios.js` | — | Escenarios de arena configurables. |
| `formScalingConfig.js` | 3,579 bytes | Configuración de scaling de formas por universo (dragon-ball config con ~30+ formas). |

### 7.3 Archivos de contexto y auditoría

| Archivo | Propósito |
|---|---|
| `apex-sim-context.json` | Contexto de simulación actual. |
| `apexCombatStateAudit.v3.json` | Auditoría de estado de combate v3. |
| `simulationAuditReport.json` | Reporte de auditoría de simulación. |
| `ROSTER_MAESTRO_V26_CANONICAL.md` | Documento maestro canónico V26. |
| `BACKUP_ROSTER_V26_*.json` | Múltiples backups de seguridad del roster V26 (fechados). |
| `manualReviewQueue.json` | Cola de revisión manual. |
| `enrichmentDrafts/` | Directorio de borradores de enriquecimiento (aislados del baseline). |
| `rosterDossier/` | Subdirectorio de dossiers tácticos. |

---

## 8. CARGA DE DATOS: PATRÓN DE IMPORTACIÓN

### 8.1 Roster principal (carga dinámica diferida)

```javascript
// src/data/rosterLoader.js (LÍNEAS 13-31)
export function loadRoster() {
  if (cache) return Promise.resolve(cache);
  if (!promise) {
    promise = import('./characters')
      .then((m) => {
        cache = {
          list: m.INITIAL_CHARACTERS || [],
          deprecated: m.DEPRECATED_RECORD_IDS || new Set()
        };
        return cache;
      })
      .catch((err) => { promise = null; throw err; });
  }
  return promise;
}

export function getRosterSync() {
  return cache ? cache.list : [];
}
```

**Patrón**: `import('./characters')` — carga dinámica ESM. El archivo `characters.js` pesa ~6.8KB y exporta `INITIAL_CHARACTERS`. El cache persiste tras la primera carga. Esto evita que el chunk inicial de la app incluya ~10MB de datos de personajes.

### 8.2 Imports estáticos de módulos JS

- `apexTierSystem.js` → importado por `combatStateResolver.js` y `apexPowerScalingCore.js`
- `scouterEngine.js` → importado por `combatStateResolver.js` y `getBaseEnergyFromTier` usado internamente
- `simulationContractsV2.js` → importado por `combatSimulationCore.js`
- `formScalingConfig.js` → importado por `combatStateResolver.js` como `FORM_SCALING_CONFIG`
- `arenasArtifactsBosses.js` → importado por `simulationEngine.js` y `combatSimulationCore.js`
- `combatResolutionEngine.js` → importado por `simulationEngine.js`

### 8.3 JSON grandes: ¿cómo se cargan?

- `tacticalProfiles.json` (11.2 MB) y `apex_golden_enriched_all.json` (10.5 MB) son **cargados por el servidor Express** (`server.cjs`) o por imports dinámicos desde el frontend.
- No se usan `fetch` desde el frontend para cargar el roster base. Los datos se inyectan en el bundle de Vite o se sirven via el servidor CORS-enabled (`cors` dependency en `package.json`).
- **No se usa IndexedDB** para el roster principal. La cache es en memoria (`cache` variable en `rosterLoader.js`) o `localStorage` para claves de API (`apex_provider_api_keys`, `apex_ai_config`).

### 8.4 IndexedDB / localStorage

- `localStorage` se usa solo para:
  - `apex_provider_api_keys` (claves de proveedores)
  - `apex_ai_config` (configuración de modelos)
- No se usa IndexedDB en el código fuente visible.

---

## 9. COMANDOS NPM DISPONIBLES (de `package.json`, copiados literales)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "node server.cjs",
    "start": "node server.cjs",
    "deploy": "node src/scripts/autoDeployVercel.js",
    "watch:deploy": "node src/scripts/watchAndSync.js",
    "opencode": "opencode .",
    "opencode:web": "node src/scripts/launchOpenCodeWeb.js",
    "opencode:clean": "node src/scripts/maintainOpenCodeDb.cjs",
    "opencode:model": "node src/scripts/selectOpenCodeModel.js",
    "opencode:new": "node src/scripts/createNewProject.js",
    "opencode:hub": "start CENTRO_DE_CONTROL.html",
    "apex:build-index": "node src/scripts/buildApexRosterIndex.js"
  }
}
```

**Nota de despliegue** (de `APEX_RULES.md`):
```powershell
npx vercel --prod --yes --token $VERCEL_TOKEN
```

---

## 10. ARQUITECTURA PARA INTEGRAR NUEVAS MECÁNICAS BIOLÓGICAS

### 10.1 Flujo recomendado para añadir una nueva passive biológica (ej: Zenkai)

1. **Añadir al roster** (`src/data/apex_golden_enriched_all.json` o el JSON de personaje individual):
```json
"arsenal": {
    "passives": [
        {
            "id": "passive-zenkai-01",
            "name": "Zenkai Reactivo",
            "desc": "Después de sobrevivir y sanar, el APEX-Ki se incrementa permanentemente.",
            "counterTags": ["StaminaBurn", "Overheat"]
        }
    ]
}
```

2. **Añadir al `tagMechanicsSystem.js`** (si aplica sinergia de equipo):
```javascript
{ id: "syn-zenkai", name: "Sinergia Zenkai", requiredTags: ["Zenkai Reactivo"], minMatches: 1, effect: "..." }
```

3. **Añadir a `PERSISTENT_COMBAT_STATUSES`** en `combatResolutionEngine.js` (si es un estado persistente):
```javascript
{ id: "zenkai_boost", name: "Boost Zenkai", category: "buff_risk", duration: 99, effect: "+X% AP tras recovery de lesión grave" }
```

4. **Añadir regla de Lore** en `simulationEngine.js` (Regla de Oro 1) si es específica de especie.

5. **Añadir restricción canónica** en `CANONICAL_TECHNIQUE_SAGA_RESTRICTIONS` en `simulationContractsV2.js` si aplica.

### 10.2 Puntos de extensión clave

| Mecánica | Archivo para modificar | Tipo de cambio |
|---|---|---|
| Nueva passive biológica | JSON de personaje + `arsenal.passives[]` | Datos, no código |
| Nuevo estado persistente (ej: "Zenkai Boost") | `PERSISTENT_COMBAT_STATUSES` en `combatResolutionEngine.js` | Array nuevo |
| Nuevo factor de Scouter (ej: regeneración namekiana) | `getDurabilityFactor()` en `scouterEngine.js` (línea 455) | Añadir `if` en la función |
| Nuevo tipo de energía (ej: "Energía Perpetua Androide") | `ENERGY_SYSTEM_MAP` en `crossFranchiseBridge.js` o `UNIFIED_RESOURCE_POOLS` en `combatResolutionEngine.js` | Añadir clave al objeto |
| Nueva fase de combate | `COMBAT_RESOLUTION_ORDER` en `combatResolutionEngine.js` | Insertar en array |
| Nuevo Oracle Event (ej: "Cosecha de Ki Perpetuo") | `ORACLE_EVENT_CONFIG` y `ORACLE_EVENT_PERMISSIONS` en `combatSimulationCore.js` | Dos objetos nuevos |
| Nuevo boss mechanic | `BOSS_SYSTEM_STRUCTURE` en `combatResolutionEngine.js` | Añadir fase |
| Restricción de técnica por saga | `CANONICAL_TECHNIQUE_SAGA_RESTRICTIONS` en `simulationContractsV2.js` | Añadir clave al objeto |
| Nuevo sistema de stamina personalizado | `staminaProfile` en cada personaje JSON | Dato por personaje |
| Nueva forma con multiplicador | `FORM_SCALING_CONFIG` en `formScalingConfig.js` | Añadir al objeto `dragon-ball` |

### 10.3 `resolveCombatState` — Cómo prioriza el APEX-Ki con nuevas mecánicas

La cadena de prioridad de Ki en `resolveCombatState` (líneas 173-524) es:
1. `character.numericStats?.apexKi` → `character.baseKiNumeric` → `character.apexKi` → `character.ki`
2. Si es DB sin sourceKi: busca `KNOWN_CANON_DB_LEVELS`
3. Para formas no-base: busca `stateObj.explicitSourceKi` → `stateObj.sourceKi` → `stateObj.kiNumeric` → `stateObj.apexKi` → `sourceKiBase * stateObj.sourceKiMultiplier`
4. Finalmente: `numericStats.apexKi * formMultiplier` (si el personaje tiene numericStats calibrados)
5. Fallback: `getPowerLevelFormulaBreakdown(character, activeStateId)` → `bd.finalPowerLevel`

---

## 11. DEPENDENCIAS Y VERSIONES

```
"dependencies": {
    "clsx": "^2.1.1",
    "cors": "^2.8.6",
    "express": "^4.22.2",
    "lucide-react": "^1.16.0",
    "picomatch": "^4.0.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.2"
}
```

---

## 12. NOTAS CRÍTICAS PARA INTEGRACIÓN BIOLÓGICA

### 12.1 El sistema de pasivas NO tiene ejecución automática

Las `passives` en `arsenal` son **datos declarativos**. El motor las renderiza en el prompt del LLM vía `simulationEngine.js`. No hay un intérprete de pasivas en runtime que aplique efectos automáticamente. Para que una passive biológica funcione en combate:
- Debe ser referenciada como `passive` en el arsenal del personaje
- Debe ser mencionada explícitamente en las `Reglas de Oro` de `simulationEngine.js` para que el LLM la aplique
- Para efectos numéricos reales, debe añadirse lógica en `combatSimulationCore.js` o `combatStateResolver.js`

### 12.2 El `staminaProfile` es por-personaje, no global

No existe un `staminaProfile` global aplicado a todos los personajes. Cada personaje en `tacticalProfiles.json` y `apex_golden_enriched_all.json` tiene su propio `staminaProfile` con valores únicos. Para añadir un mecanismo de stamina específico (ej: "regeneración namekiana con coste de Ki"), se debe:
- Modificar el `staminaProfile` individual de cada personaje afectado en el JSON
- O añadir un tratamiento especial en el prompt de simulación que aplique un modificador global

### 12.3 Las fases de combate (0-11) son descriptivas, no ejecutables

El array `COMBAT_RESOLUTION_ORDER` son **12 cadenas de texto**. No hay funciones asociadas a cada fase. La ejecución se delega al LLM a través de `generateMasterPrompt()` en `simulationEngine.js`. Para añadir una fase biológica (ej: "Fase de Regeneración"), se inserta la cadena en `COMBAT_RESOLUTION_ORDER` y se añade la lógica narrativa correspondiente en los templates de `simulationEngine.js`.

### 12.4 `getCharacterSignatureVariance` afecta TODOS los cálculos

Cada llamada a `getBaseEnergyFromTier(tierStr, character)` usa `getCharacterSignatureVariance(character)` para modular el valor base. Esto significa que cualquier persona con un `id`, `name` o `alias` diferente obtendrá un valor de energía base diferente (0.88x-1.24x). **Esto es crucial al añadir nuevos personajes**: su `id` y `name` determinan su modulación única.

---

*Fin del informe técnico. Todos los nombres de funciones, firmas, parámetros y valores de retorno han sido citados literalmente del código fuente del repositorio `Z:\apex-powerscaling-engine`.*

*Generado el 15/09/2026 por Agente Explorador de OpenCode.*
