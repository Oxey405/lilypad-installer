/**
 * © 2022 Oxey405 Under license MIT
 * This is the core application of the project
 */

const { shell, app } = require("@electron/remote");    


//This is where you can customize the name and helplink of the installer
const AppName = "examplename"
const helpLink = "https://github.com/Oxey405/lilypad-installer"
const windowTitle = "Install app"
const description = "Install examplename and customize it's installation"
function setupinterface() {
    //First change names and links
    document.getElementById("installWindowTitle").innerText = windowTitle;
    document.getElementById("installtitle").innerHTML = "Install " + AppName;
    document.getElementById("Description").innerHTML = description;
}

function openHelpURL() {
    shell.openExternal(helpLink)
}
function quitApp() {
    app.exit();
}

setupinterface();

/**
 * This function is called when a checkbox is clicked to change it's state and execute a function with it.
 * @param {String} checkboxID 
 * @param {Function} callback
 */
function checkboxClicked(checkboxID, callback) {
    //Get the checkbox that has been clicked
    var checkbox = document.getElementById(checkboxID);
    var checkboxstate = checkbox.getAttribute("state")
    //check the checkbox's state
    if(checkboxstate == "unchecked") {

    //Change it's appearance
    checkbox.className = "checkbox-checked";
    //Change the state
    checkbox.setAttribute("state","checked");


    } else if (checkboxstate == "checked") {

        //Change it's appearance
        checkbox.className = "checkbox-unchecked";
        //Change the state
        checkbox.setAttribute("state","unchecked");

    }
   
    
}