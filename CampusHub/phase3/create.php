<?php
// Database connection file (must define either $pdo or $conn)
require_once __DIR__ . "/../db.php";

// Initialize response array
$response = [
    'success' => false,
    'message' => '',
    'errors' => []
];

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $body = trim($_POST['summary'] ?? ''); // Use summary field as body
    $errors = [];

    // Validation
    if ($title === '') {
        $errors['title'] = 'Title is required';
    }
    if ($body === '') {
        $errors['summary'] = 'Body is required';
    }

    // If no validation errors, insert into DB
    if (empty($errors)) {
        try {
            if (isset($pdo)) {
                // Using PDO
                $stmt = $pdo->prepare("INSERT INTO news (title, body) VALUES (:title, :body)");
                $stmt->bindParam(':title', $title, PDO::PARAM_STR);
                $stmt->bindParam(':body', $body, PDO::PARAM_STR);

                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'News added successfully!';
                } else {
                    $response['message'] = 'Failed to add news: ' . implode(" ", $stmt->errorInfo());
                }
            } elseif (isset($conn)) {
                // Using MySQLi
                $stmt = $conn->prepare("INSERT INTO news (title, body) VALUES (?, ?)");
                $stmt->bind_param("ss", $title, $body);

                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'News added successfully!';
                } else {
                    $response['message'] = 'Failed to add news: ' . $stmt->error;
                }

                $stmt->close();
            } else {
                $response['message'] = 'Database connection error';
            }
        } catch (Exception $e) {
            $response['message'] = 'Database error: ' . $e->getMessage();
        }
    } else {
        $response['message'] = 'Please fix the errors and try again';
        $response['errors'] = $errors;
    }

    // Close MySQLi connection
    if (isset($conn) && !isset($pdo)) {
        $conn->close();
    }

    // Return JSON if AJAX
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        header('Content-Type: application/json');
        echo json_encode($response);
    }
    exit;
} else {
    // Invalid request method
    $response['message'] = 'Invalid request method';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>