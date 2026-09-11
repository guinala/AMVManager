/* Compiled with scene-spec.cjs by build.cjs. Native Figma Plugin API, no dependencies. */
figma.showUI(__html__, {width:460,height:610,themeColors:true});
let busy=false;
figma.ui.postMessage({type:'ready',version:AMV_SCENE.version,fileName:figma.root.name,targetFile:AMV_SCENE.targetFile,count:AMV_SCENE.screens.length});
figma.ui.onmessage=async(message)=>{
  if(message.type==='close'){figma.closePlugin();return;}
  if(message.type!=='import'||busy)return;
  busy=true;
  const made={pages:[],nodes:[],collections:[],variables:[],styles:[],screens:{},components:{},reactions:0};
  const warnings=[];
  let stage='Preparación';
  try{
    if(figma.editorType!=='figma')throw new Error('Abre un archivo de diseño de Figma.');
    if(figma.fileKey&&figma.fileKey!==AMV_SCENE.targetFile)throw new Error('El archivo abierto no coincide con el enlace AMV Manager indicado. Abre ese archivo y vuelve a ejecutar el importador.');
    const previous=figma.root.children.filter(p=>p.name===AMV_SCENE.pageName||p.name.startsWith(AMV_SCENE.pageName+' · Reintento '));
    for(const old of previous){
      await old.loadAsync();
      const complete=AMV_SCENE.screens.every(s=>old.children.some(n=>n.type==='FRAME'&&n.name===s.node.name));
      if(complete&&old.flowStartingPoints.length===3){await figma.setCurrentPageAsync(old);const home=old.children.find(n=>n.name===AMV_SCENE.screens[0].node.name);old.selection=[home];figma.viewport.scrollAndZoomIntoView([home]);figma.ui.postMessage({type:'existing',message:'Las 28 pantallas ya existen en '+old.name+'. He seleccionado Proyectos y conservado tus cambios.'});busy=false;return;}
    }
    report('Comprobando tipografía y preparando el archivo…',2);
    const available=await figma.listAvailableFontsAsync();
    const fontNames={};
    for(const [weight,choices] of [[400,['Regular']],[500,['Medium']],[700,['Bold']]]){
      const match=available.find(f=>f.fontName.family===AMV_SCENE.font&&choices.includes(f.fontName.style));
      if(!match)throw new Error(`Falta ${AMV_SCENE.font} ${choices[0]}. Habilita esa fuente en Figma y vuelve a ejecutar. No se ha creado ningún diseño.`);
      fontNames[weight]=match.fontName;await figma.loadFontAsync(match.fontName);
    }
    const page=figma.createPage();let pageName=AMV_SCENE.pageName,retry=2;while(figma.root.children.some(p=>p!==page&&p.name===pageName))pageName=AMV_SCENE.pageName+' · Reintento '+retry++;page.name=pageName;made.pageName=pageName;made.version=AMV_SCENE.version;made.pages.push(page.id);await figma.setCurrentPageAsync(page);
    const rgb=hex=>({r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255});
    const namespace=pageName.replace(' · Interfaces refinadas','');
    const primitives=figma.variables.createVariableCollection(namespace+' / Primitivos');const semantic=figma.variables.createVariableCollection(namespace+' / Colores');const measures=figma.variables.createVariableCollection(namespace+' / Medidas');
    made.collections.push(primitives.id,semantic.id,measures.id);
    const vars={},dimensions={},textStyles={},components={};
    for(const [key,hex]of Object.entries(AMV_SCENE.palette)){
      const raw=figma.variables.createVariable(`color/${key}`,primitives,'COLOR');raw.scopes=[];raw.setValueForMode(primitives.defaultModeId,rgb(hex));raw.setVariableCodeSyntax('WEB',`var(--amv-raw-${key})`);raw.setVariableCodeSyntax('ANDROID',`AmvPalette.${key}`);
      const token=figma.variables.createVariable(key,semantic,'COLOR');token.scopes=['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];token.setValueForMode(semantic.defaultModeId,{type:'VARIABLE_ALIAS',id:raw.id});token.setVariableCodeSyntax('WEB',`var(--amv-${key})`);token.setVariableCodeSyntax('ANDROID',`AmvColors.${key}`);vars[key]=token;made.variables.push(raw.id,token.id);
    }
    for(const value of [0,4,6,8,10,12,14,16,18,20,24,28,32,40,48,52,56,60,64,76]){
      const v=figma.variables.createVariable(`espacio/${value}`,measures,'FLOAT');v.setValueForMode(measures.defaultModeId,value);v.scopes=['GAP','CORNER_RADIUS','WIDTH_HEIGHT'];v.setVariableCodeSyntax('WEB',`var(--amv-space-${value})`);v.setVariableCodeSyntax('ANDROID',`${value}.dp`);dimensions[value]=v;made.variables.push(v.id);
    }
    for(const[key,value]of Object.entries(AMV_SCENE.styles)){
      const style=figma.createTextStyle();style.name=`${namespace} / ${key}`;style.fontName=fontNames[value.weight];style.fontSize=value.size;style.lineHeight={unit:'PIXELS',value:value.line};textStyles[key]=style;made.styles.push(style.id);
    }
    const paint=(key)=>key&&key!=='transparent'?[figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(AMV_SCENE.palette[key])},'color',vars[key])]:[];
    const remember=node=>{made.nodes.push(node.id);return node;};
    function bindMeasure(n,key,value){n[key]=value;if(dimensions[value])n.setBoundVariable(key,dimensions[value]);}
    function pad(n,p){const a=typeof p==='number'?[p,p,p,p]:!p?[0,0,0,0]:p.length===2?[p[0],p[1],p[0],p[1]]:p;for(const[key,v]of Object.entries({paddingTop:a[0],paddingRight:a[1],paddingBottom:a[2],paddingLeft:a[3]}))bindMeasure(n,key,v);}
    function size(n,s,parent){
      const auto=parent&&parent.layoutMode&&parent.layoutMode!=='NONE';
      if(typeof s.w==='number')n.resize(s.w,n.height);if(typeof s.h==='number')n.resize(n.width,s.h);
      if(auto&&!s.absolute){if(s.w==='fill')n.layoutSizingHorizontal='FILL';else if(typeof s.w==='number')n.layoutSizingHorizontal='FIXED';else if(n.type==='FRAME'||n.type==='COMPONENT'||n.type==='TEXT')n.layoutSizingHorizontal='HUG';if(s.h==='fill')n.layoutSizingVertical='FILL';else if(typeof s.h==='number')n.layoutSizingVertical='FIXED';else if(n.type==='FRAME'||n.type==='COMPONENT'||n.type==='TEXT')n.layoutSizingVertical='HUG';}
      if(s.absolute){n.layoutPositioning='ABSOLUTE';n.x=s.x||0;n.y=s.y||0;}
    }
    function override(inst,values){
      for(const[key,value]of Object.entries(values||{})){
        if(key==='State'){const slot=inst.findOne(n=>n.type==='INSTANCE'&&n.name==='Slot / State');if(slot&&components[`Status/${value}`])slot.swapComponent(components[`Status/${value}`]);continue;}
        const property=Object.keys(inst.componentProperties).find(p=>p===key||p.startsWith(key+'#'));if(property)inst.setProperties({[property]:value});
        else{const matching=inst.findAll(n=>n.type==='TEXT'&&n.name===key);for(const t of matching)t.characters=String(value);}
      }
    }
    async function render(s,parent,{component=false,owner=null}={}){
      let n;
      if(s.type==='text'){
        n=remember(figma.createText());parent.appendChild(n);n.name=s.name;const st=AMV_SCENE.styles[s.style||'body'];n.fontName=fontNames[st.weight];await n.setTextStyleIdAsync(textStyles[s.style||'body'].id);n.characters=s.text;n.fills=paint(s.color||'text');if(s.size)n.fontSize=s.size;if(s.line)n.lineHeight={unit:'PIXELS',value:s.line};n.textAlignHorizontal=(s.alignText||'left').toUpperCase();n.textAutoResize='WIDTH_AND_HEIGHT';
        if(s.w==='fill'||typeof s.w==='number'||parent.layoutMode==='VERTICAL'&&!s.absolute){n.textAutoResize='HEIGHT';n.resize(typeof s.w==='number'?s.w:Math.max(20,parent.width-parent.paddingLeft-parent.paddingRight),n.height);s={...s,w:s.w||'fill'};}
        if(s.prop&&owner){const key=owner.addComponentProperty(s.prop,'TEXT',s.text);n.componentPropertyReferences={characters:key};}
        size(n,s,parent);if(s.constraints)n.constraints=s.constraints;
      }else if(s.type==='instance'){
        const base=components[s.component];if(!base)throw new Error(`Componente no preparado: ${s.component}`);n=remember(base.createInstance());parent.appendChild(n);n.name=s.slot?`Slot / ${s.slot}`:s.name;override(n,s.overrides);size(n,s,parent);
      }else if(s.type==='icon'||s.type==='art'){
        const col=AMV_SCENE.palette[s.color||'muted'];const w=typeof s.w==='number'?s.w:372,h=typeof s.h==='number'?s.h:128;
        const svg=s.type==='icon'?`<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${AMV_SCENE.icons[s.icon]||AMV_SCENE.icons.info}</svg>`:`<svg width="${w}" height="${h}" viewBox="0 0 372 128" xmlns="http://www.w3.org/2000/svg"><path d="M-50 140 150-30h65L15 140zM115 150 315-20h55L170 150z" fill="${AMV_SCENE.palette.coverLine}"/><path d="m-5 105 155-135M125 145 345-40" stroke="${AMV_SCENE.palette.accent}" stroke-opacity=".3"/></svg>`;
        n=remember(figma.createNodeFromSvg(svg));parent.appendChild(n);n.name=s.name;for(const v of n.findAll(()=>true)){made.nodes.push(v.id);if(s.type==='icon'){if(Array.isArray(v.fills)&&v.fills.some(p=>p.type==='SOLID'))v.fills=paint(s.color||'muted');if(Array.isArray(v.strokes)&&v.strokes.some(p=>p.type==='SOLID'))v.strokes=paint(s.color||'muted');}}size(n,s,parent);
      }else if(s.type==='rect'){
        n=remember(figma.createRectangle());parent.appendChild(n);n.name=s.name;n.resize(typeof s.w==='number'?s.w:100,s.h||1);n.fills=paint(s.bg);if(s.radius)bindMeasure(n,'cornerRadius',s.radius);size(n,s,parent);
      }else if(s.type==='timeline'||s.type==='slider'){
        n=remember(figma.createFrame());parent.appendChild(n);n.name=s.name;n.resize(typeof s.w==='number'?s.w:Math.max(20,parent.width-parent.paddingLeft-parent.paddingRight),s.h);n.fills=[];size(n,s,parent);
        const bg=remember(figma.createRectangle());n.appendChild(bg);bg.name='Pista';bg.resize(n.width,s.type==='slider'?4:10);bg.y=(s.h-bg.height)/2;bg.fills=paint('outline');bg.cornerRadius=3;bg.constraints={horizontal:'STRETCH',vertical:'CENTER'};
        if(s.type==='slider'){const k=remember(figma.createEllipse());n.appendChild(k);k.name='Control deslizante';k.resize(20,20);k.x=(n.width-20)*s.progress;k.y=(s.h-20)/2;k.fills=paint('accent');k.constraints={horizontal:'SCALE',vertical:'CENTER'};}
        else{const bar=remember(figma.createRectangle());n.appendChild(bar);bar.name='Intervalo seleccionado';bar.resize(n.width*(s.end-s.start)/s.duration,18);bar.x=n.width*s.start/s.duration;bar.y=(s.h-18)/2;bar.fills=paint('primary');bar.constraints={horizontal:'SCALE',vertical:'CENTER'};for(const x of[bar.x,bar.x+bar.width-2]){const mark=remember(figma.createRectangle());n.appendChild(mark);mark.name='Marca de tiempo';mark.resize(2,26);mark.x=x;mark.y=(s.h-26)/2;mark.fills=paint('accent');mark.constraints={horizontal:'SCALE',vertical:'CENTER'};}}
      }else{
        n=remember(component?figma.createComponent():figma.createFrame());parent.appendChild(n);n.name=s.name;n.layoutMode=s.dir==='horizontal'?'HORIZONTAL':'VERTICAL';n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode='AUTO';n.resize(typeof s.w==='number'?s.w:372,typeof s.h==='number'?s.h:10);n.fills=paint(s.bg);n.clipsContent=Boolean(s.clip);bindMeasure(n,'itemSpacing',s.gap||0);pad(n,s.padding);if(s.radius)bindMeasure(n,'cornerRadius',s.radius);if(s.stroke){n.strokes=paint(s.stroke);n.strokeWeight=1;n.strokeAlign='INSIDE';}n.counterAxisAlignItems=s.align==='center'?'CENTER':s.align==='end'?'MAX':'MIN';n.primaryAxisAlignItems=s.justify==='center'?'CENTER':s.justify==='between'?'SPACE_BETWEEN':'MIN';
        if(typeof s.w==='number'||s.w==='fill'){if(n.layoutMode==='VERTICAL')n.counterAxisSizingMode='FIXED';else n.primaryAxisSizingMode='FIXED';}if(typeof s.h==='number'||s.h==='fill'){if(n.layoutMode==='VERTICAL')n.primaryAxisSizingMode='FIXED';else n.counterAxisSizingMode='FIXED';}
        size(n,s,parent);for(const child of s.children||[])await render(child,n,{owner:component?n:owner});if(s.scroll)n.overflowDirection='VERTICAL';if(component)n.description=s.description||`AMV Manager / ${s.name}. Componente editable con Auto Layout y variables.`;
      }
      return n;
    }
    report('Creando variables y componentes editables…',12);
    let idx=0;
    for(const[key,spec]of Object.entries(AMV_SCENE.components)){
      stage='Componente / '+key;const node=await render(spec,page,{component:true});components[key]=node;node.x=100+(idx%4)*460;node.y=1700+Math.floor(idx/4)*300;made.components[key]=node.id;idx++;
    }
    for(const family of ['Button','Input','Chip','Status','Navigation']){
      stage='Variantes / '+family;
      const entries=Object.entries(components).filter(([k])=>k.startsWith(family+'/'));entries.forEach(([key,n])=>n.name=`State=${key.split('/')[1]}`);
      const set=remember(figma.combineAsVariants(entries.map(([,n])=>n),page));set.name=`AMV / ${family}`;set.description='Cambia State y las propiedades de texto desde la instancia. Colores y medidas vinculados a variables.';const familyIndex=['Button','Input','Chip','Status','Navigation'].indexOf(family);set.x=100+familyIndex*560;set.y=3500;set.layoutMode='VERTICAL';set.itemSpacing=16;set.paddingTop=24;set.paddingBottom=24;set.paddingLeft=24;set.paddingRight=24;set.primaryAxisSizingMode='AUTO';set.counterAxisSizingMode='AUTO';set.fills=paint('surface');set.cornerRadius=16;
    }
    stage='Guía y fundamentos';
    const headerSpec={type:'frame',name:'00 · Guía del archivo',dir:'vertical',w:1460,gap:20,padding:40,bg:'surface',radius:20,children:[{type:'text',name:'Título',text:'AMV Manager',style:'display',color:'text'},{type:'text',name:'Subtítulo',text:`Interfaces refinadas · ${AMV_SCENE.screens.length} pantallas y estados · Android 412 × 892`,style:'heading',color:'accent'},...AMV_SCENE.notes.map((text,i)=>({type:'text',name:`Nota ${i+1}`,text,style:'body',color:'muted',w:'fill'}))]};
    const intro=await render(headerSpec,page);intro.x=100;intro.y=100;
    const swatches={type:'frame',name:'01 · Paleta y tipografía',dir:'vertical',w:1460,gap:24,padding:32,bg:'surface',radius:20,children:[{type:'text',name:'Título',text:'Fundamentos visuales',style:'title',color:'text'},...['background','surface','primary','accent','text','muted'].map(key=>({type:'frame',name:`Color / ${key}`,dir:'horizontal',w:'fill',h:52,gap:20,align:'center',children:[{type:'rect',name:key,w:64,h:44,bg:key,radius:8},{type:'text',name:'Nombre',text:`${key}   ${AMV_SCENE.palette[key]}`,style:'body',color:'text'}]})),{type:'text',name:'Tipografía',text:'Roboto · Titulares 30/36 · Secciones 18/24 · Texto 14/21 · Etiquetas 12/16',style:'body',color:'muted'}]};
    const foundation=await render(swatches,page);foundation.x=100;foundation.y=680;
    const frameMap={};let index=0;
    for(const screen of AMV_SCENE.screens){
      stage='Pantalla / '+screen.name;
      report(`Construyendo ${screen.name}…`,25+Math.round(index/AMV_SCENE.screens.length*57));
      const frame=await render(screen.node,page);frame.x=3200+(index%6)*508;frame.y=100+Math.floor(index/6)*1060;frameMap[screen.id]=frame;made.screens[screen.id]={id:frame.id,name:screen.name};
      const caption=await render({type:'text',name:`Guía / ${screen.id}`,text:`${screen.name}\n${screen.description||screen.group}`,style:'small',color:'muted',w:412},page);caption.x=frame.x;caption.y=frame.y+912;index++;
    }
    figma.currentPage.selection=[frameMap.home];figma.viewport.scrollAndZoomIntoView([frameMap.home]);
    report('Las 28 pantallas están creadas. Conectando la navegación…',85);
    stage='Navegación y validación';
    // Resolve links on the actual screen instances, never on library masters.
    const links=[];made.omittedSelfLinks=[];
    function collectLinks(spec,node,screenId){
      if(!node)throw new Error(`Capa ausente en ${screenId}: ${spec.name}`);
      const definition=spec.type==='instance'?AMV_SCENE.components[spec.component]:spec;
      if(!definition)throw new Error(`Definición ausente: ${spec.component}`);
      const to=spec.to||definition.to;
      if(to)links.push({node,to,screenId,trigger:{type:'ON_CLICK'}});
      for(const [i,child]of (definition.children||[]).entries())collectLinks(child,node.children[i],screenId);
    }
    for(const screen of AMV_SCENE.screens){
      collectLinks(screen.node,frameMap[screen.id],screen.id);
      if(screen.autoTo)links.push({node:frameMap[screen.id],to:screen.autoTo,screenId:screen.id,trigger:{type:'AFTER_TIMEOUT',timeout:0.9}});
    }
    const planned=[];
    for(const link of links){
      const target=frameMap[link.to];let sourceFrame=link.node;
      while(sourceFrame.parent&&sourceFrame.parent.type!=='PAGE')sourceFrame=sourceFrame.parent;
      if(!target||target.type!=='FRAME'||target.parent!==page||sourceFrame!==frameMap[link.screenId]||sourceFrame.parent!==page)
        throw new Error(`Enlace inválido: ${link.screenId} / ${link.node.name} → ${link.to}. Debe conectar pantallas de esta página.`);
      if(sourceFrame===target){made.omittedSelfLinks.push({screen:link.screenId,node:link.node.name,to:link.to});continue;}
      planned.push({...link,target});
    }
    for(const link of planned){
      stage=`Enlace / ${link.screenId} / ${link.node.name} → ${link.to}`;
      await link.node.setReactionsAsync([{trigger:link.trigger,actions:[{type:'NODE',destinationId:link.target.id,navigation:'NAVIGATE',transition:{type:'DISSOLVE',easing:{type:'EASE_OUT'},duration:0.16},resetScrollPosition:true}]}]);made.reactions++;
    }
    stage='Validación de pantallas';
    const allText=page.findAll(n=>n.type==='TEXT');const wrongFonts=allText.filter(n=>n.fontName===figma.mixed||n.fontName.family!==AMV_SCENE.font);if(wrongFonts.length)throw new Error(`Hay ${wrongFonts.length} textos con tipografía inesperada. Revisa la página antes de usarla.`);
    const structural=[];for(const[key,n]of Object.entries(frameMap)){if(Math.abs(n.width-412)>.1||Math.abs(n.height-892)>.1)structural.push(key);const scroller=n.findOne(c=>c.name==='Contenido desplazable');if(!scroller||scroller.height<100)structural.push(`${key}:contenido`);}if(structural.length)throw new Error(`Marcos fuera de tamaño: ${structural.join(', ')}`);
    page.flowStartingPoints=[{name:'AMV · Recorrido principal',nodeId:frameMap.home.id},{name:'AMV · Crear un proyecto',nodeId:frameMap.new.id},{name:'AMV · Elegir fragmento',nodeId:frameMap.clip.id}];
    figma.currentPage.selection=[frameMap.home];figma.viewport.scrollAndZoomIntoView([frameMap.home]);
    figma.ui.postMessage({type:'done',report:{...made,warnings,textCount:allText.length,font:AMV_SCENE.font,validation:'Tamaño de marcos, fuentes y destinos comprobados dentro de Figma. La revisión visual humana sigue siendo necesaria.'}});
    // Native previews of the actual imported file, for review in the plugin window.
    for(const key of ['home','new-found','detail-editing','music','clip','history']){try{const bytes=await frameMap[key].exportAsync({format:'PNG',constraint:{type:'SCALE',value:.6}});figma.ui.postMessage({type:'preview',name:made.screens[key].name,bytes});}catch(e){figma.ui.postMessage({type:'preview-error',message:String(e)});}}
    busy=false;
  }catch(error){busy=false;figma.ui.postMessage({type:'error',message:String(error.message||error),stage,created:{...made,stage,error:String(error.message||error),stack:error.stack}});}
};
function report(message,progress){figma.ui.postMessage({type:'progress',message,progress});}
