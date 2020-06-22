// Usage:
// node driver.js <args>
// args: 
//    <S\n> Send stable weight value. (Note: make sure to add newline character at the end).
//    <SU\n> Send stable weight value in actually displayed unit. (Note: make sure to add newline character at the end).
// 
// Example commands:
// >node driver.js 'S
// >'
// >node driver.js 'SU
// >'

var cmdArg = process.argv.slice(2)[0];
var ipc = require('node-ipc');

// Configure IPC
ipc.config.id = 'driver';
ipc.config.stopRetrying = 0;
ipc.config.silent = true;
ipc.config.rawBuffer = true;
ipc.config.encoding='hex';

// Callback for socket connected.
function driverConnected() {
	var cmd = '';
	console.log('Driver online');
	if (cmdArg === 'S\n') {
		console.log('Sending Command: Send stable weight value');
		console.log('Sending: ' + '"' + cmdArg + '"');	
	}
	else if (cmdArg === 'SU\n') { 
		console.log('Sending Command: Send stable weight value in actually displayed unit');		
		console.log('Sending: ' + '"' + cmdArg + '"');
	}
	ipc.of.device.emit(Buffer.from(cmdArg));
}

// Provide IPC events callbacks.
function driverStart() {
	ipc.of.device.on('connect', driverConnected);

	ipc.of.device.on(
		'disconnect',
		function() {
			console.log('disconnected from device');
			ipc.disconnect('device');
			return false;
		}
	);
	ipc.of.device.on(
		'data',
		function(data) {
			console.log('Response Recieved: "' + data.toString() + '"');
			ipc.disconnect('device');
			return false;
		}
	);
}

ipc.connectTo('device', driverStart);
