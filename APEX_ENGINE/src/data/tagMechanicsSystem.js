// APEX Powerscaling Engine — Sistema Central de Mecánicas Basadas en Tags
// Diseñado para escalar automáticamente con cualquier personaje del roster.
// Incluye: Primera, Segunda, Tercera (Jerarquías Divinas & DBM), Cuarta (Maldición, Stands & Tiempo) y Quinta Oleada (Nen, Devils Hierarchy, Armamento y Boss Fights).

export const TAG_SYNERGIES = [
  {
    "id": "syn-ki-divino",
    "name": "Resonancia de Ki Divino",
    "icon": "✨",
    "requiredTags": [
      "Ki Divino"
    ],
    "minMatches": 2,
    "effect": "Ambos luchadores generan un campo de maná/ki compartido; el AP de técnicas ofensivas +15% mientras combatan en proximidad. Si uno cae bajo el 20% HP, recibe transferencia automática de 10% de Ki del aliado (1 vez por combate)."
  },
  {
    "id": "syn-simbiosis-absorcion",
    "name": "Simbiosis de Absorción",
    "icon": "🧬",
    "requiredTags": [
      "Absorbedor Orgánico",
      "Regenerador Celular"
    ],
    "minMatches": 2,
    "effect": "El Absorbedor fusiona temporalmente ADN del Regenerador sin necesidad de contacto letal, ganando +1 Tier de resistencia durante 3 turnos a cambio de pausar la regeneración pasiva del aliado ese mismo tiempo."
  },
  {
    "id": "syn-elementos-opuestos",
    "name": "Choque de Elementos Opuestos",
    "icon": "🔥",
    "requiredTags": [
      "Fuego/Magma",
      "Viento/Aire"
    ],
    "minMatches": 2,
    "effect": "Los ataques de área se convierten en tormentas ígneas, subiendo el AP del ataque y quemando el oxígeno del escenario (debuff a quienes no tengan Respiración Independiente)."
  },
  {
    "id": "syn-dominio-compartido",
    "name": "Protocolo de Dominio Compartido",
    "icon": "🏯",
    "requiredTags": [
      "Usuario de Dominio Expandido"
    ],
    "minMatches": 2,
    "effect": "Si ambos activan su Dominio simultáneamente, se genera una 'Colisión de Dominios' que anula el Certain Hit mutuo y libera una onda de choque neutral de área masiva."
  },
  {
    "id": "syn-cadena-black-flash",
    "name": "Cadena de Destello Negro",
    "icon": "⚡",
    "requiredTags": [
      "Usuario de Destello Negro"
    ],
    "minMatches": 2,
    "effect": "Cada Destello Negro consecutivo lanzado por miembros distintos del equipo en 3 turnos multiplica el daño acumulado x1.2 adicional por impacto (tope en x2.0)."
  },
  {
    "id": "syn-trinidad-poder",
    "name": "Trinidad de Poder Puro",
    "icon": "🛡️",
    "requiredTags": [
      "Icono Fundacional"
    ],
    "minMatches": 3,
    "effect": "Mientras los tres estén activos en combate, el equipo ignora el primer debuff de control de cualquier tipo (aturdimiento, ralentización, sellado) cada 5 turnos."
  },
  {
    "id": "syn-speedforce-link",
    "name": "Fuerza de Aceleración Compartida (Speedforce Link)",
    "icon": "⚡",
    "requiredTags": [
      "Velocista"
    ],
    "minMatches": 2,
    "effect": "Los velocistas conectados pueden prestarse velocidad: uno puede sacrificar 20% de su velocidad de turno para otorgar +40% al compañero por un asalto."
  },
  {
    "id": "syn-clase-s-coordinada",
    "name": "Alianza de Cazadores Clase S",
    "icon": "🎖️",
    "requiredTags": [
      "Clase S",
      "Héroe Profesional de Alto Rango"
    ],
    "minMatches": 2,
    "effect": "Control de escena profesional: el daño colateral se reduce un 10% protegiendo el entorno, pero la precisión contra objetivos designados sube un 20%."
  },
  {
    "id": "syn-pacto-contrato-diabolico",
    "name": "Pacto de Contrato Demoniaco Cruzado",
    "icon": "🩸",
    "requiredTags": [
      "Usuario de Contrato Diabólico"
    ],
    "minMatches": 2,
    "effect": "Comparten el factor de miedo de sus respectivos diablos contratados, aplicando el debuff de terror del diablo más fuerte en área."
  },
  {
    "id": "syn-respiracion-sincronizada",
    "name": "Respiración Sincronizada",
    "icon": "⚔️",
    "requiredTags": [
      "Usuario de Respiración",
      "Portador de Espada Demoníaca/Nichirin"
    ],
    "minMatches": 2,
    "effect": "Al usar respiraciones complementarias obtienen 'Forma Dual', encadenando cortes continuos con un combo elemental de remate."
  },
  {
    "id": "syn-nen-voto-restriccion",
    "name": "Convergencia de Voto y Restricción",
    "icon": "⛓️",
    "requiredTags": [
      "Usuario de Nen/Voto Autoimpuesto"
    ],
    "minMatches": 2,
    "effect": "Si ambos tienen votos activos de restricción, obtienen un bonus compartido de +30% AP en el turno donde ambos rompen su restricción al unísono."
  },
  {
    "id": "syn-espadas-ancestrales",
    "name": "Legado de la Espada Ancestral",
    "icon": "🗡️",
    "requiredTags": [
      "Portador de Espada Demoníaca/Nichirin"
    ],
    "minMatches": 2,
    "effect": "Los filos resuenan: la técnica elemental de uno amplifica el corte del otro en un +15% en rango cerrado."
  },
  {
    "id": "syn-pacto-sangre-baki",
    "name": "Pacto de Sangre Titánica (Biomecánica Extrema)",
    "icon": "💪",
    "requiredTags": [
      "Biomecánica Extrema"
    ],
    "minMatches": 2,
    "effect": "Masoquismo estratégico: ganan +10% de daño acumulativo por cada intercambio físico directo recibido y devuelto (tope +50%)."
  },
  {
    "id": "syn-herencia-divina",
    "name": "Herencia Divina Nórdica/Mitológica",
    "icon": "🏛️",
    "requiredTags": [
      "Deidad/Figura Mitológica"
    ],
    "minMatches": 2,
    "effect": "Sincretismo Divino: comparten inmunidad a sellado y exorcismo mutuo durante todo el combate."
  },
  {
    "id": "syn-titanes-cosmicos",
    "name": "Alianza de Titanes Cósmicos",
    "icon": "🪐",
    "requiredTags": [
      "Nivel Planetario+"
    ],
    "minMatches": 2,
    "effect": "Campo de contención gravitatoria: reduce el daño destructivo al escenario en 40% focalizando el 100% del impacto en el cuerpo del oponente."
  },
  {
    "id": "syn-speed-percepcion",
    "name": "Conexión Velocidad & Percepción Acelerada",
    "icon": "👁️",
    "requiredTags": [
      "Velocista",
      "Percepción Acelerada"
    ],
    "minMatches": 2,
    "effect": "El velocista presta fracciones de tiempo relativo al compañero con percepción acelerada, permitiéndole esquivar ataques MFTL."
  },
  {
    "id": "syn-odio-antagonistas",
    "name": "Resonancia de Odio Encarnado",
    "icon": "😈",
    "requiredTags": [
      "Antagonista Encarnación del Mal"
    ],
    "minMatches": 2,
    "effect": "Aura de pesadilla: infligen debuff permanente de moral y vacilación a todos los enemigos en el radio de combate."
  },
  {
    "id": "syn-mentor-discipulo",
    "name": "Vínculo de Mentor y Discípulo",
    "icon": "🥋",
    "requiredTags": [
      "Mentor de Combate",
      "Discípulo Directo"
    ],
    "minMatches": 2,
    "effect": "El discípulo puede replicar 1 técnica insignia del mentor (a 60% de potencia) una vez por combate mientras el mentor siga consciente."
  },
  {
    "id": "syn-angel-destructor",
    "name": "Protocolo Ángel-Dios de la Destrucción",
    "icon": "🌌",
    "requiredTags": [
      "Ángel Asistente",
      "Dios de la Destrucción"
    ],
    "minMatches": 2,
    "effect": "El Ángel puede interceder UNA vez por combate para 'corregir' un error táctico de su Dios asignado (recalcular trayectoria de un ataque fallido), pero jamás puede atacar directamente salvo que su Dios sea eliminado — en ese caso, el Ángel hereda temporalmente el 70% del poder de su Dios como 'modo luto'."
  },
  {
    "id": "syn-autoridad-omni-king",
    "name": "Jerarquía Celestial de Autoridad",
    "icon": "👑",
    "requiredTags": [
      "Autoridad Absoluta (Tier Omni-King)"
    ],
    "minMatches": 1,
    "effect": "Ningún personaje sin este mismo tag puede iniciar combate contra el portador sin que la narrativa lo permita explícitamente — mecánica de 'veto narrativo': el escritor debe declarar una excepción activa para que el combate ocurra, de lo contrario el personaje con Autoridad Absoluta gana automáticamente por concesión de universo."
  },
  {
    "id": "syn-concilio-kaioshin",
    "name": "Concilio de Kaio-shin",
    "icon": "🔮",
    "requiredTags": [
      "Kaio-shin/Deidad Creadora"
    ],
    "minMatches": 2,
    "effect": "Dos Kaio-shin combinando rituales pueden sellar temporalmente (2 turnos) a un enemigo de tier igual o inferior sin necesidad de combate directo, representando el ritual de sellado clásico (Old Kai + Shin)."
  },
  {
    "id": "syn-enjambre-guardia-real",
    "name": "Enjambre de Voluntad Única (Royal Guard Hivemind)",
    "icon": "🐜",
    "requiredTags": [
      "Guardia Real/Enjambre Consciente"
    ],
    "minMatches": 2,
    "effect": "Los miembros del enjambre comparten información de combate instantáneamente (sin retraso narrativo) y pueden coordinar un ataque triple simultáneo con precisión sobrehumana, aunque estén en ubicaciones físicamente distintas de la escena."
  },
  {
    "id": "syn-dojo-compartido",
    "name": "Filosofía del Dojo Compartido",
    "icon": "🥋",
    "requiredTags": [
      "Maestro de Artes Marciales Clásicas"
    ],
    "minMatches": 2,
    "effect": "Dos maestros de estilos distintos (Karate, Judo, Kung-fu, Muay Thai, etc.) pueden identificar instantáneamente las debilidades técnicas del estilo del oponente si lo han visto pelear una vez, otorgando +15% de precisión de contraataque a ambos contra ese estilo específico en el resto del combate."
  },
  {
    "id": "syn-torneo-multiversal",
    "name": "Alianza de Torneo Multiversal (DBM Style)",
    "icon": "🏆",
    "requiredTags": [
      "Competidor de Torneo Multiversal"
    ],
    "minMatches": 2,
    "effect": "Competidores del mismo universo peleando en equipo (raro en el formato torneo, pero posible en escenarios de invasión) ganan +10% de moral/AP por 'orgullo de representar a su universo', ignorando rivalidades internas previas al torneo."
  },
  {
    "id": "syn-heraldo-cosmico",
    "name": "Resonancia de Poder Cósmico Heráldico",
    "icon": "🌟",
    "requiredTags": [
      "Heraldo de Entidad Cósmica",
      "Usuario de Poder Cósmico"
    ],
    "minMatches": 2,
    "effect": "El heraldo puede canalizar temporalmente una fracción del poder de su entidad cósmica de origen a través de cualquier aliado con tag de Poder Cósmico compatible, actuando como 'amplificador' sin necesidad de que la entidad esté presente."
  },
  {
    "id": "syn-doctrina-aniquilacion",
    "name": "Doctrina de Aniquilación Sistemática",
    "icon": "☠️",
    "requiredTags": [
      "Antimateria/Devastador de Universos",
      "Ejecutor Leal"
    ],
    "minMatches": 2,
    "effect": "El subordinado puede 'invocar' narrativamente la amenaza de su amo como forma de intimidación pasiva, reduciendo la moral de combate del enemigo sin que el ser de Tier 1 esté físicamente presente en la escena."
  },
  {
    "id": "syn-linaje-real-alienigena",
    "name": "Legado del Linaje Real Alienígena",
    "icon": "👑",
    "requiredTags": [
      "Rey de Linaje Alienígena",
      "Soldado/Subordinado del Mismo Imperio"
    ],
    "minMatches": 2,
    "effect": "El subordinado recibe un bonus de +20% AP mientras su Rey esté presente y consciente en la escena ('orgullo imperial'), pero sufre un debuff de -15% moral si presencia la derrota de su Rey en el mismo combate."
  },
  {
    "id": "syn-espectadores-potencial",
    "name": "Sincronía de Espectadores de Potencial",
    "icon": "👤",
    "requiredTags": [
      "Potencial Estimado No Confirmado"
    ],
    "minMatches": 2,
    "effect": "Dos personajes cuyo poder real nunca se mostró en combate completo generan entre sí una 'incertidumbre mutua' — ninguno de los dos puede ser calculado con precisión por tags de 'Análisis de Amenaza' enemigos mientras compartan escena, simulando el misterio narrativo de personajes de fondo con poder sin explorar."
  },
  {
    "id": "syn-bioingenieria-red",
    "name": "Bioingeniería Compartida (Androide/Bio-Android Network)",
    "icon": "🤖",
    "requiredTags": [
      "Creación Artificial/Bioingeniería"
    ],
    "minMatches": 2,
    "effect": "Si comparten el mismo 'creador' narrativo (mismo científico/organización), pueden sincronizar sistemas de energía — uno puede transferir directamente su reserva de energía al otro sin pérdida, sin importar la distancia en la escena."
  },
  {
    "id": "syn-paradoja-temporal",
    "name": "Paradoja Temporal Compartida",
    "icon": "⏳",
    "requiredTags": [
      "Manipulador Temporal"
    ],
    "minMatches": 2,
    "effect": "Si ambos alteran el tiempo en el mismo combate, se genera una 'zona de inestabilidad cronológica' — ningún efecto de curación o resurrección funciona en el área mientras ambos mantengan sus poderes activos simultáneamente (previene loops infinitos narrativos tipo Flash vs Zamasu)."
  },
  {
    "id": "syn-resonancia-ripple",
    "name": "Resonancia de Ondulación (Ripple Harmony)",
    "icon": "☀️",
    "requiredTags": [
      "Usuario de Ondulación/Ripple"
    ],
    "minMatches": 2,
    "effect": "Dos usuarios de Ripple sincronizando su respiración pueden crear un pulso de energía solar combinado que es especialmente efectivo contra objetivos con [Tag: 'No-Muerto/Vampírico'], duplicando el daño contra ese tipo específico de enemigo."
  },
  {
    "id": "syn-stands-formacion",
    "name": "Invocación de Stand en Formación",
    "icon": "⭐",
    "requiredTags": [
      "Usuario de Stand"
    ],
    "minMatches": 2,
    "effect": "Dos Stands de rango físico corto pueden operar en el mismo espacio de combate sin interferirse, coordinando golpes desde ángulos que un solo Stand no podría cubrir — bonus de +15% precisión cuando atacan al mismo objetivo en el mismo turno."
  },
  {
    "id": "syn-tecnica-invertida-circuito",
    "name": "Circuito de Técnica Invertida",
    "icon": "☯️",
    "requiredTags": [
      "Usuario de Técnica Inversa de Maldición",
      "Usuario de Energía Maldita"
    ],
    "minMatches": 2,
    "effect": "El usuario de Técnica Inversa puede canalizar curación a distancia hacia cualquier aliado con Energía Maldita compatible, sin necesidad de contacto físico, mientras ambos permanezcan en la misma escena de combate."
  },
  {
    "id": "syn-cadena-herencia-poder",
    "name": "Cadena de Herencia de Poder",
    "icon": "🔥",
    "requiredTags": [
      "Heredero de Poder (One For All Style)",
      "Portador Original/Predecesor"
    ],
    "minMatches": 2,
    "effect": "Si el predecesor está presente (incluso debilitado o en forma reducida), el heredero puede acceder temporalmente a un porcentaje mayor del poder heredado del que normalmente controla, representando el 'empujón' narrativo de tener al maestro cerca en el momento crítico."
  },
  {
    "id": "syn-plaga-corrupcion",
    "name": "Plaga Compartida (Corrupción en Red)",
    "icon": "☣️",
    "requiredTags": [
      "Portador de Enfermedad/Corrupción"
    ],
    "minMatches": 2,
    "effect": "Dos fuentes de corrupción/veneno combinando sus efectos generan una mutación de tercer orden más letal que cualquiera de las dos por separado, pero que también los afecta levemente a ellos mismos (debuff menor compartido) por inestabilidad química/mágica."
  },
  {
    "id": "syn-velo-ilusion-doble",
    "name": "Velo de Ilusión Doble",
    "icon": "🎭",
    "requiredTags": [
      "Ilusionista Mental"
    ],
    "minMatches": 2,
    "effect": "Dos ilusionistas pueden crear una ilusión 'anidada' — el enemigo que rompe la primera capa de engaño se encuentra con una segunda ilusión indistinguible de la realidad, ganando un turno extra de ventaja táctica para el equipo."
  },
  {
    "id": "syn-escala-dinamica",
    "name": "Sincronía de Escala Dinámica",
    "icon": "📐",
    "requiredTags": [
      "Manipulador de Escala/Tamaño"
    ],
    "minMatches": 1,
    "effect": "El manipulador de escala puede reducir temporalmente el tamaño de un aliado (aumentando su velocidad y evasión drásticamente) o aumentarlo (aumentando su fuerza bruta), a elección táctica una vez por combate."
  },
  {
    "id": "syn-voluntad-inquebrantable",
    "name": "Voluntad Compartida Inquebrantable",
    "icon": "🛡️",
    "requiredTags": [
      "Voluntad Inquebrantable"
    ],
    "minMatches": 2,
    "effect": "Cuando dos personajes con determinación narrativa 'de protagonista' luchan juntos y ambos están por debajo del 20% HP, ninguno puede ser derrotado por debuffs de un solo golpe (one-shot) durante los siguientes 2 turnos — representa el clímax narrativo de 'no vamos a rendirnos'."
  },
  {
    "id": "syn-red-suplentes",
    "name": "Red de Suplentes Coordinados",
    "icon": "🔄",
    "requiredTags": [
      "Combatiente de Reserva/Suplente"
    ],
    "minMatches": 1,
    "effect": "Un combatiente de reserva puede entrar al combate instantáneamente reemplazando a un aliado que cae, sin perder ningún turno de transición, siempre que se declare antes del inicio del combate como parte del roster disponible de esa escena."
  },
  {
    "id": "syn-nen-complementarias",
    "name": "Categorías de Nen Complementarias",
    "icon": "🔮",
    "requiredTags": [
      "Nen: Manipulador",
      "Nen: Conjurador"
    ],
    "minMatches": 2,
    "effect": "El Conjurador puede materializar un objeto que el Manipulador puede controlar a distancia sin necesidad de contacto físico previo — combo de origen entre categorías de Nen compatibles."
  },
  {
    "id": "syn-emisor-transmutador",
    "name": "Resonancia de Emisor-Transmutador",
    "icon": "⚡",
    "requiredTags": [
      "Nen: Emisor",
      "Nen: Transmutador"
    ],
    "minMatches": 2,
    "effect": "El Transmutador puede alterar la naturaleza del ataque a distancia emitido por el Emisor (cambiar textura, propiedad elemental narrativa) justo antes del impacto, sin que el Emisor necesite entrenar esa propiedad él mismo."
  },
  {
    "id": "syn-pacto-jerarquia-infernal",
    "name": "Pacto de Jerarquía Infernal",
    "icon": "🩸",
    "requiredTags": [
      "Diablo Primigenio/Jerárquico",
      "Usuario de Contrato Diabólico"
    ],
    "minMatches": 2,
    "effect": "Si el diablo primigenio y su contratado comparten escena, el contratado puede pedir 'préstamo de miedo' — una fracción del terror que ese diablo primigenio inspira en el mundo se aplica como debuff de moral a los enemigos presentes, sin que el diablo primigenio intervenga directamente."
  },
  {
    "id": "syn-sincronia-arma-viviente",
    "name": "Sincronía de Arma Viviente",
    "icon": "🗡️",
    "requiredTags": [
      "Portador de Arma con Voluntad Propia"
    ],
    "minMatches": 2,
    "effect": "Un arma con conciencia propia reconoce a cualquier portador anterior legítimo presente y le otorga un bonus de familiaridad (+10% precisión) incluso si no es su portador actual."
  },
  {
    "id": "syn-grappling-compartido",
    "name": "Escuela de Grappling Compartida",
    "icon": "🥋",
    "requiredTags": [
      "Especialista en Sumisión/Grappling"
    ],
    "minMatches": 2,
    "effect": "Dos grapplers de escuelas distintas peleando del mismo lado pueden ejecutar un 'sandwich de control' — inmovilizan a un objetivo desde posiciones opuestas simultáneamente, con la resistencia a escape del objetivo calculada como si enfrentara un solo grappler de nivel combinado superior."
  },
  {
    "id": "syn-presion-nen-especialista",
    "name": "Presión de Combate Especialista (Nen: Specialist)",
    "icon": "👁️",
    "requiredTags": [
      "Nen: Especialista"
    ],
    "minMatches": 1,
    "effect": "Los especialistas de Nen operan fuera de las reglas normales de sinergia — reducen aleatoriamente una restricción táctica de CUALQUIER aliado presente, representando su naturaleza impredecible y única."
  },
  {
    "id": "syn-vinculo-fantasma-corporativo",
    "name": "Vínculo de Fantasma Corporativo (Devil Hunter Network)",
    "icon": "🪓",
    "requiredTags": [
      "Cazador de Diablos Profesional"
    ],
    "minMatches": 2,
    "effect": "Dos cazadores certificados de la misma organización comparten automáticamente inteligencia táctica sobre el diablo objetivo (debilidades conocidas, nombre completo si se sabe) sin necesidad de comunicación verbal explícita."
  },
  {
    "id": "syn-resonancia-arma-legendaria-dual",
    "name": "Resonancia de Arma Legendaria Dual",
    "icon": "⚔️",
    "requiredTags": [
      "Portador de Arma con Voluntad Propia"
    ],
    "minMatches": 2,
    "effect": "Dos armas sintientes distintas presentes en la misma escena se reconocen narrativamente entre sí como artefactos de poder comparable, otorgando a ambos portadores +10% de resistencia a efectos de robo o desarme de arma."
  },
  {
    "id": "syn-herencia-hanma-legacy",
    "name": "Herencia de Estilo de Combate Familiar",
    "icon": "👹",
    "requiredTags": [
      "Linaje de Combate Familiar (Hanma-Style)"
    ],
    "minMatches": 2,
    "effect": "Miembros de la misma línea de combate biológica/entrenamiento generan un 'reconocimiento de sangre' — pueden anticipar los siguientes 2 movimientos del otro con precisión sobrehumana, útil tanto para combos cooperativos como para rivalidad dramática."
  },
  {
    "id": "syn-frecuencia-mental-compartida",
    "name": "Frecuencia Compartida de Manipulación Mental",
    "icon": "🧠",
    "requiredTags": [
      "Manipulador Mental/de Contratos"
    ],
    "minMatches": 2,
    "effect": "Dos manipuladores mentales de tier similar pueden layerar órdenes sobre el mismo objetivo, haciendo exponencialmente más difícil que el objetivo distinga cuál orden es la real y cuál es ruido de distracción."
  },
  {
    "id": "syn-aereo-terrestre",
    "name": "Sinergia de Combate Aéreo/Terrestre",
    "icon": "🦅",
    "requiredTags": [
      "Combatiente Aéreo",
      "Combatiente Terrestre/Grappling"
    ],
    "minMatches": 2,
    "effect": "El combatiente aéreo fuerza al enemigo a quedarse en el suelo bloqueando rutas de escape vertical, mientras el especialista terrestre lo somete sin que el objetivo tenga opción de escapar hacia arriba."
  },
  {
    "id": "syn-presion-amenaza-existencial-boss",
    "name": "Presión Colectiva de Amenaza Existencial",
    "icon": "👑",
    "requiredTags": [
      "Boss de Aniquilación Universal"
    ],
    "minMatches": 1,
    "effect": "El Boss ignora ataques individuales de bajo impacto, pero acumula un contador de 'irritación' — tras 5 golpes ignorados de cualquier origen, se ve forzado a la transición de fase siguiente antes de tiempo, representando el desgaste colectivo por número."
  }
];

export const TAG_TEAM_COMBOS = [

  {
    "id": "combo-kamehameha-doble",
    "name": "Kamehameha Doble (Energía Convergente)",
    "requiredTags": [
      "Usuario de Ki",
      "Ki Divino"
    ],
    "minMatches": 2,
    "description": "Dos ondas masivas disparadas en ángulo convergente se fusionan a medio camino, multiplicando el AP combinado x1.8 en un haz unificado."
  },
  {
    "id": "combo-ejecucion-dominio",
    "name": "Ejecución de Dominio Simultáneo",
    "requiredTags": [
      "Usuario de Dominio Expandido",
      "Portador de Vasija/Recipiente Maldito"
    ],
    "minMatches": 2,
    "description": "Uno abre el Dominio garantizando el Certain Hit mientras el compañero conecta un golpe físico definitivo imposible de esquivar."
  },
  {
    "id": "combo-rotura-limitador",
    "name": "Combo de Rotura de Limitador Escalonada",
    "requiredTags": [
      "Rotura de Limitador"
    ],
    "minMatches": 2,
    "description": "El primer luchador absorbe el impacto frontal rompiendo su límite; el segundo asesta el golpe de gracia con +50% de daño crítico."
  },
  {
    "id": "combo-fusion-emergencia",
    "name": "Fusión de Emergencia Táctica",
    "requiredTags": [
      "Fusionable (Danza/Pothara/Namekiana)"
    ],
    "minMatches": 2,
    "description": "Ritual o acople de emergencia bajo fuego enemigo; durante los turnos de canalización obtienen +100% de evasión por cobertura mutua."
  },
  {
    "id": "combo-speed-fuerza-bruta",
    "name": "Golpe Gemelo de Velocista y Fuerza Bruta",
    "requiredTags": [
      "Velocista",
      "Fuerza Bruta Sobrehumana"
    ],
    "minMatches": 2,
    "description": "El velocista desestabiliza y desorienta al rival a velocidad luz; el tanque remata con un impacto al 100% que ignora guardias."
  },
  {
    "id": "combo-magia-escudo",
    "name": "Barrera de Magia y Escudo Físico",
    "requiredTags": [
      "Usuario de Magia",
      "Tanque/Defensor"
    ],
    "minMatches": 2,
    "description": "Barrera mística sincronizada con blindaje material: comparten una sola barra de resistencia que absorbe hasta el doble de castigo."
  },
  {
    "id": "combo-purga-hashira",
    "name": "Purga y Decapitación de Élite",
    "requiredTags": [
      "Portador de Espada Demoníaca/Nichirin",
      "Pilar/Hashira o Equivalente de Élite"
    ],
    "minMatches": 2,
    "description": "Inmovilización por cortes de contención rápida seguida por la estocada decapitadora del Pilar con +25% de precisión crítica."
  },
  {
    "id": "combo-cerco-rango-s",
    "name": "Combo de Rango S: Cerco Total",
    "requiredTags": [
      "Héroe Profesional de Alto Rango",
      "Clase S"
    ],
    "minMatches": 2,
    "description": "Asedio coordinado desde ángulos ciegos opuestos; el golpe no bloqueado inflige daño íntegro sin mitigación por defensa."
  },
  {
    "id": "combo-tanque-onepunch",
    "name": "Escudo Viviente & Golpe de Impacto Único",
    "requiredTags": [
      "Tanque/Defensor",
      "Golpe de Un Solo Impacto"
    ],
    "minMatches": 2,
    "description": "El tanque absorbe todo el contraataque del enemigo mientras el pegador carga su golpe definitivo ignorando armaduras temporales."
  },
  {
    "id": "combo-titanes-planetarios",
    "name": "Golpe Gemelo de Titanes Planetarios",
    "requiredTags": [
      "Nivel Planetario+"
    ],
    "minMatches": 2,
    "description": "Impacto simultáneo desde direcciones contrarias generando una onda de implosión interna que penetra la durabilidad pasiva."
  },
  {
    "id": "combo-tanque-regeneracion",
    "name": "Cadena de Resistencia y Regeneración",
    "requiredTags": [
      "Regenerador Celular",
      "Tanque/Defensor"
    ],
    "minMatches": 2,
    "description": "El defensor retiene el frente mientras el regenerador repara tejidos a ritmo biológico acelerado, creando una defensa inquebrantable."
  },
  {
    "id": "combo-restriccion-nen-sincro",
    "name": "Ejecución de Restricción Rota Sincronizada",
    "requiredTags": [
      "Usuario de Nen/Voto Autoimpuesto"
    ],
    "minMatches": 2,
    "description": "Ambos desatan su contrato de Nen simultáneamente sobrecargando de aura mortal al enemigo en un milisegundo."
  },
  {
    "id": "combo-villanos-terror",
    "name": "Cerco de Terror y Dominación Psicológica",
    "requiredTags": [
      "Antagonista Encarnación del Mal",
      "Manipulador Psicológico"
    ],
    "minMatches": 2,
    "description": "Colapso mental forzado seguido por la ejecución física más despiadada del antagonista principal."
  },
  {
    "id": "combo-sellado-divino-dual",
    "name": "Ritual de Sellado Divino Dual",
    "requiredTags": [
      "Kaio-shin/Deidad Creadora",
      "Desbloqueador de Potencial Oculto"
    ],
    "minMatches": 2,
    "description": "Mientras uno desbloquea el potencial oculto de un aliado en tiempo real durante el combate, el otro mantiene una barrera protectora que impide que el enemigo interrumpa el ritual — combo de soporte puro, sin daño directo, pero que puede cambiar el resultado de la batalla en un solo turno."
  },
  {
    "id": "combo-caceria-enjambre",
    "name": "Cacería en Enjambre",
    "requiredTags": [
      "Guardia Real/Enjambre Consciente"
    ],
    "minMatches": 3,
    "description": "El enjambre completo rodea al objetivo desde todos los ángulos posibles en un solo turno coordinado; el objetivo debe elegir defenderse de UN atacante, recibiendo daño completo sin reducción de los demás miembros del enjambre."
  },
  {
    "id": "combo-relevo-universo-dbm",
    "name": "Combo del Torneo: Relevo de Universo",
    "requiredTags": [
      "Competidor de Torneo Multiversal"
    ],
    "minMatches": 2,
    "description": "Formato de 'relevo' — el primer competidor agota al oponente en resistencia/energía durante varios turnos, y se retira estratégicamente (sin ser derrotado) para que el segundo entre fresco contra un enemigo ya desgastado, simulando la estructura de combates por eliminación del Torneo del Poder Universal."
  },
  {
    "id": "combo-angel-destructor-golpe",
    "name": "Golpe del Ángel y el Destructor",
    "requiredTags": [
      "Ángel Asistente",
      "Dios de la Destrucción"
    ],
    "minMatches": 2,
    "description": "El Ángel usa su velocidad/precisión sobrehumana para crear la abertura perfecta (parry o esquiva de contraataque enemigo) y el Dios de la Destrucción remata con un solo golpe cargado al máximo — combo reservado para situaciones de amenaza existencial real, ya que normalmente el Ángel no participa en combate directo."
  },
  {
    "id": "combo-maestro-discipulo-dojo",
    "name": "Combo del Maestro y el Discípulo del Dojo",
    "requiredTags": [
      "Maestro de Artes Marciales Clásicas",
      "Discípulo del Mismo Dojo/Estilo"
    ],
    "minMatches": 2,
    "description": "El maestro fuerza al enemigo a adaptarse constantemente a un estilo de combate cambiante (mezclando técnicas), mientras el discípulo, que conoce el patrón del maestro, anticipa exactamente dónde quedará expuesto el enemigo y ataca el punto ciego generado."
  },
  {
    "id": "combo-ejecucion-real-alien",
    "name": "Ejecución Real Coordinada",
    "requiredTags": [
      "Rey de Linaje Alienígena",
      "Soldado/Subordinado del Mismo Imperio"
    ],
    "minMatches": 2,
    "description": "Los subordinados inmovilizan físicamente al objetivo desde ambos flancos (aceptando el riesgo de ser sacrificados en el proceso), mientras el Rey ejecuta su técnica de firma sin posibilidad de que el objetivo escape del área de efecto."
  },
  {
    "id": "combo-odio-fantasmas-compartidos",
    "name": "Absorción de Odio en Cadena (Fantasmas Compartidos)",
    "requiredTags": [
      "Generador de Fantasmas/Manifestación de Odio"
    ],
    "minMatches": 2,
    "description": "Ambos generadores combinan sus fantasmas en una sola entidad compuesta más poderosa que la suma de las partes individuales, a cambio de que ninguno de los dos pueda generar fantasmas nuevos durante los siguientes 2 turnos (recurso compartido, no ilimitado)."
  },
  {
    "id": "combo-bioingenieria-sincronizada",
    "name": "Combo de Creación Artificial Sincronizada",
    "requiredTags": [
      "Creación Artificial/Bioingeniería"
    ],
    "minMatches": 2,
    "description": "Ambas creaciones ejecutan un ataque de energía combinada usando sus núcleos sincronizados; el AP resultante es superior a la suma lineal debido a la 'resonancia de frecuencia' compartida entre sistemas idénticos."
  },
  {
    "id": "combo-golpe-fuera-del-tiempo",
    "name": "Golpe Fuera del Tiempo",
    "requiredTags": [
      "Manipulador Temporal",
      "Golpe de Un Solo Impacto"
    ],
    "minMatches": 2,
    "description": "El manipulador temporal ralentiza drásticamente la percepción del objetivo (sin detener el tiempo por completo, evitando el hax absoluto), y el golpeador conecta un ataque que el enemigo prácticamente no puede procesar a tiempo de bloquear."
  },
  {
    "id": "combo-stand-compuesto",
    "name": "Combo de Stand Compuesto",
    "requiredTags": [
      "Usuario de Stand"
    ],
    "minMatches": 2,
    "description": "El Stand de rango largo debilita las defensas a distancia mientras el Stand de poder bruto cierra la distancia para el golpe decisivo, replicando dinámicas de equipo tipo Crazy Diamond + Star Platinum."
  },
  {
    "id": "combo-curacion-emergencia-maldita",
    "name": "Curación de Emergencia en Combate Activo",
    "requiredTags": [
      "Usuario de Técnica Inversa de Maldición"
    ],
    "minMatches": 1,
    "description": "Mientras el aliado sigue combatiendo, el usuario de curación inversa mantiene un flujo constante de regeneración que le permite ignorar temporalmente penalizaciones de HP bajo (sin curar completamente, pero evitando el colapso)."
  },
  {
    "id": "combo-transferencia-antorcha",
    "name": "Transferencia de Antorcha (Power Transfer)",
    "requiredTags": [
      "Portador Original/Predecesor",
      "Heredero de Poder (One For All Style)"
    ],
    "minMatches": 2,
    "description": "En un momento de crisis narrativa, el predecesor transfiere voluntariamente el resto de su poder restante al heredero en medio del combate, sacrificando su propia capacidad ofensiva restante para darle al heredero un salto de tier temporal decisivo."
  },
  {
    "id": "combo-corrupcion-rematador",
    "name": "Combo de Corrupción y Rematador",
    "requiredTags": [
      "Portador de Enfermedad/Corrupción"
    ],
    "minMatches": 1,
    "description": "El portador infecta al objetivo con un debuff de deterioro progresivo (el enemigo pierde % de stats cada turno que pasa), mientras el ejecutor simplemente evade y espera el momento óptimo para rematar cuando el deterioro alcanza su punto máximo."
  },
  {
    "id": "combo-doble-ilusion-golpe",
    "name": "Doble Ilusión y Golpe Real",
    "requiredTags": [
      "Ilusionista Mental"
    ],
    "minMatches": 1,
    "description": "El ilusionista proyecta dos copias falsas de sí mismo y del atacante real simultáneamente; el enemigo debe adivinar cuál de los tres 'atacantes' es real, con el ilusionista controlando la probabilidad de acierto del enemigo."
  },
  {
    "id": "combo-relevo-ultima-resistencia",
    "name": "Relevo de Última Resistencia",
    "requiredTags": [
      "Voluntad Inquebrantable",
      "Combatiente de Reserva/Suplente"
    ],
    "minMatches": 2,
    "description": "Cuando el luchador principal cae al borde de la derrota, el suplente entra motivado por el sacrificio presenciado, recibiendo un bonus temporal de +25% AP como 'furia por el compañero caído' durante los primeros 2 turnos tras su entrada."
  },
  {
    "id": "combo-escala-gigante-enjambre",
    "name": "Combo de Escala Combinada: Gigante y Enjambre",
    "requiredTags": [
      "Manipulador de Escala/Tamaño",
      "Guardia Real/Enjambre Consciente"
    ],
    "minMatches": 2,
    "description": "El manipulador aumenta el tamaño de sí mismo o de un miembro del enjambre para crear una amenaza de área masiva, mientras el resto del enjambre reducido en tamaño ataca los puntos ciegos generados por la distracción del gigante."
  },
  {
    "id": "combo-nen-cruzada",
    "name": "Combo de Categoría Cruzada: Conjuración y Manipulación",
    "requiredTags": [
      "Nen: Conjurador",
      "Nen: Manipulador"
    ],
    "minMatches": 2,
    "description": "El Conjurador materializa una trampa/arma condicional en el terreno; el Manipulador la activa a distancia en el momento exacto en que el enemigo pisa la zona, sin que el enemigo pueda anticipar el disparador porque nunca vio al Manipulador tocar el objeto."
  },
  {
    "id": "combo-contrato-cadena",
    "name": "Ejecución de Contrato en Cadena",
    "requiredTags": [
      "Usuario de Contrato Diabólico"
    ],
    "minMatches": 2,
    "description": "El contratado con el diablo de menor jerarquía aplica el debuff inicial (miedo menor, parálisis leve) para abrir la puerta psicológica, y el contratado con el diablo de mayor jerarquía ejecuta su forma completa contra un objetivo cuya resistencia mental ya está debilitada."
  },
  {
    "id": "combo-sumision-relevo",
    "name": "Sumisión en Relevo",
    "requiredTags": [
      "Especialista en Sumisión/Grappling"
    ],
    "minMatches": 2,
    "description": "El primer grappler agota los recursos de escape del objetivo con transiciones constantes de posición (sin buscar la sumisión final), y se retira estratégicamente para que el segundo entre fresco y aplique la sumisión definitiva contra un oponente ya exhausto."
  },
  {
    "id": "combo-arma-resonante",
    "name": "Golpe de Arma Resonante",
    "requiredTags": [
      "Portador de Arma con Voluntad Propia",
      "Usuario de Energía Maldita"
    ],
    "minMatches": 2,
    "description": "El usuario de energía canaliza su poder directamente a través del arma sintiente del compañero con su consentimiento narrativo, amplificando temporalmente el filo y poder del arma más allá de lo que su portador original lograría solo."
  },
  {
    "id": "combo-cerco-cazadores",
    "name": "Cerco de Cazadores Certificados",
    "requiredTags": [
      "Cazador de Diablos Profesional"
    ],
    "minMatches": 2,
    "description": "Los cazadores rodean al diablo objetivo siguiendo protocolo estándar de formación triangular/pinza, reduciendo las rutas de escape a cero y forzando un enfrentamiento directo sin posibilidad de huida dimensional."
  },
  {
    "id": "combo-rivalidad-resuelta",
    "name": "Combo Familiar de Rivalidad Resuelta",
    "requiredTags": [
      "Linaje de Combate Familiar (Hanma-Style)"
    ],
    "minMatches": 2,
    "description": "Tras años de rivalidad narrativa interna, ambos miembros del linaje ejecutan por primera vez un combo coordinado en vez de competir entre sí, logrando daño de impacto crítico aumentado y resolución dramática del arco familiar."
  },
  {
    "id": "combo-presion-vertical-total",
    "name": "Presión Vertical Total",
    "requiredTags": [
      "Combatiente Aéreo",
      "Combatiente Terrestre/Grappling"
    ],
    "minMatches": 2,
    "description": "El combatiente aéreo desciende en picada forzando al enemigo a esquivar hacia una dirección predecible; el grappler terrestre posicionado allí ejecuta la sumisión o el derribo en el momento exacto del aterrizaje forzado."
  },
  {
    "id": "combo-doble-manipulacion-espejo",
    "name": "Doble Manipulación en Espejo",
    "requiredTags": [
      "Manipulador Mental/de Contratos"
    ],
    "minMatches": 2,
    "description": "Ambos manipuladores dan órdenes contradictorias simultáneas al mismo objetivo, generando un colapso de toma de decisión que paraliza al objetivo por 1 turno completo sin necesidad de un debuff de control tradicional."
  }
];


export const TAG_PASSIVES = [
  {
    "name": "Instinto de Supervivencia Saiyan (Zenkai Boost)",
    "triggerTags": [
      "Saiyan",
      "Linaje Guerrero Regenerativo"
    ],
    "desc": "Al sobrevivir con menos de 15% HP, obtiene un incremento permanente de stats (+10% AP acumulativo)."
  },
  {
    "name": "Cálculo de Batalla en Tiempo Real (Ultra Instinct Fragmentario)",
    "triggerTags": [
      "Ki Divino",
      "Usuario de Instinto Superior"
    ],
    "desc": "Esquiva automáticamente el primer asalto contra rivales de su mismo tier o inferior mediante reflejo puro."
  },
  {
    "name": "Presencia Maldita Opresiva",
    "triggerTags": [
      "Alto Grado Especial",
      "Usuario de Dominio Expandido"
    ],
    "desc": "Aura pasiva que sofoca la energía y concentración de combatientes de menor rango en el área."
  },
  {
    "name": "Corazón de Cyborg / Núcleo de Energía Ilimitada",
    "triggerTags": [
      "Androide/Cyborg",
      "Energía Infinita"
    ],
    "desc": "Inmune a la fatiga y agotamiento físico, pero vulnerable a ataques concentrados contra su núcleo electromagnético."
  },
  {
    "name": "Instinto del Depredador Ápice (Biomecánica Baki)",
    "triggerTags": [
      "Biomecánica Extrema",
      "Artista Marcial"
    ],
    "desc": "Gana +5% de fuerza física con cada asalto frente a oponentes de su mismo o superior tier."
  },
  {
    "name": "Resiliencia del Pilar (Hashira Endurance)",
    "triggerTags": [
      "Pilar/Hashira o Equivalente de Élite",
      "Usuario de Respiración"
    ],
    "desc": "Ignora el dolor incapacitante y hemorragias para continuar atacando a plena potencia hasta el colapso final."
  },
  {
    "name": "Cuerpo de Ejecución Milimétrica (One Punch)",
    "triggerTags": [
      "Golpe de Un Solo Impacto",
      "Rotura de Limitador"
    ],
    "desc": "100% de probabilidad de daño crítico si conecta un golpe limpio sin interrupciones previas."
  },
  {
    "name": "Regeneración Celular Draconiana",
    "triggerTags": [
      "Regenerador Celular",
      "Absorbedor Orgánico"
    ],
    "desc": "Regenera extremidades y masa corporal en tiempo real a menos que sufra desintegración molecular total."
  },
  {
    "name": "Presencia de Autoridad Suprema",
    "triggerTags": [
      "Autoridad Absoluta (Tier Omni-King)"
    ],
    "desc": "Puede terminar cualquier combate de forma instantánea declarándolo así narrativamente, sin necesidad de justificación mecánica — pasiva de 'veto absoluto' reservada para las entidades de mayor jerarquía del multiverso."
  },
  {
    "name": "Vigilancia Angelical Imparcial",
    "triggerTags": [
      "Ángel Asistente"
    ],
    "desc": "Tiene conocimiento total de las capacidades reales de cualquier personaje presente en la escena (sin necesidad de escaneo), pero está narrativamente prohibido de compartir esa información si contradice su rol de 'observador neutral'."
  },
  {
    "name": "Ira Contenida del Destructor",
    "triggerTags": [
      "Dios de la Destrucción"
    ],
    "desc": "Acceso a un modo de poder completo que multiplica sus stats significativamente; activarlo sin control aplica un debuff de -20% precisión por pérdida de disciplina táctica."
  },
  {
    "name": "Percepción de Enjambre Colectivo",
    "triggerTags": [
      "Guardia Real/Enjambre Consciente"
    ],
    "desc": "Recibe información sensorial de cualquier otro miembro de su enjambre en el mismo mapa/escena, eliminando la posibilidad de ser sorprendido por ataques desde ángulos ciegos."
  },
  {
    "name": "Cuerpo Forjado en Mil Combates (Dojo Legacy)",
    "triggerTags": [
      "Maestro de Artes Marciales Clásicas"
    ],
    "desc": "Reduce el daño recibido de cualquier técnica que ya haya visto ejecutar una vez en combates anteriores en un 10% acumulable hasta un tope de 40%."
  },
  {
    "name": "Cálculo de Probabilidad Cósmica",
    "triggerTags": [
      "Usuario de Poder Cósmico"
    ],
    "desc": "Puede 'leer' narrativamente la probabilidad de éxito de su propio próximo ataque antes de ejecutarlo, permitiendo al escritor decidir si se retira de un ataque de baja probabilidad."
  },
  {
    "name": "Sacrificio del Subordinado Leal",
    "triggerTags": [
      "Ejecutor Leal"
    ],
    "desc": "Puede interponerse voluntariamente para recibir un ataque dirigido a su Rey, absorbiendo el 100% del daño a cambio de quedar fuera de combate inmediatamente."
  },
  {
    "name": "Ambigüedad de Poder No Confirmado",
    "triggerTags": [
      "Potencial Estimado No Confirmado"
    ],
    "desc": "Impone una penalización de -15% de precisión a cualquier oponente que intente usar tags de 'Análisis de Amenaza' o 'Copiar Técnica' contra él."
  },
  {
    "name": "Núcleo de Energía Compartida (Shared Core Network)",
    "triggerTags": [
      "Creación Artificial/Bioingeniería"
    ],
    "desc": "Puede transferir hasta 30% de su reserva de energía actual a cualquier otra creación del mismo origen en el campo, una vez por combate."
  },
  {
    "name": "Instinto de Autopreservación Absoluta",
    "triggerTags": [
      "Entidad de Cambio de Forma Reactivo"
    ],
    "desc": "Puede reconfigurar su cuerpo instantáneamente para negar el primer golpe crítico que reciba en el combate, sin gastar turno ni recurso."
  },
  {
    "name": "Percepción Fuera de la Línea Temporal",
    "triggerTags": [
      "Manipulador Temporal"
    ],
    "desc": "Tiene una probabilidad base del 30% de 'recordar' un futuro alterno donde un ataque específico lo hirió gravemente, permitiéndole esquivarlo preventivamente la primera vez que lo enfrenta."
  },
  {
    "name": "Vitalidad Solar Constante",
    "triggerTags": [
      "Usuario de Ondulación/Ripple"
    ],
    "desc": "Regenera un pequeño porcentaje de HP cada turno mientras esté expuesto a luz solar directa, sin coste de recursos adicional."
  },
  {
    "name": "Vínculo Irrompible de Stand",
    "triggerTags": [
      "Usuario de Stand"
    ],
    "desc": "No puede ser separado de su Stand por ningún efecto de sellado o negación de habilidades de tier inferior al propio; si el Stand recibe daño directo, el usuario siente el dolor reflejado."
  },
  {
    "name": "Reversión Selectiva de Daño Propio",
    "triggerTags": [
      "Usuario de Técnica Inversa de Maldición"
    ],
    "desc": "Puede curarse a sí mismo con la misma efectividad que cura a otros, permitiéndole sostener combates prolongados sin depender de soporte externo."
  },
  {
    "name": "Eco del Poder Heredado",
    "triggerTags": [
      "Heredero de Poder (One For All Style)"
    ],
    "desc": "Retiene fragmentos de personalidad, técnicas o 'voces' de portadores anteriores, pudiendo acceder ocasionalmente a una técnica que nunca aprendió conscientemente."
  },
  {
    "name": "Inmunidad Progresiva a Toxinas Propias",
    "triggerTags": [
      "Portador de Enfermedad/Corrupción"
    ],
    "desc": "Completamente inmune a sus propios efectos de veneno/corrupción, y desarrolla resistencia parcial (25%) a toxinas de otros usuarios tras el primer contacto."
  },
  {
    "name": "Velo Permanente de Duda",
    "triggerTags": [
      "Ilusionista Mental"
    ],
    "desc": "Aplica un debuff pasivo de -10% precisión a cualquier oponente que haya sido engañado exitosamente por una ilusión suya al menos una vez en el combate."
  },
  {
    "name": "Control de Densidad Corporal",
    "triggerTags": [
      "Manipulador de Escala/Tamaño"
    ],
    "desc": "Puede ajustar su propia densidad corporal independientemente de su tamaño visual, confundiendo los cálculos de daño por impacto del oponente."
  },
  {
    "name": "Determinación de Protagonista (Plot Armor Consciente)",
    "triggerTags": [
      "Voluntad Inquebrantable"
    ],
    "desc": "Tiene 1 uso por combate de sobrevivir a un golpe que narrativamente debería ser letal, quedando con 1 HP simbólico en vez de caer, en momentos de dramatismo extremo."
  },
  {
    "name": "Reserva Táctica Fresca",
    "triggerTags": [
      "Combatiente de Reserva/Suplente"
    ],
    "desc": "Entra siempre al combate con 100% de sus recursos (HP, energía, cargas de habilidad) sin importar cuánto haya durado la batalla previa de sus compañeros."
  },
  {
    "name": "Aura de Categoría Pura (Nen Specialization)",
    "desc": "[Tag: 'Nen: Reforzador'] recibe +15% de fuerza física bruta y durabilidad, pero -10% de efectividad en cualquier técnica que no sea puramente física.",
    "cost": "Trade-off pasivo permanente de diseño."
  },
  {
    "name": "Percepción de Aura Ajena (Ten/Ren Sensing)",
    "desc": "[Tag: 'Usuario de Nen'] puede sentir la presencia y nivel de poder de cualquier otro usuario de Nen en un radio amplio, salvo si el objetivo usa [Tag: 'Ocultamiento de Aura (Zetsu)'].",
    "cost": "Inútil contra usuarios de Zetsu perfecto."
  },
  {
    "name": "Jerarquía de Miedo Inherente",
    "desc": "[Tag: 'Diablo Primigenio/Jerárquico'] aplica un debuff pasivo de -20% de coraje y moral a cualquier humano regular sin tags de resistencia mental al verlo por primera vez.",
    "cost": "Ineficaz contra diablos o entidades de tier comparable."
  },
  {
    "name": "Memoria Muscular de Sumisión Perfecta",
    "desc": "[Tag: 'Especialista en Sumisión/Grappling'] tiene 100% de probabilidad de completar una sumisión si consigue el agarre completo y el rival no tiene fuerza bruta superior en +1 Tier.",
    "cost": "Cae a 60% si el objetivo tiene Fuerza Sobrehumana superior en +1 Tier."
  },
  {
    "name": "Vínculo del Arma Consciente",
    "desc": "[Tag: 'Portador de Arma con Voluntad Propia'] no puede ser desarmado por ningún efecto de tier inferior; el arma se resiste físicamente a abandonar su mano.",
    "cost": "Si el arma es atacada directamente, el 30% del daño se refleja al portador."
  },
  {
    "name": "Adaptación Biomecánica de Combate Real (Hanma Legacy)",
    "desc": "[Tag: 'Linaje de Combate Familiar (Hanma-Style)'] gana +5% de fuerza física permanente cada vez que sobrevive a un combate contra un oponente de fuerza superior.",
    "cost": "Requiere haber estado en riesgo genuino de derrota."
  },
  {
    "name": "Contrato de Sacrificio Escalonado",
    "desc": "[Tag: 'Usuario de Contrato Diabólico'] puede pagar recursos vitales crecientes para desbloquear niveles progresivamente más altos de poder del diablo dentro del combate.",
    "cost": "El tercer nivel siempre conlleva una consecuencia narrativa permanente (cicatriz, pérdida de memoria, envejecimiento)."
  },
  {
    "name": "Instinto de Certificación Profesional",
    "desc": "[Tag: 'Cazador de Diablos Profesional'] recibe automáticamente información básica de clasificación de amenaza de cualquier diablo tras observarlo atacar una vez.",
    "cost": "Lectura aproximada; puede ser engañada por Ocultamiento Real."
  },
  {
    "name": "Dominio Territorial de Especialista",
    "desc": "[Tag: 'Nen: Especialista'] posee una habilidad personalizada que rompe al menos una convención estándar de combate.",
    "cost": "Limitación o juramento severo como balance de diseño."
  },
  {
    "name": "Presión de Combate Aéreo Sostenida",
    "desc": "[Tag: 'Combatiente Aéreo'] ignora terreno destruido, escombros y obstáculos de suelo al posicionarse, ganando ventaja táctica constante.",
    "cost": "Vulnerable a debuffs específicos anti-aéreos."
  },
  {
    "name": "Desprecio Calculado (Boss Passive)",
    "desc": "[Tag: 'Boss de Aniquilación Universal'] posee inmunidad a debuffs de control menores de rivales con 2+ tiers inferiores.",
    "cost": "La inmunidad desaparece en la Fase 3 (Forma Final/Desesperación)."
  }
];

export const TAG_TRANSFORMATIVES = [
  {
    "name": "Fusión Danza (Metamoran)",
    "triggerTags": [
      "Compatible con Danza",
      "Fusionable (Danza/Pothara/Namekiana)"
    ],
    "type": "Fusion",
    "desc": "Fusión acrobática sincronizada que genera un guerrero de tier superior con límite de tiempo táctico."
  },
  {
    "name": "Fusión Pothara (Reliquia Divina)",
    "triggerTags": [
      "Portador de Objeto de Fusión Divina",
      "Fusionable (Danza/Pothara/Namekiana)"
    ],
    "type": "Fusion",
    "desc": "Fusión instantánea y de máxima estabilidad que multiplica las facultades y Hax de ambos usuarios."
  },
  {
    "name": "Absorción Parasitaria / Genética",
    "triggerTags": [
      "Absorbedor Orgánico",
      "Devorador de Energía Vital/Almas"
    ],
    "type": "Absorption",
    "desc": "Asimilación biológica de guerreros incapacitados para apropiarse de sus Hax Tags y sumar su AP."
  },
  {
    "name": "Rotura de Limitador (Serious Mode / Awakening)",
    "triggerTags": [
      "Rotura de Limitador",
      "Crecimiento Ilimitado"
    ],
    "type": "Awakening",
    "desc": "Desbloqueo de potencia inconmensurable al superar los límites impuestos por la biología o el cosmos."
  },
  {
    "name": "Despertar del Destructor Pleno",
    "triggerTags": [
      "Dios de la Destrucción"
    ],
    "type": "Awakening",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "Salto de tier significativo con acceso a técnicas de destrucción pura (Hakai o equivalente) que ignoran parcialmente la durabilidad convencional del objetivo."
  },
  {
    "name": "Ritual de Desbloqueo de Potencial Supremo",
    "triggerTags": [
      "Desbloqueador de Potencial Oculto"
    ],
    "type": "Ritual",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "Incremento de tier permanente e irreversible dentro de la historia tras canalización de mínimo 2 turnos de protección externa."
  },
  {
    "name": "Fusión de Enjambre en Reina/Núcleo Único",
    "triggerTags": [
      "Guardia Real/Enjambre Consciente"
    ],
    "type": "Fusion",
    "canFuse": true,
    "canAbsorb": false,
    "desc": "Múltiples miembros del enjambre convergen físicamente en una sola entidad heredando todas las habilidades combinadas."
  },
  {
    "name": "Transformación de Ultra Ego / Destrucción Interna",
    "triggerTags": [
      "Ki de Destrucción/Ultra Ego Style"
    ],
    "type": "Transformation",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "Escalado de poder inverso: el personaje se vuelve más fuerte mientras más daño físico y dolor acumule durante la contienda."
  },
  {
    "name": "Colapso de Antimateria Controlado",
    "triggerTags": [
      "Antimateria/Devastador de Universos"
    ],
    "type": "Cosmic",
    "canFuse": false,
    "canAbsorb": true,
    "desc": "Altera o aniquila permanentemente la estructura del escenario de combate completo en lugar de solo afectar a los combatientes."
  },
  {
    "name": "Herencia del Linaje Cósmico (Heraldo Ascendente)",
    "triggerTags": [
      "Heraldo de Entidad Cósmica"
    ],
    "type": "Ascension",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "El heraldo asciende permanentemente de tier, dejando de depender del poder prestado para convertirse en entidad cósmica independiente."
  },
  {
    "name": "Reconfiguración Biológica de Combate (Adaptación en Tiempo Real)",
    "triggerTags": [
      "Entidad de Cambio de Forma Reactivo"
    ],
    "type": "Adaptation",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "Modifica su propia biología en tiempo real para generar resistencia específica contra patrones de ataque repetidos 2+ veces."
  },
  {
    "name": "Detención Temporal Absoluta",
    "triggerTags": [
      "Manipulador Temporal"
    ],
    "type": "TimeHax",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "Congela completamente el tiempo para todos excepto el usuario durante un número de acciones libres para asestar golpes decisivos."
  },
  {
    "name": "Modo Stand Definitivo (Requiem/Over Heaven Style)",
    "triggerTags": [
      "Usuario de Stand"
    ],
    "type": "StandEvolution",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "El Stand asciende a una forma superior ganando habilidades conceptuales/hax (manipulación de causalidad, negación de resultados)."
  },
  {
    "name": "Colapso hacia la Encarnación Pura de Maldición",
    "triggerTags": [
      "Usuario de Energía Maldita"
    ],
    "type": "CurseAbsorption",
    "canFuse": false,
    "canAbsorb": true,
    "desc": "Absorbe maldiciones sueltas o restos de energía maldita ambiental del escenario para alimentar un salto de tier temporal."
  },
  {
    "name": "Plaga de Evolución Forzada",
    "triggerTags": [
      "Portador de Enfermedad/Corrupción"
    ],
    "type": "Mutation",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "El propio cuerpo muta bajo la masa de su propia corrupción interna, ganando extremidades y esporas pero perdiendo control mental."
  },
  {
    "name": "Mundo de Espejos (Ilusión Total del Campo de Batalla)",
    "triggerTags": [
      "Ilusionista Mental"
    ],
    "type": "Illusion",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "Convierte todo el campo de batalla en una ilusión completa, permitiendo reposicionar elementos del combate sin que el rival lo perciba."
  },
  {
    "name": "Gigantismo de Combate Sostenido",
    "triggerTags": [
      "Manipulador de Escala/Tamaño"
    ],
    "type": "SizeChange",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "Incremento masivo de fuerza bruta y durabilidad a cambio de una reducción de velocidad y maniobrabilidad."
  },
  {
    "name": "Legado Completo del Poder Heredado (Full Cowl / Awakening)",
    "triggerTags": [
      "Heredero de Poder (One For All Style)"
    ],
    "type": "Awakening",
    "canFuse": false,
    "canAbsorb": false,
    "desc": "Elimina las penalizaciones físicas corporales (fracturas, desgaste) y accede al 100% estable del poder heredado."
  },
  {
    "name": "Ascensión de Categoría Nen (Especialización Definitiva)",
    "canFuse": false,
    "canAbsorb": false,
    "fusionMethods": [
      "Entrenamiento extremo de Ten/Zetsu/Ren/Hatsu con voto de restricción"
    ],
    "resultado": "Desbloquea una versión definitiva de su Hatsu con salto masivo de Tier pero coste de recursos extremo (estilo Gon Adulto)."
  },
  {
    "name": "Forma Completa del Diablo Contratado",
    "canFuse": false,
    "canAbsorb": false,
    "fusionMethods": [
      "Sacrificio vital narrativo de sangre, tiempo de vida o partes del cuerpo"
    ],
    "resultado": "Acceso temporal a la forma de poder completo del diablo con duración proporcional a la magnitud del sacrificio."
  },
  {
    "name": "Despertar del Arma Consciente",
    "canFuse": true,
    "canAbsorb": false,
    "fusionMethods": [
      "Sincronización total de voluntad arma-portador"
    ],
    "resultado": "Fusión conceptual que otorga conocimiento milenario del arma y acciones autónomas de protección sin input directo."
  },
  {
    "name": "Modo Bestia de Combate Puro (Hanma Awakening)",
    "canFuse": false,
    "canAbsorb": false,
    "fusionMethods": [
      "Abandono total de técnica calculada por instinto de combate salvaje"
    ],
    "resultado": "Incremento drástico de fuerza bruta e insensibilidad al dolor a cambio de perder toda sutileza técnica o sumisiones de precisión."
  },
  {
    "name": "Certificación de Cazador de Rango Superior",
    "canFuse": false,
    "canAbsorb": false,
    "fusionMethods": [
      "Superación de misión de alta tasa de mortalidad oficial"
    ],
    "resultado": "Acceso a armamento experimental clasificado y autoridad táctica de rango superior."
  },
  {
    "name": "Colapso de Categoría (Nen Fuera de Control)",
    "canFuse": false,
    "canAbsorb": false,
    "fusionMethods": [
      "Estrés emocional extremo o daño crítico al borde de la muerte"
    ],
    "resultado": "Desestabilización del aura que permite manifestar aleatoriamente una técnica de otra categoría de Nen por 1 turno."
  }
];

export const NARRATIVE_BOSS_PRESET = {
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "Máscara de Control",
      "trigger": "Inicio del Combate (100% a 70% HP)",
      "phaseMechanic": "El Boss combate con moderación calculada y desdén, reduciendo su daño saliente en 30% de forma oculta mientras evalúa a los atacantes.",
      "weakness": "Confiado en su superioridad, no intercepta trampas ni ataques preparatorios de bajo nivel."
    },
    {
      "phaseNumber": 2,
      "phaseName": "Quiebre de Paciencia",
      "trigger": "Golpe Irrespetuoso / Crítico Narrativo o 5 golpes acumulados de desgaste (70% a 25% HP)",
      "phaseMechanic": "Elimina toda restricción de daño, libera ataques de área masivos y prioriza aniquilar al combatiente con mayor Battle IQ del grupo rival.",
      "weakness": "Fijación de túnel en el agresor principal, dejando aperturas en flancos para ataques sincronizados."
    },
    {
      "phaseNumber": 3,
      "phaseName": "Forma Verdadera / Desesperación Cósmica",
      "trigger": "Umbral Crítico (<25% HP)",
      "phaseMechanic": "Desata su técnica prohibida o transformación final con salto temporal de Tier (+1 Tier en AP) e intenta el borrado existencial del escenario.",
      "weakness": "Pierde su pasiva de 'Desprecio Calculado' y sufre fatiga de energía severa turno a turno si el grupo sobrevive al clímax."
    }
  ]
};

/**
 * Normaliza tags para comparación insensible a mayúsculas y acentos
 */
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Infiere tags automáticos a partir del universo, nombre, arsenal y hax del personaje.
 */
export function getCharacterEffectiveTags(char) {
  if (!char) return [];
  const tags = new Set();
  
  if (Array.isArray(char.haxTags)) {
    char.haxTags.forEach(t => tags.add(t));
  }
  
  const nameLow = (char.name || "").toLowerCase();
  const aliasLow = (char.alias || "").toLowerCase();
  const uniLow = (char.universe || "").toLowerCase();
  const tierLow = (char.tier || "").toLowerCase();
  const sagaLow = (char.saga || "").toLowerCase();
  const abilitiesLow = [
    ...(char.abilities || []),
    ...(char.arsenal?.superAttacks?.map(a => a.name + " " + a.desc) || []),
    ...(char.arsenal?.ultimateAttacks?.map(a => a.name + " " + a.desc) || [])
  ].join(" ").toLowerCase();

  const hasWord = (str, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(str);
  };

  // === 1. ARQUETIPOS DE DRAGON BALL & SAIYANS ===
  const saiyanKeywords = ['goku', 'vegeta', 'gohan', 'broly', 'trunks', 'goten', 'bardock', 'vegetto', 'gogeta', 'gotenks', 'kakarotto', 'raditz', 'nappa', 'son bra', 'turles'];
  if (saiyanKeywords.some(k => nameLow.includes(k))) {
    tags.add("Saiyan");
    tags.add("Usuario de Ki");
    tags.add("Voluntad Inquebrantable");
    tags.add("Linaje Saiyan Puro");
    tags.add("Orgullo Saiyan");
  }
  if (tierLow.includes("2-") || tierLow.includes("1-") || nameLow.includes("god") || nameLow.includes("blue") || nameLow.includes("ultra") || nameLow.includes("hakaishin") || nameLow.includes("beast") || nameLow.includes("ego") || nameLow.includes("instinto") || nameLow.includes("bills") || nameLow.includes("beerus") || nameLow.includes("whis") || nameLow.includes("champa") || nameLow.includes("vados") || nameLow.includes("daishinkan") || nameLow.includes("zeno")) {
    tags.add("Ki Divino");
  }

  // === 2. DIOSES DE LA DESTRUCCIÓN & ÁNGELES ===
  if (nameLow.includes("whis") || nameLow.includes("vados") || nameLow.includes("daishinkan") || nameLow.includes("gran sacerdote") || nameLow.includes("marcarita") || nameLow.includes("kusu") || nameLow.includes("angel") || nameLow.includes("ángel")) {
    tags.add("Ángel Asistente");
    tags.add("Ki Divino");
    tags.add("Autoridad Multiversal");
  }
  if (nameLow.includes("beerus") || nameLow.includes("bills") || nameLow.includes("champa") || nameLow.includes("belmod") || nameLow.includes("quitela") || nameLow.includes("hakaishin") || nameLow.includes("destrucción") || nameLow.includes("destruccion")) {
    tags.add("Dios de la Destrucción");
    tags.add("Ki Divino");
    tags.add("Hakai / Erasión Existencial");
  }
  if (nameLow.includes("zen-oh") || nameLow.includes("zeno") || nameLow.includes("rey del todo") || nameLow.includes("zeno-sama")) {
    tags.add("Autoridad Multiversal");
    tags.add("Omni-Presencia / Borrado Absoluto");
  }

  // === 3. REGENERADORES & NO-MUERTOS ===
  if (nameLow.includes("buu") || nameLow.includes("cell") || nameLow.includes("piccolo") || nameLow.includes("gast carcolh") || nameLow.includes("deadpool") || nameLow.includes("wolverine") || nameLow.includes("alucard") || nameLow.includes("muzan") || nameLow.includes("zombiman") || nameLow.includes("hulk") || nameLow.includes("doomsday") || abilitiesLow.includes("regenera")) {
    tags.add("Regenerador Celular");
  }

  // === 4. ARTES MARCIALES & COMBATIENTES PUROS ===
  if (uniLow.includes("baki") || nameLow.includes("baki") || nameLow.includes("yujiro") || nameLow.includes("jack hanma") || nameLow.includes("doppo") || nameLow.includes("shibukawa") || nameLow.includes("krilin") || nameLow.includes("yamcha") || nameLow.includes("tenshinhan") || nameLow.includes("roshi") || nameLow.includes("garou") || nameLow.includes("bang") || nameLow.includes("silver fang") || nameLow.includes("batman") || nameLow.includes("daredevil") || nameLow.includes("shang-chi") || nameLow.includes("iron fist") || nameLow.includes("rocky")) {
    tags.add("Maestro de Artes Marciales");
    tags.add("Combatiente Físico Puro");
  }

  // === 5. STAND USERS (JOJO'S BIZARRE ADVENTURE) ===
  if (uniLow.includes("jojo") || nameLow.includes("jotaro") || nameLow.includes("dio") || nameLow.includes("giorno") || nameLow.includes("josuke") || nameLow.includes("joseph") || nameLow.includes("diavolo") || nameLow.includes("pucci") || nameLow.includes("kira") || nameLow.includes("valentine") || nameLow.includes("johnny")) {
    tags.add("Usuario de Stand");
    if (nameLow.includes("jotaro") || nameLow.includes("dio") || nameLow.includes("diavolo") || nameLow.includes("pucci") || nameLow.includes("kira")) {
      tags.add("Manipulador Temporal");
    }
  }

  // === 6. JUJUTSU KAISEN (ENERGÍA MALDITA & DOMINIO) ===
  if (uniLow.includes("jujutsu") || nameLow.includes("gojo") || nameLow.includes("sukuna") || nameLow.includes("itadori") || nameLow.includes("megumi") || nameLow.includes("yuta") || nameLow.includes("toji") || nameLow.includes("maki") || nameLow.includes("geto") || nameLow.includes("kenjaku") || nameLow.includes("kashimo") || nameLow.includes("hakari") || nameLow.includes("higuruma") || nameLow.includes("choso") || nameLow.includes("todo") || nameLow.includes("mahito")) {
    tags.add("Usuario de Energía Maldita");
    if (nameLow.includes("gojo") || nameLow.includes("sukuna") || nameLow.includes("megumi") || nameLow.includes("yuta") || nameLow.includes("kenjaku") || nameLow.includes("hakari") || nameLow.includes("higuruma") || nameLow.includes("mahito") || nameLow.includes("yorozu")) {
      tags.add("Usuario de Dominio Expandido");
    }
    if (nameLow.includes("itadori") || nameLow.includes("gojo") || nameLow.includes("sukuna") || nameLow.includes("yuta") || nameLow.includes("nanami") || nameLow.includes("todo")) {
      tags.add("Usuario de Destello Negro");
    }
  }

  // === 7. VELOCISTAS ===
  if (nameLow.includes("flash") || nameLow.includes("reverse flash") || nameLow.includes("quicksilver") || nameLow.includes("a-train") || nameLow.includes("red rush") || nameLow.includes("minato") || nameLow.includes("sonic") || nameLow.includes("burter") || nameLow.includes("dyspo")) {
    tags.add("Velocista");
  }

  // === 8. ESPADACHINES / CORTADORES ===
  if (nameLow.includes("zoro") || nameLow.includes("mihawk") || nameLow.includes("trunks") || nameLow.includes("atomic samurai") || nameLow.includes("yoriichi") || nameLow.includes("kokushibo") || nameLow.includes("ichigo") || nameLow.includes("zaraki") || nameLow.includes("sasuke") || nameLow.includes("kenshin") || nameLow.includes("shanks") || nameLow.includes("law")) {
    tags.add("Espadachín / Maestro de Armas");
  }

  // === 9. ENTIDADES CÓSMICAS & OMNI ===
  if (nameLow.includes("anti-monitor") || nameLow.includes("the one above all") || nameLow.includes("the presence") || nameLow.includes("living tribunal") || nameLow.includes("spectre") || nameLow.includes("dr. manhattan") || nameLow.includes("lucifer") || nameLow.includes("michael") || nameLow.includes("tori-bot") || nameLow.includes("arale") || nameLow.includes("featherine") || nameLow.includes("beyonder")) {
    tags.add("Entidad Cósmica / Omniversal");
    tags.add("Autoridad Multiversal");
  }

  // === 10. ELEMENTALES ===
  if (nameLow.includes("ace") || nameLow.includes("sabo") || nameLow.includes("akainu") || nameLow.includes("natsu") || nameLow.includes("flame") || nameLow.includes("todoroki") || nameLow.includes("endeavor") || nameLow.includes("human torch") || nameLow.includes("pyro")) {
    tags.add("Fuego/Magma");
  }
  if (nameLow.includes("aokiji") || nameLow.includes("kuzan") || nameLow.includes("sub-zero") || nameLow.includes("iceman") || nameLow.includes("gray") || nameLow.includes("hitsugaya") || nameLow.includes("hielo")) {
    tags.add("Hielo/Frío");
  }
  if (nameLow.includes("enel") || nameLow.includes("raiden") || nameLow.includes("thor") || nameLow.includes("kashimo") || nameLow.includes("killua") || nameLow.includes("laxus") || nameLow.includes("electro") || nameLow.includes("rayo") || nameLow.includes("trueno")) {
    tags.add("Rayo/Electricidad");
  }

  // === 11. GUERREROS DBM (UNIVERSO 9, 13, 16, 18, 19, 20) ===
  if (uniLow.includes("multiverse") || nameLow.includes("u9") || nameLow.includes("u13") || nameLow.includes("u16") || nameLow.includes("u18") || nameLow.includes("u19") || nameLow.includes("u20") || nameLow.includes("gast") || nameLow.includes("zen buu") || nameLow.includes("son bra") || nameLow.includes("eleim") || nameLow.includes("xxi") || nameLow.includes("kakarotto (universo 13)")) {
    tags.add("Participante Torneo DBM");
    if (nameLow.includes("u9") || nameLow.includes("universo 9") || nameLow.includes("kulilin") || nameLow.includes("yamcha (continuidad universo 9)") || nameLow.includes("tenshinhan (continuidad universo 9)") || nameLow.includes("videl (continuidad universo 9)")) {
      tags.add("Guerrero Z Sin Saiyans (U9)");
    }
    if (nameLow.includes("u13") || nameLow.includes("universo 13")) {
      tags.add("Saiyan Conquistador (U13)");
    }
    if (nameLow.includes("eleim") || nameLow.includes("tidar") || nameLow.includes("xeniloum") || nameLow.includes("u19") || nameLow.includes("heliota")) {
      tags.add("Tecnología Heliota (Armadura Ultra)");
    }
  }

  // === 12. USUARIOS DE MAGIA OSCURA / SELLOS ===
  if (nameLow.includes("babidi") || nameLow.includes("bibidi") || nameLow.includes("moro") || nameLow.includes("dabra") || nameLow.includes("xxi") || nameLow.includes("majin") || nameLow.includes("hechicero") || nameLow.includes("dr. raichi") || nameLow.includes("hatchiyack") || nameLow.includes("lychee")) {
    tags.add("Usuario de Magia Oscura/Sellado");
  }

  // === 13. INMORTALIDAD & VAMPIROS ===
  if (nameLow.includes("zamasu") || nameLow.includes("immortal") || nameLow.includes("alucard") || nameLow.includes("dio") || nameLow.includes("garlic") || nameLow.includes("hidan") || nameLow.includes("ban") || nameLow.includes("deadpool")) {
    tags.add("Inmortalidad Biológica/Regenerativa");
  }

  // === 14. ONE PUNCH MAN & ROTURA DE LIMITADOR ===
  if (nameLow.includes("saitama") || nameLow.includes("garou")) {
    tags.add("Rotura de Limitador");
    tags.add("Golpe de Un Solo Impacto");
    tags.add("Crecimiento Ilimitado");
    tags.add("Clase S");
  }

  // === 15. DEMON SLAYER (KIMETSU NO YAIBA) ===
  if (uniLow.includes("demon slayer") || uniLow.includes("kimetsu") || nameLow.includes("tanjiro") || nameLow.includes("rengoku") || nameLow.includes("giyu") || nameLow.includes("zenitsu") || nameLow.includes("kokushibo") || nameLow.includes("yoriichi") || nameLow.includes("sanemi") || nameLow.includes("muzan") || nameLow.includes("akaza") || nameLow.includes("doma") || nameLow.includes("inosuke") || nameLow.includes("nezuko")) {
    tags.add("Portador de Espada Demoníaca/Nichirin");
    tags.add("Usuario de Respiración");
    if (nameLow.includes("rengoku") || nameLow.includes("giyu") || nameLow.includes("sanemi") || nameLow.includes("yoriichi") || nameLow.includes("gyomei") || nameLow.includes("shinobu")) {
      tags.add("Pilar/Hashira o Equivalente de Élite");
    }
  }

  // === 16. HUNTER X HUNTER & NEN ===
  if (uniLow.includes("hunter") || nameLow.includes("kurapika") || hasWord(nameLow, "gon") || nameLow.includes("killua") || nameLow.includes("chrollo") || nameLow.includes("meruem") || nameLow.includes("netero") || nameLow.includes("hisoka") || nameLow.includes("ging") || nameLow.includes("silva") || nameLow.includes("illumi")) {
    tags.add("Usuario de Nen/Voto Autoimpuesto");
    tags.add("Usuario de Nen");
    if (hasWord(nameLow, "gon") || nameLow.includes("kurapika") || nameLow.includes("ging")) tags.add("Voluntad Inquebrantable");
  }

  // === 17. DEIDADES & MITOLOGÍA (RECORD OF RAGNAROK) ===
  if (uniLow.includes("ragnarok") || nameLow.includes("zeus") || hasWord(nameLow, "adam") || nameLow.includes("poseidon") || nameLow.includes("buda") || nameLow.includes("shiva") || nameLow.includes("odin") || hasWord(nameLow, "thor") || nameLow.includes("beelzebub") || nameLow.includes("hades") || nameLow.includes("tesla") || nameLow.includes("qin") || nameLow.includes("lu bu") || nameLow.includes("jack the ripper")) {
    tags.add("Deidad/Figura Mitológica");
    tags.add("Voluntad Inquebrantable");
  }

  // === 18. TITANES & FUERZA BRUTA ===
  if (nameLow.includes("superman") || hasWord(nameLow, "thor") || nameLow.includes("omni") || nameLow.includes("invincible") || nameLow.includes("homelander") || nameLow.includes("hulk") || nameLow.includes("the immortal") || nameLow.includes("wonder woman") || nameLow.includes("general zod") || nameLow.includes("shazam") || nameLow.includes("martian manhunter") || tierLow.includes("planet") || tierLow.includes("4-") || tierLow.includes("3-") || tierLow.includes("2-") || tierLow.includes("1-")) {
    tags.add("Nivel Planetario+");
    tags.add("Fuerza Bruta Sobrehumana");
  }

  // === 19. SUPLENTES & RESERVAS ===
  if (nameLow.includes("krilin") || nameLow.includes("yamcha") || nameLow.includes("tenshinhan") || nameLow.includes("goten") || nameLow.includes("pan") || nameLow.includes("chaos") || nameLow.includes("yajirobe") || nameLow.includes("starlight")) {
    tags.add("Combatiente de Reserva/Suplente");
  }
  
  // === 21. QUINTA OLEADA: CATEGORÍAS NEN DE HUNTER X HUNTER ===
  if (uniLow.includes("hunter") || nameLow.includes("gon") || nameLow.includes("killua") || nameLow.includes("kurapika") || nameLow.includes("leorio") || nameLow.includes("hisoka") || nameLow.includes("chrollo") || nameLow.includes("meruem") || nameLow.includes("netero") || nameLow.includes("pitou") || nameLow.includes("pouf") || nameLow.includes("youpi") || nameLow.includes("illumi") || nameLow.includes("feitan") || nameLow.includes("silva") || nameLow.includes("ging")) {
    tags.add("Usuario de Nen/Voto Autoimpuesto");
    tags.add("Usuario de Nen");

    if (hasWord(nameLow, "gon") || nameLow.includes("uvogin") || nameLow.includes("phinks") || nameLow.includes("netero")) {
      tags.add("Nen: Reforzador");
    }
    if (nameLow.includes("killua") || nameLow.includes("hisoka") || nameLow.includes("feitan") || nameLow.includes("machi") || nameLow.includes("biscuit")) {
      tags.add("Nen: Transmutador");
    }
    if (nameLow.includes("leorio") || nameLow.includes("franklin") || nameLow.includes("knuckle") || nameLow.includes("razor") || nameLow.includes("silva")) {
      tags.add("Nen: Emisor");
    }
    if (nameLow.includes("kurapika") || nameLow.includes("kite") || nameLow.includes("kortopi") || nameLow.includes("shizuku") || nameLow.includes("genthru")) {
      tags.add("Nen: Conjurador");
    }
    if (nameLow.includes("illumi") || nameLow.includes("shalnark") || nameLow.includes("morel") || nameLow.includes("baise") || nameLow.includes("squala")) {
      tags.add("Nen: Manipulador");
      tags.add("Manipulador Mental/de Contratos");
    }
    if (nameLow.includes("chrollo") || nameLow.includes("meruem") || nameLow.includes("pitou") || nameLow.includes("pouf") || nameLow.includes("youpi") || nameLow.includes("alluka") || nameLow.includes("neon") || nameLow.includes("pakunoda") || nameLow.includes("tserridnich")) {
      tags.add("Nen: Especialista");
    }
  }

  // === 22. QUINTA OLEADA: CHAINSAW MAN & JERARQUÍA DE DIABLOS ===
  if (uniLow.includes("chainsaw") || nameLow.includes("denji") || nameLow.includes("pochita") || nameLow.includes("makima") || nameLow.includes("power") || nameLow.includes("aki") || nameLow.includes("kishibe") || nameLow.includes("himeno") || nameLow.includes("kobeni") || nameLow.includes("reze") || nameLow.includes("quanxi") || nameLow.includes("yoshida") || nameLow.includes("diablo") || nameLow.includes("demon")) {
    if (nameLow.includes("makima") || nameLow.includes("pochita") || nameLow.includes("oscuridad") || nameLow.includes("darkness") || nameLow.includes("caída") || nameLow.includes("gun devil") || nameLow.includes("pistola") || nameLow.includes("fuego") || nameLow.includes("muerte") || nameLow.includes("guerra") || nameLow.includes("hambre") || nameLow.includes("control")) {
      tags.add("Diablo Primigenio/Jerárquico");
      tags.add("Manipulador Mental/de Contratos");
    }
    if (nameLow.includes("aki") || nameLow.includes("himeno") || nameLow.includes("denji") || nameLow.includes("kobeni") || nameLow.includes("reze") || nameLow.includes("quanxi") || nameLow.includes("santa claus")) {
      tags.add("Usuario de Contrato Diabólico");
    }
    if (nameLow.includes("kishibe") || nameLow.includes("aki") || nameLow.includes("himeno") || nameLow.includes("kobeni") || nameLow.includes("yoshida") || nameLow.includes("quanxi")) {
      tags.add("Cazador de Diablos Profesional");
    }
  }

  // === 23. QUINTA OLEADA: ARMAS SINTIENTES / VOLUNTAD PROPIA ===
  if (nameLow.includes("soul") || nameLow.includes("zangetsu") || nameLow.includes("enma") || nameLow.includes("samehada") || nameLow.includes("raichi") || nameLow.includes("hatchiyack") || nameLow.includes("guts") || nameLow.includes("muramasa") || nameLow.includes("espada de la esperanza") || nameLow.includes("stormbreaker") || nameLow.includes("mjolnir") || abilitiesLow.includes("sintiente") || abilitiesLow.includes("voluntad propia")) {
    tags.add("Portador de Arma con Voluntad Propia");
  }

  // === 24. QUINTA OLEADA: BAKI & GRAPPLING / LINAJE HANMA ===
  if (uniLow.includes("baki") || nameLow.includes("baki") || nameLow.includes("yujiro") || nameLow.includes("jack hanma") || nameLow.includes("yuichiro") || nameLow.includes("doppo") || nameLow.includes("shibukawa") || nameLow.includes("oliva") || nameLow.includes("pickle") || nameLow.includes("hanayama") || nameLow.includes("kaku")) {
    tags.add("Especialista en Sumisión/Grappling");
    tags.add("Combatiente Terrestre/Grappling");
    if (nameLow.includes("hanma") || nameLow.includes("baki") || nameLow.includes("yujiro") || nameLow.includes("jack") || nameLow.includes("yuichiro")) {
      tags.add("Linaje de Combate Familiar (Hanma-Style)");
      tags.add("Biomecánica Extrema");
    }
  }

  // === 25. QUINTA OLEADA: COMBATIENTES AÉREOS VS TERRESTRES ===
  if (nameLow.includes("superman") || hasWord(nameLow, "thor") || nameLow.includes("iron man") || nameLow.includes("hawks") || nameLow.includes("invincible") || nameLow.includes("omni-man") || nameLow.includes("homelander") || nameLow.includes("goku") || nameLow.includes("vegeta") || nameLow.includes("freezer") || nameLow.includes("green lantern") || nameLow.includes("captain marvel") || nameLow.includes("star and stripe")) {
    tags.add("Combatiente Aéreo");
  }

  // === 26. QUINTA OLEADA: BOSS DE ANIQUILACIÓN UNIVERSAL ===
  if (nameLow.includes("zeno") || nameLow.includes("anti-monitor") || nameLow.includes("darkseid") || nameLow.includes("kid buu") || nameLow.includes("moro") || nameLow.includes("zamasu") || nameLow.includes("sukuna") || nameLow.includes("muzan") || nameLow.includes("boros") || nameLow.includes("garou") || nameLow.includes("all for one") || nameLow.includes("thanos") || nameLow.includes("galactus") || nameLow.includes("doomsday") || nameLow.includes("beerus") || nameLow.includes("bills") || nameLow.includes("champa") || nameLow.includes("cell max") || nameLow.includes("hirudegarn") || nameLow.includes("janemba")) {
    tags.add("Boss de Aniquilación Universal");
  }


  return Array.from(tags);
}

// Evalúa las sinergias activas en un escuadrón
export function detectSquadTagSynergies(team = []) {
  const safeTeam = (team || []).filter(Boolean);
  if (safeTeam.length < 2) {
    return { buffs: [], combos: [] };
  }

  const activeBuffs = [];
  const activeCombos = [];

  // Obtenemos tags efectivos y nombres en minúsculas
  const memberTags = safeTeam.map(c => getCharacterEffectiveTags(c).map(t => t.toLowerCase()));
  const memberNames = safeTeam.map(c => (c?.name || '').toLowerCase());

  // 1. Detectar Sinergias Pasivas Base
  TAG_SYNERGIES.forEach(syn => {
    const requiredNorm = syn.requiredTags.map(t => t.toLowerCase());
    const matchedMembers = [];

    safeTeam.forEach((c, idx) => {
      const tags = memberTags[idx] || [];
      const matches = requiredNorm.some(req => tags.some(t => t.includes(req) || req.includes(t)));
      if (matches) matchedMembers.push(c?.name || 'Aliado');
    });

    if (matchedMembers.length >= (syn.minMatches || 2)) {
      activeBuffs.push({
        id: syn.id,
        icon: syn.icon || "⚡",
        name: syn.name,
        desc: syn.effect
      });
    }
  });

  // 2. Detectar Sinergias Pasivas del Master Arsenal (Clan / Alianzas)
  if (typeof MASTER_COOPERATIVE_ARSENAL !== 'undefined' && MASTER_COOPERATIVE_ARSENAL.passiveSynergies) {
    MASTER_COOPERATIVE_ARSENAL.passiveSynergies.forEach(syn => {
      const requiredNorm = syn.requiredTags.map(t => t.toLowerCase());
      const matchedMembers = [];

      team.forEach((c, idx) => {
        const tags = memberTags[idx];
        const nameL = memberNames[idx];
        const matches = requiredNorm.some(req => tags.some(t => t.includes(req) || req.includes(t)) || nameL.includes(req));
        if (matches) matchedMembers.push(c.name);
      });

      if (matchedMembers.length >= (syn.minMatches || 2)) {
        activeBuffs.push({
          id: syn.id,
          icon: syn.icon || "🛡️",
          name: syn.name,
          desc: syn.effect
        });
      }
    });
  }

  // 3. Detectar Combos Activos Base
  TAG_TEAM_COMBOS.forEach(combo => {
    const requiredNorm = combo.requiredTags.map(t => t.toLowerCase());
    const matchedMembers = [];

    team.forEach((c, idx) => {
      const tags = memberTags[idx];
      const matches = requiredNorm.some(req => tags.some(t => t.includes(req) || req.includes(t)));
      if (matches) matchedMembers.push(c.name);
    });

    if (matchedMembers.length >= (combo.minMatches || 2)) {
      activeCombos.push({
        id: combo.id,
        pair: matchedMembers.slice(0, 3).join(" + "),
        name: `«${combo.name}»`,
        desc: combo.description
      });
    }
  });

  // 4. Detectar Team Combos & Crossovers del Master Arsenal
  if (typeof MASTER_COOPERATIVE_ARSENAL !== 'undefined') {
    const allArsenalCombos = [
      ...(MASTER_COOPERATIVE_ARSENAL.teamCombos || []),
      ...(MASTER_COOPERATIVE_ARSENAL.crossoverCombos || [])
    ];

    allArsenalCombos.forEach(combo => {
      const requiredNorm = combo.requiredTags.map(t => t.toLowerCase());
      const matchedMembers = [];

      team.forEach((c, idx) => {
        const tags = memberTags[idx];
        const nameL = memberNames[idx];
        const matches = requiredNorm.some(req => tags.some(t => t.includes(req) || req.includes(t)) || (combo.pair && combo.pair.toLowerCase().includes(nameL.split('(')[0].trim())));
        if (matches) matchedMembers.push(c.name);
      });

      if (matchedMembers.length >= (combo.minMatches || 2)) {
        activeCombos.push({
          id: combo.id,
          pair: combo.pair || matchedMembers.slice(0, 3).join(" + "),
          name: `«${combo.name}»`,
          desc: combo.effect || combo.coreography
        });
      }
    });
  }

  return {
    buffs: activeBuffs,
    combos: activeCombos
  };
}

export function detectNarrativeBossMechanics(bossChar, opposingTeam = []) {
  if (!bossChar) return null;
  const tags = getCharacterEffectiveTags(bossChar);
  const isBoss = tags.includes("Boss de Aniquilación Universal") || (opposingTeam && opposingTeam.length >= 2);

  if (!isBoss) return null;

  return {
    isNarrativeBoss: true,
    bossName: bossChar.name,
    preset: NARRATIVE_BOSS_PRESET,
    collectivePressureActive: opposingTeam && opposingTeam.length >= 3,
    calculatedDisdainActive: true
  };
}


// ==========================================
// MASTER COOPERATIVE ARSENAL (48 MECÁNICAS DE ALTO RIGOR)
// ==========================================
export const MASTER_COOPERATIVE_ARSENAL = {
  "teamCombos": [
    {
      "id": "combo-vortice-solar-mafuba",
      "name": "Vórtice Solar Mafūba",
      "pair": "Maestro Roshi + Krilin",
      "requiredTags": [
        "sealer",
        "ki_user",
        "ranged_specialist"
      ],
      "minMatches": 2,
      "trigger": "Objetivo contenido >= 1 seg, cegado, aturdido o tras ataque fallido.",
      "coreography": "Krilin lanza Taiyōken a quemarropa cegando el campo visual del rival en blanco absoluto. Roshi ancla los pies y absorbe el aire hacia las palmas antes de disparar el Mafūba en una espiral violenta que arrastra al enemigo hacia el recipiente.",
      "effect": "Aplica 'sealed_state' durante 2-5 turnos si el objetivo no rompe el vórtice. Contra entidades superiores, reduce movilidad en 60% y anula una técnica activa.",
      "apMultiplier": 1,
      "staminaCost": "Roshi: 35% Ki y fatiga cardiaca; Krilin: 15% Ki y visión reducida 1 turno.",
      "counterConditions": "Teletransporte, ruptura dimensional, inmunidad a sellado, resistencia espiritual o ataque de área antes del cierre.",
      "cooldownTurns": 4,
      "rangeRequirement": "Medio alcance (15-30 m)",
      "tierCeiling": "Tier 2-C",
      "counterTags": [
        "space_manipulator",
        "reality_warper",
        "teleportation_user"
      ]
    },
    {
      "id": "combo-impacto-doble-masenko-makankosappo",
      "name": "Impacto Doble Masenko–Makankōsappō",
      "pair": "Son Gohan + Piccolo",
      "requiredTags": [
        "mentor_disciple_bond",
        "ki_user",
        "piercing_attack_user"
      ],
      "minMatches": 2,
      "trigger": "Enemigo ocupado bloqueando ataque frontal o con coraza que requiere perforación concentrada.",
      "coreography": "Gohan descarga un Masenko ancho que llena el espacio de luz amarilla obligando al enemigo a elevar guardia. Piccolo se coloca a un ángulo lateral con dos dedos en la frente y libera el Makankōsappō como taladro estrecho penetrando por el punto ciego debilitado.",
      "effect": "El Masenko aplica 'guard_break'; el Makankōsappō gana +60% de penetración e ignora hasta 40% de defensa física/energética convencional.",
      "apMultiplier": 1.6,
      "staminaCost": "Gohan: 20% Ki; Piccolo: 30% Ki e inmovilidad parcial de 1 turno.",
      "counterConditions": "Velocistas o teletransporte que salgan de la línea de perforación.",
      "cooldownTurns": 3,
      "rangeRequirement": "Largo alcance (50-200 m)",
      "tierCeiling": "Tier 2-B",
      "counterTags": [
        "speedster",
        "intangibility"
      ]
    },
    {
      "id": "combo-kikoho-jaula-triangular",
      "name": "Kikoho de Jaula Triangular",
      "pair": "Ten Shin Han + Chaos + Krilin",
      "requiredTags": [
        "ki_user",
        "telekinesis_user",
        "battlefield_control"
      ],
      "minMatches": 3,
      "trigger": "Objetivo grande, regenerador o de durabilidad colosal.",
      "coreography": "Chaos inmoviliza articulaciones mediante telequinesis; Krilin siembra Kienzans en rutas de escape; Tenshinhan golpea el suelo con el Kikoho levantando losas de presión gravitatoria que aplastan el aire hacia abajo como una prensa.",
      "effect": "Aplica 'movement_lock' y daño de compresión acumulativo. Cada Kikoho consecutivo aumenta el AP en +15% (máximo 3 cargas).",
      "apMultiplier": 1.45,
      "staminaCost": "Tenshinhan: 20% HP + 25% Ki por descarga; Chaos: concentración constante; Krilin: 20% Ki.",
      "counterConditions": "Fuerza superior que rompa la telequinesis, absorción de energía, intangibilidad o vuelo dimensional.",
      "cooldownTurns": 4,
      "rangeRequirement": "Medio alcance",
      "tierCeiling": "Tier 3-A",
      "counterTags": [
        "super_strength",
        "power_absorber"
      ]
    },
    {
      "id": "combo-final-flash-corredor-muerte",
      "name": "Final Flash de Corredor de Muerte",
      "pair": "Vegeta + Dyspo",
      "requiredTags": [
        "prideful_ki_user",
        "speedster",
        "ranged_specialist"
      ],
      "minMatches": 2,
      "trigger": "Rival con defensa frontal alta y vulnerabilidad lateral o trasera.",
      "coreography": "Dyspo deja estelas violetas alrededor del enemigo golpeando articulaciones para forzar microgiros defensivos. Vegeta hunde los talones en el terreno y carga el Final Flash mientras los relámpagos dorados le cubren los antebrazos.",
      "effect": "Dyspo reduce la evasión enemiga en 35%; Final Flash gana +50% AP y 'line_piercing' absoluto.",
      "apMultiplier": 1.5,
      "staminaCost": "Vegeta: 40% Ki; Dyspo: 30% reserva de velocidad/stamina.",
      "counterConditions": "Ataque de área omnidireccional que expulse a Dyspo o barrera esférica.",
      "cooldownTurns": 3,
      "rangeRequirement": "Largo alcance",
      "tierCeiling": "Tier 2-C",
      "counterTags": [
        "barrier_user",
        "omni_directional_blast"
      ]
    },
    {
      "id": "combo-hakai-vector-cerrado",
      "name": "Hakai de Vector Cerrado",
      "pair": "Beerus + Whis / Vegeta Ultra Ego + Ángel",
      "requiredTags": [
        "destroyer_god",
        "angel_attendant"
      ],
      "minMatches": 2,
      "trigger": "Amenaza universal/multiversal, regeneración extrema, inmortalidad incompleta o absorción persistente.",
      "coreography": "El Ángel corrige la postura y trayectoria del Destructor con un golpe milimétrico de bastón o microdesviación temporal. El Destructor concentra la energía púrpura en una esfera compacta y la coloca directamente contra la defensa enemiga.",
      "effect": "Convierte el Hakai en 'existence_erasure_piercing'; ignora regeneración biológica y anula resistencias de inmortalidad parcial.",
      "apMultiplier": 2,
      "staminaCost": "Destructor: 50% reserva divina; Ángel: 1 carga de intervención y restricción de no combate por 3 turnos.",
      "counterConditions": "Autoridad divina superior, resistencia a borrado existencial, manipulación causal o desplazamiento fuera de la realidad.",
      "cooldownTurns": 5,
      "rangeRequirement": "Cuerpo a cuerpo / CQC",
      "tierCeiling": "Tier 1-C",
      "counterTags": [
        "supreme_authority",
        "causality_manipulator",
        "reality_warper"
      ]
    },
    {
      "id": "combo-caceria-rey-demonio",
      "name": "Cacería del Rey Demonio",
      "pair": "Tanjiro + Gyomei + Shinobu",
      "requiredTags": [
        "nichirin_user",
        "hashira_level",
        "poison_specialist"
      ],
      "minMatches": 3,
      "trigger": "Demonio o regenerador biológico con cuello reforzado o resistencia a decapitación.",
      "coreography": "Shinobu entra por una línea baja clavando veneno de glicinia en tendones y retrocede. El tanque fija el cuerpo con impacto de maza/hacha; el espadachín principal corta desde la mandíbula hacia la nuca con Danza del Dios del Fuego.",
      "effect": "El veneno reduce la regeneración entre 25% y 50%; el impacto fija postura; el corte final obtiene 'decapitation_bonus' y +45% AP.",
      "apMultiplier": 1.45,
      "staminaCost": "Shinobu: dosis preparadas; Defensor: 25% STM; Espadachín: concentración respiratoria alta.",
      "counterConditions": "Inmunidad química, cuerpo amorfo, sin anatomía humana o múltiples núcleos vitales.",
      "cooldownTurns": 3,
      "rangeRequirement": "Cuerpo a cuerpo",
      "tierCeiling": "Tier 7-B",
      "counterTags": [
        "amorphous_body",
        "multiple_hearts"
      ]
    },
    {
      "id": "combo-dominio-eclipse-inverso",
      "name": "Dominio de Eclipse Inverso",
      "pair": "Satoru Gojo + Yuta Okkotsu / Dos Domain Users",
      "requiredTags": [
        "domain_user",
        "cursed_energy_user",
        "reverse_cursed_technique"
      ],
      "minMatches": 2,
      "trigger": "Ambos poseen energía maldita suficiente y el campo no está ocupado por un Dominio superior.",
      "coreography": "Un usuario abre su Dominio; el segundo incrusta su técnica como capa secundaria en el borde interior. Las paredes vibran con dos firmas de energía distintas obligando al objetivo a procesar dos reglas de golpe seguro simultáneas.",
      "effect": "'domain_overlap': el enemigo debe resistir dos efectos de Sure-Hit o gastar dos defensas de dominio separadas. El segundo opera al 70% ignorando adaptación al primero.",
      "apMultiplier": 1.7,
      "staminaCost": "Usuario principal: 45% CE; Usuario secundario: 30% CE.",
      "counterConditions": "Simple Domain, Hollow Wicker Basket, Dominio superior de barrera abierta o interrupción en la apertura.",
      "cooldownTurns": 4,
      "rangeRequirement": "Radio de Dominio (50-200 m)",
      "tierCeiling": "Tier 6-C",
      "counterTags": [
        "open_barrier_domain",
        "anti_domain_technique"
      ]
    },
    {
      "id": "combo-destello-negro-relevo",
      "name": "Destello Negro de Relevo (Black Flash Chain)",
      "pair": "Yuji Itadori + Aoi Todo / Black Flash Users",
      "requiredTags": [
        "black_flash_user",
        "martial_artist",
        "position_swap_user"
      ],
      "minMatches": 2,
      "trigger": "Tres impactos físicos conectados en una ventana de 2 turnos.",
      "coreography": "El primer combatiente rompe la guardia con golpe al cuerpo; el usuario de cambio posicional intercambia ángulos con un aplauso; el rematador conecta su puño en la millonésima de segundo donde energía maldita y carne chocan.",
      "effect": "Cadena de Black Flash multiplicativa: 1º impacto +25%, 2º impacto +45%, 3º impacto +75% AP aplicando 'cursed_energy_overflow'.",
      "apMultiplier": 1.75,
      "staminaCost": "Cada miembro: 15-25% CE y riesgo de microfracturas por impacto.",
      "counterConditions": "Precognición, manipulación temporal, intangibilidad o barrera sin contacto.",
      "cooldownTurns": 2,
      "rangeRequirement": "CQC / Cuerpo a cuerpo",
      "tierCeiling": "Tier 7-A",
      "counterTags": [
        "time_manipulator",
        "intangibility"
      ]
    },
    {
      "id": "combo-plasma-puno-gravedad",
      "name": "Rayo de Plasma y Puño de Gravedad",
      "pair": "Genos + Tatsumaki",
      "requiredTags": [
        "cyborg_artillery",
        "telekinesis_user"
      ],
      "minMatches": 2,
      "trigger": "Objetivo de gran masa, móvil o protegido por escombros/terreno.",
      "coreography": "Tatsumaki comprime chatarra y piedras formando una jaula rotatoria que inmoviliza al objetivo. Genos apunta por el hueco central bloqueando articulaciones y descarga plasma mientras la telequinesis contiene el retroceso.",
      "effect": "El disparo gana +70% precisión y +40% penetración térmica; el objetivo recibe 'crushing_force'.",
      "apMultiplier": 1.4,
      "staminaCost": "Genos: 1 carga de núcleo; Tatsumaki: concentración psíquica alta.",
      "counterConditions": "Teletransporte, inmunidad a calor extremo o ataque psíquico a Tatsumaki.",
      "cooldownTurns": 3,
      "rangeRequirement": "Largo alcance (100 m - 1 km)",
      "tierCeiling": "Tier 5-A",
      "counterTags": [
        "teleportation",
        "heat_immunity"
      ]
    },
    {
      "id": "combo-bang-baki-marea-contraataques",
      "name": "Bang–Baki: Marea de Contraataques",
      "pair": "Silver Fang (Bang) + Baki Hanma",
      "requiredTags": [
        "martial_artist",
        "counterfighter",
        "biomechanics_expert"
      ],
      "minMatches": 2,
      "trigger": "Oponente centrado en fuerza bruta, embestida frontal o patrones repetitivos.",
      "coreography": "Bang desvía el golpe rival con espirales de muñeca y cadera del Puño de Agua que Fluye Roca Aplastada. Baki aprovecha la torsión corporal para entrar por costillas, hígado y mandíbula antes de que el enemigo recupere balance.",
      "effect": "Ignora 30% de defensa física mediante redirección cinética; aplica 'posture_break' durante 1 turno.",
      "apMultiplier": 1.35,
      "staminaCost": "Bajo Ki, alto consumo de stamina física y concentración.",
      "counterConditions": "Ataques de área omnidireccionales, energía no física o masa cósmica imposible de desviar.",
      "cooldownTurns": 2,
      "rangeRequirement": "Cuerpo a cuerpo",
      "tierCeiling": "Tier 6-A",
      "counterTags": [
        "omni_directional_blast",
        "intangible_energy"
      ]
    },
    {
      "id": "combo-anatomia-demonio-hanma",
      "name": "Anatomía del Demonio Hanma",
      "pair": "Yujiro Hanma + Jack Hanma + Kaoru Hanayama",
      "requiredTags": [
        "bruiser",
        "grappler",
        "biomechanics_extreme"
      ],
      "minMatches": 3,
      "trigger": "Objetivo biológico tangible con estructura ósea o muscular.",
      "coreography": "Hanayama fija al rival con su agarre de vicio de 500 kg/cm²; Jack muerde y secciona los tendones de anclaje; Yujiro descarga un golpe demoledor en el punto de colapso estructural con la Espalda del Demonio activada.",
      "effect": "'anatomical_breakdown': -50% movilidad física rival y +55% daño de impacto óseo irreversible.",
      "apMultiplier": 1.55,
      "staminaCost": "Jack: alto daño recibido; Hanayama: riesgo de fractura de agarre; Yujiro: stamina moderada.",
      "counterConditions": "Entidades sin órganos, cuerpos líquidos, campos de fuerza o formas cósmicas.",
      "cooldownTurns": 3,
      "rangeRequirement": "Cuerpo a cuerpo",
      "tierCeiling": "Tier 7-A",
      "counterTags": [
        "liquid_body",
        "forcefield",
        "abstract_entity"
      ]
    },
    {
      "id": "combo-cadena-sangre-division-especial",
      "name": "Cadena de Sangre de la División Especial",
      "pair": "Denji + Power + Aki Hayakawa",
      "requiredTags": [
        "devil_hybrid",
        "blood_manipulator",
        "devil_contract_user"
      ],
      "minMatches": 3,
      "trigger": "Combate urbano o cerrado sin rutas de escape aéreas.",
      "coreography": "Power transforma sangre derramada en púas y lanzas de suelo; Aki fuerza lectura del Demonio Futuro o contención de Fox; Denji carga con sus tres motosierras destrozando la posición forzada del rival.",
      "effect": "Power aplica 'bleeding_zone'; Aki reduce evasión; Denji gana +40% AP y 'anti_regeneration_pressure'.",
      "apMultiplier": 1.4,
      "staminaCost": "Power: reserva sanguínea; Aki: coste contractual; Denji: combustible/sangre.",
      "counterConditions": "Regeneración superior a Tier 6, vuelo libre o armadura impenetrable a cortes.",
      "cooldownTurns": 3,
      "rangeRequirement": "Medio alcance a CQC",
      "tierCeiling": "Tier 7-A",
      "counterTags": [
        "flight",
        "invulnerable_armor"
      ]
    },
    {
      "id": "combo-martillo-trueno-portal-vacio",
      "name": "Martillo del Trueno y Portal de Vacío",
      "pair": "Thor + Blast",
      "requiredTags": [
        "cosmic_energy_user",
        "space_manipulator",
        "ranged_specialist"
      ],
      "minMatches": 2,
      "trigger": "Objetivo veloz o protegido tras múltiples barreras físicas.",
      "coreography": "Blast abre dos portales espaciales conectando el martillo con el punto ciego del objetivo. Thor descarga un rayo devastador en el primer portal que emerge sin trayectoria previa junto al impacto de Mjolnir.",
      "effect": "'spatial_bypass': ignora coberturas físicas y gana +50% probabilidad de impacto certero.",
      "apMultiplier": 1.5,
      "staminaCost": "Blast: concentración espacial; Thor: descarga divina pesada.",
      "counterConditions": "Manipulación dimensional enemiga, precognición o absorción eléctrica.",
      "cooldownTurns": 3,
      "rangeRequirement": "Interdimensional / Rango Libre",
      "tierCeiling": "Tier 2-C",
      "counterTags": [
        "dimensional_lock",
        "lightning_absorber"
      ]
    },
    {
      "id": "combo-hellbat-speedforce-overclock",
      "name": "Hellbat de la Fuerza de la Velocidad",
      "pair": "Batman (Hellbat) + The Flash (Barry / Wally)",
      "requiredTags": [
        "tech_armor_user",
        "speedforce_user",
        "tactical_genius"
      ],
      "minMatches": 2,
      "trigger": "Objetivo cósmico con defensa monstruosa o punto débil estudiado.",
      "coreography": "Flash recorre el perímetro suministrando energía cinética regulada de la Speed Force a los servos de la armadura. Batman concentra la potencia en una ventana de 1 segundo descargando una ráfaga con reflejos hiper-acelerados.",
      "effect": "'speedforce_overclock': +80% velocidad de reacción y +45% AP durante 1 turno.",
      "apMultiplier": 1.45,
      "staminaCost": "Flash: reserva de Speed Force; Batman: consumo metabólico vital de la Hellbat.",
      "counterConditions": "Ataques omnidireccionales, hax mental o absorción de energía cinética.",
      "cooldownTurns": 4,
      "rangeRequirement": "Cuerpo a cuerpo",
      "tierCeiling": "Tier 2-A",
      "counterTags": [
        "kinetic_absorber",
        "mind_control"
      ]
    },
    {
      "id": "combo-veredicto-trono-asgard",
      "name": "Veredicto del Trono de Asgard",
      "pair": "Thor + Doctor Strange",
      "requiredTags": [
        "divine_entity",
        "magic_user",
        "cosmic_energy_user"
      ],
      "minMatches": 2,
      "trigger": "Objetivo con durabilidad física extrema pero vulnerabilidad mística o espiritual.",
      "coreography": "Doctor Strange fija runas arcanas de contención en el aire reduciendo el espacio a un corredor ritual. Thor canaliza su rayo divino a través de los sellos místicos desglosando la energía en capas físicas, espirituales y dimensionales.",
      "effect": "'multi_layer_damage': el rival debe resistir daño físico, mágico y espiritual por separado (+35% AP total y cobertura total de resistencias).",
      "apMultiplier": 1.35,
      "staminaCost": "Strange: concentración sostenida; Thor: descarga divina máxima.",
      "counterConditions": "Anulación mágica global, absorción eléctrica o ruptura de concentración de Strange.",
      "cooldownTurns": 4,
      "rangeRequirement": "Largo alcance",
      "tierCeiling": "Tier 1-C",
      "counterTags": [
        "magic_nullification",
        "anti_magic"
      ]
    },
    {
      "id": "combo-juicio-causalidad-cero",
      "name": "Juicio de la Causalidad Cero",
      "pair": "Giorno Giovanna (GER) + Funny Valentine (D4C)",
      "requiredTags": [
        "causality_manipulator",
        "multiversal_traveler"
      ],
      "minMatches": 2,
      "trigger": "Amenaza capaz de reescribir eventos, escapar a otra línea temporal o revivir mediante clones.",
      "coreography": "Valentine empuja al objetivo hacia una frontera de realidades superpuestas donde cada movimiento genera reflejos dimensionales. GER activa la reversión a cero: cada ruta de escape vuelve al punto de origen sin completarse.",
      "effect": "'causal_loop_prison': bloquea retirada dimensional, resurrección por variante y escape causal durante 3 turnos.",
      "apMultiplier": 1,
      "staminaCost": "Concentración absoluta de ambos usuarios.",
      "counterConditions": "Borrado conceptual, supremacía causal o autoridad cosmológica Tier 1-A / Tier 0.",
      "cooldownTurns": 5,
      "rangeRequirement": "Dimensional",
      "tierCeiling": "Tier 1-A",
      "counterTags": [
        "conceptual_erasure",
        "tier_0_authority"
      ]
    }
  ],
  "passiveSynergies": [
    {
      "id": "syn-sintonia-gemelos-androides",
      "name": "Sintonía de Gemelos Androides",
      "icon": "🤖",
      "requiredTags": [
        "android",
        "infinite_energy_core"
      ],
      "minMatches": 2,
      "effect": "Mientras ambos estén conscientes, comparten lectura de combate y pueden transferir hasta 15% de energía por turno sin pérdida. +20% resistencia contra absorción de Ki.",
      "ruptureCondition": "Si uno cae, el otro sufre 'core_instability': -10% precisión por 2 turnos."
    },
    {
      "id": "syn-orgullo-saiyan-vanguardia",
      "name": "Orgullo Saiyan de Vanguardia",
      "icon": "🐒",
      "requiredTags": [
        "saiyan"
      ],
      "minMatches": 2,
      "effect": "Por cada Saiyan aliado consciente: +5% resistencia a intimidación y sellado emocional. Si un Saiyan cae bajo el 20% HP, todos los Saiyans ganan +8% AP durante 1 turno.",
      "ruptureCondition": "Si el líder o el Saiyan de mayor Tier cae, se otorga el bonus ofensivo una vez pero se aplica fatiga emocional (-10% coordinación por 2 turnos)."
    },
    {
      "id": "syn-resonancia-namekiana-guardianes",
      "name": "Resonancia Namekiana de Guardianes",
      "icon": "🌱",
      "requiredTags": [
        "namekian"
      ],
      "minMatches": 2,
      "effect": "Comparten percepción de Ki, recuperación moderada y resistencia a confusión sensorial. Un usuario con 'healer_support' mantiene la regeneración del grupo 1 turno extra.",
      "ruptureCondition": "Si el guardián/sanador cae, la red de percepción se reduce y se pierde el bono de detección."
    },
    {
      "id": "syn-legion-imperial-freezer",
      "name": "Legión Imperial de Freezer",
      "icon": "👑",
      "requiredTags": [
        "freezer_force"
      ],
      "minMatches": 2,
      "effect": "Las tropas reciben +15% precisión mientras un miembro de linaje real siga activo. Los líderes pueden transferir aggro al subordinado más resistente.",
      "ruptureCondition": "Si el líder imperial cae, los subordinados sufren pánico de disciplina (-25% moral) o 'vengeful_overdrive'."
    },
    {
      "id": "syn-red-maleficio-compartido",
      "name": "Red de Maleficio Compartido",
      "icon": "🏯",
      "requiredTags": [
        "cursed_energy_user"
      ],
      "minMatches": 2,
      "effect": "Los usuarios de Energía Maldita detectan residuos de técnicas lanzadas por aliados y rivales; el coste de reconocer técnicas repetidas se reduce en 10%.",
      "ruptureCondition": "Un Dominio enemigo de alto nivel anula la red durante su vigencia."
    },
    {
      "id": "syn-sangre-demon-slayer-corps",
      "name": "Sangre de Demon Slayer Corps",
      "icon": "⚔️",
      "requiredTags": [
        "nichirin_user",
        "hashira_level"
      ],
      "minMatches": 2,
      "effect": "Mejora la precisión de corte contra anatomía demoníaca y regeneradores. La primera decapitación fallida no consume la ventana de ejecución del equipo.",
      "ruptureCondition": "Si se destruyen las espadas Nichirin, el bonus se suspende."
    },
    {
      "id": "syn-disciplina-casa-hanma",
      "name": "Disciplina de la Casa Hanma",
      "icon": "👹",
      "requiredTags": [
        "biomechanics_extreme"
      ],
      "minMatches": 2,
      "effect": "+20% resistencia a derribo, dolor y pérdida de postura. Tras observar una técnica física una vez, todos los miembros con 'martial_artist' reciben lectura corporal mejorada.",
      "ruptureCondition": "Inoperante contra energía intangible, realidad alterada o ataques sin biomecánica."
    },
    {
      "id": "syn-circulo-cazadores-diablos",
      "name": "Círculo de Cazadores de Diablos",
      "icon": "🩸",
      "requiredTags": [
        "devil_hunter",
        "devil_contract_user",
        "devil_hybrid"
      ],
      "minMatches": 2,
      "effect": "Identifican con antelación el coste probable de un contrato o transformación. Cuando un miembro consume sangre, otro puede cubrirlo sin perder acción ofensiva.",
      "ruptureCondition": "Si una entidad de control domina a un miembro, la información compartida se vuelve vulnerabilidad."
    },
    {
      "id": "syn-herencia-viltrumita",
      "name": "Herencia Viltrumita",
      "icon": "🪐",
      "requiredTags": [
        "viltrumite"
      ],
      "minMatches": 2,
      "effect": "En atmósferas hostiles, vacío espacial, tormentas de escombros o combate orbital: +25% eficiencia de movimiento y +15% resistencia al impacto.",
      "ruptureCondition": "Ataques sónicos específicos o daño interno masivo anulan la ventaja biológica."
    },
    {
      "id": "syn-protocolos-vengadores",
      "name": "Protocolos de los Vengadores",
      "icon": "🛡️",
      "requiredTags": [
        "avenger_affiliated"
      ],
      "minMatches": 2,
      "effect": "Un miembro estratega asigna roles (tanque, daño, control, rescate). El primer ataque sorpresa del encuentro sufre -30% de eficacia.",
      "ruptureCondition": "Si el estratega cae, se pierde la coordinación táctica."
    },
    {
      "id": "syn-triangulo-de-la-justicia",
      "name": "Triángulo de la Justicia",
      "icon": "🦇",
      "requiredTags": [
        "justice_league_founder"
      ],
      "minMatches": 2,
      "effect": "Superman mitiga daño directo, Flash controla iniciativa y Batman revela una debilidad tras 3 turnos. Defensa reactiva contra Hax desconocido.",
      "ruptureCondition": "Si Flash cae se pierde iniciativa; si Batman cae no hay análisis; si Superman cae la defensa se desploma."
    },
    {
      "id": "syn-juramento-de-ragnarok",
      "name": "Juramento de Ragnarok",
      "icon": "🏆",
      "requiredTags": [
        "ragnarok_fighter"
      ],
      "minMatches": 2,
      "effect": "Al combatir con público, testigos o formato torneo: 'witness_pressure' otorga +10% AP cuando están bajo el 35% HP.",
      "ruptureCondition": "Sin público ni evento estructurado el bonus se reduce al 50%."
    }
  ],
  "haxSynergies": [
    {
      "id": "hax-ceguera-perforacion-maldita",
      "name": "Ceguera Solar + Perforación Maldita",
      "requiredTags": [
        "flashbang_user",
        "piercing_attack_user"
      ],
      "effect": "La ceguera cubre el tiempo de carga lenta de ataques perforantes; +40% probabilidad de impacto de técnicas cargadas (+15% ante extrasensoriales)."
    },
    {
      "id": "hax-barrera-infinita-artilleria-cristal",
      "name": "Barrera Infinita + Artillería de Cristal",
      "requiredTags": [
        "barrier_user",
        "high_output_caster"
      ],
      "effect": "El artillero canaliza su técnica de máximo output sin riesgo de interrupción frontal (+50% AP); el usuario de barrera consume energía continua."
    },
    {
      "id": "hax-regeneracion-bajo-observacion",
      "name": "Regeneración Bajo Observación",
      "requiredTags": [
        "regenerator",
        "battlefield_controller"
      ],
      "effect": "El controlador deforma el terreno o aparta al enemigo permitiendo al regenerador curación acelerada (+30% velocidad de recuperación de tejido)."
    },
    {
      "id": "hax-copia-adaptativa-contra-tecnica",
      "name": "Copia Adaptativa Contra Técnica Única",
      "requiredTags": [
        "technique_copy_user",
        "tank_defender"
      ],
      "effect": "El tanque absorbe el primer uso del ataque rival mientras el copiador observa; tras observación completa copia la técnica al 60-80% de eficacia."
    },
    {
      "id": "hax-absorcion-segura-energia",
      "name": "Absorción Segura de Energía Externa",
      "requiredTags": [
        "power_absorber",
        "grappler"
      ],
      "effect": "El grappler inmoviliza al objetivo mientras el absorbedor drena de 10% a 25% de la reserva energética enemiga por turno sin exponerse."
    },
    {
      "id": "hax-contrato-prediccion-ejecucion",
      "name": "Contrato, Predicción y Ejecución",
      "requiredTags": [
        "future_sight_user",
        "assassin"
      ],
      "effect": "La lectura futura entrega la ventana exacta de abertura; el primer ataque de emboscada gana 'critical_window' y +50% precisión."
    },
    {
      "id": "hax-curacion-inversa-berserker",
      "name": "Curación Inversa + Berserker de Escalado",
      "requiredTags": [
        "reverse_cursed_technique",
        "damage_growth_berserker"
      ],
      "effect": "El berserker mantiene su bonificación de daño entre 30% y 50% HP mientras el sanador previene el cruce del umbral de muerte clínica."
    },
    {
      "id": "hax-sellado-espacio-dimensional",
      "name": "Sellado + Espacio Dimensional",
      "requiredTags": [
        "sealer",
        "space_manipulator"
      ],
      "effect": "El manipulador espacial elimina las rutas de escape del objetivo reduciendo su resistencia al sellado en un 30%."
    },
    {
      "id": "hax-velocidad-analisis-biometrico",
      "name": "Velocidad + Análisis Biométrico",
      "requiredTags": [
        "speedster",
        "tactical_genius"
      ],
      "effect": "El velocista recopila datos de puntos débiles a alta velocidad; tras 1 turno de reconocimiento el combo aliado ignora 20% de defensa relevante."
    },
    {
      "id": "hax-destruccion-restauracion-campo",
      "name": "Poder de Destrucción + Restauración de Campo",
      "requiredTags": [
        "destroyer_god",
        "reality_repair_user"
      ],
      "effect": "El Destructor descarga ataques de área letales mientras el restaurador recupera infraestructura vital y estabiliza el escenario."
    }
  ],
  "crossoverCombos": [
    {
      "id": "cross-kamehameha-vacio-infinito",
      "name": "Kamehameha del Vacío Infinito",
      "pair": "Son Goku + Satoru Gojo",
      "requiredTags": [
        "ki_user",
        "absolute_barrier_user",
        "domain_user"
      ],
      "effect": "Gojo extiende Infinity a lo largo del corredor de trayectoria ralentizando al rival; Goku dispara un Kamehameha a través del túnel espacial (+50% precisión y 'escape_suppression')."
    },
    {
      "id": "cross-ui-dominio-probabilidad",
      "name": "Ultra Instinto y Dominio de Probabilidad",
      "pair": "Son Goku (Ultra Instinto) + Kinji Hakari",
      "requiredTags": [
        "autonomous_evasion",
        "domain_user"
      ],
      "effect": "El Jackpot de Hakari altera el ritmo de energía mientras Goku opera en respuesta automática reduciendo el coste de evasión y cubriendo a Hakari."
    },
    {
      "id": "cross-hakai-regeneracion-demoniaca",
      "name": "Hakai contra Regeneración Demoníaca",
      "pair": "Beerus / Vegeta Ultra Ego + Yoriichi Tsugikuni / Tanjiro",
      "requiredTags": [
        "destroyer_god",
        "nichirin_user",
        "anti_regeneration"
      ],
      "effect": "El espadachín abre una herida profunda; el Destructor coloca una chispa de Hakai sobre la carne obligando al rival a resistir borrado existencial (-70% efectividad de regeneración)."
    },
    {
      "id": "cross-speedforce-black-flash",
      "name": "Speedforce Black Flash",
      "pair": "The Flash + Yuji Itadori",
      "requiredTags": [
        "speedforce_user",
        "black_flash_user",
        "martial_artist"
      ],
      "effect": "Flash suministra una ventana cinética milimétrica y Yuji descarga un Black Flash en el punto exacto de salida (+75% AP en un único impacto)."
    },
    {
      "id": "cross-rayo-thor-dominio-sombras",
      "name": "Rayo de Thor dentro de Dominio Incompleto",
      "pair": "Thor + Megumi Fushiguro",
      "requiredTags": [
        "lightning_user",
        "domain_user"
      ],
      "effect": "Megumi expande sombras por el terreno; el relámpago de Mjolnir emerge simultáneamente de múltiples puntos oscuros (+35% probabilidad de aturdimiento en área)."
    },
    {
      "id": "cross-miedo-ilusion-causal",
      "name": "El Diablo del Miedo y la Ilusión Causal",
      "pair": "Makima + Giorno Giovanna (GER)",
      "requiredTags": [
        "control_user",
        "causality_manipulator"
      ],
      "effect": "Makima aplica presión de control; cada intento de romperla es devuelto a cero por GER aplicando 'command_loop' (el enemigo pierde un turno ofensivo si falla resistencia)."
    },
    {
      "id": "cross-puno-verde-portal-bestia",
      "name": "El Puño Verde y el Portal de la Bestia",
      "pair": "Hulk + Blast",
      "requiredTags": [
        "unlimited_rage_growth",
        "space_manipulator",
        "bruiser"
      ],
      "effect": "Blast abre un portal a centímetros del puño de Hulk y otro en la espalda enemiga; 'spatial_bypass_punch' ignora guardia frontal (+40% daño de impacto)."
    },
    {
      "id": "cross-omniman-diez-sombras",
      "name": "Omni-Man contra Técnica de Diez Sombras",
      "pair": "Omni-Man + Megumi Fushiguro",
      "requiredTags": [
        "viltrumite",
        "battlefield_control"
      ],
      "effect": "Los shikigami de sombras desvían la atención rival y Omni-Man embiste a velocidad orbital por el hueco generado (+30% velocidad efectiva de embestida)."
    },
    {
      "id": "cross-mafuba-d4c-ancla-realidad",
      "name": "Mafūba contra D4C: Ancla de Realidad",
      "pair": "Maestro Roshi + Funny Valentine",
      "requiredTags": [
        "sealer",
        "multiversal_traveler"
      ],
      "effect": "D4C bloquea la sustitución dimensional cerrando variantes paralelas mientras Roshi ejecuta el vórtice de sellado (+50% efectividad contra viajeros multiversales)."
    },
    {
      "id": "cross-corte-solar-cuerpo-adaptativo",
      "name": "Corte Solar contra Cuerpo Adaptativo",
      "pair": "Yoriichi Tsugikuni + Garou Cósmico",
      "requiredTags": [
        "swordsman",
        "adaptive_evolution",
        "martial_artist"
      ],
      "effect": "Garou imita y fuerza la reacción defensiva enemiga; Yoriichi corta por la línea libre desatando 'adaptation_bypass' (ignora resistencias desarrolladas previamente)."
    }
  ]
};

export const TAG_COMBOS = TAG_TEAM_COMBOS;
