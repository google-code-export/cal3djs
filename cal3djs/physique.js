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
	@class CalPhysique
*/
Cal3D.CalPhysique = function(model) {
	this.m_model = model;
	this.m_normalize = true;
	this.m_axisFactorX = 1;
	this.m_axisFactorY = 1;
	this.m_axisFactorZ = 1;
};

/**
	Calculate the transformed tangent space data.<br />
	This function calculates and returns the transformed tangent space data of a specific submesh.
	@param {Cal3D.CalSubmesh} submesh The submesh from which the tangent space data should be calculated and returned.
	@param {number} mapId The ID of the texture map.
	@param {Array} tangentSpaceBuffer The user-provided buffer where the tangent space data is written to. This is an output parameter.
	@param {number} stride (Optional). The offset from the start of one data to the start of next data, default to 4.
	@returns {number} The number of tangent spaces written to the buffer.
*/
Cal3D.CalPhysique.prototype.calculateTangentSpaces = function(submesh, mapId, tangentSpaceBuffer, stride) {
	if(mapId < 0 || mapId >= submesh.getCoreSubmesh().getVectorVectorTangentSpace().length)
		return 0;

	if(stride == undefined || stride <= 0)
		stride = 4;

	if(tangentSpaceBuffer.length < submesh.getVertexCount() * stride)
		return 0;

	// get bone vector of the skeleton
	var vectorBone = this.m_model.getSkeleton().getVectorBone();

	// get vertex vector of the submesh
	var vectorVertex = submesh.getCoreSubmesh().getVectorVertex();

	// get tangent space vector of the submesh
	var vectorTangentSpace = submesh.getCoreSubmesh().getVectorVectorTangentSpace()[mapId];

	// get the number of vertices
	var vertexCount = submesh.getVertexCount();

	// calculate tangent for all submesh vertices
	var ti = 0;
	var v = new Cal3D.CalVector;
	for(var vertexId=0; vertexId<vertexCount; vertexId++) {
		var tangentSpace = vectorTangentSpace[vertexId];

		// get the vertex
		var vertex = vectorVertex[vertexId];

		// initialize tangent
		var tx, ty, tz;
		tx = 0;
		ty = 0;
		tz = 0;

		// blend together all vertex influences
		var influenceCount = vertex.vectorInfluence.length;
		for(var influenceId=0; influenceId<influenceCount; influenceId++) {
			// get the influence
			var influence = vertex.vectorInfluence[influenceId];

			// get the bone of the influence vertex
			var bone = vectorBone[influence.boneId];

			// transform normal with current state of the bone
			v.assign(tangentSpace.tangent);
			v.multMatrixLocal(bone.getTransformMatrix());

			tx += influence.weight * v.x;
			ty += influence.weight * v.y;
			tz += influence.weight * v.z;
		}

		// re-normalize tangent if necessary
		if(this.m_normalize) {
			tx /= this.m_axisFactorX;
			ty /= this.m_axisFactorY;
			tz /= this.m_axisFactorZ;

			var scale = 1 / Math.sqrt(tx * tx + ty * ty + tz * tz);

			tangentSpaceBuffer[ti    ] = tx * scale;
			tangentSpaceBuffer[ti + 1] = ty * scale;
			tangentSpaceBuffer[ti + 2] = tz * scale;
		}
		else {
			tangentSpaceBuffer[ti    ] = tx;
			tangentSpaceBuffer[ti + 1] = ty;
			tangentSpaceBuffer[ti + 2] = tz;
		}

		tangentSpaceBuffer[ti + 3] = tangentSpace.crossFactor;

		// next vertex position in buffer
		ti += stride;
	}

	return vertexCount;
};

/**
	Calculate the transformed normal data.<br />
	This function calculates and returns the transformed normal data of a specific submesh.
	@param {Cal3D.CalSubmesh} submesh The submesh from which the normal data should be calculated and returned.
	@param {Array} normalBuffer The user-provided buffer where the normal data is written to.  This is an output parameter.
	@param {number} stride (Optional). The offset from the start of one data to the start of next data, default to 3.
	@returns {number} The number of normals written to the buffer.
*/
Cal3D.CalPhysique.prototype.calculateNormals = function(submesh, normalBuffer, stride) {
	if(stride == undefined || stride <= 0)
		stride = 3;

	if(normalBuffer.length < submesh.getVertexCount() * stride)
		return 0;

	// get bone vector of the skeleton
	var vectorBone = this.m_model.getSkeleton().getVectorBone();

	// get vertex vector of the submesh
	var vectorVertex = submesh.getCoreSubmesh().getVectorVertex();

	// get the number of vertices
	var vertexCount = submesh.getVertexCount();

	// get the sub morph target vector from the core sub mesh
	var vectorSubMorphTarget = submesh.getCoreSubmesh().getVectorCoreSubMorphTarget();

	// calculate the base weight
	var baseWeight = submesh.getBaseWeight();

	// get the number of morph targets
	var morphTargetCount = submesh.getMorphTargetWeightCount();

	// calculate normal for all submesh vertices
	var ni = 0;
	var normal = new Cal3D.CalVector;
	var v = new Cal3D.CalVector
	for(var vertexId=0; vertexId<vertexCount; vertexId++) {
		// get the vertex
		var vertex = vectorVertex[vertexId];

		// blend the morph targets
		if(baseWeight == 1) {
			normal.x = vertex.normal.x;
			normal.y = vertex.normal.y;
			normal.z = vertex.normal.z;
		}
		else {
			normal.x = baseWeight * vertex.normal.x;
			normal.y = baseWeight * vertex.normal.y;
			normal.z = baseWeight * vertex.normal.z;

			for(var morphTargetId=0; morphTargetId<morphTargetCount; morphTargetId++) {
				var blendVertex = vectorSubMorphTarget[morphTargetId].getVectorBlendVertex()[vertexId];
				var currentWeight = submesh.getMorphTargetWeight(morphTargetId);
				normal.x += currentWeight * blendVertex.normal.x;
				normal.y += currentWeight * blendVertex.normal.y;
				normal.z += currentWeight * blendVertex.normal.z;
			}
		}

		// initialize normal
		var nx, ny, nz;
		nx = 0;
		ny = 0;
		nz = 0;

		// blend together all vertex influences
		var influenceCount = vertex.vectorInfluence.length;
		if(influenceCount == 0) {
			nx = normal.x;
			ny = normal.y;
			nz = normal.z;
		} 
		else  {
			for(var influenceId=0; influenceId<influenceCount; influenceId++) {
				// get the influence
				var influence = vertex.vectorInfluence[influenceId];

				// get the bone of the influence vertex
				var bone = vectorBone[influence.boneId];

				// transform normal with current state of the bone
				v.assign(normal);
				v.multMatrixLocal(bone.getTransformMatrix());

				nx += influence.weight * v.x;
				ny += influence.weight * v.y;
				nz += influence.weight * v.z;
			}
		}

		// re-normalize normal if necessary
		if (this.m_normalize) {
			nx /= this.m_axisFactorX;
			ny /= this.m_axisFactorY;
			nz /= this.m_axisFactorZ;

			var scale = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);

			normalBuffer[ni    ] = nx * scale;
			normalBuffer[ni + 1] = ny * scale;
			normalBuffer[ni + 2] = nz * scale;
		}
		else {
			normalBuffer[ni    ] = nx;
			normalBuffer[ni + 1] = ny;
			normalBuffer[ni + 2] = nz;
		}

		ni += stride;
	}

	return vertexCount;
};

/**
	Calculate the transformed vertex data.<br />
	This function calculates and returns the transformed vertex data of a specific submesh.
	@param {Cal3D.CalSubmesh} submesh The submesh from which the vertex data should be calculated and returned.
	@param {Array} vertexBuffer The user-provided buffer where the vertex data is written to.  This is an output parameter.
	@param {number} stride (Optional). The offset from the start of one data to the start of next data, default to 3.
	@returns {number} The number of vertices written to the buffer.
*/
Cal3D.CalPhysique.prototype.calculateVertices = function(submesh, vertexBuffer, stride) {
	if(stride == undefined || stride <= 0)
		stride = 3;

	if(vertexBuffer.length < submesh.getVertexCount() * stride)
		return 0;

	// get bone vector of the skeleton
	var vectorBone = this.m_model.getSkeleton().getVectorBone();

	// get vertex vector of the core submesh
	var vectorVertex = submesh.getCoreSubmesh().getVectorVertex();

	// get physical property vector of the core submesh
	var vectorPhysicalProperty = submesh.getCoreSubmesh().getVectorPhysicalProperty();

	// get the number of vertices
	var vertexCount = submesh.getVertexCount();

	// get the sub morph target vector from the core sub mesh
	var vectorSubMorphTarget = submesh.getCoreSubmesh().getVectorCoreSubMorphTarget();

	// calculate the base weight
	var baseWeight = submesh.getBaseWeight();

	// get the number of morph targets
	var morphTargetCount = submesh.getMorphTargetWeightCount();

	// calculate all submesh vertices
	var vi = 0;
	var position = new Cal3D.CalVector;
	var v = new Cal3D.CalVector;
	for(var vertexId=0; vertexId<vertexCount; vertexId++) {
		// get the vertex
		var vertex = vectorVertex[vertexId];

		// blend the morph targets
		position.assign(0, 0, 0);
		if(baseWeight == 1) {
			position.x = vertex.position.x;
			position.y = vertex.position.y;
			position.z = vertex.position.z;
		}
		else {
			position.x = baseWeight * vertex.position.x;
			position.y = baseWeight * vertex.position.y;
			position.z = baseWeight * vertex.position.z;

			for(var morphTargetId=0; morphTargetId<morphTargetCount; morphTargetId++) {
				var blendVertex = vectorSubMorphTarget[morphTargetId].getVectorBlendVertex()[vertexId];
				var currentWeight = submesh.getMorphTargetWeight(morphTargetId);
				position.x += currentWeight * blendVertex.position.x;
				position.y += currentWeight * blendVertex.position.y;
				position.z += currentWeight * blendVertex.position.z;
			}
		}

		// initialize vertex
		var x, y, z;
		x = 0;
		y = 0;
		z = 0;

		// blend together all vertex influences
		var influenceCount = vertex.vectorInfluence.length;
		if(influenceCount == 0) {
			x = position.x;
			y = position.y;
			z = position.z;
		} 
		else {
			for(var influenceId=0; influenceId<influenceCount; influenceId++) {
				// get the influence
				var influence = vertex.vectorInfluence[influenceId];

				// get the bone of the influence vertex
				var bone = vectorBone[influence.boneId];

				// transform vertex with current state of the bone
				v.assign(position);
				v.multMatrixLocal(bone.getTransformMatrix());
				v.addLocal(bone.getTranslationBoneSpace());

				x += influence.weight * v.x;
				y += influence.weight * v.y;
				z += influence.weight * v.z;
			}
		}

		// save vertex position
		if(submesh.getCoreSubmesh().getSpringCount() > 0 && submesh.hasInternalData()) {
			// get the pgysical property of the vertex
			var physicalProperty = vectorPhysicalProperty[vertexId];

			// assign new vertex position if there is no vertex weight
			if(physicalProperty.weight == 0) {
				vertexBuffer[vi    ] = x * this.m_axisFactorX;
				vertexBuffer[vi + 1] = y * this.m_axisFactorY;
				vertexBuffer[vi + 2] = z * this.m_axisFactorZ;
			}
		}
		else {
			vertexBuffer[vi    ] = x * this.m_axisFactorX;
			vertexBuffer[vi + 1] = y * this.m_axisFactorY;
			vertexBuffer[vi + 2] = z * this.m_axisFactorZ;
		}

		vi += stride;
	}

	return vertexCount;
};

/**
	Calculate a transformed vertex.<br />
	This function calculates and returns a transformed vertex of a specific submesh.
	@param {Cal3D.CalSubmesh} submesh The submesh from which the vertex should be calculated and returned.
	@param {number} vertexId The ID of the vertex that should be transformed.
	@returns {Cal3D.CalVector} The transformed vertex.
*/
Cal3D.CalPhysique.prototype.calculateVertex = function(submesh, vertexId) {
	// get bone vector of the skeleton
	var vectorBone = this.m_model.getSkeleton().getVectorBone();

	// get vertex of the core submesh
	var vectorVertex = submesh.getCoreSubmesh().getVectorVertex();

	// get the sub morph target vector from the core sub mesh
	var vectorSubMorphTarget = submesh.getCoreSubmesh().getVectorCoreSubMorphTarget();

	// calculate the base weight
	var baseWeight = submesh.getBaseWeight();

	// get the number of morph targets
	var morphTargetCount = submesh.getMorphTargetWeightCount();

	// get the vertex
	var vertex = vectorVertex[vertexId];

	// blend the morph targets
	var position = new Cal3D.CalVector(0, 0, 0);
	if(baseWeight == 1) {
		position.x = vertex.position.x;
		position.y = vertex.position.y;
		position.z = vertex.position.z;
	}
	else {
		position.x = baseWeight * vertex.position.x;
		position.y = baseWeight * vertex.position.y;
		position.z = baseWeight * vertex.position.z;

		for(var morphTargetId=0; morphTargetId<morphTargetCount; morphTargetId++) {
			var blendVertex = vectorSubMorphTarget[morphTargetId].getVectorBlendVertex()[vertexId];
			var currentWeight = submesh.getMorphTargetWeight(morphTargetId);
			position.x += currentWeight * blendVertex.position.x;
			position.y += currentWeight * blendVertex.position.y;
			position.z += currentWeight * blendVertex.position.z;
		}
	}

	// initialize vertex
	var x, y, z;
	x = 0;
	y = 0;
	z = 0;

	// blend together all vertex influences
	var v = new Cal3D.CalVector;
	var influenceCount = vertex.vectorInfluence.length;
	if(influenceCount == 0) {
		x = position.x;
		y = position.y;
		z = position.z;
	} 
	else {
		for(var influenceId=0; influenceId<influenceCount; influenceId++) {
			// get the influence
			var influence = vertex.vectorInfluence[influenceId];

			// get the bone of the influence vertex
			var bone = vectorBone[influence.boneId];

			// transform vertex with current state of the bone
			v.assign(position);
			v.multMatrixLocal(bone.getTransformMatrix());
			v.addLocal(bone.getTranslationBoneSpace());
			
			x += influence.weight * v.x;
			y += influence.weight * v.y;
			z += influence.weight * v.z;
		}
	}

	return new Cal3D.CalVector(x * this.m_axisFactorX, y * this.m_axisFactorY, z * this.m_axisFactorZ);
};

/**
	Calculate the transformed vertex and vertex normal data.<br />
	This function calculates and returns the transformed vertex and the transformed normal datadata of a specific submesh.
	@param {Cal3D.CalSubmesh} submesh The submesh from which the vertex and normal data should be calculated and returned.
	@param {Array} vertexBuffer The user-provided buffer where the vertex and normal data is written to.  This is an output parameter.
	@param {number} stride (Optional). The offset from the start of one data to the start of next data, default to 6.
	@returns {number} The number of vertices written to the buffer.
*/
Cal3D.CalPhysique.prototype.calculateVerticesAndNormals = function(submesh, vertexBuffer, stride) {
	if(stride == undefined || stride <= 0)
		stride = 6;

	if(vertexBuffer.length < submesh.getVertexCount() * stride)
		return 0;

	// get bone vector of the skeleton
	var vectorBone = this.m_model.getSkeleton().getVectorBone();

	// get vertex vector of the core submesh
	var vectorVertex = submesh.getCoreSubmesh().getVectorVertex();

	// get physical property vector of the core submesh
	var vectorPhysicalProperty = submesh.getCoreSubmesh().getVectorPhysicalProperty();

	// get the number of vertices
	var vertexCount = submesh.getVertexCount();

	// get the sub morph target vector from the core sub mesh
	var vectorSubMorphTarget = submesh.getCoreSubmesh().getVectorCoreSubMorphTarget();

	// calculate the base weight
	var baseWeight = submesh.getBaseWeight();

	// get the number of morph targets
	var morphTargetCount = submesh.getMorphTargetWeightCount();

	// calculate all submesh vertices
	var vi = 0;
	var v = new Cal3D.CalVector;
	var n = new Cal3D.CalVector;
	var position = new Cal3D.CalVector;
	var normal = new Cal3D.CalVector;
	for(var vertexId=0; vertexId<vertexCount; vertexId++) {
		// get the vertex
		var vertex = vectorVertex[vertexId];

		// blend the morph targets
		position.assign(0, 0, 0);
		normal.assign(0, 0, 0);
		if(baseWeight == 1) {
			position.x = vertex.position.x;
			position.y = vertex.position.y;
			position.z = vertex.position.z;
			normal.x = vertex.normal.x;
			normal.y = vertex.normal.y;
			normal.z = vertex.normal.z;
		}
		else {
			position.x = baseWeight * vertex.position.x;
			position.y = baseWeight * vertex.position.y;
			position.z = baseWeight * vertex.position.z;
			normal.x = baseWeight * vertex.normal.x;
			normal.y = baseWeight * vertex.normal.y;
			normal.z = baseWeight * vertex.normal.z;

			for(var morphTargetId=0; morphTargetId<morphTargetCount; morphTargetId++) {
				var blendVertex = vectorSubMorphTarget[morphTargetId].getVectorBlendVertex()[vertexId];
				var currentWeight = submesh.getMorphTargetWeight(morphTargetId);
				position.x += currentWeight * blendVertex.position.x;
				position.y += currentWeight * blendVertex.position.y;
				position.z += currentWeight * blendVertex.position.z;
				normal.x += currentWeight * blendVertex.normal.x;
				normal.y += currentWeight * blendVertex.normal.y;
				normal.z += currentWeight * blendVertex.normal.z;
			}
		}

		// initialize vertex
		var x, y, z;
		x = 0;
		y = 0;
		z = 0;

		// initialize normal
		var nx, ny, nz;
		nx = 0;
		ny = 0;
		nz = 0;

		// blend together all vertex influences
		var influenceCount = vertex.vectorInfluence.length;
		if(influenceCount == 0) {
			x = position.x;
			y = position.y;
			z = position.z;
			nx = normal.x;
			ny = normal.y;
			nz = normal.z;
		} 
		else {
			for(var influenceId=0; influenceId<influenceCount; influenceId++) {
				// get the influence
				var influence = vertex.vectorInfluence[influenceId];

				// get the bone of the influence vertex
				var bone = vectorBone[influence.boneId];

				// transform vertex with current state of the bone
				v.assign(position);
				v.multMatrixLocal(bone.getTransformMatrix());
				v.addLocal(bone.getTranslationBoneSpace());
				
				x += influence.weight * v.x;
				y += influence.weight * v.y;
				z += influence.weight * v.z;

				// transform normal with current state of the bone
				n.assign(normal);
				n.multMatrixLocal(bone.getTransformMatrix());

				nx += influence.weight * n.x;
				ny += influence.weight * n.y;
				nz += influence.weight * n.z;
			}
		}

		// save vertex position
		if(submesh.getCoreSubmesh().getSpringCount() > 0 && submesh.hasInternalData()) {
			// get the pgysical property of the vertex
			var physicalProperty = vectorPhysicalProperty[vertexId];

			// assign new vertex position if there is no vertex weight
			if(physicalProperty.weight == 0) {
				vertexBuffer[vi    ] = x * this.m_axisFactorX;
				vertexBuffer[vi + 1] = y * this.m_axisFactorY;
				vertexBuffer[vi + 2] = z * this.m_axisFactorZ;
			}
		}
		else {
			vertexBuffer[vi    ] = x * this.m_axisFactorX;
			vertexBuffer[vi + 1] = y * this.m_axisFactorY;
			vertexBuffer[vi + 2] = z * this.m_axisFactorZ;
		}

		// re-normalize normal if necessary
		if (this.m_normalize) {
			nx /= this.m_axisFactorX;
			ny /= this.m_axisFactorY;
			nz /= this.m_axisFactorZ;

			var scale = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);

			vertexBuffer[vi + 3] = nx * scale;
			vertexBuffer[vi + 4] = ny * scale;
			vertexBuffer[vi + 5] = nz * scale;
		}
		else {
			vertexBuffer[vi + 3] = nx;
			vertexBuffer[vi + 4] = ny;
			vertexBuffer[vi + 5] = nz;
		}

		vi += stride;
	}

	return vertexCount;
};

/**
	Calculate the transformed vertex, vertex normal and texture coordinate data.<br />
	This function calculates and returns the transformed vertex, the transformed normal data and the texture coordinates of a specific submesh.
	@param {Cal3D.CalSubmesh} submesh The submesh from which the vertex, normal and texture coordinate data should be calculated and returned.
	@param {Array} vertexBuffer The user-provided buffer where the vertex, normal and texture coordinate data is written to.  This is an output parameter.
	@param {number} numTexCoords The number of texture maps whose texture coordinates is required, since there can be 0 or more than 1 texture maps defined.
	@returns {number} The number of vertices written to the buffer.
*/
Cal3D.CalPhysique.prototype.calculateVerticesNormalsAndTexCoords = function(submesh, vertexBuffer, numTexCoords) {
	if(numTexCoords == undefined)
		numTexCoords = 1;

	// get bone vector of the skeleton
	var vectorBone = this.m_model.getSkeleton().getVectorBone();

	// get vertex vector of the core submesh
	var vectorVertex = submesh.getCoreSubmesh().getVectorVertex();

	// get the texture coordinate vector vector
	var vectorvectorTextureCoordinate = submesh.getCoreSubmesh().getVectorVectorTextureCoordinate();

	var textureCoordinateCount = vectorvectorTextureCoordinate.length;

	// check if the given texture coord count is valid
	if(numTexCoords < 0 || numTexCoords > textureCoordinateCount) {
		if(textureCoordinateCount != 0)
			return -1;
	}

	// get physical property vector of the core submesh
	var vectorPhysicalProperty = submesh.getCoreSubmesh().getVectorPhysicalProperty();

	// get the number of vertices
	var vertexCount = submesh.getVertexCount();

	// get the sub morph target vector from the core sub mesh
	var vectorSubMorphTarget = submesh.getCoreSubmesh().getVectorCoreSubMorphTarget();

	// calculate the base weight
	var baseWeight = submesh.getBaseWeight();

	// get the number of morph targets
	var morphTargetCount = submesh.getMorphTargetWeightCount();

	// calculate all submesh vertices
	var vi = 0;
	var position = new Cal3D.CalVector;
	var normal = new Cal3D.CalVector;
	for(var vertexId=0; vertexId<vertexCount; vertexId++) {
		// get the vertex
		var vertex = vectorVertex[vertexId];

		// blend the morph targets
		position.assign(0, 0, 0);
		normal.assign(0, 0, 0);
		if(baseWeight == 1) {
			position.x = vertex.position.x;
			position.y = vertex.position.y;
			position.z = vertex.position.z;
			normal.x = vertex.normal.x;
			normal.y = vertex.normal.y;
			normal.z = vertex.normal.z;
		}
		else {
			position.x = baseWeight * vertex.position.x;
			position.y = baseWeight * vertex.position.y;
			position.z = baseWeight * vertex.position.z;
			normal.x = baseWeight * vertex.normal.x;
			normal.y = baseWeight * vertex.normal.y;
			normal.z = baseWeight * vertex.normal.z;

			for(var morphTargetId=0; morphTargetId<morphTargetCount; morphTargetId++) {
				var blendVertex = vectorSubMorphTarget[morphTargetId].getVectorBlendVertex()[vertexId];
				var currentWeight = submesh.getMorphTargetWeight(morphTargetId);
				position.x += currentWeight * blendVertex.position.x;
				position.y += currentWeight * blendVertex.position.y;
				position.z += currentWeight * blendVertex.position.z;
				normal.x += currentWeight * blendVertex.normal.x;
				normal.y += currentWeight * blendVertex.normal.y;
				normal.z += currentWeight * blendVertex.normal.z;
			}
		}

		// initialize vertex
		var x, y, z;
		x = 0;
		y = 0;
		z = 0;

		// initialize normal
		var nx, ny, nz;
		nx = 0;
		ny = 0;
		nz = 0;

		// blend together all vertex influences
		var influenceCount = vertex.vectorInfluence.length;
		if(influenceCount == 0) {
			x = position.x;
			y = position.y;
			z = position.z;
			nx = normal.x;
			ny = normal.y;
			nz = normal.z;
		} 
		else {
			for(var influenceId=0; influenceId<influenceCount; influenceId++) {
				// get the influence
				var influence = vertex.vectorInfluence[influenceId];

				// get the bone of the influence vertex
				var bone = vectorBone[influence.boneId];

				// transform vertex with current state of the bone
				var v = new Cal3D.CalVector(position);
				v.multMatrixLocal(bone.getTransformMatrix());
				v.addLocal(bone.getTranslationBoneSpace());

				x += influence.weight * v.x;
				y += influence.weight * v.y;
				z += influence.weight * v.z;

				// transform normal with current state of the bone
				var n = new Cal3D.CalVector(normal);
				n.multMatrixLocal(bone.getTransformMatrix());

				nx += influence.weight * n.x;
				ny += influence.weight * n.y;
				nz += influence.weight * n.z;
			}
		}

		// save vertex position
		if(submesh.getCoreSubmesh().getSpringCount() > 0 && submesh.hasInternalData()) {
			// get the pgysical property of the vertex
			var physicalProperty = vectorPhysicalProperty[vertexId];

			// assign new vertex position if there is no vertex weight
			if(physicalProperty.weight == 0) {
				vertexBuffer[vi    ] = x * this.m_axisFactorX;
				vertexBuffer[vi + 1] = y * this.m_axisFactorY;
				vertexBuffer[vi + 2] = z * this.m_axisFactorZ;
			}
		}
		else {
			vertexBuffer[vi    ] = x * this.m_axisFactorX;
			vertexBuffer[vi + 1] = y * this.m_axisFactorY;
			vertexBuffer[vi + 2] = z * this.m_axisFactorZ;
		}

		// re-normalize normal if necessary
		if (this.m_normalize) {
			nx /= this.m_axisFactorX;
			ny /= this.m_axisFactorY;
			nz /= this.m_axisFactorZ;

			var scale = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);

			vertexBuffer[vi + 3] = nx * scale;
			vertexBuffer[vi + 4] = ny * scale;
			vertexBuffer[vi + 5] = nz * scale;
		}
		else {
			vertexBuffer[vi + 3] = nx;
			vertexBuffer[vi + 4] = ny;
			vertexBuffer[vi + 5] = nz;
		}

		vi += 6;

		if(textureCoordinateCount == 0) {
			vi += numTexCoords * 2;
		}
		else {
			for(var mapId=0; mapId<numTexCoords; mapId++) {
				var textureCoord = vectorvectorTextureCoordinate[mapId][vertexId];
				vertexBuffer[vi    ] = textureCoord.u;
				vertexBuffer[vi + 1] = textureCoord.v;

				vi += 2;
			}
		}
	}

	return vertexCount;
};

/**
	Update all the internally handled attached meshes.
	This function updates all the attached meshes of the model that are handled internally.
*/
Cal3D.CalPhysique.prototype.update = function() {
	// get the attached meshes vector
	var vectorMesh = this.m_model.getVectorMesh();

	// loop through all the attached meshes
	for(var meshId=0; meshId<vectorMesh.length; meshId++) {
		// get the submesh vector of the mesh
		var vectorSubmesh = vectorMesh[meshId].getVectorSubmesh();

		// loop through all the submeshes of the mesh
		for(var submeshId=0; submeshId<vectorSubmesh.length; submeshId++) {
			var submesh = vectorSubmesh[submeshId];
			// check if the submesh handles vertex data internally
			if(submesh.hasInternalData()) {
				// calculate the transformed vertices and normals and store them in the submesh
				var vectorVertex = submesh.getVectorVertex();
				var vectorNormal = submesh.getVectorNormal();
				this.calculateVerticesAndNormalsInternal(submesh, vectorVertex, vectorNormal);

				var vectorTangentSpaceCount = submesh.getVectorVectorTangentSpace().length;
				for(var mapId=0; mapId<vectorTangentSpaceCount; mapId++) {
					if(submesh.isTangentsEnabled(mapId)) {
						var vectorTangentSpace = submesh.getVectorVectorTangentSpace()[mapId];
						this.calculateTangentSpacesInternal(submesh, mapId, vectorTangentSpace);
					}
				}
			}
		}
	}
};

/**
	Set the normalization flag.<br />
	This function sets the normalization flag on or off. If off, the normals calculated by Cal3D will not be normalized. Instead, 
	this transform is left up to the user.
	@param {boolean} normalize The normalization flag.
*/
Cal3D.CalPhysique.prototype.setNormalization = function(normalize) {
	this.m_normalize = normalize;
};

/**
	Set the scale factor along the X-axis.<br />
	@param {number} factor The scale factor.
*/
Cal3D.CalPhysique.prototype.setAxisFactorX = function(factor) {
	this.m_axisFactorX = factor;
	this.m_normalize = true;	
};

/**
	Set the scale factor along the Y-axis.<br />
	@param {number} factor The scale factor.
*/
Cal3D.CalPhysique.prototype.setAxisFactorY = function(factor) {
	this.m_axisFactorY = factor;
	this.m_normalize = true;	
};

/**
	Set the scale factor along the Z-axis.<br />
	@param {number} factor The scale factor.
*/
Cal3D.CalPhysique.prototype.setAxisFactorZ = function(factor) {
	this.m_axisFactorZ = factor;
	this.m_normalize = true;	
};

/**
	@private
*/
Cal3D.CalPhysique.prototype.calculateVerticesAndNormalsInternal = function(submesh, veritces, normals) {
	if(veritces.length < submesh.getVertexCount() || normals.length < submesh.getVertexCount())
		throw 'internal error: buffer is not large enough to contain all the vertex/normal data';

	// get bone vector of the skeleton
	var vectorBone = this.m_model.getSkeleton().getVectorBone();

	// get vertex vector of the core submesh
	var vectorVertex = submesh.getCoreSubmesh().getVectorVertex();

	// get physical property vector of the core submesh
	var vectorPhysicalProperty = submesh.getCoreSubmesh().getVectorPhysicalProperty();

	// get the number of vertices
	var vertexCount = submesh.getVertexCount();

	// get the sub morph target vector from the core sub mesh
	var vectorSubMorphTarget = submesh.getCoreSubmesh().getVectorCoreSubMorphTarget();

	// calculate the base weight
	var baseWeight = submesh.getBaseWeight();

	// get the number of morph targets
	var morphTargetCount = submesh.getMorphTargetWeightCount();

	// calculate all submesh vertices
	var v = new Cal3D.CalVector;
	var n = new Cal3D.CalVector;
	var position = new Cal3D.CalVector;
	var normal = new Cal3D.CalVector;
	for(var vertexId=0; vertexId<vertexCount; vertexId++) {
		// get the vertex
		var vertex = vectorVertex[vertexId];

		// blend the morph targets
		position.assign(0, 0, 0);
		normal.assign(0, 0, 0);
		if(baseWeight == 1) {
			position.x = vertex.position.x;
			position.y = vertex.position.y;
			position.z = vertex.position.z;
			normal.x = vertex.normal.x;
			normal.y = vertex.normal.y;
			normal.z = vertex.normal.z;
		}
		else {
			position.x = baseWeight * vertex.position.x;
			position.y = baseWeight * vertex.position.y;
			position.z = baseWeight * vertex.position.z;
			normal.x = baseWeight * vertex.normal.x;
			normal.y = baseWeight * vertex.normal.y;
			normal.z = baseWeight * vertex.normal.z;

			for(var morphTargetId=0; morphTargetId<morphTargetCount; morphTargetId++) {
				var blendVertex = vectorSubMorphTarget[morphTargetId].getVectorBlendVertex()[vertexId];
				var currentWeight = submesh.getMorphTargetWeight(morphTargetId);
				position.x += currentWeight * blendVertex.position.x;
				position.y += currentWeight * blendVertex.position.y;
				position.z += currentWeight * blendVertex.position.z;
				normal.x += currentWeight * blendVertex.normal.x;
				normal.y += currentWeight * blendVertex.normal.y;
				normal.z += currentWeight * blendVertex.normal.z;
			}
		}

		// initialize vertex
		var x, y, z;
		x = 0;
		y = 0;
		z = 0;

		// initialize normal
		var nx, ny, nz;
		nx = 0;
		ny = 0;
		nz = 0;

		// blend together all vertex influences
		var influenceCount = vertex.vectorInfluence.length;
		if(influenceCount == 0) {
			x = position.x;
			y = position.y;
			z = position.z;
			nx = normal.x;
			ny = normal.y;
			nz = normal.z;
		} 
		else {
			for(var influenceId=0; influenceId<influenceCount; influenceId++) {
				// get the influence
				var influence = vertex.vectorInfluence[influenceId];

				// get the bone of the influence vertex
				var bone = vectorBone[influence.boneId];

				// transform vertex with current state of the bone
				v.assign(position);
				v.multMatrixLocal(bone.getTransformMatrix());
				v.addLocal(bone.getTranslationBoneSpace());
				
				x += influence.weight * v.x;
				y += influence.weight * v.y;
				z += influence.weight * v.z;

				// transform normal with current state of the bone
				n.assign(normal);
				n.multMatrixLocal(bone.getTransformMatrix());

				nx += influence.weight * n.x;
				ny += influence.weight * n.y;
				nz += influence.weight * n.z;
			}
		}

		if(!veritces[vertexId])
			veritces[vertexId] = new Cal3D.CalVector;
		if(!normals[vertexId])
			normals[vertexId] = new Cal3D.CalVector;

		// save vertex position
		if(submesh.getCoreSubmesh().getSpringCount() > 0 && submesh.hasInternalData()) {
			// get the pgysical property of the vertex
			var physicalProperty = vectorPhysicalProperty[vertexId];

			// assign new vertex position if there is no vertex weight
			if(physicalProperty.weight == 0) {
				veritces[vertexId].assign(x * this.m_axisFactorX, y * this.m_axisFactorY, z * this.m_axisFactorZ);
			}
		}
		else {
			veritces[vertexId].assign(x * this.m_axisFactorX, y * this.m_axisFactorY, z * this.m_axisFactorZ);
		}

		// re-normalize normal if necessary
		if (this.m_normalize) {
			nx /= this.m_axisFactorX;
			ny /= this.m_axisFactorY;
			nz /= this.m_axisFactorZ;

			var scale = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);

			normals[vertexId].assign(nx * scale, ny * scale, nz * scale);
		}
		else {
			normals[vertexId].assign(nx, ny, nz);
		}
	}

	return vertexCount;
};

/**
	@private
*/
Cal3D.CalPhysique.prototype.calculateTangentSpacesInternal = function(submesh, mapId, tangentSpaces) {
	if(mapId < 0 || mapId >= submesh.getCoreSubmesh().getVectorVectorTangentSpace().length)
		throw 'internal error: mapId is out of range';

	if(tangentSpaces.length < submesh.getVertexCount())
		throw 'internal error: buffer is not large enough to contain all the tangent space data';

	// get bone vector of the skeleton
	var vectorBone = this.m_model.getSkeleton().getVectorBone();

	// get vertex vector of the submesh
	var vectorVertex = submesh.getCoreSubmesh().getVectorVertex();

	// get tangent space vector of the submesh
	var vectorTangentSpace = submesh.getCoreSubmesh().getVectorVectorTangentSpace()[mapId];

	// get the number of vertices
	var vertexCount = submesh.getVertexCount();

	// calculate tangent for all submesh vertices
	var v = new Cal3D.CalVector;
	for(var vertexId=0; vertexId<vertexCount; vertexId++) {
		var tangentSpace = vectorTangentSpace[vertexId];

		// get the vertex
		var vertex = vectorVertex[vertexId];

		// initialize tangent
		var tx, ty, tz;
		tx = 0;
		ty = 0;
		tz = 0;

		// blend together all vertex influences
		var influenceCount = vertex.vectorInfluence.length;
		for(var influenceId=0; influenceId<influenceCount; influenceId++) {
			// get the influence
			var influence = vertex.vectorInfluence[influenceId];

			// get the bone of the influence vertex
			var bone = vectorBone[influence.boneId];

			// transform normal with current state of the bone
			v.assign(tangentSpace.tangent);
			v.multMatrixLocal(bone.getTransformMatrix());

			tx += influence.weight * v.x;
			ty += influence.weight * v.y;
			tz += influence.weight * v.z;
		}

		if(!tangentSpaces[vertexId])
			tangentSpaces[vertexId] = new Cal3D.CalCoreSubmesh.TangentSpace;

		// re-normalize tangent if necessary
		if(this.m_normalize) {
			tx /= this.m_axisFactorX;
			ty /= this.m_axisFactorY;
			tz /= this.m_axisFactorZ;

			var scale = 1 / Math.sqrt(tx * tx + ty * ty + tz * tz);

			tangentSpaces[vertexId].tangent.assign(tx * scale, ty * scale, tz * scale);
		}
		else {
			tangentSpaces[vertexId].tangent.assign(tx, ty, tz);
		}

		tangentSpaces[vertexId].crossFactor = tangentSpace.crossFactor;
	}

	return vertexCount;
};
