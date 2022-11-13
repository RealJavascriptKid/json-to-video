require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const { generateVideo } = require('./lib');
const { start } = require('./utils');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// list of videos in progress
const videosArr = [];

app.post('/', (req, res) => {
  try {
    const data = generateVideo(req.body);
    const video = { name: data.name, id: data.id, progress: '0%', url: '' };
    videosArr.push(video);
    start(data.compositionId, data.videoDir, (prog) => {
      // updating progress values
      videosArr.find((v) => v.id === data.id).progress = `${
        Number(prog.progress).toFixed(0) * 100
      }%`;
    })
      .then(() => {
        // when rendering is done, add url to the video object
        videosArr.find(
          (v) => v.id === data.id,
        ).url = `http://localhost:${process.env.SERVER_PORT}/videos/${data.id}`;
      })
      .catch((e) => {
        // adding error details to video object
        videosArr.find((v) => v.id === data.id).error =
          'Error while rendering your video! Please check that your internet connection is stable.';
        'Error while rendering video\n' + e.message;
        // deleting code files
        fs.rmSync(data.videoDir, { force: true, recursive: true });
      });
    res.json(video);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/files', (req, res) => res.sendFile(path.join(__dirname, 'pages', 'fileupload.html')));

const upload = multer({ storage: storage });
app.post('/files', upload.single('file'), (req, res) => {
  console.log(req.file?.filename);
  res.json({ filename: req.file?.filename });
});

app.get('/:id', (req, res) => {
  try {
    const video = videosArr.find((v) => v.id === req.params.id);
    if (!video) throw new Error('Video not found');
    res.json(video);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/videos/:id', (req, res) => {
  try {
    const videoDir = path.join(__dirname, 'out', req.params.id + '.mp4');
    if (!fs.existsSync(videoDir)) throw new Error('Video not found');
    res.sendFile(videoDir);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.SERVER_PORT, () =>
  console.log(`Server started on http://localhost:${process.env.SERVER_PORT}`),
);
