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
	@class CalCoreAnimation
*/
Cal3D.CalCoreAnimation = function() {
	this.m_listCallbacks = [];
	this.m_duration = 0;
	this.m_listCoreTrack = [];
	this.m_name = '';
	this.m_filename = '';
};

/**
	Adds a core track.<br />
	This function adds a core track to the core animation instance.
	@param {Cal3D.CalCoreTrack} coreTrack The core track to be added.
	@returns {boolean} false if error happened.
*/
Cal3D.CalCoreAnimation.prototype.addCoreTrack = function(coreTrack) {
	this.m_listCoreTrack.push(coreTrack);
	return true;
};

/**
	Get a core track.<br />
	This function returns the core track for a given core bone ID.
	@param {number}  coreBoneId The core bone ID of the core track that should be returned.
	@returns {Cal3D.CalCoreTrack} The core track instance. null if the core track does not exist. 
*/
Cal3D.CalCoreAnimation.prototype.getCoreTrack = function(coreBoneId) {
	// loop through all core tracks
	for(var iCoreTrack=0; iCoreTrack<this.m_listCoreTrack.length; iCoreTrack++) {
		// get the core track
		var coreTrack = this.m_listCoreTrack[iCoreTrack];

		// check if we found the matching core bone
		if(coreTrack.getCoreBoneId() == coreBoneId)
			return coreTrack;
	}

	// no match found
	return null;
};

/**
	Get the number of core tracks for this core animation.<br />
	This function returns the number of core tracks used for this core animation.
	@returns {number} The number of core tracks.
*/
Cal3D.CalCoreAnimation.prototype.getDuration = function() {
	return this.m_duration;
};

/**
	Set the duration.<br />
	This function sets the duration of the core animation instance.
	@param {number} duration The duration in seconds to be set.
*/
Cal3D.CalCoreAnimation.prototype.setDuration = function(duration) {
	this.m_duration = duration;
};

/**
	Scale the core animation.<br />
	This function rescale all the skeleton data that are in the core animation instance.
	@param {number} factor The scale factor.
*/
Cal3D.CalCoreAnimation.prototype.scale = function(factor) {
	// scale all core tracks
	for(var iCoreTrack=0; iCoreTrack<this.m_listCoreTrack.length; iCoreTrack++) {
		this.m_listCoreTrack[iCoreTrack].scale(factor);
	}
};

/**
	Set the name of the file in which the core animation is stored, if any.<br />
	@param {string} filename The file name.
*/
Cal3D.CalCoreAnimation.prototype.setFilename = function(filename) {
	this.m_filename = filename;
};

/**
	Get the name of the file in which the core animation is stored, if any.<br />
	@returns {string} The file name. An empty should be returned if the animation is not stored ina file.
*/
Cal3D.CalCoreAnimation.prototype.getFilename = function() {
	return this.m_filename;
};

/**
	Set the symbolic name of the core animation.<br />
	@param {string} name A symbolic name.
*/
Cal3D.CalCoreAnimation.prototype.setName = function(name) {
	this.m_name = name;
};

/**
	Get the symbolic name the core animation.<br />
	@returns {string} The symbolic name; An empty string will be returned if the symbolic name is not set yet.
*/
Cal3D.CalCoreAnimation.prototype.getName = function() {
	return this.m_name;
};

/**
	Add a callback to the current list of callbacks for this core animation.<br />
	@param {object} callback An object that implements the Cal3D.CalAnimationCallback interface.
	@param {number} min_interval Minimum interval (in seconds) between callbacks. Specifying 0 means call every update().
*/
Cal3D.CalCoreAnimation.prototype.registerCallback = function(callback, min_interval) {
	var record = new Cal3D.CalCoreAnimation.CallbackRecord;
	record.callback = callback;
	record.min_interval = min_interval;
	this.m_listCallbacks.push(record);
};

/**
	Remove a callback from the current list of callbacks for this core animation.<br />
	@param {object} callback The callback object to be removed.
*/
Cal3D.CalCoreAnimation.prototype.removeCallback = function(callback) {
	for(var i=0; i<this.m_listCallbacks.length; i++) {
		if(this.m_listCallbacks[i].callback == callback) {
			this.m_listCallbacks.splice(i, 1);
			return;
		}
	}
};

/**
	@private
*/
Cal3D.CalCoreAnimation.prototype.getCallbackList = function() {
	return this.m_listCallbacks;
};

/**
	Get the number of core tracks for this core animation.<br />
	This function returns the number of core tracks used for this core animation.
	@returns {number} The number of core tracks.
*/
Cal3D.CalCoreAnimation.prototype.getTrackCount = function() {
	return this.m_listCoreTrack.length;
};

/**
	Get the core track list.<br />
	This function returns the list that contains all core tracks of the core animation instance.
	@returns {Array} The core track list.
*/
Cal3D.CalCoreAnimation.prototype.getListCoreTrack = function() {
	return this.m_listCoreTrack;
};

/**
	Get the total number of core keyframes used for this animation.<br />
	This function returns the total number of core keyframes used for this animation instance (i.e.: the sum of all core keyframes of all core tracks).
	@returns {number} The number of core keyframes.
*/
Cal3D.CalCoreAnimation.prototype.getTotalNumberOfKeyframes = function() {
	var nbKeys = 0;
	for(var iCoreTrack=0; iCoreTrack<this.m_listCoreTrack.length; iCoreTrack++) {
		var coreTrack = this.m_listCoreTrack[iCoreTrack];
		nbKeys += coreTrack.getCoreKeyframeCount();
	}

	return nbKeys;
};

/**
	@private
*/
Cal3D.CalCoreAnimation.CallbackRecord = function() {
	this.callback = null;
	this.min_interval = 0;
};
