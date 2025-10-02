<?php
require_once("../../config/database.php");
require_once("../../config/cors.php");

$data = json_decode(file_get_contents("php://input"));
$id = $data->id;
$role = $data->role;

$db = (new Database())->getConnection();
$stmt = $db->prepare("UPDATE users SET role = :role WHERE id = :id");
$stmt->bindParam(":role", $role);
$stmt->bindParam(":id", $id);

if ($stmt->execute()) {
    echo json_encode(["message" => "User updated successfully"]);
} else {
    echo json_encode(["error" => "Update failed"]);
}
?>
