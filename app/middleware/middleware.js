module.exports = {

	isAuthorized: function (req, res, next) {
		return next();
		res.redirect('/login');
	}
};