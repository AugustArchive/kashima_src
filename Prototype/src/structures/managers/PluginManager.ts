import { promises as fs, existsSync } from 'fs';
import { sep, ignoreFile } from '../../util';
import { Application } from '../Application';
import { Collection } from '@augu/immutable';
import { app as App } from 'electron';
import { Plugin } from '../entities/Plugin';
import { join } from 'path';
import Matsuwa from 'matsuwa';
import ts from 'typescript';

export default class PluginManager extends Collection<Plugin> {
  /** The current directory of all plugins */
  public directory: string;

  /**
   * Constructs a new instance of the `PluginManager` class
   * @param app The application itself
   */
  constructor(public app: Application) {
    super();

    this.directory = `${App.getPath('userData')}${sep}Plugins`;
  }

  /**
   * Get a diagnostic message on a file
   * @param filename The filename of the file
   * @param config The configuration used
   */
  private getDiagnostics(filename: string, config: ts.CompilerOptions) {
    const program = ts.createProgram([filename], config);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    let message: string | undefined = undefined;

    if (diagnostics.length) {
      for (const diagnostic of diagnostics) {
        const msg = diagnostic.messageText;
        const file = diagnostic.file;
        const lineAndChar = file ? file.getLineAndCharacterOfPosition(diagnostic.start!) : null;

        if (lineAndChar === undefined) {
          message = msg.toString();
          break;
        }

        message = `${msg} (at '${lineAndChar!.line}:${lineAndChar!.character}')`;
      }
    }

    return message;
  }

  /**
   * Get a plugin's directory
   * @param id The ID of the plugin
   */
  getPluginDir(id: string, ...paths: string[]) {
    return join(this.directory, id, ...paths);
  }

  /**
   * Start the service
   */
  async start() {
    const plugins = await fs.readdir(this.directory);
    const dirStats = await fs.stat(this.directory);

    if (!plugins.length) {
      log('error', `No plugins were found in directory {colors:red:${this.directory.replace(':', '')}}`);
      return;
    }

    if (!dirStats.isDirectory()) {
      log('error', `Plugin directory {colors:yellow:${this.directory}} was not a directory?`);
      return;
    }

    for (const plugin of plugins) {
      log('info', `Now initializing {colors:green:${plugin}}...`);
      const files = await fs.readdir(this.getPluginDir(plugin));

      if (!files.length) {
        log('error', `Missing files in plugin {colors:yellow:${plugin}}`);
        return;
      }

      log('info', 'Validating manifest...');
      const [json, js] = [files.indexOf('manifest.json'), files.indexOf('manifest.js')];

      // We found a manifest.json file
      if (json !== -1) {
        const contents = await fs.readFile(this.getPluginDir(plugin, 'manifest.json'), 'utf-8');
        const manifest = JSON.parse(contents);
        const errors = await this.buildPlugin(manifest, plugin);
        if (errors) {
          log('error', errors);
          continue;
        }
      } else if (js !== -1) {
        const manifest = await import(this.getPluginDir(plugin, 'manifest.js'));
        const errors = await this.buildPlugin(manifest, plugin);
        if (errors) {
          log('error', errors);
          continue;
        }
      }

      log('info', 'Checking for .kashimaignore file...');
      const ignore = files.indexOf('.kashimaignore');
      const filesToIgnore: string[] = [];

      if (ignore !== -1) {
        log('info', 'Found ignore file, finding contents and ignoring...');
        const content = await fs.readFile(this.getPluginDir(plugin, '.kashimaignore'), 'utf-8');
        const ignoreFiles = await ignoreFile(this.getPluginDir(plugin), content);

        if (!ignoreFiles.length) {
          log('warn', 'Ignore file is present but no files or directories was implemented in them?');
          continue;
        }

        filesToIgnore.push(...ignoreFiles.map(s => s[1]));
      }
    }
  }

  private async buildPlugin(manifest: any, plugin: string) {
    // TODO: Maybe add a thing like Lerna?
    if (Array.isArray(manifest)) return `Manifest for plugin ${plugin} can't be an array of packages.`;

    const keys = Object.keys(manifest);
    if (!keys.includes('mainFile') || !keys.includes('name') || !keys.includes('id')) return `Invalid manifest file in plugin ${plugin} (Missing 'mainFile' or 'name' or 'id')`;

    const mainFile: string = manifest.mainFile.replace('./', this.getPluginDir(plugin));
    const names: string[] = mainFile.split('.');
    const extension = names[1];
    const directory = this.getPluginDir(plugin);

    if (extension === 'ts') {
      if (!keys.includes('typescript') || !keys.includes('ts')) return `Missing "typescript" or "ts" config in manifest for plugin {colors:red:${plugin}}`;

      const configKey = keys.includes('typescript') ? 'typescript' : 'ts';
      const config = manifest[configKey] as ts.CompilerOptions;
      const libraries = config
        .lib!
        .filter(x => !x.includes('lib.') && !x.endsWith('.d.ts'))
        .map(x => `lib.${x.toLowerCase()}.d.ts`);

      const diagnostics = this.getDiagnostics(mainFile, {
        lib: libraries,
        ...config
      });

      const code = await fs.readFile(join(directory, mainFile), 'utf-8');

      // Code was compiled successfully, save it in the ".compiled" directory
      if (diagnostics === undefined) {
        if (!existsSync(join(directory, '.compiled'))) await fs.mkdir(join(directory, '.compiled'));
        const script = ts.transpileModule(code, {
          compilerOptions: {
            lib: libraries,
            ...config
          }
        }).outputText;

        await fs.writeFile(join(directory, '.compiled', `${names[0]}.js`), script);
      } else {
        // It was not compiled successfully
        return `Unable to compile file "${names[0]}.ts":\n${diagnostics}`;
      }
    }

    const main = keys.includes('typescript') || keys.includes('ts') ? await import(join(directory, '.compiled', `${names[0]}.js`)) : await import(join(directory, `${names[0]}.js`));
    const plu: Matsuwa.Plugin = main.default ? new main.default() : new main();
    
    // Check if we have "mount" avaliable
    if (typeof plu.mount === 'undefined') return `Missing "mount" function in {colors:red:${plugin}}`;

    // Check if it's a function
    if (typeof plu.mount === 'function') {
      if (plu.mount instanceof Promise) await plu.mount();
      else plu.mount();
    }

    // ...add it to the collection
    const p = new Plugin(plu, manifest);
    this.set(p.info.id, p);

    // Check for any updates
    const needUpdate = await p.canUpdate();
    if (needUpdate) await p.update(true);

    return undefined;
  }
}