<?php
include 'db.php';

$title = $_POST['title'];
$course = $_POST['course'];
$description = $_POST['description'];

$stmt = $conn->prepare("INSERT INTO notes (title, course, description) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $title, $course, $description);
$stmt->execute();
echo json_encode(["status" => "success"]);
?>
