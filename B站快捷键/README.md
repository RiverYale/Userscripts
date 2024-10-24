# 脚本说明

> [在Greasy Fork上安装](https://greasyfork.org/zh-CN/scripts/436274)

该脚本为B站视频（video）、番剧（bangumi）、直播（live）页面添加了一些快捷键，虽然B站部分页面提供一些播放的快捷键，但较分散，该脚本进行了调整并添加了新的快捷键。
1. <kbd>Ctrl</kbd> 开关弹幕
2. <kbd>L</kbd> 画面占比调整
3. <kbd>/?</kbd> 全屏
4. <kbd>'"</kbd> 宽屏
5. <kbd>,<</kbd> 减速
6. <kbd>.></kbd> 加速
7. <kbd>;:</kbd> 视频结束后（处于充电或关联推荐页面）重播，直播时刷新
8. <kbd>Space</kbd> 直播时暂停
9. <kbd>↑</kbd> 直播时音量+，自己调音量才改变默认值
10. <kbd>↓</kbd> 直播时音量-
11. <kbd>[{</kbd> 上一P（自带）
12. <kbd>]}</kbd> 下一P（自带）
13. <kbd>M</kbd> 静音（包括直播，会修改默认状态）
14. <kbd>Q</kbd> 直播选择最高画质
14. <kbd>S</kbd> 直播宽屏模式下切换弹幕侧边栏

<br/> 

# 按键修改
> __提示：在更新脚本前记得保留自己的修改__

用户可以根据自己需求在代码中修改按键，如下所示，修改`17`为其他值即可。
```
if (17 == e.keyCode) {        // Ctrl 弹幕开关
	danmuToggle();
} else if (e.shiftKey && 76 == e.keyCode) {		// shift + L 画面占比调整，组合键使用
    videoScale();
}
```
![keyCode对照表](https://riveryale.github.io/Userscripts/assets/pic/BilibiliShortcut/keyCode.png)  

[查看数据来源](http://www.phpweblog.net/kiyone/archive/2007/04/19/1138.html)

[Js按键编码查看工具](https://www.toptal.com/developers/keycode)

<br/>

# 兼容性
- 由于B站网页不定期更新，快捷键可能暂时失效，发现问题后脚本可能（看心情）更新
- 测试过的应用（其他不保证）
  - Microsoft Edge 版本 96.0.1054.34 (官方内部版本) (64 位)
  - Google Chrome 版本 96.0.4664.45 (正式版本) (64 位)
  - Tampermonkey v4.13

<br/>

# 其他
- 当快捷键失效时可尝试点击一下视频画面，保证焦点位于画面中
- 手动修改代码后，插件可能会停止自动更新，功能出现问题时可到脚本安装页面查看是否有更新

[GitHub Pages](https://riveryale.github.io/Userscripts/)

_转载请注明出处_

<br/>

# 更新日志
- v5.5
  - 新增Q键直播选择最高画质
  - 新增S键直播宽屏模式下切换弹幕侧边栏
  - 文本输入时不触发快捷键
  - 在直播画质增强时，画面占比调整显示异常问题修复
- v5.4
  - 快捷键冲突判断完善组合键情况
- v5.3
  - 增加部分快捷键冲突判断
- v5.2
  - 功能适配B站网页更新
- v5.1
  - 功能适配B站网页更新
- v5.0
  - 功能适配B站网页更新
  - 新增M键静音功能，包括直播页面
  - 视频画面占比默认快捷键修改为L键
- v4.5
  - 新增festival页面
- v4.4
  - 新增直播音量调节功能（上下方向键控制）