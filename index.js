var logStack ;
console.log("Initialize app");
logStack =  "Initialize app";
const { app, BrowserWindow, ipcMain } = require('electron')
const {download} = require("electron-dl");
var actualWindow;
require('@electron/remote/main').initialize()
console.log("Initializing window config");
const createWindow = () => {
    const win = new BrowserWindow({
      width: 600,
      height: 600,
      autoHideMenuBar:true,
      frame:false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        nativeWindowOpen: true,
        enableRemoteModule: true,
        sandbox:false,
        nodeIntegrationInSubFrames:true, //for subContent nodeIntegration Enable
        webviewTag:true, //for webView
        enableRemoteModule: true
      }
    })
    console.log("Loading Interface");
    logStack = logStack + "\r\n" + "Loading Interface";
    win.loadFile('pages/bundlemode.html');
    actualWindow = win;
    require("@electron/remote/main").enable(win.webContents);
  }
  console.log("Creating window");
  logStack = logStack + "\r\n" + "Creating window";

  app.whenReady().then(() => {
    createWindow()
  });
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
  
  app.on("ready", () => {
    ipcMain.on("download", (event, info) => {
      download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
          .then(
            dl => actualWindow.webContents.send("download complete", dl.getSavePath()),
            console.log("Download completed")
          );
    });
  });
  const fs = require("fs");
  const pathToLogStack = app.getAppPath() + "/main.log";
  console.log("Writing logstack in main.logs");
  logStack = logStack + "\r\n" + "Writing logstack in main.log";
  fs.writeFile(pathToLogStack, logStack, 'utf-8', (err) => {
    if(err) {
      //Wait, how did the user got to this point ?!
      console.log("!! CANT WRITE main.logs : THIS IS REALLY BAD !!");

    }
  });

