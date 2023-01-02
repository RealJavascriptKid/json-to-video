//This project is supposed to take exported video template from https://github.com/layerhub-io/react-design-editor 
//and generate remotion project off of it

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// list of videos in progress
const videosArr = [];

const validate = require('./validate')

app.post('/', async (req, res) => {
  try {

     const params = req.body;
     await validate(params);

      res.status(200).json(params)
    
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


app.listen(process.env.SERVER_PORT, () =>
  console.log(`Server started on http://localhost:${process.env.SERVER_PORT}`),
);
