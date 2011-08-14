/*****************************************************************************
* Cal3DJS Cally Demo
* by Humu humu2009@gmail.com
* http://code.google.com/p/cal3djs/
*****************************************************************************/


function log(msg) {
	var stdout = document.getElementById('LOG');
	if(stdout) {
		stdout.innerHTML += (msg + '\n');
	}
	else if(console) {
		console.info(msg);
	}
}



/**
	Load texture form a given url.
*/
function loadTexture(gl, url, onload, onerror) {
	if(url.length >= 3 && url.substring(url.length - 3, url.length).toLowerCase() == 'raw') {
		var xhr = new XMLHttpRequest;
		xhr.open('GET', url, true);
		xhr.overrideMimeType('text/plain; charset=x-user-defined');

		xhr.onreadystatechange = function() {
			if(this.readyState == 4) {
				if(this.status == 200 || this.status == 0) {
					var stream = new Cal3D.CalBufferSource(this.responseText);

					// read width, height and color depth of the texture
					var width = stream.readInteger();
					var height = stream.readInteger();
					var depth = stream.readInteger();

					// allocate a temporary buffer to hold the texels
					var buf = new Uint8Array(width * height * depth);

					// load the texels
					var bytesRead = stream.readBytes(buf, width * height * depth);
					if(bytesRead < width * height * depth) {
						log('error occured while reading ' + url);
						if(onerror) {
							onerror.call(null, url);
						}
						return;
					}

					var format = (depth == 3) ? gl.RGB : gl.RGBA;
					var opt = {
						minFilter:			gl.LINEAR, 
						magFilter:			gl.LINEAR, 
						wrapS:				gl.CLAMP_TO_EDGE, 
						wrapT:				gl.CLAMP_TO_EDGE, 
						generateMipmap:		false
					};
					var tex = new SglTexture2D(gl, format, width, height, format, gl.UNSIGNED_BYTE, buf, opt);

					if(tex.isValid) {
						if(onload) {
							onload.call(null, tex, url);
						}
					}
					else {
						if(onerror) {
							onerror.call(null, url);
						}
					}
				}
			}
		};

		xhr.onerror = function() {
			if(onerror) {
				onerror.call(null, url);
			}
		};

		xhr.send();
	}
	else {
		var img = new Image;

		img.onload = function() {
			var dim = Math.max(this.width, this.height);
			if(dim <= 16)
				dim = 16;
			else if(dim <= 32)
				dim = 32;
			else if(dim <= 64)
				dim = 64;
			else if(dim <= 128)
				dim = 128;
			else if(dim <= 256)
				dim = 256;
			else
				dim = 512;

			var isScaled = false;
			if(this.width != dim || this.height != dim) {
				var isCanvasClean = false;
				if(!texture_canvas) {
					try	{
						texture_canvas = document.createElement('canvas');
						isCanvasClean = true;
					}
					catch(e) {
						if(onerror) {
							onerror.call(null, url);
						}
						return;
					}
				}

				if(texture_canvas.width != dim || texture_canvas.height != dim) {
					texture_canvas.width = texture_canvas.height = dim;
					isCanvasClean = true;
				}

				try {
					var ctx = texture_canvas.getContext('2d');
					if(!isCanvasClean) {
						ctx.clearRect(0, 0, dim, dim);
					}
					ctx.drawImage(this, 0, 0, dim, dim);
				}
				catch(e) {
					if(onerror) {
						onerror.call(null, url);
					}
					return;
				}

				isScaled = true;
			}

			var opt = {
				minFilter:			gl.LINEAR_MIPMAP_LINEAR, 
				magFilter:			gl.LINEAR, 
				wrapS:				gl.REPEAT, 
				wrapT:				gl.REPEAT, 
				generateMipmap:		true
			};
			var tex = new SglTexture2D(gl, sglTexture2DFromImage(gl, isScaled ? texture_canvas: this, opt));

			if(tex.isValid) {
				if(onload) {
					onload.call(null, tex, url);
				}
			}
			else {
				if(onerror) {
					onerror.call(null, url);
				}
			}
		};

		img.onerror = function() {
			if(onerror) {
				onerror.call(null, url);
			}
		};

		img.src = url;
	}
}

/**
	@private
*/
var texture_canvas = null;
