(function($, win) {

    // jquery ajax extend put\delete
    $.put = function(url, data, callback) {
        return $.ajax({
            type: "put",
            url: url,
            data: data,
            success: callback
        });
    };

    $.delete = function(url, data, callback) {
        return $.ajax({
            type: "delete",
            url: url,
            data: data,
            success: callback
        });
    }
    
    var API_DOMAIN = 'https://api.github.com';

    var gitHubController = win.gitHubController = {
        URL: {
            userInfo: API_DOMAIN + '/users/:user', // GET
            fileInfo: API_DOMAIN + '/repos/:user/:repo/contents/:path', // GET
            rawFile: 'https://raw.githubusercontent.com/:user/:repo/:branch/:path', // GET
            getRepos: API_DOMAIN + '/user/repos', // GET
            createRepo: API_DOMAIN + '/user/repos', // POST
            deleteRepo: API_DOMAIN + '/repos/:user/:repo', // DELETE
            createFile: API_DOMAIN + '/repos/:user/:repo/contents/:path', // PUT 
            updateFile: API_DOMAIN + '/repos/:user/:repo/contents/:path', // PUT 
            deleteFile: API_DOMAIN + '/repos/:user/:repo/contents/:path' // DELETE
        },
        url: function(name, _opts) {
            var url = this.URL[name],
                that = this,
                opts = _opts || {};
            if (!url) return '';
            return url.replace(/:(\w+)/g, function(match, match1) {
                return opts[match1] ? opts[match1] : that[match1];
            });
        },
        /**
         * 初始化
         */
        init: function(user, accessToken) {
            this.user = user;
            this.accessToken = accessToken;
            this.base64 = new Base64();
            var setupSetting = {
                contentType: 'application/json'
            };
            if (accessToken) {
                setupSetting.headers = {
                    Authorization: 'token ' + accessToken
                };
            }
            $.ajaxSetup(setupSetting);
            return this;
        },
        /**
         * 获取用户信息
         */
        getUserInfo: function(cb) {
            $.get(this.url('userInfo'), cb);
            return this;
        },
        /**
         * 获取文件信息
         */
        getFileInfo: function(_opts, cb) {
            var opts = $.extend({
                repo: '',
                branch: '',
                path: ''
            }, _opts);
            $.get(this.url('fileInfo', opts), cb);
            return this;
        },
        /**
         * 获取文件内容
         */
        getFile: function(_opts, cb) {
            var that = this;
            this.getFileInfo(_opts, function(res) {
                cb(that.base64.decode(res['content']));
            });
            return this;
        },
        /**
         * 获取json格式文件
         */
        getJsonFile: function(_opts, cb) {
            this.getFile(_opts, function(res) {
                cb(JSON.parse(res));
            });
            return this;
        },
        /**
         * 获取（登录用户）所有分支信息
         */
        getRepos: function(_opts, cb) {
            var opts = $.extend({
                // visibility: 'all', // all,public,private
                // affiliation: 'owner,collaborator,organization_member',
                type: 'all', // all, owner, public, private, member
                sort: 'full_name', // created, updated, pushed, full_name
                direction: 'asc' // asc,desc
            }, _opts);
            $.get(this.url('getRepos'), opts, cb);
            return this;
        },
        /**
         * 创建分支
         */
        createRepo: function(_data, cb) {
            var data = $.extend({
                name: '',
                description: '',
                private: false,
                has_issues: false,
                has_projects: false,
                has_wiki: false,
                auto_init: true
            }, _data);
            data = JSON.stringify(data);
            $.post(this.url('createRepo'), data, cb);
            return this;
        },
        /**
         * 删除分支
         */
        deleteRepo: function(_opts, cb) {
            var opts = $.extend({
                repo: ''
            }, _opts);
            $.delete(this.url('deleteRepo', opts), opts, cb);
        },
        /**
         * 创建文件
         */
        createFile: function(_opts, cb) {
            var opts = $.extend({
                repo: '',
                branch: '',
                path: '',
                message: '',
                content: ''
            }, _opts);
            var data = JSON.stringify(opts);
            $.put(this.url('createFile', opts), data, cb);
            return this;
        },
        /**
         * 创建JSON文件
         */
        createJsonFile: function(_opts, cb) {
            var opts = $.extend({
                content: ''
            }, _opts);
            opts.content = this.base64.encode(JSON.stringify(opts.content));
            this.createFile(opts, cb);
            return this;
        },
        /**
         * 更新文件
         */
        updateFile: function(_opts, cb) {
            var opts = $.extend({
                repo: '',
                branch: '',
                path: '',
                message: '',
                content: '',
                sha: ''
            }, _opts);
            var data = JSON.stringify(opts);
            $.put(this.url('createFile', opts), data, cb);
            return this;
        },
        /**
         * 更新JSON文件
         */
        updateJsonFile: function(_opts, cb) {
            var opts = $.extend({
                content: ''
            }, _opts);
            opts.content = this.base64.encode(JSON.stringify(opts.content));
            this.createFile(opts, cb);
            return this;
        },
        /**
         * 删除文件
         */
        deleteFile: function(_opts, cb) {
            var opts = $.extend({
                repo: '',
                branch: '',
                path: '',
                message: '',
                sha: ''
            }, _opts);
            var data = JSON.stringify(opts);
            $.delete(this.url('deleteFile', opts), data, cb);
            return this;
        }
    };

    gitHubController.init('wujunxi', '566d36b2f46f91ac0bc74dcccff4eee04e81afe4');

    // gitHubController.getUserInfo(function(res) {
    //     console.log('user info:');
    //     console.log(res);
    // })

    // gitHubController.getRepos({}, function(res) {
    //     console.log('my repos');
    //     console.log(res);
    // });

    // gitHubController.getFileInfo({
    //     repo: 'test-github-api',
    //     branch: 'master',
    //     path: 'data.json'
    // }, function(res) {
    //     console.log('file info:');
    //     console.log(res);
    // });

    // gitHubController.getJsonFile({
    //     repo: 'test-github-api',
    //     branch: 'master',
    //     path: 'data.json'
    // }, function(res) {
    //     console.log('json file:');
    //     console.log(res);
    // });

    // gitHubController.createRepo({
    //     name:'test-github-api',
    //     description:'only test'
    // },function(res){
    //     console.log('create repo');
    //     console.log(res);
    // });

    // gitHubController.deleteRepo({
    //     repo:'test-github-api'
    // },function(res){
    //     console.log('delete repo');
    //     console.log(res);
    // });

    // gitHubController.createJsonFile({
    //     repo: 'test-github-api',
    //     branch: 'master',
    //     path: 'data.json',
    //     message: 'first commit',
    //     content: {
    //         name:'hello world!'
    //     }
    // },function(res){
    //     console.log('create file:');
    //     console.log(res);
    // });

    // 171d6e9b238ab7210721db78b93e4c6b5185bcfd 
    // gitHubController.updateJsonFile({
    //     repo: 'test-github-api',
    //     branch: 'master',
    //     path: 'data.json',
    //     message: 'update',
    //     sha:'171d6e9b238ab7210721db78b93e4c6b5185bcfd', // 待更新文件的sha
    //     content: {
    //         text: 'hello world!'
    //     }
    // }, function(res) {
    //     console.log('update file:');
    //     console.log(res);
    // });

    // gitHubController.deleteFile({
    //     repo: 'test-github-api',
    //     branch: 'master',
    //     path: 'data.json',
    //     message: 'delete file',
    //     sha: '4b1dde0ccf1a13db77f423341b54b546cff83f76'
    // },function(res){
    //     console.log('delete file');
    //     console.log(res);
    // });

})(jQuery, window);