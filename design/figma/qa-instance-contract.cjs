// Focused API contract simulation: no Figma layout, rendering or network access.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const scene=require('./scene-spec.cjs');
const runtime=fs.readFileSync(path.join(__dirname,'import-runtime.js'),'utf8');
function environment(){
 let serial=0;const messages=[],styles=new Map(),raw=new WeakMap();
 const clone=x=>structuredClone(x);
 function node(type){
  const target={id:String(++serial),type,name:type,children:[],parent:null,width:100,height:100,x:0,y:0,layoutMode:'NONE',paddingLeft:0,paddingRight:0,paddingTop:0,paddingBottom:0,componentProperties:{},flowStartingPoints:[],fills:[],strokes:[]};
  function guard(n,key){for(let p=n.parent;p;p=p.parent)if(p.type==='INSTANCE')throw Error(`in set_${key}: This property cannot be overridden in an instance: relative-transform`);}
  const n=new Proxy(target,{set(t,k,v){if(['x','y','relativeTransform','constraints'].includes(k))guard(n,k);t[k]=v;return true;}});raw.set(n,target);
  n.appendChild=child=>{if(child.parent){const siblings=child.parent.children;siblings.splice(siblings.indexOf(child),1);}child.parent=n;n.children.push(child);};
  n.findAll=predicate=>n.children.flatMap(c=>[...(predicate(c)?[c]:[]),...c.findAll(predicate)]);
  n.findOne=predicate=>n.findAll(predicate)[0]||null;
  n.resize=(w,h)=>{guard(n,'resize');target.width=w;target.height=h;};
  n.setBoundVariable=()=>{};
  n.setTextStyleIdAsync=async id=>{const s=styles.get(id);for(const key of ['fontName','fontSize','lineHeight'])target[key]=clone(s[key]);};
  n.addComponentProperty=(key,type,value)=>{const id=key+'#'+(++serial);n.componentProperties[id]={type,value};return id;};
  n.setProperties=values=>{for(const [key,value]of Object.entries(values)){assert.ok(n.componentProperties[key]);n.componentProperties[key].value=value;for(const t of n.findAll(c=>c.componentPropertyReferences?.characters===key))t.characters=value;}};
  function copy(source,asType=source.type){const c=node(asType),dest=raw.get(c);for(const [key,value]of Object.entries(raw.get(source))){if(['id','type','parent','children'].includes(key)||typeof value==='function')continue;dest[key]=clone(value);}for(const child of source.children)c.appendChild(copy(child));return c;}
  n.createInstance=()=>copy(n,'INSTANCE');
  n.swapComponent=base=>{const replacement=copy(base,'INSTANCE');target.children=replacement.children;for(const c of target.children)c.parent=n;target.componentProperties=replacement.componentProperties;};
  n.setReactionsAsync=async reactions=>{
   for(const reaction of reactions)for(const action of reaction.actions||[]){
    if(action.type!=='NODE'||action.navigation!=='NAVIGATE')continue;
    const destination=root.findOne(c=>c.id===action.destinationId);let source=n;
    while(source.parent&&source.parent.type!=='PAGE')source=source.parent;
    if(!destination||destination.type!=='FRAME'||destination.parent?.type!=='PAGE'||source.type!=='FRAME'||source.parent!==destination.parent||source===destination)
     throw Error('Reaction at index 0 was invalid: for NAVIGATE actions, destinations must be a different top-level frame on the same page');
   }
   n.reactions=clone(reactions);
  };
  n.loadAsync=async()=>{};n.exportAsync=async()=>new Uint8Array();
  return n;
 }
 const root=node('DOCUMENT');root.name='AMV Manager';
 const figma={root,editorType:'figma',fileKey:scene.targetFile,mixed:Symbol('mixed'),ui:{postMessage:m=>messages.push(m)},showUI(){},closePlugin(){},viewport:{scrollAndZoomIntoView(nodes){figma.focus=nodes;}},async setCurrentPageAsync(p){figma.currentPage=p;},async listAvailableFontsAsync(){return ['Regular','Medium','Bold'].map(style=>({fontName:{family:'Roboto',style}}));},async loadFontAsync(){},createPage(){const p=node('PAGE');root.appendChild(p);return p;},createTextStyle(){const s={id:String(++serial)};styles.set(s.id,s);return s;},createNodeFromSvg(){return node('FRAME');},combineAsVariants(nodes,parent){const set=node('COMPONENT_SET');parent.appendChild(set);for(const n of nodes)set.appendChild(n);return set;},variables:{createVariableCollection(){return {id:String(++serial),defaultModeId:'default'};},createVariable(){return {id:String(++serial),setValueForMode(){},setVariableCodeSyntax(){}};},setBoundVariableForPaint(p){return p;}}};
 for(const [method,type]of Object.entries({createText:'TEXT',createComponent:'COMPONENT',createFrame:'FRAME',createRectangle:'RECTANGLE',createEllipse:'ELLIPSE'}))figma[method]=()=>node(type);
 return {figma,messages};
}
async function run(code=runtime,env=environment()){
 // Structural heights are intentionally not tested here; they require Figma's engine.
 const source=code.replace("if(!scroller||scroller.height<100)","if(!scroller)");
 vm.runInNewContext(source,{figma:env.figma,__html__:'',AMV_SCENE:scene});
 env.messages.length=0;await env.figma.ui.onmessage({type:'import'});return env;
}
module.exports={environment,run};
if(require.main===module)(async()=>{
 const bad=runtime.replace('override(n,s.overrides);size(n,s,parent);',"override(n,s.overrides);size(n,s,parent);if(s.component==='CoverCompact'){n.findOne(c=>c.name==='Initials').x=4;}");
 const broken=await run(bad);const error=broken.messages.find(m=>m.type==='error');assert.match(error?.message||'',/relative-transform/);assert.equal(Object.keys(error.created.screens).length,0);assert.equal(error.stage,'Componente / ProjectRow');
 const partial=broken.figma.currentPage,partialChildren=partial.children.length;
 const fixed=await run(runtime,broken);const done=fixed.messages.find(m=>m.type==='done');assert.ok(done,JSON.stringify(fixed.messages.at(-1)));assert.equal(Object.keys(done.report.screens).length,28);assert.equal(Object.keys(done.report.components).length,25);assert.equal(partial.children.length,partialChildren);assert.match(done.report.pageName,/Reintento 2/);
 const page=fixed.figma.currentPage;assert.equal(page.flowStartingPoints.length,3);assert.equal(fixed.figma.focus[0].name,'01 · Proyectos');
 const row=page.findOne(n=>n.type==='INSTANCE'&&n.name==='ProjectRow');assert.ok(row.findOne(n=>n.type==='TEXT'&&n.characters==='Vi'));
 for(const key of ['Cover','CoverCompact']){const master=page.findOne(n=>n.type==='COMPONENT'&&n.name===key);assert.equal(master.findOne(n=>n.name==='Initials').constraints.horizontal,'MAX');}
 const count=fixed.figma.root.children.length;await run(runtime,fixed);assert.ok(fixed.messages.some(m=>m.type==='existing'));assert.equal(fixed.figma.root.children.length,count);
 const oldEnv=environment();const old=oldEnv.figma.createPage();old.name='AMV · Interfaces refinadas v0.2';await run(runtime,oldEnv);assert.ok(oldEnv.messages.some(m=>m.type==='done'));assert.equal(oldEnv.figma.root.children[0],old);assert.equal(old.name,'AMV · Interfaces refinadas v0.2');
 const result={status:'PASS_INSTANCE_CONTRACT_SIMULATION',version:scene.version,checks:['reported transform error reproduced before any screen','28 screens and 25 components rendered without illegal descendant geometry writes','text overrides survive in nested instances','constraints defined on masters','partial page preserved and retry created','complete page reused without duplication','old v0.2 page preserved','Proyectos focused'],limits:'Simulation only. Does not validate Figma layout or native rendering.'};
 fs.writeFileSync(path.join(__dirname,'qa-instance-contract-report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
