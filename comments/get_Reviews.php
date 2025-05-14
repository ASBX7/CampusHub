<?php


header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");


$con = new mysqli('localhost', 'root', '', 'mydb');
if($con-> connect_error){
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$sql = "SELECT * FROM review ORDER BY id DESC";
$result = $con->query($sql);


$reviews = [];

if ($result-> num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }
}
$con->close();

echo json_encode(["success" => true, "data" => $reviews]);

?>