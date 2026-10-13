const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'conferences.json'),'utf8'));
const ids=new Set();for(const f of data.families){assert(!ids.has(f.id));ids.add(f.id);assert(f.topics.length);assert(f.impact.status==='verified'||f.impact.status==='estimated');assert.equal(new URL(f.impact.source).protocol,'https:');assert(f.forecast.event.start<=f.forecast.event.end);assert(f.forecast.submission.start<=f.forecast.submission.end);assert.equal(f.forecast.status,'estimated');assert(f.forecast.sources.length);}
for(const e of data.editions){assert(ids.has(e.family_id));assert(e.start<=e.end);assert(['verified','tentative'].includes(e.event_status));for(const t of e.tracks){assert(t.deadline||t.date);if(t.deadline)assert(/[+-]\d{2}:\d{2}$/.test(t.deadline));assert.equal(new URL(t.source).protocol,'https:');}}
for(const j of data.journals){assert(j.title&&j.topics.length);if(j.impact.quartile)assert.equal(j.impact.status,'verified');if(j.impact.status==='estimated')assert(!j.impact.label.startsWith('JIF'),'No fabricated citation metrics');}
assert.equal(data.families.find(f=>f.id==='nordichi').forecast.year,2028,'Respect biennial recurrence');
assert.equal(data.families.find(f=>f.id==='rjc').forecast.cadence_years,2);
const NativeDate=Date;class Clock extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-13T10:00:00Z']));}static now(){return NativeDate.parse('2026-10-13T10:00:00Z');}}
function setup(page,query=''){
 const ids=page==='journals'?['search','publisher','indicator','sort','favorite','reset','topic-buttons','conf-link','journal-link','summary','result-note','results','updated']:['search','scope','region','type','indicator','sort','favorite','estimates','past','reset','export','topic-buttons','conf-link','journal-link','summary','result-note','results','updated'];
 const el=()=>({value:'',checked:false,innerHTML:'',textContent:'',children:[],listeners:{},append(o){this.children.push(o);},addEventListener(k,f){this.listeners[k]=f;},setAttribute(){}}),elements=new Map(ids.map(id=>[id,el()]));
 if(page==='conferences'){elements.get('estimates').checked=true;elements.get('sort').value='deadline';}else elements.get('sort').value='name';
 const document={body:{dataset:{page}},getElementById:id=>elements.get(id)||null,querySelectorAll:()=>[],createElement:()=>el()};
 const ctx=vm.createContext({window:{CONFERENCE_DATA:data},document,location:{search:query},URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},Date:Clock,TextEncoder,Blob,URL,setTimeout(){},setInterval(){}});vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),ctx);return code=>vm.runInContext(code,ctx);
}
const run=setup('conferences');assert.equal(run('visible.length'),39);
run("selectedTopics.add('Perception');selectedTopics.add('XR');render()");assert(run('visible.length')>0&&run('visible.length')<39);assert(run("visible.every(f=>f.topics.includes('XR')&&f.topics.includes('Perception'))"));assert(run("$('journal-link').href.includes('topic=Perception')"));
run("selectedTopics.clear();$('scope').value='France / Francophone';render()");assert.equal(run('visible.length'),8);
run("$('scope').value='';view='deadlines';$('estimates').checked=false;render()");assert(run('visible.length')>10);assert(run("visible.every(r=>r.status!=='estimated')"));
const ics=run("calendar(visible,'deadlines',new Date('2026-10-13T10:00:00Z'))");assert(ics.includes('DTSTART:20261027T115959Z'),'AoE next-day UTC conversion');assert(!ics.includes('WHC')&&!ics.includes('World Haptics'),'Tentative dates excluded');assert(ics.includes('DTSTART;VALUE=DATE:20270301'),'Date-only deadlines stay date-only');for(const line of ics.split('\r\n'))assert(Buffer.byteLength(line)<=75);
const eventIcs=run("calendar([data.editions.find(e=>e.id==='ihm2026')],'events')");assert(eventIcs.includes('DTEND;VALUE=DATE:20261024'),'Exclusive end of all-day events');
run("view='calendar';$('estimates').checked=true;render()");assert(run("$('results').innerHTML.includes('calendar-grid')"));assert(run("$('results').innerHTML.includes('Broad planning windows')"));
const journals=setup('journals','?topic=XR');assert(journals('visible.length')>0);assert(journals("visible.every(j=>j.topics.includes('XR'))"));journals("selectedTopics.clear();$('indicator').value='verified';$('sort').value='impact';render()");assert.equal(journals('visible.length'),10);assert.equal(journals('visible[0].id'),'tochi');
console.log(`Passed: ${data.families.length} conferences, ${data.journals.length} journals, topic intersections, cross-page navigation, forecasts, calendar, metrics and ICS.`);
