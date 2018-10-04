/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var Stage = require('./Stage');
var webGlSupported = require('../support/WebGl');
var browser = require('bowser');
var Map = require('../collections/Map');
var loadImageHtml = require('./loadImageHtml');
var inherits = require('../util/inherits');
var defer = require('../util/defer');
var pixelRatio = require('../util/pixelRatio');
var hash = require('../util/hash');
var ispot = require('../util/ispot');
var setAbsolute = require('../util/dom').setAbsolute;
var setPixelSize = require('../util/dom').setPixelSize;
var setFullSize = require('../util/dom').setFullSize;

var debug = typeof MARZIPANODEBUG !== 'undefined' && MARZIPANODEBUG.webGl;


// Browser-specific workarounds.
var browserQuirks = {
  // Whether to use texImage2D instead of texSubImage2D when repainting an
  // existing texture from a video element. On most browsers texSubImage2D is
  // faster, but on Chrome the performance degrades significantly. See:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=612542
  videoUseTexImage2D: browser.chrome
};


function initWebGlContext(canvas, opts) {
  var options = {
    alpha: true,
    premultipliedAlpha: true,
    antialias: !!(opts && opts.antialias),
    preserveDrawingBuffer: !!(opts && opts.preserveDrawingBuffer)
  };

  if (debug && typeof WebGLDebugUtils !== 'undefined') {
    console.log('Using WebGL lost context simulator');
    canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
  }

  // Keep support/WebGl.js in sync with this.
  var gl = (canvas.getContext) && (canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options));

  if (!gl) {
    throw new Error('Could not get WebGL context');
  }

  if (debug && typeof WebGLDebugUtils !== "undefined") {
    gl = WebGLDebugUtils.makeDebugContext(gl);
    console.log('Using WebGL debug context');
  }

  return gl;
}

/**
 * @class WebGlStage
 * @classdesc A {@link Stage} implementation using WebGl.
 * @extends Stage
 * @param {Object} opts
 * @param {boolean} [opts.antialias=false]
 * @param {boolean} [opts.preserveDrawingBuffer=false]
 * @param {boolean} [opts.generateMipmaps=false]
 *
 * The `antialias` and `preserveDrawingBuffer` options control the WebGL
 * context attributes of the same name. The `alpha` and `premultipliedAlpha`
 * WebGL context attributes are set to their default true value and cannot
 * be overriden; this allows semitransparent textures to be composited with
 * the page. See:
 * https://www.khronos.org/registry/webgl/specs/1.0/#WEBGLCONTEXTATTRIBUTES
 *
 * The `generateMipmaps` option controls texture mipmap generation. Mipmaps
 * may improve rendering quality, at the cost of increased memory usage.
 * Due to technical limitations, they are only generated for textures whose
 * dimensions are a power of two. See:
 * https://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
 */
function WebGlStage(opts) {
  opts = opts || {};

  var self = this;

  this.constructor.super_.call(this, opts);

  this._generateMipmaps = opts.generateMipmaps != null ?
    opts.generateMipmaps : false;

  this._domElement = document.createElement('canvas');

  setAbsolute(this._domElement);
  setFullSize(this._domElement);

  this._gl = initWebGlContext(this._domElement, opts);

  this._handleContextLoss = function() {
    self.emit('webglcontextlost');
    self._gl = null;
  };

  // Handle WebGl context loss.
  this._domElement.addEventListener('webglcontextlost', this._handleContextLoss);

  // WebGl renderers are singletons for a given stage, so we store them in a
  // map for quick retrieval when several layers use the same renderer.
  // Map keys are renderer classes, map values are renderer instances.

  function renderersEqual(Renderer1, Renderer2) {
    return Renderer1 === Renderer2;
  }

  function renderersHash(Renderer) {
    return hash(Renderer.toString());
  }

  this._rendererInstances = new Map(renderersEqual, renderersHash);

}

inherits(WebGlStage, Stage);


WebGlStage.prototype.destroy = function() {

  this.constructor.super_.prototype.destroy.call(this);

  this.removeEventListener('webglcontextlost', this._handleContextLoss);
  this._domElement = null;
  this._rendererInstances = null;
  this._gl = null;

};


WebGlStage.supported = function() {
  return webGlSupported();
};

/**
 * @returns {WebGLRenderingContext }
 */
WebGlStage.prototype.webGlContext = function() {
  return this._gl;
};


WebGlStage.prototype._setSize = function() {
  // Update the size of the canvas coordinate space. The size is obtained by
  // taking the stage dimensions, which are set in CSS pixels, and multiplying
  // them by the device pixel ratio.
  var ratio = pixelRatio();
  this._domElement.width = ratio * this._width;
  this._domElement.height = ratio * this._height;
};


WebGlStage.prototype.loadImage = loadImageHtml;


WebGlStage.prototype.maxTextureSize = function() {
  return this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE);
};


WebGlStage.prototype._validateLayer = function(layer) {
  var tileSize = layer.geometry().maxTileSize();
  var maxTextureSize = this.maxTextureSize();
  if (tileSize > maxTextureSize) {
    throw new Error('Layer has level with tile size larger than maximum texture size (' + tileSize + ' vs. ' + maxTextureSize + ')');
  }
};


WebGlStage.prototype.createRenderer = function(Renderer) {
  // WebGl renderers are singletons for a given stage, so we check for an
  // already existing renderer of the required type before creating a new one.
  if (this._rendererInstances.has(Renderer)) {
    return this._rendererInstances.get(Renderer);
  }
  else {
    var renderer = new Renderer(this._gl);
    this._rendererInstances.set(Renderer, renderer);
    return renderer;
  }
};


WebGlStage.prototype.destroyRenderer = function(renderer) {
  // WebGl renderers are singletons for a given stage, so check that a
  // renderer is no longer in use before destroying it.
  if (this._renderers.indexOf(renderer) < 0) {
    renderer.destroy();
    this._rendererInstances.del(renderer.constructor);
  }
};


WebGlStage.prototype.startFrame = function() {

  var gl = this._gl;

  if (!gl) {
    throw new Error('Bad WebGL context - maybe context was lost?');
  }

  var width = this._width;
  var height = this._height;
  var ratio = pixelRatio();

  // Set the WebGL viewport.
  gl.viewport(0, 0, ratio * width, ratio * height);

  // Clear framebuffer.
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Enable depth testing.
  gl.enable(gl.DEPTH_TEST);

  // Enable blending. ONE and ONE_MINUS_SRC_ALPHA are the right choices for
  // premultiplied textures.
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

};


WebGlStage.prototype.endFrame = function() {};


WebGlStage.prototype.takeSnapshot = function (options) {
  
  // Validate passed argument
  if (typeof options !== 'object' || options == null) {
    options = {};
  }
  
  var quality = options.quality;
  
  // Set default quality if it is not passed
  if (typeof quality == 'undefined') {
    quality = 75;
  }
  
  // Throw if quality is of invlid type or out of bounds
  if (typeof quality !== 'number' || quality < 0 || quality > 100) {
    throw new Error('WebGLStage: Snapshot quality needs to be a number between 0 and 100');
  }
  
  // Canvas method "toDataURL" needs to be called in the same
  // context as where the actual rendering is done. Hence this.
  this.render();
  
  // Return the snapshot
  return this._domElement.toDataURL('image/jpeg',quality/100);
}


WebGlStage.type = WebGlStage.prototype.type = 'webgl';


function WebGlTexture(stage, tile, asset) {
  this._stage = stage;
  this._gl = stage._gl;
  this._texture = null;
  this._timestamp = null;
  this._width = this._height = null;
  this.refresh(tile, asset);
}


WebGlTexture.prototype.refresh = function(tile, asset) {

  var gl = this._gl;
  var stage = this._stage;
  var texture;

  // Check whether the texture needs to be updated.
  var timestamp = asset.timestamp();
  if (timestamp === this._timestamp) {
    return;
  }

  // Get asset element.
  var element = asset.element();

  // Get asset dimensions.
  var width = asset.width();
  var height = asset.height();

  if (width !== this._width || height !== this._height) {

    // If the texture dimensions have changed since the last refresh, create
    // a new texture with the correct size.

    // Check if texture dimensions would exceed the maximum texture size.
    var maxSize = stage.maxTextureSize();
    if (width > maxSize) {
      throw new Error('Texture width larger than max size (' + width + ' vs. ' + maxSize + ')');
    }
    if (height > maxSize) {
      throw new Error('Texture height larger than max size (' + height + ' vs. ' + maxSize + ')');
    }

    // Delete the current texture if it exists.
    // This is necessary for Chrome on Android. If it isn't done the textures
    // do not render when the size changes.
    if (this._texture) {
      gl.deleteTexture(texture);
    }

    // The texture must be premultiplied by alpha to ensure correct blending of
    // semitransparent textures. For details, see:
    // http://www.realtimerendering.com/blog/gpus-prefer-premultiplication/
    texture = this._texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);

  } else {

    // If the texture dimensions remain the same, repaint the existing texture.
    // Repainting with texSubImage2D is usually faster than with texImage2D,
    // except in the case noted in browserQuirks.

    texture = this._texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    if (element instanceof HTMLVideoElement && browserQuirks.videoUseTexImage2D) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
    } else {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, element);
    }

  }

  // Generate mipmap if the corresponding stage option is set and the texture
  // dimensions are powers of two.
  if (stage._generateMipmaps && ispot(width) && ispot(height)) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  // Clamp texture to edges.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Unbind texture.
  gl.bindTexture(gl.TEXTURE_2D, null);

  // Update texture dimensions and timestamp.
  this._timestamp = timestamp;
  this._width = width;
  this._height = height;

};


WebGlTexture.prototype.destroy = function() {

  var texture = this._texture;
  var gl = this._gl;

  if (texture) {
    gl.deleteTexture(texture);
  }

  this._stage = null;
  this._gl = null;
  this._texture = null;
  this._timestamp = null;
  this._width = this._height = null;

};


WebGlStage.TextureClass = WebGlStage.prototype.TextureClass = WebGlTexture;


module.exports = WebGlStage;
