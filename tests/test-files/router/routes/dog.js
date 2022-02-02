'use strict';

class Dog {
	constructor(router, context) {
		this.router = router;
		this.context = context;
	}

	setupRoutes() {
		this.router.get('/dog');
	}
}

module.exports = Dog;
