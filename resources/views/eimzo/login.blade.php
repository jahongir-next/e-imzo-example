
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
<h2>Login</h2>


<a href="#" id="cabinetLink" class="hidden">Cabinet</a>
<form name="keyform">
    <div class="my-form-area">
        <label id="message" style="color: red;"></label>
        <p>Выберите тип ключа:</p>
        <input type="radio" id="pfx" name="keyType" value="pfx" onchange="changeKeyType()" checked="checked">
        <label for="pfx">PFX</label>
        <div id="key-list" class="key-list"></div>
        <br>
{{--        <div style="background-color: #878700; padding: 5px">--}}
{{--            <input type="radio" id="idcard" name="keyType" value="idcard" onchange="changeKeyType()">--}}
{{--            <br>--}}
{{--            <label for="idcard">ID-card</label>--}}
{{--            - <label id="plugged">Ulanmagan</label>--}}
{{--        </div>--}}
    </div>
    <div class="my-form-area">
        <p>ID key: <span id="keyId"></span></p>
        Key data:<br/>
        <textarea id="key-data" cols="80" rows="5" readonly></textarea>
        <br/>
        <label id="progress" style="color: green;"></label>
        <label id="message" style="color: green;"></label>
        <br/>
        <label for="signButton">
            Login
            <button onclick="login()" type="button" id="signButton">PFX</button>
        </label>
        <br/>
        <label id="progress"></label>
        <br/>

        <label id="before_ts">PKCS#7</label><br/>
        <textarea name="before_ts" cols="80" rows="5" readonly></textarea>
        <br/>
        <br/>

        <label>User data</label>
        <br/>
        <textarea name="userdata" cols="80" rows="5" readonly></textarea>
    </div>
</form>
<script>
    var URL_LIST = {
        "challenge": "{{route('eimzo.challenge')}}",
        "auth": "{{route('eimzo.auth')}}"
    }
</script>
<br>
<br>
</body>
</html>
