const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'conferences.json'),'utf8'));
const ids=new Set();
for(const f of data.families){assert(!ids.has(f.id),'Duplicate family');ids.add(f.id);assert(f.topics.length);assert(['France / francophonie','Europe','International'].includes(f.scope));assert.equal(new URL(f.url).protocol,'https:');}
const editionIds=new Set();
for(const e of data.editions){assert(!editionIds.has(e.id));editionIds.add(e.id);assert(ids.has(e.family_id));assert(e.start<=e.end);assert(Number.isFinite(Date.parse(e.start)));assert(Number.isFinite(Date.parse(e.checked)));for(const t of e.tracks){assert(/[+-]\d{2}:\d{2}$/.test(t.deadline));assert(Number.isFinite(Date.parse(t.deadline)));assert.equal(new URL(t.source).protocol,'https:');}}
// Exercise the same app code with a minimal document surface, at a fixed date.
const elements=new Map();
function element(){return {value:'',checked:false,innerHTML:'',textContent:'',children:[],listeners:{},append(o){this.children.push(o);},addEventListener(k,fn){this.listeners[k]=fn;},setAttribute(){}};}
const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},querySelectorAll(){return [];},createElement(){return element();}};
const NativeDate=Date;
class Clock extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-13T09:00:00Z']));}static now(){return NativeDate.parse('2026-10-13T09:00:00Z');}}
const context=vm.createContext({window:{CONFERENCE_DATA:data},document,localStorage:{getItem(){return null;},setItem(){}},Date:Clock,TextEncoder,Blob,URL,setTimeout(){},setInterval(){}});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
assert.equal(run('visible.length'),6,'Upcoming verified deadlines at seed date');
run("$('region').value='Europe';render()");
assert.equal(run('visible.length'),3,'TEI open deadlines in Europe');
run("$('region').value='';$('type').value='Poster / WiP';render()");
assert.equal(run('visible.length'),2,'WiP and VR poster');
run("$('type').value='';$('favorite').checked=true;favorites.add('vr');render()");
assert.equal(run('visible.length'),3,'VR favorite upcoming milestones');
run("$('favorite').checked=false;$('search').value='teleoperation';view='catalog';render()");
assert(run('visible.length')>=2,'Accent insensitive search');
run("$('search').value='';view='deadlines';render()");
const ics=run("calendar(visible,view,new Date('2026-10-13T09:00:00Z'))");
assert(ics.includes('DTSTART:20261027T115959Z'),'AoE conversion lands on the next UTC day');
assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,6);
for(const line of ics.split('\r\n'))assert(Buffer.byteLength(line)<=75,'RFC5545 line folding');
const eventIcs=run("calendar([data.editions.find(e=>e.id==='ihm2026')],'events')");
assert(eventIcs.includes('DTSTART;VALUE=DATE:20261019'));
assert(eventIcs.includes('DTEND;VALUE=DATE:20261024'),'All-day end is exclusive');
assert.equal(run("icsText('a,b;c\\nd')"),'a\\,b\\;c\\nd');
const folded=run("fold('DESCRIPTION:'+('é'.repeat(100)))");
assert.equal(folded.replace(/\r\n /g,''),'DESCRIPTION:'+'é'.repeat(100));
console.log(`Passed: ${data.families.length} families, ${data.editions.length} editions, filters, AoE conversion and RFC5545 exports.`);
