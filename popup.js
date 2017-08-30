$(function() {

    $.get('https://api.github.com/users/wujunxi', function(res) {
        console.log(res);
    });

    // 4c8e00eef3453ca6b511eed85fdeb71951756823
    $.get('https://api.github.com/?access_token=4c8e00eef3453ca6b511eed85fdeb71951756823', function(res) {
        console.log(res);
    })

    chrome.bookmarks.getTree(function(args) {
        console.log(args);
    });
});