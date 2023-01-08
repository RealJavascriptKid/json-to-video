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
       videoJSX += `<Scene${scene.idx}/>`
       delete scene.code;

   }

   video.code = `
        
   import { useCurrentFrame, useVideoConfig, interpolate, spring,
             registerRoot,  Composition, AbsoluteFill, Series  } from "remotion";


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
          width={1200}
          height={1200}
          fps={30}
          durationInFrames={150}
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

        sceneJSX += `<${componentName}/>`

        delete layer.code;
    }

    scene.code = `
        
    import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";


    ${scene.code}

    const Scene${scene.idx} = (props) => {
            const frame = useCurrentFrame();
            const {durationInFrames, fps} = useVideoConfig();
           
            return (
                <AbsoluteFill>
                    <Series>
                      <Series.Sequence
                        durationInFrames={150}
                      >
                       ${sceneJSX}
                      </Series.Sequence>
                    </Series>
                </AbsoluteFill>
            );
    }
    
    `

}

const parseLayer = async (layer) => {

    layer.style = await parseStyle(layer); 
    switch(layer.type.toLowerCase()){
        case 'background':
            layer.style.width = '100%';
            layer.style.height = '100%';
            layer.code = htmltoJSX.convert(`<div style="${stringifyStyle(layer.style)}"></div>`)
            break;
        case 'statictext':
            layer.code = htmltoJSX.convert(`<div style="${stringifyStyle(layer.style)}">${layer.text}</div>`)
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

    style['color'] = obj.fill || '#ffffff';

    style['line-height'] = obj.lineHeight || 1;

    if(obj.fontSize)
      style['font-size'] = obj.fontSize;

    if(obj.fontFamily)
      style['font-fontFamily'] = obj.fontFamily;

    if(obj.angle)
      style['transform'] = `rotate(${obj.angle}deg)`  
      

    return style;

}

const stringifyStyle = (styleObj) => {
    let css = '';
    for(let prop in styleObj){
      css += `${prop}:${styleObj[prop]};`
    }
    return css;
}

module.exports = parse;