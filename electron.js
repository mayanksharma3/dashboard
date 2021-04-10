const { app, BrowserWindow } = require('electron')
require('ts-node/register')
require('./main')
function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadURL('http://localhost:4221/panel/HOME')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


