# 📚 CleanShelf

![Version](https://img.shields.io/badge/version-1.2.5-blue.svg)
![Platform](https://img.shields.io/badge/platform-Chrome%20%7C%20Brave%20%7C%20Edge-lightgrey.svg)
![Privacy](https://img.shields.io/badge/privacy-100%25%20Local-success.svg)

**Save, organize, and copy your code snippets directly in your browser—without ever leaving the page.**

CleanShelf is a lightweight, privacy-first extension that replaces the clunky "popup window" experience with a sleek, on-demand overlay. Whether you're a developer saving snippets of code, a student storing research notes, or just someone who needs to copy-paste the same text repeatedly, CleanShelf keeps it organized and instantly accessible.

---

## ✨ Why CleanShelf?

Most snippet managers force you into a tiny popup window or require you to switch tabs. CleanShelf was built with a few core philosophies in mind:

*   **Interruption-Free Overlay:** Instead of a popup that disappears when you click away, CleanShelf injects a beautiful, blurred overlay directly into your current tab. It uses a closed Shadow DOM, meaning its styles will *never* conflict with the website you are currently browsing.
*   **Absolute Privacy:** Your data is yours. CleanShelf does not use analytics, does not make network requests, and stores everything locally on your machine using `chrome.storage.local`. 
*   **Deep Organization:** Simple enough for quick saves, but powerful enough for large libraries. Organize your snippets into Folders and nested Subfolders, with drag-and-drop sorting that actually feels good to use.
*   **True Localization:** Features out-of-the-box support for English and Turkish, including locale-aware search (so Turkish "İ" and "I" characters are handled correctly).

---

## 🚀 Features

### 🎨 A Workspace That Fits You
*   **6 Beautiful Themes:** Choose between Dark, Light, Dracula, Nord, Sepia, and Dark Sepia.
*   **Accessibility First:** Toggle High Contrast mode or adjust the font size (Small, Medium, Large) for a comfortable reading experience.
*   **Compact View:** Toggle a compact layout inside folders to see more snippets at once.

### 🗂️ Powerful Organization
*   **Folders & Subfolders:** Group your snippets logically. Create empty folders to organize your thoughts before you even start saving.
*   **Drag-and-Drop:** Move snippets between folders or subfolders effortlessly. Drop them into a subfolder to group them, or drag them out to the main area to ungroup.
*   **Manual Sorting:** Drag snippets up and down within a folder to sort them exactly how you want, or use the right-click menu to sort by `Newest` or `A-Z`.
*   **Undo Everything:** Accidentally deleted a snippet, folder, or subfolder? CleanShelf gives you an instant **Undo** button via toast notifications so you never lose data.

### ⚡ Quality of Life
*   **One-Click Copy:** Just click any snippet card to instantly copy its contents to your clipboard.
*   **Draft Auto-Save:** Don't lose your train of thought. If you're typing a new snippet and close the overlay, CleanShelf automatically saves your draft and restores it next time.
*   **JSON Export/Import:** Easily backup your entire library to a JSON file. You can choose to *Replace* your current data or *Merge* the backup into your existing snippets without losing anything.
*   **Keyboard Shortcut:** Press `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Shift+K` (Mac) to instantly summon CleanShelf on any page.

---

## ⌨️ How to Use

1. Click the CleanShelf icon in your browser toolbar, or press `Ctrl+Shift+K` / `Cmd+Shift+K`.
2. The overlay will appear over your current page. 
3. Type a title and your content, then hit **Save**.
4. Click any saved snippet on the left to copy it instantly.
5. **Right-click** snippets or folders for more options (Edit, Delete, Sort, Insert Subfolder).
6. Press `Escape` or click the dark background to close the overlay.

---

## 🛠️ Installation (Developer Mode)

Because CleanShelf is distributed as an open-source project, you can install it directly from this repository:

1. Download the latest `.zip` file from the **Releases** page and extract it, or clone this repository.
2. Open your browser and go to `chrome://extensions` (or `brave://extensions`).
3. Enable **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the CleanShelf folder.
5. The extension is now ready to use!

---

## 🔒 Privacy Statement

CleanShelf operates **100% offline**. 

* 🚫 No analytics.
* 🚫 No tracking.
* 🚫 No external servers.
* 🚫 No accounts required.

All data is stored in your browser's local extension storage (up to ~10MB). Because your browser holds the data, **we strongly recommend using the built-in Export feature to back up your snippets regularly.** 

---

## 📝 Changelog & Versioning

See the [CHANGELOG.md](./CHANGELOG.md) file for a detailed history of updates, bug fixes, and new features.