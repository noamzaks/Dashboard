import { app, dialog, BrowserWindow, Menu, CPUUsage } from "electron";
import { platform } from "process";
import { exec, spawn, ChildProcess } from "child_process";
import { writeFileSync, readFileSync } from "fs";

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}

const accelerator = (key: string) => {
    return platform === "darwin" ? "Cmd+" + key : "Ctrl+" + key;
};

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 880,
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    mainWindow.webContents.openDevTools();

    const menu = Menu.buildFromTemplate([
        {
            label: "Dashboard",
            submenu: [
                {
                    label: "Exit",
                    accelerator: accelerator("Q"),
                    click: app.quit,
                },
            ],
        },
        {
            label: "File",
            submenu: [
                {
                    label: "Save",
                    accelerator: accelerator("S"),
                    async click() {
                        const file = await dialog.showSaveDialog({
                            filters: [{ name: "JSON", extensions: ["json"] }],
                        });
                        if (file.filePath) {
                            writeFileSync(
                                file.filePath,
                                await mainWindow.webContents.executeJavaScript(
                                    "window.getSchema()"
                                )
                            );
                        }
                    },
                },
                {
                    label: "Open",
                    accelerator: accelerator("O"),
                    async click() {
                        const file = await dialog.showOpenDialog({
                            filters: [{ name: "JSON", extensions: ["json"] }],
                        });
                        if (file.filePaths) {
                            console.log(
                                `window.setSchema(\`${readFileSync(
                                    file.filePaths[0]
                                ).toString()}\`)`
                            );

                            mainWindow.webContents.executeJavaScript(
                                `window.setSchema(\`${readFileSync(
                                    file.filePaths[0]
                                ).toString()}\`)`
                            );
                        }
                    },
                },
            ],
        },
        {
            label: "Help",
            submenu: [{ label: "About" }],
        },
    ]);
    Menu.setApplicationMenu(menu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const query = "pynetworktables2js";
let cmd = "";
let pynetworktables2jsProcess: ChildProcess;
switch (platform) {
    case "win32":
        cmd = `tasklist`;
        break;
    case "darwin":
        cmd = `ps u`;
        break;
    case "linux":
        cmd = `ps -u`;
        break;
    default:
        break;
}

try {
    exec(cmd, (err, stdout, stderr) => {
        if (stdout.toLowerCase().indexOf(query.toLowerCase()) == -1) {
            pynetworktables2jsProcess = spawn("pynetworktables2js", [], {
                detached: true,
                stdio: ["ignore", "ignore", "ignore"],
            });
            pynetworktables2jsProcess.unref();
        }
    });
} catch (e) {
    console.log(e);
}

app.addListener("before-quit", () => {
    if (pynetworktables2jsProcess) {
        pynetworktables2jsProcess.kill();
    }
});
