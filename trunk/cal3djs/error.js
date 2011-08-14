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
	@namespace CalError
*/
Cal3D.CalError = {};

/**
	The error code enumerations.
*/
Cal3D.CalError.Code = {
	OK:							0, 
	INTERNAL:					1, 
	INVALID_HANDLE:				2, 
	MEMORY_ALLOCATION_FAILED:	3, 
	FILE_NOT_FOUND:				4, 
	INVALID_FILE_FORMAT:		5, 
	FILE_PARSER_FAILED:			6, 
	INDEX_BUILD_FAILED:			7, 
	NO_PARSER_DOCUMENT:			8, 
	INVALID_ANIMATION_DURATION:	9, 
	BONE_NOT_FOUND:				10, 
	INVALID_ATTRIBUTE_VALUE:	11, 
	INVALID_KEYFRAME_COUNT:		12, 
	INVALID_ANIMATION_TYPE:		13, 
	FILE_CREATION_FAILED:		14, 
	FILE_WRITING_FAILED:		15, 
	INCOMPATIBLE_FILE_VERSION:	16, 
	NO_MESH_IN_MODEL:			17, 
	BAD_DATA_SOURCE:			18, 
	NULL_BUFFER:				19, 
	INVALID_MIXER_TYPE:			20, 
	MAX_ERROR_CODE:				21
};

/**
	Get the code of the last error.<br />
	@returns {number} The code of the last error.
*/
Cal3D.CalError.getLastErrorCode = function() {
	return Cal3D.CalError.m_lastErrorCode;
};

/**
	Get the name of the source file where the last error occured.<br />
	@returns {string} The name of the file where the last error occured.
*/
Cal3D.CalError.getLastErrorFile = function() {
	return Cal3D.CalError.m_lastErrorFile;
};

/**
	Get the line number in the source file where the last error occured.<br />
	@returns {number} The line number where the last error occured.
*/
Cal3D.CalError.getLastErrorLine = function() {
	return Cal3D.CalError.m_lastErrorLine;
};

/**
	Get the supplementary description of the last error.<br />
	@returns {string} The supplementary description of the last error.
*/
Cal3D.CalError.getLastErrorText = function() {
	return Cal3D.CalError.m_lastErrorText;
};

/**
	Dump all information about the last error to the standard output.<br />
*/
Cal3D.CalError.printLastError = function() {
	throw 'not implemented error';
};

/**
	Set all the information about the last error.<br />
	@param {number} code The code of the last error.
	@param {string} filename The name of the source file where the last error occured.
	@param {number} line The line number in the source file where the last error occured.
	@param {string} text The supplementary description of the last error.
*/
Cal3D.CalError.setLastError = function(code, filename, line, text) {
	if(code >= Cal3D.CalError.Code.MAX_ERROR_CODE)
		code = Cal3D.CalError.Code.INTERNAL;

	Cal3D.CalError.m_lastErrorCode = code;
	Cal3D.CalError.m_lastErrorFile = (filename != undefined) ? filename : '';
	Cal3D.CalError.m_lastErrorLine = (line != undefined) ? line : -1;
	Cal3D.CalError.m_lastErrorText = (text != undefined) ? text: '';
};

/**
	Get description of a given error.<br />
	@param {number} code The error code.
	@returns {string} The description of the given error code.
*/
Cal3D.CalError.getErrorDescription = function(code) {
	switch(code)
	{
	case Cal3D.CalError.Code.OK:                         return 'No error found';
	case Cal3D.CalError.Code.INTERNAL:                   return 'Internal error';
	case Cal3D.CalError.Code.INVALID_HANDLE:             return 'Invalid handle as argument';
	case Cal3D.CalError.Code.MEMORY_ALLOCATION_FAILED:   return 'Memory allocation failed';
	case Cal3D.CalError.Code.FILE_NOT_FOUND:             return 'File not found';
	case Cal3D.CalError.Code.INVALID_FILE_FORMAT:        return 'Invalid file format';
	case Cal3D.CalError.Code.FILE_PARSER_FAILED:         return 'Parser failed to process file';
	case Cal3D.CalError.Code.INDEX_BUILD_FAILED:         return 'Building of the index failed';
	case Cal3D.CalError.Code.NO_PARSER_DOCUMENT:         return 'There is no document to parse';
	case Cal3D.CalError.Code.INVALID_ANIMATION_DURATION: return 'The duration of the animation is invalid';
	case Cal3D.CalError.Code.BONE_NOT_FOUND:             return 'Bone not found';
	case Cal3D.CalError.Code.INVALID_ATTRIBUTE_VALUE:    return 'Invalid attribute value';
	case Cal3D.CalError.Code.INVALID_KEYFRAME_COUNT:     return 'Invalid number of keyframes';
	case Cal3D.CalError.Code.INVALID_ANIMATION_TYPE:     return 'Invalid animation type';
	case Cal3D.CalError.Code.FILE_CREATION_FAILED:       return 'Failed to create file';
	case Cal3D.CalError.Code.FILE_WRITING_FAILED:        return 'Failed to write to file';
	case Cal3D.CalError.Code.INCOMPATIBLE_FILE_VERSION:  return 'Incompatible file version';
	case Cal3D.CalError.Code.NO_MESH_IN_MODEL:           return 'No mesh attached to the model';
	case Cal3D.CalError.Code.BAD_DATA_SOURCE:            return 'Cannot read from data source';
	case Cal3D.CalError.Code.NULL_BUFFER:                return 'Memory buffer is null';
	case Cal3D.CalError.Code.INVALID_MIXER_TYPE:         return 'The CalModel mixer is not a CalMixer instance';
	default:											 return 'Unknown error';
	}
};

/**
	Get description of the last error.<br />
	@returns {string} The description of the last error.
*/
Cal3D.CalError.getLastErrorDescription = function() {
	return Cal3D.CalError.getErrorDescription(Cal3D.CalError.getLastErrorCode());
};

Cal3D.CalError.m_lastErrorCode = Cal3D.CalError.Code.OK;
Cal3D.CalError.m_lastErrorFile = '';
Cal3D.CalError.m_lastErrorLine = -1;
Cal3D.CalError.m_lastErrorText = '';
