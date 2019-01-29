/// <reference path="./jquery-3.3.1.min.js" />

const bbjs = require('../../index');
const data = require('./data.js');


var pano = document.getElementById('pano');
var panoOriginal = pano.cloneNode();
var landscapeMedia = window.matchMedia('(orientation: landscape)');

let viewer;

// return true on creation, false if instance already in use
function handleInline() {

    viewer = new bbjs.DesktopViewer(pano, {
        scene_data: data,
        tile_image_source: '../images/tiles',
        link_icon_path: '../images/icons/link.svg',
        hotspot_ids: [],
        debug: true
    });


    document.body.classList.add('no-scroll');
    pano.classList.add('is-active', 'is-inline');
    debugAllThings(viewer);
}

function debugAllThings(viewer) {

    const hotspots = viewer.viewer.scene().hotspotContainer().listHotspots();

    console.log({ hotspots });
    // pano.style.display = 'block';
    // console.log(viewer.viewer.scene().hotspotContainer().listHotspots());

    // viewer.viewer.scene().hotspotContainer().listHotspots()[0].domElement().click();
    // How to make my own events
    // let e = new CustomEvent('newevent', { detail: { message: 'hi' } });

    // pano.addEventListener('newevent', (event, target) => {
    //     console.log(e.detail.message);
    // })

    // setTimeout(() => {
    //     pano.dispatchEvent(e);
    // }, 3000);

}


function handleMobile() {
    if (pano.classList.contains('is-mobile')) {
        $('body').addClass('no-scroll');
        // screenfull.enabled && !screenfull.isFullscreen && screenfull.request();
        // noSleep.enable();
        // activate vr if in landscape mode
        if (landscapeMedia.matches) {
            resetPano();
            new bbjs.VRViewer(pano[0]);
            pano.addClass('is-mobile is-active');
        } else {
            // switch off vr if in portrait and active
            if (pano.hasClass('is-active')) {
                closePano();
                resetPano();
            }
        }
    }
}

function closePano() {
    // screenfull.enabled && screenfull.exit();
    // noSleep.disable();
    pano.classList.remove('is-active');
    $('body').removeClass('no-scroll');
}

function resetPano() {
    pano.replaceWith(panoOriginal.cloneNode());
    pano = document.getElementById('pano');
}

function main() {
    $(document).on('click', '#pano-view-inline-button', function (event) {
        event.preventDefault();

        pano.classList.add('is-active', 'is-inline');
        pano.classList.remove('is-mobile');
        handleInline();
        // show the first hotspot
        $('[data-info-hotspot-id="0"]').trigger('click');
    });

    $(document).on('click', '#pano-view-mobile-button', function (event) {
        event.preventDefault();

        pano.classList.add('is-mobile');
        pano.classList.remove.removeClass('is-active', 'is-inline');
        handleMobile();
    });

    $(document).on('click', '#pano-close', function (event) {
        event.preventDefault();

        closePano();
    });

    $(document).on('click', '.portrait-inline-message, .portrait-mobile-message', function (event) {
        event.preventDefault();

        closePano();
        pano.classList.remove('is-inline', 'is-mobile');
    });

    document.addEventListener('keydown', (event) => {
        if (event.keyCode == 32) {
            const links = viewer.viewer.scene().hotspotContainer().listHotspots();
            links[0]._domElement.childNodes[0].click();
        }
    });

    landscapeMedia.addListener(handleMobile);
}

main();

handleInline();
