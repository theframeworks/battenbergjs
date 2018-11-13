const bb = require('../index');

const vr = true;

const pano = document.getElementById('pano');

console.log(viewer);

function createVR() {

    const data = require('../sceneDataVR');
    return new bb.VRViewer(pano, data);
}
function createDesktop() {

    const data = require('../sceneDataDesktop');
    return new bb.DesktopViewer(pano, data);
}
