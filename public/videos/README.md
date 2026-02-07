# Video Assets for Hero Section

## Quick Start - Adding Your Videos

### Step 1: Create the videos directory
```bash
mkdir -p bookmyhall/frontend/public/videos
```

### Step 2: Add your video files
Place your wedding venue videos in the `/public/videos/` directory:
```
/public/videos/
├── wedding-venue-1.mp4
├── wedding-venue-2.mp4
├── luxury-ballroom.mp4
└── garden-wedding.mp4
```

### Step 3: Update the video array
Edit `HeroSection.jsx` and replace the sample videos:

```javascript
const heroVideos = [
  {
    src: "/videos/wedding-venue-1.mp4",
    poster: "/images/outdoor_garden_wedding.png",
    title: "Elegant Wedding Venues"
  },
  {
    src: "/videos/luxury-ballroom.mp4",
    poster: "/images/heroposter.jpg", 
    title: "Luxury Ballrooms"
  },
  {
    src: "/videos/garden-wedding.mp4",
    poster: "/images/gem1.png",
    title: "Garden Weddings"
  }
];
```

## Current Status
✅ **Video functionality is ready and working**
✅ **Sample videos are included for testing**
🔄 **Replace sample videos with your wedding venue videos**

## Sample Videos Currently Active
The hero section now includes sample videos that will work immediately:
- Sample Video 1: Big Buck Bunny (for testing)
- Sample Video 2: Elephants Dream (for testing)

## Recommended Video Specifications

### Technical Requirements:
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 (Full HD) minimum
- **Aspect Ratio**: 16:9 (landscape)
- **Duration**: 15-45 seconds (optimal for web)
- **File Size**: 5-15MB per video
- **Frame Rate**: 30fps

### Content Suggestions for Wedding Venues:
1. **Ballroom Showcase**: Elegant lighting, decorated tables
2. **Garden/Outdoor Setup**: Natural lighting, ceremony setup
3. **Reception Area**: Dance floor, dining setup
4. **Venue Exterior**: Building facade, entrance
5. **Detail Shots**: Decor, lighting, architectural features

## Video Optimization Tips

### Before Adding Videos:
1. **Compress videos** using tools like:
   - HandBrake (free)
   - Adobe Media Encoder
   - FFmpeg (command line)

2. **Create poster images** (JPG/PNG):
   - Extract a frame from each video
   - Optimize for web (under 200KB)
   - Same aspect ratio as video

### Example FFmpeg Commands:
```bash
# Compress video for web
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 128k output.mp4

# Extract poster image
ffmpeg -i input.mp4 -ss 00:00:02 -vframes 1 poster.jpg
```

## How to Get Wedding Venue Videos

### Option 1: Stock Video Sites
- **Pexels Videos** (free): https://www.pexels.com/videos/
- **Unsplash Videos** (free): https://unsplash.com/videos
- **Pixabay Videos** (free): https://pixabay.com/videos/

Search terms: "wedding venue", "ballroom", "reception hall", "wedding ceremony"

### Option 2: Create Your Own
- Use smartphone or camera
- Focus on venue highlights
- Good lighting is essential
- Steady shots (use tripod if possible)

### Option 3: Hire a Videographer
- Professional quality
- Multiple angles and setups
- Proper lighting and equipment

## Testing the Video Feature

1. **Open your website**
2. **Look for the play button** (top right of hero section)
3. **Click to switch to video mode**
4. **Use video controls** (bottom right) to play/pause
5. **Click image button** to switch back to images

## Troubleshooting

### Videos Not Playing?
- Check file paths are correct
- Ensure videos are in `/public/videos/` directory
- Verify video format is MP4
- Check browser console for errors

### Performance Issues?
- Reduce video file sizes
- Use poster images
- Consider fewer videos
- Test on mobile devices

## Next Steps

1. **Replace sample videos** with your wedding venue content
2. **Add corresponding poster images**
3. **Test on different devices**
4. **Optimize file sizes** if needed

The video feature is now live and ready to showcase your beautiful wedding venues!