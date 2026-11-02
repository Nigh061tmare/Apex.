/**
 * APEX Engine — Form Scaling Configuration
 * Universe-indexed aliases and explicit multipliers for form resolution.
 * For external universes: forms are recognized but do NOT get invented multipliers.
 * External forms require explicit data in character sheets (tierExact, apexKiMultiplier, etc.)
 */

export const FORM_SCALING_CONFIG = {
  "dragon-ball": {
    "fruit_of_might": {
      "aliases": [
        "fruto del shinseiju",
        "shinseiju consumido",
        "tree of might fruit"
      ],
      "apexKiMultiplier": 15,
      "sourceKiMultiplier": 15,
      "statModifiers": {
        "speed": 1.5,
        "durability": 1.5
      },
      "availability": "verified"
    },
    "giant_form_namekian_makyan": {
      "aliases": [
        "forma super gigante",
        "slug gigante",
        "super giant form",
        "great namekian",
        "forma gigante"
      ],
      "apexKiMultiplier": 10,
      "sourceKiMultiplier": 10,
      "statModifiers": {
        "speed": 0.8,
        "durability": 2
      },
      "availability": "verified"
    },
    "hera_clan_transformation": {
      "aliases": [
        "forma maxima (100% de poder)",
        "forma maxima 100 de poder",
        "super kogu",
        "bido",
        "guerrera de hera",
        "hera clan",
        "full power hera"
      ],
      "apexKiMultiplier": 20,
      "sourceKiMultiplier": 20,
      "statModifiers": {
        "speed": 1.4,
        "durability": 1.5
      },
      "availability": "verified"
    },
    "super_saiyan": {
      "aliases": [
        "ss",
        "ssj",
        "ssj1",
        "ss1",
        "super saiyan",
        "super saiyajin",
        "super saiyan 1",
        "super saiyajin 1"
      ],
      "apexKiMultiplier": 50,
      "sourceKiMultiplier": 50,
      "statModifiers": {
        "speed": 1.5,
        "durability": 1.2
      },
      "availability": "verified"
    },
    "super_saiyan_grade_2": {
      "aliases": [
        "super vegeta",
        "ssj grado 2",
        "super saiyan grade 2",
        "super saiyajin segundo grado"
      ],
      "apexKiMultiplier": 65,
      "sourceKiMultiplier": 65,
      "statModifiers": {
        "speed": 1.1,
        "durability": 1.4
      },
      "availability": "verified"
    },
    "super_saiyan_grade_3": {
      "aliases": [
        "ultra trunks",
        "ssj grado 3",
        "super saiyan grade 3",
        "super saiyajin ultra"
      ],
      "apexKiMultiplier": 85,
      "sourceKiMultiplier": 85,
      "statModifiers": {
        "speed": 0.7,
        "durability": 1.8
      },
      "availability": "verified"
    },
    "super_saiyan_2": {
      "aliases": [
        "ss2",
        "ssj2",
        "super saiyan 2",
        "super saiyajin 2"
      ],
      "apexKiMultiplier": 100,
      "sourceKiMultiplier": 100,
      "statModifiers": {
        "speed": 2,
        "durability": 1.5
      },
      "availability": "verified"
    },
    "super_saiyan_3": {
      "aliases": [
        "ss3",
        "ssj3",
        "super saiyan 3",
        "super saiyajin 3"
      ],
      "apexKiMultiplier": 400,
      "sourceKiMultiplier": 400,
      "statModifiers": {
        "speed": 3,
        "durability": 2
      },
      "availability": "verified"
    },
    "super_saiyan_4": {
      "aliases": [
        "ss4",
        "ssj4",
        "super saiyan 4",
        "super saiyajin 4",
        "super saiyan 4 limit breaker",
        "ssj4 limit breaker"
      ],
      "apexKiMultiplier": 4000,
      "sourceKiMultiplier": 4000,
      "statModifiers": {
        "speed": 5,
        "durability": 4
      },
      "availability": "verified"
    },
    "super_saiyan_god": {
      "aliases": [
        "ssg",
        "ssj god",
        "super saiyan god",
        "super saiyajin god",
        "dios super saiyan",
        "super saiyan rojo"
      ],
      "apexKiMultiplier": 20000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 8
      },
      "availability": "verified"
    },
    "super_saiyan_blue": {
      "aliases": [
        "ssb",
        "ssj blue",
        "super saiyan blue",
        "super saiyajin blue",
        "super saiyan god super saiyan",
        "ssgss"
      ],
      "apexKiMultiplier": 50000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 15,
        "durability": 12
      },
      "availability": "verified"
    },
    "ssb_kaioken": {
      "aliases": [
        "ssb kaioken",
        "super saiyan blue kaioken",
        "ssb kkx10",
        "ssb kkx20",
        "super saiyan blue kaioken x20",
        "ssb kaio-ken"
      ],
      "apexKiMultiplier": 1000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 25,
        "durability": 15
      },
      "availability": "verified"
    },
    "ssb_evolution": {
      "aliases": [
        "ssb evolution",
        "super saiyan blue evolution",
        "ssb evolucion",
        "ssb shinka",
        "super saiyan blue shinka"
      ],
      "apexKiMultiplier": 1000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 25,
        "durability": 20
      },
      "availability": "verified"
    },
    "ultra_instinct_sign": {
      "aliases": [
        "ultra instinto senal",
        "ultra instinto señal",
        "ui sign",
        "migatte no gokui omen",
        "doctrina egoista senal"
      ],
      "apexKiMultiplier": 5000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 50,
        "durability": 30
      },
      "availability": "verified"
    },
    "ultra_instinct_mastered": {
      "aliases": [
        "ultra instinto dominado",
        "ultra instinto perfecto",
        "ui mastered",
        "migatte no gokui",
        "doctrina egoista completa",
        "mui",
        "ultra instinto completo"
      ],
      "apexKiMultiplier": 25000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 100,
        "durability": 60
      },
      "availability": "verified"
    },
    "ultra_ego": {
      "aliases": [
        "ultra ego",
        "wagamama no gokui",
        "megainstinto",
        "ultra ego vegeta"
      ],
      "apexKiMultiplier": 25000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 80,
        "durability": 90
      },
      "availability": "verified"
    },
    "oozaru": {
      "aliases": [
        "oozaru",
        "ohzaru",
        "mono gigante",
        "great ape"
      ],
      "apexKiMultiplier": 10,
      "sourceKiMultiplier": 10,
      "statModifiers": {
        "speed": 0.8,
        "durability": 2.5
      },
      "availability": "verified"
    },
    "golden_oozaru": {
      "aliases": [
        "golden oozaru",
        "mono gigante dorado",
        "golden great ape"
      ],
      "apexKiMultiplier": 500,
      "sourceKiMultiplier": 500,
      "statModifiers": {
        "speed": 1.2,
        "durability": 5
      },
      "availability": "verified"
    },
    "kaioken_x2": {
      "aliases": [
        "kaioken x2",
        "kaio-ken x2",
        "kaiöken x2"
      ],
      "apexKiMultiplier": 2,
      "sourceKiMultiplier": 2,
      "statModifiers": {
        "speed": 1.5,
        "durability": 1
      },
      "availability": "verified"
    },
    "kaioken_x3": {
      "aliases": [
        "kaioken x3",
        "kaio-ken x3",
        "kaiöken x3"
      ],
      "apexKiMultiplier": 3,
      "sourceKiMultiplier": 3,
      "statModifiers": {
        "speed": 2,
        "durability": 1
      },
      "availability": "verified"
    },
    "kaioken_x4": {
      "aliases": [
        "kaioken x4",
        "kaio-ken x4",
        "kaiöken x4"
      ],
      "apexKiMultiplier": 4,
      "sourceKiMultiplier": 4,
      "statModifiers": {
        "speed": 2.5,
        "durability": 1
      },
      "availability": "verified"
    },
    "kaioken_x10": {
      "aliases": [
        "kaioken x10",
        "kaio-ken x10",
        "kaiöken x10"
      ],
      "apexKiMultiplier": 10,
      "sourceKiMultiplier": 10,
      "statModifiers": {
        "speed": 5,
        "durability": 1
      },
      "availability": "verified"
    },
    "kaioken_x20": {
      "aliases": [
        "kaioken x20",
        "kaio-ken x20",
        "kaiöken x20"
      ],
      "apexKiMultiplier": 20,
      "sourceKiMultiplier": 20,
      "statModifiers": {
        "speed": 8,
        "durability": 1
      },
      "availability": "verified"
    },
    "potential_unleashed": {
      "aliases": [
        "estado definitivo",
        "mystic",
        "mystic gohan",
        "ultimate gohan",
        "potencial desbloqueado",
        "gohan definitivo"
      ],
      "apexKiMultiplier": 500,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 3
      },
      "availability": "verified"
    },
    "beast_gohan": {
      "aliases": [
        "gohan beast",
        "modo bestia",
        "beast",
        "bestia",
        "gohan bestia"
      ],
      "apexKiMultiplier": 30000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 120,
        "durability": 80
      },
      "availability": "verified"
    },
    "orange_piccolo": {
      "aliases": [
        "orange piccolo",
        "piccolo naranja",
        "forma naranja"
      ],
      "apexKiMultiplier": 20000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 60,
        "durability": 90
      },
      "availability": "verified"
    },
    "freezer_first_form": {
      "aliases": [
        "1ra forma",
        "primera forma",
        "1a forma",
        "1st form",
        "freezer primera forma",
        "supresion en capsula",
        "forma 1"
      ],
      "apexKiMultiplier": 1,
      "sourceKiMultiplier": 1,
      "explicitSourceKi": 530000,
      "statModifiers": {
        "speed": 1,
        "durability": 1
      },
      "availability": "verified"
    },
    "freezer_second_form": {
      "aliases": [
        "freezer segunda forma",
        "segunda forma freezer",
        "segunda forma",
        "2nd form",
        "2da forma",
        "2a forma",
        "gigante con cuernos",
        "forma 2"
      ],
      "apexKiMultiplier": 2,
      "sourceKiMultiplier": 2.075,
      "explicitSourceKi": 1100000,
      "statModifiers": {
        "speed": 1.5,
        "durability": 2
      },
      "availability": "verified"
    },
    "freezer_third_form": {
      "aliases": [
        "freezer tercera forma",
        "tercera forma freezer",
        "tercera forma",
        "3rd form",
        "3ra forma",
        "3a forma",
        "forma xenomorfa",
        "forma 3"
      ],
      "apexKiMultiplier": 4,
      "sourceKiMultiplier": 3.774,
      "explicitSourceKi": 2000000,
      "statModifiers": {
        "speed": 2.2,
        "durability": 2.5
      },
      "availability": "verified"
    },
    "freezer_final_form": {
      "aliases": [
        "freezer forma final",
        "forma final freezer",
        "forma final",
        "final form",
        "forma verdadera",
        "poder real desatado"
      ],
      "apexKiMultiplier": 120,
      "sourceKiMultiplier": 241.5,
      "explicitSourceKi": 128000000,
      "statModifiers": {
        "speed": 5,
        "durability": 4
      },
      "availability": "verified"
    },
    "freezer_100_percent": {
      "aliases": [
        "freezer 100%",
        "freezer 100",
        "freezer poder total",
        "100% power",
        "100 por ciento",
        "100% de poder",
        "forma final al 100%",
        "forma final al 100% de poder",
        "masa muscular hipertrofiada",
        "masa muscular maxima",
        "100%"
      ],
      "apexKiMultiplier": 240,
      "sourceKiMultiplier": 283,
      "explicitSourceKi": 150000000,
      "statModifiers": {
        "speed": 6,
        "durability": 6
      },
      "availability": "verified"
    },
    "golden_frieza": {
      "aliases": [
        "golden frieza",
        "golden freezer",
        "freezer dorado",
        "frieza dorado",
        "golden freezer dominado",
        "golden freezer verdadero",
        "golden",
        "true golden frieza",
        "golden freezer verdadero perfeccionado",
        "golden freezer primera transformacion inestable"
      ],
      "apexKiMultiplier": 50000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 18,
        "durability": 14
      },
      "availability": "verified"
    },
    "black_frieza": {
      "aliases": [
        "black frieza",
        "black freezer",
        "freezer negro",
        "frieza negro",
        "forma black",
        "black freezer 10 anos de entrenamiento en la habitacion del tiempo"
      ],
      "apexKiMultiplier": 50000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 150,
        "durability": 150
      },
      "availability": "verified"
    },
    "cooler_fifth_form": {
      "aliases": [
        "quinta forma",
        "5ta forma",
        "5a forma",
        "forma aumentada",
        "cold 5ta",
        "cooler 5ta forma",
        "5th form",
        "forma final cooler",
        "cooler forma final",
        "quinta forma aumentada"
      ],
      "apexKiMultiplier": 20,
      "sourceKiMultiplier": 20,
      "statModifiers": {
        "speed": 3,
        "durability": 3.5
      },
      "availability": "verified"
    },
    "metal_cooler": {
      "aliases": [
        "metal cooler",
        "meta cooler",
        "cuerpo de aleacion",
        "meta-cooler",
        "cuerpo de metal"
      ],
      "apexKiMultiplier": 60,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 5
      },
      "availability": "verified"
    },
    "king_cold_original_form": {
      "aliases": [
        "forma original",
        "forma original cold",
        "forma original de cold",
        "forma final de cold",
        "forma original forma final de cold",
        "cold forma final",
        "rey cold forma original",
        "forma final cold"
      ],
      "apexKiMultiplier": 10,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 2.5,
        "durability": 2
      },
      "availability": "verified"
    },
    "king_cold_fifth_form": {
      "aliases": [
        "cold 5ta",
        "cold quinta forma",
        "quinta forma aumentada",
        "forma aumentada"
      ],
      "apexKiMultiplier": 20,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3.5,
        "durability": 3.5
      },
      "availability": "verified"
    },
    "king_cold_sixth_form": {
      "aliases": [
        "sexta forma",
        "6ta forma",
        "6a forma",
        "sexta forma titanica",
        "forma final multiple",
        "cold 6ta",
        "forma titanica",
        "sexta forma de cold",
        "forma final titanica",
        "forma titanica de cold"
      ],
      "apexKiMultiplier": 100,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4.5,
        "durability": 8
      },
      "availability": "verified"
    },
    "king_cold_form": {
      "aliases": [
        "rey cold forma final",
        "king cold 100%",
        "rey cold 100%",
        "king cold super",
        "king cold forma 2",
        "king cold forma 3"
      ],
      "apexKiMultiplier": 15,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 2,
        "durability": 2.5
      },
      "availability": "temporary"
    },
    "legendary_super_saiyan": {
      "aliases": [
        "lssj",
        "super saiyan legendario",
        "ssj legendario",
        "broly berserk",
        "ssj berserk",
        "super saiyajin legendario"
      ],
      "apexKiMultiplier": 1500,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 10
      },
      "availability": "verified"
    },
    "broly_full_power": {
      "aliases": [
        "broly full power",
        "super saiyan full power (broly)",
        "ssj fp broly",
        "broly fp"
      ],
      "apexKiMultiplier": 40000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 80,
        "durability": 120
      },
      "availability": "verified"
    },
    "cell_semi_perfect": {
      "aliases": [
        "cell semi-perfecto",
        "cell segunda forma",
        "semi-perfect cell"
      ],
      "apexKiMultiplier": 4,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 1.5,
        "durability": 2
      },
      "availability": "verified"
    },
    "cell_perfect": {
      "aliases": [
        "cell perfecto",
        "forma perfecta cell",
        "perfect cell"
      ],
      "apexKiMultiplier": 20,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 3
      },
      "availability": "verified"
    },
    "cell_super_perfect": {
      "aliases": [
        "super perfect cell",
        "cell super perfecto",
        "super cell",
        "cell renacido"
      ],
      "apexKiMultiplier": 100,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 4.5
      },
      "availability": "verified"
    },
    "cell_max": {
      "aliases": [
        "cell max",
        "cell max desatado"
      ],
      "apexKiMultiplier": 25000000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 40,
        "durability": 90
      },
      "availability": "verified"
    },
    "super_buu": {
      "aliases": [
        "super buu",
        "majin buu maldad pura",
        "evil buu"
      ],
      "apexKiMultiplier": 5,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 2,
        "durability": 3
      },
      "availability": "verified"
    },
    "buutenks": {
      "aliases": [
        "buutenks",
        "buu gotenks",
        "super buu (gotenks absorbido)"
      ],
      "apexKiMultiplier": 25,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 4
      },
      "availability": "verified"
    },
    "buuhan": {
      "aliases": [
        "buuhan",
        "buu gohan",
        "super buu (gohan absorbido)"
      ],
      "apexKiMultiplier": 60,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 5
      },
      "availability": "verified"
    },
    "kid_buu": {
      "aliases": [
        "kid buu",
        "buu pequeno",
        "buu puro",
        "pure buu"
      ],
      "apexKiMultiplier": 4,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 4
      },
      "availability": "verified"
    }
  },
  "naruto": {
    "sage_mode": {
      "aliases": [
        "modo sabio",
        "sage mode",
        "senjutsu"
      ],
      "apexKiMultiplier": 10,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 2,
        "durability": 3
      },
      "availability": "verified"
    },
    "kcm1": {
      "aliases": [
        "kcm",
        "kcm1",
        "modo chakra de kurama",
        "kurama chakra mode"
      ],
      "apexKiMultiplier": 25,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 3
      },
      "availability": "verified"
    },
    "kcm2": {
      "aliases": [
        "kcm2",
        "modo kurama completo",
        "bijuu mode"
      ],
      "apexKiMultiplier": 50,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 6
      },
      "availability": "verified"
    },
    "six_paths_sage": {
      "aliases": [
        "modo sabio de los seis caminos",
        "six paths sage mode",
        "so6p"
      ],
      "apexKiMultiplier": 200,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 20,
        "durability": 15
      },
      "availability": "verified"
    },
    "baryon_mode": {
      "aliases": [
        "modo barion",
        "baryon mode"
      ],
      "apexKiMultiplier": 1000,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 50,
        "durability": 20
      },
      "availability": "verified"
    },
    "eight_gates_gate_8": {
      "aliases": [
        "octava puerta",
        "puerta de la muerte",
        "night guy",
        "gate of death"
      ],
      "apexKiMultiplier": 100,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 30,
        "durability": 10
      },
      "availability": "verified"
    }
  },
  "bleach": {
    "shikai": {
      "aliases": [
        "shikai",
        "liberacion inicial"
      ],
      "apexKiMultiplier": 5,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 1.5,
        "durability": 1.5
      },
      "availability": "verified"
    },
    "bankai": {
      "aliases": [
        "bankai",
        "liberacion completa"
      ],
      "apexKiMultiplier": 10,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 2.5
      },
      "availability": "verified"
    },
    "hollow_mask": {
      "aliases": [
        "mascara hollow",
        "visored mask"
      ],
      "apexKiMultiplier": 3,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 1.8,
        "durability": 1.5
      },
      "availability": "verified"
    },
    "resurreccion": {
      "aliases": [
        "resurreccion",
        "resurrección"
      ],
      "apexKiMultiplier": 10,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 3
      },
      "availability": "verified"
    },
    "segunda_etapa": {
      "aliases": [
        "segunda etapa",
        "resurreccion segunda etapa"
      ],
      "apexKiMultiplier": 25,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 5
      },
      "availability": "verified"
    },
    "vollstandig": {
      "aliases": [
        "vollstandig",
        "vollständig",
        "quincy vollstandig"
      ],
      "apexKiMultiplier": 12,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3.5,
        "durability": 3
      },
      "availability": "verified"
    }
  },
  "one-piece": {
    "gear_2": {
      "aliases": [
        "gear second",
        "gear 2",
        "segunda marcha"
      ],
      "apexKiMultiplier": 3,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 1
      },
      "availability": "verified"
    },
    "gear_4": {
      "aliases": [
        "gear fourth",
        "gear 4",
        "boundman",
        "snakeman",
        "cuarto marcha"
      ],
      "apexKiMultiplier": 15,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 4
      },
      "availability": "verified"
    },
    "gear_5": {
      "aliases": [
        "gear fifth",
        "gear 5",
        "nika",
        "sun god nika",
        "quinto marcha"
      ],
      "apexKiMultiplier": 60,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 8
      },
      "availability": "verified"
    }
  },
  "baki": {
    "demon_back": {
      "aliases": [
        "espalda del demonio",
        "demon back",
        "ogre back",
        "espalda del demonio despertada"
      ],
      "apexKiMultiplier": 2.5,
      "sourceKiMultiplier": 2.5,
      "statModifiers": {
        "speed": 1.8,
        "durability": 2.2
      },
      "availability": "verified"
    },
    "demon_brain": {
      "aliases": [
        "cerebro del demonio",
        "demon brain"
      ],
      "apexKiMultiplier": 2,
      "sourceKiMultiplier": 2,
      "statModifiers": {
        "speed": 2,
        "durability": 1.2
      },
      "availability": "verified"
    },
    "goudou_activated": {
      "aliases": [
        "estilo goudou despertado",
        "mordida letal",
        "goudou activated"
      ],
      "apexKiMultiplier": 3,
      "sourceKiMultiplier": 3,
      "statModifiers": {
        "speed": 2.5,
        "durability": 2
      },
      "availability": "verified"
    },
    "quadraped_form": {
      "aliases": [
        "forma cuadrupeda",
        "depredador jurasico",
        "quadraped predator"
      ],
      "apexKiMultiplier": 5,
      "sourceKiMultiplier": 5,
      "statModifiers": {
        "speed": 3,
        "durability": 4
      },
      "availability": "verified"
    },
    "infantilizado": {
      "aliases": [
        "dorian infantilizado",
        "demonio dorian",
        "mentally broken"
      ],
      "apexKiMultiplier": 1,
      "sourceKiMultiplier": 1,
      "statModifiers": {
        "speed": 0.5,
        "durability": 0.7
      },
      "availability": "verified"
    },
    "nomura_passive": {
      "aliases": [
        "nomura forma civil pasiva",
        "nomura passive"
      ],
      "apexKiMultiplier": 2,
      "sourceKiMultiplier": 2,
      "statModifiers": {
        "speed": 1.5,
        "durability": 1
      },
      "availability": "verified"
    }
  },
  "marvel": {
    "god_mode": {
      "aliases": [
        "god mode",
        "poder divino",
        "modo dios",
        "thor modus god"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "binary_form": {
      "aliases": [
        "binary",
        "forma binaria",
        "photon blast control",
        "binary form"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sorcerer_supreme": {
      "aliases": [
        "sorcerer supreme",
        "hechicero supremo",
        "strange supreme",
        "rune king thor"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 6,
        "haxReliability": 0.8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "rune_king": {
      "aliases": [
        "rune king",
        "rey runico",
        "runas rey",
        "thor rune king",
        "thor rey runico"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10,
        "haxReliability": 0.9
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "infinity_gauntlet": {
      "aliases": [
        "guantelete del infinito",
        "infinity gauntlet",
        "infinito",
        "guantelete de poder",
        "thanos with infinity gauntlet"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10,
        "haxReliability": 1
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "hulk_worldbreaker": {
      "aliases": [
        "world breaker hulk",
        "hulk mundo quiebre",
        "wrath of whateverer"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 12
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sun_dipped": {
      "aliases": [
        "sun-dipped",
        "solareado",
        "superman sol",
        "absorcion solar",
        "superman sun-dipped"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 12,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "dark_phoenix": {
      "aliases": [
        "dark phoenix",
        "fuerza fenix",
        "phoenix oscura",
        "fenix oscura",
        "fenix oscura sin control"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 15,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "venom_symbiote": {
      "aliases": [
        "traje negro",
        "simbionte",
        "venom symbiote",
        "symbiote bond",
        "spider-man black suit"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 1.5,
        "durability": 2
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "god_buster": {
      "aliases": [
        "armadura godbuster",
        "godbuster",
        "god-buster",
        "armadura god-buster",
        "ironman godbuster",
        "iron man godbuster"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "red_goblin": {
      "aliases": [
        "red goblin",
        "goblin rojo",
        "norman osborn goblin",
        "goblin carnage"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "ant_man_micro": {
      "aliases": [
        "modo ant-man micro",
        "ant-man micro",
        "pyme particle micro"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 2,
        "durability": 1
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "giant_man_macro": {
      "aliases": [
        "modo giant-man macro",
        "giant-man macro",
        "pyme particle macro"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 1.5,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sentry_suppressed": {
      "aliases": [
        "sentry memoria suprimida",
        "sentry suppressed"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sentry_full_power": {
      "aliases": [
        "sentry poder completo desatado",
        "sentry full power"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 20,
        "durability": 20,
        "haxReliability": 0.5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "god_emperor_doom": {
      "aliases": [
        "god emperor doom",
        "doctor doom dios"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10,
        "haxReliability": 0.7
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "dc": {
    "classic_superman": {
      "aliases": [
        "superman traje clasico",
        "superman classic",
        "superman traje clásico"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sun_dipped": {
      "aliases": [
        "superman sun-dipped",
        "superman solareado",
        "superman absorcion solar",
        "superman sun-dipped"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 12,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "hellbat": {
      "aliases": [
        "armadura hellbat",
        "hellbat armor",
        "traje hellbat",
        "batman hellbat"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "darkseid_true_form": {
      "aliases": [
        "forma verdadera darkseid",
        "darkseid true form",
        "dios del mal",
        "darkseid forma true"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 10,
        "haxReliability": 0.9
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "doomsday_evolution": {
      "aliases": [
        "doomsday evolucion",
        "evolucion doomsday",
        "hunter prey doomsday",
        "doomsday evolved"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 12
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "shazam_transformed": {
      "aliases": [
        "shazam transformado",
        "shazam transformed",
        "billy batson shazam"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "darkest_knight": {
      "aliases": [
        "the darkest knight",
        "el caballero mas oscuro",
        "batman who laughs"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 15,
        "durability": 15,
        "haxReliability": 0.8
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "opm": {
    "serious_mode": {
      "aliases": [
        "modo serio",
        "serious mode",
        "serious series",
        "modo serio jupiter escalado"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "exponential_growth": {
      "aliases": [
        "crecimiento exponencial",
        "exponential growth",
        "crecimiento absoluto",
        "crecimiento exponencial absoluto"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 20,
        "durability": 20
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "cosmic_fear": {
      "aliases": [
        "modo miedo cosmico",
        "cosmic fear mode",
        "bendicion de dios"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 15,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "saitama_mode": {
      "aliases": [
        "modo saitama",
        "saitama mode",
        "copia de fuerza ilimitada"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 20,
        "durability": 20
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "awakened_monster": {
      "aliases": [
        "monstruo despierto",
        "awakened monster",
        "garou monstruo despertado"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "freed_form": {
      "aliases": [
        "forma liberada",
        "freed form",
        "sin armadura",
        "lord boros freed"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "meteoric_burst": {
      "aliases": [
        "meteoric burst",
        "estallido meteorico",
        "burst meteorico"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "psionic_100": {
      "aliases": [
        "psicoquinesis seria al 100%",
        "psionic 100%",
        "tatsumaki 100%"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sleeping_breathing": {
      "aliases": [
        "respiracion de liberacion al 100%",
        "sleeping breathing 100%",
        "silver fang roar"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "overload_10s": {
      "aliases": [
        "modo sobrecarga 10 segundos",
        "overload 10s",
        "genos 10s"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "golden_sperm": {
      "aliases": [
        "golden sperm",
        "sperm dorado",
        "black sperm golden"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "platinum_sperm": {
      "aliases": [
        "platinum sperm",
        "sperm platino",
        "black sperm platinum"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 15,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "jjk": {
    "domain_expansion": {
      "aliases": [
        "expansion de dominio",
        "domain expansion",
        "dominio",
        "domain expansion"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 2,
        "durability": 2
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "bankai_domain": {
      "aliases": [
        "dominio de asesinato",
        "culling game",
        "shibuya showdown"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "six_eyes_unsealed": {
      "aliases": [
        "seis ojos desatados",
        "unsealed six eyes",
        "ojos descubiertos",
        "six eyes unsealed"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "hollow_mask": {
      "aliases": [
        "mascara hollow",
        "visored mask"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 1.8,
        "durability": 1.5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "full_body_cluster": {
      "aliases": [
        "full-body cluster",
        "cluster completion",
        "detonacion total",
        "full-body cluster"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "gojo_unlocked": {
      "aliases": [
        "gojo ojos descubiertos pico total",
        "gojo pico total",
        "gojo shinjuku",
        "gojo complete form"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 20,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sukuna_20_fingers": {
      "aliases": [
        "sukuna 20 dedos",
        "ryomen sukuna full power",
        "sukuna 20 dedos cuerpo de megumi"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 15,
        "durability": 20
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sukuna_true_form": {
      "aliases": [
        "sukuna forma verdadera era heian",
        "true form heian era",
        "sukuna four arms"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 20,
        "durability": 30
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "yuta_5min": {
      "aliases": [
        "yuta conexion total con rika",
        "yuta full power 5 minutes",
        "rika 5 min mode"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "maki_woke": {
      "aliases": [
        "maki despertada",
        "maki awakened",
        "maki zero capping"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "kenjaku": {
      "aliases": [
        "kenjaku cuerpo de geto",
        "kenjaku",
        "suguru geto possessed"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "hakari_jackpot": {
      "aliases": [
        "hakari modo jackpot",
        "hakari jackpot 4:11",
        "jackpot mode"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "toji_unleashed": {
      "aliases": [
        "toji modo carniceria desatada",
        "toji shibuya",
        "toji full power"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 15,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "kashimo_amber": {
      "aliases": [
        "kashimo bestia mistica ambar",
        "kashimo amber",
        "kashimo full power"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "mahito_perfection": {
      "aliases": [
        "mahito self-embodiment of perfection",
        "mahito forma verdadera"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "yuji_black_flash": {
      "aliases": [
        "yuji cadena de black flash",
        "yuji black flash chain"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "my-hero": {
    "one_for_all_100": {
      "aliases": [
        "one for all 100% modo prime",
        "ofa 100% prime",
        "deku 100%"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "gearshift_overdrive": {
      "aliases": [
        "gearshift overdrive 120%",
        "fa jin quirk master",
        "deku gearshift"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "decay_woke": {
      "aliases": [
        "shigaraki deterioro despertado",
        "shigaraki decay",
        "tomura decay"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "afo_apex": {
      "aliases": [
        "cuerpo perfecto apex all for one fusionado",
        "afo apex body",
        "afo perfect form"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "all_might_prime": {
      "aliases": [
        "all might prime estado optimo dorado",
        "all might prime",
        "altana prime"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "cluster_detonation": {
      "aliases": [
        "bakugo despertar cluster explosion total",
        "bakugo cluster",
        "explosion total"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "phosphor_awakening": {
      "aliases": [
        "shoto fosfor despertar fuego frio",
        "shoto phosphor",
        "ice fire phosphor"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "hellflame_limit": {
      "aliases": [
        "endeavor hellflame limite termico",
        "prominence burn",
        "hellflame max"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "jojos": {
    "gold_experience_requiem": {
      "aliases": [
        "gold experience requiem",
        "ger",
        "giorno ger"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10,
        "haxReliability": 1
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "made_in_heaven": {
      "aliases": [
        "made in heaven",
        "velocidad infinita",
        "pucci mih",
        "made in heaven infinite speed"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 100,
        "durability": 50,
        "haxReliability": 1
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "c_moon": {
      "aliases": [
        "c-moon",
        "gravedad reversa",
        "cmoon",
        "pucci c-moon"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "the_world": {
      "aliases": [
        "star platinum the world",
        "jotaro the world",
        "parada temporal",
        "time stop"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 50,
        "durability": 10,
        "haxReliability": 0.9
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "the_world_high": {
      "aliases": [
        "dio high sangre de joseph",
        "dio 'high'",
        "joseph blood dio",
        "9s time stop"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 50,
        "durability": 15,
        "haxReliability": 0.95
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "tusk_act_4": {
      "aliases": [
        "tusk act 4",
        "rotacion infinita",
        "johnny act 4",
        "infinite rotation"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10,
        "haxReliability": 1
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "ultimate_kars": {
      "aliases": [
        "ultimate life form kars",
        "kars ultimate",
        "forma vida ultima kars"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10,
        "haxReliability": 0.8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "echoes_act_1_2": {
      "aliases": [
        "echoes act 1 act 2",
        "koichi echoes",
        "echoes sound-based"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 2
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "white_echoes_infinite": {
      "aliases": [
        "white echoes rotacion infinita",
        "rocky spin infinite"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10,
        "haxReliability": 0.8
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "chainsaw": {
    "chainsaw_hybrid": {
      "aliases": [
        "hibrido motosierra",
        "chainsaw hybrid",
        "denji chainsaw man",
        "hybrid chainsaw"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "pochita_hero": {
      "aliases": [
        "heroes del infierno pochita",
        "pochita true hero",
        "pochita verdadero"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 10,
        "haxReliability": 0.7
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "public_safety_leader": {
      "aliases": [
        "makima lider seguridad publica",
        "makima public safety"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 5,
        "haxReliability": 0.7
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "gun_devil_hybrid": {
      "aliases": [
        "aki demonio pistola hibrido",
        "aki gun hybrid"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "blood_fiend": {
      "aliases": [
        "power demonio sangre verdadero false",
        "power blood fiend",
        "power true form"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "bomb_hybrid": {
      "aliases": [
        "reze hibrido bomba",
        "reze bomb",
        "reze human bomb"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "war_devil": {
      "aliases": [
        "yoru demonio guerra",
        "yoru war devil",
        "asa yoru"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 5,
        "haxReliability": 0.6
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "katana_devil_hybrid": {
      "aliases": [
        "katana man hibrido katana devil",
        "katana hybrid",
        "katana devil"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "crossbow_devil": {
      "aliases": [
        "demonio ballesta quanxi",
        "quanxi crossbow",
        "crossbow devil"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "kimetsu": {
    "hunter_mark": {
      "aliases": [
        "marca de cazador demonios",
        "hunter mark",
        "demon hunter mark"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 2,
        "durability": 2
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sun_breathing": {
      "aliases": [
        "hinokami kagura despertar solar",
        "hinokami kagura",
        "sun breathing awakening"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "blade_breathing": {
      "aliases": [
        "blade breathing",
        "respiracion de hiedo"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "flower_breathing": {
      "aliases": [
        "flower breathing",
        "respiracion flor"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 4
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "serpent_breathing": {
      "aliases": [
        "serpent breathing",
        "respiracion serpiente"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "lunar_breathing": {
      "aliases": [
        "lunar breathing",
        "respiracion lunar"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "sound_breathing": {
      "aliases": [
        "sound breathing",
        "respiracion sonido"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "love_breathing": {
      "aliases": [
        "love breathing",
        "respiracion amor"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "mist_breathing": {
      "aliases": [
        "mist breathing",
        "respiracion niebla"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 4
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "insect_breathing": {
      "aliases": [
        "insect breathing",
        "respiracion insecto"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 7,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "stone_breathing": {
      "aliases": [
        "stone breathing",
        "respiracion piedra"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "flame_breathing": {
      "aliases": [
        "flame breathing",
        "respiracion fuego"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 4
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "thunder_breathing": {
      "aliases": [
        "thunder breathing",
        "respiracion trueno"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 12,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "hxh": {
    "nen_awakened": {
      "aliases": [
        "nen despertado",
        "awakened nen",
        "ren activado",
        "nen awakened"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 1.5,
        "durability": 1.5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "adult_form": {
      "aliases": [
        "forma adulta",
        "adult form",
        "adult gon",
        "gon adulto"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "godspeed_kanmuru": {
      "aliases": [
        "modo godspeed",
        "kanmuru",
        "godspeed kanmuru",
        "godspeed",
        "godspeed kanmuru activado"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "double_face": {
      "aliases": [
        "modo double face",
        "double face",
        "book of face active",
        "double face marcador de libro"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 2,
        "durability": 2
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "post_mortem_nen": {
      "aliases": [
        "post-mortem nen",
        "hisoka postmortem",
        "nen post mortal",
        "hisoka renovado post-mortal"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "netero_100_hands": {
      "aliases": [
        "netero 100 type bodhisattva",
        "guanyin 100 tipos",
        "netero pico",
        "bodhisattva 100 hands"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "centaur_form": {
      "aliases": [
        "forma centauro",
        "centauro",
        "youpi centaur mode",
        "ira dominada"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "infant_form": {
      "aliases": [
        "forma infante",
        "infant form",
        "biscuit disfraz"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 1
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "true_form_biscuit": {
      "aliases": [
        "biscuit forma verdadera",
        "true form biscuit"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "auto_pilot": {
      "aliases": [
        "piloto automatico",
        "auto pilot",
        "shalnark auto mode"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "stealth_grenade": {
      "aliases": [
        "palm modo oculto",
        "palm stealth",
        "stealth mode"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 4
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "zoldyck_disguise": {
      "aliases": [
        "gittarackur disfraz",
        "zoldyck disguise",
        "illumi disguise"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 2
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "controlled_centaur": {
      "aliases": [
        "centauro controlado",
        "controlled centaur",
        "youpi controlled"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 12
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "photon_wings": {
      "aliases": [
        "alas de fotones",
        "photon wings",
        "meruem alas de luz",
        "meruem post-rosa"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "emperor_time": {
      "aliases": [
        "emperor time",
        "kurapika emperor time",
        "ojos escarlata al 100%"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "invincible": {
    "thraxa_hero": {
      "aliases": [
        "heroe de la tierra omniman",
        "omniman thraxa",
        "nolan grayson viltrumite"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "viltrumite_empire": {
      "aliases": [
        "emperador viltrum omniman",
        "viltrumite emperor",
        "omniman imperio"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "mark_classic": {
      "aliases": [
        "invincible traje amarillo azul",
        "mark classic suit",
        "invincible yellow blue"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "mark_dark": {
      "aliases": [
        "mark traje azul negro",
        "invincible dark suit",
        "mark black blue"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "mark_emperor_500": {
      "aliases": [
        "emperador mark 500 anos",
        "mark emperor 500 years",
        "mark 500 year form"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "thragg_regent": {
      "aliases": [
        "gran regente thragg",
        "thragg regent",
        "thragg full power"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "battle_beast": {
      "aliases": [
        "battle beast",
        "thokk"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 20
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "conquest": {
      "aliases": [
        "conquest",
        "conquest full power"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "atom_eve": {
      "aliases": [
        "atom eve",
        "samantha eve wilkins"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 8,
        "haxReliability": 0.5
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "the-boys": {
    "homelander": {
      "aliases": [
        "homelander",
        "homelander laser eyes",
        "homelander full power"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "butcher_temp_v": {
      "aliases": [
        "butcher temp-v laser rays",
        "butcher temp v"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 3
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "butcher_tumor": {
      "aliases": [
        "butcher tumor viviente kessler",
        "butcher living tumor"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "soldier_boy": {
      "aliases": [
        "soldier boy",
        "benjamin",
        "soldier boy radioactive"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 3,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "a_train": {
      "aliases": [
        "a-train",
        "reggie franklin"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 15,
        "durability": 2
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "queen_maeve": {
      "aliases": [
        "queen maeve",
        "maggie shaw"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 4,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "shuumatsu": {
    "adam_overload": {
      "aliases": [
        "adam ojos del senor sobrecarga maxima",
        "adam max overload",
        "adam eyes"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "adam_post_mortem": {
      "aliases": [
        "adam voluntad paternal inmortal post-mortal",
        "adam immortal will"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 12,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "zeus_adamas": {
      "aliases": [
        "zeus forma adamas",
        "adamas form",
        "zeus diamond"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 20,
        "timeStopDuration": 12
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "kojiro_manju": {
      "aliases": [
        "kojiro despertar manju musou",
        "kojiro twin sword",
        "sword of hate"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 15,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "poseidon_dome": {
      "aliases": [
        "poseidon diluvio 40 dias",
        "poseidon dome",
        "40 day flood"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "buddha_nirvana": {
      "aliases": [
        "buda nirvana cero",
        "buddha zero",
        "buddha enlightenment"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10,
        "haxReliability": 0.5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "beelzebub_chaos": {
      "aliases": [
        "beelzebub liberacion prohibida caos",
        "beelzebub chaos",
        "chaos unleashed"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 8,
        "haxReliability": 0.6
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "tesla_prison": {
      "aliases": [
        "tesla prision de los dioses",
        "tesla gematria zone",
        "tesla prison gods"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 10,
        "haxReliability": 0.7
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "qin_goujian": {
      "aliases": [
        "qin shi huang espada goujian",
        "qin sword awakening"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 8
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "hades_desmos": {
      "aliases": [
        "hades despertar ichor desmos",
        "hades spear of midnight",
        "hades full power"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 6,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "shiva_tandava": {
      "aliases": [
        "shiva tandava karma fuego creacion destruccion",
        "shiva tandava"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 15
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "heracles_cerberus": {
      "aliases": [
        "heracles modo cerbero",
        "heracles cerberus mode"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 5,
        "durability": 20
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "zerofuku_hajun": {
      "aliases": [
        "zerofuku rey demonio sexto cielo",
        "hajun demon child"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 8,
        "haxReliability": 0.5
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "raiden_seal": {
      "aliases": [
        "raiden cien sellos liberados",
        "raiden 100 seals",
        "raiden yata"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "qin_unmasked": {
      "aliases": [
        "qin emperador sin venda",
        "qin unmasked",
        "qin true form"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 10,
        "durability": 10
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "okita_final": {
      "aliases": [
        "okita nino demonio",
        "okita final form"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 8,
        "durability": 5
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "apextech": {
    "nexus_human": {
      "aliases": [
        "josh forma humana nexo",
        "josh human nexus",
        "nexus form"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 1,
        "durability": 1
      },
      "availability": "verified",
      "requiresExplicitData": true
    },
    "nexus_overload": {
      "aliases": [
        "josh nexo multiversal sobrecarga",
        "josh nexo overload",
        "nexus overload"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 20,
        "durability": 20,
        "haxReliability": 0.3
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },
  "spyxfamily": {
    "anya_telepathy": {
      "aliases": [
        "anya telepatia",
        "anyas telepathy",
        "anyas latent telepathy"
      ],
      "apexKiMultiplier": null,
      "sourceKiMultiplier": null,
      "statModifiers": {
        "speed": 1.2,
        "durability": 1,
        "haxReliability": 0.4
      },
      "availability": "verified",
      "requiresExplicitData": true
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // APEX v1.0 — Nuevas secciones de universos y aliases huérfanos
  // Añadidas para resolver personajes/formas que caían en "unresolved".
  // Filosofía: formas externas se RECONOCEN pero NO se les inventa
  // multiplicador a menos que haya dato canónico verificable.
  // ─────────────────────────────────────────────────────────────────────────

  "hxh": {
    "meruem_post_rose": {
      "aliases": ["post rosa", "meruem post rosa", "alas de fotones", "photon wings"],
      "apexKiMultiplier": 6.31,
      "statModifiers": { "speed": 1.4, "durability": 1.2 },
      "availability": "derived"
    },
    "godspeed": {
      "aliases": ["godspeed", "kanmuru", "modo godspeed"],
      "apexKiMultiplier": 19.95,
      "statModifiers": { "speed": 4, "durability": 0.8 },
      "availability": "derived"
    },
    "gittarackur": {
      "aliases": ["gittarackur", "disfraz de gittarackur", "illumi gittarackur"],
      "apexKiMultiplier": 2,
      "statModifiers": { "speed": 1.3, "haxReliability": 0.6 },
      "availability": "derived"
    },
    "post_mortem_nen": {
      "aliases": ["post mortem nen", "hisoka renacido", "post mortem hisoka"],
      "apexKiMultiplier": 19.95,
      "statModifiers": { "durability": 0.6, "haxReliability": 0.5 },
      "availability": "derived"
    }
  },

  "jojos": {
    "the_world_timestop": {
      "aliases": ["the world", "star platinum the world", "parada temporal", "timestop"],
      "apexKiMultiplier": 100,
      "statModifiers": { "speed": 50, "haxReliability": 0.95 },
      "availability": "verified"
    },
    "gold_experience_requiem": {
      "aliases": ["ger", "gold experience requiem", "requiem"],
      "apexKiMultiplier": 500,
      "statModifiers": { "haxReliability": 1.0 },
      "availability": "verified"
    },
    "made_in_heaven": {
      "aliases": ["made in heaven", "mih"],
      "apexKiMultiplier": 800,
      "statModifiers": { "speed": 100, "haxReliability": 0.9 },
      "availability": "verified"
    },
    "d4c_love_train": {
      "aliases": ["d4c love train", "love train", "funny valentine"],
      "apexKiMultiplier": 200,
      "statModifiers": { "haxReliability": 0.85 },
      "availability": "verified"
    },
    "bites_the_dust": {
      "aliases": ["bites the dust", "btd", "killer queen bites the dust"],
      "apexKiMultiplier": 150,
      "statModifiers": { "haxReliability": 0.9 },
      "availability": "verified"
    },
    "d4c": {
      "aliases": ["d4c", "dirty deeds done dirt cheap"],
      "apexKiMultiplier": 50,
      "statModifiers": { "haxReliability": 0.7 },
      "availability": "verified"
    }
  },

  "kimetsu": {
    "sun_breathing_form_13": {
      "aliases": ["decimotercera forma", "thirteenth form", "decimotercera forma solar", "forma 13 solar"],
      "apexKiMultiplier": 2,
      "statModifiers": { "speed": 1.5, "durability": 1.2 },
      "availability": "derived"
    },
    "muzan_combat_final": {
      "aliases": ["forma de combate final", "combat final", "forma combate final muzan"],
      "apexKiMultiplier": 5,
      "statModifiers": { "speed": 1.3, "durability": 1.5 },
      "availability": "derived"
    },
    "kokushibo_monster": {
      "aliases": ["kokushibo monstruo", "monstruo kokushibo", "kokushibo superado", "monster form kokushibo"],
      "apexKiMultiplier": 4,
      "statModifiers": { "durability": 1.4, "haxReliability": 0.5 },
      "availability": "derived"
    }
  },

  "chainsaw": {
    "pochita_hero_of_hell": {
      "aliases": ["pochita verdadero", "hero of hell", "heroe del infierno", "pochita hero"],
      "apexKiMultiplier": 8,
      "statModifiers": { "durability": 2, "haxReliability": 0.6 },
      "availability": "derived"
    },
    "chainsaw_hybrid": {
      "aliases": ["hibrido motosierra", "chainsaw hybrid", "denji motosierra"],
      "apexKiMultiplier": 2.5,
      "statModifiers": { "durability": 1.5, "speed": 1.2 },
      "availability": "derived"
    }
  },

  "opm": {
    "garou_cosmic_fear": {
      "aliases": ["modo miedo cosmico", "fear mode", "garou cosmico miedo", "god赋予"],
      "apexKiMultiplier": 20,
      "statModifiers": { "durability": 2, "haxReliability": 0.4 },
      "availability": "derived"
    },
    "garou_mode_saitama": {
      "aliases": ["modo saitama", "saitama copy", "garou saitama copy"],
      "apexKiMultiplier": 40,
      "statModifiers": { "speed": 3, "durability": 3 },
      "availability": "derived"
    },
    "garou_half_monster": {
      "aliases": ["half monster garou", "garou semi monstruo", "garou medio monstruo"],
      "apexKiMultiplier": 19.95,
      "statModifiers": { "durability": 1.5, "speed": 1.3 },
      "availability": "derived"
    },
    "meteoric_burst": {
      "aliases": ["meteoric burst", "estallido meteorico", "modo estallido meteorico"],
      "apexKiMultiplier": 10,
      "statModifiers": { "speed": 2, "durability": 0.8 },
      "availability": "verified"
    },
    "serious_mode": {
      "aliases": ["serious mode", "modo serio", "serious punch", "golpe serio"],
      "apexKiMultiplier": 100,
      "statModifiers": { "speed": 5, "durability": 5 },
      "availability": "verified"
    }
  },

  "jjk": {
    "sukuna_heian_form": {
      "aliases": ["forma original heian", "heian era", "heian form", "sukuna heian", "cuatro brazos"],
      "apexKiMultiplier": 3,
      "statModifiers": { "speed": 1.4, "haxReliability": 0.5 },
      "availability": "derived"
    },
    "sukuna_world_cutting_slash": {
      "aliases": ["world cutting slash", "corte mundial", "corte que divide el mundo"],
      "apexKiMultiplier": 5,
      "statModifiers": { "haxReliability": 0.7 },
      "availability": "derived"
    },
    "gojo_six_eyes_unsealed": {
      "aliases": ["seis ojos desatados", "unsealed six eyes", "gojo sin venda"],
      "apexKiMultiplier": 1.5,
      "statModifiers": { "speed": 1.3, "haxReliability": 0.5 },
      "availability": "derived"
    },
    "gojo_purple_unlimited": {
      "aliases": ["purple ilimitado", "hollow purple", "purple 200", "purple 200%"],
      "apexKiMultiplier": 4,
      "statModifiers": { "haxReliability": 0.8 },
      "availability": "derived"
    },
    "toji_heavenly_restriction": {
      "aliases": ["restriccion celestial", "toji fushiguro", "heavenly restriction"],
      "apexKiMultiplier": 2,
      "statModifiers": { "speed": 1.5, "durability": 0.7 },
      "availability": "derived"
    },
    "mahoraga_adapt": {
      "aliases": ["mahoraga", "eight handled sword", "ocho manos", "adaptacion mahoraga"],
      "apexKiMultiplier": 4,
      "statModifiers": { "durability": 1.5, "haxReliability": 0.6 },
      "availability": "derived"
    },
    "rika_manifested_100": {
      "aliases": ["rika manifestada", "rika 100", "rika al 100", "full rika", "rika 100%"],
      "apexKiMultiplier": 3,
      "statModifiers": { "haxReliability": 0.5 },
      "availability": "derived"
    },
    "domain_expansion_mutual_love": {
      "aliases": ["amor mutuo autentico", "mutual love", "domain expansion mutual love"],
      "apexKiMultiplier": 2,
      "statModifiers": { "haxReliability": 0.7 },
      "availability": "derived"
    }
  },

  "shuumatsu": {
    "poseidon_true_form": {
      "aliases": ["poseidon verdadero", "trident true form", "poseidon base"],
      "apexKiMultiplier": 1,
      "statModifiers": { "speed": 1.5 },
      "availability": "verified"
    },
    "sasaki_enveiled_in_ash": {
      "aliases": ["sasaki enveiled", "sasaki ash", "sasaki en ceniza"],
      "apexKiMultiplier": 1.5,
      "statModifiers": { "haxReliability": 0.6 },
      "availability": "derived"
    }
  },

  "invincible": {
    "viltrumite_emperor": {
      "aliases": ["viltrumite peak", "viltrumita pico", "viltrum emperor"],
      "apexKiMultiplier": 10,
      "statModifiers": { "speed": 2, "durability": 2 },
      "availability": "derived"
    },
    "thragg_full_power": {
      "aliases": ["thragg poder completo", "thragg unleashed", "grand regent thragg pico"],
      "apexKiMultiplier": 50,
      "statModifiers": { "speed": 1.5, "durability": 1.5 },
      "availability": "derived"
    }
  },

  "the-boys": {
    "homelander_full_power": {
      "aliases": ["homelander laser", "full power homelander"],
      "apexKiMultiplier": 5,
      "statModifiers": { "durability": 1.5, "haxReliability": 0.3 },
      "availability": "derived"
    },
    "temp_v_hax": {
      "aliases": ["temp v", "temp v explosivo", "temp v powers"],
      "apexKiMultiplier": 10,
      "statModifiers": { "durability": 1.5 },
      "availability": "derived"
    }
  },

  "spyxfamily": {
    "twilight_full_kit": {
      "aliases": ["twilight equipo completo", "loid full kit", "twilight arsenal completo"],
      "apexKiMultiplier": 2,
      "statModifiers": { "haxReliability": 0.4 },
      "availability": "derived"
    },
    "thorn_princess_full": {
      "aliases": ["thorn princess completa", "yor thorn princess", "yor combat"],
      "apexKiMultiplier": 1.8,
      "statModifiers": { "speed": 1.2 },
      "availability": "derived"
    }
  },

  "apextech": {
    "apex_default": {
      "aliases": ["apex base", "default state"],
      "apexKiMultiplier": 1,
      "statModifiers": {},
      "availability": "verified"
    }
  },

  // Aliases adicionales de Dragon Ball para formas huérfanas canónicas
  "dragon-ball": {
    "ultra_instinto": {
      "aliases": ["ultra instinto", "ultra instinct", "migatte no gokui", "ui completo", "ultra instinto completo"],
      "apexKiMultiplier": 100000,
      "statModifiers": { "speed": 50, "durability": 30 },
      "availability": "verified"
    },
    "ultra_instinto_sign": {
      "aliases": ["ultra instinto sign", "ui sign", "omen"],
      "apexKiMultiplier": 50000,
      "statModifiers": { "speed": 25, "durability": 15 },
      "availability": "verified"
    },
    "towa_darkness": {
      "aliases": ["towa oscuridad", "towa dark", "dokawa"],
      "apexKiMultiplier": 8,
      "statModifiers": { "haxReliability": 0.5 },
      "availability": "verified"
    },
    "majin_vegeta": {
      "aliases": ["majin vegeta", "vegeta majin", "marca majin", "majin mark"],
      "apexKiMultiplier": 1.5,
      "statModifiers": { "speed": 1.1, "durability": 1.1 },
      "availability": "verified"
    },
    "super_maximum_light_speed": {
      "aliases": ["super maximum light speed", "speed mode dyspo", "modo velocidad maxima", "max light speed dyspo"],
      "apexKiMultiplier": 4,
      "statModifiers": { "speed": 5 },
      "availability": "derived"
    },
    "jiren_full_power": {
      "aliases": ["jiren full power", "jiren poder completo", "jiren unleashed", "poder oculto jiren"],
      "apexKiMultiplier": 10,
      "statModifiers": { "speed": 3, "durability": 3 },
      "availability": "derived"
    },
    "mecha_freezer": {
      "aliases": ["mecha freezer", "mecha frieza", "freezer mecanico", "freezer cyborg"],
      "apexKiMultiplier": 2,
      "statModifiers": { "durability": 3 },
      "availability": "verified"
    },
    "guanyin_100_arms": {
      "aliases": ["guanyin 100 brazos", "100 arms", "100 manos", "hyakushiki kannon", "bodhisattva 100"],
      "apexKiMultiplier": 2,
      "statModifiers": { "speed": 2 },
      "availability": "verified"
    },
    "netero_poor_rose_bomb": {
      "aliases": ["poor rose bomb", "bomba rosa pobre", "rosa pobre"],
      "apexKiMultiplier": 100,
      "statModifiers": { "haxReliability": 0.5 },
      "availability": "verified"
    }
  }
};

export default FORM_SCALING_CONFIG;
