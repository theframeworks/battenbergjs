module.exports = {
    'scenes': [
        {
            'id': '0-downstairs-lift',
            'name': '0-downstairs-lift',
            'initialViewParameters': {
                'pitch': 0,
                'yaw': 0,
                'fov': 1.5707963267948966
            },
            'linkHotspots': [
                {
                    'yaw': 0.5144675634586342,
                    'pitch': 0.43246628242755136,
                    'rotation': 0,
                    'target': '3-downstairs-understairs'
                },
                {
                    'yaw': 3.106804116778105,
                    'pitch': 0.5007874180638083,
                    'rotation': 0,
                    'target': '1-downstairs-entrance'
                },
                {
                    'yaw': -2.4706537197430958,
                    'pitch': 0.06112186334075176,
                    'rotation': 0,
                    'target': '2-downstairs-baydoors'
                }
            ],
            'infoHotspots': [
                {
                    'id': '17',
                    'yaw': 2.001357379369736,
                    'pitch': 0.14586136220478352,
                    'title': 'Where impact happens',
                }
            ]
        },
        {
            'id': '1-downstairs-entrance',
            'name': '1-downstairs-entrance',
            'initialViewParameters': {
                'pitch': 0,
                'yaw': 0,
                'fov': 1.5707963267948966
            },
            'linkHotspots': [
                {
                    'yaw': -2.4706537197430958,
                    'pitch': 0.06112186334075176,
                    'rotation': 0,
                    'target': '2-downstairs-baydoors'
                }
            ],
            'infoHotspots': []
        },
        {
            'id': '2-downstairs-baydoors',
            'name': '2-downstairs-baydoors',
            'initialViewParameters': {
                'pitch': 0,
                'yaw': 0,
                'fov': 1.5707963267948966
            },
            'linkHotspots': [
                {
                    'yaw': 0.5144675634586342,
                    'pitch': 0.43246628242755136,
                    'rotation': 0,
                    'target': '3-downstairs-understairs'
                }
            ],
            'infoHotspots': []
        },
        {
            'id': '3-downstairs-understairs',
            'name': '3-downstairs-understairs',
            'initialViewParameters': {
                'pitch': 0,
                'yaw': 0,
                'fov': 1.5707963267948966
            },
            'linkHotspots': [
                {
                    'yaw': -2.4706537197430958,
                    'pitch': 0.06112186334075176,
                    'rotation': 0,
                    'target': '2-downstairs-baydoors'
                }
            ],
            'infoHotspots': []
        },
        {
            'id': '4-downstairs-kitchen',
            'name': '4-downstairs-kitchen',
            'initialViewParameters': {
                'pitch': 0,
                'yaw': 0,
                'fov': 1.5707963267948966
            },
            'linkHotspots': [],
            'infoHotspots': []
        },
        {
            'id': '5-upstairs-west-terrace',
            'name': '5-upstairs-west-terrace',
            'initialViewParameters': {
                'pitch': 0,
                'yaw': 0,
                'fov': 1.5707963267948966
            },
            'linkHotspots': [],
            'infoHotspots': []
        },
        {
            'id': '6-upstairs-stairwell',
            'name': '6-upstairs-stairwell',
            'initialViewParameters': {
                'pitch': 0,
                'yaw': 0,
                'fov': 1.5707963267948966
            },
            'linkHotspots': [],
            'infoHotspots': []
        },
        {
            'id': '7-upstairs-landing',
            'name': '7-upstairs-landing',
            'initialViewParameters': {
                'pitch': 0,
                'yaw': 0,
                'fov': 1.5707963267948966
            },
            'linkHotspots': [],
            'infoHotspots': []
        },
        {
            'id': '8-upstairs-eastterrace',
            'name': '8-upstairs-eastterrace',
            'initialViewParameters': {
                'pitch': 0,
                'yaw': 0,
                'fov': 1.5707963267948966
            },
            'linkHotspots': [],
            'infoHotspots': []
        }
    ],
    'name': 'Project Title',
    'settings': {
        'mouseViewMode': 'drag',
        'autorotateEnabled': false, // Potentially set this to true unless we're in VR
        'fullscreenButton': true,
        'viewControlButtons': false
    },
    'cubeGeometryLevels': [
        {
            'tileSize': 256,
            'size': 256,
            'fallbackOnly': true
        },
        {
            'tileSize': 512,
            'size': 512
        },
        {
            'tileSize': 512,
            'size': 1024
        },
        {
            'tileSize': 512,
            'size': 2048
        }
    ],
    'fov': {
        'maxVertical': 100,
        'maxHorizontal': 120,
    },
    // The VR viewer example uses 4096, what's the difference?
    // It feels like it's related to the view frustrum size or the frustrum's distance from the camera
    // Higher numbers are more 'zoomed in'
    'faceSize': 1920
};
