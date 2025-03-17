

var Module = {
	error: function(v) {
		console.log(v);
	},
	startSequence: 0,
    preRun: [ function(){Module.c64preRun();} ],
    postRun: [ function(){Module.c64postRun();} ],
	c64preRun: function() {
		FS.mkdir('/data');
		FS.mount(IDBFS, {}, '/data');
		FS.syncfs(true, function (err) {
			Module.c64FsSync();
		});		
	},
	c64postRun: function() {
		Module.startSequence|= 1;
		if( Module.startSequence == 3 ) Module.c64startup();
	},
	c64FsSync: function() {
		Module.startSequence|= 2;
		if( Module.startSequence == 3 ) Module.c64startup();
	},
	c64startup: function() {
		Module.loadSnapshot('Joystick_Test.s64');
	},
	canvas: document.getElementById('canvas'),
	diskBoxCombo: document.getElementById('diskbox_combo'),
	progressElement: document.getElementById('progress'),
	statusElement: document.getElementById('status'),
	setStatus: function(text) {
	  if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
	  if (text === Module.setStatus.text) return;
	  var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
	  var now = Date.now();
	  if (m && now - Date.now() < 30) return; // if this is a progress update, skip it if too soon
	  if (m) {
		text = m[1];
		Module.progressElement.value = parseInt(m[2])*100;
		Module.progressElement.max = parseInt(m[4])*100;
		Module.progressElement.hidden = false;
	  } else {
		Module.progressElement.value = null;
		Module.progressElement.max = null;
		Module.progressElement.hidden = true;
	  }
	  Module.statusElement.innerHTML = text;
	}, 
	totalDependencies: 0,
	monitorRunDependencies: function(left) {
	  this.totalDependencies = Math.max(this.totalDependencies, left);
	  Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
	},
	lastSnapshot: '',
	loadSnapshot: function(file, useStorage) {
		Module.lastSnapshot = 'data/'+file;
		if( useStorage && file != '' && Module.snapshotStorage(0) ) {
			return;
		}
		Module.lastSnapshot = '';
		var request;
		if (window.XMLHttpRequest) {
			request = new XMLHttpRequest();
		} else {
			request = new ActiveXObject('Microsoft.XMLHTTP');
		}
		// load
		request.open('GET', '/c64/snapshots/'+file, true);
		request.responseType = "arraybuffer";
		request.onload = function (oEvent) {
		  if (request.readyState === 4 && request.status === 200 ) {
			var arrayBuffer = request.response;
			if (arrayBuffer) {
				var byteArray = new Uint8Array(arrayBuffer);
				if( Module.ccall('js_LoadSnapshot', 'number', ['array', 'number'], [byteArray, byteArray.byteLength]) ) {
					Module.lastSnapshot = 'data/'+file;
				}
				Module.diskBoxCombo.innerHTML  = Module.getDiskBoxHtml();
			}
		  }
		};
		request.send();
	},
	loadFile: function(fileName, startup) {
		Module.lastSnapshot = '';
		var request;
		if (window.XMLHttpRequest) {
			request = new XMLHttpRequest();
		} else {
			request = new ActiveXObject('Microsoft.XMLHTTP');
		}
		// load
		request.open('GET', '/c64/snapshots/'+fileName, true);
		request.responseType = "arraybuffer";
		request.onload = function (oEvent) {
		  if (request.readyState === 4 && request.status === 200 ) {
			var arrayBuffer = request.response;
			if (arrayBuffer) {
				var byteArray = new Uint8Array(arrayBuffer);
				Module.ccall('js_LoadFile', 'number', ['string', 'array', 'number', 'number'], [fileName, byteArray, byteArray.byteLength, startup]);
				Module.diskBoxCombo.innerHTML  = Module.getDiskBoxHtml();
			}
		  }
		};
		request.send();
	},
	setJoystick: function(key, down) {
		Module.ccall('js_setJoystick', 'number', ['number', 'number'], [key, down]);
	},
	selectJoystick: function(player1, player2) {
		Module.ccall('js_selectJoystick', 'number', ['number', 'number'], [player1, player2]);
	},
	setKey: function(key, down) {
		Module.ccall('js_setKey', 'number', ['number', 'number'], [key, down]);
	},
	handleDiskBoxClick: function(event) {
		Module.ccall('js_setDiskbox', 'number', ['number'], [document.diskbox.disk.value]);
		document.diskbox.disk.blur();
		return false;
	},
	getDiskBoxHtml: function() {
		return Module.ccall('js_getDiskboxHtml', 'string', [], []);
	},
	setMute: function(mute) {
		return Module.ccall('js_setMute', 'number', ['number'], [mute]);
	},
	muteState: 0,
	toggleMute: function() {
		this.muteState^= 1;
		return Module.setMute(this.muteState);
	},
	snapshotStorage: function(save) {
		var res = Module.ccall('js_snapshotStorage', 'number', ['number', 'string'], [save, Module.lastSnapshot]);
		if( res && save ) {
			FS.syncfs(function (err) {
			});
		}
		else if( !save ) {
			Module.diskBoxCombo.innerHTML  = Module.getDiskBoxHtml();
		}
		return res;
	},
	requestC64FullScreen: function() {
		Module.ccall('js_requestFullscreen', 'number', ['number', 'number'], [1, 0]);
	},
	onFullScreenExit: function(softFullscreen) {
	}
};
Module.setStatus('Downloading...'); 


var arrow_keys_handler = function(e) {
    switch(e.keyCode){
        case 37: case 39: case 38:  case 40:
        case 32: case 17: case 112: case 114: case 116: case 118: e.preventDefault(); break;
        default: break;
    }
};
window.addEventListener("keydown", arrow_keys_handler, false);
window.addEventListener("keyup", arrow_keys_handler, false);

