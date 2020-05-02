let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 用户账户,管理员账户数据库
let UsersSchema = new Schema({
	primary_account: {
		type: Boolean,
		required: true
	},
	username: { //用户账户,管理员登录账号名(唯一)
		type: String,
		required: true
	},
	address: { //住址
		type: String,
		required: true
	},
	phone_num: { //联系号码
		type: String,
		required: true
	},
	password: { //账号登陆密码
		type: String,
		required: true
	},
	books: [{ //借阅的书籍
		name: { //书籍名称
			type: String,
			required: true
		},
		number: { //书籍编号(唯一)
			type: String,
			required: true
		},
		date: { //借出日期(归还日期凭此计算出来)
			type: String,
			required: true
		}
	}]
}, {
	collection: 'users'
});

//书籍数据库
let BooksSchema = new Schema({
	name: { //书籍名称
		type: String,
		required: true
	},
	number: { //书籍编号(唯一)
		type: String,
		required: true
	},
	type: { //书籍类别
		type: String,
		required: true
	},
	author: { //作者
		type: String,
		required: true
	},
	publisher: { //出版社
		type: String,
		required: true
	},
	nn: { //库存数目
		type: Number,
		required: true
	}
}, {
	collection: 'books'
});

module.exports = {
	Users: mongoose.model('users', UsersSchema),
	Books: mongoose.model('books', BooksSchema)
};
