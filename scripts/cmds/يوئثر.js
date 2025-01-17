const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "يوئثر",
		version: "1.1",
		author: "NIB",
		countDown: 5,
		role: 0,
		shortDescription: " تئثير علي الصور",
		longDescription: "تئثير علي الصور",
		category: "image",
		guide: {
			vi: "{pn} [@tag | để trống]",
			en: "{pn} وتاغ @ لشخص "
		}
	},

	onStart: async function ({ event, message, usersData }) {
		const uid = Object.keys(event.mentions)[0]
    if(!uid) return message.reply("Mention someone")
		const avatarURL = await usersData.getAvatarUrl(uid);
		const img = await new DIG.Affect().getImage(avatarURL);
		const pathSave = `${__dirname}/tmp/${uid}_Trash.png`;
		fs.writeFileSync(pathSave, Buffer.from(img));
		message.reply({
			attachment: fs.createReadStream(pathSave)
		}, () => fs.unlinkSync(pathSave));
	}
};
