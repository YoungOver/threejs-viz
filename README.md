# threejs-viz

Real-time 3D for the web with plain Three.js: product animations and interior walk-throughs that load in a browser tab, plus a headless recorder that turns them into MP4 for social media.

![](docs/orbit.gif)

## apartment-3d

Clay-style 3D model of a 54 m2 apartment built from the floor plan: walls cut to eye level, furniture blocks, soft shadows and an orbit camera. The same scene renders stills for the client presentation.

| | | |
|---|---|---|
| ![](docs/room3d.jpg) | ![](docs/room3d_1.jpg) | ![](docs/room3d_2.jpg) |

## product-animation

The electrical cabinet from [cad-engineering](https://github.com/YoungOver/cad-engineering): door opening, component reveal and camera moves driven by a timeline, light and dark versions.

| | | |
|---|---|---|
| ![](docs/anim3d_0.jpg) | ![](docs/anim3d_1.jpg) | ![](docs/anim3d_2.jpg) |

## tools/recorder.mjs

Deterministic frame recorder: opens a page in headless Chrome, drives the animation clock frame by frame through `window.renderAt(t)` and pipes frames to ffmpeg. No dropped frames regardless of machine speed.

```bash
node tools/recorder.mjs apartment-3d orbit.html orbit.mp4 12 1080 1080
```

## CGI

Product renders from the same pipeline:

| | |
|---|---|
| ![](docs/cgi_hero.jpg) | ![](docs/cgi_macro.jpg) |
