const axios = require('axios');

module.exports = {
	config: {
		name: "شخصية",
		aliases: ["character"],
		version: "1.0",
		author: "@tas33n",
		countDown: 5,
		role: 0,
		shortDescription: "الحصول على بيانات الشخصية",
		longDescription: "البحث والحصول على معلومات شخصية",
		category: "anime",
		guide: "{pn} {{<اسم>}}"
	},

	onStart: async function ({ message, args }) {
		const name = args.join(" ");
		if (!name)
			return message.reply(`⚠️ | الرجاء إدخال اسم الشخصية!`);
		else {
			const BASE_URL = `https://api.safone.tech/anime/character?query=${name}`;
			try {
				let res = await axios.get(BASE_URL)


				let res2 = res.data
				let nm = res2.name.full + " " + res2.name.native
				let gen = res2.gender
				let ag = res2.age
				let heit = res2.height
				let anim = res2.media.edges[0].node.title.romaji + " 🇯🇵 " + res2.media.edges[0].node.title.native
				let desc = res2.description
				let img = res2.image.large
				const form = {
					body: `===「 Character Info 」===`
						+ `\n\n👤 الاسم: ${nm}`
						+ `\n🚻 جنس: ${gen}`
						+ `\n🗓️ عمر: ${ag}`
						+ `\n👖 ارتفاع: ${heit}`
						+ `\n\n📺 أنيمي مانغا: ${anim}`
						+ `\n\n🔉 وصف: ${desc}`

				};
				if (img)
					form.attachment = await global.utils.getStreamFromURL(img);
				message.reply(form);
			} catch (e) { message.reply(`🥺غير معثور عليه `) }

		}
	}
};
