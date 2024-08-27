/** @format */

import {MarkdownView, Plugin} from 'obsidian'
import {ActivityLogger} from 'src/ActivityLogger'

interface DailyActivityPluginSettings {
    // TODO:
    // insert location: cursor, top of file, end of file
    // lists to generate: Created & modified? Just created? Just modified?
    // Exclude modified from created table
    // Include current note?
    // Include header?
    // Custom header values
    // template for inserting?
    // plain text or link?
}

// TODO:
// Track activity using events (file created, file modified, file opened, track additions/deletions by capturing file length on open/close (or focus/lose focus))

const DEFAULT_SETTINGS: DailyActivityPluginSettings = {}

export default class DailyActivityPlugin extends Plugin {
    settings: DailyActivityPluginSettings
    activityLogger: ActivityLogger

    async onload() {
        console.log('loading plugin')

        // await this.loadSettings();

        this.activityLogger = new ActivityLogger(this.app, this)

		this.addCommand({
			id: "daily-activity-links-to-files-modified",
			name: "Insert links to files modified today",

			checkCallback: (checking: boolean) => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
				if (activeView == null) {
					return false
				}

				if (checking) {
					return true
				}

				this.activityLogger.insertTodaysModifiedFileLinks({activeView});
			}
		});
    }

    onunload() {
        console.log('unloading plugin')
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }
}
