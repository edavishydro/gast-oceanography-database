<?php
  require_once __DIR__.'/phpdotenv/vendor/autoload.php';
  require_once __DIR__.'/sendgrid-php/vendor/autoload.php';
  require_once __DIR__.'/google-api-php-client/vendor/autoload.php';

  $dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/../../etc', 'secrets.env');
  $dotenv->load();

  if(isset($_POST['request'])) {
    $json = $_POST['request'];

    $client = new Google_Client();
    if (getenv('GOOGLE_APPLICATION_CREDENTIALS')) {
      // use the application default credentials
      $client->useApplicationDefaultCredentials();
    } else {
      echo missingServiceAccountDetailsWarning();
      return;
    }

    $client->setApplicationName("Gast_Oceanography_Collection");
    $client->setScopes(['https://www.googleapis.com/auth/drive']);
    
    $service = new Google_Service_Drive($client);
    $folder_id = "1uv4ZT37Nxi_6FoChjeiQxqbjWqS51pHW";
    $rand_num = mt_rand(1000, 9999);

    $fileMetadata = new Google_Service_Drive_DriveFile(array(
      'name' => 'request'.($rand_num).'.json',
      'parents' => array($folder_id)));

    $content = $json;
  
    $file = $service->files->create($fileMetadata, array(
      'data' => $content,
      'mimeType' => 'application/json',
      'uploadType' => 'multipart',
      'fields' => 'id'));

    $sendgridData = json_decode($json, true);
    $sendgridData += array('link' => 'https://drive.google.com/open?id='.$file->id);

    $email = new \SendGrid\Mail\Mail();

    $email->setFrom("docs@tgaec.us", "Gast Oceanography Collection");
    $email->setSubject("I am a subject!");

    $email->addTo(
        'edavis@tgaec.com',
        'Gast Oceanography Collection',
        $sendgridData,
        0
    );

    $email->setTemplateId("d-3a9d6efd7dc0418ca6aef8b71e2c98de");

    $sendgrid = new \SendGrid($_ENV['SENDGRID_API_KEY']);
    
    try {
        $response = $sendgrid->send($email);
        print $response->statusCode() . "\n";
        print_r($response->headers());
        print $response->body() . "\n";

    } catch (Exception $e) {
        echo 'Caught exception: '. $e->getMessage() ."\n";
    }
  }
?>
