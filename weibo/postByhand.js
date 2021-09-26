/*
 * @Description: 手动回调视频发布结果通知接口，防止服务异常关闭后，没有将结果通知到前端，导致前端视频发布任务一直处于队列池中等待
 * @Author: Do not edit
 * @Date: 2019-10-27 13:45:37
 * @LastEditTime: 2019-11-01 15:03:08
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

const post_data = {
  code: 500,
  msg: "发布失败",
  objectId: 38,
  accountId: 8
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
post.run();