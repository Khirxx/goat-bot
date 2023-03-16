const axios = require("axios");

module.exports = {
	config: {
		name: "غير_البروفيل",
		aliases: ["صورةملف", "ضعععها"],
		version: "1.2",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Đổi avatar bot",
			en: "تغيير صورة ملف البوت "
		},
		longDescription: {
			vi: "Đổi avatar bot",
			en: "واضح✅"
		},
		category: "المطور",
		guide: {
			vi: "   للمطور فقط \n\n رد علي رسالة بكلمة غير_البروفيل والبوت يخطها في البروفيل "
		}
	},

	langs: {
		vi: {
			cannotGetImage: "❌ | Đã xảy ra lỗi khi truy vấn đến url hình ảnh",
			invalidImageFormat: "❌ | Định dạng hình ảnh không hợp lệ",
			changedAvatar: "✅ | Đã thay đổi avatar của bot thành công"
		},
		en: {
			cannotGetImage: "❌ | آسف حدث خطأ ❌ مقدر أجيب الصورة يا برو ",
			invalidImageFormat: "❌ | ليس رابطا جيدا ❌",
			changedAvatar: "✅ | تم تغيير صورة ملفي"
		}
	},

	onStart: async function ({ message, event, api, args, getLang }) {
		const imageURL = (args[0] || "").startsWith("http") ? args.shift() : event.attachments[0]?.url || event.messageReply?.attachments[0]?.url;
		const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
		const caption = args.join(" ");
		if (!imageURL)
			return message.SyntaxError();
		let response;
		try {
			response = (await axios.get(imageURL, {
				responseType: "stream"
			}));
		}
		catch (err) {
			return message.reply(getLang("cannotGetImage"));
		}
		if (!response.headers["content-type"].includes("image"))
			return message.reply(getLang("invalidImageFormat"));
		response.data.path = "avatar.jpg";

		api.changeAvatar(response.data, caption, expirationAfter ? expirationAfter * 1000 : null, (err) => {
			if (err)
				return message.err(err);
			return message.reply(getLang("changedAvatar"));
		});
	}
};