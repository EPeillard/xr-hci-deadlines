/* Optional local discovery: no network calls, embeds, API keys or geolocation. */
(function(){
 'use strict';
 const KEY='xr-hci-nearby-enabled';
 let enabled=false;
 try{enabled=localStorage.getItem(KEY)==='true';}catch{}
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Paris'});
 function area(e){
  if(!e||!['verified','tentative'].includes(e.event_status)||!e.end||e.end<today())return null;
  const location=String(e.location||'').trim();
  // Country-only, unknown and online locations cannot support a useful nearby search.
  if(!location.includes(',')||location.length>160||/unknown|not announced|tba|tbd|to be|online|virtual|city not|location not/i.test(location))return null;
  const parts=location.split(',').map(x=>x.trim());
  return parts.length>=2&&parts.every(Boolean)?location:null;
 }
 function link(query,location){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query+' near '+location);}
 function render(e){
  const location=area(e);if(!enabled||!location)return '';
  const searches=[['Restaurants','best restaurants'],['Bars & pubs','best bars and pubs'],['Coffee','best coffee shops'],['Vegetarian options','best vegetarian restaurants']];
  return '<details class="nearby-panel"><summary>Food & drinks nearby</summary><p class="nearby-area">Around '+escape(location)+' · '+escape(e.year)+'</p><div class="nearby-links">'+searches.map(([name,query])=>'<a target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" href="'+escape(link(query,location))+'">'+escape(name)+' ↗</a>').join('')+'</div><p class="nearby-note">Explore reviews, menus and opening hours on Google Maps. These are live searches, not a curated or guaranteed best-of list. The recorded city/area is used; zoom to the actual conference venue to check walking distances.'+(e.event_status==='tentative'?' Organizer-announced event details are provisional.':'')+'</p></details>';
 }
 function mount(onChange){
  const toggle=document.getElementById('nearby-toggle');if(!toggle)return;
  toggle.checked=enabled;
  toggle.addEventListener('change',()=>{
   enabled=toggle.checked;
   try{localStorage.setItem(KEY,String(enabled));}catch{}
   onChange();
  });
  window.addEventListener?.('storage',event=>{
   if(event.key!==KEY&&event.key!==null)return;
   enabled=event.key===KEY?event.newValue==='true':false;
   toggle.checked=enabled;onChange();
  });
 }
 window.CONFERENCE_NEARBY={render,area,link,mount,isEnabled:()=>enabled};
})();
