<?php

require_once "..\App\Database\DatabaseConnection.php";
#[\AllowDynamicProperties]


class User
{
    public function displayUsers()
    {
        $sql = "SELECT * FROM mvcdb.user";
        $stmt = DatabaseConnection::getInstance()->prepare($sql);
        $stmt->execute();
        $object = $stmt->fetchAll(PDO::FETCH_CLASS, __CLASS__);
        return $object;
    }

    public function deleteUser($id){
        $sql = "DELETE FROM mvcdb.user WHERE id = :id";
        $stmt = DatabaseConnection::getInstance()->prepare($sql);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
    }

    public function updateUser($id, $name, $email, $password){
        $sql = "UPDATE mvcdb.user SET name = :name, email = :email, password = :password WHERE id = :id";
        $stmt = DatabaseConnection::getInstance()->prepare($sql);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $password);
        return $stmt->execute();
    }

    public function getUserById($id) {
        $query = "SELECT * FROM mvcdb.user WHERE id = :id";
        $this->db->query($query);
        $this->db->bind(':id', $id);
        return $this->db->single();
    }
    
}










