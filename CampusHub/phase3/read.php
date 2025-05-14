<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../db.php";

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing news ID']);
    exit;
}

$id = (int) $_GET['id'];

try {
    $stmt = $pdo->prepare("SELECT * FROM news WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $news = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$news) {
        http_response_code(404);
        echo json_encode(['error' => 'News item not found']);
        exit;
    }

    echo json_encode($news);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch news item']);
}
