/// <reference path="../../src/testing/jquery-3.3.1.min.js" />

const bbjs = require('../../src');
const data = require('./data.js');


var pano = document.getElementById('pano');
var panoOriginal = pano.cloneNode();
var landscapeMedia = window.matchMedia('(orientation: landscape)');



// return true on creation, false if instance already in use
function handleInline() {
    const bbdv = new bbjs.DesktopViewer(pano, {
        scene_data: data,
        tile_image_source: '../images/tiles',
        icon_image_source: '../images/icons',
        hotspot_ids: [],
        debug: true
    });

    document.body.classList.add('no-scroll');
    pano.classList.add('is-active', 'is-inline');
    debugAllThings(bbdv);
}

function debugAllThings(bbdv) {

    bbdv.viewer.scene().hotspotContainer().listHotspots();

    // pano.style.display = 'block';
    // console.log(bbdv.viewer.scene().hotspotContainer().listHotspots());

    // bbdv.viewer.scene().hotspotContainer().listHotspots()[0].domElement().click();
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

    landscapeMedia.addListener(handleMobile);
}

main();

handleInline();
