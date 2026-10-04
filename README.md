# JSON to Video

JSON to Video is a small Node.js project that converts structured JSON scene data into a Remotion-based video composition and renders it to MP4. The goal is to take design-editor exports (for example, LayerHub-style editor output) and turn them into animation-friendly video scenes without manually rewriting the scene in JSX.

This project includes:

- A validation layer for incoming JSON payloads
- A parser that converts scene/layer definitions into Remotion JSX
- A render pipeline that bundles and exports the final video
- A simple Express API for triggering generation
- Support for both a legacy v1 flow and a more compact v2 pipeline

## Features

- Accepts JSON scene data with frame size and layered scenes
- Supports common layer types such as:
  - `background`
  - `statictext`
  - `staticimage`
  - `staticpath`
- Converts layer metadata into inline Remotion JSX styles and components
- Generates a Remotion entry file at `src/api2vid.jsx`
- Renders MP4 output using the Remotion renderer
- Runs a lightweight local API on port `3000` by default

## Project structure

```text
json-to-video/
├── .env
├── package.json
├── remotion.config.js
├── public/
├── server/
│   ├── api-v1/
│   ├── api-v2/
│   └── out/
├── src/
│   ├── api2vid.jsx
│   ├── index.jsx
│   ├── Video.jsx
│   ├── HelloWorld.jsx
│   ├── HelloWorld/
│   └── libs/
├── temp/
├── node_modules/
├── package-lock.json
└── README.md
```

### Key folders

- `server/api-v2` — current lightweight API flow
- `server/api-v1` — older generation flow for experimental or legacy usage
- `src` — generated Remotion source and example compositions
- `server/out` — rendered output files
- `public` — uploaded files for the v1 upload flow

## Tech stack

- Node.js
- Express
- Remotion 4
- React
- Yup for request validation
- ESLint for static checks

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ recommended
- npm installed
- A local environment that can run the Remotion renderer

## Environment configuration

The project reads a local `.env` file with the server port.

Example:

```env
SERVER_PORT=3000
```

If the file is missing, some parts of the app may fail to start. The `.env` file is already included in the repo for this project.

## Installation

From the project root:

```bash
npm install
```

## Running the app

### Start the v2 API server

```bash
npm start
```

This starts the Express app in `server/api-v2/index.js`.

### Start in development mode with auto-reload

```bash
npm run develop
```

This uses `nodemon` to restart the server when files in the API directory change.

### Run the legacy v1 server

```bash
npm run start-v1
```

### Start the Remotion preview for a local composition

```bash
npm run run-remotion
```

### Run linting

```bash
npm test
```

## API overview

The current API is in `server/api-v2/index.js` and exposes a single POST endpoint at the server root.

### Endpoint

```http
POST http://localhost:3000/
```

### Request body

The request must include:

- `id`: a unique video identifier
- `frame`: an object with `width` and `height`
- `scenes`: an array of scenes, each containing:
  - `duration`
  - `layers`

Each layer can include properties like:

- `type`
- `left`, `top`
- `width`, `height`
- `opacity`
- `fill`
- `text`
- `src`
- `shadow`
- `scaleX`, `scaleY`
- `angle`

### Example payload

```json
{
  "id": "demo-video",
  "frame": {
    "width": 1080,
    "height": 1920
  },
  "scenes": [
    {
      "duration": 30,
      "layers": [
        {
          "type": "background",
          "left": 0,
          "top": 0,
          "width": 1080,
          "height": 1920,
          "fill": "#ffffff"
        },
        {
          "type": "statictext",
          "left": 100,
          "top": 200,
          "width": 500,
          "height": 120,
          "text": "Sample text with shadow",
          "fill": "#000000",
          "fontSize": 84,
          "shadow": {
            "color": "#000000",
            "blur": 25,
            "offsetX": 10,
            "offsetY": 10
          }
        },
        {
          "type": "staticimage",
          "left": 800,
          "top": 100,
          "width": 650,
          "height": 650,
          "src": "https://images.pexels.com/...jpeg"
        }
      ]
    }
  ]
}
```

### More advanced API example

This example creates a two-scene video, includes a branded background, a layered title, an image, and a full-width footer banner.

```bash
curl -X POST "http://localhost:3000/?build=true" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "marketing-preview",
    "frame": {
      "width": 1920,
      "height": 1080
    },
    "scenes": [
      {
        "duration": 60,
        "layers": [
          {
            "type": "background",
            "left": 0,
            "top": 0,
            "width": 1920,
            "height": 1080,
            "fill": "#0f172a"
          },
          {
            "type": "statictext",
            "left": 120,
            "top": 160,
            "width": 900,
            "height": 180,
            "text": "Launch Your Next Big Idea",
            "fill": "#f8fafc",
            "fontSize": 96,
            "fontFamily": "OpenSans-Bold",
            "shadow": {
              "color": "#000000",
              "blur": 12,
              "offsetX": 4,
              "offsetY": 6
            }
          },
          {
            "type": "statictext",
            "left": 120,
            "top": 330,
            "width": 1100,
            "height": 120,
            "text": "Turn product vision into motion storytelling.",
            "fill": "#cbd5e1",
            "fontSize": 42,
            "fontFamily": "OpenSans-Regular"
          },
          {
            "type": "staticimage",
            "left": 1180,
            "top": 130,
            "width": 550,
            "height": 720,
            "src": "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
            "shadow": {
              "color": "#000000",
              "blur": 20,
              "offsetX": 0,
              "offsetY": 18
            }
          },
          {
            "type": "staticpath",
            "left": 0,
            "top": 880,
            "width": 1920,
            "height": 200,
            "fill": "#22c55e",
            "path": [
              ["M", 0, 0],
              ["L", 1920, 0],
              ["L", 1920, 200],
              ["L", 0, 200],
              ["Z"]
            ]
          }
        ]
      },
      {
        "duration": 45,
        "layers": [
          {
            "type": "background",
            "left": 0,
            "top": 0,
            "width": 1920,
            "height": 1080,
            "fill": "#0b1120"
          },
          {
            "type": "statictext",
            "left": 180,
            "top": 280,
            "width": 1560,
            "height": 220,
            "text": "Built for modern campaigns, product launches, and brand stories.",
            "fill": "#ffffff",
            "fontSize": 68,
            "fontFamily": "OpenSans-SemiBold",
            "textAlign": "center"
          },
          {
            "type": "statictext",
            "left": 650,
            "top": 560,
            "width": 620,
            "height": 120,
            "text": "Ready to render",
            "fill": "#facc15",
            "fontSize": 52,
            "fontFamily": "OpenSans-Bold",
            "shadow": {
              "color": "#facc15",
              "blur": 12,
              "offsetX": 0,
              "offsetY": 0
            }
          }
        ]
      }
    ]
  }'
```

This request creates a multi-scene video timeline that the server converts into Remotion JSX and renders as an MP4 file with the `myvid` composition id.

### Response

The API validates the payload, parses the layers into Remotion code, optionally writes the generated file to `src/api2vid.jsx`, and returns the parsed object as JSON.

If `?build=true` is present in the request, the API runs the Remotion build/render step.

Example:

```bash
curl -X POST http://localhost:3000/?build=true \
  -H "Content-Type: application/json" \
  -d '{
    "id": "demo-video",
    "frame": {"width": 1080, "height": 1920},
    "scenes": [{"duration": 30, "layers": []}]
  }'
```

## How the conversion works

The v2 pipeline is roughly:

1. `validate.js` checks the incoming JSON shape
2. `parse.js` turns scenes and layers into Remotion JSX
3. `convert.js` writes the generated JavaScript into `src/api2vid.jsx`
4. `build.js` bundles and renders the final composition with Remotion

The generated output is a Remotion entry file that exports a composition with the final `myvid` video ID.

## Output

Rendered output files are produced in:

```text
server/out/
```

The render step uses the Remotion renderer to create MP4 output based on the generated composition.

## Notes and caveats

- The API expects a fairly structured JSON schema; malformed payloads are rejected.
- The project is designed for editor-export style data, not arbitrary user-generated media.
- Some legacy v1 endpoints handle file uploads and status tracking for an older video generation flow.
- The generated Remotion code in `src/api2vid.jsx` is overwritten when a new conversion is triggered.

## Development notes

This repo is best treated as a template or generator for converting design JSON into a video timeline. It is intentionally lightweight and focused on proof-of-concept generation rather than a large production pipeline.

If you want to adapt it for production use, the most likely next steps are:

- add stronger schema validation and richer layer support
- support more animation types and easing curves
- persist generated projects or metadata for reuse
- add a front-end UI for previewing JSON input and output video
- improve render status management and queueing

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

```text
MIT License

Copyright (c) 2026 RealJavascriptKid

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Troubleshooting

### Server is not starting

- Ensure dependencies are installed: `npm install`
- Check the `.env` file for `SERVER_PORT`
- Make sure port `3000` is not already in use

### Remotion render fails

- Confirm the generated `src/api2vid.jsx` file is valid JSX
- Check the input JSON for required properties like `width`, `height`, and `scenes`
- Review the terminal output for validation or bundling errors

### No video output is created

- Make sure the request includes `?build=true` if you expect the renderer to execute
- Check `server/out` for the generated MP4 file
- Confirm the composition ID matches the one in `build.js` (`myvid` by default)

## Useful scripts

```bash
npm start
npm run develop
npm run start-v1
npm run develop-v1
npm run debugvid1
npm run run-remotion
npm run upgrade
npm test
```

## Summary

This repository turns JSON scene definitions into Remotion timelines and renders them as videos. It is a useful starting point for appending a design-export workflow to a Node.js video-generation pipeline, especially for layered static compositions and simple motion-driven scenes.
