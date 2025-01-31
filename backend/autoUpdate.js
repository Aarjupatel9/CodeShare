const { exec } = require("child_process");

// Replace 'ls' with your desired Linux command
function runCMD(command) {

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Error in command execution: ${stderr}`);
            return;
        }

        console.debug(`Command output:\n${stdout}`);
    });
}
const command = "git pull";

setInterval(() => {
    runCMD(command);
    runCMD("cd ./backend && npm install && cd ..");

}, 10000);
