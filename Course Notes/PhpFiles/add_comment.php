<?php
include 'db.php';

$note_id = $_POST['note_id'];
$comment = $_POST['comment'];

$stmt = $conn->prepare("INSERT INTO comments (note_id, comment) VALUES (?, ?)");
$stmt->bind_param("is", $note_id, $comment);
$stmt->execute();
echo json_encode(["status" => "success"]);
?>
