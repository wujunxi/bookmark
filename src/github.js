(function ($, win) {

    function ajax(type, url, data, callback) {
        return $.ajax({
            type: type,
            url: url,
            data: data,
            success: function (res) {
                callback && callback(null, res);
            },
            error: function (xhr) {
                callback && callback(
                    (xhr.responseJSON && xhr.responseJSON.message) || 'error',
                    xhr.status
                );
            }
        });
    }

    // jquery ajax extend
    $.put = function (url, data, callback) {
        return ajax('put', url, data, callback);
    };

    $.delete = function (url, data, callback) {
        return ajax('delete', url, data, callback);
    }

    $.get = function (url, data, callback) {
        return ajax('get', url, data, callback);
    }

    $.post = function (url, data, callback) {
        return ajax('post', url, data, callback);
    }

    function GitHubHelper(username, accessToken) {
        this._user = username;
        this._repo = '';
        this._token = accessToken;
        this.API_DOMAIN = 'https://api.github.com';
        this.URL = {
            userInfo: this.API_DOMAIN + '/users/:user', // GET
            fileInfo: this.API_DOMAIN + '/repos/:user/:repo/contents/:path', // GET
            getRepos: this.API_DOMAIN + '/user/repos', // GET
            getRepo: this.API_DOMAIN + '/repos/:owner/:repo', // GET
            createRepo: this.API_DOMAIN + '/user/repos', // POST
            deleteRepo: this.API_DOMAIN + '/repos/:user/:repo', // DELETE
            createFile: this.API_DOMAIN + '/repos/:user/:repo/contents/:path', // PUT 
            updateFile: this.API_DOMAIN + '/repos/:user/:repo/contents/:path', // PUT 
            deleteFile: this.API_DOMAIN + '/repos/:user/:repo/contents/:path' // DELETE
        };

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
    }

    GitHubHelper.prototype.url = function (name, _opts) {
        var url = this.URL[name],
            that = this,
            opts = _opts || {};
        if (!url) return '';
        return url.replace(/:(\w+)/g, function (match, match1) {
            return opts[match1] ? opts[match1] : that['_' + match1];
        });
    };

    /**
     * 获取用户信息
     */
    GitHubHelper.prototype.getUserInfo = function (cb) {
        $.get(this.url('userInfo'), {}, cb);
        return this;
    };

    /**
     * 获取文件信息
     */
    GitHubHelper.prototype.getFileInfo = function (_opts, cb) {
        var opts = $.extend({
            repo: '',
            branch: 'master',
            path: ''
        }, _opts);
        $.get(this.url('fileInfo', opts), {}, cb);
        return this;
    };

    /**
     * 获取文件内容
     */
    GitHubHelper.prototype.getFile = function (_opts, cb) {
        var that = this;
        this.getFileInfo(_opts, function (err, res) {
            if (err) {
                cb(err);
            } else {
                cb(null, that.base64.decode(res['content']));
            }
        });
        return this;
    };

    /**
     * 获取json格式文件
     */
    GitHubHelper.prototype.getJsonFile = function (_opts, cb) {
        this.getFile(_opts, function (err, res) {
            if (err) {
                cb(err);
                return;
            }
            var result = '';
            if (!res) {
                cb(null, '');
                return;
            }
            try {
                result = JSON.parse(res);
            } catch (e) {
                cb(e);
                return;
            }
            cb(null, result);
        });
        return this;
    };

    /**
     * 不存在路径则新建
     */
    GitHubHelper.prototype.touchPath = function (_opts, cb) {
        var that = this;
        var opts = $.extend({
            repo: '',
            path: '',
        }, _opts);
        return this.getRepo({
            owner: this._user,
            repo: opts.repo,
        }, function (err, result) {
            // 不存在仓库，则新建
            if (err && result == 404) {
                that.createRepo({
                    name: opts.repo,
                    private: true,
                }, function (err, result) {
                    if (err) {
                        cb(err, result);
                        return;
                    }
                    that.createFile({
                        repo: opts.repo,
                        path: opts.path,
                    }, cb);
                });
            } else if (err) {
                // 有错误则返回
                cb(err, result);
                return;
            } else {
                // touch 文件
                that.touchFile({
                    repo: opts.repo,
                    path: opts.path,
                }, cb);
            }
        });
    };

    GitHubHelper.prototype.touchFile = function (_opts, cb) {
        var that = this;
        var opts = $.extend({
            repo: '',
            path: '',
        }, _opts);
        this.getFileInfo({
            repo: opts.repo,
            path: opts.path,
        }, function (err, result) {
            // 无则新建
            if (err && result == 404) {
                that.createFile({
                    repo: opts.repo,
                    path: opts.path,
                }, cb);
                return;
            }
            cb(err, result);
        });
    };

    /**
     * 获取（登录用户）所有分支信息
     */
    GitHubHelper.prototype.getRepos = function (_opts, cb) {
        var opts = $.extend({
            // visibility: 'all', // all,public,private
            // affiliation: 'owner,collaborator,organization_member',
            type: 'all', // all, owner, public, private, member
            sort: 'full_name', // created, updated, pushed, full_name
            direction: 'asc' // asc,desc
        }, _opts);
        $.get(this.url('getRepos'), opts, cb);
        return this;
    };

    GitHubHelper.prototype.getRepo = function (_opts, cb) {
        var opts = $.extend({
            owner: '',
            repo: '',
        }, _opts);
        $.get(this.url('getRepo', opts), {}, cb);
        return this;
    };
    /**
     * 创建分支
     */
    GitHubHelper.prototype.createRepo = function (_data, cb) {
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
    };
    /**
     * 删除分支
     */
    GitHubHelper.prototype.deleteRepo = function (_opts, cb) {
        var opts = $.extend({
            repo: ''
        }, _opts);
        $.delete(this.url('deleteRepo', opts), opts, cb);
    };
    /**
     * 创建文件
     */
    GitHubHelper.prototype.createFile = function (_opts, cb) {
        var opts = $.extend({
            repo: '',
            branch: 'master',
            path: '',
            message: '',
            content: ''
        }, _opts);
        var data = JSON.stringify(opts);
        $.put(this.url('createFile', opts), data, cb);
        return this;
    };
    /**
     * 创建JSON文件
     */
    GitHubHelper.prototype.createJsonFile = function (_opts, cb) {
        var opts = $.extend({
            content: ''
        }, _opts);
        opts.content = this.base64.encode(JSON.stringify(opts.content));
        this.createFile(opts, cb);
        return this;
    };
    /**
     * 更新文件
     */
    GitHubHelper.prototype.updateFile = function (_opts, cb) {
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
    };
    /**
     * 更新JSON文件
     */
    GitHubHelper.prototype.updateJsonFile = function (_opts, cb) {
        var opts = $.extend({
            isFormat: true, // 默认格式化
            content: ''
        }, _opts);
        var content = opts.content;
        try {
            if (opts.isFormat) {
                content = this.base64.encode(JSON.stringify(content, ' ', 4));
            } else {
                content = this.base64.encode(JSON.stringify(content));
            }
        } catch (e) {
            cb(e);
            return;
        }
        opts.content = content;
        this.createFile(opts, cb);
        return this;
    };
    /**
     * 删除文件
     */
    GitHubHelper.prototype.deleteFile = function (_opts, cb) {
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
    };

    win.GitHubHelper = GitHubHelper;
})(jQuery, window);