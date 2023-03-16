const { findUid } = global.utils;
const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
	config: {
		name: "معرف",
    aliases: ["آد"],
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Xem uid",
			en: "رؤية آيديك"
		},
		longDescription: {
			uid: "Xem user id facebook của người dùng",
			en: "رؤية معرفك على فايسبوك ✓"
		},
		category: "معلومات",
		guide: {
			vi: "   {pn}: dùng để xem id facebook của bạn"
				+ "\n   {pn} @tag: xem id facebook của những người được tag"
				+ "\n   {pn} <link profile>: xem id facebook của link profile",
			en: "  رئيت معرف حسابك علي الفيس "
		
		}
	},

	langs: {
		vi: {
			syntaxError: "Vui lòng tag người muốn xem uid hoặc để trống để xem uid của bản thân"
		},
		en: {
			syntaxError: "سوي تاغ او لا تسوي شيء   "
		}
	},

	onStart: async function ({ message, event, args, getLang }) {
		if (!args[0])
			return message.reply(event.senderID);
		if (args[0].match(regExCheckURL)) {
			let msg = '';
			for (const link of args) {
				try {
					const uid = await findUid(link);
					msg += `${link} => ${uid}\n`;
				}
				catch (e) {
					msg += `${link} (ERROR) => ${e.message}\n`;
				}
			}
			message.reply(msg);
			return;
		}
		let msg = "";
		const { mentions } = event;
		for (const id in mentions)
			msg += `${mentions[id].replace("@", "")}: ${id}\n`;
		message.reply(msg || getLang("syntaxError"));
	}
};