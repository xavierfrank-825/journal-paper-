<?php
// backend/classes/Paper.php

class Paper {
    private $conn;
    private $table_name = "papers";

    public $id;
    public $title;
    public $filename;
    public $xml_content;
    public $html_content;
    public $user_id;   // match DB column name
    public $status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                 (title, filename, xml_content, html_content, user_id) 
                 VALUES (:title, :filename, :xml_content, :html_content, :user_id)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':filename', $this->filename);
        $stmt->bindParam(':xml_content', $this->xml_content);
        $stmt->bindParam(':html_content', $this->html_content);
        $stmt->bindParam(':user_id', $this->user_id);

        return $stmt->execute();
    }

    public function readAll() {
        $query = "SELECT p.id, p.title, p.filename, p.xml_content, p.html_content, 
                         p.status, p.created_at, u.username as uploaded_by_name
                  FROM " . $this->table_name . " p
                  LEFT JOIN users u ON p.user_id = u.id
                  WHERE p.status = 'active'
                  ORDER BY p.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function readOne() {
        $query = "SELECT p.id, p.title, p.filename, p.xml_content, p.html_content, 
                         p.status, p.created_at, u.username as uploaded_by_name
                  FROM " . $this->table_name . " p
                  LEFT JOIN users u ON p.user_id = u.id
                  WHERE p.id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->title = $row['title'];
            $this->filename = $row['filename'];
            $this->xml_content = $row['xml_content'];
            $this->html_content = $row['html_content'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
        }

        return $row;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);

        return $stmt->execute();
    }
}
?>
