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
                $verifyJson = json_decode($verifyResponse, true);

                if (!$verifyJson || isset($verifyJson['error'])) {
                    http_response_code(503);
                    echo json_encode([
                        "error" => "CRM verification failed",
                        "details" => $verifyJson
                    ]);
                    return;
                }

                // 4. If success = true → user verified
                if (isset($verifyJson['success']) && $verifyJson['success'] === true) {

                    // Build CRM endpoint using domain description
                     $businessEmail = $verifyJson['email'] ?? null;
                     $id=$verifyJson['current_user']['id'] ?? null;
                    $description = $verifyJson['domain'] ?? null;
                    $current_score = $verifyJson['current_score']['data'] ?? null;

                    if (!$description) {
                        http_response_code(401);
                        echo json_encode(["error" => "CRM domain not found"]);
                        return;
                    }

                    $crmEndpoint = "https://{$description}/index.php?entryPoint=fetch_gpc";

                    // ⭐ Final Success Response
                    echo json_encode([
                        "user" => $decoded->data,
                        "businessEmail" => $businessEmail,
                        "crmEndpoint" => $crmEndpoint,
                        "id" => $id,
                        "current_score"=>$current_score
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
public function microsoftLogin()
{
    try {
        $clientId = '51c4a942-4d08-438f-880c-3befb48041f3';
        $tenantId = '09e785c5-c37e-4902-aee5-9bb8fa3df376';
        $redirectUri = 'https://app.guestpostcrm.com/public/index.php?controller=auth&action=microsoftCallback';

        $params = [
            'client_id'     => $clientId,
            'response_type' => 'code',
            'redirect_uri'  => $redirectUri,
            'response_mode' => 'query',
            'scope'         => 'openid profile email User.Read',
            'state'         => bin2hex(random_bytes(16))
        ];

        $authUrl = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/authorize?"
                   . http_build_query($params);

        header("Location: $authUrl");
        exit;

    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode([
            "error" => "Microsoft Login Init Failed",
            "details" => $e->getMessage()
        ]);
    }
}
public function microsoftCallback()
{
    try {
        if (!isset($_GET['code'])) {
            http_response_code(400);
            echo "No Microsoft authorization code received.";
            exit;
        }

        $clientId     = '51c4a942-4d08-438f-880c-3befb48041f3';
        $clientSecret = 'XEe8Q~AQDibZjqdoY8l.EQZTnzAyBiKSeGaUTate';
        $tenantId     = '09e785c5-c37e-4902-aee5-9bb8fa3df376';
        $redirectUri  = 'https://app.guestpostcrm.com/public/index.php?controller=auth&action=microsoftCallback';

        // 🔹 Exchange authorization code for access token
        $tokenResponse = $this->curlPost(
            "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token",
            [
                'client_id'     => $clientId,
                'client_secret' => $clientSecret,
                'code'          => $_GET['code'],
                'redirect_uri'  => $redirectUri,
                'grant_type'    => 'authorization_code'
            ]
        );

        if (!isset($tokenResponse['access_token'])) {
            http_response_code(400);
            echo "Microsoft token exchange failed";
            exit;
        }

        $accessToken = $tokenResponse['access_token'];

        // 🔹 Fetch Microsoft user profile
        $user = $this->curlGet(
            'https://graph.microsoft.com/v1.0/me',
            $accessToken
        );

        if (!isset($user['id'])) {
            http_response_code(400);
            echo "Failed to fetch Microsoft user";
            exit;
        }

        // 🔹 JWT Payload
        $payload = [
            "iss" => "app.guestpostcrm.com",
            "aud" => "app.guestpostcrm.com",
            "iat" => time(),
            "exp" => time() + (3600 * 24),
            "data" => [
                "id"       => $user['id'],
                "name"     => $user['displayName'] ?? '',
                "email"    => $user['mail'] ?? $user['userPrincipalName'] ?? '',
                "provider" => "microsoft"
            ]
        ];

        $jwt = JWT::encode($payload, $this->jwt_secret, 'HS256');

        // 🔹 Store JWT in secure cookie
        setcookie("token", $jwt, [
            'expires'  => time() + (3600 * 24),
            'path'     => '/',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'None'
        ]);

        // 🔹 Redirect to React App
        header("Location: https://app.guestpostcrm.com/");
        exit;

    } catch (\Exception $e) {
        http_response_code(500);
        echo "Microsoft Callback Failed: " . $e->getMessage();
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
        private function curlPost(string $url, array $data): array
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_POST            => true,
        CURLOPT_POSTFIELDS      => http_build_query($data),
        CURLOPT_RETURNTRANSFER  => true,
        CURLOPT_TIMEOUT         => 30,
        CURLOPT_SSL_VERIFYPEER  => true,
        CURLOPT_HTTPHEADER      => [
            'Content-Type: application/x-www-form-urlencoded'
        ]
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        throw new \Exception('cURL POST Error: ' . curl_error($ch));
    }

    curl_close($ch);

    return json_decode($response, true) ?? [];
}
private function curlGet(string $url, string $accessToken): array
{
    $ch = curl_init($url);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER  => true,
        CURLOPT_TIMEOUT         => 30,
        CURLOPT_SSL_VERIFYPEER  => true,
        CURLOPT_HTTPHEADER      => [
            "Authorization: Bearer $accessToken",
            "Accept: application/json"
        ]
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        throw new \Exception('cURL GET Error: ' . curl_error($ch));
    }

    curl_close($ch);

    return json_decode($response, true) ?? [];
}
    }

