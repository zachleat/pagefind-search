class PagefindSearch extends HTMLElement {
	static register(tagName = "pagefind-search", registry) {
		if ("customElements" in window) {
			(registry || customElements).define(tagName, this);
		}
	}

	static attrs = {
		bundlePath: "bundle-path",
		manualInit: "manual",
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
		for(let {name, value} of this.attributes) {
			if(name.startsWith("_")) {
				o[PagefindSearch.underscoreToCamelCase(name.slice(1))] = JSON.parse(value);
			}
		}
		return o;
	}

	onready() {
		return new Promise(resolve => {
			if(!this.script) {
				throw new Error(`<${this.tagName.toLowerCase()}> is not yet attached to a document.`);
			}

			this.script.addEventListener("load", () => {
				resolve();
			})
		});
	}

	async pagefind(customOptions) {
		if(typeof PagefindUI == "undefined") {
			await this.onready();
		}

		let options = Object.assign({}, this.options, customOptions);
		this.pagefindUI = new PagefindUI(options);
	}

	connectedCallback() {
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
		let script = document.createElement("script");
		script.src = scriptUrl;
		script.defer = true;
		if(!this.hasAttribute(PagefindSearch.attrs.manualInit)) {
			script.addEventListener("load", async () => {
				await this.pagefind();
			});
		}
		this.script = script;
		this.appendChild(script);
	}
}

PagefindSearch.register();
