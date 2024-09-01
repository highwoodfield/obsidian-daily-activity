/** @format */

import {App, MarkdownView, Modal, Plugin, Setting} from 'obsidian'
import {ActivityLogger} from 'src/ActivityLogger'
import { getHumanToday } from './datetime'

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
			id: "mnot-links-to-files-modified",
			name: "Insert links to files modified on a date",

			checkCallback: (checking: boolean) => {
				return this.insertCallback(checking, true);
			}
		});

		this.addCommand({
			id: "mnot-links-to-files-modified-today",
			name: "Insert links to files modified today",

			checkCallback: (checking: boolean) => {
				return this.insertCallback(checking, false);
			}
		});
    }

	insertCallback(checking: boolean, askDate: boolean): boolean | void {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
		if (activeView == null) return false;
		if (checking) return true;

		new DateSelectorModal(this.app, !askDate, date => {
			this.activityLogger.insertModifiedFileLinks({ activeView, date });
		}).open();
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

class DateSelectorModal extends Modal {
	skip: boolean;
	year: number;
	month: number;
	date: number;
	callback: (date: Date) => void;

	constructor(app: App, skip: boolean, callback: (date: Date) => void) {
		super(app);
		this.skip = skip;
		this.callback = callback;
		const now = getHumanToday();
		this.year = now.getFullYear();
		this.month = now.getMonth() + 1;
		this.date = now.getDate();
	}

	toDate(): Date {
		const d = getHumanToday();
		d.setFullYear(this.year);
		d.setMonth(this.month - 1);
		d.setDate(this.date);
		return d;
	}

	onOpen(): void {
		if (this.skip) {
			this.finish();
			return;
		}
		const { contentEl } = this;
		const headerContent = contentEl.createEl("p");
		const updateHeader = () => {
			headerContent.textContent = `Input a date (${this.toDate().toLocaleDateString()})`;
		}
		updateHeader();

		this.numberInputSetting("Year", this.year, v => {
			this.year = v;
			updateHeader();
		});
		this.numberInputSetting("Month", this.month, v => {
			this.month = v;
			updateHeader();
		});
		this.numberInputSetting("Date", this.date, v => {
			this.date = v;
			updateHeader();
		})
		contentEl.createEl("button", { text: "OK" }, el => {
			el.addEventListener("click", async () => {
				this.finish();
			});
		})
	}

	finish() {
		this.callback(this.toDate());
		this.close();
	}

	numberInputSetting(name: string, current: number, cb: (num: number) => void) {
		return new Setting(this.contentEl)
			.setName(name)
			.addText(text => text
				.setPlaceholder(current.toString())
				.onChange(v => {
					const parsed = Number.parseInt(v);
					if (Number.isNaN(parsed)) return;
					cb(parsed);
				})
			);
	}
}
