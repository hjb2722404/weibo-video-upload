/*
 * @Description: 视频发布结果回调模块
 * @Author: Do not edit
 * @Date: 2019-10-27 13:45:37
 * @LastEditTime: 2019-11-01 15:01:56
 * @LastEditors: he.jianbo
 */
const http = require("http");
const querystring = require("querystring");

class Post {
  constructor(data, options) {
    this.post_data = data;
    this.options = options;
  }

  async run() {
    const content = querystring.stringify(this.post_data);
    const req = http.request(this.options, function(res) {
      res.setEncoding("utf8");
      res.on("data", function(chunk) {
        console.log("返回成功");
      });
    });

    req.on("error", function(e) {
      console.log("problem with request: " + e.message);
    });

    // write data to request body
    req.write(content);
    req.end();
  }
}

module.exports = Post;