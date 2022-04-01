import { MarkdownView, Plugin, moment, TAbstractFile, TFile } from 'obsidian'
// import matter = require('gray-matter')
import * as matter from 'gray-matter'

export default class EndFileLineReturn extends Plugin {
  onload() {
    this.registerEvent(this.app.vault.on('modify', this.updateDate))
  }

  onunload() {
  }

  updateDate = async (file: TAbstractFile) => {
    if (!(file instanceof TFile)) { return }
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    const contents = await this.app.vault.cachedRead(file)

    // Update the value
    const parsed = deserializeMarkdown(contents)
    parsed.data.updated = moment(Date.now()).format('YYYY-MM-DD HH:mm')

    // Serialize back
    const frontMatter = matter.stringify("", parsed.data).trim()
    const newContent = `${frontMatter}
${parsed.content}` // Use a "raw" line return instead of \r\n

    view.setViewData(newContent, false)
  }
}

function deserializeMarkdown(md: string): matter.GrayMatterFile<string> {
  // @ts-ignore
  return matter.default(md)
}