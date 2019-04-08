$(function () {

    var pageController = {
        /**
         * 初始化
         */
        init: function () {
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
        bindEvent: function () {
            var that = this;
            this.$divLogin.on('focus', '.input', function () {
                $('.input').removeClass('error');
                that.$divTip.hide();
            });
            this.$btnUpload.click(this.onOper.bind(this));
            this.$btnDownload.click(this.onOper.bind(this));
            this.$spToggle.click(function () {
                var $this = $(this);
                $this.toggleClass('on');
                that.$divRemember.toggleClass('off');
            });
        },
        /**
         * 获取参数
         */
        getParams: function (cb) {
            var formObj = this.collectForm();
            var result = this.checkForm(formObj);
            if (result !== true) {
                cb(new Error(result));
                return;
            }
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
            this.checkRemember(formObj);
            cb(null, opts);
            return this;
        },
        tipSuccess: function (text) {
            this.$loading.hide();
            this.$divSuccess.show();
            this.$divSuccessInfo.text(text);
        },
        tipError: function (err) {
            this.$loading.hide();
            this.$divTip.text(err).show();
        },
        /**
         * 操作事件
         */
        onOper: function (e) {
            var that = this;
            var $elem = $(e.target);
            var type = $elem.attr('data-type');
            this.getParams(function (err, params) {
                if (err) {
                    that.tipError(err);
                    return;
                }
                that.gitHubController = new GitHubHelper(params.username, params.token);
                bookmarksHelper.gitHubController = that.gitHubController;
                that.$loading.show();
                that.gitHubController.touchPath({
                    repo: params.repo,
                    path: params.path,
                }, function (err) {
                    if (err) {
                        that.tipError(err);
                        return;
                    }
                    if (type == 'upload') {
                        // 获取当前书签栏书签，并上传
                        bookmarksHelper.getBookmarks(function (bookmarks) {
                            bookmarksHelper.upload(bookmarks, {
                                repo: params.repo,
                                path: params.path,
                            }, function (err) {
                                if (err) {
                                    that.tipError(err);
                                } else {
                                    that.tipSuccess('Upload Success');
                                }
                            });
                        });
                    } else {
                        // 下载书签配置，并替换当前书签栏
                        bookmarksHelper.download({
                            repo: params.repo,
                            path: params.path,
                        }, function (err, bookmarks) {
                            if (err) {
                                that.tipError(err);
                            } else {
                                bookmarksHelper.setBookmarks(bookmarks, function (err) {
                                    if (err) {
                                        that.tipError(err);
                                    } else {
                                        that.tipSuccess('Download Success');
                                    }
                                });
                            }
                        });
                    }
                });
            });
        },
        /**
         * 保存状态
         */
        checkRemember: function (formObj) {
            // 处理记住用户信息
            if (this.$spToggle.hasClass('on')) {
                bookmarksHelper.saveConfig(formObj);
            } else {
                bookmarksHelper.clearConfig();
            }
        },
        /**
         * 获取用户信息
         */
        getUserInfo: function () {
            var that = this;
            bookmarksHelper.getConfig(function (err, obj) {
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
        checkForm: function (formObj) {
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
        collectForm: function () {
            var obj = {};
            obj.username = this.$tbUsername.val();
            obj.token = this.$tbToken.val();
            obj.path = this.$tbPath.val();
            return obj;
        },
    };

    pageController.init();
});