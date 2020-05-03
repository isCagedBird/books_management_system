const express = require('express');
const router = express.Router();
const db = require('../tools/database');
const find = require('../tools/find');
const update = require('../tools/update');
const tools = require('../tools/read');
/* 用户相关的接口 */

//注册接口
router.post('/register', (req, res) => {
	console.info(req.body);

	let fn = () => {
		res.send(
			`<span style="display:block;margin:100px auto;text-align:center;font-size:20px;">
				请回退到登陆注册页面
			</span>`);
	};

	let Users = db.Users;
	find(Users, {
		username: req.body.username
	})
		.then((data) => {
			console.info(data.length, data);
			let flag = false;
			for (let i = 0; i < data.length; i++) { //约束条件下length恒为1
				if (data[i].username === req.body.username) {
					flag = true;
					break;
				}
			}
			return flag ? Promise.reject('当前登陆账号名已存在') : Promise.resolve();
		}, (err) => {
			console.info('查数据失败', err);
		})
		.then(() => {
			const fn = (_boolean) => {
				new Users({
					username: req.body.username,
					password: req.body.password,
					address: req.body.address,
					phone_num: req.body.phone_num,
					primary_account: _boolean
				}).save((err) => {
					if (err) {
						console.info('存数据失败', err);
					} else {
						console.info('存数据成功');
					}
				});
			};
			//	保证只能有一个物业账号
			if (req.body.is_main === 'Y') {
				find(db.Users, {
					primary_account: true
				})
					.then((data) => {
						data.length === 0 ? fn(true) : fn(false);
					}, (err) => {
						console.info('查数据失败', err);
					});
			} else {
				fn(false);
			}
		}, (mes) => {
			console.info(mes);
		});
	fn();
});

//登录接口
router.post('/login', (req, res) => {
	/* console.info(req.body); */
	let fn = (a = ``) => {
		if (a === '') {
			res.send(
				`<span style="display:block;margin:100px auto;text-align:center;font-size:20px;">
					此账户不存在或密码错误,请回退到登陆注册页面重试
				</span>`
			);
		} else {
			res.send(
				`<span style="display:block;margin:100px auto;text-align:center;font-size:20px;">
					${a},请回退到登陆注册页面重试
				</span>`
			);
		}
	};

	let Users = db.Users;
	find(Users, {
		username: req.body.username
	})
		.then((data) => {
			let flag = false;
			/* console.info(data.length, data); */
			for (let i = 0; i < data.length; i++) { //约束条件下length值永恒为1
				if (data[i].username === req.body.username) {
					if (data[i].password === req.body.password) {
						flag = true;
						break;
					}
				}
			}
			return new Promise((resolve, reject) => {
				if (!flag) {
					reject();
				} else {
					find(Users, {})
						.then((result) => {
							let index = null;
							for (let i = 0; i < result.length; i++) {
								if (result[i].username === req.body.username) {
									index = result[i]._id.toString();
									break;
								}
							}
							resolve(index);
						}, (err) => {
							reject(`数据库空`);
						});
				}
			});
		}, (err) => {
			fn();
			console.info('查数据失败', err);
		})
		.then((index) => {
			//进入此作用域则说明账户名及密码正确,渲染登陆后的界面来
			//设置cookie
			res.cookie("index", `${index}`, {
				path: `/users/login`, //cookie 设置在当前路径下有效果
				httpOnly: false
			});
			tools.pReadFile('/views/content.html')
				.then((content_html) => {
					res.send(content_html);
				})
				.catch((err) => {
					res.send(err);
				});
		}, (mes) => {
			fn(mes);
		});
});

//信息修改接口
router.post('/api/changes_0_01', (req, res) => {
	new Promise((resolve, reject) => {
		req.on('data', (data) => {
			resolve(JSON.parse(data.toString()));
		});
	}).then((data) => {
		/* console.info(data === null, data, typeof data); */

		update(db.Users, {
			_id: data._id
		}, {
			$set: {
				['phone_num']: data.phone_num,
				['address']: data.address
			}
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

//用户信息接口
router.post('/api/take_mes', (req, res) => {
	new Promise((resolve, reject) => {
		req.on('data', (data) => {
			resolve(JSON.parse(data.toString()));
		});
	}).then((data) => {
		/* console.info(data === null, data, typeof data); */
		if (data !== null && data.index !== undefined) {
			//查询所有用户数据,包括唯一的管理员以及多个借阅者
			//查询到的全部数据库数据不能缓存到客户端内存中

			find(db.Users, {
				_id: data.index
			})
				.then((_data) => {
					for (let i = 0; i < _data.length; i++) { //约束条件下length最大是1
						_data[i].__v = null;
					}
					res.send(_data[0]);
				}, (err) => {
					console.info('查数据失败', err);
					res.send([]);
				});
		} else if (data !== null && data.username !== undefined) {
			find(db.Users, {
				username: data.username
			})
				.then((data) => {
					for (let i = 0; i < data.length; i++) { //约束条件下length值最大为1
						data[i].__v = null;
						data[i].password = `********`;
					}
					res.send(data);
				}, (err) => {
					console.info('查数据失败', err);
					res.send([]);
				});
		}
	});
});

//还书接口
router.post('/api/return_book', (req, res) => {
	new Promise((resolve, reject) => {
		req.on('data', (data) => {
			resolve(JSON.parse(data.toString()));
		});
	}).then((data) => {
		/* console.info(data === null, data, typeof data); */

		update(db.Users, {
			_id: data.id
		}, {
			$pull: {
				'books': {
					number: data.number
				}
			}
		})
			.then(result => {
				if (result.n === 1 && result.ok === 1 && result.nModified === 1) {
					//更新成功 { n: 1, nModified: 1, ok: 1 }
					return find(db.Users, {
						_id: data.id
					});
				} else {
					return Promise.reject('该书已经归还');
				}
			})
			.then(result => {
				//约束条件下length最大为1
				result[0].__v = null;
				res.send(result[0]);
			})
			.catch(error => {
				console.info(error);
				res.send([]);
			});

	});
});

//借书接口
router.post('/api/add_book', (req, res) => {
	new Promise((resolve, reject) => {
		req.on('data', (data) => {
			resolve(JSON.parse(data.toString()));
		});
	}).then((data) => {
		/* console.info(data === null, data, typeof data); */

		find(db.Users, {
			_id: data.borrower_id, //唯一用户ID
			'books.number': data.number //唯一书籍编号
		})
			.then(result => {
				if (result.length === 0) {
					//length为0,即result为[]
					//该用户借阅的书籍中没有当前这本
					return Promise.resolve();
				} else {
					return Promise.reject('该书籍借阅中');
				}
			})
			.then(() => {
				return update(db.Users, {
					_id: data.borrower_id
				}, {
					$push: {
						'books': {
							name: data.name,
							number: data.number,
							date: data.date
						}
					}
				});
			})
			.then(result => {
				if (result.n === 1 && result.ok === 1 && result.nModified === 1) {
					//更新成功 { n: 1, nModified: 1, ok: 1 }
					return update(db.Books, {
						number: data.number
					}, {
						$inc: {
							nn: -1
						}
					});
				} else {
					return Promise.reject('该书籍存入用户books数据库失败');
				}
			})
			.then(result => {
				if (result.n === 1 && result.ok === 1 && result.nModified === 1) {
					return find(db.Users, {
						_id: data.borrower_id
					})
				} else {
					return Promise.reject('该书籍库存数更新失败');
				}
			})
			.then(result => {
				//约束条件下length最大为1
				result[0].__v = null;
				res.send(result[0]);
			})
			.catch(error => {
				console.info(error);
				if (error === '该书籍借阅中') {
					res.send({ '-1': '该书籍借阅中' });
				} else {
					res.send([]);
				}
			});

	});
});

module.exports = router;
