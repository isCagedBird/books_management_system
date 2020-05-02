module.exports = (collection, obj) => {
	return new Promise((resolve, reject) => {
		collection.find(obj, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};
