/*
 * @Description: 登录验证模块
 * @Author: he.jianbo
 * @Date: 2019-10-25 12:31:18
 * @LastEditTime: 2019-11-01 14:51:06
 * @LastEditors: he.jianbo
 */

const BrowserObject = require("./browser");
const PageObject = require("./page");
const File = require("./file");
const Config = require("./config.js");

class Login {
  constructor(options={}) {
    this.browserObject = null;
    this.pageObject = null;
    this.cookies = [];
    this.username = options.username;
    this.password = options.password;
    this.returnTimes = 0;
    this.retrytimes = 0;
    this.timer=null;
  }
  /**
   * @description: 初始化
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
   * @description: 开始登录验证
   * @param {type} 
   * @return: 
   */
  async start(res) {
    if(this.retrytimes == 1){
      await this.screenshotPage(res);
      await this.browserObject.close();
      return;
    }
    this.retrytimes++;
    
    const isLogin = await this.getLoginResult(res);
    console.log("用户是否已登录成：",isLogin);
    if(isLogin){
      console.log("返回次数:",this.returnTimes);
      if(this.returnTimes==0){
        res.json({
          code:200,
          msg:"登录成功"
        });
        this.returnTimes++;
      }
      return;
    }
    console.log("初始化浏览器及页面");
    await this.init();
    console.log("设置请求拦截器");
    await this.pageObject.page.setRequestInterception(true).catch(err => {
      throw new Error("设置拦截请求失败");
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
    var pages = await this.browserObject.browser.pages();
      console.log(pages.length);
    await this.pageObject.page.goto("http://weibo.com");
    if (this.cookies.length === 0) {
      var _self = this;
      console.log("如果没有cookies");
     console.log(this.pageObject.page.url());
      await this.pageObject.page.waitForNavigation()
      .then(()=>{
        console.log("没有cookie登录");
        console.log("首页跳转完成");
        console.log(_self.pageObject.page.url());
        _self.getUsernameInput(res);
      })
      .catch(e=>{
        console.log("首页跳转错误");
        console.log("跳转错误");
        console.log(e);
      })
       
    } else {
      console.log("如果有cookies");
      await this.loginResult("success");
      if(this.returnTimes == 0){
        res.json({
          code:200,
          msg:"已登录"
        });
        this.returnTimes++;
      }
      
      await this.browserObject.close();
      return
    }
  }

  /**
   * @description: 获取用户名输入框
   * @param {type} 
   * @return: 
   */
  async getUsernameInput(res){
    var _self = this;
    await this.pageObject.page.waitForSelector("#pl_login_form > div > div:nth-child(3) > div.info_list.username > div > input")
    .then(input=>{
      console.log("获取用户名输入框成功");
      _self.typeUsername(res)
    })
    .catch(e=>{
      console.log(_self.pageObject.page.url());
      console.log("获取用户名输入框失败");
      // res.json({
      //   code:500,
      //   msg:"内部错误"
      // });
      // _self.browserObject.close();
      _self.start(res);
      // return;
    });
  }

  /**
   * @description: 键入用户名
   * @param {type} 
   * @return: 
   */
  async typeUsername(res){
    var  _self = this;
    console.log("准备输入用户名");
    await this.pageObject.page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.username > div > input", this.username)
    .then(result=>{
      console.log("输入了用户名");
        _self.getPassword(res);
    })
    .catch(e=>{
      console.log("输入用户名错误");
      console.log(e);
      res.json({
        code:500,
        msg:"内部错误"
      });
      _self.browserObject.close();
      return;
    });
  }

  /**
   * @description: 获取密码输入框
   * @param {type} 
   * @return: 
   */
  async getPassword(res){
   var _self =this;
    console.log("准备输入密码");
    await this.pageObject.page.type(
      "#pl_login_form > div > div:nth-child(3) > div.info_list.password > div > input",
      this.password
    ).then(result=>{
      console.log("输入了密码");
      _self.ClickLogin(res);
    })
    .catch(e=>{
      console.log("输入密码错误");
      console.log(e);
      res.json({
        code:500,
        msg:"内部错误"
      });
      _self.browserObject.close();
      return;
    });
  }

  /**
   * @description: 点击登录按钮
   * @param {type} 
   * @return: 
   */
  async ClickLogin(res){
    var _self = this;
    console.log("输入了用户名密码，准备登录");
    await this.pageObject.page.click(
      "#pl_login_form > div > div:nth-child(3) > div:nth-child(6)"
    )
    .then(rs=>{
      console.log("点击登录按钮成功");
    })
    .catch(e=>{
      console.log(_self.pageObject.page.url());
      console.log("点击登录按钮失败");
    });
    console.log("尝试登录");
    await this.pageObject.page.waitForSelector(".W_layer_pop",{visible:true,timeout:3000})
    .then(pop=>{
      console.log("获取提示框成功");
      console.log(_self.pageObject.page.url());
      _self.getCodeNode(pop,res);
    })
    .catch(e=>{
      _self.pageObject.page.waitFor(3000);
      console.log("获取提示框失败,登录成功");
      console.log(_self.pageObject.page.url());
      const url = _self.pageObject.page.url();
      if(url === "https://weibo.com/"){
        _self.ClickLogin(res);
      }else{
        console.log(_self.returnTimes);
        if(_self.returnTimes == 0){
          res.json({
            code:200,
            msg:"已登录"
          });
          _self.returnTimes++;
        }      
        _self.reSetCookie();
      }    
    })
    
  }

  /**
   * @description: 获取验证码提示框
   * @param {type} 
   * @return: 
   */
  async getCodeNode(pop,res){
    const text = await pop.$eval('div > p > span:nth-child(2)',node=>node.innerText);
    console.log(text);
    if(text === "请填写验证码"){
      await this.tryLogin(res); 
     }else if(text === "请输入验证码" || text ==="当前网络超时，请稍后再试(2070)"){
      await this.tryLogin(res); 
     }
     else if(text === "用户名或密码错误"){
       res.json({
         code:501,
         msg:text
       });
      this.browserObject.close();
       return;
     }else{
       _self.start(res);
     }
  }

  /**
   * @description: 尝试登录
   * @param {type} 
   * @return: 
   */
  async tryLogin(res){
    var _self = this;
    await this.pageObject.page.waitForSelector('div[node-type="verifycode_box"]',{visible:true,timeout:3000})
    .then(()=>{
      console.log("获取到验证码图片");
      this.getCode(res);
    })
    .catch(e=>{
      console.log("登录成功");  
      if(_self.returnTimes == 0){
        res.json({
          code:200,
          msg:"已登录"
        });
        _self.returnTimes++;
      }
      
     _self.loginResult("success");
      this.noCodeTOLogin(); 
    })
  }

  /**
   * @description: 不需要填验证码，直接登录
   * @param {type} 
   * @return: 
   */
  async noCodeTOLogin(){
    await this.reSetCookie();
    return;
  }

  /**
   * @description: 截取验证码图片
   * @param {type} 
   * @return: 
   */
  async screenshotCode(){
    console.log("截取验证码图片");
    const file = new File();
    const pathname = __dirname+ "/public/" + this.username;
    const isExist = await file.isExist(pathname);
    if (!isExist) {
      file.mkdir(pathname);
    }
    await this.pageObject.page.screenshot({
      path: pathname + "/code"+ this.returnTimes+".png",
      clip: {
        x: 1000,
        y: 237,
        width: 130,
        height: 37
      } 
    });
  }

  /**
   * @description: 截取页面图片，发生错误时截取，方便排查原因
   * @param {type} 
   * @return: 
   */
  async screenshotPage(res){
    console.log("截取页面图片");
    const file = new File();
    const pathname = __dirname+ "/public/" + this.username;
    const isExist = await file.isExist(pathname);
    if (!isExist) {
      file.mkdir(pathname);
    }
    await this.pageObject.page.screenshot({
      path: pathname + "/page"+ this.returnTimes+".png",
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720
      } 
    });
    var path = "http://" + Config.prod.host + ":" + Config.prod.port + "/" + this.username;
    res.json({
      code: 100,
      msg: "tips",
      url: path + "/page"+this.returnTimes+".png"
    });
  }

  /**
   * @description: 等待用户输入验证码
   * @param {type} 
   * @return: 
   */
  async waitCode(res){
    console.log("等待用户输入验证码");
    var _self = this;
    await _self.readSyncByRl("请输入验证码", res)
    .then(async code => {
      if(_self.retrytimes===9){
        _self.screenshotPage(res);
      }
      console.log("获取到了用户输入的验证码：", code);
      console.log("返回验证码次数",_self.returnTimes);
      await this.pageObject.page.type(
        "#pl_login_form > div > div:nth-child(3) > div.info_list.verify.clearfix > div > input",
        code
      );
      await _self.pageObject.page.click(
        "#pl_login_form > div > div:nth-child(3) > div:nth-child(6)"
      );
       await this.pageObject.page.waitForSelector(".W_layer_pop",{visible:true,timeout:3000})
      .then((pop)=>{
          console.log("验证码登录失效");
          _self.returnTimes++;
          _self.getPopContent(pop,res);
      })
      .catch(e=>{
        clearInterval(_self.timer);
        console.log("登录成功了阿");
        if(_self.returnTimes == 0){
          res.json({
            code:200,
            msg:"登录成功"
          });
          _self.returnTimes++;
        }     
        _self.setSuccess();
      });
       
    });
  }

  /**
   * @description: 登录成功，设置状态
   * @param {type} 
   * @return: 
   */
  async setSuccess(){
    await this.loginResult("success");
    await this.reSetCookie();
  }

  /**
   * @description: 获取登录表单提示框内容
   * @param {type} 
   * @return: 
   */
  async getPopContent(pop,res){
    if(this.timer !== null){
      clearInterval(this.timer);
    }
    const text = await pop.$eval('div > p > span:nth-child(2)',node=>node.innerText);
    console.log(text);
    if(text === "请填写验证码" || text ==="当前网络超时，请稍后再试(2070)"){
     await this.tryLogin(res); 
    }else if(text === "用户名或密码错误。查看帮助"){
      console.log("输入验证码后账号错误");
      if(this.returnTimes == 0){
        res.json({
          code:"501",
          msg:"微博用户名或密码错误，请联系管理员"
        });
        this.returnTimes++;
      }else{
        this.loginResult(text);
      }

    }
  }

  /**
   * @description: 重新获取cookie,方便保持更长时间的自动登录
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
    console.log("写入cookie");
    await file.write(path + "/cookie2.txt", JSON.stringify(cookie));
    console.log("关闭浏览器");
    await this.browserObject.close();
    return;
  }
  
  /**
   * @description: 获取验证码
   * @param {type} 
   * @return: 
   */
  async getCode(res){
    const file = new File();
    const path = __dirname + "/public/" + this.username;
    const isExist = await file.isExist(path);
    if(!isExist){
      file.mkdir(path);
    }
    await this.screenshotCode();
    await this.waitCode(res);
    // await this.reSetCookie();
  }

  /**
   * @description: 获取本地cookie
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
   * @description: 设置浏览器cookie
   * @param {type} 
   * @return: 
   */
  async setCookie(page) {
    var _self = this;
    await this.getCookie().then(cookies => {
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
  /**
   * @description: 异步读取图片
   * @param {type} 
   * @return: 
   */
  async readSyncByRl(tips, res) {
    var _self = this;
    // 这里需要将截取的图片回传给用户，由用户输入验证码进行下一步操作
    tips = tips || "> ";
    var path = "http://" + Config.prod.host + ":" + Config.prod.port + "/" + this.username;
    await this.loginResult(path+"/code"+this.returnTimes+".png");
    return new Promise(resolve => {
      if(_self.returnTimes ===  0){
        res.json({
          code: 100,
          msg: tips,
          url: path + "/code"+_self.returnTimes+".png"
        });
      }
      this.returnTimes++;
      const file = new File();
      const pathname = __dirname + "/prevent/" + this.username;   
      const filename = pathname + "/code.txt";
      this.timer = setInterval(() => {
        file.read(filename).then(data => {
          if (data !== "") {
          console.log("当前读到的验证码：",data);
            file.write(filename, "");
            resolve(data);
          }
        });
      }, 5000);
    });
  }

  /**
   * @description: 写入登录状态
   * @param {type} 
   * @return: 
   */
  async loginResult(content) {
    const file = new File();
    const pathname = __dirname + "/prevent/" + this.username;
    console.log("检查是否存在prevent用户的私有目录");
    const isExist = await file.isExist(pathname);
    if(!isExist){
      console.log("不存在用户目录，创建");
      await file.mkdir(pathname);
    }
    console.log("创建用户登录结果保存文件");
    const loginresultfile = pathname + '/loginresult.txt';
    await file.write(loginresultfile, content);
  }

  /**
   * @description: 获取登录状态
   * @param {type} 
   * @return: 
   */
  async getLoginResult(res){
    const file = new File();
    const pathname = __dirname + "/prevent/" + this.username;
    const loginresultfile = pathname + '/loginresult.txt';
    var result;
    console.log("检查是否存在prevent用户目录");
    const isExist = await file.isExist(pathname);
    if(!isExist){
      console.log("不存在用户目录，创建");
      await file.mkdir(pathname);
      console.log("创建用户登录结果保存文件");  
      await file.write(loginresultfile, "");
      result = false;
    }else{
      result = await file.read(loginresultfile);
    }
    return new Promise((resolve)=>{
      console.log("用户登录状态：",result);
      if(result ==="success"){
        resolve(true);
      }else{
        resolve(false);
      }
    });
  }
}

module.exports = Login;
