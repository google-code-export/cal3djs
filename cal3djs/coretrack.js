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
	@class CalCoreTrack
*/
Cal3D.CalCoreTrack = function() {
	this.m_coreBoneId = -1;
	this.m_keyframes = [];
};

/**
	Create the core track.
	@returns {boolean} true if succeeded; false if not.
*/
Cal3D.CalCoreTrack.prototype.create = function() {
	return true;
};

/**
	Destroy the core track.
*/
Cal3D.CalCoreTrack.prototype.destroy = function() {
	// destroy all core key-frames
	for(var i=0; i<this.m_keyframes.length; i++) {
		this.m_keyframes[i].destroy();
	}

	this.m_keyframes = [];
	this.m_coreBoneId = -1;
};

/**
	Get a state.<br />
	This function returns the state (translation and rotation of the core bone) for the specified time and duration.
	@param {number} time The time in seconds at which the state should be returned.
	@param {Cal3D.CalVector} translation A vector as an output parameter that will be fiiled with specified state.
	@param {Cal3D.CalQuaternion} rotation A quaternion as an output parameter that will be fiiled with specified state.
	@returns {boolean} true if succeeded; false if any error happened.
*/
Cal3D.CalCoreTrack.prototype.getState = function(time, translation, rotation) {
	var iCoreKeyframeBefore, iCoreKeyframeAfter;

	// get the key-frame after the requested time
	iCoreKeyframeAfter = this.getUpperBound(time);

	// check if the time is after the last key-frame
	if(iCoreKeyframeAfter == this.m_keyframes.length) {
		// return the last key-frame state
		iCoreKeyframeAfter--;
		rotation.assign(this.m_keyframes[iCoreKeyframeAfter].getRotation());
		translation.assign(this.m_keyframes[iCoreKeyframeAfter].getTranslation());
		return true;
	}

	// check if the time is before the first key-frame
	if(iCoreKeyframeAfter == 0) {
		// return the first keyframe state
		rotation.assign(this.m_keyframes[iCoreKeyframeAfter].getRotation());
		translation.assign(this.m_keyframes[iCoreKeyframeAfter].getTranslation());
		return true;
	}

	// get the key-frame before the requested one
	iCoreKeyframeBefore = iCoreKeyframeAfter - 1;

	// get the two key-frames
	var coreKeyframeBefore, coreKeyframeAfter;
	coreKeyframeBefore = this.m_keyframes[iCoreKeyframeBefore];
	coreKeyframeAfter = this.m_keyframes[iCoreKeyframeAfter];

	// calculate the blending factor between the two key-frame states
	var blendFactor = (time - coreKeyframeBefore.getTime()) / (coreKeyframeAfter.getTime() - coreKeyframeBefore.getTime());

	/* 
		blend between the two key-frames
	*/
	translation.assign(coreKeyframeBefore.getTranslation());
	translation.blend(blendFactor, coreKeyframeAfter.getTranslation());

	rotation.assign(coreKeyframeBefore.getRotation());
	rotation.blend(blendFactor, coreKeyframeAfter.getRotation());

	return true;
};

/**
	Get the ID of the core bone.<br />
	This function returns the ID of the core bone to which the core track instance is attached to.
	@returns {number} The ID of the core bone.
*/
Cal3D.CalCoreTrack.prototype.getCoreBoneId = function() {
	return this.m_coreBoneId;
};

/**
	Set the ID of the core bone.<br />
	This function sets the ID of the core bone to which the core track instance is attached to.
	@param {number} coreBoneId  The ID of the core bone to which the core track should be attached to.
	@returns {boolean} true if succeeded; false if the core bone does not exist.
*/
Cal3D.CalCoreTrack.prototype.setCoreBoneId = function(coreBoneId) {
	if(coreBoneId < 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coretrack.js');
		return false;
	}

	this.m_coreBoneId = coreBoneId;
	return true;
};

/**
	Get the number of core keyframes.<br />
	@returns {number} The number of core keyframes.
*/
Cal3D.CalCoreTrack.prototype.getCoreKeyframeCount = function() {
	return this.m_keyframes.length;
};

/**
	Get a core keyframe.<br />
	@param {number} index The index of the core keyframe.
	@returns {Cal3D.CalCoreKeyframe} The core keyframe.
*/
Cal3D.CalCoreTrack.prototype.getCoreKeyframe = function(index) {
	return this.m_keyframes[index];
};

/**
	Add a core keyframe.<br />
	This function adds a core keyframe to the core track instance.
	@param {Cal3D.CalCoreKeyframe} coreKeyframe The core keyframe to be added.
	@returns {boolean} ID of the added core keyframe.
*/
Cal3D.CalCoreTrack.prototype.addCoreKeyframe = function(coreKeyframe) {
	this.m_keyframes.push(coreKeyframe);

	var index = this.m_keyframes.length - 1;
	while(index > 0 && this.m_keyframes[index].getTime() < this.m_keyframes[index-1].getTime()) {
		var temp = this.m_keyframes[index];
		this.m_keyframes[index] = this.m_keyframes[index - 1];
		this.m_keyframes[index - 1] = temp;
		index--;
	}

	return true;
};

/**
	Remove a core keyframe from the core track.<br />
	This function removes a core keyframe from the core track instance.
	@param {number} index The index of the core keyframe to be removed.
*/
Cal3D.CalCoreTrack.prototype.removeCoreKeyFrame = function(index) {
	this.m_keyframes.splice(index, 1);
};

/**
	Scale the core track.<br />
	This function rescale all the data that are in the core track instance.
	@param {number} factor The scale factor.
*/
Cal3D.CalCoreTrack.prototype.scale = function(factor) {
	for(var keyframeId=0; keyframeId<this.m_keyframes.length; keyframeId++) {
		this.m_keyframes[keyframeId].getTranslation().multScalarLocal(factor);
	}
};

/**
	@private
*/
Cal3D.CalCoreTrack.prototype.getUpperBound = function(time) {
	var lower = 0;
	var upper = this.m_keyframes.length - 1;

	while(lower < upper - 1) {
		var middle = (lower + upper) >> 1;

		if(time >= this.m_keyframes[middle].getTime()) {
			lower = middle;
		}
		else {
			upper = middle;
		}
	}

	return upper;
};
