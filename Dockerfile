FROM node:10 

WORKDIR /  
RUN git clone https://github.com/shiveshnavin/gcloud_downloader 
WORKDIR /gcloud_downloader
ENV CREDS='{ "type": "service_account", "project_id": "<project_id>", "private_key_id": "<private_key_id>", "private_key": "<private_key>", "client_email": "<client_email>"'
RUN npm install 
CMD ["node","/gcloud_downloader/app.js"]
