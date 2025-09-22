<?php

namespace App\Http\Controllers;

use App\Services\EimzoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EimzoController extends Controller
{
    protected $service;
    public function __construct(EimzoService $service)
    {
        $this->service = $service;
    }

    public function challenge(){
        return  $this->service->challenge();
    }

    public function auth(Request $request){
        return $this->service->auth($request->all());
    }

    public function timestamp()
    {
        $pkcs7 = request()->getContent();

        return $this->service->timestamp($pkcs7);
    }

    public function verify(Request $request){

        $verify_url = config('services.eimzo.base_url') . config('services.eimzo.verify_url');
        $data64 = $request->data64 ?? "";

        if ($data64 == "") {
            $verify_url .= "/attached";
            $post_vars = $request->pkcs7wtst;
        } else {
            $verify_url .= "/detached";
            $post_vars = $data64 . "|" . $request->pkcs7wtst;
        }

        return $this->service->verify($verify_url, $post_vars);
    }
}
