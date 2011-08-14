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
	@class CalCoreSubmesh
*/
Cal3D.CalCoreSubmesh = function() {
	this.m_vectorVertex = [];
	this.m_vectorTangentsEnabled = [];
	this.m_vectorvectorTangentSpace = [];
	this.m_vectorvectorTextureCoordinate = [];
	this.m_vectorPhysicalProperty = [];
	this.m_vectorFace = [];
	this.m_vectorSpring = [];
	this.m_vectorCoreSubMorphTarget = [];
	this.m_coreMaterialThreadId = 0;
	this.m_lodCount = 0;
};

/**
	Get the ID of the core material thread.<br />
	This function returns the ID of the core material thread of this core submesh instance.
	@returns {number} The ID of the core material thread.
*/
Cal3D.CalCoreSubmesh.prototype.getCoreMaterialThreadId = function() {
	return this.m_coreMaterialThreadId;
};

/**
	Get the number of faces.<br />
	This function returns the number of faces in the core submesh instance.
	@returns {number} The number of faces.
*/
Cal3D.CalCoreSubmesh.prototype.getFaceCount = function() {
	return this.m_vectorFace.length;
};

/**
	Get the number of LOD steps.<br />
	This function returns the number of LOD steps in the core submesh instance.
	@returns {number} The number of LOD steps.
*/
Cal3D.CalCoreSubmesh.prototype.getLodCount = function() {
	return this.m_lodCount;
};

/**
	Get the number of springs.<br />
	This function returns the number of springs in the core submesh instance.
	@returns {number} The number of springs.
*/
Cal3D.CalCoreSubmesh.prototype.getSpringCount = function() {
	return this.m_vectorSpring.length;
};

/**
	Get the face list.<br />
	This function returns the list that contains all faces of the core submesh instance.
	@returns {Array} The face list.
*/
Cal3D.CalCoreSubmesh.prototype.getVectorFace = function() {
	return this.m_vectorFace;
};

/**
	Get the physical property list.<br />
	This function returns the list that contains all physical properties of the core submesh instance.
	@returns {Array} The physical property list.
*/
Cal3D.CalCoreSubmesh.prototype.getVectorPhysicalProperty = function() {
	return this.m_vectorPhysicalProperty;
};

/**
	Get the spring list.<br />
	This function returns the list that contains all springs of the core submesh instance.
	@returns {Array} The spring list.
*/
Cal3D.CalCoreSubmesh.prototype.getVectorSpring = function() {
	return this.m_vectorSpring;
};

/**
	Get list of the tangent space lists.<br />
	This function returns the list that contains all tangent space bases of the core submesh instance. This list contains 
	another list because there can be more than one texture map for each vertex.
	@returns {Array} The list of the tangent space lists
*/
Cal3D.CalCoreSubmesh.prototype.getVectorVectorTangentSpace = function() {
	return this.m_vectorvectorTangentSpace;
};

/**
	Get list of the texture coordinate lists.<br />
	This function returns the list that contains all texture coordinate vectors of the core submesh instance. This list contains 
	another list because there can be more than one texture map for each vertex.
	@returns {Array} The list of the texture coordinate lists.
*/
Cal3D.CalCoreSubmesh.prototype.getVectorVectorTextureCoordinate = function() {
	return this.m_vectorvectorTextureCoordinate;
};

/**
	Get the vertex list.<br />
	This function returns the vector that contains all vertices of the core submesh instance.
	@returns {Array} The vertex list.
*/
Cal3D.CalCoreSubmesh.prototype.getVectorVertex = function() {
	return this.m_vectorVertex;
};

/**
	Get the number of vertices.<br />
	This function returns the number of vertices in the core submesh instance.
	@returns {number} The number of vertices.
*/
Cal3D.CalCoreSubmesh.prototype.getVertexCount = function() {
	return this.m_vectorVertex.length;
};

/**
	See if tangent lists are enabled.<br />
	This function returns true if the core submesh contains tangent lists.
	@param {number} mapId The ID of the texture map.
	@returns {boolean} true if tangent lists are enabled for the given map; false if not.
*/
Cal3D.CalCoreSubmesh.prototype.isTangentsEnabled = function(mapId) {
	if(mapId < 0 || mapId >= this.m_vectorTangentsEnabled.length)
		return false;

	return this.m_vectorTangentsEnabled[mapId];
};

/**
	Enable (and calculate) or disable the storage of tangent spaces.<br />
	@param {number} mapId The ID of the texture map.
	@param {boolean} enabled Whether the storage of tangent spaces should be enabled.
	@returns {boolean} true if succeeded; false if failed.
*/
Cal3D.CalCoreSubmesh.prototype.enableTangents = function(mapId, enabled) {
	if(mapId < 0 || mapId >= this.m_vectorTangentsEnabled.length)
		return false;

	this.m_vectorTangentsEnabled[mapId] = enabled;

	if(!enabled) {
		this.m_vectorvectorTangentSpace[mapId] = [];
		return true;
	}

	this.m_vectorvectorTangentSpace[mapId] = new Array(this.m_vectorVertex.length);

	for(var tangentId=0; tangentId<this.m_vectorvectorTangentSpace[mapId].length; tangentId++) {
		this.m_vectorvectorTangentSpace[mapId][tangentId] = new Cal3D.CalCoreSubmesh.TangentSpace;
	}

	for(var faceId=0; faceId<this.m_vectorFace.length; faceId++) {
		this.UpdateTangentVector(this.m_vectorFace[faceId].vertexId[0], this.m_vectorFace[faceId].vertexId[1], this.m_vectorFace[faceId].vertexId[2], mapId);
		this.UpdateTangentVector(this.m_vectorFace[faceId].vertexId[1], this.m_vectorFace[faceId].vertexId[2], this.m_vectorFace[faceId].vertexId[0], mapId);
		this.UpdateTangentVector(this.m_vectorFace[faceId].vertexId[2], this.m_vectorFace[faceId].vertexId[0], this.m_vectorFace[faceId].vertexId[1], mapId);
	}

	for(var tangentId=0; tangentId<this.m_vectorvectorTangentSpace[mapId].length; tangentId++) {
		this.m_vectorvectorTangentSpace[mapId][tangentId].tangent.normalize();
	}

	return true;
};

/**
	Allocate space for the vertices, faces and texture coordinates and springs.<br />
	This function reserves space for the vertices, faces, texture coordinates and springs of the core submesh instance.
	@param {number} vertexCount The number of vertices that this core submesh should hold.
	@param {number} textureCoordinateCount The number of texture coordinates that this core submesh should hold.
	@param {number} faceCount The number of faces that this core submesh should hold.
	@param {number} springCount The number of springs that this core submesh should hold.
	@returns {boolean} true if succeeded; false if failed.
*/
Cal3D.CalCoreSubmesh.prototype.reserve = function(vertexCount, textureCoordinateCount, faceCount, springCount) {
	/*
		reserve the space needed in all the vectors
	*/

	this.m_vectorVertex = new Array(vertexCount);
	this.m_vectorTangentsEnabled = new Array(textureCoordinateCount);
	this.m_vectorvectorTangentSpace = new Array(textureCoordinateCount);
	this.m_vectorvectorTextureCoordinate = new Array(textureCoordinateCount);


	for(var textureCoordinateId=0; textureCoordinateId<textureCoordinateCount; textureCoordinateId++) {
		this.m_vectorvectorTextureCoordinate[textureCoordinateId] = new Array(vertexCount);

		if (this.m_vectorTangentsEnabled[textureCoordinateId])
			this.m_vectorvectorTangentSpace[textureCoordinateId] = new Array(vertexCount);
		else
			this.m_vectorvectorTangentSpace[textureCoordinateId] = [];
	}

	this.m_vectorFace = new Array(faceCount);
	this.m_vectorSpring = new Array(springCount);

	// reserve the space for the physical properties if we have springs in the core submesh instance
	if(springCount > 0)
		this.m_vectorPhysicalProperty = new Array(vertexCount);

	return true;
};

/**
	Set the ID of the core material thread.<br />
	This function sets the ID of the core material thread of the core submesh instance.
	@param {number} coreMaterialThreadId The ID of the core material thread to be set.
*/
Cal3D.CalCoreSubmesh.prototype.setCoreMaterialThreadId = function(coreMaterialThreadId) {
	this.m_coreMaterialThreadId = coreMaterialThreadId;
};

/**
	Set a specified face.<br />
	This function sets a specified face in the core submesh instance.
	@param {number} faceId The ID of the face.
	@param {Cal3D.CalCoreSubmesh.Face} face The face to set to the core submesh.
	@returns {boolean} true if succeeded; false if the face does not exist.
*/
Cal3D.CalCoreSubmesh.prototype.setFace = function(faceId, face) {
	if(faceId < 0 || faceId >= this.m_vectorFace.length)
		return false;

	this.m_vectorFace[faceId] = face;
	return true;
};

/**
	Set the number of LOD steps.<br />
	This function sets the number of LOD steps of the core submesh instance.
	@param {number} lodCount The number of LOD steps to be set.
*/
Cal3D.CalCoreSubmesh.prototype.setLodCount = function(lodCount) {
	this.m_lodCount = lodCount;
};

/**
	Set a specified physical property.<br />
	This function sets a specified physical property in the core submesh instance.
	@param {number} vertexId The ID of the vertex.
	@param {Cal3D.CalCoreSubmesh.PhysicalProperty} physicalProperty The physical property to be set.
	@returns {boolean} true if succeeded; false if the physical property does not exist.
*/
Cal3D.CalCoreSubmesh.prototype.setPhysicalProperty = function(vertexId, physicalProperty) {
	if(vertexId < 0 || vertexId >= this.m_vectorPhysicalProperty.length)
		return false;

	this.m_vectorPhysicalProperty[vertexId] = physicalProperty;
	return true;
};

/**
	Set a specified spring.<br />
	This function sets a specified spring in the core submesh instance.
	@param {number} springId The ID of the spring.
	@param {Cal3D.CalCoreSubmesh.Spring} spring The spring to be set.
	@returns {boolean} true if succeeded; false if the spring does not exist.
*/
Cal3D.CalCoreSubmesh.prototype.setSpring = function(springId, spring) {
	if(springId < 0 || springId >= this.m_vectorSpring.length)
		return false;

	this.m_vectorSpring[springId] = spring;
	return true;
};

/**
	Set the tangent vector associated with a specified texture coordinate pair.<br />
	This function sets the tangent vector associated with a specified texture coordinate pair in the core submesh instance.
	@param {number} vertexId The ID of the vertex.
	@param {number} textureCoordinateId The ID of the texture coordinate channel.
	@param {Cal3D.CalVector} tangent The tangent vector to be stored.
	@param {number} crossFactor The cross-product factor to be stored.
	@returns {boolean} true if succeeded; false if any error happened.
*/
Cal3D.CalCoreSubmesh.prototype.setTangentSpace = function(vertexId, textureCoordinateId, tangent, crossFactor) {
	if(vertexId < 0 || vertexId >= this.m_vectorVertex.length) 
		return false;
	if(textureCoordinateId < 0 || textureCoordinateId >= this.m_vectorvectorTextureCoordinate.length) 
		return false;
	if(!this.m_vectorTangentsEnabled[textureCoordinateId]) 
		return false;

	//this.m_vectorvectorTangentSpace[textureCoordinateId][vertexId].tangent = tangent;
	this.m_vectorvectorTangentSpace[textureCoordinateId][vertexId].tangent.assign(tangent);
	this.m_vectorvectorTangentSpace[textureCoordinateId][vertexId].crossFactor = crossFactor;

	return true;
};

/**
	Set a specified texture coordinate.<br />
	This function sets a specified texture coordinate in the core submesh instance.
	@param {number} vertexId The ID of the vertex.
	@param {number} textureCoordinateId The ID of the texture coordinate.
	@param {Cal3D.CalCoreSubmesh.TextureCoordinate} The texture coordinate to set.
	@returns {boolean} true if succeeded; false if the texture coordinate does not exist.
*/
Cal3D.CalCoreSubmesh.prototype.setTextureCoordinate = function(vertexId, textureCoordinateId, textureCoordinate) {
	if(textureCoordinateId < 0 || textureCoordinateId >= this.m_vectorvectorTextureCoordinate.length)
		return false;
	if(vertexId < 0 || vertexId >= this.m_vectorvectorTextureCoordinate[textureCoordinateId].length)
		return false;

	this.m_vectorvectorTextureCoordinate[textureCoordinateId][vertexId] = textureCoordinate;
	return true;
};

/**
	Set a vertex.<br />
	This function sets a specified vertex in the core submesh instance.
	@param {number} vertexId The ID of the vertex.
	@param {Cal3D.CalCoreSubmesh.Vertex} The vertex to set.
	@returns {boolean} true if succeeded; false if the vertex does not exist.
*/
Cal3D.CalCoreSubmesh.prototype.setVertex = function(vertexId, vertex) {
	if(vertexId < 0 || vertexId >= this.m_vectorVertex.length)
		return false;

	this.m_vectorVertex[vertexId] = vertex;
	return true;
};

/**
	Add a core sub morph target.<br />
	This function adds a core sub morph target to the core sub mesh instance.
	@param {Cal3D.CalCoreSubMorphTarget} coreSubMorphTarget The core sub morph target to be added.
	@returns {number} ID of the added core sub morph target.
*/
Cal3D.CalCoreSubmesh.prototype.addCoreSubMorphTarget = function(coreSubMorphTarget) {
	var subMorphTargetId = this.m_vectorCoreSubMorphTarget.length;
	this.m_vectorCoreSubMorphTarget.push(coreSubMorphTarget);
	return subMorphTargetId;
};

/**
	Get a core sub morph target.<br />
	This function returns the core sub morph target with the given ID.
	@param {number} subMorphTargetId The ID of the core sub morph target.
	@returns {Cal3D.CalCoreSubMorphTarget} The core sub morph target.
*/
Cal3D.CalCoreSubmesh.prototype.getCoreSubMorphTarget = function(subMorphTargetId) {
	if(subMorphTargetId < 0 || subMorphTargetId >= this.m_vectorCoreSubMorphTarget.length)
		return null;

	return this.m_vectorCoreSubMorphTarget[subMorphTargetId];
};

/**
	Get the number of core sub morph targets.<br />
	This function returns the number of core sub morph targets in the core sub mesh instance.
	@returns {number} The number of core sub morph targets. 
*/
Cal3D.CalCoreSubmesh.prototype.getCoreSubMorphTargetCount = function() {
	return this.m_vectorCoreSubMorphTarget.length;
};

/**
	Get the core sub morph target list.<br />
	This function returns the list that contains all core sub morph target of the core submesh instance.
	@returns {Array} The core sub morph target list.
*/
Cal3D.CalCoreSubmesh.prototype.getVectorCoreSubMorphTarget = function() {
	return this.m_vectorCoreSubMorphTarget;
};

/**
	Scale the core submesh.<br />
	This function rescale all the data that are in the core submesh instance.
	@param {number} factor The scale factor.
*/
Cal3D.CalCoreSubmesh.prototype.scale = function(factor) {
	// rescale all vertices
	for(var vertexId=0; vertexId<this.m_vectorVertex.length; vertexId++) {
		this.m_vectorVertex[vertexId].position.multScalarLocal(factor);
	}

	if(this.m_vectorSpring.length > 0) {
		// There is a problem when we resize and that there is
		// a spring system, I was unable to solve this
		// problem, so I disable the spring system
		// if the scale are too big
		if( Math.abs(factor - 1) > 0.1) {
			this.m_vectorSpring = [];
			this.m_vectorPhysicalProperty = [];
		}
	}
};

/**
	@private
*/
Cal3D.CalCoreSubmesh.prototype.UpdateTangentVector = function(v0, v1, v2, mapId) {
	var vvtx = this.getVectorVertex();
	var vtex = this.m_vectorvectorTextureCoordinate[mapId];

	// Step 1. Compute the approximate tangent vector.
	var du1 = vtex[v1].u - vtex[v0].u;
	var dv1 = vtex[v1].v - vtex[v0].v;
	var du2 = vtex[v2].u - vtex[v0].u;
	var dv2 = vtex[v2].v - vtex[v0].v;

	var prod1 = (du1*dv2-dv1*du2);
	var prod2 = (du2*dv1-dv2*du1);
	if (Math.abs(prod1) < 0.000001 || Math.abs(prod2) < 0.000001)
		return;

	var x = dv2 / prod1;
	var y = dv1 / prod2;

	var vec1 = Cal3D.vectorSub(vvtx[v1].position, vvtx[v0].position);
	var vec2 = Cal3D.vectorSub(vvtx[v2].position, vvtx[v0].position);
	var tangent = vec1.multScalarLocal(x).addLocal(vec2.multScalarLocal(y));

	// Step 2. Orthonormalize the tangent.
	var component = Cal3D.vectorDot(tangent, vvtx[v0].normal);
	tangent.subLocal(Cal3D.vectorScalarMult(vvtx[v0].normal, component));
	tangent.normalize();

	// Step 3: Add the estimated tangent to the overall estimate for the vertex.
	this.m_vectorvectorTangentSpace[mapId][v0].tangent.addLocal(tangent);
};



/**
	@class TextureCoordinate

	The texture coordinate structure for the CalCoreSubmesh class.
*/
Cal3D.CalCoreSubmesh.TextureCoordinate = function() {
	this.u = 0;
	this.v = 0;
};



/**
	@class TangentSpace

	The tangent space structure for the CalCoreSubmesh class.
*/
Cal3D.CalCoreSubmesh.TangentSpace = function() {
	this.tangent = new Cal3D.CalVector(0, 0, 0);
	this.crossFactor = 1;	// To get the binormal, use ((N x T) * crossFactor)
};



/**
	@class Influence

	The influence structure for the CalCoreSubmesh class.
*/
Cal3D.CalCoreSubmesh.Influence = function() {
	this.boneId = 0;
	this.weight = 0;
};



/**
	@class PhysicalProperty

	The physical property structure for the CalCoreSubmesh class.
*/
Cal3D.CalCoreSubmesh.PhysicalProperty = function() {
	this.weight = 0;
};



/**
	@class Vertex

	The vertex structure for the CalCoreSubmesh class.
*/
Cal3D.CalCoreSubmesh.Vertex = function() {
	this.position = new Cal3D.CalVector;
	this.normal = new Cal3D.CalVector;
	this.vectorInfluence = [];
	this.collapseId = 0;
	this.faceCollapseCount = 0;
};



/**
	@class Face 

	The face structure for the CalCoreSubmesh class.
*/
Cal3D.CalCoreSubmesh.Face = function() {
	this.vertexId = [0, 0, 0];
};



/**
	@class Spring

	The spring structure for the CalCoreSubmesh class.
*/
Cal3D.CalCoreSubmesh.Spring = function() {
	this.vertexId = [0, 0];
	this.springCoefficient = 0;
	this.idleLength = 0;
};
