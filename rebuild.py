"""Compatibilidad: empaqueta cocina y oficina con npm run build."""
import subprocess
from pathlib import Path
subprocess.run(['node', 'build.js'], cwd=Path(__file__).resolve().parent, check=True)
