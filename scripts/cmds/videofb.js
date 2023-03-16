const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");

module.exports = {
	config: {
		name: "فايسبوك",
		version: "1.1",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Tải video từ facebook",
			en: " تحميل من الفايسبوك  "
		},
		longDescription: {
			vi: "Tải video/story từ facebook (công khai)",
			en: "تحميل ستوريات و فيديوهات عامة من الفايسبوك"
		},
		category: "الخدمات",
		guide: {
			en: " [فايسبوك [رابط"
		}
	},

	langs: {
		vi: {
			missingUrl: "Vui lòng nhập url video/story facebook (công khai) bạn muốn tải về",
			error: "Đã xảy ra lỗi khi tải video",
			downloading: "Đang tiến hành tải video cho bạn",
			tooLarge: "Rất tiếc không thể tải video cho bạn vì dung lượng lớn hơn 83MB"
		},
		en: {
			missingUrl: "يبدو ان الرابط تالف او ان الرابط لشخص قام بقفل حسابو الشخصي احضر رابط مختلف ",
			error:"حدث خطأ اعد المحاولة  ",
			downloading: "انتظر قليلا جاري تحميل الفديو...",
			tooLarge: "انا مو واي فاي ابوك عشان احملك فديو 100 ميجة 😒"
		}
	},

	onStart: async function ({ args, message, getLang }) {
		if (!args[0])
			return message.reply(getLang("missingUrl"));
		const response = await fbDownloader(args[0]);
		if (response.success === false)
			return message.reply(getLang("error"));

		let success = false;
		const msgSend = message.reply(getLang("downloading"));

		for (const item of response.download) {
			const res = await axios({
				url: item.url,
				responseType: 'stream'
			});
			if (res.headers['content-length'] > 87031808)
				continue;
			res.data.path = global.utils.randomString(10) + '.mp4';
			message.reply({
				attachment: res.data
			}, async () => message.unsend((await msgSend).messageID));
			success = true;
			break;
		}

		if (!success) {
			message.unsend((await msgSend).messageID);
			return message.reply(getLang("tooLarge"));
		}
	}
};


async function fbDownloader(url) {
	try {
		const response1 = await axios.get("https://fdownloader.net");
		const k_exp = response1.data.split('k_exp="')[1].split('"')[0];
		const k_token = response1.data.split('k_token="')[1].split('"')[0];
		const response = await axios({
			method: 'POST',
			url: 'https://fdownloader.net/api/ajaxSearch',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			data: qs.stringify({
				q: url,
				k_exp,
				k_token,
				v: 'v2'
			})
		});

		let html;
		const evalCode = response.data.data.replace('return decodeURIComponent', 'html = decodeURIComponent');
		eval(evalCode);
		html = html.split('innerHTML = "')[1].split('";\n')[0].replace(/\\"/g, '"');

		const $ = cheerio.load(html);
		const download = [];

		$("#fbdownloader").find("table").find("tbody").find("tr").each(function (i, elem) {
			const trElement = $(elem);
			const tds = trElement.children();
			const quality = $(tds[0]).text().trim();
			const url = $(tds[2]).children("a").attr("href");
			
			if (url != undefined) {
				download.push({
					quality,
					url
				});
			}
		});

		return {
			success: true,
			video_length: $("div.clearfix > p").text().trim(),
			download
		};
	}
	catch (err) {
		return {
			success: false
		};
	}
}
