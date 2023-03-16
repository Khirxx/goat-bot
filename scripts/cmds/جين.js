const canvas = require('canvas');
const axios = require('axios');

module.exports = {
  config: {
    name: 'نار', 
    aliases: ['حراري'], 
    version: '1.0',
    author: 'ChatGPT', 
    countDown: 5,
    role: 0,
    shortDescription: 'تحويل النص إلى صورة حرارية', 
    longDescription: '', 
    category: 'صور', 
    guide: '{prefix}thermal <النص>'
   }, 

   onStart: async function ({ api,event, message, args, clientID }) {
    const prompt = args.join(' ');
    if (!prompt) {
      return message.reply('من فضلك، قم بإدخال النص الذي تريد تحويله إلى صورة حرارية');
    }
    try {
      const canvas1 = canvas.createCanvas(500, 500);
      const ctx = canvas1.getContext('2d');
      const res = await axios.get(`https://wt-7862f5d5ef05e5bfb7be8d785a9126af-0.sandbox.auth0-extend.com/thermal-text-image?text=${prompt}&width=500&height=500&fontSize=60&fontWeight=bold&fontColor=white&backgroundColor=black`);

      const image = await canvas.loadImage(res.data);
      ctx.drawImage(image, 0, 0, canvas1.width, canvas1.height);

      const buffer = canvas1.toBuffer('image/png');
      const stream = await global.utils.getStreamFromBuffer(buffer, 'thermal.png');
      api.sendMessage({
        attachment: stream,
        body: `ها هي صورتك الحرارية :`
      }, event.threadID, () => global.utils.fs.unlinkSync(stream.path));
    } catch (error) {
      console.log(error);
      return message.reply('حدث خطأ ما، يرجى المحاولة مرة أخرى');
    }
  },
};

