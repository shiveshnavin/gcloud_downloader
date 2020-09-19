const { google } = require('googleapis');
const credentials = JSON.parse(process.env.CREDS);
var express=require('express')
var app=express()

const scopes = [
  'https://www.googleapis.com/auth/drive'
];
const auth = new google.auth.JWT(
  credentials.client_email, null,
  credentials.private_key, scopes
);
const drive = google.drive({ version: "v3", auth });
var fs=require('fs');
var dest = fs.createWriteStream('./FILE_NAME.extension');




app.get('/', (req, response) => {
	var fileid = req.query.fileId
	if(fileid){
		
		drive.files.get({fileId: fileid, alt: 'media'}, {responseType: 'stream'},
		function(err, res){
		   res.data
		   .on('end', () => {
			  console.log('Done');
		   })
		   .on('error', err => {
			  console.log('Error', err);
		   })
		   .pipe(response);
		});
		return;
	}
	
  response.send('Please pass fileId as GET param')
})

app.listen(process.env.PORT || 8080,function(){
    console.log('Server Started');
})
