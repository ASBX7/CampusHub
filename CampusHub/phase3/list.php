<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require_once __DIR__ . "/../db.php";

$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 40;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$offset = ($page - 1) * $limit;

try {
    if ($search !== '') {
        $stmt = $pdo->prepare("SELECT * FROM news WHERE title LIKE :search OR body LIKE :search ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':search', '%' . $search . '%');
    } else {
        $stmt = $pdo->prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
    }

    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $news = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total = $pdo->query("SELECT COUNT(*) FROM news")->fetchColumn();

    echo json_encode([
        'page' => $page,
        'limit' => $limit,
        'total' => (int) $total,
        'data' => $news
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch news']);
}
