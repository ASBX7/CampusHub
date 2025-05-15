<?php
include 'db.php';
$result = $conn->query("SELECT * FROM notes ORDER BY created_at DESC");
$notes = [];

while ($row = $result->fetch_assoc()) {
  $note_id = $row['id'];
  $comment_res = $conn->query("SELECT comment FROM comments WHERE note_id = $note_id");
  $comments = [];
  while ($c = $comment_res->fetch_assoc()) {
    $comments[] = $c['comment'];
  }
  $row['comments'] = $comments;
  $notes[] = $row;
}
echo json_encode($notes);
?>
