<?php

class Router{
    protected $routes = [];

    public function routerMethod($method, $uri, $controller){
        $this -> routes[$method][$uri] = $controller;
    }

    public function get($uri, $controller){
        $this -> routerMethod("GET", $uri, $controller);
    }

    public function post($uri, $controller){
        $this -> routerMethod("POST", $uri, $controller);
    }

    public function route($uri, $method){
        if ($callback = $this -> routes[$method][$uri]){
            require basePath($callback);
        }else{
            http_response_code(404);
            require basePath('App/Error/Error.php');
            exit;
        }
    }

}