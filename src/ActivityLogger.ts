import DailyActivityPlugin from 'src/main';
import { App, getLinkpath, MarkdownView, Plugin } from 'obsidian';
import moment from 'moment';

export class ActivityLogger {
	app: App;
	plugin: Plugin;

	constructor(app: App, plugin: DailyActivityPlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	private hasArrNonEmptyStr(arr: string[]): boolean {
		return arr.length > 0 && arr.every(item => item !== "");
	}

	private fileMatchesFilters(filePath: string, includeRegex: string[] = [], excludeRegex: string[] = [], includePaths: string[] = [], excludePaths: string[] = []): boolean {
		if (this.hasArrNonEmptyStr(excludeRegex) && excludeRegex.some(regex => new RegExp(regex).test(filePath))) {
			return false;
		}

		if (this.hasArrNonEmptyStr(excludePaths) && excludePaths.some(part => filePath.includes(part))) {
			return false;
		}

		return (includeRegex.length === 0 || includeRegex.some(regex => new RegExp(regex).test(filePath))) &&
			(includePaths.length === 0 || includePaths.some(part => filePath.includes(part)));
	}

	async insertTodaysModifiedFileLinks({
		activeView,
		includeRegex = [],
		excludeRegex = [],
		includePaths = [],
		excludePaths = []
	}: {
		activeView: MarkdownView,
		includeRegex?: string[],
		excludeRegex?: string[],
		includePaths?: string[],
		excludePaths?: string[]
	}) {
		const file = activeView.file;
		if (file === null) return;
		const initialContent = await this.app.vault.read(file);

		const links: string[] = this.app.vault.getFiles()
			.filter(f => moment().isSame(new Date(f.stat.mtime), 'day')) 
			.filter(f => this.fileMatchesFilters(f.path, includeRegex, excludeRegex, includePaths, excludePaths))
			.map(f => `[[${getLinkpath(f.path)}]]`);

		const newContent = `${initialContent}\n\n**Modified Pages**\n${links.join('\n')}\n`;

		await this.app.vault.modify(file, newContent);
	}
}
