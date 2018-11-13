#!/bin/bash -e

cd $(dirname `readlink -f $0`)
cd ..

GIT_DIR="dist/github-tmp"
GIT_BRANCH="gh-pages"

if [ -e "$GIT_DIR" ] && [ ! -d "$GIT_DIR/.git" ]; then
	>&2 echo
	>&2 echo ERROR:
	>&2 echo
	>&2 echo 'dir "'$GIT_DIR'" exists but not a git repo'
	>&2 echo
	exit 1
fi

if [ ! -e "$GIT_DIR" ]; then
	git clone "git@github.com:zhengkai/maze.git" --depth 1 -b "GIT_BRANCH" "$GIT_DIR"
fi

ng build -c github

rm -f "$GIT_DIR/"*
cp -R dist/github/* "$GIT_DIR"

DATE=`TZ='Asia/Shanghai' date '+%Y-%m-%d %H:%M:%S'`

cd "$GIT_DIR"

CHECK_BRANCH=`git branch`
if [ "$CHECK_BRANCH" != "* $GIT_BRANCH" ]; then
	>&2 echo
	>&2 echo ERROR:
	>&2 echo
	>&2 echo 'dir "'$GIT_DIR'" not in branch "'$GIT_BRANCH'"'
	>&2 echo
	exit
fi

git add --all .
git commit --all --amend -m "build in $DATE

submit by script, user $USER"

git push --force
