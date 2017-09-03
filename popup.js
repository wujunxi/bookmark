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
            if (type == 'Download') {
                this.getBookmarks(function(bookmarks) {
                    that.upload(bookmarks, opts, function() {
                        that.$loading.hide();
                    });
                });
            } else {
                this.download(opts, function(bookmarks) {
                    that.setBookmarks(bookmarks);
                    that.$loading.hide();
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
            chrome.bookmarks.getTree(cb);
        },
        setBookmarks: function(bookmarks) {
            chrome.bookmarks.removeTree('0', function() {
                chrome.bookmarks.create(bookmarks);
            });
        }
    };

    pageController.init();

});