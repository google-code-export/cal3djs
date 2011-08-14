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
	@class CalCoreBone
*/
Cal3D.CalCoreBone = function(name) {
	this.m_name = name;
	this.m_coreSkeleton = null;
	this.m_parentId = -1;
	this.m_listChildId = [];
	this.m_translation = new Cal3D.CalVector;
	this.m_rotation = new Cal3D.CalQuaternion;
	this.m_translationAbsolute = new Cal3D.CalVector;
	this.m_rotationAbsolute = new Cal3D.CalQuaternion;
	this.m_translationBoneSpace = new Cal3D.CalVector;
	this.m_rotationBoneSpace = new Cal3D.CalQuaternion;
	this.m_userData = null;

	this.m_boundingBox = new Cal3D.CalBoundingBox;
	this.m_boundingPosition = [ 
		new Cal3D.CalVector, 
		new Cal3D.CalVector, 
		new Cal3D.CalVector, 
		new Cal3D.CalVector, 
		new Cal3D.CalVector, 
		new Cal3D.CalVector 
	];
	this.m_boundingBoxPrecomputed = false;
};

/**
	Add a child ID.<br />
	This function adds a core bone ID to the child ID list of the core bone instance.
	@param {number} childId The ID of the core bone ID that shoud be added to the child ID list.s
	@returns {boolean} false if any error happeded.
*/
Cal3D.CalCoreBone.prototype.addChildId = function(childId) {
	this.m_listChildId.push(childId);
	return true;
};

/**
	Calculate the current state.<br />
	This function calculates the current state (absolute translation and rotation) of the core bone instance and all its children.
*/
Cal3D.CalCoreBone.prototype.calculateState = function() {
	if(this.m_parentId == -1) {
		// no parent, this means absolute state == relative state
		this.m_translationAbsolute.assign(this.m_translation);
		this.m_rotationAbsolute.assign(this.m_rotation);
	}
	else {
		// get the parent bone
		var parent = this.m_coreSkeleton.getCoreBone(this.m_parentId);

		// transform relative state with the absolute state of the parent
		this.m_translationAbsolute.assign(this.m_translation);
		this.m_translationAbsolute.multQuaternionLocal(parent.getRotationAbsolute());
		this.m_translationAbsolute.addLocal(parent.getTranslationAbsolute());

		this.m_rotationAbsolute.assign(this.m_rotation);
		this.m_rotationAbsolute.multQuaternionLocal(parent.getRotationAbsolute());
	}

	// calculate all child bones
	for(var iChildId=0; iChildId<this.m_listChildId.length; iChildId++) {
		this.m_coreSkeleton.getCoreBone(this.m_listChildId[iChildId]).calculateState();
	}
};

/**
	Get the child ID list.<br />
	This function returns the list that contains all child IDs of the core bone instance.
	@returns {Array} The child ID list.
*/
Cal3D.CalCoreBone.prototype.getListChildId = function() {
	return this.m_listChildId;
};

/**
	Get name of the core bone.<br />
	This function returns the name of the core bone instance.
	@returns {string} The name of the core bone.
*/
Cal3D.CalCoreBone.prototype.getName = function() {
	return this.m_name;
};

/**
	Get the parent ID.<br />
	This function returns the parent ID of the core bone instance.
	@returns {number} The parent ID, or -1 if this is a root core bone.
*/
Cal3D.CalCoreBone.prototype.getParentId = function() {
	return this.m_parentId;
};

/**
	Get the core skeleton the bone is attached to.<br />
	This function returns the core skeleton this bone is attached to.
	@returns {Cal3D.CalCoreSkeleton} The core skeleton.
*/
Cal3D.CalCoreBone.prototype.getCoreSkeleton = function() {
	return this.m_coreSkeleton;
};

/**
	Ger the rotation.<br />
	This function returns the relative rotation of the core bone instance.
	@returns {Cal3D.CalQuaternion} The relative rotation to the parent as quaternion.
*/
Cal3D.CalCoreBone.prototype.getRotation = function() {
	return this.m_rotation;
};

/**
	Get the absolute rotation.<br />
	This function returns the absolute rotation of the core bone instance.
	@returns {Cal3D.CalQuaternion} The absolute rotation as quaternion.
*/
Cal3D.CalCoreBone.prototype.getRotationAbsolute = function() {
	return this.m_rotationAbsolute;
};

/**
	Get the bone space rotation.<br />
	This function returns the rotation to bring a point into the core bone instance space.
	@returns {Cal3D.CalQuaternion} The bone space rotation as quaternion.
*/
Cal3D.CalCoreBone.prototype.getRotationBoneSpace = function() {
	return this.m_rotationBoneSpace;
};

/**
	Get the translation.<br />
	This function returns the relative translation of the core bone instance.
	@returns {Cal3D.CalVector} The relative translation to the parent as vector.
*/
Cal3D.CalCoreBone.prototype.getTranslation = function() {
	return this.m_translation;
};

/**
	Get the absolute translation.<br />
	This function returns the absolute translation of the core bone instance.
	@returns {Cal3D.CalVector} The absolute translation as vector.
*/
Cal3D.CalCoreBone.prototype.getTranslationAbsolute = function() {
	return this.m_translationAbsolute;
};

/**
	Get the bone space translation.<br />
	This function returns the translation to bring a point into the core bone instance space.
	@returns {Cal3D.CalVector} The bone space translation as vector.
*/
Cal3D.CalCoreBone.prototype.getTranslationBoneSpace = function() {
	return this.m_translationBoneSpace;
};

/**
	Get the user data.<br />
	This function returns the user data stored in the core bone instance.
	@returns {object} The user data stored in the core bone.
*/
Cal3D.CalCoreBone.prototype.getUserData = function() {
	return this.m_userData;
};

/**
	Set the core skeleton the bone is attached to.<br />
	This function sets the core skeleton to which the core bone instance is attached to.
	@param {Cal3D.CalCoreSkeleton} coreSkeleton The core skeleton to which the core bone instance should be attached to.
*/
Cal3D.CalCoreBone.prototype.setCoreSkeleton = function(coreSkeleton) {
	this.m_coreSkeleton = coreSkeleton;
};

/**
	Set the parent bone ID.<br />
	This function sets the parent ID of the core bone instance.
	@param {number} parentId The ID of the parent to be set.
*/
Cal3D.CalCoreBone.prototype.setParentId = function(parentId) {
	this.m_parentId = parentId;
};

/**
	Set the rotation.<br />
	This function sets the relative rotation of the core bone instance.
	@param {Cal3D.CalQuaternion} rotation The relative rotation to the parent as quaternion.
*/
Cal3D.CalCoreBone.prototype.setRotation = function(rotation) {
	this.m_rotation.assign(rotation);
};

/**
	Set the bone space rotation.<br />
	This function sets the rotation that brings a point into the core bone instance space.
	@param {Cal3D.CalQuaternion} rotation The bone space rotation to be set as quaternion.
*/
Cal3D.CalCoreBone.prototype.setRotationBoneSpace = function(rotation) {
	this.m_rotationBoneSpace.assign(rotation);
};

/**
	Set the translation.<br />
	This function sets the relative translation of the core bone instance.
	@param {Cal3D.CalVector} translation The relative translation to the parent as vector.
*/
Cal3D.CalCoreBone.prototype.setTranslation = function(translation) {
	this.m_translation.assign(translation);
};

/**
	Set the bone space translation.<br />
	This function sets the translation that brings a point into the core bone instance space.
	@param {Cal3D.CalVector} translation The bone space translation to be set as vector.
*/
Cal3D.CalCoreBone.prototype.setTranslationBoneSpace = function(translation) {
	this.m_translationBoneSpace.assign(translation);
};

/**
	Set user data that should be stored inthis core bone.<br />
	This function stores user data in the core bone instance.
	@param {object} userData The user data to be stored.
*/
Cal3D.CalCoreBone.prototype.setUserData = function(userData) {
	this.m_userData = userData;
};

/**
	Calculate the bounding box.<br />
	This function Calculates the bounding box of the core bone instance.
	@param {Cal3D.CalCoreModel} coreModel The core model needed to retrieve vertices.
*/
Cal3D.CalCoreBone.prototype.calculateBoundingBox = function(coreModel) {
	var boneId = this.m_coreSkeleton.getCoreBoneId(this.m_name);
	var bBoundsComputed = false;

	var rot = new Cal3D.CalQuaternion(this.m_rotationBoneSpace);
	rot.invert();

	var dir = new Cal3D.CalVector(1, 0, 0);
	dir.multQuaternionLocal(rot);
	this.m_boundingBox.plane[0].setNormal(dir);

	dir.assign(-1, 0, 0);
	dir.multQuaternionLocal(rot);
	this.m_boundingBox.plane[1].setNormal(dir);

	dir.assign(0, 1, 0);
	dir.multQuaternionLocal(rot);
	this.m_boundingBox.plane[2].setNormal(dir);

	dir.assign(0, -1, 0);
	dir.multQuaternionLocal(rot);
	this.m_boundingBox.plane[3].setNormal(dir);

	dir.assign(0, 0, 1);
	dir.multQuaternionLocal(rot);
	this.m_boundingBox.plane[4].setNormal(dir);

	dir.assign(0, 0, -1);
	dir.multQuaternionLocal(rot);
	this.m_boundingBox.plane[5].setNormal(dir);

	var coreMeshCount = coreModel.getCoreMeshCount();
	for(var meshId=0; meshId<coreMeshCount; meshId++) {
		var coreMesh = coreModel.getCoreMesh(meshId);

		var coreSubmeshCount = coreMesh.getCoreSubmeshCount();
		for(var submeshId=0; submeshId<coreSubmeshCount; submeshId++) {
			var coreSubmesh = coreMesh.getCoreSubmesh(submeshId);

			if(coreSubmesh.getSpringCount() == 0) {
				var vectorVertex = coreSubmesh.getVectorVertex();
				for(var vertexId=0; vertexId<vectorVertex.length; vertexId++) {
					var vertexInfluenceCount = vectorVertex[vertexId].vectorInfluence.length;
					for(var influenceId=0; influenceId<vertexInfluenceCount; influenceId++) {
						if(vectorVertex[vertexId].vectorInfluence[influenceId].boneId == boneId && vectorVertex[vertexId].vectorInfluence[influenceId].weight > 0.5) {
							for(var planeId=0; planeId<6; planeId++) {
								if(this.m_boundingBox.plane[planeId].eval(vectorVertex[vertexId].position) < 0) {
									this.m_boundingBox.plane[planeId].setPosition(vectorVertex[vertexId].position);
									this.m_boundingPosition[planeId].assign(vectorVertex[vertexId].position);
									bBoundsComputed = true;
								}
							}
						}
					}
				}	
			}
		}
	}

	// to handle bones with no vertices assigned 
	if(!bBoundsComputed) {
		for(var planeId=0; planeId<6; planeId++) {
			this.m_boundingBox.plane[planeId].setPosition(this.m_translation); 
			this.m_boundingPosition[planeId].assign(this.m_translation); 
		} 
	} 

	this.m_boundingBoxPrecomputed = true;
};

/**
	Get the current bounding box.<br />
	This function returns the current bounding box of the core bone instance.
	@returns {Cal3D.CalBoundingBox} The current bounding box of the core bone.
*/
Cal3D.CalCoreBone.prototype.getBoundingBox = function() {
	return this.m_boundingBox;
};

/**
	@private
*/
Cal3D.CalCoreBone.prototype.getBoundingData = function(planeId, position) {
	if(!position)
		position = new Cal3D.CalVector;

	position.assign(this.m_boundingPosition[planeId]);
	return position;
};

/**
	@private
*/
Cal3D.CalCoreBone.prototype.isBoundingBoxPrecomputed = function() {
	return this.m_boundingBoxPrecomputed;
};

/**
	Scale the core bone.<br />
	This function rescale all the data that are in the core bone instance and in all its children.
	@param {number} factor The scale factor.
*/
Cal3D.CalCoreBone.prototype.scale = function(factor) {
	this.m_translation.multScalarLocal(factor);
	this.m_translationAbsolute.multScalarLocal(factor);
	this.m_translationBoneSpace.multScalarLocal(factor);

	// calculate all child bones
	for(var iChildId=0; iChildId<this.m_listChildId.length; iChildId++)	{
		this.m_coreSkeleton.getCoreBone(this.m_listChildId[iChildId]).scale(factor);
	}
};
