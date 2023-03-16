module.exports = {
	config: {
		name: "عرف",
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Xem threadID",
			en: "رؤية آيدي المجموعة"
		},
		longDescription: {
			vi: "Xem id nhóm chat của bạn",
			en: " البوت يرسل ايدي الجروب  "
		},
		category: "معلومات",
		guide: {
			en: "البوت يرسل ايدي الجروب" 
		}
	},

	onStart: async function ({ message, event }) {
		message.reply(event.threadID.toString());
	}
};