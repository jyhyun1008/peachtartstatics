
function getQueryStringObject() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}

var qs = getQueryStringObject();

var host = qs.host;
var token = qs.token;

if (!host) {

    document.querySelector('#post').innerHTML = '그리고 아무 일도 일어나지 않았다....(인스턴스 주소를 써주세요!)'

} else if (!token) { // 새로 App을 만들겁니당

    const appCreateUrl = 'https://'+host+'/api/app/create'
    const appCreateParam = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            name: "PeachtaRoom",
            description: "방을 꾸미고 놀 수 있는 플레이입니다. 인테리어를 불러오는 데에 유저들의 노트를 사용하기에, 노트를 자동 작성하기 위한 앱을 작성합니다.",
            permission: ["write:notes"],
            callbackUrl: 'https://yeojibur.in/peachtartstatics',
        })
    }

    fetch(appCreateUrl, appCreateParam)
    .then((createdAppData) => {return createdAppData.json()})
    .then((createdAppRes) => {
        console.log(createdAppRes)
        if (createdAppRes.secret) {
            var appSecret = createdAppRes.secret
            const generateSessionUrl = 'https://'+host+'/api/auth/session/generate'
            const generateSessionParam = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    appSecret: appSecret
                })
            }

            fetch(generateSessionUrl, generateSessionParam)
            .then((sessionData) => {return sessionData.json()})
            .then((sessionRes) => {
                console.log(sessionRes)
                if (sessionRes.token) {
                    var token = sessionRes.token
                    var authUrl = sessionRes.url
                    location.href = authUrl
                }
            })
            .catch((error) => console.log(error));
        }
    })
    .catch((error) => console.log(error));

} else if (token) {

    const appShowUrl = 'https://'+host+'/api/auth/session/show'
    const appShowParam = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            token: token
        })
    }

    fetch(appShowUrl, appShowParam)
    .then((appData) => {return appData.json()})
    .then((appRes) => {
        if (appRes.app.secret) {
            appSecret = appRes.app.secret

            const userKeyUrl = 'https://'+host+'/api/auth/session/userkey'
            const userKeyParam = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    appSecret: appSecret,
                    token: token
                })
            }

            fetch(userKeyUrl, userKeyParam)
            .then((userKeyData) => {return userKeyData.json()})
            .then((userKeyRes) => {
                console.log(userKeyRes)
                if (userKeyRes.accessToken) {
                    var accessToken = userKeyRes.accessToken
                    const i = CryptoJS.SHA256(accessToken + appSecret).toString(CryptoJS.enc.Hex);
                    console.log(i)
                    const findIdUrl = 'https://'+host+'/api/i'
                    const findIdParam = {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                    }
                    
                    fetch(findIdUrl, findIdParam)
                    .then((idData) => {return idData.json()})
                    .then((idRes) => {
                        console.log(idRes)
                        if (idRes.username) {
                            var myId = idRes.username
                            const noteCreateUrl = 'https://'+host+'/api/notes/create'
                            const noteCreateParam = {
                                headers: {
                                    'content-type': 'application/json',
                                },
                                body: JSON.stringify({
                                    i: i,
                                    text: "냐옹 #"+myId+"PeachtaRoom"
                                }),
                                credentials: 'omit',
                                method: 'POST'
                            }
                            fetch(noteCreateUrl, noteCreateParam)
                            .then((noteData) => {return noteData.json()})
                            .then((noteRes) => {console.log(noteRes)})
                            .catch((error) => console.log(error));
                        }
                    })
                    .catch((error) => console.log(error));
                }
            })
            .catch((error) => console.log(error));
        }
    })
    .catch((error) => console.log(error))
}

