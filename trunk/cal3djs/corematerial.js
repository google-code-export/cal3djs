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
	@class CalCoreMaterial
*/
Cal3D.CalCoreMaterial = function() {
	this.m_ambientColor = new Cal3D.CalCoreMaterial.Color;
	this.m_diffuseColor = new Cal3D.CalCoreMaterial.Color;
	this.m_specularColor = new Cal3D.CalCoreMaterial.Color;
	this.m_shininess = 0;
	this.m_vectorMap = [];
	this.m_userData = null;
	this.m_name = '';
	this.m_filename = '';
};

/**
	Get the ambient color.<br />
	This function returns the ambient color of the core material instance.
	@returns {Cal3D.CalCoreMaterial.Color} The ambient color.
*/
Cal3D.CalCoreMaterial.prototype.getAmbientColor = function() {
	return this.m_ambientColor;
};

/**
	Get the diffuse color.<br />
	This function returns the diffuse color of the core material instance.
	@returns {Cal3D.CalCoreMaterial.Color} The diffuse color.
*/
Cal3D.CalCoreMaterial.prototype.getDiffuseColor = function() {
	return this.m_diffuseColor;
};

/**
	Get the number of texture maps.<br />
	This function returns the number of texture mapss in the core material instance.
	@returns {number} The number of texture maps.
*/
Cal3D.CalCoreMaterial.prototype.getMapCount = function() {
	return this.m_vectorMap.length;
};

/**
	Get a specified map texture filename.<br />
	This function returns the texture filename for a specified map ID of the core material instance.
	@param {number} mapId The ID of the texture map.
	@returns {string} The filename of the map texture. An empty string will be returned if the map does not exist.
*/
Cal3D.CalCoreMaterial.prototype.getMapFilename = function(mapId) {
	if(mapId < 0 || mapId >= this.m_vectorMap.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'corematerial.js');
		return '';
	}

	var map = this.m_vectorMap[mapId];
	if(!map)
		return '';

	return map.filename;
};

/**
	Get user data of a specified textue map.<br />
	This function returns the user data stored in the specified map of the core material instance.
	@param {number} mapId The ID of the texture map.
	@returns {object} The user data stored in the specified map; null if the map does not exist.
*/
Cal3D.CalCoreMaterial.prototype.getMapUserData = function(mapId) {
	if(mapId < 0 || mapId >= this.m_vectorMap.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'corematerial.js');
		return null;
	}

	var map = this.m_vectorMap[mapId];
	if(!map)
		return null;

	return map.userData;
};

/**
	Get the shininess factor.<br />
	This function returns the shininess factor of the core material instance.
	@returns {number} The shininess factor.
*/
Cal3D.CalCoreMaterial.prototype.getShininess = function() {
	return this.m_shininess;
};

/**
	Get the specular color.<br />
	This function returns the specular color of the core material instance.
	@returns {Cal3D.CalCoreMaterial.Color} The specular color.
*/
Cal3D.CalCoreMaterial.prototype.getSpecularColor = function() {
	return this.m_specularColor;
};

/**
	Get the user data stored in this core material.<br />
	This function returns the user data stored in the core material instance.
	@returns {object} The user data stored in the core material.
*/
Cal3D.CalCoreMaterial.prototype.getUserData = function() {
	return this.m_userData;
};

/**
	Get the map array.<br />
	This function returns the array that contains all maps of the core material instance.
	@returns {array} The map array.
*/
Cal3D.CalCoreMaterial.prototype.getVectorMap = function() {
	return this.m_vectorMap;
};

/**
	Allocate space for the maps<br />
	This function reserves space for the maps of the core material instance.
	@param {number} mapCount The number of maps that this core material should holds.
	@returns {boolean} true, if succeeded; false if failed.
*/
Cal3D.CalCoreMaterial.prototype.reserve = function(mapCount) {
	this.m_vectorMap = new Array(mapCount);
	return true;
};

/**
	Set the ambient color.<br />
	This function sets the ambient color of the core material instance.
	@param {Cal3D.CalCoreMaterial.Color} ambientColor The ambient color to set.
*/
Cal3D.CalCoreMaterial.prototype.setAmbientColor = function(ambientColor) {
	this.m_ambientColor.red = ambientColor.red;
	this.m_ambientColor.green = ambientColor.green;
	this.m_ambientColor.blue = ambientColor.blue;
	this.m_ambientColor.alpha = ambientColor.alpha;
};

/**
	Set the diffuse color.<br />
	This function sets the diffuse color of the core material instance.
	@param {Cal3D.CalCoreMaterial.Color} diffuseColor The diffuse color to set.
*/
Cal3D.CalCoreMaterial.prototype.setDiffuseColor = function(diffuseColor) {
	this.m_diffuseColor.red = diffuseColor.red;
	this.m_diffuseColor.green = diffuseColor.green;
	this.m_diffuseColor.blue = diffuseColor.blue;
	this.m_diffuseColor.alpha = diffuseColor.alpha;
};

/**
	Set a specified texture map.<br />
	This function sets a specified map in the core material instance.
	@param {number} mapId The ID of the map.
	@param {Cal3D.CalCoreMaterial.Map} map The map to be set.
	@returns {boolean} true if succeeded; false if the map does not exist.
*/
Cal3D.CalCoreMaterial.prototype.setMap = function(mapId, map) {
	if(mapId < 0 || mapId >= this.m_vectorMap.length)
		return false;

	this.m_vectorMap[mapId] = map;
	return true;
};

/**
	Store specified map user data.<br />
	This function stores user data in a specified map of the core material instance.
	@param {number} mapId The ID of the map.
	@param {object} userData The map to be set.
	@returns {boolean} true if succeeded; false if the map does not exist.
*/
Cal3D.CalCoreMaterial.prototype.setMapUserData = function(mapId, userData) {
	if(mapId < 0 || mapId >= this.m_vectorMap.length)
		return false;

	var map = this.m_vectorMap[mapId];
	if(!map)
		return false;

	map.userData = userData;
	return true;
};

/**
	Set the shininess factor.<br />
	This function sets the shininess factor of the core material instance.
	@param {number} shininess The shininess factor to be set.
*/
Cal3D.CalCoreMaterial.prototype.setShininess = function(shininess) {
	this.m_shininess = shininess;
};

/**
	Set the specular color.<br />
	This function sets the specular color of the core material instance.
	@param {Cal3D.CalCoreMaterial.Color} ambientColor The specular color to be set.
*/
Cal3D.CalCoreMaterial.prototype.setSpecularColor = function(specularColor) {
	this.m_specularColor.red = specularColor.red;
	this.m_specularColor.green = specularColor.green;
	this.m_specularColor.blue = specularColor.blue;
	this.m_specularColor.alpha = specularColor.alpha;
};

/**
	Set the name of the file in which the core material is stored, if any.<br />
	@param {string} filename The file name.
*/
Cal3D.CalCoreMaterial.prototype.setFilename = function(filename) {
	this.m_filename = filename;
};

/**
	Get the name of the file in which the core material is stored, if any.<br />
	@returns {string} The file name. An empty string will be returned if the material is not stored in a file.
*/
Cal3D.CalCoreMaterial.prototype.getFilename = function() {
	return this.m_filename;
};

/**
	Set the symbolic name of the core material.<br />
	@param {string} name The symbolic name to be set.
*/
Cal3D.CalCoreMaterial.prototype.setName = function(name) {
	this.m_name = name;
};

/**
	Get the symbolic name of the core material.<br />
	@returns {string} The symbolic name of the material. An empty string will be returned if the material is not associated to a symbolic name yet.
*/
Cal3D.CalCoreMaterial.prototype.getName = function() {
	return this.m_name;
};

/**
	Store user data.<br />
	This function stores user data in the core material instance.
	@param {object} userData The use data to be stored in this material.
*/
Cal3D.CalCoreMaterial.prototype.setUserData = function(userData) {
	this.m_userData = userData;
};


/**
	@class Color

	The core material color structure.
*/
Cal3D.CalCoreMaterial.Color = function() {
	this.red = 0;
	this.green = 0;
	this.blue = 0;
	this.alpha = 0;
};



/**
	@class Map

	The core material map structure.
*/
Cal3D.CalCoreMaterial.Map = function() {
	this.filename = '';
	this.userData = null;
};
