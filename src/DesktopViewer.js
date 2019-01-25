// @ts-check

const MarzipanoViewer = require('./MarzipanoViewer');
const { deg2rad, findSceneById } = require('./utils');
const Events = require('./events');

module.exports = class DesktopViewer extends MarzipanoViewer {

    /**
    * 
    * @class Battenberg.DesktopViewer
    * @memberOf Battenberg  
    * @param { Element } panoElement - Injected by the consumer with either the VR or Desktop panoElement
    * @param { ConfigData } configData
    */
    constructor(panoElement, configData) {
        super('desktop', panoElement, configData);


        this.scenes = this.createScenesFromData(configData.scene_data.scenes, this.createScene, this.viewer);

        // Register some events
        this.panoElement.addEventListener(Events.sceneWillChange, this.switchScene);

        // Replace with a call to cachescenevariables, then use this.etc;
        const firstScene = this.scenes[this.initialScene];

        this.cacheSceneVariables(firstScene);

        firstScene.view.setParameters(firstScene.data.initialViewParameters);


        firstScene.scene.switchTo();

        // Broadcast sceneDidChange event
        const sceneDidChangeEvent = new CustomEvent(Events.sceneDidChange, { detail: null });
        this.panoElement.dispatchEvent(sceneDidChangeEvent);

        this.firstLoad = false;

    }


    createScene(viewer, source, geometry, data) {

        // Create the "eyes" or view.
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

                console.log('firing event!');

                // The data passed to the event handler function, it gets merged into the 1st event argument as event.detail
                const eventArgs = {
                    detail: {
                        currentScene: findSceneById(this.scenes, data.id),
                        nextScene: findSceneById(this.scenes, hotspot.target),
                        _this: this
                    }
                };

                // Fire off the sceneWillChange event
                const sceneWillChangeEvent = new CustomEvent(Events.sceneWillChange, eventArgs);
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

    /**
     * 
     * @param { CustomEvent } event
     */
    switchScene(event) {

        const { currentScene, nextScene, _this } = event.detail;

        const alteredViewParams = _this.getTransitionRotation(currentScene.data.id, nextScene.data.id);

        nextScene.view.setParameters(alteredViewParams);

        _this.cacheSceneVariables(nextScene);
        nextScene.scene.switchTo();

        // Do we also want to fire a sceneDidChange here? Is there a built in marzipano one?
        // Also, sceneDidChange vs sceneDidFinishLoading? Could use both.
    }

}
