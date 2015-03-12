# Overview #

The basic concept in the Cal3DJS library is to separate data that can be shared between several objects from data that is tied to one specific object instance. In the realm of skeletal character animation there is quite a lot of shared data: Take the animations and the meshes as examples

The Cal3DJS library has a set of [Core Classes](Architecture#Core_Classes.md) that represents one type of model and that stores all the shared data. Each set of [Instance Classes](Architecture#Instance_Classes.md) is constructed from the Core Classes and represents one specific instance of the model type

Say we have a little fantasy game with heroic warriors and deadly dragons. There will be 2 different core models, namely the one for the warriors and the other for the dragons. The core model of the warriors contains all the animations, materials and meshes of all possible warrior instances. The same holds for the dragon core model. Now, every time a warrior or dragon is born, a new model instance will be created based on its core model. The individual appearance is done by selecting specific meshes and materials from the core model. This allows us to have epic battles with numerous different warriors and dragons, even so we store most of the data only once.

## Core Classes ##

As explained, each set of _**Core Classes**_ contains all the data for one model type. This data can be divided into 4 parts:

  1. The hierarchical structure, see [Skeletons and Bones](Architecture#Skeletons_and_Bones.md) for details.
  1. The motion data, see [Animations, Tracks and Keyframes](Architecture#Animations,_Tracks_and_Keyframes.md) for details.
  1. The surface properties, see [Materials](Architecture#Materials.md) for details.
  1. The body parts, see [Meshes and Submeshes](Architecture#Meshes_and_Submeshes.md) for details.

**Figure 1-1. Core Classes**

![http://cal3djs.googlecode.com/svn/wiki/architecture_guide_classes_2.gif](http://cal3djs.googlecode.com/svn/wiki/architecture_guide_classes_2.gif)

## Instance Classes ##

Each set of _**Instance Classes**_ contains the specific data for one instance of a model type. This data can be divided into 3 parts:

  1. The current state of the skeleton, see [Skeletons and Bones](Architecture#Skeletons_and_Bones.md) for details.
  1. The active set of animations, see [Animations, Tracks and Keyframes](Architecture#Animations,_Tracks_and_Keyframes.md) for details.
  1. The attached body parts, see [Meshes and Submeshes](Architecture#Meshes_and_Submeshes.md) for details.

There are 4 helper classes that simplify the model handling:

  1. The motion control, see [Mixer](Architecture#Mixer.md) for details.
  1. The skinning stage (Physique).
  1. The (experimental) cloth animation layer (Spring-System).
  1. The rendering interface, see [Renderer](Architecture#Renderer.md) for details.

**Figure 1-2. Core Classes**

![http://cal3djs.googlecode.com/svn/wiki/architecture_guide_classes_3.gif](http://cal3djs.googlecode.com/svn/wiki/architecture_guide_classes_3.gif)

## Animation Pipeline ##

The process of calculating the final model from the core data and the current instance state must be seen as one single pipeline:

  1. The combination of all the active animations in the "Mixer" to get a current skeleton pose.
  1. The combination of all the active morph targets in the "Morpher" to get a current mesh.
  1. The deformation of the current mesh based on the current skeleton pose in the "Physique".
  1. The simulation of the cloth parts of the model in the "Spring-System".
  1. The querying of the final data from the "Renderer".

**Figure 1-3. Core Classes**

![http://cal3djs.googlecode.com/svn/wiki/architecture_guide_pipeline.gif](http://cal3djs.googlecode.com/svn/wiki/architecture_guide_pipeline.gif)

# Vectors and Quaternions #

Vectors and quaternions are essential elements in the internal calculations of the Cal3DJS library. The translation of bones, the position of mesh vertices and the orientation of mesh normals are all stored as a vector. Quaternions are used whenever a rotation needs to be represented, such as at a joint. They have some big advantages over rotation matrices in regard to interpolation and memory usage. This is the reason why you will not find any matrices in the Cal3DJS library. If you ever need these rotations in a matrix representation, you can easily convert the quaternions though.

# Skeletons and Bones #

The Cal3DJS library is designed as a skeletal-based animation system. This means that all the mesh vertices of the animated model are attached to one or more bones of an underlying skeleton structure. This makes it very easy to animate the whole model, you only need to adjust the skeleton pose and the model meshes are automatically deformed. This method of attaching meshes to a bone hierarchy is known as 'skinning'.

**Figure 3-1. The skinned model**

![http://cal3djs.googlecode.com/svn/wiki/architecture_guide_phases.gif](http://cal3djs.googlecode.com/svn/wiki/architecture_guide_phases.gif)

A bone is defined as a relative transformation to the parent bone. This transformation is split into two separate parts: The relative translation stored in a vector, and the relative rotation stored in a quaternion. The absolute transformation of a bone is recursively calculated after each animation step.

Following the concept of shared data, the core skeleton and its core bones contain data such as the initial skeleton pose, the bone names and the hierarchy itself. Whereas the skeleton and the bones of the model instances have only the current transformation and a link to the corresponding skeleton or bone stored.

# Animations, Tracks and Keyframes #

The Cal3DJS library stores every motion such as walking, jumping, waving etc. in a separate core animation inside the core model. These animations contain one core track for each bone that is affected by the specific motion.

Say we have a walking, human-like model waving with his right hand. There are 2 animations in this scenario, the one for walking and the other for waving. The walking animation does most likely contain a track for every bone there is to have a fully animated model. The waving animation will only be defined locally, so only tracks for the right hand, arm, shoulder and probably neck and head are stored within. This selective inclusion allows a powerful blending and overlay mechanism as we will see in [Mixer](Architecture#Mixer.md).

The actual transformation data for a bone is stored in several core keyframes that are contained in the corresponding track. Each keyframe holds a relative rotation and a relative translation to the parent bone for a specified point of time. These values are interpolated between two following keyframes by the Cal3DJS library to achieve a smooth motion.

All the above data can be shared between different model instances and is therefore completely stored in the [Core Classes](Architecture#Core_Classes.md). The active set of animations and their blending state is what makes the difference here, so these values are defined in each model instance separately.

# Mixer #

The Cal3DJS library provides a powerful and flexible, yet easy-to-use animation control system through the so called 'Mixer'. This helper class handles the following things for a model instance:

  1. The addition and removal of animations to the active animation set.
  1. The update of the active animation states including fade in and out.
  1. The weighted blending and prioritized overlay of the active animations according to their type.
  1. The update of the current pose of the skeleton.

When triggering a new animation you can choose between different behaviors. Currently implemented are the cycle and the action types. Once started, a cycle animation will loop until you explicitly stop it. This is well-suited for motions such as walking or swimming. The action type is a one-time animation that is executed only once and is removed automatically from the active animation set thereafter. As you can imagine this is useful for motions such as fighting moves or emotes. There are plans to extend the number of animation types in future releases of the Cal3DJS library.

Each active animation has a weight associated with it. This makes it possible to fine tune the amount of influence each animation has on the model. Furthermore each animation type has a different priority in the blending process. In the current version of the Cal3DJS library, the action type has a higher priority than the cycle one. This is necessary to make actions completely overlay the ongoing cycles.

There are a few important things you have to take care of to make this blending system work as intended. Make sure that the animations that are used as actions only contain tracks for bones that should really be affected. Otherwise they will completely overlay all cycle animations, because of their higher priority. Cycles that will be blended together should also be synchronized to achieve a good-looking result. Note that this synchronization has to be done for the displacement of the motion only, not for the duration of the animation, as this adjustment is handled in the blending process inside the mixer.

# Materials #

In the Cal3DJS library, a core material is composed from the color components (ambient, diffuse and specular), a shininess factor and several maps, most likely texture-maps. All possible materials for a model type are stored in the core model according to the shared-data concept.

A simple mechanism for material handling is implemented, which provides an easy way to change materials and therefore the look of a model instance. For each core model there exists one or more material sets. Materials in the same set share a common look, as example 'skin', 'leather' or 'chain-mail'. Additionally there are one or more material threads in the core model. These material threads contain the same materials but grouped by a specific part of the model, as example 'left foot', 'torso' or 'helmet'. Together they build a material grid that defines a material for each material set/thread pair.

As described in [Meshes and Submeshes](Architecture#Meshes_and_Submeshes.md), every part of the core model (every submesh to be more exact) has a material thread assigned. You can now very easily change the look of a model instance, by simply select a new current material set for its parts. The Cal3DJS library is now able to look up the material in the material grid with the given new material set and the material thread stored in the core model parts.

# Meshes and Submeshes #

The Cal3DJS library can handle models built from one or more meshes. These meshes must be composed from triangular faces, but do not need to be in any special form otherwise. Each face inside the mesh is assigned to a corresponding submesh which holds all faces with the same material. This classification is done to minimize render state changes in the rendering phase.

Each submesh contains a list of vertices and a list of faces. The data stored per vertex includes the position, the normal, the mapping coordinates, the level-of-detail data and all the influences from the assigned bones. The face list is a simple structure that holds a vertex index for each corner of the face.

Once again, the core model holds all meshes for a specific model type, whereas the model instances have an active set of attached meshes. Each attached mesh has a current state for material and level-of-detail settings, so every model instance can be handled completely independent from the others.

# Renderer #

The Cal3DJS library does not handle the actual rendering itself, but it provides an easy-to-use interface called 'Renderer' to access all needed data for your rendering loop. The basic idea is to go through all the meshes of the model instance and visit one of its submeshes after the other.

For each submesh you execute a number of steps:

  1. Set the current mesh/submesh for the data query.
  1. Get the material data.
  1. Get the deformed vertex data.
  1. Get the transformed normal data.
  1. Get the mapping coordinate data.
  1. Get the face data.
  1. Set the rendering state in the used graphic API, and render the data.

Most of the data is returned in a user-allocated array to make usage of vertex- buffers as easy as possible.

The LOD calculations are done transparently by the Cal3DJS library. This means that you only need to set the current detail level for the model instance, and you will automatically get the adjusted data in the next rendering loop.

# Error Handling #

If a return-code of a Cal3DJS library function indicates an error, you can get a more detailed information about it from a set of error handling functions. The information contain data such as the individual error code, a description and the source file and line-number (currently unavailable) where the error occured.