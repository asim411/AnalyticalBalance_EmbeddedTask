// Usage:
// node device.js <args>
// args: 
//    <Lower Range> Lower measurement range of the device. (float)
//    <Upper Range> Upper measurement range of the device. (float) 
//    <Readability> Smallest devision the device is capable of measuring. (float)
//    <Actual weight> Actual weight of the mass. (float) 
//    <Door Function> Door function (automatic or manual)
//    <Current Door Status> Current door position. (open or close)
//    <timeout> Time to wait for stable value before a timing out on a command. (seconds)
//    <Settling TIme> Time taken by the device to arrive at a stable value. (seconds)
//    <Set current Unit> Current weight unit. (lb, g, etc) default is g.
// 
// Example commands:
// >node device.js 0.016 52 0.005 7 automatic open 4 2 lb
// >node device.js 0.02 20 0.1 12 automatic close 3 1
// >node device.js 1 35 0.01 22 manual close 4 3 g

var serverArgs = process.argv.slice(2);

const avgReadingsCount = 10.000;
const fixedPrecision = 2;
const weightInRange = 0;
const weightOverload = 1;
const weightUnderload = 2;
const defaultUnit = 'g'
const settlingTime = parseInt(serverArgs[7]); // seconds. Time taken by the device to arrive at a stable value.

var lowerRange = parseFloat(serverArgs[0]); // Lower measurement range of the device
var upperRange = parseFloat(serverArgs[1]); // Upper measurement range of the device
var readability = parseFloat(serverArgs[2]); // Smallest devision the device is capable of measuring.
var weight = parseFloat(serverArgs[3]); // Actual weight of the mass.
var doorFunction = serverArgs[4]; // automatic or manual
var currentDoorStatus = serverArgs[5]; // close or open.
var timeout = parseFloat(serverArgs[6]); // seconds. Time to wait for stable value before a timing out on a command.
var setUnit = defaultUnit; // default unit of measurement.
// allow +- readability to simulate fluctuations.
var lowerBound = parseFloat(weight) - (parseFloat(readability)); // measurement fluctuation lower bound
var upperBound = parseFloat(weight) + (parseFloat(readability)); // measurement fluctuation upper bound
var isWeightOutofRange = weightInRange;
var stableWeight = 0;
var busy = false;

var cmdSend = Buffer.from('S\n');
var cmdSendUnit = Buffer.from('SU\n');

var ipc = require('node-ipc');
 
// Configure IPC
ipc.config.id = 'device';
ipc.config.stopRetrying = 0;
ipc.config.silent = true;
ipc.config.rawBuffer = true;	
ipc.config.encoding = 'hex';

// Returns random value betwwen range min and max.
function getRandomValue(min, max) {
	return Math.random() * (max - min) + min;
}

// Sleep for ms milliseconds.
function sleepMS(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Measure stable weight by averaging 10 values.
async function getStableWeightAsync() {
	var currentWeight = 0;
	busy = true;
	stableWeight = 0;
	for (let count = 0; count < avgReadingsCount; count++) {
		currentWeight += parseFloat(getRandomValue(lowerBound, upperBound).toFixed(fixedPrecision));
		// introduce artificial delay to simulate settling time.
		await sleepMS((parseInt(settlingTime) * 1000) / avgReadingsCount);
	}
	currentWeight /= avgReadingsCount;
	stableWeight = currentWeight.toFixed(fixedPrecision);
	busy = false;
}

// Keep measuring stable weight. used when device is started with door closed.
async function calcStableWeight() {
	while (true) {
		var currentWeight = 0;
		for (let count = 0; count < avgReadingsCount; count++) {
			currentWeight += parseFloat(getRandomValue(lowerBound, upperBound).toFixed(fixedPrecision));
			// introduce artificial delay to simulate settling time.
			await sleepMS((parseInt(settlingTime) * 1000) / avgReadingsCount);
		}
		currentWeight /= avgReadingsCount;
		stableWeight = currentWeight.toFixed(fixedPrecision);
	}
}

// responds to command with appropriate data
async function serveData(data, socket) {
	var reply = '';
	var unit = defaultUnit;

	console.log('Received: ' + data.toString('hex') + ' is "' + data.toString()  + '"');
	
	// Use change measurement unit from default to the current unit for SU\n
	if (0 === Buffer.compare(data, cmdSendUnit)) {
		unit = setUnit;
	}
	else if (0 !== Buffer.compare(data, cmdSend)) {
		// we recieved neither SU\n nor S\n. Response with exec err.
		ipc.server.emit(socket, Buffer.from('S I'));
		return;
	}

	console.log('Command recognized.');
	
	// device is busy.
	if (busy == true) {
		reply = 'S I';
	}
	// door is open and the function is not set to automatic,
	else if ((doorFunction !== 'automatic') && (currentDoorStatus !== 'close')) {
		reply = 'S I';
	}
	// conditions for over/under load.
	else if (isWeightOutofRange == weightOverload) {
		reply = 'S +';
	}
	else if (isWeightOutofRange == weightUnderload) {
		reply = 'S -';
	}
	// door function is automatic and currently open so close the door and measure the
	// value. Wait for given timeout and return timeout or the stable value.
	else if ((doorFunction === 'automatic') && (currentDoorStatus !== 'close')) {
		//closeDoor();
		getStableWeightAsync();
		await sleepMS(parseInt(timeout) * 1000);
		if (parseFloat(stableWeight) == 0) {
			reply = 'S I';
		}
	}
	// door was already closed but we have not yet settled.
	if (parseFloat(stableWeight) == 0) {
		reply = 'S I';
	}
	// Or stable measurement is ready.
	else if (isWeightOutofRange == weightInRange) {
		reply = 'S S ' + stableWeight.toString().padStart(10, ' ') + ' ' + unit
	}

	ipc.server.emit(socket, Buffer.from(reply));
	console.log('Listening.');
}

function serverListen() {
	console.log('Listening.');
	ipc.server.on('data', serveData);
	ipc.server.on(
		'socket.disconnected',
		function(socket, destroyedSocketID) {
			ipc.log('client ' + destroyedSocketID + ' has disconnected!');
		}
	);
}

if (typeof serverArgs[8] !== 'undefined') {
	setUnit = serverArgs[8]; // current weight unit
}

if (parseFloat(weight) < parseFloat(lowerRange)) {
	isWeightOutofRange = weightUnderload;
	console.log('weight is underload');
}
else if (parseFloat(weight) > parseFloat(upperRange)) {
	isWeightOutofRange = weightOverload;
	console.log('weight is overload');
}
// keep measuring weight if the door is closed.
else if (currentDoorStatus === 'close') {
	calcStableWeight();
}

console.log('Device online');
ipc.serve(serverListen);
ipc.server.start();

