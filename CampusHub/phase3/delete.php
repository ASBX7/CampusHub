<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Only DELETE requests are allowed']);
    exit;
}

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing news ID']);
    exit;
}

$id = (int) $_GET['id'];

try {
    $stmt = $pdo->prepare("DELETE FROM news WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true, 'message' => 'News item deleted']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete news item']);
}
