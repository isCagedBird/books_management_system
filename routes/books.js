const express = require('express');
const router = express.Router();
const db = require('../tools/database');
const find = require('../tools/find');
const update = require('../tools/update');
/* 书籍相关的接口 */

//书籍信息接口
router.post('/api/take_mes', (req, res) => {
	new Promise((resolve, reject) => {
		req.on('data', (data) => {
			resolve(JSON.parse(data.toString()));
		});
	}).then((data) => {
		/* console.info(data === null, data, typeof data); */

		if (data === null) {
			//客户端发起post请求未携带数据时
			find(db.Books, {})
				.then((_data) => {
					/* console.info(_data.length); */
					res.send({
						max: _data.length
					});
				}, (err) => {
					console.info('查数据失败', err);
					res.send([]);
				});
		} else if (data !== null && data.number !== undefined) {
			find(db.Books, {
				number: data.number
			})
				.then((_data) => {
					/* console.info(_data); */
					res.send(_data);
				}, (err) => {
					console.info('查数据失败', err);
					res.send([]);
				});
		} else if (data !== null && (data.name || data.author || data.publisher)) { // 传参但不是 编号
			find(db.Books, data)
				.then((_data) => {
					/* console.info(_data); */
					res.send(_data);
				})
				.catch((err) => {
					console.info('查数据失败', err);
					res.send([]);
				});
		} else {
			res.send({ mes: 'request params error' })
		}
	});
});

//新增书籍接口
router.post('/api/changes_1_12', (req, res) => {
	new Promise((resolve, reject) => {
		req.on('data', (data) => {
			resolve(JSON.parse(data.toString()));
		});
	}).then((data) => {
		/* console.info(data === null, data, typeof data); */
		find(db.Books, {})
			.then((_data) => {
				return Promise.resolve(_data.length);
			}, (err) => {
				console.info('查数据失败', err);
				res.send({
					ok: -1
				});
			})
			.then(length => {
				new db.Books({
					name: data.name,
					type: data.type,
					author: data.author,
					publisher: data.publisher,
					nn: data.nn,
					number: length
				}).save((err) => {
					if (err) {
						console.info('存数据失败', err);
						res.send({
							ok: -1
						});
					} else {
						console.info('存数据成功');
						res.send({
							ok: 1
						});
					}
				});
			});
	});
});

//更新书籍接口
router.post('/api/changes_1_11', (req, res) => {
	new Promise((resolve, reject) => {
		req.on('data', (data) => {
			resolve(JSON.parse(data.toString()));
		});
	}).then((data) => {
		/* console.info(data === null, data, typeof data); */

		let obj = {};
		for (let i in data) {
			if (data.hasOwnProperty(i)) {
				if (i !== 'number') {
					obj[i] = data[i];
				}
			}
		}
		/* console.info(obj); */
		if (JSON.stringify(obj) === '{}') {
			res.send({
				ok: 1
			});
			return;
		}

		update(db.Books, {
			number: data.number
		}, {
			$set: obj
		}).then(result => {
			res.send({
				ok: 1
			});
		}, error => {
			console.info(error);
			res.send({
				ok: -1
			});
		});

	});
});

module.exports = router;
