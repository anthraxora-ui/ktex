import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const {targets} = require('./webpack.common');

process.env.NODE_ENV = 'esm';

export default targets
.filter(({entry}) => entry.endsWith('js'))
.map(({name, entry}) => ({
    input: entry.replace('.webpack', ''),
    output: {
        file: `dist/${name}.mjs`,
        format: 'es',
    },
    plugins: [
        resolve({
            preferBuiltins: false,
        }),
        babel({babelHelpers: 'runtime'}),
        commonjs(),
        alias({
            entries: [
                {find: 'katex', replacement: '../katex.mjs'},
            ],
        }),
    ],
    external: '../katex.mjs',
}));
