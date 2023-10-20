const express = require("express");
const app = express();
const path = require("path");

// express.static() 方法可以托管静态资源目录
// 通过 http://127.0.0.1:8080/index.html 可访问 public 文件夹下的资源
// app.use(express.static("public"));

// 挂载路径前缀
// 通过 http://127.0.0.1:8080/static/index.html 访问
// app.use("/static", express.static("public"));

// 但是，您提供给 express.static 函数的路径是相对于您启动 node 进程的目录的。如果您从另一个目录运行 express 应用程序，使用您要服务的目录的绝对路径会更安全：
app.use("/static", express.static(path.join(__dirname, "dist")));

app.listen(8080, () => {
  console.log("server running at http://127.0.0.1:8080/static");
});
