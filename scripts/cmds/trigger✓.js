const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "هز",
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: "يصمم صورة متحركة تهتز",
		longDescription: "",
		category: "صور",
		guide: {
			vi: "{pn} [@tag | để trống]",
			en: "اكتب هز لنفسك \n وهز وتاغ لشخص اخر"
		}
	},

	onStart: async function ({ event, message, usersData }) {
		const uid = Object.keys(event.mentions)[0] || event.senderID;
		const avatarURL = await usersData.getAvatarUrl(uid);
		const img = await new DIG.Triggered().getImage(avatarURL);
		const pathSave = `${__dirname}/tmp/${uid}_Trigger.gif`;
		fs.writeFileSync(pathSave, Buffer.from(img));
		message.reply({
			attachment: fs.createReadStream(pathSave)
		}, () => fs.unlinkSync(pathSave));
	}
};