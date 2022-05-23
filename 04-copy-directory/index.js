const fs = require('fs');
const path = require('path');

fs.promises.mkdir(path.join(__dirname,'files-copy'),{recursive: true})
fs.promises.readdir(path.join(__dirname,'files'),{withFileTypes: true})
	.then((files) => {
		for (const file of files){
			if(file.isFile()){
				fs.access(path.join(__dirname,'files-copy',file.name),fs.constants.F_OK,(err)=>{
					if(err){
						fs.copyFile(path.join(__dirname,'files',file.name),path.join(__dirname,'files-copy',file.name),(err)=>{
							if(err){
								console.log(err);
							}
							console.log(`${file.name} copied`);
						});
					}
				})
			}
		}
	})
	.catch(err => {
		console.error(err);
	}

);
fs.promises.readdir(path.join(__dirname,'files-copy'),{withFileTypes: true})
	.then((files) => {
		for (const file of files){
			if(file.isFile()){
				fs.access(path.join(__dirname,'files',file.name),fs.constants.F_OK,(err)=>{
					if(err){
						fs.unlink( path.join(__dirname,'files-copy',file.name) , err => {
							if(err) throw err; // не удалось удалить файл
							console.log('Файл успешно удалён');
						 });
					}
				})
			}
			console.log(file);
		}
	})
	.catch(err => {
		console.error(err);
	}

);
