// @ts-check

const Marzipano = require('marzipano');
const { tiledImageSource, isBelievedDesktop, rad2deg, deg2rad, findSceneById, findSceneDataById } = require('./utils');

module.exports = class MarzipanoViewer {

    /**
     * 
     * @param {string} environment 
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
     * image_source: string
     * } } configData
     */
    constructor(environment, panoElement, configData) {

        this.panoElement = panoElement;
        this.environment = this.prepareEnvironment(environment);
        this.initialScene = 0;
        this.rotationMaps = this.sceneTransitionRotationMapping();


        this.Marzipano = Marzipano;

        this.sceneData = configData.scene_data;
        this.imageDir = configData.image_source;
        this.debugging = configData.debug || false;

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


    setupSceneBehaviour(sceneCreator) {

        // Create scenes using the provided data json
        this.scenes = this.createScenesFromData(this.sceneData.scenes, sceneCreator, this.viewer);

        this.cacheSceneVariables(this.scenes[this.initialScene]);

        return this.scenes;
    }



    /**
     * 
     * @param {[]} _data 
     * @param {() => {}} sceneCreator 
     */
    createScenesFromData(_data, createScene, viewer) {

        return _data.map((mData, i) => {


            // [1] get the images
            const source = tiledImageSource(this.imageDir, mData.id);

            // [2] Create the geometry
            let geometry = new this.Marzipano.CubeGeometry(this.sceneData.cubeGeometryLevels);

            // TODO: Maybe move the groupedSceneData return object into it.
            // Then desktop can return Scene and VR can return Stage. Does it even matter though?
            const { scene, view, containers, layers, data } = createScene.call(this, viewer, source, geometry, mData);

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

        // // Doubt I'll need this. Could prove useful for some layer manipulation though?
        this.currentView = scene.view;
        this.currentScene = scene.scene;
        this.currentContainers = scene.containers;
        this.currentData = scene.data;
        this.currentLayers = scene.layers;
    }


    createLinkHotspotElement(hotspot, switchScene) {

        // Create wrapper element to hold icon and tooltip.
        let wrapper = document.createElement('div');
        wrapper.classList.add('hotspot');
        wrapper.classList.add('link-hotspot');

        // Create image element.
        let icon = document.createElement('img');
        icon.src = 'icons/link.svg';
        icon.classList.add('link-hotspot-icon');

        // Add click event handler.
        wrapper.addEventListener('click', () => {
            this.currentScene = switchScene.call(this, findSceneById(hotspot.target));
        });

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


    createInfoHotspotElement(hotspot) {

        let container = document.createElement('div');
        container.setAttribute('data-info-hotspot-container-id', hotspot.id);

        // Create wrapper element to hold icon and tooltip.
        let wrapper = document.createElement('div');
        wrapper.classList.add('hotspot');
        wrapper.classList.add('info-hotspot');

        // Create hotspot/tooltip header.
        let header = document.createElement('div');
        header.classList.add('info-hotspot-header');
        header.setAttribute('data-info-hotspot-id', hotspot.id);

        // Create image element for the little icon.
        let iconWrapper = document.createElement('div');
        iconWrapper.classList.add('info-hotspot-icon-wrapper');

        // Construct header element.
        header.appendChild(iconWrapper);

        // Add content to the content container
        let content = document.createElement('div');
        content.classList.add('info-hotspot-content');
        content.setAttribute('data-info-hotspot-id', hotspot.id);

        let hotspotElem = document.getElementById(`hotspot-${hotspot.id}`);
        if (hotspotElem) {
            content.appendChild(hotspotElem.cloneNode(true));
        }

        if (hotspot.hideInMobile) {
            wrapper.classList.add('is-hidden-inline');
            content.classList.add('is-hidden-inline');
        }


        // Place header into wrapper element.
        wrapper.appendChild(header);
        (this.believedDesktop ? this.panoElement : wrapper).appendChild(content);



        let toggle = (event) => {
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
        };

        // Show content when hotspot is clicked.
        wrapper.querySelector('.info-hotspot-header').addEventListener('click', toggle);

        let closeIcon = content.querySelector('[data-hotspot-close]');
        if (closeIcon) {
            closeIcon.setAttribute('data-info-hotspot-id', hotspot.id);
            closeIcon.addEventListener('click', toggle);
        }

        // Prevent touch and scroll events from reaching the parent element.
        // This prevents the view control logic from interfering with the hotspot.
        this.stopTouchAndScrollEventPropagation(wrapper);

        container.appendChild(wrapper);

        return container;
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
                // The viewport is, at most 
                if (mql.matches) {
                    document.body.classList.remove('desktop');
                    document.body.classList.add('mobile');
                    // document.body.innerHTML = 'mobile';
                } else {
                    document.body.classList.remove('mobile');
                    document.body.classList.add('desktop');
                    // document.body.innerHTML = 'desktop';
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


    getTransitionRotation(from, to) {

        return this.rotationMaps.from[from.id].to[to.id];
    }

    // Could maybe be made into a file imported in the browser. Oh well.
    sceneTransitionRotationMapping() {
        return {
            'from': {
                'scene-0': {
                    'to': {
                        // Required for first load. From 0 to 0 is silly but go with it.
                        'scene-0': {
                            'yaw': 3.8,
                            'pitch': 0.22798880022457624,
                        },
                        'scene-1': {
                            'yaw': -2.8274448996260446,
                            'pitch': 0.06012930486655321
                        }
                    }
                },
                'scene-1': {
                    'to': {
                        'scene-0': {
                            'yaw': 0.145253345801045,
                            'pitch': 0.07
                        },
                        'scene-2': {
                            'yaw': -0.14971585481837835,
                            'pitch': 0.07
                        },
                        'scene-3': {
                            'yaw': 2.6021574657373403,
                            'pitch': 0.09960663233749756
                        }
                    }
                },
                'scene-2': {
                    'to': {
                        'scene-1': {
                            'yaw': 2.432133517575684,
                            'pitch': 0.07
                        }
                    }
                },
                'scene-3': {
                    'to': {
                        'scene-1': {
                            'yaw': -0.4469404282362994,
                            'pitch': 0.07244311540308956
                        },
                        'scene-4': {
                            'yaw': -1.3994865291876781,
                            'pitch': 0.05190705801597417
                        },
                        'scene-5': {
                            'yaw': 1.403211200196525,
                            'pitch': 0.07
                        }
                    }
                },
                'scene-4': {
                    'to': {
                        'scene-3': {
                            'yaw': 1.0620391999023013,
                            'pitch': 0.07
                        }
                    }
                },
                'scene-5': {
                    'to': {
                        'scene-3': {
                            'yaw': -0.5201367601720577,
                            'pitch': 0.11417302060570478
                        }
                    }
                }
            }
        }
    }
}
