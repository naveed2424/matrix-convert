import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { build as esbuild } from 'esbuild';
import { defineConfig, type Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeRequire = createRequire(import.meta.url);

async function buildDynamicSitemapInNode(rootDir: string, baseUrl?: string): Promise<string> {
  const entryPath = path.resolve(rootDir, 'src/utils/sitemapGenerator.ts');
  const bundled = await esbuild({
    entryPoints: [entryPath],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
    logLevel: 'silent',
    plugins: [
      {
        name: 'stub-static-assets',
        setup(pluginBuild) {
          pluginBuild.onLoad(
            { filter: /\.(jpg|jpeg|png|webp|gif|svg|css|woff2?|ttf|eot)$/i },
            () => ({ contents: 'module.exports = "";', loader: 'js' })
          );
        }
      }
    ]
  });

  const compiledCode = bundled.outputFiles[0].text;
  const mod = { exports: {} as any };
  const fn = new Function('exports', 'require', 'module', compiledCode);
  fn(mod.exports, nodeRequire, mod);

  const result = mod.exports.generateDynamicSitemap(baseUrl ? { baseUrl } : {});
  return result.xml as string;
}

function mimageDynamicSitemapPlugin(): Plugin {
  return {
    name: 'mimage-dynamic-sitemap',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '/';
        const pathname = rawUrl.split('?')[0];
        if ((req.method !== 'GET' && req.method !== 'HEAD') || pathname !== '/sitemap.xml') {
          return next();
        }
        try {
          const parsedUrl = new URL(rawUrl, 'http://localhost');
          const customBase = parsedUrl.searchParams.get('baseUrl') || undefined;
          const mod = await server.ssrLoadModule('/src/utils/sitemapGenerator.ts');
          const generated = mod.generateDynamicSitemap(
            customBase ? { baseUrl: customBase } : {}
          );
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(req.method === 'HEAD' ? undefined : generated.xml);
        } catch (err) {
          next(err);
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '/';
        const pathname = rawUrl.split('?')[0];
        if ((req.method !== 'GET' && req.method !== 'HEAD') || pathname !== '/sitemap.xml') {
          return next();
        }
        try {
          const parsedUrl = new URL(rawUrl, 'http://localhost');
          const customBase = parsedUrl.searchParams.get('baseUrl') || undefined;
          const xml = await buildDynamicSitemapInNode(__dirname, customBase);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.end(req.method === 'HEAD' ? undefined : xml);
        } catch (err) {
          next(err);
        }
      });
    },
    async closeBundle() {
      try {
        const xml = await buildDynamicSitemapInNode(__dirname);
        const publicTarget = path.resolve(__dirname, 'public/sitemap.xml');
        const distDir = path.resolve(__dirname, 'dist');
        const distTarget = path.resolve(distDir, 'sitemap.xml');
        fs.writeFileSync(publicTarget, xml, 'utf8');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(distTarget, xml, 'utf8');
        }
      } catch (err) {
        console.warn('[mimage-dynamic-sitemap] Build-time generation skipped:', err);
      }
    }
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), mimageDynamicSitemapPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 2000,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
