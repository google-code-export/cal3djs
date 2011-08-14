/*****************************************************************************
* Cal3DJS Cally Demo
* by Humu humu2009@gmail.com
* http://code.google.com/p/cal3djs/
*****************************************************************************/


var LEFT_BUTTON   = 0;
var MIDDLE_BUTTON = 1;
var RIGHT_BUTTON  = 2;



CallyDemo = function(){
	this.panels = null;
	this.model = null;

	this.xform = new SglTransformStack;
};

CallyDemo.prototype.load = function(gl) {
	this.panels = new UI(this);
	this.panels.onInit(gl);

	this.model = new Model(this);
	this.model.onInit(gl, 'data/');

	var w = this.ui.width;
	var h = this.ui.height;

	this.panels.onResize(gl, w, h);

	log('Cal3DJS version: ' + Cal3D.CalLibraryConstants.LIBRARY_VERSION/10000 + '\n');
	log('SpiderGL version: ' + SGL_VERSION_STRING + '\n');
};

CallyDemo.prototype.unload = function(gl) {
};

CallyDemo.prototype.keyDown = function(gl, keyCode, keyString) {
};

CallyDemo.prototype.keyUp = function(gl, keyCode, keyString) {
};

CallyDemo.prototype.keyPress = function(gl, keyCode, keyString) {
};

CallyDemo.prototype.mouseDown = function(gl, button, x, y) {
	// we only deal with the left button events
	if(button != LEFT_BUTTON)
		return;

	if(!this.panels.onMouseButtonDown(gl, button, x, y)) {
		this.model.onMouseButtonDown(gl, button, x, y);
	}
};

CallyDemo.prototype.mouseUp = function(gl, button, x, y) {
	// we only deal with the left button events
	if(button != LEFT_BUTTON)
		return;

	if(!this.panels.onMouseButtonUp(gl, button, x, y)) {
		this.model.onMouseButtonUp(gl, button, x, y);
	}
};

CallyDemo.prototype.mouseMove = function(gl, x, y) {
	if(!this.panels.onMouseMove(gl, x, y)) {
		this.model.onMouseMove(gl, x, y);
	}
};

CallyDemo.prototype.mouseWheel = function(gl, delta, x, y) {
};

CallyDemo.prototype.click = function(gl, button, x, y) {
};

CallyDemo.prototype.dblClick = function(gl, button, x, y) {
};

CallyDemo.prototype.resize = function(gl, width, height) {
	this.panels.onResize(gl, width, height);
};

CallyDemo.prototype.update = function(gl, deltaTime) {
	this.model.onUpdate(gl, deltaTime);
	this.panels.onUpdate(gl, deltaTime);
};

CallyDemo.prototype.draw = function(gl) {
	var w = this.ui.width;
	var h = this.ui.height;

	// clear frame buffers
	gl.clearColor(0, 0, 0.2, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

	gl.viewport(0, 0, w, h);

	this.model.onRender(gl, this.xform, w, h);
	this.panels.onRender(gl, this.xform, w, h);
};

CallyDemo.prototype.getWidth = function() {
	return this.ui.width;
};

CallyDemo.prototype.getHeight = function() {
	return this.ui.height;
};

CallyDemo.prototype.getPanels = function() {
	return this.panels;
};

CallyDemo.prototype.getModel = function() {
	return this.model;
};

sglRegisterCanvas('CALLY_CANVAS', new CallyDemo(), 16);
