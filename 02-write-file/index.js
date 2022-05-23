const fs = require('fs');
const path = require('path');
let d=''
let write;
let exit;
write=fs.createWriteStream(path.join(__dirname,'test.txt'));
process.stdin.on('data',data=>{
	exit=data.toString().trim()
	if(exit=='exit'){
		console.log('Спасибо достаточно!!! До свиданье!!');
		process.exit()
	}else{
		d=''
		d+=data.toString();
		write.write(d);
		// write.end();
	}
})
process.on('SIGINT', () => {
  console.log('Спасибо достаточно!!! До свиданье!!');
  process.exit();
});