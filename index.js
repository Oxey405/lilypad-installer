var logStack;
console.log("Initialize app");
logStack = "Initialize app (timestamp : " + Date.now() + ")";
const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const os = require("os");
const path = require("path");
const { download } = require("electron-dl");
var actualWindow;
const fs = require("fs");
const pathToLogStack = os.tmpdir() + "/lilylogs/main.log";
require("@electron/remote/main").initialize();
console.log("Initializing window config");
logStack = logStack + "\r\n" +"Initializing window config";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 600,
    height: 600,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true,
      enableRemoteModule: true,
      sandbox: false,
      nodeIntegrationInSubFrames: true, //for subContent nodeIntegration Enable
      webviewTag: true, //for webView
      enableRemoteModule: true,
    },
  });
  console.log("Loading Interface");
  logStack = logStack + "\r\n" + "Loading Interface";
  win.loadFile("pages/bundlemode.html");
  actualWindow = win;
  require("@electron/remote/main").enable(win.webContents);
};
console.log("Creating window");
logStack = logStack + "\r\n" + "Creating window";

app.whenReady().then(() => {
  createWindow();
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('install-w-lilypad', process.execPath, [path.resolve(process.argv[1])])
      logStack = logStack + "\r\n" + "Setted install-w-lilypad protocol with argv";
      console.log("Setted install-w-lilypad protocol with argv");
    }
  } else {
    app.setAsDefaultProtocolClient('install-w-lilypad')
    logStack = logStack + "\r\n" + "Setted install-w-lilypad protocol without argv";
    console.log("Setted install-w-lilypad protocol without argv");
  }
  saveLogsState();
});



app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();

});

app.on("ready", () => {
  saveLogsState();
  try {
    fs.mkdirSync(os.tmpdir() + "/lilylogs");

  } catch (error) {
    console.log("log dir already exists");
  }

  

  ipcMain.on("download", (event, info) => {
    download(BrowserWindow.getFocusedWindow(), info.url, info.properties).then(
      (dl) =>
        actualWindow.webContents.send("download complete", dl.getSavePath()),
      console.log("Download completed"),
      saveLogsState()
    );
  });

  ipcMain.on("do-as-opened-from-url", (event, info) => {
    console.log("doing as opened app from url (empty)");
    logStack = logStack + "\r\n" + "doing as opened app from url (empty)";
    saveLogsState();
    dialog.showMessageBox(actualWindow, {message:"opened from url : " + " (fake message)"});
    actualWindow.webContents.send("open-from-url", "no-url-specified");

  });
});

function saveLogsState() {
  console.log("Writing logstack in main.logs");
logStack = logStack + "\r\n" + "Writing logstack in main.log";
    fs.writeFile(pathToLogStack, logStack, "utf-8", (err) => {
      if (err) {
        //Wait, how did the user got to this point ?!
        console.log("!! CANT WRITE main.logs : THIS IS REALLY BAD !!");
      }
    });
}
app.on('open-url', (event, url) => {
  console.log("Opened app from url : " + url);
  logStack = logStack + "\r\n" + "Opened app from url : " + url;
  dialog.showMessageBox(actualWindow, {message:"opened from url : " + url});
  saveLogsState();
  actualWindow.webContents.send("open-from-url", url);

})