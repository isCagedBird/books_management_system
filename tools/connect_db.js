const mongoose = require('mongoose');
const config = require('../config');

//mongoose.Promise = global.Promise;

//连接MongoDB数据库
mongoose.connect(`${config.databaseS}${config.domain}${config.databaseE}`, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	},
	(err) => {
		if (err) {
			console.info(`>>> 数据库${config.databaseS}${config.domain}${config.databaseE}连接失败`);
		} else {
			console.info(`>>> 数据库${config.databaseS}${config.domain}${config.databaseE}连接成功`);
		}
	});
