/*
 * @Description: code验证码处理模块
 * @Author: he.jianbo
 * @Date: 2019-10-26 10:04:37
 * @LastEditTime: 2019-11-01 14:57:56
 * @LastEditors: he.jianbo
 */
const File = require('./file')

class CodeObject {
  constructor(){
    this.fileObject = null;
    this.code = null;
  }

  /**
   * @description: 初始化基本对象
   * @param {type} 
   * @return: 
   */
  async init(){
    return new Promise((resolve)=>{
      this.fileObject = new File();
      resolve();
    })
  }

  /**
   * @description: 从文件读取验证码
   * @param {type} 
   * @return: 
   */
  async getCode(username){
    var filename = __dirname + "/prevent/" + username +'/code.txt';
    return new Promise((resolve)=>{
      this.fileObject
        .read(filename)
        .then((data)=>{
          resolve(data)
        })
    })
  }

  /**
   * @description: 保存获取到的code验证码
   * @param {type} 
   * @return: 
   */
  async setCode(username,code,res){
    console.log("获取到的code:",code);
    var _self = this;
    var path = __dirname+'/prevent/'+username;
    var filename =path +'/code.txt';
    await this.fileObject
      .isExist(path)
      .then((result)=>{
        if(!result){
          _self.fileObject.mkdir(path);
        }
      });
  
    const result = await this.fileObject
      .write(filename,code);
    console.log(result);
    if(result){
      console.log("读取登录结果");
      const loginresultfile = path + '/loginresult.txt';
      var times = 0;
      var content = "";
      var codetimer = setInterval(() => {
        times++;
        if(times == 10){
          res.json({
            code:100,
            msg:"请输入验证码",
            url: content
          });
          clearInterval(codetimer);
          return;
        }
        this.fileObject.read(loginresultfile).then(data => {
          console.log("登录结果：",data);
          content = data;
          if (content !== "") {
            if(content==="success"){
              res.json({
                code:200,
                msg:"登录成功"
              });
              clearInterval(codetimer);
              return;
            }else if(content === "用户名或密码错误。查看帮助"){
              res.json({
                code:101,
                msg:"用户名或密码错误,请联系管理员",
                url: content
              });
              clearInterval(codetimer);
              return;
            }
          }
        });
      }, 2000);
    }
  }
}

module.exports = CodeObject;