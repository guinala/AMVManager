const {chromium}=require('C:/Users/USUARIO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1030},deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:8765/prototipo.html');
  await page.evaluate(()=>localStorage.removeItem('amv-manager-design-v1'));
  await page.reload();
  const files=[];
  for(const [screen,label] of [['projects','Proyectos'],['new','Nuevo AMV'],['detail','Detalle'],['music','Música'],['clip','Fragmento'],['history','Historial']]){
    await page.locator(`[data-shortcut="${screen}"]`).click();
    if(screen==='new'){await page.locator('#app [data-action="example-character"]').click();await page.locator('#character-name').waitFor();}
    await page.locator('.scroll-content').evaluate(el=>el.scrollTop=0);
    await page.evaluate(()=>document.getElementById('toast').classList.remove('visible'));
    await page.locator('.phone').screenshot({path:path.join(__dirname,'preview',`pantalla-${screen}.png`)});
    await page.screenshot({path:path.join(__dirname,'preview',`vista-${screen}.png`),fullPage:true});
    files.push({screen,label});
  }
  const gallery=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AMV Manager · Vista de pantallas</title><style>body{margin:0;padding:44px;background:#100e10;color:#f8f2f3;font-family:"Segoe UI",sans-serif}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px}h1{font-size:28px;margin:0;letter-spacing:-.6px}p{color:#c5b8bd;font-size:13px;margin:8px 0}a{color:#e9a0b5;font-size:14px}main{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:22px}figure{margin:0;min-width:0}img{width:100%;height:auto;display:block}figcaption{font-size:14px;margin-bottom:15px;color:#e9a0b5}footer{border-top:1px solid #40343a;margin-top:30px;padding-top:16px;color:#c5b8bd;font-size:12px}@media(max-width:1000px){main{grid-template-columns:repeat(3,1fr)}}@media(max-width:600px){body{padding:20px}main{grid-template-columns:repeat(2,1fr);gap:14px}header{display:block}header a{display:inline-block;margin-top:16px}}</style></head><body><header><div><h1>AMV Manager</h1><p>Propuesta de interfaces y navegación · Identidad granate</p></div><a href="prototipo.html">Abrir prototipo interactivo ↗</a></header><main>${files.map(({screen,label},i)=>`<figure><figcaption>${i+1}. ${label}</figcaption><img src="preview/pantalla-${screen}.png" alt="Pantalla ${label}"></figure>`).join('')}</main><footer>Datos e imágenes de muestra. La búsqueda y la reproducción se simulan para revisar el recorrido.</footer></body></html>`;
  fs.writeFileSync(path.join(__dirname,'pantallas.html'),gallery,'utf8');
  await page.setViewportSize({width:1920,height:900});
  await page.goto('http://127.0.0.1:8765/pantallas.html');
  await page.screenshot({path:path.join(__dirname,'preview','resumen-pantallas.png'),fullPage:true});
  await browser.close();
  console.log('Capturadas seis pantallas y resumen visual.');
})().catch(error=>{console.error(error);process.exitCode=1;});
