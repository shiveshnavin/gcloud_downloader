# Cloud Downloader 
  This NodeJS app lets you download any online file to Google Drive . 
## Demo

https://cloud2drive.herokuapp.com/

## How it works
1. It downloads the file at the direct link provided .
2. Creates an OAuth2.0 client using googleapis
3. Connects drive using the authorization
4. Uploads the downloaded file to gdrive
5. Gives GDrive link to the file

It also maintains a basic database in json that saves the last status and name , date of the file . Upon deletion the download taskas well the file and the entry are deleted from the Database .

## Install

1. Get credentials.json from 
https://developers.google.com/drive/api/v3/quickstart/go
2. Put in the project directory
3. Run 

```terminal
node .
```

## Using NPM

```terminal
npm install gcloud_downloader
```

Thanks
Contact : admin@hoptech.in
My Website http://hoptech.in/ 

