# 脚本说明

> [在Greasy Fork上安装](https://greasyfork.org/zh-CN/scripts/436275)

该脚本用于Bangumi登陆后，首页追番框中显示中文标题，浮动卡片增加对应集数播放源（需手动添加网址格式），更新剧集状态后自动更新卡片信息
1. 首页追番框中显示中文标题，交换了鼠标悬浮时的内容和页面的内容，使得中文显示在页面上  
  <img src="https://riveryale.github.io/Userscripts/assets/pic/BangumiEasyPlay/title.png" width="350">

2. 添加资源网址格式后在浮动卡片中增加资源链接  
  <img src="https://riveryale.github.io/Userscripts/assets/pic/BangumiEasyPlay/epcard.png" width="250">

3. 点击修改状态按钮后立即修改卡片状态  
  <img src="https://riveryale.github.io/Userscripts/assets/pic/BangumiEasyPlay/epupdate.png" width="250">

4. 点击资源链接后自动更新为“看过”，可关闭，默认状态可在代码中修改`autoMark`为`ture`或`false`。  
  <img src="https://riveryale.github.io/Userscripts/assets/pic/BangumiEasyPlay/automark.png" width="250">

注：SP的剧集不在资源考虑范围内

<br/> 

# 自定义代码
> __提示：在更新脚本前记得保留自己的修改__

## 修改“自动标记”的默认状态
修改代码中的`autoMark`为`ture`表示开启或`false`表示关闭。
```
var autoMark = true;      // 默认点击链接后自动标记为看过
```

## 修改资源验证
Bangumi上更新了并不表示资源网站更新了，该变量表明会使用该网站的资源进行验证，如果网站返回404，则表明未更新资源，移除全部资源列表，剧集数字标红。  
想要修改该值时建议选择一个资源更新较早较全的网站。
```
var authSrc = "AGE动漫";  // 若404则表明未更新资源，全部移除
```

## 添加资源列表
__该内容正确添加后才能进行资源跳转__
- `"AGE动漫"`表示该资源名称，`authSrc`的值与此对应
- `pattern`表示资源网址格式，`${id}`表示在资源网站的id位置，`${ch}`表示播放路线，`${ep}`表示剧集数，这些内容会被替换
- `331887`表示在Bangumi中番剧的ID，可在番剧详情页网址中查看，如第二个番剧的网址为 https://bgm.tv/subject/331887
- 后续的数组表示转换方式，可以没有，第一个数字表示资源网址对应ID，第二个表示播放线路，第三个表示剧集偏移，后续的数组`[x, y]`表示从`x`集开始偏移增加`y`。
- 示例，如番剧《86-不存在的地域-》，Bangumi的ID为`331887`，则第12集对应网址ID为`20210249`，播放线路为`2`，集数为`12-11=1`，18集集数为`18-11+0.5+0.5=8`，第18集最后的网址为 https://www.agefans.vip/play/20210249?playid=2_8
- 若想添加多个资源可用逗号分割

```
var src_dict = {
	"AGE动漫": {  // 网址格式，番剧ID: [资源ID, 总体集数偏移, [集数, 增加偏移]...]
		pattern: "https://www.agefans.vip/play/${id}?playid=${ch}_${ep}",
		331535: [20210253, 2, 0],    // 宿命回响
		331887: [20210249, 2, -11,   // 86-不存在的地域-
				[17.5, 0.5], [18, 0.5], [18.5, 0.5], [19, 0.5]],
		311759: [20200289, 2, 0],    // 结城友奈是勇者~大满开之章~
	}
}
```

<br/>

# 兼容性
- 资源网址的网址必须有固定格式，包括番剧标识符，播放路线（若没有填‘’），有规律的播放集数
- 测试过的应用（其他不保证）
  - Microsoft Edge 版本 96.0.1054.34 (官方内部版本) (64 位)
  - Google Chrome 版本 96.0.4664.45 (正式版本) (64 位)
  - Tampermonkey v4.13

<br/>

# 其他
[GitHub Pages](https://riveryale.github.io/Userscripts/)

[Bangumi动画搜索 跳转AniDB/MyAnimeList/ANN/TMDB和动漫花园等BT站/在线播放站一键跳转](https://greasyfork.org/zh-CN/scripts/405283)