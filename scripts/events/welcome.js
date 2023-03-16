const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "welcome",
		version: "1.2",
		author: "NTKhang"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: `༽༺༺ تم التوصيل  ༻༻༼
         ✦✦✦✦✦✦✦✦✦✦✦
               ✧✧✧✧✧✧✧
تم توصيل بوت زكسل في جروبك 
☑️☑️☑️☑️☑️☑️☑️☑️☑️
بوت متكامل العاب وخدمان ومساعد
🎁🔁🔁🔁🔁😎📛📛
لا تزل الاعضاء بل البوت 
❌❌❌❌❌❌❌
حساب المطور:- 
https://www.facebook.com/profile.php?id=100065172561645


اذا تريد البوت في جروبك
 راسل المطو 





-----------------المعلومات----------------

☆☆☆☆البوت به 56 امر☆☆☆☆
☆☆☆المطور:-ملك الجحيم ☆☆☆
_____________________________

اذا ما فهمت طريقة عمل امر محدد
 ☆ اكتب شرح واسم الامر مثال☆
            ☆ شرح ترحيب ☆
☆☆☆☆☆☆☆☆☆☆☆☆☆☆


شكرا لكم لاضافة بوت زكسل لجروبك
           يسعدني ان اساعدك
 
 ༺༺༺༺༻༻༻༻`,
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `هلا {userName}.هذه مجموعة {boxName}\n`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some(item => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				const threadData = await threadsData.get(threadID);
				if (threadData.settings.sendWelcomeMessage == false)
					return;
				const threadName = threadData.threadName;
				const userName = [], mentions = [];
				let multiple = false;

				if (dataAddedParticipants.length > 1)
					multiple = true;
				for (const user of dataAddedParticipants) {
					userName.push(user.fullName);
					mentions.push({
						tag: user.fullName,
						id: user.userFbId
					});
				}
				// {userName}:   name of new member
				// {multiple}:   
				// {boxName}:    name of group
				// {threadName}: name of group
				// {session}:    session of day
				let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
				const form = {
					mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
				};
				welcomeMessage = welcomeMessage
					.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
					.replace(/\{boxName\}|\{threadName\}/g, threadName)
					.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
					.replace(/\{session\}/g, hours <= 10 ?
						getLang("session1") :
						hours <= 12 ?
							getLang("session2") :
							hours <= 18 ?
								getLang("session3") :
								getLang("session4")
					);

				form.body = welcomeMessage;

				if (threadData.data.welcomeAttachment) {
					const files = threadData.data.welcomeAttachment;
					const attachments = files.reduce((acc, file) => {
						acc.push(drive.getFile(file, "stream"));
						return acc;
					}, []);
					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}
				message.send(form);
			};
	}
};