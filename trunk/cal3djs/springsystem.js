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
	@class CalSpringSystem
*/
Cal3D.CalSpringSystem = function(model) {
	this.m_model = model;
	this.m_gravity = new Cal3D.CalVector(0, 0, -98.1);
	// we add this force to simulate some movement
	this.m_force = new Cal3D.CalVector(0, 0.5, 0);
	this.m_collision = false;
};

/**
	Calculate the forces upon each unbound vertex.<br />
	This function calculates the forces on each unbound vertex of a specific submesh.
	@param {Cal3D.CalSubmesh} submesh The submesh from which the forces should be calculated.
	@param {number} deltaTime The elapsed time in seconds since the last calculation.
*/
Cal3D.CalSpringSystem.prototype.calculateForces = function(submesh, deltaTime) {
	// get the vertex vector of the submesh
	var vectorVertex = submesh.getVectorVertex();

	// get the vertex vector of the submesh
	var vectorPhysicalProperty = submesh.getVectorPhysicalProperty();

	// get the physical property vector of the core submesh
	var vectorCorePhysicalProperty = submesh.getCoreSubmesh().getVectorPhysicalProperty();

	// loop through all the vertices
	for(var vertexId=0; vertexId<vectorVertex.length; vertexId++) {
		// get the physical property of the vertex
		var physicalProperty = vectorPhysicalProperty[vertexId];

		// get the physical property of the core vertex
		var corePhysicalProperty = vectorCorePhysicalProperty[vertexId];

		// only take vertices with a weight > 0 into account
		if(corePhysicalProperty.weight > 0) {
			// vertex_force = force + gravity * weight
			physicalProperty.force.assign(this.m_gravity);
			physicalProperty.force.multScalarLocal(corePhysicalProperty.weight);
			physicalProperty.force.addLocal(this.m_force);
		}
	}
};

/**
	Calculate the vertices influenced by the spring system instance.<br />
	This function calculates the vertices influenced by the spring system instance.
	@param {Cal3D.CalSubmesh} submesh The submesh from which the vertices should be calculated.
	@param {number} deltaTime The elapsed time in seconds since the last calculation.
*/
Cal3D.CalSpringSystem.prototype.calculateVertices = function(submesh, deltaTime) {
	// get the vertex vector of the submesh
	var vectorVertex = submesh.getVectorVertex();

	// get the physical property vector of the submesh
	var vectorPhysicalProperty = submesh.getVectorPhysicalProperty();

	// get the physical property vector of the core submesh
	var vectorCorePhysicalProperty = submesh.getCoreSubmesh().getVectorPhysicalProperty();

	// loop through all the vertices
	for(var vertexId=0; vertexId<vectorVertex.length; vertexId++) {
		// get the vertex
		var vertex = vectorVertex[vertexId];

		// get the physical property of the vertex
		var physicalProperty = vectorPhysicalProperty[vertexId];

		// get the physical property of the core vertex
		var corePhysicalProperty = vectorCorePhysicalProperty[vertexId];

		// store current position for later use
		var position = new Cal3D.CalVector(physicalProperty.position);

		// only take vertices with a weight > 0 into account
		if(corePhysicalProperty.weight > 0) {
			// do the Verlet step
			physicalProperty.position.addLocal( Cal3D.vectorSub(position, physicalProperty.positionOld).multScalarLocal(0.99).addLocal(Cal3D.vectorScalarMult(physicalProperty.force, deltaTime * deltaTime / corePhysicalProperty.weight)) );

			var skeleton = this.m_model.getSkeleton();

			// collision detection and response
			if(this.m_collision) {
				var vectorBone = skeleton.getVectorBone();

				for(var boneId=0; boneId<vectorBone.length; boneId++) {
					var p = vectorBone[boneId].getBoundingBox();
					var isIn = true;
					var min = 1e10;
					var index = -1;

					for(var faceId=0; faceId<6 ; faceId++) {				
						if(p.plane[faceId].eval(physicalProperty.position) <= 0) {
							isIn = false;
						}
						else {
							var dist = p.plane[faceId].dist(physicalProperty.position);
							if(dist < min) {
								index = faceId;
								min = dist;
							}
						}
					}

					if(isIn && index != -1) {
						var normal = new Cal3D.CalVector(p.plane[index].a, p.plane[index].b, p.plane[index].c);
						normal.normalize();
						physicalProperty.position.subLocal(Cal3D.vectorScalarMult(normal, min));
					}

					isIn = true;

					for(var faceId=0; faceId<6 ; faceId++) {				
						if(p.plane[faceId].eval(physicalProperty.position) < 0 ) {
							isIn = false;				
						}
					}
					if(isIn) {
						physicalProperty.position.assign(vectorVertex[vertexId]);
					}
				}
			}
		}
		else {
			physicalProperty.position.assign(vectorVertex[vertexId]);
		}

		// make the current position the old one
		physicalProperty.positionOld.assign(position);

		// set the new position of the vertex
		vertex.assign(physicalProperty.position);

		// clear the accumulated force on the vertex
		physicalProperty.force.clear();
	}

	// get the spring vector of the core submesh
	var vectorSpring = submesh.getCoreSubmesh().getVectorSpring();

	// iterate a few times to relax the constraints
	var TOTAL_ITERATION_COUNT = 2;
	for(var iterationCount=0; iterationCount<TOTAL_ITERATION_COUNT; iterationCount++) {
		// loop through all the springs
		for(var springId=0; springId<vectorSpring.length; springId++) {
			// get the spring
			var spring = vectorSpring[springId];

			// compute the difference between the two spring vertices
			var distance = Cal3D.vectorSub(vectorVertex[spring.vertexId[1]], vectorVertex[spring.vertexId[0]]);

			// get the current length of the spring
			var length = distance.length();

			if(length > 0) {
				/*
				if (spring.springCoefficient == 0) { 
					vectorVertex[spring.vertexId[1]].assign(vectorVertex[spring.vertexId[0]]);
					vectorPhysicalProperty[spring.vertexId[1]].position.assign(vectorVertex[spring.vertexId[0]]);
				} 
				else {
				*/
				var factor = [0, 0];
				factor[0] = (length - spring.idleLength) / length;
				factor[1] = factor[0];

				if(vectorCorePhysicalProperty[spring.vertexId[0]].weight > 0) {
					factor[0] /= 2;
					factor[1] /= 2;
				}
				else {
					factor[0] = 0;
				}

				if(vectorCorePhysicalProperty[spring.vertexId[1]].weight <= 0) {
					factor[0] *= 2;
					factor[1] = 0;
				}

				vectorVertex[spring.vertexId[0]].addLocal(Cal3D.vectorScalarMult(distance, factor[0]));
				vectorPhysicalProperty[spring.vertexId[0]].position.assign(vectorVertex[spring.vertexId[0]]);

				vectorVertex[spring.vertexId[1]].subLocal(Cal3D.vectorScalarMult(distance, factor[1]));
				vectorPhysicalProperty[spring.vertexId[1]].position.assign(vectorVertex[spring.vertexId[1]]);
				//}
			}
		}
	}
};

/**
	Update all the spring systems in the attached meshes.<br />
	This functon updates all the spring systems in the attached meshes.
	@param {number} deltaTime The elapsed time in seconds since the last calculation.
*/
Cal3D.CalSpringSystem.prototype.update = function(deltaTime) {
	// get the attached meshes vector
	var vectorMesh = this.m_model.getVectorMesh();

	// loop through all the attached meshes
	for(var meshId=0; meshId<vectorMesh.length; meshId++) {
		// get the ssubmesh vector of the mesh
		var vectorSubmesh = vectorMesh[meshId].getVectorSubmesh();

		// loop through all the submeshes of the mesh
		for(var submeshId=0; submeshId<vectorSubmesh.length; submeshId++) {
			var submesh = vectorSubmesh[submeshId];

			// check if the submesh contains a spring system
			if(submesh.getCoreSubmesh().getSpringCount() > 0 && submesh.hasInternalData()) {
				// calculate the new forces on each unbound vertex
				this.calculateForces(submesh, deltaTime);

				// calculate the vertices influenced by the spring system
				this.calculateVertices(submesh, deltaTime);
			}
		}
	}
};

/**
	Get the gravity vector.<br />
	This function returns the gravity vector of the spring system instance.
	@returns {Cal3D.CalVector} The gravity as vector.
*/
Cal3D.CalSpringSystem.prototype.getGravityVector = function() {
	return this.m_gravity;
};

/**
	Set the gravity vector.<br />
	This function sets the gravity vector of the spring system instance.
	@param {Cal3D.CalVector} gravity The gravity as vector.
*/
Cal3D.CalSpringSystem.prototype.setGravityVector = function(gravity) {
	this.m_gravity.assign(gravity);
};

/**
	Get the force vector.<br />
	This function returns the force vector of the spring system instance.
	@returns {Cal3D.CalVector} The force as vector.
*/
Cal3D.CalSpringSystem.prototype.getForceVector = function() {
	return this.m_force;
};

/**
	Set the force vector.<br />
	This function sets the force vector of the spring system instance.
	@param {Cal3D.CalVector} The force as vector.
*/
Cal3D.CalSpringSystem.prototype.setForceVector = function(force) {
	this.m_force.assign(force);
};

/**
	Enable or disable the collision system.<br />
	@param {boolean} collision Set to true to enable the collision system, false to disable the collision system.
*/
Cal3D.CalSpringSystem.prototype.setCollisionDetection = function(collision) {
	this.m_collision = collision;
};
