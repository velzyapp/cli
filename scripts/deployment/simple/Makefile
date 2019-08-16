RG=velzyapp
APPNAME=velzysimple
PLAN=velzyfree
LOCATION="West US 2"
SKU=S1

all: logs

rg:
	az group create -n $(RG) -l $(LOCATION)

plan: rg
	az appservice plan create -g $(RG) \
		-n $(PLAN) \
		--sku $(SKU) \
		--is-linux

webapp: plan
	az webapp create -n $(APPNAME) \
		-g $(RG) \
		-p $(PLAN) \
		--multicontainer-config-type compose \
		--multicontainer-config-file docker-compose-azure.yml

logging: webapp
	az webapp log config --application-logging true \
		--web-server-logging filesystem \
		--failed-request-tracing true \
		--detailed-error-messages true \
		--docker-container-logging filesystem \
		--level information \
		--name $(APPNAME) \
		--resource-group $(RG)

open: logging
	open https://$(APPNAME).azurewebsites.net

logs: open
	az webapp log tail -n $(APPNAME) -g $(RG)

rollback:
	az group delete -n $(RG) -y

.PHONY: logs rollback open webapp rg plan all
