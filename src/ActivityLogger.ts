import DailyActivityPlugin from 'src/main';
import { getHumanDate, isSameHumanDate } from './datetime';
import { App, getLinkpath, MarkdownView, Plugin, TFile } from 'obsidian';

const MARKDOWN_SPECIAL_CHARACTERS = "_`*{}[]<>()#+-.!|"

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

	private generateLine(file: TFile): string {
		let display = file.basename;
		for (const c of MARKDOWN_SPECIAL_CHARACTERS) {
			display = display.replaceAll(c, `\\${c}`);
		}
		return `- [${display}](${encodeURI(file.path)}) (${new Date(file.stat.mtime).toLocaleString()})`
	}

	async insertModifiedFileLinks({
		activeView,
		date,
		includeRegex = [],
		excludeRegex = [],
		includePaths = [],
		excludePaths = []
	}: {
		activeView: MarkdownView,
		date: Date,
		includeRegex?: string[],
		excludeRegex?: string[],
		includePaths?: string[],
		excludePaths?: string[]
	}) {
		const file = activeView.file;
		if (file === null) return;
		const initialContent = await this.app.vault.read(file);

		const links: string[] = this.app.vault.getFiles()
			.filter(f => isSameHumanDate(date, new Date(f.stat.mtime)))
			.filter(f => this.fileMatchesFilters(f.path, includeRegex, excludeRegex, includePaths, excludePaths))
			.sort((a, b) => a.stat.mtime - b.stat.mtime)
			.map(this.generateLine);

		const newContent = `${initialContent}\n\n**Modified Notes of ${getHumanDate(date).toLocaleDateString()}**\n${links.join('\n')}\n`;

		await this.app.vault.modify(file, newContent);
	}
}
