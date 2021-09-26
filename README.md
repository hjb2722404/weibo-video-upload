<!--
 * @Description: 媒体云项目微博发布视频nodejs端程序说明
 * @Author: he.jianbo
 * @Date: 2019-10-28 22:32:58
 * @LastEditTime: 2019-11-01 13:29:11
 * @LastEditors: he.jianbo
 -->

# 媒体云项目微博发布视频nodejs端程序说明

## 项目说明

这是一个基于 `express` 框架构建的`Nodejs APP`，它用来实现模拟新浪微博登录和发布视频的功能。 

## 部署与运行

### 环境要求

* `Nodejs` 的版本不能低于` v7.6.0`, 需要支持 `async, await`.

* `pm2` : 用来实现应用的运行管理

* `node NPM`最好设置淘宝镜像，或者安装`cnpm`

  ```shell
  $ npm install -g cnpm --registry=https://registry.npm.taobao.org
  ```

* node版本管理建议使用 nvm

* 由于尽管`puppeteer`库内置了一个`chrome`浏览器，但是在服务器环境中运行它需要各种依赖，而这些依赖需要自己安装。测试使用的是`centOS`系统，需要通过以下方式安装依赖：

  ```shell
  //安装依赖库
  $ yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 -y
  
  安装字体
  $ yum install ipa-gothic-fonts xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-utils xorg-x11-fonts-cyrillic xorg-x11-fonts-Type1 xorg-x11-fonts-misc -y
  ```

  

### 部署步骤

* `myapp/` 为程序根目录

* 跳过chrome浏览器下载:

  ```shell
  $ cnpm install --ignore-script
  ```

   

* 手动下载`node_modules/puppeteer`目录下的`package.json`中指定的chrome浏览器源码，并放置到对应目录下：`node_modules/puppeteer/.local-chromium/linux64-706915/chrome-linux`

  [下载地址]( [chromium-browser-snapshots Mirror](https://npm.taobao.org/mirrors/chromium-browser-snapshots/) )

5. 修改`node_modules目`录及子目录的权限为`777`

### 运行


#### node方式运行（不推荐）

```shell
$ node ./bin/www
```
#### npm脚本方式运行 （对node方式的封装，开发环境推荐，实时查看输出）

```shell
$ npm start
```

#### 原生后台守护运行（测试环境可以使用此方案，方便查看运行日志-nohup.out）

```shell
$ nohup node ./bin/www &
```

#### pm2守护运行（生产环境推荐此方案，比较稳定）

```shell
$ pm2 start ./bin/www

// 停止服务：
$ pm2 stop www
```



## 常见问题

