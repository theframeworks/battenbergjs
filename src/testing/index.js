const bb = require('../index');

const data = require('../sceneDataDesktop');
console.log(data)
const pano = document.getElementById('pano');

const bbdv = new bb.DekstopViewer(pano, data);

console.log(bbdv);