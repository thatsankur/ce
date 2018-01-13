const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const { ipcMain } = require('electron')
var pids = [];
let win
var ps = require('ps-node');

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
  win.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });
}
app.on('before-quit', function () {
  console.log('before-quit', pids);
  pids.forEach(function (pid) {
    // A simple pid lookup
    ps.kill(pid, function (err) {
      if (err) {
        throw new Error(err);
      }
      else {
        console.log('Process %s has been killed!', pid);
      }
    });
  });
});
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
ipcMain.on('pid-message', function (event, arg) {
  console.log('Main:', arg);
  pids.push(arg);
});
ipcMain.on('pid-message-done', function (event, arg) {
  console.log('Main ps done:', arg);
  var index = pids.indexOf(arg);
  console.log('Main ps done index:', index);
  console.log('Main ps done index:', pids);
  pids.splice(index, 1);
  console.log('Main ps done index splice :', pids);
});
app.on('ready', createWindow) 
