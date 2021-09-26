/*
 * @Description: API 路由控制
 * @Author: he.jianbo
 * @Date: 2019-10-25 10:44:27
 * @LastEditTime: 2019-11-01 13:33:10
 * @LastEditors: he.jianbo
 */
var express = require("express");
var router = express.Router();
var LoginObject = require("../weibo/login");
var CodeObject = require('../weibo/code');
var noLoginObject = require('../weibo/nologin');

/**
 * @description: 微博登录验证接口
 * @param {string} username 微博登录账号名
 * @param {string} password 微博登录密码
 * @return: json
 */
router.post("/login", function(req, res, next) {

  const querys = req.query;
  const body = req.body;
  const params = Object.assign(querys, body);
  console.log(params);
  var username = decodeURIComponent(params.username) ==="undefined" ? "" : decodeURIComponent(params.username);
  var password = decodeURIComponent(params.password) ==="undefined" ? "" : decodeURIComponent(params.password);
  if(username === "" || password === ""){
    res.json({
      code:500,
      msg:"用户名或密码不能为空"
    });
    return;
  }
  var options = {
    username:username,
    password:password,
  }
  const loginObject = new LoginObject(options);
  loginObject.start(res);
});

/**
 * @description: 微博视频发布接口
 * @param {string}  code 验证码
 * @param {string} username 微博登录用户名
 * @return: JSON
 */
router.post("/code", function(req, res, next) {

  const querys = req.query;
  const body = req.body;
  const params = Object.assign(querys, body);
  console.log(querys);
  console.log(body);
  console.log(params);

  const code = params.code || "";
  const username = decodeURIComponent(params.username) ==="undefined" ? "" : decodeURIComponent(params.username);
  if(username =="" || code == ""){
    res.json({
      code:501,
      msg:"请输入验证码和用户名"
    })
    return;
  }
  setCode(username,code,res);
});

/**
 * @description: 微博视频发布接口
 * @param {string} username 微博登录账号
 * @param {string} password 微博登录密码
 * @param {string} videoUrl 微博视频地址
 * @param {string} videoTitle 微博视频标题
 * @param {string} content 微博内容
 * @param {string} objectId 微博ID
 * @param {string} accountId 微博账号ID
 * @return: json
 */

router.post("/publish",function(req, res, next){
  const querys = req.query;
  const body = req.body;
  const params = Object.assign(querys, body);
  console.log(params);
  const username = decodeURIComponent(params.username) === "undefined" ? "" : decodeURIComponent(params.username);
  const password = decodeURIComponent(params.password) === "undefined" ? "" : decodeURIComponent(params.password);
  const videoUrl = decodeURIComponent(params.videoUrl) === "undefined" ? "" : decodeURIComponent(params.videoUrl);
  const videoTitle = decodeURIComponent(params.videoTitle) === "undefined" ? "" : decodeURIComponent(params.videoTitle);
  const content = decodeURIComponent(params.content) === "undefined" ? "" : decodeURIComponent(params.content);
  const objectId = decodeURIComponent(params.objectId) === "undefined" ? "" : decodeURIComponent(params.objectId);
  const accountId = decodeURIComponent(params.accountId) === "undefined" ? "" : decodeURIComponent(params.accountId);
  if(username =="" || password ==""){
    res.json({
      code:501,
      msg:"用户名或密码不能为空"
    });
    return;
  }
  if(videoUrl=="" || videoTitle==""){
    res.json({
      code:502,
      msg:"视频标题或视频地址不能为空"
    });
    return;
  }
  res.json({
    code:200,
    msg:"发布中"
  });
  const options = {
    username:username,
    password:password,
    videoUrl:videoUrl,
    videoTitle:videoTitle,
    content:content,
    objectId:objectId,
    accountId:accountId
  };
  const nologinObject = new noLoginObject(options);
  nologinObject.start(res);
});

/**
 * @description: 保存code到文件
 * @param {string} username 微博用户名
 * @param {string} code 用户输入的验证码
 * @return:
 */
async function setCode(username,code,res){
  console.log("保存code");
  const codeObject = new CodeObject();
  await codeObject.init();
  await codeObject.setCode(username,code,res);
}

module.exports = router;
