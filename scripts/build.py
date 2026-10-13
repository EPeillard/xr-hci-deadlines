import json, shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'conferences.json').read_text())
out=root/'dist';out.mkdir(exist_ok=True)
for filename in ('index.html','journals.html','style.css','app.js','CONTRIBUTING.md','conferences.json'):
    shutil.copy2(root/filename,out/filename)
(out/'data.js').write_text('window.CONFERENCE_DATA = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
print(f"Built {len(data['families'])} conferences, {len(data['editions'])} editions and {len(data['journals'])} journals.")
