const {chromium}=require('C:/Users/USUARIO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const scene=require('./scene-spec.cjs');
(async()=>{
 const ids=new Set(scene.screens.map(s=>s.id));assert.equal(ids.size,scene.screens.length);
 const targets=[];function walk(n){if(n.to){assert.ok(ids.has(n.to),`Missing destination ${n.to}`);targets.push(n.to);}if(n.type==='instance')assert.ok(scene.components[n.component],`Missing component ${n.component}`);for(const c of n.children||[])walk(c);}
 Object.values(scene.components).forEach(walk);scene.screens.forEach(s=>walk(s.node));
 fs.mkdirSync(path.join(__dirname,'preview'),{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1280,height:1060},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/figma/revision.html');
 const overflows=[];
 for(const s of scene.screens){await page.locator(`[data-screen="${s.id}"]`).click();const root=page.locator('#device>div');const box=await root.boundingBox();assert.equal(box.width,412);assert.equal(box.height,892);const content=page.locator('#device .scroll');const measure=await content.evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth,height:e.clientHeight}));if(measure.scroll>measure.client+1)overflows.push({id:s.id,...measure});assert.ok(measure.height>300);await page.locator('#device').screenshot({path:path.join(__dirname,'preview',s.id+'.png')});}
 assert.deepEqual(errors,[]);assert.deepEqual(overflows,[]);
 await page.locator('[data-screen="new"]').click();await page.locator('#device [data-name="Buscar personaje"]').last().click();await page.waitForFunction(()=>location.hash==='#new-loading');await page.waitForFunction(()=>location.hash==='#new-found');
 await page.locator('#device [data-name="Button/primary"]').click();await page.waitForFunction(()=>location.hash==='#detail-idea');
 const result={status:'PASS_LOCAL_PREVIEW_ONLY',screens:scene.screens.length,componentDefinitions:Object.keys(scene.components).length,prototypeLinks:targets.length,checks:['all scene ids unique','all destinations exist','all components resolve','28 screens 412x892','no horizontal overflow','creation flow','no browser JS errors'],pending:['Execution and native screenshots inside the target Figma file']};
 fs.writeFileSync(path.join(__dirname,'qa-local-report.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
