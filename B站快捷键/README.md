# 脚本说明

> [在Greasy Fork上安装]()

该脚本为B站视频（video）、番剧（bangumi）、直播（live）页面添加了一些快捷键，虽然B站部分页面提供一些播放的快捷键，但较分散，该脚本进行了调整并添加了新的快捷键。
1. <kbd>Ctrl</kbd> 开关弹幕
2. <kbd>Shift</kbd> 画面占比调整
3. <kbd>/?</kbd> 全屏
4. <kbd>'"</kbd> 宽屏
5. <kbd>,<</kbd> 减速
6. <kbd>.></kbd> 加速
7. <kbd>;:</kbd> 视频结束后（处于充电或关联推荐页面）重播，直播时刷新
8. <kbd>Space</kbd> 直播时暂停
9. <kbd>[{</kbd> 上一P（自带）
10. <kbd>]}</kbd> 下一P（自带）

注：活动（blackboard）页面并未进行适配，可能失效，部分情况需要焦点在视频内（点击一下视频画面）

<br/> 

# 按键修改
> __提示：在更新脚本前记得保留自己的修改__

用户可以根据自己需求在代码中修改按键，如下所示，修改`17`为其他值即可。
```
if (17 == e.keyCode) {        // Ctrl 弹幕开关
	danmuToggle();
} 
```
![keyCode对照表](https://riveryale.github.io/Userscripts/assets/pic/BilibiliShortcut/keyCode.png)  
[查看数据来源](http://www.phpweblog.net/kiyone/archive/2007/04/19/1138.html)

<br/>

# 兼容性
- 由于B站网页不定期更新，快捷键可能暂时失效，发现问题后脚本可能（看心情）更新
- 测试过的应用（其他不保证）
  - Microsoft Edge 版本 96.0.1054.34 (官方内部版本) (64 位)
  - Google Chrome 版本 96.0.4664.45 (正式版本) (64 位)
  - Tampermonkey v4.13

<br/>

# 其他
[GitHub Pages](https://riveryale.github.io/Userscripts/)