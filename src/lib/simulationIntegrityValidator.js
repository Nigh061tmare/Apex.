/**
 * APEX Powerscaling Engine — Simulation Integrity Validator
 * 
 * Independent runtime integrity checker for APEX Eternidad / Oráculo V2.
 * Validates the 14 Constitutional Simulation Integrity Rules without modifying any data.
 */

import {
  ACTION_SOURCES,
  PERSISTENCE_MODES,
  SOURCE_TYPES,
  ROSTER_VERSION_CANONICAL,
  validateKnownFusionAlias,
  CANONICAL_TECHNIQUE_SAGA_RESTRICTIONS
} from './simulationContractsV2.js';

export function validateSimulationIntegrity({
  snapshot,
  combatLog = [],
  verdict = null,
  activeOracleEvents = [],
  createdAwakenings = [],
  createdFusions = [],
  createdEventEntities = [],
  createdAbsorptions = [],
  campaignState = null
} = {}) {
  const violations = [];
  const warnings = [];

  // RULE 1: Snapshot completo antes de iniciar combate
  if (!snapshot || typeof snapshot !== 'object') {
    violations.push({ rule: 1, message: 'Falta snapshot completo de simulación o es nulo.' });
  } else {
    if (!snapshot.simulationId) violations.push({ rule: 1, message: 'Snapshot sin simulationId.' });
    if (snapshot.rosterVersion !== ROSTER_VERSION_CANONICAL) {
      violations.push({ rule: 1, message: 'RosterVersion en snapshot (' + snapshot.rosterVersion + ') no coincide con V25.' });
    }
    if (!Array.isArray(snapshot.participants) || snapshot.participants.length < 2) {
      violations.push({ rule: 1, message: 'Snapshot requiere al menos 2 participantes válidos.' });
    }
    if (snapshot.randomSeed === undefined || snapshot.randomSeed === null) {
      violations.push({ rule: 1, message: 'Snapshot no contiene randomSeed determinista.' });
    }
  }

  // RULE 2: Cada acción tiene source válido
  combatLog.forEach((log, idx) => {
    const src = log.sourceType || log.source;
    if (src && !ACTION_SOURCES.includes(src) && !Object.values(SOURCE_TYPES).includes(src)) {
      violations.push({
        rule: 2,
        message: 'Acción en turno ' + (log.turn || idx) + ' posee source inválido: ' + src
      });
    }
  });

  // RULE 3: Ningún evento temporal intenta mutar V25
  const allTemporals = [...createdAwakenings, ...createdFusions, ...createdEventEntities];
  allTemporals.forEach(t => {
    if (t.persistsToRoster === true || t.rosterMutation === true) {
      violations.push({
        rule: 3,
        message: 'Evento temporal ' + (t.displayName || t.name) + ' tiene flag de mutación permanente de roster activo.'
      });
    }
    if (t.persistence && t.persistence !== PERSISTENCE_MODES.SIMULATION_ONLY) {
      violations.push({
        rule: 3,
        message: 'Entidad temporal ' + t.displayName + ' tiene persistencia no permitida: ' + t.persistence
      });
    }
  });

  // RULE 4: Todo evento activo en combate aparece en oracleEvents
  const rawEvents = Array.isArray(snapshot?.oracleEvents)
    ? snapshot.oracleEvents
    : (Array.isArray(snapshot?.oracleEvents?.active) ? snapshot.oracleEvents.active : []);
  const activeIds = rawEvents.map(e => typeof e === 'string' ? e : (e.id || e.slug));
  activeOracleEvents.forEach(evt => {
    const evtId = typeof evt === 'string' ? evt : (evt.id || evt.slug);
    if (evtId && !activeIds.includes(evtId)) {
      violations.push({
        rule: 4,
        message: 'Evento Oráculo ' + evtId + ' activado en combate no figuraba en snapshot.oracleEvents.'
      });
    }
  });

  // RULE 5: No se usa técnica/forma de Oráculo sin evento habilitante
  const hasFinisherEvent = activeIds.some(id => id === 'forbidden-finisher-awakening' || id === 'miracle_technique_awakening');
  const hasCanonAwakening = activeIds.some(id => id === 'canonical-awakening' || id === 'miracle_form_canon');
  const hasTranscendentAwakening = activeIds.some(id => id === 'transcendent-awakening' || id === 'miracle_form_transcendent');
  const hasFusionEvent = activeIds.some(id => id === 'canonical-fusion' || id === 'fusion_protocol_canon' || id === 'what-if-hybrid-fusion' || id === 'fusion_protocol_whatif');

  combatLog.forEach(log => {
    if (log.actionType === 'oracle-finisher' && !hasFinisherEvent) {
      violations.push({
        rule: 5,
        message: 'Se ejecutó un Finisher de Oráculo sin evento habilitante en snapshot.'
      });
    }
    if (log.actionType === 'oracle-awakening' && !hasCanonAwakening && !hasTranscendentAwakening) {
      violations.push({
        rule: 5,
        message: 'Se activó un Despertar de Oráculo sin evento de despertar habilitado en snapshot.'
      });
    }
  });

  // RULE 6: No se usa forma temporal como forma permanente
  createdAwakenings.forEach(awk => {
    if (awk.temporary !== true) {
      violations.push({
        rule: 6,
        message: 'Despertar temporal ' + awk.displayName + ' carece del flag temporary: true.'
      });
    }
  });

  // RULE 7: Fusión tiene nombre único constante, fórmula consistente e identidad semántica estricta
  if (createdFusions.length > 0) {
    createdFusions.forEach(fusion => {
      if (!fusion.displayName || typeof fusion.displayName !== 'string' || fusion.displayName.trim().length === 0) {
        violations.push({ rule: 7, message: 'Fusión carece de displayName único constante.' });
      }
      if (!fusion.baseCalculation) {
        violations.push({ rule: 7, message: 'Fusión carece de fórmula base de cálculo declarada.' });
      }

      // Campos semánticos obligatorios de identidad
      if (!Array.isArray(fusion.componentRecordIds) || fusion.componentRecordIds.length < 2) {
        violations.push({
          rule: 7,
          message: 'Fusión ' + (fusion.displayName || 'sin nombre') + ' carece del campo obligatorio componentRecordIds con al menos 2 combatientes.'
        });
      }
      if (!Array.isArray(fusion.componentDisplayNames) || fusion.componentDisplayNames.length < 2) {
        violations.push({
          rule: 7,
          message: 'Fusión ' + (fusion.displayName || 'sin nombre') + ' carece del campo obligatorio componentDisplayNames con al menos 2 combatientes.'
        });
      }
      if (!fusion.derivedFusionName || typeof fusion.derivedFusionName !== 'string') {
        violations.push({
          rule: 7,
          message: 'Fusión ' + (fusion.displayName || 'sin nombre') + ' carece del campo obligatorio derivedFusionName.'
        });
      }
      if (!fusion.nameOrigin || !['canonical_alias', 'user_named', 'deterministic_generated', 'oracle_what_if_name'].includes(fusion.nameOrigin)) {
        violations.push({
          rule: 7,
          message: 'Fusión ' + (fusion.displayName || 'sin nombre') + ' tiene nameOrigin inválido: ' + fusion.nameOrigin
        });
      }
      if (!fusion.identityValidationStatus) {
        violations.push({
          rule: 7,
          message: 'Fusión ' + (fusion.displayName || 'sin nombre') + ' carece del campo obligatorio identityValidationStatus.'
        });
      }
      if (!fusion.appearanceRecipe || typeof fusion.appearanceRecipe !== 'string') {
        violations.push({
          rule: 7,
          message: 'Fusión ' + (fusion.displayName || 'sin nombre') + ' carece del campo obligatorio appearanceRecipe.'
        });
      }
      if (!fusion.inheritedAbilityMap || typeof fusion.inheritedAbilityMap !== 'object') {
        violations.push({
          rule: 7,
          message: 'Fusión ' + (fusion.displayName || 'sin nombre') + ' carece del campo obligatorio inheritedAbilityMap.'
        });
      }

      // Validación estricta anti-usurpación de alias conocidos
      const aliasCheck = validateKnownFusionAlias(
        fusion.displayName,
        fusion.componentRecordIds || [],
        fusion.componentDisplayNames || [],
        fusion.fusionMethod || 'potara'
      );
      if (!aliasCheck.valid) {
        violations.push({
          rule: 7,
          message: 'Violación crítica de identidad semántica de fusión: displayName \'' + fusion.displayName + '\' no corresponde a los componentes autorizados: ' + aliasCheck.reason + ' (' + aliasCheck.required + ').'
        });
      }
    });
  }

  // RULE 8: Inmortalidad conserva política consistente durante el combate
  if (snapshot?.participants) {
    snapshot.participants.forEach(p => {
      if (p.immortalityPolicy?.regenerationCost === 0) {
        const regenDeductions = combatLog.filter(l => l.actorId === p.participantId && l.actionType === 'regeneration' && (l.kiCost > 0 || l.staminaCost > 0));
        if (regenDeductions.length > 0) {
          violations.push({
            rule: 8,
            message: 'Combatiente inmortal con coste 0 sufrió deducción de recursos al regenerar en turno ' + regenDeductions[0].turn
          });
        }
      }
    });
  }

  // RULE 9: HP/stamina/Ki no cambian sin evento registrado
  combatLog.forEach((log, i) => {
    if ((log.hpChangeA || log.hpChangeB || log.staminaChangeA || log.staminaChangeB) && !log.actionName && !log.actionId) {
      warnings.push({
        rule: 9,
        message: 'Variación de estadísticas en turno ' + (log.turn || i) + ' sin acción causal identificada.'
      });
    }
  });

  // RULE 10: Raichi normal no despliega Broly ni Hatchiyack
  const hasRaichi = snapshot?.participants?.some(p => p.recordId === 'dr-raichi-dbm-u3');
  const hasCompatibleOracle = activeIds.some(id =>
    id === 'multiversal-surprise-warrior' || id === 'multiverse_random_fighter' ||
    id === 'same-verse-canon-invader' || id === 'same_verse_reinforcement' ||
    id === 'transcendent-awakening' || id === 'miracle_form_transcendent' ||
    id === 'space-time-failure' || id === 'dimensional_shift'
  ) || (snapshot?.customOracleCondition && (snapshot.customOracleCondition.toLowerCase().includes('broly') || snapshot.customOracleCondition.toLowerCase().includes('hatchiyack')));

  if (hasRaichi && !hasCompatibleOracle) {
    const illegalEntity = createdEventEntities.find(e =>
      e.displayName?.toLowerCase().includes('broly') || e.displayName?.toLowerCase().includes('hatchiyack')
    );
    if (illegalEntity) {
      violations.push({
        rule: 10,
        message: 'Dr. Raichi en Modo Normal desplegó ' + illegalEntity.displayName + ' sin evento de Oráculo habilitante.'
      });
    }
  }

  // RULE 11: Raichi Oráculo etiqueta sus entidades como event_entity con bodyStatIsolation: true
  if (hasRaichi && hasCompatibleOracle) {
    createdEventEntities.forEach(entity => {
      if (entity.bodyStatIsolation !== true) {
        violations.push({
          rule: 11,
          message: 'Entidad ' + entity.displayName + ' de Raichi en Modo Oráculo no tiene bodyStatIsolation: true.'
        });
      }
      if (entity.canMutateOwnerBodyStats !== false) {
        violations.push({
          rule: 11,
          message: 'Entidad ' + entity.displayName + ' de Raichi permite mutar estadísticas del cuerpo del owner.'
        });
      }
    });
  }

  // RULE 12: Consecuencias Alfa/Beta/Omega son simulation_only por defecto
  if (snapshot?.outcomePersistence && snapshot.outcomePersistence !== PERSISTENCE_MODES.SIMULATION_ONLY) {
    violations.push({
      rule: 12,
      message: 'Persistencia de desenlace en snapshot (' + snapshot.outcomePersistence + ') debe ser simulation_only por defecto.'
    });
  }

  // RULE 13: CampaignState no modifica roster base
  if (campaignState) {
    if (campaignState.baseRosterVersion !== ROSTER_VERSION_CANONICAL) {
      violations.push({
        rule: 13,
        message: 'CampaignState no referencia el roster base canónico V25.'
      });
    }
    if (campaignState.mutatesRoster === true) {
      violations.push({
        rule: 13,
        message: 'CampaignState declara mutatesRoster: true, violando el aislamiento constitucional.'
      });
    }
  }

  // RULE 14: Verificación de determinismo estricto por seed
  if (snapshot && snapshot.randomSeed === undefined) {
    violations.push({
      rule: 14,
      message: 'Falta randomSeed en snapshot para garantizar determinismo.'
    });
  }


  // ════════════════════════════════════════════════════════════════════════════
  // RULE 15: Combatientes fusionados NO pueden actuar como individuos
  // Si existe una fusión activa, sus componentRecordIds deben estar ausentes
  // de cualquier acción de combate mientras dure la fusión.
  // ════════════════════════════════════════════════════════════════════════════
  if (Array.isArray(createdFusions) && createdFusions.length > 0) {
    createdFusions.forEach(fusion => {
      const fusedComponentIds = fusion.componentRecordIds || [];
      const fusionId = fusion.fusionId || fusion.displayName || 'fusión-desconocida';

      if (fusedComponentIds.length === 0) {
        violations.push({
          rule: 15,
          message: `Fusión "${fusionId}" no declara componentRecordIds. Imposible validar aislamiento de componentes.`
        });
        return;
      }

      // Check that componentAvailabilityStatus is present and correctly set
      const availStatus = fusion.componentAvailabilityStatus || [];
      if (availStatus.length === 0) {
        warnings.push({
          rule: 15,
          message: `Fusión "${fusionId}" no declara componentAvailabilityStatus. Los personajes fusionados podrían actuar como individuos (usa createFusionCombatState() v2.1+).`
        });
      } else {
        availStatus.forEach(cs => {
          if (cs.unavailableAsIndividualActor !== true) {
            violations.push({
              rule: 15,
              message: `Componente "${cs.recordId}" de la fusión "${fusionId}" NO está marcado como unavailableAsIndividualActor. Violación de aislamiento de fusión.`
            });
          }
        });
      }

      // Check combatLog for illegal individual actor appearance AFTER or DURING active fusion
      if (Array.isArray(combatLog)) {
        let fusionActive = !fusion.temporary; // If permanent/preset, active from turn 0
        combatLog.forEach((entry, i) => {
          if (entry.actionId?.includes('fusion') || entry.actionType?.includes('fusion') || entry.phase >= 3) {
            fusionActive = true;
          }
          if (fusionActive) {
            const actorId = entry.actorId || entry.actorRecordId || entry.actor || '';
            // Only flag if this entry is during/after fusion and is an independent action by a component
            if (fusedComponentIds.includes(actorId) && entry.actionType !== 'oracle_scenario_event' && !entry.actionId?.includes('fusion')) {
              violations.push({
                rule: 15,
                message: `Violación de fusión: "${actorId}" aparece en combatLog[${i}] como actor individual mientras la fusión "${fusionId}" está activa. Goku y Vegeta NO existen por separado mientras Gogeta está vivo.`
              });
            }
          }
        });
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RULE 16: Personajes ABSORBIDOS por Buu o Cell no pueden actuar como individuos
  // Si existe un AbsorptionState, el absorbido no puede tener acciones propias en arena.
  // ════════════════════════════════════════════════════════════════════════════
  const absorptionStates = [
    ...(Array.isArray(createdAbsorptions) ? createdAbsorptions : []),
    ...(Array.isArray(createdEventEntities) ? createdEventEntities : []),
    ...(Array.isArray(verdict?.oracleSummary?.createdAbsorptions) ? verdict.oracleSummary.createdAbsorptions : [])
  ].filter(e => e && (e.absorbedActorStatus === 'absorbed' || e.source === SOURCE_TYPES.ORACLE_ABSORPTION_EVENT));

  absorptionStates.forEach(abs => {
    const absorbedId = abs.absorbedRecordId || '';
    const absorberName = abs.absorberDisplayName || 'absorber-desconocido';
    const absorbedName = abs.absorbedDisplayName || absorbedId;

    if (!absorbedId) {
      violations.push({
        rule: 16,
        message: `AbsorptionState sin absorbedRecordId. Datos de absorción incompletos.`
      });
      return;
    }

    if (abs.absorbedIndependentActorAvailable === true) {
      violations.push({
        rule: 16,
        message: `"${absorbedName}" tiene absorbedIndependentActorAvailable: true pero está marcado como absorbido por "${absorberName}". Contradicción de estado.`
      });
    }

    // Check combatLog for illegal absorbed actor appearance AFTER or DURING absorption
    if (Array.isArray(combatLog)) {
      let absorptionActive = !abs.temporary; // If permanent/preset, active from turn 0
      combatLog.forEach((entry, i) => {
        if (entry.actionId?.includes('absorption') || entry.actionType?.includes('absorption') || (entry.phase >= 3 && entry.actionType === 'oracle_scenario_event')) {
          absorptionActive = true;
        }
        if (absorptionActive) {
          const actorId = entry.actorId || entry.actorRecordId || entry.actor || '';
          if ((actorId === absorbedId || actorId.includes(absorbedId)) && !entry.actionId?.includes('absorption')) {
            violations.push({
              rule: 16,
              message: `Violación de absorción: "${absorbedName}" aparece en combatLog[${i}] como actor independiente mientras está absorbido por "${absorberName}". Un personaje absorbido solo puede existir como voz interna.`
            });
          }
        }
      });
    }
  });

  // ════════════════════════════════════════════════════════════════════════════
  // RULE 17: Restricciones de técnicas canónicas por era y personaje
  // Cross-checks against CANONICAL_TECHNIQUE_SAGA_RESTRICTIONS (advisory — warnings)
  // ════════════════════════════════════════════════════════════════════════════
  // This rule runs as WARNING only (not violation) to avoid blocking existing
  // simulations. Future versions may escalate to violations.
  if (Array.isArray(combatLog)) {
    const techRestrictions = CANONICAL_TECHNIQUE_SAGA_RESTRICTIONS || {};
    const KAIO_KEN_FORBIDDEN_FORMS = techRestrictions['kaio-ken']?.forbiddenWithForms || [
      'ssj1', 'super-saiyan', 'ssj2', 'super-saiyan-2', 'ssj3', 'super-saiyan-3', 'ssj4', 'super-saiyan-4'
    ];
    const SHUNKAN_IDO_WHITELIST = techRestrictions['shunkan-ido']?.canonicalUsersWhitelist || [
      'goku', 'son-goku', 'cell', 'perfect-cell', 'super-perfect-cell', 'jimizu', 'pybara'
    ];

    combatLog.forEach((entry, i) => {
      const actorId = String(entry.actorId || entry.actor || '').toLowerCase();
      const technique = String(entry.technique || entry.action || '').toLowerCase();
      const form = String(entry.currentForm || entry.form || '').toLowerCase();

      // 17a. Kaiō-ken check
      if (technique.includes('kaio-ken') || technique.includes('kaioken') || technique.includes('kaiō-ken')) {
        const onForbiddenForm = KAIO_KEN_FORBIDDEN_FORMS.some(f => form.includes(f));
        if (onForbiddenForm) {
          warnings.push({
            rule: 17,
            message: `TÉCNICA PROHIBIDA: "${actorId}" usa Kaiō-ken sobre forma "${form}" en combatLog[${i}]. Kaiō-ken es incompatible con SSJ1/SSJ2/SSJ3 en era DBZ. Solo válido en Base o SSB en DBS.`
          });
        }
      }

      // 17b. Shunkan Idō check
      if (technique.includes('shunkan') || technique.includes('teletransportaci') || technique.includes('instant-transmission')) {
        const isWhitelisted = SHUNKAN_IDO_WHITELIST.some(id => actorId.includes(id));
        if (!isWhitelisted) {
          warnings.push({
            rule: 17,
            message: `TÉCNICA CANÓNICA: "${actorId}" usa Shunkan Idō en combatLog[${i}] pero no está en la whitelist de usuarios (Goku, Cell, Yadrats). Verificar si la ficha lo contempla.`
          });
        }
      }

      // 17c. Ultra Instinct check (forbidden in DBZ era)
      if (technique.includes('ultra-instinct') || technique.includes('ultra instinto') || technique.includes('migatte')) {
        warnings.push({
          rule: 17,
          message: `ANACRONISMO DETECTADO: "${actorId}" usa Ultra Instinto en combatLog[${i}]. Ultra Instinto solo existe desde la era del Torneo del Poder (DBS). Prohibido en contextos DBZ.`
        });
      }
    });
  }

  return {
    isValid: violations.length === 0,
    violationCount: violations.length,
    warningCount: warnings.length,
    violations,
    warnings,
    summary: violations.length === 0
      ? 'INTEGRITY PASS: Las 17 reglas constitucionales de simulación se cumplen al 100%.'
      : 'INTEGRITY WARNING: Se detectaron ' + violations.length + ' violaciones de reglas de integridad.'
  };
}
