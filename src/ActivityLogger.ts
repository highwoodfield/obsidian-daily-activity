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

    private getLinks(moment: Moment, includeRegex: string[] = [], excludeRegex: string[] = [], includePaths: string[] = [], excludePaths: string[] = [], statType: 'mtime' | 'ctime'): string[] {
        console.log(`Getting links for moment: ${moment.format()}, statType: ${statType}`);
        return this.app.vault.getFiles()
            .filter(f => moment.isSame(new Date(f.stat[statType]), 'day') && this.fileMatchesFilters(f.path, includeRegex, excludeRegex, includePaths, excludePaths))
            .map(f => `[[${getLinkpath(f.path)}]]`);
    }

    private getLinksToFilesModifiedOnDate(moment: Moment, includeRegex: string[] = [], excludeRegex: string[] = [], includePaths: string[] = [], excludePaths: string[] = []): string[] {
        return this.getLinks(moment, includeRegex, excludeRegex, includePaths, excludePaths, 'mtime');
    }

    private isArrayNotEmptyAndNoEmptyStrings(arr: string[]): boolean {
        return arr.length > 0 && arr.every(item => item !== "");
    }

    private fileMatchesFilters(filePath: string, includeRegex: string[] = [], excludeRegex: string[] = [], includePaths: string[] = [], excludePaths: string[] = []): boolean {
        const matches = this.isArrayNotEmptyAndNoEmptyStrings(excludeRegex) && excludeRegex.some(regex => new RegExp(regex).test(filePath)) ? false :
            this.isArrayNotEmptyAndNoEmptyStrings(excludePaths) && excludePaths.some(part => filePath.includes(part)) ? false :
                (includeRegex.length === 0 || includeRegex.some(regex => new RegExp(regex).test(filePath))) &&
                (includePaths.length === 0 || includePaths.some(part => filePath.includes(part)));
        console.log(`File ${filePath} matches filters: ${matches}`);
        return matches;
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
		let modifiedTodayLinks: string[] = this.getLinksToFilesModifiedOnDate(
			moment(), includeRegex, excludeRegex, includePaths, excludePaths);
		content = this.appendLinksToContent(content, modifiedTodayLinks, 'Modified');

        await this.app.vault.modify(activeView.file!! /* TODO */, content);
    }
}
