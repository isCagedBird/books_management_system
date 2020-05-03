;
(function () {
	'use strict';
	const VM = new Vue({
		el: '#app',
		data: {
			/* 根据用户操作改变的内容 */
			now: '', //状态标志位1
			new_book: {}, //新增书籍临时内存缓冲
			book: '', //查找书籍内存缓冲
			not_me: '', //查找账户内存缓冲
			what_ii_is: '', //状态标志位2
			time_id: null, //节流状态位
			max: '', //数据库书籍数
			searchNotByNumberBoxShow: false,
			searchNotByNumberBooks: [], // 非编号查找书籍内存缓冲
			searchWayValue: '', // 非编号查找书籍标识 book_name author publisher
			/* 基本不变的内容 */
			time: '', //登录时间
			me: '', //当前账户内存缓冲
			main: [{
				this_item: '账户信息管理',
				arr: [
					'账户信息',
					'更新信息'
				]
			}, {
				this_item: '书籍相关管理',
				arr: [
					'图书信息',
					'更新信息',
					'图书入库',
					'归还处理',
					'借阅处理'
				]
			}]
		},
		watch: {
			what_ii_is (newV) {
				(newV === '10' || newV === '14') ? (
					this.searchNotByNumberBoxShow = true
				) : (
						this.searchNotByNumberBoxShow = false
					)
			}
		},
		mounted () {
			/* const fn = () => {
				this.searchNotByNumberBoxShow = !this.searchNotByNumberBoxShow
				setTimeout(() => {
					fn()
				}, 2000)
			}
			fn() */

			let index = document.cookie
				.match(/index=[0-9a-zA-Z_]+\;?/g)[0]
				.replace('index=', '')
				.replace(';', '')
			this.time = new Date().toLocaleString();
			this.ajax('/users/api/take_mes', { index })
				.then(data => {
					this.me = data;
					// console.info(this.me);
				})
				.catch(error => {
					console.info(error);
				});
			this.ajax('/books/api/take_mes')
				.then(result => {
					this.max = result.max;
				}, error => {
					console.info(error);
				});
		},
		methods: {
			leftClickHandle (e) {
				/* console.info(e.target.getAttribute('ii')); */
				switch (e.target.getAttribute('ii')) {
					case '0':
						this.now = '0';
						this.what_ii_is = '';
						break;
					case '1':
						this.now = '1';
						this.what_ii_is = '';
						break;
					case '_update':
						this._update_();
						break;
					case '00':
						this.what_ii_is = '00';
						break;
					case '01':
						this.what_ii_is = '01';
						/* 任何登录账户(包含管理员账户)只能更新自身账户的信息 */
						break;
					case '10':
						this.what_ii_is = '10';
						break;
					case '11':
						this.what_ii_is = '11';
						break;
					case '12':
						this.what_ii_is = '12';
						break;
					case '13':
						this.what_ii_is = '13';
						break;
					case '14':
						this.what_ii_is = '14';
						break;
					default:
						;
				}
			},
			rightChangeHandle (e) {
				/* console.info(e.target.getAttribute('ii')); */
				switch (e.target.getAttribute('ii')) {
					case 'phone_num':
						{
							let result = e.target.value.match(/^\d{11}$/g);
							result === null ? (
								e.target.value = '',
								e.target.placeholder = `必须是11位数字`
							) : (
									this.me.phone_num = e.target.value
								);
						}
						break;
					case 'find_users_mes': //更新 not_me
						this.find_core('find_users_mes', e.target.value);
						break;
					case 'find_books_mes': //更新 book
						{ //校验机制
							let n = this.books_number_check(e.target.value).ok;
							if (n !== null) {
								this.find_core('find_books_mes', n);
							}
							e.target.value = '';
						}
						break;
					default:
						;
				}
			},
			rightClickHandle (e) {
				switch (e.target.getAttribute('ii')) {
					case 'borrow':
						this.borrow();
						break;
					case 'return':
						this.return_core(
							e.target.getAttribute('books_number'),
							this.not_me._id
						);
					default:
						this.searchNotByNumberBoxShow && (this.searchNotByNumberBoxShow = false)
							;
				}
			},
			return_core (number, id) {
				let obj = {
					number,
					id
				};
				/* console.info(obj); */
				this.ajax('/users/api/return_book', obj)
					.then(data => {
						/* console.info(data); */
						if (JSON.stringify(data) !== '[]') {
							this.not_me = data;
						}
					}, error => {
						console.info(error);
					});
			},
			borrow () {
				//此方法非管理员账户可调用
				//该回调做节流操作
				if (this.time_id !== null) {
					alert('请等待至少5秒');
					return;
				}
				let obj = {
					borrower_id: this.me._id,
					name: this.book.name,
					number: this.book.number,
					date: new Date().toLocaleString()
				};
				/* console.info(obj); */
				this.ajax('/users/api/add_book', obj)
					.then(data => {
						/* console.info(data); */
						if (JSON.stringify(data) !== '[]') {
							this.me = data;
							this.book.nn -= 1;
						}
					}, error => {
						console.info(error);
					});
				this.time_id = setTimeout(() => {
					clearTimeout(this.time_id);
					this.time_id = null;
				}, 5000);
			},
			ajax (url, data = null, methods = 'post') {
				return new Promise((resolve, reject) => {
					let xhr = new XMLHttpRequest();
					xhr.open(methods, url);
					xhr.onreadystatechange = () => {
						if (xhr.readyState === 4) {
							if (xhr.status === 200) {
								xhr.responseText === '' ? (
									resolve(xhr.responseText)
								) : (
										resolve(JSON.parse(xhr.responseText))
									);
							} else {
								reject(xhr.status);
							}
						}
					};
					methods === 'get' ? xhr.send() : xhr.send(JSON.stringify(data));
				});
			},
			_update_ () {
				console.info(`now ${this.now},what_ii_is ${this.what_ii_is}`);
				if (this.now === '0' && this.what_ii_is === '01') {
					this.ajax('/users/api/changes_0_01', this.me)
						.then(data => {
							console.info(data);
						}, error => {
							console.info(error);
						});
				} else if (this.now === '1' && this.what_ii_is === '12') { //新增书籍
					let k = this.new_book;
					if (k.name !== undefined && k.type !== undefined &&
						k.author !== undefined && k.nn !== undefined &&
						k.publisher !== undefined) {
						let arr = k.nn.match(/^\d+$/g);
						if (arr !== null) {
							this.new_book.nn = Number(arr[0]);
							this.ajax('/books/api/changes_1_12', this.new_book)
								.then(data => {
									console.info(data);
									return this.ajax('/books/api/take_mes')
								})
								.then(result => {
									this.max = result.max; // 更新书籍最大长度
								})
								.catch(error => {
									console.info(error);
								})

						} else {
							alert('库存数必须是数字');
						}
					} else {
						alert('不得留空');
					}
					this.new_book = {};
				} else if (this.now === '1' && this.what_ii_is === '11') { //更新书籍
					let k = this.new_book;
					if (k.nn !== undefined) {
						let arr = k.nn.match(/^\d+$/g);
						if (arr !== null) {
							this.new_book.nn = Number(arr[0]);
						} else {
							alert('库存数必须是数字');
							this.new_book = {};
							return;
						}
					}
					if (k.number !== undefined) {
						let n = this.books_number_check(k.number).ok;
						if (n !== null) {
							this.new_book.number = String(n);
							this.ajax('/books/api/changes_1_11', this.new_book)
								.then(data => {
									console.info(data);
								}, error => {
									console.info(error);
								});
						}
					} else {
						alert('编号必填');
					}
					this.new_book = {};
				}
			},
			books_number_check (value) {
				let arr = value.match(/^\d+/g);
				let n = null;
				if (arr === null) {
					alert('输入的内容是数字或者以数字开头的字符串');
					return {
						ok: null
					};
				} else {
					n = Number(arr[0]);
				}
				if (n >= this.max) {
					alert(`您输入了${n}图书最大编号索引是${this.max}`);
					return {
						ok: null
					};
				}
				return {
					ok: n
				}
			},
			find_core (str, value) {
				if (value === '') {
					return;
				}
				const fn = (_str) => {
					return (_str === 'find_users_mes' ? (
						this.ajax('/users/api/take_mes', {
							username: value //唯一
						})
					) : (
							this.ajax('/books/api/take_mes', {
								number: value //唯一
							})
						));
				};
				fn(str)
					.then(result => {
						/* console.info('$$$', result); */
						if (result.length === 1) {
							str === 'find_users_mes' ? (
								this.not_me = result[0]
							) : (
									this.book = result[0]
								);
						}
					}, error => {
						console.info(error);
					});
			}
		}
	});

	// window.VM = VM;
})();
