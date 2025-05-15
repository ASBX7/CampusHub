<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once 'index.php';

// ---------- HELPER FUNCTIONS ----------
function sanitize($value) {
    global $conn;
    return $conn->real_escape_string(trim($value));
}

function error($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

// ---------- ROUTER ----------
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
  case 'create_event':
  if ($method !== 'POST') error('Method Not Allowed', 405);
  $data = json_decode(file_get_contents("php://input"), true);
  if (!isset($data['title'], $data['datetime'], $data['category'])) error('Missing required fields');
  $sql = sprintf(
      "INSERT INTO events (title, datetime, location, category, description) VALUES ('%s', '%s', '%s', '%s', '%s')",
      sanitize($data['title']),
      sanitize($data['datetime']),
      sanitize($data['location'] ?? ''),
      sanitize($data['category']),
      sanitize($data['description'] ?? '')
  );
  if ($conn->query($sql)) echo json_encode(['success' => true, 'message' => 'Event created successfully']);
  else error('Failed to create event: ' . $conn->error, 500);
  break;

    case 'get_events':
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
        $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
        $sql = "SELECT * FROM events ORDER BY datetime DESC LIMIT $limit OFFSET $offset";
        $result = $conn->query($sql);
        $events = [];
        while ($row = $result->fetch_assoc()) $events[] = $row;
        echo json_encode($events);
        break;

  case 'update_event':
  if ($method !== 'POST') error('Method Not Allowed', 405);
  $data = json_decode(file_get_contents("php://input"), true);
  if (!isset($data['id'], $data['title'], $data['datetime'], $data['category'])) error('Missing required fields');
  $sql = sprintf(
      "UPDATE events SET title='%s', `datetime`='%s', location='%s', category='%s', description='%s' WHERE id=%d",
      sanitize($data['title']),
      sanitize($data['datetime']),
      sanitize($data['location'] ?? ''),
      sanitize($data['category']),
      sanitize($data['description'] ?? ''),
      (int)$data['id']
  );
  if ($conn->query($sql)) echo json_encode(['success' => true, 'message' => 'Event updated successfully']);
  else error('Failed to update event: ' . $conn->error, 500);
  break;

    case 'delete_event':
        if ($method !== 'POST') error('Method Not Allowed', 405);
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['id'])) error('Missing event ID');
        $sql = "DELETE FROM events WHERE id=" . (int)$data['id'];
        if ($conn->query($sql)) echo json_encode(['success' => true, 'message' => 'Event deleted successfully']);
        else error('Failed to delete event', 500);
        break;

    case 'get_comments':
        $event_id = (int)($_GET['event_id'] ?? 0);
        if (!$event_id) error('Missing event_id');
        $result = $conn->query("SELECT * FROM comments WHERE event_id = $event_id ORDER BY created_at DESC");
        $comments = [];
        while ($row = $result->fetch_assoc()) $comments[] = $row;
        echo json_encode($comments);
        break;

    case 'add_comment':
        if ($method !== 'POST') error('Method Not Allowed', 405);
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['event_id'], $data['comment'])) error('Missing comment data');
        $sql = sprintf(
            "INSERT INTO comments (event_id, comment) VALUES (%d, '%s')",
            (int)$data['event_id'],
            sanitize($data['comment'])
        );
        if ($conn->query($sql)) echo json_encode(['success' => true, 'message' => 'Comment added successfully']);
        else error('Failed to add comment' . $conn->error, 500);
        break;

    case 'ping':
        echo json_encode(['message' => 'API running']);
        break;

    default:
        error('Invalid action', 404);
}
?>