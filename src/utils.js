const Marzipano = require('marzipano');

/**
 * 
 * @param {string} id 
 * @returns Marzipano.ImageUrlSource
 */
module.exports.tiledImageSource = (imageDir, id) => {

    const urlPrefix = imageDir + '/' + id;
    const source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + '/{z}/{f}/{y}/{x}.jpg',
        { cubeMapPreviewUrl: urlPrefix + '/preview.jpg' });

    return source;
}


// Do I need to make these 180s as floats?
// JS only has the Number type for all numbers though, probably not an issue.
module.exports.deg2rad = (deg) => {
    return deg * Math.PI / 180;
}

module.exports.rad2deg = (rad) => {
    return rad * 180 / Math.PI;
}

/**
 * Clamp a radian rotation between -Pi and Pi.
 * 0 is looking directly at the spot.
 * Negative results are moving left.
 * Positive results are moving right.
 * @param {Number} rotation 
 */
module.exports.clampOverflowRotation = (rotation) => {
    const pi2 = (Math.PI * 2);
    let radian = (rotation + Math.PI) % pi2;

    if (radian < 0) radian += pi2;

    return radian - Math.PI;
}

module.exports.isBelievedDesktop = () => {
    return this.environment !== 'mobileVR';
}


module.exports.findSceneById = (id) => {
    for (let i = 0; i < this.scenes.length; i++) {
        if (this.scenes[i].data.id === id) {
            return this.scenes[i];
        }
    }
    return null;
}

module.exports.findSceneDataById = (id) => {
    for (let i = 0; i < this.sceneData.scenes.length; i++) {
        if (this.sceneData.scenes[i].id === id) {
            return this.sceneData.scenes[i];
        }
    }
    return null;
}
