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
	@class CalCoreKeyframe
*/
Cal3D.CalCoreKeyframe = function() {
	this.m_time = 0;
	this.m_translation = new Cal3D.CalVector;
	this.m_rotation = new Cal3D.CalQuaternion;
};

/**
	Create the core keyframe instance<br />
	@returns {boolean} true if succeeded; false if failed.
*/
Cal3D.CalCoreKeyframe.prototype.create = function() {
	return true;
};

/**
	Destroy the core keyframe instance.
*/
Cal3D.CalCoreKeyframe.prototype.destroy = function() {
};

/**
	Get the rotation.<br />
	This function returns the rotation of the core keyframe instance.
	@returns {Cal3D.CalQuaternion} The rotation as quaternion.
*/
Cal3D.CalCoreKeyframe.prototype.getRotation = function() {
	return this.m_rotation;
};

/**
	Get the translation.<br />
	This function returns the translation of the core keyframe instance.
	@returns {Cal3D.CalVector} The translation as vector.
*/
Cal3D.CalCoreKeyframe.prototype.getTranslation = function() {
	return this.m_translation;
};

/**
	Get the time.<br />
	This function returns the time of the core keyframe instance.
	@returns {number} The time in seconds.
*/
Cal3D.CalCoreKeyframe.prototype.getTime = function() {
	return this.m_time;
};

/**
	Set the rotation.<br />
	This function sets the rotation of the core keyframe instance.
	@param {Cal3D.CalQuaternion} rotation The rotation to be set.
*/
Cal3D.CalCoreKeyframe.prototype.setRotation = function(rotation) {
	this.m_rotation.assign(rotation);
};

/**
	Set the translation.<br />
	This function sets the translation of the core keyframe instance.
	@param {Cal3D.CalVector} translation The translation to be set.
*/
Cal3D.CalCoreKeyframe.prototype.setTranslation = function(translation) {
	this.m_translation.assign(translation);
};

/**
	Set the time.<br />
	This function sets the time of the core keyframe instance.
	@param {number} time The time to be set in seconds.
*/
Cal3D.CalCoreKeyframe.prototype.setTime = function(time) {
	this.m_time = time;
};
