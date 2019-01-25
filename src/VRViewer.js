const MarzipanoViewer = require('./MarzipanoViewer');
const DeviceOrientationStrategy = require('./DeviceOrientationStrategy');
const { deg2rad, clampOverflowRotation, findSceneById } = require('./utils');

module.exports = class VRViewer extends MarzipanoViewer {

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
     * debug?: boolean }, 
     * image_source: string
     * } } configData
   */
    constructor(panoElement, configData) {

        super('mobileVR', panoElement, configData);

        this.gyroEnabled;
        this.viewingTimeoutID = null;
        this.currentHotspotCandidate = null;

        this.openedHotspot = null;


        this.lookTriggerThreshold = 1.5 * 1000;
        this.openPopupRadianThreshhold = deg2rad(5);
        // This is the single column threshold, it gets doubled when exiting 2 column popups
        this.closePopupHorizontalRadianThreshholdPerColumn = deg2rad(15);

        this.orientationMethodID = 'deviceOrientation';

        this.deviceOrientationController;

        this.scenes = this.createScenesFromData(this.sceneData.scenes, this.switchScene, this.viewer);

        const groupedSceneData = this.setupSceneBehaviour(this.createScene, this.switchScene);

        this.setupGyroControls();

        this.switchScene(groupedSceneData[this.initialScene]);
    }


    // Shared signature with DesktopViewer.createScene() but I don't use it all. Could lean on Duck Typing?
    // TODO: Maybe accept opts object.
    createScene(viewer, source, geometry, data) {

        const stage = viewer.stage();

        const leftRightRects = [
            { rect: { relativeWidth: 0.5, relativeX: 0 } }, // left
            { rect: { relativeWidth: 0.5, relativeX: 0.5 } }  // right
        ];

        const opts = {
            source: source,
            geometry: geometry,
            // pinFirstLevel: true,
            textureStoreOpts: {
                previouslyVisibleCacheSize: 32
            },
            layerOpts: {
                effects: null
            }
        };

        const containers = [];
        const layers = [];

        const emptyView = new this.Marzipano.RectilinearView(data.initialViewParameters);
        const scene = viewer.createEmptyScene({ view: emptyView });

        leftRightRects.forEach((rect, index) => {

            opts.layerOpts.effects = rect;
            const layer = scene.createLayer(opts);

            // Probably don't need this but it might be useful for debugging or state checks.
            layer.eyeSide = index === 0 ? 'left' : 'right';

            // Add hotspots.
            const hotspotContainer = new this.Marzipano.HotspotContainer(
                viewer.domElement(),
                stage,
                emptyView,
                viewer.renderLoop(),
                rect);

            // Create link hotspots.
            data.linkHotspots.forEach((hotspotData) => {
                const element = super.createLinkHotspotElement(hotspotData);
                element.dataset.hotspot_target = hotspotData.target;

                // Add click event handler.
                element.children[0].addEventListener('click', () => {
                    this.currentScene = this.switchScene(findSceneById(hotspotData.target));
                });
                hotspotContainer.createHotspot(element, { yaw: hotspotData.yaw, pitch: hotspotData.pitch });
            });

            // Create info hotspots.
            data.infoHotspots.forEach((hotspotData) => {
                if (hotspotData.hideInVR) {
                    return; // We're in a .forEach function so we return instead of continue
                }
                const element = super.createInfoHotspotElement(hotspotData);
                element.dataset.hotspot_target = hotspotData.id;
                hotspotContainer.createHotspot(element, { yaw: hotspotData.yaw, pitch: hotspotData.pitch });
            });

            // Hide all containers at first.
            hotspotContainer.hide();
            containers.push(hotspotContainer);
            layers.push(layer);
        });

        if (data.id === 'scene-0') {
            this.showHotspotZero(containers);
        }

        // Should probably alter this to get the hotspots yaw and pitch form the container.listHotspots().

        // Add a little extra data for using in view collision checks.

        const infoData = data.infoHotspots
            .filter(ih => Object.keys(ih).includes('hideInVR') === false)
            // We don't want collisions with hotspot 0 (the tutorial)
            .filter(ih => ih.id !== '0')
            .map(ih => { return { yaw: ih.yaw, pitch: ih.pitch, target: ih.id, columns: ih.columns || 1 }; });

        const linkData = data.linkHotspots.map(lh => { return { yaw: lh.yaw, pitch: lh.pitch, target: lh.target }; });

        data.vrCollisionData = [...infoData, ...linkData];

        // Useful later for deciding where to center the view on scene change.
        data.firstLoad = true;

        // Gets deconstructed on the other side.
        return { scene: scene, view: emptyView, containers, layers, data };
    }


    showHotspotZero(containers) {

        const { leftHotspot } = this.getHotspotsFromHotspotTarget(containers, '0');
        const leftElement = leftHotspot.domElement();
        this.clickInfoHotspot(leftElement);

    }


    switchScene(scene) {

        // Switch the current containers.
        // I would prefer to directly show and hide elements [0] and [1] from the respective arrays.
        // However when loading the app `this.currentContainers` is empty when I'm pretty sure it should be populated.
        // I can only assume it's a `this` issue or some wonky state. So to be safe I'm sticking to `Array.forEach()`
        this.currentContainers.forEach(c => {
            c.hide();
        });
        scene.containers.forEach(c => {
            c.show();
        });

        // Clear any hotspot looking timers.
        clearTimeout(this.viewingTimeoutID);
        this.viewingTimeoutID = null;


        const alteredViewParams = this.getTransitionRotation(this.currentData, scene.data);

        scene.view.setParameters(alteredViewParams);

        // overrides the this.currentXYZ variables. 
        // I need those variables intact for altering the intial view params though. So do this after.
        // I question the need for .call though??? Is it needed.

        this.cacheSceneVariables.call(this, scene);

        scene.scene.switchTo({}, () => {
            // This function is called when scene transition finishes. Maybe it will be useful later?
            // Especially if we want to alter the initial view rotation by our previous scenes values.
        });

    }

    debugLookDirectionSetup(groupedSceneData) {

        // For testing view direction on desktop only
        // This is also useful if you want to know the yaw and pitch for placing desktop
        groupedSceneData.forEach(gsd => {
            gsd.view.addEventListener('change', () => {

                this.computeLookDirection.call(this, null, this.currentScene, this.currentView);
            });
        })
    }

    // Could pass in the deviceOrientationControlFunction
    setupGyroControls() {

        this.deviceOrientationController = new DeviceOrientationStrategy(this.Marzipano);
        this.Marzipano.dependencies.eventEmitter(DeviceOrientationStrategy);
        // Register the custom control method.  
        const instantEnable = true;
        this.viewer.controls().registerMethod(this.orientationMethodID, this.deviceOrientationController, instantEnable);

        this.deviceOrientationController.addEventListener('updatedYawPitchRoll', (_, rotation) => {

            // if (this.switchingScenes) { return; }
            this.computeLookDirection.call(this, rotation, this.currentScene, this.currentView);
        });
    }


    /**
     * Set the opening animation on (true) or off (false)
     * 
     * @param {Boolean} on 
     */
    setTimerClass(on) {
        this.panoElement.classList.toggle('is-opening', on);
    }

    /**
     * 
     * 
     * @param {Element} element 
     */
    clickInfoHotspot(element) {
        element.querySelector('.info-hotspot-header').click();
    }

    /**
    * 
    * @param {Element} element 
    */
    clickLinkHotspot(element) {
        element.querySelector('.link-hotspot').click();
    }


    minimumLookAtBounds(spot, params) {

        const yawDiff = spot.yaw - params.yaw;
        const pitchDiff = spot.pitch - params.pitch;
        const lookAtUpperBound = yawDiff < this.openPopupRadianThreshhold && pitchDiff < this.openPopupRadianThreshhold;
        const lookAtLowerBound = yawDiff > -this.openPopupRadianThreshhold && pitchDiff > -this.openPopupRadianThreshhold;

        return { yawDiff, pitchDiff, lookAtUpperBound, lookAtLowerBound };
    }


    minimumLookAwayBounds(spot, params) {

        // Gotta normalise the yaw diff a bit
        const yawDiff = clampOverflowRotation(spot.yaw - params.yaw);

        // > < is flipped from the {lookAt} bounds
        // we're trying to get FURTHER AWAY to close, not CLOSE ENOUGH to open
        const lookAwayMinimumUpperBound = yawDiff > this.closePopupHorizontalRadianThreshholdPerColumn * spot.columns;
        const lookAwayMinimumLowerBound = yawDiff < -this.closePopupHorizontalRadianThreshholdPerColumn * spot.columns;

        return { yawDiff, lookAwayMinimumUpperBound, lookAwayMinimumLowerBound };
    }


    // By using prototype.call() {this} will be the normal class scope and have access to class variables.
    computeLookDirection(rotation, currentScene, currentView) {

        // pitch, roll and yaw in radians
        const params = currentView.parameters();

        // Nothing selected or currently selecting. Go find a hotspot
        if (!this.currentHotspotCandidate && !this.openedHotspot) {
            // Haven't found and opened a hotspot yet.
            // Lets go looking for one.
            let hotspots = this.currentData.vrCollisionData;

            // Loops the hotspots, look for one with a close enough pitch and yaw, select that as the candidate
            for (let i = 0; i < hotspots.length; i++) {

                if (this.currentHotspotCandidate) {
                    continue;
                }

                const spot = hotspots[i];
                // compute a rotation difference
                const { yawDiff, pitchDiff, lookAtUpperBound, lookAtLowerBound } = this.minimumLookAtBounds(spot, params);

                // If that difference is within a tolerance then interact with the element.
                if (lookAtUpperBound && lookAtLowerBound) {

                    this.currentHotspotCandidate = spot;

                    // Have we begun looking at any hotspot yet?
                    if (!this.viewingTimeoutID) {

                        this.setTimerClass(true);

                        this.viewingTimeoutID = setTimeout(() => {

                            const { leftHotspot, rightHotspot } = this.getHotspotsFromHotspotTarget(this.currentContainers, this.currentHotspotCandidate.target);
                            const leftElement = leftHotspot.domElement();

                            this.setTimerClass(false);
                            this.viewingTimeoutID = null;

                            // this.currentHotspotCandidate = null;

                            // Is it an link or info hotspot?
                            if (leftElement.dataset.hotspot_target.includes('scene')) {
                                this.openedHotspot = null;
                                this.clickLinkHotspot(leftElement);
                            }
                            else {
                                this.openedHotspot = spot;
                                this.clickInfoHotspot(leftElement);
                            }
                        }, this.lookTriggerThreshold);
                    }
                }
            }

        }
        // We have a candidate and we're currently counting down. Check for look away during this time.
        else if (this.currentHotspotCandidate && !this.openedHotspot) {

            const spot = this.currentHotspotCandidate;

            // compute a rotation difference
            const { yawDiff, pitchDiff, lookAtUpperBound, lookAtLowerBound } = this.minimumLookAtBounds(spot, params);

            // Are we now looking away from the candidate?
            if (!lookAtUpperBound || !lookAtLowerBound) {
                clearTimeout(this.viewingTimeoutID);
                // The clearTiemout function doesn't reset the variable to something safe.
                this.viewingTimeoutID = null;
                this.openedHotspot = null;
                this.currentHotspotCandidate = null;
                this.setTimerClass(false);
                return;
            }
        }
        // A hotspot has been opened, now start trying to close it.
        else if (this.openedHotspot) {

            const spot = this.openedHotspot;

            const { yawDiff, lookAwayMinimumUpperBound, lookAwayMinimumLowerBound } = this.minimumLookAwayBounds(spot, params);

            if (lookAwayMinimumLowerBound || lookAwayMinimumUpperBound) {

                const { leftHotspot, rightHotspot } = this.getHotspotsFromHotspotTarget(this.currentContainers, spot.target);
                const leftElement = leftHotspot.domElement();

                this.clickInfoHotspot(leftElement);
                // Reset various cached variables
                clearTimeout(this.viewingTimeoutID);
                this.viewingTimeoutID = null;
                this.openedHotspot = null;
            }
        }
    }

    getHotspotsFromHotspotTarget(containers, target) {

        const hotspots = [...containers[0].listHotspots()];

        for (let i = 0; i < hotspots.length; i++) {
            const d = hotspots[i].domElement();

            if (d.dataset.hotspot_target == target) {
                const left = hotspots[i];
                const right = containers[1].listHotspots()[i];
                return { leftHotspot: left, rightHotspot: right };
            }
        }

        // Throw an error, don't catch it. This is a crashing error.
        console.error('no hotspot found?');
    }

}
