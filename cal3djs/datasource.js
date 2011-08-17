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
	@class CalBufferSource
*/
Cal3D.CalBufferSource = function(inputBuffer) {
	this.m_buffer = inputBuffer;
	this.m_offset = 0;
};

/**
	Check if the buffer source is in good state.<br />
	@returns {boolean} true if the buffer source is in good state; false if not.
*/
Cal3D.CalBufferSource.prototype.ok = function() {
	return this.m_buffer != null;
};

/**
	Set the error code and message related to a the buffer source.
*/
Cal3D.CalBufferSource.prototype.setError = function() {
	Cal3D.CalError.setLastError(Cal3D.CalError.Code.NULL_BUFFER, 'datasource.js');
};

/**
	Read a given number of bytes from the buffer source.<br />
	@param {Array} The array where the bytes are stored into.
	@param {number} count The number of bytes to be read.
	@returns {number} The number of bytes that was actually read.
*/
Cal3D.CalBufferSource.prototype.readBytes = function(buffer, count) {
	if(!this.ok() || !buffer || count <= 0)
		return 0;

	if(this.m_offset + count > this.m_buffer.length)
		count = this.m_buffer.length - this.m_offset;

	for(var i=0; i<count; i++) {
		buffer[i] = this.m_buffer[this.m_offset + i].charCodeAt(0) & 0xff;
	}
	this.m_offset += count;

	return count;
};

/**
	Read a 32-bits little endian float number from the buffer source.<br />
	@returns {number} The float value. NaN will be returned if any error happened.
*/
Cal3D.CalBufferSource.prototype.readFloat = function() {
	if(!this.ok())
		return NaN;

	if(this.m_offset + 4 > this.m_buffer.length)
		return NaN;

	var mLen = 23;
	var eLen = 8;		// 4 * 8 - 23 - 1
	var eMax = 255;		// (1 << eLen) - 1;
	var eBias = 127;	// eMax >> 1;

	var i = 3; 
	var d = -1; 
	var s = this.m_buffer[this.m_offset + i].charCodeAt(0) & 0xff; 
	i += d; 
	var bits = -7;
	var e = s & ((1 << (-bits)) - 1);
	s >>= -bits;
	bits += eLen
	while(bits > 0) {
		e = e * 256 + (this.m_buffer[this.m_offset + i].charCodeAt(0) & 0xff);
		i += d;
		bits -= 8;
	}

	var m = e & ((1 << (-bits)) - 1);
	e >>= -bits;
	bits += mLen;
	while(bits > 0) {
		 m = m * 256 + (this.m_buffer[this.m_offset + i].charCodeAt(0) & 0xff);
		 i += d;
		 bits -= 8;
	}

	this.m_offset += 4;

	switch(e) {
		case 0:		// 0 or denormalized number
			e = 1 - eBias;
			break;
		case eMax:	// NaN or +/-Infinity
			return m ? NaN : ((s ? -1 : 1) * Infinity);
		default:	// normalized number
			m = m + Math.pow(2, mLen);
			e = e - eBias;
			break;
	}

	return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

/**
	Read a 32-bits little endian signed integer number from the buffer source.<br />
	@returns {number} The integer value. NaN will be returned if any error happened.
*/
Cal3D.CalBufferSource.prototype.readInteger = function() {
	if(!this.ok())
		return NaN;

	if(this.m_offset + 4 > this.m_buffer.length)
		return NaN;

	var rv = 0, f = 1;
	for(var i=0; i<4; i++) {
		rv += ((this.m_buffer[this.m_offset + i].charCodeAt(0) & 0xff) * f);
		f *= 256;
	}

	if(rv & 0x80000000)
		rv -= 0x100000000;

	this.m_offset += 4;

	return rv;
};

/**
	Read a string from the buffer source.<br />
	@returns {string} The string value. An empty string will be returned if any error happened.
*/
Cal3D.CalBufferSource.prototype.readString = function() {
	if(!this.ok())
		return '';

	// read and skip the 'string length' 32-bits integer field
	var length = this.readInteger();
	if(isNaN(length) || length <= 0)
		return '';

	// read out all characters other than the null-terminator('\0')
	var s = this.m_buffer.substring(this.m_offset, this.m_offset + length - 1);
	this.m_offset += length;

	return s;
};
