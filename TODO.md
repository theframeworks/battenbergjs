# TODO

- ~~Correctly use the supplied icons directory to load icons.~~
- Work on accepting more options in constructors.
- Some longer function signatures could use an object of options.
- Some functions accept arguments they neither use or need.
- The usage and abuse of `this` is bad.
    - Can we use bind?
    - Should we change the paradigm to a more functional style maybe? See `utils.js` for an example.
- Generify / rename the CSS.
- Would love to investigate typescript, even if just for the argument and object strucural typing definitons.
- Investigate proper packaging for browser direct use, commonjs, AMD, es6 module etc. for maximum usability.
- Reinvestigate gulp/build pipeline.
    - Add an object for the src and dest file paths, use those instead of hard coding the paths as strings.
- Go through and rename some things to be more battenberg relevant instead of marzipano relevant. Mostly function signatures.