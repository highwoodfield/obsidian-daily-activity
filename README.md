# Obsidian Modified Notes of Today

This plugin is a fork of [obsidian-daily-activity](https://github.com/trydalch/obsidian-daily-activity) plugin with reduced functionality.

The only goal of this plugin is to add a command to Obsidian that inserts links of the notes which are created or modified on the date.

For a person who tend to stay up late like me, this plugin treats midnight hours as the previous date.
For example, 1:00 AM on 27 Aug 2024 is treated as 26 Aug 2024. Currently, this threshold is set to 3:00 AM.

Here is the sample.

![sample](./sample.gif)

## Installation

First, run the script below.

```
git clone https://github.com/highwoodfield/obsidian-modified-notes-of-today.git
cd obsidian-modified-notes-of-today
npm install
npm run release-build
```

Then, copy `main.js` and `manifest.json` to the desired directory (like `.obsidian/plugins/obsidian-modified-notes-of-today/`).
