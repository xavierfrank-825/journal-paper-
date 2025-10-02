<?php
// api/users/list.php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../classes/User.php';

header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized"));
    exit();
}

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    try {
        $stmt = $user->getAllUsers();
        $users = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($users, array(
                "id" => $row['id'],
                "username" => $row['username'],
                "email" => $row['email'],
                "role" => $row['role'],
                "created_at" => $row['created_at']
            ));
        }
        
        http_response_code(200);
        echo json_encode(array("users" => $users));
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching users: " . $e->getMessage()));
    }
} else {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
}
?>