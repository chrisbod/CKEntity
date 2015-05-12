function Intent(delay) {
	this.delay = delay||this.delay;
}
Intent.prototype= {
	delay: 500,
	cancel: function () {
		clearTimeout(this.timeout);
		delete this.timeout;
		delete this.action;
	},
	postpone: function () {
		clearTimeout(this.timeout);
		delete this.timeout;
	},
	request: function (action,delay) {
		this.cancel();
		this.action = action;
		this.timeout = setTimeout(this.fulfill.bind(this),delay||this.delay)
	},	
	fulfill: function () {
		this.action.apply(null);
	}
}