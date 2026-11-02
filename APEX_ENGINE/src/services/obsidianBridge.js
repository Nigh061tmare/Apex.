// Obsidian Two-Way Bridge Service
export const ObsidianBridge = {
  // Format simulation as Obsidian Markdown with YAML frontmatter, Callouts, and Wikilinks
  formatForObsidian(simulationData) {
    const { mode, charA, charB, scenario, modifiers, narrative, result } = simulationData;
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const tags = ['powerscaling', 'simulacion', mode.toLowerCase().replace(/[^a-z0-9]/g, '-')];
    if (charA) tags.push(charA.universe.toLowerCase().replace(/\s+/g, '-'));
    if (charB) tags.push(charB.universe.toLowerCase().replace(/\s+/g, '-'));

    return `---
creado: ${dateStr} ${timeStr}
tipo: ${mode}
combatiente_a: "[[${charA.name}]]"
combatiente_b: "[[${charB.name}]]"
escenario: "${scenario.name}"
ganador: "${result.winner}"
dificultad: "${result.difficulty}"
tags: [${tags.join(', ')}]
---

# ⚔️ ${charA.name} vs ${charB.name} — ${mode.toUpperCase()}

> [!NOTE] Presets de Combate
> - **Lugar / Terreno:** ${scenario.name} (${scenario.desc})
> - **Modo de Operación:** ${mode}
> - **Estado Mental:** ${modifiers.bloodlust ? '🔥 Sed de Sangre (Bloodlusted - Sin Contención)' : '🛡️ In-Character (Fiel a psicología canónica)'}
> - **Tiempo de Preparación:** ${modifiers.prepTime}
> - **Condición Inicial:** ${modifiers.healthState}

---

${narrative}

---
*Generado por [[APEX ENGINE]] — Sistema Oficial de Power Scaling y Narrativa What-If.*
`;
  },

  // Direct save via backend API to Z:\Obsidian Vault\
  async saveToVault(simulationData) {
    const markdown = this.formatForObsidian(simulationData);
    const fileName = `${simulationData.charA.name} vs ${simulationData.charB.name} (${simulationData.mode}) - ${Date.now()}.md`
      .replace(/[\/\:*?"<>|]/g, '');

    try {
      const response = await fetch('/api/vault/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          content: markdown,
          subfolder: '06 - Proyectos/Obsidian + IA/Simulaciones'
        })
      });

      if (!response.ok) {
        throw new Error('Error al conectar con la API de Obsidian');
      }

      return await response.json();
    } catch (err) {
      console.warn('Backend save failed, offering direct download fallback:', err);
      // Fallback: Trigger browser download
      this.downloadMarkdown(fileName, markdown);
      return { success: true, fallbackDownload: true, path: fileName };
    }
  },

  // Fallback download for browser
  downloadMarkdown(filename, content) {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
};
