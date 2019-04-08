
var bookmarksHelper = {
    _defaultConfig: {
        username: '',
        token: '',
        path: '',
        auto: false,
    },
    saveConfig: function (_obj, cb) {
        var obj = Object.assign(this._defaultConfig, _obj);
        chrome.storage.local.set(obj, function () {
            // console.log('save user info success');
            cb && cb(null);
        });
    },
    getConfig: function (cb) {
        chrome.storage.local.get(['username', 'token', 'path', 'auto'], function (obj) {
            cb && cb(null, obj);
        });
    },
    clearConfig: function (cb) {
        chrome.storage.local.clear(function () {
            cb && cb(null);
        });
    },
    /**
     * 上传配置到github
     */
    upload: function (bookmarks, opts, cb) {
        var that = this;
        // 初始化认证
        that.gitHubController
            // 检查文件是否存在
            .getFileInfo({
                repo: opts.repo,
                path: opts.path
            }, function (err, getFileInfoRes) {
                if (err) {
                    cb(new Error(getFileInfoRes == 404 ? 'file not exits' : 'upload fail'));
                    return;
                }
                // 存在文件，则更新文件
                that.gitHubController.updateJsonFile({
                    repo: opts.repo,
                    branch: 'master',
                    path: opts.path,
                    message: 'update',
                    sha: getFileInfoRes.sha,
                    content: bookmarks
                }, cb);
            });
    },
    /**
     * 从github下载配置
     */
    download: function (opts, cb) {
        var that = this;
        that.gitHubController.getJsonFile({
            repo: opts.repo,
            branch: 'master',
            path: opts.path
        }, cb);
    },
    getBookmarks: function (cb) {
        // 0-书签栏根目录 1-书签栏 2-其他书签栏
        chrome.bookmarks.getSubTree('1', cb);
    },
    setBookmarks: function (bookmarks, cb) {
        // 返回数据为空则不操作
        if (!bookmarks || bookmarks.length == 0) {
            cb(new Error('file is empty'));
            return;
        }
        // 先清空文件夹
        this.emptyBookmarksFolder('1', function () {
            // 递归添加书签
            addBookmarks('1', bookmarks[0]);
        });

        function addBookmarks(parentId, bookmarks) {
            var i, len, list = bookmarks.children || [];
            addTask(list.length);
            for (i = 0, len = list.length; i < len; i++) {
                (function (item) {
                    // 创建书签
                    chrome.bookmarks.create({
                        parentId: parentId,
                        index: item.index,
                        title: item.title,
                        url: item.url
                    }, function (newBookmark) {
                        finishTask();
                        if (item.children && item.children.length > 0) {
                            addBookmarks(newBookmark.id, item);
                        }
                    });
                })(list[i]);
            }
        }

        var taskNum = 0,
            finishNum = 0;

        function addTask(num) {
            taskNum += num;
        }

        function finishTask() {
            finishNum++;
            if (taskNum == finishNum) {
                cb(null);
            }
        }
    },
    /**
     * 清空书签栏文件夹
     */
    emptyBookmarksFolder: function (id, cb) {
        // 获取书签树并逐个移除子节点
        chrome.bookmarks.getChildren(id, function (children) {
            var i, len, item, total = 0;
            for (i = 0, len = children.length; i < len; i++) {
                item = children[i];
                chrome.bookmarks.removeTree(item.id, removeCallback);
            }

            function removeCallback() {
                total++;
                if (len == total) {
                    cb();
                }
            }
            if (len == 0) {
                cb();
            }
        });
    }

};