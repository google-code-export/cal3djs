# Core Model Handling #

In Cal3DJS, every model instance is based on a core model, which therefore must be created first. All the shared data, such as animations, meshes and materials, need to be loaded, and a few additional steps are necessary to finish the setup of the material handling.

## Creation ##

First of all, we need to create an instance of the [Cal3D.CalCoreModel](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalCoreModel.html) class. The constructor take a single argument as a description of the core model.
```
var myCoreModel = new Cal3D.CalCoreModel('myHero');
```

## Data Loading ##

The next step is to load the skeleton data. Note that there can be only one skeleton per core model and it should be loaded before any other type of data. Use the [Cal3D.CalLoader.loadCoreSkeletonFromFile()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalLoader.html#.loadCoreSkeletonFromFile) function to do this by providing the URL of the skeleton file and a callback object to retrieve the loaded core model or some useful information in case that any error happened.
```
var skeletonCallback = {};

skeletonCallback.onload = function(coreSkeleton, url) {
    myCoreModel.setCoreSkeleton(coreSkeleton);
};

skeletonCallback.onerror = function(errorCode, url) {
    // error handling ...
};

skeletonCallback.onprogress = function(progress, url) {
    // show progress ...
};

Cal3D.CalLoader.loadCoreSkeletonFromFile('hero.xsf', skeletonCallback);
```

Now that the skeleton has been loaded successfully, the animation, meshe and material data can now be loaded in any order. Use [Cal3D.CalLoader.loadCoreAnimationFromFile()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalLoader.html#.loadCoreAnimationFromFile), [Cal3D.CalLoader.loadCoreMeshFromFile()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalLoader.html#.loadCoreMeshFromFile) and [Cal3D.CalLoader.loadCoreMaterialFromFile()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalLoader.html#.loadCoreMaterialFromFile) functions to do these.
```
/*
    Animation Data Loading
*/

// assumimg the core skeleton has been loaded successfully and set to the core model

var idleCoreAnimationId, walkCoreAnimationId, limpCoreAnimationId, waveCoreAnimationId;

var animationCallback = {};

animationCallback.onload = function(coreAnimation, url) {
    switch(url) {
    case 'hero_idle.xaf':
        idleCoreAnimationId = myCoreModel.addCoreAnimation(coreAnimation);
        break;
    case 'hero_walk.xaf':
        walkCoreAnimationId = myCoreModel.addCoreAnimation(coreAnimation);
        break;
    case 'hero_limp.xaf':
        limpCoreAnimationId = myCoreModel.addCoreAnimation(coreAnimation);
        break;
    case 'hero_wave.xaf':
        waveCoreAnimationId = myCoreModel.addCoreAnimation(coreAnimation);
        break;
    default:
        break;
    }
};

animationCallback.onerror = function(errorCode, url) {
    // error handling ...
};

animationCallback.onprogress = function(progress, url) {
    // show progress ...
};

// get the core skeleton from the core model
var myCoreSkeleton = myCoreModel.getCoreSkeleton();

Cal3D.CalLoader.loadCoreAnimationFromFile('hero_idle.xaf', myCoreSkeleton, animationCallback);
Cal3D.CalLoader.loadCoreAnimationFromFile('hero_walk.xaf', myCoreSkeleton, animationCallback);
Cal3D.CalLoader.loadCoreAnimationFromFile('hero_limp.xaf', myCoreSkeleton, animationCallback);
Cal3D.CalLoader.loadCoreAnimationFromFile('hero_wave.xaf', myCoreSkeleton, animationCallback);
```
```
/*
    Mesh Data Loading
*/

var upperBodyCoreMeshId, lowerBodyCoreMeshId, helmetCoreMeshId;

var meshCallback = {};

meshCallback.onload = function(coreMesh, url) {
    switch(url) {
    case 'hero_upperbody.xmf':
        upperBodyCoreMeshId = myCoreModel.addCoreMesh(coreMesh);
        break;
    case 'hero_lowerbody.xmf':
        lowerBodyCoreMeshId = myCoreModel.addCoreMesh(coreMesh);
        break;
    case 'hero_helmet.xmf':
        helmetCoreMeshId = myCoreModel.addCoreMesh(coreMesh);
        break;
    default:
        break;
    }
};

meshCallback.onerror = function(errorCode, url) {
    // error handling ...
};

meshCallback.onprogress = function(progress, url) {
    // show progress ...
};

Cal3D.CalLoader.loadCoreMeshFromFile('hero_upperbody.xmf', meshCallback);
Cal3D.CalLoader.loadCoreMeshFromFile('hero_lowerbody.xmf', meshCallback);
Cal3D.CalLoader.loadCoreMeshFromFile('hero_helmet.xmf', meshCallback);
```
```
/*
    Material Data Loading
*/

var upperBodyChainmailCoreMaterialId, upperBodyPlatemailCoreMaterialId;
var lowerBodyChainmailCoreMaterialId, lowerBodyPlatemailCoreMaterialId;

var materialCallback = {};

materialCallback.onload = function(coreMaterial, url) {
    switch(url) {
    case 'hero_upperbody_chainmail.xrf':
        upperBodyChainmailCoreMaterialId = myCoreModel.addCoreMaterial(coreMaterial);
        break;
    case 'hero_upperbody_platemail.xrf':
        upperBodyPlatemailCoreMaterialId = myCoreModel.addCoreMaterial(coreMaterial);
        break;
    case 'hero_lowerbody_chainmail.xrf':
        lowerBodyChainmailCoreMaterialId = myCoreModel.addCoreMaterial(coreMaterial);
        break;
    case 'hero_lowerbody_platemail.xrf':
        lowerBodyPlatemailCoreMaterialId = myCoreModel.addCoreMaterial(coreMaterial);
        break;
    default:
        break;
    }
};

materialCallback.onerror = function(errorCode, url) {
    // error handling ...
};

materialCallback.onprogress = function(progress, url) {
    // show progress ...
};

Cal3D.CalLoader.loadCoreMaterialFromFile('hero_upperbody_chainmail.xrf', materialCallback);
Cal3D.CalLoader.loadCoreMaterialFromFile('hero_upperbody_platemail.xrf', materialCallback);
Cal3D.CalLoader.loadCoreMaterialFromFile('hero_lowerbody_chainmail.xrf', materialCallback);
Cal3D.CalLoader.loadCoreMaterialFromFile('hero_lowerbody_platemail.xrf', materialCallback);
```

## Material System Setup ##

Depending on the model type and the required functionality, a few additional steps should be done to make the material handling work properly.

Textures are not handled by the Cal3DJS library directly, because of all the different ways they are needed and managed in the applications. However, there is flexible system in place to support the texture handling as much as possible.

In every map of each material there is an identifier stored. This value is written during the exporting process, and is most likely the filename of a texture. The idea is to use this value to load the texture, and reference it afterwards through a user-defined data that can be stored in every core material map at runtime.

Useful functions to get all the core materials of the core model are [Cal3D.CalCoreModel.getCoreMaterialCount()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalCoreModel.html#getCoreMaterialCount) and [Cal3D.CalCoreModel.getCoreMaterial()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalCoreModel.html#getCoreMaterial). The number of maps in a core material is returned by the [Cal3D.CalCoreMaterial.getMapCount()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalCoreMaterial.html#getMapCount) function. Access to the filename of each map is provided through [Cal3D.CalCoreMaterial.getMapFilename()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalCoreMaterial.html#getMapFilename). User-data, such as an identifier of the loaded texture, can be stored in the core material map with help of the [Cal3D.CalCoreMaterial.setMapUserData()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalCoreMaterial.html#setMapUserData) function. It can later be retrieved by calling [Cal3D.CalCoreMaterial.getMapUserData()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalCoreMaterial.html#getMapUserData).
```
/*
    Load all textures and store them as user-data in the corresponding core material map
*/

var onTextureLoad = function(texture, coreMaterial, mapId) {
    // store the texture object as user-data in the core material map
    coreMaterial.setMapUserData(mapId, texture);
};

var materialCount = myCoreModel.getCoreMaterialCount();
for(var materialId=0; materialId<materialCount; materialId++) {
    // get the current core material
    var coreMaterial = coreModel.getCoreMaterial(materialId);

    // loop through all maps of the current core material
    var mapCount = coreMaterial.getMapCount();
    for(var mapId=0; mapId<mapCount; mapId++) {
        // load the texture from file
        var filename = coreMaterial.getMapFilename(mapId);
        var url = filename;    // or myTexturePath + filename

        // the function that is responsible for loading and creating a graphic-API dependent 
        // (canvas, WebGL, etc.) texture object and calls onTextureLoad when done
        myTextureLoadingCreatingFunction(url, coreMaterial, mapId, onTextureLoad);
    }
}
```
If we want to use the built-in material management system of the Cal3DJS library to handle different material sets and threads, we have to initialize it accordingly. This is done by creating all material threads of the core model by calling [Cal3D.CalCoreModel.createCoreMaterialThread()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalCoreModel.html#createCoreMaterialThread) for each of them. Then, the [Cal3D.CalCoreModel.setCoreMaterialId()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalCoreModel.html#setCoreMaterialId) is used to assign a material to a specific material thread/set pair.
```
/*
    Material thread/set setup
*/

// create all the material threads
const UPPER_BODY_MATERIAL_THREAD = 0;
const LOWER_BODY_MATERIAL_THREAD = 1;

myCoreModel.createCoreMaterialThread(UPPER_BODY_MATERIAL_THREAD);
myCoreModel.createCoreMaterialThread(LOWER_BODY_MATERIAL_THREAD);

// assign a material for each material thread/set pair
const CHAINMAIL_MATERIAL_SET = 0;
const PLATEMAIL_MATERIAL_SET = 1;

myCoreModel.setCoreMaterialId(UPPER_BODY_MATERIAL_THREAD, CHAINMAIL_MATERIAL_SET, upperBodyChainmailCoreMaterialId);
myCoreModel.setCoreMaterialId(UPPER_BODY_MATERIAL_THREAD, PLATEMAIL_MATERIAL_SET, upperBodyPlatemailCoreMaterialId);
myCoreModel.setCoreMaterialId(LOWER_BODY_MATERIAL_THREAD, CHAINMAIL_MATERIAL_SET, lowerBodyChainmailCoreMaterialId);
myCoreModel.setCoreMaterialId(LOWER_BODY_MATERIAL_THREAD, PLATEMAIL_MATERIAL_SET, lowerBodyPlatemailCoreMaterialId);
```


# Model Instance Handling #

After the loading and initialization of a core model, an unlimited number of model instances can be created from it. Each of them has its own state, such as attached meshes, active animations or level-of-detail settings.

## Creation ##

We create a model instance by simply calling the constructor of [Cal3D.CalModel](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalModel.html) class, passing in the core model it should be based on.
```
var myModel = new Cal3D.CalModel(myCoreModel);
```

## Attachment and Detachment of Meshes ##

There is no mesh attached to a newly created model instance. This should be done by calling the [Cal3D.CalModel.attachMesh()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalModel.html#attachMesh) function.
```
myModel.attachMesh(upperBodyCoreMeshId);
```
We can them attach another mesh or detach an existing mesh. To detach an attached mesh we use the [Cal3D.CalModel.detachMesh()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalModel.html#detachMesh) function.
```
myModel.detachMesh(upperBodyCoreMeshId);
```
Now we have a complete Cal3dJS model instance that can be animated and rendered in our scene.

## A Convenient Way: Load Model From a Config File ##

Since the creation and data loading of a core model and then a model instance are rather boring and tedious routine operations, the Cal3dJS library provides a convenient way to do these all together: we can write a config file and then load the entire model instance from it using the [Cal3D.CalLoader.loadModelFromConfigFile()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalLoader.html#.loadModelFromConfigFile) function.
```
var myModel;

var modelCallback = {};

modelCallback.onload = function(loaded, url) {
    // the input parameter 'loaded' contains the loaded model instance and other 
    // useful informations defined in the config file

    myModel = loaded.model;

    var path         = loaded.path;
    var displayScale = loaded.scale;
}

modelCallback.onerror = function(errorCode, url) {
    // error handling ...
};

modelCallback.onprogress = function(progress, url) {
    // show progress ...
};

Cal3D.CalLoader.loadModelFromConfigFile('hero.cfg', modelCallback);
```
The config file should look like this:
```
#
# cal3d model configuration file
#
# model: hero
#

# the relative path from the page to the model file folder
path=./

# the display scaling factor
scale=1.0

# the skeleton file
skeleton=hero.xsf

# the animation files
animation=hero_idle.xaf
animation=hero_walk.xaf
animation=hero_limp.xaf
animation=hero_wave.xaf

# the mesh files
mesh=hero_upperbody.xmf
mesh=hero_lowerbody.xmf
mesh=hero_helmet.xmf

# the material files
material=hero_upperbody_chainmail.xrf
material=hero_upperbody_platemail.xrf
material=hero_lowerbody_chainmail.xrf
material=hero_lowerbody_platemail.xrf
```

## Runtime LOD Control ##

The [Cal3D.CalModel.setLodLevel()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalModel.html#setLodLevel) function is used to set the LOD (level-of-detail) of a model instance. This function takes an augument that is a number in the range [0.0, 1.0]. The value is defined as the amount of the faces that are collapsed. A value of 0.0 will collapse as many faces as possible, whereas a value of 1.0 will set the model to fully detailed.

Please note that the Cal3DJS library prevents face collapsing over a material border. This is to avoid unattractive artifacts. Therefore, a value of 0.0 does not equal zero faces. It means that all those faces are removed which can be collapsed safely.

The [Cal3D.CalModel.setLodLevel()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalModel.html#setLodLevel) function is quite expensive, so it should only be called when a significant change in the level-of-detail occured. Repetitive calls on every frame with the same value may kill the performance.
```
myModel.setLodLevel(0.5f);
```

## Material Control ##

A proper initialized material setup in the core model makes it possible to easily change the material set of a mesh or the whole model instance. The [Cal3D.CalModel.setMaterialSet()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalModel.html#setMaterialSet) function, either of the [Cal3D.CalModel](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalModel.html) or the [Cal3D.CalMesh](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalMesh.html) class, is used for this. The single argument is the new material set to use.
```
myModel.setMaterialSet(CHAINMAIL_MATERIAL_SET);
myModel.getMesh(upperBodyMeshId).setMaterialSet(PLATEMAIL_MATERIAL_SET);
```

## Animation Control ##

There are currently two types of animations implemented in the Cal3DJS library:

  1. Cycles, which are repeating, looping animations.
  1. Actions, which are one-time executed animations.

Note that all the available animations in a core model can be used as both animation types.

There are two function calls that are used to control cycles: _blendCycle()_ and _clearCycle()_ of the [Cal3D.CalMixer](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalMixer.html) helper class.

[Cal3D.CalMixer.blendCycle()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalMixer.html#blendCycle) adjusts the weight of a cyclic animation in a given amount of time. This can be used to fade in a new cycle or to modify the weight of an active cycle. The first argument is the animation identifier, which was returned when the animation was loaded. The second argument is the new weight for the cycle. The third and last argument is the delay until the given weight will be reached. This value can be used to seamlessly blend between two different cycles and to avoid abrupt motion changes.

[Cal3D.CalMixer.clearCycle()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalMixer.html#clearCycle) fades out an active cycle animation in a given amount of time. The first argument is again an animation identifier. The second argument is the delay until the animation will be at zero weight.
```
myModel.getMixer().clearCycle(idleAnimationId, 0.3f);
myModel.getMixer().blendCycle(walkAnimationId, 0.8f, 0.3f);
myModel.getMixer().blendCycle(limpAnimationId, 0.2f, 0.3f);
```
[The Cal3D.CalMixer.executeAction()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalMixer.html#executeAction) function is used to execute an action animation. It takes the animation identifier as a first argument. The second and third arguments are the fade in and fade out delay. Actions are executed once and automatically removed afterwards.
```
myModel.getMixer().executeAction(waveAnimationId, 0.3f, 0.3f);
```

## State Update ##

To obtain a smooth motion of the models, their state needs to be updated regularly. This involves evaluating the new time and blending values for the active animations, and calculating the resulting pose of the skeleton. All this computation is done by calling the [Cal3D.CalModel.update()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalModel.html#update) function. The single argument is a floating-point value holding the elapsed seconds since the last update call.
```
// elapsedSeconds = the time interval from last update in seconds
myModel.update(elapsedSeconds);
```

## Rendering ##

To avoid any graphic-API dependent code, the actual rendering of the models is not done directly by the Cal3DJS library itself. All the necessary functions are available to make your rendering loop as simple as possible.

**IMPORTANT**: The rendering of a model must always be enclosed by a [Cal3D.CalRenderer.beginRendering()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#beginRendering) and a [Cal3D.CalRenderer.endRendering()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#endRendering) function call.

The basic idea is to render the model by visiting all its meshes and their submeshes. Helpful functions for this are [Cal3D.CalRenderer.getMeshCount()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getMeshCount) and [Cal3D.CalRenderer.getSubmeshCount()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getSubmeshCount). A call to the [Cal3D.CalRenderer.selectMeshSubmesh()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#selectMeshSubmesh) function sets the current mesh/submesh to which all following data queries will refer to.

Material properties can be retrieved by calling [Cal3D.CalRenderer.getAmbientColor()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getAmbientColor), [Cal3D.CalRenderer.getDiffuseColor()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getDiffuseColor), [Cal3D.CalRenderer.getSpecularColor()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getSpecularColor) and [Cal3D.CalRenderer.getShininess()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getShininess).

The geometric data, such as vertices, normals, texture coordinates and faces, is obtained by calling the appropriate functions and providing a sufficient sized buffer for the data to hold. These functions are [Cal3D.CalRenderer.getVertices()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getVertices), [Cal3D.CalRenderer.getNormals()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getNormals), [Cal3D.CalRenderer.getTextureCoordinates()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getTextureCoordinates) and [Cal3D.CalRenderer.getFaces()](http://cal3djs.googlecode.com/svn/trunk/jsdoc/symbols/Cal3D.CalRenderer.html#getFaces). They all return the actual number of data elements written to the buffer.
```
// get the renderer of the model
var calRenderer = myModel.getRenderer();

// begin the rendering loop
if(!calRenderer.beginRendering()) {
    // do error handling and return
    // ...
}

// set the global graphic-API states if necessary
// ...

// get the number of meshes in the model
var meshCount = calRenderer.getMeshCount();

// loop and render all meshes of the model
for(meshId=0; meshId<meshCount; meshId++) {
    // get the number of submeshes in the current mesh
    var submeshCount = calRenderer.getSubmeshCount(meshId);

    // loop and render all submeshes in the current mesh
    for(var submeshId=0; submeshId<submeshCount; submeshId++) {
        // select mesh and submesh for further data access
        calRenderer.selectMeshSubmesh(meshId, submeshId);

        var colorBuffer = [0, 0, 0, 0];

        // get the material ambient color
        var ambientColor;
        calRenderer.getAmbientColor(colorBuffer);
        ambientColor = [ colorBuffer[0] / 255, colorBuffer[1] / 255, colorBuffer[2] / 255 ];

        // get the material diffuse color
        var diffuseColor;
        calRenderer.getDiffuseColor(colorBuffer);
        diffuseColor = [ colorBuffer[0] / 255, colorBuffer[1] / 255, colorBuffer[2] / 255 ];

        // get the material specular color
        var specularColor;
        calRenderer.getSpecularColor(colorBuffer);
        specularColor = [ colorBuffer[0] / 255, colorBuffer[1] / 255, colorBuffer[2] / 255 ];

        // get the material shininess factor
        var shininess = calRenderer.getShininess();

        // get the number of faces of the model
        var faceCount = calRenderer.getFaceCount();
        // get the number of vertices of the model
        var vertexCount = calRenderer.getVertexCount();
        // get the number of texture maps of the model
        var textureCount = calRenderer.getMapCount();

        var indices = indexBuffers[meshId][submeshId];
        if(indices.length != faceCount * 3) {
            // reallocate or adjust the length of the index buffer to hold faceCount * 3 numbers
            // ...

            // get face indices of the current submesh
            calRenderer.getFaces(indices);

            // update indices of the current graphic-API dependent mesh object
            // ...
        }

        var vertices = vertexBuffers[meshId][submeshId];
        var normals  = normalBuffers[meshId][submeshId];
        if(vertices.length != vertexCount * 3) {
            // reallocate or adjust the length of the vertex buffer and the normal buffer to hold faceCount * 3 numbers
            // ...

            // get vertices of the current submesh
            calRenderer.getVertices(vertices);
            // get normals of the current submesh
            calRenderer.getNormals(normals);

            // update vertices and normals of the current graphic-API dependent mesh object
            // ...
        }

        if(textureCount > 0) {
            var uv0s = texCoordBuffers[meshId][submeshId][0];
            if(uv0s.length != vertexCount * 2) {
                for(var mapId=0; mapId<textureCount; mapId++) {
                    var uvs = texCoordBuffers[meshId][submeshId][mapId];

                    // reallocate or adjust the length of the texture coordnate buffer to hold vertexCount * 2 numbers
                    // ...

                    // get texture coordinates of the current map of the current submesh
                    calRenderer.getTextureCoordinates(mapId, uvs);

                    // update texture/multi-texture coordinates of the current graphic-API dependent mesh object
                    // ...
                }
            }
        }

        // get the graphic-API dependent texture object stored in the model
        var textures = [];
        for(var mapId=0; mapId<textureCount; mapId++) {
            textures.push(calRenderer.getMapUserData(mapId));
        }

        // setup render states for the current submesh using the graphic-API
        // ...

        // render the current submesh using the graphic-API
        // ...
    }
}

// end the rendering of the model
calRenderer.endRendering();
```