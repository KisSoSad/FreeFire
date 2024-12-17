const fs = require('fs-extra');
const { readdirSync, statSync, unlinkSync, rmdirSync, createReadStream, writeFileSync, mkdirSync } = require('fs-extra');
const axios = require('axios');

function convertBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

async function bin(text) {
    const response = await axios.post('https://api.mocky.io/api/mock', {
        status: 200,
        content: text,
        content_type: 'text/plain',
        charset: 'UTF-8',
        secret: 'PhanHuuHuy',
        expiration: 'never',
    });
    return response.data.link;
}

function getTotalSizeText(bytes) {
    const totalSize = convertBytes(bytes);
    return `📌Tổng dung lượng File: ${totalSize}`;
}

function size_folder(folder = '') {
    let bytes = 0;

    try {
        const files = readdirSync(folder);
        for (let file of files) {
            let path = `${folder}/${file}`;
            let info = statSync(path);

            // Bỏ qua thư mục `node_modules` và không tính toán kích thước của thư mục con
            if (file === 'node_modules') {
                continue;
            }

            if (info.isDirectory()) {
                // Đệ quy để tính kích thước của các tệp trong thư mục con
                bytes += size_folder(path);
            } else {
                bytes += info.size;
            }
        }
    } catch (error) {
        console.error(`Error processing folder ${folder}: ${error.message}`);
    }

    return bytes;
}

function openFolder(api, event, folderPath) {
    try {
        const files = readdirSync(folderPath);
        let txt = '', count = 0;
        const array = [];
        let bytes_dir = 0;

        for (const file of files) {
            try {
                const dest = `${folderPath}/${file}`;
                const info = statSync(dest);

                if (file === 'node_modules') {
                    // Bỏ qua thư mục `node_modules`
                    continue;
                }

                if (info.isDirectory()) {
                    // Tính kích thước của thư mục con
                    info.size = size_folder(dest);
                } else {
                    info.size = info.size;
                }

                bytes_dir += info.size;
                txt += `${++count}. ${info.isFile() ? '📑' : info.isDirectory() ? '📂' : undefined} - ${file} (${convertBytes(info.size)})\n`;
                array.push({ dest, info });
            } catch (error) {
                console.error(`Error processing file ${folderPath}/${file}: ${error.message}`);
            }
        }

        txt += `\n${getTotalSizeText(bytes_dir)}\nReply [Open | Del | View | Send | Rename | Cre] + STT.`;
        api.sendMessage(txt, event.threadID, (err, data) => {
            if (err) {
                console.error(`Error sending message: ${err.message}`);
                return;
            }
            global.client.handleReply.push({
                name: 'file',
                messageID: data.messageID,
                author: event.senderID,
                data: array,
                directory: folderPath + '/',
            });
        });
    } catch (error) {
        console.error(`Error opening folder ${folderPath}: ${error.message}`);
    }
}

module.exports.config = {
    name: 'file',
    version: '1.1.3',
    hasPermssion: 2,
    credits: 'DC-Nam',
    description: 'Xem item trong folder, xóa, xem file',
    commandCategory: 'Tiện ích',
    usages: '[đường dẫn]',
    cooldowns: 2,
};

module.exports.run = async ({ api, event, args }) => {
    const permission = global.config.ADMINBOT[0];
    if (!permission.includes(event.senderID)) return api.sendMessage("Bạn không có quyền sử dụng lệnh này!", event.threadID, event.messageID);
    openFolder(api, event, process.cwd() + (!!args[0] ? args[0] : ''));
};

module.exports.handleReply = async ({ handleReply, api, event }) => {
    if (event.senderID != global.config.ADMINBOT[0]) return api.sendMessage(`Bạn không có quyền sử dụng lệnh này!`, event.threadID, event.messageID);
    switch (event.args[0].toLowerCase()) {
        case 'open':
            openFolder(api, event, handleReply.data[event.args[1] - 1].dest);
            break;
        case 'del': {
            let arrFile = [], fo, fi;
            for (const i of event.args.splice(1)) {
                const { dest, info } = handleReply.data[i - 1];
                const ext = dest.split('/').pop();
                if (info.isFile()) {
                    unlinkSync(dest);
                    arrFile.push(ext);
                    fi = 'file'; 
                } else if (info.isDirectory()) {
                    rmdirSync(dest, { recursive: true });
                    arrFile.push(ext);
                    fo = 'folder';
                }
            }
            api.sendMessage(`Đã xóa những ${!!fo && !!fi ? `${fo}, ${fi}` : !!fo ? fo : !!fi ? fi : null}:\n\n${arrFile.join(', ')}`, event.threadID, event.messageID);
        }
            break;
        case 'view': {
            const filePath = handleReply.data[event.args[1] - 1].dest;
            const stream = createReadStream(filePath);
            api.sendMessage({ attachment: stream }, event.threadID, (err, data) => {
                if (err) {
                    console.error(`Error sending file: ${err.message}`);
                    return;
                }
                global.client.handleReply.push({ name: 'file', messageID: data.messageID, author: event.senderID, data: handleReply.data });
            });
            break;
        }
        case 'send': {
            const fileContent = fs.readFileSync(handleReply.data[event.args[1] - 1].dest, 'utf8');
            const link = await bin(fileContent);
            api.sendMessage(link, event.threadID, event.messageID);
            break;
        }
        case 'rename': {
            const oldName = handleReply.data[event.args[1] - 1].dest;
            const newName = oldName.split('/').slice(0, -1).join('/') + '/' + event.args.slice(2).join(' ');
            fs.renameSync(oldName, newName);
            api.sendMessage(`Đã đổi tên thư mục từ ${oldName} thành ${newName}.`, event.threadID, event.messageID);
            break;
        }
        case 'cre': {
            const type = event.args[1]; // Loại tạo ra (file hoặc folder)
            const name = event.args.slice(2).join(' '); // Tên của tệp hoặc thư mục
            const path = handleReply.directory + name; // Đường dẫn tuyệt đối cho tệp hoặc thư mục mới

            try {
                if (type === 'file') {
                    writeFileSync(path, ''); // Tạo một tệp trống
                    api.sendMessage(`Đã tạo tệp ${name}.`, event.threadID, event.messageID);
                } else if (type === 'folder') {
                    mkdirSync(path); // Tạo một thư mục mới
                    api.sendMessage(`Đã tạo thư mục ${name}.`, event.threadID, event.messageID);
                } else {
                    api.sendMessage('Lựa chọn không hợp lệ vui lòng dùng cre folder hoặc cre file', event.threadID, event.messageID);
                }
            } catch (error) {
                api.sendMessage(`Đã xảy ra lỗi khi tạo ${type} ${name}: ${error.message}`, event.threadID, event.messageID);
            }
            break;
        }
        default:
            api.sendMessage('Reply [Open|Del|View|Send|Rename|Cre] + STT.', event.threadID, event.messageID);
    }
};
