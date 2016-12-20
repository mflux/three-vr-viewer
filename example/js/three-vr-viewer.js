(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.VRViewer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * @author mflux / http://minmax.design
 * Based on @mattdesl three-orbit-viewer
 */

var Emitter = require('events');
var WEBVR = require('./thirdparty/webvr');

module.exports = function create() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$emptyRoom = _ref.emptyRoom,
      emptyRoom = _ref$emptyRoom === undefined ? true : _ref$emptyRoom,
      _ref$standing = _ref.standing,
      standing = _ref$standing === undefined ? true : _ref$standing,
      _ref$loadControllers = _ref.loadControllers,
      loadControllers = _ref$loadControllers === undefined ? true : _ref$loadControllers,
      _ref$vrButton = _ref.vrButton,
      vrButton = _ref$vrButton === undefined ? true : _ref$vrButton,
      _ref$antiAlias = _ref.antiAlias,
      antiAlias = _ref$antiAlias === undefined ? true : _ref$antiAlias,
      _ref$clearColor = _ref.clearColor,
      clearColor = _ref$clearColor === undefined ? 0x505050 : _ref$clearColor,
      _ref$pathToController = _ref.pathToControllers,
      pathToControllers = _ref$pathToController === undefined ? 'models/obj/vive-controller/' : _ref$pathToController,
      _ref$controllerModelN = _ref.controllerModelName,
      controllerModelName = _ref$controllerModelN === undefined ? 'vr_controller_vive_1_5.obj' : _ref$controllerModelN,
      _ref$controllerTextur = _ref.controllerTextureMap,
      controllerTextureMap = _ref$controllerTextur === undefined ? 'onepointfive_texture.png' : _ref$controllerTextur,
      _ref$controllerSpecMa = _ref.controllerSpecMap,
      controllerSpecMap = _ref$controllerSpecMa === undefined ? 'onepointfive_spec.png' : _ref$controllerSpecMa,
      THREE = _ref.THREE;

  var VREffect = require('./thirdparty/vreffect')(THREE);
  var VRControls = require('./thirdparty/vrcontrols')(THREE);
  var ViveController = require('./thirdparty/vivecontroller')(THREE);
  var OBJLoader = require('./thirdparty/objloader')(THREE);

  if (WEBVR.isLatestAvailable() === false) {
    document.body.appendChild(WEBVR.getMessage());
  }

  var events = new Emitter();

  var container = document.createElement('div');
  document.body.appendChild(container);

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
  scene.add(camera);

  if (emptyRoom) {
    var room = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 6, 8, 8, 8), new THREE.MeshBasicMaterial({ color: 0x404040, wireframe: true }));
    room.position.y = 3;
    scene.add(room);

    scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
  }

  var renderer = new THREE.WebGLRenderer({ antialias: antiAlias });
  renderer.setClearColor(clearColor);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.sortObjects = false;
  container.appendChild(renderer.domElement);

  var controls = new THREE.VRControls(camera);
  controls.standing = standing;

  var controller1 = new THREE.ViveController(0);
  var controller2 = new THREE.ViveController(1);
  scene.add(controller1, controller2);

  if (loadControllers) {
    controller1.standingMatrix = controls.getStandingMatrix();
    controller2.standingMatrix = controls.getStandingMatrix();

    var loader = new THREE.OBJLoader();
    loader.setPath(pathToControllers);
    loader.load(controllerModelName, function (object) {

      var textureLoader = new THREE.TextureLoader();
      textureLoader.setPath(pathToControllers);

      var controller = object.children[0];
      controller.material.map = textureLoader.load(controllerTextureMap);
      controller.material.specularMap = textureLoader.load(controllerSpecMap);

      controller1.add(object.clone());
      controller2.add(object.clone());
    });
  }

  var effect = new THREE.VREffect(renderer);

  if (WEBVR.isAvailable() === true) {
    if (vrButton) {
      document.body.appendChild(WEBVR.getButton(effect));
    }

    /*
      Sigh.
      Some day, when the world is a more trustworthy place, you can be back.
      if( autoEnter ){
      setTimeout( ()=>effect.requestPresent(), 1000 );
    }
      */
  }

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    effect.setSize(window.innerWidth, window.innerHeight);

    events.emit('resize', window.innerWidth, window.innerHeight);
  }, false);

  var clock = new THREE.Clock();
  clock.start();

  function animate() {
    var dt = clock.getDelta();

    effect.requestAnimationFrame(animate);

    controller1.update();
    controller2.update();

    controls.update();

    events.emit('tick', dt);

    render();

    events.emit('render', dt);
  }

  function render() {
    effect.render(scene, camera);
  }

  function toggleVR() {
    effect.isPresenting ? effect.exitPresent() : effect.requestPresent();
  }

  animate();

  return {
    scene: scene, camera: camera, controls: controls, renderer: renderer, vrEffect: effect,
    controllers: [controller1, controller2],
    events: events,
    toggleVR: toggleVR
  };
};

if (window) {
  window.VRViewer = module.exports;
}

},{"./thirdparty/objloader":3,"./thirdparty/vivecontroller":4,"./thirdparty/vrcontrols":5,"./thirdparty/vreffect":6,"./thirdparty/webvr":7,"events":2}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
'use strict';

/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = function (THREE) {

					THREE.OBJLoader = function (manager) {

										this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;

										this.materials = null;

										this.regexp = {
															// v float float float
															vertex_pattern: /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
															// vn float float float
															normal_pattern: /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
															// vt float float
															uv_pattern: /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
															// f vertex vertex vertex
															face_vertex: /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
															// f vertex/uv vertex/uv vertex/uv
															face_vertex_uv: /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
															// f vertex/uv/normal vertex/uv/normal vertex/uv/normal
															face_vertex_uv_normal: /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
															// f vertex//normal vertex//normal vertex//normal
															face_vertex_normal: /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
															// o object_name | g group_name
															object_pattern: /^[og]\s*(.+)?/,
															// s boolean
															smoothing_pattern: /^s\s+(\d+|on|off)/,
															// mtllib file_reference
															material_library_pattern: /^mtllib /,
															// usemtl material_name
															material_use_pattern: /^usemtl /
										};
					};

					THREE.OBJLoader.prototype = {

										constructor: THREE.OBJLoader,

										load: function load(url, onLoad, onProgress, onError) {

															var scope = this;

															var loader = new THREE.FileLoader(scope.manager);
															loader.setPath(this.path);
															loader.load(url, function (text) {

																				onLoad(scope.parse(text));
															}, onProgress, onError);
										},

										setPath: function setPath(value) {

															this.path = value;
										},

										setMaterials: function setMaterials(materials) {

															this.materials = materials;
										},

										_createParserState: function _createParserState() {

															var state = {
																				objects: [],
																				object: {},

																				vertices: [],
																				normals: [],
																				uvs: [],

																				materialLibraries: [],

																				startObject: function startObject(name, fromDeclaration) {

																									// If the current object (initial from reset) is not from a g/o declaration in the parsed
																									// file. We need to use it for the first parsed g/o to keep things in sync.
																									if (this.object && this.object.fromDeclaration === false) {

																														this.object.name = name;
																														this.object.fromDeclaration = fromDeclaration !== false;
																														return;
																									}

																									var previousMaterial = this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined;

																									if (this.object && typeof this.object._finalize === 'function') {

																														this.object._finalize(true);
																									}

																									this.object = {
																														name: name || '',
																														fromDeclaration: fromDeclaration !== false,

																														geometry: {
																																			vertices: [],
																																			normals: [],
																																			uvs: []
																														},
																														materials: [],
																														smooth: true,

																														startMaterial: function startMaterial(name, libraries) {

																																			var previous = this._finalize(false);

																																			// New usemtl declaration overwrites an inherited material, except if faces were declared
																																			// after the material, then it must be preserved for proper MultiMaterial continuation.
																																			if (previous && (previous.inherited || previous.groupCount <= 0)) {

																																								this.materials.splice(previous.index, 1);
																																			}

																																			var material = {
																																								index: this.materials.length,
																																								name: name || '',
																																								mtllib: Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : '',
																																								smooth: previous !== undefined ? previous.smooth : this.smooth,
																																								groupStart: previous !== undefined ? previous.groupEnd : 0,
																																								groupEnd: -1,
																																								groupCount: -1,
																																								inherited: false,

																																								clone: function clone(index) {
																																													var cloned = {
																																																		index: typeof index === 'number' ? index : this.index,
																																																		name: this.name,
																																																		mtllib: this.mtllib,
																																																		smooth: this.smooth,
																																																		groupStart: 0,
																																																		groupEnd: -1,
																																																		groupCount: -1,
																																																		inherited: false
																																													};
																																													cloned.clone = this.clone.bind(cloned);
																																													return cloned;
																																								}
																																			};

																																			this.materials.push(material);

																																			return material;
																														},

																														currentMaterial: function currentMaterial() {

																																			if (this.materials.length > 0) {
																																								return this.materials[this.materials.length - 1];
																																			}

																																			return undefined;
																														},

																														_finalize: function _finalize(end) {

																																			var lastMultiMaterial = this.currentMaterial();
																																			if (lastMultiMaterial && lastMultiMaterial.groupEnd === -1) {

																																								lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
																																								lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
																																								lastMultiMaterial.inherited = false;
																																			}

																																			// Ignore objects tail materials if no face declarations followed them before a new o/g started.
																																			if (end && this.materials.length > 1) {

																																								for (var mi = this.materials.length - 1; mi >= 0; mi--) {
																																													if (this.materials[mi].groupCount <= 0) {
																																																		this.materials.splice(mi, 1);
																																													}
																																								}
																																			}

																																			// Guarantee at least one empty material, this makes the creation later more straight forward.
																																			if (end && this.materials.length === 0) {

																																								this.materials.push({
																																													name: '',
																																													smooth: this.smooth
																																								});
																																			}

																																			return lastMultiMaterial;
																														}
																									};

																									// Inherit previous objects material.
																									// Spec tells us that a declared material must be set to all objects until a new material is declared.
																									// If a usemtl declaration is encountered while this new object is being parsed, it will
																									// overwrite the inherited material. Exception being that there was already face declarations
																									// to the inherited material, then it will be preserved for proper MultiMaterial continuation.

																									if (previousMaterial && previousMaterial.name && typeof previousMaterial.clone === "function") {

																														var declared = previousMaterial.clone(0);
																														declared.inherited = true;
																														this.object.materials.push(declared);
																									}

																									this.objects.push(this.object);
																				},

																				finalize: function finalize() {

																									if (this.object && typeof this.object._finalize === 'function') {

																														this.object._finalize(true);
																									}
																				},

																				parseVertexIndex: function parseVertexIndex(value, len) {

																									var index = parseInt(value, 10);
																									return (index >= 0 ? index - 1 : index + len / 3) * 3;
																				},

																				parseNormalIndex: function parseNormalIndex(value, len) {

																									var index = parseInt(value, 10);
																									return (index >= 0 ? index - 1 : index + len / 3) * 3;
																				},

																				parseUVIndex: function parseUVIndex(value, len) {

																									var index = parseInt(value, 10);
																									return (index >= 0 ? index - 1 : index + len / 2) * 2;
																				},

																				addVertex: function addVertex(a, b, c) {

																									var src = this.vertices;
																									var dst = this.object.geometry.vertices;

																									dst.push(src[a + 0]);
																									dst.push(src[a + 1]);
																									dst.push(src[a + 2]);
																									dst.push(src[b + 0]);
																									dst.push(src[b + 1]);
																									dst.push(src[b + 2]);
																									dst.push(src[c + 0]);
																									dst.push(src[c + 1]);
																									dst.push(src[c + 2]);
																				},

																				addVertexLine: function addVertexLine(a) {

																									var src = this.vertices;
																									var dst = this.object.geometry.vertices;

																									dst.push(src[a + 0]);
																									dst.push(src[a + 1]);
																									dst.push(src[a + 2]);
																				},

																				addNormal: function addNormal(a, b, c) {

																									var src = this.normals;
																									var dst = this.object.geometry.normals;

																									dst.push(src[a + 0]);
																									dst.push(src[a + 1]);
																									dst.push(src[a + 2]);
																									dst.push(src[b + 0]);
																									dst.push(src[b + 1]);
																									dst.push(src[b + 2]);
																									dst.push(src[c + 0]);
																									dst.push(src[c + 1]);
																									dst.push(src[c + 2]);
																				},

																				addUV: function addUV(a, b, c) {

																									var src = this.uvs;
																									var dst = this.object.geometry.uvs;

																									dst.push(src[a + 0]);
																									dst.push(src[a + 1]);
																									dst.push(src[b + 0]);
																									dst.push(src[b + 1]);
																									dst.push(src[c + 0]);
																									dst.push(src[c + 1]);
																				},

																				addUVLine: function addUVLine(a) {

																									var src = this.uvs;
																									var dst = this.object.geometry.uvs;

																									dst.push(src[a + 0]);
																									dst.push(src[a + 1]);
																				},

																				addFace: function addFace(a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {

																									var vLen = this.vertices.length;

																									var ia = this.parseVertexIndex(a, vLen);
																									var ib = this.parseVertexIndex(b, vLen);
																									var ic = this.parseVertexIndex(c, vLen);
																									var id;

																									if (d === undefined) {

																														this.addVertex(ia, ib, ic);
																									} else {

																														id = this.parseVertexIndex(d, vLen);

																														this.addVertex(ia, ib, id);
																														this.addVertex(ib, ic, id);
																									}

																									if (ua !== undefined) {

																														var uvLen = this.uvs.length;

																														ia = this.parseUVIndex(ua, uvLen);
																														ib = this.parseUVIndex(ub, uvLen);
																														ic = this.parseUVIndex(uc, uvLen);

																														if (d === undefined) {

																																			this.addUV(ia, ib, ic);
																														} else {

																																			id = this.parseUVIndex(ud, uvLen);

																																			this.addUV(ia, ib, id);
																																			this.addUV(ib, ic, id);
																														}
																									}

																									if (na !== undefined) {

																														// Normals are many times the same. If so, skip function call and parseInt.
																														var nLen = this.normals.length;
																														ia = this.parseNormalIndex(na, nLen);

																														ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
																														ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);

																														if (d === undefined) {

																																			this.addNormal(ia, ib, ic);
																														} else {

																																			id = this.parseNormalIndex(nd, nLen);

																																			this.addNormal(ia, ib, id);
																																			this.addNormal(ib, ic, id);
																														}
																									}
																				},

																				addLineGeometry: function addLineGeometry(vertices, uvs) {

																									this.object.geometry.type = 'Line';

																									var vLen = this.vertices.length;
																									var uvLen = this.uvs.length;

																									for (var vi = 0, l = vertices.length; vi < l; vi++) {

																														this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));
																									}

																									for (var uvi = 0, l = uvs.length; uvi < l; uvi++) {

																														this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen));
																									}
																				}

															};

															state.startObject('', false);

															return state;
										},

										parse: function parse(text) {

															console.time('OBJLoader');

															var state = this._createParserState();

															if (text.indexOf('\r\n') !== -1) {

																				// This is faster than String.split with regex that splits on both
																				text = text.replace(/\r\n/g, '\n');
															}

															if (text.indexOf('\\\n') !== -1) {

																				// join lines separated by a line continuation character (\)
																				text = text.replace(/\\\n/g, '');
															}

															var lines = text.split('\n');
															var line = '',
															    lineFirstChar = '',
															    lineSecondChar = '';
															var lineLength = 0;
															var result = [];

															// Faster to just trim left side of the line. Use if available.
															var trimLeft = typeof ''.trimLeft === 'function';

															for (var i = 0, l = lines.length; i < l; i++) {

																				line = lines[i];

																				line = trimLeft ? line.trimLeft() : line.trim();

																				lineLength = line.length;

																				if (lineLength === 0) continue;

																				lineFirstChar = line.charAt(0);

																				// @todo invoke passed in handler if any
																				if (lineFirstChar === '#') continue;

																				if (lineFirstChar === 'v') {

																									lineSecondChar = line.charAt(1);

																									if (lineSecondChar === ' ' && (result = this.regexp.vertex_pattern.exec(line)) !== null) {

																														// 0                  1      2      3
																														// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

																														state.vertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
																									} else if (lineSecondChar === 'n' && (result = this.regexp.normal_pattern.exec(line)) !== null) {

																														// 0                   1      2      3
																														// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

																														state.normals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
																									} else if (lineSecondChar === 't' && (result = this.regexp.uv_pattern.exec(line)) !== null) {

																														// 0               1      2
																														// ["vt 0.1 0.2", "0.1", "0.2"]

																														state.uvs.push(parseFloat(result[1]), parseFloat(result[2]));
																									} else {

																														throw new Error("Unexpected vertex/normal/uv line: '" + line + "'");
																									}
																				} else if (lineFirstChar === "f") {

																									if ((result = this.regexp.face_vertex_uv_normal.exec(line)) !== null) {

																														// f vertex/uv/normal vertex/uv/normal vertex/uv/normal
																														// 0                        1    2    3    4    5    6    7    8    9   10         11         12
																														// ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3", undefined, undefined, undefined]

																														state.addFace(result[1], result[4], result[7], result[10], result[2], result[5], result[8], result[11], result[3], result[6], result[9], result[12]);
																									} else if ((result = this.regexp.face_vertex_uv.exec(line)) !== null) {

																														// f vertex/uv vertex/uv vertex/uv
																														// 0                  1    2    3    4    5    6   7          8
																														// ["f 1/1 2/2 3/3", "1", "1", "2", "2", "3", "3", undefined, undefined]

																														state.addFace(result[1], result[3], result[5], result[7], result[2], result[4], result[6], result[8]);
																									} else if ((result = this.regexp.face_vertex_normal.exec(line)) !== null) {

																														// f vertex//normal vertex//normal vertex//normal
																														// 0                     1    2    3    4    5    6   7          8
																														// ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined, undefined]

																														state.addFace(result[1], result[3], result[5], result[7], undefined, undefined, undefined, undefined, result[2], result[4], result[6], result[8]);
																									} else if ((result = this.regexp.face_vertex.exec(line)) !== null) {

																														// f vertex vertex vertex
																														// 0            1    2    3   4
																														// ["f 1 2 3", "1", "2", "3", undefined]

																														state.addFace(result[1], result[2], result[3], result[4]);
																									} else {

																														throw new Error("Unexpected face line: '" + line + "'");
																									}
																				} else if (lineFirstChar === "l") {

																									var lineParts = line.substring(1).trim().split(" ");
																									var lineVertices = [],
																									    lineUVs = [];

																									if (line.indexOf("/") === -1) {

																														lineVertices = lineParts;
																									} else {

																														for (var li = 0, llen = lineParts.length; li < llen; li++) {

																																			var parts = lineParts[li].split("/");

																																			if (parts[0] !== "") lineVertices.push(parts[0]);
																																			if (parts[1] !== "") lineUVs.push(parts[1]);
																														}
																									}
																									state.addLineGeometry(lineVertices, lineUVs);
																				} else if ((result = this.regexp.object_pattern.exec(line)) !== null) {

																									// o object_name
																									// or
																									// g group_name

																									// WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
																									// var name = result[ 0 ].substr( 1 ).trim();
																									var name = (" " + result[0].substr(1).trim()).substr(1);

																									state.startObject(name);
																				} else if (this.regexp.material_use_pattern.test(line)) {

																									// material

																									state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
																				} else if (this.regexp.material_library_pattern.test(line)) {

																									// mtl file

																									state.materialLibraries.push(line.substring(7).trim());
																				} else if ((result = this.regexp.smoothing_pattern.exec(line)) !== null) {

																									// smooth shading

																									// @todo Handle files that have varying smooth values for a set of faces inside one geometry,
																									// but does not define a usemtl for each face set.
																									// This should be detected and a dummy material created (later MultiMaterial and geometry groups).
																									// This requires some care to not create extra material on each smooth value for "normal" obj files.
																									// where explicit usemtl defines geometry groups.
																									// Example asset: examples/models/obj/cerberus/Cerberus.obj

																									var value = result[1].trim().toLowerCase();
																									state.object.smooth = value === '1' || value === 'on';

																									var material = state.object.currentMaterial();
																									if (material) {

																														material.smooth = state.object.smooth;
																									}
																				} else {

																									// Handle null terminated files without exception
																									if (line === '\0') continue;

																									throw new Error("Unexpected line: '" + line + "'");
																				}
															}

															state.finalize();

															var container = new THREE.Group();
															container.materialLibraries = [].concat(state.materialLibraries);

															for (var i = 0, l = state.objects.length; i < l; i++) {

																				var object = state.objects[i];
																				var geometry = object.geometry;
																				var materials = object.materials;
																				var isLine = geometry.type === 'Line';

																				// Skip o/g line declarations that did not follow with any faces
																				if (geometry.vertices.length === 0) continue;

																				var buffergeometry = new THREE.BufferGeometry();

																				buffergeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.vertices), 3));

																				if (geometry.normals.length > 0) {

																									buffergeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(geometry.normals), 3));
																				} else {

																									buffergeometry.computeVertexNormals();
																				}

																				if (geometry.uvs.length > 0) {

																									buffergeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.uvs), 2));
																				}

																				// Create materials

																				var createdMaterials = [];

																				for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {

																									var sourceMaterial = materials[mi];
																									var material = undefined;

																									if (this.materials !== null) {

																														material = this.materials.create(sourceMaterial.name);

																														// mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
																														if (isLine && material && !(material instanceof THREE.LineBasicMaterial)) {

																																			var materialLine = new THREE.LineBasicMaterial();
																																			materialLine.copy(material);
																																			material = materialLine;
																														}
																									}

																									if (!material) {

																														material = !isLine ? new THREE.MeshPhongMaterial() : new THREE.LineBasicMaterial();
																														material.name = sourceMaterial.name;
																									}

																									material.shading = sourceMaterial.smooth ? THREE.SmoothShading : THREE.FlatShading;

																									createdMaterials.push(material);
																				}

																				// Create mesh

																				var mesh;

																				if (createdMaterials.length > 1) {

																									for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {

																														var sourceMaterial = materials[mi];
																														buffergeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);
																									}

																									var multiMaterial = new THREE.MultiMaterial(createdMaterials);
																									mesh = !isLine ? new THREE.Mesh(buffergeometry, multiMaterial) : new THREE.LineSegments(buffergeometry, multiMaterial);
																				} else {

																									mesh = !isLine ? new THREE.Mesh(buffergeometry, createdMaterials[0]) : new THREE.LineSegments(buffergeometry, createdMaterials[0]);
																				}

																				mesh.name = object.name;

																				container.add(mesh);
															}

															console.timeEnd('OBJLoader');

															return container;
										}

					};
};

},{}],4:[function(require,module,exports){
'use strict';

/**
 * @author mrdoob / http://mrdoob.com
 * @author stewdio / http://stewd.io
 */
module.exports = function (THREE) {

        THREE.ViveController = function (id) {

                THREE.Object3D.call(this);

                var scope = this;
                var gamepad;

                var axes = [0, 0];
                var thumbpadIsPressed = false;
                var triggerIsPressed = false;
                var gripsArePressed = false;
                var menuIsPressed = false;

                function findGamepad(id) {

                        // Iterate across gamepads as Vive Controllers may not be
                        // in position 0 and 1.

                        var gamepads = navigator.getGamepads();

                        for (var i = 0, j = 0; i < 4; i++) {

                                var gamepad = gamepads[i];

                                if (gamepad && gamepad.id === 'OpenVR Gamepad') {

                                        if (j === id) return gamepad;

                                        j++;
                                }
                        }
                }

                this.matrixAutoUpdate = false;
                this.standingMatrix = new THREE.Matrix4();

                this.getGamepad = function () {

                        return gamepad;
                };

                this.getButtonState = function (button) {

                        if (button === 'thumbpad') return thumbpadIsPressed;
                        if (button === 'trigger') return triggerIsPressed;
                        if (button === 'grips') return gripsArePressed;
                        if (button === 'menu') return menuIsPressed;
                };

                this.update = function () {

                        gamepad = findGamepad(id);

                        if (gamepad !== undefined && gamepad.pose !== undefined) {

                                if (gamepad.pose === null) return; // No user action yet

                                //  Position and orientation.

                                var pose = gamepad.pose;

                                if (pose.position !== null) scope.position.fromArray(pose.position);
                                if (pose.orientation !== null) scope.quaternion.fromArray(pose.orientation);
                                scope.matrix.compose(scope.position, scope.quaternion, scope.scale);
                                scope.matrix.multiplyMatrices(scope.standingMatrix, scope.matrix);
                                scope.matrixWorldNeedsUpdate = true;
                                scope.visible = true;

                                //  Thumbpad and Buttons.

                                if (axes[0] !== gamepad.axes[0] || axes[1] !== gamepad.axes[1]) {

                                        axes[0] = gamepad.axes[0]; //  X axis: -1 = Left, +1 = Right.
                                        axes[1] = gamepad.axes[1]; //  Y axis: -1 = Bottom, +1 = Top.
                                        scope.dispatchEvent({ type: 'axischanged', axes: axes });
                                }

                                if (thumbpadIsPressed !== gamepad.buttons[0].pressed) {

                                        thumbpadIsPressed = gamepad.buttons[0].pressed;
                                        scope.dispatchEvent({ type: thumbpadIsPressed ? 'thumbpaddown' : 'thumbpadup' });
                                }

                                if (triggerIsPressed !== gamepad.buttons[1].pressed) {

                                        triggerIsPressed = gamepad.buttons[1].pressed;
                                        scope.dispatchEvent({ type: triggerIsPressed ? 'triggerdown' : 'triggerup' });
                                }

                                if (gripsArePressed !== gamepad.buttons[2].pressed) {

                                        gripsArePressed = gamepad.buttons[2].pressed;
                                        scope.dispatchEvent({ type: gripsArePressed ? 'gripsdown' : 'gripsup' });
                                }

                                if (menuIsPressed !== gamepad.buttons[3].pressed) {

                                        menuIsPressed = gamepad.buttons[3].pressed;
                                        scope.dispatchEvent({ type: menuIsPressed ? 'menudown' : 'menuup' });
                                }
                        } else {

                                scope.visible = false;
                        }
                };
        };

        THREE.ViveController.prototype = Object.create(THREE.Object3D.prototype);
        THREE.ViveController.prototype.constructor = THREE.ViveController;
};

},{}],5:[function(require,module,exports){
'use strict';

/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */
module.exports = function (THREE) {

		THREE.VRControls = function (object, onError) {

				var scope = this;

				var vrDisplay, vrDisplays;

				var standingMatrix = new THREE.Matrix4();

				var frameData = null;

				if ('VRFrameData' in window) {

						frameData = new VRFrameData();
				}

				function gotVRDisplays(displays) {

						vrDisplays = displays;

						if (displays.length > 0) {

								vrDisplay = displays[0];
						} else {

								if (onError) onError('VR input not available.');
						}
				}

				if (navigator.getVRDisplays) {

						navigator.getVRDisplays().then(gotVRDisplays).catch(function () {

								console.warn('THREE.VRControls: Unable to get VR Displays');
						});
				}

				// the Rift SDK returns the position in meters
				// this scale factor allows the user to define how meters
				// are converted to scene units.

				this.scale = 1;

				// If true will use "standing space" coordinate system where y=0 is the
				// floor and x=0, z=0 is the center of the room.
				this.standing = false;

				// Distance from the users eyes to the floor in meters. Used when
				// standing=true but the VRDisplay doesn't provide stageParameters.
				this.userHeight = 1.6;

				this.getVRDisplay = function () {

						return vrDisplay;
				};

				this.setVRDisplay = function (value) {

						vrDisplay = value;
				};

				this.getVRDisplays = function () {

						console.warn('THREE.VRControls: getVRDisplays() is being deprecated.');
						return vrDisplays;
				};

				this.getStandingMatrix = function () {

						return standingMatrix;
				};

				this.update = function () {

						if (vrDisplay) {

								var pose;

								if (vrDisplay.getFrameData) {

										vrDisplay.getFrameData(frameData);
										pose = frameData.pose;
								} else if (vrDisplay.getPose) {

										pose = vrDisplay.getPose();
								}

								if (pose.orientation !== null) {

										object.quaternion.fromArray(pose.orientation);
								}

								if (pose.position !== null) {

										object.position.fromArray(pose.position);
								} else {

										object.position.set(0, 0, 0);
								}

								if (this.standing) {

										if (vrDisplay.stageParameters) {

												object.updateMatrix();

												standingMatrix.fromArray(vrDisplay.stageParameters.sittingToStandingTransform);
												object.applyMatrix(standingMatrix);
										} else {

												object.position.setY(object.position.y + this.userHeight);
										}
								}

								object.position.multiplyScalar(scope.scale);
						}
				};

				this.resetPose = function () {

						if (vrDisplay) {

								vrDisplay.resetPose();
						}
				};

				this.resetSensor = function () {

						console.warn('THREE.VRControls: .resetSensor() is now .resetPose().');
						this.resetPose();
				};

				this.zeroSensor = function () {

						console.warn('THREE.VRControls: .zeroSensor() is now .resetPose().');
						this.resetPose();
				};

				this.dispose = function () {

						vrDisplay = null;
				};
		};
};

},{}],6:[function(require,module,exports){
'use strict';

/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 *
 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
 *
 * Firefox: http://mozvr.com/downloads/
 * Chromium: https://webvr.info/get-chrome
 *
 */
module.exports = function (THREE) {

				THREE.VREffect = function (renderer, onError) {

								var vrDisplay, vrDisplays;
								var eyeTranslationL = new THREE.Vector3();
								var eyeTranslationR = new THREE.Vector3();
								var renderRectL, renderRectR;

								var frameData = null;

								if ('VRFrameData' in window) {

												frameData = new window.VRFrameData();
								}

								function gotVRDisplays(displays) {

												vrDisplays = displays;

												if (displays.length > 0) {

																vrDisplay = displays[0];
												} else {

																if (onError) onError('HMD not available');
												}
								}

								if (navigator.getVRDisplays) {

												navigator.getVRDisplays().then(gotVRDisplays).catch(function () {

																console.warn('THREE.VREffect: Unable to get VR Displays');
												});
								}

								//

								this.isPresenting = false;
								this.scale = 1;

								var scope = this;

								var rendererSize = renderer.getSize();
								var rendererUpdateStyle = false;
								var rendererPixelRatio = renderer.getPixelRatio();

								this.getVRDisplay = function () {

												return vrDisplay;
								};

								this.setVRDisplay = function (value) {

												vrDisplay = value;
								};

								this.getVRDisplays = function () {

												console.warn('THREE.VREffect: getVRDisplays() is being deprecated.');
												return vrDisplays;
								};

								this.setSize = function (width, height, updateStyle) {

												rendererSize = { width: width, height: height };
												rendererUpdateStyle = updateStyle;

												if (scope.isPresenting) {

																var eyeParamsL = vrDisplay.getEyeParameters('left');
																renderer.setPixelRatio(1);
																renderer.setSize(eyeParamsL.renderWidth * 2, eyeParamsL.renderHeight, false);
												} else {

																renderer.setPixelRatio(rendererPixelRatio);
																renderer.setSize(width, height, updateStyle);
												}
								};

								// VR presentation

								var canvas = renderer.domElement;
								var defaultLeftBounds = [0.0, 0.0, 0.5, 1.0];
								var defaultRightBounds = [0.5, 0.0, 0.5, 1.0];

								function onVRDisplayPresentChange() {

												var wasPresenting = scope.isPresenting;
												scope.isPresenting = vrDisplay !== undefined && vrDisplay.isPresenting;

												if (scope.isPresenting) {

																var eyeParamsL = vrDisplay.getEyeParameters('left');
																var eyeWidth = eyeParamsL.renderWidth;
																var eyeHeight = eyeParamsL.renderHeight;

																if (!wasPresenting) {

																				rendererPixelRatio = renderer.getPixelRatio();
																				rendererSize = renderer.getSize();

																				renderer.setPixelRatio(1);
																				renderer.setSize(eyeWidth * 2, eyeHeight, false);
																}
												} else if (wasPresenting) {

																renderer.setPixelRatio(rendererPixelRatio);
																renderer.setSize(rendererSize.width, rendererSize.height, rendererUpdateStyle);
												}
								}

								window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange, false);

								this.setFullScreen = function (boolean) {

												return new Promise(function (resolve, reject) {

																if (vrDisplay === undefined) {

																				reject(new Error('No VR hardware found.'));
																				return;
																}

																if (scope.isPresenting === boolean) {

																				resolve();
																				return;
																}

																if (boolean) {

																				resolve(vrDisplay.requestPresent([{ source: canvas }]));
																} else {

																				resolve(vrDisplay.exitPresent());
																}
												});
								};

								this.requestPresent = function () {

												return this.setFullScreen(true);
								};

								this.exitPresent = function () {

												return this.setFullScreen(false);
								};

								this.requestAnimationFrame = function (f) {

												if (vrDisplay !== undefined) {

																return vrDisplay.requestAnimationFrame(f);
												} else {

																return window.requestAnimationFrame(f);
												}
								};

								this.cancelAnimationFrame = function (h) {

												if (vrDisplay !== undefined) {

																vrDisplay.cancelAnimationFrame(h);
												} else {

																window.cancelAnimationFrame(h);
												}
								};

								this.submitFrame = function () {

												if (vrDisplay !== undefined && scope.isPresenting) {

																vrDisplay.submitFrame();
												}
								};

								this.autoSubmitFrame = true;

								// render

								var cameraL = new THREE.PerspectiveCamera();
								cameraL.layers.enable(1);

								var cameraR = new THREE.PerspectiveCamera();
								cameraR.layers.enable(2);

								this.render = function (scene, camera, renderTarget, forceClear) {

												if (vrDisplay && scope.isPresenting) {

																var autoUpdate = scene.autoUpdate;

																if (autoUpdate) {

																				scene.updateMatrixWorld();
																				scene.autoUpdate = false;
																}

																var eyeParamsL = vrDisplay.getEyeParameters('left');
																var eyeParamsR = vrDisplay.getEyeParameters('right');

																eyeTranslationL.fromArray(eyeParamsL.offset);
																eyeTranslationR.fromArray(eyeParamsR.offset);

																if (Array.isArray(scene)) {

																				console.warn('THREE.VREffect.render() no longer supports arrays. Use object.layers instead.');
																				scene = scene[0];
																}

																// When rendering we don't care what the recommended size is, only what the actual size
																// of the backbuffer is.
																var size = renderer.getSize();
																var layers = vrDisplay.getLayers();
																var leftBounds;
																var rightBounds;

																if (layers.length) {

																				var layer = layers[0];

																				leftBounds = layer.leftBounds !== null && layer.leftBounds.length === 4 ? layer.leftBounds : defaultLeftBounds;
																				rightBounds = layer.rightBounds !== null && layer.rightBounds.length === 4 ? layer.rightBounds : defaultRightBounds;
																} else {

																				leftBounds = defaultLeftBounds;
																				rightBounds = defaultRightBounds;
																}

																renderRectL = {
																				x: Math.round(size.width * leftBounds[0]),
																				y: Math.round(size.height * leftBounds[1]),
																				width: Math.round(size.width * leftBounds[2]),
																				height: Math.round(size.height * leftBounds[3])
																};
																renderRectR = {
																				x: Math.round(size.width * rightBounds[0]),
																				y: Math.round(size.height * rightBounds[1]),
																				width: Math.round(size.width * rightBounds[2]),
																				height: Math.round(size.height * rightBounds[3])
																};

																if (renderTarget) {

																				renderer.setRenderTarget(renderTarget);
																				renderTarget.scissorTest = true;
																} else {

																				renderer.setRenderTarget(null);
																				renderer.setScissorTest(true);
																}

																if (renderer.autoClear || forceClear) renderer.clear();

																if (camera.parent === null) camera.updateMatrixWorld();

																camera.matrixWorld.decompose(cameraL.position, cameraL.quaternion, cameraL.scale);
																camera.matrixWorld.decompose(cameraR.position, cameraR.quaternion, cameraR.scale);

																var scale = this.scale;
																cameraL.translateOnAxis(eyeTranslationL, scale);
																cameraR.translateOnAxis(eyeTranslationR, scale);

																if (vrDisplay.getFrameData) {

																				vrDisplay.depthNear = camera.near;
																				vrDisplay.depthFar = camera.far;

																				vrDisplay.getFrameData(frameData);

																				cameraL.projectionMatrix.elements = frameData.leftProjectionMatrix;
																				cameraR.projectionMatrix.elements = frameData.rightProjectionMatrix;
																} else {

																				cameraL.projectionMatrix = fovToProjection(eyeParamsL.fieldOfView, true, camera.near, camera.far);
																				cameraR.projectionMatrix = fovToProjection(eyeParamsR.fieldOfView, true, camera.near, camera.far);
																}

																// render left eye
																if (renderTarget) {

																				renderTarget.viewport.set(renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height);
																				renderTarget.scissor.set(renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height);
																} else {

																				renderer.setViewport(renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height);
																				renderer.setScissor(renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height);
																}
																renderer.render(scene, cameraL, renderTarget, forceClear);

																// render right eye
																if (renderTarget) {

																				renderTarget.viewport.set(renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height);
																				renderTarget.scissor.set(renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height);
																} else {

																				renderer.setViewport(renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height);
																				renderer.setScissor(renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height);
																}
																renderer.render(scene, cameraR, renderTarget, forceClear);

																if (renderTarget) {

																				renderTarget.viewport.set(0, 0, size.width, size.height);
																				renderTarget.scissor.set(0, 0, size.width, size.height);
																				renderTarget.scissorTest = false;
																				renderer.setRenderTarget(null);
																} else {

																				renderer.setViewport(0, 0, size.width, size.height);
																				renderer.setScissorTest(false);
																}

																if (autoUpdate) {

																				scene.autoUpdate = true;
																}

																if (scope.autoSubmitFrame) {

																				scope.submitFrame();
																}

																return;
												}

												// Regular render mode if not HMD

												renderer.render(scene, camera, renderTarget, forceClear);
								};

								this.dispose = function () {

												window.removeEventListener('vrdisplaypresentchange', onVRDisplayPresentChange, false);
								};

								//

								function fovToNDCScaleOffset(fov) {

												var pxscale = 2.0 / (fov.leftTan + fov.rightTan);
												var pxoffset = (fov.leftTan - fov.rightTan) * pxscale * 0.5;
												var pyscale = 2.0 / (fov.upTan + fov.downTan);
												var pyoffset = (fov.upTan - fov.downTan) * pyscale * 0.5;
												return { scale: [pxscale, pyscale], offset: [pxoffset, pyoffset] };
								}

								function fovPortToProjection(fov, rightHanded, zNear, zFar) {

												rightHanded = rightHanded === undefined ? true : rightHanded;
												zNear = zNear === undefined ? 0.01 : zNear;
												zFar = zFar === undefined ? 10000.0 : zFar;

												var handednessScale = rightHanded ? -1.0 : 1.0;

												// start with an identity matrix
												var mobj = new THREE.Matrix4();
												var m = mobj.elements;

												// and with scale/offset info for normalized device coords
												var scaleAndOffset = fovToNDCScaleOffset(fov);

												// X result, map clip edges to [-w,+w]
												m[0 * 4 + 0] = scaleAndOffset.scale[0];
												m[0 * 4 + 1] = 0.0;
												m[0 * 4 + 2] = scaleAndOffset.offset[0] * handednessScale;
												m[0 * 4 + 3] = 0.0;

												// Y result, map clip edges to [-w,+w]
												// Y offset is negated because this proj matrix transforms from world coords with Y=up,
												// but the NDC scaling has Y=down (thanks D3D?)
												m[1 * 4 + 0] = 0.0;
												m[1 * 4 + 1] = scaleAndOffset.scale[1];
												m[1 * 4 + 2] = -scaleAndOffset.offset[1] * handednessScale;
												m[1 * 4 + 3] = 0.0;

												// Z result (up to the app)
												m[2 * 4 + 0] = 0.0;
												m[2 * 4 + 1] = 0.0;
												m[2 * 4 + 2] = zFar / (zNear - zFar) * -handednessScale;
												m[2 * 4 + 3] = zFar * zNear / (zNear - zFar);

												// W result (= Z in)
												m[3 * 4 + 0] = 0.0;
												m[3 * 4 + 1] = 0.0;
												m[3 * 4 + 2] = handednessScale;
												m[3 * 4 + 3] = 0.0;

												mobj.transpose();

												return mobj;
								}

								function fovToProjection(fov, rightHanded, zNear, zFar) {

												var DEG2RAD = Math.PI / 180.0;

												var fovPort = {
																upTan: Math.tan(fov.upDegrees * DEG2RAD),
																downTan: Math.tan(fov.downDegrees * DEG2RAD),
																leftTan: Math.tan(fov.leftDegrees * DEG2RAD),
																rightTan: Math.tan(fov.rightDegrees * DEG2RAD)
												};

												return fovPortToProjection(fovPort, rightHanded, zNear, zFar);
								}
				};
};

},{}],7:[function(require,module,exports){
'use strict';

/**
 * @author mrdoob / http://mrdoob.com
 * Based on @tojiro's vr-samples-utils.js
 */

module.exports = {

		isLatestAvailable: function isLatestAvailable() {

				console.warn('WEBVR: isLatestAvailable() is being deprecated. Use .isAvailable() instead.');
				return this.isAvailable();
		},

		isAvailable: function isAvailable() {

				return navigator.getVRDisplays !== undefined;
		},

		getMessage: function getMessage() {

				var message;

				if (navigator.getVRDisplays) {

						navigator.getVRDisplays().then(function (displays) {

								if (displays.length === 0) message = 'WebVR supported, but no VRDisplays found.';
						});
				} else {

						message = 'Your browser does not support WebVR. See <a href="http://webvr.info">webvr.info</a> for assistance.';
				}

				if (message !== undefined) {

						var container = document.createElement('div');
						container.style.position = 'absolute';
						container.style.left = '0';
						container.style.top = '0';
						container.style.right = '0';
						container.style.zIndex = '999';
						container.align = 'center';

						var error = document.createElement('div');
						error.style.fontFamily = 'sans-serif';
						error.style.fontSize = '16px';
						error.style.fontStyle = 'normal';
						error.style.lineHeight = '26px';
						error.style.backgroundColor = '#fff';
						error.style.color = '#000';
						error.style.padding = '10px 20px';
						error.style.margin = '50px';
						error.style.display = 'inline-block';
						error.innerHTML = message;
						container.appendChild(error);

						return container;
				}
		},

		getButton: function getButton(effect) {

				var button = document.createElement('button');
				button.style.position = 'absolute';
				button.style.left = 'calc(50% - 50px)';
				button.style.bottom = '20px';
				button.style.width = '100px';
				button.style.border = '0';
				button.style.padding = '8px';
				button.style.cursor = 'pointer';
				button.style.backgroundColor = '#000';
				button.style.color = '#fff';
				button.style.fontFamily = 'sans-serif';
				button.style.fontSize = '13px';
				button.style.fontStyle = 'normal';
				button.style.textAlign = 'center';
				button.style.zIndex = '999';
				button.textContent = 'ENTER VR';
				button.onclick = function () {

						effect.isPresenting ? effect.exitPresent() : effect.requestPresent();
				};

				window.addEventListener('vrdisplaypresentchange', function (event) {

						button.textContent = effect.isPresenting ? 'EXIT VR' : 'ENTER VR';
				}, false);

				return button;
		}

};

},{}]},{},[1])(1)
});