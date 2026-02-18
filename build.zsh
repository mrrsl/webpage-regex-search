#! /usr/bin/zsh

working=$(pwd)

buildDir="$working/build"
contentScriptDir="$working/src/lib"
popupDir="$working/src/popup"

contentBuild="$buildDir/$(basename $contentScriptDir)"
popupBuild="$buildDir/$(basename $popupDir)"

stat build 1> /dev/null 2> /dev/null
buildDirStatus=$?

# Clean out build directory
if [[ buildDirStatus -eq 0 ]]; then
    echo "Build directory already detected, cleaning it out"
    rm -rf $buildDir
fi

mkdir $buildDir
mkdir $contentBuild
mkdir $popupBuild

# Copy content scripts and remove import statements
for contentjs in $contentScriptDir/*.js; do
    echo "removing imports from $contentjs"
    sed -z -E "s/import\s+\{[^\{\}]*\}\s+from[^;]+\;\n//g" $contentjs | sed -z -E "s/export\s+//g" > "$contentBuild/$(basename $contentjs)"
done

# Copy files used for extension popup to the build directory
#cp -r ./src/popup $buildDir

for popupFile in $popupDir/*; do

    fileName=$(basename $popupFile)

    if [[ $filename == *".js" ]]; then
        cat $contentScriptDir/highlight_replacement.js $popupFile > $popupBuild/$fileName

    elif [[ $filename == *".css" ]]; then
        npx @tailwind/cli -i $popupFile -o $popupBuild/$fileName

    else
        cp $popupFile $popupBuild
    fi
done
echo "Copied popup files"

cp -r ./includes/* $buildDir
if [[ $? -eq 0 ]]; then
    echo "Copied incude files"
fi

7z -tzip a regex-search.zip $buildDir/* 1> /dev/null