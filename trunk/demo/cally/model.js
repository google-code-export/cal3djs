/*****************************************************************************
* Cal3DJS Cally Demo
* by Humu humu2009@gmail.com
* http://code.google.com/p/cal3djs/
*****************************************************************************/


Model = function(app) {
	this.animationId = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
	this.animationCount = 0;
	this.path = '';

	this.tiltAngle = -70;
	this.twistAngle = -45;
	this.distance = 270;
	this.isWireframe = false;
	this.hasLighting = true;
	this.renderMode = Model.MODE_MESH;

	this.models = [];
	this.modelId = 0;
	this.modelConfigFilenames = ['cally.cfg', 'skeleton.cfg', 'paladin.cfg'];

	this.frameRenderer = null;
	this.meshRenderer = null;

	this.mouseX = 0;
	this.mouseY = 0;
	this.isButtonDown = false;

	this.app = app;
};

Model.prototype.getLodLevel = function() {
	if(this.models.length > 0) {
		return this.models[this.modelId].lodLevel;
	}

	return 1;
};

Model.prototype.getMotionBlend = function(motionBlend) {
	if(this.models.length > 0) {
		var model = this.models[this.modelId];
		motionBlend[0] = model.motionBlend[0];
		motionBlend[1] = model.motionBlend[1];
		motionBlend[2] = model.motionBlend[2];
		return;
	}

	motionBlend[0] = 0.6;
	motionBlend[1] = 0.1;
	motionBlend[2] = 0.3;
};

Model.prototype.getRenderScale = function() {
	if(this.models.length > 0) {
		return this.models[this.modelId].scale;
	}

	return 1;
};

Model.prototype.getState = function() {
	if(this.models.length > 0) {
		return this.models[this.modelId].state;
	}

	return Model.STATE_IDLE;
};

Model.prototype.getWireframe = function() {
	return this.isWireframe;
};

Model.prototype.getLighting = function() {
	return this.hasLighting;
};

Model.prototype.getRenderMode = function() {
	return this.renderMode;
};

Model.prototype.onInit = function(gl, path) {
	this.path = path;

	var frameProgram = new SglProgram(gl, [frame_vertex_shader], [frame_fragment_shader]);
	if(!frameProgram.isValid) {
		log('error occured in creating the simple shader program');
		log(frameProgram.log);
		return false;
	}
	this.frameRenderer = new SglMeshGLRenderer(frameProgram);

	var meshProgram = new SglProgram(gl, [mesh_vertex_shader], [mesh_fragment_shader]);
	if(!meshProgram.isValid) {
		log('error occured in creating the mesh shader program');
		log(meshProgram.log);
		return false;
	}
	this.meshRenderer = new SglMeshGLRenderer(meshProgram);

	var self = this;
	var loadingCallBack = {};

	loadingCallBack.onload = function(loaded, url) {
		log('Model loaded from ' + url + '\n');

		var cal_model = loaded.model;
		var scale = loaded.scale;
		var path = loaded.path;

		cal_model.getMixer().blendCycle(self.animationId[Model.STATE_MOTION    ], 0.6, 0);
		cal_model.getMixer().blendCycle(self.animationId[Model.STATE_MOTION + 1], 0.1, 0);
		cal_model.getMixer().blendCycle(self.animationId[Model.STATE_MOTION + 2], 0.3, 0);

		var boneCount = cal_model.getSkeleton().getBoneCount();

		var model = {};

		model.cal_model = cal_model;
		model.path = path;
		model.scale = scale;
		model.state = Model.STATE_MOTION;
		model.lodLevel = 1;
		model.motionBlend = [0.6, 0.1, 0.3];

		// load all textures if any
		self.loadTextures(gl, model, path);

		model.bonePoints = new SglMeshGL(gl);
		model.bonePointCoordBuffer = new Float32Array(boneCount * 3);
		model.bonePoints.addVertexAttribute('position', 3, model.bonePointCoordBuffer);
		model.bonePoints.addArrayPrimitives('points', gl.POINTS, 0, boneCount);

		model.boneLines = new SglMeshGL(gl);
		model.boneLineCoordBuffer = new Float32Array((boneCount - 1) * 2 * 3);
		model.boneLines.addVertexAttribute('position', 3, model.boneLineCoordBuffer);
		model.boneLines.addArrayPrimitives('lines', gl.LINES, 0, (boneCount - 1) * 2);

		model.boundingBox = new SglMeshGL(gl);
		model.boundingBoxCoordBuffer = new Float32Array(boneCount * 8 * 3);
		model.boundingBox.addVertexAttribute('position', 3, model.boundingBoxCoordBuffer);
		var boundingBoxIndexBuffer = new Uint16Array(boneCount * 24);
		for(var i=0; i<boneCount; i++) {
			var p = i * 8;
			var k = i * 24;
			boundingBoxIndexBuffer[k     ] = p;     boundingBoxIndexBuffer[k +  1] = p + 1;
			boundingBoxIndexBuffer[k +  2] = p;     boundingBoxIndexBuffer[k +  3] = p + 2;
			boundingBoxIndexBuffer[k +  4] = p + 1; boundingBoxIndexBuffer[k +  5] = p + 3;
			boundingBoxIndexBuffer[k +  6] = p + 2; boundingBoxIndexBuffer[k +  7] = p + 3;
			boundingBoxIndexBuffer[k +  8] = p + 4; boundingBoxIndexBuffer[k +  9] = p + 5;
			boundingBoxIndexBuffer[k + 10] = p + 4; boundingBoxIndexBuffer[k + 11] = p + 6;
			boundingBoxIndexBuffer[k + 12] = p + 5; boundingBoxIndexBuffer[k + 13] = p + 7;
			boundingBoxIndexBuffer[k + 14] = p + 6; boundingBoxIndexBuffer[k + 15] = p + 7;
			boundingBoxIndexBuffer[k + 16] = p;     boundingBoxIndexBuffer[k + 17] = p + 4;
			boundingBoxIndexBuffer[k + 18] = p + 1; boundingBoxIndexBuffer[k + 19] = p + 5;
			boundingBoxIndexBuffer[k + 20] = p + 2; boundingBoxIndexBuffer[k + 21] = p + 6;
			boundingBoxIndexBuffer[k + 22] = p + 3; boundingBoxIndexBuffer[k + 23] = p + 7;
		}
		model.boundingBox.addIndexedPrimitives('edges', gl.LINES, boundingBoxIndexBuffer);

		model.meshes = [];
		model.meshIndexBuffers = [];
		model.meshWireframeIndexBuffer = [];
		model.meshCoordBuffers = [];
		model.meshNormalBuffers = [];
		model.meshTexCoordBuffers = [];

		self.models.push(model);
	};

	loadingCallBack.onerror = function(errorCode, url) {
		log('failed to load ' + url);
	};

	Cal3D.CalLoader.setLoadingMode(Cal3D.CalLoader.LOADER_INVERT_V_COORD);
	for(var i=0; i<this.modelConfigFilenames.length; i++) {
		Cal3D.CalLoader.loadModelFromConfigFile(path + this.modelConfigFilenames[i], loadingCallBack);
	}
};

Model.prototype.onShutdown = function() {
};

Model.prototype.onMouseButtonDown = function(gl, button, x, y) {
	this.mouseX = x;
	this.mouseY = y;
	this.isButtonDown = true;
};

Model.prototype.onMouseButtonUp = function(gl, button, x, y) {
	this.mouseX = x;
	this.mouseY = y;
	this.isButtonDown = false;
};

Model.prototype.onMouseMove = function(gl, x, y) {
	if(this.isButtonDown) {
		this.twistAngle += (x - this.mouseX);
	}

	this.mouseX = x;
	this.mouseY = y;
};

Model.prototype.onRender = function(gl, xform, width, height) {
	if(this.models.length > 0) {
		var model = this.models[this.modelId];

		xform.projection.loadIdentity();
		xform.projection.perspective(sglDegToRad(45), width / height, 50 * model.scale, 5000 * model.scale);

		xform.view.loadIdentity();
		xform.view.translate(0, 0, -this.distance * model.scale);
		xform.view.rotate(sglDegToRad(this.tiltAngle), 1, 0, 0);
		xform.view.rotate(sglDegToRad(this.twistAngle), 0, 0, 1);
		xform.view.translate(0, 0, -90 * model.scale);

		switch(this.renderMode) {
		case Model.MODE_MESH:
			this.renderMesh(gl, xform, model);
			break;
		case Model.MODE_SKELETON:
			this.renderSkeleton(gl, xform, this.models[this.modelId]);
			break;
		case Model.MODE_BOUNDINGBOX:
			this.renderBoundingBox(gl, xform, this.models[this.modelId]);
			break;
		case Model.MODE_SKELETON_AND_BOUNDINGBOX:
			this.renderSkeleton(gl, xform, this.models[this.modelId]);
			this.renderBoundingBox(gl, xform, this.models[this.modelId]);
			break;
		default:
			break;		
		}
	}
};

Model.prototype.onUpdate = function(gl, deltaTime) {
	if(this.models.length > 0) {
		this.models[this.modelId].cal_model.update(deltaTime);
	}
};

Model.prototype.setLodLevel = function(level) {
	// set the new lod level into the cal model
	if(this.models.length > 0) {
		this.models[this.modelId].cal_model.setLodLevel(level);
		this.models[this.modelId].lodLevel = level;
	}
};

Model.prototype.setMotionBlend = function(motionBlend, delay) {
	if(this.models.length > 0) {
		var model = this.models[this.modelId];

		model.motionBlend[0] = motionBlend[0];
		model.motionBlend[1] = motionBlend[1];
		model.motionBlend[2] = motionBlend[2];

		model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_IDLE], delay);
		model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_FANCY], delay);
		model.cal_model.getMixer().blendCycle(this.animationId[Model.STATE_MOTION], model.motionBlend[0], delay);
		model.cal_model.getMixer().blendCycle(this.animationId[Model.STATE_MOTION + 1], model.motionBlend[1], delay);
		model.cal_model.getMixer().blendCycle(this.animationId[Model.STATE_MOTION + 2], model.motionBlend[2], delay);
	}
};

Model.prototype.setState = function(state, delay) {
	if(this.models.length > 0) {
		var model = this.models[this.modelId];

		// check if this is really a new state
		if(state != model.state) {
			switch(state) {
			case Model.STATE_IDLE:
				model.cal_model.getMixer().blendCycle(this.animationId[Model.STATE_IDLE], 1, delay);
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_FANCY], delay);
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_MOTION], delay);
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_MOTION + 1], delay);
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_MOTION + 2], delay);
				break;
			case Model.STATE_FANCY:
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_IDLE], delay);
				model.cal_model.getMixer().blendCycle(this.animationId[Model.STATE_FANCY], 1, delay);
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_MOTION], delay);
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_MOTION + 1], delay);
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_MOTION + 2], delay);
				break;
			case Model.STATE_MOTION:
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_IDLE], delay);
				model.cal_model.getMixer().clearCycle(this.animationId[Model.STATE_FANCY], delay);
				model.cal_model.getMixer().blendCycle(this.animationId[Model.STATE_MOTION], model.motionBlend[0], delay);
				model.cal_model.getMixer().blendCycle(this.animationId[Model.STATE_MOTION + 1], model.motionBlend[1], delay);
				model.cal_model.getMixer().blendCycle(this.animationId[Model.STATE_MOTION + 2], model.motionBlend[2], delay);
				break;
			default:
				break;
			}
		}

		model.state = state;
	}
};

Model.prototype.switchWireframe = function() {
	this.isWireframe = !this.isWireframe;
};

Model.prototype.switchLighting = function() {
	this.hasLighting = !this.hasLighting;
};

Model.prototype.setRenderMode = function(mode) {
	this.renderMode = mode;
};

Model.prototype.nextModel = function() {
	if(this.models.length > 0) {
		this.modelId = (this.modelId + 1) % this.models.length;
	}
};

Model.prototype.executeAction = function(action) {
	if(this.models.length > 0) {
		switch(action) {
		case 0:
			this.models[this.modelId].cal_model.getMixer().executeAction(this.animationId[5], 0.3, 0.3);
			break;
		case 1:
			this.models[this.modelId].cal_model.getMixer().executeAction(this.animationId[6], 0.3, 0.3);
			break;
		default:
			break;	
		}
	}
};

/**
	@private
*/
Model.prototype.loadTextures = function(gl, model, path) {
	// get the core model
	var coreModel = model.cal_model.getCoreModel();

	// a lookup table that map texture url to the corresponding core materials
	var url2mats = {}

	var materialCount = coreModel.getCoreMaterialCount();
	for(var materialId=0; materialId<materialCount; materialId++) {
		// get the core material
		var coreMaterial = coreModel.getCoreMaterial(materialId);

		// loop through all maps of the core material
		var mapCount = coreMaterial.getMapCount();
		for(var mapId=0; mapId<mapCount; mapId++) {
			// load the texture from file
			var filename = coreMaterial.getMapFilename(mapId);
			var url = path + filename;
			if(url2mats[url]) {
				url2mats[url].push( { mat: coreMaterial, id: mapId } );
			}
			else {
				url2mats[url] = [ { mat: coreMaterial, id: mapId } ];
			}
		}
	}

	var onTextureLoad = function(tex, url) {
		var maps = url2mats[url];
		for(var i=0; i<maps.length; i++) {
			maps[i].mat.setMapUserData(maps[i].id, tex);
		}
	};

	var onTextureError = function(url) {
		log('failed to load texture ' + url);
	};

	for(var url in url2mats) {
		loadTexture(gl, url, onTextureLoad, onTextureError);
	}
};

/**
	@private
*/
Model.prototype.renderMesh = function(gl, xform, model) {
	if(this.meshRenderer) {
		this.meshRenderer.begin();

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.frontFace(gl.CCW);

		// get the renderer of the model
		var cal_renderer = model.cal_model.getRenderer();

		// begin the rendering loop
		if(!cal_renderer.beginRendering())
			return;

		var sharedUniforms = [];
		sharedUniforms['u_modelViewProjectionMatrix'] = xform.modelViewProjectionMatrix;
		sharedUniforms['u_modelViewMatrix'] = xform.modelViewMatrix;
		sharedUniforms['u_modelViewMatrixInverseTranspose'] = xform.modelViewMatrixInverseTranspose;
		sharedUniforms['u_isLit'] = this.hasLighting;
		this.meshRenderer.setUniforms(sharedUniforms);

		var m = 0;

		// get the number of meshes
		var meshCount = cal_renderer.getMeshCount();
		// render all meshes of the model
		for(var meshId=0; meshId<meshCount; meshId++) {
			// get the number of submeshes
			var submeshCount = cal_renderer.getSubmeshCount(meshId);
			// render all submeshes of the mesh
			for(var submeshId=0; submeshId<submeshCount; submeshId++) {
				// select mesh and submesh for further data access
				cal_renderer.selectMeshSubmesh(meshId, submeshId);

				// get the material ambient color
				var ambientColor = [0, 0, 0, 0];
				cal_renderer.getAmbientColor(ambientColor);
				ambientColor[0] /= 255;
				ambientColor[1] /= 255;
				ambientColor[2] /= 255;
				ambientColor[3] /= 255;

				// get the material diffuse color
				var diffuseColor = [0, 0, 0, 0];
				cal_renderer.getDiffuseColor(diffuseColor);
				diffuseColor[0] /= 255;
				diffuseColor[1] /= 255;
				diffuseColor[2] /= 255;
				diffuseColor[3] /= 255;

				// get the material specular color
				var specularColor = [0, 0, 0, 0];
				cal_renderer.getSpecularColor(specularColor);
				specularColor[0] /= 255;
				specularColor[1] /= 255;
				specularColor[2] /= 255;
				specularColor[3] /= 255;

				// get the material shininess factor
				var shininess = 50;

				var faceCount = cal_renderer.getFaceCount();
				var vertexCount = cal_renderer.getVertexCount();
				var textureCount = cal_renderer.getMapCount();
				var isTextureReady = false;
				var texture;
				if(textureCount > 0) {
					texture = cal_renderer.getMapUserData(0);
					isTextureReady = texture != null;
				}

				if(!model.meshes[m]) {
					model.meshes.push(new SglMeshGL(gl));
					model.meshIndexBuffers.push(new Uint16Array(faceCount * 3));
					model.meshWireframeIndexBuffer.push(new Uint16Array(faceCount * 6));
					model.meshCoordBuffers.push(new Float32Array(vertexCount * 3));
					model.meshNormalBuffers.push(new Float32Array(vertexCount * 3));
					cal_renderer.getFaces(model.meshIndexBuffers[m]);
					this.calculateWireframeIndices(model.meshIndexBuffers[m], model.meshWireframeIndexBuffer[m]);
					model.meshes[m].addIndexedPrimitives('faces', gl.TRIANGLES, model.meshIndexBuffers[m]);
					model.meshes[m].addIndexedPrimitives('wireframe', gl.LINES, model.meshWireframeIndexBuffer[m]);
					model.meshes[m].addVertexAttribute('position', 3, model.meshCoordBuffers[m]);
					model.meshes[m].addVertexAttribute('normal', 3, model.meshNormalBuffers[m]);
					if(textureCount > 0) {
						model.meshTexCoordBuffers.push(new Float32Array(vertexCount * 2));
						model.meshes[m].addVertexAttribute('texCoord0', 2, model.meshTexCoordBuffers[m]);
					}
					else {
						model.meshTexCoordBuffers.push(new Float32Array(1)); // just a place holder
					}
				}
				else {
					if(model.meshIndexBuffers[m].length != faceCount * 3) {
						model.meshIndexBuffers[m] = new Uint16Array(faceCount * 3);						
						cal_renderer.getFaces(model.meshIndexBuffers[m]);
						model.meshes[m].removePrimitives('faces', true);
						model.meshes[m].addIndexedPrimitives('faces', gl.TRIANGLES, model.meshIndexBuffers[m]);
						model.meshWireframeIndexBuffer[m] = new Uint16Array(faceCount * 6);
						this.calculateWireframeIndices(model.meshIndexBuffers[m], model.meshWireframeIndexBuffer[m]);
						model.meshes[m].removePrimitives('wireframe', true);
						model.meshes[m].addIndexedPrimitives('wireframe', gl.LINES, model.meshWireframeIndexBuffer[m]);
					}

					if(model.meshCoordBuffers[m].length != vertexCount * 3) {
						model.meshCoordBuffers[m] = new Float32Array(vertexCount * 3);
						model.meshNormalBuffers[m] = new Float32Array(vertexCount * 3);
						model.meshes[m].removeVertexAttribute('position', true);
						model.meshes[m].addVertexAttribute('position', 3, model.meshCoordBuffers[m]);
						model.meshes[m].removeVertexAttribute('normal', true);
						model.meshes[m].addVertexAttribute('normal', 3, model.meshNormalBuffers[m]);
						if(textureCount > 0) {
							model.meshTexCoordBuffers[m] = new Float32Array(vertexCount * 2);
							model.meshes[m].removeVertexAttribute('texCoord0', true);
							model.meshes[m].addVertexAttribute('texCoord0', 2, model.meshTexCoordBuffers[m]);
						}
					}
				}

				if(vertexCount > 3 && faceCount > 0) {
					cal_renderer.getVertices(model.meshCoordBuffers[m]);
					var gl_buf = model.meshes[m].vertices.attributes['position'].buffer.handle;
					gl.bindBuffer(gl.ARRAY_BUFFER, gl_buf);
					gl.bufferSubData(gl.ARRAY_BUFFER, 0, model.meshCoordBuffers[m]);
					gl.bindBuffer(gl.ARRAY_BUFFER, null);

					cal_renderer.getNormals(model.meshNormalBuffers[m]);
					gl_buf = model.meshes[m].vertices.attributes['normal'].buffer.handle;
					gl.bindBuffer(gl.ARRAY_BUFFER, gl_buf);
					gl.bufferSubData(gl.ARRAY_BUFFER, 0, model.meshNormalBuffers[m]);
					gl.bindBuffer(gl.ARRAY_BUFFER, null);

					if(textureCount > 0) {
						cal_renderer.getTextureCoordinates(0, model.meshTexCoordBuffers[m]);
						gl_buf = model.meshes[m].vertices.attributes['texCoord0'].buffer.handle;
						gl.bindBuffer(gl.ARRAY_BUFFER, gl_buf);
						gl.bufferSubData(gl.ARRAY_BUFFER, 0, model.meshTexCoordBuffers[m]);
						gl.bindBuffer(gl.ARRAY_BUFFER, null);
					}

					var uniforms = {};
					uniforms['u_ambientColor'] = ambientColor;
					uniforms['u_diffuseColor'] = diffuseColor;
					uniforms['u_specularColor'] = specularColor;
					uniforms['u_shininess'] = shininess;
					uniforms['u_hasTexture'] = isTextureReady;
					this.meshRenderer.setUniforms(uniforms);
					if(isTextureReady) {
						var samplers = {};
						samplers['s_texture0'] = texture;
						this.meshRenderer.setSamplers(samplers);
					}
					if(this.isWireframe) {
						gl.lineWidth(1);
						this.meshRenderer.renderMeshPrimitives(model.meshes[m], 'wireframe');
					}
					else {
						this.meshRenderer.renderMeshPrimitives(model.meshes[m], 'faces');
					}
				}

				m++;
			}
		}

		// end the rendering loop
		cal_renderer.endRendering();

		this.meshRenderer.end();
	}
};

/**
	@private
*/
Model.prototype.renderSkeleton = function(gl, xform, model) {
	if(this.frameRenderer) {
		this.frameRenderer.begin();

		gl.disable(gl.DEPTH_TEST);

		var uniforms = {};
		uniforms['u_modelViewProjectionMatrix'] = xform.modelViewProjectionMatrix;

		var gl_buf;

		// get the bone lines
		var lineCount = model.cal_model.getSkeleton().getBoneLines(model.boneLineCoordBuffer);
		gl_buf = model.boneLines.vertices.attributes['position'].buffer.handle;
		gl.bindBuffer(gl.ARRAY_BUFFER, gl_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, model.boneLineCoordBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// draw the bone lines
		gl.lineWidth(3);
		uniforms['u_isPoint'] = false;
		uniforms['u_color'] = [1, 1, 1];
		this.frameRenderer.setUniforms(uniforms);
		this.frameRenderer.renderMeshPrimitives(model.boneLines, 'lines');

		// get the bone points
		var pointCount = model.cal_model.getSkeleton().getBonePoints(model.bonePointCoordBuffer);
		gl_buf = model.bonePoints.vertices.attributes['position'].buffer.handle;
		gl.bindBuffer(gl.ARRAY_BUFFER, gl_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, model.bonePointCoordBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// draw the bone points
		uniforms['u_isPoint'] = true;
		uniforms['u_color'] = [0, 0, 1];
		this.frameRenderer.setUniforms(uniforms);
		this.frameRenderer.renderMeshPrimitives(model.bonePoints, 'points');

		this.frameRenderer.end();
	}
};

/**
	@private
*/
Model.prototype.renderBoundingBox = function(gl, xform, model) {
	if(this.frameRenderer) {
		this.frameRenderer.begin();

		gl.enable(gl.DEPTH_TEST);

		// get coordinates of bounding boxes
		var skeleton = model.cal_model.getSkeleton();
		skeleton.calculateBoundingBoxes();
		var coreBones = skeleton.getVectorBone();
		var k = 0;
		var points;
		for(var boneId=0; boneId<coreBones.length; boneId++) {
			var bbox = coreBones[boneId].getBoundingBox();
			points = bbox.computePoints(points);
			for(var i=0; i<8; i++) {
				var point = points[i];
				model.boundingBoxCoordBuffer[k++] = point.x;
				model.boundingBoxCoordBuffer[k++] = point.y;
				model.boundingBoxCoordBuffer[k++] = point.z;
			}
		}

		// draw bounding boxes

		var gl_buf = model.boundingBox.vertices.attributes['position'].buffer.handle;
		gl.bindBuffer(gl.ARRAY_BUFFER, gl_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, model.boundingBoxCoordBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.lineWidth(1);
		var uniforms = {};
		uniforms['u_modelViewProjectionMatrix'] = xform.modelViewProjectionMatrix;
		uniforms['u_isPoint'] = false;
		uniforms['u_color'] = [1, 1, 1];
		this.frameRenderer.setUniforms(uniforms);
		this.frameRenderer.renderMeshPrimitives(model.boundingBox, 'edges');

		this.frameRenderer.end();
	}
};

/**
	@private
*/
Model.prototype.calculateWireframeIndices = function(indices, wireframeIndices) {
	for(var i=0, j=0; i<indices.length; i+=3, j+=6) {
		var a, b, c;
		a = indices[i    ];
		b = indices[i + 1];
		c = indices[i + 2];
		wireframeIndices[j    ] = a;
		wireframeIndices[j + 1] = b;
		wireframeIndices[j + 2] = b;
		wireframeIndices[j + 3] = c;
		wireframeIndices[j + 4] = c;
		wireframeIndices[j + 5] = a;
	}
};

Model.STATE_IDLE = 0;
Model.STATE_FANCY = 1;
Model.STATE_MOTION = 2;

Model.MODE_MESH = 0;
Model.MODE_SKELETON = 1;
Model.MODE_BOUNDINGBOX = 2;
Model.MODE_SKELETON_AND_BOUNDINGBOX = 3;



var frame_vertex_shader =	'uniform mat4 u_modelViewProjectionMatrix;\n' +
							'uniform bool u_isPoint;\n' + 
							'attribute vec3 a_position;\n' + 
							'\n' + 
							'void main(void) {\n' + 
							'	if(u_isPoint) {\n' + 
							'		gl_PointSize = 4.0;\n' + 
							'	}\n' + 
							'	gl_Position = u_modelViewProjectionMatrix * vec4(a_position, 1.0);\n' + 
							'}';

var frame_fragment_shader =	'precision mediump float;\n' + 
							'\n' + 
							'uniform vec3 u_color;\n' + 
							'\n' + 
							'void main(void) {\n' + 
							'	gl_FragColor = vec4(u_color, 1.0);\n' + 
							'}';

var mesh_vertex_shader =	'#define LIGHT_DIR		vec3(1.0, -1.0, -1.0)\n' + 
							'#define LIGHT_AMBIENT	vec3(0.3, 0.3, 0.3)\n' + 
							'#define LIGHT_DIFFUSE	vec3(0.52, 0.5, 0.5)\n' + 
							'#define LIGHT_SPECULAR	vec3(0.1, 0.1, 0.1)\n' + 
							'\n' + 
							'uniform mat4 u_modelViewProjectionMatrix;\n' + 
							'uniform mat4 u_modelViewMatrix;\n' + 
							'uniform mat4 u_modelViewMatrixInverseTranspose;\n' + 
							'uniform vec3 u_ambientColor;\n' + 
							'uniform vec3 u_diffuseColor;\n' + 
							'uniform vec3 u_specularColor;\n' + 
							'uniform float u_shininess;\n' + 
							'uniform bool u_hasTexture;\n' + 
							'uniform bool u_isLit;\n' + 
							'attribute vec3 a_position;\n' + 
							'attribute vec3 a_normal;\n' + 
							'attribute vec2 a_texCoord0;\n' + 
							'varying vec3 v_color;\n' + 
							'varying vec2 v_texCoord0;\n' + 
							'\n' + 
							'vec3 illumination() {\n' + 
							'	vec3 ambient, diffuse, specular;\n' + 
							'	vec3 l = -LIGHT_DIR;\n' + 
							'	vec3 n = normalize((u_modelViewMatrixInverseTranspose * vec4(a_normal, 1.0)).xyz);\n' + 
							'	ambient = LIGHT_AMBIENT * u_ambientColor;\n' + 
							'	diffuse = LIGHT_DIFFUSE * u_diffuseColor * max(dot(n , l), 0.0);\n' + 
							'	specular = vec3(0.0, 0.0, 0.0);\n' + 
							'	if(u_shininess > 0.0) {\n' + 
							'		vec3 p = (u_modelViewMatrix * vec4(a_position, 1.0)).xyz;\n' + 
							'		vec3 v = -p;\n' + 
							'		specular = LIGHT_SPECULAR * u_specularColor * pow(max(dot(n, normalize(l + v)), 0.0), u_shininess * 128.0);\n' + 
							'	}\n' + 
							'	return clamp(ambient + diffuse + specular, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));\n' + 
							'}\n' + 
							'\n' + 
							'void main(void) {\n' + 
							'	v_color = u_isLit ? illumination() : u_diffuseColor;\n' + 
							'	if(u_hasTexture) {\n' + 
							'		v_texCoord0 = a_texCoord0;\n' + 
							'	}\n' + 
							'	gl_Position = u_modelViewProjectionMatrix * vec4(a_position, 1.0);\n' + 
							'}';

var mesh_fragment_shader =	'precision mediump float;\n' + 
							'\n' + 
							'uniform bool u_hasTexture;\n' + 
							'uniform sampler2D s_texture0;\n' + 
							'varying vec3 v_color;\n' + 
							'varying vec2 v_texCoord0;\n' + 
							'\n' + 
							'void main(void) {\n' + 
							'	if(u_hasTexture) {\n' + 
							'		gl_FragColor = vec4(v_color, 1.0) * texture2D(s_texture0, v_texCoord0);\n' + 
							'	}\n' + 
							'	else {\n' + 
							'		gl_FragColor = vec4(v_color, 1.0);\n' + 
							'	}\n' + 
							'}';
