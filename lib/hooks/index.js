let save_actions = (db, params) => {
	let trx_id = params.trx_id;
	let token_from_name = params.token_from_name;
	let token_to_name = params.token_to_name;
	let account_from_name = params.account_from_name;
	let account_to_name = params.account_to_name;
	let global_sequence = params.global_sequence;
	let token_from_id = params.token_from_id;
	let token_to_id = params.token_to_id;
	let contract_action = params.contract_action;

	let action_id = db.driver.execQuerySync(`select id from fibos_actions where trx_id = ? and global_sequence = ?`, [trx_id, global_sequence])[0].id;

	let ta = db.driver.execQuerySync(`select id from fibos_tokens_action where action_id = ?`, [action_id])[0];
	if (ta && ta.id) return;

	if (!!token_from_name) {
		token_from_id = db.driver.execQuerySync(`select id from fibos_tokens where token_name = ? and token_status = "on"`, [token_from_name])[0].id;
	}

	if (!!token_to_name) {
		token_to_id = db.driver.execQuerySync(`select id from fibos_tokens where token_name = ? and token_status = "on"`, [token_to_name])[0].id;
	}

	db.driver.execQuerySync(`insert into fibos_tokens_action(account_from_id,account_to_id,token_from_id,token_to_id,contract_action,action_id) values(?,?,?,?,?,?)`, [account_from_name,
		account_to_name, token_from_id, token_to_id, contract_action, action_id
	]);
}

module.exports = {
	"eosio/buyram": (db, messages) => {
		/*
		 * @api {} buyram  购买内存
		 * @apiName buyram 购买内存
		 * @apiGroup SymbolTransactions
		 * @apiVersion  1.0.0
		 * 
		 * @apiSuccessExample {type} Transactions
		 *   {
		 *       "from_account": "fibos",
		 *       "to_account": "fibos",
		 *       "action": "buyram",
		 *       "data": {
		 *           "payer": "testnetbppa1",
		 *           "receiver": "testnetbppa1",
		 *           "quant": "1.0000 FO",
		 *       },
		 *       "created": "2018-11-12 09:32:52",
		 *       "trx_id": "cfe90318fe5bd64a3bfa1a4b1ec146e4a0b176775f60c1e63fef5e394c46a2c2",
		 *       "block_num": 31,
		 *       "createdAt": "2018-11-12 09:34:10",
		 *       "updatedAt": "2018-11-12 09:34:10",
		 *       "id": 1
		 *   }
		 * 
		 */
		messages.forEach(message => {
			if (message.parent) return;
			var data = message.act.data;
			if (typeof data !== 'object') return;

			save_actions(db, {
				trx_id: message.trx_id,
				global_sequence: message.receipt.global_sequence.toString(),
				contract_action: message.act.account + "/" + message.act.name,
				account_from_name: data.payer,
				account_to_name: data.receiver
			})
		});
	},
	"eosio/sellram": (db, messages) => {
		/**
		 * @api {} sellram  出售内存
		 * @apiName sellram 出售内存
		 * @apiGroup SymbolTransactions
		 * @apiVersion  1.0.0
		 * 
		 * @apiSuccessExample {type} Transactions
		 *   {
		 *       "from_account": "fibos",
		 *       "to_account": "fibos",
		 *       "action": "sellram",
		 *       "data": {
		 *           "account":"testnetbppa1",
		 *            "bytes":"10",
		 *            "quant":"0.1000 FO"
		 *       },
		 *       "created": "2018-11-12 09:32:52",
		 *       "trx_id": "cfe90318fe5bd64a3bfa1a4b1ec146e4a0b176775f60c1e63fef5e394c46a2c2",
		 *       "block_num": 31,
		 *       "createdAt": "2018-11-12 09:34:10",
		 *       "updatedAt": "2018-11-12 09:34:10",
		 *       "id": 1
		 *   }
		 * 
		 **/
		messages.forEach(message => {
			if (message.parent) return;
			var data = message.act.data;
			if (typeof data !== 'object') return;

			save_actions(db, {
				trx_id: message.trx_id,
				global_sequence: message.receipt.global_sequence.toString(),
				contract_action: message.act.account + "/" + message.act.name,
				account_from_name: data.account,
				account_to_name: data.account
			})
		});
	},
	"eosio/buyrambytes": (db, messages) => {
		/**
		 * @api {} buyrambytes  购买内存
		 * @apiName buyrambytes 购买内存
		 * @apiGroup SymbolTransactions
		 * @apiVersion  1.0.0
		 * 
		 * @apiSuccessExample {type} Transactions
		 *   {
		 *       "from_account": "fibos",
		 *       "to_account": "fibos",
		 *       "action": "buyrambytes",
		 *       "data": {
		 *           "payer":"testnetbppa1",
		 *            "receiver":"1000",
		 *            "bytes":1000,
		 *            "quant":"0.1000 FO"
		 *       },
		 *       "created": "2018-11-12 09:32:52",
		 *       "trx_id": "cfe90318fe5bd64a3bfa1a4b1ec146e4a0b176775f60c1e63fef5e394c46a2c2",
		 *       "block_num": 31,
		 *       "createdAt": "2018-11-12 09:34:10",
		 *       "updatedAt": "2018-11-12 09:34:10",
		 *       "id": 1
		 *   }
		 * 
		 **/
		messages.forEach(message => {
			if (message.parent) return;
			var data = message.act.data;
			if (typeof data !== 'object') return;

			save_actions(db, {
				trx_id: message.trx_id,
				global_sequence: message.receipt.global_sequence.toString(),
				contract_action: message.act.account + "/" + message.act.name,
				account_from_name: data.payer,
				account_to_name: data.receiver
			})

		})
	},
	"eosio/delegatebw": (db, messages) => {
		/*
		 * @api {} delegatebw  抵押资源
		 * @apiName delegatebw 抵押资源
		 * @apiGroup SymbolTransactions
		 * @apiVersion  1.0.0
		 * 
		 * @apiSuccessExample {type} Transactions
		 *   {
		 *       "from_account": "fibos",
		 *       "to_account": "fibos",
		 *       "action": "delegatebw",
		 *       "data": {
		 *              "from":"testnetbppa1",
		 *              "receiver":"testnetbppa1",
		 *              "stake_net_quantity":"100.0000 FO",
		 *              "stake_cpu_quantity":"100.0000 FO",
		 *              "transfer":"0"
		 *       },
		 *       "created": "2018-11-12 09:32:52",
		 *       "trx_id": "cfe90318fe5bd64a3bfa1a4b1ec146e4a0b176775f60c1e63fef5e394c46a2c2",
		 *       "block_num": 31,
		 *       "createdAt": "2018-11-12 09:34:10",
		 *       "updatedAt": "2018-11-12 09:34:10",
		 *       "id": 1
		 *   }
		 * 
		 */
		messages.forEach(message => {
			if (message.parent) return;
			var data = message.act.data;
			if (typeof data !== 'object') return;

			save_actions(db, {
				trx_id: message.trx_id,
				global_sequence: message.receipt.global_sequence.toString(),
				contract_action: message.act.account + "/" + message.act.name,
				account_from_name: data.from,
				account_to_name: data.receiver
			})

		});
	},
	"eosio/undelegatebw": (db, messages) => {
		/*
		 * @api {} undelegatebw  取消抵押资源
		 * @apiName undelegatebw 取消抵押资源
		 * @apiGroup SymbolTransactions
		 * @apiVersion  1.0.0
		 * 
		 * @apiSuccessExample {type} Transactions
		 *   {
		 *       "from_account": "fibos",
		 *       "to_account": "fibos",
		 *       "action": "undelegatebw",
		 *       "data": {
		 *              "from":"testnetbppa1",
		 *              "receiver":"testnetbppa1",
		 *              "unstake_net_quantity":"100.0000 FO",
		 *              "unstake_cpu_quantity":"100.0000 FO",
		 *              "transfer":"0"
		 *       },
		 *       "created": "2018-11-12 09:32:52",
		 *       "trx_id": "cfe90318fe5bd64a3bfa1a4b1ec146e4a0b176775f60c1e63fef5e394c46a2c2",
		 *       "block_num": 31,
		 *       "createdAt": "2018-11-12 09:34:10",
		 *       "updatedAt": "2018-11-12 09:34:10",
		 *       "id": 1
		 *   }
		 * 
		 */
		messages.forEach(message => {
			if (message.parent) return;
			var data = message.act.data;
			if (typeof data !== 'object') return;

			save_actions(db, {
				trx_id: message.trx_id,
				global_sequence: message.receipt.global_sequence.toString(),
				contract_action: message.act.account + "/" + message.act.name,
				account_from_name: data.payer,
				account_to_name: data.receiver
			})
		});
	},
	"eosio/claimbonus": (db, messages) => {
		try {
			messages.forEach(message => {
				var inline_traces = message.inline_traces;

				if (inline_traces.length !== 1) return;

				var inline_traces_data = inline_traces[0];
				var data = inline_traces_data.act.data;
				if (typeof data !== 'object') return;

				save_actions(db, {
					trx_id: message.trx_id,
					global_sequence: inline_traces_data.receipt.global_sequence.toString(),
					contract_action: data.act.account + "/" + "exlocktrans",
					account_from_name: data.from,
					account_to_name: data.to,
					token_to_name: data.quantity.quantity.split(" ")[1]
				})

			})
		} catch (e) {
			console.error("eosio/claimbonus saved error", e);
		}
	}
}