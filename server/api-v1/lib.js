const path = require('path');
const fs = require('fs');
const uniqString = require('uniq-string');

const { generatePlainRFC, generateRFC, arrToStr } = require('./jsonjsx');
const videoSchema = require('./validations');

function generateAnimationExpressions(data) {
  // getting data
  const { animations, fps } = data;
  // generating code expressions for indivitual animations
  let animExps;
  let newStyles = {};
  if (animations) {
    animExps = 'const frame = useCurrentFrame();';
    animations.forEach((anim) => {
      const exp = `const ${anim.style} = interpolate(frame, ${arrToStr(
        anim.durations.map((d) => d * fps),
      )}, ${arrToStr(anim.values)}, { extrapolateRight: 'clamp' }) + '${
        anim.unit ? anim.unit : ''
      }';`;
      animExps += exp;
      // updating styles
      newStyles[anim.style] = { As: anim.style }; // assuming anim.style is some CSS property
    });
  }
  return { animExps, newStyles };
}

function createVideoDir(name) {
  const dir = path.join('src', name || uniqString(10));
  // create directory
  fs.mkdirSync(dir);
  // create index.js file
  const indexjs = `
import {registerRoot} from 'remotion';
import Video from './Video';
registerRoot(Video); 
  `;
  fs.writeFileSync(path.join(dir, 'index.js'), indexjs);
  return dir;
}

function createTextElement(data, { dir, fps }) {
  // getting variables
  const { text, style, start, duration, animations } = data;
  const name = `Text${uniqString(10)}`;
  // generating code expressions for indivitual animations
  const { animExps, newStyles } = generateAnimationExpressions({ animations, fps });
  let animImports = {};
  if (animExps) animImports['{useCurrentFrame, interpolate}'] = { from: 'remotion' };
  const str = generateRFC({
    imports: {
      '{Sequence}': { from: 'remotion' },
      ...animImports,
    },
    name,
    body: animExps,
    jsonjsx: {
      type: 'Sequence',
      props: {
        layout: 'none',
        from: (start || 0) * fps,
        durationInFrames: duration ? duration * fps : Number.POSITIVE_INFINITY,
      },
      children: {
        type: 'p',
        props: {
          style: { ...style, ...newStyles },
        },
        children: text,
      },
    },
  });
  fs.writeFileSync(path.join(dir, name + '.js'), str);
  return name;
}

function createImageElement(data, { dir, fps }) {
  // getting variables
  const { src, style, animations, start, duration } = data;
  const name = `Img${uniqString(10)}`;
  // generating code expressions for indivitual animations
  const { animExps, newStyles } = generateAnimationExpressions({ animations, fps });
  let animImports = {};
  if (animExps) animImports['{useCurrentFrame, interpolate}'] = { from: 'remotion' };
  // determining src
  const extraImp = {};
  let s;
  if (src.localFile) {
    extraImp['{staticFile}'] = { from: 'remotion' };
    s = { As: `staticFile('${src.localFile}')` };
  } else {
    s = src.url;
  }
  const str = generateRFC({
    imports: {
      '{Img}': { from: 'remotion' },
      '{Sequence}': { from: 'remotion' },
      ...extraImp,
      ...animImports,
    },
    name,
    body: animExps,
    jsonjsx: {
      type: 'Sequence',
      props: {
        layout: 'none',
        from: (start || 0) * fps,
        durationInFrames: duration ? duration * fps : Number.POSITIVE_INFINITY,
      },
      children: {
        type: 'Img',
        props: {
          src: s,
          style: { ...style, ...newStyles },
        },
      },
    },
  });
  fs.writeFileSync(path.join(dir, name + '.js'), str);
  return name;
}

function createAudioElement(data, { dir, fps }) {
  // getting variables
  const { src, volume, muted, rate, loop, startFrom, endAt, start, duration } = data;
  const name = `Audio${uniqString(10)}`;
  // determining src
  const extraImp = {};
  let s;
  if (src.localFile) {
    extraImp['{staticFile}'] = { from: 'remotion' };
    s = { As: `staticFile('${src.localFile}')` };
  } else {
    s = src.url;
  }
  const str = generateRFC({
    imports: {
      '{Audio, Sequence}': { from: 'remotion' },
      ...extraImp,
    },
    name,
    jsonjsx: {
      type: 'Sequence',
      props: {
        from: (start || 0) * fps,
        durationInFrames: duration ? duration * fps : Number.POSITIVE_INFINITY,
      },
      children: {
        type: 'Audio',
        props: {
          src: s,
          volume,
          muted,
          rate,
          loop,
          startFrom: startFrom ? startFrom * fps : undefined,
          endAt: endAt ? endAt * fps : undefined,
        },
      },
    },
  });
  fs.writeFileSync(path.join(dir, name + '.js'), str);
  return name;
}

function createVideoElement(data, { dir, fps }) {
  // getting variables
  const { src, style, animations, volume, muted, rate, loop, startFrom, endAt, start, duration } =
    data;
  const name = `Video${uniqString(10)}`;
  // generating code expressions for indivitual animations
  const { animExps, newStyles } = generateAnimationExpressions({ animations, fps });
  let animImports = {};
  if (animExps) animImports['{useCurrentFrame, interpolate}'] = { from: 'remotion' };
  // determining src
  const extraImp = {};
  let s;
  if (src.localFile) {
    extraImp['{staticFile}'] = { from: 'remotion' };
    s = { As: `staticFile('${src.localFile}')` };
  } else {
    s = src.url;
  }
  const str = generateRFC({
    imports: {
      '{Video, Sequence}': { from: 'remotion' },
      ...extraImp,
      ...animImports,
    },
    name,
    body: animExps,
    jsonjsx: {
      type: 'Sequence',
      props: {
        from: (start || 0) * fps,
        durationInFrames: duration ? duration * fps : Number.POSITIVE_INFINITY,
      },
      children: {
        type: 'Video',
        props: {
          src: s,
          style: {
            ...style,
            ...newStyles,
          },
          volume,
          muted,
          rate,
          loop,
          startFrom: startFrom ? startFrom * fps : undefined,
          endAt: endAt ? endAt * fps : undefined,
        },
      },
    },
  });
  fs.writeFileSync(path.join(dir, name + '.js'), str);
  return name;
}

function createScene({ fps, elements, videoDir }) {
  const name = `Scene${uniqString(10)}`;
  // creating scene directory
  const sceneDir = path.join(videoDir, name);
  fs.mkdirSync(sceneDir);
  // creating elements for scene
  let indexjsImports = {};
  elements?.forEach((e, index) => {
    let element;
    if (e.type === 'text') {
      element = createTextElement(e, { dir: sceneDir, fps });
    } else if (e.type === 'image') {
      element = createImageElement(e, { dir: sceneDir, fps });
    } else if (e.type === 'audio') {
      element = createAudioElement(e, { dir: sceneDir, fps });
    } else if (e.type === 'video') {
      element = createVideoElement(e, { dir: sceneDir, fps });
    }
    const imp = {};
    imp[`Component${index}`] = { from: './' + element };
    indexjsImports = { ...indexjsImports, ...imp };
  });
  // generate code for scene component
  const indexjs = generateRFC({
    imports: {
      ...indexjsImports,
    },
    name,
    jsonjsx: {
      children: Object.keys(indexjsImports).map((item) => ({ type: item })),
    },
  });
  // write the code into the file
  fs.writeFileSync(path.join(sceneDir, 'index.js'), indexjs);
  // return the name of scene component on successfull creation of component
  return name;
}

function generateVideo(data) {
  // validating data
  videoSchema.validateSync(data);
  // getting variables
  const { width, height, style, duration, scenes, fps } = data;
  const id = uniqString(15);
  const name = `Video${id}`;
  // creating separate directory for the video
  const videoDir = createVideoDir(name);
  // creating scenes for the video
  let videojsImports = {};
  scenes?.forEach((scene) => {
    const sceneName = createScene({ elements: scene.elements, fps, videoDir });
    const sceneImport = {};
    sceneImport[sceneName] = { from: './' + sceneName };
    videojsImports = { ...videojsImports, ...sceneImport };
  });
  // generating code for video component along with composition
  const videojs = generateRFC({
    imports: {
      '{Composition, AbsoluteFill, Series}': { from: 'remotion' },
      ...videojsImports,
    },
    beforeBody: generatePlainRFC({
      name: 'Component',
      jsonjsx: {
        type: 'AbsoluteFill',
        props: {
          style,
        },
        children: {
          type: 'Series',
          children: Object.keys(videojsImports).map((imp, index) => {
          
              return  ({
                type: 'Series.Sequence',
                // scenes components are imported sequencially
                props: {
                  // by default Series.Sequence has absolute-fill layout, hence styles can be applied
                  style: scenes[index].style,
                  durationInFrames: scenes[index].duration ? scenes[index].duration * fps : undefined,
                  offset: scenes[index].offset ? scenes[index].offset * fps : undefined,
                },
                children: {
                  type: imp,
                },
              })

            }
          
          ),
        },
      },
    }),
    name: 'Video',
    jsonjsx: {
      children: {
        type: 'Composition',
        props: {
          id: id.toString(),
          width,
          height,
          fps,
          durationInFrames: fps * duration,
          component: { As: 'Component' },
        },
      },
    },
  });
  fs.writeFileSync(path.join(videoDir, 'Video.js'), videojs);
  return { name, compositionId: id.toString(), id, videoDir };
}

module.exports = {
  generateVideo,
};
