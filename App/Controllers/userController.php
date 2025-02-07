<?php

require basePath("App/Models/userModel.php");

class userController{
    private $userModel;

    public function __construct(){
        $this -> userModel = new User();
    }

    public function getAllUsersController(){
        $users = $this -> userModel -> displayUsers();
        require basePath("App/Views/userView.php");
    }

    public function deleteUserController($id){
        $this -> userModel -> deleteUser($id);
        require_once "..\App\Views\userView.php";
    }

    public function edit($id){
        $user = $this -> userModel -> getUserById($id);
        
    }

}

$userController = new userController();
$userController ->getAllUsersController();


echo "users";








