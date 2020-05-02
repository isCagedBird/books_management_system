module.exports = (collection, obj, update) => {
	return new Promise((resolve, reject) => {
		collection.updateOne(obj, update, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};
