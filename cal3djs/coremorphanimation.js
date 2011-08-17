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
	@class CalCoreMorphAnimation
*/
Cal3D.CalCoreMorphAnimation = function() {
	this.m_vectorCoreMeshID = [];
	this.m_vectorMorphTargetID = [];
};

/**
	Add a core mesh ID and a morph target ID of that core mesh.<br />
	@param {number} coreMeshID The core mesh ID to be added.
	@param {number} morphTargetID The morph target ID to be added.
	@returns {boolean} true if succeeded; false if any error happened.
*/
Cal3D.CalCoreMorphAnimation.prototype.addMorphTarget = function(coreMeshID, morphTargetID) {
	this.m_vectorCoreMeshID.push(coreMeshID);
	this.m_vectorMorphTargetID.push(morphTargetID);
	return true;
};

/**
	Get the core mesh ID list.<br />
	This function returns the list that contains all core mesh IDs of the core morph animation instance.
	@returns {Array} The the core mesh ID list.
*/
Cal3D.CalCoreMorphAnimation.prototype.getVectorCoreMeshID = function() {
	return this.m_vectorCoreMeshID;
};

/**
	Get the morph target ID list.<br />
	This function returns the list that contains all morph target  IDs of the core morph animation instance.
	@returns {Array} The morph target ID list.
*/
Cal3D.CalCoreMorphAnimation.prototype.getVectorMorphTargetID = function() {
	return this.m_vectorMorphTargetID;
};
