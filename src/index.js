module.exports = init = () => {
    return {
        MarzipanoViewer: require('./MarzipanoViewer'),
        DekstopViewer: require('./DesktopViewer'),
        VRViewer: require('./VRViewer')
    }
}