const HTMLtoJSX = require('htmltojsx');
const htmltoJSX = new HTMLtoJSX({
    createClass: false,
});


//parse request for video
const parse = async (video) => {
   
   const {scenes,frame} = video;

   video.code = ``;

   let videoJSX = ``;

   let idx = 0;
   for(const scene of scenes){
      
       scene.idx = idx++
       await parseScene(scene);

       if(!scene.code)
          continue;

       video.code += scene.code;
       videoJSX += `<Scene${scene.idx}/>` + '\n'
       delete scene.code;

   }

   video.code = `
        
   import { useCurrentFrame, useVideoConfig, interpolate, spring,
             registerRoot,  Composition, AbsoluteFill, Series,
            Img  } from "remotion";


   ${video.code}

   const Video = (props) => {
           const frame = useCurrentFrame();
           const {durationInFrames, fps} = useVideoConfig();
          
           return (
               <AbsoluteFill>
                  ${videoJSX}
               </AbsoluteFill>
           );
   }

   function VideoComposition() {
    return (
      <>
        <Composition
          id={"myvid"}
          width={${frame.width}}
          height={${frame.height}}
          fps={30}
          durationInFrames={30}
          component={Video}
        />
      </>
    );
  }

  registerRoot(VideoComposition); 
   
   `
    
  return video;
}

const parseScene = async (scene) => {
  
    const {layers,duration} = scene;

    scene.code = ``;

    let sceneJSX = ``;

    let idx = 0;
    for(const layer of layers){
        layer.idx = idx++;
        await parseLayer(layer)
        
        if(!layer.code)
            continue;
        
        const componentName = `Scene${scene.idx}Layer${layer.idx}`
        scene.code += `
        const ${componentName} = (props) => {
                 
          return (
              <>
                 ${layer.code}
              </>
            );
        }
        `

        sceneJSX += `<${componentName}/>` + '\n'

        delete layer.code;
    }

    scene.code = `
        
    ${scene.code}

    const Scene${scene.idx} = (props) => {
            const frame = useCurrentFrame();
            const {durationInFrames, fps} = useVideoConfig();
           
            return (
                <AbsoluteFill>
                    <Series>
                      <Series.Sequence
                        durationInFrames={30}
                      >
                      <div style={{position:'relative',overflow:"hidden",width:"100%",height:"100%"}}>
                       ${sceneJSX}
                       </div>
                      </Series.Sequence>
                    </Series>
                </AbsoluteFill>
            );
    }
    
    `

}

const parseLayer = async (layer) => {

    layer.style = await parseStyle(layer); 
    let shadows = getShadows(layer.shadow)

    switch(layer.type.toLowerCase()){
        case 'background':
            layer.style.width = '100%';
            layer.style.height = '100%';
            layer.style['background-color'] = layer.fill || '#ffffff';
            layer.code = htmltoJSX.convert(`<div style="${stringifyStyle(layer.style)}"></div>`)
            break;
        case 'statictext':
            if(layer.shadow){              
              if(shadows.length)
                layer.style['text-shadow'] = shadows.join(',')
            }
            layer.style['color'] = layer.fill || '#000000';
            layer.code = htmltoJSX.convert(`<div style="${stringifyStyle(layer.style)}">${layer.text}</div>`)
            break;

        case 'staticimage':
          if(layer.shadow){              
            if(shadows.length)
              layer.style['text-shadow'] = shadows.join(',')
          }
          layer.code = htmltoJSX.convert(`<img style="${stringifyStyle(layer.style)}"/>`)
                                .replace('<img ',`<Img src={"${layer.src}"} `)
          break;
        case 'staticpath':
           layer.code = parseSVG(layer)
           break;

    }

}

const parseStyle = async (obj) => {

    const style = {}

    style['width'] = `${obj.width}px`;
    style['height'] = `${obj.height}px`;

    style['opacity'] = obj.opacity
    style['left'] = `${obj.left}px`;
    style['top'] = `${obj.top}px`;
    style['position'] = `absolute`;
    style['z-index'] = obj.idx;

    if(obj.textAlign)
      style['text-align'] = obj.textAlign

    

    style['line-height'] = obj.lineHeight || 1;

    if(obj.fontSize)
      style['font-size'] = `${obj.fontSize}px`;

    if(obj.fontFamily)
      style['font-fontFamily'] = obj.fontFamily;

    if(obj.angle)
      style['transform'] = `rotate(${obj.angle}deg)` 
      
    obj.scaleX = obj.scaleX || obj.scale || 1;

    obj.scaleY = obj.scaleY || obj.scale || 1;
      
    style['scale'] = `${obj.scaleX} ${obj.scaleY}`


    obj.originX = obj.originX || 'left';

    obj.originY = obj.originY || 'top';

    style['transform-origin'] = `${obj.originX} ${obj.originY}`

    return style;

}

const parseSVG = (layer) => {

  if(!layer.path || layer.type.toLowerCase() !== 'staticpath')
      return '';

  let str = ``;

  const path = layer.path;

  for (let p of path) {
    str += "\n" + p.shift() + " ";
    str += p.join(",");
  }

  let svg = `
      <svg xmlns="http://www.w3.org/2000/svg" style="${stringifyStyle(layer.style)}">
      <path
        d="${str}"
        fill="${layer.fill}"
      /></svg>
      `;
  return htmltoJSX.convert(svg);
}

const getShadows = (shadowObj) => {
        let shadows = [];
              
        if(!Array.isArray(shadowObj))
            shadowObj = [shadowObj]
             
        for(let s of shadowObj){
          s = {
            color: "#000000",
            blur: 0,
            offsetX: 0,
            offsetY: 0,
            affectStroke: false,
            nonScaling: false,
            ...s
          }
          // offset-x | offset-y | blur-radius | color 
          shadows.push(`${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.color}`)
        }
        return shadows;
}

const stringifyStyle = (styleObj) => {
    let css = '';
    for(let prop in styleObj){
      css += `${prop}:${styleObj[prop]};
              `
    }
    return css;
}

module.exports = parse;