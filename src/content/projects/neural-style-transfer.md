---
title: "Neural Style Transfer with Adaptive Normalization"
type: university
date: 2023-11-01
cover: /src/assets/projects/neural-style-transfer-cover.svg
tags: ["Image Processing", "Generative Models", "PyTorch"]
stack: ["Python", "PyTorch", "PIL", "NumPy"]
description: "Fast arbitrary style transfer using adaptive instance normalization, supporting real-time video stylization at 20ms per frame."
featured: false
links:
  github: https://github.com/matinmonshizadeh/neural-style-transfer
---

## Problem

Classical neural style transfer (Gatys et al.) is iterative and takes minutes per image, making it impractical for interactive use or video. We needed a feed-forward approach that generalises to arbitrary style images without retraining.

## Approach

We adopted Adaptive Instance Normalization (AdaIN) to align the mean and variance of content features with those of the style image. A lightweight decoder reconstructs the stylised image from the normalised feature space in a single forward pass.

## Results

| Metric | Value |
|--------|-------|
| Inference time (512×512) | 18ms |
| Hardware | RTX 3080 |
| Style generalisation | Arbitrary (no retraining) |

Stylised video runs at 55 FPS with temporal consistency filtering applied.

---
*This is a placeholder project entry. Replace with real content in Phase 8.*
