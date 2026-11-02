/**
 * APEX POWER SCALING — NEEDS REVIEW BACKLOG (V22)
 * Exportado como módulo JS para compatibilidad universal con Vite y Node.js.
 */
export const APEX_NEEDS_REVIEW_BACKLOG = {
  "meta": {
    "backlogTitle": "Backlog Consolidado de Incidencias Pendientes (needsReview) — APEX Roster V22",
    "rosterVersion": "ROSTER_NIVELES_PODER_CORREGIDO_V22.json",
    "timestamp": "2026-09-04T01:02:09.253Z",
    "status": "FROZEN_PENDING_EDITORIAL_DECISION"
  },
  "franchises": [
    {
      "franchise": "Invincible",
      "totalIssues": 14,
      "issues": [
        {
          "recordId": "atom-eve-invincible, battle-beast-invincible, bulletproof-invincible, dupli-kate-invincible, kregg-invincible-war, lucan-invincible, monster-girl-invincible, omni-man-invincible-905, rex-splode-invincible, robot-rudy-invincible, space-racer-invincible, tech-jacket-invincible, thaedus-invincible-war, universa-invincible",
          "affectedRecordsCount": 14,
          "severity": "HIGH",
          "issueType": "template_contamination_and_wrong_character_content",
          "affectedFields": [
            "forms[0].name",
            "forms[0].kiNumeric",
            "forms[0].kiFormatted",
            "baseKiNumeric",
            "baseKiFormatted"
          ],
          "reason": "14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base.",
          "recommendedAction": "Restaurar el nombre correcto de la forma base correspondiente a cada personaje (ej. 'Atom Eve (Estado Base)', 'Omni-Man (Estado Base)', 'Battle Beast (Estado Base)') y recalibrar su Ki numérico proporcional a su tier sin mezclar con la plantilla de Mark Grayson."
        }
      ]
    },
    {
      "franchise": "Dragon Ball (Fan-Manga, Multiverse, What-If & After)",
      "totalIssues": 9,
      "issues": [
        {
          "recordId": "baby-god-brokoly / baby-vegeta-god-brokoly",
          "severity": "HIGH",
          "issueType": "duplicate_character_records",
          "affectedFields": [
            "id",
            "forms",
            "kiNumeric",
            "multiplier"
          ],
          "reason": "Coexisten dos fichas independientes para el mismo What-If ('Super Baby Vegeta Baby God' de @Brokoly350) con progresiones numéricas incompatibles: una escala a 1.33T Ki (High 3-A, mult x50) y la otra a 283.58T Ki (3-A, mult x6400).",
          "recommendedAction": "Consolidar en una única ficha canónica 'baby-vegeta-god-brokoly', adoptando la progresión más fundamentada en el material original y retirando la ficha redundante."
        },
        {
          "recordId": "broly-legendario-dbm / broly-u20-dbm-congelado",
          "severity": "MEDIUM",
          "issueType": "duplicate_or_stub_record",
          "affectedFields": [
            "id",
            "forms"
          ],
          "reason": "'broly-legendario-dbm' es una ficha estática mono-forma de 18.90B Ki, mientras que 'broly-u20-dbm-congelado' representa al mismo personaje con progresión multiforme completa a LSSJ (18.90B a 37.80T Ki).",
          "recommendedAction": "Retirar la ficha redundante mono-forma o fusionar sus notas en la ficha completa del Universo 20."
        },
        {
          "recordId": "dr-raichi-fantasmas-del-odio-u3-dbm / dr-raichi-dbm-u3",
          "severity": "MEDIUM",
          "issueType": "duplicate_character_records",
          "affectedFields": [
            "id",
            "forms",
            "kiNumeric"
          ],
          "reason": "Coexisten dos fichas para el Dr. Raichi de DBM U3: una fija de 845.25M Ki y otra con progresión de cápsula a Fantasma Broly (24.52k a 49.04M Ki).",
          "recommendedAction": "Unificar en una única ficha que represente la invocación del Fantasma de Broly con una escala coherente de poder."
        },
        {
          "recordId": "son-bra-dbm-u16",
          "severity": "HIGH",
          "issueType": "structural_form_and_multiplier_inconsistency",
          "affectedFields": [
            "forms[1] (majin-bra-ssj2)",
            "forms[1].multiplier",
            "forms[1].tier"
          ],
          "reason": "Form 1 ('Son Bra (Majin Bra)') figura como forma intermedia con mult x1.5 y 44.46k Ki, previa al SSJ1 (x50), cuando narrativamente Majin Bra es SSJ2 bajo posesión de Babidi.",
          "recommendedAction": "Reubicar 'Son Bra (Majin Bra)' posterior a SSJ2 aplicando el factor multiplicador Majin sobre SSJ2, o definirla como un estado base poseído manteniendo tier coherente."
        },
        {
          "recordId": "gohan-u16-dbm-espectador",
          "severity": "LOW",
          "issueType": "internal_duplicate_form",
          "affectedFields": [
            "forms[2]",
            "forms[3]"
          ],
          "reason": "forms[2] ('Son Gohan Universo 16 - Estado Místico') y forms[3] ('Estado Místico / Ultimate Gohan') duplican exactamente el mismo estado (11.90M Ki, mult x800, Tier 4-A).",
          "recommendedAction": "Eliminar forms[2] redundante y preservar forms[3] como la transformación definitiva."
        },
        {
          "recordId": "vegeta-db-after",
          "severity": "MEDIUM",
          "issueType": "structural_tier_and_multiplier_anomaly",
          "affectedFields": [
            "forms[2].multiplier",
            "forms[2].tier"
          ],
          "reason": "forms[2] ('Super Saiyan + Kaio-ken x20') repite el multiplicador x50 de SSJ1 sin aplicar el Kaio-ken x20 y salta anómalamente a Tier 2-B, el cual luego decae a Low 2-C en SSJ2 Majin y SSJ3.",
          "recommendedAction": "Ajustar el multiplicador a x1000 (50 x 20) o calibrar su tier como estado intermedio entre SSJ1 (High 3-A) y SSJ2/SSJ3 (Low 2-C)."
        },
        {
          "recordId": "raditz-redimido-brokoly / saibaman-mutante-brokoly",
          "severity": "HIGH",
          "issueType": "severe_ki_tier_incoherence",
          "affectedFields": [
            "forms[0].tier",
            "forms[0].kiNumeric",
            "baseTier"
          ],
          "reason": "Raditz Guerrero Z base figura con 1.575 Ki en Tier 4-B (Sistema Solar) y Saibaman Mutante base figura con 1.260 Ki en Tier 4-A. El Ki numérico es de nivel Saiyan ordinario pero el tier fue inflado por plantilla.",
          "recommendedAction": "Decidir si recalibrar el Ki numérico a millones para respaldar el Tier 4-B/4-A, o devolver el Tier a 5-B / 5-C respetando sus 1.500 unidades de Ki."
        },
        {
          "recordId": "yamcha-u9-dbm",
          "severity": "MEDIUM",
          "issueType": "ki_lore_incoherence",
          "affectedFields": [
            "forms[0].kiNumeric",
            "baseKiNumeric"
          ],
          "reason": "En DBM, Yamcha U9 fue modificado a androide (nivel superior a A-18), pero conserva 1.554 unidades de Ki de la llegada de los Saiyans.",
          "recommendedAction": "Actualizar su Ki numérico a escala de cientos de millones (~200M - 400M Ki) para respaldar su condición de ciborg y su Tier 5-B/4-C."
        },
        {
          "recordId": "androides-17-18-u14-dbm, saiyans-namekianos-u10-grupo, tidar-xeniloum-u19-dbm, kat-syd-u6-dbm",
          "severity": "LOW",
          "issueType": "group_vs_individual_coexistence",
          "affectedFields": [
            "id",
            "name",
            "forms"
          ],
          "reason": "Coexisten fichas individuales con fichas colectivas/dúo para los mismos combatientes de DBM.",
          "recommendedAction": "Mantener ambas si la aplicación permite combates grupales, o depreciar las fichas colectivas en favor de las individuales."
        }
      ]
    },
    {
      "franchise": "Dragon Ball Canon (Clásico, Z, Super, GT, Daima)",
      "totalIssues": 4,
      "issues": [
        {
          "recordId": "cell-max-dragon-ball-super-993, son-goku-adulto-daima, son-goku-mini-daima-full",
          "severity": "MEDIUM",
          "issueType": "whatif_forms_in_canon_profiles",
          "affectedFields": [
            "forms (Cell Max Perfecto / SSJ4 Primal Daima)"
          ],
          "reason": "Fichas pertenecientes a la continuidad canónica (DBS y Daima) contienen transformaciones What-If ajenas a la obra oficial dentro de su arreglo de formas.",
          "recommendedAction": "Separar estas formas hipotéticas en fichas independientes catalogadas bajo la franquicia 'Dragon Ball (Fan-Mangas & What-If)'."
        },
        {
          "recordId": "comandante-red-dragon-ball-cl-sico-526",
          "severity": "LOW",
          "issueType": "non_standard_tier_format",
          "affectedFields": [
            "forms[0].tier"
          ],
          "reason": "Conserva el sufijo informal ' Físico' ('9-C Físico').",
          "recommendedAction": "Normalizar a '9-C'."
        },
        {
          "recordId": "burter, jeice, nail, nappa, piccolo-saga-saiyan, recoome, goku-llegada-saiyan, goku-namek-post-zenkai, goku-namek-base, tenshinhan-saiyan, freezer-namek-50, goku-ssj1-namek-150m, gohan-ultimate, vegeta-majin-ssj2, gohan-joven-ssj2",
          "severity": "LOW",
          "issueType": "non_standard_sub_tiers",
          "affectedFields": [
            "forms[*].tier"
          ],
          "reason": "Uso de denominaciones no estándar como 'Low 5-B', 'Low 4-C', 'High 4-B' heredadas de esquemas antiguos de VS Battles.",
          "recommendedAction": "Mapear de acuerdo a la Constitución APEX a tiers directos ('5-B', '4-C', '4-B')."
        },
        {
          "recordId": "goku-dbs-732, goku-daima-751, goku-gt-281, tao-pai-pai-369",
          "severity": "LOW",
          "issueType": "plus_sign_tier_modifier",
          "affectedFields": [
            "forms[*].tier"
          ],
          "reason": "Tiers con sufijo '+' ('7-B+', '5-A+', '4-A+', '3-A+').",
          "recommendedAction": "Eliminar el signo '+' para conformar la nomenclatura estricta de APEX."
        }
      ]
    },
    {
      "franchise": "Baki the Grappler",
      "totalIssues": 1,
      "issues": [
        {
          "recordId": "yujiro-hanma, baki-hanma, jack-hanma, kaoru-hanayama, etc.",
          "severity": "HIGH",
          "issueType": "full_verse_internal_order_recalibration",
          "affectedFields": [
            "forms[*].kiNumeric",
            "forms[*].tier",
            "baseTier"
          ],
          "reason": "Las relaciones de Ki y tiers entre los peleadores cumbre (Yujiro vs Baki vs Jack vs Oliva vs Hanayama) no reflejan fielmente la jerarquía del Torneo Máximo / Padre e Hijo sin un reescalado integral coordinado.",
          "recommendedAction": "Congelado sin parches aislados. Ejecutar sesión dedicada de recalibración completa del verso Baki con el usuario."
        }
      ]
    },
    {
      "franchise": "The Boys",
      "totalIssues": 1,
      "issues": [
        {
          "recordId": "homelander, billy-butcher, soldier-boy, black-noir, etc.",
          "severity": "MEDIUM",
          "issueType": "verse_human_vs_super_balance",
          "affectedFields": [
            "forms[*].tier",
            "forms[*].kiNumeric"
          ],
          "reason": "La disparidad entre humanos normales armados y supers potenciados con Compuesto V requiere armonizar los tiers Tier 9 / Tier 8 sin descalibrar el canon de la serie de TV.",
          "recommendedAction": "Mantener congelado sin cambios parciales hasta fijar una tabla de correlación universal humano/super."
        }
      ]
    },
    {
      "franchise": "My Hero Academia & One Punch Man",
      "totalIssues": 2,
      "issues": [
        {
          "recordId": "izuku-midoriya-deku-mha, shigaraki-tomura-mha",
          "severity": "MEDIUM",
          "issueType": "textual_range_tier",
          "affectedFields": [
            "forms[*].tier"
          ],
          "reason": "Múltiples formas tienen asignado el rango textual ambiguo 'High 6-A a 5-C' en lugar de un único tier discreto.",
          "recommendedAction": "Asignar un tier unívoco por forma según el estado de potencia (ej. High 6-A para Deku base y 5-C para Gearshift 120%)."
        },
        {
          "recordId": "tatsumaki-opm",
          "severity": "MEDIUM",
          "issueType": "textual_range_tier",
          "affectedFields": [
            "forms[0].tier"
          ],
          "reason": "Forma base casual figura con tier 'High 6-A a 5-C'.",
          "recommendedAction": "Fijar tier discreto (High 6-A en estado casual, 5-C en pico máximo)."
        }
      ]
    },
    {
      "franchise": "Hunter x Hunter & Demon Slayer",
      "totalIssues": 2,
      "issues": [
        {
          "recordId": "netero-hxh-912, meruem-hxh-911, hisoka-morow",
          "severity": "LOW",
          "issueType": "non_standard_tiers_hxh",
          "affectedFields": [
            "forms[*].tier"
          ],
          "reason": "Uso de 'Low 7-B', 'High 7-A' y 'High 8-A'.",
          "recommendedAction": "Normalizar a '7-B', '7-A' y '8-A'."
        },
        {
          "recordId": "akaza-kimetsu",
          "severity": "LOW",
          "issueType": "non_standard_tier_kny",
          "affectedFields": [
            "forms[1].tier"
          ],
          "reason": "Regeneración craneal figura con tier 'High 8-A'.",
          "recommendedAction": "Normalizar a '8-A'."
        }
      ]
    },
    {
      "franchise": "Marvel Comics & DC Comics",
      "totalIssues": 2,
      "issues": [
        {
          "recordId": "doctor-strange, hulk",
          "severity": "LOW",
          "issueType": "non_standard_tiers_marvel",
          "affectedFields": [
            "forms[*].tier"
          ],
          "reason": "Doctor Strange forma astral figura en 'High 7-A' e Immortal Hulk en 'High 4-B'.",
          "recommendedAction": "Normalizar a '7-A' y '4-B'."
        },
        {
          "recordId": "iron-man-marvel-908, batman-dc-910",
          "severity": "LOW",
          "issueType": "external_gear_vs_base_physique",
          "affectedFields": [
            "forms (Hulkbuster / Hellbat)"
          ],
          "reason": "Las armaduras externas con tiers 4-B / High 3-A están modeladas dentro del árbol de formas del humano base.",
          "recommendedAction": "Validar si se conserva el modelo de equipamiento como forma o se segrega en entidades independientes."
        }
      ]
    }
  ]
};

export default APEX_NEEDS_REVIEW_BACKLOG;
