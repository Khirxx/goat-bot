const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
	config: {
		name: "ترحيب",
		aliases: ["دخول"],
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		shortDescription: {
			vi: "Chỉnh sửa nội dung tin nhắn chào mừng",
			en: "تعديل ترحيب البوت"
		},
		longDescription: {
			vi: "Chỉnh sửa nội dung tin nhắn chào mừng thành viên mới tham gia vào nhóm chat của bạn",
			en: "تعديل ما يقوله البوت عند دخول عضو جديد"
		},
		category: "تعديلات",
		guide: {
			vi: {
				body: "   {pn} text [<nội dung> | reset]: chỉnh sửa nội dung văn bản hoặc reset về mặc định, với những shortcut có sẵn:"
					+ "\n  + {userName}: tên của thành viên mới"
					+ "\n  + {userNameTag}: tên của thành viên mới (tag)"
					+ "\n  + {boxName}:  tên của nhóm chat"
					+ "\n  + {multiple}: bạn || các bạn"
					+ "\n  + {session}:  buổi trong ngày"
					+ "\n\n   Ví dụ:"
					+ "\n    {pn} text Hello {userName}, welcome to {boxName}, chúc {multiple} một ngày mới vui vẻ"
					+ "\n"
					+ "\n   Reply (phản hồi) hoặc gửi kèm một tin nhắn có file với nội dung {pn} file: để thêm tệp đính kèm vào tin nhắn chào mừng (ảnh, video, audio)"
					+ "\n\n   Ví dụ:"
					+ "\n    {pn} file reset: xóa gửi file",
				attachment: {
					[__dirname + "/assets/guide/setwelcome/guide1.png"]: "https://i.ibb.co/tp16L1d/guide1.png"
				}
			},
			en: {
				body: "اكتب ترحيب اضف والكلام اللي بدك البوت يقولو عند دخول شخص لجروبك\n\n مثال:- ترحيب اضف هلا نورت الجروب ",
				attachment: {
					[__dirname + "/assets/guide/setwelcome_1.png"]: "https://i.ibb.co/tp16L1d/guide1.png"
				}
			}
		}
	},

	langs: {
		vi: {
			turnedOn: "Đã bật chức năng chào mừng thành viên mới",
			turnedOff: "Đã tắt chức năng chào mừng thành viên mới",
			missingContent: "Vui lùng nhập nội dung tin nhắn",
			edited: "Đã chỉnh sửa nội dung tin nhắn chào mừng của nhóm bạn thành: %1",
			reseted: "Đã reset nội dung tin nhắn chào mừng",
			noFile: "Không có tệp đính kèm tin nhắn chào mừng nào để xóa",
			resetedFile: "Đã reset tệp đính kèm thành công",
			missingFile: "Hãy phản hồi tin nhắn này kèm file ảnh/video/audio",
			addedFile: "Đã thêm %1 tệp đính kèm vào tin nhắn chào mừng của nhóm bạn"
		},
		en: {
			turnedOn: "تفعيل نص الترحيب✅",
			turnedOff: "إيقاف الترحيب ❌",
			missingContent: "أدخل النص مع الأمر ❌",
			edited: "تعديل الترحيب إلى: %1",
			reseted: "حذف ووضع الأصلي ✅",
			noFile: "مافي ملحقات مع النص كالصور ❌",
			resetedFile: "حذف الصور او المقاطع الصوتية من الترحيب ❌",
			missingFile: "رد بهذه الرسالة على صورة او مقطع صوتي تريد وضعه مع الترحيب",
			addedFile: "تم اضافة %1 مرفق مع نص الترحيب ✅"
		}
	},

	onStart: async function ({ args, threadsData, message, event, commandName, getLang }) {
		const { threadID, senderID, body } = event;
		const { data, settings } = await threadsData.get(threadID);

		switch (args[0]) {
			case "اضف": {
				if (!args[1])
					return message.reply(getLang("missingContent"));
				else if (args[1] == "حذف")
					delete data.welcomeMessage;
				else
					data.welcomeMessage = body.slice(body.indexOf(args[0]) + args[0].length).trim();
				await threadsData.set(threadID, {
					data
				});
				message.reply(data.welcomeMessage ? getLang("edited", data.welcomeMessage) : getLang("reseted"));
				break;
			}
			case "مجلد": {
				if (args[1] == "حذف") {
					const { welcomeAttachment } = data;
					if (!welcomeAttachment)
						return message.reply(getLang("noFile"));
					try {
						await Promise.all(data.welcomeAttachment.map(fileId => drive.deleteFile(fileId)));
						delete data.welcomeAttachment;
					}
					catch (e) { }
					await threadsData.set(threadID, {
						data
					});
					message.reply(getLang("resetedFile"));
				}
				else if (event.attachments.length == 0 && (!event.messageReply || event.messageReply.attachments.length == 0))
					return message.reply(getLang("missingFile"), (err, info) => {
						global.GoatBot.onReply.set(info.messageID, {
							messageID: info.messageID,
							author: senderID,
							commandName
						});
					});
				else {
					saveChanges(message, event, threadID, senderID, threadsData, getLang);
				}
				break;
			}
			case "on":
			case "off": {
				settings.sendWelcomeMessage = args[0] == "on";
				await threadsData.set(threadID, { settings });
				message.reply(settings.sendWelcomeMessage ? getLang("turnedOn") : getLang("turnedOff"));
				break;
			}
			default:
				message.SyntaxError();
				break;
		}
	},

	onReply: async function ({ event, Reply, message, threadsData, getLang }) {
		const { threadID, senderID } = event;
		if (senderID != Reply.author)
			return;

		if (event.attachments.length == 0 && (!event.messageReply || event.messageReply.attachments.length == 0))
			return message.reply(getLang("missingFile"));
		saveChanges(message, event, threadID, senderID, threadsData, getLang);
	}
};

async function saveChanges(message, event, threadID, senderID, threadsData, getLang) {
	const { data } = await threadsData.get(threadID);
	const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])].filter(item => ["photo", 'png', "animated_image", "video", "audio"].includes(item.type));
	if (!data.welcomeAttachment)
		data.welcomeAttachment = [];

	for (const attachment of attachments) {
		const { url } = attachment;
		const ext = getExtFromUrl(url);
		const fileName = `${getTime()}.${ext}`;
		const infoFile = await drive.uploadFile(`setwelcome_${threadID}_${senderID}_${fileName}`, await getStreamFromURL(url));
		data.welcomeAttachment.push(infoFile.id);
	}
	await threadsData.set(threadID, {
		data
	});
	message.reply(getLang("addedFile", attachments.length));
}
