'use strict';
const S=window.AMV_SCENE;
let autoTimer;
const color=k=>k&&k!=='transparent'?S.palette[k]:'transparent';
const clone=x=>structuredClone(x);
function expand(spec){
 if(spec.type!=='instance')return spec;
 const def=clone(S.components[spec.component]);
 const apply=(n)=>{if(n.type==='instance'){n.overrides={...n.overrides,...spec.overrides};if(n.slot==='State'&&spec.overrides.State)n.component='Status/'+spec.overrides.State;}else if(n.type==='text'){const k=n.prop||n.name;if(Object.prototype.hasOwnProperty.call(spec.overrides,k))n.text=spec.overrides[k];}for(const child of n.children||[])apply(child);};apply(def);
 for(const child of def.children||[]){if(child.absolute&&child.constraints){if(child.constraints.horizontal==='MAX')child.right=def.w-child.x-child.w;if(child.constraints.vertical==='MAX')child.bottom=def.h-child.y-(child.line||S.styles[child.style].line);}}
 for(const k of ['w','h','to'])if(spec[k]!==undefined)def[k]=spec[k];
 return def;
}
function render(original,parentDir='vertical'){
 const s=expand(original),el=document.createElement('div');el.dataset.name=s.name;el.className=s.type;
 if(s.hidden)el.style.display='none';
 const fillW=s.w==='fill'||s.type==='text'&&s.w===undefined&&parentDir==='vertical'&&!s.absolute;
 if(typeof s.w==='number')el.style.width=s.w+'px';else if(fillW){if(parentDir==='horizontal'){el.style.flex='1 1 0';el.style.minWidth='0';}else{el.style.width='100%';el.style.alignSelf='stretch';}}else if(s.w==='hug')el.style.width='max-content';
 if(typeof s.h==='number')el.style.height=s.h+'px';else if(s.h==='fill'){if(parentDir==='vertical'){el.style.flex='1 1 0';el.style.minHeight='0';}else el.style.alignSelf='stretch';}
 if(s.absolute){el.style.position='absolute';if(s.right!==undefined)el.style.right=s.right+'px';else el.style.left=(s.x||0)+'px';if(s.bottom!==undefined)el.style.bottom=s.bottom+'px';else el.style.top=(s.y||0)+'px';}
 if(s.type==='text'){const st=S.styles[s.style||'body'];Object.assign(el.style,{fontSize:(s.size||st.size)+'px',lineHeight:(s.line||st.line)+'px',fontWeight:st.weight,color:color(s.color||'text'),textAlign:s.alignText||'left'});el.textContent=s.text;}
 else if(s.type==='icon'){el.className='svg';el.innerHTML=`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${color(s.color||'muted')}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${S.icons[s.icon]||S.icons.info}</svg>`;}
 else if(s.type==='art'){el.className='svg';el.innerHTML=`<svg viewBox="0 0 372 128" preserveAspectRatio="none"><path d="M-50 140 150-30h65L15 140zM115 150 315-20h55L170 150z" fill="${color('coverLine')}"/><path d="m-5 105 155-135M125 145 345-40" stroke="${color('accent')}" stroke-opacity=".3"/></svg>`;}
 else if(s.type==='timeline'||s.type==='slider'){el.style.position='relative';const rail=document.createElement('div');Object.assign(rail.style,{position:'absolute',top:'50%',marginTop:s.type==='slider'?'-2px':'-5px',height:s.type==='slider'?'4px':'10px',width:'100%',borderRadius:'3px',background:color('outline')});el.append(rail);const marker=document.createElement('div');if(s.type==='slider')Object.assign(marker.style,{position:'absolute',top:'calc(50% - 10px)',left:`calc(${s.progress*100}% - 10px)`,width:'20px',height:'20px',borderRadius:'50%',background:color('accent')});else Object.assign(marker.style,{position:'absolute',top:'calc(50% - 9px)',left:s.start/s.duration*100+'%',width:(s.end-s.start)/s.duration*100+'%',height:'18px',borderLeft:'2px solid '+color('accent'),borderRight:'2px solid '+color('accent'),background:color('primary')});el.append(marker);}
 else{Object.assign(el.style,{background:color(s.bg),borderRadius:(s.radius||0)+'px'});if(s.stroke)el.style.boxShadow='inset 0 0 0 1px '+color(s.stroke);if(s.type==='frame'){el.style.flexDirection=s.dir==='horizontal'?'row':'column';el.style.gap=(s.gap||0)+'px';el.style.alignItems=s.align==='center'?'center':s.align==='end'?'flex-end':'flex-start';el.style.justifyContent=s.justify==='center'?'center':s.justify==='between'?'space-between':'flex-start';if(s.padding)el.style.padding=typeof s.padding==='number'?s.padding+'px':s.padding.map(x=>x+'px').join(' ');if(s.clip)el.style.overflow='hidden';if(s.scroll)el.classList.add('scroll');for(const child of s.children||[])el.append(render(child,s.dir));}}
 if(s.to){el.classList.add('clickable');el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',s.name);el.onclick=e=>{e.stopPropagation();show(s.to);};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(s.to);}};}
 return el;
}
function show(id){clearTimeout(autoTimer);const screen=S.screens.find(s=>s.id===id)||S.screens[0];document.getElementById('device').replaceChildren(render(screen.node));document.getElementById('title').textContent=screen.name;document.getElementById('description').textContent=screen.description||`Estado ${screen.group.toLowerCase()} de la aplicación.`;document.getElementById('count').textContent=`${S.screens.length} pantallas y estados, ${Object.keys(S.components).length} componentes base y ${Object.keys(S.palette).length} colores.`;document.querySelectorAll('[data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen===screen.id));history.replaceState(null,'','#'+screen.id);if(screen.autoTo)autoTimer=setTimeout(()=>show(screen.autoTo),900);}
for(const s of S.screens){const b=document.createElement('button');b.textContent=s.name;b.dataset.screen=s.id;b.onclick=()=>show(s.id);document.getElementById('screens').append(b);}
show(location.hash.slice(1));
