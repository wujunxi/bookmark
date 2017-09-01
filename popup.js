$(function() {

    var pageController = {
        init: function() {
            this.$loading = $('#divLoading');
            this.$divLogin = $('#divLogin');
            this.$tbUsername = $('#tbUsername');
            this.$tbToken = $('#tbToken');
            this.$tbPath = $('#tbPath');
            this.$divTip = $('#divTip');
            this.$btnUpload = $('#btnUpload');
            this.$btnDownload = $('#btnDownload');
            this.bindEvent();
        },
        bindEvent: function() {
            var that = this;
            this.$divLogin.on('focus', '.input', function() {
                $('.input').removeClass('error');
                that.$divTip.hide();
            });
            this.$btnUpload.click(this.onUpload.bind(this));
        },
        onUpload: function() {
            var that = this;
            var formObj = this.collectForm();
            var result = this.checkForm(formObj);
            if (result !== true) {
                this.$divTip.text(result).show();
                return;
            }
            this.$loading.show();
            this.getBookmarks(function(bookmarks) {
                that.upload(bookmarks, formObj, function() {
                    that.$loading.hide();
                });
            });
        },
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
        collectForm: function() {
            var obj = {};
            obj.username = this.$tbUsername.val();
            obj.token = this.$tbToken.val();
            obj.path = this.$tbPath.val();
            return obj;
        },
        upload: function(bookmarks, opts, cb) {
            var that = this,
                paths = opts.path.split('/'),
                repo = paths[0],
                path = opts.path.replace(repo + '/', '');
            // 检查文件是否存在
            gitHubController.init(opts.username, opts.token)
                .getFileInfo({
                    repo: repo,
                    path: path
                }, function(res) {
                    if(res.message){
                        that.$divTip.text(res.message).show();
                        that.$loading.hide();
                    }else{

                    }
                });
        },
        download: function() {

        },
        getBookmarks: function(cb) {
            chrome.bookmarks.getTree(cb);
        },
    };

    pageController.init();

});