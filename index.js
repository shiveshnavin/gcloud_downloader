var express=require('express')
var app=express()
var hbs=require('express-handlebars') 
var path=require('path')
var Downloader = require("filedownloader");
var fs = require("fs");
var array = require('array');

app.engine('hbs',hbs({
    extname:"hbs"
}))
var mAuth=undefined
var mDrive=undefined
var DOWNLOADS_DIR="downloads"

app.set('view engine','hbs')
app.use(express.static(path.join(__dirname,'public'))) 
app.use(function(req, res, next) {
    try{
    let str = req.get('User-Agent');
    if(str.indexOf("bot") > -1 || str.indexOf("Bot") > -1 || str.indexOf("BOT") > -1) {

        res.writeHead(403)
        res.end();
        return;
    }}catch(er)
    {

    }

    next();
  });

var getFormattedTime=function() {
    var today = new Date();
    var y = today.getFullYear();
    var m = today.getMonth();
    var d = today.getDate();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    return y + "_" + m + "_" + d + "_" + h + "_" + m + "_" + s;
}



var downloads={

    files:{},
    add:function(id,url){

        downloads.files[id]={
            status:"",
            date:new Date(),
            name:id,
            id:id,
            ourl:url,
            durl:""
        };
        console.log("added"+url);
    },
    save:function()
    {
        console.log("Saved");
        fs.writeFileSync('./public/downloads.json',JSON.stringify(downloads));
    },
    update_durl:function(id,durl)
    {
       
        downloads.files[id].durl=durl;
        console.log(downloads.files[id].durl)
        downloads.save();
    },
    update:function(id,status)
    {
       
        downloads.files[id].status=""+status.progress+"% @ "+status.speed+"";
        console.log(downloads.files[id].status)
        downloads.save();
    },
    update_status:function(id,status)
    {
       
        downloads.files[id].status=status;
        console.log(downloads.files[id].status)
        downloads.save();
    },
    delete:function(id)
    {
       
        
        delete downloads.files[id]
        console.log('deleted '+id)
        downloads.save();
            
        fs.unlink('./'+DOWNLOADS_DIR+'/'+id,function(err){
            if(err) return console.log(err);
            console.log('file deleted successfully');
        }); 

    }



};

try{
    var data = fs.readFileSync('./public/downloads.json');
    }catch(error){
        console.log("Missing downloads.json . Creating :-)");
        downloads.files={};
         fs.writeFileSync('./public/downloads.json',JSON.stringify(downloads));
    
    }


try {
    
    downloads.files=JSON.parse(data).files;
}
  catch(error) {
  
    console.log("Corrupt downloads.json . Creating New :-)");

   // console.log(error);
   downloads={}
    downloads.files={};
    fs.copyFileSync('./public/downloads.json','./public/downloads_'+getFormattedTime()+'.json')
    fs.writeFileSync('./public/downloads.json',JSON.stringify(downloads));

}
   
fs.writeFileSync('./public/downloads.json',JSON.stringify(downloads));


var addtoq=function(url)
{
    let filename = url.split('/').pop().split('#')[0].split('?')[0];
    filename = filename.replace(/[^A-Z0-9]+/ig, ".");
    let id=getFormattedTime()+'_'+filename;


    downloads.add(id,url);
    let Dl = new Downloader({
        url: url,
        saveas:id,
        saveto:DOWNLOADS_DIR
    }).on("progress", function (progress){


            try{
            downloads.update(id,progress);
            if(progress.progress==100)
            {
                console.log("Download Progress 100% "+id);
            }
            }catch(err)
            {
                console.log("Pausing Download ",id)
                Dl.pause()
                delete Dl
            }


    });
    Dl.on("end", function(){
        
        console.log('Uploading file to drive now  : ',id);
        uploadFile(id,id,'./'+DOWNLOADS_DIR+'/'+id)
         
     });

   
 
    
};

function start(req,res,loc)
{



    let response=res;
    let url=req.query.url;
    let del=req.query.del;
    try{
    if(url!==undefined)
    {
        addtoq(url);
         response.writeHead(302, {
            'Location': loc
          });
          response.end();
          return;
    }
    if(del!==undefined){

        downloads.delete(del);
        response.writeHead(302, {
            'Location': loc
          });
          response.end();
          return;

    }
    else{
        console.log("No new Download")
    }
}catch(err)
{

}
    var files=array();
    for(var attributename in downloads.files){
         console.log('found '+attributename+'   '+downloads.files[attributename])
        try{
         if(downloads.files[attributename].hasOwnProperty("name"))
             files.push(downloads.files[attributename]);
        }catch(err)
        {

        }

    }


    files.sort(function(a,b){
        return new Date(b.date) - new Date(a.date);
      });

/*
    files.sort(function(a, b){
        var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
        if (nameA > nameB) //sort string ascending
         return -1;
        if (nameA < nameB)
         return 1;
        return 0; //default return value (no sorting)
       });

*/
    res.render('index',{
        "files":files
    })

}
app.all('/',function(req,res){
   
    
    start(req,res,'/')


})
 
app.get('/download',function(req,res){


    start(req,res,'download')

})
 
 
//

app.listen('8080',function(){
    console.log('Server Started');
})



 
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), setAuth);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function setAuth(auth) {
  mAuth=auth
  const drive = google.drive({version: 'v3', auth});
  mDrive=drive
  
  console.log("!!!!! Google Drive Connected !!!!!")


}


function uploadFile(file_id,name,path)
{

    if(mDrive==undefined)
    {
        console.log("Drive is not connected yet !!")
        return
    }

    downloads.update_status(file_id,"Uploading...")
    let drive=mDrive;
    var fileMetadata = {
        'name': name
      };
      var media = {
        mimeType: '*/*',
        body: fs.createReadStream(path)
      };
      drive.files.create({
         resource: fileMetadata,
         media: media,
         fields: 'id'
      }, function(err, file) {
        if(err) {
          // Handle error
          console.log(err);
        } else {
          console.log('File Id: ',  (file.data.id));
          downloads.update_durl(file_id,'https://drive.google.com/file/d/'+file.data.id+'/view')
          downloads.update_status(file_id,"On Gdrive")

        }
      });
}