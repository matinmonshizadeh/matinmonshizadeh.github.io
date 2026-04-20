---
title: The Dicee Game
type: game
date: 2022-06-01
cover: /images/projects/dicee.gif
description: Simple web application built with HTML, CSS, and JavaScript that
  simulates a dice roll whenever the page is refreshed. It was originally
  created as a practice project for a web development bootcamp. h
featured: false
tags:
  - Javascript
  - HTML
  - CSS
stack:
  - Javascript
  - HTML
  - CSS
links:
  github: https://github.com/matinmonshizadeh/The-Dicee-Game
  play: https://matinmonshizadeh.github.io/The-Dicee-Game/
---
## Problem

Ray marching with signed distance functions (SDFs) is a powerful technique for rendering implicit surfaces that can't be trivially rasterised. The challenge was building a compelling, interactive demo that runs at 60 FPS in the browser with no native plugins.

## Approach

All geometry is defined analytically via SDFs in a GLSL fragment shader. Soft shadows are computed with secondary ray marches; ambient occlusion is estimated from nearby SDF samples. Procedural terrain uses layered domain-warped noise functions.

## Results

| Feature                      | Detail         |
| ---------------------------- | -------------- |
| FPS (Chrome, RTX 3080)       | 60             |
| FPS (Chrome, integrated GPU) | 30–45          |
| Geometry                     | 100% SDF-based |
| Shader LOC                   | ~350           |

Fully interactive: mouse controls camera, scroll adjusts fog density.

- - -

*This is a placeholder project entry. Replace with real content in Phase 8.*
