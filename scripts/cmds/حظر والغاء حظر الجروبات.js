const { getTime } = global.utils;

module.exports = {
	config: {
		name: "مجموعة",
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Quản lý các nhóm chat",
			en: "حظر المجموعات و فك الحظر"
		},
		longDescription: {
			vi: "Quản lý các nhóm chat trong hệ thống bot",
			en: "إدارة المجموعات"
		},
		category: "المطور",
		guide: {
			vi: "   مجموعة [إيجاد | -f | بحث | -s] <tên cần tìm>: tìm kiếm nhóm chat trong dữ liệu bot bằng tên"
				+ "\n   {pn} [find | -f | search | -s] [-j | joined] <tên cần tìm>: tìm kiếm nhóm chat trong dữ liệu mà bot còn tham gia bằng tên"
				+ "\n   {pn} [ban | -b] [<tid> | để trống] <reason>: dùng để cấm nhóm mang id <tid> hoặc nhóm hiện tại sử dụng bot"
				+ "\n   Ví dụ:"
				+ "\n    {pn} ban 3950898668362484 spam bot"
				+ "\n    {pn} ban spam quá nhiều"
				+ "\n\n   {pn} unban [<tid> | để trống] để bỏ cấm nhóm mang id <tid> hoặc nhóm hiện tại"
				+ "\n   Ví dụ:"
				+ "\n    {pn} unban 3950898668362484"
				+ "\n    {pn} unban",
			en: " خاص بي المطور  \nيحظر الجروبات والغاء حظرها لا تزعج المطور كي لا يفشك ويحظرك "
		}
	},

	langs: {
		vi: {
			noPermission: "Bạn không có quyền sử dụng tính năng này",
			found: "🔎 Tìm thấy %1 nhóm trùng với từ khóa \"%2\" trong dữ liệu của bot:\n%3",
			notFound: "❌ Không tìm thấy nhóm nào có tên khớp với từ khoá: \"%1\" trong dữ liệu của bot",
			hasBanned: "Nhóm mang id [%1 | %2] đã bị cấm từ trước:\n» Lý do: %3\n» Thời gian: %4",
			banned: "Đã cấm nhóm mang id [%1 | %2] sử dụng bot.\n» Lý do: %3\n» Thời gian: %4",
			notBanned: "Hiện tại nhóm mang id [%1 | %2] không bị cấm sử dụng bot",
			unbanned: "Đã bỏ cấm nhóm mang tid [%1 | %2] sử dụng bot",
			missingReason: "Lý do cấm không được để trống",
			info: "» Box ID: %1\n» Tên: %2\n» Ngày tạo data: %3\n» Tổng thành viên: %4\n» Nam: %5 thành viên\n» Nữ: %6 thành viên\n» Tổng tin nhắn: %7%8"
		},
		en: {
			noPermission: "    هاذا امر المطور ملك الجحيم يا غبي اهرب قبل ما اخبرو 😒😂",
			found: "🔎 وجدت %1 مجموعة باسم او اسم مشابه \"%2\" في الداتا:\n%3",
			notFound: "❌ لا توجد: \"%1\" في الداتا",
			hasBanned: "مجموعة [%1 | %2] محضورة:\n» السبب: %3\n» الوقت: %4",
			banned: "حضر [%1 | %2] من البوت.\n» السبب: %3\n» الوقت: %4",
			notBanned: "المجموعة [%1 | %2] غير محضورة ✅",
			unbanned: "فك الحضر عن [%1 | %2] يمكنهم إستعمال البوت",
			missingReason: "السبب لا يجب ان يكون فارغ",
			info: "» آيدي المجموعة: %1\n» إسمها: %2\n» تاريخ وضع البيانات: %3\n» عدد أعضائهم: %4\n» الذكور: %5 فتى\n» البنات: %6 مزة\n» عدد رسائلهم: %7%8"
		}
	},

	onStart: async function ({ args, threadsData, message, role, event, getLang }) {
		const type = args[0];

		switch (type) {
			// find thread
			case "بحث":
			case "إيجاد":
			case "-f":
			case "-s": {
				if (role < 2)
					return message.reply(getLang("noPermission"));
				let allThread = await threadsData.getAll();
				let keyword = args.slice(1).join(" ");
				if (['-j', '-join'].includes(args[1])) {
					allThread = allThread.filter(thread => thread.isGroup);
					keyword = args.slice(2).join(" ");
				}
				const result = allThread.filter(item => item.threadID.length > 15 && (item.threadName || "").toLowerCase().includes(keyword.toLowerCase()));
				const resultText = result.reduce((i, thread) => i += `\n╭Name: ${thread.threadName}\n╰ID: ${thread.threadID}`, "");
				let msg = "";
				if (result.length > 0)
					msg += getLang("found", result.length, keyword, resultText);
				else
					msg += getLang("notFound", keyword);
				message.reply(msg);
				break;
			}
			// ban thread
			case "حظر":
			case "بان": {
				if (role < 2)
					return message.reply(getLang("noPermission"));
				let tid, reason;
				if (!isNaN(args[1])) {
					tid = args[1];
					reason = args.slice(2).join(" ");
				}
				else {
					tid = event.threadID;
					reason = args.slice(1).join(" ");
				}
				if (!tid)
					return message.SyntaxError();
				if (!reason)
					return message.reply(getLang("missingReason"));
				reason = reason.replace(/\s+/g, ' ');
				const threadData = await threadsData.get(tid);
				const name = threadData.threadName;
				const status = threadData.banned.status;

				if (status)
					return message.reply(getLang("hasBanned", tid, name, threadData.banned.reason, threadData.banned.date));
				const time = getTime("DD/MM/YYYY HH:mm:ss");
				await threadsData.set(tid, {
					banned: {
						status: true,
						reason,
						date: time
					}
				});
				return message.reply(getLang("banned", tid, name, reason, time));
			}
			// unban thread
			case "فك":
			case "نوبان": {
				if (role < 2)
					return message.reply(getLang("noPermission"));
				let tid;
				if (!isNaN(args[1]))
					tid = args[1];
				else
					tid = event.threadID;
				if (!tid)
					return message.SyntaxError();

				const threadData = await threadsData.get(tid);
				const name = threadData.threadName;
				const status = threadData.banned.status;

				if (!status)
					return message.reply(getLang("notBanned", tid, name));
				await threadsData.set(tid, {
					banned: {}
				});
				return message.reply(getLang("unbanned", tid, name));
			}
			// info thread
			case "معلومات":
			case "-i": {
				let tid;
				if (!isNaN(args[1]))
					tid = args[1];
				else
					tid = event.threadID;
				if (!tid)
					return message.SyntaxError();
				const threadData = await threadsData.get(tid);
				const createdDate = getTime(threadData.createdAt, "DD/MM/YYYY HH:mm:ss");
				const valuesMember = Object.values(threadData.members).filter(item => item.inGroup);
				const totalBoy = valuesMember.filter(item => item.gender == "MALE").length;
				const totalGirl = valuesMember.filter(item => item.gender == "FEMALE").length;
				const totalMessage = valuesMember.reduce((i, item) => i += item.count, 0);
				const infoBanned = threadData.banned.status ?
					`\n- Banned: ${threadData.banned.status}`
					+ `\n- Reason: ${threadData.banned.reason}`
					+ `\n- Time: ${threadData.banned.date}` :
					"";
				const msg = getLang("info", threadData.threadID, threadData.threadName, createdDate, valuesMember.length, totalBoy, totalGirl, totalMessage, infoBanned);
				return message.reply(msg);
			}
			default:
				return message.SyntaxError();
		}
	}
};