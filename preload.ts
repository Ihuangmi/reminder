// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 预加载脚本在渲染器加载网页之前注入。
// 如果你想为渲染器添加需要特殊权限的功能，可以通过 contextBridge 接口定义 全局对象。

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  invoke: () => ipcRenderer.invoke("ping"),
  // 除函数之外，我们也可以暴露变量
});

contextBridge.exposeInMainWorld("electronAPI", {
  // 通过 channel 向主过程发送消息，并异步等待结果
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  setTitle: (title) => ipcRenderer.send("set-title", title),
  // 3.3、注册主进程监听事件函数
  onUpdateCounter: (callback) => ipcRenderer.on("update-counter", callback),
});
