const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "ضرب",
    aliases: ["تدمير"],
    version: "1.0",
    author: "zach",
    countDown: 5,
    role: 0,
    shortDescription: "ضرب للذكور فقط ممنوع للبنات لا تجربو",
    longDescription: "",
    category: "تسلية",
    guide: ""
  },

  onStart: async function ({ message, event, args }) {
    const mention = Object.keys(event.mentions);
    if (mention.length == 0) {
      message.reply("يجب تحديد شخص لضربه");
      return;
    }

    let one, two;
    if (mention.length == 1) {
      one = event.senderID;
      two = mention[0];
    } else {
      one = mention[1];
      two = mention[0];
    }

    try {
      const imagePath = await bal(one, two);
      await message.reply({
        body: "تم ضرب الشخص بنجاح!",
        attachment: fs.createReadStream(imagePath)
      });
    } catch (error) {
      console.error("Error while running command:", error);
      await message.reply("حدث خطأ أثناء تنفيذ الأمر");
    }
  }
};

async function bal(one, two) {
  const avatarOne = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const avatarTwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  const image = await jimp.read("https://imgur.com/qzvtLVd.png");
  image.resize(1080, 1320).composite(avatarOne.resize(170, 170), 200, 320).composite(avatarTwo.resize(170, 170), 610, 70);
  const imagePath = "abcd.png";
  await image.writeAsync(imagePath);
  return imagePath;
}
