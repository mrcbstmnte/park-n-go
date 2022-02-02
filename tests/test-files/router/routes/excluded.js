'use strict';

class Excluded {
	constructor(router, context) {
		this.router = router;
		this.context = context;
	}

	static exclude = true;

	setupRoutes() {
		this.router.get('/dog');
	}
}

module.exports = Excluded;
