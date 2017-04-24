// Pseudocode overview
// - for each folder
// 	- set `name` = folder name
// 	- set `counter` = 0
// 	- open info.txt
// 	- while `counter` >= 8
// 		- parse line
// 			- read # of URL duplicates
// 			- skip thumbnail
// 			- read initial URL
// 		- check HTTP status code of initial URL
// 			- 404 => read next URL line
// 			- repeat until valid image is found
// 			- if valid image is not found, log and continue
// 		- call Kairos enroll API endpoint with image URL
// 		- increment `counter` if successful

const fs = require('fs');
const path = require('path');

const colors = require('colors');
const minimist = require('minimist');
const bl = require('bl');
const request = require('request');

// remove 'node' and the script name from the arg list
var args = minimist(process.argv.slice(2), {
	default: {
		'path': './',
		'limit': 8,
		'info': 'info.txt'
	}
});

console.log('Constructed arguments as'.magenta, args);
		
function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory());
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

console.log('Gathering list of celebrities from path'.magenta, args.path.blue);
var celebrityList = getDirectories(args.path);
console.log('Found'.magenta, celebrityList.length.toString().blue, 'celebrities'.magenta);

// for (var i = 0; i < celebrityList.length; i++) {
for (var i = 0; i < 3; i++) {
	let currentPath = path.join(args.path, celebrityList[i]);
	let name = toTitleCase(celebrityList[i]);
	console.log('Processing celebrity'.magenta, name.blue);
	console.log('Resolved path as'.magenta, currentPath.blue)

	let filePath = path.join(currentPath, args.info);

	fs.createReadStream(filePath).pipe(bl(function(err, data) {
		let lines = data.toString().split('\n');
		let lineIndex = 0;
		let subjectImageCounter = 0;
		console.log('Examining'.magenta, args.info.blue, 'in'.magenta, currentPath.blue);

		// while (subjectImageCounter < args.limit) {
		while (subjectImageCounter < 1) {
			let s = lines[lineIndex].split('\t');
			let dups = s[0];
			let thumb = s[1];
			let url = s[2];
			let altUrls = [];
			lineIndex++;
			
			console.log(dups.toString().blue, 'alternate URLs detected'.magenta);
			for (var altUrlIndex = 0; altUrlIndex < dups; altUrlIndex++) {
				altUrls.push(lines[lineIndex + altUrlIndex].replace('\r', ''));
			}
			lineIndex += dups;

			console.log('Checking primary URL'.magenta, url.blue);
			request
				.get(url)
				.on('response', function(res) {
					console.log('Response', res);
				})
				.pipe(bl(function(err, data) {
					console.log('Error', err);
					console.log('Data', data.toString());
				}));
			// let r = hyperquest(url).pipe(bl(function(err, data) {
			// 	if (err !== null) {
			// 		console.log('Error while accessing'.yellow, url.blue);
			// 	} else {
			// 		console.log(data.toString());
			// 	}
			// }));

			subjectImageCounter++;
		}

	}));

}
