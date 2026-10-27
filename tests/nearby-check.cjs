const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'nearby.js'),'utf8');
const nativeDate=Date;class Clock extends nativeDate{constructor(...args){super(...(args.length?args:['2026-10-27T10:00:00Z']));}static now(){return nativeDate.parse('2026-10-27T10:00:00Z');}}
const KEY='xr-hci-nearby-enabled';
function setup(saved=null,blocked=false){
 const toggle={checked:false,listeners:{},addEventListener(k,fn){this.listeners[k]=fn;}};
 const storage={value:saved,getItem(k){assert.equal(k,KEY);if(blocked)throw Error('blocked');return this.value;},setItem(k,v){assert.equal(k,KEY);if(blocked)throw Error('blocked');this.value=v;}};
 const events={};let renders=0;
 const window={addEventListener(k,fn){events[k]=fn;}};
 const context={window,document:{getElementById:id=>id==='nearby-toggle'?toggle:null},localStorage:storage,Date:Clock,encodeURIComponent,fetch(){throw Error('No feature network requests');},navigator:{get geolocation(){throw Error('No geolocation');}}};
 vm.runInNewContext(source,context);
 const api=window.CONFERENCE_NEARBY;api.mount(()=>renders++);
 return {api,toggle,storage,events,renders:()=>renders};
}
const edition={id:'eics2027',year:2027,start:'2027-06-08',end:'2027-06-11',event_status:'verified',location:'Toulouse, France'};
const fresh=setup();assert.equal(fresh.api.isEnabled(),false);assert.equal(fresh.api.render(edition),'');
assert.equal(setup('false').api.isEnabled(),false);assert.equal(setup('1').api.isEnabled(),false);
fresh.toggle.checked=true;fresh.toggle.listeners.change();assert.equal(fresh.renders(),1);assert.equal(fresh.storage.value,'true');
const html=fresh.api.render(edition);assert(html.includes('Food &amp; drinks nearby')||html.includes('Food & drinks nearby'));assert(html.includes('Toulouse, France'));
const urls=[...html.matchAll(/href="([^"]+)"/g)].map(m=>new URL(m[1].replace(/&amp;/g,'&')));
assert.equal(urls.length,4);for(const url of urls){assert.equal(url.origin,'https://www.google.com');assert.equal(url.pathname,'/maps/search/');assert.equal(url.searchParams.get('api'),'1');assert(url.searchParams.get('query').endsWith('near Toulouse, France'));assert(url.href.length<2048);}
assert.equal((html.match(/target="_blank"/g)||[]).length,4);assert.equal((html.match(/rel="noopener noreferrer"/g)||[]).length,4);assert(!/<iframe|<img/i.test(html));
assert.equal(setup('true').api.isEnabled(),true);
fresh.toggle.checked=false;fresh.toggle.listeners.change();assert.equal(fresh.api.render(edition),'');assert.equal(fresh.storage.value,'false');
const on=setup('true');for(const location of ['Cyprus','Location not announced','Online','TBA, France','Online, France','Paris,',' ,France'])assert.equal(on.api.render({...edition,location}),'');
assert.equal(on.api.render({...edition,event_status:'estimated'}),'');
assert.equal(on.api.render({...edition,end:'2026-10-26'}),'');assert.equal(on.api.render(null),'');
assert(on.api.render({...edition,end:'2026-10-27'}),'Ongoing conferences included');
assert(on.api.render({...edition,event_status:'tentative'}).includes('provisional'));
assert(on.api.render({...edition,precision:'month'}),'Announced month and concrete city are usable');
const unsafe=on.api.render({...edition,location:'Paris <img src=x onerror=alert(1)>, France'});assert(!unsafe.includes('<img'));assert(unsafe.includes('&lt;img'));
const unicode=new URL(on.api.link('best restaurants','Évora, Portugal'));assert.equal(unicode.searchParams.get('query'),'best restaurants near Évora, Portugal');
const blocked=setup(null,true);blocked.toggle.checked=true;assert.doesNotThrow(()=>blocked.toggle.listeners.change());assert(blocked.api.isEnabled());
on.events.storage({key:KEY,newValue:'false'});assert.equal(on.api.isEnabled(),false);assert.equal(on.toggle.checked,false);
on.events.storage({key:KEY,newValue:'true'});assert(on.api.isEnabled());on.events.storage({key:null});assert.equal(on.api.isEnabled(),false);
for(const name of ['index.html','map.html']){const text=fs.readFileSync(path.join(root,name),'utf8');assert(text.includes('id="nearby-toggle"'));assert(text.includes('Extra options'));assert(text.indexOf('src="nearby.js"')<text.indexOf('src="'+(name==='map.html'?'map.js':'app.js')+'"'));assert(!text.includes('id="nearby-toggle" type="checkbox" checked'));}
assert(!fs.readFileSync(path.join(root,'journals.html'),'utf8').includes('nearby-toggle'));
assert(fs.readFileSync(path.join(root,'scripts/build.py'),'utf8').includes("'nearby.js'"));
assert(!/fetch\s*\(|XMLHttpRequest|navigator\./.test(source));
console.log('Passed: nearby discovery off by default, local preference, encoded links, privacy, announced locations and fallbacks.');
