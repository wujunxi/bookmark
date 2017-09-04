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
            this.$btnUpload = $('#btnUpload');
            this.$btnDownload = $('#btnDownload');
            this.$divSuccess = $('#divSuccess');
            this.$divSuccessInfo = $('#divSuccessInfo');
            this.bindEvent();
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
                this.getBookmarks(function(bookmarks) {
                    that.upload(bookmarks, opts, function() {
                        that.$loading.hide();
                    });
                });
            } else {
                this.download(opts, function(bookmarks) {
                    that.setBookmarks(bookmarks,function(){
                        that.$loading.hide();
                    });
                });
            }
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
            // 检查文件是否存在
            gitHubController.init(opts.username, opts.token)
                .getFileInfo({
                    repo: opts.repo,
                    path: opts.path
                }, function(getFileInfoRes) {
                    // 不存在则创建文件，存在则更新
                    if (getFileInfoRes.message) {
                        gitHubController.createJsonFile({
                            repo: opts.repo,
                            branch: 'master',
                            path: opts.path,
                            message: 'first commit',
                            content: bookmarks
                        }, function(createJsonFileRes) {
                            if (createJsonFileRes.message) {
                                that.$divTip.text(createJsonFileRes.message).show();
                            } else {
                                that.$divSuccess.show();
                                that.$divSuccessInfo.text('Upload Success');
                            }
                            cb && cb();
                        });
                    } else {
                        gitHubController.updateJsonFile({
                            repo: opts.repo,
                            branch: 'master',
                            path: opts.path,
                            message: 'update',
                            sha: getFileInfoRes.sha,
                            content: bookmarks
                        }, function(updateJsonFileRes) {
                            if (updateJsonFileRes.message) {
                                that.$divTip.text(updateJsonFileRes.message).show();
                            } else {
                                that.$divSuccess.show();
                                that.$divSuccessInfo.text('Upload Success');
                            }
                            cb && cb();
                        });
                    }
                });
        },
        /**
         * 从github下载配置
         */
        download: function(opts, cb) {
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
            this.removeBookmarksFolder('1', function() {
                // console.log('finish');
                addBookmarks('1', bookmarks[0]);
            });

            function addBookmarks(parentId, bookmarks) {
                var i, len, list = bookmarks.children || [];
                addTask(list.length);
                for (i = 0, len = list.length; i < len; i++) {
                    (function(item) {
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
         * 移除书签栏文件夹
         */
        removeBookmarksFolder: function(id, cb) {
            chrome.bookmarks.getChildren(id, function(children) {
                // console.log(arguments);
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