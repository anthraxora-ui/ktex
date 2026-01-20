# 🚀 Quick Start - Testing Handwriting KaTeX

## ⚡ Fastest Way to Test

### Step 1: Start a Local Server

```bash
# In the /home/user/ktex directory:
python3 -m http.server 8000
```

### Step 2: Open in Browser

Open: **http://localhost:8000/test-standard-katex.html**

This uses standard KaTeX from CDN to verify your browser setup works.

### Step 3: Check Build

The custom build should have perfect-freehand, but let's verify:

```bash
cd /home/user/ktex/KaTeX-0.16.27
ls -lh dist/katex.js dist/katex.min.js
```

You should see:
- `katex.js` (~617 KB) - Development build
- `katex.min.js` (~276 KB) - Minified build

## 📊 Current Status

✅ **What's Working:**
- KaTeX build completes successfully
- Handwriting geometry code is written
- Test files are created

❌ **Current Issue:**
- perfect-freehand is NOT bundled in the webpack build
- Need to either:
  1. Fix webpack to bundle it properly
  2. Use CDN version of perfect-freehand
  3. Manually include it

## 🔧 Solution Options

### Option A: Use CDN (Easiest for Testing)

Edit `test-local-server.html` to load perfect-freehand from CDN:

```html
<!-- Add this BEFORE loading katex.min.js -->
<script src="https://unpkg.com/perfect-freehand@1.2.0/dist/perfect-freehand.umd.min.js"></script>
```

This makes `getStroke` available globally, but our code expects it as a module import.

### Option B: Bundle perfect-freehand Properly

The webpack config needs adjustment. The issue is:

1. `src/handwritingGeometry.js` imports `getStroke`
2. But webpack isn't including it in the bundle
3. Possibly due to tree-shaking or external configuration

**To Fix:**
- Make sure webpack processes perfect-freehand from node_modules ✅ (Done!)
- Ensure the code is actually called (not tree-shaken away)
- Check if rollup bundles it properly

### Option C: Create Standalone Build

Build a separate bundle with handwriting features:

```bash
cd KaTeX-0.16.27
# Create a bundled version with perfect-freehand included
npm run build
```

## 🎯 Next Steps

1. **Verify standard KaTeX works** (test-standard-katex.html)
2. **Check if perfect-freehand is in bundle:**
   ```bash
   grep -c "getStroke" dist/katex.js
   ```
   Should be > 0 if bundled
3. **Test local build** (test-local-server.html)
4. **If not working, use CDN approach temporarily**

## 📝 Files

- `test-standard-katex.html` - Standard KaTeX (CDN)
- `test-local-server.html` - Your custom build
- `TESTING-INSTRUCTIONS.md` - Detailed testing guide
- `src/handwritingGeometry.js` - Handwriting engine
- `dist/katex.js` - Built file

## Current Build Info

Build size: **617 KB** (unminified)
perfect-freehand bundle status: **Unknown** (need to verify)

Run this to check:
```bash
cd /home/user/ktex/KaTeX-0.16.27
npm run build 2>&1 | grep "perfect\|getStroke"
```
