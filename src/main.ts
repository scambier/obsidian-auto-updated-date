import { MarkdownView, Plugin, moment, TAbstractFile, TFile } from 'obsidian'
import {
  AutoUpdatedDatePluginSettings,
  AutoUpdatedDatePluginSettingsTab,
  DEFAULT_SETTINGS
} from './settings'
import * as matter from 'gray-matter'

export default class AutoUpdatedDatePlugin extends Plugin {
  settings: AutoUpdatedDatePluginSettings

  async onload () {
    await this.loadSettings()
    this.addSettingTab(new AutoUpdatedDatePluginSettingsTab(this.app, this))
    this.registerEvent(this.app.vault.on('modify', this.updateDate))
  }

  onunload () {}

  async loadSettings () {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings () {
    await this.saveData(this.settings)
  }

  updateDate = async (file: TAbstractFile) => {
    if (!(file instanceof TFile)) {
      return
    }
    const view = this.app.workspace.getActiveViewOfType(MarkdownView)
    const contents = await this.app.vault.cachedRead(file)

    // Check the presence of a front matter block
    const hasFrontMatter = /^---.*---/gs.test(contents)
    if (!hasFrontMatter && !this.settings.createFrontMatter) {
      return
    }

    // Parse data to separate header from content
    const parsed = deserializeMarkdown(contents)

    // If the field does not exist, check that we can create it
    if (!parsed.data[this.settings.fieldName] && !this.settings.createField) {
      return
    }

    // Update the value
    parsed.data[this.settings.fieldName] = moment(Date.now()).format(
      this.settings.dateFormat
    )

    // Serialize back
    const frontMatter = matter.stringify('', parsed.data).trim()
    const newContent = `${frontMatter}
${parsed.content}` // Use a "raw" line return instead of \r\n

    view.setViewData(newContent, false)
  }
}

function deserializeMarkdown (md: string): matter.GrayMatterFile<string> {
  // @ts-ignore
  return matter.default(md)
}
