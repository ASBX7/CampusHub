<?php

header('Content-Type: application/json');
$review_id = $_GET['review_id'];

$con = new mysqli('localhost', 'root', '', 'mydb');
$result = $con -> query("SELECT * FROM comments WHERE review_id = $review_id ORDER BY id DESC");

$comments = [];
while ($row = $result-> fetch_assoc()){
    $comments[] = $row;
}

echo json_encode($comments);

?>