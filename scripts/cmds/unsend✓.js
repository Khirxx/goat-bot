module.exports = {
	config: {
		name: "مسح",
    aliases: ["شيل", "امسح", "احذف"],
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Gỡ tin nhắn của bot",
			en: "حذف رسائل البوت"
		},
		longDescription: {
			vi: "Gỡ tin nhắn của bot",
			en: "رد على رسالة تريد حذفها"
		},
		category: "المجموعة",
		guide: {
			vi: "reply tin nhắn muốn gỡ của bot và gọi lệnh {pn}",
			en: "رد على رسالة بالرمز مع كلمة مسح او حذف او شيل او امسح"
		}
	},

	langs: {
		vi: {
			syntaxError: "Vui lòng reply tin nhắn muốn gỡ của bot"
		},
		en: {
			syntaxError: "  هوا انتا غبي ولا تشوفني ساحر كيف احذف لسالة ليست لي اااااخ من الغباء  "
		}
	},

	onStart: async function ({ message, event, api, getLang }) {
		if (!event.messageReply || event.messageReply.senderID != api.getCurrentUserID())
			return message.reply(getLang("syntaxError"));
		if(!global.fff.includes(event.messageReply.messageID)){
    message.unsend(event.messageReply.messageID);}
    else {
      message.reply("هل انا ساحر لاحذف رسالة ليست لي 😒")}
	}
};