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

        this.panoElement.addEventListener(Events.sceneWillChange, this.switchScene);

        // Replace with a call to cachescenevariables, then use this.etc;
        const firstScene = this.scenes[this.initialScene];

        console.log(firstScene);

        firstScene.view.setParameters(firstScene.data.initialViewParameters);

        this.currentCache = firstScene;
        firstScene.scene.switchTo();

        this.firstLoad = false;

        // Broadcast sceneDidChange event
        const sceneDidChangeEvent = new CustomEvent(Events.sceneDidChange, { detail: null });
        this.panoElement.dispatchEvent(sceneDidChangeEvent);

        console.log(this.currentCache);
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
                console.log(this.currentCache);

                const eventArgs = {
                    detail: {
                        scene: findSceneById(this.scenes, hotspot.target)
                    }
                };
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

        const nextScene = event.detail;
        console.log(nextScene);

        const alteredViewParams = this.getTransitionRotation(this.currentData.id, nextScene.data.id);

        nextScene.view.setParameters(alteredViewParams);

        // overrides the this.currentXYZ variables.
        // I need those variables intact for altering the intial view params though. So do this after.
        // I question the need for .call though??? Is it needed.
        this.cacheSceneVariables.call(this, nextScene);
        nextScene.scene.switchTo();
    }

    // cacheSceneVariables(scene) {
    //     console.log(scene);
    //     // Doubt I'll need this. Could prove useful for some layer manipulation though?
    //     this.currentView = scene.view;
    //     this.currentScene = scene.scene;
    //     this.currentContainers = scene.containers;
    //     this.currentData = scene.data;
    //     this.currentLayers = scene.layers;
    // }
}
