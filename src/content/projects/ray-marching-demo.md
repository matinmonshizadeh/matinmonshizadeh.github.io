---
title: "Ray Marching WebGL Demo"
type: game
date: 2024-02-01
cover: /src/assets/projects/ray-marching-cover.svg
tags: ["WebGL", "GLSL", "Computer Graphics", "Real-Time Rendering"]
stack: ["JavaScript", "WebGL", "GLSL"]
description: "Interactive ray marching renderer running entirely in a GLSL fragment shader, with procedural terrain, soft shadows, and atmospheric fog."
featured: true
links:
  github: https://github.com/matinmonshizadeh/ray-marching
  play: https://matinmonshizadeh.github.io/ray-marching
---

## Problem

Ray marching with signed distance functions (SDFs) is a powerful technique for rendering implicit surfaces that can't be trivially rasterised. The challenge was building a compelling, interactive demo that runs at 60 FPS in the browser with no native plugins.

## Approach

All geometry is defined analytically via SDFs in a GLSL fragment shader. Soft shadows are computed with secondary ray marches; ambient occlusion is estimated from nearby SDF samples. Procedural terrain uses layered domain-warped noise functions.

## Results

| Feature | Detail |
|---------|--------|
| FPS (Chrome, RTX 3080) | 60 |
| FPS (Chrome, integrated GPU) | 30–45 |
| Geometry | 100% SDF-based |
| Shader LOC | ~350 |

Fully interactive: mouse controls camera, scroll adjusts fog density.

---
*This is a placeholder project entry. Replace with real content in Phase 8.*
