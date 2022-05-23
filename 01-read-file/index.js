
const fs = require('fs');
const path = require('path');



let readAbleStream=fs.createReadStream(path.resolve(__dirname, 'text.txt'),'utf-8');
readAbleStream.on('data',(chunk)=>{
	console.log(chunk);
});

