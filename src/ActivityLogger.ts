import DailyActivityPlugin from 'src/main';
import { App, getLinkpath, MarkdownView, Plugin } from 'obsidian';
import { Moment } from 'moment';
import moment from 'moment';

export class ActivityLogger {
	app: App;
	plugin: Plugin;

	constructor(app: App, plugin: DailyActivityPlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	private isArrayNotEmptyAndNoEmptyStrings(arr: string[]): boolean {
		return arr.length > 0 && arr.every(item => item !== "");
	}

	private fileMatchesFilters(filePath: string, includeRegex: string[] = [], excludeRegex: string[] = [], includePaths: string[] = [], excludePaths: string[] = []): boolean {
		if (this.isArrayNotEmptyAndNoEmptyStrings(excludeRegex) && excludeRegex.some(regex => new RegExp(regex).test(filePath))) {
			return false;
		}

		if (this.isArrayNotEmptyAndNoEmptyStrings(excludePaths) && excludePaths.some(part => filePath.includes(part))) {
			return false;
		}

		return (includeRegex.length === 0 || includeRegex.some(regex => new RegExp(regex).test(filePath))) &&
			(includePaths.length === 0 || includePaths.some(part => filePath.includes(part)));
	}

	appendLinksToContent(existingContent: string, links: string[], header: string): string {
		return `${existingContent}\n\n${links.join('\n')}\n`;
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
		let content = await this.app.vault.read(activeView.file!! /* TODO */);

		const links: string[] = this.app.vault.getFiles()
			.filter(f => moment().isSame(new Date(f.stat.mtime), 'day')) 
			.filter(f => this.fileMatchesFilters(f.path, includeRegex, excludeRegex, includePaths, excludePaths))
			.map(f => `[[${getLinkpath(f.path)}]]`);

		content = this.appendLinksToContent(content, links, 'Modified');

		await this.app.vault.modify(activeView.file!! /* TODO */, content);
	}
}
