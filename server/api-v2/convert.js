
const fs = require('fs'),
      path = require('path');

//convert request for video
const convert = async (video) => {
   
  fs.writeFileSync(path.join(__dirname + '/../../src','api2vid.jsx'), video.code);

  return video;
}

module.exports = convert;