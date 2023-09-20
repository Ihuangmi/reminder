const information = document.getElementById("info");
information.innerText = `本应用正在使用 Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), 和 Electron (v${versions.electron()})`;

const func = async () => {
  const response = await window.versions.invoke();
  console.log(response); // 打印 'pong'
};
func();

// 设置标题
const setButton = document.getElementById("btn");
const titleInput = document.getElementById("title");
setButton.addEventListener("click", () => {
  const title = titleInput.value;
  window.electronAPI.setTitle(title);
});

// 选择文件
const btn = document.getElementById("btn2");
const filePathElement = document.getElementById("filePath");

btn.addEventListener("click", async () => {
  const filePath = await window.electronAPI.openFile();
  filePathElement.innerText = filePath;
});

// 计数器
const counter = document.getElementById("counter");
// 3.4、调用主进程事件函数修改UI
window.electronAPI.onUpdateCounter((event, value) => {
  const oldValue = Number(counter.innerText);
  const newValue = oldValue + value;
  counter.innerText = newValue;
  // 3.5、传递数据给主进程
  event.sender.send("counter-value", newValue);
});
