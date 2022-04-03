import { App, PluginSettingTab, Setting } from 'obsidian'
import AutoUpdatePlugin from './main'

export interface AutoUpdatedDatePluginSettings {
  dateFormat?: string
  fieldName: string
  createField: boolean
  createFrontMatter: boolean
}

export const DEFAULT_SETTINGS: AutoUpdatedDatePluginSettings = {
  fieldName: 'updated',
  createField: false,
  createFrontMatter: false
} as const

export class AutoUpdatedDatePluginSettingsTab extends PluginSettingTab {
  plugin: AutoUpdatePlugin

  constructor (app: App, plugin: AutoUpdatePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display (): void {
    const { containerEl } = this
    containerEl.empty()

    new Setting(containerEl)
      .setName('Custom Date Format')
      .setDesc('The date format used when updating the "updated" value.')
      .addMomentFormat((format) => format
        .setValue(this.plugin.settings.dateFormat)
        .onChange(async (value) => {
          this.plugin.settings.dateFormat = value
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Field name')
      .setDesc('The YAML field name that will be updated.')
      .addText((text) => text
        .setPlaceholder(DEFAULT_SETTINGS.fieldName)
        .setValue(this.plugin.settings.fieldName)
        .onChange(async (value) => {
          this.plugin.settings.fieldName = value || DEFAULT_SETTINGS.fieldName
          await this.plugin.saveSettings()
        }))

    new Setting(containerEl)
      .setName('Create the field')
      .setDesc("Automatically create the YAML field if it doesn't exist.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.createField)
        .onChange(async (value) => {
          createFrontMatter.setDisabled(!value)
          this.plugin.settings.createField = value
          if (!value) {
            // Automatically disable the createFrontMatter toggle and
            // reload the settings view
            this.plugin.settings.createFrontMatter = false
          }
          await this.plugin.saveSettings()
          setTimeout(() => this.display(), 200)
        }))

    const createFrontMatter = new Setting(containerEl)
      .setName('Create the Front Matter block')
      .setDesc("Automatically create a YAML Front Matter block if it doesn't exist. The toggle \"Create the field\" must be checked.")
      .addToggle((toggle) => {
        toggle.disabled = !this.plugin.settings.createField
        return toggle
          .setValue(this.plugin.settings.createFrontMatter)
          .onChange(async (value) => {
            this.plugin.settings.createFrontMatter = value
            await this.plugin.saveSettings()
          })
      })
  }
}
