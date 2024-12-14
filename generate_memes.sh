#!/bin/bash

# Create images directory
mkdir -p images

# Generate 10 placeholder meme images with different colors and text
for i in {1..100}; do
    # Generate random hex colors
    color1=$(printf '%02x%02x%02x\n' $((RANDOM%256)) $((RANDOM%256)) $((RANDOM%256)))
    color2=$(printf '%02x%02x%02x\n' $((RANDOM%256)) $((RANDOM%256)) $((RANDOM%256)))
    
    # Create gradient image with text
    convert -size 400x400 \
        gradient:"#${color1}-#${color2}" \
        -gravity center \
        -pointsize 40 \
        -fill white \
        -draw "text 0,0 'Meme ${i}'" \
        "images/meme${i}.jpg"
    
    echo "Created meme${i}.jpg"
done

echo "All meme images have been generated in the images directory"
