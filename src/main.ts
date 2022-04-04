import { MarkdownView, Plugin, moment, TAbstractFile, TFile } from 'obsidian'
import {
  AutoUpdatedDatePluginSettings,
  AutoUpdatedDatePluginSettingsTab,
  DEFAULT_SETTINGS,
} from './settings'

// Adapted from https://github.com/jekyll/jekyll/blob/7c4f319442b6b7a457d35cef2fc1b7a480b30850/lib/jekyll/document.rb#L9
const frontMatterRegex = /^---\s*\n(.*?)\n?^---\s?/ms

export default class AutoUpdatedDatePlugin extends Plugin {
  settings: AutoUpdatedDatePluginSettings

  async onload(): Promise<void> {
    await this.loadSettings()
    this.addSettingTab(new AutoUpdatedDatePluginSettingsTab(this.app, this))
    this.app.vault.on('modify', this.updateDate)
  }

  onunload(): void {
    this.app.vault.off('modify', this.updateDate)
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    this.settings.fieldName =
      this.settings.fieldName || DEFAULT_SETTINGS.fieldName
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }

  updateDate = async (file: TAbstractFile): Promise<void> => {
    if (!(file instanceof TFile)) {
      return
    }
    const contents = await this.app.vault.read(file)

    // Check the presence of a front matter block
    let frontMatterRE = frontMatterRegex.exec(contents)

    if (!frontMatterRE) {
      if (!this.settings.createFrontMatter) {
        return
      }
      else {
        frontMatterRE = frontMatterRegex.exec('---\n---\n')
      }
    }
    let serializedFrontMatter = frontMatterRE[1]

    // /^updated:(.*)$/m
    const fieldName = this.settings.fieldName
    const updatedRegex = new RegExp(`^${fieldName}:(.*)$`, 'm')
    const updatedValueRE = updatedRegex.exec(serializedFrontMatter)

    // If the field does not exist, check that we can create it
    if (!updatedValueRE || !updatedValueRE[1]) {
      if (!this.settings.createField) {
        return
      }
      else {
        // Appends the "updated" field, preceded by a newline if the block is not empty
        serializedFrontMatter += `${
          serializedFrontMatter ? '\n' : ''
        }${fieldName}: [placeholder]`
      }
    }

    const quote = this.settings.useQuotes ? '"' : ''
    const date = moment(Date.now()).format(this.settings.dateFormat)
    const formattedDate = `${quote}${date}${quote}`

    const newFrontMatter = serializedFrontMatter.replace(
      updatedRegex,
      `${fieldName}: ${formattedDate}`,
    )

    const newContent = `---
${newFrontMatter}
---
${contents.replace(frontMatterRegex, '')}`

    // Disable the listener while we're writing to avoid loop-triggering the 'modify' envent
    this.app.vault.off('modify', this.updateDate)
    await this.app.vault.modify(file, newContent)
    setTimeout(() => {
      this.app.vault.on('modify', this.updateDate)
    }, 0)
  }
}
