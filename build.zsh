#! /usr/bin/zsh

buildDir="./build"
stat build 1> /dev/null 2> /dev/null
buildDirStatus=$?

if [[ buildDirStatus -eq 0 ]]; then
    echo "Build directory already detected, cleaning it out"
    rm -rf $buildDir
fi

mkdir $buildDir

cp -r ./src $buildDir
if [[ $? -eq 0 ]]; then
    echo "Copied src directory"
fi

cp -r ./includes $buildDir
if [[ $? -eq 0 ]]; then
    echo "Copied incude files"
fi

7z -tzip a regex-search.zip $buildDir/* 1> /dev/null