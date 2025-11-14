<?php
class User
{
    private $conn;
    private $table = "users";

    public function __construct()
    {
       // mysqli connection
    }

    public function createOrUpdateGoogleUser($googleId, $name, $email, $profilePic = 'default.png')
    {
        $user = $this->findByGoogleId($googleId);
        if ($user) {
            // Update existing Google user
            $stmt = $this->conn->prepare(
                "UPDATE {$this->table} SET name = ?, email = ?, profile_pic = ? WHERE google_id = ?"
            );
            $stmt->bind_param("ssss", $name, $email, $profilePic, $googleId);
            $stmt->execute();
            $stmt->close();
            return $user['id'];
        } else {
            // Insert new Google user (auto-verified)
            $stmt = $this->conn->prepare(
                "INSERT INTO {$this->table} (name, email, google_id, profile_pic, is_verified)
                 VALUES (?, ?, ?, ?, 1)"
            );
            $stmt->bind_param("ssss", $name, $email, $googleId, $profilePic);
            $stmt->execute();
            $id = $stmt->insert_id;
            $stmt->close();
            return $id;
        }
    }

    // -----------------------------
    // Find user by email
    // -----------------------------
    public function findByEmail($email)
    {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE email = ? LIMIT 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        return $user;
    }

    // -----------------------------
    // Find user by Google ID
    // -----------------------------
    public function findByGoogleId($googleId)
    {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE google_id = ? LIMIT 1");
        $stmt->bind_param("s", $googleId);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        return $user;
    }

    // -----------------------------
    // Find user by ID
    // -----------------------------
    public function findById($id)
    {
        $stmt = $this->conn->prepare("SELECT id, name, email, profile_pic FROM {$this->table} WHERE id = ? LIMIT 1");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        return $user;
    }
    public function createGoogleUser($name, $email, $googleId, $profilePic = 'default.png')
    {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (name, email, google_id, profile_pic, is_verified) 
         VALUES (?, ?, ?, ?, 1)"
        );
        $stmt->bind_param("ssss", $name, $email, $googleId, $profilePic);
        return $stmt->execute();
    }
}
