SHELL:=/bin/bash

default:
	ng serve --host 127.0.0.1 --port 22002

github:
	./script/github-pages.sh

init:
	npm install
	npm audit fix
