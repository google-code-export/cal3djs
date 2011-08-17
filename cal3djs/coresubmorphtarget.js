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
	@class CalCoreSubMorphTarget
*/
Cal3D.CalCoreSubMorphTarget = function() {
	this.m_vectorBlendVertex = [];
};

/**
	Get the number of blend vertices.<br />
	This function returns the number of blend vertices in the core sub morph target instance.
	@returns {number} The number of blend vertices.
*/
Cal3D.CalCoreSubMorphTarget.prototype.getBlendVertexCount = function() {
	return this.m_vectorBlendVertex.length;
};

/**
	Get the blend vertex list.<br />
	This function returns the list that contains all blend vertices of the core sub morph target instance.
	@returns {Array} The blend vertex list.
*/
Cal3D.CalCoreSubMorphTarget.prototype.getVectorBlendVertex = function() {
	return this.m_vectorBlendVertex;
};

/**
	Allocate space for the blend vertices.<br />
	This function reserves space for the blend vertices of the core sub morph target instance.
	@param {number} blendVertexCount The number of blend vertices that this core sub morph target should holds.
	@returns {boolean} true if succeeded; false if any error happened. 
*/
Cal3D.CalCoreSubMorphTarget.prototype.reserve = function(blendVertexCount) {
	this.m_vectorBlendVertex = new Array(blendVertexCount);
	return true;
};

/**
	Set a blend vertex.<br />
	This function sets a specified blend vertex in the core sub morph target instance.
	@param {number} blendVertexId The ID of the vertex.
	@param {Cal3D.CalCoreSubMorphTarget.BlendVertex} blendVertex The vertex to set.
	@returns {boolean} true if succeeded; false if the vertex does not exist.
*/
Cal3D.CalCoreSubMorphTarget.prototype.setBlendVertex = function(blendVertexId, blendVertex) {
	if(blendVertexId < 0 || blendVertexId >= this.m_vectorBlendVertex.length)
		return false;

	this.m_vectorBlendVertex[blendVertexId] = blendVertex;
	return true;
};



/**
	@class BlendVertex

	The blend vertex structure for the CalCoreSubMorphTarget class.
*/
Cal3D.CalCoreSubMorphTarget.BlendVertex = function() {
	this.position = new Cal3D.CalVector;
	this.normal = new Cal3D.CalVector;
};
