/*
 * @Description: 微博视频发布模块
 * @Author: he.jianbo
 * @Date: 2019-10-25 12:31:27
 * @LastEditTime: 2019-11-01 15:07:59
 * @LastEditors: he.jianbo
 */
const Post = require("./post");

class Publish {
  constructor(options) {
    this.browser = options.browser;
    this.page = options.page;
    this.videoPath = options.videoPath;
    this.videoTitle = options.videoTitle;
    this.content = options.content;
    this.objectId = options.objectId;
    this.username = options.username;
    this.accountId = options.accountId;
    this.code = 500;
    this.msg = "发布失败";
    this.timer = null;
    this.times = 0;
  }
  /**
   * @description: 获取视频发布框
   * @param {type} 
   * @return: 
   */
  async getUploadInput(res){
    var _self = this;
    await this.page.waitForSelector('input[name="video"]')
    .then(upload=>{
      console.log("获取上传视频框成功");
      _self.uploadVideo(upload,res);
    })
    .catch(e=>{
      console.log("获取视频上传框失败");
      console.log(e);
      _self.notify();
      return;
    })
  }
  /**
   * @description: 上传视频，需要使用定时器定时检测视频上传进度，上传完成再进行下一步操作
   * @param {type} 
   * @return: 
   */
  async uploadVideo(upload,res){
    var _self = this;
    await upload.uploadFile(this.videoPath);
    this.timer = setInterval(async ()=>{
      this.times++;
      const text = await this.page.$eval('span[node-type="status"]',node=>node.innerText);
      console.log(text);
      if(text === "视频上传成功"){
        clearInterval(this.timer);
        console.log("上传视频文件成功");
        _self.getVideoTitleInput(res);
      }
      if(this.times > 1000){
        _self.notify();
      }
    },10000);
  }
  /**
   * @description: 获取视频标题输入框
   * @param {type} 
   * @return: 
   */
  async getVideoTitleInput(res){
    var _self = this;
    console.log("准备输入标题");
    await this.page.waitForSelector(
      ".form_table_s > .f_normal > .f_con > .input_outer > .W_input"
    )
    .then((inputText)=>{
        console.log("获取视频标题输入框成功");
        _self.inputVideoTitle(inputText,res);
    })
    .catch(e=>{
      console.log("获取视频标题框失败");
      console.log(e);
      _self.notify();
      return;
    })
  }
  /**
   * @description: 键入视频标题
   * @param {type} 
   * @return: 
   */
  async inputVideoTitle(inputText,res){
    await inputText.click();
    await inputText.type(this.content);
    await inputText.press("Enter");
    console.log("完成输入标题");
    await this.getFinishBtn(res);
  }
  /**
   * @description: 获取视频上传控件的完成按钮
   * @param {type} 
   * @return: 
   */
  async getFinishBtn(res){
    var _self = this;
    await this.page.waitFor(3 * 1000);
    await this.page.waitForSelector(
      ".W_layer_btn > em > .W_btn_a"
    )
    .then(videoOKBtn=>{
      _self.clickOKBtn(videoOKBtn);
    })
    .catch(e=>{
      console.log("获取完成按钮失败");
      console.log(e);
      _self.notify();
      return;
    });
  }
  /**
   * @description: 点击完成按钮
   * @param {type} 
   * @return: 
   */
  async clickOKBtn(videoOKBtn){
    await videoOKBtn.click();
    console.log("已点击完成");
    await this.getPublishBtn();
  }

  /**
   * @description: 获取发布按钮
   * @param {type} 
   * @return: 
   */
  async getPublishBtn(){
    var _self = this;
    // 4.点击发布
    console.log("准备发布视频");
    await this.page.waitFor(3 * 1000);
    await this.page.waitForSelector(
      ".send_weibo > .func_area > .func > .W_btn_a"
    )
    .then(submitBtn=>{
      console.log("获取发布按钮成功");
      _self.clickSubmitBtn(submitBtn);
    })
    .catch(e=>{
      console.log("获取发布按钮失败");
      console.log(e);
      _self.notify();
    })
  }

  /**
   * @description: 点击发布按钮
   * @param {type} 
   * @return: 
   */
  async clickSubmitBtn(submitBtn){
    var _self = this;
    await submitBtn.click();
    await this.page.waitFor(5000);
    // 获取转码状态视频
    await this.page.waitForSelector(
      'div[isfakevideo="true"]'  
    )
    .then(result=>{
      console.log("获取到转码视频微博");
      _self.successNotify();
    })
    .catch(e=>{
      console.log("没有获取到转码视频微博");
      _self.screenshotPage();
    });
  }
  /**
   * @description: 成功后回调前端接口通知发布结果
   * @param {type} 
   * @return: 
   */
  async successNotify(){

    this.code = 1;
    this.msg = "发布成功";
    await this.notify();
  }

  /**
   * @description: 回调前端，通知结果
   * @param {type} 
   * @return: 
   */
  async notify(){
    console.log("已发布");
    var _self = this;
    const post_data = {
      code: _self.code,
      msg: _self.msg,
      objectId: _self.objectId,
      accountId: _self.accountId
    };
    const options = {
      hostname: "106.124.143.127",
      port: 18080,
      path:
        "/wcm/CompletePublishServlet.action?method=completePublishWeiboVideo",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      }
    };
    const post = new Post(post_data,options);
    await post.run(); 
    this.browser.close();
    return;
  }
  /**
   * @description: 运行视频发布任务
   * @param {type} 
   * @return: 
   */
  async run(res) {
    console.log(this.page.url());
    var url = this.page.url();
    if(url.indexOf("wvr") !== -1){
      console.log("页面跳转完成");
      this.getUploadInput(res);
      // this.directPub(res);
    }else{
      console.log("页面跳转失败：",url);
      this.notify();
    }
  }

  /**
   * @description: 直接发布，用于本地测试
   * @param {type} 
   * @return: 
   */
  async directPub(res){
    const upload = await this.page.waitForSelector(
      'input[name="video"]'
      );
    await upload.uploadFile(this.videoPath);
    const inputText = await this.page.waitForSelector(
      ".form_table_s > .f_normal > .f_con > .input_outer > .W_input"
    );
    await inputText.click();
    await inputText.type(this.videoTitle);
    await inputText.press("Enter");
    await this.page.waitFor(3 * 1000);
    const videoOKBtn = await this.page.waitForSelector(
      ".W_layer_btn > em > .W_btn_a"
    );
    await videoOKBtn.click();
    await this.page.waitFor(3 * 1000);
    const submitBtn = await this.page.waitForSelector(
      ".send_weibo > .func_area > .func > .W_btn_a"
    )
    await submitBtn.click();
    this.code = 1;
    this.msg = "发布成功";
    this.notify();
  }
  /**
   * @description: 截取页面图片，用来排查错误
   * @param {type} 
   * @return: 
   */
  async screenshotPage(){
    console.log("截取页面图片");
    const pathname = __dirname+ "/prevent/" + this.username;
    await this.page.screenshot({
      path: pathname + "/page100.png",
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 720
      } 
    });
    await this.notify();
  }

}

module.exports = Publish;
