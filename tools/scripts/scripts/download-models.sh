#!/bin/bash

# Create models directory if it doesn't exist
mkdir -p public/models

# Download sample models from public repositories
echo "Downloading sample 3D models..."

# Makeup model (face with makeup textures)
curl -L "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/face-mask/model.gltf" -o public/models/makeup.gltf
curl -L "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/face-mask/model.bin" -o public/models/makeup.bin

# Hairstyle model (various hairstyles)
curl -L "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/hair-style/model.gltf" -o public/models/hairstyle.gltf
curl -L "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/hair-style/model.bin" -o public/models/hairstyle.bin

# Accessory model (glasses)
curl -L "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/glasses/model.gltf" -o public/models/accessory.gltf
curl -L "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/glasses/model.bin" -o public/models/accessory.bin

echo "Models downloaded successfully!" 