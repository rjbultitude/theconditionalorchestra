<?php

// Start configure
$log_file = dirname(__FILE__) . '/csp-violations.log';
$log_file_size_limit = 1000000; // bytes - once exceeded no further entries are added
$email_address = 'richard.bultitude@gmail.com';
$email_subject = 'Content-Security-Policy violation';
// End configuration

$current_domain = preg_replace('/www\./i', '', $_SERVER['SERVER_NAME']);
$email_subject = $email_subject . ' on ' . $current_domain;

http_response_code(204); // HTTP 204 No Content

$json_data = file_get_contents('php://input');

// We pretty print the JSON before adding it to the log file
if ($json_data = json_decode($json_data)) {
  $json_data = json_encode($json_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

  if (!file_exists($log_file)) {
    // Send an email
    $message = "The following Content-Security-Policy violation occurred on " .
      $current_domain . ":\n\n" .
      $json_data .
      "\n\nFurther CPS violations will be logged to the following log file, but no further email notifications will be sent until this log file is deleted:\n\n" .
      $log_file;
    mail($email_address, $email_subject, $message,
         'Content-Type: text/plain;charset=utf-8');
  } else if (filesize($log_file) > $log_file_size_limit) {
    exit(0);
  }

  file_put_contents($log_file, $json_data, FILE_APPEND | LOCK_EX);
}

?>