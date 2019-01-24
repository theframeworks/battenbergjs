# Battenberg.js

## Requirements

- Node 8+
- A pure heart ❤️

## Installation

`npm install`

## Development

Use `npm run serve:dev` from `/src` for now or just `http-server` directly if you like.

You can also directly view the `/src/index.html` file via filepath if you want. 🤷‍♀

Currently there's a `src/testing` directory where I'm actively using the battenburg code while refactoring. Feel free to create your own if you like, but maybe gitignore it like I did with `/demo`.
 
## TODO

Add a proper watch setup

browserify is good! I just gotta work out what files and where to export stuff etc. Can start looking at making a node module soon.

`browserify ./testing/index.js  > ./testing/bundle.js --debug`

--debug is for source maps
