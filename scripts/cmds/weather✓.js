const axios = require("axios");
const moment = require("moment-timezone");
const Canvas = require("canvas");
const fs = require("fs-extra");

Canvas.registerFont(
	__dirname + "/assets/font/BeVietnamPro-SemiBold.ttf", {
	family: "BeVietnamPro-SemiBold"
});
Canvas.registerFont(
	__dirname + "/assets/font/BeVietnamPro-Regular.ttf", {
	family: "BeVietnamPro-Regular"
});

function convertFtoC(F) {
	return Math.floor((F - 32) / 1.8);
}
function formatHours(hours) {
	return moment(hours).tz("Asia/Ho_Chi_Minh").format("HH[h]mm[p]");
}

module.exports = {
	config: {
		name: "الطقس",
		version: "1.0",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "dự báo thời tiết",
			en: "رؤية الطقس"
		},
		longDescription: {
			vi: "xem dự báo thời tiết hiện tại và 5 ngày sau",
			en: "رؤية الطقس الثابت خلال 5 أيام في منطقة "
		},
		category: "الخدمات",
		guide: {
			vi: "{pn} <địa điểm>",
			en: "اكتب طقس والمنطقة اذا لم يعمل اكتب اسم البلد بل اللغة الانجليزية "
		},
		envGlobal: {
			weatherApiKey: "d7e795ae6a0d44aaa8abb1a0a7ac19e4"
		}
	},

	langs: {
		vi: {
			syntaxError: "Vui lòng nhập địa điểm",
			notFound: "Không thể tìm thấy địa điểm: %1",
			error: "Đã xảy ra lỗi: %1",
			today: "Thời tiết hôm nay:\n%1\n🌡 Nhiệt độ thấp nhất - cao nhất %2°C - %3°C\n🌡 Nhiệt độ cảm nhận được %4°C - %5°C\n🌅 Mặt trời mọc %6\n🌄 Mặt trời lặn %7\n🌃 Mặt trăng mọc %8\n🏙️ Mặt trăng lặn %9\n🌞 Ban ngày: %10\n🌙 Ban đêm: %11"
		},
		en: {
			syntaxError: "أدخل المنطقة ",
			notFound: "لم أعثر على منطقة بإسم: %1",
			error: "حدث خطأ: %1",
			today: "طقس اليوم:\n%1\n🌡 أقل - أعلى درجة حرارة %2°C - %3°C\n🌡 الدرجة الثابتة %4°C - %5°C\n🌅 شروق الشمس %6\n🌄 غروبها %7\n🌃 ضهور لوفي قصدي القمر %8\n🏙️ عودة الصباح %9\n🌞 اليوم: %10\n🌙 الليل: %11"
		}
	},

	onStart: async function ({ args, message, envGlobal, getLang }) {
		const apikey = envGlobal.weatherApiKey;

		const area = args.join(" ");
		if (!area)
			return message.reply(getLang("syntaxError"));
		let areaKey, dataWeather;

		try {
			const response = (await axios.get(`https://api.accuweather.com/locations/v1/cities/search.json?q=${encodeURIComponent(area)}&apikey=${apikey}&language=vi-vn`)).data;
			if (response.length == 0)
				return message.reply(getLang("notFound", area));
			const data = response[0];
			areaKey = data.Key;
		}
		catch (err) {
			return message.reply(getLang("error", err.response.data.Message));
		}

		try {
			dataWeather = (await axios.get(`http://api.accuweather.com/forecasts/v1/daily/10day/${areaKey}?apikey=${apikey}&details=true&language=vi`)).data;
		}
		catch (err) {
			return message.reply(` حدث خطأ : ${err.response.data.Message}`);
		}

		const dataWeatherDaily = dataWeather.DailyForecasts;
		const dataWeatherToday = dataWeatherDaily[0];
		const msg = getLang("today", dataWeather.Headline.Text, convertFtoC(dataWeatherToday.Temperature.Minimum.Value), convertFtoC(dataWeatherToday.Temperature.Maximum.Value), convertFtoC(dataWeatherToday.RealFeelTemperature.Minimum.Value), convertFtoC(dataWeatherToday.RealFeelTemperature.Maximum.Value), formatHours(dataWeatherToday.Sun.Rise), formatHours(dataWeatherToday.Sun.Set), formatHours(dataWeatherToday.Moon.Rise), formatHours(dataWeatherToday.Moon.Set), dataWeatherToday.Day.LongPhrase, dataWeatherToday.Night.LongPhrase);

		const bg = await Canvas.loadImage(__dirname + "/assets/image/bgWeather.jpg");
		const { width, height } = bg;
		const canvas = Canvas.createCanvas(width, height);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(bg, 0, 0, width, height);
		let X = 100;
		ctx.fillStyle = "#ffffff";
		const data = dataWeather.DailyForecasts.slice(0, 7);
		for (const item of data) {
			const icon = await Canvas.loadImage("http://vortex.accuweather.com/adc2010/images/slate/icons/" + item.Day.Icon + ".svg");
			ctx.drawImage(icon, X, 210, 80, 80);

			ctx.font = "30px BeVietnamPro-SemiBold";
			const maxC = `${convertFtoC(item.Temperature.Maximum.Value)}°C `;
			ctx.fillText(maxC, X, 366);

			ctx.font = "30px BeVietnamPro-Regular";
			const minC = String(`${convertFtoC(item.Temperature.Minimum.Value)}°C`);
			const day = moment(item.Date).format("DD");
			ctx.fillText(minC, X, 445);
			ctx.fillText(day, X + 20, 140);

			X += 135;
		}

		const pathSaveImg = `${__dirname}/tmp/weather_${areaKey}.jpg`;
		fs.writeFileSync(pathSaveImg, canvas.toBuffer());

		return message.reply({
			body: msg,
			attachment: fs.createReadStream(pathSaveImg)
		}, () => fs.unlinkSync(pathSaveImg));

	}
};