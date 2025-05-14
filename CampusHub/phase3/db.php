<?php
// Database connection settings
try {
    $pdo = new PDO('mysql:host=localhost;dbname=mydb;charset=utf8', 'user1', '1234'); // Update with your credentials
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $GLOBALS['pdo'] = $pdo; // Make PDO instance globally accessible
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    die("Database connection failed. Please try again later.");
}
?>
