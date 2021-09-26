/*
 * @Description: 已有登录状态模拟登录模块
 * @Author: he.jianbo
 * @Date: 2019-10-25 12:31:18
 * @LastEditTime: 2019-11-01 14:55:53
 * @LastEditors: he.jianbo
 */

const BrowserObject = require("./browser");
const PageObject = require("./page");
const Publish = require("./publish");
const File = require("./file");
const Config = require("./config.js");

class NoLogin {
  constructor(options={}) {
    this.browserObject = null;
    this.pageObject = null;
    this.publisher = null;
    this.cookies = [];
    this.username = options.username;
    this.password = options.password;
    this.videoUrl = options.videoUrl;
    this.videoTitle = options.videoTitle;
    this.content = options.content;
    this.objectId = options.objectId;
    this.accountId = options.accountId;
  }
  /**
   * @description: 初始化基本对象
   * @param {type} 
   * @return: 
   */
  async init() {
    this.browserObject = new BrowserObject({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: false,
      defaultViewport: { width: 1280, height: 720 }
    });
    console.log(Config.dev.host);
    this.pageObject = new PageObject();
    console.log("初始化浏览器实例");
    await this.browserObject.init().catch(err => {
      console.log("初始化浏览器实例失败");
      console.log(err);
    });
    console.log(typeof this.browserObject.browser);
    console.log("初始化页面实例");
    await this.pageObject.init(this.browserObject.browser);
    console.log(typeof this.pageObject.page);
  }
  /**
   * @description: 开始模拟登录
   * @param {type} 
   * @return: 
   */
  async start(res) {
    console.log("初始化浏览器及页面");
    await this.init();
    console.log("设置请求拦截器");
    await this.pageObject.page.setRequestInterception(true).catch(err => {
      return "设置拦截器状态失败";
    });
    this.pageObject.page.on("request", interceptedRequest => {
      if (
        interceptedRequest.url().endsWith(".png") ||
        interceptedRequest.url().endsWith(".jpg")
      )
        interceptedRequest.abort();
      else interceptedRequest.continue();
    });
    console.log("设置cookies");
    await this.setCookie(this.pageObject.page);
    console.log("去首页");
    await this.pageObject.page.goto("http://weibo.com");
    await this.pub(res);
  }
  /**
   * @description: 开始尝试发布视频
   * @param {type} 
   * @return: 
   */
  async pub(res){
    console.log("发布视频");
    await this.pageObject.page.waitFor(3000);
    console.log(this.pageObject.page.url());
    const file = new File();
    const videoPath = await file.download(this.videoUrl)
    .catch(e=>{
      console.log(e);
    })
    console.log(videoPath);
    const options = {
      browser: this.browserObject.browser,
      page:this.pageObject.page,
      videoPath:videoPath,
      videoTitle:this.videoTitle,
      content:this.content,
      objectId:this.objectId,
      username:this.username,
      accountId:this.accountId
    }
    this.publisher = new Publish(options);
    await this.publisher.run(res);
  }

  /**
   * @description: 重新保存最新cookie
   * @param {type} 
   * @return: 
   */
  async reSetCookie(){
    console.log("重新获取cookies");
    const cookie = await this.pageObject.page.cookies();
    const file = new File();
    const path = __dirname + "/prevent/" + this.username;
    const isExist = await file.isExist(path);
    if (!isExist) {
      file.mkdir(path);
    }
    await file.write(path + "/cookie2.txt", JSON.stringify(cookie));
  }

  /**
   * @description: 获取已保存的cookie
   * @param {type} 
   * @return: 
   */
  async getCookie() {
    const fileObject = new File();
    const filename = __dirname + "/prevent/" + this.username + "/cookie2.txt";
    return new Promise((resolve, reject) => {
      console.log("cookie文件路径:",filename);
      var isExist = fileObject.isExist(filename);
      console.log("isExist:",isExist);
      fileObject
        .isExist(filename)
        .then(result => {
          console.log("fileresult:",result);
          if (result) {
            console.log("cookies文件存在");
            fileObject.read(filename).then(data => {
              resolve(JSON.parse(data));
            });
          } else {
            console.log("cookies文件为空");
            resolve([]);
          }
        })
        .catch(() => {
          reject();
        });
    });
  }

  /**
   * @description: 将本地cookie设置到模拟的浏览器上
   * @param {type} 
   * @return: 
   */
  async setCookie(page) {
    
    var _self = this;
    await this.getCookie()
    .then(cookies => {
      console.log("获取到用户cookies");
      _self.cookies = cookies;
      return new Promise(resolve => {
        if (cookies.length > 0) {
          console.log("cookies长度大于0，开始设置cookies");
          for (let i = 0; i < cookies.length; i++) {
            const element = cookies[i];
            page.setCookie(element);
          }
        }
        resolve();
      });
    });

  }

}

module.exports = NoLogin;
