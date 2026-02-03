<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
$controller = $_GET['controller'] ?? '';
$action = $_GET['action'] ?? '';
switch ($controller) {
    case 'auth':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $auth = new AuthController();
        if ($action === 'googleLogin') {
            $auth->googleLogin();
        } elseif ($action === 'googleCallback') {
            $auth->googleCallback();
        } elseif ($action === 'microsoftLogin') {
            $auth->microsoftLogin();
        } elseif ($action === 'microsoftCallback') {
            $auth->microsoftCallback();
        } elseif ($action === 'me') {
            $auth->me();
        } elseif ($action === 'logout') {
            $auth->logout();
        } else {
            echo json_encode(["error" => "Invalid auth route"]);
        }
        break;
    default:
        echo json_encode(["error" => "Unknown controller"]);
}
