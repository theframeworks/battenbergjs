const Marzipano = require('marzipano');

/**
 * 
 * @param {string} id 
 * @returns Marzipano.ImageUrlSource
 */
let tiledImageSource = (id) => {

    const urlPrefix = 'tiles/' + id;
    const source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + '/{z}/{f}/{y}/{x}.jpg',
        { cubeMapPreviewUrl: urlPrefix + '/preview.jpg' });

    return source;
}

module.exports.tiledImageSource = tiledImageSource;