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
	@class CalCoreModel
*/
Cal3D.CalCoreModel = function(name) {
	this.m_name = name;
	this.m_coreSkeleton = null;
	this.m_vectorCoreAnimation = [];
	this.m_vectorCoreMorphAnimation = [];
	this.m_vectorCoreMesh = [];
	this.m_vectorCoreMaterial = [];
	this.m_mapmapCoreMaterialThread = {};
	this.m_animationName = {};
	this.m_materialName = {};
	this.m_meshName = {};
	this.m_userData = null;
};

/**
	Get the user data<br />
	This function returns the user data stored in the core model instance.
	@returns {object} The user data stored in the core model.
*/
Cal3D.CalCoreModel.prototype.getUserData = function() {
	return this.m_userData;
};

/**
	Store user data.<br />
	This function stores user data in the core model instance.
	@param {object} userData The user data to be stored.
*/
Cal3D.CalCoreModel.prototype.setUserData = function(userData) {
	this.m_userData = userData;
};

/**
	Scale the core model.<br />
	This function rescale all data that are in the core model instance.
	@param {number} factor The scale factor.
*/
Cal3D.CalCoreModel.prototype.scale = function(factor) {
	this.m_coreSkeleton.scale(factor);

	for(var animationId=0; animationId<this.m_vectorCoreAnimation.length; animationId++) {
		this.m_vectorCoreAnimation[animationId].scale(factor);
	}

	for(var meshId=0; meshId<this.m_vectorCoreMesh.length; meshId++) {
		this.m_vectorCoreMesh[meshId].scale(factor);
	}
};

/**
	Add a core animation to the core model.<br />
	This function adds a core animation to the core model instance.
	@param {Cal3d.CalCoreAnimation} coreAnimation The core animation instance to be added.
	@returns {number} ID of the added core animation.
*/
Cal3D.CalCoreModel.prototype.addCoreAnimation = function(coreAnimation) {
	var animationId = this.m_vectorCoreAnimation.length;
	this.m_vectorCoreAnimation.push(coreAnimation);
	return animationId;
};

/**
	Get a core animation.<br />
	This function returns the core animation with the given ID.
	@param {number} coreAnimationId ID of the core animation.
	@returns {Cal3d.CalCoreAnimation} The core animation; null if it does not exist.
*/
Cal3D.CalCoreModel.prototype.getCoreAnimation = function(coreAnimationId) {
	if(coreAnimationId < 0 || coreAnimationId >= this.m_vectorCoreAnimation.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return null;
	}

	return this.m_vectorCoreAnimation[coreAnimationId];
};

/**
	Get the number of core animations.<br />
	This function returns the number of core animations in the core model instance.
	@returns {number} The number of core animations.
*/
Cal3D.CalCoreModel.prototype.getCoreAnimationCount = function() {
	return this.m_vectorCoreAnimation.length;
};

Cal3D.CalCoreModel.prototype.loadCoreAnimation = function(filename) {
	throw 'not implemented error';
};

/**
	Delete the resources used by the named core animation.<br />
	The name must be associated with a valid core animation ID with the function getAnimationId(). The caller must ensure that the 
	corresponding is not referenced anywhere otherwise unpredictable results will occur.
	@param {number | string} ID or name of the core animation.
	@returns {number} ID of the unloaded core animation; -1 if the core animation does not exist.
*/
Cal3D.CalCoreModel.prototype.unloadCoreAnimation = function(coreAnimationId) {
	if((typeof coreAnimationId) == 'string')
		coreAnimationId = this.getCoreAnimationId(coreAnimationId);

	if(coreAnimationId < 0 || coreAnimationId >= this.m_vectorCoreAnimation.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return -1;
	}

	this.m_vectorCoreAnimation[coreAnimationId] = null;
	return coreAnimationId;
};

Cal3D.CalCoreModel.prototype.saveCoreAnimation = function(filename, coreAnimationId) {
	throw 'not implemented error';

	// check if the core animation id is valid
	if(coreAnimationId < 0 || coreAnimationId >= this.m_vectorCoreAnimation.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return false;
	}

	// save the core animation
	if(!Cal3D.CalSaver.saveCoreAnimation(filename, this.m_vectorCoreAnimation[coreAnimationId]))
		return false;

	return true;
};

/**
	Create or overwrite a string-to-animation ID mapping.<br />
	This function makes an animation ID reference-able by a string name.<br />
	Note that we don't verify that the ID is valid because the animation may be added later. Also, if there is already a helper
	with this name, it will be overwritten without warning.
	@param {string} name The (new) name that will be associated with the ID.
	@param {number} coreAnimationId The ID of the animation to be referenced by the given name.
	@returns {boolean} true if succeeded; false if any error happened. 
*/
Cal3D.CalCoreModel.prototype.addAnimationName = function(name, coreAnimationId) {
	// check if the core animation id is valid
	if(coreAnimationId < 0 || coreAnimationId >= this.m_vectorCoreAnimation.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return false;
	}

	this.m_vectorCoreAnimation[coreAnimationId].setName(name);
	this.m_animationName[name] = coreAnimationId;
	return true;
};

/**
	Get the ID of the core animation by name.<br />
	@param {string} animationName Name associated with the ID.
	@returns {number} ID of the core animation; -1 if there is no ID associated with the given name.
*/
Cal3D.CalCoreModel.prototype.getCoreAnimationId = function(animationName) {
	var coreAnimationId = this.m_animationName[animationName];
	if(coreAnimationId == undefined)
		return -1;

	if(!this.getCoreAnimation(coreAnimationId))
		return -1;

	return coreAnimationId;
};

/**
	Add a core morph animation.<br />
	This function adds a core morph animation to the core model instance.
	@param {Cal3D.CalCoreMorphAnimation} coreMorphAnimation The core morph animation to be added.
	@returns {number} ID of the added core morph animation.
*/
Cal3D.CalCoreModel.prototype.addCoreMorphAnimation = function(coreMorphAnimation) {
	var morphAnimationId = this.m_vectorCoreMorphAnimation.length;
	this.m_vectorCoreMorphAnimation.push(coreMorphAnimation);
	return morphAnimationId;
};

/**
	Get a core morph animation<br />
	This function returns the core morph animation with the given ID.
	@param {number} ID of the core morph animation.
	@returns {Cal3D.CalCoreMorphAnimation} The core morph animation; null if the core morph animation does not exist.
*/
Cal3D.CalCoreModel.prototype.getCoreMorphAnimation = function(coreMorphAnimationId) {
	if(coreMorphAnimationId < 0 || coreMorphAnimationId >= this.m_vectorCoreMorphAnimation.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return null;
	}

	return this.m_vectorCoreMorphAnimation[coreMorphAnimationId];
};

/**
	Get the number of core morph animations.<br />
	This function returns the number of core morph animations in the core model instance.
	@returns {number} The number of core morph animations.. 
*/
Cal3D.CalCoreModel.prototype.getCoreMorphAnimationCount = function() {
	return this.m_vectorCoreMorphAnimation.length;
};

/**
	Add a core material.<br />
	This function adds a core material to the core model instance.
	@param {Cal3D.CalCoreMaterial} coreMaterial The core material to be added.
	@returns {number} ID of the added material.
*/
Cal3D.CalCoreModel.prototype.addCoreMaterial = function(coreMaterial) {
	var materialId = this.m_vectorCoreMaterial.length;
	this.m_vectorCoreMaterial.push(coreMaterial);
	return materialId;
};

/**
	Create a core material thread.<br />
	This function creates a new core material thread with the given ID.
	@param {number} coreMaterialThreadId The ID of the core material thread to be created.
	@returns {boolean} true if succeeded; false if any error happened. 
*/
Cal3D.CalCoreModel.prototype.createCoreMaterialThread = function(coreMaterialThreadId) {
	// insert an empty core material thread with the given id
	this.m_mapmapCoreMaterialThread[coreMaterialThreadId] = {};
	return true;
};

/**
	Get a core material.<br />
	This function returns the core material with the given ID.
	@param {number} coreMaterialId The ID of the core material.
	@returns {Cal3D.CalCoreMaterial} The core material; null if it does not exist.
*/
Cal3D.CalCoreModel.prototype.getCoreMaterial = function(coreMaterialId) {
	if(coreMaterialId < 0 || coreMaterialId >= this.m_vectorCoreMaterial.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return null;
	}

	return this.m_vectorCoreMaterial[coreMaterialId];
};

/**
	Get the number of core materials.<br />
	This function returns the number of core materials in the core model instance.
	@returns {number} The number of core materials.
*/
Cal3D.CalCoreModel.prototype.getCoreMaterialCount = function() {
	return this.m_vectorCoreMaterial.length;
};

/**
	Get a specified core material ID.<br />
	This function returns the core material ID for a specified core material name or thread/core material set pair.
	@param {string | number} materialName The name that is associated with a core material ID, or the ID of the core material thread.
	@param {number} coreMaterialSetId (Optional) The ID of the core material set.
	@returns {number} ID of the core material; -1 if it does not exist.
*/
Cal3D.CalCoreModel.prototype.getCoreMaterialId = function(materialName) {
	if(arguments.length == 1) {
		var coreMaterialId = this.m_materialName[materialName];
		if(coreMaterialId == undefined)
			return -1;

		if(!this.getCoreMaterial(coreMaterialId))
			return -1;

		return coreMaterialId;
	}
	else if(arguments.length == 2) {
		var coreMaterialThreadId = arguments[0];
		var coreMaterialSetId = arguments[1];

		// find the core material thread
		var coreMaterialThread = this.m_mapmapCoreMaterialThread[coreMaterialThreadId];
		if(coreMaterialThread == undefined) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
			return -1;
		}

		// find the core material id for the given set
		var coreMaterialId = coreMaterialThread[coreMaterialSetId];
		if(coreMaterialId == undefined) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
			return -1;
		}

		return coreMaterialId;
	}

	return -1;
};

Cal3D.CalCoreModel.prototype.loadCoreMaterial = function(filename) {
	throw 'not implemented error';
};

/**
	Delete the resources used by the named core material.<br />
	The name must be associated with a valid core material ID with the function getMaterialId(). The caller must ensure that 
	the corresponding is not referenced anywhere otherwise unpredictable results will occur.
	@param {string | number} coreMaterialId The symbolic name or ID of the core material to unload.
	@returns {number} ID of the unloaded core material; -1 if it does not exist.
*/
Cal3D.CalCoreModel.prototype.unloadCoreMaterial = function(coreMaterialId) {
	if((typeof coreMaterialId) == 'string')
		coreMaterialId = this.getCoreMaterialId(coreMaterialId);

	if(coreMaterialId < 0 || coreMaterialId >= this.m_vectorCoreMaterial.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return -1;
	}

	this.m_vectorCoreMaterial[coreMaterialId] = null;
	return coreMaterialId;
};

Cal3D.CalCoreModel.prototype.saveCoreMaterial = function(filename, coreMaterialId) {
	throw 'not implemented error';

	// check if the core material id is valid
	if(coreMaterialId < 0 || coreMaterialId >= this.m_vectorCoreMaterial.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return false;
	}

	// save the core animation
	return Cal3D.CalSaver.saveCoreMaterial(filename, this.m_vectorCoreMaterial[coreMaterialId]);
};

/**
	Set a core material ID.<br />
	This function sets a core material ID for a core material thread/core material set pair.
	@param {number} coreMaterialThreadId The ID of the core material thread.
	@param {number} coreMaterialSetId The ID of the core maetrial set.
	@param {number} coreMaterialId The ID of the core maetrial.
	@returns {boolean} true if succeeded; false if failed.
*/
Cal3D.CalCoreModel.prototype.setCoreMaterialId = function(coreMaterialThreadId, coreMaterialSetId, coreMaterialId) {
	// find the core material thread
	var coreMaterialThread = this.m_mapmapCoreMaterialThread[coreMaterialThreadId];
	if(coreMaterialThread == undefined) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return false;
	}

	// set the given set id in the core material thread to the given core material id
	coreMaterialThread[coreMaterialSetId] = coreMaterialId
	return true;
};

/**
	Create or overwrite a string-to-core-material ID mapping.<br />
	This function makes a core material ID reference-able by a string name.<br />
	Note that we don't verify that the ID is valid because the material may be added later. Also, if there is already a helper 
	with this name, it will be overwritten without warning.
	@param {string} name The name that will be associated with the ID.
	@param {number} coreMaterialId The core ID number of the material to be referenced by the name.
	@returns {boolean} true if succeeded; false if any error happened.
*/
Cal3D.CalCoreModel.prototype.addMaterialName = function(name, coreMaterialId) {
	if(coreMaterialId < 0 || coreMaterialId >= this.m_vectorCoreMaterial.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return false;
	}

	this.m_vectorCoreMaterial[coreMaterialId].setName(name);
	this.m_materialName[name] = coreMaterialId;
	return true;
};

/**
	Add a core mesh.<br />
	This function adds a core mesh to the core model instance.
	@param {Cal3D.CalCoreMesh} coreMesh The core mesh to be added.
	@returns {number} ID of the added core mesh.
*/
Cal3D.CalCoreModel.prototype.addCoreMesh = function(coreMesh) {
	var meshId = this.m_vectorCoreMesh.length;
	this.m_vectorCoreMesh.push(coreMesh);
	return meshId;
};

/**
	Get a core mesh.<br />
	This function returns the core mesh with the given ID.
	@param {number} coreMeshId The ID of the core mesh.
	@returns {Cal3D.CalCoreMesh} The core mesh; null if the core mesh does not exist.
*/
Cal3D.CalCoreModel.prototype.getCoreMesh = function(coreMeshId) {
	if(coreMeshId < 0 || coreMeshId >= this.m_vectorCoreMesh.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return null;
	}

	return this.m_vectorCoreMesh[coreMeshId];
};

/**
	Get the number of core meshes.<br />
	This function returns the number of core meshes in the core model instance.
	@returns {number} The number of core meshes.
*/
Cal3D.CalCoreModel.prototype.getCoreMeshCount = function() {
	return this.m_vectorCoreMesh.length;
};

Cal3D.CalCoreModel.prototype.loadCoreMesh = function(filename) {
	throw 'not implemented error';
};

/**
	Delete the resources used by the named core mesh.<br />
	The name must be associated with a valid core mesh Id with the function getMeshId(). The caller must ensure that the
	corresponding is not referenced anywhere otherwise unpredictable results will occur.
	@param {string | number} The symbolic name or ID of the core mesh to unload.
	@returns {number} ID of the unloaded core mesh; -1 if it does not exist.
*/
Cal3D.CalCoreModel.prototype.unloadCoreMesh = function(coreMeshId) {
	if((typeof coreMeshId) == 'string')
		coreMeshId = this.getCoreMeshId(coreMeshId);

	if(coreMeshId < 0 || coreMeshId >= this.m_vectorCoreMesh.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return -1;
	}

	this.m_vectorCoreMesh[coreMeshId] = null;
	return coreMeshId;
};

Cal3D.CalCoreModel.prototype.saveCoreMesh = function(filename, coreMeshId) {
	throw 'not implemented error';

	// check if the core mesh id is valid
	if(coreMeshId < 0 || coreMeshId >= this.m_vectorCoreMesh.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return false;
	}

	// save the core mesh
	return Cal3D.CalSaver.saveCoreMesh(filename, this.m_vectorCoreMesh[coreMeshId]);
};

/**
	Create or overwrite a string-to-core-mesh ID mapping.<br />
	This function makes a core mesh ID reference-able by a string name.<br />
	Note that we don't verify that the ID is valid because the mesh may be added later. Also, if there is already a helper with 
	this name, it will be overwritten without warning.
	@param {string} meshName The name that will be associated with the ID.
	@param {number} coreMeshId The core ID number of the mesh to be referenced by the name.
	@returns {boolean} true if succeeded; false if failed.
*/
Cal3D.CalCoreModel.prototype.addMeshName = function(meshName, coreMeshId) {
	if(coreMeshId < 0 || coreMeshId >= this.m_vectorCoreMesh.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return false;
	}

	this.m_vectorCoreMesh[coreMeshId].setName(meshName);
	this.m_meshName[meshName] = coreMeshId;
	return true;
};

/**
	Get the ID of the core mesh referenced by name.<br />
	@param {string} meshName The name that is associated with a core mesh ID.
	@returns {number} The core mesh ID associated with the given name; -1 if it does not exist.
*/
Cal3D.CalCoreModel.prototype.getCoreMeshId = function(meshName) {
	var coreMeshId = this.m_meshName[meshName];
	if(coreMeshId == undefined)
		return -1;

	if(!this.getCoreMesh(coreMeshId))
		return -1;

	return coreMeshId;
};

/**
	Get the core skeleton.<br />
	This function returns the core skeleton of the core model instance.
	@returns {Cal3D.CalCoreSkeleton} The core skeleton.
*/
Cal3D.CalCoreModel.prototype.getCoreSkeleton = function() {
	return this.m_coreSkeleton;
};

Cal3D.CalCoreModel.prototype.loadCoreSkeleton = function(filename) {
	throw 'not implemented error';
};

Cal3D.CalCoreModel.prototype.saveCoreSkeleton = function(filename) {
	throw 'not implemented error';

	// check if we have a core skeleton in this code model
	if(this.m_coreSkeleton) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return false;
	}

	// save the core skeleton
	return Cal3D.CalSaver.saveCoreSkeleton(filename, this.m_coreSkeleton);
};

/**
	Set the core skeleton of the core model.<br />
	This function sets the core skeleton of the core model instance.
	@param {Cal3D.CalCoreSkeleton} coreSkeleton The core skeleton to be set.
*/
Cal3D.CalCoreModel.prototype.setCoreSkeleton = function(coreSkeleton) {
	if(!coreSkeleton) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'coremodel.js');
		return;
	}

	this.m_coreSkeleton = coreSkeleton;
};

/**
	Create or overwrite a string-to-boneId mapping.<br />
	This function makes a bone ID reference-able by a string name.
	@param {string} boneName The that will be associated with the ID.
	@param {number} boneId The ID of the bone that will be referenced by the given name.
*/
Cal3D.CalCoreModel.prototype.addBoneName = function(boneName, boneId) {
	// make sure the skeleton has been loaded first
	if(this.m_coreSkeleton) {
		// map the bone ID to the name
		this.m_coreSkeleton.mapCoreBoneName(boneId, boneName);
	}
};

/**
	Get the ID of the bone referenced by a name.<br />
	@param {string} boneName The name that is associated with a bone ID.
	@returns {number} The bone ID associated with the given name; -1 if it does not exist.
*/
Cal3D.CalCoreModel.prototype.getBoneId = function(boneName) {
	if(this.m_coreSkeleton) {
		return this.m_coreSkeleton.getCoreBoneId(boneName);
	}

	return -1;
};
