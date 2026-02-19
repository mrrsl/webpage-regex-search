## Build Steps (`zsh` environments only)
Optional:
* `7z` - pack into an archive that can be sumbitted 

1) `npm install`
2) `npm run build`
3) `npm run preview` - starts a `web-ext` instance

The packaged extension files will be in the `build` directory and contained in `regex-search` zip.

## Reminders
#### `lib/re_search.js`
**Todo**:
* Move message handling to it's own class
* Make `Revert()` asynchronous as well
* Have the instance update the internal collection of visible text nodes since websites may dynamically add/remove nodes

#### `lib/highlight_replacement.js`
The `HighlightReplacement` class encapsulates the added DOM elements that highlight matching text

#### `popup/index.html`
* Implement automatic scroll functionality with `scrollTo()`
* User defined highlight and text colors