
function getQueryStringObject() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0].replace(/\?/g, "")] = decodeURIComponent(p[1].replace(/\@/g, "&h="));
    }
    return b;
}

var qs = getQueryStringObject();

// 기본적으로 노트를 작성하고 삭제하는 기능 외에는 쓰지 않습니다!
if (qs.msg) { // 작성할 때
    const msg = qs.msg
    localStorage.setItem('msg', msg);
}
if (qs.cw) {
    const cw = qs.cw
    localStorage.setItem('cw', cw);
}
if (qs.tag) { // 삭제할 때 - 해시태그 검색기능을 이용할 거예요.
    const tag = qs.tag
    localStorage.setItem('tag', tag);
}

var host
if (qs.host) { // 쿼리스트링에 host가 있으면 그게 우선-적
    host = qs.host
    if (host != localStorage.getItem('host')) {
        localStorage.clear()
    }
    localStorage.setItem('host', host);
} else if (localStorage.getItem('host')) { // 없으면 로컬에 저장된 거 갖다씀
    host = localStorage.getItem('host')
}

var id, h
if (qs.id) {
    id = qs.id
    if (qs.h) {
        h = qs.h
    } else {
        h = 'i.peacht.art'
    }
    location.href = 'https://i.peacht.art/play/9h2m6c51tz?username='+id+'&host='+h
}

if (host) {
    if (localStorage.getItem('appSecret') && !qs.token) { // localStorage에 appSecret이 저장되어 있는데 토큰이 없으면 새로 앱을 만들지는 않고 인증만 진행합니다. 인증하는 데서 이 페이지의 역할은 끝.
        const appSecret = localStorage.getItem('appSecret')
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
            if (sessionRes.url) {
                var authUrl = sessionRes.url
                location.href = authUrl
            }
        })
        .catch((error) => console.log(error));
    } else if (!localStorage.getItem('appSecret')) { // localStorage에 appSecret이 저장되어 있지 않으면 토큰이 있든 말든 상관없이 새로 앱을 만듭니다. 인증하는 데서 이 페이지의 역할은 끝.
        const appCreateUrl = 'https://'+host+'/api/app/create' // 이건 원래 서버 쪽에 생성하는 앱
        const appCreateParam = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                name: "PeachtaRoom",
                description: "방을 꾸미고 놀 수 있는 플레이입니다. 인테리어를 불러오는 데에 유저들의 노트를 사용하기에, 노트를 자동 작성하기 위한 앱을 작성합니다.",
                permission: ["write:notes"],
                callbackUrl: 'https://room.peacht.art',
            })
        }
    
        fetch(appCreateUrl, appCreateParam)
        .then((createdAppData) => {return createdAppData.json()})
        .then((createdAppRes) => {
            console.log(createdAppRes)
            if (createdAppRes.secret) {
                var appSecret = createdAppRes.secret
    
                localStorage.setItem('appSecret', appSecret);
    
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
                    if (sessionRes.url) {
                        var authUrl = sessionRes.url
                        location.href = authUrl
                    }
                })
                .catch((error) => console.log(error));
            }
        })
        .catch((error) => console.log(error));
    } else if (localStorage.getItem('appSecret') && qs.token) { //appsecret과 token 이 둘다 있는경우 새로 앱을 만들지 않고 인증도 하지 않습니다
        const token = qs.token
        const appSecret = localStorage.getItem('appSecret');
    
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
                    body: JSON.stringify({
                        i: i
                    }),
                    credentials: 'omit'
                }
                
                fetch(findIdUrl, findIdParam)
                .then((idData) => {return idData.json()})
                .then((idRes) => {
                    console.log(idRes)
                    if (idRes.username) {
                        var myUserName = idRes.username
                        localStorage.setItem('userName', myUserName)
                        if (!localStorage.getItem('authId')) { // authId가 아예 없을 때 피치타르트에 앱을 새로 만듭니다.

                            const myAppCreateUrl = 'https://i.peacht.art/api/app/create'
                            const myAppCreateParam = {
                                method: 'POST',
                                headers: {
                                    'content-type': 'application/json',
                                },
                                body: JSON.stringify({
                                    name: '@'+localStorage.getItem('userName')+'@'+host ,
                                    description: " ",
                                    permission: ["write:notes"],
                                    callbackUrl: 'https://'+host ,
                                })
                            }
                            fetch(myAppCreateUrl, myAppCreateParam)
                            .then((myAppData) => {return myAppData.json()})
                            .then((myAppRes) => {
                                console.log(myAppRes)
                                localStorage.setItem('authId', myAppRes.id)
                                location.href = location.href = 'https://i.peacht.art/play/9h2m6c51tz?username='+myUserName+'&host='+host+'&authid='+myAppRes.id
                            })
                        } else {

                            if (localStorage.getItem('tag')) { // 노트 읽고 지우기
                                const tag = localStorage.getItem('tag')
                                const noteReadUrl = 'https://'+host+'/api/notes/search-by-tag'
                                const noteReadParam = {
                                    headers: {
                                        'content-type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        tag: tag
                                    }),
                                    method: 'POST'
                                }
        
                                fetch(noteReadUrl, noteReadParam)
                                .then((noteData) => {return noteData.json()})
                                .then((noteRes) => {
                                    console.log(noteRes)
                                    var deleteNoteId
                                    for (var j = 0; j < noteRes.length; j++){
                                        if (noteRes[j].user.username == myUserName) {
                                            deleteNoteId = noteRes[j].id
                                            break
                                        }
                                    }
                                    if (deleteNoteId) {
                                        const noteDeleteUrl = 'https://'+host+'/api/notes/delete'
                                        const noteDeleteParam = {
                                            headers: {
                                                'content-type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                i: i,
                                                noteId: deleteNoteId
                                            }),
                                            credentials: 'omit',
                                            method: 'POST'
                                        }
            
                                        fetch(noteDeleteUrl, noteDeleteParam)
                                        .then((deleteData) => {
                                            writemsg(i)
                                        })
                                        .catch((error) => console.log(error));
                                    }
                                })
                                .catch((error) => console.log(error));
                            } else {
                                writemsg(i)
                            }

                            function writemsg(i) {
                                if (localStorage.getItem('msg')) { // 노트 쓰기
                                    var msg = localStorage.getItem('msg')
                                    const noteCreateUrl = 'https://'+host+'/api/notes/create'
                                    if (localStorage.getItem('tag')) {
                                        msg = msg + "\n#" + localStorage.getItem('tag')
                                    }
                                    var cw = null
                                    if (localStorage.getItem('cw')) {
                                        cw = localStorage.getItem('cw')
                                    }
                                    const noteCreateParam = {
                                        headers: {
                                            'content-type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            i: i,
                                            cw: cw,
                                            visibility: 'home',
                                            text: msg
                                        }),
                                        credentials: 'omit',
                                        method: 'POST'
                                    }
            
                                    fetch(noteCreateUrl, noteCreateParam)
                                    .then((noteData) => {return noteData.json()})
                                    .then((noteRes) => {
                                        console.log(noteRes)
                                        localStorage.removeItem('tag');
                                        localStorage.removeItem('msg'); //쓰고나면 localStorage에서 태그랑 메세지 값 지워야함
        
                                        location.href = 'https://'+host
                                    })
                                    .catch((error) => console.log(error));
                                } else {
                                    location.href = 'https://i.peacht.art/play/9h2m6c51tz?username='+myUserName+'&host='+host+'&authid='+localStorage.getItem('authId')
                                }
                            }
                        }
                    }
                })
                .catch((error) => console.log(error));
            }
        })
        .catch((error) => console.log(error))
    } 
} else {
    document.querySelector('#post').innerHTML = '그리고 아무 일도 일어나지 않았다....(인스턴스 주소를 써주세요!)' // 둘다 없으면 아무 일도 일어나지 않아요
}