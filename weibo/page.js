/*
 * @Description: 浏览器标签页模块
 * @Author: he.jianbo
 * @Date: 2019-10-25 12:30:55
 * @LastEditTime: 2019-10-30 22:36:30
 * @LastEditors: he.jianbo
 */


class PageObject {
    constructor(){
        this.page = null;
    }

    // async init(browser){
    //     this.page = await browser.newPage()
    //         .catch(err=>{
    //             console.log(err);
    //         });  
    // }
    async init(browser){
        this.page = await browser.newPage();
    }

}

module.exports = PageObject;