rm -rf *arm64
tsc
electron-packager . Dashboard --overwrite
electron-installer-dmg ./Dashboard-darwin-arm64/Dashboard.app Dashboard --overwrite
rm -rf *arm64
