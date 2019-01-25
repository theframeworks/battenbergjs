/**
  * @namespace Battenberg
  */


  // TODO: This is crying out for Typescript

  // TODO: Add a definition for the scene transition mapping option in ConfigData

/**
 * @description ConfigData config
 * @memberof Battenberg
 * @typedef { Object } ConfigData
 * @property { scene_data } scene_data
 * @property { String } tile_image_source:
 * @property { String } icon_image_source
 * @property { Number } initial_scene
 * @property { Boolean } debug
 */

/**
 * @description scene_data config
 * @memberof Battenberg
 * @typedef {Object} scene_data
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

