

class DesktopViewer extends MarzipanoViewer {

    constructor(panoElement) {
        super('desktop', panoElement, window.sceneDataDesktop);

        this.autorotateData;
        this.firstLoad = true;


        this.autorotateToggleElement = document.querySelector('#autorotateToggle');
        this.sceneNameElement = document.querySelector('#titleBar .sceneName');

        const groupedSceneData = this.setupSceneBehaviour(this.createScene, this.switchScene);

        this.switchScene(groupedSceneData[this.initialScene]);
    }

    createScene(viewer, source, geometry, data) {

        // [3] Create the "eyes" or view.
        let limiter = this.Marzipano.RectilinearView.limit.traditional(
            this.sceneData.faceSize,
            this.deg2rad(100),
            this.deg2rad(120));
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
            let element = super.createLinkHotspotElement.call(this, hotspot, this.switchScene);
            hotspotContainer.createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
        });

        // Create info hotspots.
        data.infoHotspots.forEach((hotspot) => {
            let element = super.createInfoHotspotElement(hotspot, this.panoElement);
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
        this.cacheSceneVariables.call(this, scene);
        scene.scene.switchTo();
    }

}
