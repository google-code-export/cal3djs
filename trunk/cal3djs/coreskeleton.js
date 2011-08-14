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
	@class CalCoreSkeleton
*/
Cal3D.CalCoreSkeleton = function() {
	this.m_vectorCoreBone = [];
	this.m_mapCoreBoneNames = {};
	this.m_vectorRootCoreBoneId = [];
};

/**
	Add a core bone.<br />
	This function adds a core bone to the core skeleton instance.
	@param {Cal3D.CalCoreBone} coreBone The core bone to be added.
	@returns {number} ID of the added core bone.
*/
Cal3D.CalCoreSkeleton.prototype.addCoreBone = function(coreBone) {
	// get next bone id
	var boneId = this.m_vectorCoreBone.length;
	this.m_vectorCoreBone.push(coreBone);

	// if necessary, add the core bone to the root bone list
	if(coreBone.getParentId() == -1) {
		this.m_vectorRootCoreBoneId.push(boneId);
	}

	// add a reference from the bone's name to its id
	this.mapCoreBoneName(boneId, coreBone.getName());

	return boneId;
};

/**
	Calculate the current state.<br />
	This function calculates the current state of the core skeleton instance by calculating all the core bone states.
*/
Cal3D.CalCoreSkeleton.prototype.calculateState = function() {
	// calculate all bone states of the skeleton
	for(var iRootCoreBoneId=0; iRootCoreBoneId<this.m_vectorRootCoreBoneId.length; iRootCoreBoneId++) {
		this.m_vectorCoreBone[this.m_vectorRootCoreBoneId[iRootCoreBoneId]].calculateState();
	}
};

/**
	Get a core bone.<br />
	This function returns the core bone with the given name or ID.
	@param {string | number} coreBoneId The name or ID of the core bone.
	@returns {Cal3D.CalCoreBone} The core bone.
*/
Cal3D.CalCoreSkeleton.prototype.getCoreBone = function(coreBoneId) {
	if((typeof coreBoneId) == 'string')
		coreBoneId = this.getCoreBoneId(coreBoneId);

	if(coreBoneId < 0 || coreBoneId >= this.m_vectorCoreBone.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coreskeleton.js');
		return null;
	}

	return this.m_vectorCoreBone[coreBoneId];
};

/**
	Get the ID of a specified core bone.<br />
	This function returns the ID of a specified core bone.
	@param {string} name The name of the core bone whose ID should be returned.
	@returns {number} The ID associated with the given name.
*/
Cal3D.CalCoreSkeleton.prototype.getCoreBoneId = function(name) {
	var coneBoneId = this.m_mapCoreBoneNames[name];
	// See if this mapping exists
	if(coneBoneId == undefined) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coreskeleton.js');
		return -1;
	}

	return coneBoneId;
};

/**
	Map the name to a specific ID of a core bone.<br />
	This function returns true or false depending on whether the mapping was successful or not. Note that it is possible to overwrite 
	and existing mapping and no error will be given.
	@param {number} coreBoneId ID of the core bone to be associated with the name.
	@param {string} name The name of the core bone that will be associated with the ID.
	@returns {boolean} true if succeeded; false if failed.
*/
Cal3D.CalCoreSkeleton.prototype.mapCoreBoneName = function(coreBoneId, name) {
	// Make sure the given ID is a valid corebone ID
	if(coreBoneId < 0 || coreBoneId >= this.m_vectorCoreBone.length)
		return false;

	this.m_mapCoreBoneNames[name] = coreBoneId;
	return true;
};

/**
	Get the root core bone ID list.<br />
	This function returns the list that contains all root core bone IDs of the core skeleton instance.
	@returns {Array} The root core bone ID list.
*/
Cal3D.CalCoreSkeleton.prototype.getVectorRootCoreBoneId = function() {
	return this.m_vectorRootCoreBoneId;
};

/**
	Get the core bone list.<br />
	This function returns the vector that contains all core bones of the core skeleton instance.
	@returns {Array} The core bone list.
*/
Cal3D.CalCoreSkeleton.prototype.getVectorCoreBone = function() {
	return this.m_vectorCoreBone;
};

/**
	Calculate bounding boxes of core bones.<br />
	This function calculates the bounding box of every bone in the core skeleton.
	@param {Cal3D.CalCoreModel} coreModel The coreModel needed to retrieve vertices.
*/
Cal3D.CalCoreSkeleton.prototype.calculateBoundingBoxes = function(coreModel) {
	for(var boneId=0; boneId<this.m_vectorCoreBone.length; boneId++) {
		this.m_vectorCoreBone[boneId].calculateBoundingBox(coreModel);
	}
};

/**
	Scale the core skeleton.<br />
	This function rescale all the data that are in the core skeleton instance.
	@param {number} The scale factor.
*/
Cal3D.CalCoreSkeleton.prototype.scale = function(factor) {
	for(var iRootCoreBoneId=0; iRootCoreBoneId<this.m_vectorRootCoreBoneId.length; iRootCoreBoneId++) {
		this.m_vectorCoreBone[iRootCoreBoneId].scale(factor);
	}
};
