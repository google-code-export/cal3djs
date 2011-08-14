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
	@class CalMorphTargetMixer
*/
Cal3D.CalMorphTargetMixer = function(model) {
	this.m_model = model;
	this.m_vectorCurrentWeight = [];
	this.m_vectorEndWeight = [];
	this.m_vectorDuration = [];

	var morphAnimationCount = model.getCoreModel().getCoreMorphAnimationCount();
	for(var i=0; i<morphAnimationCount; i++) {
		this.m_vectorCurrentWeight.push(0);
		this.m_vectorEndWeight.push(0);
		this.m_vectorDuration.push(0);
	}
};

/**
	Interpolate the weight of a morph target.<br />
	This function interpolates the weight of a morph target a new value in a given amount of time.
	@param {number} id The ID of the morph target to be blended.
	@param {number} weight  The weight to interpolate the morph target to.
	@param {number} delay The time in seconds until the new weight should be reached.
	@returns {boolean} true if succeeded; false if the morph target does not exist.
*/

Cal3D.CalMorphTargetMixer.prototype.blend = function(id, weight, delay) {
	if(id < 0 || id >= this.m_vectorCurrentWeight.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'morphtargetmixer.js');
		return false;
	}

	this.m_vectorEndWeight[id] = weight;
	this.m_vectorDuration[id] = delay;
	return true;
};

/**
	Fade a morph target out.<br />
	This function fades a morph target out in a given amount of time.
	@param {number} id The ID of the morph target to be faded out.
	@param {number} delay The time in seconds until the the morph target is completely removed.
	@returns {boolean} true if succeeded; false if the morph target does not exist.
*/

Cal3D.CalMorphTargetMixer.prototype.clear = function(id, delay) {
	if(id < 0 || id >= this.m_vectorCurrentWeight.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'morphtargetmixer.js');
		return false;
	}

	this.m_vectorEndWeight[id] = 0;
	this.m_vectorDuration[id] = delay;
	return true;
};

/**
	Get the weight of a morph target.<br />
	@param {number} id The ID of the morph target.
	@returns {number} The weight of the morph target.
*/

Cal3D.CalMorphTargetMixer.prototype.getCurrentWeight = function(id) {
	if(id < 0 || id >= this.m_vectorCurrentWeight.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'morphtargetmixer.js');
		return 0;
	}

	return this.m_vectorCurrentWeight[id];
};

/**
	Get the weight of the base vertices.<br />
	@returns {number} The weight of the base vertices.
*/
Cal3D.CalMorphTargetMixer.prototype.getCurrentWeightBase = function() {
	var currentWeight = 1;
	for(var i=0; i<this.m_vectorCurrentWeight.length; i++) {
		currentWeight -= this.m_vectorCurrentWeight[i];
	}

	return currentWeight;
};

/**
	Get the number of morph targets this morph target mixer mixes.<br />
	@returns {number} The number of morph targets this morph target mixer mixes.
*/
Cal3D.CalMorphTargetMixer.prototype.getMorphTargetCount = function() {
	return this.m_vectorCurrentWeight.length;
};

/**
	Update all morph targets.<br />
	This function updates all morph targets of the mixer instance for a given amount of time.
	@param {number} deltaTime The elapsed time in seconds since the last update.
*/
Cal3D.CalMorphTargetMixer.prototype.update = function(deltaTime) {
	for(var i=0; i<this.m_vectorCurrentWeight.length; i++) {
		var currentWeight = this.m_vectorCurrentWeight[i];
		var endWeight = this.m_vectorEndWeight[i];
		var duration = this.m_vectorDuration[i];

		if(deltaTime >= duration) {
			this.m_vectorCurrentWeight[i] = endWeight;
			this.m_vectorDuration[i] = 0;
		}
		else {
			this.m_vectorCurrentWeight[i] += (endWeight - currentWeight) * deltaTime / duration;
			this.m_vectorDuration[i] -= deltaTime;
		}
	}

	for(var morphAnimationID=0; morphAnimationID<this.m_vectorCurrentWeight.length; morphAnimationID++) {
		var coreMorphAnimation = this.m_model.getCoreModel().getCoreMorphAnimation(morphAnimationID);

		var vectorCoreMeshID = coreMorphAnimation.getVectorCoreMeshID();
		var vectorMorphTargetID = coreMorphAnimation.getVectorMorphTargetID();

		for(var i=0; i<vectorCoreMeshID.length; i++) {
			var vectorSubmesh = this.m_model.getMesh(vectorCoreMeshID[i]).getVectorSubmesh();

			var submeshCount = vectorSubmesh.length;
			for(var submeshId=0; submeshId<submeshCount; submeshId++) {
				vectorSubmesh[submeshId].setMorphTargetWeight(vectorMorphTargetID[i],  this.m_vectorCurrentWeight[morphAnimationID]);
			}
		}
	}
};
