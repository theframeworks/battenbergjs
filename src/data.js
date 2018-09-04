var sceneData = {
  "scenes": [
    {
      "id": "0-top-of-stairs",
      "name": "top-of-stairs",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        }
      ],
      "faceSize": 480,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 0.5144675634586342,
          "pitch": 0.43246628242755136,
          "rotation": 0,
          "target": "3-upstairs-behind-stairs"
        },
        {
          "yaw": 3.106804116778105,
          "pitch": 0.5007874180638083,
          "rotation": 0,
          "target": "1-upstairs-middle"
        },
        {
          "yaw": -2.4706537197430958,
          "pitch": 0.06112186334075176,
          "rotation": 0,
          "target": "2-upstairs-standing-desk"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "1-upstairs-middle",
      "name": "upstairs-middle",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        }
      ],
      "faceSize": 480,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.587723398497733,
          "pitch": 0.4443170058546997,
          "rotation": 0,
          "target": "0-top-of-stairs"
        },
        {
          "yaw": -0.41083482844757846,
          "pitch": 0.030148224591322048,
          "rotation": 0,
          "target": "3-upstairs-behind-stairs"
        },
        {
          "yaw": -2.7568791345590746,
          "pitch": 0.09293443437026383,
          "rotation": 0,
          "target": "2-upstairs-standing-desk"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "2-upstairs-standing-desk",
      "name": "upstairs-standing-desk",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        }
      ],
      "faceSize": 480,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 2.2337261553460177,
          "pitch": 0.2087510290013448,
          "rotation": 0,
          "target": "1-upstairs-middle"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "3-upstairs-behind-stairs",
      "name": "upstairs-behind-stairs",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        }
      ],
      "faceSize": 480,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.4714310700703983,
          "pitch": 0.3126251970474989,
          "rotation": 0,
          "target": "0-top-of-stairs"
        }
      ],
      "infoHotspots": []
    }
  ],
  "name": "Spark 360 prototype",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": false,
    "fullscreenButton": true,
    "viewControlButtons": false
  }
};
