const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const { ipcMain } = require('electron')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }
  })
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  win.webContents.openDevTools();
}
ipcMain.on('openFile', (event, path) => {
  const { dialog } = require('electron')
  const fs = require('fs')
  dialog.showOpenDialog(function (fileNames) {

    // fileNames is an array that contains all the selected 
    if (fileNames === undefined) {
      console.log("No file selected");
    } else {
      readFile(fileNames[0]);
    }
  });
  function readFile(filepath) {
    fs.readFile(filepath, 'utf-8', (err, data) => {

      if (err) {
        alert("An error ocurred reading the file :" + err.message)
        return
      }

      // handle the file content 
      event.sender.send('fileData', data)
    })
  }
})
ipcMain.on('saveFile', (event, path) => {
  const { dialog } = require('electron')
  const fs = require('fs')
  dialog.showSaveDialog(function (fileNames) {

    // fileNames is an array that contains all the selected 
    if (fileNames === undefined) {
      console.log("No file selected");
    } else {
      readFile(fileNames[0]);
    }
  });
  function readFile(filepath) {
    fs.readFile(filepath, 'utf-8', (err, data) => {

      if (err) {
        alert("An error ocurred reading the file :" + err.message)
        return
      }

      // handle the file content 
      event.sender.send('fileData', data)
    })
  }
})
ipcMain.on('showError', (event, path) => {
  const { dialog } = require('electron')
  const fs = require('fs')
  dialog.showErrorDialog(title, content)
})
app.on('ready', createWindow) 