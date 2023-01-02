const path = require('path');
const fs = require('fs');
const { bundle } = require('@remotion/bundler');
const { getCompositions, renderMedia } = require('@remotion/renderer');

const start = async (compositionId, videoDir, onProgress) => {
  // The composition you want to render
  // const compositionId = id;

  // You only have to do this once, you can reuse the bundle.
  const entry = path.join(videoDir, 'index.js');
  // console.log('Creating a Webpack bundle of the video');
  const bundleLocation = await bundle(path.resolve(entry), () => undefined, {
    // If you have a Webpack override, make sure to add it here
    webpackOverride: (config) => config,
  });

  // Parametrize the video by passing arbitrary props to your component.
  /* const inputProps = {
    foo: 'bar',
  }; */

  // Extract all the compositions you have defined in your project
  // from the webpack bundle.
  const comps = await getCompositions(bundleLocation, {
    // You can pass custom input props that you can retrieve using getInputProps()
    // in the composition list. Use this if you want to dynamically set the duration or
    // dimensions of the video.
    // inputProps,
    chromiumOptions: {
      disableWebSecurity: true, // for disabling CORS
    },
    timeoutInMilliseconds: 2 * 60 * 1000, // 2 minutes
  });

  // Select the composition you want to render.
  const composition = comps.find((c) => c.id === compositionId);

  // Ensure the composition exists
  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found.
  Review "${entry}" for the correct ID.`);
  }

  const outputLocation = `server/out/${compositionId}.mp4`;
  // console.log('Attempting to render:', outputLocation);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation,
    // inputProps,
    onProgress:function(prog){
      console.log(prog)
    },
  });
  // Delete the files when the video is ready
  //fs.rmSync(videoDir, { recursive: true });
};

module.exports = {
  start,
};
