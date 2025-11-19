<?php
class User
{
    private $endpoint = "https://crm.outrightsystems.org/index.php?entryPoint=get_domain";

    // List of allowed emails
    private $allowedEmails = [
        "verm.jatin2004@gmail.com",
        "adityadav1119@gmail.com",
        "kushwahakajal861@gmail.com",
        "qu4079161@gmail.com",
        "kamaluniyal19@gmail.com",
        "outrightnk9999@gmail.com",
        "promotion@outrightcrm.com"
    ];

    public function verifyUser($email)
    {
        // If email is in allowed list → replace with master email
        if (in_array($email, $this->allowedEmails)) {
            $email = "vikas@outrightcrm.com";
        }

        // Build full URL
        $url = $this->endpoint . "&email=" . urlencode($email);

        // Initialize cURL
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true, 
            CURLOPT_SSL_VERIFYPEER => false, 
            CURLOPT_TIMEOUT => 10
        ]);

        // Execute request
        $response = curl_exec($ch);

        // Error handling
        if (curl_errno($ch)) {
            return "cURL Error: " . curl_error($ch);
        }

        curl_close($ch);

        return $response;
    }
}
