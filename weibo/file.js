/*
 * @Description: 文件读写模块
 * @Author: Do not edit
 * @Date: 2019-10-25 12:31:07
 * @LastEditTime: 2019-11-01 15:00:12
 * @LastEditors: he.jianbo
 */

const fs = require("fs");
const request = require('request');
const stringRandom = require('string-random');

class FileObject {
  constructor() {}

  /**
   * @description: 读取文件内容
   * @param {type} 
   * @return: 
   */
  async read(filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, { flag: "r+", encoding: "utf8" }, function(
        err,
        data
      ) {
        if (err) {
          console.error(err);
          reject(err);
        }
        resolve(data);
      });
    });
  }

  /**
   * @description: 将内容写入指定文件
   * @param {type} 
   * @return: 
   */
  async write(filepath, content) {
    return new Promise((resolve) => {
      try{
        fs.createWriteStream(filepath).write(content, "UTF8");
        resolve(true);
      }catch(e){
        reject(e);
      }      
    });
  }
  /**
   * @description: 创建目录
   * @param {type} 
   * @return: 
   */
  async mkdir(path) {
    return new Promise((resolve,reject) => {
      fs.mkdir(path, function(err) {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * @description: 检测目录或文件是否存在
   * @param {type} 
   * @return: 
   */
  async isExist(filename) {
    return new Promise(resolve => {
      fs.access(filename, err => {
        console.log(err);
        err ? resolve(false) : resolve(true);
      });
    });
  }

  /**
   * @description: 远程文件下载
   * @param {type} 
   * @return: 
   */
  async download(url){
    return new Promise((resolve)=>{
      var filename = __dirname + "/videos/" + stringRandom(32,{numbers: false}) + ".mp4";
      var stream = fs.createWriteStream(filename);
      request(url).pipe(stream).on('close',function(err,rs,body){
        if(err){
          reject(err);
        }
        resolve(filename);
      });
    });
    
  }
}

module.exports = FileObject;
