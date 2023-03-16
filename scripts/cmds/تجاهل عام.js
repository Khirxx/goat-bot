const ignoreList = global.GoatBot.config.adminOnly.ignoreCommand;
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "تجاهل_عام",
		aliases: ["تجاهل2", "تجاهلل", "سماح"],
		version: "1.0",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Bỏ qua lệnh trong adminonly",
			en:  "يمكنك للادمن فقط استخداماو \n\n يتجاهل امر في وضع الصيانة"
		},
		longDescription: {
			vi: "Bỏ qua lệnh trong adminonly (khi bật adminonly, các lệnh được thêm từ lệnh này người dung vẫn có thể sử dụng)",
			en: ""
		},
		category: "المطور",
		guide: {
			vi: "   {pn} add <commandName>: Thêm lệnh vào danh sách bỏ qua\n   {pn} del <commandName>: Xóa lệnh khỏi danh sách bỏ qua\n   {pn} list: Xem danh sách lệnh bỏ qua",
			en: "   تجاهلل <إسم الأمر>: إضافة أمر مسموح \n   تجاهلل إحذف <إسم الأنر>: إحذف أمر من القائمة \n   تجاهلل قائمة: عرض القائمة "
		}
	},

	langs: {
		vi: {
			missingCommandNameToAdd: "⚠️ Vui lòng nhập tên lệnh bạn muốn thêm vào danh sách bỏ qua",
			missingCommandNameToDelete: "⚠️ Vui lòng nhập tên lệnh bạn muốn xóa khỏi danh sách bỏ qua",
			commandNotFound: "❌ Không tìm thấy lệnh \"%1\" trong danh sách lệnh của bot",
			commandAlreadyInList: "❌ Lệnh \"%1\" đã có trong danh sách bỏ qua",
			commandAdded: "✅ Đã thêm lệnh \"%1\" vào danh sách bỏ qua",
			commandNotInList: "❌ Lệnh \"%1\" không có trong danh sách bỏ qua",
			commandDeleted: "✅ Đã xóa lệnh \"%1\" khỏi danh sách bỏ qua",
			ignoreList: "📑 Danh sách lệnh bỏ qua trong adminonly:\n%1"
		},
		en: {
			missingCommandNameToAdd: "⚠️ أدخل أمر صحيح ",
			missingCommandNameToDelete: "⚠️ أدخل إسم الأمر  احذفه",
			commandNotFound: "❌ أمر \"%1\" لم أجده في قائمة أوامر البوت",
			commandAlreadyInList: "❌ أمر \"%1\" موجود ✅",
			commandAdded: "✅ إضافة أمر \"%1\" للقائمة",
			commandNotInList: "❌ أمر \"%1\" غير موجود في القائمة ",
			commandDeleted: "✅ تم حذف  \"%1\" من القائمة",
			ignoreList: "📑 أوامر مسموحة أثناء التقييد العام للبوت:\n%1"
		}
	},

	onStart: async function ({ args, message, getLang }) {
		switch (args[0]) {
			case "اضف": {
				if (!args[1])
					return message.reply(getLang("missingCommandNameToAdd"));
				const commandName = args[1].toLowerCase();
				const command = global.GoatBot.commands.get(commandName);
				if (!command)
					return message.reply(getLang("commandNotFound", commandName));
				if (ignoreList.includes(commandName))
					return message.reply(getLang("commandAlreadyInList", commandName));
				ignoreList.push(commandName);
				fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
				return message.reply(getLang("commandAdded", commandName));
			}
			case "احذف":
			case "delete":
			case "remove":
			case "rm":
			case "-d": {
				if (!args[1])
					return message.reply(getLang("missingCommandNameToDelete"));
				const commandName = args[1].toLowerCase();
				const command = global.GoatBot.commands.get(commandName);
				if (!command)
					return message.reply(getLang("commandNotFound", commandName));
				if (!ignoreList.includes(commandName))
					return message.reply(getLang("commandNotInList", commandName));
				ignoreList.splice(ignoreList.indexOf(commandName), 1);
				fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
				return message.reply(getLang("commandDeleted", commandName));
			}
			case "قائمة": {
				return message.reply(getLang("ignoreList", ignoreList.join(", ")));
			}
			default: {
				return message.SyntaxError();
			}
		}
	}
};