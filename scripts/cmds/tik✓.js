const axios = require("axios");
const qs = require("qs");
const cheerio = require("cheerio");
const { getStreamFromURL, shortenURL, randomString } = global.utils;

module.exports = {
	config: {
		name: "تيكتوك",
		aliases: ["تيك"],
		version: "1.8",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: "تحميل اي شي من تيك توك بدون العلامة المائية ✅",
		longDescription: {
			vi: "Tải video/slide (image), audio từ link tiktok",
			en: "كل ما يتعلق بتحميلات التيك توك "
		},
		category: "الخدمات",
		guide: {
			vi: "   {pn} [video|-v|v] <url>: dùng để tải video/slide (image) từ link tiktok."
				+ "\n   {pn} [audio|-a|a] <url>: dùng để tải audio từ link tiktok",
			en: " استخدم الامر اذا كنت تريد تنزيل فديوهات التيك توك دون علامة مائية \n\n اكتب تيكتوك فيديو والرابط لتنزيل الفديوو دون علامة مائية \n\n تيكتوك اغنية لتنزيل اغاني من رابط التيك توك \n\n اسرق فديوهات التيك توك وانشرها في جروبي اتفقنة 🤧😌😌😉😉😉"
		}
	},

	langs: {
		vi: {
			invalidUrl: "⚠️ Vui lòng nhập url tiktok hợp lệ",
			downloadingVideo: "📥 Đang tải video: %1...",
			downloadedSlide: "✅ Đã tải slide: %1\n%2",
			downloadedVideo: "✅ Đã tải video: %1\n🔗 Url Download: %2",
			downloadingAudio: "📥 Đang tải audio: %1...",
			downloadedAudio: "✅ Đã tải audio: %1",
			errorOccurred: "❌ Đã xảy ra lỗi:\n\n%1",
			tryAgain: "❌ Đã xảy ra lỗi, vui lòng thử lại sau"
		},
		en: {
			invalidUrl: "⚠️ أدخل رابط صحيح تيك توك فقط",
			downloadingVideo: "📥 أصبر جاري تحميل: %1...",
			downloadedSlide: "✅ جاري تحميل .. : %1\n%2",
			downloadedVideo: "✅ تم تحميل فيديوهات: %1\n🔗 رابط التحميل: %2",
			downloadingAudio: "📥 جاري تحميل الصوت: %1...",
			downloadedAudio: "✅ تم تحميل صوت: %1",
			errorOccurred: "❌حدث خطأ ❌:\n\n%1",
			tryAgain: "❌ حاول لاحقا لو سمحت "
		}
	},

	onStart: async function ({ args, message, getLang }) {
		const messageErrorInvalidUrl = '  رابط تالف استخدم رابط مختلف';

		switch (args[0]) {
			case "فيديوا":
			case "-v":
			case "v": {
				if (!(args[1] || "").trim().match(/^http(s|):\/\/.*(tiktok)\.com.*\/.*$/gi))
					return message.reply(getLang("invalidUrl"));
				const data = await query(args[1]);
				if (data.status == 'error') {
					if (data.message == messageErrorInvalidUrl)
						return message.reply(getLang("invalidUrl"));
					else
						return message.reply(getLang("errorOccurred"), JSON.stringify(data, null, 2));
				}

				const msgSend = message.reply(getLang("downloadingVideo", data.title));
				const linksNoWatermark = data.downloadUrls;
				if (!linksNoWatermark)
					return message.reply(getLang("tryAgain"));

				if (Array.isArray(linksNoWatermark)) {
					console.log(linksNoWatermark);
					const allStreamImage = await Promise.all(linksNoWatermark.map(link => getStreamFromURL(link, `${randomString(10)}.jpg`)));
					const allImageShortUrl = await Promise.all(linksNoWatermark.map((link, index) => shortenURL(link)
						.then(shortUrl => `${index + 1}: ${shortUrl}`)
					));
					message.reply({
						body: getLang("downloadedSlide", data.title, allImageShortUrl.join('\n')),
						attachment: allStreamImage
					}, async () => message.unsend((await msgSend).messageID));
					return;
				}
				const streamFile = await getStreamFromURL(linksNoWatermark, 'video.mp4');
				message.reply({
					body: getLang("downloadedVideo", data.title, await shortenURL(linksNoWatermark)),
					attachment: streamFile
				}, async () => message.unsend((await msgSend).messageID));
				break;
			}
			case "أغنية":
			case "a":
			case "-a": {
				if (!(args[1] || "").trim().match(/^http(s|):\/\/.*(tiktok)\.com.*\/.*$/gi))
					return message.reply(getLang("invalidUrl"));
				const dataAudio = await query(args[1], true);
				if (dataAudio.status == 'error') {
					if (dataAudio.message == messageErrorInvalidUrl)
						return message.reply(getLang("invalidUrl"));
					else
						return message.reply(dataAudio.message);
				}

				const urlAudio = dataAudio.downloadUrls;
				const audioName = dataAudio.title;
				if (!urlAudio)
					return message.reply(getLang("tryAgain"));
				const msgSendAudio = message.reply(getLang("downloadingAudio", audioName));

				const streamFileAudio = await getStreamFromURL(urlAudio, "audio.mp3");
				message.reply({
					body: getLang("downloadedAudio", audioName),
					attachment: streamFileAudio
				}, async () => message.unsend((await msgSendAudio).messageID));
				break;
			}
			default: {
				message.SyntaxError();
			}
		}
	}
};

async function query(url, isMp3 = false) {
	const res = await axios.get("https://ssstik.io/en");
	const tt = res.data.split(`"tt:'`)[1].split(`'"`)[0];
	const { data: result } = await axios({
		url: "https://ssstik.io/abc?url=dl",
		method: "POST",
		data: qs.stringify({
			id: url,
			locale: 'en',
			tt
		}),
		"headers": {
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.33"
		}
	});

	const $ = cheerio.load(result);
	if (result.includes('<div class="is-icon b-box warning">'))
		throw {
			status: "error",
			message: $('p').text()
		};

	const allUrls = $('.result_overlay_buttons > a');
	const format = {
		status: 'success',
		title: $('.maintext').text()
	};

	const slide = $(".slide");
	if (slide.length != 0) {
		const url = [];
		slide.each((index, element) => {
			url.push($(element).attr('href'));
		});
		format.downloadUrls = url;
		return format;
	}
	format.downloadUrls = $(allUrls[isMp3 ? allUrls.length - 1 : 0]).attr('href');
	return format;
}