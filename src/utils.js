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


module.exports.findSceneById = (scenes, id) => {
    for (let i = 0; i < scenes.length; i++) {
        if (scenes[i].data.id === id) {
            return scenes[i];
        }
    }
    return null;
}

// Needed?
module.exports.findSceneDataById = (id) => {
    for (let i = 0; i < this.sceneData.scenes.length; i++) {
        if (this.sceneData.scenes[i].id === id) {
            return this.sceneData.scenes[i];
        }
    }
    return null;
}

module.exports.defaultSceneTransitionRotationMapping = () => {

    return {
        yaw: 0,
        pitch: 0
    };

}

// Here is an example of the format for scene transition mapping. We need to work out how to properly add this 
// feature back in for generic, user supplied mappings.

// return {
//     'from': {
//         'scene-0': {
//             'to': {
//                 // Required for first load. From 0 to 0 is silly but go with it.
//                 'scene-0': {
//                     'yaw': 3.8,
//                     'pitch': 0.22798880022457624,
//                 },
//                 'scene-1': {
//                     'yaw': -2.8274448996260446,
//                     'pitch': 0.06012930486655321
//                 }
//             }
//         },
//         'scene-1': {
//             'to': {
//                 'scene-0': {
//                     'yaw': 0.145253345801045,
//                     'pitch': 0.07
//                 },
//                 'scene-2': {
//                     'yaw': -0.14971585481837835,
//                     'pitch': 0.07
//                 },
//                 'scene-3': {
//                     'yaw': 2.6021574657373403,
//                     'pitch': 0.09960663233749756
//                 }
//             }
//         },
//         'scene-2': {
//             'to': {
//                 'scene-1': {
//                     'yaw': 2.432133517575684,
//                     'pitch': 0.07
//                 }
//             }
//         },
//         'scene-3': {
//             'to': {
//                 'scene-1': {
//                     'yaw': -0.4469404282362994,
//                     'pitch': 0.07244311540308956
//                 },
//                 'scene-4': {
//                     'yaw': -1.3994865291876781,
//                     'pitch': 0.05190705801597417
//                 },
//                 'scene-5': {
//                     'yaw': 1.403211200196525,
//                     'pitch': 0.07
//                 }
//             }
//         },
//         'scene-4': {
//             'to': {
//                 'scene-3': {
//                     'yaw': 1.0620391999023013,
//                     'pitch': 0.07
//                 }
//             }
//         },
//         'scene-5': {
//             'to': {
//                 'scene-3': {
//                     'yaw': -0.5201367601720577,
//                     'pitch': 0.11417302060570478
//                 }
//             }
//         }
//     }
// };