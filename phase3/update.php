<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../db.php";

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Only PUT requests are allowed']);
    exit;
}

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing news ID']);
    exit;
}

$id = (int) $_GET['id'];
$data = json_decode(file_get_contents("php://input"), true);
$title = trim($data['title'] ?? '');
$body = trim($data['body'] ?? '');

if ($title === '' || $body === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Title and body are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE news SET title = :title, body = :body WHERE id = :id");
    $stmt->execute([':title' => $title, ':body' => $body, ':id' => $id]);

    echo json_encode(['success' => true, 'message' => 'News item updated']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update news item']);
}
