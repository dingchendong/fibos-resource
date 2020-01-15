require("../lib/before.js");

const fibos = require("fibos");
fibos.config_dir = "./data";
fibos.data_dir = "./data";
fibos.load("http", {
	"http-server-address": "0.0.0.0:8870",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

fibos.load("net", {
	"p2p-peer-address": CONFIG["p2p-peer-address"],
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

let params = {
	httpEndpoint: "http://210.74.14.247:9090",
	DBconnString: "mysql://root:123456@127.0.0.1/absdb"
}

Tracker.Config.DBconnString = CONFIG["DBconnString"];
Tracker.Config.replay = true;
const tracker = new Tracker();

tracker.use({
	defines: require("fibos-tokens").defines,
	hooks: require("../lib/hooks/")
});

tracker.emitter(fibos);
fibos.start();