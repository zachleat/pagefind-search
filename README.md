# pagefind-search

Web Component to easily add the [Pagefind search UI](https://pagefind.app/) to your web site. This unlocks more control of asset loading via [`<is-land>`](https://www.11ty.dev/docs/plugins/partial-hydration/).

## Usage

```html
<script type="module" src="pagefind-search.js"></script>

<!-- No fallback content (works, but not ideal) -->
<pagefind-search></pagefind-search>

<!-- Better: fallback to DuckDuckGo site search (use any search engine here) -->
<pagefind-search>
	<form action="https://duckduckgo.com/" method="get" style="min-height: 3.2em;"><!-- min-height to reduce CLS -->
		<label>
			Search for:
			<input type="search" name="q" autocomplete="off" autofocus>
		</label>
		<!-- Put your searchable domain here -->
		<input type="hidden" name="sites" value="www.zachleat.com">
		<button type="submit">Search</button>
	</form>
</pagefind-search>
```

### Extend Pagefind Options

Full [options list on the Pagefind documentation](https://pagefind.app/docs/ui/). Use `underscore` case for option names here (as HTML attributes are case insensitive). This is only compatible with boolean/number/string options (but read on for a solution for the others below).

* `_page_size` for pageSize
* `_show_sub_results` for showSubResults
* `_show_images` for showImages
* `_excerpt_length` for excerptLength
* (incompatible) processTerm
* (incompatible) processResult
* `_show_empty_filters` for showEmptyFilters
* `_reset_styles` for resetStyles
* `_bundle_path` for bundlePath
* `_debounce_timeout_ms`
* (incompatible) translations

```html
<pagefind-search _show_images="false">
	<!-- Don’t forget your fallback content! -->
</pagefind-search>
```

#### Advanced: Full JavaScript access

Use the `manual` attribute to manually initialize your Pagefind UI with any custom options (including functions, objects, etc).

```html
<pagefind-search manual id="my-search">
	<!-- Don’t forget your fallback content! -->
</pagefind-search>
<script type="module">
let el = document.querySelector("#my-search");
await el.pagefind({
	showImages: false,
	debounceTimeoutMs: 100,
	processTerm: function (term) {
		return term.replace(/aa/g, 'ā');
	}
});

// Use `el.pagefindUI` to access the PagefindUI instance
</script>
```

### Loading via Islands

Use [`<is-land>` to enable more control over the component’s downstream asset loading](https://www.11ty.dev/docs/plugins/partial-hydration/).

```html
<script type="module" src="pagefind-search.js"></script>

<!-- Use any of is-land’s on: conditions -->
<is-land on:idle on:visible on:media="(min-width: 40em)" on:save-data="false">
	<pagefind-search>
		<!-- Don’t forget your fallback content! -->
	</pagefind-search>
</is-land>
```

If search is a secondary feature on a page, you _could_ lazy load the component definition too, though that would chain two separate JavaScript file loads together which is probably not what you want:

```html
<!-- Use any of is-land’s on: conditions -->
<is-land on:idle on:visible on:media="(min-width: 40em)" on:save-data="false">
	<pagefind-search>
		<!-- Don’t forget your fallback content! -->
	</pagefind-search>
	<template data-island>
		<script type="module" src="pagefind-search.js"></script>
	</template>
</is-land>
```
