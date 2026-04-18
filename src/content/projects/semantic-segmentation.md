---
title: "Real-Time Semantic Segmentation"
type: university
date: 2024-05-01
cover: /src/assets/projects/semantic-segmentation-cover.svg
tags: ["Computer Vision", "Deep Learning", "PyTorch"]
stack: ["Python", "PyTorch", "OpenCV", "CUDA"]
description: "Lightweight encoder-decoder network achieving real-time semantic segmentation on urban driving scenes at 38 FPS."
featured: true
links:
  github: https://github.com/matinmonshizadeh/semantic-segmentation
---

## Problem

Urban scene understanding requires per-pixel classification at interactive speed. Existing state-of-the-art models trade accuracy for latency in ways that make real-world deployment difficult on mid-range hardware.

## Approach

We designed a lightweight encoder-decoder with depthwise-separable convolutions and a multi-scale feature pyramid. The decoder uses bilinear upsampling with skip connections to recover spatial detail without heavy computation.

## Results

| Metric | Value |
|--------|-------|
| mIoU (Cityscapes val) | 72.4% |
| FPS (RTX 3080) | 38 |
| Parameters | 4.2M |

Qualitative results show clean boundaries on pedestrians and lane markings even under adverse lighting.
---
*This is a placeholder project entry. Replace with real content in Phase 8.*
