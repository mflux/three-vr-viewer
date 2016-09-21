## THREE.js VR Viewer

![Preview Image](http://i.imgur.com/OGgcuQU.png)

One-liner to start THREE.js WebVR projects. This project serves as a super beginner friendly way to build WebVR experiments.

For now this only works in the [WebVR enabled Chromium build](https://webvr.info/get-chrome/).

## Setup ##

Include the script from build/three-vr-viewer.js in your project, after THREE.js

    <script type="text/javascript" src="js/three.min.js"></script>
    <script type="text/javascript" src="js/three-vr-viewer.js"></script>

In your own project:

    VRViewer({THREE});

That's literally it.

Please note you have to pass in an existing THREE.js.

## Exposing THREE.js objects ##

**VRViewer()** returns several objects. You can destructure this object like so:

    const { scene, camera, renderer, events, toggleVR, controllers, vrEffect } = VRViewer({THREE});

Now you have access to the scene, camera, etc.

The Events object can run callbacks, for example, if you want something to change every frame:

    events.on( 'tick', function( dt ){
      box.rotation.x += 0.4 * dt;
    });

You're also given the VR controllers, if present, as an array of **controllers[]**. They are, for the time being, [THREE.ViveController](https://github.com/mrdoob/three.js/blob/dev/examples/js/ViveController.js) objects so you can bind events to them like:

      controllers[0].addEventListener('triggerdown', function(){
        console.log('controller trigger pressed!');
      });

## Options ##
**VRViewer()** can take several options:

- **antiAlias:** (default true). Anti-aliasing. This reduces performance if on.
- **clearColor:** (default 0x505050). Hexadecimal for background color.
- **emptyRoom:** (default true). Creates an empty room so you're not floating in space.
- **standing:** (default true). Whether or not VRControls is a standing experience.
- **loadControllers:** (default true). Attempts to load controller models.
- **vrButton:** (default true). Whether or not to show the "Enter VR" button.
- **pathToControllers:** (default 'models/obj/vive-controller/'). Path where the Vive controller model is located. In case you need to override it.
- **controllerModelName:** (default 'vr_controller_vive_1_5.obj'). Filename of the Vive controller model. In case you need to override it.
- **controllerTextureMap:** (default 'onepointfive_texture.png'). Filename of the Vive controller texture map.
- **controllerSpecMap:** (default 'onepointfive_spec.png'). Filename of the Vive controller specular map.

For example:

    VRViewer({
      THREE,
      emptyRoom: true
    });

This automatically enters VR and enables the empty room.

## Installing from NPM

    npm install
    npm run dev


## Examples ##
[Start a web server](http://www.2ality.com/2014/06/simple-http-server.html) at three-vr-viewer/example and then navigate to localhost:8000


## Notes ##
* The module requires that you pass in a copy of THREE.js. Meaning you should have included it with <script> tag.
* You can also include this as an ES6 module directly by doing
    import create from 'VRViewer' if you're installing it from NPM.
