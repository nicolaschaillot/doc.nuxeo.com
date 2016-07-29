# doc.nuxeo.com

# Development

## Requirements
- [git](https://git-scm.com/) - make sure your Privacy & Security settings allow to download applications from anywhere
- [node.js](https://nodejs.org)
- libsass
- Text editor (https://www.sublimetext.com/ or https://atom.io/ for example)

To install on mac:
- install homebrew (http://brew.sh/) and run ```brew update```

- use brew to install:
```bash
brew install git nodejs libsass
```

## Installation
Clone the repository to your local machine (and remember where it's saved :)), using your favorite git client or the command line:
```bash
git clone https://github.com/nuxeo/nuxeo.com
cd nuxeo.com
```

Run npm install

```bash
npm install
```

## Run Locally
```bash
npm run dev
```

### Change browser
The broswer defaults to `chromium-browser` but can be changed with the following command and then locally as usual.
```bash
npm config set Nuxeo-website:browser firefox
```

## Project Structure
### `assets`
Any files in this directory will be copied to `site/assets` and can be referenced in html and templates. e.g. An image called `your_img.png` could be referenced by the following:
```html
<img src="/assets/your_img.png" alt="">
```

### `client`
Client side styles (SCSS) and JavaScript.

### `layout`
Templates and partials. See [working with templates](./docs/layouts.md).

### `modules`
Nuxeo specific modules.

### `site`
Generated output of the site. This is what will be served in production.

### `src`
Source Markdown and HTML files for content.

#### Mandatory frontmatter
All `.md` (Markdown) content files should have a YAML frontmatter defined at the top of the file. e.g.

```md
---
layout: default.hbs
title: Title of the page
description: A description for search engines and social media to consume.

---

Content of page goes here.
```

#### Global optional frontmatter
##### `style`
Define a page specific style sheet. Defined in `client/scss/`. e.g. To use `client/scss/home.scss`, the front-matter would be:
```md
---
...
style: home
...
---
Page content here.
```
##### `script`
Define a page specific JavaScript. Defined in `client/js/`. e.g. To use `client/scss/home.js`, the front-matter would be:
```md
---
...
script: home
...
---
Page content here.
```

You also need to add an entry to `webpack.config.js`. See `main.js` as an example.


### `test`
Unit tests for modules.

### `verify`
Verification tests for post building.

### `build.js`
The main build script for generating the output for `site`.

### `config.yml`
Site configurations, ability to have production or development specific values.

### `package.json`
Build processes are defined here. Should be relatively self explanatory but anything special will be explained here.

# Trouble shooting
## Invalid front-matter
Error: `Error: Invalid frontmatter in file: {filepath}`

### Solution
Run YAML linter to locate the issue with:

`npm run yaml_lint {filepath}`

# Markdown and Handlebars
## Excerpts
Excerpts are to reuse content within the same page. In contrast Multi-excerpts can be reused in any page.
### Definition
```handlebars
{{! excerpt name="foo"}}
Reuse the text **foo** in this page only.
{{! /excerpt}}
```
or
``handlebars
{{! multiexcerpt name="bar"}}
Reuse the text **bar** in any page.
{{! /multiexcerpt}}
```

### Use
```handlebars
{{excerpt 'foo'}}
```
or
```handlebars
{{multiexcerpt 'bar'}}
```
