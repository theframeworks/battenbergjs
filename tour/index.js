const Marzipano = require('marzipano');

var panoElement = document.querySelector('#pano');

// Viewer options.
var viewerOpts = {
  controls: {
    mouseViewMode: data.settings.mouseViewMode
  }
};

// Initialize viewer.
var viewer = new Marzipano.Viewer(panoElement, viewerOpts);
