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
	@class CalMesh
*/
Cal3D.CalMesh = function(coreMesh) {
	this.m_model = null;
	this.m_coreMesh = coreMesh;
	this.m_vectorSubmesh = []

	// clone the mesh structure of the core mesh
	var vectorCoreSubmesh = coreMesh.getVectorCoreSubmesh();

	// get the number of submeshes
	var submeshCount = vectorCoreSubmesh.length;

	// clone every core submesh
	for(var submeshId=0; submeshId<submeshCount; submeshId++) {
		this.m_vectorSubmesh.push(new Cal3D.CalSubmesh(vectorCoreSubmesh[submeshId]));
	}
};

/**
	Get the core mesh.<br />
	This function returns the core mesh on which this mesh instance is based on.
	@returns {Cal3D.CalCoreMesh} The core mesh.
*/
Cal3D.CalMesh.prototype.getCoreMesh = function() {
	return this.m_coreMesh;
};

/**
	Get a submesh.<br />
	his function returns the submesh with the given ID.
	@param {number} submeshId The ID of the submesh.
	@returns {Cal3D.CalSubmesh} The submesh; null if it does not exist. 
*/
Cal3D.CalMesh.prototype.getSubmesh = function(submeshId) {
	if(submeshId < 0 || submeshId >= this.m_vectorSubmesh.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'mesh.js');
		return null;
	}

	return this.m_vectorSubmesh[submeshId];
};

/**
	Get the number of submeshes.<br />
	This function returns the number of submeshes in the mesh instance.
	@returns {number} The number of submeshes.
*/
Cal3D.CalMesh.prototype.getSubmeshCount = function() {
	return this.m_vectorSubmesh.length;
};

/**
	Get the submesh list.<br />
	This function returns the list that contains all submeshes of the mesh instance.
	@returns {Array} The submesh list.
*/
Cal3D.CalMesh.prototype.getVectorSubmesh = function() {
	return this.m_vectorSubmesh;
};

/**
	Set the current LOD level.<br />
	This function sets the current LOD level of the mesh instance.
	@param {number} lodLevel The LOD level in the range [0.0, 1.0].
*/
Cal3D.CalMesh.prototype.setLodLevel = function(lodLevel) {
	// change lod level of each submesh
	for(var submeshId=0; submeshId<this.m_vectorSubmesh.length; submeshId++) {
		// set the lod level in the submesh
		this.m_vectorSubmesh[submeshId].setLodLevel(lodLevel);
	}
};

/**
	Set the material set.<br />
	This function sets the material set of the mesh instance.
	@param {number} setId The ID of the material set.
*/
Cal3D.CalMesh.prototype.setMaterialSet = function(setId) {
	// change material of each submesh
	for(var submeshId=0; submeshId<this.m_vectorSubmesh.length; submeshId++) {
		// get the core material thread id of the submesh
		var coreMaterialThreadId = this.m_vectorSubmesh[submeshId].getCoreSubmesh().getCoreMaterialThreadId();

		// get the core material id for the given set id in the material thread
		var coreMaterialId = this.m_model.getCoreModel().getCoreMaterialId(coreMaterialThreadId, setId);

		// set the new core material id in the submesh
		this.m_vectorSubmesh[submeshId].setCoreMaterialId(coreMaterialId);
	}
};

/**
	Set the model.<br />
	This function sets the model to which the mesh instance is attached to.
	@param {Cal3D.CalModel} model The model to which the mesh instance should be attached to.
*/
Cal3D.CalMesh.prototype.setModel = function(model) {
	this.m_model = model;
};

/**
	Disable internal data (and thus springs system).
*/
Cal3D.CalMesh.prototype.disableInternalData = function() {
	// disable internal data of each submesh
	for(var submeshId=0; submeshId<this.m_vectorSubmesh.length; submeshId++) {
		// disable internal data of the submesh
		this.m_vectorSubmesh[submeshId].disableInternalData();
	}
};
