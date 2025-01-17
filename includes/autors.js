const moment = require('moment-timezone');

module.exports = function () {
    setInterval(async () => {
        const thoiGianHienTai = moment.tz("Asia/Ho_Chi_Minh");

        const timeRestart = [
            { gio: 2, phut: 30, giay: 0 },
            { gio: 7, phut: 0, giay: 0 },
            { gio: 10, phut: 30, giay: 0 },
            { gio: 12, phut: 0, giay: 30 },
            { gio: 15, phut: 0, giay: 0 },
            { gio: 17, phut: 30, giay: 0 },
            { gio: 19, phut: 0, giay: 0 },
            { gio: 21, phut: 0, giay: 0 },
            { gio: 23, phut: 0, giay: 0 }
        ];

        for (const thoiDiem of timeRestart) {
            if (
                thoiGianHienTai.hour() === thoiDiem.gio &&
                thoiGianHienTai.minute() === thoiDiem.phut &&
                thoiGianHienTai.second() === thoiDiem.giay
            ) {
                process.exit(1);
            }
        }
    }, 1000);
};