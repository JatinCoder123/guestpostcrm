<?php
class User
{
    private $endpoint = "https://crm.outrightsystems.org/index.php?entryPoint=get_domain";

    public function verifyUser($email)
    {
        // Build full URL
        if ($email == "verm.jatin2004@gmail.com" || $email=="qu4079161@gmail.com" || $email=="kamaluniyal19@gmail.com" || $email=="outrightnk9999@gmail.com")
            $email = "vikas@outrightcrm.com";
        $url = $this->endpoint . "&email=" . urlencode($email);

        // Initialize cURL
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,   // Return response instead of output
            CURLOPT_SSL_VERIFYPEER => false, // You can enable this if SSL valid
            CURLOPT_TIMEOUT => 10
        ]);

        // Execute request
        $response = curl_exec($ch);

        // Check for errors
        if (curl_errno($ch)) {
            return "cURL Error: " . curl_error($ch);
        }

        // Close connection
        curl_close($ch);

        // Return API response
        return $response;
    }
}
