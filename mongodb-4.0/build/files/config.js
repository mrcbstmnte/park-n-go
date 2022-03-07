var config = null;

try {
	config = rs.conf();
} catch(e) {

}

if(config === null) {
	print('Will intiate configuration');
	rs.initiate({
		_id: 'mongodb-test',
		members: [{
			_id  : 0,
			host : 'mongodb1:27401'
		}, {
			_id  : 1,
			host : 'mongodb2:27402'
		}, {
			_id  : 2,
			host : 'mongodb3:27403'
		}]
	});
} else {
	print('Nothing to change configuration already latest');
}
