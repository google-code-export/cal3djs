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
	@class CalPlane
	@private
*/
Cal3D.CalPlane = function() {
	this.a = 0;
	this.b = 0;
	this.c = 0;
	this.d = 0;
};

Cal3D.CalPlane.prototype.eval = function(p) {
	return p.x * this.a + p.y * this.b + p.z * this.c + this.d;
};

Cal3D.CalPlane.prototype.setPosition = function(p) {
	this.d = -p.x * this.a - p.y * this.b - p.z * this.c;
};

Cal3D.CalPlane.prototype.setNormal = function(n) {
	 this.a = n.x;
	 this.b = n.y;
	 this.c = n.z;
	 this.d = -1e32;
};

Cal3D.CalPlane.prototype.dist = function(p) {
	return Math.abs( (p.x * this.a + p.y * this.b + p.z * this.c + this.d) / Math.sqrt(this.a * this.a + this.b * this.b + this.c * this.c) );
};



/**
	@class CalBoundingBox
*/
Cal3D.CalBoundingBox = function() {
	this.plane = [  
		new Cal3D.CalPlane, 
		new Cal3D.CalPlane, 
		new Cal3D.CalPlane, 
		new Cal3D.CalPlane, 
		new Cal3D.CalPlane, 
		new Cal3D.CalPlane
	];
};

/**
	Calculate the corner points of the bounding box.<br />
	This function computes the 8 corner points of the bounding box.
	@param {Array} points An array of 8 vectors to take the result. If null, the function will allocate one.
	@returns {Array} An array that holds 8 vectors as the result.
*/
Cal3D.CalBoundingBox.prototype.computePoints = function(points) {
	if(!points || !(points instanceof Array) || points.length < 8)
		points = new Array(8);

	var m = new Cal3D.CalMatrix;

	var plane = this.plane;	 
	var p = 0;
	for(var i=0; i<2; i++) {
		for(var j=2; j<4; j++) {
			for(var k=4; k<6; k++) {
				var x,y,z;

				m.dxdx = plane[i].a; m.dxdy = plane[i].b; m.dxdz = plane[i].c;        
				m.dydx = plane[j].a; m.dydy = plane[j].b; m.dydz = plane[j].c;        
				m.dzdx = plane[k].a; m.dzdy = plane[k].b; m.dzdz = plane[k].c;

				var det = m.det();
			   
				if(det != 0) {
					m.dxdx = -plane[i].d; m.dxdy = plane[i].b; m.dxdz = plane[i].c;        
					m.dydx = -plane[j].d; m.dydy = plane[j].b; m.dydz = plane[j].c;        
					m.dzdx = -plane[k].d; m.dzdy = plane[k].b; m.dzdz = plane[k].c;

					x = m.det() / det;

					m.dxdx = plane[i].a; m.dxdy = -plane[i].d; m.dxdz = plane[i].c;        
					m.dydx = plane[j].a; m.dydy = -plane[j].d; m.dydz = plane[j].c;        
					m.dzdx = plane[k].a; m.dzdy = -plane[k].d; m.dzdz = plane[k].c;

					y = m.det() / det;

					m.dxdx = plane[i].a; m.dxdy = plane[i].b; m.dxdz = -plane[i].d;        
					m.dydx = plane[j].a; m.dydy = plane[j].b; m.dydz = -plane[j].d;        
					m.dzdx = plane[k].a; m.dzdy = plane[k].b; m.dzdz = -plane[k].d;

					z = m.det() / det;

					if(points[p])
						points[p].assign(x, y, z);
					else
						points[p] = new Cal3D.CalVector(x, y, z);
				}
				else {
					if(points[p])
						points[p].assign(0, 0, 0);
					else
						points[p] = new Cal3D.CalVector(0, 0, 0);
				}

				p++;
			}
		}
	}

	return points;
};
