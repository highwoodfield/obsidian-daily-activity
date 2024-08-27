import DailyActivityPlugin from 'src/main';
import {App, getLinkpath, MarkdownView, Plugin} from 'obsidian';
import {Moment} from 'moment';

export class ActivityLogger {
    app: App;
    plugin: Plugin;

    constructor(app: App, plugin: DailyActivityPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

    private getLinks(moment: Moment, makeLink: boolean, includeRegex: string[] = [], excludeRegex: string[] = [], includePaths: string[] = [], excludePaths: string[] = [], statType: 'mtime' | 'ctime'): string[] {
        console.log(`Getting links for moment: ${moment.format()}, makeLink: ${makeLink}, statType: ${statType}`);
        return this.app.vault.getFiles()
            .filter(f => moment.isSame(new Date(f.stat[statType]), 'day') && this.fileMatchesFilters(f.path, includeRegex, excludeRegex, includePaths, excludePaths))
            .map(f => makeLink ? `[[${getLinkpath(f.path)}]]` : getLinkpath(f.path));
    }

    private getLinksToFilesModifiedOnDate(moment: Moment, makeLink = true, includeRegex: string[] = [], excludeRegex: string[] = [], includePaths: string[] = [], excludePaths: string[] = []): string[] {
        return this.getLinks(moment, makeLink, includeRegex, excludeRegex, includePaths, excludePaths, 'mtime');
    }

    private getLinksToFilesCreatedOnDate(moment: Moment, makeLink = true, includeRegex: string[] = [], excludeRegex: string[] = [], includePaths: string[] = [], excludePaths: string[] = []): string[] {
        return this.getLinks(moment, makeLink, includeRegex, excludeRegex, includePaths, excludePaths, 'ctime');
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

    async insertActivityLog({
                                insertCreatedOnDateFiles = false,
                                insertModifiedOnDateFiles = false,
                                moments = [window.moment()],
                                activeView = null,
                                makeLink = true,
                                includeRegex = [],
                                excludeRegex = [],
                                includePaths = [],
                                excludePaths = []
                            }: {
        insertCreatedOnDateFiles?: boolean,
        insertModifiedOnDateFiles?: boolean,
        moments?: Moment[],
        activeView?: MarkdownView,
        makeLink?: boolean,
        includeRegex?: string[],
        excludeRegex?: string[],
        includePaths?: string[],
        excludePaths?: string[]
    }) {
        if (!activeView) return;
        let editor = activeView.editor;

        let content = await this.app.vault.read(activeView.file);
        let createdTodayLinks: string[] = [];
        if (insertCreatedOnDateFiles) {
            createdTodayLinks = moments.flatMap(moment => this.getLinksToFilesCreatedOnDate(moment, makeLink, includeRegex, excludeRegex, includePaths, excludePaths));
            content = this.appendLinksToContent(content, createdTodayLinks, 'Created');
        }
        if (insertModifiedOnDateFiles) {
            let modifiedTodayLinks: string[] = moments.flatMap(moment => this.getLinksToFilesModifiedOnDate(moment, makeLink, includeRegex, excludeRegex, includePaths, excludePaths).filter(link => !createdTodayLinks.includes(link)));
            content = this.appendLinksToContent(content, modifiedTodayLinks, 'Modified');
        }

        await this.app.vault.modify(activeView.file, content);
    }
}
