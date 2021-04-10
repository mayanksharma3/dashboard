rm -rf *arm64
tsc
electron-packager . Terminal --overwrite
electron-installer-dmg ./Terminal-darwin-arm64/Terminal.app Terminal --overwrite
