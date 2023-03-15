// ==UserScript==
// @name         Bangumi快捷播放
// @description  首页追番卡片显示中文标题，浮动卡片增加资源搜索，可添加对应集数播放源，浮动卡片状态实时改变无需刷新
// @namespace    https://github.com/RiverYale/Userscripts/
// @homepage     https://riveryale.github.io/Userscripts/
// @version      3.0
// @author       RiverYale
// @match        *://bangumi.tv
// @match        *://bgm.tv
// @match        *://chii.in
// @icon         https://riveryale.github.io/Userscripts/assets/pic/BangumiEasyPlay/icon.png
// @run-at       document-end
// @compatible   chrome
// @compatible   edge
// @license      MIT License
// ==/UserScript==

/*================= 更新脚本前注意保存自己修改的内容！ =================*/

var autoMark = true;				// 默认点击链接后自动标记为看过
var authSrc = "AGE动漫";			// 若404则表明未更新资源，全部移除，若无需验证则删除引号中的内容
var src_dict = {					// 网址格式，番剧ID: [资源ID, 播放线路, 总体集数偏移, [集数, 增加偏移]...]
	"AGE动漫": {
		pattern: "https://www.agemys.net/play/${id}?playid=${ch}_${ep}",
		search: "https://www.agemys.net/search?query=${keyword}&page=1",
		329114: [20220076, 2, 0],		// 想要成为影之实力者
		339326: [20220134, 2, 0],		// 异世界舅舅
		330054: [20210126, 2, 0],		// 魔王学院的不适合者 第二季
		402223: [20230025, 2, -11],		// 期待在地下城邂逅有错吗 Ⅳ 深章 灾厄篇
		378862: [20220268, 2, 0],		// 别当欧尼酱了！
		320839: [20220084, 2, -12],		// 虚构推理 第二季
	},
	"樱花动漫": {
		pattern: "https://www.yhdmp.cc/vp/${id}-${ch}-${ep}.html",
		search: "https://www.yhdmp.cc/s_all?ex=1&kw=${keyword}",
		329114: [22158, 1, -1],			// 想要成为影之实力者
		339326: [22216, 1, -1],			// 异世界舅舅
		330054: [21208, 1, -1],			// 魔王学院的不适合者 第二季
		402223: [22083, 1, -12],		// 期待在地下城邂逅有错吗 Ⅳ 深章 灾厄篇
		378862: [22350, 1, -1],			// 别当欧尼酱了！
		320839: [22166, 1, -13],		// 虚构推理 第二季
	},
	"Bimi": {
		pattern: "https://www.bimiacg4.net/bangumi/${id}/play/${ch}/${ep}/",
		search: "https://www.bimiacg4.net/vod/search/wd/${keyword}",
		329114: [8150, 1, 0],			// 想要成为影之实力者
		330054: [2783, 1, 0],			// 魔王学院的不适合者 第二季
		378862: [8227, 1, 0],			// 别当欧尼酱了！
		320839: [8270, 1, -12],			// 虚构推理 第二季
	},
	"新番组": {
		pattern: "https://bangumi.online",
		search: "https://bangumi.online",
		329114: "https://bangumi.online/watch/vb6D7_0qgvtzvkAP-",		// 想要成为影之实力者
		218708: "https://www.bilibili.com/bangumi/play/ep164970",		// 比宇宙更遥远的地方
	},
};
/*================= 更新脚本前注意保存自己修改的内容！ =================*/

if($(".loginPanel").length == 1) return;

/* 标题中日文对调 */
var titles = Array.from($(".tinyHeader .textTip:not(.prgCheckIn)"))		// 平铺模式
	.concat(Array.from($(".l.textTip")))		// 列表模式右侧
if(titles.length == 0) return;
var handleTitle_A = function(title) {
	var text = $(title).text();
	var data_original_title = $(title).attr("data-original-title");
	if(!data_original_title){
		return true;
	}
	$(title).text(data_original_title);
	$(title).attr("data-original-title", text);
}
titles.forEach(title => {
	setTimeout(handleTitle_A, 500, title);
});
titles = Array.from($(".subjectItem.title.textTip"))		// 列表模式左侧 - 1, 2, 3
var handleTitle_B = function(title) {
	var text = $(title).find('span').text();
	var data_original_title = $(title).attr("data-original-title");
	if(!data_original_title){
		return true;
	}
	$(title).find('span').text(data_original_title);
	$(title).attr('data-original-title', text);

	var preALink = $(title).prev().prev();
	var preALink_title = $(preALink).attr('data-original-title');
	$(preALink).attr('data-original-title', preALink_title.replace(text, data_original_title));
}
titles.forEach(title => {
	setTimeout(handleTitle_B, 750, title);
});


/* 点击链接后是否自动标记为[看过] */
var _ul = $('<ul style="display: inline-block; float:right;"></ul>');
var _label = $('<label style="display:block; margin:10px;"></label>');
var _input = $('<input type="checkbox" style="vertical-align:middle;">');
var _span = $('<span style="vertical-align:middle;"> 自动标记</span>');
$(_ul).append(_label);
$(_label).append(_input);
$(_label).append(_span);
$(_label).attr("title", "点击播放链接后自动标记为[看过]");
$("#prgManagerHeader").append(_ul);
$(_input).prop("checked", autoMark);
$(_input).click(() => {
	autoMark = $(_input).prop("checked");
});


/* 为已出集数添加资源链接 */
var epLinkList = Array.from($(".load-epinfo"));
var getSrcHref = function(dict, subid, ep) {
	var value = dict[subid];
	ep = Number(ep);
	if(value.constructor == Array) {
		var pattern = dict["pattern"];
		var resId = value[0];
		var resCh = value[1];
		var resEp = ep + value[2];
		for(let i=3; i<value.length; i++) {
			if(ep >= value[i][0]) {
				resEp += value[i][1];
			}
		}
		return pattern.replace(/\$\{id\}/g, resId).replace(/\$\{ch\}/g, resCh).replace(/\$\{ep\}/g, resEp); 
	} else if(value.constructor == String) {
		return value;
	}
	return '';
}
var handleEpLinkList = function(epLink) {
	// 标记该条目下集数的偏移量
	$(epLink.rel).attr("ep_offset", $(epLink).parent().index());

	// 未知集数跳过
	if(epLink.className.indexOf("epBtnNA") > -1) {
		return true;
	}
	var subid = $("#"+epLink.id).attr("subject_id");
	var ep = Number($("#"+epLink.id).text());
	var srcPanel = $("<div><hr class='board'></div>");
	for(let srcName in src_dict) {
		// 根据资源字典添加资源链接
		var dict = src_dict[srcName];
		if(dict[subid] == undefined) {
			var subjectName = $(`[data-subject-id=${subid}][class=textTip]`).text();
			if(dict['search'] == undefined) {
				$(srcPanel).append(`<a href="javascript:alert('未添加搜索地址格式！');" style="margin-right: 10px;display: inline-block;color: #555">${srcName}(搜索)</a>`);
			} else {
				var searchHref = dict['search'].replace(/\$\{keyword\}/g, subjectName)
				$(srcPanel).append(`<a href="${searchHref}" style="margin-right: 10px;display: inline-block;color: #555" target="_blank">${srcName}(搜索)</a>`);
			}
			continue;
		}
		var srcHref = getSrcHref(dict, subid, ep);
		var alink = $('<a style="margin-right:10px; display:inline-block; font-weight:bold;" target="_blank"></a>');
		$(alink).attr("href", srcHref);
		$(alink).text(srcName);
		$(srcPanel).append(alink);

		// 点击资源链接后标记为[看过]
		$(alink).click(() => {
			var watchedLink = "#Watched_" + epLink.id.slice(4);
			if(autoMark && $(watchedLink).length>0) {
				$(watchedLink).click();
			}
		});

		// 已看集数的不测试资源是否可达
		if(epLink.className.indexOf("epBtnWatched")==-1 && srcName==authSrc) {
			var authHref = srcHref;
		}
	}
	$(epLink.rel).append(srcPanel);

	// 测试资源是否可达
	if(authHref != undefined && authHref != "") {
		var isRunUrl = function(url){
			return new Promise(function (resolve, reject) {
				var dom = document.createElement('link');
				dom.href = url;
				dom.rel = 'stylesheet';
				dom.onload = function () {
					document.head.removeChild(dom);
					resolve();
				}
				dom.onerror = reject;
				document.head.appendChild(dom);
			});
		}
		isRunUrl(authHref).then(data => {}).catch(data => {
			// $(srcPanel).remove();
			$(epLink).css({"color":"red"});
			// $(epLink).css({"color":"#00F", "background-color":"#e0e0e0", "border":"1px solid #b6b6b6"});
		});
	}
}
epLinkList.forEach(epLink => {
	setTimeout(handleEpLinkList, 1000, epLink);
});


// 根据状态更新单集进度情况面板
var updataEpStatusTool = function(prg, type) {
	var epid = prg.id.slice(8);
	var gh = $("a:first", prg).attr("href").split('=')[1];
	var epStatusTool = $(".epStatusTool", prg);

	var type_dict = { "看过": 1, "想看": 2, "抛弃": 3, "撤消": 0 };
	var status = type_dict[type];
	var statusLink = $(".epStatusTool a", prg)[0];
	statusLink = $(statusLink).clone(true);

	var epGrid = $(`[rel="#prginfo_${epid}"]`).parent().parent().parent();
	var progressText = $("#prgsPercentNum", epGrid).text();
	var progress = progressText.slice(1,-1).split('/');
	var old_type = $("p", epStatusTool).text();
	var old_status = type_dict[old_type] || 0;
	if((old_status == 1 || old_status == 3) && (status != 1 && status != 3)) {
		progress[0] = Number(progress[0]) - 1;
	} else if((old_status != 1 && old_status != 3) && (status == 1 || status == 3)) {
		progress[0] = Number(progress[0]) + 1;
	}
	$("#prgsPercentNum", epGrid).text(`[${progress[0]}/${progress[1]}]`);

	$(epStatusTool).empty();
	if(status == 0) {
		$(epStatusTool).append(`<p id="epBtnCu_${epid}"></p>`);
	} else {
		$(epStatusTool).append(`<p id="epBtnCu_${epid}" class="epBtnCu">${type}</p>`);
	}
	if(status != 1) {
		var watched = $(statusLink).clone(true);
		$(watched).attr({href: `/subject/ep/${epid}/status/watched?gh=${gh}`, id: `Watched_${epid}`});
		$(watched).text("看过")
		$(epStatusTool).append(watched);

		var watchedTill = $(statusLink).clone(true);
		$(watchedTill).attr({href: `/subject/ep/${epid}/status/watched?gh=${gh}`, id: `WatchedTill_${epid}`});
		$(watchedTill).text("看到")
		$(epStatusTool).append(watchedTill);
	}
	if(status != 2) {
		var queue = $(statusLink).clone(true);
		$(queue).attr({href: `/subject/ep/${epid}/status/queue?gh=${gh}`, id: `Queue_${epid}`});
		$(queue).text("想看")
		$(epStatusTool).append(queue);
	}
	if(status != 3) {
		var drop = $(statusLink).clone(true);
		$(drop).attr({href: `/subject/ep/${epid}/status/drop?gh=${gh}`, id: `Drop_${epid}`});
		$(drop).text("抛弃")
		$(epStatusTool).append(drop);
	}
	if(status != 0) {
		var remove = $(statusLink).clone(true);
		$(remove).attr({href: `/subject/ep/${epid}/status/remove?gh=${gh}`, id: `remove_${epid}`});
		$(remove).text("撤消")
		$(epStatusTool).append(remove);
	}
}


/* 修改进度后实时修改面板状态 */
var prgList = Array.from($("#subject_prg_content").children());
var handleprgList = function(prg) {
	$(".epStatusTool a", prg).click((event) => {
		var type = event.currentTarget.innerText;
		if(type == '看到') {
			updataEpStatusTool(prg, "看过");
			var offset = Number($(prg).attr("ep_offset"));
			var curI = $(prg).index();
			for(let i=curI-offset; i<curI; i++) {
				if($(".epStatusTool p", prgList[i]).text() != '抛弃'){
					updataEpStatusTool(prgList[i], "看过");
				}
			}
		} else {
			updataEpStatusTool(prg, type);
		}

		// 更新显示的面板
		var prg_new = $(prg).clone(true);
		$(prg_new).css("display", "block");
		$("#cluetip-inner").empty();
		$("#cluetip-inner").append(prg_new);
		return false;
	})
}
prgList.forEach(prg => {
	setTimeout(handleprgList, 1500, prg);
});