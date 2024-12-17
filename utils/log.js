const chalk = require('chalk');
const fs = require('fs');
const chalkAnimation = require('chalkercli');
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

function getRandomColor() {
	const arrayColor = ['blue', 'yellow', 'green', 'red', 'magenta', 'yellowBright', 'blueBright', 'magentaBright'];
	return chalk[arrayColor[Math.floor(Math.random() * arrayColor.length)]];
}

module.exports = (data, option) => {
	const color_one = getRandomColor();
	const color_two = getRandomColor();
	switch (option) {
		case "warn":
			console.log(getRandomColor()(`[ ${config.BOTNAME} ] » `) + data);
			break;
		case "error":
			console.log(getRandomColor()(`[ ${config.BOTNAME} ] » `) + data);
			break;
		case "load":
			console.log(color_one(`[ ${config.BOTNAME} User New ]`) + color_two(data));
			break;
		default:
			console.log(color_one(`${option} » `) + color_two(data));
			break;
	}
}

module.exports.loader = (data, option) => {
	const color_one = getRandomColor();
	const color_two = getRandomColor();
	switch (option) {
		case "warn":
			console.log(getRandomColor()(`[ ${config.BOTNAME} ] » `) + data);
			break;
		case "error":
			console.log(getRandomColor()(`[ ${config.BOTNAME} ] » `) + data);
			break;
		default:
			console.log(color_one(`[ ${config.BOTNAME} ] » `) + color_two(data));
			break;
	} 
} 

module.exports.banner = (data) => {
	const color = getRandomColor();
	console.log(color(data));
}