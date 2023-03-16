const axios = require('axios');

module.exports = {
	config: {
		name: "ترجم",
		aliases: ["ترجم"],
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Dịch văn bản",
			en: "ترجم نص"
		},
		longDescription: {
			vi: "Dịch văn bản sang ngôn ngữ mong muốn",
			en: "ترجم إلى أي لغة ✅"
		},
		category: "الخدمات",
		guide: {
			vi: "   {pn} <văn bản>: Dịch văn bản sang ngôn ngữ của box chat bạn hoặc ngôn ngữ mặc định của bot"
				+ "\n   {pn} <văn bản> -> <ISO 639-1>: Dịch văn bản sang ngôn ngữ mong muốn"
				+ "\n   hoặc có thể phản hồi 1 tin nhắn để dịch nội dung của tin nhắn đó"
				+ "\n   Ví dụ: {pn} hello -> vi"
				+ "\n   {pn} -r: [on | off]: Bật hoặc tắt chế độ tự động dịch tin nhắn khi có người thả cảm xúc vào tin nhắn"
				+ "\n   {pn} -r: set <emoji>: Đặt emoji để dịch tin nhắn trong nhóm chat của bạn",
			en: " رد علي رسالة بكلمة ترجمة ورمز اللغة \n مثال \n رد علي رسالة بي  ترجم ar لترجمتها للغةالعربية "
		}
	},

	langs: {
		vi: {
			translateTo: "🌐 Dịch từ %1 sang %2",
			invalidArgument: "❌ Sai cú pháp, vui lòng chọn on hoặc off",
			turnOnTransWhenReaction: "✅ Đã bật tính năng dịch tin nhắn khi thả cảm xúc, thử thả cảm xúc \"🌐\" vào tin nhắn bắt kỳ để dịch nó (không hỗ trợ tin nhắn của bot)\n Chỉ có thể dịch được những tin nhắn sau khi bật tính năng này",
			turnOffTransWhenReaction: "✅ Đã tắt tính năng dịch tin nhắn khi thả cảm xúc",
			inputEmoji: "🌀 Hãy thả cảm xúc vào tin nhắn này để đặt emoji đó làm emoji dịch tin nhắn",
			emojiSet: "✅ Đã đặt emoji dịch tin nhắn là %1"

		},
		en: {
			translateTo: "🌐 ترجم من %1 إلى %2",
			invalidArgument: "❌ فقط ضع on أو off",
			turnOnTransWhenReaction: "✅ تفعيل وضع الترجمة أثناء الرياكشن جرب ضع \"🌐\" لأحد الرسائل (لا يتضمن رسائل البوت)\n يترجم فقط الرسائل بعد تفعيل هذه الميزة",
			turnOffTransWhenReaction: "✅ إيقاف وضع الترجمة التفاعل",
			inputEmoji: "🌀 سوي تفاعل بالإموجي الذي تريد وضعه",
			emojiSet: "✅ تم وضع تفاعل . إذا وضع أحد لرسالة ستترجم %1"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang, commandName }) {
		if (["-r", "-react", "-reaction"].includes(args[0])) {
			if (args[1] == "ضع") {
				return message.reply(getLang("inputEmoji"), (err, info) =>
					global.GoatBot.onReaction.set(info.messageID, {
						type: "setEmoji",
						commandName,
						messageID: info.messageID,
						authorID: event.senderID
					})
				);
			}
			const isEnable = args[1] == "on" ? true : args[1] == "off" ? false : null;
			if (isEnable == null)
				return message.reply(getLang("invalidArgument"));
			await threadsData.set(event.threadID, isEnable, "data.translate.autoTranslateWhenReaction");
			return message.reply(isEnable ? getLang("turnOnTransWhenReaction") : getLang("turnOffTransWhenReaction"));
		}
		const { body = "" } = event;
		let content;
		let langCodeTrans;
		const langOfThread = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;

		if (event.messageReply) {
			content = event.messageReply.body;
			const lastIndexSeparator = body.lastIndexOf(" -> ");
			if (lastIndexSeparator != -1 && body.length - lastIndexSeparator == 6)
				langCodeTrans = body.slice(lastIndexSeparator + 4);
			else if ((args[0] || "").match(/\w{2}/))
				langCodeTrans = args[0].match(/\w{2}/)[0];
			else
				langCodeTrans = langOfThread;
		}
		else {
			content = event.body;
			const lastIndexSeparator = content.lastIndexOf(" -> ");
			if (lastIndexSeparator != -1 && content.length - lastIndexSeparator == 6) {
				langCodeTrans = content.slice(lastIndexSeparator + 4);
				content = content.slice(0, lastIndexSeparator);
			}
			else
				langCodeTrans = langOfThread;
		}

		if (!content)
			return message.SyntaxError();
		translateAndSendMessage(content, langCodeTrans, message, getLang);
	},

	onChat: async ({ event, threadsData }) => {
		if (!await threadsData.get(event.threadID, "data.translate.autoTranslateWhenReaction"))
			return;
		global.GoatBot.onReaction.set(event.messageID, {
			commandName: 'translate',
			messageID: event.messageID,
			body: event.body,
			type: "translate"
		});
	},

	onReaction: async ({ message, Reaction, event, threadsData, getLang }) => {
		switch (Reaction.type) {
			case "setEmoji": {
				if (event.userID != Reaction.authorID)
					return;
				const emoji = event.reaction;
				if (!emoji)
					return;
				await threadsData.set(event.threadID, emoji, "data.translate.emojiTranslate");
				return message.reply(getLang("emojiSet", emoji), () => message.unsend(Reaction.messageID));
			}
			case "translate": {
				const emojiTrans = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || "🌐";
				if (event.reaction == emojiTrans) {
					const langCodeTrans = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
					const content = Reaction.body;
					Reaction.delete();
					translateAndSendMessage(content, langCodeTrans, message, getLang);
				}
			}
		}
	}
};

async function translate(text, langCode) {
	const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
	return {
		text: res.data[0].map(item => item[0]).join(''),
		lang: res.data[2]
	};
}

async function translateAndSendMessage(content, langCodeTrans, message, getLang) {
	const { text, lang } = await translate(content, langCodeTrans);
	return message.reply(text + '\n\n' + getLang("translateTo", lang, langCodeTrans));
}