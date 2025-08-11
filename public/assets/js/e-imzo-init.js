var URL_LIST = {}
var ALL_KEY_DATA = {};

const EIMZO_MAJOR = 3;
const EIMZO_MINOR = 37;
const errorCAPIWS = 'Error connecting to E-IMZO. You may not have the E-IMZO module installed';
const errorBrowserWS = 'The browser does not support WebSocket technology. Please, install the latest version of the browser';
const errorUpdateApp = 'ATTENTION!!! Install the new version of the E-IMZO application.<br /><a href="https://e-imzo.uz/main/downloads/" role="button">Download E-IMZO</a>';
const errorWrongPassword = 'Incorrect password';
const wsErrorCodeDescriptions = {
    1000: "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.",
    1001: "An endpoint is 'going away', such as a server going down or a browser having navigated away from a page.",
    1002: "An endpoint is terminating the connection due to a protocol error",
    1003: "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that",
    1004: "Reserved. The specific meaning might be defined in the future.",
    1005: "No status code was actually present.",
    1006: "The connection was closed abnormally, e.g., without sending or receiving a Close control frame",
    1007: "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message.",
    1008: "An endpoint is terminating the connection because it has received a message that 'violates its policy'. This reason is given either if there is no other suitable reason, or if there is a need to hide specific details about the policy.",
    1009: "An endpoint is terminating the connection because it has received a message that is too big for it to process.",
    1010: "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake.",
    1011: "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.",
    1015: "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).",
};

const API_KEYS = [
    'null', 'E0A205EC4E7B78BBB56AFF83A733A1BB9FD39D562E67978CC5E7D73B0951DB1954595A20672A63332535E13CC6EC1E1FC8857BB09E0855D7E76E411B6FA16E9D',
    'localhost', '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B',
    '127.0.0.1', 'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F',
    'test.e-imzo.uz', 'DE783306B4717AFE4AE1B185E1D967C265AA397A35D8955C7D7E38A36F02798AA62FBABE2ABA15C888FE2F057474F35A5FC783D23005E4347A3E34D6C1DDBAE5',
    'test.e-imzo.local', 'D56ABC7F43A23466D9ADB1A2335E7430FCE0F46B0EC99B578D554333245FC071357AE9E7E2F75F96B73AEEE7E0D61AE84E414F5CD795D8B6484E5645CAF958FC'
]

const AppLoad = function () {
    EIMZOClient.API_KEYS = API_KEYS;
    uiLoading();
    EIMZOClient.checkVersion(function (major, minor) {
        var newVersion = EIMZO_MAJOR * 100 + EIMZO_MINOR;
        var installedVersion = parseInt(major) * 100 + parseInt(minor);
        if (installedVersion < newVersion) {
            uiUpdateApp();
        } else {
            EIMZOClient.installApiKeys(function () {
                uiAppLoad();
            }, function (e, r) {
                if (r) {
                    uiShowMessage(r);
                } else {
                    wsError(e);
                }
            });
        }
    }, function (e, r) {
        if (r) {
            uiShowMessage(r);
        } else {
            uiNotLoaded(e);
        }
    });
}

const wsError = function (e) {
    if (e) {
        uiShowMessage(errorCAPIWS + " : " + wsErrorCodeDesc(e));
    } else {
        uiShowMessage(errorBrowserWS);
    }
};

const wsErrorCodeDesc = (code) => {
    const reason = wsErrorCodeDescriptions[code] || code;
    return `${code} - ${reason}`;
};

const uiAppLoad = function () {
    uiClearKeyList();
    console.log('Kalitlar socketdan yuklanmoqda');
    EIMZOClient.listAllUserKeys(function (o, i) {
        return "itm-" + o.serialNumber + "-" + i;
    }, function (itemId, v) {
        ALL_KEY_DATA[itemId] = v;
        return uiCreateItem([itemId], v);
    }, function (items) {
        console.log('Kalitlar socketdan yuklab olindi');
        console.log(items.length + ' ta kalit topildi');
        uiFillKeyList(items);
        uiLoaded();
    }, function (e, r) {
        if (e) {
            uiShowMessage(errorCAPIWS + " : " + e);
        } else {
            console.log(r);
        }
    });
    EIMZOClient.idCardIsPLuggedIn(function (yes) {
        document.getElementById('plugged').innerHTML = yes ? 'подключена' : 'не подключена';
    }, function (e, r) {
        if (e) {
            uiShowMessage(errorCAPIWS + " : " + e);
        } else {
            console.log(r);
        }
    })
}

const uiHandleError = function (e, r) {
    uiHideProgress();
    if (r) {
        if (r.indexOf("BadPaddingException") !== -1) {
            uiShowMessage(errorWrongPassword);
        } else {
            uiShowMessage(r);
        }
    } else {
        uiShowMessage(errorBrowserWS);
    }
    if (e) wsError(e);

};

const uiCreateItem = function (itemKey, vo) {
    var now, itm, row, col;
    now = new Date();
    vo.expired = dates.compare(now, vo.validTo) > 0;
    vo.disabled = vo.expired;
    itm = createTag('a', '', {
        'id': itemKey,
        'class': 'key-list-item',
        'data-key': itemKey,
        'onclick': vo.disabled ? false : "selectKey('" + itemKey + "')",
    });

    row = createTag('div', '', {'class': 'row'});
    row.append(createTag('div', isJuridical(vo) ? 'Yuridik shaxs' : 'Jismoniy shaxs', {'class': 'column text-bold'}));

    if (isJuridical(vo)) {
        row.append(createTag('div', vo.O, {'class': 'text-bold'}));
        row.append(createTag('div', vo.T, {'class': 'column'}))
    }
    row.append(createTag('div', vo.CN, {'class': 'data full-name'}));
    itm.append(row)

    row = createTag('div', '', {'class': 'row'});
    col = createTag('div', '', {'class': 'column'})
    col.append(createTag('div', 'JShShR', {'class': 'label'}));
    col.append(createTag('div', vo.PINFL, {'class': 'data'}));
    row.append(col);

    col = createTag('div', '', {'class': 'column'})
    col.append(createTag('div', 'STIR', {'class': 'label'}));
    col.append(createTag('div', vo.TIN, {'class': 'data'}));
    row.append(col);

    col = createTag('div', '', {'class': 'column'})
    col.append(createTag('div', 'Sertifikat raqami', {'class': 'label'}));
    col.append(createTag('div', vo.serialNumber, {'class': 'data'}));
    row.append(col);


    itm.append(row);

    row = createTag('div', '', {'class': 'row'});

    col = createTag('div', '', {'class': 'column'})
    col.append(createTag('div', 'Berilgan sana', {'class': 'label'}));
    col.append(createTag('div', vo.validFrom.toLocaleDateString('ru-RU'), {'class': 'data'}));
    row.append(col);
    col = createTag('div', '', {'class': 'column'})
    col.append(createTag('div', 'Amal qilish muddati', {'class': 'label'}));
    col.append(createTag('div', vo.validTo.toLocaleDateString('ru-RU'), {'class': 'data'}));
    row.append(col);
    col = createTag('div', '', {'class': 'column'})
    col.append(createTag('div', 'Fayl', {'class': 'label'}));
    col.append(createTag('div', vo.name, {'class': 'data'}));
    row.append(col);
    itm.append(row);

    row = createTag('div', '', {'class': 'row'});
    if (!vo.expired) {

    } else {
        itm.classList.add('disabled');
        col = createTag('div', '', {'class': 'column'});
        col.append(createTag('div', 'Muddati o‘tgan', {'class': 'column-expired'}));
        row.append(col);
    }

    if (document.getElementById('user-data') !== null) {
        if (vo.PINFL !== document.getElementById('user-data').innerText.trim()) {
            itm.classList.add('disabled');
            col = createTag('div', '', {'class': 'column'});
            col.append(createTag('div', 'Kalit boshqa shaxsga tegishli', {'class': 'column-expired'}));
            row.append(col);
        }
    }

    itm.append(row);

    return itm;
}

const createTag = (name, innerText = '', options = null) => {
    const tag = document.createElement(name);
    tag.innerText = innerText
    for (let key in options)
        tag.setAttribute(key, options[key]);
    return tag
}

const uiFillKeyList = function (items) {
    console.log('Kalitlar ro`yxatiga asosan buttonlar shakllanmoqda');
    var combo = document.getElementById('key-list');
    for (var itm in items) {
        combo.append(items[itm]);
    }
    console.log('Kalitlar ro`yxatiga asosan buttonlar shakllandi');
}

const changeKeyType = function () {
    var keyType = document.keyform.keyType.value;
    document.getElementById('signButton').innerHTML = keyType === "pfx" ? "by PFX" : "by ID-card";
};

const changePkcs7Type = () => {
    var pkcs7Type = document.keyform.pkcs7Type.value;
    document.getElementById('pkcs7Type_label').innerHTML = pkcs7Type === "attached"
        ? "Imzolangan hujjat PKCS#7/Attached (Hujjat pkcs7 ni ichida)"
        : "Imzolangan hujjat PKCS#7/Detached (Hujjat pkcs7 ni ichida mavjud emas)";
};

const uiClearKeyList = function () {
    console.log('Kalitlar royxati tozalandi');
    var combo = document.getElementById('key-list');
    combo.innerHTML = '';
}

const selectKey = elId => {
    console.log('Kalit tanlanmoqda');
    let el = document.getElementById(elId);
    [...el.parentElement.children].forEach(sib => sib.classList.remove('selected'));
    el.classList.add('selected');
    EIMZOClient.loadKey(
        ALL_KEY_DATA[elId],
        function (id) {
            document.getElementById('keyId').innerHTML = id;
            console.log('Kalit tanlandi');
            document.getElementById('key-data').value = JSON.stringify(ALL_KEY_DATA[elId]);
            console.log('Kalit ma`lumotlari textareaga joylandi');
        },
        function (a, error) {
            console.log(a);
            console.log(error);
        })
    return true;
}

const isJuridical = vo => {
    return vo.TIN > 0 && vo.TIN < 400000000
}

const uiShowMessage = function (message) {
    alert(message);
}

const uiLoading = function () {
    var l = document.getElementById('message');
    l.innerHTML = 'Loading ...';
    l.style.color = 'red';
}

const uiNotLoaded = function (e) {
    var l = document.getElementById('message');
    l.innerHTML = '';
    if (e) {
        wsError(e);
    } else {
        uiShowMessage(errorBrowserWS);
    }
}

const uiUpdateApp = function () {
    var l = document.getElementById('message');
    l.innerHTML = errorUpdateApp;
}

const uiLoaded = function () {
    var l = document.getElementById('message');
    l.innerHTML = '';
}

const uiShowProgress = function () {
    var l = document.getElementById('progress');
    l.innerHTML = 'Please, wait. Signing ';
    l.style.color = 'green';
};

const uiHideProgress = function () {
    var l = document.getElementById('progress');
    l.innerHTML = '';
};

const getChallenge = function (callback) {
    console.log('Challenge olish uchun ajax so`rov - ' + URL_LIST['challenge'])
    microAjax('/api/eimzo/challenge',
        function (data, s) {
            if (s.status !== 200) {
                uiShowMessage(s.status + " - " + s.statusText);
                return;
            }
            try {
                data = JSON.parse(data);
                if (data.status !== 1) {
                    uiShowMessage(data.status + " - " + data.message);
                    return;
                }
                console.log('Challenge olish uchun ajax muvaffaqiyatli');
                callback(data.challenge);
            } catch (e) {
                uiShowMessage(s.status + " - " + s.statusText + ": " + e);
            }
        }
    );
}

const auth = function (keyId, challenge, callback) {
    console.log('createPkcs7 - pkcs7 hosil qilinmoqda');
    console.log('E-imzo dasturi ishga tushib, parol so`raydi');
    EIMZOClient.createPkcs7(keyId, challenge, null, function (pkcs7) {
        console.log('pkcs7 hosil qilindi');
        document.keyform.before_ts.value = pkcs7;
        console.log('Auth uchun ajax so`rov ' + URL_LIST['auth']);
        microAjax('/api/eimzo/auth',
            function (data, s) {
                uiHideProgress();
                if (s.status !== 200) {
                    uiShowMessage(s.status + " - " + s.statusText);
                    return;
                }
                try {
                    console.log('Auth uchun ajax so`rov muvaffaqiyatli');
                    data = JSON.parse(data);
                    if (data.status !== 1) {
                        uiShowMessage(data.status + " - " + data.message);
                        return;
                    }
                    callback(data);
                } catch (e) {
                    uiShowMessage(s.status + " - " + s.statusText + ": " + e);
                }
            },
            'keyId=' + encodeURIComponent(keyId) + '&pkcs7=' + encodeURIComponent(pkcs7)
        );
    }, uiHandleError, false);
}

const login = function () {
    console.log('Login jarayoni boshlandi');
    uiShowProgress();
    getChallenge(function (challenge) {
        console.log(challenge + ' - Challenge olindi');
        var keyType = document.keyform.keyType.value;
        if (keyType === "idcard") {
            var keyId = "idcard";
            auth(keyId, challenge, function (redirect) {
                window.location.href = redirect;
                console.log('redirect', redirect)
                uiShowProgress();
            });
        } else {
            console.log('Pfx auth boshlanmoqda');
            auth(document.getElementById('keyId').innerHTML,
                challenge,
                function (data) {
                    console.log('User ma`lumotlari olindi');
                    console.warn('Shu joyda avtorizatsiyadan keyingi logikani yozish mumkin');
                    document.keyform.userdata.value = JSON.stringify(data['user_data']);
                    console.log('User ma`lumotlari text areaga joylandi');
                    if (data.redirect) {
                        showCabinetLink(data.redirect);
                        //window.location.href = data.redirect;
                    }
                }
            );
        }
    });
};

const sign = function () {
    console.log('Imzolash jarayoni boshlandi')
    uiShowProgress();
    var pkcs7Type = document.keyform.pkcs7Type.value;
    var data = document.keyform.data.value;
    var keyId = document.getElementById('keyId').innerHTML;
    console.log('Imzo tipi: ', pkcs7Type);
    console.log('Imzolanayotgan hujjat: ', data);
    console.log('Kalit keyId: ', keyId);
    console.log('createPkcs7 - pkcs7 hosil qilinmoqda');
    console.log('E-imzo dasturi ishga tushib, parol so`raydi');
    EIMZOClient.createPkcs7(keyId, data, null, function (pkcs7) {
        console.log('pkcs7 hosil qilindi');
        document.keyform.before_ts.value = pkcs7;
        console.log('pkcs7 textareaga joylandi');
        console.log('attachTimestamp sorov berilmoqda');
        attachTimestamp(pkcs7, function (pkcs7wtst) {
            console.log('attachTimestamp sorov muvaffaqiyatli');
            console.log('Timestampli pkcs7 textareaga joylandi');
            document.keyform.pkcs7.value = pkcs7wtst;
            uiShowProgress();
            console.log('verify ga sorov yuborilmoqda');
            verify(pkcs7wtst, pkcs7Type === "detached", data, function (result) {
                console.log('verify ga sorov muvaffaqiyatli');
                console.log('verify result:');
                console.log(result);
                document.keyform.verifyResult.value = JSON.stringify(result, '', ' ');
                console.log('verify result textareaga joylandi ');
                console.warn('Shu joyga imzolashdan keyingi logikani yozish mumkin');
            });
        });
    }, uiHandleError, pkcs7Type === "detached");
};

const attachTimestamp = function (pkcs7, callback) {
    microAjax(URL_LIST['timestamp'], function (data, s) {
        uiHideProgress();
        if (s.status !== 200) {
            uiShowMessage(s.status + " - " + s.statusText);
            return;
        }
        var pkcs7wtst;
        try {
            data = JSON.parse(data);
            if (data.status !== 1) {
                uiShowMessage(data.status + " - " + s.message);
                return;
            }
            pkcs7wtst = data.pkcs7b64;
        } catch (e) {
            uiShowMessage(s.status + " - " + s.statusText + "<br />" + e);
        }
        callback(pkcs7wtst);
    }, pkcs7);
}

const verify = function (pkcs7wtst, detached, data, callback) {
    var data64;
    if (detached) {
        data64 = Base64.encode(data);
    }
    microAjax(URL_LIST['verify'], function (data, s) {
        uiHideProgress();
        if (s.status !== 200) {
            uiShowMessage(s.status + " - " + s.statusText);
            return;
        }
        var result;
        try {
            data = JSON.parse(data);
            if (data.status !== 1) {
                uiShowMessage(data.status + " - " + s.message);
                return;
            }
            result = data.pkcs7Info;
        } catch (e) {
            uiShowMessage(s.status + " - " + s.statusText + "<br />" + e);
        }
        callback(result);
    }, 'pkcs7wtst=' + encodeURIComponent(pkcs7wtst) + (detached ? '&data64=' + encodeURIComponent(data64) : ""));
}

const showCabinetLink = redirect_url => {
    document.getElementById('cabinetLink').href = redirect_url;
    document.getElementById('cabinetLink').classList.remove('hidden');
}

window.onload = AppLoad;
