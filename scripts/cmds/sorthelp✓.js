module.exports = {
	config: {
		name: "القائمة",
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		shortDescription: {
			vi: "Sắp xếp danh sách help",
			en: "تغيير قائمة الأوامر "
		},
		longDescription: {
			vi: "Sắp xếp danh sách help",
			en: "إختار طريقة عرض أوامر في مجموعتك "
		},
		category: "مساعدة",
		guide: {
			en: "القائمة [إسم | فئة]"
		}
	},

	langs: {
		vi: {
			savedName: "Đã lưu cài đặt sắp xếp danh sách help theo thứ tự chữ cái",
			savedCategory: "Đã lưu cài đặt sắp xếp danh sách help theo thứ tự thể loại"
		},
		en: {
			savedName: "تم حفظ التغيير ✅",
			savedCategory: "تم حفظ قائمتك ✅"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		if (args[0] == "إسم") {
			await threadsData.set(event.threadID, "name", "settings.sortHelp");
			message.reply(getLang("savedName"));
		}
		else if (args[0] == "فئة") {
			threadsData.set(event.threadID, "category", "settings.sortHelp");
			message.reply(getLang("savedCategory"));
		}
		else
			message.SyntaxError();
	}
};