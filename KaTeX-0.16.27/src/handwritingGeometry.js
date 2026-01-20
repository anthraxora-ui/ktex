// @flow
/**
 * Handwriting geometry rendering using perfect-freehand
 * This module converts geometric elements (square roots, fraction lines, etc.)
 * into handwritten-style SVG paths.
 */

// Try to import from module, fallback to global if available
let getStroke;
try {
    const pfh = require('perfect-freehand');
    getStroke = pfh.getStroke || pfh.default || pfh;
} catch (e) {
    // Fallback to global if loaded via CDN
    getStroke = (typeof window !== 'undefined' && window.getStroke) ||
                (typeof global !== 'undefined' && global.getStroke) ||
                function() { return []; }; // dummy fallback
}

/**
 * Convert a stroke array to SVG path data
 */
const strokeToPathData = function(stroke: number[][]): string {
    if (!stroke.length) return '';

    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ['M', ...stroke[0], 'Q']
    );

    d.push('Z');
    return d.join(' ');
};

/**
 * Generate wobbly points along a line to simulate handwriting
 */
const generateHandwrittenLine = function(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: {wobble?: number, segments?: number} = {}
): string {
    const wobble = options.wobble || 2;
    const segments = options.segments || 10;

    const points = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;

        // Add slight wobble perpendicular to line direction
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / len;
        const perpY = dx / len;

        const wobbleAmount = (Math.random() - 0.5) * wobble;

        points.push([
            x + perpX * wobbleAmount,
            y + perpY * wobbleAmount,
            0.5
        ]);
    }

    const stroke = getStroke(points, {
        size: 8,
        thinning: 0.3,
        smoothing: 0.5,
        streamline: 0.5,
        easing: t => t,
        simulatePressure: true,
    });

    return strokeToPathData(stroke);
};

/**
 * Generate handwritten square root path
 * Based on the original sqrtPath but with handwriting wobble
 */
export const sqrtHandwritten = function(
    extraVinculum: number,
    viewBoxHeight: number
): string {
    // Square root consists of:
    // 1. Small diagonal down-left
    // 2. Diagonal up-right (main diagonal)
    // 3. Horizontal line (vinculum) going right

    const paths = [];

    // Part 1: Small diagonal from top-left going down
    const part1 = generateHandwrittenLine(
        95, 622 + extraVinculum,
        60, 660 + extraVinculum,
        {wobble: 3, segments: 5}
    );
    paths.push(part1);

    // Part 2: Main diagonal going up from bottom-left
    const part2 = generateHandwrittenLine(
        60, 660 + extraVinculum,
        400, 40 + extraVinculum,
        {wobble: 4, segments: 20}
    );
    paths.push(part2);

    // Part 3: Horizontal vinculum line
    const part3 = generateHandwrittenLine(
        400, 40 + extraVinculum,
        400000, 40 + extraVinculum,
        {wobble: 3, segments: 30}
    );
    paths.push(part3);

    return paths.join(' ');
};

/**
 * Generate handwritten fraction line (horizontal rule)
 */
export const fractionLineHandwritten = function(
    width: number,
    thickness: number = 0.04
): {path: string, viewBox: string} {
    const height = thickness * 1000;
    const points = [];
    const segments = Math.max(10, Math.floor(width / 50));

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = t * width * 1000;
        const y = height / 2;

        // Add slight vertical wobble
        const wobbleAmount = (Math.random() - 0.5) * 5;

        points.push([x, y + wobbleAmount, 0.5]);
    }

    const stroke = getStroke(points, {
        size: height * 0.8,
        thinning: 0.2,
        smoothing: 0.6,
        streamline: 0.4,
        simulatePressure: true,
    });

    return {
        path: strokeToPathData(stroke),
        viewBox: `0 0 ${width * 1000} ${height}`,
    };
};

/**
 * Generate handwritten bracket path (vertical with corners)
 */
export const bracketHandwritten = function(
    type: 'left' | 'right',
    height: number
): string {
    const points = [];
    const segments = Math.max(15, Math.floor(height / 50));

    // Add top corner
    if (type === 'left') {
        points.push([50, 0, 0.5]);
        points.push([20, 0, 0.5]);
    } else {
        points.push([20, 0, 0.5]);
        points.push([50, 0, 0.5]);
    }

    // Add vertical line with wobble
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const y = t * height * 1000;
        const x = 20 + (Math.random() - 0.5) * 8;
        points.push([x, y, 0.5]);
    }

    // Add bottom corner
    if (type === 'left') {
        points.push([20, height * 1000, 0.5]);
        points.push([50, height * 1000, 0.5]);
    } else {
        points.push([50, height * 1000, 0.5]);
        points.push([20, height * 1000, 0.5]);
    }

    const stroke = getStroke(points, {
        size: 12,
        thinning: 0.3,
        smoothing: 0.5,
        streamline: 0.4,
        simulatePressure: true,
    });

    return strokeToPathData(stroke);
};

export default {
    sqrtHandwritten,
    fractionLineHandwritten,
    bracketHandwritten,
};
