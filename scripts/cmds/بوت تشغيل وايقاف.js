module.exports = {
	config: {
		name: "بوت",
		aliases: ["تقييد", "adminbox", "بوت الأدمن"],
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		shortDescription: {
			ar:" 1 ",
			en: "Enable/disable bot usage only by admins in the group"
		},
		longDescription: {
			en: "تمكين/تعطيل وضع الأدمن المجموعة فقط حتى يمكن استخدام البوت",
			ar: "Enable/disable admin-only mode for using the bot"
		},
		category: "المجموعة",
		guide: {
			en: "بوت [تشغيل | إيقاف]"
		}
	},

	langs: {
		en: {
			turnedOn: "تم تشغيل وضع الأدمن المجموعة فقط لإستخدام البوت",
			turnedOff: "تم إيقاف وضع الأدمن المجموعة فقط لإستخدام البوت",
			syntaxError: "خطأ في الصياغة، يجب استخدام {pn} on أو {pn} off فقط"
		},
		ar: {
			turnedOn: "Bot admin-only mode has been enabled",
			turnedOff: "Bot admin-only mode has been disabled",
			syntaxError: ""
		}
	},

	onStart: async function ({ args, message, event, threadsData, getLang }) {
		if (args[0] == "ايقاف") {
			await threadsData.set(event.threadID, true, "data.onlyAdminBox");
			message.reply(getLang("turnedOn"));
		}
		else if (args[0] == "تشغيل") {
			await threadsData.set(event.threadID, false, "data.onlyAdminBox");
			message.reply(getLang("turnedOff"));
		}
		else
			return;
	}
};