const fs = require('fs');
const path = require('path');


let fn='';
let fe='';
let fw='';
function curName(name){
	fileName=name.split('.')[0];
	return fileName
}
fs.promises.readdir(path.join(__dirname,'secret-folder'),{withFileTypes: true})
	.then((files) => {
		for (const file of files){
			if(file.isFile()){
				fs.stat(path.join(__dirname,'secret-folder',file.name),(err,stat)=>{
					if(err){
						console.log(err);
					}
					fn=curName(file.name);
					fe=path.extname(file.name)
					fw=stat.size
					console.log(`${fn} - ${fe} - ${fw} bytes`);
				});
			}
		}
	})
	.catch(err => {
		console.error(err);
	}

);