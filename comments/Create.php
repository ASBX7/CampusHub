<?php

header('Content-Type: application/json');

$HOSTNAME = 'localhost';
$USERNAME = 'root';
$PASSWORD = '';
$DATABASE = 'mydb';

if($_SERVER['REQUEST_METHOD']=='POST'){
    $subject_name=$_POST['subject_name'];
    $instructor_name=$_POST['instructor_name'];
    $Department=$_POST['Department'];
    $select_review=$_POST['select_review'];
    $notes=$_POST['notes'];

    


$con = new mysqli('localhost', 'root', '', 'mydb');

if ($con->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Connection failed: ' . $con->connect_error
    ]);
    exit;
}
$stmt = $con->prepare("INSERT INTO review (subject_name, instructor_name, Department, review, notes) VALUES (?, ?,?, ?, ?)");
$stmt->bind_param("sssss", $subject_name, $instructor_name,$Department, $select_review, $notes);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Review added successfully'
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
} else {
http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Invalid request method'
]);
}
?>