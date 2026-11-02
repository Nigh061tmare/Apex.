import React, { useState, useMemo } from 'react';
import { Globe, Search, PlusCircle, Check, X, Sparkles, Shield, Trophy, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import SearchableCharacterSelector from './SearchableCharacterSelector.jsx';

const STORAGE_VOTES = 'apex_community_votes_v1';
const STORAGE_SUBMISSIONS = 'apex_community_submissions_v1';

const COMMUNITY_CHARACTERS = [
  {
    id: 'comm-goku-ui',
    name: 'Goku (Ultra Instinto Dominado)',
    universe: 'Dragon Ball Super',
    tier: 'Tier 2-C | Multiversal Bajo',
    ap: 'Nivel Multiversal Bajo (Superó a Jiren y sacudió el Mundo de la Nada)',
    range: 'Universal a Multi-Universal',
    speed: { combat: 'MFTL+', reaction: 'Instantánea (Auto-evasión celular)', travel: 'MFTL+', attack: 'MFTL+' },
    strength: { striking: 'Multi-Universal Class', lifting: 'Incalculable' },
    durability: 'Nivel Multiversal Bajo con endurecimiento de Ki divino',
    stamina: 'Muy alta pero con retroceso crítico si el cuerpo cede al estrés divino',
    battleIQ: 'Genio Marcial Supremo (Maestro del combate instintivo)',
    weaknesses: 'Estrés anatómico por mantener la doctrina divina',
    haxTags: ['Evasión Automática', 'Anulación de Hax', 'Hakai', 'Manipulación de Ki Divino'],
    arsenal: {
      basicAttacks: 'Ráfagas de golpes a velocidad que supera la percepción divina',
      superAttacks: [{ name: 'Kamehameha Deslizado', desc: 'Disparo de energía a quemarropa surfeando sobre el ataque rival.', cost: 'Medio' }],
      ultimateAttacks: [{ name: 'Puño Plateado del Dragón Astral', desc: 'Avatar gigante de Ki plateado que pulveriza la realidad.', cost: 'Alto' }]
    },
    submittedBy: 'APEX Oficial'
  },
  {
    id: 'comm-saitama-serious',
    name: 'Saitama (Modo Serio Ilimitado)',
    universe: 'One-Punch Man',
    tier: 'Tier 3-A a 2-C | Multi-Galaxia a Universal Potencial',
    ap: 'Nivel Multi-Galáctico (Serious Punch Squared borró incontables estrellas en el vacío)',
    range: 'Planetario a Interestelar',
    speed: { combat: 'MFTL+ / Incalculable', reaction: 'MFTL+', travel: 'MFTL+', attack: 'MFTL+' },
    strength: { striking: 'Multi-Galactic Class (Estornudo de Júpiter)', lifting: 'Incalculable' },
    durability: 'Invulnerabilidad Absoluta sin daño mostrado',
    stamina: 'Infinita (Cero fatiga biológica)',
    battleIQ: 'Bajo en teoría pero instinto físico impecable',
    weaknesses: 'Aburrimiento y apatía ante la falta de rivales dignos',
    haxTags: ['Crecimiento Exponencial Infinito', 'Invulnerabilidad Absoluta', 'Manipulación Espacial (Pateó Portales)'],
    arsenal: {
      basicAttacks: 'Golpes normales consecutivos a velocidad luz',
      superAttacks: [{ name: 'Golpes Serios Consecutivos', desc: 'Descarga de impactos que colapsa dimensiones estelares.', cost: 'Cero' }],
      ultimateAttacks: [{ name: 'Serious Punch Omnidireccional', desc: 'Salto interdimensional que golpea desde todos los ángulos del espacio.', cost: 'Cero' }]
    },
    submittedBy: 'APEX Oficial'
  },
  {
    id: 'comm-gojo-satoru',
    name: 'Gojo Satoru (Seis Ojos)',
    universe: 'Jujutsu Kaisen',
    tier: 'Tier 7-A a 6-C | Nivel Ciudad / Isla',
    ap: 'Nivel Ciudad Grande (Murasaki / Púrpura Hueco pulveriza materia a nivel subatómico)',
    range: 'Cientos de metros con Técnicas Malditas',
    speed: { combat: 'Hipersónico+ a Sub-Relativista', reaction: 'Sub-Relativista (Procesamiento Seis Ojos)', travel: 'Teletransporte', attack: 'Hipersónico' },
    strength: { striking: 'Class M', lifting: 'Class 50' },
    durability: 'Nivel Ciudad con Energía Maldita (Intocable por Infinito)',
    stamina: 'Virtualmente Infinita gracias al consumo microscópico de los Seis Ojos',
    battleIQ: 'Genio Táctico y Mejor Chamán de la Era Moderna',
    weaknesses: 'Agotamiento cerebral si sobreusa su dominio; técnicas que cortan el espacio',
    haxTags: ['Infinito (Barrera de Aquiles)', 'Manipulación Espacial', 'Sobrecarga de Información (Vacío Inconmensurable)', 'Borrado Subatómico'],
    arsenal: {
      basicAttacks: 'Golpes con Destello Negro (Black Flash) imbuidos en atracción espacial Azul',
      superAttacks: [{ name: 'Rojo (Inversión) & Azul (Atracción)', desc: 'Manipulación de repulsión gravitatoria y colapso espacial.', cost: 'Bajo' }],
      ultimateAttacks: [{ name: 'Púrpura Hueco 200%', desc: 'Colisión de masa virtual que borra todo a nivel atómico en su trayectoria.', cost: 'Medio' }]
    },
    submittedBy: 'APEX Oficial'
  },
  {
    id: 'comm-sukuna-heian',
    name: 'Ryomen Sukuna (Forma Verdadera Heian)',
    universe: 'Jujutsu Kaisen',
    tier: 'Tier 6-C | Nivel Isla Pequeña',
    ap: 'Nivel Isla Pequeña con Corte que Corta el Mundo (Dismantle Espacial)',
    range: 'Varios kilómetros con Santuario Malevolente',
    speed: { combat: 'Hipersónico+ a Sub-Relativista', reaction: 'Sub-Relativista', travel: 'Hipersónico', attack: 'Instantáneo (Corte Espacial)' },
    strength: { striking: 'Class M', lifting: 'Class 100' },
    durability: 'Nivel Isla con Refuerzo Maldito & Regeneración Inversa Instantánea',
    stamina: 'Reserva Maldita colosal (El doble que Yuta Okkotsu)',
    battleIQ: 'Dios de la Hechicería Milenaria (Aprende cualquier técnica con verla una vez)',
    weaknesses: 'Arrogancia ante oponentes que considera insectos',
    haxTags: ['Corte que Corta el Espacio (World Slash)', 'Fuego Divino (Kamutoke/Fuga)', 'Regeneración Inversa', 'Anulación de Dominios'],
    arsenal: {
      basicAttacks: 'Cortes invisibles Cleave y Dismantle a velocidad hipersónica',
      superAttacks: [{ name: 'Flecha de Fuego (Kamado)', desc: 'Detonación termobárica que calcina ciudades enteras.', cost: 'Medio' }],
      ultimateAttacks: [{ name: 'World Cutting Slash (Corte Espacial)', desc: 'Corte que ignora durabilidad cortando el tejido del propio espacio.', cost: 'Alto' }]
    },
    submittedBy: 'APEX Oficial'
  },
  {
    id: 'comm-superman-ca',
    name: 'Cosmic Armor Superman (Thought Robot)',
    universe: 'DC Comics',
    tier: 'Tier 1-A | Outerversal / High Hyperversal',
    ap: 'Nivel Outerversal (Existe fuera del Multiverso en el Reino Monitor; sostiene el Multiverso en su mano)',
    range: 'Outerversal / Hiper-Dimensional',
    speed: { combat: 'Inconmensurable', reaction: 'Inconmensurable', travel: 'Inconmensurable', attack: 'Inconmensurable' },
    strength: { striking: 'Outerversal Class', lifting: 'Infinito' },
    durability: 'Nivel Outerversal (Adaptación cuántica instantánea a cualquier amenaza)',
    stamina: 'Inagotable (Alimentado por la narrativa pura)',
    battleIQ: 'Conciencia Cósmica Cuántica (Percibe la cuarta pared y la trama)',
    weaknesses: 'Ninguna conocida en combate convencional',
    haxTags: ['Adaptación Reactiva Conceptual', 'Manipulación Narrativa', 'Inmunidad de Realidad', 'Negación de Existencia'],
    arsenal: {
      basicAttacks: 'Ráfagas de energía cuántica que borran universos enteros',
      superAttacks: [{ name: 'Visión Térmica Hiperdimensional', desc: 'Rayo conceptual que calcina realidades.', cost: 'Cero' }],
      ultimateAttacks: [{ name: 'Puño de la Victoria de la Trama', desc: 'Golpe conceptual garantizado a triunfar sobre cualquier mal cósmico.', cost: 'Cero' }]
    },
    submittedBy: 'APEX Oficial'
  }
];

// Carga votos locales { charId: { up: bool, down: bool } }
function loadVotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_VOTES) || '{}'); } catch { return {}; }
}
function loadSubmissions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_SUBMISSIONS) || '[]'); } catch { return []; }
}

export default function CommunityVaultModal({ isOpen, onClose, onImportCharacter, allCharacters = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniverse, setSelectedUniverse] = useState('ALL');
  const [importedIds, setImportedIds] = useState([]);
  const [votes, setVotes] = useState(loadVotes);
  const [submissions, setSubmissions] = useState(loadSubmissions);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Hooks siempre antes del return condicional (regla de React)
  const allCommunity = useMemo(() => [...COMMUNITY_CHARACTERS, ...submissions], [submissions, refresh]);

  const voteTotals = useMemo(() => {
    const totals = {};
    for (const c of allCommunity) {
      const v = votes[c.id] || {};
      totals[c.id] = (v.up ? 1 : 0) - (v.down ? 1 : 0);
    }
    return totals;
  }, [votes, allCommunity]);

  if (!isOpen) return null;

  const universes = ['ALL', ...Array.from(new Set(allCommunity.map(c => c.universe)))];
  const sorted = [...allCommunity].sort((a, b) => (voteTotals[b.id] || 0) - (voteTotals[a.id] || 0));

  const filtered = sorted.filter(c => {
    const matchSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.universe || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchUniv = selectedUniverse === 'ALL' || c.universe === selectedUniverse;
    return matchSearch && matchUniv;
  });

  const handleAdd = (char) => {
    if (onImportCharacter) {
      onImportCharacter(char);
      setImportedIds(prev => [...prev, char.id]);
    }
  };

  const handleVote = (charId, dir) => {
    setVotes(prev => {
      const next = { ...prev, [charId]: { ...(prev[charId] || {}), [dir]: !(prev[charId]?.[dir]) } };
      try { localStorage.setItem(STORAGE_VOTES, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleSubmit = () => {
    const char = allCharacters.find(c => c.id === selectedCharId);
    if (!char) return;
    const entry = {
      id: `comm-user-${char.id}`,
      name: char.name,
      universe: char.universe || 'Multiverso',
      tier: `${char.tier || char.baseTier || '?'} | Comunidad`,
      ap: char.ap || `Nivel ${char.tier || '?'}`,
      range: char.range || 'Variable',
      speed: char.speed || { combat: 'Variable' },
      strength: char.strength || 'Variable',
      durability: char.durability || `Nivel ${char.tier || '?'}`,
      stamina: char.stamina || 'Media',
      battleIQ: char.battleIQ || 'Estándar',
      weaknesses: Array.isArray(char.weaknesses) ? char.weaknesses.map(w => w.name || w).join('; ') : (char.weaknesses || 'Ninguna conocida'),
      haxTags: char.haxTags || [],
      arsenal: char.arsenal || {},
      submittedBy: 'Comunidad APEX',
      avatar: char.avatar || null
    };
    setSubmissions(prev => {
      const next = [entry, ...prev].slice(0, 30);
      try { localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(next)); } catch {}
      return next;
    });
    setSubmitOpen(false);
    setSelectedCharId('');
    setRefresh(r => r + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-700/80 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] font-mono text-xs animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase font-cinzel tracking-wider">
              Galería Comunitaria de Fichas <span className="text-emerald-400">({allCommunity.length} fichas)</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubmitOpen(!submitOpen)}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar mi Ficha
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Submit panel */}
        {submitOpen && (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/40 space-y-2">
            <p className="text-[11px] text-emerald-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Envía un personaje de tu bóveda a la comunidad (se guarda en tu dispositivo):
            </p>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <SearchableCharacterSelector
                  characters={allCharacters}
                  value={selectedCharId}
                  onChange={(c) => setSelectedCharId(c?.id || '')}
                  color="emerald"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!selectedCharId}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-40 shrink-0"
              >
                ➕ Publicar
              </button>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              name="busqueda_comunidad"
              aria-label="Buscar en la comunidad"
              placeholder="Buscar personaje o universo (ej. Goku, Gojo, Superman)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 p-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {universes.map(u => (
              <button
                key={u}
                onClick={() => setSelectedUniverse(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedUniverse === u ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto flex-1 pr-1">
          {filtered.map(char => {
            const isAdded = importedIds.includes(char.id);
            const v = votes[char.id] || {};
            const net = voteTotals[char.id] || 0;
            const isCommunity = char.submittedBy && char.submittedBy !== 'APEX Oficial';
            return (
              <div key={char.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition space-y-2 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {char.avatar && (
                      <img src={char.avatar} alt="" className="w-10 h-10 rounded-lg object-contain bg-slate-950 border border-slate-800 shrink-0" onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs truncate">{char.name}</h4>
                      <span className="text-[10px] text-slate-400 block truncate">{char.universe}</span>
                      {isCommunity && <span className="text-[9px] text-emerald-400">👥 Enviada por la comunidad</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800 font-bold">
                      {char.tier?.split('|')[0]?.trim()}
                    </span>
                    {/* Votos */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleVote(char.id, 'up')}
                        className={`p-1 rounded ${v.up ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-emerald-300'} cursor-pointer transition`}
                        aria-label={`Votar a favor de ${char.name}`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <span className={`text-[10px] font-bold ${net > 0 ? 'text-emerald-400' : net < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        {net > 0 ? `+${net}` : net}
                      </span>
                      <button
                        onClick={() => handleVote(char.id, 'down')}
                        className={`p-1 rounded ${v.down ? 'bg-red-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-red-300'} cursor-pointer transition`}
                        aria-label={`Votar en contra de ${char.name}`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2"><span className="text-amber-400 font-bold">AP:</span> {char.ap}</p>
                <div className="flex flex-wrap gap-1">
                  {(char.haxTags || []).slice(0, 3).map((h, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800">
                      ✨ {h}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[9px] text-slate-600">por {char.submittedBy || 'APEX'}</span>
                  <button
                    disabled={isAdded}
                    onClick={() => handleAdd(char)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isAdded 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                    }`}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                    <span>{isAdded ? 'Añadido' : '➕ Añadir a mi Bóveda'}</span>
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-500 text-sm">
              <p className="text-3xl mb-2">🕳️</p>
              <p>No hay fichas que coincidan.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[9px] text-slate-600 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" /> Los votos y envíos se guardan en tu dispositivo (sincronización global próximamente)
          </span>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer">
            Cerrar Galería
          </button>
        </div>
      </div>
    </div>
  );
}