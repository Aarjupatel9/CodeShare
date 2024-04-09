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

        console.log(`Command output:\n${stdout}`);
    });
}
const command = "git pull";

setInterval(() => {
    runCMD(command);
}, 10000);
