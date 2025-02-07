<?php

require "../helpers.php";



require basePath('Routes/router.php');

$router = new Router();

require basePath('Routes/routes.php');

$uri = $_SERVER["REQUEST_URI"];
$method = $_SERVER["REQUEST_METHOD"];

$router -> route($uri, $method);

