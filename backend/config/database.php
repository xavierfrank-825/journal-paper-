<?php
class Database {
    private $host = "gateway01.ap-northeast-1.prod.aws.tidbcloud.com";
    private $port = 4000;
    private $dbname = "test";
    private $username = "3aozcgVcw4gxqxG.root";
    private $password = "WmDCOKsjMjmgO7tg";
    private $caPath;
    public $conn;

    public function __construct() {
        $this->caPath = __DIR__ . "/ca.pem"; // Make sure this file exists!
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->dbname};charset=utf8mb4";

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_SSL_CA => $this->caPath,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            die(json_encode(["error" => "❌ DB connection failed: " . $e->getMessage()]));
        }

        return $this->conn;
    }
}
?>
