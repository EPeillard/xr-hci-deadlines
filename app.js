/* No dependencies. Data are curated in conferences.json. */
const data=window.CONFERENCE_DATA;
const byId=new Map(data.families.map(f=>[f.id,f]));
const $=id=>document.getElementById(id);
let view='deadlines';
let favorites=new Set();
try{favorites=new Set(JSON.parse(localStorage.getItem('conference-favorites')||'[]'));}catch{}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const day=s=>new Date(s+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const stamp=s=>new Date(s).toLocaleString('fr-FR',{timeZone:'Europe/Paris',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const rows=data.editions.flatMap(e=>e.tracks.map((t,i)=>({...t,edition:e,family:byId.get(e.family_id),index:i})));
let visible=[];
function option(id,values){values.sort((a,b)=>a.localeCompare(b,'fr')).forEach(s=>{const o=document.createElement('option');o.textContent=s;$(id).append(o);});}
option('topic',[...new Set(data.families.flatMap(f=>f.topics))]);
option('type',[...new Set(rows.map(r=>r.type))]);
$('updated').textContent='Première sélection vérifiée le '+day(data.updated);
function favoriteButton(f){return `<button class="star" data-star="${esc(f.id)}" aria-pressed="${favorites.has(f.id)}" aria-label="${favorites.has(f.id)?'Retirer des':'Ajouter aux'} favoris : ${esc(f.name)}">${favorites.has(f.id)?'★':'☆'}</button>`;}
function familyMatches(f){const q=normalize($('search').value.trim());return (!$('topic').value||f.topics.includes($('topic').value))&&(!$('scope').value||f.scope===$('scope').value)&&(!$('favorite').checked||favorites.has(f.id))&&(!q||normalize([f.name,f.why,f.topics.join(' ')].join(' ')).includes(q));}
function regionMatches(e){return !$('region').value||e.region===$('region').value||($('region').value==='Europe'&&e.region==='France');}
function tags(f){return `<p class="metadata">${esc(f.scope)} · ${esc(f.topics.join(' / '))}</p>`;}
function render(){
 const now=Date.now();
 $('stats').innerHTML=`<div class="stat"><strong>${data.families.length}</strong><span>conférences & réseaux</span></div><div class="stat"><strong>${rows.filter(r=>Date.parse(r.deadline)>=now).length}</strong><span>échéances ouvertes vérifiées</span></div><div class="stat"><strong>${data.families.filter(f=>f.scope==='France / francophonie').length}</strong><span>entrées françaises</span></div>`;
 $('region').disabled=view==='catalog';$('type').disabled=view!=='deadlines';$('past-label').hidden=view==='catalog';$('export').hidden=view==='catalog';
 $('results').className=view==='catalog'?'catalog':'';
 if(view==='deadlines'){
  visible=rows.filter(r=>familyMatches(r.family)&&regionMatches(r.edition)&&(!$('type').value||r.type===$('type').value)&&($('past').checked||Date.parse(r.deadline)>=now)).sort((a,b)=>Date.parse(a.deadline)-Date.parse(b.deadline));
  $('result-note').textContent=visible.length+' échéance(s). Heures converties en Europe/Paris ; une date AoE se termine le lendemain en France. Les étapes préalables restent à vérifier dans l’appel.';
  $('results').innerHTML=visible.map(r=>{const f=r.family,e=r.edition,expired=Date.parse(r.deadline)<now,days=Math.ceil((Date.parse(r.deadline)-now)/86400000);return `<article class="card ${expired?'past':''}"><div class="date"><span class="badge ${expired?'expired':''}">${expired?'Échéance passée':days===0?'Aujourd’hui':'Dans '+days+' j'}</span><strong>${esc(stamp(r.deadline))}</strong><small>Heure de Paris · source ${r.deadline.endsWith('-12:00')?'AoE':'UTC+2'}</small></div><div><h3><a href="${esc(e.url)}">${esc(f.name)} ${e.year}</a></h3><p><strong>${esc(r.label)}</strong></p>${tags(f)}<p>${esc(e.location)} · rencontre du ${day(e.start)} au ${day(e.end)}</p>${r.note?`<p>${esc(r.note)}</p>`:''}<div class="links"><a href="${esc(r.source)}">Appel officiel ↗</a><span>Vérifié le ${day(e.checked)}</span></div></div>${favoriteButton(f)}</article>`;}).join('');
 }else if(view==='events'){
  visible=data.editions.filter(e=>familyMatches(byId.get(e.family_id))&&regionMatches(e)&&($('past').checked||new Date(e.end+'T23:59:59Z').getTime()>=now)).sort((a,b)=>a.start.localeCompare(b.start));
  $('result-note').textContent=visible.length+' rencontre(s) avec dates vérifiées. Les éditions sans dates sont dans le catalogue.';
  $('results').innerHTML=visible.map(e=>{const f=byId.get(e.family_id);return `<article class="card"><div class="date"><span class="badge">${esc(e.region)}</span><strong>${day(e.start)}</strong><small>au ${day(e.end)}</small></div><div><h3><a href="${esc(e.url)}">${esc(f.name)} ${e.year}</a></h3><p>${esc(e.location)}</p>${tags(f)}<p>${esc(f.why)}</p><div class="links"><a href="${esc(e.url)}">Site officiel ↗</a><span>Vérifié le ${day(e.checked)}</span></div></div>${favoriteButton(f)}</article>`;}).join('');
 }else{
  visible=data.families.filter(familyMatches).sort((a,b)=>a.scope.localeCompare(b.scope)||a.name.localeCompare(b.name));
  $('result-note').textContent=visible.length+' entrée(s). « Cœur » indique notre intérêt thématique, sans classement de qualité. Les liens marqués à vérifier sont des pistes du catalogue ; leurs éditions et échéances ne sont pas encore renseignées.';
  $('results').innerHTML=visible.map(f=>`<article class="card"><div><span class="badge">${esc(f.priority)} · ${esc(f.kind)}</span><h3><a href="${esc(f.url)}">${esc(f.name)}</a></h3>${tags(f)}<p>${esc(f.why)}</p><div class="links"><a href="${esc(f.url)}">${f.verified?'Source officielle consultée':'Lien du catalogue à vérifier'} ↗</a></div></div>${favoriteButton(f)}</article>`).join('');
 }
 if(!visible.length)$('results').innerHTML='<div class="empty">Aucun résultat avec ces filtres.<br>Essayez le catalogue ou incluez les dates passées.</div>';
 document.querySelectorAll('[data-star]').forEach(b=>b.addEventListener('click',()=>{favorites.has(b.dataset.star)?favorites.delete(b.dataset.star):favorites.add(b.dataset.star);try{localStorage.setItem('conference-favorites',JSON.stringify([...favorites]));}catch{}render();}));
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(t=>t.setAttribute('aria-selected',String(t===b)));render();}));
['search','topic','scope','region','type','favorite','past'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));
$('reset').addEventListener('click',()=>{['search','topic','scope','region','type'].forEach(id=>$(id).value='');['favorite','past'].forEach(id=>$(id).checked=false);render();});
function icsText(s){return String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function utc(s){return new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');}
function fold(line){let out='',part='';for(const c of line){if(new TextEncoder().encode(part+c).length>75){out+=part+'\r\n';part=' ';}part+=c;}return out+part;}
function calendar(items,mode,now=new Date()){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//XR IHM//Conference tracker//FR','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 for(const r of items){const e=mode==='deadlines'?r.edition:r,f=mode==='deadlines'?r.family:byId.get(e.family_id);lines.push('BEGIN:VEVENT',`UID:${e.id}-${mode==='deadlines'?r.index:'event'}@xr-ihm-deadlines`,`DTSTAMP:${utc(now)}`,`SUMMARY:${icsText(f.name+' '+e.year+(mode==='deadlines'?' — '+r.label:''))}`);
 if(mode==='deadlines'){lines.push('DTSTART:'+utc(r.deadline),'DTEND:'+utc(new Date(Date.parse(r.deadline)+60000)),'DESCRIPTION:'+icsText(r.label+'\nÉchéance officielle : '+r.deadline+'\nVérifié le '+e.checked+'\n'+r.source+'\n'+r.note),'URL:'+r.source);}
 else{const end=new Date(e.end+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+1);lines.push('DTSTART;VALUE=DATE:'+e.start.replace(/-/g,''),'DTEND;VALUE=DATE:'+end.toISOString().slice(0,10).replace(/-/g,''),'DESCRIPTION:'+icsText(f.why+'\nVérifié le '+e.checked),'URL:'+e.url);}
 lines.push('LOCATION:'+icsText(e.location),'END:VEVENT');}lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
$('export').addEventListener('click',()=>{const blob=new Blob([calendar(visible,view)],{type:'text/calendar;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='xr-ihm-'+view+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
render();setInterval(render,60000);
