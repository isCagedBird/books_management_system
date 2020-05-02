;
(function() {
	'use strict';
	const VM = new Vue({
		el: '#app',
		data: {
			isLogin: true,
			change_mes: '注册',
			color: '',
			loginArr: [
				['登录账号', 'username'],
				['登录密码', 'password']
			],
			registerArr: [
				['登录账号(必填)', 'username'],
				['输入Y注册管理员账号(必填)', 'is_main'],
				['登录密码(必填)', 'password'],
				['联系号码(必填)', 'phone_num'],
				['家庭住址(必填)', 'address']
			]
		},
		methods: {
			core(inputs, domEl) {
				let flag = false;
				for (let i = 0; i < inputs.length; i++) {
					if (inputs[i].value === '') {
						flag = true;
					}
				}
				if (flag) {
					return;
				} else {
					domEl.submit();
				}
			},
			login() {
				this.core(document.querySelectorAll('#login_form input[type=text]'), document.getElementById('login_form'));
			},
			register() {
				this.core(document.querySelectorAll('#register_form input[type=text]'), document.getElementById('register_form'));
			},
			change() {
				this.isLogin ? (
					this.isLogin = false,
					this.change_mes = '登录'
				) : (
					this.isLogin = true,
					this.change_mes = '注册'
				);
			},
			checkNum(e) {
				e.target.value.match(/^\d{11}$/g) === null ? (
					e.target.value = '',
					this.color = '#FAEBD7',
					e.target.placeholder = '请输入11位数字'
				) : (
					this.color = '',
					e.target.placeholder = this.registerArr[3][0]
				);
			},
			check(e) {
				if (e.target.value.match(/^Y$/g) === null) {
					e.target.value = 'N';
				}
			}
		}
	});

	/* window.VM = VM; */
})();
