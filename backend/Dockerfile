FROM mcr.microsoft.com/azure-functions/node:4-node20

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

COPY package.json package-lock.json /home/site/wwwroot/
RUN cd /home/site/wwwroot && npm ci --omit=dev

COPY . /home/site/wwwroot
