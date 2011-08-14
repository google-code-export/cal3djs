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


var Cal3D = Cal3D || {};



/**
	@class CalBone
*/
Cal3D.CalBone = function(coreBone) {
	this.m_coreBone = coreBone;
	this.m_skeleton = null;
	this.m_accumulatedWeight = 0;
	this.m_accumulatedWeightAbsolute = 0;
	this.m_translation = new Cal3D.CalVector;
	this.m_rotation = new Cal3D.CalQuaternion;
	this.m_translationAbsolute = new Cal3D.CalVector;
	this.m_rotationAbsolute = new Cal3D.CalQuaternion;
	this.m_translationBoneSpace = new Cal3D.CalVector;
	this.m_rotationBoneSpace = new Cal3D.CalQuaternion;
	this.m_transformMatrix = new Cal3D.CalMatrix;
	this.m_boundingBox = new Cal3D.CalBoundingBox;

	this.clearState();
};

/**
	Interpolate the current state to another state.<br />
	This function interpolates the current state (relative translation and rotation) of the bone instance to another state of a given weight.
	@param {number} weight The blending weight.
	@param {Cal3D.CalVector} translation The relative translation to be interpolated to.
	@param {Cal3D.CalQuaternion} rotation The relative rotation to be interpolated to.
*/
Cal3D.CalBone.prototype.blendState = function(weight, translation, rotation) {
	if(this.m_accumulatedWeightAbsolute == 0) {
		// it is the first state, so just copy it into the bone state
		this.m_translationAbsolute.assign(translation);
		this.m_rotationAbsolute.assign(rotation);
		this.m_accumulatedWeightAbsolute = weight;
	}
	else {
		// it is not the first state, so blend all attributes
		var factor = weight / (this.m_accumulatedWeightAbsolute + weight);

		this.m_translationAbsolute.blend(factor, translation);
		this.m_rotationAbsolute.blend(factor, rotation);
		this.m_accumulatedWeightAbsolute += weight;
	}
};

/**
	Calculate the current state.<br />
	This function calculates the current state (absolute translation and rotation, as well as the bone space transformation) of 
	the bone instance and all its children.
*/
Cal3D.CalBone.prototype.calculateState = function() {
	// check if the bone was not touched by any active animation
	if(this.m_accumulatedWeight == 0) {
		// set the bone to the initial skeleton state
		this.m_translation.assign(this.m_coreBone.getTranslation());
		this.m_rotation.assign(this.m_coreBone.getRotation());
	}

	// get parent bone id
	var parentId = this.m_coreBone.getParentId();

	if(parentId == -1) {
		// no parent, this means absolute state == relative state
		this.m_translationAbsolute.assign(this.m_translation);
		this.m_rotationAbsolute.assign(this.m_rotation);
	}
	else {
		// get the parent bone
		var parent = this.m_skeleton.getBone(parentId);

		// transform relative state with the absolute state of the parent
		this.m_translationAbsolute.assign(this.m_translation);
		this.m_translationAbsolute.multQuaternionLocal(parent.getRotationAbsolute());
		this.m_translationAbsolute.addLocal(parent.getTranslationAbsolute());

		this.m_rotationAbsolute.assign(this.m_rotation);
		this.m_rotationAbsolute.multQuaternionLocal(parent.getRotationAbsolute());
	}

	// calculate the bone space transformation
	this.m_translationBoneSpace.assign(this.m_coreBone.getTranslationBoneSpace());
	this.m_translationBoneSpace.multQuaternionLocal(this.m_rotationAbsolute);
	this.m_translationBoneSpace.addLocal(this.m_translationAbsolute);

	this.m_rotationBoneSpace.assign(this.m_coreBone.getRotationBoneSpace());
	this.m_rotationBoneSpace.multQuaternionLocal(this.m_rotationAbsolute);

	// Generate the vertex transform.  
	//TODO: If I ever add support for bone-scaling to Cal3D, this step will become significantly more complex.
	this.m_transformMatrix.assign(this.m_rotationBoneSpace);

	// calculate all child bones
	var listChildId = this.m_coreBone.getListChildId();
	for(var iChildId=0; iChildId<listChildId.length; iChildId++) {
		this.m_skeleton.getBone(listChildId[iChildId]).calculateState();
	}
};

/**
	Clear the current state.<br />
	This function clears the current state (absolute translation and rotation) of the bone instance and all its children.
*/
Cal3D.CalBone.prototype.clearState = function() {
	this.m_accumulatedWeight = 0;
	this.m_accumulatedWeightAbsolute = 0;
};

/**
	Get the core bone.<br />
	This function returns the core bone on which this bone instance is based on.
	@returns {Cal3D.CalCoreBone} The core bone instance. 
*/
Cal3D.CalBone.prototype.getCoreBone = function() {
	return this.m_coreBone;
};

/**
	Reset the bone to its core state.<br />
	This function changes the state of the bone to its default non-animated position and orientation. Child bones are unaffected and 
	may be animated independently.
*/
Cal3D.CalBone.prototype.setCoreState = function() {
	// set the bone to the initial skeleton state
	this.m_translation.assign(this.m_coreBone.getTranslation());
	this.m_rotation.assign(this.m_coreBone.getRotation());

	// set the appropriate weights
	this.m_accumulatedWeightAbsolute = 1;
	this.m_accumulatedWeight = 1;

	this.calculateState();
};

/**
	Reset the bone and children to core states.<br />
	This function changes the state of the bone to its default non-animated position and orientation. All child bones are also set in this manner.
*/
Cal3D.CalBone.prototype.setCoreStateRecursive = function() {
	// set the bone to the initial skeleton state
	this.m_translation.assign(this.m_coreBone.getTranslation());
	this.m_rotation.assign(this.m_coreBone.getRotation());

	// set the appropriate weights
	this.m_accumulatedWeightAbsolute = 1;
	this.m_accumulatedWeight = 1;

	// set core state for all child bones
	var listChildId = this.m_coreBone.getListChildId();
	for(var iChildId=0; iChildId<listChildId.length; iChildId++) {
		this.m_skeleton.getBone(listChildId[iChildId]).setCoreStateRecursive();
	}

	this.calculateState() ;
};

/**
	Set the current rotation.<br />
	This function sets the current relative rotation of the bone instance.
	@param {Cal3D.CalQuaternion} rotation The rotation to be set.
*/
Cal3D.CalBone.prototype.setRotation = function(rotation) {
	this.m_rotation.assign(rotation);
	this.m_accumulatedWeightAbsolute = 1;
	this.m_accumulatedWeight = 1;
};

/**
	Get the current rotation.<br />
	This function returns the current relative rotation of the bone instance.
	@returns {Cal3D.CalQuaternion} The current rotation.
*/
Cal3D.CalBone.prototype.getRotation = function() {
	return this.m_rotation;
};

/**
	Get the current absolute rotation.<br />
	This function returns the current absolute rotation of the bone instance.
	@returns {Cal3D.CalQuaternion} The current absolute rotation.
*/
Cal3D.CalBone.prototype.getRotationAbsolute = function() {
	return this.m_rotationAbsolute;
};

/**
	Get the current bone space rotation.<br />
	This function returns the current rotation to bring a point into the bone instance space.
	@returns {Cal3D.CalQuaternion} The current bone space rotation.
*/
Cal3D.CalBone.prototype.getRotationBoneSpace = function() {
	return this.m_rotationBoneSpace;
};

/**
	Set the current translation.<br />
	This function sets the current relative translation of the bone instance.
	@param {Cal3D.CalVector} translation The translation to be set.
*/
Cal3D.CalBone.prototype.setTranslation = function(translation) {
	this.m_translation.assign(translation);
	this.m_accumulatedWeightAbsolute = 1;
	this.m_accumulatedWeight = 1;
};

/**
	Get the current translation.<br />
	This function returns the current relative translation of the bone instance.
	@returns {Cal3D.CalVector} The relative translation to the parent.
*/
Cal3D.CalBone.prototype.getTranslation = function() {
	return this.m_translation;
};

/**
	Get the current absolute translation.<br />
	This function returns the current absolute translation of the bone instance.
	@returns {Cal3D.CalVector} The absolute translation to the parent.
*/
Cal3D.CalBone.prototype.getTranslationAbsolute = function() {
	return this.m_translationAbsolute;
};

/**
	Get the current bone space translation.<br />
	This function returns the current translation to bring a point into the bone instance space.
	@returns {Cal3D.CalVector} The current bone space translation.
*/
Cal3D.CalBone.prototype.getTranslationBoneSpace = function() {
	return this.m_translationBoneSpace;
};

/**
	Get the current transform matrix.<br />
	This function returns the current transform matrix of the bone instance.
	@returns {Cal3D.CalMatrix} The current transform matrix.
*/
Cal3D.CalBone.prototype.getTransformMatrix = function() {
	return this.m_transformMatrix;
};

/**
	Lock the current state.<br />
	This function locks the current state (absolute translation and rotation) of the bone instance and all its children.
*/
Cal3D.CalBone.prototype.lockState = function() {
	// clamp accumulated weight
	if(this.m_accumulatedWeightAbsolute > 1 - this.m_accumulatedWeight) {
		this.m_accumulatedWeightAbsolute = 1 - this.m_accumulatedWeight;
	}

	if(this.m_accumulatedWeightAbsolute > 0) {
		if(this.m_accumulatedWeight == 0) {
			// it is the first state, so just copy it into the bone state
			this.m_translation.assign(this.m_translationAbsolute);
			this.m_rotation.assign(this.m_rotationAbsolute);
			this.m_accumulatedWeight = this.m_accumulatedWeightAbsolute;
		}
		else {
			// it is not the first state, so blend all attributes
			var factor = this.m_accumulatedWeightAbsolute / (this.m_accumulatedWeight + this.m_accumulatedWeightAbsolute);

			this.m_translation.blend(factor, this.m_translationAbsolute);
			this.m_rotation.blend(factor, this.m_rotationAbsolute);
			this.m_accumulatedWeight += this.m_accumulatedWeightAbsolute;
		}

		this.m_accumulatedWeightAbsolute = 0;
	}
};

/**
	Set the skeleton the bone is attached to.<br />
	This function sets the skeleton to which the bone instance is attached to.
	@param {Cal3D.CalSkeleton} skeleton The skeleton to which the bone instance should be attached to.
*/
Cal3D.CalBone.prototype.setSkeleton = function(skeleton) {
	this.m_skeleton = skeleton;
};

/**
	Calculate the bounding box of the bone.<br />
	This function calculates the bounding box of the bone instance.
*/
Cal3D.CalBone.prototype.calculateBoundingBox = function() {
	if(!this.getCoreBone().isBoundingBoxPrecomputed())
		return;

	var dir = new Cal3D.CalVector(1, 0, 0);
	dir.multMatrixLocal(this.getTransformMatrix());
	this.m_boundingBox.plane[0].setNormal(dir);

	dir.assign(-1, 0, 0);
	dir.multMatrixLocal(this.getTransformMatrix());
	this.m_boundingBox.plane[1].setNormal(dir);

	dir.assign(0, 1, 0);
	dir.multMatrixLocal(this.getTransformMatrix());
	this.m_boundingBox.plane[2].setNormal(dir);

	dir.assign(0, -1, 0);
	dir.multMatrixLocal(this.getTransformMatrix());
	this.m_boundingBox.plane[3].setNormal(dir);

	dir.assign(0, 0, 1);
	dir.multMatrixLocal(this.getTransformMatrix());
	this.m_boundingBox.plane[4].setNormal(dir);

	dir.assign(0, 0, -1);
	dir.multMatrixLocal(this.getTransformMatrix());
	this.m_boundingBox.plane[5].setNormal(dir);

	var position = new Cal3D.CalVector;
	for(var i=0; i<6; i++) {
		this.getCoreBone().getBoundingData(i, position);

		position.multMatrixLocal(this.getTransformMatrix());
		position.addLocal(this.getTranslationBoneSpace());

		for(var planeId=0; planeId<6; planeId++) {
			if(this.m_boundingBox.plane[planeId].eval(position) < 0) {
				this.m_boundingBox.plane[planeId].setPosition(position);
			}
		}
	}
};

/**
	Get the current bounding box of the bone.<br />
	This function returns the current bounding box of the bone instance.
	@returns {Cal3D.CalBoundingBox} The bounding box of the bone.
*/
Cal3D.CalBone.prototype.getBoundingBox = function() {
	return this.m_boundingBox;
};
