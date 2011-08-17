/*****************************************************************************
* Cal3D 3d character animation library
* Copyright (C) 2001, 2002 Bruno 'Beosil' Heidelberger
*
* This library is free software; you can redistribute it and/or modify it
* under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation; either version 2.1 of the License, or (at
* your option) any later version.
*****************************************************************************/

/*****************************************************************************
* Cal3DJS Javascript port of Cal3D for WebGL and canvas applications
* by Humu humu2009@gmail.com
* http://code.google.com/p/cal3djs/
*****************************************************************************/


/**
	@class CalModel
*/
Cal3D.CalModel = function(coreModel) {
	this.m_coreModel = coreModel;
	this.m_skeleton = new Cal3D.CalSkeleton(coreModel.getCoreSkeleton());
	this.m_mixer = new Cal3D.CalMixer(this);
	this.m_morphTargetMixer = new Cal3D.CalMorphTargetMixer(this);
	this.m_physique = new Cal3D.CalPhysique(this);
	this.m_springSystem = new Cal3D.CalSpringSystem(this);
	this.m_renderer = new Cal3D.CalRenderer(this);
	this.m_userData = null;
	this.m_vectorMesh = [];
	this.m_boundingBox = new Cal3D.CalBoundingBox;
};

/**
	Attach a mesh to the model.<br />
	This function attachs a mesh to the model instance.
	@param {number} coreMeshId The ID of the mesh to be attached.
	@returns {boolean} true if succeeded; false if the mesh does not exist.
*/
Cal3D.CalModel.prototype.attachMesh = function(coreMeshId) {
	// check if the id is valid
	if(coreMeshId < 0 || coreMeshId >= this.m_coreModel.getCoreMeshCount()) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'model.js');
		return false;
	}

	// get the core mesh
	var coreMesh = this.m_coreModel.getCoreMesh(coreMeshId);

	// check if the mesh is already attached
	for(var meshId=0; meshId<this.m_vectorMesh.length; meshId++) {
		// check if we found the matching mesh
		if(this.m_vectorMesh[meshId].getCoreMesh() == coreMesh) {
			// mesh is already active so nothing to do
			return true;
		}
	}

	// create a new mesh instance
	var mesh = new Cal3D.CalMesh(coreMesh);

	// set model in the mesh instance
	mesh.setModel(this);

	// insert the new mesh into the active list
	this.m_vectorMesh.push(mesh);

	return true;
};

/**
	Detach a mesh from the model.<br />
	This function detaches a mesh from the model instance.
	@param {number} coreMeshId The ID of the mesh to be detached.
	@returns {boolean} true if succeeded; false if the mesh does not exist or any error happened.
*/
Cal3D.CalModel.prototype.detachMesh = function(coreMeshId) {
	// check if the id is valid
	if(coreMeshId < 0 || coreMeshId >= this.m_coreModel.getCoreMeshCount()) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'model.js');
		return false;
	}

	// get the core mesh
	var coreMesh = this.m_coreModel.getCoreMesh(coreMeshId);

	// find the mesh for the given id
	for(var meshId=0; meshId<this.m_vectorMesh.length; meshId++) {
		// get the mesh
		var mesh = this.m_vectorMesh[meshId];

		// check if we found the matching mesh
		if(mesh.getCoreMesh() == coreMesh) {
			// erase the mesh out of the active mesh list
			this.m_vectorMesh.splice(meshId, 1);

			return true;
		}
	}

	return false;
};

/**
	Get the core model.<br />
	This function returns the core model on which this model instance is based on.
	@returns {Cal3D.CalCoreModel} The core model.
*/
Cal3D.CalModel.prototype.getCoreModel = function() {
	return this.m_coreModel;
};

/**
	Get an attached mesh.<br />
	This function returns the attached mesh with the given core mesh ID.
	@param {number} coreMeshId The core mesh ID of the mesh.
	@returns {Cal3D.CalMesh} The mesh; null if the mesh does not exist.
*/
Cal3D.CalModel.prototype.getMesh = function(coreMeshId) {
	// check if the id is valid
	if(coreMeshId < 0 || coreMeshId >= this.m_coreModel.getCoreMeshCount()) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'model.js');
		return null;
	}

	// get the core mesh
	var coreMesh = this.m_coreModel.getCoreMesh(coreMeshId);

	// search the mesh
	for(var meshId=0; meshId<this.m_vectorMesh.length; meshId++) {
		// check if we found the matching mesh
		if(this.m_vectorMesh[meshId].getCoreMesh() == coreMesh) {
			return this.m_vectorMesh[meshId];
		}
	}

	return null;
};

/**
	Get the mixer.<br />
	If a mixer that is not an instance of Cal3D.CalMixer was set with the CalModel.setAbstractMixer() method, an INVALID_MIXER_TYPE error 
	is set and null is returned.
	@returns {Cal3D.CalMixer} The mixer; null if the mixer is not set yet or not an instance of Cal3D.CalMixer.
*/
Cal3D.CalModel.prototype.getMixer = function() {
	if(!this.m_mixer)
		return null;

	if(!this.m_mixer.isDefaultMixer()) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_MIXER_TYPE, 'model.js');
		return null;
	}

	return this.m_mixer;
};

/**
	Get the mixer.<br />
	@returns {Cal3D.CalAbstractMixer} The mixer, null if the mixer is not set yet.
*/
Cal3D.CalModel.prototype.getAbstractMixer = function() {
	return this.m_mixer;
};

/**
	Set the mixer to a Cal3D.CalAbstractMixer subclass instance.<br />
	@param {Cal3D.CalAbstractMixer} mixer The mixer.
*/
Cal3D.CalModel.prototype.setAbstractMixer = function(mixer) {
	this.m_mixer = mixer;
};

/**
	Get the morph target mixer.<br />
	This function returns the morph target mixer.
	@returns {Cal3D.CalMorphTargetMixer} The morph target mixer.
*/
Cal3D.CalModel.prototype.getMorphTargetMixer = function() {
	return this.m_morphTargetMixer;
};

/**
	Get the physique.<br />
	This function returns the physique.
	@returns {Cal3D.CalPhysique} The physique.
*/
Cal3D.CalModel.prototype.getPhysique = function() {
	return this.m_physique;
};

/**
	Get the renderer.<br />
	This function returns the renderer.
	@returns {Cal3D.CalRenderer} The renderer.
*/
Cal3D.CalModel.prototype.getRenderer = function() {
	return this.m_renderer;
};

/**
	Get the skeleton.<br />
	This function returns the skeleton.
	@returns {Cal3D.CalSkeleton} The skeleton.
*/
Cal3D.CalModel.prototype.getSkeleton = function() {
	return this.m_skeleton;
};

/**
	Get spring system.<br />
	This function returns the spring system.
	@returns {Cal3D.CalSpringSystem} The spring system.
*/
Cal3D.CalModel.prototype.getSpringSystem = function() {
	return this.m_springSystem;
};

/**
	Get the global bounding box of the model.<br />
	This function returns the global bounding box of the model.
	@param {boolean} precision indicate if the function need to calculate a correct bounding box.
	@returns {Cal3D.CalBoundingBox} The bounding box of the model.
*/
Cal3D.CalModel.prototype.getBoundingBox = function(precision) {
	var norm = new Cal3D.CalVector(1, 0, 0);	
	this.m_boundingBox.plane[0].setNormal(norm);

	norm.assign(-1, 0, 0);	
	this.m_boundingBox.plane[1].setNormal(norm);

	norm.assign(0, 1, 0);	
	this.m_boundingBox.plane[2].setNormal(norm);

	norm.assign(0, -1, 0);	
	this.m_boundingBox.plane[3].setNormal(norm);

	norm.assign(0, 0, 1);	
	this.m_boundingBox.plane[4].setNormal(norm);

	norm.assign(0, 0, -1);	
	this.m_boundingBox.plane[5].setNormal(norm);

	if(precision)
		this.m_skeleton.calculateBoundingBoxes();

	var vectorBone = this.m_skeleton.getVectorBone();
	var bboxPoints = [  new Cal3D.CalVector, new Cal3D.CalVector, new Cal3D.CalVector, new Cal3D.CalVector, 
						new Cal3D.CalVector, new Cal3D.CalVector, new Cal3D.CalVector, new Cal3D.CalVector ];
	for(var boneId=0; boneId<vectorBone.length; boneId++) {
		var bone = vectorBone[boneId];

		// If it's just an approximation that are needed then
		// we just compute the bounding box from the skeleton
		if(!precision || !bone.getCoreBone().isBoundingBoxPrecomputed()) {
			var translation =  bone.getTranslationAbsolute();

			for(var planeId=0; planeId<6; planeId++) {
				if(this.m_boundingBox.plane[planeId].eval(translation) < 0) {
					this.m_boundingBox.plane[planeId].setPosition(translation);
				}
			}
		}
		else {
			var localBoundingBox = bone.getBoundingBox();
			localBoundingBox.computePoints(bboxPoints);

			for(var i=0; i<8; i++) {
				for(var planeId=0; planeId<6; planeId++) {
					if(this.m_boundingBox.plane[planeId].eval(bboxPoints[i]) < 0) {
						this.m_boundingBox.plane[planeId].setPosition(bboxPoints[i]);
					}
				}
			}				
		}
	}

	return this.m_boundingBox;
};

/**
	Get the user data.<br />
	This function returns the user data stored in the model instance.
	@returns {object} The user data stored in the model.
*/
Cal3D.CalModel.prototype.getUserData = function() {
	return this.m_userData
};

/**
	Get the mesh list.<br />
	This function returns the vector that contains all attached meshes of the model instance.
	@returns {Array} The mesh list. 
*/
Cal3D.CalModel.prototype.getVectorMesh = function() {
	return this.m_vectorMesh;
};

/**
	Set the current LOD level.<br />
	This function sets the current LOD level of all attached meshes.
	@param {number} lodLevel The LOD level in the range [0.0, 1.0].
*/
Cal3D.CalModel.prototype.setLodLevel = function(lodLevel) {
	// set the lod level in all meshes
	for(var meshId=0; meshId<this.m_vectorMesh.length; meshId++) {
		// set the lod level in the mesh
		this.m_vectorMesh[meshId].setLodLevel(lodLevel);
	}
};

/**
	Set the material set.<br />
	This function sets the material set of all attached meshes.
	@param {number} setId The ID of the material set.
*/
Cal3D.CalModel.prototype.setMaterialSet = function(setId) {
	// set the material set in all meshes
	for(var meshId=0; meshId<this.m_vectorMesh.length; meshId++) {
		// set the material set in the mesh
		this.m_vectorMesh[meshId].setMaterialSet(setId);
	}
};

/**
	Store user data.<br />
	This function stores user data in the model instance.
	@param {objest} userData The user data to be stored.
*/
Cal3D.CalModel.prototype.setUserData = function(userData) {
	this.m_userData = userData;
};

/**
	Update the model.<br />
	This function updates the model instance for a given amount of time.
	@param {number} deltaTime The elapsed time in seconds since the last update.
*/
Cal3D.CalModel.prototype.update = function(deltaTime) {
	this.m_mixer.updateAnimation(deltaTime);
	this.m_mixer.updateSkeleton();

	this.m_morphTargetMixer.update(deltaTime);
	this.m_physique.update();
	this.m_springSystem.update(deltaTime);
};

/**
	Disable internal data (and thus the springs system).
*/
Cal3D.CalModel.prototype.disableInternalData = function() {
	// disable internal data in all meshes
	for(var meshId=0; meshId<this.m_vectorMesh.length; meshId++) {
		// disable internal data in the mesh
		this.m_vectorMesh[meshId].disableInternalData();
	}
};
