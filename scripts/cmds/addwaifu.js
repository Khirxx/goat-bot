const axios = require('axios');

module.exports = {
	config: {
		name: "حريم",
		aliases: ["addwaifu"],
		version: "1.0",
		author: "@tas33n",
		countDown: 5,
		role: 2,
		shortDescription: "إضافة waifu لبوت waifu الحريم",
		longDescription: "",
		category: "harem kings",
		guide: "{pn} عيون وايفو"
	},

	onStart: async function ({ message, args, event }) {
    const name = args.join(" ");
    let url = encodeURIComponent(event.messageReply.attachments[0].url)
    
		try {
			let res = await axios.get(`https://api.misfitsdev.xyz/harem/upload.php?uid=${event.senderID}&name=${name}&url=${url}`)
			let res2 = res.data

			const form = {
				body: res2.status.toString()
			};
			message.reply(form);
		} catch (e) {
			console.log(e)
			message.reply('🥺 خطأ ')
		}

	}
};
