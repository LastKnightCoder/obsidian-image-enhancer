import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
// import * as path from 'node:path'
// import * as fs from 'node:fs/promises'

// @ts-ignore
import { clipboard } from 'electron'
import Github from './github'
const path = require('path')
const fs = require('fs').promises

interface ImageEnhancerPluginSettings {
  token: string;
  owner: string;
  repo: string;
  // configFilePath: string;
}

const DEFAULT_SETTINGS: ImageEnhancerPluginSettings = {
  token: '',
  owner: '',
  repo: '',
  // configFilePath: '.obsidian/plugins/obsidian-image-enhancder/picgo.json'
}

export default class ImageEnhancerPlugin extends Plugin {
  settings: ImageEnhancerPluginSettings;


  // async createPicGoConfigFile() {
  //   // @ts-ignore
  //   const root = this.app.vault.adapter.basePath;
  //   const configFilePath = path.join(root, this.settings.configFilePath)
  //   const config = {
  //     "picBed": {
  //       "uploader": "github",
  //       "current": "github",
  //       "github": {
  //         "repo": `${this.settings.owner}/${this.settings.repo}`,
  //         "token": this.settings.token,
  //         "branch": "master",
  //         "customUrl": `https://cdn.jsdelivr.net/gh/${this.settings.owner}/${this.settings.repo}@master`,
  //         "path": ""
  //       }
  //     },
  //     "picgoPlugins": {}
  //   }

  //   await fs.writeFile(configFilePath, JSON.stringify(config))
  // }

  async onload() {
    await this.loadSettings();

    // This adds an editor command that can perform some operation on the current editor instance
    this.addCommand({
      id: 'Upload Image From Clipboard',
      name: 'Upload Image From Clipboard',
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        if (this.settings.token === '') {
          new Notice('GitHub token needed');
          return;
        }
        if (this.settings.owner === '') {
          new Notice('GitHub owner needed');
          return;
        }
        if (this.settings.repo === '') {
          new Notice('GitHub repo needed');
          return;
        }

        const { token, owner, repo } = this.settings
        const gh = new Github(token, owner, repo)

        const image = clipboard.readImage().toPNG()
        const {res, filename} = await gh.upload(image.toString('base64'))
        const url = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@master/${filename}`
        editor.replaceSelection(`\n<img src="${url}" style="zoom: 50%" />\n`)
      }
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new ImageEnhancerPluginSettingTab(this.app, this));
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class ImageEnhancerPluginSettingTab extends PluginSettingTab {
  plugin: ImageEnhancerPlugin;

  constructor(app: App, plugin: ImageEnhancerPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Settings for Image Enhancer.' });

    new Setting(containerEl)
      .setName('Github Token')
      .setDesc('令牌')
      .addText(text => text
        .setPlaceholder('token')
        .setValue(this.plugin.settings.token)
        .onChange(async (value) => {
          this.plugin.settings.token = value;
          await this.plugin.saveSettings();
        }
      ))

    new Setting(containerEl)
      .setName('owner')
      .setDesc('仓库的所有者')
      .addText(text => text
        .setPlaceholder('owner')
        .setValue(this.plugin.settings.owner)
        .onChange(async (value) => {
          this.plugin.settings.owner = value;
          await this.plugin.saveSettings();
        }
      ))

    new Setting(containerEl)
      .setName('repo')
      .setDesc('存放图片的仓库名')
      .addText(text => text
        .setPlaceholder('repo')
        .setValue(this.plugin.settings.repo)
        .onChange(async (value) => {
          this.plugin.settings.repo = value;
          await this.plugin.saveSettings();
        }
      ))

      // new Setting(containerEl)
      // .setName('picgo.json')
      // .setDesc('配置文件的存放位置,相对于当前库的根路径')
      // .addText(text => text
      //   .setPlaceholder('.obsidian/plugins/obsidian-image-enhancder/picgo.json')
      //   .setValue(this.plugin.settings.configFilePath)
      //   .onChange(async (value) => {
      //     this.plugin.settings.configFilePath = value;
      //     await this.plugin.saveSettings();
      //   }
      // ))
  }
}
