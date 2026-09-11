const fs=require('node:fs');
const path=require('node:path');
const scene=require('./scene-spec.cjs');
const serialized=JSON.stringify(scene);
fs.writeFileSync(path.join(__dirname,'scene.json'),JSON.stringify(scene,null,2));
fs.writeFileSync(path.join(__dirname,'scene.js'),'window.AMV_SCENE='+serialized+';\n');
fs.writeFileSync(path.join(__dirname,'code.js'),'const AMV_SCENE = '+serialized+';\n'+fs.readFileSync(path.join(__dirname,'import-runtime.js'),'utf8'));
console.log(JSON.stringify({screens:scene.screens.length,components:Object.keys(scene.components).length,colors:Object.keys(scene.palette).length,styles:Object.keys(scene.styles).length},null,2));
