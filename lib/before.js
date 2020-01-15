"use strict";

const fs = require("fs");
const DB = require("db");
const argv = process.argv;

if (argv.length !== 3 || !["dev", "prod", "preview"].includes(argv[2])) {
	console.error("fibos index.js dev/preview/prod");
	process.exit(-1);
}

global.ENV = argv[2];

global.CONFIG = require("./conf/" + ENV + ".json");

console.notice("ENV:%s\nCONFIG:%j", ENV, CONFIG);

//检查服务器当前时区
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