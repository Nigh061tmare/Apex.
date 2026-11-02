/**
 * APEX Power Scaling Engine — External Entity Framework (v1.0)
 * 
 * Centralized, reusable architecture for non-bodily combat entities:
 * - Invocaciones / Guerreros Fantasma (Summons / Ghost Warriors)
 * - Stands, Shikigami, Marionetas (Puppets), Familiares / Compañeros
 * - Mechas, Avatares, Entidades de Arma, Aliados Temporales
 * - Referencias Legacy y Proyecciones Contextuales de Simulación
 * 
 * CONSTITUTIONAL LAW:
 * External entities NEVER alter the owner's bodily stats:
 * - baseKiNumeric, baseTier, tier, forms, formMultiplier,
 *   multiplierDisplay, speed, durability, or stamina.
 * - bodyStatIsolation is strictly TRUE by default.
 */

export const VALID_EXTERNAL_ENTITY_TYPES = [
  'summon',
  'ghost_warrior',
  'stand',
  'shikigami',
  'puppet',
  'companion',
  'familiar',
  'mecha',
  'avatar',
  'weapon_entity',
  'temporary_ally',
  'legacy_reference',
  'contextual_projection',
  'event_entity'
];

export const QUALITATIVE_RESONANCE_LEVELS = ['low', 'medium', 'high', 'critical'];

export const QUALITATIVE_SUMMON_STATES = ['scouting', 'raid', 'overrun', 'elite_pincer', 'emergency'];

/**
 * Classifies an entity object into the standard APEX External Entity schema.
 */
export function classifyExternalEntity(entity = {}) {
  const rawType = entity.entityType || entity.type || 'summon';
  const entityType = VALID_EXTERNAL_ENTITY_TYPES.includes(rawType) ? rawType : 'summon';

  return {
    entityId: entity.entityId || entity.id || `entity-${Date.now()}`,
    displayName: entity.displayName || entity.name || 'Entidad Externa',
    entityType,
    relationshipType: entity.relationshipType || (entityType === 'stand' ? 'stand_projection' : 'summon'),
    ownerRecordId: entity.ownerRecordId || null,
    sourceRecordId: entity.sourceRecordId || null,
    sourceFormId: entity.sourceFormId || null,
    sourceFormIndex: typeof entity.sourceFormIndex === 'number' ? entity.sourceFormIndex : 0,
    referenceOnly: entity.referenceOnly === true || entityType === 'legacy_reference',
    legacyReference: entity.legacyReference === true || entityType === 'legacy_reference',
    simulationDesignOnly: entity.simulationDesignOnly === true || entityType === 'contextual_projection',
    canonicalStatus: entity.canonicalStatus || (entityType === 'contextual_projection' ? 'simulation_concept' : 'custom'),
    availability: entity.availability || (entityType === 'legacy_reference' ? 'legacy_reference_only' : 'conditional'),
    defaultAvailability: entity.defaultAvailability || 'conditional',
    requiresResonanceCondition: entity.requiresResonanceCondition ?? (entityType === 'contextual_projection'),
    requiresScenarioCondition: entity.requiresScenarioCondition ?? false,
    requiresResourceCondition: entity.requiresResourceCondition ?? true,
    requiresOpponentCondition: entity.requiresOpponentCondition ?? false,
    combatRole: entity.combatRole || 'support_or_harassment',
    selectionTags: Array.isArray(entity.selectionTags) ? entity.selectionTags : [],
    counterplayTags: Array.isArray(entity.counterplayTags) ? entity.counterplayTags : [],
    cooldownPolicy: entity.cooldownPolicy || 'standard_cooldown',
    reformationPolicy: entity.reformationPolicy || 'conditional_reformation',
    uiVisibility: entity.uiVisibility || 'external_entities_tab',
    bodyStatIsolation: true, // Inmutable: siempre aislado del cuerpo del owner
    notes: entity.notes || '',
    legacySource: entity.legacySource || null
  };
}

/**
 * Returns exclusively the genuine bodily transformation forms of a character.
 * Filters out legacy references, external summons, and non-bodily projections.
 * 
 * Centralized Single Source of Truth for CharacterCard, CharacterModal,
 * StatComparatorModal, and Combat Calculators.
 */
export function getBodilyForms(character) {
  if (!character || !Array.isArray(character.forms)) return [];

  // Dr. Raichi U3 special case: ghost-broly-unleashed is a Hatchiyack legacy summon, not a form
  if (character.id === 'dr-raichi-dbm-u3') {
    return character.forms.filter(f => f.id !== 'ghost-broly-unleashed');
  }

  // General filter: exclude any forms explicitly marked as external entity or legacy reference
  return character.forms.filter(f => {
    if (f.externalEntity === true || f.isExternalEntity === true) return false;
    if (f.category === 'external_entity' || f.category === 'legacy_summon') return false;
    if (f.bodyStatIsolation === true && f.relationshipType) return false;
    return true;
  });
}

/**
 * Retrieves all external entities belonging to or referenced by a character.
 */
export function getExternalEntities(character) {
  if (!character) return [];

  const entities = [];
  const profile = character.narrativeCombatProfile || {};

  // 1. Canonical Ghost Archive (Dr. Raichi or similar summoners)
  if (Array.isArray(profile.canonicalGhostArchive)) {
    for (const item of profile.canonicalGhostArchive) {
      entities.push(classifyExternalEntity({
        ...item,
        ownerRecordId: character.id
      }));
    }
  }

  // 2. Legacy Ghost References (Broly LSSJ in Raichi)
  if (Array.isArray(profile.legacyGhostReferences) && profile.legacyGhostReferences.length > 0) {
    for (const item of profile.legacyGhostReferences) {
      const isRaichiBroly = character.id === 'dr-raichi-dbm-u3' &&
        (item.entityId === 'ghost-broly-unleashed' || item.entityId === 'ghost-broly-legacy' || item.formId === 'ghost-broly-unleashed');
      if (isRaichiBroly) {
        entities.push(classifyExternalEntity({
          entityId: 'ghost-broly-legacy',
          displayName: 'Fantasma de Broly LSSJ (Legacy)',
          entityType: 'legacy_reference',
          relationshipType: 'summon',
          ownerRecordId: 'dr-raichi-dbm-u3',
          sourceRecordId: null,
          sourceFormId: 'ghost-broly-unleashed',
          sourceFormIndex: 1,
          referenceOnly: true,
          legacyReference: true,
          simulationDesignOnly: false,
          canonicalStatus: 'historical_legacy_v25',
          availability: 'legacy_reference_only',
          defaultAvailability: 'legacy_reference_only',
          bodyStatIsolation: true,
          notes: 'Referencia de invocación legacy preservada desde dr-raichi-dbm-u3.forms[1]. No corresponde a una ficha externa resuelta del roster, no es una transformación de Raichi, no modifica sus estadísticas y no es invocable automáticamente hasta un patch de migración de modelo explícitamente aprobado.',
          legacySource: {
            ownerRecordId: 'dr-raichi-dbm-u3',
            formId: 'ghost-broly-unleashed',
            formIndex: 1
          }
        }));
      } else {
        entities.push(classifyExternalEntity({
          ...item,
          ownerRecordId: character.id,
          entityType: 'legacy_reference',
          legacyReference: true,
          referenceOnly: true,
          availability: 'legacy_reference_only'
        }));
      }
    }
  } else if (character.id === 'dr-raichi-dbm-u3') {
    // Automatic fallback for Raichi if not defined in narrative profile
    const brolyForm = character.forms?.find(f => f.id === 'ghost-broly-unleashed');
    if (brolyForm) {
      entities.push(classifyExternalEntity({
        entityId: 'ghost-broly-legacy',
        displayName: 'Fantasma de Broly LSSJ (Legacy)',
        entityType: 'legacy_reference',
        relationshipType: 'summon',
        ownerRecordId: 'dr-raichi-dbm-u3',
        sourceRecordId: null,
        sourceFormId: 'ghost-broly-unleashed',
        sourceFormIndex: 1,
        referenceOnly: true,
        legacyReference: true,
        simulationDesignOnly: false,
        canonicalStatus: 'historical_legacy_v25',
        availability: 'legacy_reference_only',
        defaultAvailability: 'legacy_reference_only',
        bodyStatIsolation: true,
        notes: 'Referencia de invocación legacy preservada desde dr-raichi-dbm-u3.forms[1]. No corresponde a una ficha externa resuelta del roster, no es una transformación de Raichi, no modifica sus estadísticas y no es invocable automáticamente hasta un patch de migración de modelo explícitamente aprobado.',
        legacySource: {
          ownerRecordId: 'dr-raichi-dbm-u3',
          formId: 'ghost-broly-unleashed',
          formIndex: 1
        }
      }));
    }
  }

  // 3. SubEntity (Stands / Shikigami / Puppets)
  if (character.subEntity && character.subEntity.name) {
    const rawSubType = (character.subEntity.type || '').toLowerCase();
    let entityType = 'summon';
    if (rawSubType.includes('stand')) entityType = 'stand';
    else if (rawSubType.includes('shikigami')) entityType = 'shikigami';
    else if (rawSubType.includes('marioneta') || rawSubType.includes('puppet')) entityType = 'puppet';
    else if (rawSubType.includes('arma') || rawSubType.includes('weapon')) entityType = 'weapon_entity';

    entities.push(classifyExternalEntity({
      entityId: `${character.id}-subentity`,
      displayName: character.subEntity.name,
      entityType,
      relationshipType: entityType === 'stand' ? 'stand_projection' : 'familiar',
      ownerRecordId: character.id,
      canonicalStatus: 'canonical_profile',
      availability: 'usable_now',
      combatRole: character.subEntity.stats || 'combat_support',
      bodyStatIsolation: true,
      notes: typeof character.subEntity.stats === 'string' ? character.subEntity.stats : ''
    }));
  }

  return entities.map(e => {
    const val = validateExternalEntityReference(e, [], new Set(), character);
    if (val.status === 'unavailable_or_needs_source') {
      return { ...e, availability: 'unavailable_or_needs_source', validationStatus: val.status };
    }
    return e;
  });
}

/**
 * Validates an external entity against the active roster and deprecated list.
 */
export function validateExternalEntityReference(entity, activeRoster = [], deprecatedIds = new Set(), ownerCharacter = null) {
  const errors = [];

  if (!entity || typeof entity !== 'object') {
    return { valid: false, errors: ['Entidad externa inválida o vacía.'], resolvedCharacter: null };
  }

  if (entity.bodyStatIsolation !== true) {
    errors.push(`Violación constitucional: ${entity.displayName} debe tener bodyStatIsolation: true.`);
  }

  const isLegacy = entity.legacyReference === true || entity.entityType === 'legacy_reference';
  const sourceId = entity.sourceRecordId;
  let resolvedChar = null;

  if (isLegacy) {
    if (sourceId === null) {
      // Si legacyReference === true y sourceRecordId === null y legacySource.ownerRecordId existe:
      // validar que ownerRecordId coincide con el personaje propietario
      // y que legacySource.formId existe en character.forms cuando se disponga del owner context.
      // No marcar como error que una legacy reference tenga sourceRecordId null.
      if (entity.legacySource && entity.legacySource.ownerRecordId) {
        if (entity.ownerRecordId && entity.ownerRecordId !== entity.legacySource.ownerRecordId) {
          errors.push(`ownerRecordId '${entity.ownerRecordId}' no coincide con legacySource.ownerRecordId '${entity.legacySource.ownerRecordId}'.`);
        }
        const owner = ownerCharacter || (Array.isArray(activeRoster) ? activeRoster.find(c => c.id === entity.legacySource.ownerRecordId) : null);
        if (owner && Array.isArray(owner.forms)) {
          const formExists = owner.forms.some(f => f.id === entity.legacySource.formId);
          if (!formExists) {
            errors.push(`Forma legacy '${entity.legacySource.formId}' no encontrada en character.forms de '${entity.legacySource.ownerRecordId}'.`);
          }
        }
      }
    } else {
      // Si una legacy reference tiene sourceRecordId no null:
      // validarlo contra V25.activeRoster. Si no existe, devolver: unavailable_or_needs_source, sin inventar sustituciones.
      if (deprecatedIds.has(sourceId)) {
        errors.push(`Referencia a registro deprecado prohibida: sourceRecordId '${sourceId}' está archivado.`);
      } else if (Array.isArray(activeRoster) && activeRoster.length > 0) {
        resolvedChar = activeRoster.find(c => c.id === sourceId) || null;
        if (!resolvedChar) {
          errors.push('unavailable_or_needs_source');
        }
      }
    }
  } else {
    // Entidades no legacy
    if (sourceId) {
      if (deprecatedIds.has(sourceId)) {
        errors.push(`Referencia a registro deprecado prohibida: sourceRecordId '${sourceId}' está archivado.`);
      } else if (Array.isArray(activeRoster) && activeRoster.length > 0) {
        resolvedChar = activeRoster.find(c => c.id === sourceId) || null;
        if (!resolvedChar && !entity.simulationDesignOnly) {
          errors.push(`sourceRecordId '${sourceId}' no encontrado en el roster activo.`);
        }
      }
    }
  }

  const hasUnavailable = errors.includes('unavailable_or_needs_source');
  return {
    valid: errors.length === 0,
    status: hasUnavailable ? 'unavailable_or_needs_source' : (errors.length === 0 ? 'valid' : 'invalid'),
    errors,
    resolvedCharacter: resolvedChar
  };
}

/**
 * Resolves availability of an external entity given combat context.
 */
export function resolveExternalEntityAvailability(entity, combatContext = {}) {
  const classified = classifyExternalEntity(entity);

  if (classified.legacyReference) {
    if (classified.sourceRecordId !== null && combatContext.activeRoster) {
      const val = validateExternalEntityReference(classified, combatContext.activeRoster);
      if (val.status === 'unavailable_or_needs_source') {
        return {
          status: 'unavailable_or_needs_source',
          canDeploy: false,
          reason: 'sourceRecordId no encontrado en el roster activo; requiere verificación de fuente.'
        };
      }
    }
    return {
      status: 'legacy_reference_only',
      canDeploy: false,
      reason: 'Referencia histórica; requiere un patch de modelo aprobado para activación táctica.'
    };
  }

  if (classified.simulationDesignOnly) {
    return {
      status: 'simulation_design_only',
      canDeploy: false,
      reason: 'Proyección contextual de simulación; no invocable por defecto.'
    };
  }

  // Hatchiyack Orb condition (Dr. Raichi specific)
  if (combatContext.orbStatus === 'destroyed' || combatContext.orbStatus === 'sealed') {
    return {
      status: 'orb_compromised',
      canDeploy: false,
      reason: 'Orbe Hatchiyack destruido o sellado; nexo espectral inoperativo.'
    };
  }

  // Pan SSJ U16 restriction: only for psychological pressure vs compatible opponents
  if (classified.sourceRecordId === 'pan-ssj-dbm-u16' || classified.combatRole === 'psychological_pressure') {
    const oppId = (combatContext.opponentRecordId || combatContext.opponent?.id || '').toLowerCase();
    const oppName = (combatContext.opponent?.name || '').toLowerCase();
    const isSonFamily = oppId.includes('gohan') || oppId.includes('goku') || oppId.includes('vegetto') || oppName.includes('gohan') || oppName.includes('bra');
    
    if (!isSonFamily && !combatContext.allowPsychologicalTactics) {
      return {
        status: 'restricted_role',
        canDeploy: false,
        reason: 'Reservada para presión psicológica contra combatientes vinculados a la familia Son/U16. Inefectiva como unidad de asalto general.'
      };
    }
  }

  return {
    status: 'usable_now',
    canDeploy: true,
    reason: 'Entidad canónica aprobada y disponible para despliegue.'
  };
}

/**
 * Selects a contextual external entity recommendation for Dr. Raichi or similar summoners
 * according to opponent traits, scenario, casualties, and tactical needs.
 */
export function selectContextualExternalEntity(character, opponent = {}, combatContext = {}) {
  if (character?.id !== 'dr-raichi-dbm-u3') {
    return null;
  }

  const oppId = (opponent?.id || combatContext.opponentRecordId || '').toLowerCase();
  const oppName = (opponent?.name || '').toLowerCase();
  const oppTags = Array.isArray(opponent?.haxTags) ? opponent.haxTags.join(' ').toLowerCase() : '';
  const oppForms = Array.isArray(opponent?.forms) ? opponent.forms.map(f => f.name).join(' ').toLowerCase() : '';

  const isSaiyan = oppId.includes('vegeta') || oppId.includes('goku') || oppId.includes('kakarotto') ||
                   oppId.includes('saiyajin') || oppId.includes('saiyan') || oppId.includes('broly') ||
                   oppId.includes('raditz') || oppId.includes('nappa') || oppId.includes('bardock') ||
                   oppName.includes('vegeta') || oppName.includes('goku') || oppName.includes('saiyajin') ||
                   oppTags.includes('saiyajin') || oppForms.includes('super saiyan') || oppForms.includes('ssj');

  const orbStatus = combatContext.orbStatus || 'intact';
  const battleMode = combatContext.battleMode || '1v1';
  const teamSize = combatContext.teamSize || 1;

  // 1. Orbe comprometido
  if (orbStatus === 'damaged' || orbStatus === 'compromised' || orbStatus === 'destroyed' || orbStatus === 'sealed') {
    return {
      summonState: 'emergency',
      resonanceLevel: 'critical',
      resonanceCategory: 'orb_defense_emergency',
      recommendedAction: 'Activar Sobrecarga de Barrera de Odio y repliegue defensivo de unidades activas para proteger el núcleo.',
      canonicalCandidates: ['cell-jr-u17-dbm', 'bojack-dbm'],
      contextualProjection: null,
      selectionReason: 'El Orbe Hatchiyack está comprometido; prioridad absoluta a la supervivencia del núcleo sin invocar contingencia automática.',
      counterplayVisible: 'Ataque concentrado al orbe antes de que se restablezca la barrera.',
      bodyStatIsolation: true
    };
  }

  // 2. Rival Saiyajin (Resonancia histórica Tsufur-Saiyajin)
  if (isSaiyan) {
    const isVegetaU13 = oppId === 'vegeta-u13-dbm';
    return {
      summonState: battleMode === 'team' || teamSize > 1 ? 'raid' : 'elite_pincer',
      resonanceLevel: isVegetaU13 ? 'critical' : 'high',
      resonanceCategory: 'historical_tuffle_saiyan_resonance',
      recommendedAction: isVegetaU13
        ? 'Desplegar Guerrero Fantasma de Vegeta U13 como reflejo de rencor directo y asedio coordinado con Tidar.'
        : 'Desplegar unidades de asalto del Archivo Canónico con sesgo anti-Saiyajin para forzar desgaste.',
      canonicalCandidates: isVegetaU13
        ? ['vegeta-u13-dbm', 'tidar-u19-individual', 'bojack-dbm']
        : ['cell-jr-u17-dbm', 'bojack-dbm', 'tidar-u19-individual'],
      contextualProjection: null,
      selectionReason: 'Rival de linaje Saiyajin detectado. Activa resonancia psíquica de rencor Tsufur con alta prioridad de despliegue.',
      counterplayVisible: 'Explotar la fijación obsesiva de Raichi en el rencor hacia los Saiyans para maniobras de flanqueo o distracción.',
      bodyStatIsolation: true
    };
  }

  // 3. Batalla contra equipo (Raid / Overrun)
  if (battleMode === 'team' || teamSize > 2) {
    return {
      summonState: teamSize >= 4 ? 'overrun' : 'raid',
      resonanceLevel: 'medium',
      resonanceCategory: 'tactical_role_only',
      recommendedAction: 'Formar escuadra coordinada (Raid/Overrun) con Cell Jr (hostigamiento de alta velocidad) y Bojack (ancla pesada).',
      canonicalCandidates: ['cell-jr-u17-dbm', 'bojack-dbm', 'tidar-u19-individual'],
      contextualProjection: null,
      selectionReason: 'Presión numérica requerida para contrarrestar escuadrón enemigo en arena múltiple.',
      counterplayVisible: 'Eliminar unidades de hostigamiento para romper la formación de pinza espectral.',
      bodyStatIsolation: true
    };
  }

  // 4. Rival No Saiyajin (Sin rencor personal — Rol táctico puro)
  return {
    summonState: 'scouting',
    resonanceLevel: 'low',
    resonanceCategory: 'tactical_role_only',
    relationshipStatus: 'UNVERIFIED_RELATIONAL_RESONANCE',
    recommendedAction: 'Despliegue estándar de reconocimiento y hostigamiento mediante Cell Jr y Tidar. Sin resonancia psíquica especial.',
    canonicalCandidates: ['cell-jr-u17-dbm', 'tidar-u19-individual'],
    contextualProjection: {
      simulationDesignOnly: true,
      notCanonicalDBMGhost: true,
      defaultAvailability: 'not_summonable_by_default',
      requiresResonanceCondition: true,
      bodyStatIsolation: true,
      uiVisibility: 'simulation_context_only',
      tacticalRole: 'heavy_tank_or_range_pressure',
      notes: 'Referencia contextual consultada por necesidad de rol táctico; no representa rencor personal ni canon DBM.'
    },
    selectionReason: 'Rival sin vínculo histórico Tsufur. Selección puramente funcional por rol de combate.',
    counterplayVisible: 'Presión sostenida de desgaste; sin factores emocionales explotables.',
    bodyStatIsolation: true
  };
}

/**
 * Resolves external entity combat state safely isolated from owner.
 */
export function resolveExternalEntityCombatState(entity, combatContext = {}) {
  const classified = classifyExternalEntity(entity);
  return {
    entityId: classified.entityId,
    displayName: classified.displayName,
    entityType: classified.entityType,
    bodyStatIsolation: true,
    availability: resolveExternalEntityAvailability(classified, combatContext),
    combatRole: classified.combatRole,
    counterplay: classified.counterplayTags,
    notes: classified.notes
  };
}

/**
 * Returns the UI display model for rendering an external entity.
 */
export function getExternalEntityUiModel(entity, character = null) {
  const c = classifyExternalEntity(entity);
  const val = validateExternalEntityReference(c, [], new Set(), character);
  return {
    entityId: c.entityId,
    displayName: c.displayName,
    entityType: c.entityType,
    combatRole: c.combatRole,
    availability: val.status === 'unavailable_or_needs_source' ? 'unavailable_or_needs_source' : c.availability,
    canonicalStatus: c.canonicalStatus,
    isLegacy: c.legacyReference,
    isCanonical: c.canonicalStatus === 'confirmed_dbm_onscreen',
    isContextual: c.simulationDesignOnly,
    cooldownPolicy: c.cooldownPolicy,
    counterplayTags: c.counterplayTags,
    notes: c.notes
  };
}
