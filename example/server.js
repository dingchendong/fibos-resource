var fibos = require('fibos');
var path = require('path');
var http = require('http');

var util = require("util");
var cache = new util.LruCache(10);

fibos.config_dir = path.join(__dirname, "node");
fibos.data_dir = path.join(__dirname, "node");

console.notice("config_dir:", fibos.config_dir);
console.notice("data_dir:", fibos.data_dir);

fibos.load("http", {
	"http-server-address": "0.0.0.0:8870",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

fibos.load("net", {
	"p2p-listen-endpoint": "0.0.0.0:9870"
});

fibos.load("producer", {
	'producer-name': 'eosio',
	'enable-stale-production': true,
	'max-transaction-time': 3000
});

fibos.load("chain", {
	"delete-all-blocks": true,
	"contracts-console": true
});

fibos.load("chain_api");
fibos.load("net_api");
fibos.load("producer_api");
fibos.load("db_size_api");
fibos.load("history_api");

http.timeout = 2000;

function get_raw_code_and_abi(k) {
	let rs = http.post("http://0.0.0.0:8870/v1/chain/get_raw_code_and_abi", {
		json: {
			"account_name": k
		}
	});
	return rs;
}

let account_list = [];

setInterval(() => {
	account_list.forEach(k => {
		cache.get(k, (k) => {
			let temp;
			try {
				temp = get_raw_code_and_abi(k);
			} catch (e) {
				return;
			}
			return temp;
		});
	});
}, 1000 * 60);

var apiHandler = fibos.apiHandler();
var http_server = new http.Server(8871, [
	function(req) {
		if (req.address.indexOf("v1/chain/get_raw_code_and_abi") !== -1) {
			let k = req.data.toString().split(":")[1];
			let v = cache.get(k, (k) => {
				let temp;
				try {
					temp = get_raw_code_and_abi(k);
				} catch (e) {
					return;
				}
				return temp;
			});

			if (v && v.length != 0) {
				if (account_list.indexOf(k) == -1) account_list.push(k);
				req.response.body.write(v);
				req.response.statusCode = 200;
				req.end();
			} else {
				let err = {
					"code": 500,
					"message": "Internal Service Error",
					"error": {
						"code": 0,
						"name": "exception",
						"what": "unspecified",
						"details": [{
							"message": "unknown key (eosio::chain::name): " + k + " or timeout",
							"file": "http_plugin.cpp",
							"line_number": 653,
							"method": "handle_exception"
						}]
					}
				}
				req.response.body.write(err);
				req.response.statusCode = 500;
				req.end();
			}
		}
	}, {
		'/v1/*': apiHandler
	}
]);
http_server.start();

fibos.enableJSContract = true;

fibos.start();