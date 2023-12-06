class PagefindSearch extends HTMLElement {
	static register(tagName = "pagefind-search", registry) {
		if ("customElements" in window) {
			(registry || customElements).define(tagName, this);
		}
	}

	static attrs = {
		bundlePath: "_bundle_path",
		manualInit: "manual",
		autofocus: "pagefind-autofocus",
	};

	static count = 0;

	get bundlePath() {
		let dir = this.getAttribute(PagefindSearch.attrs.bundlePath);
		return dir || "/pagefind/";
	}

	get id() {
		// prefer existing id attribute
		if(this.hasAttribute("id")) {
			return this.getAttribute("id");
		}
		return "_pagefind_search_" + this.count;
	}

	static underscoreToCamelCase(str) {
		return str.replace(/_([a-z])/g, (m) => {
			return m[1].toUpperCase();
		});
	}

	get options() {
		let o = {
			element: `#${this.id}`,
		};

		let prefix = "_";
		for(let {name, value} of this.attributes) {
			if(name.startsWith(prefix)) {
				if(name === PagefindSearch.attrs.bundlePath) {
					// if bundle path is relative, we need to make it absolute to pass in to Pagefind (GitHub pages fix)
					let u = new URL(value, location);
					value = u.pathname;
				}

				if(value === "false" || value === "true" || Number(value).toString() === value) {
					value = JSON.parse(value);
				}
				o[PagefindSearch.underscoreToCamelCase(name.slice(prefix.length))] = value;
			}
		}
		return o;
	}

	async pagefind(customOptions) {
		if(typeof PagefindUI == "undefined") {
			if(!this.scriptPromise) {
				throw new Error(`<${this.tagName.toLowerCase()}> is not yet attached to a document.`);
			}

			await this.scriptPromise;
		}

		let options = Object.assign({}, this.options, customOptions);
		this.pagefindUI = new PagefindUI(options);

		let input = this.querySelector(`input:is([type="text"], [type="search"])`);
		if(this.hasAttribute(PagefindSearch.attrs.autofocus)) {
			input?.focus();
		}
	}

	async connectedCallback() {
		if(this.hasAttached) {
			return;
		}

		this.hasAttached = true;
		this.count = PagefindSearch.count++;
		this.setAttribute("id", this.id);

		// clear out fallback content
		this.replaceChildren();

		// we load these in every instance but the browser de-dupes requests for us
		let stylesheetUrl = `${this.bundlePath}pagefind-ui.css`;
		let link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = stylesheetUrl;
		this.appendChild(link);

		let scriptUrl = `${this.bundlePath}pagefind-ui.js`;
		this.scriptPromise = import(scriptUrl);
		if(!this.hasAttribute(PagefindSearch.attrs.manualInit)) {
			await this.scriptPromise;
			await this.pagefind();
		}
	}
}

PagefindSearch.register();
