const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
	config: {
		name: "صورة", 
		aliases: ["صوره"], 
		version: "1.0.2", 
		author: "@ta33n", 
		role: 0,
		countDown: 5,
		shortDescription:{
			en: "بحث عن صور"}, 
		longDescription:{
			en:""}, 
		category: "البحث", 
		guide: {
			en: "{pn} <اسم الصورة>"
		}
	}, 

	onStart: async function({ api, event, args }) {
		const keySearch = args.join(" ");
    if(keySearch.includes("-") == false) return api.sendMessage('أدخل البيانات على الشكل الصحيح, مثلا: صورة Naruto - 5 (هذا الأخير هو عدد الصور)', event.threadID, event.messageID)
    const keySearchs = keySearch.substr(0, keySearch.indexOf('-'))
    const numberSearch = keySearch.split("-").pop() || 6
    const res = await axios.get(`https://api-dien.senthanh20055.repl.co/pinterest?search=${encodeURIComponent(keySearchs)}`);
    const data = res.data.data;
    var num = 0;
    var imgData = [];
    for (var i = 0; i < parseInt(numberSearch); i++) {
      let path = __dirname + `/cache/${num+=1}.jpg`;
      let getDown = (await axios.get(`${data[i]}`, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(path, Buffer.from(getDown, 'utf-8'));
      imgData.push(fs.createReadStream(__dirname + `/cache/${num}.jpg`));
    }
    api.sendMessage({
        attachment: imgData,
        body: 'تم العثور على النتائج التالية ل: '+ keySearchs
    }, event.threadID, event.messageID)
    for (let ii = 1; ii < parseInt(numberSearch); ii++) {
        fs.unlinkSync(__dirname + `/cache/${ii}.jpg`)
    }
}
};