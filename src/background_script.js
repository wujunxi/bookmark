
function onBookmarkChange() {
    bookmarksHelper.getConfig(function (err, params) {
        if (err) {
            console.err(err);
            return;
        }
        if (!params.username || !params.path || !params.token || !GitHubHelper) {
            return;
        }
        // console.log(params);
        var paths = params.path.split('/');
        if (paths.length == 0) {
            return;
        }
        var opts = {
            repo: paths.shift(),
            path: paths.join('/'),
        };
        var gitHubController = new GitHubHelper(params.username, params.token);
        bookmarksHelper.gitHubController = gitHubController;
        bookmarksHelper.getBookmarks(function (bookmarks) {
            bookmarksHelper.upload(bookmarks, {
                repo: opts.repo,
                path: opts.path,
            }, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Upload Success');
                }
            });
        });
    });
}


chrome.storage.local.get(['username', 'token', 'path', 'auto'], function (params) {
    if (params.auto) {
        chrome.bookmarks.onCreated.addListener(onBookmarkChange);
        chrome.bookmarks.onRemoved.addListener(onBookmarkChange);
        chrome.bookmarks.onChanged.addListener(onBookmarkChange);
        chrome.bookmarks.onMoved.addListener(onBookmarkChange);
        chrome.bookmarks.onChildrenReordered.addListener(onBookmarkChange);
        // 每次打开更新下书签
        bookmarksHelper.download({
            repo: params.repo,
            path: params.path,
        }, function (err, bookmarks) {
            if (err) {
                console.error(err);
            } else {
                bookmarksHelper.setBookmarks(bookmarks, function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Download Success');
                    }
                });
            }
        });
    }
});
