const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  MessageChannelMain,
  Tray,
  nativeImage,
  screen,
} = require("electron");
const path = require("path");

const iconPath = path.join(__dirname, "./icon.png");

let tray, mainWindow, remindWindow, updateWindow;

// 创建浏览窗口
const createWindow = () => {
  // 创建更新界面
  if (app.isPackaged) {
    updateWindow = new BrowserWindow({
      width: 800,
      height: 360,
      frame: false, // 无边框（窗口、工具栏等），只包含网页内容
      transparent: true, // 窗口是否支持透明，如果想做高级效果最好为true
      webPreferences: {
        preload: path.join(__dirname, "preload.ts"),
        webSecurity: false,
      },
    });

    updateWindow.loadFile(path.join(process.env.DIST, "update.html"));
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    // resizable: false, // 不允许用户改变窗口大小
    frame: false, // 去掉默认边框
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
      nodeIntegration: true, // 设置能在页面使用nodejs的API
    },
  });

  // 去掉菜单栏
  // mainWindow.removeMenu();

  // 加载 index.html
  mainWindow.loadFile("src/index.html");

  // 打开开发工具
  mainWindow.webContents.openDevTools();
};

function setTitle(event, title) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
}

async function openFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog({});
  if (!canceled) {
    return filePaths[0];
  }
}

function setTaskTimer(event, time, task) {
  const now = new Date();
  const date = new Date();
  date.setHours(time.slice(0, 2), time.slice(3), 0);
  const timeout = date.getTime() - now.getTime();
  setTimeout(() => {
    createRemindWindow(task);
  }, timeout);
}

// 创建托盘
const createTray = () => {
  tray = new Tray(iconPath);

  // 右键点击图标时，出现的菜单
  const contextMenu = Menu.buildFromTemplate([
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);

  tray.setToolTip("我自己写的备忘录");

  tray.on("click", () => mainWindow.show());
};

// 这段程序将会在 Electron 结束初始化和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow();
  createTray();

  // 如果没有窗口打开则打开一个窗口 (macOS)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on("set-title", setTitle);

  ipcMain.handle("ping", () => "pong");

  ipcMain.handle("dialog:openFile", openFile);

  ipcMain.on("mainWindow:close", () => mainWindow.hide());

  ipcMain.on("remindWindow:close", () => remindWindow.close());

  ipcMain.on("set-TaskTimer", setTaskTimer);

  // 3.6、接受渲染进程数据并打印
  ipcMain.on("counter-value", (_event, value) => {
    console.log(value); // will print value to Node console
  });

  handleUpdate(mainWindow);
});

// 创建系统提醒窗口
function createRemindWindow(task) {
  if (remindWindow) remindWindow.close();

  remindWindow = new BrowserWindow({
    height: 450,
    width: 360,
    resizable: false,
    frame: false,
    icon: iconPath,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
      nodeIntegration: true,
      // contextIsolation: false,
    },
  });

  remindWindow.removeMenu();

  // 获取屏幕尺寸
  const size = screen.getPrimaryDisplay().workAreaSize;
  // 获取托盘位置的y坐标（windows在右下角，Mac在右上角）
  const { y } = tray.getBounds();
  const { height, width } = remindWindow.getBounds();
  // 计算窗口的y坐标
  const yPosition = process.platform === "darwin" ? y : y - height;
  // 设置窗口的位置
  remindWindow.setBounds({
    x: size.width - width,
    y: yPosition,
    height,
    width,
  });

  // 有多个应用时，提醒窗口始终处于最上层
  remindWindow.setAlwaysOnTop(true);

  // remindWindow.loadURL(`file://${__dirname}/src/remind.html`);
  remindWindow.loadFile("src/remind.html");

  remindWindow.show();

  remindWindow.webContents.send("set-Task", task);

  remindWindow.on("closed", () => {
    remindWindow = null;
  });

  setTimeout(() => {
    remindWindow && remindWindow.close();
  }, 50 * 1000);
}

// 关闭所有窗口时退出应用 (Windows & Linux)
app.on("window-all-closed", () => {
  // darwin: macOS 此方法不适用于 macOS
  if (process.platform !== "darwin") app.quit();
});
