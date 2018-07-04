var express=require('express')
var app=express()
var hbs=require('express-handlebars')
var path=require('path')
var Downloader = require("filedownloader");
var fs = require("fs");
var firebase = require("firebase"); 
var admin = require('firebase-admin');
var array = require('array');

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



var data = fs.readFileSync('./public/downloads.json');
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
    update:function(id,status)
    {
       
        downloads.files[id].status=""+status.progress+"% @ "+status.speed+"";
        console.log(downloads.files[id].status)
        downloads.save();
    },
    delete:function(id)
    {
       
        //delete downloads.files[id].status;
        downloads.files[id]={}
        console.log('deleted '+id)
        downloads.save();
    }



};

try {
    
    
    downloads.files=JSON.parse(data).files;


  }
  catch(error) {
  
    console.log(error);
    downloads.files={};
    fs.copyFileSync('./public/downloads.json','./public/downloads_'+getFormattedTime()+'.json')
    fs.writeFileSync('./public/downloads.json',JSON.stringify(downloads));

}
  

   

 
fs.writeFileSync('./public/downloads.json',JSON.stringify(downloads));

 
  
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


    downloads.add(id,url);
    var Dl = new Downloader({
        url: url,
        saveas:id,
        saveto:"downloads"
    }).on("progress", function (progress){


        downloads.update(id,progress);
        if(progress.progress==100)
        {
            console.log("Download COmpete "+id);
        }


    });

    
};



app.get('/download',function(req,res){



    let response=res;
    let url=req.query.url;
    let del=req.query.del;
    try{
    if(url!==undefined)
    {
        addtoq(url);
         response.writeHead(302, {
            'Location': 'download' 
          });
          response.end();
          return;
    }
    if(del!==undefined){

        downloads.delete(del);
        response.writeHead(302, {
            'Location': 'download' 
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


})






app.listen('8080',function(){
    console.log('Server Started');
})


