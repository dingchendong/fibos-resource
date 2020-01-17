const fs = require("fs");
const fibos = require("fibos");

let check_UTC = () => {
	let date = new Date();
	if (ENV === 'prod' && date.getTimezoneOffset() !== 0) {
		console.error("now the server's time zone is not UTC");
		process.exit();
	}
}

let setLogs = (logPath) => {
	if (!fs.exists(logPath)) fs.mkdir(logPath);

	console.add([{
		type: "console",
		levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR, console.WARN, console.NOTICE, console.INFO],
	}, {
		type: "file",
		levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR],
		path: logPath + "error.log",
		split: "hour",
		count: 128
	}, {
		type: "file",
		levels: [console.WARN],
		path: logPath + "warn.log",
		split: "hour",
		count: 128
	}, {
		type: "file",
		levels: [console.INFO],
		path: logPath + "access.log",
		split: "hour",
		count: 128
	}]);
}

check_UTC();

setLogs("../logs/");

fibos.config_dir = "./data";
fibos.data_dir = "./data";
fibos.load("http", {
	"http-server-address": "0.0.0.0:8870",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

let params = {
	DBconnString: "mysql://root:123456@127.0.0.1/absdb",
	p2p_address: ["210.74.14.247:9801"]
}

fibos.load("net", {
	"p2p-peer-address": params.p2p_address,
	"p2p-listen-endpoint": "0.0.0.0:9870"
});

fibos.load("ethash");
fibos.load("producer");
fibos.load("chain", {
	"contracts-console": false,
	"delete-all-blocks": false,
	"genesis-json": "genesis.json"
});

fibos.load("chain_api");
fibos.load("emitter");

// [fibos - tracker]
const Tracker = require("fibos-tracker");

Tracker.Config.DBconnString = params.DBconnString;
Tracker.Config.replay = true;
const tracker = new Tracker();

tracker.use({
	defines: require("fibos-tokens").defines,
	hooks: require("../lib/hooks/")
});

tracker.emitter(fibos);
fibos.start();