const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');

const app = express();
const js_router = express.Router();
const config = require('./config');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(cookieParser());

/* 开放公开目录 */
app.use('/', express.static(path.join(__dirname, 'public')));
// 指定 2.6.11 的版本
js_router.use('/vue', express.static(path.join(__dirname, 'node_modules/_vue@2.6.11@vue/dist/vue.js')));
// js_router.use('/vue', express.static(path.join(__dirname, 'node_modules/_vue@2.6.11@vue/dist/vue.min.js')));
js_router.use('/other', express.static(path.join(__dirname, 'tools/all_will_use_scripts')));
app.use('/scripts', js_router);

/* 全局中间件 */
app.all('*', (req, res, next) => {
	// res.setHeader('Access-Control-Allow-Origin', '*');//允许跨域资源访问
	/* 
	 *	一些api接口对post请求体数据只做了客户端JS校验,未做服务端JS校验
	 *	必需要禁用ajax跨域资源访问
	 */
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); //仅允许HTTP的get post方法,禁用其他mothods
	// res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});
/* 开始连接数据库的操作 */
require('./tools/connect_db');

app.use('/users', usersRouter);
app.use('/books', booksRouter);

app.listen(config.port, '0.0.0.0', () => {
	console.info(`web服务开启,请使用浏览器访问 http://${config.domain}:${config.port}`);
});
