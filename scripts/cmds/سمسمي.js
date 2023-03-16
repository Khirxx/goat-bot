const axios = require('axios');

module.exports = {
	config: {
		name: 'سمسمي',
		aliases: ["سيم", "سمسم"],
		version: '1.1',
		author: 'AceGun_✓',
		countDown: 5,
		role: 0,
		shortDescription: '   الدردشة بذكاء الاصطناعي ',
		longDescription: 'الدردشة مع الذكاءالاصطناعي  ',
		category: 'الإستمتاع',
		guide: {
			body: '  التكلم مع سمسمي اكتب فقط سمسمي ورسالة والبوت هيرد عليك '
			
		}
	},

	onStart: async function ({ args, threadsData, message, event }) {
		if (args[0] == 'on' || args[0] == 'off') {
			await threadsData.set(event.threadID, args[0] == "on", "settings.simsimi");
			return message.reply(` ${args[0] == "on" ? "تشغيل" : "ايقاف"} سمسم`);
		}
		else if (args[0]) {
			const yourMessage = args.join(" ");
			try {
				const responseMessage = await getMessage(yourMessage);
				return message.reply(`${responseMessage}`);
			}
			catch (err) {
				return message.reply(" خطأ صغير سيتم تصليحو انتظر دقيقه ");
			}
		}
	},

	onChat: async ({ args, message, threadsData, event, isUserCallCommand }) => {
		if (args.length > 1 && !isUserCallCommand && await threadsData.get(event.threadID, "settings.simsimi")) {
			try {
				const responseMessage = await getMessage(args.join(" "));
				return message.reply(`${responseMessage}\n!`);
			}
			catch (err) {
				return message.reply("سمسم تعب ارجوك ارحمني من غبائك ");
			}
		}
	}
};

async function getMessage(yourMessage) {
	const res = await axios.get(`https://api.simsimi.net/v2`, {
		params: {
			text: yourMessage,
			lc: global.GoatBot.config.language == 'ar' ? 'ar' : 'ar',
			cf: false
		}
	});

	if (res.status > 200)
		throw new Error(res.data.success);

	return res.data.success;
  }