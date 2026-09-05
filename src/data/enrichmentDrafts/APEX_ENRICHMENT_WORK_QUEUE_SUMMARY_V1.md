# 📋 APEX ENRICHMENT WORK QUEUE — RESUMEN EJECUTIVO (V1)

> **Estado del Roster**: Baseline Oficial Congelado (`ROSTER_NIVELES_PODER_CORREGIDO_V22.json`).
> **Modo de Operación**: Inventario puro de enriquecimiento sin modificaciones a los campos protegidos de V22.
> **Destino de Borradores**: `src/data/enrichmentDrafts/`

---

## 1. Métrica Global de la Cola de Trabajo

- **Total de Personajes en Inventario**: **769**
- **Personajes Habilitados para Enriquecimiento**: **720**
- **Personajes Bloqueados por `needsReview`**: **49**

---

## 2. Distribución Global por Prioridad

| Prioridad | Total Personajes | % del Roster | Criterio Operativo |
| :--- | :--- | :--- | :--- |
| 🔴 **Critical** | **164** | 21.3% | Protagonistas, jefes finales, entidades cósmicas y combatientes de alta frecuencia en simulaciones. |
| 🟡 **High** | **233** | 30.3% | Personajes principales, villanos relevantes, usuarios de hax, fusiones y líderes de equipo. |
| 🔵 **Medium** | **303** | 39.4% | Secundarios de combate y combatientes tácticos regulares. |
| ⚪ **Low** | **69** | 9.0% | Civiles, soporte no combatiente, personajes gag y **49 registros con needsReview bloqueados**. |

---

## 3. Distribución por Franquicia

| Franquicia | Total | 🔴 Critical | 🟡 High | 🔵 Medium | ⚪ Low | ⚠️ Bloqueados (needsReview) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dragon Ball** | 351 | 89 | 70 | 163 | 29 | 21 |
| **Demon Slayer (Kimetsu no Yaiba)** | 32 | 5 | 16 | 9 | 2 | 1 |
| **Jujutsu Kaisen** | 41 | 8 | 16 | 17 | 0 | 0 |
| **Chainsaw Man** | 23 | 4 | 13 | 6 | 0 | 0 |
| **Hunter x Hunter** | 38 | 5 | 13 | 16 | 4 | 3 |
| **JoJo's Bizarre Adventure** | 39 | 9 | 14 | 16 | 0 | 0 |
| **One Punch Man** | 36 | 7 | 15 | 13 | 1 | 1 |
| **My Hero Academia** | 38 | 3 | 17 | 16 | 2 | 2 |
| **Baki the Grappler** | 25 | 5 | 6 | 13 | 1 | 1 |
| **Record of Ragnarok** | 24 | 2 | 11 | 1 | 10 | 0 |
| **Marvel Comics** | 38 | 7 | 14 | 14 | 3 | 3 |
| **DC Comics** | 39 | 10 | 16 | 12 | 1 | 1 |
| **Spy x Family** | 2 | 0 | 2 | 0 | 0 | 0 |
| **Invincible** | 28 | 8 | 5 | 1 | 14 | 14 |
| **The Boys** | 14 | 2 | 5 | 5 | 2 | 2 |
| **APEX Original / Híbrido** | 1 | 0 | 0 | 1 | 0 | 0 |

---

## 4. Top 30 Personajes Recomendados para Enriquecer Primero

Estos 30 personajes han sido seleccionados por su máxima centralidad en simulaciones competitivas inter-franquicia y relevancia canónica:

| # | ID del Registro | Nombre del Personaje | Franquicia | Base Tier | Formas Disponibles | Alcance Sugerido de Enriquecimiento |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `son-goku-23-tenkaichi` | **Son Goku (23º Tenkaichi Budokai)** | Dragon Ball | `7-A` | Son Goku (Ropa Pesada de Kami / 370 Unidades), Sin Ropa Pesada (Velocidad Relámpago / 480 Unidades) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 2 | `vegeta-majin-ssj2-895` | **Majin Vegeta (Saga Buu)** | Dragon Ball | `3-A` | Majin Vegeta (Estado Base / Sello Desatado), Majin Vegeta (Super Saiyajin) (+2) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 3 | `gohan-ultimate-mystic-897` | **Gohan Definitivo (Ultimate/Mystic)** | Dragon Ball | `3-A` | Gohan (Estado Base / Ropa de los Kaio-shin), Gohan Definitivo (Ultimate / Potencial Desatado) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 4 | `beerus-dragon-ball-super-16` | **Beerus** | Dragon Ball | `2-C` | Beerus (Estado Base), Beerus (Aura Hakai) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 5 | `whis-dragon-ball-super-824` | **Whis** | Dragon Ball | `2-B` | Estado Base (Ángel Guía) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 6 | `vegetto-blue-dragon-ball-super-79` | **Vegetto (Saga Super)** | Dragon Ball | `2-C` | Vegetto Base, Super Saiyan (Vegetto) (+1) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 7 | `gogeta-blue-dragon-ball-super-456` | **Gogeta (Saga Super)** | Dragon Ball | `2-C` | Gogeta Base, Super Saiyan (+1) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 8 | `jiren-dragon-ball-super-983` | **Jiren** | Dragon Ball | `2-C` | Jiren (Estado Base / Poder Oculto), Jiren (Limit Breaker / Aura Llameante de Fuego) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 9 | `broly-dbs-dragon-ball-super-172` | **Broly (DBS)** | Dragon Ball | `3-A` | Broly (Estado Base / Collar Eléctrico de Paragus), Estado Iracundo (Ikari / Poder del Oozaru en Forma Humana) (+2) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 10 | `freezer-saga-namek-saga-namek-167` | **Freezer (Dragon Ball Z — Saga de Namek)** | Dragon Ball | `5-A` | Freezer 1ª Forma (Supresión en Cápsula / 530.000 Unidades), Freezer 2ª Forma (Gigante con Cuernos / Más de 1.000.000) (+3) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 11 | `saitama-opm` | **Saitama** | One Punch Man | `4-A` | Saitama (Calvo con Capa / Rutinario) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 12 | `garou-cosmico-opm` | **Cosmic Garou (Modo Despertar Cósmico)** | One Punch Man | `4-A` | Cosmic Garou (Estado Base), Modo Miedo Cósmico (Bendición de Dios) (+1) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 13 | `lord-boros-opm` | **Lord Boros** | One Punch Man | `5-A` | Forma Contenida (Armadura Selladora), Forma Liberada (Sin Armadura) (+1) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 14 | `blast-opm` | **Blast** | One Punch Man | `4-A` | Blast (Estado Base) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 15 | `gojo-satoru-jjk-peak-gs001` | **Gojo Satoru** | Jujutsu Kaisen | `7-A` | Satoru Gojo (El Hechicero Más Fuerte) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 16 | `sukuna-ryomen-jjk-20sellos-s001` | **Ryomen Sukuna** | Jujutsu Kaisen | `7-A` | Ryomen Sukuna (Forma Heian / 20 Dedos) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 17 | `yuta-okkotsu-jjk-peak-yo001` | **Yuta Okkotsu** | Jujutsu Kaisen | `7-A` | Yuta Okkotsu (Estado Base / Katana), Yuta Okkotsu (Conexión Total Rika) (+1) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 18 | `denji-csm-903` | **Denji (Chainsaw Man)** | Chainsaw Man | `7-B` | Denji (Humano), Híbrido Motosierra (+1) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 19 | `makima-csm-904` | **Makima** | Chainsaw Man | `7-B` | Líder de Seguridad Pública | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 20 | `adult-gon-hxh` | **Gon Adulto (Voto y Restricción Suprema)** | Hunter x Hunter | `7-B` | Gon Adulto (Estado Base) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 21 | `killua-zoldyck-hxh` | **Killua Zoldyck** | Hunter x Hunter | `8-A` | Estado Base (El Asesino Silencioso), Modo Godspeed (Kanmuru Activado) (+1) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 22 | `giorno-giovanna-ger-jojo-gg001` | **Giorno Giovanna (GER)** | JoJo's Bizarre Adventure | `Tier 8-C Físico` | Gold Experience (Base), Gold Experience Requiem | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 23 | `pucci-made-in-heaven-jojo-pm001` | **Enrico Pucci (Made in Heaven)** | JoJo's Bizarre Adventure | `Tier 8-C Físico` | Pucci (Whitesnake / Base), C-Moon (Gravedad Reversa) (+1) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 24 | `dio` | **DIO (Dio Brando)** | JoJo's Bizarre Adventure | `Tier 8-C Físico` | Estado Base (Vampiro / The World Inicial), Modo / Sangre de Joseph / 9s Parada Temporal | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 25 | `all-might-prime-mha` | **All Might (Prime)** | My Hero Academia | `6-A` | All Might Prime (Símbolo de la Paz) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 26 | `tanjiro-kamado` | **Tanjiro Kamado** | Demon Slayer (Kimetsu no Yaiba) | `7-B` | Estado Base (Respiración de Agua / Sin Marca), Despertar Solar (Hinokami Kagura / Pico) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 27 | `yujiro-hanma-baki` | **Yujiro Hanma** | Baki the Grappler | `8-A` | Yujiro Hanma (La Criatura Más Fuerte del Planeta), Espalda del Demonio y Sed de Sangre Total | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 28 | `adam-shuumatsu-no-valkyrie` | **Adam** | Record of Ragnarok | `3-A` | Estado Base (Ojos del Señor Pasivos), Voluntad Paternal Inmortal (Post-Mortem) (+1) | `passives, artifacts, teamCombos, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 29 | `superman-dc-909` | **Superman (Clark Kent / Kal-El)** | DC Comics | `2-C` | Estado Base (Superman / Traje Clásico), Modo Electric Blue Superman (+2) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |
| 30 | `son-goku-ni-o-dragon-ball-cl-sico-987` | **Son Goku (Niño)** | Dragon Ball | `7-B` | Goku Niño (Estado Base / Post-Agua Ultra Divina), Oozaru (Gran Mono Descontrolado) | `passives, artifacts, combatStatuses, arenaAffinities, narrativeCombatProfile` |

---

## 5. Personajes Bloqueados por `needsReview` (Backlog V22)

> ⚠️ **Aviso Constitucional**: Estos registros tienen **prohibido** el enriquecimiento de habilidades, pasivas, hax y sinergias hasta que sus incidencias sean resueltas editorialmente en una versión futura (V23+). Conservan intactos sus valores persistentes oficiales de V22.

| # | ID del Registro | Nombre | Franquicia | Severidad | Tipo de Incidencia | Motivo Registrado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `comandante-red-dragon-ball-cl-sico-526` | **Comandante Red** | Dragon Ball | `LOW` | `non_standard_tier_format` | Conserva el sufijo informal ' Físico' ('9-C Físico'). |
| 2 | `piccolo-saga-saiyan` | **Piccolo (Final Saga Saiyan / vs Nappa)** | Dragon Ball | `LOW` | `non_standard_sub_tiers` | Uso de denominaciones no estándar como 'Low 5-B', 'Low 4-C', 'High 4-B' heredadas de esquemas antiguos de VS Battles. |
| 3 | `cell-max-dragon-ball-super-993` | **Cell Max** | Dragon Ball | `MEDIUM` | `whatif_forms_in_canon_profiles` | Fichas pertenecientes a la continuidad canónica (DBS y Daima) contienen transformaciones What-If ajenas a la obra oficial dentro de su arreglo de formas. |
| 4 | `son-goku-adulto-daima` | **Son Goku (Daima — Adulto)** | Dragon Ball | `MEDIUM` | `whatif_forms_in_canon_profiles` | Fichas pertenecientes a la continuidad canónica (DBS y Daima) contienen transformaciones What-If ajenas a la obra oficial dentro de su arreglo de formas. |
| 5 | `son-goku-mini-daima-full` | **Son Goku (Daima — Mini)** | Dragon Ball | `MEDIUM` | `whatif_forms_in_canon_profiles` | Fichas pertenecientes a la continuidad canónica (DBS y Daima) contienen transformaciones What-If ajenas a la obra oficial dentro de su arreglo de formas. |
| 6 | `androides-17-18-u14-dbm` | **Androides #17 y #18 (Continuidad Universo 14, Sin Oposición)** | Dragon Ball | `LOW` | `group_vs_individual_coexistence` | Coexisten fichas individuales con fichas colectivas/dúo para los mismos combatientes de DBM. |
| 7 | `broly-legendario-dbm` | **Broly (Super Saiyan Legendario, Aparición DBM)** | Dragon Ball | `MEDIUM` | `duplicate_or_stub_record` | 'broly-legendario-dbm' es una ficha estática mono-forma de 18.90B Ki, mientras que 'broly-u20-dbm-congelado' representa al mismo personaje con progresión multiforme completa a LSSJ (18.90B a 37.80T Ki). |
| 8 | `broly-u20-dbm-congelado` | **Broly (Universo 20 — DBM, Superviviente Congelado)** | Dragon Ball | `MEDIUM` | `duplicate_or_stub_record` | 'broly-legendario-dbm' es una ficha estática mono-forma de 18.90B Ki, mientras que 'broly-u20-dbm-congelado' representa al mismo personaje con progresión multiforme completa a LSSJ (18.90B a 37.80T Ki). |
| 9 | `dr-raichi-fantasmas-del-odio-u3-dbm` | **Dr. Raichi (y los Fantasmas del Odio)** | Dragon Ball | `MEDIUM` | `duplicate_character_records` | Coexisten dos fichas para el Dr. Raichi de DBM U3: una fija de 845.25M Ki y otra con progresión de cápsula a Fantasma Broly (24.52k a 49.04M Ki). |
| 10 | `dr-raichi-dbm-u3` | **Dr. Raichi / Fantasmas del Odio (Multiverse — U3)** | Dragon Ball | `MEDIUM` | `duplicate_character_records` | Coexisten dos fichas para el Dr. Raichi de DBM U3: una fija de 845.25M Ki y otra con progresión de cápsula a Fantasma Broly (24.52k a 49.04M Ki). |
| 11 | `gohan-u16-dbm-espectador` | **Gohan (Universo 16, Espectador Notable)** | Dragon Ball | `LOW` | `internal_duplicate_form` | forms[2] ('Son Gohan Universo 16 - Estado Místico') y forms[3] ('Estado Místico / Ultimate Gohan') duplican exactamente el mismo estado (11.90M Ki, mult x800, Tier 4-A). |
| 12 | `kat-syd-u6-dbm` | **Kat y Syd (Guerreras Misteriosas, Universo 6)** | Dragon Ball | `LOW` | `group_vs_individual_coexistence` | Coexisten fichas individuales con fichas colectivas/dúo para los mismos combatientes de DBM. |
| 13 | `saiyans-namekianos-u10-grupo` | **Mahissu, Romanesco, Cargot, Caracoru y Lumaca (Guerreros del Universo 10)** | Dragon Ball | `LOW` | `group_vs_individual_coexistence` | Coexisten fichas individuales con fichas colectivas/dúo para los mismos combatientes de DBM. |
| 14 | `son-bra-dbm-u16` | **Son Bra (Multiverse — U16)** | Dragon Ball | `HIGH` | `structural_form_and_multiplier_inconsistency` | Form 1 ('Son Bra (Majin Bra)') figura como forma intermedia con mult x1.5 y 44.46k Ki, previa al SSJ1 (x50), cuando narrativamente Majin Bra es SSJ2 bajo posesión de Babidi. |
| 15 | `tidar-xeniloum-u19-dbm` | **Tidar y Xeniloum (Guerreros Heliotas, Universo 19)** | Dragon Ball | `LOW` | `group_vs_individual_coexistence` | Coexisten fichas individuales con fichas colectivas/dúo para los mismos combatientes de DBM. |
| 16 | `yamcha-u9-dbm` | **Yamcha (Continuidad Universo 9, Veterano Sin Saiyans)** | Dragon Ball | `MEDIUM` | `ki_lore_incoherence` | En DBM, Yamcha U9 fue modificado a androide (nivel superior a A-18), pero conserva 1.554 unidades de Ki de la llegada de los Saiyans. |
| 17 | `raditz-redimido-brokoly` | **Raditz (Guerrero Z)** | Dragon Ball | `HIGH` | `severe_ki_tier_incoherence` | Raditz Guerrero Z base figura con 1.575 Ki en Tier 4-B (Sistema Solar) y Saibaman Mutante base figura con 1.260 Ki en Tier 4-A. El Ki numérico es de nivel Saiyan ordinario pero el tier fue inflado por plantilla. |
| 18 | `saibaman-mutante-brokoly` | **Saibaman (Mutante Evolutivo)** | Dragon Ball | `HIGH` | `severe_ki_tier_incoherence` | Raditz Guerrero Z base figura con 1.575 Ki en Tier 4-B (Sistema Solar) y Saibaman Mutante base figura con 1.260 Ki en Tier 4-A. El Ki numérico es de nivel Saiyan ordinario pero el tier fue inflado por plantilla. |
| 19 | `baby-god-brokoly` | **Super Baby Vegeta (Baby God)** | Dragon Ball | `HIGH` | `duplicate_character_records` | Coexisten dos fichas independientes para el mismo What-If ('Super Baby Vegeta Baby God' de @Brokoly350) con progresiones numéricas incompatibles: una escala a 1.33T Ki (High 3-A, mult x50) y la otra a 283.58T Ki (3-A, mult x6400). |
| 20 | `baby-vegeta-god-brokoly` | **Super Baby Vegeta (What-If Baby God)** | Dragon Ball | `HIGH` | `duplicate_character_records` | Coexisten dos fichas independientes para el mismo What-If ('Super Baby Vegeta Baby God' de @Brokoly350) con progresiones numéricas incompatibles: una escala a 1.33T Ki (High 3-A, mult x50) y la otra a 283.58T Ki (3-A, mult x6400). |
| 21 | `vegeta-db-after` | **Vegeta (DB After)** | Dragon Ball | `MEDIUM` | `structural_tier_and_multiplier_anomaly` | forms[2] ('Super Saiyan + Kaio-ken x20') repite el multiplicador x50 de SSJ1 sin aplicar el Kaio-ken x20 y salta anómalamente a Tier 2-B, el cual luego decae a Low 2-C en SSJ2 Majin y SSJ3. |
| 22 | `akaza-kimetsu` | **Akaza** | Demon Slayer (Kimetsu no Yaiba) | `LOW` | `non_standard_tier_kny` | Regeneración craneal figura con tier 'High 8-A'. |
| 23 | `hisoka-morow` | **Hisoka Morow** | Hunter x Hunter | `LOW` | `non_standard_tiers_hxh` | Uso de 'Low 7-B', 'High 7-A' y 'High 8-A'. |
| 24 | `netero-hxh-912` | **Isaac Netero** | Hunter x Hunter | `LOW` | `non_standard_tiers_hxh` | Uso de 'Low 7-B', 'High 7-A' y 'High 8-A'. |
| 25 | `meruem-hxh-911` | **Meruem** | Hunter x Hunter | `LOW` | `non_standard_tiers_hxh` | Uso de 'Low 7-B', 'High 7-A' y 'High 8-A'. |
| 26 | `tatsumaki-opm` | **Tatsumaki** | One Punch Man | `MEDIUM` | `textual_range_tier` | Forma base casual figura con tier 'High 6-A a 5-C'. |
| 27 | `izuku-midoriya-deku-mha` | **Izuku Midoriya (Deku)** | My Hero Academia | `MEDIUM` | `textual_range_tier` | Múltiples formas tienen asignado el rango textual ambiguo 'High 6-A a 5-C' en lugar de un único tier discreto. |
| 28 | `shigaraki-tomura-mha` | **Shigaraki Tomura** | My Hero Academia | `MEDIUM` | `textual_range_tier` | Múltiples formas tienen asignado el rango textual ambiguo 'High 6-A a 5-C' en lugar de un único tier discreto. |
| 29 | `kaoru-hanayama` | **Kaoru Hanayama** | Baki the Grappler | `HIGH` | `full_verse_internal_order_recalibration` | Las relaciones de Ki y tiers entre los peleadores cumbre (Yujiro vs Baki vs Jack vs Oliva vs Hanayama) no reflejan fielmente la jerarquía del Torneo Máximo / Padre e Hijo sin un reescalado integral coordinado. |
| 30 | `doctor-strange` | **Doctor Strange (Stephen Strange)** | Marvel Comics | `LOW` | `non_standard_tiers_marvel` | Doctor Strange forma astral figura en 'High 7-A' e Immortal Hulk en 'High 4-B'. |
| 31 | `hulk` | **Hulk (Bruce Banner)** | Marvel Comics | `LOW` | `non_standard_tiers_marvel` | Doctor Strange forma astral figura en 'High 7-A' e Immortal Hulk en 'High 4-B'. |
| 32 | `iron-man-marvel-908` | **Iron Man (Tony Stark)** | Marvel Comics | `LOW` | `external_gear_vs_base_physique` | Las armaduras externas con tiers 4-B / High 3-A están modeladas dentro del árbol de formas del humano base. |
| 33 | `batman-dc-910` | **Batman (Bruce Wayne)** | DC Comics | `LOW` | `external_gear_vs_base_physique` | Las armaduras externas con tiers 4-B / High 3-A están modeladas dentro del árbol de formas del humano base. |
| 34 | `atom-eve-invincible` | **Atom Eve** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 35 | `battle-beast-invincible` | **Battle Beast** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 36 | `bulletproof-invincible` | **Bulletproof** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 37 | `dupli-kate-invincible` | **Dupli-Kate** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 38 | `kregg-invincible-war` | **General Kregg** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 39 | `lucan-invincible` | **Lucan** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 40 | `monster-girl-invincible` | **Monster Girl** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 41 | `omni-man-invincible-905` | **Omni-Man (Nolan Grayson)** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 42 | `rex-splode-invincible` | **Rex Splode** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 43 | `robot-rudy-invincible` | **Robot** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 44 | `space-racer-invincible` | **Space Racer** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 45 | `tech-jacket-invincible` | **Tech Jacket** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 46 | `thaedus-invincible-war` | **Thaedus** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 47 | `universa-invincible` | **Universa** | Invincible | `HIGH` | `template_contamination_and_wrong_character_content` | 14 fichas de personajes de la franquicia Invincible heredaron la plantilla base de Mark Grayson ('forms[0].name: Invincible (Mark Grayson)' y 600.000 / 900.000 Ki numérico), sobrescribiendo la identidad de la forma base. |
| 48 | `black-noir` | **Black Noir** | The Boys | `MEDIUM` | `verse_human_vs_super_balance` | La disparidad entre humanos normales armados y supers potenciados con Compuesto V requiere armonizar los tiers Tier 9 / Tier 8 sin descalibrar el canon de la serie de TV. |
| 49 | `soldier-boy` | **Soldier Boy (Ben)** | The Boys | `MEDIUM` | `verse_human_vs_super_balance` | La disparidad entre humanos normales armados y supers potenciados con Compuesto V requiere armonizar los tiers Tier 9 / Tier 8 sin descalibrar el canon de la serie de TV. |

---

## 6. Orden Sugerido de Trabajo por Franquicia (Roadmap de Borradores)

Para la redacción modular de `enrichment drafts` (guardados exclusivamente en `src/data/enrichmentDrafts/`), se sugiere seguir el siguiente orden cronológico y de impacto en el motor:

1. **Fase 1 — Pilares de Simulación Multiversal (Dragon Ball & One Punch Man)**
   - **Dragon Ball** (90 Critical, 61 High): Enriquecer arsenales tácticos, pasivas de Zenkai/Ki divino, afinidades de arena (Gravedad x100, Vacío, Planeta Supremo) y estados (Agotamiento de Ki, Hakai Burn).
   - **One Punch Man** (8 Critical, 14 High): Enriquecer pasivas de Limitador Roto, radiación cósmica, regeneración celular y perfiles narrativos.

2. **Fase 2 — Usuarios de Hax Complejo y Expansiones de Dominio (Jujutsu Kaisen, Chainsaw Man & JoJo)**
   - **Jujutsu Kaisen** (8 Critical, 16 High): Enriquecer mecánicas de Dominio Simple, Burnout de Técnica Maldita y votos vinculantes.
   - **Chainsaw Man** (4 Critical, 13 High): Enriquecer contratos demoníacos, absorción de conceptos y pasivas de inmortalidad por sangre.
   - **JoJo's Bizarre Adventure** (9 Critical, 14 High): Enriquecer stands de manipulación temporal, causalidad nula (GER) y gravedad infinita.

3. **Fase 3 — Shonen de Combate Estratégico (Hunter x Hunter, My Hero Academia & Demon Slayer)**
   - **Hunter x Hunter** (6 Critical, 12 High): Condiciones estrictas de Nen, votos mortales y auras defensivas (Ken/Ko/Ryu).
   - **My Hero Academia** (4 Critical, 17 High): Despertar de Dones, retroceso biológico de Gearshift y acumulación de Stockpile.
   - **Demon Slayer** (6 Critical, 16 High): Respiraciones, Mundo Transparente, Marcas del Cazador y regeneración demoníaca.

4. **Fase 4 — Cómics y Superhéroes (DC, Marvel, The Boys & Invincible)**
   - **DC & Marvel Comics** (17 Critical, 30 High): Entidades multiversales, armaduras cósmicas, speed force y magia del caos.
   - **The Boys & Invincible (registros no bloqueados)**: Fisiología Viltrumita pura, factor Compound V y durabilidad cinemática.

5. **Fase 5 — Torneo y Marciales Puros (Record of Ragnarok, Baki the Grappler & Spy x Family)**
   - **Record of Ragnarok**: Volundr divino, Ojos del Señor, técnica de Adán y gotas de sangre de Icor.
   - **Baki the Grappler**: Demon Back, técnicas de artes marciales chinas de 4000 años e ilusión táctica.
   - **Spy x Family**: Técnicas de asesinato silencioso y combate de espionaje.

6. **Fase 6 — Resolución Editorial del Backlog V22 (Preparación de V23)**
   - Auditoría y resolución manual con aprobación humana previa de los 49 casos de `needsReview` para habilitar su posterior enriquecimiento.
