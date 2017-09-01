$(function() {

    var pageController = {
        init: function() {
            this.$tbUsername = $('#tbUsername');
            this.$tbToken = $('#tbToken');
            this.$tbPath = $('#tbPath');
            this.$divTip = $('#divTip');
            this.$btnSure = $('#btnSure');
            this.bindEvent();
        },
        bindEvent: function() {
            this.$tbUsername.on('input', this.onInput.bind(this));
            this.$tbToken.on('input', this.onInput.bind(this));
            this.$tbPath.on('input', this.onInput.bind(this));
            this.$btnSure.click(this.onSure.bind(this));
        },
        onInput: function() {
            var formObj = this.collectForm(),
                isRight = true;
            for (var k in formObj) {
                if (formObj[k] == '') {
                    isRight = false;
                }
            }
            this.$btnSure.toggleClass('disabled', !isRight);
        },
        onSure: function() {
            if (this.$btnSure.hasClass('disabled')) {
                return;
            }
            var that = this;
            var formObj = this.collectForm();
            this.getBookmarks(function(bookmarks) {
                that.upload(bookmarks);
            });
        },
        checkForm: function(formObj) {
            if (formObj.username == '' || formObj.token == '') {
                return 'Incorrect username or token'
            }
        },
        collectForm: function() {
            var obj = {};
            obj.username = this.$tbUsername.val();
            obj.token = this.$tbToken.val();
            obj.path = this.$tbPath.val();
            return obj;
        },
        getBookmarks: function(cb) {
            chrome.bookmarks.getTree(cb);
        },
    };

    pageController.init();

});