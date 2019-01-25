# Battenberg.js

## Requirements

- Node 8+
- A pure heart ❤️

## Installation

`npm install`

## Development

Use `npm run serve:dev` from `/src` for now or just `http-server` directly if you like.

You can also directly view the `/src/index.html` file via filepath if you want. 🤷‍♀

Currently there's a `src/testing` directory where I'm actively using the battenberg code while refactoring. Feel free to create your own if you like, but maybe gitignore it like I did with `/demo`.

browserify is good! Until proper build tooling is in place you must run this (or something like this). Note: --debug is for source maps

`browserify ./src/testing/js/index.js  > ./src/testing/js/bundle.js --debug`

## TODO

There is a todo list file, [found here.](./TODO.md)