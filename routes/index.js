/*
 * @Description: 首页路由控制
 * @Author: he.jianbo
 * @Date: 2019-10-24 15:34:59
 * @LastEditTime: 2019-10-25 12:29:07
 * @LastEditors: he.jianbo
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
