⚠️ **DO NOT USE - BUGGY**  
✅ Use [Obsidian Linter](https://github.com/platers/obsidian-linter) instead.

---

This plugin will trigger a self-feeding update loop if the same file is open on 2 different editors.

# Obsidian Automatic 'updated' Header

This Obsidian plugin automatically adds a front matter `updated` field to your notes. This field is automatically updated to the current date and time whenever you save a note.

![image](https://user-images.githubusercontent.com/3216752/161605108-a4891b11-47b0-48ed-ba3f-e721761f4146.png)

## Motivation

When writing, reviewing, and sharing notes, it is often useful to have a timestamp of when the note was last updated. The OS "last modified" file system timestamp is not very reliable when you use a syncing solutions, or have moved the files around.


## Features

- [x] Datetime format customization
- [x] Field name customization
- [x] Option to create the front matter if it doesn't exist
- [x] Option to add the field if it doesn't exist
- [x] Option to surround the date with quotes
- [x] Works on mobile

## TODO

- [ ] Command to quickly toggle the plugin
  - [ ] Add a "blacklist" or "whitelist" option to exclude certain files?
- [ ] Moment locale override?
