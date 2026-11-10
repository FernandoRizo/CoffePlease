"""Vuelve a empaquetar src/game.js y src/physics.js dentro del HTML autónomo del juego.
Uso desde la carpeta de proyecto: python rebuild.py
No requiere dependencias externas; mantiene la copia incorporada de Three.js del HTML.
"""
import base64,json
from pathlib import Path
root=Path(__file__).resolve().parent
file=root/'public/juego/index.html'
s=file.read_text(encoding='utf-8')
a=s.index('const payload=')+len('const payload=')
b=s.index(';',a)
payload=json.loads(s[a:b])
for name in ('game','physics'):
    payload[name]=base64.b64encode((root/f'src/{name}.js').read_bytes()).decode('ascii')
new=json.dumps(payload,ensure_ascii=False,separators=(',',':'))
file.write_text(s[:a]+new+s[b:],encoding='utf-8')
print('Actualizado:',file,'(',file.stat().st_size,'bytes )')