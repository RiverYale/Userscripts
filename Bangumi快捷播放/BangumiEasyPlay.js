// ==UserScript==
// @name         Bangumi快捷播放
// @description  首页追番卡片显示中文标题，浮动卡片状态实时改变无需刷新，浮动卡片增加对应集数播放源（需手动添加网址格式）
// @namespace    https://github.com/RiverYale/Userscripts/
// @homepage     https://riveryale.github.io/Userscripts/
// @version      2.5
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
var authSrc = "AGE动漫";			// 若404则表明未更新资源，全部移除
var src_dict = {
	"AGE动漫": {					// 网址格式，番剧ID: [资源ID, 播放线路, 总体集数偏移, [集数, 增加偏移]...]
		pattern: "https://www.agemys.com/play/${id}?playid=${ch}_${ep}",
		331887: [20210249, 2, -11, 		// 86-不存在的地域-
				[17.5, 0.5], [18, 0.5], [18.5, 0.5], [19, 0.5]],
		322955: [20210258, 2, 0],		// 白金终局
		296109: [20210169, 2, 0],		// 国王排名
		328195: [20210098, 2, 0],		// 鬼灭之刃 游郭篇
		331752: [20220062, 2, -75],		// 进击的巨人 最终季
		336458: [20220063, 2, 0],		// 与变成了异世界美少女的大叔一起冒险
		312958: [20200302, 2, 0],		// 公主连结！Re:Dive 第二季
		333158: [20220070, 2, 0],		// 更衣人偶坠入爱河
		275371: [20190156, 3, 0],		// 只要长得可爱，即使是变态你也喜欢吗？
	},
	"森之屋": {
		pattern: "https://www.senfun.net/watch/${id}/${ch}/${ep}.html",
		331887: ['4hGGGQ', 1, -11,		// 86-不存在的地域-
				[17.5, 0.5], [18, 0.5], [18.5, 0.5], [19, 0.5]],
		322955: ['GuGGGQ', 1, 0],		// 白金终局
		296109: ['fhGGGQ', 1, 0],		// 国王排名
		328195: ['DuGGGQ', 1, 0],		// 鬼灭之刃 游郭篇
		331752: ['DbGGGQ', 1, -75],		// 进击的巨人 最终季
		336458: ['9bGGGQ', 1, 0],		// 与变成了异世界美少女的大叔一起冒险
		312958: ['JbGGGQ', 1, 0],		// 公主连结！Re:Dive 第二季
		333158: ['4bGGGQ', 1, 0],		// 更衣人偶坠入爱河
		275371: ['AgGGGQ', 2, 0],		// 只要长得可爱，即使是变态你也喜欢吗？
	},
	"bimi动漫": {
		pattern: "http://www.bimiacg4.net/bangumi/${id}/play/${ch}/${ep}/",
		331887: [3665, 1, -11,			// 86-不存在的地域-
				[17.5, 0.5], [18, 0.5], [18.5, 0.5], [19, 0.5]],
		322955: [3712, 1, 0],			// 白金终局
		296109: [3710, 1, 0],			// 国王排名
		328195: [3734, 1, 0],			// 鬼灭之刃 游郭篇
	},
	"MaliMali": {
		pattern: "https://www.malimali3.com/play/${id}-${ch}-${ep}.html",
	},
};

/*================= 更新脚本前注意保存自己修改的内容！ =================*/

if($(".loginPanel").length == 1) {
	return;
}

/* 标题中日文对调 */
var titles = Array.from($(".tinyHeader .textTip:not(.prgCheckIn)"))
		.concat(Array.from($(".subjectItem.title.textTip")))
		.concat(Array.from($(".l.textTip")))
titles.forEach(title => {
	var text = $(title).text();
	$(title).text($(title).attr("data-original-title"));
	$(title).attr("data-original-title", text);
});
if(titles.length == 0) {
	return;
}

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

/* 为已出集数添加资源链接 */
var epLinkList = Array.from($(".load-epinfo"));
epLinkList.forEach(epLink => {
	// 标记该条目下集数的偏移量
	$(epLink.rel).attr("ep_offset", $(epLink).parent().index());

	// 未知集数跳过
	if(epLink.className.indexOf("epBtnNA") > -1) {
		return true;
	}
	var subid = $("#"+epLink.id).attr("subject_id");
	var ep = Number($("#"+epLink.id).text());
	var srcPanel = $("<div><hr class='board'></div>");
	var alinkNum = 0;
	for(let srcName in src_dict) {
		// 根据资源字典添加资源链接
		var dict = src_dict[srcName];
		if(dict[subid] == undefined) {
			continue;
		}
		var srcHref = getSrcHref(dict, subid, ep);
		var alink = $('<a style="margin-right: 10px;display: inline-block;" target="_blank"></a>');
		$(alink).attr("href", srcHref);
		$(alink).text(srcName);
		$(srcPanel).append(alink);
		alinkNum++;

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
	if(alinkNum == 0) {
		$(srcPanel).append('<a href="javascript:;">未添加资源ID</a>');
	}
	$(epLink.rel).append(srcPanel);

	// 测试资源是否可达
	if(authHref != undefined) {
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
			$(srcPanel).remove();
			$(epLink).css({"color":"red"});
			// $(epLink).css({"color":"#00F", "background-color":"#e0e0e0", "border":"1px solid #b6b6b6"});
		});
	}
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
prgList.forEach(prg => {
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
});