const { autoUpdater } = require("electron-updater");
const { build } = require("../../../package.json");

// 用户反馈立即更新
ipcMain.on("ev-update-now", () => {
  console.log("ev-update-now::: 用户同意更新，开始更新");

  autoUpdater.quitAndInstall();
});

// 用户也可以通过点击按钮去检测更新
ipcMain.on("ev-check-for-update", () => {
  console.log("ev-check-for-update::: 执行自动更新检查");

  autoUpdater.checkForUpdates();
});

function handleUpdate(mainWindow) {
  const message = {
    error: "检查更新出错",
    checking: "正在检查更新……",
    updateAva: "检测到新版本，正在下载……",
    updateNotAva: "现在使用的就是最新版本，不用更新",
  };

  autoUpdater.setFeedURL("http://127.0.0.1:8080/static"); // 设置下载地址

  // 检查更新出错
  autoUpdater.on("error", () => {
    console.log("autoUpdater-error:::", arguments);

    sendUpdateMessage(message.error);
  });

  // 检查是否有版本更新
  autoUpdater.on("checking-for-update", () => {
    console.log("checking-for-update:::", arguments);

    sendUpdateMessage(message.checking);
  });

  // 检测到有版本更新
  autoUpdater.on("update-available", () => {
    console.log("update-available:::", arguments);

    sendUpdateMessage(message.updateAva);
  });

  // 未发现有新版本
  autoUpdater.on("update-not-available", () => {
    console.log("update-not-available:::", arguments);

    sendUpdateMessage(message.updateNotAva);
  });

  // 更新下载进度事件
  autoUpdater.on("download-progress", (progressObj) => {
    console.log("download-progress:::", progressObj);

    mainWindow.setProgressBar(progressObj.percent / 100);
  });

  // 下载完成，询问用户是否更新
  autoUpdater.on(
    "update-downloaded",
    (
      event,
      releaseNotes,
      releaseName,
      releaseDate,
      updateUrl,
      quitAndUpdate
    ) => {
      console.log("update-downloaded::: 下载完成，询问用户是否更新");

      mainWindow.webContents.send("ev-should-update", {
        event,
        releaseNotes,
        releaseName,
        releaseDate,
        updateUrl,
        quitAndUpdate,
      });
    }
  );

  function sendUpdateMessage(text) {
    mainWindow.webContents.send("ev-message", text);
  }
}

module.exports = {
  handleUpdate,
};
