// @ts-check

const MarzipanoViewer = require('./MarzipanoViewer');
const { deg2rad, findSceneById } = require('./utils');

module.exports = class DesktopViewer extends MarzipanoViewer {

    /**
    * 
    * @param {Element} panoElement - Injected by the viewSwitch file with either the VR or Desktop panoElement
    * @param {{ 
     * scene_data: { 
     * scenes: [], 
     * name: string, 
     * settings: {}, 
     * cubeGeometryLevels: [], 
     * fov: {}, 
     * faceSize: number,
     * debug: boolean}, 
     * tile_image_source: string,
     * icon_image_source: string
     * } } configData
    */
    constructor(panoElement, configData) {
        super('desktop', panoElement, configData);

        this.firstLoad = true;

        const groupedSceneData = this.setupSceneBehaviour(this.createScene);

        this.panoElement.addEventListener(Events.sceneWillChange, this.switchScene);

        this.switchScene(groupedSceneData[this.initialScene]);
    }


    createScene(viewer, source, geometry, data) {

        // [3] Create the "eyes" or view.
        let limiter = this.Marzipano.RectilinearView.limit.traditional(
            this.sceneData.faceSize,
            deg2rad(100),
            deg2rad(120));
        const view = new this.Marzipano.RectilinearView(data.initialViewParameters, limiter);

        // The current scene does not change when creating a scene in this way.
        const scene = viewer.createScene({
            source: source,
            geometry: geometry,
            view: view,
            pinFirstLevel: true
        });

        const hotspotContainer = scene.hotspotContainer();

        // Create link hotspots.
        data.linkHotspots.forEach((hotspot) => {
            let element = super.createLinkHotspotElement();

            // Add click event handler.
            element.children[0].addEventListener('click', () => {
                // this.currentScene = this.switchScene(findSceneById(hotspot.target));
                console.log('firing event!');
                const sceneWillChangeEvent = new CustomEvent(Events.sceneWillChange, { detail: findSceneById(this.sceneData.scenes, hotspot.target) });
                this.panoElement.dispatchEvent(sceneWillChangeEvent);
            });

            hotspotContainer.createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
        });

        // Create info hotspots.
        data.infoHotspots.forEach((hotspot) => {
            let element = super.createInfoHotspotElement(hotspot);
            hotspotContainer.createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
        });

        return { scene, view, data };
    }

    switchScene(scene) {


        const alteredViewParams = this.firstLoad ?
            scene.data.initialViewParameters :
            this.getTransitionRotation(this.currentData, scene.data);

        this.firstLoad = false;

        scene.view.setParameters(alteredViewParams);

        // overrides the this.currentXYZ variables.
        // I need those variables intact for altering the intial view params though. So do this after.
        // I question the need for .call though??? Is it needed.
        this.cacheSceneVariables.call(this, scene);
        scene.scene.switchTo();
    }

}
