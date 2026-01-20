# 🧪 Testing KaTeX Handwriting Geometry

## Step-by-Step Testing Guide

### Option 1: Quick Test with Standard KaTeX (Verify Setup)

This tests if your browser can load and render KaTeX properly.

**Steps:**
1. Open `test-standard-katex.html` directly in your browser
   - This uses CDN KaTeX (no handwriting, just standard)
   - If this works, your browser setup is good!
   - If this fails, check browser console for errors

**Expected Result:** You should see math rendered with straight lines and perfect geometry.

---

### Option 2: Test YOUR Handwriting Build (The Real Test!)

This tests your custom KaTeX build with handwriting features.

**You NEED a local web server** because browsers block loading local JS files.

#### Method A: Using Python (Easiest)

```bash
# Go to the ktex directory
cd /home/user/ktex

# Start Python web server
python3 -m http.server 8000
```

Then open in browser: **http://localhost:8000/test-local-server.html**

#### Method B: Using Node.js

```bash
cd /home/user/ktex

# Install http-server globally (once)
npm install -g http-server

# Start server
http-server -p 8000
```

Then open: **http://localhost:8000/test-local-server.html**

#### Method C: Using PHP

```bash
cd /home/user/ktex
php -S localhost:8000
```

Then open: **http://localhost:8000/test-local-server.html**

---

## 🎨 What to Look For

When the handwriting version works, you should see:

### Square Roots (√)
- ✅ **Wobbly diagonal line** (not perfectly straight)
- ✅ **Slightly uneven horizontal vinculum** (top line)
- ✅ **Natural hand-drawn appearance**
- ❌ NOT perfectly straight computer-generated lines

### Fraction Lines (―)
- ✅ **Wavy horizontal line** with slight variations
- ✅ **Varying thickness** like real pen strokes
- ✅ **Organic, hand-drawn feel**
- ❌ NOT perfectly straight CSS borders

### Combined Expressions
The quadratic formula should show BOTH:
- Handwritten square root
- Handwritten fraction line
- All in one expression!

---

## 🔍 Troubleshooting

### "katex is not defined" Error

**Problem:** Browser can't load KaTeX from file:// protocol

**Solution:** Use a local web server (see Method A, B, or C above)

### Can't See Handwriting Effect

**Check these:**

1. **Are you using the LOCAL build?**
   - File path should be `/KaTeX-0.16.27/dist/katex.min.js`
   - NOT `cdn.jsdelivr.net` or `katex.org`

2. **Is handwriting enabled?**
   ```bash
   # Check if USE_HANDWRITING is true
   grep "USE_HANDWRITING" KaTeX-0.16.27/src/svgGeometry.js
   grep "USE_HANDWRITING" KaTeX-0.16.27/src/functions/genfrac.js
   ```
   Both should show `const USE_HANDWRITING = true;`

3. **Is perfect-freehand bundled?**
   ```bash
   # Check if it's in the build
   grep -c "perfect-freehand\|getStroke" KaTeX-0.16.27/dist/katex.js
   ```
   Should show a number > 0

### Math Doesn't Render at All

**Check browser console:**
- Press F12 to open Developer Tools
- Look for JavaScript errors
- Common issues:
  - CORS errors → Use local server
  - katex not defined → Path is wrong
  - Syntax errors → File corruption

---

## 📊 Testing Checklist

- [ ] Standard KaTeX test (test-standard-katex.html) works
- [ ] Local server is running
- [ ] Local test (test-local-server.html) loads
- [ ] Square roots show wobbly lines
- [ ] Fraction lines are hand-drawn
- [ ] Quadratic formula combines both effects
- [ ] Console shows no errors

---

## 🎯 Next Steps After Testing

Once handwriting geometry works:

1. **Integrate with your handwriting fonts**
   - The geometry is now hand-drawn
   - Add your custom handwriting fonts for characters
   - Everything will look hand-written!

2. **Adjust handwriting intensity**
   - Edit `src/handwritingGeometry.js`
   - Change `wobble` values (higher = more wobbly)
   - Rebuild: `npm run build`

3. **Disable for specific elements**
   - Set `USE_HANDWRITING = false` in specific files
   - Mix handwriting and standard rendering

---

## 📝 Files Overview

| File | Purpose |
|------|---------|
| `test-standard-katex.html` | Basic test with CDN KaTeX (no handwriting) |
| `test-local-server.html` | Tests YOUR custom build (with handwriting) |
| `test-handwriting.html` | Old test file (may have path issues) |
| `KaTeX-0.16.27/dist/katex.min.js` | Your custom build with handwriting |
| `KaTeX-0.16.27/src/handwritingGeometry.js` | The handwriting engine |

---

## 💡 Pro Tips

1. **Compare side-by-side:**
   - Open standard test in one tab
   - Open local test in another tab
   - See the difference between standard and handwritten!

2. **Check the generated SVG:**
   - Right-click on a square root
   - "Inspect Element"
   - Look for `<svg>` with `<path>` elements
   - Handwritten version has complex path data

3. **Refresh to see variation:**
   - Handwriting uses random wobble
   - Each page load looks slightly different
   - This makes it more natural!

---

## ❓ Still Not Working?

If you've tried everything and it still doesn't work:

1. Check the browser console (F12) for error messages
2. Verify files exist:
   ```bash
   ls -lh KaTeX-0.16.27/dist/katex.min.js
   ```
3. Try rebuilding:
   ```bash
   cd KaTeX-0.16.27
   npm run build
   ```
4. Check if perfect-freehand is installed:
   ```bash
   ls node_modules/perfect-freehand/
   ```

Good luck! 🚀
