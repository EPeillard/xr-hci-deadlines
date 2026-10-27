const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'conferences.json'),'utf8'));
const NativeDate=Date;class Clock extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-26T14:00:00Z']));}static now(){return NativeDate.parse('2026-10-26T14:00:00Z');}}
function setup({leaflet=false,cluster=true,query='',favorites=[]}={}){
 const el=()=>({value:'',checked:false,hidden:true,innerHTML:'',textContent:'',href:'',children:[],listeners:{},append(x){this.children.push(x);},addEventListener(k,f){this.listeners[k]=f;},scrollIntoView(){}});
 const elements=new Map(['search','year','region','status','favorite','summary','result-note','map-results','unmapped','unmapped-results','topic-buttons','conf-link','journal-link','map-link','map-error','world-map','reset','fit-map','updated','nearby-toggle'].map(id=>[id,el()]));
 const document={getElementById:id=>elements.get(id),createElement:el,addEventListener(){}};
 const map={zoom:2,setView(point,zoom){this.zoom=zoom;return this;},fitBounds(points,options){this.points=points;return this;},getZoom(){return this.zoom;}};
 const layers={layers:[],clearLayers(){this.layers=[];},addLayer(m){this.layers.push(m);},addTo(){return this;},zoomToShowLayer(m,fn){fn();}};
 let tileError;
 const L={map:()=>map,tileLayer:()=>({addTo(){return this;},on(type,fn){tileError=fn;}}),divIcon:x=>x,marker:(point,options)=>({options,point,bindPopup(html){this.html=html;return this;},getLatLng(){return point;},openPopup(){this.open=true;}}),layerGroup:()=>layers};
 if(cluster)L.markerClusterGroup=options=>{layers.options=options;return layers;};
 const storage={getItem:()=>JSON.stringify(favorites),setItem(k,v){this.saved=v;}};
 const window={CONFERENCE_DATA:JSON.parse(JSON.stringify(data)),addEventListener(){}};if(leaflet)window.L=L;
 const ctx=vm.createContext({window,document,location:{search:query},localStorage:storage,URL,URLSearchParams,Date:Clock,...(leaflet?{L}:{})});
 vm.runInContext(fs.readFileSync(path.join(root,'nearby.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(root,'map-locations.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(root,'map.js'),'utf8'),ctx);
 return {run:code=>vm.runInContext(code,ctx),elements,layers,map,tileError:()=>tileError?.()};
}
const {run,elements}=setup();
assert.equal(elements.get('map-error').hidden,false,'Readable fallback when CDN is unavailable');
assert(run('visible.every(e=>e.end>=today())'),'Past editions never appear');
assert(run("mapped.some(e=>e.id==='ihm2027')"));
assert(run("!visible.some(e=>e.id==='vr2026')"));
assert(run("unmapped.some(e=>e.id==='ismar2029')&&unmapped.some(e=>e.id==='ismar2028')"),'Country-only destinations are not assigned arbitrary city pins');
assert(run("!placeFor({location:'Nantes, Canada'})"),'No ambiguous city-name matching');
assert(run("!placeFor({location:'New destination, France',family_id:'ihm'})"),'No stale family-level location reuse');
assert(run("places.every(p=>p.lat>=-90&&p.lat<=90&&p.lon>=-180&&p.lon<=180&&p.precision==='city'&&p.checked&&p.source.startsWith('https://www.geonames.org/'))"));
assert.equal(run('placeByLocation.size'),run('places.reduce((n,p)=>n+p.locations.length,0)'),'Location keys are unique');
run("$('year').value='2028';render()");assert(run('visible.length>0&&visible.every(e=>e.year===2028)'));assert.equal(run('mapped.length'),0);
run("$('year').value='';$('region').value='Europe';render()");assert(run("visible.some(e=>e.id==='ihm2027')&&visible.every(e=>['France','Europe'].includes(e.region))"));
run("$('region').value='';$('status').value='tentative';render()");assert(run("visible.every(e=>e.event_status==='tentative')"));
run("$('status').value='';$('search').value='Toulouse';render()");assert(run("visible.some(e=>e.id==='eics2027')&&visible.some(e=>e.id==='jfig2026')"));
run("$('search').value='NothingMatches';render()");assert.equal(run('visible.length'),0);assert(elements.get('map-results').innerHTML.includes('No mapped conferences'));
const topics=setup({query:'?topic=XR&topic=Human+factors'}).run;assert(topics('visible.length>0'));assert(topics("visible.every(e=>families.get(e.family_id).topics.includes('XR')&&families.get(e.family_id).topics.includes('Human factors'))"));assert(topics("$('conf-link').href.includes('topic=XR')&&$('journal-link').href.includes('topic=Human+factors')"));
const fav=setup({favorites:['vr']}).run;fav("$('favorite').checked=true;render()");assert(fav("visible.length===1&&visible[0].id==='vr2027'"));
assert.equal(run("safeUrl('javascript:alert(1)')"),'#');assert.equal(run("esc('<script>')"),'&lt;script&gt;');
assert(run("dates({start:'2027-09-01',end:'2027-09-30',precision:'month'}).includes('September 2027')&&!dates({start:'2027-09-01',end:'2027-09-30',precision:'month'}).includes('1 Sept')"));
const live=setup({leaflet:true});assert(live.layers.layers.length>0);assert.equal(live.layers.layers.length,live.run('new Set(mapped.map(placeFor)).size'),'Conferences sharing a city use one popup');
assert(live.run("markerByEdition.get('eics2027')===markerByEdition.get('jfig2026')"));
live.run("locate('eics2027')");assert(live.run("markerByEdition.get('eics2027').open"),'List opens associated marker');
assert(live.run("markerByEdition.get('eics2027').html.includes('Toulouse')&&markerByEdition.get('eics2027').html.includes('Next submission')"));
assert(live.run("markerByEdition.get('ismar2027').options.icon.html.includes('tentative')"));
live.tileError();assert.equal(live.elements.get('map-error').hidden,false,'Tile errors preserve the list');
const fallback=setup({leaflet:true,cluster:false});assert(fallback.layers.layers.length>0,'Missing clustering plugin still leaves markers');
const clusterHtml=live.layers.options.iconCreateFunction({getAllChildMarkers:()=>[{options:{conferenceCount:2}},{options:{conferenceCount:3}}]}).html;assert(clusterHtml.includes('>5<'),'Clusters count conferences, not cities');
for(const file of ['index.html','journals.html'])assert(fs.readFileSync(path.join(root,file),'utf8').includes('href="map.html"'));
console.log(`Passed: interactive map, ${live.run('mapped.length')} mapped editions, city grouping, filters, favorites, source precision and network fallbacks.`);


const nearbyMap=setup({leaflet:true});
assert(!nearbyMap.run("$('map-results').innerHTML.includes('Food & drinks nearby')"));
nearbyMap.run("$('nearby-toggle').checked=true;$('nearby-toggle').listeners.change()");
assert(nearbyMap.run("$('map-results').innerHTML.includes('Food & drinks nearby')"));
assert(nearbyMap.run("markerByEdition.get('icra2027').html.includes('Food & drinks nearby')&&markerByEdition.get('icra2027').html.includes('near%20Seoul%2C%20South%20Korea')"));
assert(nearbyMap.run("!card(data.editions.find(e=>e.id==='ismar2028')).includes('Food & drinks nearby')"),'Country-only destination has no nearby search');
console.log('Passed: nearby discovery in map list and markers, disabled until opt-in.');
