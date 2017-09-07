$(function() {

    var pageController = {
        /**
         * 初始化
         */
        init: function() {
            this.$loading = $('#divLoading');
            this.$divLogin = $('#divLogin');
            this.$tbUsername = $('#tbUsername');
            this.$tbToken = $('#tbToken');
            this.$tbPath = $('#tbPath');
            this.$divTip = $('#divTip');
            this.$divRemember = $('#divRemember');
            this.$spToggle = $('#spToggle');
            this.$btnUpload = $('#btnUpload');
            this.$btnDownload = $('#btnDownload');
            this.$divSuccess = $('#divSuccess');
            this.$divSuccessInfo = $('#divSuccessInfo');
            this.bindEvent();
            this.getUserInfo();
        },
        /**
         * 事件绑定
         */
        bindEvent: function() {
            var that = this;
            this.$divLogin.on('focus', '.input', function() {
                $('.input').removeClass('error');
                that.$divTip.hide();
            });
            this.$btnUpload.click(this.onOper.bind(this));
            this.$btnDownload.click(this.onOper.bind(this));
            this.$spToggle.click(function() {
                var $this = $(this);
                $this.toggleClass('on');
                that.$divRemember.toggleClass('off');
            });
        },
        /**
         * 操作事件
         */
        onOper: function(e) {
            var that = this,
                $elem = $(e.target),
                type = $elem.attr('data-type');
            var formObj = this.collectForm();
            var result = this.checkForm(formObj);
            if (result !== true) {
                this.$divTip.text(result).show();
                return;
            }
            this.$loading.show();
            // 参数加工
            var paths = formObj.path.split('/'),
                repo = paths[0],
                path = formObj.path.replace(repo + '/', ''),
                opts = {
                    repo: repo,
                    path: path,
                    username: formObj.username,
                    token: formObj.token
                };
            if (type == 'upload') {
                // 获取当前书签栏书签，并上传
                this.getBookmarks(function(bookmarks) {
                    that.upload(bookmarks, opts, function(err) {
                        if (err) {
                            that.$divTip.text(err).show();
                        } else {
                            that.$divSuccess.show();
                            that.$divSuccessInfo.text('Upload Success');
                        }
                        that.$loading.hide();
                    });
                });
            } else {
                // 下载书签配置，并替换当前书签栏
                this.download(opts, function(err, bookmarks) {
                    if (err) {
                        that.$divTip.text(err).show();
                        that.$loading.hide();
                    } else {
                        that.setBookmarks(bookmarks, function() {
                            that.$loading.hide();
                            that.$divSuccess.show();
                            that.$divSuccessInfo.text('Download Success');
                        });
                    }
                });
            }
            // 处理记住用户信息
            if (this.$spToggle.hasClass('on')) {
                this.saveUserInfo(formObj);
            } else {
                this.clearUserInfo();
            }
        },
        /**
         * 清除用户信息
         */
        clearUserInfo: function() {
            chrome.storage.local.clear(function() {
                console.log('clear user info success');
            });
        },
        /**
         * 保存用户信息
         */
        saveUserInfo: function(obj) {
            chrome.storage.local.set(obj, function() {
                console.log('save user info success');
            });
        },
        /**
         * 获取用户信息
         */
        getUserInfo: function() {
            var that = this;
            chrome.storage.local.get(['username', 'token', 'path'], function(obj) {
                // console.log(obj);
                var flag = false;
                if (obj.username) {
                    that.$tbUsername.val(obj.username);
                    that.$tbToken.val(obj.token);
                    that.$tbPath.val(obj.path);
                    flag = true;
                }
                that.$divRemember.toggleClass('off', !flag);
                that.$spToggle.toggleClass('on', flag);
            });
        },
        /**
         * 表单校验
         */
        checkForm: function(formObj) {
            if (formObj.username == '') {
                this.$tbUsername.addClass('error');
                return 'Username is required';
            }
            if (formObj.token == '') {
                this.$tbToken.addClass('error');
                return 'Token is required';
            }
            if (formObj.path == '') {
                this.$tbPath.addClass('error');
                return 'Path is required';
            }
            return true;
        },
        /**
         * 表单收集
         */
        collectForm: function() {
            var obj = {};
            obj.username = this.$tbUsername.val();
            obj.token = this.$tbToken.val();
            obj.path = this.$tbPath.val();
            return obj;
        },
        /**
         * 上传配置到github
         */
        upload: function(bookmarks, opts, cb) {
            var that = this;
            // 初始化认证
            gitHubController.init(opts.username, opts.token)
                // 检查文件是否存在
                .getFileInfo({
                    repo: opts.repo,
                    path: opts.path
                }, function(err, getFileInfoRes) {
                    if (err) {
                        // 不存在文件，则创建文件
                        gitHubController.createJsonFile({
                            repo: opts.repo,
                            branch: 'master',
                            path: opts.path,
                            message: 'first commit',
                            content: bookmarks
                        }, cb);
                    } else {
                        // 存在文件，则更新文件
                        gitHubController.updateJsonFile({
                            repo: opts.repo,
                            branch: 'master',
                            path: opts.path,
                            message: 'update',
                            sha: getFileInfoRes.sha,
                            content: bookmarks
                        }, cb);
                    }
                });
        },
        /**
         * 从github下载配置
         */
        download: function(opts, cb) {
            var that = this;
            gitHubController.init(opts.username, opts.token)
                .getJsonFile({
                    repo: opts.repo,
                    branch: 'master',
                    path: opts.path
                }, cb);
        },
        getBookmarks: function(cb) {
            // 0-书签栏根目录 1-书签栏 2-其他书签栏
            chrome.bookmarks.getSubTree('1', cb);
        },
        setBookmarks: function(bookmarks, cb) {
            // 先清空文件夹
            this.emptyBookmarksFolder('1', function() {
                // 递归添加书签
                addBookmarks('1', bookmarks[0]);
            });

            function addBookmarks(parentId, bookmarks) {
                var i, len, list = bookmarks.children || [];
                addTask(list.length);
                for (i = 0, len = list.length; i < len; i++) {
                    (function(item) {
                        // 创建书签
                        chrome.bookmarks.create({
                            parentId: parentId,
                            index: item.index,
                            title: item.title,
                            url: item.url
                        }, function(newBookmark) {
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
                    cb();
                }
            }
        },
        /**
         * 清空书签栏文件夹
         */
        emptyBookmarksFolder: function(id, cb) {
            // 获取书签树并逐个移除子节点
            chrome.bookmarks.getChildren(id, function(children) {
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

    pageController.init();
});