// ==UserScript==
// @name         B站快捷键
// @description  B站播放视频或直播时可用的快捷键
// @namespace    https://github.com/RiverYale/Userscripts/
// @version      4.2
// @author       RiverYale
// @match        *://www.bilibili.com/video/*
// @match        *://www.bilibili.com/bangumi/*
// @match        *://www.bilibili.com/blackboard/*
// @match        *://live.bilibili.com/*
// @icon         *://www.bilibili.com/favicon.ico?v=1
// @run-at       document-start
// @compatible   chrome
// @compatible   edge
// @license      Apache-2.0
// ==/UserScript==

var onKeyDown = function (e) {
	if (17 == e.keyCode) {				// Ctrl 弹幕开关
		danmuToggle();
	} else if (16 == e.keyCode) {		// Shift 画面占比调整
		videoScale();
	} else if (191 == e.keyCode) {		// /? 全屏
		fullScreenToggle();
	} else if (222 == e.keyCode) {		// '" 宽屏
		wideScreenToggel();
	} else if (188 == e.keyCode) {		// ,< 减速
		speedAdjust("down");
	} else if (190 == e.keyCode) {		// .> 加速
		speedAdjust("up");
	} else if (186 == e.keyCode) {		// ;: 视频结束后重播，直播时刷新
		restart();
	} else if (32 == e.keyCode) {		// Space 直播时暂停
		livePause(e);
	}
}
document.addEventListener("keydown", onKeyDown);

var pageType = 0;
if (document.URL.indexOf("https://www.bilibili.com/video") >= 0) {
	pageType = 0;
} else if(document.URL.indexOf("https://www.bilibili.com/bangumi") >= 0) {
	pageType = 1;
} else if(document.URL.indexOf("https://www.bilibili.com/blackboard") >= 0) {
	pageType = 2;
} else if(document.URL.indexOf("https://live.bilibili.com") >= 0) {
	pageType = 3;
}

function danmuToggle() {
	switch(pageType) {
		case 0:
		case 2:
			fireKeyEvent(document.querySelector('body'), 'keydown', 68);
			fireKeyEvent(document.querySelector('body'), 'keyup', 68);
			break;
		case 1:
			document.querySelectorAll('[aria-label="弹幕显示隐藏"] .bui-switch-input')[0].click();
			break;
		case 3:
			var video = document.querySelector("video");
			imitataMouseMove(video, 0, 0);
			document.querySelectorAll(".right-area.svelte-1dsiks1 .icon")[2].click()
			break;
	}
}

function videoScale() {
	var video;
	switch(pageType) {
		case 0:
		case 1:
		case 2:
			var video_wrapper = document.querySelector(".bilibili-player-video");
			video_wrapper.style.justifyContent = 'center';
			video_wrapper.style.alignItems = 'center';
			video = video_wrapper.children[0];
			if (video_wrapper.children.length < 2) {
				var style_node = document.createElement('style');
				style_node.innerHTML = 'bwp-video { height: 100%; }';
				video_wrapper.appendChild(style_node);
			}
			break;
		case 3:
			video = document.querySelector("video");
			video.style.bottom = '0';
			video.style.right = '0';
			video.style.margin = 'auto';
			break;
	}

	if (video.style.width == '') {
		video.style.width = '100%';
	}
	var width = video.style.width.slice(0, -1) - 25;
	width = (width + 75) % 100 + 25;
	video.style.width = width + '%';
	video.style.height = width + '%';
}

function fullScreenToggle() {
	switch(pageType) {
		case 0:
		case 1:
		case 2:
			// var fullScreen = document.querySelector("[data-text='进入全屏']");
			// if (fullScreen == null) {
			// 	fullScreen = document.querySelector("[data-text='退出全屏']");
			// }
			// fullScreen.click();
			fireKeyEvent(document.querySelector('body'), 'keydown', 70);
			fireKeyEvent(document.querySelector('body'), 'keyup', 70);
			break;
		case 3:
			var video = document.querySelector("video");
			imitataMouseMove(video, 0, 0);
			document.querySelectorAll(".right-area.svelte-1dsiks1 .icon")[0].click()
			break;
	}
}

function wideScreenToggel() {
	switch(pageType) {
		case 0:
		case 1:
		case 2:
			var wideScreen = document.querySelector("[data-text='宽屏模式']");
			if (wideScreen == null) {
				wideScreen = document.querySelector("[data-text='进入宽屏']");
			}
			if (wideScreen == null) {
				wideScreen = document.querySelector("[data-text='退出宽屏']");
			}
			wideScreen.click();
			break;
		case 3:
			var video = document.querySelector("video");
			imitataMouseMove(video, 0, 0);
			document.querySelectorAll(".right-area.svelte-1dsiks1 .icon")[1].click()
			break;
	}
}

function speedAdjust(upOrDown) {
	switch(pageType) {
		case 0:
		case 1:
		case 2:
			// imitateMouseClick("contextmenu", video, 10, 10);
			// danmuToggle();
			var video = document.querySelector(".bilibili-player-video");
			var step = document.querySelectorAll('.bilibili-player-video-btn-speed-menu')[0].children;
			for (let i = 0; i < step.length; i++) {
				if(-1 != step[i].getAttribute("class").search("bilibili-player-active")) {
					var infoText = step[i].innerHTML;
					if ("down" == upOrDown && i < step.length - 1) {
						step[i + 1].click();
						infoText = step[i + 1].innerHTML;
					} else if ("up" == upOrDown && i > 0) {
						step[i - 1].click();
						infoText = step[i - 1].innerHTML;
					}
					break;
				}
			}
			showInfo(video, infoText);
			// danmuToggle();
			break;
		case 3:
			break;
	}
}

function restart() {
	switch(pageType) {
		case 0:
		case 1:
		case 2:
			var electricPanel = document.querySelector(".bilibili-player-electric-panel");
			var jumpElectric = document.querySelector(".bilibili-player-electric-panel-jump-content");
			if (electricPanel != null && window.getComputedStyle(electricPanel).display == 'block') {
				jumpElectric.click();
			}
			var endingPanel = document.querySelector(".bilibili-player-ending-panel");
			var restartIcon = document.querySelector(".bilibili-player-upinfo-span.restart")
			if (endingPanel != null && window.getComputedStyle(endingPanel).display == 'block') {
				restartIcon.click();
			}
			break;
		case 3:
			var video = document.querySelector("video");
			imitataMouseMove(video, 0, 0);
			document.querySelectorAll(".left-area.svelte-1dsiks1 .icon")[1].click()
			break;
	}
}

function livePause(e) {
	switch(pageType) {
		case 0:
		case 1:
		case 2:
			break;
		case 3:
			e.preventDefault();
			var video = document.querySelector("video");
			imitataMouseMove(video, 0, 0);
			document.querySelectorAll(".left-area.svelte-1dsiks1 .icon")[0].click()
			break;
	}
}

/* 鼠标按键事件模拟 */
function imitateMouseClick(type, oElement, iClientX, iClientY) {
	var oEvent;
	oEvent = document.createEvent("MouseEvents");
	var rect = oElement.getBoundingClientRect();
	oEvent.initMouseEvent(type, true, true, document.defaultView, 0, 0, 0, rect.x + iClientX, rect.y + iClientY, false, false, false, false, 0, null);
	oElement.dispatchEvent(oEvent);
}

/* 鼠标移动事件模拟 */
function imitataMouseMove(oElement, clientX, clientY) {
	var doc = oElement.ownerDocument;
	var	win = doc.defaultView || doc.parentWindow;
	var mousemove = document.createEvent("MouseEvent");
	mousemove.initMouseEvent("mousemove", true, true, win, 0, clientX, clientY, clientX, clientY, 0, 0, 0, 0, 0, null);
	oElement.dispatchEvent(mousemove);
}

/* 键盘事件模拟 */
function fireKeyEvent(el, evtType, keyCode){
	var doc = el.ownerDocument;
	var	win = doc.defaultView || doc.parentWindow;
	var	evtObj;
	if (doc.createEvent){
		if (win.KeyEvent) {
			evtObj = doc.createEvent('KeyEvents');
			evtObj.initKeyEvent( evtType, true, true, win, false, false, false, false, keyCode, 0 );
		} else if (doc.createEventObject) {
			evtObj = doc.createEventObject();
			evtObj.keyCode = keyCode;
			el.fireEvent('on' + evtType, evtObj);
		} else {
			evtObj = doc.createEvent('UIEvents');
			Object.defineProperty(evtObj, 'keyCode', {
		        get : function() { return this.keyCodeVal; }
		    });
		    Object.defineProperty(evtObj, 'which', {
		        get : function() { return this.keyCodeVal; }
		    });
			evtObj.initUIEvent( evtType, true, true, win, 1 );
			evtObj.keyCodeVal = keyCode;
			if (evtObj.keyCode !== keyCode) {
		        console.log("keyCode " + evtObj.keyCode + " 和 (" + evtObj.which + ") 不匹配");
		    }
		}
		el.dispatchEvent(evtObj);
	}
}

/* 元素中间显示提示 */
function showInfo(parent, text, width = 100) {
	var infoBoard = document.createElement("div");
	var style = infoBoard.style;
	infoBoard.setAttribute("id", "_infoBoard");
	infoBoard.innerText = text;
	style.width 		= `${width}px`;
	style.height 		= "45px";
	style.left 			= `calc(50% - ${width / 2}px)`;
	style.top 			= "calc(50% - 50px)";
	style.lineHeight 	= "45px";
	style.background 	= "rgba(0, 0, 0, 0.6)";
	style.color 		= "rgba(255, 255, 255, 0.8)";
	style.position 		= "absolute";
	style.zIndex 		= "12";
	style.fontSize 		= "25px";
	style.textAlign 	= "center";

	var oldOne = parent.querySelector("#_infoBoard");
	if (oldOne != null) {
		parent.removeChild(oldOne);
	}
	var pos = parent.style.position;
	parent.style.position = "relative";
	parent.appendChild(infoBoard);
	setTimeout(function () {
		try {
			parent.removeChild(infoBoard);
		} catch (error) {}
		parent.style.position = pos;
	}, 1500);
}

// function imitataMouseMove(oElement, clientX, clientY) {
// 	var doc = oElement.ownerDocument;
// 	var	win = doc.defaultView || doc.parentWindow;
// 	var mousemove = document.createEvent("MouseEvent");
// 	mousemove.initMouseEvent("mousemove", true, true, win, 0, clientX, clientY, clientX, clientY, 0, 0, 0, 0, 0, null);
// 	oElement.dispatchEvent(mousemove);
// }
// setInterval(() => {
// 	var video = document.querySelector("video");
// imitataMouseMove(video, 0, 0);
// }, 1000);
