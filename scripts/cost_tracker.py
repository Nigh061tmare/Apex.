#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
APEX & OpenCode Ultra-Fast Cost & Token Tracker
Monitoriza en tiempo real costos y tokens en:
- 30 minutos
- 1 hora
- 3 horas
- 24 horas (Hoy)
- Total de todas las sesiones
"""
import urllib.request
import urllib.parse
import json
import time
import sys
import os
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = 4096
BASE_URL = f"http://localhost:{PORT}"

def fetch_json(url_path):
    try:
        req = urllib.request.Request(f"{BASE_URL}{url_path}", headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=4) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None

def main():
    print("\n" + "=" * 74)
    print("      📊 MONITOR DE CONSUMO Y COSTOS DE IA (DEEPSEEK / OPENCODE)")
    print("=" * 74)

    projects = fetch_json("/project")
    if not projects:
        print(f"[-] No se pudo conectar a OpenCode en {BASE_URL}.")
        print("    Asegurate de que OpenCode Web este iniciado en el puerto 4096.")
        sys.exit(1)

    now_ms = time.time() * 1000
    now_dt = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    # 1. Recolectar todas las sesiones
    all_sessions_dict = {}
    for p in projects:
        wt = p.get("worktree", "")
        if wt:
            enc_wt = urllib.parse.quote(wt)
            s_list = fetch_json(f"/session?directory={enc_wt}") or []
            for s in s_list:
                all_sessions_dict[s["id"]] = s

    root_s = fetch_json("/session") or []
    for s in root_s:
        all_sessions_dict[s["id"]] = s

    # 2. Descargar mensajes en paralelo para maxima velocidad
    def process_session(item):
        sid, s = item
        slug = s.get("slug", sid[:12])
        msgs = fetch_json(f"/session/{sid}/message") or []
        if not msgs:
            return None
        
        s_cost = 0.0
        s_tokens = 0
        s_last_time = 0
        extracted_msgs = []

        for m in msgs:
            info = m.get("info", {})
            t_created = info.get("time", {}).get("created", 0)
            if t_created > s_last_time:
                s_last_time = t_created
            cost = info.get("cost", 0) or 0
            tokens = info.get("tokens", {}) or {}
            
            s_cost += cost
            s_tokens += tokens.get("total", 0)

            extracted_msgs.append({
                "time": t_created,
                "cost": cost,
                "tokens": tokens,
                "session": slug
            })

        return {
            "slug": slug,
            "id": sid,
            "cost": s_cost,
            "tokens": s_tokens,
            "last_time": s_last_time,
            "msg_count": len(msgs),
            "messages": extracted_msgs
        }

    with ThreadPoolExecutor(max_workers=14) as executor:
        results = list(executor.map(process_session, all_sessions_dict.items()))

    all_messages = []
    active_sessions = []
    grand_total_cost = 0.0
    grand_total_tokens = 0

    for r in results:
        if not r:
            continue
        grand_total_cost += r["cost"]
        grand_total_tokens += r["tokens"]
        all_messages.extend(r["messages"])
        if r["last_time"] >= (now_ms - 24 * 3600 * 1000) or r["cost"] > 0.001:
            active_sessions.append(r)

    print(f" 🕒 Hora: {now_dt} | Proyectos: {len(projects)} | Sesiones activas: {len(active_sessions)}\n")

    def get_window_stats(minutes):
        since_ms = now_ms - (minutes * 60 * 1000)
        cost = 0.0
        tot_tok = 0
        in_tok = 0
        out_tok = 0
        rs_tok = 0
        count = 0
        for m in all_messages:
            if m["time"] >= since_ms:
                cost += m["cost"]
                t = m["tokens"]
                tot_tok += t.get("total", 0)
                in_tok += t.get("input", 0)
                out_tok += t.get("output", 0)
                rs_tok += t.get("reasoning", 0)
                if m["cost"] > 0 or t:
                    count += 1
        return cost, tot_tok, in_tok, out_tok, rs_tok, count

    c30, t30, i30, o30, r30, n30 = get_window_stats(30)
    c60, t60, i60, o60, r60, n60 = get_window_stats(60)
    c180, t180, i180, o180, r180, n180 = get_window_stats(180)
    c24h, t24h, i24h, o24h, r24h, n24h = get_window_stats(24 * 60)

    print(" ⏱️  CONSUMO POR VENTANAS DE TIEMPO:")
    print(" -------------------------------------------------------------------------")
    print(f" {'Periodo':<23} | {'Costo (USD)':<11} | {'Tokens Totales':<16} | {'Msgs IA':<8}")
    print(" -------------------------------------------------------------------------")
    print(f" {'Ultimos 30 minutos':<23} | ${c30:>9.4f}  | {t30:>16,} | {n30:>8}")
    print(f" {'Ultima 1 hora':<23} | ${c60:>9.4f}  | {t60:>16,} | {n60:>8}")
    print(f" {'Ultimas 3 horas':<23} | ${c180:>9.4f}  | {t180:>16,} | {n180:>8}")
    print(f" {'Todo el dia (24h)':<23} | ${c24h:>9.4f}  | {t24h:>16,} | {n24h:>8}")
    print(" -------------------------------------------------------------------------")

    print("\n 🔍 DETALLE DE TOKENS PROCESADOS HOY (ULTIMAS 24H):")
    print(f"   * Tokens de Entrada (Input):       {i24h:>14,}")
    print(f"   * Tokens de Salida (Output):       {o24h:>14,}")
    print(f"   * Tokens de Razonamiento (CoT):    {r24h:>14,}")
    print(f"   * Total Tokens de Hoy:             {t24h:>14,}")

    print("\n 📂 SESIONES ACTIVAS RECIENTES (ORDENADAS POR ULTIMA ACTIVIDAD):")
    active_sessions.sort(key=lambda x: x["last_time"], reverse=True)
    for s in active_sessions[:10]:
        ago_min = max(0, int((now_ms - s["last_time"]) / 60000))
        ago_str = f"hace {ago_min}m" if ago_min < 120 else f"hace {ago_min//60}h"
        print(f"   * {s['slug']:<18} | ${s['cost']:>7.4f} USD | {s['tokens']:>11,} tok | {ago_str:<10} | {s['msg_count']} msgs")

    print(" -------------------------------------------------------------------------")
    print(f" TOTAL HISTORICO ACUMULADO (TODAS LAS SESIONES): ${grand_total_cost:.4f} USD ({grand_total_tokens:,} tokens)")
    print("=" * 74 + "\n")

    # Generar Dashboard HTML interactivo auto-refrescable
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APEX & OpenCode - Monitor de Costos y Tokens</title>
    <meta http-equiv="refresh" content="15">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'JetBrains Mono', monospace; background-color: #080c14; color: #e2e8f0; }}
        .cinzel {{ font-family: 'Cinzel', serif; }}
        .card-glow {{ box-shadow: 0 0 25px rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); }}
    </style>
</head>
<body class="p-6 md:p-10 max-w-6xl mx-auto">
    <header class="flex flex-wrap items-center justify-between pb-6 border-b border-cyan-500/30 gap-4 mb-8">
        <div>
            <h1 class="text-2xl font-black cinzel tracking-wider text-cyan-400 flex items-center gap-3">
                <span>⚡ APEX & OpenCode Cost Monitor</span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">Monitor en vivo de consumo de Tokens, Costos en USD y llamadas a DeepSeek.</p>
        </div>
        <div class="text-right">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Actualizado: {now_dt}</span>
            </div>
            <p class="text-[10px] text-slate-500 mt-1">Auto-refresca cada 15 segundos</p>
        </div>
    </header>

    <!-- Cards de Ventanas Temporales -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="p-5 rounded-2xl bg-slate-900/80 card-glow">
            <div class="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1">Últimos 30 Minutos</div>
            <div class="text-3xl font-extrabold text-white">${c30:.4f} <span class="text-xs text-slate-400 font-normal">USD</span></div>
            <div class="text-xs text-slate-400 mt-2 flex justify-between">
                <span>Tokens:</span>
                <span class="text-cyan-300 font-bold">{t30:,}</span>
            </div>
            <div class="text-xs text-slate-400 flex justify-between">
                <span>Mensajes:</span>
                <span class="text-slate-300">{n30}</span>
            </div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-900/80 card-glow border-indigo-500/30 shadow-indigo-950/40">
            <div class="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Última 1 Hora</div>
            <div class="text-3xl font-extrabold text-white">${c60:.4f} <span class="text-xs text-slate-400 font-normal">USD</span></div>
            <div class="text-xs text-slate-400 mt-2 flex justify-between">
                <span>Tokens:</span>
                <span class="text-indigo-300 font-bold">{t60:,}</span>
            </div>
            <div class="text-xs text-slate-400 flex justify-between">
                <span>Mensajes:</span>
                <span class="text-slate-300">{n60}</span>
            </div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-900/80 card-glow border-purple-500/30 shadow-purple-950/40">
            <div class="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Últimas 3 Horas</div>
            <div class="text-3xl font-extrabold text-white">${c180:.4f} <span class="text-xs text-slate-400 font-normal">USD</span></div>
            <div class="text-xs text-slate-400 mt-2 flex justify-between">
                <span>Tokens:</span>
                <span class="text-purple-300 font-bold">{t180:,}</span>
            </div>
            <div class="text-xs text-slate-400 flex justify-between">
                <span>Mensajes:</span>
                <span class="text-slate-300">{n180}</span>
            </div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-900/80 card-glow border-amber-500/30 shadow-amber-950/40">
            <div class="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">Todo el Día (24h)</div>
            <div class="text-3xl font-extrabold text-amber-300">${c24h:.4f} <span class="text-xs text-slate-400 font-normal">USD</span></div>
            <div class="text-xs text-slate-400 mt-2 flex justify-between">
                <span>Tokens:</span>
                <span class="text-amber-200 font-bold">{t24h:,}</span>
            </div>
            <div class="text-xs text-slate-400 flex justify-between">
                <span>Mensajes:</span>
                <span class="text-slate-300">{n24h}</span>
            </div>
        </div>
    </div>

    <!-- Desglose de Tokens de Hoy -->
    <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 mb-8">
        <h2 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🔬 Desglose de Tokens Procesados Hoy (24 Horas)</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <div class="text-xs text-slate-400 mb-1">Tokens de Entrada (Input)</div>
                <div class="text-xl font-bold text-cyan-400">{i24h:,}</div>
            </div>
            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <div class="text-xs text-slate-400 mb-1">Tokens de Salida (Output)</div>
                <div class="text-xl font-bold text-emerald-400">{o24h:,}</div>
            </div>
            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <div class="text-xs text-slate-400 mb-1">Razonamiento Interno (CoT)</div>
                <div class="text-xl font-bold text-purple-400">{r24h:,}</div>
            </div>
        </div>
    </div>

    <!-- Tabla de Sesiones Activas -->
    <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold text-slate-300 uppercase tracking-wider">
                📂 Sesiones Recientes con Actividad
            </h2>
            <div class="text-xs text-slate-400 font-bold">
                Total Histórico Acumulado: <span class="text-emerald-400">${grand_total_cost:.4f} USD</span>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead>
                    <tr class="border-b border-slate-800 text-slate-400">
                        <th class="pb-3 font-semibold">Sesión (Slug)</th>
                        <th class="pb-3 font-semibold">Última Actividad</th>
                        <th class="pb-3 font-semibold text-right">Tokens</th>
                        <th class="pb-3 font-semibold text-right">Mensajes</th>
                        <th class="pb-3 font-semibold text-right">Costo (USD)</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/50">
    """

    for s in active_sessions[:12]:
        ago_min = max(0, int((now_ms - s["last_time"]) / 60000))
        ago_str = f"hace {ago_min}m" if ago_min < 120 else f"hace {ago_min//60}h"
        html_content += f"""
                    <tr class="hover:bg-slate-800/30 transition">
                        <td class="py-3 font-bold text-cyan-300">{s['slug']}</td>
                        <td class="py-3 text-slate-400">{ago_str}</td>
                        <td class="py-3 text-right text-slate-200 font-mono">{s['tokens']:,}</td>
                        <td class="py-3 text-right text-slate-400 font-mono">{s['msg_count']}</td>
                        <td class="py-3 text-right font-bold text-emerald-400 font-mono">${s['cost']:.4f}</td>
                    </tr>
        """

    html_content += """
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
    """

    html_path = r"Z:\apex-powerscaling-engine\MONITOR_COSTOS.html"
    try:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
    except Exception:
        pass

if __name__ == "__main__":
    main()