const canvas = require("canvas");
const axios = require("axios");

module.exports = {
  config: {
    name: "تجميل", 
    aliases: ['تصميم1'], 
    version: "2.0",
    author: "Razihelx", 
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "نص إنجليزي الى صورة"
    }, 
    longDescription: {
      en: "تصميم "
    }, 
    category: "تصميم", 
    guide: {
      en: "{pn} <نص>"
    }
   }, 

    onStart: async function ({ api,event, message, args}) {

      const prompt = args.join(' ');
    if (!prompt) {
      return message.reply(`دخل نص!`);
    }
      const response = await axios.get(`https://api.reikomods.repl.co/textpro/demon?text=${prompt}`);

      let ImageUrl = response.data.result;

      const getImg = await global.utils.getStreamFromURL(ImageUrl, "image.png");

      api.sendMessage({
        attachment: getImg
      }, event.threadID, event.messageID);
}, 
};
