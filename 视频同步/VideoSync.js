// ==UserScript==
// @name         VideoSync视频同步
// @description  允许用户之间建立连接实现视频同步播放（内嵌的网页视频无法同步）
// @namespace    https://github.com/RiverYale/Userscripts/
// @homepage     https://riveryale.github.io/Userscripts/
// @version      0.1
// @author       RiverYale
// @include      *
// @icon         
// @run-at       document-start
// @require      https://unpkg.com/peerjs@1.4.5/dist/peerjs.min.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @compatible   chrome
// @compatible   edge
// @license      MIT License
// ==/UserScript==

/*================= 更新脚本前注意保存自己修改的内容！ =================*/

/*================= 更新脚本前注意保存自己修改的内容！ =================*/



var resourceNum = 2;
let mduicss = document.createElement('link');
mduicss.rel = 'stylesheet';
mduicss.type = 'text/css';
mduicss.href = 'https://unpkg.com/mdui@1.0.2/dist/css/mdui.min.css';
mduicss.onload = uiInit;
let mduijs = document.createElement('script');
mduijs.src = "https://unpkg.com/mdui@1.0.2/dist/js/mdui.min.js";
mduijs.onload = uiInit;
let style = document.createElement('style');
style.innerText = `
.sync-menu-wrapper {
	background: white;
    display: block;
    width: 400px;
    height: 200px;
    position: absolute;
    bottom: 64px;
    right: 10px;
	overflow: hidden;
	box-shadow: 0 3px 5px -1px rgb(0 0 0 / 20%), 0 6px 10px 0 rgb(0 0 0 / 14%), 0 1px 18px 0 rgb(0 0 0 / 12%);
	transition: all .1s
}
.sync-menu-wrapper-hidden {
	height: 0px;
	width: 0px;
}
.sync-menu {
	width: 400px;
	height: 100%;
}
.sync-info-tab {
	display: flex;
    flex-direction: column;
    justify-content: center;
    height: 160px;
}
.sync-info-tab .mdui-row {
	font-size: 14px;
	line-height: 40px;
}
.sync-info-tab .mdui-row button {
	height: 25px;
    line-height: 25px;
    padding: 0;
    width: 40px;
    min-width: 40px;
}
.sync_switch_off .sync_switch_on {
	display: none;
}
.sync_switch_on .sync_switch_off {
	display: none;
}
`

innerHtml = `
<div class="mdui-fab-wrapper">
	<button class="mdui-fab mdui-fab-mini mdui-color-theme-accent mdui-ripple">
		<i class="mdui-icon material-icons">screen_share</i>
		<i class="mdui-icon mdui-fab-opened material-icons">close</i>
	</button>
	<div class='sync-menu-wrapper sync-menu-wrapper-hidden'>
		<div class='sync-menu'>
			<div class="mdui-tab mdui-tab-full-width" mdui-tab>
				<a href="#sync-information" class="mdui-ripple mdui-tab-active">个人信息</a>
				<a href="#sync-connection" class="mdui-ripple">连接列表</a>
			</div>
			<div id="sync-information" class="mdui-container-fluid sync-info-tab">
				<div class="mdui-row sync_switch_off">
					<div class="mdui-col-xs-3 mdui-text-right" style='font-weight:700;'>Peer ID：</div>
					<div class="mdui-col-xs-6 mdui-text-left sync_switch_off">未获取</div>
					<div class="mdui-col-xs-3 mdui-text-left sync_switch_off">
						<button id='peerBtn' class="mdui-btn-dense mdui-btn mdui-color-theme-accent mdui-ripple" mdui-tooltip="{content: '获取Peer ID用于连接'}">获取</button>
					</div>
					<div class="mdui-col-xs-9 mdui-text-left sync_switch_on">id</div>
				</div>
				<div class="mdui-row sync_switch_off">
					<div class="mdui-col-xs-3 mdui-text-right" style='font-weight:700;'>连接状态：</div>
					<div class="mdui-col-xs-6 mdui-text-left">未连接</div>
					<div class="mdui-col-xs-3 mdui-text-left sync_switch_off">
						<button id='connectBtn' class="mdui-btn-dense mdui-btn mdui-color-theme-accent mdui-ripple" mdui-tooltip="{content: '输入对方Peer ID连接'}">连接</button>
					</div>
					<div class="mdui-col-xs-3 mdui-text-left sync_switch_on">
						<button id='closeBtn' class="mdui-btn-dense mdui-btn mdui-color-theme-accent mdui-ripple" mdui-tooltip="{content: '断开Peer ID连接'}">断开</button>
					</div>
				</div>
				<div class="mdui-row sync_switch_off">
					<div class="mdui-col-xs-3 mdui-text-right" style='font-weight:700;'>视频捕获：</div>
					<div class="mdui-col-xs-6 mdui-text-left">未捕获</div>
					<div class="mdui-col-xs-3 mdui-text-left sync_switch_off">
						<button id='catchBtn' class="mdui-btn-dense mdui-btn mdui-color-theme-accent mdui-ripple" mdui-tooltip="{content: '捕获正在播放的视频进行分享'}">捕获</button>
					</div>
				</div>
			</div>
			<div id="sync-connection" class="sync-info-tab">连接列表</div>
		</div>
	</div>
</div>
`

const videoSync = `<div id='video_sync'>${innerHtml}</div>`;
let videoSyncDoc = new DOMParser().parseFromString(videoSync, 'text/html');
let videoSyncMenu = videoSyncDoc.querySelector('#video_sync');

window.onload = function() {
	document.body.appendChild(mduicss);
	document.body.appendChild(style);
	document.body.appendChild(videoSyncMenu);
	document.body.appendChild(mduijs);
}

function uiInit() {
	resourceNum--;
	if(resourceNum > 0) {
		return;
	}
	mdui.$('body').removeClass('mdui-loaded')
	mdui.$('#video_sync').addClass('mdui-loaded');
	mdui.$('#video_sync').addClass('mdui-theme-accent-pink');
	mdui.$('.mdui-fab').on('click', function(e) {
		mdui.$(this).toggleClass('mdui-fab-opened');
		mdui.$('.sync-menu-wrapper').toggleClass('sync-menu-wrapper-hidden');
		mdui.$('.sync-menu-wrapper').prop('init', function (index, oldAttrValue) {
			if(!oldAttrValue) {
				mdui.$('.sync-menu-wrapper .mdui-tab-active').trigger('click');
				return 'true';
			}
		});
	});
	mdui.$('#peerBtn').on('click', function(e) {
		peerInit();
	});
	mdui.$('#connectBtn').on('click', function(e) {
		peerConnect();
	});
	mdui.$('#closeBtn').on('click', function(e) {
		for(let conn of conns) {
			conn.close();
		}
		conns = [];
		asServer = false;
		mdui.$('#sync-information .mdui-row:nth-child(2)').addClass('sync_switch_off');
		mdui.$('#sync-information .mdui-row:nth-child(2)').removeClass('sync_switch_on');
		mdui.$('#sync-information .mdui-row:nth-child(2) div:nth-child(2)').text('连接已关闭');
	});
	mdui.$('#catchBtn').on('click', function(e) {
		videoInit();
	});
}


var peer = null;
var conns = [];
var asServer = false;
var lastPeerId = null;

var syncVideo = null;
var sync = true;

function peerInit() {
	// Create own peer object with connection to shared PeerJS server
	peer = new Peer(null, {
		debug: 2
	});
	
	
	mdui.$('#sync-information .mdui-row:nth-child(1)').removeClass('sync_switch_off');
	mdui.$('#sync-information .mdui-row:nth-child(1)').addClass('sync_switch_on');
	mdui.$('#sync-information .mdui-row:nth-child(1) div:nth-child(4)').text('获取Peer ID中...');

	peer.on('open', function (id) {
		// Workaround for peer.reconnect deleting previous id
		if (peer.id === null) {
			console.log('Received null id from PeerServer');
			peer.id = lastPeerId;
		} else {
			lastPeerId = peer.id;
		}

		console.log('Peer ID: ' + peer.id);

		mdui.$('#sync-information .mdui-row:nth-child(1) div:nth-child(4)').text(peer.id);
	});

	peer.on('connection', function(c) { readyAsServer(c); });

	peer.on('disconnected', function () {
		console.log('PeerServer connection lost. Please reconnect');

		// Workaround for peer.reconnect deleting previous id
		peer.id = lastPeerId;
		peer._lastServerId = lastPeerId;
		peer.reconnect();
	});

	peer.on('close', function() {
		conns = [];
		console.log('PeerServer connection destroyed');
	});

	peer.on('error', function (err) {
		console.log('PeerServer error: ', err);

		mdui.$('#sync-information .mdui-row:nth-child(1)').addClass('sync_switch_off');
		mdui.$('#sync-information .mdui-row:nth-child(1)').removeClass('sync_switch_on');
		mdui.$('#sync-information .mdui-row:nth-child(1) div:nth-child(2)').text('获取失败');
	});
};

function videoInit() {
	let videos = document.querySelectorAll('video, bwp-video');
	for(v of videos) {
		if(!v.paused) {
			syncVideo = v;
			break;
		}
	}
	console.log(syncVideo);
	sync = true;
	if(!syncVideo) {
		mdui.$('#sync-information .mdui-row:nth-child(3) div:nth-child(2)').text('未找到正在播放的视频');
		return;
	}
	
	mdui.$('#sync-information .mdui-row:nth-child(3)').removeClass('sync_switch_off');
	mdui.$('#sync-information .mdui-row:nth-child(3)').addClass('sync_switch_on');
	mdui.$('#sync-information .mdui-row:nth-child(3) div:nth-child(2)').text('捕获成功');

	syncVideo.addEventListener('play', function(event){
		console.log('play', sync, conns.length)
		if(sync && conns.length > 0) {
			sendData(conns, {
				command: 'play',
				currentTime: syncVideo.currentTime
			});
		}
	});

	syncVideo.addEventListener('pause', function(event){
		console.log('pause', sync, conns.length)
		if(sync && conns.length > 0) {
			sendData(conns, {
				command: 'pause',
				currentTime: syncVideo.currentTime
			});
		}
	});

	syncVideo.addEventListener('seeked', function(event){
		console.log('seeked', sync, conns.length)
		if(sync && conns.length > 0) {
			sendData(conns, {
				command: 'seeked',
				currentTime: syncVideo.currentTime
			});
		}
	});
}

function sendData(_conns, data) {
	if(!Array.isArray(_conns)) {
		_conns = [_conns];
	}
	for(let conn of _conns) {
		data.senderId = peer.id;
		data.receiverId = conn.peer;
		conn.send(data)
		console.log('Send data: ', data)
	}
}

function handleData(type, data) {
	console.log('Receive data: ', data);
	if(type == 'server') {
		let _conns = []
		for(let c of conns) {
			if(c.peer != data.senderId) {
				_conns.push(c);
			}
		}
		sendData(_conns, data);
	}

	sync = false;
	if(data.currentTime) {
		syncVideo.currentTime = data.currentTime;
	}
	switch (data.command) {
		case 'play':
			syncVideo.play();
			break;
		case 'pause':
			syncVideo.pause();
			break;
		case 'text':
			alert(data.content);
			break;
	}
}

function readyAsServer(conn) {
	conn.on('open', function() {
		console.log(asServer, conns.length)
		if(!asServer && conns.length > 0) {
			sendData(conn, {
				command: 'text',
				content: 'Target has already connected to another server'
			});
			setTimeout(function() { conn.close(); }, 500);
			return;
		}
		asServer = true;
		conns.push(conn)
		console.log("A client connected: ", conn.peer);
		mdui.$('#sync-information .mdui-row:nth-child(2)').removeClass('sync_switch_off');
		mdui.$('#sync-information .mdui-row:nth-child(2)').addClass('sync_switch_on');
		mdui.$('#sync-information .mdui-row:nth-child(2) div:nth-child(2)').text('已连接（主机）');

		conn.on('data', function(data) {
			handleData('server', data)
		})
	
		conn.on('close', function () {
			console.log("Client closed");
			conns = [];
			asServer = false;
			mdui.$('#sync-information .mdui-row:nth-child(2)').addClass('sync_switch_off');
			mdui.$('#sync-information .mdui-row:nth-child(2)').removeClass('sync_switch_on');
			mdui.$('#sync-information .mdui-row:nth-child(2) div:nth-child(2)').text('对方已断开连接');
		});
	
		conn.on('error', function (err) {
			console.log("Connect error: ", err);
		});
	});
}

function readyAsClient(serverId) {

	mdui.$('#sync-information .mdui-row:nth-child(2)').removeClass('sync_switch_off');
	mdui.$('#sync-information .mdui-row:nth-child(2)').addClass('sync_switch_on');
	mdui.$('#sync-information .mdui-row:nth-child(2) div:nth-child(2)').text('连接中...');

	var conn = peer.connect(serverId, {
		reliable: true
	});
	
	conn.on('open', function () {
		console.log("Connected to server: ", conn.peer);
		mdui.$('#sync-information .mdui-row:nth-child(2) div:nth-child(2)').text('已连接（客户机）');
	});

	conn.on('data', function(data) {
		handleData('client', data)
	})

	conn.on('close', function () {
		console.log("Server closed");
		conns = [];
		mdui.$('#sync-information .mdui-row:nth-child(2)').addClass('sync_switch_off');
		mdui.$('#sync-information .mdui-row:nth-child(2)').removeClass('sync_switch_on');
		mdui.$('#sync-information .mdui-row:nth-child(2) div:nth-child(2)').text('对方已断开连接');
	});

	conn.on('error', function (err) {
		console.log("Connect error: ", err);
		mdui.$('#sync-information .mdui-row:nth-child(2) div:nth-child(2)').text('连接失败');
	});

	conns.push(conn);
}

var peerConnect = function() {
	if(!peer) {
		mdui.$('#sync-information .mdui-row:nth-child(2) div:nth-child(2)').text('未获取Peer ID');
		return;
	}
	if(!asServer) {
		let id = prompt('请输入对方ID');
		if(id) {
			readyAsClient(id);
		}
	}
}

var onKeyDown = function (e) {
	sync = true;
	if (187 == e.keyCode) {				// =+
		if(!peer) {
			peerInit();
		}
		peerConnect();
	} else if (189 == e.keyCode) {		// -_
		videoInit();
	}
}
var onMouseDown = function(e) {
	sync = true;
}
document.addEventListener("keydown", onKeyDown);
document.addEventListener("mousedown", onMouseDown);