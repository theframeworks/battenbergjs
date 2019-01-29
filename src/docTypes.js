/**
  * @namespace Battenberg
  */


// TODO: Add a definition for the scene transition mapping option in ConfigData

/**
 * @description ConfigData config
 * @memberof Battenberg
 * @typedef { Object } ConfigData
 * @property { SceneData } scene_data
 * @property { String } tile_image_source:
 * @property { String } link_icon_path
 * @property { SceneTransitionRotationMapping } [scene_transition_rotation_mapping]
 * @property { Number } [initial_scene]
 * @property { Boolean } [debug]
 */

/**
 * @description scene_data config
 * @memberof Battenberg
 * @typedef {Object} SceneData
 * @property {Array} scenes
 * @property {String} name
 * @property { {
     mouseViewMode: string,
     autorotateEnabled: boolean,
     fullscreenButton: boolean,
     viewControlButtons: boolean
 } }  settings
 * @property  { [
         {
             tileSize: number,
             size: number,
             fallbackOnly: boolean
         }
     ] } cubeGeometryLevels
 * @property { {
         maxVertical: number,
         maxHorizontal: number
     } } fov
 * @property faceSize: number,
 */


// TODO: Come back and make proper JSDoc type for this

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