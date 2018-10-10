(function () {

    const Marzipano = require('marzipano');

    // Create viewer.
    var viewer = new Marzipano.Viewer(document.getElementById('pano'));

    // Create source.
    var source = Marzipano.ImageUrlSource.fromString(
        "tiles/0-top-of-stairs/{z}/{f}/{y}/{x}.jpg",
        { cubeMapPreviewUrl: "tiles/0-top-of-stairs/preview.jpg" });

    // Create geometry.
    var geometry = new Marzipano.CubeGeometry([{ tileSize: 1024, size: 1024 }]);

    // Create view.
    var limiter = Marzipano.RectilinearView.limit.traditional(4096, 100 * Math.PI / 180);
    var view = new Marzipano.RectilinearView(null, limiter);

    // Create scene.
    var scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: view,
        pinFirstLevel: true
    });

    // Display scene.
    scene.switchTo();
})();