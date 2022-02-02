'use strict';

class Cat {
	constructor(router, context) {
		this.router = router;
		this.context = context;
	}

	setupRoutes() {
		this.router.get('/cat');
	}
}

module.exports = Cat;
