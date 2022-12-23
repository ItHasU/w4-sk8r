#!/bin/bash
# This script converts pngs to code
w4 png2src --as player-running.png -o ../src/assets/player-running.ts
w4 png2src --as player-jumping.png -o ../src/assets/player-jumming.ts
w4 png2src --as player-falling.png -o ../src/assets/player-falling.ts
w4 png2src --as obstacle-trash.png -o ../src/assets/obstacle-trash.ts
w4 png2src --as obstacle-trash-down.png -o ../src/assets/obstacle-trash-down.ts
w4 png2src --as splash.png -o ../src/assets/splash.ts
