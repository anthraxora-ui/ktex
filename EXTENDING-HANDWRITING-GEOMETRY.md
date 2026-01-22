# Extending KaTeX Handwriting Geometry

## How to Add New Processors for Additional SVG Symbols

This guide shows you how to extend `katex-handwriting-geometry.js` to handle additional SVG symbols that KaTeX generates.

---

## 🎯 Understanding the Processor Pattern

Each processor follows this pattern:

```javascript
function processSomething() {
    let count = 0;
    const settings = MASTER_SETTINGS.category;

    // 1. Find elements by CSS selector
    document.querySelectorAll('.some-class').forEach(element => {
        // 2. Skip if already processed
        if (element.dataset.hwk) return;

        // 3. Mark as processed
        element.dataset.hwk = 'processor-name';

        // 4. Get dimensions and color
        const rect = element.getBoundingClientRect();
        const color = getColor(element);

        // 5. Hide or clear original
        clearSVG(element); // OR element.style.visibility = 'hidden';

        // 6. Generate handwritten path
        const roughOpts = getRoughOpts('category');
        const settings = getSettings('category');

        // 7. Draw to SVG
        drawRoughShape(svg, generator.line(...), color, settings);

        count++;
    });

    return count;
}
```

---

## 📝 Example: Adding \oiint and \oiiint Support

### Step 1: Add Settings to MASTER_SETTINGS

```javascript
export const MASTER_SETTINGS = {
    // ... existing settings ...

    // Add new category
    integral: {
        roughness: 2.0,
        bowing: 1.4,
        strokeSize: 2.5,
        ovalPadding: 0.1, // Custom setting
    },
};
```

### Step 2: Create the Processor Function

```javascript
// ═══════════════════════════════════════════════════════════════
// PROCESSOR 12: INTEGRAL OVERLAYS (\oiint, \oiiint)
// ═══════════════════════════════════════════════════════════════

function processIntegralOverlays() {
    let count = 0;
    const I = MASTER_SETTINGS.integral;

    // Find all SVG elements
    document.querySelectorAll('svg').forEach(svg => {
        if (svg.dataset.hwk) return; // Already processed

        const viewBox = svg.getAttribute('viewBox');
        if (!viewBox) return;

        const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);

        // Check if this is an oiint/oiiint overlay by dimensions
        // Source: KaTeX buildCommon.js svgData
        const isOiintSmall = Math.abs(vbWidth - 0.957) < 0.01 && Math.abs(vbHeight - 0.499) < 0.01;
        const isOiintLarge = Math.abs(vbWidth - 1.472) < 0.01 && Math.abs(vbHeight - 0.659) < 0.01;
        const isOiiintSmall = Math.abs(vbWidth - 1.304) < 0.01 && Math.abs(vbHeight - 0.499) < 0.01;
        const isOiiintLarge = Math.abs(vbWidth - 1.98) < 0.01 && Math.abs(vbHeight - 0.659) < 0.01;

        if (!isOiintSmall && !isOiintLarge && !isOiiintSmall && !isOiiintLarge) {
            return; // Not an integral overlay
        }

        svg.dataset.hwk = 'integral-overlay';

        const color = getColor(svg);
        const settings = getSettings('integral');
        const roughOpts = getRoughOpts('integral');

        clearSVG(svg);

        // Calculate oval dimensions
        const padding = I.ovalPadding;
        const ovalWidth = vbWidth * 1000 * (1 - padding * 2);
        const ovalHeight = vbHeight * 1000 * (1 - padding * 2);
        const ovalX = vbWidth * 1000 / 2;
        const ovalY = vbHeight * 1000 / 2;

        // Draw handwritten ellipse
        drawRoughShape(svg,
            generator.ellipse(ovalX, ovalY, ovalWidth, ovalHeight, roughOpts),
            color,
            settings
        );

        count++;
    });

    return count;
}
```

### Step 3: Add to Main Function

```javascript
export async function applyHandwritingGeometry() {
    if (!dependenciesLoaded) {
        await initDependencies();
    }

    const counts = {
        delimiters: processDelimiters(),
        hlines: processHorizontalLines(),
        sqrts: processSquareRoots(),
        xarrows: processExtensibleArrows(),
        braces: processStretchyBraces(),
        accents: processWideAccents(),
        cancel: processCancel(),
        strike: processStrikethrough(),
        boxed: processBoxed(),
        tableLines: processTableLines(),
        vectorArrows: processVectorArrows(),
        integralOverlays: processIntegralOverlays(), // ← ADD THIS
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log('[KaTeX-HWG v4.0] Applied to', total, 'elements:', counts);

    return counts;
}
```

---

## 🔍 How to Find New Selectors

### Method 1: Inspect Rendered KaTeX

```javascript
// Render some math
katex.render('\\oiint f(x,y) \\, dx \\, dy', element);

// Inspect the DOM
console.log(element.innerHTML);
```

Look for:
- CSS classes: `.some-class`
- SVG elements: `<svg viewBox="...">`
- Data attributes: `[data-something]`

### Method 2: Search KaTeX Source Code

```bash
# Find where KaTeX creates specific elements
grep -r "class.*oiint" KaTeX-0.16.27/src/
grep -r "staticSvg" KaTeX-0.16.27/src/
```

### Method 3: Use Browser DevTools

1. Render the symbol you want to target
2. Right-click → Inspect Element
3. Note the element structure and classes
4. Create a selector that uniquely identifies it

---

## 🎨 Drawing Techniques

### Technique 1: Rough.js Shapes (Sketchy Style)

```javascript
// Line
generator.line(x1, y1, x2, y2, roughOpts)

// Rectangle
generator.rectangle(x, y, width, height, roughOpts)

// Ellipse
generator.ellipse(centerX, centerY, width, height, roughOpts)

// Arc
generator.arc(x, y, width, height, startAngle, endAngle, closed, roughOpts)

// Curve (Bezier)
generator.curve([[x1,y1], [x2,y2], [x3,y3]], roughOpts)

// Polygon
generator.polygon([[x1,y1], [x2,y2], [x3,y3]], roughOpts)
```

### Technique 2: Perfect-Freehand (Calligraphy Style)

```javascript
// Create point array with pressure
const points = [
    [x, y, pressure], // pressure: 0-1
    [x, y, pressure],
    // ...
];

// Generate stroke
const stroke = getStroke(points, {
    size: 3.0,
    thinning: 0.25,
    smoothing: 0.4,
    streamline: 0.4,
    simulatePressure: true,
});

// Draw it
drawPoints(svg, points, color, settings);
```

### Technique 3: Combine Both

```javascript
// Use rough.js to get shape outline
const drawable = generator.curve([[x1,y1], [x2,y2], [x3,y3]], roughOpts);

// Then draw with perfect-freehand for natural strokes
drawRoughShape(svg, drawable, color, settings);
```

---

## 📋 Complete Example: Custom Integral Processor

Here's a full example you can copy-paste:

```javascript
// ADD TO MASTER_SETTINGS:
integral: {
    roughness: 2.0,
    bowing: 1.4,
    strokeSize: 2.5,
},

// ADD PROCESSOR FUNCTION:
function processIntegralOverlays() {
    let count = 0;
    const I = MASTER_SETTINGS.integral;

    document.querySelectorAll('.mop svg').forEach(svg => {
        if (svg.dataset.hwk) return;

        // Check parent for op-symbol class
        const parent = svg.closest('.mop.op-symbol');
        if (!parent) return;

        // Look for oval overlay (oiint/oiiint)
        const viewBox = svg.getAttribute('viewBox');
        if (!viewBox) return;

        const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);

        // Detect by dimensions (see KaTeX source)
        const isIntegralOverlay =
            (Math.abs(vbWidth - 0.957) < 0.01) ||
            (Math.abs(vbWidth - 1.472) < 0.01) ||
            (Math.abs(vbWidth - 1.304) < 0.01) ||
            (Math.abs(vbWidth - 1.98) < 0.01);

        if (!isIntegralOverlay) return;

        svg.dataset.hwk = 'integral-overlay';

        const color = getColor(svg);
        const settings = getSettings('integral');
        const roughOpts = getRoughOpts('integral');

        clearSVG(svg);

        // Draw oval
        const cx = vbWidth * 500;
        const cy = vbHeight * 500;
        const rx = vbWidth * 400;
        const ry = vbHeight * 350;

        drawRoughShape(svg,
            generator.ellipse(cx, cy, rx, ry, roughOpts),
            color,
            settings
        );

        count++;
    });

    return count;
}

// ADD TO applyHandwritingGeometry():
const counts = {
    // ... existing ...
    integralOverlays: processIntegralOverlays(),
};
```

---

## 🧪 Testing Your Processor

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
</head>
<body>
    <div id="test"></div>

    <script type="module">
        import { initDependencies, applyHandwritingGeometry }
            from './katex-handwriting-geometry.js';

        // Test your new symbol
        katex.render('\\oiint f(x,y) \\, dx \\, dy', document.getElementById('test'), {
            displayMode: true
        });

        // Apply handwriting
        await initDependencies();
        const counts = await applyHandwritingGeometry();

        console.log('Processed:', counts);
        // Should show: integralOverlays: 1
    </script>
</body>
</html>
```

---

## ✅ Checklist for New Processors

- [ ] Add settings to `MASTER_SETTINGS`
- [ ] Create processor function
- [ ] Find correct CSS selector
- [ ] Mark elements with `dataset.hwk`
- [ ] Hide or clear original
- [ ] Generate handwritten path
- [ ] Add to `applyHandwritingGeometry()`
- [ ] Test with example
- [ ] Check console log for count
- [ ] Verify visual result

---

## 🎯 Common Symbols to Target

Based on KaTeX structure, here are more symbols you could add:

### Already Handled ✅
- Delimiters, roots, fractions, arrows, braces, accents, cancel, boxes, tables, vectors

### Potentially Useful Additions 🚀
- `\int`, `\iint`, `\iiint` overlays
- `\oint` (contour integral)
- Custom horizontal/vertical lines
- More accent types
- Chemistry notation (with mhchem package)

---

## 💡 Tips

1. **Start Simple**: Test with one symbol first
2. **Use Console Logs**: Add `console.log(element)` to inspect
3. **Check Dimensions**: Many symbols identified by viewBox size
4. **Preserve Color**: Always use `getColor(element)` to match original
5. **Test Edge Cases**: Nested, small, large versions of symbols
6. **Performance**: Use `dataset.hwk` to avoid re-processing
7. **Cleanup**: Update `clearHandwritingGeometry()` if needed

---

## 📚 Resources

- **KaTeX Source**: `KaTeX-0.16.27/src/`
- **SVG Data**: `buildCommon.js` line 738
- **Rough.js Docs**: https://roughjs.com/
- **Perfect-Freehand**: https://github.com/steveruizok/perfect-freehand

---

## 🎉 You're Ready!

You now know how to:
1. ✅ Identify new KaTeX SVG symbols
2. ✅ Create custom processors
3. ✅ Add them to the module
4. ✅ Test and debug

Happy handwriting! 🖊️
