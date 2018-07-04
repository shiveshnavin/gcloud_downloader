var express=require('express')
var app=express()
var hbs=require('express-handlebars')
var path=require('path')
var Downloader = require("filedownloader");
var fs = require("fs");
var firebase = require("firebase");
var array =  require("array");;
var admin = require('firebase-admin');

app.engine('hbs',hbs({
    extname:"hbs"
}))



app.set('view engine','hbs')
app.use(express.static(path.join(__dirname,'public')))

app.get('/',function(req,res){


    res.render('index',{

        head:"Hello World !",
        body:{
            main_para_head:"Hello There !",
            main_para:"This is an empty NodeJS and ExpressJS app with Handlebars . You can use it to quickly start building apps on top of it ."
            
        }

    })


})






var data = fs.readFileSync('./public/downloads.json');
var downloads={};

try {
    
    
    downloads=JSON.parse(data);


  }
  catch(error) {
  
    console.log(error);
    downloads={

        files:{}

    };
    fs.writeFileSync('./public/downloads.json',JSON.stringify(downloads));

}
  

   


downloads.files["aaaa"]={"name":"","download_url":"http"};
downloads.files["aaaa2"]={"name":"","download_url":"http"}; 
fs.writeFileSync('./public/downloads.json',JSON.stringify(downloads));

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
 
  
var serviceAccount = JSON.parse(fs.readFileSync('test-a0930-339963a3d1ac.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://test-a0930.firebaseio.com/',
  storageBucket: 'gs://test-a0930.appspot.com'
});
  
 
  var storage = admin.storage().bucket();


var addtoq=function(url)
{
    var filename = url.split('/').pop().split('#')[0].split('?')[0];
    filename = filename.replace(/[^A-Z0-9]+/ig, ".");
    let id=getFormattedTime()+'_'+filename;

    var Dl = new Downloader({
        url: "FILEURL",
        saveas:id,
        saveto:"downloads"
    }).on("progress", function (progress){
        console.log(progress); 
    });
};



app.get('/download',function(req,res){


    res.render('index')


})






app.listen('8080',function(){
    console.log('Server Started');
})


