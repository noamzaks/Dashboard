import { app, dialog, BrowserWindow, Menu, CPUUsage, MenuItem } from "electron"
import { platform } from "process"
import { spawn, ChildProcess } from "child_process"
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs"
import { getCacheDirectory } from "./utilities"
import { join } from "path"
import contextMenu from "electron-context-menu"

let pynetworktables2jsProcess: ChildProcess

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit()
}

const accelerator = (key: string) => {
    return platform === "darwin" ? "Cmd+" + key : "Ctrl+" + key
}

const setSchema = (window: BrowserWindow, path: string) =>
    window.webContents.executeJavaScript(
        `window.setSchema(\`${readFileSync(path).toString()}\`)`
    )

const getSchema = (window: BrowserWindow) =>
    window.webContents.executeJavaScript("window.getSchema()")

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 833,
        frame: false,
        webPreferences: { webSecurity: false },
    })

    mainWindow.setResizable(false)
    try {
        mainWindow.setIcon(
            "C:\\Users\\progr\\Developer\\2022-robot\\src\\main\\resources\\images\\kumkum.png"
        )
    } catch (ignored) { }
    mainWindow.setPosition(0, 0, true)

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

    const menu = Menu.getApplicationMenu()
    const fileMenuIndex = platform === "darwin" ? 1 : 0
    menu.items[fileMenuIndex].submenu.insert(
        0,
        new MenuItem({
            label: "Open",
            accelerator: accelerator("O"),
            click: async () => {
                const file = await dialog.showOpenDialog({
                    filters: [{ name: "JSON", extensions: ["json"] }],
                })
                if (file.filePaths) {
                    setSchema(mainWindow, file.filePaths[0])
                }
            },
        })
    )
    menu.items[fileMenuIndex].submenu.insert(
        1,
        new MenuItem({
            label: "Save",
            accelerator: accelerator("S"),
            click: async () => {
                const cache = getCacheDirectory()
                const current = join(cache, "current.json")
                writeFileSync(current, await getSchema(mainWindow))
            },
        })
    )
    menu.items[fileMenuIndex].submenu.insert(
        2,
        new MenuItem({
            label: "Save As",
            accelerator: accelerator("Shift+S"),
            click: async () => {
                const file = await dialog.showSaveDialog({
                    title: "Save As",
                    filters: [{ name: "JSON", extensions: ["json"] }],
                })
                if (file.filePath) {
                    writeFileSync(file.filePath, await getSchema(mainWindow))
                }
            },
        })
    )
    menu.insert(
        fileMenuIndex + 1,
        new MenuItem({
            label: "Tab",
            submenu: [
                {
                    label: "Lock",
                    accelerator: accelerator("L"),
                    click() {
                        mainWindow.webContents.executeJavaScript(
                            "window.tabLock()"
                        )
                    },
                },
                {
                    label: "Unlock",
                    accelerator: accelerator("Shift+L"),
                    click() {
                        mainWindow.webContents.executeJavaScript(
                            "window.tabUnlock()"
                        )
                    },
                },
            ],
        })
    )
    Menu.setApplicationMenu(menu)

    return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    const mainWindow = createWindow()

    const cache = getCacheDirectory()
    const current = join(cache, "current.json")
    if (!existsSync(cache)) {
        mkdirSync(cache, { recursive: true })
    } else if (existsSync(current)) {
        setSchema(mainWindow, current)
    }

    pynetworktables2jsProcess = spawn("pynetworktables2js", ["--team", "1574"])
    pynetworktables2jsProcess.on("close", (e) => {
        console.log(e)
    })
    pynetworktables2jsProcess.on("error", (e) => {
        console.log(e)
    })
    pynetworktables2jsProcess.on("data", (msg) => {
        console.log(msg)
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.on("web-contents-created", (e, contents) => {
    contextMenu({
        window: contents,
        showSaveImageAs: true,
        showInspectElement: true,
    })
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

app.addListener("before-quit", () => {
    pynetworktables2jsProcess.kill()
})
