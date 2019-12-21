import * as chokidar from 'chokidar';
import { promises } from 'fs';
import { mdToHtml, highlight } from '../html-loader/loader';
import { createHash } from 'crypto';
import { join, basename, dirname } from 'path';
import chalk from 'chalk';

class MdVar {
  result: string;

  private map = new Map<string, string>();

  get(key: string) {
    return this.map.get(key);
  }
  constructor(md: string) {
    this.result = md.replace(/{@([^\s]+)\s([^}]+)}\n/g, (_, key: string, value: string) => {
      this.map.set(key, value);
      return '';
    });
  }

}

const serveConf = {
  cleanUrls: false,
  'headers': [
    {
      'source': '**',
      'headers': [
        {
          'key': 'Access-Control-Allow-Origin',
          'value': '*'
        }
      ]
    }
  ]
};

const { writeFile, readFile, mkdir, rmdir } = promises;

const watcher = chokidar.watch([
  './src/app/**/*.md',
  './src/app/**/*.html',
  './src/app/**/*.ts'
], {
  awaitWriteFinish: {
    stabilityThreshold: 200,
    pollInterval: 100
  }
});

const start = async () => {
  console.log(chalk.green('Markdown to Html'));

  // Clean
  await rmdir('src/api/docs', { recursive: true });
  await mkdir('src/api/docs', { recursive: true });
  await mkdir('src/api/docs/demos', { recursive: true });
  await writeFile('src/api/docs/serve.json', JSON.stringify(serveConf));
  watcher.on('all', async (_ev, path, stats) => {
    if (stats && stats.isFile && path.startsWith('src/app/docs')) {
      // md to html
      if (path.endsWith('.md')) {
        const htmlPath = `${path.slice(0, path.length - 2)}html`;
        const file = (await readFile(path)
          .catch(() => { throw new Error(`File not found: ${path}`); }))
          .toString('utf8');

        const v = new MdVar(file);
        const folder = join('src/api/docs', v.get('path') || dirname(path).slice(13));
        const srcDocsFilePath = join(folder, basename(htmlPath));
        const htmlFile = await readFile(srcDocsFilePath).catch(() => '');
        let html = mdToHtml(v.result);
        html = `<!-- Do not edit this file`
          + ` because it is automatically generated. -->\n${html}`;

        if (sha1(htmlFile.toString('utf8')) !== sha1(html)) {
          await mkdir(
            folder,
            {
              recursive: true
            }
          );
          // Move files to src/api/docs
          await writeFile(srcDocsFilePath, html);
          console.log(chalk.blueBright(`Update: `) + srcDocsFilePath);
        }
      } else if ((path.endsWith('.ts') && !path.endsWith('.spec.ts'))
        || path.endsWith('.html')
      ) {
        const lang = path.endsWith('ts') ? 'ts' : 'html';
        const file = (await readFile(path)
          .catch(() => { throw new Error(`File not found: ${path}`); }))
          .toString('utf8');
        const highlightHtml = highlight(file, lang);
        const filePath = join('src/api/docs/demos', `${basename(path)}.html`);
        await writeFile(filePath, highlightHtml);
        console.log(`${chalk.greenBright(`Update: `)}${filePath}`);
      }
    }
  }).on('ready', () => {
    if (process.env.CI) {
      watcher.close();
    }
  });

};

try {
  start().catch((err) => {
    console.error(`Error\n${err}`);
    process.exit(1);
  });
} catch (err) {
  console.error(`Error\n${err}`);
  process.exit(1);
}

function sha1(input: string) {
  return createHash('sha1').update(input).digest('hex');
}

