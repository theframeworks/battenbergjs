// @ts-check

const Marzipano = require('marzipano');
const { tiledImageSource, isBelievedDesktop, defaultSceneTransitionRotationMapping } = require('./utils');

module.exports = class MarzipanoViewer {

    /**
     * @class Battenberg.MarzipanoViewer
     * @memberof Battenberg
     * @param {string} environment 
     * @param {Element} panoElement - Injected by the viewSwitch file with either the VR or Desktop panoElement
     * @param { ConfigData } configData 
     */
    constructor(environment, panoElement, configData) {

        this.panoElement = panoElement;
        this.environment = this.prepareEnvironment(environment);
        this.initialScene = configData.initial_scene || 0;
        this.defaultRotationMapping = defaultSceneTransitionRotationMapping();
        this.rotationMaps = configData.scene_transition_rotation_mapping || this.defaultRotationMapping;



        this.Marzipano = Marzipano;

        this.sceneData = configData.scene_data;
        this.imageDir = configData.tile_image_source;
        this.linkIconPath = configData.link_icon_path;
        // Is this safe with coercion etc.? 
        // If it's assigned and true then assign true,
        // else it's undefined, null or false then assign false
        this.debugging = configData.debug ? true : false;

        this.believedDesktop = isBelievedDesktop();

        // Viewer options. Choices here: http://www.marzipano.net/reference/global.html#registerDefaultControls
        let viewerOpts = {
            controls: {
                // We'll default to mouse/pointer control, I can turn on VR gyro control on user demand.
                mouseViewMode: this.sceneData.settings.mouseViewMode || false,
                scrollZoom: false,
            }
        };

        // Initialize viewer.
        this.viewer = new this.Marzipano.Viewer(this.panoElement, viewerOpts);


        this.currentScene = null;
        this.defaultView = null;
        this.currentData = {};
        this.currentContainers = [];
        this.currentLayers = [];
    }



    /**
     * @param {any[]} _data
     * @param {Function} createScene
     */
    createScenesFromData(_data, createScene, viewer) {

        return _data.map(mData => {


            // [1] get the images
            const source = tiledImageSource(this.imageDir, mData.id);

            // [2] Create the geometry
            let geometry = new this.Marzipano.CubeGeometry(this.sceneData.cubeGeometryLevels);

            const { scene, view, containers, layers, data } = createScene.call(this, viewer, source, geometry, mData);

            // Yes this is verbose, when we could store the createScene results directly into this variable. 
            // But these values are prone to change and routinely debugged against.
            const groupedSceneData = {
                data: data,
                scene: scene,
                containers: containers,
                layers: layers,
                view: view
            };

            return groupedSceneData;
        });
    }


    cacheSceneVariables(scene) {

        // Doubt I'll need this. Could prove useful for some layer manipulation though?
        this.currentView = scene.view;
        this.currentScene = scene.scene;
        this.currentContainers = scene.containers;
        this.currentData = scene.data;
        this.currentLayers = scene.layers;
    }


    /**
     * 
     * @returns {HTMLDivElement}
     */
    createLinkHotspotElement() {

        // Create wrapper element to hold icon and tooltip.
        let wrapper = document.createElement('div');
        wrapper.classList.add('hotspot');
        wrapper.classList.add('link-hotspot');

        // Create image element.
        let icon = document.createElement('img');
        icon.src = this.linkIconPath;
        icon.classList.add('link-hotspot-icon');


        // Prevent touch and scroll events from reaching the parent element.
        // This prevents the view control logic from interfering with the hotspot.
        this.stopTouchAndScrollEventPropagation(wrapper);

        // Create tooltip element.
        let tooltip = document.createElement('div');
        tooltip.classList.add('hotspot-tooltip');
        tooltip.classList.add('link-hotspot-tooltip');

        wrapper.appendChild(icon);
        wrapper.appendChild(tooltip);

        let container = document.createElement('div');
        container.appendChild(wrapper);

        return container;
    }


    createInfoHotspotElement(data) {

        let container = document.createElement('div');
        container.setAttribute('data-info-hotspot-container-id', data.id);

        // Create wrapper element to hold icon and tooltip.
        let wrapper = document.createElement('div');
        wrapper.classList.add('hotspot');
        wrapper.classList.add('info-hotspot');

        // Create hotspot/tooltip header.
        let header = document.createElement('div');
        header.classList.add('info-hotspot-header');
        header.setAttribute('data-info-hotspot-id', data.id);

        // Create image element for the little icon.
        let iconWrapper = document.createElement('div');
        iconWrapper.classList.add('info-hotspot-icon-wrapper');

        // Construct header element.
        header.appendChild(iconWrapper);

        // Add content to the content container
        let content = document.createElement('div');
        content.classList.add('info-hotspot-content');
        content.setAttribute('data-info-hotspot-id', data.id);

        let hotspotElem = document.getElementById(`hotspot-${data.id}`);
        if (hotspotElem) {
            content.appendChild(hotspotElem.cloneNode(true));
        }

        if (data.hideInMobile) {
            wrapper.classList.add('is-hidden-inline');
            content.classList.add('is-hidden-inline');
        }


        // Place header into wrapper element.
        wrapper.appendChild(header);
        (this.believedDesktop ? this.panoElement : wrapper).appendChild(content);



        let toggle = this.toggleHotspotVisibility;

        // Show content when hotspot is clicked.
        wrapper.querySelector('.info-hotspot-header').addEventListener('click', toggle);

        let closeIcon = content.querySelector('[data-hotspot-close]');
        if (closeIcon) {
            closeIcon.setAttribute('data-info-hotspot-id', data.id);
            closeIcon.addEventListener('click', toggle);
        }

        // Prevent touch and scroll events from reaching the parent element.
        // This prevents the view control logic from interfering with the hotspot.
        this.stopTouchAndScrollEventPropagation(wrapper);

        container.appendChild(wrapper);

        return container;
    }

    /**
     * 
     * @param {Event} event 
     */
    toggleHotspotVisibility(event) {
        let id = event.currentTarget.getAttribute('data-info-hotspot-id');

        event.preventDefault();

        document.querySelectorAll(`[data-info-hotspot-id="${id}"]`).forEach(function (element) {
            element.classList.toggle('is-visible');

            // reappending the open hotspot brings it on top of other hotspots
            // playing with z-index wouldn't work as we are dealing with transformed elements
            if (element.classList.contains('is-visible')) {
                document.querySelectorAll(`[data-info-hotspot-container-id="${id}"]`).forEach(function (element) {
                    element.parentNode.appendChild(element);
                });
            }
        });
    }

    // Prevent touch and scroll events from reaching the parent element.
    stopTouchAndScrollEventPropagation(element) {
        let eventList = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel', 'mousewheel'];

        for (let i = 0; i < eventList.length; i++) {
            element.addEventListener(eventList[i], function (event) {
                event.stopPropagation();
            });
        }
    }

    /**
     * 
     * @param {String} env 
     */
    prepareEnvironment(env) {

        if (window.matchMedia) {
            let setMode = function () {
                if (mql.matches) {
                    document.body.classList.remove('desktop');
                    document.body.classList.add('mobile');
                } else {
                    document.body.classList.remove('mobile');
                    document.body.classList.add('desktop');
                }
            };
            let mql = matchMedia('(max-width: 500px), (max-height: 500px)');
            setMode();
            mql.addListener(setMode);
        } else {
            document.body.classList.add('desktop');
        }

        return env;
    }


    /**
     * @param { string } from 
     * @param {string } to 
     * @returns {{ 'scene_name': { pitch: number, yaw: number }}} pitch and yaw 
     */
    getTransitionRotation(from, to) {
        console.log({ mapping: this.rotationMaps, from, to });
        if (this.useDefaultRotationMapping()) {
            return this.rotationMaps;
        }

        return this.rotationMaps.from[from].to[to];
    }

    useDefaultRotationMapping() {
        return this.rotationMaps === this.defaultRotationMapping;
    }
};
