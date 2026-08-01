# AlgoPatterns Demo Recording

Automated demo video recording with captions.

## Quick Start

### 1. Install dependencies

```bash
cd docs/demo

# Install Node dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Install ffmpeg (for adding captions)
brew install ffmpeg
```

### 2. Record the demo

```bash
npm run record
```

This will:
- Open a browser window
- Automatically navigate through the demo flow
- Record everything as a video
- Save to `output/` folder

### 3. Add captions

```bash
# Make the script executable
chmod +x add-captions.sh

# Find your video file
ls output/

# Add captions (replace with your video filename)
./add-captions.sh output/xxxxx.webm output/demo-final.mp4
```

## Files

| File | Description |
|------|-------------|
| `record-demo.ts` | Playwright script that records the demo |
| `captions.srt` | Subtitle file with demo captions |
| `add-captions.sh` | Script to burn captions into video |
| `demo-script.md` | Manual recording guide (if you prefer Kap) |
| `demo-code-snippets.md` | Code to paste during demo |

## Customization

### Change recording speed

In `record-demo.ts`, adjust:
```typescript
slowMo: 50,  // Higher = slower mouse movements
```

### Change video resolution

```typescript
viewport: { width: 1920, height: 1080 },  // 1080p
```

### Edit captions

Edit `captions.srt` - format is:
```
1
00:00:00,000 --> 00:00:04,000
Your caption text here
```

## Troubleshooting

### Video is too fast
- Increase `wait()` durations in the script
- Increase `slowMo` value

### Captions not showing
- Make sure `captions.srt` is in the same directory
- Check ffmpeg is installed: `ffmpeg -version`

### Browser doesn't open
- Run `npx playwright install chromium` again

## Output

Final video will be:
- Format: MP4 (H.264)
- Resolution: 1280x720
- With burned-in captions
- Ready for upload to YouTube, Twitter, Product Hunt
