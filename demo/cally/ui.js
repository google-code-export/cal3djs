/*****************************************************************************
* Cal3DJS Cally Demo
* by Humu humu2009@gmail.com
* http://code.google.com/p/cal3djs/
*****************************************************************************/


UI = function(app) {
	this.menuX = 4;
	this.menuY = 4;
	this.lodX = 4;
	this.lodY = 4;
	this.motionMovement = false;
	this.lodMovement = false;
	this.actionTimespan = [0, 0];
	this.nextTimespan = 0;

	this.lastTime = 0;
	this.currentTime = 0;
	this.frameCount = 0;
	this.fps = 0;

	this.app = app;

	this.renderer = null;

	this.lines = null;
	this.lineCoordBuffer = null;

	this.panel = null;
	this.panelCoordBuffer = null;
	this.panelTexCoordBuffer = null;

	this.logoTexture = null;
	this.fpsTexture = null;
	this.lodTexture = null;
	this.menuTexture = null;
};

UI.prototype.getMenuItem = function(x, y) {
	// check for the lod bar
	if(x >= this.lodX && x <= (this.lodX + 256) && y >= this.lodY && y <= (this.lodY + 32)) {
		return 9;
	}

	// check for each menu item
	for(var itemId=0; itemId<5; itemId++) {
		if((y - this.menuY >= UI.MENUITEM_Y[itemId]) && (y - this.menuY < UI.MENUITEM_Y[itemId] + UI.MENUITEM_HEIGHT[itemId]))
			return itemId;
	}

	// test for flag menu items
	if((y - this.menuY >= 0) && (y - this.menuY < 35)) {
		return 5 + Math.floor((x - this.menuX) / 32);
	}

	return -1;
};

UI.prototype.isInside = function(x, y) {
	if(x >= this.menuX && x <= (this.menuX + 128) && y >= this.menuY && y <= (this.menuY + 256))
		return true;

	if(x >= this.lodX && x <= (this.lodX + 256) && y >= this.lodY && y <= (this.lodY + 32))
		return true;

	return false;
};

UI.prototype.onInit = function(gl) {
	var uiProgram = new SglProgram(gl, [ui_vertex_shader], [ui_fragment_shader]);
	if(!uiProgram.isValid) {
		log('error occuered in creating UI program:');
		log(uiProgram.log);
		return false;
	}

	this.renderer = new SglMeshGLRenderer(uiProgram);

	this.lines = new SglMeshGL(gl);
	this.lineCoordBuffer = new Float32Array(6 * 3);
	this.lines.addVertexAttribute('position', 3, this.lineCoordBuffer);
	this.lines.addArrayPrimitives('lines', gl.LINES, 0, 6);

	this.panel = new SglMeshGL(gl);
	this.panelCoordBuffer = new Float32Array(4 * 3);
	this.panelTexCoordBuffer = new Float32Array(4 * 2);
	this.panel.addVertexAttribute('position', 3, this.panelCoordBuffer);
	this.panel.addVertexAttribute('texCoord', 2, this.panelTexCoordBuffer);
	this.panel.addIndexedPrimitives('triangles', gl.TRIANGLES, new Uint16Array([0, 1, 2, 0, 2, 3]));

	var logoTextureUrl = 'image/logo.raw';
	var fpsTextureUrl = 'image/fps.raw';
	var lodTextureUrl = 'image/lod.raw';
	var menuTextureUrl = 'image/menu.raw';

	var self = this;
	var onTextureLoad = function(tex, url) {
		switch(url) {
		case logoTextureUrl:
			self.logoTexture = tex;
			break;
		case fpsTextureUrl:
			self.fpsTexture = tex;
			break;
		case lodTextureUrl:
			self.lodTexture = tex;
			break;
		case menuTextureUrl:
			self.menuTexture = tex;
			break;
		default:
			break;
		}
	};
	var onTextureError = function(url) {
		log('failed to load texture ' + url);
	};

	loadTexture(gl, logoTextureUrl, onTextureLoad, onTextureError);
	loadTexture(gl, fpsTextureUrl, onTextureLoad, onTextureError);
	loadTexture(gl, lodTextureUrl, onTextureLoad, onTextureError);
	loadTexture(gl, menuTextureUrl, onTextureLoad, onTextureError);

	return true;
};

UI.prototype.onKey = function() {
};

UI.prototype.onMouseButtonDown = function(gl, button, x, y) {
	// check if the mouse pointer is inside the menu
	if(!this.isInside(x, y))
		return false;

	var menuItem = this.getMenuItem(x, y);
	switch(menuItem) {
	case 0:	// handle the 'idle' button
		this.app.getModel().setState(Model.STATE_IDLE, 0.3);
		break;
	case 1:	// handle 'fancy' button
		this.app.getModel().setState(Model.STATE_FANCY, 0.3);
		break;
	case 2:	// handle 'motion' button/controller
		this.app.getModel().setState(Model.STATE_MOTION, 0.3);
		this.calculateMotionBlend(x, y);
		this.motionMovement = true;
		break;
	case 3:	// handle 'f/x 1' button
		this.app.getModel().executeAction(0);
		this.actionTimespan[0] = 1;
		break;
	case 4:	// handle 'f/x 2' button
		this.app.getModel().executeAction(1);
		this.actionTimespan[1] = 1;
		break;
	case 5:	// handle 'skeleton' button
		var renderMode = this.app.getModel().getRenderMode();
		renderMode = (renderMode + 1) % 4;
		this.app.getModel().setRenderMode(renderMode);
		break;
	case 6:	// handle 'wireframe' button
		this.app.getModel().switchWireframe();
		break;
	case 7:	// handle 'lighting' button
		this.app.getModel().switchLighting();
		break;
	case 8:	// handle 'next model' button
		this.app.getModel().nextModel();
		this.nextTimespan = 0.3;
		break;
	case 9:	// handle lod bar
		this.calculateLodLevel(x, y);
		this.lodMovement = true;
		break;
	default:
		break;
	}

	return true;
};

UI.prototype.onMouseButtonUp = function(gl, button, x, y) {
	if(this.lodMovement) {
		this.lodMovement = false;
		return true;
	}

	if(this.motionMovement) {
		this.motionMovement = false;
		return true;
	}

	return false;
};

UI.prototype.onMouseMove = function(gl, x, y) {
	// update the motion blend factors
	if(this.lodMovement) {
		this.calculateLodLevel(x, y);
		return true;
	}

	// update lod level
	if(this.motionMovement) {
		this.calculateMotionBlend(x, y);		
		return true;
	}

	return false;
};

UI.prototype.onRender = function(gl, xform, width, height) {
	if(this.renderer) {
		xform.projection.loadIdentity();
		xform.projection.ortho(0, width, 0, height, -1, 1);

		xform.view.loadIdentity();

		this.renderer.begin();

		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

		var uniforms = {};
		uniforms['u_modelViewProjectionMatrix'] = xform.modelViewProjectionMatrix;
		uniforms['u_isLine'] = false;
		this.renderer.setUniforms(uniforms);

		// get state of the current model
		var state = this.app.getModel().getState();

		// render the logo
		this.renderPanel(gl, this.logoTexture, 0, 0, 128, 128, 0, 0, 1, 1);

		// render the base menu
		this.renderPanel(gl, this.menuTexture, this.menuX, this.menuY, this.menuX + 128, this.menuY + 256, 0.5, 0, 1, 1);

		// render all active states of the menu

		var startY, endY;

		startY = UI.MENUITEM_Y[state];
		endY = startY + UI.MENUITEM_HEIGHT[state];
		this.renderPanel(gl, this.menuTexture, this.menuX, this.menuY + startY, this.menuX + 128, this.menuY + endY, 0, startY / 256, 0.5, endY / 256);
		
		if(this.actionTimespan[0] > 0) {
			startY = UI.MENUITEM_Y[3];
			endY = startY + UI.MENUITEM_HEIGHT[3];
			this.renderPanel(gl, this.menuTexture, this.menuX, this.menuY + startY, this.menuX + 128, this.menuY + endY, 0, startY / 256, 0.5, endY / 256);
		}

		if(this.actionTimespan[1] > 0) {
			startY = UI.MENUITEM_Y[4];
			endY = startY + UI.MENUITEM_HEIGHT[4];
			this.renderPanel(gl, this.menuTexture, this.menuX, this.menuY + startY, this.menuX + 128, this.menuY + endY, 0, startY / 256, 0.5, endY / 256);
		}

		var renderMode = this.app.getModel().getRenderMode();
		if(renderMode > 0) {
			this.renderPanel(gl, this.menuTexture, this.menuX, this.menuY, this.menuX + 32, this.menuY + 35, 0, 0, 0.125, 35 / 256);
		}

		if(this.app.getModel().getWireframe()) {
			this.renderPanel(gl, this.menuTexture, this.menuX + 32, this.menuY, this.menuX + 64, this.menuY + 35, 0.125, 0, 0.25, 35 / 256);
		}

		if(this.app.getModel().getLighting()) {
			this.renderPanel(gl, this.menuTexture, this.menuX + 64, this.menuY, this.menuX + 96, this.menuY + 35, 0.25, 0, 0.375, 35 / 256);
		}

		// render the base lod bar
		this.renderPanel(gl, this.lodTexture, this.lodX, this.lodY, this.lodX + 256, this.lodY + 32, 0, 0, 1, 0.5);

		// render the current lod state
		var lodLevel = this.app.getModel().getLodLevel();
		this.renderPanel(gl, this.lodTexture, this.lodX + 247 - Math.floor(lodLevel * 200), this.lodY, this.lodX + 256, this.lodY + 32, (247 - lodLevel * 200) / 256, 0.5, 1, 1);

		// render the fps counter
		var digit = this.fps;
		for(var digitId=2; digitId>=0; digitId--) {
			var x = 29 + digitId * 16;
			var u = (digit % 10) * 0.0625;
			this.renderPanel(gl, this.fpsTexture, x, 94, x + 16, 110, u, 0, u + 0.0625, 1);
			digit = Math.floor(digit / 10);
		}

		// render the motion blend triangle state
		if(state == Model.STATE_MOTION) {
			// get current blending factors
			var motionBlend = [0, 0, 0];
			this.app.getModel().getMotionBlend(motionBlend);
			motionX = Math.floor(motionBlend[0] * UI.MENUITEM_MOTION_X[0] + motionBlend[1] * UI.MENUITEM_MOTION_X[1] + motionBlend[2] * UI.MENUITEM_MOTION_X[2]);
			motionY = Math.floor(motionBlend[0] * UI.MENUITEM_MOTION_Y[0] + motionBlend[1] * UI.MENUITEM_MOTION_Y[1] + motionBlend[2] * UI.MENUITEM_MOTION_Y[2]);
			this.lineCoordBuffer[0]  = this.menuX + UI.MENUITEM_MOTION_X[0]; this.lineCoordBuffer[1]  = this.menuY + UI.MENUITEM_MOTION_Y[0]; this.lineCoordBuffer[2]  = 0;
			this.lineCoordBuffer[3]  = this.menuX + motionX;                 this.lineCoordBuffer[4]  = this.menuY + motionY;                 this.lineCoordBuffer[5]  = 0;
			this.lineCoordBuffer[6]  = this.menuX + UI.MENUITEM_MOTION_X[1]; this.lineCoordBuffer[7]  = this.menuY + UI.MENUITEM_MOTION_Y[1]; this.lineCoordBuffer[8]  = 0;
			this.lineCoordBuffer[9]  = this.menuX + motionX;                 this.lineCoordBuffer[10] = this.menuY + motionY;                 this.lineCoordBuffer[11] = 0;
			this.lineCoordBuffer[12] = this.menuX + UI.MENUITEM_MOTION_X[2]; this.lineCoordBuffer[13] = this.menuY + UI.MENUITEM_MOTION_Y[2]; this.lineCoordBuffer[14] = 0;
			this.lineCoordBuffer[15] = this.menuX + motionX;                 this.lineCoordBuffer[16] = this.menuY + motionY;                 this.lineCoordBuffer[17] = 0;

			var gl_buf = this.lines.vertices.attributes['position'].buffer.handle;
			gl.bindBuffer(gl.ARRAY_BUFFER, gl_buf);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.lineCoordBuffer);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);

			gl.lineWidth(2);
			uniforms['u_isLine'] = true;
			uniforms['u_color'] = [1, 0, 0];
			this.renderer.setUniforms(uniforms);
			this.renderer.renderMeshPrimitives(this.lines, 'lines');
		}

		this.renderer.end();
	}

	this.updateFps();
};

UI.prototype.onResize = function(gl, width, height) {
	// adjust menu position to fit the new dimension
	this.menuX = width - 132;

	// adjust lod bar position to fit the new dimension
	this.lodX = width / 2 - 128;
};

UI.prototype.onShutdown = function() {
};

UI.prototype.onUpdate = function(gl, deltaTime) {
	// calculate new timespan for f/x 1
	if(this.actionTimespan[0] > 0) {
		this.actionTimespan[0] -= deltaTime;
		if(this.actionTimespan[0] < 0) {
			this.actionTimespan[0] = 0;
		}
	}

	// calculate new timespan for f/x 2
	if(this.actionTimespan[1] > 0) {
		this.actionTimespan[1] -= deltaTime;
		if(this.actionTimespan[1] < 0) {
			this.actionTimespan[1] = 0;
		}
	}

	// calculate new timespan for 'next model'
	if(this.nextTimespan > 0) {
		this.nextTimespan -= deltaTime;
		if(this.nextTimespan < 0) {
			this.nextTimespan = 0;
		}
	}

	this.currentTime += deltaTime;
};

/**
	@private
*/
UI.prototype.renderPanel = function(gl, tex, minx, miny, maxx, maxy, minu, minv, maxu, maxv) {
	if(tex) {
		var samplers = {};
		samplers['s_texture'] = tex;
		this.renderer.setSamplers(samplers);

		this.panelCoordBuffer[0] = minx;
		this.panelCoordBuffer[1] = miny;
		this.panelCoordBuffer[2] = 0;
		this.panelCoordBuffer[3] = maxx;
		this.panelCoordBuffer[4] = miny;
		this.panelCoordBuffer[5] = 0;
		this.panelCoordBuffer[6] = maxx;
		this.panelCoordBuffer[7] = maxy;
		this.panelCoordBuffer[8] = 0;
		this.panelCoordBuffer[9] = minx;
		this.panelCoordBuffer[10] = maxy;
		this.panelCoordBuffer[11] = 0;

		this.panelTexCoordBuffer[0] = minu;
		this.panelTexCoordBuffer[1] = minv;
		this.panelTexCoordBuffer[2] = maxu;
		this.panelTexCoordBuffer[3] = minv;
		this.panelTexCoordBuffer[4] = maxu;
		this.panelTexCoordBuffer[5] = maxv;
		this.panelTexCoordBuffer[6] = minu;
		this.panelTexCoordBuffer[7] = maxv;

		var gl_buf = this.panel.vertices.attributes['position'].buffer.handle;
		gl.bindBuffer(gl.ARRAY_BUFFER, gl_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.panelCoordBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl_buf = this.panel.vertices.attributes['texCoord'].buffer.handle;
		gl.bindBuffer(gl.ARRAY_BUFFER, gl_buf);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.panelTexCoordBuffer);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		this.renderer.renderMeshPrimitives(this.panel, 'triangles');
	}
};

/**
	@private
*/
UI.prototype.calculateLodLevel = function(x, y) {
	// convert to bar space coordinates
	x -= this.lodX;
	y -= this.lodY;

	// calculate the new lod level from the local coordinates
	var lodLevel = (247 - x) / 200;

	// clamp the value to [0.0, 1.0]
	if(lodLevel < 0) 
		lodLevel = 0;
	if(lodLevel > 1) 
		lodLevel = 1;

	// set new lod level
	this.app.getModel().setLodLevel(lodLevel);
};

/**
	@private
*/
UI.prototype.calculateMotionBlend = function(x, y) {
	// convert to panle's local coordinates
	x -= this.menuX;
	y -= this.menuY;

	// check if the given point is inside motion area
	if(y >= UI.MENUITEM_Y[Model.STATE_MOTION] && y <= (UI.MENUITEM_Y[Model.STATE_MOTION] + UI.MENUITEM_HEIGHT[Model.STATE_MOTION])) {
		// calculate barycentric coordinates inside motion triangle
		var motionBlend = [0, 0, 0];
		motionBlend[0] = 1 - ((x - UI.MENUITEM_MOTION_X[0]) + (UI.MENUITEM_MOTION_Y[0] - y) / 1.732) / 76;

		// clamp first to range [0 - 1]
		if(motionBlend[0] < 0)
			motionBlend[0] = 0;
		if(motionBlend[0] > 1)
			motionBlend[0] = 1;

		motionBlend[1] = 1 - (y - UI.MENUITEM_MOTION_Y[1]) / 66;

		// clamp second to range [0 - 1]
		if(motionBlend[1] < 0)
			motionBlend[1] = 0;
		if(motionBlend[1] > 1)
			motionBlend[1] = 1;

		// clamp sum of first and second to range [0 - 1]
		if(motionBlend[0] + motionBlend[1] > 1) {
			var factor = motionBlend[0] + motionBlend[1];
			motionBlend[0] /= factor;
			motionBlend[1] /= factor;
		}

		motionBlend[2] = 1 - motionBlend[0] - motionBlend[1];

		// clamp third to range [0 - 1]
		if(motionBlend[2] < 0)
			motionBlend[2] = 0;

		// set new motion blend factors
		this.app.getModel().setMotionBlend(motionBlend, 0.1);
	}
};

/**
	@private
*/
UI.prototype.updateFps = function() {
	// calculate fps per 10 frames
	if(++this.frameCount % 10 == 0) {
		this.fps = Math.floor(0.5 + 10 / (this.currentTime - this.lastTime));
		this.lastTime = this.currentTime;
	}
};

UI.MENUITEM_Y        = [228, 200, 94, 66, 38];
UI.MENUITEM_HEIGHT   = [28, 28, 106, 28, 28];
UI.MENUITEM_MOTION_X = [42, 80, 118];
UI.MENUITEM_MOTION_Y = [168, 102, 168];



var ui_vertex_shader =	'uniform mat4 u_modelViewProjectionMatrix;\n' + 
						'uniform bool u_isLine;\n' + 
						'attribute vec3 a_position;\n' + 
						'attribute vec2 a_texCoord;\n' + 
						'varying vec2 v_texCoord;\n' + 
						'\n' + 
						'void main(void) {\n' + 
						'	if(!u_isLine) {\n' + 
						'		v_texCoord = a_texCoord;\n' + 
						'	}\n' + 
						'	gl_Position = u_modelViewProjectionMatrix * vec4(a_position, 1.0);\n' + 
						'}';

var ui_fragment_shader =	'precision mediump float;\n' + 
							'\n' + 
							'uniform bool u_isLine;\n' + 
							'uniform vec3 u_color;\n' + 
							'uniform sampler2D s_texture;\n' + 
							'varying vec2 v_texCoord;\n' + 
							'\n' + 
							'void main(void) {\n' + 
							'	gl_FragColor = u_isLine ? vec4(u_color, 1.0) : texture2D(s_texture, v_texCoord);\n' + 
							'}';
