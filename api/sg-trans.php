<?php
  require_once __DIR__.'/phpdotenv/vendor/autoload.php';
  require_once __DIR__.'/sendgrid-php/vendor/autoload.php';

  $dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/../', 'secrets.env');
  $dotenv->load();

  if(isset($_POST['request'])) {
    $json = $_POST['request'];
    //var_dump(json_decode($json, true));
    //$file = fopen('test.json','w');
    //fwrite($file, $json);
    //fclose($file);
    $request = json_decode($json);
    $userFullName = $request->user->fullName;
    $userMail = $request->user->email;
    $userAffiliation = $request->user->affiliation;
    $documents = $request->documents;
    $docTable = array();
    foreach ($documents as $doc) {
      $docTable[] = "<tr><td>".$doc->id."</td><td>".$doc->Title."</td><td>".$doc->Author."</td></tr>";
    }
    $sendgridData = json_decode($json, true);

    $email = new \SendGrid\Mail\Mail();

    $email->setFrom("docs@tgaec.us", "Gast Oceanography Collection");
    $email->setSubject("I am a subject!");

    $email->addTo(
        $userMail,
        $userFullName,
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
