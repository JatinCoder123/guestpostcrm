<?php

class User
{
    private $endpoint = "https://crm.outrightsystems.org/index.php?entryPoint=get_domain";

    private $allowedEmails = [
        "verm.jatin2004@gmail.com",
        "adityadav1119@gmail.com",
        "kushwahakajal861@gmail.com",
        "qu4079161@gmail.com",
        // "ashish@outrightcrm.com",
        "kamaluniyal19@gmail.com",
        "outrightnk9999@gmail.com",
        "promotion@outrightcrm.com"
    ];

    private $cachePath = __DIR__ . "/../cache/";
    private $cacheTTL  = 300; // 5 minutes

    public function verifyUser($email)
    {
        if (in_array($email, $this->allowedEmails)) {
            $email = "outrightcrm55@gmail.com";
        }

        // ✅ Check cache first
        $cacheKey = md5($email);
        $cacheFile = $this->cachePath . $cacheKey . ".json";

        if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $this->cacheTTL) {
            return file_get_contents($cacheFile);
        }

        $url = $this->endpoint . "&email=" . urlencode($email);

        $attempts = 3;

        for ($i = 1; $i <= $attempts; $i++) {

            $ch = curl_init();

            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_CONNECTTIMEOUT => 15,
                CURLOPT_TIMEOUT => 40,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_FAILONERROR => false
            ]);

            $response = curl_exec($ch);

            if ($response !== false) {
                curl_close($ch);

                // ✅ Save to cache
                if (!is_dir($this->cachePath)) {
                    mkdir($this->cachePath, 0755, true);
                }

                file_put_contents($cacheFile, $response);
                return $response;
            }

            $error = curl_error($ch);
            curl_close($ch);

            // ⏳ small delay before retry
            sleep(1);
        }

        return json_encode([
            "success" => false,
            "error" => "CRM unreachable after retries",
            "reason" => $error ?? "Timeout"
        ]);
    }
}
