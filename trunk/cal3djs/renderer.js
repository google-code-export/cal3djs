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
	@class CalRenderer
*/
Cal3D.CalRenderer = function(model) {
	this.m_model = null;
	this.m_selectedSubmesh = null;

	if(arguments[0] instanceof Cal3D.CalModel) {
		this.m_model = arguments[0];
	}
	else if(arguments[0] instanceof Cal3D.CalRenderer) {
		var other = arguments[0];
		this.m_model = other.m_model;
		this.m_selectedSubmesh = other.m_selectedSubmesh;
	}
	else {
		throw 'argument error: input parameter is neither a model instance nor a renderer instance';
	}
};

/**
	Initialize the rendering query phase.<br />
	This function initializes the rendering query phase. It must be called before any rendering queries are executed.
*/
Cal3D.CalRenderer.prototype.beginRendering = function() {
	// get the attached meshes vector
	var vectorMesh = this.m_model.getVectorMesh();

	// check if there are any meshes attached to the model
	if(vectorMesh.length == 0) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'renderer.js');
		return false;
	}

	// select the default submesh
	this.m_selectedSubmesh = vectorMesh[0].getSubmesh(0);
	if(!this.m_selectedSubmesh)
		return false;

	return true;
};

/**
	Finish the rendering query phase.<br />
	This function finishes the rendering query phase. It must be called after all rendering queries have been executed.
*/
Cal3D.CalRenderer.prototype.endRendering = function() {
	// clear selected submesh
	this.m_selectedSubmesh = null;
};

/**
	Get the ambient color.<br />
	This function returns the ambient color of the material of the selected mesh/submesh.
	@param {Array} colorBuffer The user-provided buffer where the color data is written to. This is an output parameter.
*/
Cal3D.CalRenderer.prototype.getAmbientColor = function(colorBuffer) {
	// get the core material
	var coreMaterial = this.m_model.getCoreModel().getCoreMaterial(this.m_selectedSubmesh.getCoreMaterialId());
	if(!coreMaterial) {
		// write default values to the color buffer
		colorBuffer[0] = 0;
		colorBuffer[1] = 0;
		colorBuffer[2] = 0;
		colorBuffer[3] = 0;

		return;
	}

	// get the ambient color of the material
	var color = coreMaterial.getAmbientColor();

	// write it to the color buffer
	colorBuffer[0] = color.red;
	colorBuffer[1] = color.green;
	colorBuffer[2] = color.blue;
	colorBuffer[3] = color.alpha;
};

/**
	Get the diffuse color.<br />
	This function returns the diffuse color of the material of the selected mesh/submesh.
	@param {Array} colorBuffer The user-provided buffer where the color data is written to. This is an output parameter.
*/
Cal3D.CalRenderer.prototype.getDiffuseColor = function(colorBuffer) {
	// get the core material
	var coreMaterial = this.m_model.getCoreModel().getCoreMaterial(this.m_selectedSubmesh.getCoreMaterialId());
	if(!coreMaterial) {
		// write default values to the color buffer
		colorBuffer[0] = 192;
		colorBuffer[1] = 192;
		colorBuffer[2] = 192;
		colorBuffer[3] = 192;

		return;
	}

	// get the diffuse color of the material
	var color = coreMaterial.getDiffuseColor();

	// write it to the color buffer
	colorBuffer[0] = color.red;
	colorBuffer[1] = color.green;
	colorBuffer[2] = color.blue;
	colorBuffer[3] = color.alpha;
};

/**
	Get the number of faces.<br />
	This function returns the number of faces in the selected mesh/submesh.
	@returns {number} The number of faces.
*/
Cal3D.CalRenderer.prototype.getFaceCount = function() {
	return this.m_selectedSubmesh.getFaceCount();
};

/**
	Get the face data.<br />
	This function returns the face data (vertex indices) of the selected mesh/submesh. The LOD setting is taken into account.
	@param {Array} faceBuffer The user-provided buffer where the face data is written to. This is an output parameter.
	@returns {number} The number of faces written to the buffer.
*/
Cal3D.CalRenderer.prototype.getFaces = function(faceBuffer) {
	return this.m_selectedSubmesh.getFaces(faceBuffer);
};

/**
	Get the number of texture maps.<br />
	This function returns the number of texture maps in the selected mesh/submesh.
	@returns {number} The number of texture maps.
*/
Cal3D.CalRenderer.prototype.getMapCount = function() {
	// get the core material
	var coreMaterial = this.m_model.getCoreModel().getCoreMaterial(this.m_selectedSubmesh.getCoreMaterialId());
	if(!coreMaterial)
		return 0;

	return coreMaterial.getMapCount();
};

/**
	Get a specified texture map's user data.<br />
	This function returns the user data stored in the specified texture map of the material of the selected mesh/submesh.
	@param {number} mapId The ID of the texture map.
	@returns {object} The user data stored in the specified texture map; null if no user data is stored or any error happened.
*/
Cal3D.CalRenderer.prototype.getMapUserData = function(mapId) {
	// get the core material
	var coreMaterial = this.m_model.getCoreModel().getCoreMaterial(this.m_selectedSubmesh.getCoreMaterialId());
	if(!coreMaterial)
		return null;

	// get the map vector
	var vectorMap = coreMaterial.getVectorMap();

	// check if the map id is valid
	if(mapId < 0 || mapId >= vectorMap.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'renderer.js');
		return null;
	}

	return vectorMap[mapId].userData;
};

/**
	Get the number of attached meshes.<br />
	This function returns the number of meshes attached to the renderer instance.
	@returns {number} The number of attached meshes.
*/
Cal3D.CalRenderer.prototype.getMeshCount = function() {
	// get the attached meshes vector
	var vectorMesh = this.m_model.getVectorMesh();
	return vectorMesh.length;
};

/**
	Get the normal data.<br />
	This function returns the vertex normal data of the selected mesh/submesh.
	@param {Array} normalBuffer The user-provided buffer where the normal data is written to. This is an output parameter.
	@param {number} stride (Optional). The offset from the start of one data to the start of next data, default to 3.
	@returns {number} The number of normals written to the buffer.
*/
Cal3D.CalRenderer.prototype.getNormals = function(normalBuffer, stride) {
	// check if the submesh handles vertex data internally
	if(this.m_selectedSubmesh.hasInternalData()) {
		// get the normal vector of the submesh
		var vectorNormal = this.m_selectedSubmesh.getVectorNormal();

		// get the number of normals (= number of vertices) in the submesh
		var normalCount = this.m_selectedSubmesh.getVertexCount();

		/*
			copy the internal normal data to the provided normal buffer
		*/
		if(stride == undefined || stride <= 0)
			stride = 3;

		for(var i=0, j=0; i<normalCount; i++, j+=stride) {
			var normal = vectorNormal[i];
			normalBuffer[j    ] = normal.x;
			normalBuffer[j + 1] = normal.y;
			normalBuffer[j + 2] = normal.z;
		}

		return normalCount;
	}

	// submesh does not handle the vertex data internally, so let the physique calculate it now
	return this.m_model.getPhysique().calculateNormals(this.m_selectedSubmesh, normalBuffer, stride);
};

/**
	Get the shininess factor.<br />
	This function returns the shininess factor of the material of the selected mesh/submesh.
	@returns {number} The shininess factor.
*/
Cal3D.CalRenderer.prototype.getShininess = function() {
	// get the core material
	var coreMaterial = this.m_model.getCoreModel().getCoreMaterial(this.m_selectedSubmesh.getCoreMaterialId());
	if(!coreMaterial)
		return 50;

	return coreMaterial.getShininess();
};

/**
	Get the specular color.<br />
	This function returns the specular color of the material of the selected mesh/submesh.
	@param {Array} colorBuffer The user-provided buffer where the color data is written to. This is an output parameter.
*/
Cal3D.CalRenderer.prototype.getSpecularColor = function(colorBuffer) {
	// get the core material
	var coreMaterial = this.m_model.getCoreModel().getCoreMaterial(this.m_selectedSubmesh.getCoreMaterialId());
	if(!coreMaterial) {
		// write default values to the color buffer
		colorBuffer[0] = 255;
		colorBuffer[1] = 255;
		colorBuffer[2] = 255;
		colorBuffer[3] = 0;

		return;
	}

	// get the specular color of the material
	var color = coreMaterial.getSpecularColor();

	// write it to the color buffer
	colorBuffer[0] = color.red;
	colorBuffer[1] = color.green;
	colorBuffer[2] = color.blue;
	colorBuffer[3] = color.alpha;
};

/**
	Get the number of submeshes.<br />
	This function returns the number of submeshes in a given mesh.
	@param {number} meshId The ID of the mesh whose number of submeshes should be returned.
	@returns {number} The number of submeshes.
*/
Cal3D.CalRenderer.prototype.getSubmeshCount = function(meshId) {
	// get the attached meshes vector
	var vectorMesh = this.m_model.getVectorMesh();

	// check if the mesh id is valid
	if(meshId < 0 || meshId >= vectorMesh.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'renderer.js');
		return 0;
	}

	return vectorMesh[meshId].getSubmeshCount();
};

/**
	Get the texture coordinate data.<br />
	This function returns the texture coordinate data for a given map of the selected mesh/submesh.
	@param {number} mapId The ID of the map to get the texture coordinate data from.
	@param {Array} textureCoordinateBuffer The user-provided buffer where the texture coordinate data is written to. This is an output parameter.
	@param {number} stride (Optional). The offset from the start of one data to the start of next data, default to 2.
	@returns {number} The number of texture coordinates written to the buffer.
*/
Cal3D.CalRenderer.prototype.getTextureCoordinates = function(mapId, textureCoordinateBuffer, stride) {
	// get the texture coordinate vector vector
	var vectorvectorTextureCoordinate = this.m_selectedSubmesh.getCoreSubmesh().getVectorVectorTextureCoordinate();

	// check if the map id is valid
	if(mapId < 0 || mapId >= vectorvectorTextureCoordinate.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'renderer.js');
		return -1;
	}

	// get the number of texture coordinates to return
	var textureCoordinateCount = this.m_selectedSubmesh.getVertexCount();

	/*
		copy the texture coordinate data to the provided texture coordinate buffer
	*/
	if(stride == undefined || stride <= 0)
		stride = 2;

	for(var i=0, j=0; i<textureCoordinateCount; i++, j+=stride) {
		var texCoord = vectorvectorTextureCoordinate[mapId][i];
		textureCoordinateBuffer[j    ] = texCoord.u;
		textureCoordinateBuffer[j + 1] = texCoord.v;
	}

	return textureCoordinateCount;
};

/**
	Get the number of vertices.<br />
	This function returns the number of vertices in the selected mesh/submesh.
	@returns {number} The number of vertices.
*/
Cal3D.CalRenderer.prototype.getVertexCount = function() {
	return this.m_selectedSubmesh.getVertexCount();
};

/**
	Get the vertex data.<br />
	This function returns the vertex data of the selected mesh/submesh.
	@param {Array} vertexBuffer The user-provided buffer where the vertex data is written to. This is an output parameter.
	@param {number} stride (Optional). The offset from the start of one data to the start of next data, default to 3.
	@returns {number} The number of vertices written to the buffer.
*/
Cal3D.CalRenderer.prototype.getVertices = function(vertexBuffer, stride) {
	// check if the submesh handles vertex data internally
	if(this.m_selectedSubmesh.hasInternalData()) {
		// get the vertex vector of the submesh
		var vectorVertex = this.m_selectedSubmesh.getVectorVertex();

		// get the number of vertices in the submesh
		var vertexCount = this.m_selectedSubmesh.getVertexCount();

		// copy the internal vertex data into the provided vertex buffer

		if(stride == undefined || stride <= 0)
			stride = 3;

		for(var i=0, j=0; i<vertexCount; i++, j+=stride) {
			var vertex = vectorVertex[i];
			vertexBuffer[j    ] = vertex.x;
			vertexBuffer[j + 1] = vertex.y;
			vertexBuffer[j + 2] = vertex.z;
		}

		return vertexCount;
	}

	// submesh does not handle the vertex data internally, so let the physique calculate it now
	return this.m_model.getPhysique().calculateVertices(this.m_selectedSubmesh, vertexBuffer, stride);
};

/**
	Get the tangent space data.<br />
	This function returns the tangent space data of the selected mesh/submesh.
	@param {number} mapId The ID of the texture map.
	@param {Array} tangentSpaceBuffer The user-provided buffer where the tangent space ata is written to. This is an output parameter.
	@param {number} stride (Optional). The offset from the start of one data to the start of next data, default to 4.
	@returns {number} The number of tangent space written to the buffer.
*/
Cal3D.CalRenderer.prototype.getTangentSpaces = function(mapId, tangentSpaceBuffer, stride) {
	// get the texture coordinate vector vector
	var vectorvectorTangentSpace = this.m_selectedSubmesh.getCoreSubmesh().getVectorVectorTangentSpace();

	// check if the map id is valid
	if(mapId < 0 || mapId >= vectorvectorTangentSpace.length || !this.m_selectedSubmesh.isTangentsEnabled(mapId)) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'renderer.js');
		return -1;
	}

	// check if the submesh handles vertex data internally
	if(this.m_selectedSubmesh.hasInternalData()) {
		// get the normal vector of the submesh
		var vectorTangentSpace = this.m_selectedSubmesh.getVectorVectorTangentSpace()[mapId];

		// get the number of normals (= number of vertices) in the submesh
		var tangentSpaceCount = this.m_selectedSubmesh.getVertexCount();

		/* 
			copy the internal normal data to the provided tangent space buffer
		*/
		if(stride == undefined || stride <= 0)
			stride = 4;

		for(var i=0, j=0; i<tangentSpaceCount; i++, j+=stride) {
			var tangentSpace = vectorTangentSpace[i];
			var tangent = tangentSpace.tangent;
			tangentSpaceBuffer[j    ] = tangent.x;
			tangentSpaceBuffer[j + 1] = tangent.y;
			tangentSpaceBuffer[j + 2] = tangent.z;
			tangentSpaceBuffer[j + 3] = tangentSpace.crossFactor;
		}

		return tangentSpaceCount;
	}

	// submesh does not handle the vertex data internally, so let the physique calculate it now
	return this.m_model.getPhysique().calculateTangentSpaces(this.m_selectedSubmesh, mapId, tangentSpaceBuffer, stride);
};

/**
	Get the vertex and normal data.<br />
	This function returns the vertex and vertex normal data of the selected mesh/submesh.
	@param {Array} vertexBuffer The user-provided buffer where the vertex and normal data is written to. This is an output parameter.
	@param {number} stride (Optional). The offset from the start of one data to the start of next data, default to 6.
	@returns {number} The number of vertices written to the buffer.
*/
Cal3D.CalRenderer.prototype.getVerticesAndNormals = function(vertexBuffer, stride) {
	// check if the submesh handles vertex data internally
	if(this.m_selectedSubmesh.hasInternalData()) {
		// get the vertex vector of the submesh
		var vectorVertex = this.m_selectedSubmesh.getVectorVertex();
		// get the normal vector of the submesh
		var vectorNormal = this.m_selectedSubmesh.getVectorNormal();

		// get the number of vertices in the submesh
		var vertexCount = this.m_selectedSubmesh.getVertexCount();

		/*
			copy the internal vertex and normal data to the provided vertex buffer
		*/
		if(stride == undefined || stride <= 0)
			stride = 6;

		for(i=0, j=0; i<vertexCount; i++, j+=stride) {
			var vertex = vectorVertex[i];
			var normal = vectorNormal[i];
			vertexBuffer[j    ] = vertex.x;
			vertexBuffer[j + 1] = vertex.y;
			vertexBuffer[j + 2] = vertex.z;
			vertexBuffer[j + 3] = normal.x;
			vertexBuffer[j + 4] = normal.y;
			vertexBuffer[j + 5] = normal.z;
		}

		return vertexCount;
	}

	// submesh does not handle the vertex data internally, so let the physique calculate it now
	return this.m_model.getPhysique().calculateVerticesAndNormals(this.m_selectedSubmesh, vertexBuffer, stride);
};

/**
	Get the vertex, normal and texture coordinate data.<br />
	This function returns the vertex, vertex normal and texture coordinate data of the selected mesh/submesh.
	@param {Array} vertexBuffer The user-provided buffer where the vertex, normal and texture coordinate data is written to. This is an output parameter.
	@param {number} numTexCoords The number of texture maps whose texture coordinates is required, since there can be 0 or more than 1 texture maps defined.
	@returns {number} The number of vertices written to the buffer.
*/
Cal3D.CalRenderer.prototype.getVerticesNormalsAndTexCoords = function(vertexBuffer, numTexCoords) {
	// check if the submesh handles vertex data internally
	if(this.m_selectedSubmesh.hasInternalData()) {
		// get the vertex vector of the submesh
		var vectorVertex = this.m_selectedSubmesh.getVectorVertex();
		// get the normal vector of the submesh
		var vectorNormal = this.m_selectedSubmesh.getVectorNormal();	
		// get the texture coordinate vector vector
		var vectorvectorTextureCoordinate = this.m_selectedSubmesh.getCoreSubmesh().getVectorVectorTextureCoordinate();

		var textureCoordinateCount = vectorvectorTextureCoordinate.length;

		if(numTexCoords == undefined)
			numTexCoords = 1;

		// check if the given texture coordinate count is valid
		if(numTexCoords < 0 || numTexCoords > textureCoordinateCount) {
			if(textureCoordinateCount != 0) {
				Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'renderer.js');
				return -1;
			}
		}

		// get the number of vertices in the submesh
		var vertexCount = this.m_selectedSubmesh.getVertexCount();

		/*
			copy the internal vertex, normal and texture coordinate data to the provided vertex buffer
		*/

		if(textureCoordinateCount == 0) {
			var vi = 0;
			for(var vertexId=0; vertexId<vertexCount; vertexId++) {
				var vertex = vectorVertex[vertexId];
				var normal = vectorNormal[vertexId];
				vertexBuffer[vi    ] = vertex.x;
				vertexBuffer[vi + 1] = vertex.y;
				vertexBuffer[vi + 2] = vertex.z;
				vertexBuffer[vi + 3] = normal.x;
				vertexBuffer[vi + 4] = normal.y;
				vertexBuffer[vi + 5] = normal.z;
				vi += 6 + numTexCoords * 2;
			}
		}
		else
		{
			if(numTexCoords == 1) {
				var vi = 0;
				for(var vertexId=0; vertexId<vertexCount; vertexId++) {
					var vertex = vectorVertex[vertexId];
					var normal = vectorNormal[vertexId];
					var texCoord = vectorvectorTextureCoordinate[0][vertexId];
					vertexBuffer[vi    ] = vertex.x;
					vertexBuffer[vi + 1] = vertex.y;
					vertexBuffer[vi + 2] = vertex.z;
					vertexBuffer[vi + 3] = normal.x;
					vertexBuffer[vi + 4] = normal.y;
					vertexBuffer[vi + 5] = normal.z;
					vertexBuffer[vi + 6] = texCoord.u;
					vertexBuffer[vi + 7] = texCoord.v;
					vi += 8;
				}
			}
			else
			{
				var vi = 0;
				for(var vertexId=0; vertexId<vertexCount; vertexId++) {
					var vertex = vectorVertex[vertexId];
					var normal = vectorNormal[vertexId];
					vertexBuffer[vi    ] = vertex.x;
					vertexBuffer[vi + 1] = vertex.y;
					vertexBuffer[vi + 2] = vertex.z;
					vertexBuffer[vi + 3] = normal.x;
					vertexBuffer[vi + 4] = normal.y;
					vertexBuffer[vi + 5] = normal.z;
					vi += 6;

					for(var mapId=0; mapId<numTexCoords; mapId++) {
						var texCoord = vectorvectorTextureCoordinate[mapId][vertexId];
						vertexBuffer[vi    ] = texCoord.u;
						vertexBuffer[vi + 1] = texCoord.v;
						vi += 2;
					}
				}
			}		
		}

		return vertexCount;
	}

	// submesh does not handle the vertex data internally, so let the physique calculate it now
	return this.m_model.getPhysique().calculateVerticesNormalsAndTexCoords(this.m_selectedSubmesh, vertexBuffer, numTexCoords);
};

/**
	See if tangent are enabled on a specific texture map.<br />
	This function returns if tangent of the current submesh are enabled.
	@param {number} mapId The ID of the texture map.
	@returns {boolean} Whether tangent is enabled.
*/
Cal3D.CalRenderer.prototype.isTangentsEnabled = function(mapId) {
	return this.m_selectedSubmesh.isTangentsEnabled(mapId);
};

/**
	Select a mesh/submesh for rendering data queries.<br />
	This function selects a mesh/submesh for further rendering data queries.
	@param {number} meshId The ID of the mesh that should be used for further rendering data queries.
	@param {number} submeshId The ID of the submesh that should be used for further rendering data queries.
	@returns {boolean} true if succeeded; false if the mesh or the submesh does not exist.
*/
Cal3D.CalRenderer.prototype.selectMeshSubmesh = function(meshId, submeshId) {
	// get the attached meshes vector
	var vectorMesh = this.m_model.getVectorMesh();

	// check if the mesh id is valid
	if(meshId < 0 || meshId >= vectorMesh.length) {
		Cal3D.CalError.setLastError(Cal3D.CalError.Code.INVALID_HANDLE, 'renderer.js');
		return false;
	}

	// get the core submesh
	this.m_selectedSubmesh = vectorMesh[meshId].getSubmesh(submeshId);
	if(!this.m_selectedSubmesh)
		return false;

	return true;
};

/**
	Set the normalization flag.<br />
	This function sets the normalization flag on or off. If off, the normals calculated by Cal3D will not be normalized. Instead, 
	this transform is left up to the user.
	@param {boolean} normalize The normalization flag.
*/
Cal3D.CalRenderer.prototype.setNormalization = function(normalize) {
	this.m_model.getPhysique().setNormalization(normalize);
};
