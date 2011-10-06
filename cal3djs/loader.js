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
	@namespace CalLibraryConstants
*/
Cal3D.CalLibraryConstants = {
	// binary file magic cookies
	SKELETON_FILE_MAGIC:		'CSF', 
	ANIMATION_FILE_MAGIC:		'CAF', 
	MESH_FILE_MAGIC:			'CMF', 
	MATERIAL_FILE_MAGIC:		'CRF', 

	// xml file magic cookies
	SKELETON_XMLFILE_MAGIC:		'XSF', 
	ANIMATION_XMLFILE_MAGIC:	'XAF', 
	MESH_XMLFILE_MAGIC:			'XMF', 
	MATERIAL_XMLFILE_MAGIC:		'XRF', 

	// library version 
	LIBRARY_VERSION:					1100,	// 0.11.0

	// file versions
	CURRENT_FILE_VERSION:				1100,	// should be the same as LIBRARY_VERSION
	EARLIEST_COMPATIBLE_FILE_VERSION:	699		// the earliest file version that is acceptable
};



/**
	@class CalLoadingCallback

	The loader callback interface.
*/
Cal3D.CalLoadingCallback = function() {
};

Cal3D.CalLoadingCallback.prototype.onload = function(object, url) {
};

Cal3D.CalLoadingCallback.prototype.onerror = function(code, url) {
};

Cal3D.CalLoadingCallback.prototype.onprogress = function(percent, url) {
};



/**
	@namespace CalLoader
*/
Cal3D.CalLoader = {};

Cal3D.CalLoader.LOADER_ROTATE_X_AXIS	= 0x01;
Cal3D.CalLoader.LOADER_INVERT_V_COORD	= 0x02;
Cal3D.CalLoader.LOADER_FLIP_WINDING		= 0x04;

/**
	Set optional flags which affect how the model is loaded for all future loader calls.<br />
	@param {number} flags Can be any combination of the following flags: 
		<li><b> Cal3D.CalLoader.LOADER_ROTATE_X_AXIS </b></li> will rotate the mesh 90 degrees about the X axis which has the effect of swapping Y/Z coordinates.
		<li><b> Cal3D.CalLoader.LOADER_INVERT_V_COORD </b></li> will substitute (1-v) for any v texture coordinate to eliminate the need for texture inversion after export.
		<li><b> Cal3D.CalLoader.LOADER_FLIP_WINDING </b></li> will flip the winding for all faces.
*/
Cal3D.CalLoader.setLoadingMode = function(flags) {
	Cal3D.CalLoader.loadingMode = flags;
};

/**
	Load an entire Cal3D model from a given config file.<br />
	@param {string} url The url of the config file.
	@param {object} callback An object which implements the loader callback interface to retrieve the modle loaded and/or the error information and/or the loading progress information.
*/
Cal3D.CalLoader.loadModelFromConfigFile = function(url, callback) {
	var xhr = new XMLHttpRequest;
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/plain; charset=x-user-defined');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				var cfg = Cal3D.CalLoader.parseConfigFile(this.responseText);

				if(cfg.skeletons.length == 0) {
					Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js');
					if(callback && callback.onerror) {
						callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, 'skeleton file');
					}
					return;
				}

				var resourceCount = 1 /* the one and only skeleton file */ + cfg.animations.length + cfg.meshes.length + cfg.materials.length;
				var resources = {
					skeletons: {}, 
					animations: {}, 
					meshes: {}, 
					materials: {}
				};

				var setupModel = function() {
					// create a new core model instance
					var coreModel = new Cal3D.CalCoreModel('dummy');

					// set core skeleton
					coreModel.setCoreSkeleton(resources.skeletons[cfg.path + cfg.skeletons[0]]);

					// set core animations
					for(var i=0; i<cfg.animations.length; i++) {
						coreModel.addCoreAnimation(resources.animations[cfg.path + cfg.animations[i]]);
					}

					// set core meshes
					for(var i=0; i<cfg.meshes.length; i++) {
						coreModel.addCoreMesh(resources.meshes[cfg.path + cfg.meshes[i]]);
					}

					// set core materials
					for(var i=0; i<cfg.materials.length; i++) {
						coreModel.addCoreMaterial(resources.materials[cfg.path + cfg.materials[i]]);
					}

					// make one material thread for each material
					// FIXME: maybe this is not the right way to do it, while this is the only thing 
					//        we can do here as we haven't got any further information about the model.
					for(var materialId=0; materialId<cfg.materials.length; materialId++) {
						// create the a material thread
						coreModel.createCoreMaterialThread(materialId);

						// initialize the material thread
						coreModel.setCoreMaterialId(materialId, 0, materialId);
					}

					// calculate bounding boxes
					coreModel.getCoreSkeleton().calculateBoundingBoxes(coreModel);

					// create a new model instance
					var model = new Cal3D.CalModel(coreModel);

					// attach all meshes to the model
					for(var meshId=0; meshId<cfg.meshes.length; meshId++) {
						model.attachMesh(meshId);
					}

					// set the material set of the whole model
					model.setMaterialSet(0);

					if(callback && callback.onload) {
						var loaded = {};
						loaded['model'] = model;
						loaded['path']  = cfg.path;
						loaded['scale'] = cfg.scale;
						// the user defined items will be returned through
						for(var key in cfg.userdefined) {
							loaded[key] = cfg.userdefined[key];
						}
						callback.onload(loaded, url);
					}
				};

				var animationCB = {};
				animationCB.onload = function(coreAnimation, url) {
					resources.animations[url] = coreAnimation;
					if(--resourceCount == 0)
						setupModel();
				};
				animationCB.onerror = function(code, url) {
					if(callback && callback.onerror) {
						callback.onerror(code, url);
					}
				};

				var meshCB = {};
				meshCB.onload = function(coreMesh, url) {
					resources.meshes[url] = coreMesh;
					if(--resourceCount == 0)
						setupModel();
				};
				meshCB.onerror = function(code, url) {
					if(callback && callback.onerror) {
						callback.onerror(code, url);
					}
				};

				var materialCB = {};
				materialCB.onload = function(coreMaterial, url) {
					resources.materials[url] = coreMaterial;
					if(--resourceCount == 0)
						setupModel();
				};
				materialCB.onerror = function(code, url) {
					if(callback && callback.onerror) {
						callback.onerror(code, url);
					}
				};

				var skeletonCB = {};
				skeletonCB.onload = function(coreSkeleton, url) {
					resources.skeletons[url] = coreSkeleton;

					for(var i=0; i<cfg.animations.length; i++) {
						Cal3D.CalLoader.loadCoreAnimationFromFile(cfg.path + cfg.animations[i], coreSkeleton, animationCB);
					}

					for(var i=0; i<cfg.meshes.length; i++) {
						Cal3D.CalLoader.loadCoreMeshFromFile(cfg.path + cfg.meshes[i], meshCB);
					}

					for(var i=0; i<cfg.materials.length; i++) {
						Cal3D.CalLoader.loadCoreMaterialFromFile(cfg.path + cfg.materials[i], materialCB);
					}

					if(--resourceCount == 0)
						setupModel();
				};
				skeletonCB.onerror = function(code, url) {
					if(callback && callback.onerror) {
						callback.onerror(code, url);
					}
				};

				Cal3D.CalLoader.loadCoreSkeletonFromFile(cfg.path + cfg.skeletons[0], skeletonCB);
			}
		}
	};

	xhr.onerror = function() {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js', 0, url);
		if(callback && callback.onerror) {
			callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, url);
		}
	};

	xhr.onprogress = function(evt) {
		if(callback && callback.onprogress) {
			callback.onprogress(evt.position / evt.totalSize, url);
		}
	};

	xhr.send();
};

/**
	Load a core animation instance from a given url.<br />
	@param {string} url The url where to load the core animation instance.
	@param {Cal3D.CalCoreSkeleton} skel The core skeleton instance the core animation is attached to. This parameter is optional.
	@param {object} callback An object which implements the loader callback interface to retrieve the core animation instance loaded and/or the error information and/or the loading progress information.
*/
Cal3D.CalLoader.loadCoreAnimationFromFile = function(url, skel, callback) {
	if( url.length >= 3 && 
		url.substring(url.length - 3, url.length).toUpperCase() == Cal3D.CalLibraryConstants.ANIMATION_XMLFILE_MAGIC ) {
		Cal3D.CalLoader.loadXmlCoreAnimation(url, skel, callback);
		return;
	}

	var xhr = new XMLHttpRequest;
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/plain; charset=x-user-defined');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				var coreAnim = Cal3D.CalLoader.loadCoreAnimationFromData(this.responseText, skel);
				if(coreAnim) {
					coreAnim.setFilename(url);
					if(callback && callback.onload) {
						callback.onload(coreAnim, url);
					}
				}
				else if(callback && callback.onerror) {
					callback.onerror(Cal3D.CalError.Code.INVALID_FILE_FORMAT, url);
				}
			}
		}
	};

	xhr.onerror = function() {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js', 0, url);
		if(callback && callback.onerror) {
			callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, url);
		}
	};

	xhr.onprogress = function(evt) {
		if(callback && callback.onprogress) {
			callback.onprogress(evt.position / evt.totalSize, url);
		}
	};

	xhr.send();
};

/**
	Load a core animation instance from a given data buffer.<br />
	@param {string} data The data buffer from which to load the core animation instance.
	@param {Cal3D.CalCoreSkeleton} skel The core skeleton instance the core animation is attached to. This parameter is optional.
	@returns {Cal3D.CalCoreAnimation} The core animation instance loaded; null if any error happened.
*/
Cal3D.CalLoader.loadCoreAnimationFromData = function(data, skel) {
	// check if this is a valid animation file
	if(data.substring(0, 3) != Cal3D.CalLibraryConstants.ANIMATION_FILE_MAGIC) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	var datasource = new Cal3D.CalBufferSource(data.substring(4, data.length));
	
	// check if the version is compatible with the library
	var version = datasource.readInteger();
	if( isNaN(version) || version < Cal3D.CalLibraryConstants.EARLIEST_COMPATIBLE_FILE_VERSION || 
		version > Cal3D.CalLibraryConstants.CURRENT_FILE_VERSION ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INCOMPATIBLE_FILE_VERSION, 'loader.js');
		return null;
	}

	// create a new core animation instance
	var coreAnimation = new Cal3D.CalCoreAnimation;

	// get the duration of the core animation
	var duration = datasource.readFloat();
	if(isNaN(duration)) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	// check for a valid duration
	if(duration <= 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_ANIMATION_DURATION, 'loader.js');
		return null;
	}

	// set the duration in the core animation instance
	coreAnimation.setDuration(duration);

	// read the number of tracks
	var trackCount = datasource.readInteger();
	if(isNaN(trackCount) || trackCount <= 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	// load all core tracks
	for(var trackId=0; trackId<trackCount; trackId++) {
		// load the core track
		var coreTrack = Cal3D.CalLoader.loadCoreTrack(datasource, skel, duration);
		if(!coreTrack) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		// add the core track to the core animation instance
		coreAnimation.addCoreTrack(coreTrack);
	}

	return coreAnimation;
};

/**
	Load a core material instance from a given url.<br />
	@param {string} url The url where to load the core material instance.
	@param {object} callback An object which implements the loader callback interface to retrieve the core material instance loaded and/or the error information and/or the loading progress information.
*/
Cal3D.CalLoader.loadCoreMaterialFromFile = function(url, callback) {
	if( url.length >= 3 && 
		url.substring(url.length - 3, url.length).toUpperCase() == Cal3D.CalLibraryConstants.MATERIAL_XMLFILE_MAGIC ) {
		Cal3D.CalLoader.loadXmlCoreMaterial(url, callback);
		return;
	}

	var xhr = new XMLHttpRequest;
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/plain; charset=x-user-defined');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				var coreMat = Cal3D.CalLoader.loadCoreMaterialFromData(this.responseText);
				if(coreMat) {
					coreMat.setFilename(url);
					if(callback && callback.onload) {
						callback.onload(coreMat, url);
					}
				}
				else if(callback && callback.onerror) {
					callback.onerror(Cal3D.CalError.Code.INVALID_FILE_FORMAT, url);
				}
			}
		}
	};

	xhr.onerror = function() {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js', 0, url);
		if(callback && callback.onerror) {
			callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, url);
		}
	};

	xhr.onprogress = function(evt) {
		if(callback && callback.onprogress) {
			callback.onprogress(evt.position / evt.totalSize, url);
		}
	};

	xhr.send();
};

/**
	Load a core material instance from a given data buffer.<br />
	@param {string} data The data buffer from which to load the core material instance.
	@returns {Cal3D.CalCoreMaterial} The core material instance loaded; null if any error happened.
*/
Cal3D.CalLoader.loadCoreMaterialFromData = function(data) {
	// check if this is a valid material file
	if(data.substring(0, 3) != Cal3D.CalLibraryConstants.MATERIAL_FILE_MAGIC) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null
	}

	var datasource = new Cal3D.CalBufferSource(data.substring(4, data.length));

	// check if the version is compatible with the library
	var version = datasource.readInteger();
	if( isNaN(version) || version < Cal3D.CalLibraryConstants.EARLIEST_COMPATIBLE_FILE_VERSION || 
		version > Cal3D.CalLibraryConstants.CURRENT_FILE_VERSION ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INCOMPATIBLE_FILE_VERSION, 'loader.js');
		return null;
	}

	// allocate a new core material instance
	var coreMaterial = new Cal3D.CalCoreMaterial;

	var colorBuffer = [0, 0, 0, 0];

	// get the ambient color of the core material
	var ambientColor = new Cal3D.CalCoreMaterial.Color;
	datasource.readBytes(colorBuffer, colorBuffer.length);
	ambientColor.red   = colorBuffer[0];
	ambientColor.green = colorBuffer[1];
	ambientColor.blue  = colorBuffer[2];
	ambientColor.alpha = colorBuffer[3];

	// get the diffuse color of the core material
	var diffuseColor = new Cal3D.CalCoreMaterial.Color;
	datasource.readBytes(colorBuffer, colorBuffer.length);
	diffuseColor.red   = colorBuffer[0];
	diffuseColor.green = colorBuffer[1];
	diffuseColor.blue  = colorBuffer[2];
	diffuseColor.alpha = colorBuffer[3];

	// get the specular color of the core material
	var specularColor = new Cal3D.CalCoreMaterial.Color;
	datasource.readBytes(colorBuffer, colorBuffer.length);
	specularColor.red   = colorBuffer[0];
	specularColor.green = colorBuffer[1];
	specularColor.blue  = colorBuffer[2];
	specularColor.alpha = colorBuffer[3];

	// get the shininess factor of the core material
	var shininess = datasource.readFloat();

	// check if an error happened
	if(!datasource.ok()) {
		datasource.setError();
		return null;
	}

	// set the colors and the shininess
	coreMaterial.setAmbientColor(ambientColor);
	coreMaterial.setDiffuseColor(diffuseColor);
	coreMaterial.setSpecularColor(specularColor);
	coreMaterial.setShininess(shininess);

	// read the number of maps
	var mapCount = datasource.readInteger();
	if(isNaN(mapCount) || mapCount < 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	// reserve memory for all the material data
	if(!coreMaterial.reserve(mapCount)) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.MEMORY_ALLOCATION_FAILED, 'loader.js');
		return null;
	}

	// load all maps
	for(var mapId=0; mapId<mapCount; mapId++) {
		var map = new Cal3D.CalCoreMaterial.Map;

		// read the filename of the map
		map.filename = datasource.readString();

		// initialize the user data to null
		map.userData = null;

		// check if an error happened
		if(!datasource.ok()) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		// set map in the core material instance
		coreMaterial.setMap(mapId, map);
	}

	return coreMaterial;
};

/**
	Load a core mesh instance from a given url.<br />
	@param {string} url The url where to load the core mesh instance.
	@param {object} callback An object which implements the loader callback interface to retrieve the core mesh instance loaded and/or the error information and/or the loading progress information.
*/
Cal3D.CalLoader.loadCoreMeshFromFile = function(url, callback) {
	if( url.length >= 3 && 
		url.substring(url.length - 3, url.length).toUpperCase() == Cal3D.CalLibraryConstants.MESH_XMLFILE_MAGIC ) {
		Cal3D.CalLoader.loadXmlCoreMesh(url, callback);
		return;
	}

	var xhr = new XMLHttpRequest;
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/plain; charset=x-user-defined');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				var coreMesh = Cal3D.CalLoader.loadCoreMeshFromData(this.responseText);
				if(coreMesh) {
					coreMesh.setFilename(url);
					if(callback && callback.onload) {
						callback.onload(coreMesh, url);
					}
				}
				else if(callback && callback.onerror) {
					callback.onerror(Cal3D.CalError.Code.INVALID_FILE_FORMAT, url);
				}
			}
		}
	};

	xhr.onerror = function() {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js', 0, url);
		if(callback && callback.onerror) {
			callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, url);
		}
	};

	xhr.onprogress = function(evt) {
		if(callback && callback.onprogress) {
			callback.onprogress(evt.position / evt.totalSize, url);
		}
	};

	xhr.send();
};

/**
	Load a core mesh instance from a given data buffer.<br />
	@param {string} data The data buffer from which to load the core mesh instance.
	@returns {Cal3D.CalCoreMesh} The core mesh instance loaded; null if any error happened.
*/
Cal3D.CalLoader.loadCoreMeshFromData = function(data) {
	// check if this is a valid mesh file
	if(data.substring(0, 3) != Cal3D.CalLibraryConstants.MESH_FILE_MAGIC) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null
	}

	var datasource = new Cal3D.CalBufferSource(data.substring(4, data.length));

	// check if the version is compatible with the library
	var version = datasource.readInteger();
	if( isNaN(version) || version < Cal3D.CalLibraryConstants.EARLIEST_COMPATIBLE_FILE_VERSION || 
		version > Cal3D.CalLibraryConstants.CURRENT_FILE_VERSION ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INCOMPATIBLE_FILE_VERSION, 'loader.js');
		return null;
	}

	// get the number of submeshes
	var submeshCount = datasource.readInteger();
	if(isNaN(submeshCount)) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null
	}

	// create a new core mesh instance
	var coreMesh = new Cal3D.CalCoreMesh;

	// load all core submeshes
	for(var submeshId=0; submeshId<submeshCount; submeshId++) {
		// load the core submesh
		var coreSubmesh = Cal3D.CalLoader.loadCoreSubmesh(datasource);
		if(!coreSubmesh) {
			return null;
		}

		// add the core submesh to the core mesh instance
		coreMesh.addCoreSubmesh(coreSubmesh);
	}

	return coreMesh;
};

/**
	Load a core skeleton instance from a given url.<br />
	@param {string} url The url where to load the core skeleton instance.
	@param {object} callback An object which implements the loader callback interface to retrieve the core skeleton instance loaded and/or the error information and/or the loading progress information.
*/
Cal3D.CalLoader.loadCoreSkeletonFromFile = function(url, callback) {
	if( url.length >= 3 && 
		url.substring(url.length - 3, url.length).toUpperCase() == Cal3D.CalLibraryConstants.SKELETON_XMLFILE_MAGIC ) {
		Cal3D.CalLoader.loadXmlCoreSkeleton(url, callback);
		return;
	}

	var xhr = new XMLHttpRequest;
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/plain; charset=x-user-defined');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				var coreSkeleton = Cal3D.CalLoader.loadCoreSkeletonFromData(this.responseText);
				if(coreSkeleton) {
					if(callback && callback.onload) {
						callback.onload(coreSkeleton, url);
					}
				}
				else if(callback && callback.onerror) {
					callback.onerror(Cal3D.CalError.Code.INVALID_FILE_FORMAT, url);
				}
			}
		}
	};

	xhr.onerror = function() {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js', 0, url);
		if(callback && callback.onerror) {
			callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, url);
		}
	};

	xhr.onprogress = function(evt) {
		if(callback && callback.onprogress) {
			callback.onprogress(evt.position / evt.totalSize, url);
		}
	};

	xhr.send();
};

/**
	Load a core skeleton instance from a given data buffer.<br />
	@param {string} data The data buffer from which to load the core skeleton instance.
	@returns {Cal3D.CalCoreMesh} The core skeleton instance loaded; null if any error happened.
*/
Cal3D.CalLoader.loadCoreSkeletonFromData = function(data) {
	// check if this is a valid skeleton file
	if(data.substring(0, 3) != Cal3D.CalLibraryConstants.SKELETON_FILE_MAGIC) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null
	}

	var datasource = new Cal3D.CalBufferSource(data.substring(4, data.length));

	// check if the version is compatible with the library
	var version = datasource.readInteger();
	if( isNaN(version) || version < Cal3D.CalLibraryConstants.EARLIEST_COMPATIBLE_FILE_VERSION || 
		version > Cal3D.CalLibraryConstants.CURRENT_FILE_VERSION ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INCOMPATIBLE_FILE_VERSION, 'loader.js');
		return null;
	}

	// read the number of bones
	var boneCount = datasource.readInteger();
	if(isNaN(boneCount) || boneCount <= 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null
	}

	// allocate a new core skeleton instance
	var coreSkeleton = new Cal3D.CalCoreSkeleton;

	// load all core bones
	for(var boneId=0; boneId<boneCount; boneId++) {
		// load the core bone
		var coreBone = Cal3D.CalLoader.loadCoreBones(datasource);
		if(!coreBone) {
			return null;
		}

		// set the core skeleton of the core bone instance
		coreBone.setCoreSkeleton(coreSkeleton);

		// add the core bone to the core skeleton instance
		coreSkeleton.addCoreBone(coreBone);

		// add a core skeleton mapping of the bone's name for quick reference later
		coreSkeleton.mapCoreBoneName(boneId, coreBone.getName());
	}

	// calculate state of the core skeleton
	coreSkeleton.calculateState();

	return coreSkeleton;
};

/**
	@private
*/
Cal3D.CalLoader.loadCoreBones = function(datasource) {
	if(!datasource.ok()) {
		datasource.setError();
		return null;
	}

	// read the name of the bone
	var name = datasource.readString();

	// get the translation of the bone
	var tx, ty, tz;
	tx = datasource.readFloat();
	ty = datasource.readFloat();
	tz = datasource.readFloat();

	// get the rotation of the bone
	var rx, ry, rz, rw;
	rx = datasource.readFloat();
	ry = datasource.readFloat();
	rz = datasource.readFloat();
	rw = datasource.readFloat();

	// get the bone space translation of the bone
	var txBoneSpace, tyBoneSpace, tzBoneSpace;
	txBoneSpace = datasource.readFloat();
	tyBoneSpace = datasource.readFloat();
	tzBoneSpace = datasource.readFloat();

	// get the bone space rotation of the bone
	var rxBoneSpace, ryBoneSpace, rzBoneSpace, rwBoneSpace;
	rxBoneSpace = datasource.readFloat();
	ryBoneSpace = datasource.readFloat();
	rzBoneSpace = datasource.readFloat();
	rwBoneSpace = datasource.readFloat();

	// get the parent bone id
	var parentId = datasource.readInteger();

	var rot = new Cal3D.CalQuaternion(rx, ry, rz, rw);
	var rotbs = new Cal3D.CalQuaternion(rxBoneSpace, ryBoneSpace, rzBoneSpace, rwBoneSpace);
	var trans = new Cal3D.CalVector(tx, ty, tz);

	if (Cal3D.CalLoader.loadingMode & Cal3D.CalLoader.LOADER_ROTATE_X_AXIS) {
		if (parentId == -1) { // only root bone necessary
			var x_axis_90 = new Cal3D.CalQuaternion(0.7071067811, 0, 0, 0.7071067811);
			// root bone must have quaternion rotated
			rot.multQuaternionLocal(x_axis_90);
			// root bone must have translation rotated also
			trans.multQuaternionLocal(x_axis_90);
		}
	}


	// check if an error happened
	if(!datasource.ok()) {
		datasource.setError();
		return null;
	}

	// create a new core bone instance
	var coreBone = new Cal3D.CalCoreBone(name);

	// set the parent of the bone
	coreBone.setParentId(parentId);

	// set all attributes of the bone
	coreBone.setTranslation(trans);
	coreBone.setRotation(rot);
	coreBone.setTranslationBoneSpace(new Cal3D.CalVector(txBoneSpace, tyBoneSpace, tzBoneSpace));
	coreBone.setRotationBoneSpace(rotbs);

	// read the number of children
	var childCount = datasource.readInteger();
	if(isNaN(childCount) || childCount < 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	// load all children ids
	for(; childCount>0; childCount--) {
		var childId = datasource.readInteger();
		if(isNaN(childId) || childId < 0) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		coreBone.addChildId(childId);
	}

	return coreBone;
};

/**
	@private
*/
Cal3D.CalLoader.loadCoreKeyframe = function(datasource) {
	if(!datasource.ok()) {
		datasource.setError();
		return null;
	}

	// get the time of the keyframe
	var time = datasource.readFloat();

	// get the translation of the bone
	var tx, ty, tz;
	tx = datasource.readFloat();
	ty = datasource.readFloat();
	tz = datasource.readFloat();

	// get the rotation of the bone
	var rx, ry, rz, rw;
	rx = datasource.readFloat();
	ry = datasource.readFloat();
	rz = datasource.readFloat();
	rw = datasource.readFloat();

	// check if an error happened
	if(!datasource.ok()) {
		datasource.setError();
		return null;
	}

	// create a new core keyframe instance
	var coreKeyframe = new Cal3D.CalCoreKeyframe;
	if(!coreKeyframe.create())	{
		return null;
	}
	// set all attributes of the keyframe
	coreKeyframe.setTime(time);
	coreKeyframe.setTranslation(new Cal3D.CalVector(tx, ty, tz));
	coreKeyframe.setRotation(new Cal3D.CalQuaternion(rx, ry, rz, rw));

	return coreKeyframe;
};

/**
	@private
*/
Cal3D.CalLoader.loadCoreSubmesh = function(datasource) {
	if(!datasource.ok()) {
		datasource.setError();
		return null;
	}

	// get the material thread id of the submesh
	var coreMaterialThreadId = datasource.readInteger();

	// get the number of vertices
	var vertexCount = datasource.readInteger();

	// get the number of faces
	var faceCount = datasource.readInteger();

	// get the number of level-of-details
	var lodCount = datasource.readInteger();

	// get the number of springs
	var springCount = datasource.readInteger();

	// get the number of texture coordinates per vertex
	var textureCoordinateCount = datasource.readInteger();

	// check if an error happened
	if(!datasource.ok()) {
		datasource.setError();
		return null;
	}

	// allocate a new core submesh instance
	var coreSubmesh = new Cal3D.CalCoreSubmesh;

	// set the LOD step count
	coreSubmesh.setLodCount(lodCount);

	// set the core material id
	coreSubmesh.setCoreMaterialThreadId(coreMaterialThreadId);

	// reserve memory for all the submesh data
	if(!coreSubmesh.reserve(vertexCount, textureCoordinateCount, faceCount, springCount)) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.MEMORY_ALLOCATION_FAILED, 'loader.js');
		return null;
	}

	// load the tangent space enable flags.
	for(var textureCoordinateId=0; textureCoordinateId<textureCoordinateCount; textureCoordinateId++) {
		coreSubmesh.enableTangents(textureCoordinateId, false);
	}

	// load all vertices and their influences
	for(var vertexId=0; vertexId<vertexCount; vertexId++) {
		var vertex = new Cal3D.CalCoreSubmesh.Vertex;

		// load data of the vertex
		vertex.position.x = datasource.readFloat();
		vertex.position.y = datasource.readFloat();
		vertex.position.z = datasource.readFloat();
		vertex.normal.x = datasource.readFloat();
		vertex.normal.y = datasource.readFloat();
		vertex.normal.z = datasource.readFloat();
		vertex.collapseId = datasource.readInteger();
		vertex.faceCollapseCount = datasource.readInteger();

		// check if an error happened
		if(!datasource.ok()) {
			datasource.setError();
			return null;
		}

		// load all texture coordinates of the vertex
		for(var vartextureCoordinateId=0; textureCoordinateId<textureCoordinateCount; textureCoordinateId++) {
			var textureCoordinate = new Cal3D.CalCoreSubmesh.TextureCoordinate;

			// load the texture coordinate
			textureCoordinate.u = datasource.readFloat();
			textureCoordinate.v = datasource.readFloat();

			if(Cal3D.CalLoader.loadingMode & Cal3D.CalLoader.LOADER_INVERT_V_COORD) {
				textureCoordinate.v = 1 - textureCoordinate.v;
			}

			// check if an error happened
			if(!datasource.ok()) {
				datasource.setError();
				return null;
			}

			// set texture coordinate in the core submesh instance
			coreSubmesh.setTextureCoordinate(vertexId, textureCoordinateId, textureCoordinate);
		}

		// get the number of influences
		var influenceCount = datasource.readInteger();
		if(isNaN(influenceCount) || influenceCount < 0) {
			datasource.setError();
			return null;
		}

		// load all influences of the vertex
		for(var influenceId=0; influenceId<influenceCount; influenceId++) {
			// load data of the influence
			var influence = new Cal3D.CalCoreSubmesh.Influence;
			influence.boneId = datasource.readInteger();
			influence.weight = datasource.readFloat();
			vertex.vectorInfluence.push(influence);

			// check if an error happened
			if(!datasource.ok()) {
				datasource.setError();
				return null;
			}
		}

		// set vertex in the core submesh instance
		coreSubmesh.setVertex(vertexId, vertex);

		// load the physical property of the vertex if there are springs in the core submesh
		if(springCount > 0) {
			var physicalProperty = new Cal3D.CalCoreSubmesh.PhysicalProperty;

			// load data of the physical property
			physicalProperty.weight = datasource.readFloat();

			// check if an error happened
			if(!datasource.ok()) {
				datasource.setError();
				return null;
			}

			// set the physical property in the core submesh instance
			coreSubmesh.setPhysicalProperty(vertexId, physicalProperty);
		}
	}

	// load all springs
	for(var springId=0; springId<springCount; springId++) {
		var spring = new Cal3D.CalCoreSubmesh.Spring;

		// load data of the spring
		spring.vertexId[0] = datasource.readInteger();
		spring.vertexId[1] = datasource.readInteger();
		spring.springCoefficient = datasource.readFloat();
		spring.idleLength = datasource.readFloat();

		// check if an error happened
		if(!datasource.ok()) {
			datasource.setError();
			return null;
		}

		// set spring in the core submesh instance
		coreSubmesh.setSpring(springId, spring);
	}


	// load all faces
	var justOnce = 0;
	var flipModel = false;
	for(var faceId=0; faceId<faceCount; faceId++) {
		var face = new Cal3D.CalCoreSubmesh.Face;

		// load data of the face
		face.vertexId[0] = datasource.readInteger();
		face.vertexId[1] = datasource.readInteger();
		face.vertexId[2] = datasource.readInteger();

		// check if an error happened
		if(!datasource.ok()) {
			datasource.setError();
			return null;
		}

		// check if left-handed coord system is used by the object
		// can be done only once since the object has one system for all faces
		if(justOnce == 0) {
			// get vertexes of first face
			var vectorVertex = coreSubmesh.getVectorVertex();
			var v1 = vectorVertex[face.vertexId[0]];
			var v2 = vectorVertex[face.vertexId[1]];
			var v3 = vectorVertex[face.vertexId[2]];

			var point1 = new Cal3D.CalVector(v1.position);
			var point2 = new Cal3D.CalVector(v2.position);
			var point3 = new Cal3D.CalVector(v3.position);

			// gets vectors (v1-v2) and (v3-v2)
			var vect1 = Cal3D.vectorSub(point1, point2);
			var vect2 = Cal3D.vectorSub(point3, point2);

			// calculates normal of face
			var cross = Cal3D.vectorCross(vect1, vect2);
			var faceNormal = Cal3D.vectorScalarDiv(cross, cross.length());

			// compare the calculated normal with the normal of a vertex
			var maxNorm = new Cal3D.CalVector(v1.normal);

			// if the two vectors point to the same direction then the poly needs flipping
			// that is if the dot product > 0 it needs flipping
			if (Cal3D.vectorDot(faceNormal, maxNorm) > 0)
				flipModel = true;

			// flip the winding order if the loading flags request it
			if (Cal3D.CalLoader.loadingMode & Cal3D.CalLoader.LOADER_FLIP_WINDING)
				flipModel = !flipModel;

			justOnce = 1;
		}


		// flip if needed
		if(flipModel) {
			var tmp = face.vertexId[1];
			face.vertexId[1] = face.vertexId[2];
			face.vertexId[2] = tmp;
		}

		// set face in the core submesh instance
		coreSubmesh.setFace(faceId, face);
	}

	return coreSubmesh;
};

/**
	@private
*/
Cal3D.CalLoader.loadCoreTrack = function(datasource, skel, duration) {
	if(!datasource.ok()) {
		datasource.setError();
		return null;
	}

	// read the bone id
	var coreBoneId = datasource.readInteger();
	if(isNaN(coreBoneId) || coreBoneId < 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	// create a new core track instance
	var coreTrack = new Cal3D.CalCoreTrack;
	if(!coreTrack.create()) {
		return null;
	}

	// link the core track to the appropriate core bone instance
	coreTrack.setCoreBoneId(coreBoneId);

	// read the number of keyframes
	var keyframeCount = datasource.readInteger();
	if(isNaN(keyframeCount) || keyframeCount <= 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	// load all core keyframes
	for(var keyframeId=0; keyframeId<keyframeCount; keyframeId++) {
		// load the core keyframe
		var coreKeyframe = Cal3D.CalLoader.loadCoreKeyframe(datasource);
		if(!coreKeyframe) {
			coreTrack.destroy();
			return null;
		}

		if(Cal3D.CalLoader.loadingMode & Cal3D.CalLoader.LOADER_ROTATE_X_AXIS) {
			// check for anim rotation
			if (skel && skel.getCoreBone(coreBoneId).getParentId() == -1) {  // root bone
				var x_axis_90 = new Cal3D.CalQuaternion(0.7071067811, 0, 0, 0.7071067811);

				// rotate root bone quaternion
				var rot = new Cal3D.CalQuaternion(coreKeyframe.getRotation());
				rot.multQuaternionLocal(x_axis_90);
				coreKeyframe.setRotation(rot);

				// rotate root bone displacement
				var trans = new Cal3D.CalVector(coreKeyframe.getTranslation());
				trans.multQuaternionLocal(x_axis_90);
				coreKeyframe.setTranslation(trans);
			}
		}    

		// add the core keyframe to the core track instance
		coreTrack.addCoreKeyframe(coreKeyframe);
	}

	return coreTrack;
};

/**
	@private
*/
Cal3D.CalLoader.loadXmlCoreAnimation = function(url, skel, callback) {
	var xhr = new XMLHttpRequest;
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/xml');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				var coreAnim = Cal3D.CalLoader.parseXmlCoreAnimation(this.responseXML, skel);
				if(coreAnim) {
					coreAnim.setFilename(url);
					if(callback && callback.onload) {
						callback.onload(coreAnim, url);
					}
				}
				else if(callback && callback.onerror) {
					callback.onerror(Cal3D.CalError.Code.INVALID_FILE_FORMAT, url);
				}
			}
		}
	};

	xhr.onerror = function() {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js', 0, url);
		if(callback && callback.onerror) {
			callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, url);
		}
	};

	xhr.onprogress = function(evt) {
		if(callback && callback.onprogress) {
			callback.onprogress(evt.position / evt.totalSize, url);
		}
	};

	xhr.send();
};

/**
	@private
*/
Cal3D.CalLoader.loadXmlCoreSkeleton = function(url, callback) {
	var xhr = new XMLHttpRequest;
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/xml');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				var coreSkeleton = Cal3D.CalLoader.parseXmlCoreSkeleton(this.responseXML);
				if(coreSkeleton) {
					if(callback && callback.onload) {
						callback.onload(coreSkeleton, url);
					}
				}
				else if(callback && callback.onerror) {
					callback.onerror(Cal3D.CalError.Code.INVALID_FILE_FORMAT, url);
				}
			}
		}
	};

	xhr.onerror = function() {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js', 0, url);
		if(callback && callback.onerror) {
			callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, url);
		}
	};

	xhr.onprogress = function(evt) {
		if(callback && callback.onprogress) {
			callback.onprogress(evt.position / evt.totalSize, url);
		}
	};

	xhr.send();
};

/**
	@private
*/
Cal3D.CalLoader.loadXmlCoreMesh = function(url, callback) {
	var xhr = new XMLHttpRequest;
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/xml');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				var coreMesh = Cal3D.CalLoader.parseXmlCoreMesh(this.responseXML);
				if(coreMesh) {
					coreMesh.setFilename(url);
					if(callback && callback.onload) {
						callback.onload(coreMesh, url);
					}
				}
				else if(callback && callback.onerror) {
					callback.onerror(Cal3D.CalError.Code.INVALID_FILE_FORMAT, url);
				}
			}
		}
	};

	xhr.onerror = function() {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js', 0, url);
		if(callback && callback.onerror) {
			callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, url);
		}
	};

	xhr.onprogress = function(evt) {
		if(callback && callback.onprogress) {
			callback.onprogress(evt.position / evt.totalSize, url);
		}
	};

	xhr.send();
};

/**
	@private
*/
Cal3D.CalLoader.loadXmlCoreMaterial = function(url, callback) {
	var xhr = new XMLHttpRequest;
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/xml');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				var coreMat = Cal3D.CalLoader.parseXmlCoreMaterial(this.responseXML);
				if(coreMat) {
					coreMat.setFilename(url);
					if(callback && callback.onload) {
						callback.onload(coreMat, url);
					}
				}
				else if(callback && callback.onerror) {
					callback.onerror(Cal3D.CalError.Code.INVALID_FILE_FORMAT, url);
				}
			}
		}
	};

	xhr.onerror = function() {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.FILE_NOT_FOUND, 'loader.js', 0, url);
		if(callback && callback.onerror) {
			callback.onerror(Cal3D.CalError.Code.FILE_NOT_FOUND, url);
		}
	};

	xhr.onprogress = function(evt) {
		if(callback && callback.onprogress) {
			callback.onprogress(evt.position / evt.totalSize, url);
		}
	};

	xhr.send();
};

/**
	@private
*/
Cal3D.CalLoader.parseConfigFile = function(text) {
	var linePattern = /^\s*(\w+)\s*=\s*([^:*?"<>|\r\n]+)\s*$/;

	var ret = {
		path: '', 
		scale: 1, 
		skeletons: [], 
		animations: [], 
		meshes: [], 
		materials: [], 
		userdefined: {}
	};

	var lines = text.split('\n');
	for(var i=0; i<lines.length; i++) {
		var r = linePattern.exec(lines[i]);
		if(!r)
			continue;

		var key   = r[1];
		var value = r[2];

		switch(key)
		{
		case 'path':
			if(ret.path == '') {
				ret.path = value;
				var endChar = ret.path.charAt(ret.path.length - 1);
				if(endChar != '/' && endChar != '\\')
					ret.path += '/';
			}
			break;
		case 'scale':
			ret.scale = parseFloat(value);
			break;
		case 'skeleton':
			ret.skeletons.push(value);
			break;
		case 'animation':
			ret.animations.push(value);
			break;
		case 'mesh':
			ret.meshes.push(value);
			break;
		case 'material':
			ret.materials.push(value);
			break;
		default:
			// this may be a user defined item, just include it in the 'userdefined' slot
			if(!(key in ret.userdefined)) {
				ret.userdefined[key] = [];
			}
			ret.userdefined[key].push(value);
			break;
		}
	}

	return ret;
};

/**
	@private
*/
Cal3D.CalLoader.parseXmlCoreAnimation = function(xmldoc, skel) {
	if(!xmldoc) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	var animationElem = xmldoc.firstChild;
	if(!animationElem || animationElem.tagName != 'ANIMATION') {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	if( animationElem.hasAttribute('MAGIC') && 
		animationElem.getAttribute('MAGIC') != Cal3D.CalLibraryConstants.ANIMATION_XMLFILE_MAGIC ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	if( animationElem.hasAttribute('VERSION') && 
		parseInt(animationElem.getAttribute('VERSION') < Cal3D.CalLibraryConstants.EARLIEST_COMPATIBLE_FILE_VERSION)) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INCOMPATIBLE_FILE_VERSION, 'loader.js');
		return null;
	}

	var duration = parseFloat(animationElem.getAttribute('DURATION'));
	var trackCount = parseInt(animationElem.getAttribute('NUMTRACKS'));

	// create a new core animation instance
	var coreAnimation = new Cal3D.CalCoreAnimation;

	// check for a valid duration
	if(duration <= 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_ANIMATION_DURATION, 'loader.js');
		return null;
	}

	// set the duration in the core animation instance
	coreAnimation.setDuration(duration);

	var trackElem = animationElem.firstElementChild;
	
	// load all core tracks
	for(var trackId=0; trackId<trackCount; trackId++) {
		if(!trackElem || trackElem.tagName != 'TRACK') {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		// create the core track instance
		var coreTrack = new Cal3D.CalCoreTrack;
		if(!coreTrack.create()) {
			return null;
		}

		var coreBoneId = parseInt(trackElem.getAttribute('BONEID'));

		// link the core track to the appropriate core bone instance
		coreTrack.setCoreBoneId(coreBoneId);

		// read the number of keyframes
		var keyframeCount = parseInt(trackElem.getAttribute('NUMKEYFRAMES'));

		if(keyframeCount <= 0) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		var keyframeElem = trackElem.firstElementChild;

		// load all core keyframes
		for(var keyframeId=0; keyframeId<keyframeCount; keyframeId++) {
			// load the core keyframe
			if(!keyframeElem || keyframeElem.tagName != 'KEYFRAME') {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			var time = parseFloat(keyframeElem.getAttribute('TIME'));

			var translationElem = keyframeElem.firstElementChild;
			if(!translationElem || translationElem.tagName != 'TRANSLATION') {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			var r = Cal3D.CalLoader.pattern_float3.exec(translationElem.textContent);
			if(!r) {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			var tx, ty, tz;
			tx = parseFloat(r[1]);
			ty = parseFloat(r[2]);
			tz = parseFloat(r[3]);

			var rotationElem = translationElem.nextElementSibling;
			if(!rotationElem || rotationElem.tagName != 'ROTATION') {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			r = Cal3D.CalLoader.pattern_float4.exec(rotationElem.textContent);
			if(!r) {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			var rx, ry, rz, rw;
			rx = parseFloat(r[1]);
			ry = parseFloat(r[2]);
			rz = parseFloat(r[3]);
			rw = parseFloat(r[4]);

			// create a new core keyframe instance
			var coreKeyframe = new Cal3D.CalCoreKeyframe;
			if(!coreKeyframe.create()) {
				return null;			  
			}
			// set all attributes of the keyframe
			coreKeyframe.setTime(time);
			coreKeyframe.setTranslation(new Cal3D.CalVector(tx, ty, tz));
			coreKeyframe.setRotation(new Cal3D.CalQuaternion(rx, ry, rz, rw));

			if(Cal3D.CalLoader.loadingMode & Cal3D.CalLoader.LOADER_ROTATE_X_AXIS) {
				// check for anim rotation
				if(skel && skel.getCoreBone(coreBoneId).getParentId() == -1) {	// root bone
					// rotate root bone quaternion
					var x_axis_90 = new Cal3D.CalQuaternion(0.7071067811, 0, 0, 0.7071067811);

					var rot = new Cal3D.CalQuaternion(coreKeyframe.getRotation());
					rot.multQuaternionLocal(x_axis_90);
					coreKeyframe.setRotation(rot);

					// rotate root bone displacement
					var trans = new Cal3D.CalVector(coreKeyframe.getTranslation());
					trans.multQuaternionLocal(x_axis_90);
					coreKeyframe.setTranslation(trans);
				}
			}    

			// add the core keyframe to the core track instance
			coreTrack.addCoreKeyframe(coreKeyframe);

			// go to next keyframe
			keyframeElem = keyframeElem.nextElementSibling;
		}

		coreAnimation.addCoreTrack(coreTrack);

		// go to next track
		trackElem = trackElem.nextElementSibling;
	}

	return coreAnimation;
};

/**
	@private
*/
Cal3D.CalLoader.parseXmlCoreSkeleton = function(xmldoc) {
	if(!xmldoc) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	var skeletonElem = xmldoc.firstChild;
	if(!skeletonElem || skeletonElem.tagName != 'SKELETON') {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	if( skeletonElem.hasAttribute('MAGIC') && 
		skeletonElem.getAttribute('MAGIC') != Cal3D.CalLibraryConstants.SKELETON_XMLFILE_MAGIC ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	if( skeletonElem.hasAttribute('VERSION') && 
		parseInt(skeletonElem.getAttribute('VERSION')) < Cal3D.CalLibraryConstants.EARLIEST_COMPATIBLE_FILE_VERSION ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INCOMPATIBLE_FILE_VERSION, 'loader.js');
		return null;
	}

	// create a new core skeleton instance
	var coreSkeleton = new Cal3D.CalCoreSkeleton();

	var boneCount = parseInt(skeletonElem.getAttribute('NUMBONES'));

	var boneElem = skeletonElem.firstElementChild;
	for(; boneElem; boneElem=boneElem.nextElementSibling) {
		if(boneElem.tagName != 'BONE') {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}    

		var name = boneElem.getAttribute('NAME');

		// get the translation of the bone

		var translationElem = boneElem.firstElementChild;
		if(!translationElem || translationElem.tagName != 'TRANSLATION') {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		var r = Cal3D.CalLoader.pattern_float3.exec(translationElem.textContent);
		if(!r) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		var tx, ty, tz;
		tx = parseFloat(r[1]);
		ty = parseFloat(r[2]);
		tz = parseFloat(r[3]);

		// get the rotation of the bone

		var rotationElem = translationElem.nextElementSibling;
		if(!rotationElem || rotationElem.tagName != 'ROTATION') {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		r = Cal3D.CalLoader.pattern_float4.exec(rotationElem.textContent);
		if(!r) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		var rx, ry, rz, rw;
		rx = parseFloat(r[1]);
		ry = parseFloat(r[2]);
		rz = parseFloat(r[3]);
		rw = parseFloat(r[4]);

		// get the bone space translation of the bone

		var translationBoneSpaceElem = rotationElem.nextElementSibling;
		if(!translationBoneSpaceElem || translationBoneSpaceElem.tagName != 'LOCALTRANSLATION') {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		r = Cal3D.CalLoader.pattern_float3.exec(translationBoneSpaceElem.textContent);
		if(!r) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		var txBoneSpace, tyBoneSpace, tzBoneSpace;
		txBoneSpace = parseFloat(r[1]);
		tyBoneSpace = parseFloat(r[2]);
		tzBoneSpace = parseFloat(r[3]);

		// get the bone space rotation of the bone

		var rotationBoneSpaceElem = translationBoneSpaceElem.nextElementSibling;
		if(!rotationBoneSpaceElem || rotationBoneSpaceElem.tagName != 'LOCALROTATION') {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		r = Cal3D.CalLoader.pattern_float4.exec(rotationBoneSpaceElem.textContent);
		if(!r) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		var rxBoneSpace, ryBoneSpace, rzBoneSpace, rwBoneSpace;
		rxBoneSpace = parseFloat(r[1]);
		ryBoneSpace = parseFloat(r[2]);
		rzBoneSpace = parseFloat(r[3]);
		rwBoneSpace = parseFloat(r[4]);

		// get the parent bone id

		var parentElem = rotationBoneSpaceElem.nextElementSibling;
		if(!parentElem || parentElem.tagName != 'PARENTID') {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		var parentId = parseInt(parentElem.textContent);

		// create a new core bone instance
		var coreBone = new Cal3D.CalCoreBone(name);

		// set parent of the bone
		coreBone.setParentId(parentId);

		// set all attributes of the bone

		var trans = new Cal3D.CalVector(tx, ty, tz);
		var rot = new Cal3D.CalQuaternion(rx, ry, rz, rw);

		if (Cal3D.CalLoader.loadingMode & Cal3D.CalLoader.LOADER_ROTATE_X_AXIS) {
			if(parentId == -1) {	// only root bone necessary
				var x_axis_90 = new Cal3D.CalQuaternion(0.7071067811, 0, 0, 0.7071067811);
				// root bone must have quaternion rotated
				rot.multQuaternionLocal(x_axis_90);
				// Root bone must have translation rotated also
				trans.multQuaternionLocal(x_axis_90);
			}
		}    

		coreBone.setTranslation(trans);
		coreBone.setRotation(rot);
		coreBone.setTranslationBoneSpace(new Cal3D.CalVector(txBoneSpace, tyBoneSpace, tzBoneSpace));
		coreBone.setRotationBoneSpace(new Cal3D.CalQuaternion(rxBoneSpace, ryBoneSpace, rzBoneSpace, rwBoneSpace));

		var childElem = parentElem.nextElementSibling;
		for(; childElem; childElem=childElem.nextElementSibling) {
			if(childElem.tagName != 'CHILDID') {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			var childId = parseInt(childElem.textContent);
			coreBone.addChildId(childId);
		}

		// set the core skeleton of the core bone instance
		coreBone.setCoreSkeleton(coreSkeleton);

		// add the core bone to the core skeleton instance
		coreSkeleton.addCoreBone(coreBone);

	}

	coreSkeleton.calculateState();

	return coreSkeleton;
};

/**
	@private
*/
Cal3D.CalLoader.parseXmlCoreMesh = function(xmldoc) {
	if(!xmldoc) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	var meshElem = xmldoc.firstChild;
	if(!meshElem || meshElem.tagName != 'MESH') {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	if( meshElem.hasAttribute('MAGIC') && 
		meshElem.getAttribute('MAGIC') != Cal3D.CalLibraryConstants.MESH_XMLFILE_MAGIC ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	if( meshElem.hasAttribute('VERSION') && 
		parseInt(meshElem.getAttribute('VERSION')) < Cal3D.CalLibraryConstants.EARLIEST_COMPATIBLE_FILE_VERSION ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INCOMPATIBLE_FILE_VERSION, 'loader.js');
		return null;
	}

	// get the number of submeshes
	var submeshCount = parseInt(meshElem.getAttribute('NUMSUBMESH'));

	// create a new core mesh instance
	var coreMesh = new Cal3D.CalCoreMesh;

	var submeshElem = meshElem.firstElementChild;

	// load all core submeshes
	for(var submeshId=0; submeshId<submeshCount; submeshId++) {
		if(!submeshElem || submeshElem.tagName != 'SUBMESH') {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		// get the material thread id of the submeshElem
		var coreMaterialThreadId = parseInt(submeshElem.getAttribute('MATERIAL'));

		// get the number of vertices
		var vertexCount = parseInt(submeshElem.getAttribute('NUMVERTICES'));

		// get the number of faces
		var faceCount = parseInt(submeshElem.getAttribute('NUMFACES'));

		// get the number of level-of-details
		var lodCount = parseInt(submeshElem.getAttribute('NUMLODSTEPS'));

		// get the number of springs
		var springCount = parseInt(submeshElem.getAttribute('NUMSPRINGS'));

		// get the number of texture coordinates
		var textureCoordinateCount = parseInt(submeshElem.getAttribute('NUMTEXCOORDS'));

		// create a new core submesh instance
		var coreSubmesh = new Cal3D.CalCoreSubmesh();

		// set the LOD step count
		coreSubmesh.setLodCount(lodCount);

		// set the core material id
		coreSubmesh.setCoreMaterialThreadId(coreMaterialThreadId);

		// reserve space for all the submesh data
		if(!coreSubmesh.reserve(vertexCount, textureCoordinateCount, faceCount, springCount)) {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.MEMORY_ALLOCATION_FAILED, 'loader.js');
			return null;
		}

		var vertexElem = submeshElem.firstElementChild;

		// load all vertices and their influences
		for(var vertexId=0; vertexId<vertexCount; vertexId++) {
			if(!vertexElem || vertexElem.tagName != 'VERTEX') {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}      

			var vertex = new Cal3D.CalCoreSubmesh.Vertex;

			var posElem = vertexElem.firstElementChild;
			if(!posElem || posElem.tagName != 'POS') {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			var r = Cal3D.CalLoader.pattern_float3.exec(posElem.textContent);
			if(!r) {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			vertex.position.x = parseFloat(r[1]);
			vertex.position.y = parseFloat(r[2]);
			vertex.position.z = parseFloat(r[3]);

			var normElem = posElem.nextElementSibling;
			if(!normElem || normElem.tagName != 'NORM') {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			r = Cal3D.CalLoader.pattern_float3.exec(normElem.textContent);
			if(!r) {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			vertex.normal.x = parseFloat(r[1]);
			vertex.normal.y = parseFloat(r[2]);
			vertex.normal.z = parseFloat(r[3]);

			var collapseElem = normElem.nextElementSibling;
			if(collapseElem && collapseElem.tagName == 'COLLAPSEID') {
				vertex.collapseId = parseInt(collapseElem.textContent);

				var collapseCountElem = collapseElem.nextElementSibling;
				if(!collapseCountElem || collapseCountElem.tagName != 'COLLAPSECOUNT') {
					Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
					return null;
				}

				vertex.faceCollapseCount = parseInt(collapseCountElem.textContent);

				collapseElem = collapseCountElem.nextElementSibling;
			}
			else {
				vertex.collapseId = -1;
				vertex.faceCollapseCount = 0;
			}


			var texcoordElem = collapseElem;

			// load all texture coordinates of the vertex
			for(var textureCoordinateId=0; textureCoordinateId<textureCoordinateCount; textureCoordinateId++) {
				if(!texcoordElem || texcoordElem.tagName != 'TEXCOORD') {
					Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
					return null;
				}

				// load texture coordinate
				var textureCoordinate = new Cal3D.CalCoreSubmesh.TextureCoordinate;

				var r = Cal3D.CalLoader.pattern_float2.exec(texcoordElem.textContent);
				if(!r) {
					Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
					return null;
				}

				textureCoordinate.u = parseFloat(r[1]);
				textureCoordinate.v = parseFloat(r[2]);

				if(Cal3D.CalLoader.loadingMode & Cal3D.CalLoader.LOADER_INVERT_V_COORD) {
					textureCoordinate.v = 1 - textureCoordinate.v;
				}

				// set texture coordinate into the core submesh instance
				coreSubmesh.setTextureCoordinate(vertexId, textureCoordinateId, textureCoordinate);

				// go to next texture coordinate
				texcoordElem = texcoordElem.nextElementSibling;
			}

			// get the number of influences
			var influenceCount = parseInt(vertexElem.getAttribute('NUMINFLUENCES'));
			if(influenceCount < 0) {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			var influenceElem = texcoordElem;

			// load all influences of the vertex
			for(var influenceId=0; influenceId<influenceCount; influenceId++) {
				if(!influenceElem || influenceElem.tagName != 'INFLUENCE') {
					Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
					return null;
				}

				var influence = new Cal3D.CalCoreSubmesh.Influence;
				influence.boneId = parseInt(influenceElem.getAttribute('ID'));
				influence.weight = parseFloat(influenceElem.textContent);
				vertex.vectorInfluence.push(influence);

				// go to next influence
				influenceElem = influenceElem.nextElementSibling;
			}

			// set vertex in the core submesh instance
			coreSubmesh.setVertex(vertexId, vertex);

			var physiqueElem = influenceElem;

			// load the physical property of the vertex if there are springs in the core submesh
			if(springCount > 0) {
				if(!physiqueElem || physiqueElem.tagName != 'PHYSIQUE') {
					Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
					return null;
				}

				var physicalProperty = new Cal3D.CalCoreSubmesh.PhysicalProperty;
				physicalProperty.weight = parseFloat(physiqueElem.textContent);

				// set the physical property in the core submesh instance
				coreSubmesh.setPhysicalProperty(vertexId, physicalProperty);          
			}

			// go to next vertex
			vertexElem = vertexElem.nextElementSibling;
		}

		var springElem = vertexElem;

		// load all springs
		for(var springId=0; springId<springCount; springId++) {
			if(!springElem || springElem.tagName != 'SPRING') {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			var spring = new Cal3D.CalCoreSubmesh.Spring;

			var r = Cal3D.CalLoader.pattern_int2.exec(springElem.getAttribute('VERTEXID'));
			if(!r) {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			spring.vertexId[0] = parseInt(r[1]);
			spring.vertexId[1] = parseInt(r[2]);
			spring.springCoefficient = parseFloat(springElem.getAttribute('COEF'));
			spring.idleLength = parseFloat(springElem.getAttribute('LENGTH'));

			// set spring in the core submesh instance
			coreSubmesh.setSpring(springId, spring);

			// go to next spring
			springElem = springElem.nextElementSibling;
		}

		var faceElem = springElem;

		// load all faces
		for(var faceId=0; faceId<faceCount; faceId++) {
			if(!faceElem || faceElem.tagName != 'FACE') {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			var face = new Cal3D.CalCoreSubmesh.Face;

			// load data of the face
			var r = Cal3D.CalLoader.pattern_int3.exec(faceElem.getAttribute('VERTEXID'));
			if(!r) {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
				return null;
			}

			face.vertexId[0] = parseInt(r[1]);
			face.vertexId[1] = parseInt(r[2]);
			face.vertexId[2] = parseInt(r[3]);

			coreSubmesh.setFace(faceId, face);

			// go to next face
			faceElem = faceElem.nextElementSibling;
		}

		// add the core submesh to the core mesh instance
		coreMesh.addCoreSubmesh(coreSubmesh);

		// go to next submesh
		submeshElem = submeshElem.nextElementSibling;
	}

	return coreMesh;
};

/**
	@private
*/
Cal3D.CalLoader.parseXmlCoreMaterial = function(xmldoc) {
	if(!xmldoc) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	var materialElem = xmldoc.firstChild;
	if(!materialElem || materialElem.tagName != 'MATERIAL') {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	if( materialElem.hasAttribute('MAGIC') && 
		materialElem.getAttribute('MAGIC') != Cal3D.CalLibraryConstants.MATERIAL_XMLFILE_MAGIC ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	if( materialElem.hasAttribute('VERSION') &&
		parseInt(materialElem.getAttribute('VERSION')) < Cal3D.CalLibraryConstants.EARLIEST_COMPATIBLE_FILE_VERSION ) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INCOMPATIBLE_FILE_VERSION, 'loader.js');
		return null;
	}

	// create a new core material instance
	var coreMaterial = new Cal3D.CalCoreMaterial;

	// read ambient color

	var ambientElem = materialElem.firstElementChild;
	if(!ambientElem || ambientElem.tagName != 'AMBIENT') {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	var ambientColor = new Cal3D.CalCoreMaterial.Color;

	var r = Cal3D.CalLoader.pattern_int4.exec(ambientElem.textContent);
	if(!r) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	ambientColor.red   = parseInt(r[1]);
	ambientColor.green = parseInt(r[2]);
	ambientColor.blue  = parseInt(r[3]);
	ambientColor.alpha = parseInt(r[4]);

	// read diffuse color

	var diffuseElem = ambientElem.nextElementSibling;
	if(!diffuseElem || diffuseElem.tagName != 'DIFFUSE') {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	var diffuseColor = new Cal3D.CalCoreMaterial.Color;
	
	r = Cal3D.CalLoader.pattern_int4.exec(diffuseElem.textContent);
	if(!r) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	diffuseColor.red   = parseInt(r[1]);
	diffuseColor.green = parseInt(r[2]);
	diffuseColor.blue  = parseInt(r[3]);
	diffuseColor.alpha = parseInt(r[4]);

	// read specular color

	var specularElem = diffuseElem.nextElementSibling;
	if(!specularElem || specularElem.tagName != 'SPECULAR') {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	var specularColor = new Cal3D.CalCoreMaterial.Color;

	r = Cal3D.CalLoader.pattern_int4.exec(specularElem.textContent);
	if(!r) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	specularColor.red   = parseInt(r[1]);
	specularColor.green = parseInt(r[2]);
	specularColor.blue  = parseInt(r[3]);
	specularColor.alpha = parseInt(r[4]);

	// read shininess 

	var shininessElem = specularElem.nextElementSibling;
	if(!shininessElem || shininessElem.tagName != 'SHININESS') {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
		return null;
	}

	var shininess = parseFloat(shininessElem.textContent);

	// set the colors and the shininess
	coreMaterial.setAmbientColor(ambientColor);
	coreMaterial.setDiffuseColor(diffuseColor);
	coreMaterial.setSpecularColor(specularColor);
	coreMaterial.setShininess(shininess);

	var matFilenames = [];

	var mapElem = shininessElem.nextElementSibling;
	for(; mapElem; mapElem=mapElem.nextElementSibling) {
		if(!mapElem || mapElem.tagName != 'MAP') {
			Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_FILE_FORMAT, 'loader.js');
			return null;
		}

		matFilenames.push(mapElem.textContent);
	}

	coreMaterial.reserve(matFilenames.length);

	for(var mapId=0; mapId<matFilenames.length; mapId++) {
		var map = new Cal3D.CalCoreMaterial.Map;

		map.filename = matFilenames[mapId];    
		map.userData = null;

		// set map in the core material instance
		coreMaterial.setMap(mapId, map);
	}

	return coreMaterial;
};

/**
	@private
*/
Cal3D.CalLoader.loadingMode = 0;

/**
	@private
*/
Cal3D.CalLoader.pattern_int2 = /([-+]?\b\d+\b)\s+([-+]?\b\d+\b)/;

/**
	@private
*/
Cal3D.CalLoader.pattern_int3 = /([-+]?\b\d+\b)\s+([-+]?\b\d+\b)\s+([-+]?\b\d+\b)/;

/**
	@private
*/
Cal3D.CalLoader.pattern_int4 = /([-+]?\b\d+\b)\s+([-+]?\b\d+\b)\s+([-+]?\b\d+\b)\s+([-+]?\b\d+\b)/;

/**
	@private
*/
Cal3D.CalLoader.pattern_float2 = /([-+]?\b(?:[0-9]*\.)?[0-9]+(?:[eE][-+]?[0-9]+)?\b)\s+([-+]?\b(?:[0-9]*\.)?[0-9]+(?:[eE][-+]?[0-9]+)?\b)/;

/**
	@private
*/
Cal3D.CalLoader.pattern_float3 = /([-+]?\b(?:[0-9]*\.)?[0-9]+(?:[eE][-+]?[0-9]+)?\b)\s+([-+]?\b(?:[0-9]*\.)?[0-9]+(?:[eE][-+]?[0-9]+)?\b)\s+([-+]?\b(?:[0-9]*\.)?[0-9]+(?:[eE][-+]?[0-9]+)?\b)/;

/**
	@private
*/
Cal3D.CalLoader.pattern_float4 = /([-+]?\b(?:[0-9]*\.)?[0-9]+(?:[eE][-+]?[0-9]+)?\b)\s+([-+]?\b(?:[0-9]*\.)?[0-9]+(?:[eE][-+]?[0-9]+)?\b)\s+([-+]?\b(?:[0-9]*\.)?[0-9]+(?:[eE][-+]?[0-9]+)?\b)\s+([-+]?\b(?:[0-9]*\.)?[0-9]+(?:[eE][-+]?[0-9]+)?\b)/;
