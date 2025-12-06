# Font Files

This directory contains custom font files for CloudQuote.

## Required Fonts

### Sansation
Sansation is a humanist sans-serif font with a modern, futuristic feel. It's used as the body font throughout the application.

**Required files:**
- `Sansation-Light.woff2` (weight: 300)
- `Sansation-Regular.woff2` (weight: 400)
- `Sansation-Bold.woff2` (weight: 700)

### How to obtain Sansation

1. Download Sansation from one of these sources:
   - [DaFont](https://www.dafont.com/sansation.font)
   - [Font Squirrel](https://www.fontsquirrel.com/fonts/sansation)

2. Convert the TTF files to WOFF2 format:
   - Use [Font Squirrel's Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)
   - Or use the `woff2` command-line tool

3. Place the converted WOFF2 files in this directory with the exact names listed above.

## Alternative (System Font Fallback)

If you don't add the Sansation font files, the application will gracefully fall back to system fonts:
- `-apple-system` (macOS/iOS)
- `BlinkMacSystemFont` (macOS Chrome)
- `Segoe UI` (Windows)
- `sans-serif` (generic)

The application will still work and look professional, just with the system default sans-serif font instead of Sansation.

## Other Fonts

The following fonts are loaded from Google Fonts and don't require local files:
- **Outfit** - Used for headings (geometric sans-serif)
- **JetBrains Mono** - Used for prices and numeric data (monospace)
