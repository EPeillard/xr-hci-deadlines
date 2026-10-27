import json, shutil, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'conferences.json').read_text())
out=root/'dist';out.mkdir(exist_ok=True)
for filename in ('index.html','journals.html','map.html','style.css','app.js','nearby.js','map.css','map.js','map-locations.js','CONTRIBUTING.md','conferences.json'):
    shutil.copy2(root/filename,out/filename)
(out/'data.js').write_text('window.CONFERENCE_DATA = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
# Version static assets by content so a published data update cannot reuse
# the browser's cached snapshot from an earlier deployment.
for filename in ('index.html','journals.html','map.html'):
    html=(out/filename).read_text()
    for asset in ('style.css','app.js','data.js','nearby.js','map.css','map.js','map-locations.js'):
        version=hashlib.sha256((out/asset).read_bytes()).hexdigest()[:12]
        html=html.replace('"'+asset+'"','"'+asset+'?v='+version+'"')
    (out/filename).write_text(html)
print(f"Built {len(data['families'])} conferences, {len(data['editions'])} editions and {len(data['journals'])} journals.")
