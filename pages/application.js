/**
 * © 2022 Oxey405 Under license MIT
 * This is the core application of the project.
 * Please mind credit Lilypad installer in your readme or
 * directly in your app credits. It would be great :)
 * See https://oxey405.com/projects/lilypad-inst
 */

const { shell, app, dialog, BrowserWindow } = require("@electron/remote");
const { ipcRenderer } = require("electron");
const actualWindow = BrowserWindow.getFocusedWindow();
const os = require("os");
const fs = require("fs");
const path = require('path');
const yaml = require('js-yaml');
const sudo = require("sudo-prompt");
var state = document.getElementById("state");
var sudo_options = {
  name: 'Lilypad Installer',
  icns: 'res/lilypad_inst_logo_256.png', // (optional)
}; 

const pathToLogStack = os.homedir() + "/.lilypad/app.log";
const PathToLogDir = os.homedir() + "/.lilypad";
//creates log dir in inexisting
if(!fs.existsSync(PathToLogDir)) {
  try {
    fs.mkdirSync(PathToLogDir);

  } catch (error) {
    alert("critical ERROR : can't create logs !!! Hard stopping! \r\n" + error);
    app.exit();
  }
}
var logStack = "beginning of app logger - timestamp : " + Date.now();
fs.readFile(pathToLogStack, "utf-8", function (err, data) {
  logStack = data;
});

//This is where you can customize the name and helplink of the installer
log("Initializing webapp : loading configuration included");
//Look at the wiki to learn more about config
//Put a direct link to the latest.yml file or it will not work.
// Should be in form of https://github.com/owner/repository/releases/latest/download/latest-linux.yml
var appSourcesRepo = "https://github.com/4ian/GDevelop"; // DO NOT PUT "/" at the END of url
var config = { devtools: "", mode: "", AppName: "", helpLink: "", windowTitle: "Install App", description: "", appSourcesRepoYML: "",appSourcesRepo:"" };
var PathToApp ;


/**
 * The setup function. Executed when the webapp starts.
 * It sets a lot of useful variables and properties
 */
function setup() {
  

  log("Initializing webapp : loaded modules");

  log("starting the application.js script");

  //Parse arguments (using command line)
  config.devtools = app.commandLine.getSwitchValue("enable-dev-tools");

  //Parse config file if not running in bundled mode.
  var configPath = app.getAppPath() + "/lilypad-inst-config.json";
  
  fs.readFile(configPath, "utf-8", (err, data) => {
    //This may be unsafe...
        try {
        config = JSON.parse(data);
        log("loaded data");
        PathToApp = "/opt/" + config.AppName;
        log("setting up Path to App to " + PathToApp);
        } catch (error) {
        log(
            "Critical ERROR ! Can't load configuration :(\r\nReport that to the developpers of the app + report it on https://github.com/Oxey405/lilypad-installer"
        );
        alert(
            "Critical ERROR ! Can't load configuration :(\r\nReport that to the developpers of the app + report it on https://github.com/Oxey405/lilypad-installer"
        );
        quitApp();
        }

  });
    log("loaded configuration file... Applying values");
    // config.AppName;
    // config.helpLink;
    // config.windowTitle;
    // config.description;
    // config.appSourcesRepoYML;
    // config.appSourcesRepo;
    // config.description;

  //First change names and links
    document.getElementById("installWindowTitle").innerText = config.windowTitle;
    document.getElementById("installtitle").innerHTML = "Install " + config.AppName;
    document.getElementById("Description").innerHTML = config.description;
    //Show default dir
    document.getElementById("installfolder").value = PathToApp;

}

function openHelpURL() {
    shell.openExternal(config.helpLink);
}
function quitApp() {
    app.exit();
}

setup();

/**
 * This function is called when a checkbox is clicked to change it's state and execute a function with it.
 * @param {String} checkboxID
 * @param {Function} callback
 */
function checkboxClicked(checkboxID, callback) {
  //Get the checkbox that has been clicked
    var checkbox = document.getElementById(checkboxID);
    var checkboxstate = checkbox.getAttribute("state");
  //check the checkbox's state
    if (checkboxstate == "unchecked") {
        //Change it's appearance
        checkbox.className = "checkbox-checked";
        //Change the state
        checkbox.setAttribute("state", "checked");
    } else if (checkboxstate == "checked") {
        //Change it's appearance
        checkbox.className = "checkbox-unchecked";
        //Change the state
        checkbox.setAttribute("state", "unchecked");
    }
}
async function selectFolder() {
  var folderPath;
    dialog.showOpenDialog({ properties: ["openFile", "openDirectory"] })
        .then((result) => {
            if (!result.canceled) {
                
                folderPath = result.filePaths[0];

                log("selected folder : [" + folderPath + "]... following next steps");

            } else {
                alert("No vaild entry provided. Using default folder");

                log("No vaild entry provided. Using default folder");

            }
        })
            .catch((err) => {
            log(err);
    });
}
/**
 * @returns {String} Directory path
 */
function openInstallFolderDialog() {
    dialog.showOpenDialog({ properties: ["openFile", "openDirectory"] })
        .then((result) => {
            if (!result.canceled) {
                return result[0];
            } else {
                alert("No fvaild entry provided. Using default folder");
            }
        })
        .catch((err) => {
            log(err);
    });
}

/**
 * Message to log
 * @param {String} messageToLog
 */
function log(messageToLog) {
    
  var timestamp = Date.now();
  var time =
    new Date().getFullYear() +
    "/" +
    new Date().getMonth() +
    "/" +
    new Date().getDay() +
    " " +
    new Date().getHours() +
    ":" +
    new Date().getMinutes() +
    ":" +
    new Date().getSeconds();

  messageToLogParsed = "[" + timestamp + " - " + time + "] " + messageToLog;
  console.log(messageToLogParsed);

  logStack = logStack + "\r\n" + messageToLogParsed;

  fs.writeFile(pathToLogStack, logStack, "utf-8", (err) => {
    if (err) {
      //Wait, how did the user got to this point ?!
      console.error("!! CANT WRITE app.log : THIS IS REALLY BAD !!");
      console.error("ERROR : " + err);
    }
  });

}

function install() {
  log("Trying to download the latest info from : " + config.appSourcesRepoYML);
  state.innerHTML = "Downloading latest version from : " + config.appSourcesRepoYML;
  downloadYML();
}
function downloadYML() {
  log("Sending ipcRenderer download message...");
  ipcRenderer.send("download", {
    url: config.appSourcesRepoYML,
    properties: {directory: '/tmp/lilypad/'+config.AppName}
});

}
var appSourceInfo ;
//Listener for download completion
ipcRenderer.on("download complete", (event, file) => {
  log("Download of " + file + " is a sucess...");
  if(appSourceInfo == undefined && path.extname(file) == ".yml") {
    log("Parsing the latest-linux.yml file");
    state.innerHTML = "Parsing info file";

    try {
      const doc = yaml.load(fs.readFileSync(file, 'utf8'));
      appSourceInfo = doc;
      downloadLinuxExec();
    } catch (e) {
      console.log(e);
      state.innerHTML = "Error while Parsing info file... install terminated";

    }
  } else if(path.extname(file) == ".AppImage" || path.extname(file) == ".tar.gz"){
    log("Download of " + file + " completed. Asking sudo permissions to move it in /opt/" + config.AppName);
    state.innerHTML = "Download finished. Asking sudo perms. to move into /opt/" + config.AppName;
    copyExecToAppPath(file);
  }

});

function downloadLinuxExec() {
  log("Sending ipcRenderer download message...");
  var releaseDateParsed = appSourceInfo.releaseDate.substring(0, 10);

  log("Downloading " + config.AppName + " version (latest found) : " + appSourceInfo.version + " released " + releaseDateParsed);
  state.innerHTML = "Downloading app executable... (may take some time)";
  ipcRenderer.send("download", {
    url: appSourcesRepo + "/releases/latest/download/" + appSourceInfo.path,
    properties: {directory: '/tmp/lilypad/'+config.AppName}
});
}
function copyExecToAppPath(fileToCopy) {
  var commandToPerform = 'mkdir ' + PathToApp + '&& cp ' + fileToCopy + ' ' + PathToApp + "/";
  log("trying to perform command : " + commandToPerform);
  state.innerHTML = "Performing copy command from tmp to " + PathToApp;
  sudo.exec(commandToPerform, sudo_options,
  function(error, stdout, stderr) {
    if (error) {
    log("[ERROR] error while performing command... " + error);
    } else {
      log("Command performed sucessfully");
    }
    wipetmpdir();
  });


}

function wipetmpdir() {
  log("Wiping the tmp dir of lilypad...");
  state.innerHTML = "Wiping the tmp dir of lilypad...";

  fs.rmdir("/tmp/lilypad", {recursive: true, force: true} , (err) => {
    if(err) {
      log("[ERROR] Can't wipe tmp dir : " + err);
      state.innerHTML = "App installed ! (TMP was not wiped)";

    } else {
      log("tmp dir wiped sucessfully");
      state.innerHTML = "App installed ! (TMP was wiped)";

    }

  })
}