<?php
header('Content-Type: application/json');

    try {
        require_once __DIR__ . "/../db.php";

        $stmt = $pdo->query("SELECT * FROM news");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($products);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Failed to fetch products']);
    }