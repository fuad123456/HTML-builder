const fs = require('fs');
const path = require('path');
let d=[]
fs.promises.readdir(path.join(__dirname,'styles'),{withFileTypes: true})
.then((files) => {
	for (const file of files){
		if(file.isFile()){
			fs.readFile(path.join(__dirname,'styles',file.name),'utf-8',(err,data)=>{
				if (path.extname(file.name)=='.css'){
					d.push(data)
					const stream = fs.createWriteStream(path.join(__dirname,'project-dist','bundle.css'));
					stream.write(d.join(''));
				}
			});
		}
	}
}
).catch(err => {
	console.error(err);
})
