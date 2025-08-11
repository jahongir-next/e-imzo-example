<?php

namespace App\Services;

use App\Integrations\Eimzo\Responses\UserResponse;
use http\Client\Curl\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class EimzoService
{

    public function challenge()
    {
        $challenge_url = config('services.eimzo.base_url').config('services.eimzo.challenge');

        $response = Http::withoutVerifying()
            ->timeout(0)->retry(1, 100)
            ->get($challenge_url);

        if ($response->successful()) {
            $jr = $response->json();
            if ($jr["status"] != 1) {
                return response()->json([
                    'status' => $jr["status"],
                    'message' => addslashes($jr["status"])
                ]);
            } else {
                return response($response->body(), 200);
            }
        }else{
            return response()->json([
                'status' => 0,
                'message' => addslashes($response->body())
            ]);
        }

    }

    public function auth($params){
        $auth_url = config('services.eimzo.base_url').config('services.eimzo.auth_url');

        $response = Http::withHeaders([
            'Content-Type' => 'text/plain',
        ])
            ->withoutVerifying() // Disables SSL verification (only use for dev)
            ->timeout(0)         // No timeout
            ->retry(1, 100)      // Optional retry
            ->withBody(request('pkcs7'), 'text/plain') // Use raw body
            ->post($auth_url);

        if ($response->successful()) {
            $jr = $response->json();

            if ($jr["status"] != 1) {
                return response()->json([
                    'status' => $jr["status"],
                    'message' => $jr["status"],
                    'response' => $jr,
                ]);
            } else {

                $this->authUser($jr['subjectCertificateInfo']);

                Session::put('USER_INFO', $jr["subjectCertificateInfo"]);
                Session::put('KEY_ID', request('keyId'));

                return response()->json([
                    'status' => 1,
                    'redirect' => route('eimzo.sign'),
                    'user_data' => $jr["subjectCertificateInfo"]
                ]);
            }
        } else {
            return response()->json([
                'status' => 0,
                'message' => addslashes($response->body())
            ]);
        }
    }

    public function timestamp($pkcs7_signature){

        $timeStampUrl = config('services.eimzo.base_url') . config('services.eimzo.timestamp_url'); // or however you define the URL

        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $timeStampUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => $pkcs7_signature,
            CURLOPT_HTTPHEADER => array(
                'Content-Type: text/plain'
            ),
        ));

        $response = curl_exec($curl);

        $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        if ($http_code == 200) {
            $jr = json_decode($response, 1);
            if ($jr["status"] != 1) {
                echo json_encode([
                    'status' => $jr["status"],
                    'message' => addslashes($jr["status"])
                ]);
            } else {
                echo $response;
            }
        } else {
            echo json_encode([
                'status' => 0,
                'message' => addslashes($response)
            ]);
        }

        curl_close($curl);
    }

    public function verify($verify_url , $data)
    {
        $response = Http::withHeaders([
            'Content-Type' => 'text/plain',
        ])
            ->withoutVerifying()       // equivalent to CURLOPT_SSL_VERIFYPEER => 0
            ->timeout(0)               // no timeout
            ->withBody($data, 'text/plain')  // raw POST body
            ->post($verify_url);

        if ($response->successful()) {
            return response($response->body(), 200)
                ->header('Content-Type', 'application/json'); // or 'text/plain' if that's expected
        } else {
            return response()->json([
                'status' => 0,
                'message' => addslashes($response->body())
            ]);
        }
    }

    public function authUser($params) :void
    {

        $userInfo  = new UserResponse($params);

        $pin = $userInfo->getPin();

        $user  = \App\Models\User::updateOrCreate([
            'pinfl' => $pin
        ] , [
            'name' => $userInfo->getName(),
            'password' => Hash::make($userInfo->getPin()),
        ]);

        Auth::guard('web')->login($user);
    }
}
