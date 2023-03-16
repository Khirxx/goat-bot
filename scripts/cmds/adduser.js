const { findUid } = global.utils;

module.exports = {
	config: {
		name: "اضف",
		version: "1.2",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		shortDescription: {
			vi: "Thêm thành viên vào box chat",
			en: "اضف شخص لجروب "
		},
		longDescription: {
			vi: "Thêm thành viên vào box chat của bạn",
			en: "إضافة المستخدم إلى مربع الدردشة الخاصة بك"
		},
		category: "box chat",
		guide: {
			en: " اضف ورابط الشخص او ايدي الخاص به"
		}
	},

	langs: {
		vi: {
			alreadyInGroup: "Đã có trong nhóm",
			successAdd: "- Đã thêm thành công %1 thành viên vào nhóm",
			failedAdd: "- Không thể thêm %1 thành viên vào nhóm",
			approve: "- Đã thêm %1 thành viên vào danh sách phê duyệt"
		},
		en: {
			alreadyInGroup: "بالفعل في المجموعة",
			successAdd: "- تمت إضافة 1% أعضاء إلى المجموعة بنجاح",
			failedAdd: "- فشلت إضافة1% أعضاء إلى المجموعة",
			approve: "- تمت إضافة1 %  أعضاء إلى قائمة القبول"
		}
	},

	onStart: async function ({ message, api, event, args, threadsData, getLang }) {
		const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
		const success = [{
			type: "success",
			uids: []
		}, {
			type: "waitApproval",
			uids: []
		}];
		const failed = [];

		function checkErrorAndPush(messageError, item) {
			const findType = failed.find(error => error.type == messageError);
			if (findType)
				findType.uids.push(item);
			else
				failed.push({
					type: messageError,
					uids: [item]
				});
		}

		for (const item of args) {
			let uid;
			if (isNaN(item)) {
				try {
					uid = await findUid(item);
				}
				catch (err) {
					checkErrorAndPush(err.message, item);
					continue;
				}
			}
			else
				uid = item;

			if (members.some(m => m.userID == uid)?.inGroup) {
				checkErrorAndPush(getLang("alreadyInGroup"), item);
			}
			else {
				try {
					await api.addUserToGroup(uid, event.threadID);
					const botID = api.getCurrentUserID();
					if (approvalMode === true && !adminIDs.includes(botID))
						success[1].uids.push(uid);
					else
						success[0].uids.push(uid);
				}
				catch (err) {
					checkErrorAndPush(err.errorDescription, item);
				}
			}
		}

		const lengthUserSuccess = success[0].uids.length;
		const lengthUserWaitApproval = success[1].uids.length;
		const lengthUserError = failed.length;

		let msg = "";
		if (lengthUserSuccess)
			msg += `${getLang("successAdd", lengthUserSuccess)}\n`;
		if (lengthUserWaitApproval)
			msg += `${getLang("approve", lengthUserWaitApproval)}\n`;
		if (lengthUserError)
			msg += `${getLang("failedAdd")} ${failed.reduce((a, b) => a += `\n    + ${b.uids.join('; ')}: ${b.type}`, "")}`;
		await message.reply(msg);
	}
};
