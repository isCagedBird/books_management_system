let path = require('path');
let fs = require('fs');

const pReadFile = (file_path, encoding = 'utf8') => {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(__dirname.replace('/tools', ''), file_path), encoding, function(err, data) {
			if (err) {
				reject(err);
				return;
			}
			resolve(data.toString());
		});
	});
};

module.exports = {
	pReadFile
};
