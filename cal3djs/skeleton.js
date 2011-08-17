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
	@class CalSkeleton
*/
Cal3D.CalSkeleton = function(coreSkeleton) {
	this.m_coreSkeleton = coreSkeleton;
	this.m_vectorBone = [];
	this.m_isBoundingBoxesComputed = false;

	// clone the skeleton structure of the core skeleton
	var vectorCoreBone = coreSkeleton.getVectorCoreBone();

	// get the number of bones
	var boneCount = vectorCoreBone.length;

	// clone every core bone
	for(var boneId=0; boneId<boneCount; boneId++) {
		var bone = new Cal3D.CalBone(vectorCoreBone[boneId]);

		// set skeleton in the bone instance
		bone.setSkeleton(this);

		// insert bone into bone vector
		this.m_vectorBone.push(bone);
	}
};

/**
	Calculate the state of the skeleton.<br />
	This function calculates the state of the skeleton instance by recursively calculating the states of its bones.
*/
Cal3D.CalSkeleton.prototype.calculateState = function() {
	// calculate all bone states of the skeleton
	var listRootCoreBoneId = this.m_coreSkeleton.getVectorRootCoreBoneId();

	for(var iRootCoreBoneId=0; iRootCoreBoneId<listRootCoreBoneId.length; iRootCoreBoneId++) {
		this.m_vectorBone[ listRootCoreBoneId[iRootCoreBoneId] ].calculateState();
	}
	this.m_isBoundingBoxesComputed = false;
};

/**
	Clear the state of the skeleton.<br />
	This function clears the state of the skeleton instance by recursively clearing the states of its bones.
*/
Cal3D.CalSkeleton.prototype.clearState = function() {
	// clear all bone states of the skeleton
	for(var boneId=0; boneId<this.m_vectorBone.length; boneId++) {
		this.m_vectorBone[boneId].clearState();
	}
	this.m_isBoundingBoxesComputed = false;
};

Cal3D.CalSkeleton.prototype.create = function(coreSkeleton) {
	throw 'not implemented error';
};

/**
	Get a bone of the skeleton.<br />
	This function returns the bone with the given ID.
	@param {number} boneId The The ID of the bone.
	@returns {Cal3D.CalBone} The bone.
*/
Cal3D.CalSkeleton.prototype.getBone = function(boneId) {
	return this.m_vectorBone[boneId];
};

/**
	Get the core skeleton.<br />
	This function returns the core skeleton on which this skeleton instance is based on.
	@returns {Cal3D.CalCoreSkeleton} The core skeleton.
*/
Cal3D.CalSkeleton.prototype.getCoreSkeleton = function() {
	return this.m_coreSkeleton;
};

/**
	Get the bone list.<br />
	This function returns the list that contains all bones of the skeleton instance.
	@returns {Array} The bone list.
*/
Cal3D.CalSkeleton.prototype.getVectorBone = function() {
	return this.m_vectorBone;
};

/**
	Get the number of bones.<br />
	This function returns the number of bones of the skeleton instance.
	@returns {number} The number of bones.
*/
Cal3D.CalSkeleton.prototype.getBoneCount = function() {
	return this.m_vectorBone.length;
};

/**
	Lock the state of the skeleton.<br />
	This function locks the state of the skeleton instance by recursively locking the states of its bones.
*/
Cal3D.CalSkeleton.prototype.lockState = function() {
	// lock all bone states of the skeleton
	for(var boneId=0; boneId<this.m_vectorBone.length; boneId++) {
		this.m_vectorBone[boneId].lockState();
	}
};

/**
	Calculate axis aligned bounding box (AABB) of skeleton bones.<br />
	@param {Cal3D.CalVector} min (Optional) The vector where the min values of the bounding box are stored. This is an output parameter.
	@param {Cal3D.CalVector} max (Optional) The vector where the max values of the bounding box are stored. This is an output parameter.
	@returns {object} An object holding the min and max values of the bounding box.
*/
Cal3D.CalSkeleton.prototype.getBoneBoundingBox = function(min, max) {
	if(!min)
		min = new Cal3D.CalVector;
	if(!max)
		max = new Cal3D.CalVector;

	if(!this.m_isBoundingBoxesComputed) {
		this.calculateBoundingBoxes();
	}

	var boneId = 0;
	if(this.m_vectorBone.length > 0) {
		var translation = this.m_vectorBone[boneId].getTranslationAbsolute();

		min.assign(translation);
		max.assign(translation);

		boneId++;
	}

	for(; boneId<this.m_vectorBone.length; boneId++) {
		var translation = this.m_vectorBone[boneId].getTranslationAbsolute();

		if(translation.x > max.x)
			max.x = translation.x;
		else if(translation.x < min.x)
			min.x = translation.x;

		if(translation.y > max.y)
			max.y = translation.y;
		else if(translation.y < min.y)
			min.y = translation.y;

		if(translation.z > max.z)
			max.z = translation.z;
		else if(translation.z < min.z)
			min.z = translation.z;
	}

	return { min: min, max: max };
};

/**
	Calculate bones' bounding boxes.<br />
	This function calculates the bounding box of every bone in the Skeleton.
*/
Cal3D.CalSkeleton.prototype.calculateBoundingBoxes = function() {
	if(this.m_isBoundingBoxesComputed) 
		return;

	for(var boneId=0; boneId<this.m_vectorBone.length; boneId++) { 
		this.m_vectorBone[boneId].calculateBoundingBox();
	}
	this.m_isBoundingBoxesComputed = true;
};

/**
	Get transformed bone points of the skeleton. This is a debugging function.
	@param {Array} pointBuffer The user-provided buffer where the transformed bone point data is written to. This is an output parameter.
	@returns {number} The number of bone points written to the buffer.
*/
Cal3D.CalSkeleton.prototype.getBonePoints = function(pointBuffer) {
	var boneCount = this.m_vectorBone.length;

	var p = 0;
	for(var boneId=0; boneId<boneCount; boneId++) {
		var translation = this.m_vectorBone[boneId].getTranslationAbsolute();

		pointBuffer[p    ] = translation.x;
		pointBuffer[p + 1] = translation.y;
		pointBuffer[p + 2] = translation.z;

		p += 3;
	}

	return boneCount;
};

/**
	Get bone points (without transformation) of the skeleton. This is a debugging function.
	@param {Array} pointBuffer The user-provided buffer where the bone point data is written to. This is an output parameter.
	@returns {number} The number of bone points written to the buffer.
*/
Cal3D.CalSkeleton.prototype.getBonePointsStatic = function(pointBuffer) {
	var boneCount = this.m_vectorBone.length;

	var p = 0;
	for(var boneId=0; boneId<boneCount; boneId++) {
		var translation = this.m_vectorBone[boneId].getCoreBone().getTranslationAbsolute();

		pointBuffer[p    ] = translation.x;
		pointBuffer[p + 1] = translation.y;
		pointBuffer[p + 2] = translation.z;

		p += 3;
	}
	
	return boneCount;
};

/**
	Get transformed bone lines of the skeleton. This is a debugging function.
	@param {Array} pointBuffer The user-provided buffer where the transformed vertices of bone line data is written to. This is an output parameter.
	@returns {number} The number of vertices of bone lines written to the buffer.
*/
Cal3D.CalSkeleton.prototype.getBoneLines = function(lineBuffer) {
	var boneCount = this.m_vectorBone.length;
	
	var p = 0;
	var numLines = 0;
	for(var boneId=0; boneId<boneCount; boneId++) {
		var bone = this.m_vectorBone[boneId];

		var parentId = bone.getCoreBone().getParentId();
		if(parentId != -1) {
			var parent = this.m_vectorBone[parentId];

			var translation = bone.getTranslationAbsolute();
			var translationParent = parent.getTranslationAbsolute();

			lineBuffer[p    ] = translationParent.x;
			lineBuffer[p + 1] = translationParent.y;
			lineBuffer[p + 2] = translationParent.z;

			lineBuffer[p + 3] = translation.x;
			lineBuffer[p + 4] = translation.y;
			lineBuffer[p + 5] = translation.z;

			p += 6;
			numLines++;
		}
	}

	return numLines;
};

/**
	Get bone lines (without tranfromation) of the skeleton. This is a debugging function.
	@param {Array} pointBuffer The user-provided buffer where the vertices of bone line data is written to. This is an output parameter.
	@returns {number} The number of vertices of bone lines written to the buffer.
*/
Cal3D.CalSkeleton.prototype.getBoneLinesStatic = function(lineBuffer) {
	var boneCount = this.m_vectorBone.length;
	
	var p = 0;
	var numLines = 0;
	for(var boneId=0; boneId<boneCount; boneId++) {
		var bone = this.m_vectorBone[boneId];

		var parentId = bone.getCoreBone().getParentId();
		if(parentId != -1) {
			var parent = this.m_vectorBone[parentId];

			var translation = bone.getCoreBone().getTranslationAbsolute();
			var translationParent = parent.getCoreBone().getTranslationAbsolute();

			lineBuffer[p    ] = translationParent.x;
			lineBuffer[p + 1] = translationParent.y;
			lineBuffer[p + 2] = translationParent.z;

			lineBuffer[p + 3] = translation.x;
			lineBuffer[p + 4] = translation.y;
			lineBuffer[p + 5] = translation.z;

			p += 6;
			numLines++;
		}
	}

	return numLines;
};
