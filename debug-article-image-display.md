# Debug Session: article-image-display

**Status**: [OPEN]
**Date**: 2026-08-08
**Issue**: Article cover images not displaying on homepage article list

## Symptom
- Homepage article cards show blank/white areas instead of cover images
- Affected articles use local image paths (e.g., `images/categories/general-machinery.webp`)
- Articles with external URLs (Unsplash) display correctly

## Hypotheses

### H1: articles.json contains incorrect image paths with `../` prefix
- Some articles (e.g., ID 12) have `"image": "../images/categories/general-machinery.webp"` 
- When `getBasePath()` returns `''` on homepage, the path becomes `../images/...` which resolves to wrong directory
- **Falsifiable**: Check if articles with `../` prefix are the ones failing

### H2: Image filenames with spaces cause URL encoding issues
- Some category images have spaces in filenames (e.g., `Other Special-purpose Equipment.webp`)
- `encodeImagePath` uses `encodeURI()` which encodes spaces to `%20`
- **Falsifiable**: Check network requests for images with spaces

### H3: `getImageSrc` path resolution bug between homepage and category pages
- `getBasePath()` returns `''` for homepage, `'../'` for category pages
- Combined with already-encoded paths, may produce double-prefixed or incorrect URLs
- **Falsifiable**: Log the final resolved image URL and compare with expected

### H4: onerror fallback mechanism fails when both primary and fallback images are missing
- If the original image path fails AND the fallback path also fails (e.g., same path), image shows blank
- **Falsifiable**: Check if fallback image file actually exists on disk

### H5: Editor uploadCover saves paths inconsistently across different scenarios
- `uploadCover` generates `../images/cover-xxx.webp` 
- `updateArticlesJson` strips `../` prefix, but might miss edge cases
- Some manually-added articles may not go through this cleanup
- **Falsifiable**: Check if all articles in articles.json have consistent path format

## Debug Plan
1. ✅ Static analysis of code complete
2. [ ] Start dev server and verify image loading
3. [ ] Add instrumentation to track image URL resolution
4. [ ] Collect runtime evidence
5. [ ] Fix based on evidence
6. [ ] Verify fix