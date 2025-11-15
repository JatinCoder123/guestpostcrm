<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../models/User.php';

use PHPMailer\PHPMailer\Exception;
use Google\Client as GoogleClient;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController
{
    private $jwt_secret;
    private $user;

    public function __construct()
    {
        $this->user = new User();
        $this->jwt_secret = "rightai";
    }

    // 🔹 Get logged-in user (from JWT cookie)
    public function me()
    {
        // 1. If token missing → 404
        if (!isset($_COOKIE['token'])) {
            http_response_code(404);
            echo json_encode(["error" => "Token not found"]);
            return;
        }

        $token = $_COOKIE['token'];

        try {
            // 2. Try to decode token → if invalid it goes to catch block
            $decoded = JWT::decode($token, new Key($this->jwt_secret, 'HS256'));

            // Extract email from JWT data
            $email = $decoded->data->email ?? null;

            if (!$email) {
                http_response_code(401);
                echo json_encode(["error" => "Invalid token: email missing"]);
                return;
            }


            $verifyResponse = $this->user->verifyUser($email);


            // Decode JSON (may return string error)
            $verifyJson = json_decode($verifyResponse, true);

            // If API did not return valid JSON → treat as failure
            if (!is_array($verifyJson)) {
                http_response_code(401);
                echo json_encode(["error" => "User verification failed", "details" => $verifyResponse]);
                return;
            }

            // 4. If success = true → user verified
            if (isset($verifyJson['success']) && $verifyJson['success'] === true) {

                // Build CRM endpoint using domain description
                $description = $verifyJson['data']['description'] ?? null;

                if (!$description) {
                    http_response_code(401);
                    echo json_encode(["error" => "CRM domain not found"]);
                    return;
                }

                $crmEndpoint = "https://{$description}/index.php?entryPoint=fetch_gpc";

                // ⭐ Final Success Response
                echo json_encode([
                    "user" => $decoded->data,
                    "crmEndpoint" => $crmEndpoint
                ]);
                return;
            }

            // 5. If success = false → unauthorized
            http_response_code(401);
            echo json_encode([
                "error" => "Unauthorized user",
                "email" => $email
            ]);
            return;
        } catch (Exception $e) {
            // 6. Token present but invalid → 401
            http_response_code(401);
            echo json_encode(["error" => "Invalid token: " . $e->getMessage()]);
        }
    }


    // 🔹 Google Login: redirect to Google auth page
    public function googleLogin()
    {
        try {
            $client = new GoogleClient();
            $client->setClientId('390468687968-alieb2vthlhrf6peu31mj8lh14tkav49.apps.googleusercontent.com');
            $client->setClientSecret('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');
            $client->setRedirectUri('https://app.guestpostcrm.com/public/index.php?controller=auth&action=googleCallback');
            $client->addScope(['email', 'profile']);

            $authUrl = $client->createAuthUrl();
            header("Location: $authUrl");
            exit;
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Google Login Init Failed", "details" => $e->getMessage()]);
        }
    }

    // 🔹 Google callback
    public function googleCallback()
    {
        try {
            if (!isset($_GET['code'])) {
                http_response_code(400);
                echo "No Google authorization code received.";
                exit;
            }

            $client = new GoogleClient();
            $client->setClientId('390468687968-alieb2vthlhrf6peu31mj8lh14tkav49.apps.googleusercontent.com');
            $client->setClientSecret('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');
            $client->setRedirectUri('https://app.guestpostcrm.com/public/index.php?controller=auth&action=googleCallback');

            // Exchange code for token
            $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);

            if (isset($token['error'])) {
                http_response_code(400);
                echo "Google login failed: " . ($token['error_description'] ?? 'Unknown error');
                exit;
            }

            $client->setAccessToken($token['access_token']);

            // Get Google user data
            $googleUser = $client->verifyIdToken($token['id_token']);

            if (!$googleUser) {
                http_response_code(400);
                echo "Invalid Google token";
                exit;
            }
            // Prepare JWT payload using Google user data
            $payload = [
                "iss" => "app.guestpostcrm.com",
                "aud" => "app.guestpostcrm.com",
                "iat" => time(),
                "exp" => time() + 3600 * 24,
                "data" => [
                    "id" => $googleUser['sub'],               // Google unique ID
                    "name" => $googleUser['name'] ?? '',
                    "email" => $googleUser['email'] ?? '',
                    "profile_pic" => $googleUser['picture'] ?? ''
                ]
            ];

            // Create JWT token
            $jwt = JWT::encode($payload, $this->jwt_secret, 'HS256');

            // Store JWT in secure cookie
            setcookie("token", $jwt, [
                'expires' => time() + 3600 * 24,
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'None'
            ]);

            // Redirect user to your React app
            header("Location: http://app.guestpostcrm.com/");
            exit;
        } catch (\Exception $e) {
            http_response_code(500);
            echo "Google Callback Failed: " . $e->getMessage();
            exit;
        }
    }

    // 🔹 Logout
    public function logout()
    {
        setcookie("token", "", [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None'
        ]);

        echo json_encode(['message' => 'Logged out successfully']);
    }
}
