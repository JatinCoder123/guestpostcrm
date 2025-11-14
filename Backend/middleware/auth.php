<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;



class AuthMiddleware
{
    private $secretKey = "rightai";
    public function verifyUser()
    {
        try {
            $token = $_COOKIE['token'] ?? null;
            // Check for Bearer token in header
            if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
                if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                    $token = $matches[1];
                }
            }

            if (!$token) {
                throw new Exception("Missing token in both Cookie and Authorization header");
            }

            // ✅ Decode token
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));

            if (!isset($decoded->data)) {
                throw new Exception("Invalid token payload: missing 'data' field");
            }

            // Convert object → array safely
            $userData = [
                "id" => $decoded->data->id ?? null,
                "email" => $decoded->data->email ?? null,
            ];

            // Store globally
            $GLOBALS['user'] = $userData;

            return $userData;
        } catch (Exception $e) {
            // Catch all other errors
            $this->unauthorized("Error: " . $e->getMessage(), $e);
        }
    }

    /**
     * Return 401 + full debug info (dev only)
     */
    private function unauthorized($message, $exception = null)
    {
        http_response_code(401);

        $errorResponse = [
            "success" => false,
            "error" => $message,
        ];

        // ✅ Include stack trace for debugging (optional, dev only)
        if ($exception) {
            $errorResponse["trace"] = $exception->getTraceAsString();
        }

        echo json_encode($errorResponse, JSON_PRETTY_PRINT);
        exit;
    }
}
