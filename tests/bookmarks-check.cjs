const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'conferences.json'),'utf8'));
const added=['cphs','ecce','epique','ichms','smc','ifac-hms','neuroergonomics','grivapp','hai','hcii','hhai','icusi','ecem'];
for(const id of added){
 const f=data.families.find(f=>f.id===id);assert(f&&f.verified,'Bookmark family is recorded: '+id);
 assert(f.topics.includes('HCI')&&f.impact.source&&f.forecast.basis&&f.forecast.sources.length);
 assert(data.editions.some(e=>e.family_id===id),'At least one officially announced edition: '+id);
}
for(const id of ['cphs','epique','neuroergonomics','ecem'])assert.equal(data.families.find(f=>f.id===id).forecast.cadence_years,2);
assert.equal(data.families.find(f=>f.id==='ifac-hms').forecast.cadence_years,3);
assert.equal(data.families.find(f=>f.id==='ifac-hms').forecast.year,2028);
assert(!data.editions.some(e=>e.id==='epique2025'),'Do not manufacture an edition to fill a recurrence gap');
assert(data.families.find(f=>f.id==='epique').forecast.basis.includes('2023, 2026'));
assert.equal(data.families.filter(f=>f.id==='icmi').length,1,'ICMI must not be duplicated');
const icmi=data.editions.find(e=>e.id==='icmi2026');assert(icmi);
assert.equal(icmi.tracks.find(t=>t.type==='Paper').deadline,'2026-04-23T23:59:00-12:00');
assert.equal(icmi.tracks.find(t=>t.type==='Abstract').deadline,'2026-04-13T23:59:00-07:00');
const griv=data.editions.find(e=>e.id==='grivapp2027');
assert.equal(griv.tracks.filter(t=>t.type==='Paper').length,2,'Separate initial paper rounds are valid contribution calls');
assert(griv.tracks.every(t=>t.date&&!t.deadline),'Do not invent a cutoff hour from a bare AoE date');
assert(griv.tracks.some(t=>t.date==='2026-10-29'));
assert.equal(data.editions.find(e=>e.id==='hcii2027').tracks.find(t=>t.type==='Poster / WiP').date,'2027-01-15');
assert(data.editions.find(e=>e.id==='hhai2027').tracks.some(t=>t.type==='Abstract'&&t.deadline==='2027-01-21T23:59:00-12:00'));
assert(!data.editions.flatMap(e=>e.tracks).some(t=>['Revision','Camera-ready'].includes(t.type)));
assert(!data.editions.find(e=>e.id==='hcii2027').tracks.some(t=>(t.deadline||t.date).startsWith('2027-01-29')),'Accepted proposal full-text delivery is not a new contribution call');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'map-locations.js'),'utf8'),context);
for(const id of ['cphs2026','hai2026','hcii2027','grivapp2027','hhai2027','smc2027']){
 const e=data.editions.find(e=>e.id===id);assert(context.window.CONFERENCE_LOCATIONS.some(p=>p.locations.includes(e.location)),'New upcoming destination is mapped: '+id);
}
console.log('Passed: 13 bookmark series, distinct ICHMS/SMC, ICMI archive, periodicity, submission-only scope, precise timezones and mapped destinations.');
