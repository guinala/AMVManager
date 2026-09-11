// Regression checks for Figma's reported NAVIGATE contract; not a native render test.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {run}=require('./qa-instance-contract.cjs');
const scene=require('./scene-spec.cjs');
(async()=>{
 const env=await run(),done=env.messages.find(m=>m.type==='done');
 assert.ok(done,env.messages.find(m=>m.type==='error')?.message);
 const page=env.figma.currentPage;
 const screens=Object.fromEntries(scene.screens.map(s=>[s.id,page.children.find(n=>n.type==='FRAME'&&n.name===s.node.name)]));
 const click=destination=>[{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:destination.id,navigation:'NAVIGATE',transition:null}]}];
 // These reproduce both illegal patterns rather than just asserting a success count.
 const master=page.findOne(n=>n.type==='COMPONENT'&&n.name==='State=projects');
 await assert.rejects(master.findOne(n=>n.name==='Destino / Proyectos').setReactionsAsync(click(screens.home)),/different top-level frame/);
 await assert.rejects(screens.home.setReactionsAsync(click(screens.home)),/different top-level frame/);
 const otherPage=env.figma.createPage(),foreign=env.figma.createFrame();otherPage.appendChild(foreign);
 await assert.rejects(screens.home.setReactionsAsync(click(foreign)),/same page/);
 await assert.rejects(screens.home.setReactionsAsync(click({id:'missing'})),/different top-level frame/);
 const nested=env.figma.createFrame();foreign.appendChild(nested);
 await assert.rejects(screens.home.setReactionsAsync(click(nested)),/different top-level frame/);
 let count=0,navigationButtons=0;
 for(const [key,screen]of Object.entries(screens)){
  for(const n of [screen,...screen.findAll(()=>true)])for(const reaction of n.reactions||[]){
   for(const action of reaction.actions){
    const target=page.children.find(n=>n.id===action.destinationId);
    assert.equal(target?.type,'FRAME',`${key}: destination must be a page frame`);
    assert.notEqual(target,screen,`${key}: no self navigation`);count++;
   }
  }
  const nav=screen.findOne(n=>n.type==='INSTANCE'&&n.name.startsWith('Navigation/'));
  if(nav){for(const [name,target]of [['Proyectos','home'],['Música','music'],['Historial','history']]){
   const button=nav.findOne(n=>n.name==='Destino / '+name);assert.ok(button);
   if(key===target)assert.equal(button.reactions?.length||0,0);
   else{assert.equal(button.reactions?.[0].actions[0].destinationId,screens[target].id);navigationButtons++;}
  }}
 }
 assert.equal(count,done.report.reactions);assert.ok(navigationButtons>0);
 assert.ok(done.report.omittedSelfLinks.some(l=>l.screen==='home'&&l.node==='Destino / Proyectos'));
 assert.ok(done.report.omittedSelfLinks.some(l=>l.screen==='home'&&l.node==='Chip/selected'));
 assert.equal(master.findAll(n=>n.reactions?.length).length,0);
 assert.equal(screens.home.findOne(n=>n.name==='Button/primary').reactions[0].actions[0].destinationId,screens.new.id);
 assert.equal(screens['new-found'].findOne(n=>n.name==='Button/primary').reactions[0].actions[0].destinationId,screens['detail-idea'].id);
 assert.equal(screens['new-loading'].reactions[0].trigger.type,'AFTER_TIMEOUT');
 assert.equal(screens['new-loading'].reactions[0].actions[0].destinationId,screens['new-found'].id);
 assert.equal(page.flowStartingPoints.length,3);
 const result={status:'PASS_NAVIGATION_CONTRACT_SIMULATION',version:scene.version,screens:Object.keys(screens).length,reactions:count,navigationButtons,omittedSelfLinks:done.report.omittedSelfLinks.length,checks:['library sources and self-links rejected','missing, nested and cross-page destinations rejected','every generated reaction targets a different screen on the same page','tab navigation connected inside each screen instance','active tab and active filter have no self-navigation','masters have no screen navigation','new-project flow and loading transition connected'],limits:'Local API contract simulation. Native Figma execution remains pending.'};
 fs.writeFileSync(path.join(__dirname,'qa-navigation-contract-report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
