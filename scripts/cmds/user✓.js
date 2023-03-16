const { getTime } = global.utils;

module.exports = {
	config: {
		name: "حظر",
		version: "1.2",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Quản lý người dùng",
			en: "باند فك الباند عن الأعضاء"
		},
		longDescription: {
			vi: "Quản lý người dùng trong hệ thống bot",
			en: "إذا أنت مطور تعرف جيدا "
		},
		category: "المطور",
		guide: {
			vi: "   {pn} [find | -f | search | -s] <tên cần tìm>: tìm kiếm người dùng trong dữ liệu bot bằng tên"
				+ "\n"
				+ "\n   {pn} [ban | -b] [<uid> | @tag | reply tin nhắn] <reason>: để cấm người dùng mang id <uid> hoặc người được tag hoặc người gửi của tin nhắn được reply sử dụng bot"
				+ "\n"
				+ "\n   {pn} unban [<uid> | @tag | reply tin nhắn]: để bỏ cấm người dùng sử dụng bot",
			en: " حظر الاعضاء اكتب حظر هاذا وسبب الحظر والبوت يحظرو \n مثال رد علي رسالة شخص واكتب حظر هاذا لانو ممل والبوت يحظرو \n\n ولي الغاء الحظر اكتب \n رد علي رسالة الشخص المحظور \n حظر الغاء"
		}
	},

	langs: {
		vi: {
			noUserFound: "❌ Không tìm thấy người dùng nào có tên khớp với từ khóa: \"%1\" trong dữ liệu của bot",
			userFound: "🔎 Tìm thấy %1 người dùng có tên trùng với từ khóa \"%2\" trong dữ liệu của bot:\n%3",
			uidRequired: "Uid của người cần ban không được để trống, vui lòng nhập uid hoặc tag hoặc reply tin nhắn của 1 người theo cú pháp user ban <uid> <lý do>",
			userHasBanned: "Người dùng mang id [%1 | %2] đã bị cấm từ trước:\n» Lý do: %3\n» Thời gian: %4",
			userBanned: "Đã cấm người dùng mang id [%1 | %2] sử dụng bot.\n» Lý do: %3\n» Thời gian: %4",
			uidRequiredUnban: "Uid của người cần unban không được để trống",
			userNotBanned: "Hiện tại người dùng mang id [%1 | %2] không bị cấm sử dụng bot",
			userUnbanned: "Đã bỏ cấm người dùng mang id [%1 | %2], hiện tại người này có thể sử dụng bot"
		},
		en: {
			noUserFound: "❌ لم اجد شيء مثلو قاعدةبيانات:\"%1\"  ",
			userFound: "🔎 لقيت %1 عضو بإسم أو إسم مشابه \"%2\" في الداتا:\n%3",
			uidRequired: "ضع الآيدي أو رد على الشخص أو تاغ له",
			reasonRequired: "   اكتب سبب الحظر اخي  ",
			userHasBanned: "المستخدم [%1 | %2] تم حضره بسبب مقنع :\n» السبب: %3\n» ",
			userBanned: "صاحب الآيدي و الإسم [%1 | %2] محضور:\n» السبب: %3\n",
			uidRequiredUnban: "  احضر ال id يا غبي ",
			userNotBanned: "هذا [%1 | %2] شخص صالح ما تبند ",
			userUnbanned: "صاحب الآيدي [%1 | %2] خلاصخلاصلا تبكي سامحتك   "
		}
	},

	onStart: async function ({ args, usersData, message, event, prefix, getLang }) {
		const type = args[0];
		switch (type) {
			// find user
			case "إيجاد":
			case "-f":
			case "بحث":
			case "-s": {
				const allUser = await usersData.getAll();
				const keyWord = args.slice(1).join(" ");
				const result = allUser.filter(item => (item.name || "").toLowerCase().includes(keyWord.toLowerCase()));
				const msg = result.reduce((i, user) => i += `\n╭الإسم: ${user.name}\n╰الآيدي: ${user.userID}`, "");
				message.reply(result.length == 0 ? getLang("noUserFound", keyWord) : getLang("userFound", result.length, keyWord, msg));
				break;
			}
			// ban user
			case "هاذا":
			case "بان": {
				let uid, reason;
				if (event.type == "message_reply") {
					uid = event.messageReply.senderID;
					reason = args.slice(1).join(" ");
				}
				else if (Object.keys(event.mentions).length > 0) {
					const { mentions } = event;
					uid = Object.keys(mentions)[0];
					reason = args.slice(1).join(" ").replace(mentions[uid], "");
				}
				else if (args[1]) {
					uid = args[1];
					reason = args.slice(2).join(" ");
				}
				else return message.SyntaxError();

				if (!uid)
					return message.reply(getLang("uidRequired"));
				if (!reason)
					return message.reply(getLang("reasonRequired", prefix));
				reason = reason.replace(/\s+/g, ' ');

				const userData = await usersData.get(uid);
				const name = userData.name;
				const status = userData.banned.status;

				if (status)
					return message.reply(getLang("userHasBanned", uid, name, userData.banned.reason, userData.banned.date));
				const time = getTime("DD/MM/YYYY HH:mm:ss");
				await usersData.set(uid, {
					banned: {
						status: true,
						reason,
						date: time
					}
				});
				message.reply(getLang("userBanned", uid, name, reason, time));
				break;
			}
			// unban user
			case "الغاء":
			case "نوبان": {
				let uid;
				if (event.type == "message_reply") {
					uid = event.messageReply.senderID;
				}
				else if (Object.keys(event.mentions).length > 0) {
					const { mentions } = event;
					uid = Object.keys(mentions)[0];
				}
				else if (args[1]) {
					uid = args[1];
				}
				else
					return message.SyntaxError();
				if (!uid)
					return message.reply(getLang("uidRequiredUnban"));
				const userData = await usersData.get(uid);
				const name = userData.name;
				const status = userData.banned.status;
				if (!status)
					return message.reply(getLang("userNotBanned", uid, name));
				await usersData.set(uid, {
					banned: {}
				});
				message.reply(getLang("userUnbanned", uid, name));
				break;
			}
			default:
				return message.SyntaxError();
		}
	}
};