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
	@class CalCoreMesh
*/
Cal3D.CalCoreMesh = function() {
	this.m_vectorCoreSubmesh = [];
	this.m_name = '';
	this.m_filename = '';
};

/**
	Add a core submesh to the core mesh.<br />
	This function adds a core submesh to the core mesh instance.
	@param {Cal3D.CalCoreSubmesh} coreSubmesh The core submesh to be added.
	@returns {number} ID of the added submesh. 
*/
Cal3D.CalCoreMesh.prototype.addCoreSubmesh = function(coreSubmesh) {
	var submeshId = this.m_vectorCoreSubmesh.length;
	this.m_vectorCoreSubmesh.push(coreSubmesh);
	return submeshId;
};

/**
	Get a core submesh.<br />
	This function returns the core submesh with the given ID.
	@param {number} coreSubmeshId ID of the core submesh.
	@returns {Cal3D.CalCoreSubmesh} The core submesh instance; null if the core submesh does not exist.
*/
Cal3D.CalCoreMesh.prototype.getCoreSubmesh = function(coreSubmeshId) {
	if(coreSubmeshId < 0 || coreSubmeshId >= this.m_vectorCoreSubmesh.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremesh.js');
		return null;
	}

	return this.m_vectorCoreSubmesh[coreSubmeshId];
};

/**
	Get the number of core submeshes.<br />
	This function returns the number of core submeshes in the core mesh instance.
	@returns {number} The number of core submeshes.
*/
Cal3D.CalCoreMesh.prototype.getCoreSubmeshCount = function() {
	return this.m_vectorCoreSubmesh.length;
};

/**
	Get the core submesh array.<br />
	This function returns the array that contains all core submeshes of the core mesh instance.
	@returns {Array} The core submeshes array.
*/
Cal3D.CalCoreMesh.prototype.getVectorCoreSubmesh = function() {
	return this.m_vectorCoreSubmesh;
};

/**
	Add a blend target.<br />
	This function adds a core mesh as a blend target. <br />
	It adds appropriate CalCoreSubMorphTargets to each of the core submeshes.
	@param {Cal3D.CalCoreMesh} the core mesh that should become a blend target.
	@returns {number} ID of the added blend target; -1 if any error happened.
*/
Cal3D.CalCoreMesh.prototype.addAsMorphTarget = function(coreMesh) {
	/*
		Check if the numbers of vertices allow a blending
	*/

	var otherVectorCoreSubmesh = coreMesh.getVectorCoreSubmesh();
	if(this.m_vectorCoreSubmesh.length != otherVectorCoreSubmesh.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INTERNAL, 'coremesh.js');
		return -1;
	}
	if(this.m_vectorCoreSubmesh.length == 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INTERNAL, 'coremesh.js');
		return -1;
	}

	var submeshId = 0;
	var subMorphTargetId = this.m_vectorCoreSubmesh[submeshId].getCoreSubMorphTargetCount();
	while(submeshId < this.m_vectorCoreSubmesh.length) {
		if(this.m_vectorCoreSubmesh[submeshId].getVertexCount() != otherVectorCoreSubmesh[submeshId].getVertexCount()) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INTERNAL, 'coremesh.js');
			return -1;
		}
		submeshId++;
	}

	/* 
		Add the blend targets to each of the core sub meshes
	*/

	submeshId = 0;
	while(submeshId < this.m_vectorCoreSubmesh.length) {
		var vertexCount = otherVectorCoreSubmesh[submeshId].getVertexCount();
		var coreSubMorphTarget = new Cal3D.CalCoreSubMorphTarget;
		if(!coreSubMorphTarget.reserve(vertexCount))
			return -1;

		var vectorVertex = otherVectorCoreSubmesh[submeshId].getVectorVertex();
		var vertexId = 0;
		for(var i=0; i<vertexCount; i++) {
			var blendVertex = new Cal3D.CalCoreSubMorphTarget.BlendVertex;
			blendVertex.position.assign(vectorVertex[vertexId].position);
			blendVertex.normal.assign(vectorVertex[vertexId].normal);
			if(!coreSubMorphTarget.setBlendVertex(i, blendVertex))
				return -1;

			vertexId++;
		}

		this.m_vectorCoreSubmesh[submeshId].addCoreSubMorphTarget(coreSubMorphTarget);
		submeshId++;
	}

	return subMorphTargetId;
};

/**
	Scale the Mesh.<br />
	This function rescale all the data that are in the core mesh instance.
	@param {number} factor The scale factor.
*/
Cal3D.CalCoreMesh.prototype.scale = function(factor) {
	for(var submeshId=0; submeshId<this.m_vectorCoreSubmesh.length; submeshId++) {
		this.m_vectorCoreSubmesh[submeshId].scale(factor);
	}
};

/**
	Set the name of the file in which the core mesh is stored, if any.<br />
	@param {string} filename The file name.
*/
Cal3D.CalCoreMesh.prototype.setFilename = function(filename) {
	this.m_filename = filename;
};

/**
	Get the name of the file in which the core mesh is stored, if any.<br />
	@returns {string} The file name. An empty string will be returned if the mesh is not stored in a file.
*/
Cal3D.CalCoreMesh.prototype.getFilename = function() {
	return this.m_filename;
};

/**
	Set the symbolic name of the core mesh.<br />
	@param {string} name The symbolic name to be set.
*/
Cal3D.CalCoreMesh.prototype.setName = function(name) {
	this.m_name = name;
};

/**
	Get the symbolic name of the core mesh.<br />
	@returns {string} The symbolic name of the core mesh. an empty string will be returned if the symbolic name is not set yet.
*/
Cal3D.CalCoreMesh.prototype.getName = function() {
	return this.m_name;
};
