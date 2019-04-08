# Bookmark

> 上传/下载书签数据到Github

[Chrome webstore](https://chrome.google.com/webstore/detail/%E4%B9%A6%E7%AD%BE%E5%90%8C%E6%AD%A5/fbcbemgibdnpboehnfcnkegefaomnlbk?hl=zh-CN&gl=CN)

使用指南：

- 登录 [GitHub](https://github.com/)，在 Settings / Developer settings/ Personal access tokens 下，点击Generate new token 生成一个访问token

- 生成的 token 需要勾选 repo 权限，保存生成的 token

- 点击插件icon，依次输入用户名、凭据、路径（默认：my_bookmarks/data.json）

- 路径即：仓库名/书签文件名.json

- 如果需要记住填写的用户名和token数据，需要打开 Remember Me 开关

- 填写完用户数据后，便可以进行“上传”或“下载”操作

**注意：上传/下载操作是全量覆盖，不了解的情况下请先导出书签为本地文件，以防数据丢失**

### to-do

- 不存在则自动创建书签仓库及文件 done

- 监听书签修改事件自动上传更新

- 一键整理书签

- 统计书签访问情况

- 书签加密

- 支持码云 [https://gitee.com/](https://gitee.com/)

### 参考文档
  
- [Github API](https://developer.github.com/v3/)

- [Chrome Extensions](https://developer.chrome.com/extensions/overview)

- [Chrome Extensions/Bookmarks](https://developer.chrome.com/extensions/bookmarks)