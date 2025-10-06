<?php
// api/papers/delete.php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/Paper.php';

header('Content-Type: application/json');
session_start();

// ✅ Security: Check that user is logged in & is admin (if required)
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$paper = new Paper($db);

// ✅ Ensure DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $paper_id = null;

    // Allow either query param ?id=123 or JSON body { "id": 123 }
    if (isset($_GET['id'])) {
        $paper_id = intval($_GET['id']);
    } else {
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['id'])) {
            $paper_id = intval($input['id']);
        }
    }

    if ($paper_id) {
        if ($paper->deletePaper($paper_id)) {
            http_response_code(200);
            echo json_encode(["message" => "Paper deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete paper"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Paper ID required"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method Not Allowed"]);
}