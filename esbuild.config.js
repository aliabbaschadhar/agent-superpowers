// esbuild.config.js
import esbuild from 'esbuild';

const isProduction = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  minify: isProduction,
  sourcemap: !isProduction ? 'inline' : false,
  logLevel: 'info',
  metafile: true,
};

async function main() {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('[esbuild] watching...');
  } else {
    const result = await esbuild.build(buildOptions);
    if (result.metafile) {
      const text = await esbuild.analyzeMetafile(result.metafile, { verbose: false });
      console.log(text);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
