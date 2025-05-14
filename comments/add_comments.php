<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ✅ استقبل البيانات كـ JSON
    $data = json_decode(file_get_contents("php://input"), true);

    $review_id = $data['review_id'] ?? null;
    $comment = $data['comment'] ?? null;

    if (!$review_id || !$comment) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing review_id or comment'
        ]);
        exit;
    }

    $con = new mysqli('localhost', 'root', '', 'mydb');
    if ($con->connect_error) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Connection failed: ' . $con->connect_error
        ]);
        exit;
    }

    $stmt = $con->prepare("INSERT INTO comments (review_id, comment) VALUES (?, ?)");
    $stmt->bind_param("is", $review_id, $comment);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Comment added successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Insert failed: ' . $stmt->error
        ]);
    }

    $stmt->close();
    $con->close();
}
?>
