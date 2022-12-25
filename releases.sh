#!/bin/bash
npm install
npm run build
mkdir -p releases/html releases/win releases/mac releases/linux
w4 bundle build/cart.wasm --title "Sk8r" \
  --html releases/html/index.html \
  --windows releases/win/sk8r.exe \
  --mac releases/mac/sk8r \
  --linux releases/linux/sk8r