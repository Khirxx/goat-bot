const { removeHomeDir } = global.utils;

module.exports = {
	config: {
		name: "تجربة",
		version: "1.2",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Test code nhanh",
			en: "تجربة أمر"
		},
		longDescription: {
			vi: "Test code nhanh",
			en: "تجربة أمر "
		},
		category: "المطور",
		guide: {
			vi: "{pn} <đoạn code cần test>",
			en: "تجربة <الكود>"
		}
	},

	langs: {
		vi: {
			error: "❌ Đã có lỗi xảy ra:"
		},
		en: {
			error: "❌ حدث خطأ :"
		}
	},

	onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
		function output(msg) {
			if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function")
				msg = msg.toString();
			else if (msg instanceof Map) {
				let text = `Map(${msg.size}) `;
				text += JSON.stringify(mapToObj(msg), null, 2);
				msg = text;
			}
			else if (typeof msg == "object")
				msg = JSON.stringify(msg, null, 2);
			else if (typeof msg == "undefined")
				msg = "undefined";

			message.reply(msg);
		}
		function out(msg) {
			output(msg);
		}
		function mapToObj(map) {
			const obj = {};
			map.forEach(function (v, k) {
				obj[k] = v;
			});
			return obj;
		}
		const cmd = `
		(async () => {
			try {
				${args.join(" ")}
			}
			catch(err) {
				message.send(
					"${getLang("error")}\\n" +
					(err.stack ?
						removeHomeDir(err.stack) :
						removeHomeDir(JSON.stringify(err, null, 2))
					)
				);
			}
		})()`;
		eval(cmd);
	}
};