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
	@class CalMatrix
*/
Cal3D.CalMatrix = function() {
	this.dxdx = 1; this.dydx = 0; this.dzdx = 0;
	this.dxdy = 0; this.dydy = 1; this.dzdy = 0;
	this.dxdz = 0; this.dydz = 0; this.dzdz = 1;

	this.assign.apply(this, arguments);
};

/**
	Directly assign elements of the matrix, or copy elements from another matrix, or calculate elements form a quaternion.<br />
*/
Cal3D.CalMatrix.prototype.assign = function() {
	if(arguments.length == 1) {
		if(arguments[0] instanceof Cal3D.CalMatrix) {
			var other = arguments[0];
			this.dxdx = other.dxdx; this.dydx = other.dydx; this.dzdx = other.dzdx;
			this.dxdy = other.dxdy; this.dydy = other.dydy; this.dzdy = other.dzdy;
			this.dxdz = other.dxdz; this.dydz = other.dydz; this.dzdz = other.dzdz;
		}
		else if(arguments[0] instanceof Cal3D.CalQuaternion) {
			var q = arguments[0];
			var xx2 = q.x * q.x * 2;
			var yy2 = q.y * q.y * 2;
			var zz2 = q.z * q.z * 2;
			var xy2 = q.x * q.y * 2;
			var zw2 = q.z * q.w * 2;
			var xz2 = q.x * q.z * 2;
			var yw2 = q.y * q.w * 2;
			var yz2 = q.y * q.z * 2;
			var xw2 = q.x * q.w * 2;
			this.dxdx = 1-yy2-zz2;   this.dxdy =   xy2+zw2;  this.dxdz =   xz2-yw2;
			this.dydx =   xy2-zw2;   this.dydy = 1-xx2-zz2;  this.dydz =   yz2+xw2;
			this.dzdx =   xz2+yw2;   this.dzdy =   yz2-xw2;  this.dzdz = 1-xx2-yy2;
		}
	}
	else if(arguments.length == 2) {
		var weight = arguments[0];
		var m = arguments[1];
		this.dxdx = m.dxdx * weight;
		this.dxdy = m.dxdy * weight;
		this.dxdz = m.dxdz * weight;
		this.dydx = m.dydx * weight;
		this.dydy = m.dydy * weight;
		this.dydz = m.dydz * weight;
		this.dzdx = m.dzdx * weight;
		this.dzdy = m.dzdy * weight;
		this.dzdz = m.dzdz * weight;
	}
	else if(arguments.length == 9) {
		this.dxdx = arguments[0]; this.dydx = arguments[1]; this.dzdx = arguments[2];
		this.dxdy = arguments[3]; this.dydy = arguments[4]; this.dzdy = arguments[5];
		this.dxdz = arguments[6]; this.dydz = arguments[7]; this.dzdz = arguments[8];
	}

	return this;
};

/**
	Multiply another matrix to this matrix.
*/
Cal3D.CalMatrix.prototype.multMatrixLocal = function(m) {
	var ndxdx = m.dxdx*this.dxdx+m.dxdy*this.dydx+m.dxdz*this.dzdx;
	var ndydx = m.dydx*this.dxdx+m.dydy*this.dydx+m.dydz*this.dzdx;
	var ndzdx = m.dzdx*this.dxdx+m.dzdy*this.dydx+m.dzdz*this.dzdx;

	var ndxdy = m.dxdx*this.dxdy+m.dxdy*this.dydy+m.dxdz*this.dzdy;
	var ndydy = m.dydx*this.dxdy+m.dydy*this.dydy+m.dydz*this.dzdy;
	var ndzdy = m.dzdx*this.dxdy+m.dzdy*this.dydy+m.dzdz*this.dzdy;

	var ndxdz = m.dxdx*this.dxdz+m.dxdy*this.dydz+m.dxdz*this.dzdz;
	var ndydz = m.dydx*this.dxdz+m.dydy*this.dydz+m.dydz*this.dzdz;
	var ndzdz = m.dzdx*this.dxdz+m.dzdy*this.dydz+m.dzdz*this.dzdz;

	this.dxdx = ndxdx;
	this.dydx = ndydx;
	this.dzdx = ndzdx;
	this.dxdy = ndxdy;
	this.dydy = ndydy;
	this.dzdy = ndzdy;
	this.dxdz = ndxdz;
	this.dydz = ndydz;
	this.dzdz = ndzdz;

	return this;
};

/**
	Multiply a scalar factor to the matrix.
*/
Cal3D.CalMatrix.prototype.multScalarLocal = function(factor) {
	this.dxdx *= factor;
	this.dydx *= factor;
	this.dzdx *= factor;
	this.dxdy *= factor;
	this.dydy *= factor;
	this.dzdy *= factor;
	this.dxdz *= factor;
	this.dydz *= factor;
	this.dzdz *= factor;

	return this;
};

/**
	Add a weight times another matrix to this. matrix.
*/
Cal3D.CalMatrix.prototype.blend = function(factor, m) {
	this.dxdx += m.dxdx*factor;
	this.dydx += m.dydx*factor;
	this.dzdx += m.dzdx*factor;
	this.dxdy += m.dxdy*factor;
	this.dydy += m.dydy*factor;
	this.dzdy += m.dzdy*factor;
	this.dxdz += m.dxdz*factor;
	this.dydz += m.dydz*factor;
	this.dzdz += m.dzdz*factor;
};

/**
	Calculate determinant of the matrix.
*/
Cal3D.CalMatrix.prototype.det = function() {
	return    this.dxdx * (this.dydy*this.dzdz-this.dydz*this.dzdy)
			- this.dxdy * (this.dydx*this.dzdz-this.dzdx*this.dydz)
			+ this.dxdz * (this.dydx*this.dzdy-this.dzdx*this.dydy);
};



/**
	@class CalQuaternion
*/
Cal3D.CalQuaternion = function() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 1;

	this.assign.apply(this, arguments);
};

/**
	Directly assign components of the quaternion, or copy components from another quaternion.
*/
Cal3D.CalQuaternion.prototype.assign = function() {
	if(arguments.length == 1 && (arguments[0] instanceof Cal3D.CalQuaternion)) {
		var other = arguments[0];
		this.x = other.x;
		this.y = other.y;
		this.z = other.z;
		this.w = other.w;
	}
	else if(arguments.length == 4) {
		this.x = arguments[0];
		this.y = arguments[1];
		this.z = arguments[2];
		this.w = arguments[3];
	}

	return this;
};

/**
	Multiply another quaternion to this quaternion.
*/
Cal3D.CalQuaternion.prototype.multQuaternionLocal = function(q) {
	var qx = this.x;
	var qy = this.y;
	var qz = this.z;
	var qw = this.w;
	
	this.x = qw * q.x + qx * q.w + qy * q.z - qz * q.y;
	this.y = qw * q.y - qx * q.z + qy * q.w + qz * q.x;
	this.z = qw * q.z + qx * q.y - qy * q.x + qz * q.w;
	this.w = qw * q.w - qx * q.x - qy * q.y - qz * q.z;

	return this;
};

/**
	Multiply a vector to this quaternion.
*/
Cal3D.CalQuaternion.prototype.multVectorLocal = function(v) {
	var qx = this.x;
	var qy = this.y;
	var qz = this.z;
	var qw = this.w;
	
	this.x = qw * v.x            + qy * v.z - qz * v.y;
	this.y = qw * v.y - qx * v.z            + qz * v.x;
	this.z = qw * v.z + qx * v.y - qy * v.x;
	this.w =          - qx * v.x - qy * v.y - qz * v.z;

	return this;
};

/**
	See if this quaternion equals to another quaternion.
*/
Cal3D.CalQuaternion.prototype.equalTo = function(q) {
	return  this.x == q.x && 
			this.y == q.y && 
			this.z == q.z && 
			this.w == q.w;
};

/**
	Interpolate this quaternion to another quaternion by a given factor.
*/
Cal3D.CalQuaternion.prototype.blend = function(d, q) {
	var norm = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
	
	var bFlip = false;	
	if(norm < 0)
	{
		norm = -norm;
		bFlip = true;
	}
	
	var inv_d;
	if(1 - norm < 1e-6)
	{
		inv_d = 1 - d;
	}
	else
	{
		var theta = Math.acos(norm);
		var s = 1 / Math.sin(theta);
		
		inv_d = Math.sin((1 - d) * theta) * s;
		d = Math.sin(d * theta) * s;
	}
	
	if(bFlip)
	{
		d = -d;
	}
	
	this.x = inv_d * this.x + d * q.x;
	this.y = inv_d * this.y + d * q.y;
	this.z = inv_d * this.z + d * q.z;
	this.w = inv_d * this.w + d * q.w;
};

/**
	Clear the quaternion.
*/
Cal3D.CalQuaternion.prototype.clear = function() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 1;
};

/**
	Conjugate the quaternion.
*/
Cal3D.CalQuaternion.prototype.conjugate = function() {
	this.x = -this.x;
	this.y = -this.y;
	this.z = -this.z;
};

/**
	Invert the quaternion.
*/
Cal3D.CalQuaternion.prototype.invert = function() {
	this.conjugate();

	var norm = (this.x*this.x) + (this.y*this.y) + (this.z*this.z) + (this.w*this.w);	
	if (norm == 0) 
		return;
	
	var inv_norm = 1 / norm;
	this.x *= inv_norm;
	this.y *= inv_norm;
	this.z *= inv_norm;
	this.w *= inv_norm;
};

/**
	Multiply two quaternions and return a new quaternion that holds the result.
*/
Cal3D.quaternionMult = function(q0, q1) {
	return new Cal3D.CalQuaternion(
		q1.w * q0.x + q1.x * q0.w + q1.y * q0.z - q1.z * q0.y,
		q1.w * q0.y - q1.x * q0.z + q1.y * q0.w + q1.z * q0.x,
		q1.w * q0.z + q1.x * q0.y - q1.y * q0.x + q1.z * q0.w,
		q1.w * q0.w - q1.x * q0.x - q1.y * q0.y - q1.z * q0.z
	);
};

/**
	Calculate the shortest arc quaternion that will rotate one vector to another and return a quaternion that holds the result.
*/
Cal3D.shortestArc = function(from, to) {
	var cp = Cal3D.vectorCross(from, to); 
	var dp = Cal3D.vectorDot(from, to);
	
	// we will use this equation twice
	dp = Math.sqrt( 2*(dp+1) ); 
	
	// get the x, y, z components
	cp.divScalarLocal(dp);
	
	// return with the w component (Note that w is inverted because Cal3D has left-handed rotations)
	return new Cal3D.CalQuaternion( cp.x, cp.y, cp.z, -dp/2 );
};



/**
	@class CalVector
*/
Cal3D.CalVector = function() {
	this.x = 0;
	this.y = 0;
	this.z = 0;

	this.assign.apply(this, arguments);
};

/**
	Directly assign components of the vector, or copy componebts from another vector.
*/
Cal3D.CalVector.prototype.assign = function() {
	if(arguments.length == 1 && (arguments[0] instanceof Cal3D.CalVector)) {
		var other = arguments[0];
		this.x = other.x;
		this.y = other.y;
		this.z = other.z;
	}
	else if(arguments.length == 3) {
		this.x = arguments[0];
		this.y = arguments[1];
		this.z = arguments[2];
	}

	return this;
};

/**
	Add another vector to this vector.
*/
Cal3D.CalVector.prototype.addLocal = function(v) {
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;

	return this;
};

/**
	Subtract another vector from this vector.
*/
Cal3D.CalVector.prototype.subLocal = function(v) {
	this.x -= v.x;
	this.y -= v.y;
	this.z -= v.z;

	return this;
};

/**
	Scale the vector by a given factor.
*/
Cal3D.CalVector.prototype.multScalarLocal = function(factor) {
	this.x *= factor;
	this.y *= factor;
	this.z *= factor;

	return this;
};

/**
	Transform the vector by a quaternion.
*/
Cal3D.CalVector.prototype.multQuaternionLocal = function(q) {
	var temp = new Cal3D.CalQuaternion(-q.x, -q.y, -q.z, q.w);
	temp.multVectorLocal(this).multQuaternionLocal(q);

	this.x = temp.x;
	this.y = temp.y;
	this.z = temp.z;

	return this;
};

/**
	Transform the vector by a matrix.
*/
Cal3D.CalVector.prototype.multMatrixLocal = function(m) {
	var ox = this.x;
	var oy = this.y;
	var oz = this.z;
	this.x = m.dxdx*ox + m.dxdy*oy + m.dxdz*oz;
	this.y = m.dydx*ox + m.dydy*oy + m.dydz*oz;
	this.z = m.dzdx*ox + m.dzdy*oy + m.dzdz*oz;

	return this;
};

/**
	Divide the vector by a given factor.
*/
Cal3D.CalVector.prototype.divScalarLocal = function(factor) {
	this.x /= factor;
	this.y /= factor;
	this.z /= factor;

	return this;
};

/**
	See if this vector equals another vector.
*/
Cal3D.CalVector.prototype.equalTo = function(v) {
	return  this.x == v.x && 
			this.y == v.y && 
			this.z == v.z;
};

/**
	Interpolate this vector to another vector by a given factor.
*/
Cal3D.CalVector.prototype.blend = function(d, v) {
	this.x += d * (v.x - this.x);
	this.y += d * (v.y - this.y);
	this.z += d * (v.z - this.z);
};

/**
	Clear the vector.
*/
Cal3D.CalVector.prototype.clear = function() {
	this.x = 0;
	this.y = 0;
	this.z = 0;
};

/**
	Get the length of the vector.
*/
Cal3D.CalVector.prototype.length = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

/**
	Normalize the vector and renturn its former length.
*/
Cal3D.CalVector.prototype.normalize = function() {
	var len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	this.x /= len;
	this.y /= len;
	this.z /= len;

	return len;
};

/**
	Add two vectors and return a new vector that holds the result.
*/
Cal3D.vectorAdd = function(v0, v1) {
	return new Cal3D.CalVector(v0.x + v1.x, v0.y + v1.y, v0.z + v1.z);
};

/**
	Subtracts two vectors and return a new vector that holds the result.
*/
Cal3D.vectorSub = function(v0, v1) {
	return new Cal3D.CalVector(v0.x - v1.x, v0.y - v1.y, v0.z - v1.z);
};

/**
	Multiply a vector and a scalar and return a new vector that holds the result.
*/
Cal3D.vectorScalarMult = function(v, d) {
	return new Cal3D.CalVector(v.x * d, v.y * d, v.z * d);
};

/**
	Divide a vector by a scalar and return a new vector that holds the result.
*/
Cal3D.vectorScalarDiv = function(v, d) {
	return new Cal3D.CalVector(v.x / d, v.y / d, v.z / d);
};

/**
	Calculate dot product of two vectors and return a new vector that holds the result.
*/
Cal3D.vectorDot = function(v0, v1) {
	return v0.x * v1.x + v0.y * v1.y + v0.z * v1.z;
};

/**
	Calculate cross product of two vectors and return a new vector that holds the result.
*/
Cal3D.vectorCross = function(v0, v1) {
	return new Cal3D.CalVector(v0.y * v1.z - v0.z * v1.y, v0.z * v1.x - v0.x * v1.z, v0.x * v1.y - v0.y * v1.x);
};
