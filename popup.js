$(function() {

    // 获取用户信息
    // $.get('https://api.github.com/users/wujunxi', function(res) {
    //     console.log(res);
    // });

    // 登陆
    // 4c8e00eef3453ca6b511eed85fdeb71951756823
    // $.get('https://api.github.com/?access_token=4c8e00eef3453ca6b511eed85fdeb71951756823', function(res) {
    //     console.log(res);
    // })

    // 获取文件信息
    // /repos/:owner/:repo/contents/:path
    // $.get('https://api.github.com/repos/wujunxi/frontend-subject/contents/bookmark-data/data.json', function(res) {
    //     console.log(res);
    // });

    // 读取raw格式文件
    // $.get('https://raw.githubusercontent.com/wujunxi/frontend-subject/master/bookmark-data/data.json', function(res) {
    //     console.log(JSON.parse(res));
    // });

    // 获取书签信息
    // chrome.bookmarks.getTree(function(args) {
    //     console.log(JSON.stringify(args));
    // });

    var base = new Base64();
    var obj = {
        name: 'test',
        age: 123,
        phone: 1882133123
    };
    var result = base.encode(JSON.stringify(obj));
    // 创建一个文件
    // PUT /repos/:owner/:repo/contents/:path
    $.ajax({
        url: "https://api.github.com/repos/wujunxi/frontend-subject/contents/bookmark-data/data2.json",
        type: 'put',
        data: {
            message: 'create new json data',
            content: result,
            branch: 'master'
        },
        success: function(res) {
            console.log(res);
        }
    });
});