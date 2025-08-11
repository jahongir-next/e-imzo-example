
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <title>E-imzo | Login</title>
{{--    <link rel="icon" href="/img/favicon.ico">--}}
{{--    <script src="js/e-imzo.js" type="text/javascript"></script>--}}
{{--    <script src="js/e-imzo-client.js" type="text/javascript"></script>--}}
{{--    <script src="js/micro-ajax.js" type="text/javascript"></script>--}}
{{--    <script src="js/e-imzo-init.js" type="text/javascript"></script>--}}
    <link rel="stylesheet" href="{{asset('assets/css/style.css')}}">
    <script src="{{asset('assets/js/e-imzo.js')}}"></script>
    <script src="{{asset('assets/js/e-imzo-client.js')}}"></script>
    <script src="{{asset('assets/js/e-imzo-init.js')}}"></script>
    <script src="{{asset('assets/js/micro-ajax.js')}}"></script>

</head>
<body>
{{--@if (isset($userInfo))--}}
{{--    @if (isset($userInfo['subjectName']['O']))--}}
{{--        Yuridik shaxs:--}}
{{--        {{ $userInfo['subjectName']['O'] ?? '' }}--}}
{{--        || STIR:--}}
{{--        {{ $userInfo['subjectName']['1.2.860.3.16.1.1'] ?? '' }}--}}
{{--        || {{ $userInfo['subjectName']['T'] ?? '' }}:--}}
{{--    @else--}}
{{--        Jismoniy shaxs:--}}
{{--    @endif--}}

{{--    {{ $userInfo['subjectName']['CN'] ?? '' }}--}}
{{--    || JShShIR:--}}
{{--    <span id="user-data">{{ $userInfo['subjectName']['1.2.860.3.16.1.2'] ?? '' }}</span>--}}
{{--    || KEY_ID: {{ $keyId ?? '' }}--}}
{{--@else--}}
{{--    <script>window.location.href = '{{ url('index.php') }}';</script>--}}
{{--@endif--}}
<h2>Sign document</h2>
<a href="logout.php">Logout</a>

<form name="keyform">
    <div class="my-form-area">
        <label id="message" style="color: red;"></label>
        <p>Выберите тип ключа:</p>
        <input type="radio" id="pfx" name="keyType" value="pfx" onchange="changeKeyType()" checked="checked">
        <label for="pfx">PFX</label>
        <div id="key-list" class="key-list"></div>
        <br>
        <div style="background-color: #878700; padding: 5px">
            <input type="radio" id="idcard" name="keyType" value="idcard" onchange="changeKeyType()">
            <br>
            <label for="idcard">ID-card</label>
            - <label id="plugged">ulanmagan</label>
            <br>
        </div>
    </div>
    <div class="my-form-area">
        <p>ID key: <span id="keyId"></span></p>
        <label for="signing-document">Imzolanayotgan hujjat (string json yoki base64 fayl) <br>
            <textarea id="signing-document" class="signing-document" name="data" cols="80" rows="8"></textarea>
            <br/>
        </label>
        <br/>
        Key data:
        <br/>
        <textarea id="key-data" cols="80" rows="5" readonly></textarea>
        <br/>
        <label id="progress" style="color: green;"></label>
        <label id="message" style="color: green;"></label>
        <p>Tipni tanlang:</p>
        <input type="radio" id="attached" name="pkcs7Type" value="attached" onchange="changePkcs7Type()"
               checked="checked">
        <label for="attached">PKCS#7 / Attached</label>
        <br/>
        <input type="radio" id="detached" name="pkcs7Type" value="detached" onchange="changePkcs7Type()">
        <label for="detached">PKCS#7 / Detached</label>
        <br>
        <br/>
        <label for="signButton">
            Sign
            <button onclick="sign()" type="button" id="signButton">by PFX</button>
        </label>
        <br/>
        <label id="progress"></label>
        <br/>

        <label id="beforeTs_label">Timestamp siz PKCS#7</label><br/>
        <textarea name="before_ts" cols="80" rows="5" readonly></textarea>
        <br/>
        <br/>

        <label id="pkcs7Type_label">Imzolangan PKCS#7</label><br/>
        <textarea name="pkcs7" cols="80" rows="5" readonly></textarea>
        <br/>
        <br/>
        <label>Tekshiruv natijasi</label>
        <br/>
        <textarea name="verifyResult" cols="80" rows="5" readonly></textarea>
    </div>
</form>

<script>
    var URL_LIST = {
        "timestamp": "{{route('eimzo.timestamp')}}",
        "verify": "{{route('eimzo.verify')}}"
    }
    changePkcs7Type();
</script>
<br>
<br>
</body>
</html>
