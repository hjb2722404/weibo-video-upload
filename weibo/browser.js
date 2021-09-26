/*
 * @Description: 模拟浏览器模块
 * @Author: he.jianbo
 * @Date: 2019-10-25 12:30:51
 * @LastEditTime: 2019-10-26 13:27:05
 * @LastEditors: he.jianbo
 */

 const puppeteer = require('puppeteer');
const {TimeoutError} = require('puppeteer/Errors');


 class BrowserObject {
     constructor(options={}){
        this.args = options.args;
        this.headless = options.headless;
        this.slowMo = options.slowMo;
        this.defaultViewport = options.defaultViewport;
        this.pages = 0;
        this.browser = null;
     }

      async init(){
         this.browser = await puppeteer.launch({
            ignoreHTTPSErrors:true,
            args:this.args,
            timeout:0,
            headless:this.headless,
            slowMo: this.slowMo,
            defaultViewport:this.defaultViewport
         })
         .catch(err=>{
            console.log(err);
         })
   
     }
     async close(){
        await this.browser.close()
    }
 }

module.exports = BrowserObject;
