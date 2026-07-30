#!/bin/bash

# Add captions to demo video using ffmpeg
# Usage: ./add-captions.sh input.webm output.mp4

INPUT_VIDEO="${1:-output/video.webm}"
OUTPUT_VIDEO="${2:-output/demo-with-captions.mp4}"
CAPTIONS_FILE="captions.srt"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg is not installed. Install it with:"
    echo "  brew install ffmpeg"
    exit 1
fi

# Check if input video exists
if [ ! -f "$INPUT_VIDEO" ]; then
    echo "Input video not found: $INPUT_VIDEO"
    echo ""
    echo "Looking for video files in output/..."
    ls -la output/*.webm 2>/dev/null || echo "No .webm files found"
    echo ""
    echo "Usage: ./add-captions.sh <input-video> <output-video>"
    exit 1
fi

echo "Adding captions to video..."
echo "Input: $INPUT_VIDEO"
echo "Output: $OUTPUT_VIDEO"
echo ""

# Convert and add subtitles (burned in)
ffmpeg -i "$INPUT_VIDEO" \
    -vf "subtitles=$CAPTIONS_FILE" \
    -c:v libx264 \
    -crf 23 \
    -preset medium \
    -c:a aac \
    -b:a 128k \
    -movflags +faststart \
    -y \
    "$OUTPUT_VIDEO"

if [ $? -eq 0 ]; then
    echo ""
    echo "Success! Video saved to: $OUTPUT_VIDEO"
    echo ""
    echo "File size: $(ls -lh "$OUTPUT_VIDEO" | awk '{print $5}')"
    
    # Open the video
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Opening video..."
        open "$OUTPUT_VIDEO"
    fi
else
    echo "Error: Failed to add captions"
    exit 1
fi
