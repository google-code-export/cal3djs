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
	@class CalSubmesh
*/
Cal3D.CalSubmesh = function(coreSubmesh) {
	this.m_coreSubmesh = coreSubmesh;
	this.m_vectorMorphTargetWeight = new Array(coreSubmesh.getCoreSubMorphTargetCount());
	this.m_vectorVertex = [];
	this.m_vectorNormal = [];
	this.m_vectorvectorTangentSpace = [];
	this.m_vectorFace = new Array(coreSubmesh.getFaceCount());
	this.m_vectorPhysicalProperty = [];
	this.m_vertexCount = 0;
	this.m_faceCount = 0;
	this.m_coreMaterialId = -1;
	this.m_bInternalData = false;

	// initialize faces
	for(var faceId=0; faceId<this.m_vectorFace.length; faceId++) {
		this.m_vectorFace[faceId] = new Cal3D.CalSubmesh.Face;
	}

	// set the initial lod level
	this.setLodLevel(1);

	// set the initial morph target weights
	var morphTargetCount = coreSubmesh.getCoreSubMorphTargetCount();
	for(var morphTargetId=0; morphTargetId<morphTargetCount; morphTargetId++) {
		this.m_vectorMorphTargetWeight[morphTargetId] = 0;
	}

	// check if the submesh instance must handle the vertex and normal data internally
	if(coreSubmesh.getSpringCount() > 0) {
		var vertexCount = coreSubmesh.getVertexCount();

		this.m_vectorVertex = new Array(vertexCount);
		this.m_vectorNormal = new Array(vertexCount);

		this.m_vectorvectorTangentSpace = new Array(coreSubmesh.getVectorVectorTangentSpace().length);

		this.m_vectorPhysicalProperty = new Array(vertexCount);

		// get the vertex vector of the core submesh
		var vectorVertex = coreSubmesh.getVectorVertex();

		// copy the data from the core submesh as default values
		for(var vertexId=0; vertexId<vertexCount; vertexId++) {
			// copy the vertex data
			this.m_vectorVertex[vertexId] = new Cal3D.CalVector(vectorVertex[vertexId].position);
			var physicalProperty = new Cal3D.CalSubmesh.PhysicalProperty;
			physicalProperty.position.assign(vectorVertex[vertexId].position);
			physicalProperty.positionOld.assign(vectorVertex[vertexId].position);
			this.m_vectorPhysicalProperty[vertexId] = physicalProperty;

			// copy the normal data
			this.m_vectorNormal[vertexId] = new Cal3D.CalVector(vectorVertex[vertexId].normal);
		}

		this.m_bInternalData = true;
	}
};

/**
	Get the core submesh.<br />
	This function returns the core submesh on which this submesh instance is based on.
	@returns {Cal3D.CalCoreSubmesh} The core submesh.
*/
Cal3D.CalSubmesh.prototype.getCoreSubmesh = function() {
	return this.m_coreSubmesh;
};

/**
	Get the core material ID.<br />
	This function returns the core material ID of the submesh instance.
	@returns {number} The ID of the core material.
*/
Cal3D.CalSubmesh.prototype.getCoreMaterialId = function() {
	return this.m_coreMaterialId;
};

/**
	Get the number of faces.<br />
	This function returns the number of faces in the submesh instance.
	@returns {number} The number of faces.
*/
Cal3D.CalSubmesh.prototype.getFaceCount = function() {
	return this.m_faceCount;
};

/**
	Get the face data.<br />
	This function returns the face data (vertex indices) of the submesh instance. The LOD setting of the submesh instance is taken into account.
	@param {Array} faceBuffer The user-provided buffer where the face data is written to. This is an output parameter.
	@returns {number} The number of faces written to the buffer.
*/
Cal3D.CalSubmesh.prototype.getFaces = function(faceBuffer) {
	// copy the face vector to the face buffer
	for(var i=0, j=0; i<this.m_faceCount; i++, j+=3) {
		var faceVertId = this.m_vectorFace[i].vertexId;
		faceBuffer[j    ] = faceVertId[0];
		faceBuffer[j + 1] = faceVertId[1];
		faceBuffer[j + 2] = faceVertId[2];
	}

	return this.m_faceCount;
};

/**
	Get the normal list.<br />
	This function returns the list that contains all normals of the submesh instance.
	@returns {Array} The normal list.
*/
Cal3D.CalSubmesh.prototype.getVectorNormal = function() {
	return this.m_vectorNormal;
};

/**
	Get the list of the tangent space lists.<br />
	This function returns the list that contains all tangent space bases of the submesh instance. This list contains another list 
	because there can be more than one texture map at each vertex.
	@returns {Array} The  list of the tangent space lists.
*/
Cal3D.CalSubmesh.prototype.getVectorVectorTangentSpace = function() {
	return this.m_vectorvectorTangentSpace;
};

/**
	Get the physical property list.<br />
	This function returns the list that contains all physical properties of the submesh instance.
	@returns {Array} The physical property list.
*/
Cal3D.CalSubmesh.prototype.getVectorPhysicalProperty = function() {
	return this.m_vectorPhysicalProperty;
};

/**
	Get the vertex list.<br />
	This function returns the list that contains all vertices of the submesh instance.
	@returns {Array} The vertex list.
*/
Cal3D.CalSubmesh.prototype.getVectorVertex = function() {
	return this.m_vectorVertex;
};

/**
	Get the number of vertices.<br />
	This function returns the number of vertices in the submesh instance.
	@returns {number} The number of vertices.
*/
Cal3D.CalSubmesh.prototype.getVertexCount = function() {
	return this.m_vertexCount;
};

/**
	Check if the submesh instance handles vertex data internally.<br />
	This function returns wheter the submesh instance handles vertex data internally.
	@returns {boolean} Whether the submesh instance handles vertex data internally.
*/
Cal3D.CalSubmesh.prototype.hasInternalData = function() {
	return this.m_bInternalData;
};

/**
	Disable internal data (and thus springs system).
*/
Cal3D.CalSubmesh.prototype.disableInternalData = function() {
	if(this.m_bInternalData) {
		this.m_vectorVertex = [];
		this.m_vectorNormal = [];
		this.m_vectorvectorTangentSpace = [];
		this.m_vectorPhysicalProperty = [];
		this.m_bInternalData = false;
	}
};

/**
	Set the ID of the core material.<br />
	This function sets the core material ID of the submesh instance.
	@param {number} coreMaterialId The core material ID to be set.
*/
Cal3D.CalSubmesh.prototype.setCoreMaterialId = function(coreMaterialId) {
	this.m_coreMaterialId = coreMaterialId;
};

/**
	Set the current LOD level.<br />
	This function sets the current LOD level of the submesh instance.
	@param {number} lodLevel The LOD level in the range [0.0, 1.0].
*/
Cal3D.CalSubmesh.prototype.setLodLevel = function(lodLevel) {
	// clamp the lod level to [0.0, 1.0]
	if(lodLevel < 0) 
		lodLevel = 0;
	if(lodLevel > 1) 
		lodLevel = 1;

	// get the lod count of the core submesh
	var lodCount = this.m_coreSubmesh.getLodCount();

	// calculate the target lod count
	lodCount = ~~((1 - lodLevel) * lodCount);

	// calculate the new number of vertices
	this.m_vertexCount = this.m_coreSubmesh.getVertexCount() - lodCount;

	// get face vector of the core submesh
	var vectorFace = this.m_coreSubmesh.getVectorFace();

	// get face vector of the core submesh
	var vectorVertex = this.m_coreSubmesh.getVectorVertex();

	// calculate the new number of faces
	this.m_faceCount = vectorFace.length;

	for(var vertexId=vectorVertex.length-1; vertexId>=this.m_vertexCount; vertexId--) {
		this.m_faceCount -= vectorVertex[vertexId].faceCollapseCount;
	}

	// fill the face vector with the collapsed vertex ids
	for(var faceId=0; faceId<this.m_faceCount; faceId++) {
		for(var vertexId=0; vertexId<3; vertexId++) {
			// get the vertex id
			var collapsedVertexId = vectorFace[faceId].vertexId[vertexId];

			// collapse the vertex id until it fits into the current lod level
			// FIXME: this may cause an infinit loop
			while(collapsedVertexId >= this.m_vertexCount) {
				collapsedVertexId = vectorVertex[collapsedVertexId].collapseId;
			}

			// store the collapse vertex id in the submesh face vector
			this.m_vectorFace[faceId].vertexId[vertexId] = collapsedVertexId;
		}
	}
};

/**
	Check if tangent vectors are enabled.<br />
	This function returns true if the submesh contains tangent vectors.
	@param {number} mapId The ID of the texture map.
	@returns {boolean} Whether the tangent vectors are enabled.
*/
Cal3D.CalSubmesh.prototype.isTangentsEnabled = function(mapId) {
	return this.m_coreSubmesh.isTangentsEnabled(mapId);
};

/**
	Enable (and calculate) or disable the storage of tangent spaces.<br />
	This function enables or disables the storage of tangent space bases.
	@param {number} mapId The ID of the texture map.
	@param {boolean} enabled Set to true to enable the tangent spaces, false to disable it.
	@returns {boolean} true if succeeded; false if any error happened.
*/
Cal3D.CalSubmesh.prototype.enableTangents = function(mapId, enabled) {
	if(!this.m_coreSubmesh.enableTangents(mapId, enabled))
		return false;

	if(!this.m_bInternalData)
		return true;

	if(!enabled) {
		this.m_vectorvectorTangentSpace[mapId] = [];
		return true;
	}

	this.m_vectorvectorTangentSpace[mapId] = new Array(this.m_coreSubmesh.getVertexCount());

	// get the tangent space vector of the core submesh
	var vectorTangentSpace = this.m_coreSubmesh.getVectorVectorTangentSpace()[mapId];

	// copy the data from the core submesh as default values
	var vertexCount = this.m_coreSubmesh.getVertexCount();
	for(var vertexId=0; vertexId<vertexCount; vertexId++) {
		// copy the tangent space data
		var tangentSpace = new Cal3D.CalSubmesh.TangentSpace();
		tangentSpace.tangent.assign(vectorTangentSpace[vertexId].tangent);
		tangentSpace.crossFactor = vectorTangentSpace[vertexId].crossFactor;
		this.m_vectorvectorTangentSpace[mapId][vertexId] = tangentSpace;
	}

	return true;
};

Cal3D.CalSubmesh.prototype.getVectorWeight = function() {
	throw 'not implemented error';
};

/**
	Set weight of a morph target with the given ID.<br />
	@param {number} blendId The morph target ID.
	@param {number} weight The weight to be set.
*/
Cal3D.CalSubmesh.prototype.setMorphTargetWeight = function(blendId, weight) {
	this.m_vectorMorphTargetWeight[blendId] = weight;
};

/**
	Get eight of a morph target with the given ID.<br />
	@param {number} blendId The morph target ID.
	@returns {number} The weight of the morph target.
*/
Cal3D.CalSubmesh.prototype.getMorphTargetWeight = function(blendId) {
	return this.m_vectorMorphTargetWeight[blendId];
};

/**
	Get weight of the base vertices.<br />
	@returns {number} The weight of the base vertices.
*/
Cal3D.CalSubmesh.prototype.getBaseWeight = function() {
	var baseWeight = 1;
	var morphTargetCount = this.getMorphTargetWeightCount();
	for(var morphTargetId=0; morphTargetId<morphTargetCount; morphTargetId++) {
		baseWeight -= this.m_vectorMorphTargetWeight[morphTargetId];
	}

	return baseWeight;
};

/**
	Get the number of weights.<br />
	This function returns the number of weights.
	@returns {number} The number of weights.
*/
Cal3D.CalSubmesh.prototype.getMorphTargetWeightCount = function() {
	return this.m_vectorMorphTargetWeight.length;
};

/**
	Get the morph target weight list.<br />
	This function returns the list that contains all weights for each morph target instance.
	@returns {Array} The morph target weight list.
*/
Cal3D.CalSubmesh.prototype.getVectorMorphTargetWeight = function() {
	return this.m_vectorMorphTargetWeight;
};



/**
	@class PhysicalProperty

	The physical property structure for the CalSubmesh class.
*/
Cal3D.CalSubmesh.PhysicalProperty = function() {
	this.position = new Cal3D.CalVector;
	this.positionOld = new Cal3D.CalVector;
	this.force = new Cal3D.CalVector;
};



/**
	@class TangentSpace

	The tangent space structure for the CalSubmesh class.
*/
Cal3D.CalSubmesh.TangentSpace = function() {
	this.tangent = new Cal3D.CalVector;;
	this.crossFactor = 0;
};



/**
	@class Face

	The face structure for the CalSubmesh class.
*/
Cal3D.CalSubmesh.Face = function() {
	this.vertexId = [0, 0, 0];
};
