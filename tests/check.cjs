const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'conferences.json'),'utf8'));
const ids=new Set();for(const f of data.families){assert(!ids.has(f.id));ids.add(f.id);assert(f.topics.length);assert(f.impact.status==='verified'||f.impact.status==='estimated');assert.equal(new URL(f.impact.source).protocol,'https:');assert(f.forecast.event.start<=f.forecast.event.end);assert(f.forecast.submission.start<=f.forecast.submission.end);assert.equal(f.forecast.status,'estimated');assert(f.forecast.sources.length);}
for(const e of data.editions){assert(ids.has(e.family_id));assert(e.start<=e.end);assert(['verified','tentative'].includes(e.event_status));for(const t of e.tracks){assert(t.deadline||t.date);if(t.deadline)assert(/[+-]\d{2}:\d{2}$/.test(t.deadline));assert.equal(new URL(t.source).protocol,'https:');}}
for(const j of data.journals){assert(j.title&&j.topics.length);if(j.impact.quartile)assert.equal(j.impact.status,'verified');if(j.impact.status==='estimated')assert(!j.impact.label.startsWith('JIF'),'No fabricated citation metrics');}
assert.equal(data.families.find(f=>f.id==='nordichi').forecast.year,2028,'Respect biennial recurrence');
assert.equal(data.families.find(f=>f.id==='rjc').forecast.cadence_years,2);
assert.equal(data.families.find(f=>f.id==='icra').forecast.submission.start,'2027-08-01','Next ICRA deadline season precedes the 2028 event by the observed lead time');
const NativeDate=Date;class Clock extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-13T10:00:00Z']));}static now(){return NativeDate.parse('2026-10-13T10:00:00Z');}}
function setup(page,query=''){
 const ids=page==='journals'?['search','publisher','indicator','sort','favorite','reset','topic-buttons','conf-link','journal-link','summary','result-note','results','updated']:['search','scope','region','type','indicator','sort','favorite','estimates','past','reset','export','topic-buttons','conf-link','journal-link','summary','result-note','results','updated'];
 const el=()=>({value:'',checked:false,innerHTML:'',textContent:'',children:[],listeners:{},append(o){this.children.push(o);},addEventListener(k,f){this.listeners[k]=f;},setAttribute(){}}),elements=new Map(ids.map(id=>[id,el()]));
 if(page==='conferences'){elements.get('estimates').checked=true;elements.get('sort').value='deadline';}else elements.get('sort').value='name';
 const document={body:{dataset:{page}},getElementById:id=>elements.get(id)||null,querySelectorAll:()=>[],createElement:()=>el()};
 const ctx=vm.createContext({window:{CONFERENCE_DATA:data},document,location:{search:query},URLSearchParams,localStorage:{getItem:()=>null,setItem(){}},Date:Clock,TextEncoder,Blob,URL,setTimeout(){},setInterval(){}});vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),ctx);return code=>vm.runInContext(code,ctx);
}
const run=setup('conferences');assert.equal(run('visible.length'),40);
assert(run("$('results').innerHTML.includes('Conference directory')&&$('results').innerHTML.includes('Usual timing')&&!$('results').innerHTML.includes('<th class=\"date-col\">Next submission</th>')"));
run("$('estimates').checked=false;$('type').value='Paper';render()");
assert.equal(run('visible.length'),40,'Directory is independent of open calls and forecast switches');
run("$('type').value='';$('estimates').checked=true;render()");
const plannerRun=setup('conferences');
plannerRun("view='deadlines';$('past').checked=true;$('estimates').checked=false;render()");
assert(plannerRun('visible.every(future)'),'Submission planner excludes past milestones regardless of calendar switch');
assert(plannerRun("$('results').innerHTML.includes('Submission planner')&&$('results').innerHTML.includes('Time remaining')&&!$('results').innerHTML.includes('Rank / visibility')"));
assert(plannerRun("countdown({date:today(),status:'verified'}).includes('Today')"));
assert(plannerRun("countdown({status:'estimated',window:{start:'2026-10-01',end:'2026-11-30'}}).includes('Window in progress')"));
assert.equal(new Set(data.editions.map(e=>e.id)).size,data.editions.length,'Unique historical edition IDs');
const historyRun=setup('conferences');
historyRun("view='history';historyYear='2025';render()");
assert(historyRun('visible.length')>=12,'Historical coverage spans multiple conference families');
assert(historyRun("visible.every(e=>e.year===2025&&e.end<today())"));
historyRun("$('region').value='France';render()");
assert(historyRun("visible.some(e=>e.id==='vr2025')"),'Historical location uses the historical edition');
assert(historyRun("visible.every(e=>e.region==='France')"));
historyRun("$('region').value='';historyYear='2021';render()");
assert(historyRun("visible.filter(e=>e.family_id==='ihm').length===1&&visible.some(e=>e.id==='ihm2021')"),'Postponed IHM recorded once in the year held');
historyRun("view='calendar';calendarYear=2024;render()");
assert(historyRun("calendarItems.some(r=>r.edition?.id==='vr2024'&&r.kind==='event')"),'Past calendar year includes archived events without the past-dates switch');
assert(historyRun("calendarItems.some(r=>r.edition?.id==='vr2025'&&r.kind==='call'&&r.start.startsWith('2024'))"),'Submission year can precede edition year');
historyRun("view='history';historyYear='2024';render()");
assert(historyRun("exportItems().some(r=>r.edition?.id==='vr2024'&&r.kind==='call')"));
const historyIcs=historyRun("calendar(exportItems(),'mixed')");
assert(historyIcs.includes('DTSTART:20240404T000000Z'),'UIST 2024 uses 17:00 Pacific daylight time, not AoE');
historyRun("historyYear='1900';render()");
assert.equal(historyRun('visible.length'),0);
assert(historyRun("$('results').innerHTML.includes('history-year')"),'Empty history keeps year filter available');
run("selectedTopics.add('Perception');selectedTopics.add('XR');render()");assert(run('visible.length')>0&&run('visible.length')<40);assert(run("visible.every(f=>f.topics.includes('XR')&&f.topics.includes('Perception'))"));assert(run("$('journal-link').href.includes('topic=Perception')"));
run("selectedTopics.clear();$('scope').value='France / Francophone';render()");assert.equal(run('visible.length'),8);
run("$('scope').value='';view='deadlines';$('estimates').checked=false;render()");assert(run('visible.length')>10);assert(run("visible.every(r=>r.status!=='estimated')"));
assert(!run("forecasts().some(r=>r.family.id==='iros'&&r.year===2027)"),'Known paper deadline supersedes a forecast');
const ics=run("calendar(visible,'deadlines',new Date('2026-10-13T10:00:00Z'))");assert(ics.includes('DTSTART:20261027T115959Z'),'AoE next-day UTC conversion');assert(!ics.includes('WHC')&&!ics.includes('World Haptics'),'Tentative dates excluded');assert(ics.includes('DTSTART;VALUE=DATE:20270301'),'Date-only deadlines stay date-only');for(const line of ics.split('\r\n'))assert(Buffer.byteLength(line)<=75);
const eventIcs=run("calendar([data.editions.find(e=>e.id==='ihm2026')],'events')");assert(eventIcs.includes('DTEND;VALUE=DATE:20261024'),'Exclusive end of all-day events');
run("view='calendar';$('estimates').checked=true;render()");assert(run("$('results').innerHTML.includes('calendar-grid')"));assert(run("$('results').innerHTML.includes('Broad planning windows')"));
const journals=setup('journals','?topic=XR');assert(journals('visible.length')>0);assert(journals("visible.every(j=>j.topics.includes('XR'))"));journals("selectedTopics.clear();$('indicator').value='verified';$('sort').value='impact';render()");assert.equal(journals('visible.length'),11);assert.equal(journals('visible[0].id'),'tochi');
console.log(`Passed: ${data.families.length} conferences, ${data.journals.length} journals, topic intersections, cross-page navigation, forecasts, calendar, metrics and ICS.`);

// Subscription selection follows starred families, independently of view filters.
const subscriptionRun=setup('conferences');
assert.equal(subscriptionRun('subscriptionUrl()'),'');
subscriptionRun("favorites=new Set(['vr','eurographics',data.journals[0].id,'obsolete-id']);$('search').value='No matching conference';view='deadlines';render()");
assert.equal(subscriptionRun("favoriteConferences().map(f=>f.id).join(',')"),'eurographics,vr');
assert.equal(subscriptionRun('subscriptionUrl()'),'https://xr-hci-calendar-feed.jocundsnipe3.chatgpt.site/calendar.ics?conferences=eurographics%2Cvr');
subscriptionRun("favorites.delete('eurographics')");
assert.equal(subscriptionRun('subscriptionUrl()'),'https://xr-hci-calendar-feed.jocundsnipe3.chatgpt.site/calendar.ics?conferences=vr');
// Organizer-announced ISMAR dates are provisional; vague timing is never a precise event.
const ismarRun=setup('conferences');
ismarRun("$('search').value='ISMAR';view='calendar';calendarYear=2029;render()");
assert(ismarRun("$('results').innerHTML.includes('Early Oct 2029')"));
assert(ismarRun("calendarItems.some(r=>r.edition?.id==='ismar2029'&&r.kind==='event'&&r.status==='tentative')"));
assert(ismarRun("calendarItems.some(r=>r.year===2029&&r.family.id==='ismar'&&r.kind==='call'&&r.status==='estimated')"));
assert(!ismarRun("calendar(exportItems(),'mixed').includes('UID:ismar2029')"),'Tentative organizer dates stay out of subscribed/snapshot calendars');
const ismarForecasts=ismarRun("forecasts().filter(r=>r.family.id==='ismar')");
assert.deepEqual(Array.from(ismarForecasts,r=>r.year).sort(),[2027,2028,2029]);
assert.equal(new Set(ismarForecasts.map(r=>r.year)).size,3,'Only one estimated paper window per announced edition');
