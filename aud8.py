import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

lines = open("src/services/simulationEngine.js", encoding="utf-8", errors="replace").readlines()
for i, ln in enumerate(lines, 1):
    if "FÍSICAS DEL CAMPO" in ln or "ESCENARIO SELECCIONADO" in ln or "II. F" in ln:
        print("%4d: %s" % (i, ln.rstrip()[:130]))
