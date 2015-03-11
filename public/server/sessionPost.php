<?php


$sessionId = trim($_GET['session']);
$videoId = trim($_GET['video']);
$sessionFilePath = 'sessions/'.$sessionId;

if(!$sessionId || !$videoId){
	exit;
}


if(!is_file($sessionFilePath)){
	touch($sessionFilePath);
}

file_put_contents($sessionFilePath, $videoId."\n", FILE_APPEND | LOCK_EX);





?>