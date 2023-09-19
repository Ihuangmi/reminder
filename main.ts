// electron 模块可以用来控制应用的生命周期和创建原生浏览窗口
const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");

const createWindow = () => {
  // 创建浏览窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
    },
  });

  // 构建一个自定义菜单
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: () => mainWindow.webContents.send("update-counter", 1),
          label: "加1",
        },
        {
          click: () => mainWindow.webContents.send("update-counter", -1),
          label: "减1",
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  // 加载 index.html
  mainWindow.loadFile("index.html");

  // 打开开发工具
  mainWindow.webContents.openDevTools();
};

// 设置标题
function handleSetTitle(event, title) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
}

// 打开文件选择框
async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({});
  if (!canceled) {
    return filePaths[0];
  }
}

// 这段程序将会在 Electron 结束初始化和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow();

  // 如果没有窗口打开则打开一个窗口 (macOS)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on("set-title", handleSetTitle);

  ipcMain.handle("ping", () => "pong");

  ipcMain.handle("dialog:openFile", handleFileOpen);

  ipcMain.on("counter-value", (_event, value) => {
    console.log(value); // will print value to Node console
  });
});

// 关闭所有窗口时退出应用 (Windows & Linux)
app.on("window-all-closed", () => {
  // darwin: macOS 此方法不适用于 macOS
  if (process.platform !== "darwin") app.quit();
});
