import { MarkdownView, Plugin, moment, TAbstractFile, TFile } from 'obsidian'
import {
  AutoUpdatedDatePluginSettings,
  AutoUpdatedDatePluginSettingsTab,
  DEFAULT_SETTINGS,
} from './settings'

// Adapted from https://github.com/jekyll/jekyll/blob/7c4f319442b6b7a457d35cef2fc1b7a480b30850/lib/jekyll/document.rb#L9
const frontMatterRegex = /^---\s*\n(.*?)\n?^---\s+/ms

export default class AutoUpdatedDatePlugin extends Plugin {
  settings: AutoUpdatedDatePluginSettings

  async onload(): Promise<void> {
    await this.loadSettings()
    this.addSettingTab(new AutoUpdatedDatePluginSettingsTab(this.app, this))
    this.registerEvent(this.app.vault.on('modify', this.updateDate))
  }

  onunload(): void {}

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }

  updateDate = async (file: TAbstractFile): Promise<void> => {
    if (!(file instanceof TFile)) {
      return
    }
    const contents = await this.app.vault.cachedRead(file)

    // Check the presence of a front matter block
    let frontMatterRE = frontMatterRegex.exec(contents)

    if (!frontMatterRE) {
      if (!this.settings.createFrontMatter) {
        // console.log('no front matter block, ignoring')
        return
      }
      else {
        frontMatterRE = frontMatterRegex.exec('---\n---\n')
      }
    }
    let serializedFrontMatter = frontMatterRE[1].trim()

    // /^updated:(.*)$/m
    const updatedRegex = new RegExp(`^${this.settings.fieldName}:(.*)$`, 'm')
    const updatedValueRE = updatedRegex.exec(serializedFrontMatter)

    // If the field does not exist, check that we can create it
    if (!updatedValueRE || !updatedValueRE[1]) {
      if (!this.settings.createField) {
        // console.log(`no ${this.settings.fieldName} field, ignoring`)
        return
      }
      else {
        serializedFrontMatter = `${this.settings.fieldName}: [placeholder]`
      }
    }
    const formattedDate = moment(Date.now()).format(this.settings.dateFormat)
    serializedFrontMatter = serializedFrontMatter.replace(
      updatedRegex,
      `${this.settings.fieldName}: ${formattedDate}`,
    )

    const view = this.app.workspace.getActiveViewOfType(MarkdownView)
    view.setViewData(
      `---
${serializedFrontMatter}
---
${contents.replace(frontMatterRegex, '')}`,
      false,
    )
  }
}
