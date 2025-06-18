<?php
namespace Elevok\Widget\Block;

use Magento\Framework\View\Element\Template;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\HTTP\Client\Curl;
use Psr\Log\LoggerInterface;
use Magento\Customer\Model\Session as CustomerSession;
use Magento\Store\Model\ScopeInterface;

class WidgetSettings extends Template
{
    protected $curl;
    protected $_scopeConfig;
    protected $logger;
    protected $customerSession;

    public function __construct(
        Template\Context $context,
        ScopeConfigInterface $scopeConfig,
        Curl $curl,
        CustomerSession $customerSession,
        LoggerInterface $logger,
        array $data = []
    ) {
        $this->customerSession = $customerSession;
        $this->_scopeConfig = $scopeConfig;
        $this->curl = $curl;
        $this->logger = $logger;
        parent::__construct($context, $data);
    }

    public function getWidgetAppId()
    {
        $value = $this->_scopeConfig->getValue('elevok_widget_general/general/widget_app_id', ScopeInterface::SCOPE_STORE);
        //$this->logger->debug('Widget App ID: ' . $value);
        return $value;
    }
    
    public function getWidgetPublicKey()
    {
        $value = $this->_scopeConfig->getValue('elevok_widget_general/general/widget_public_key', ScopeInterface::SCOPE_STORE);
        //$this->logger->debug('Widget Public Key: ' . $value);
        return $value;
    }
    
    public function getWidgetSecretKey()
    {
        $value = $this->_scopeConfig->getValue('elevok_widget_general/general/widget_secret_key', ScopeInterface::SCOPE_STORE);
        //$this->logger->debug('Widget Secret Key: ' . $value);
        return $value;
    }
    
    public function getFirstText()
    {
        $value = $this->_scopeConfig->getValue('elevok_widget_general/general/first_text', ScopeInterface::SCOPE_STORE);
        //$this->logger->debug('First Text: ' . $value);
        return $value ?: 'Montant de votre portefeuille en points de fidélité:';
    }
    
    public function getSecondText()
    {
        $value = $this->_scopeConfig->getValue('elevok_widget_general/general/second_text', ScopeInterface::SCOPE_STORE);
       // $this->logger->debug('Second Text: ' . $value);
        return $value ?: 'Points à utiliser pour une réduction:';
    }
    
    public function getSubmitText()
    {
        $value = $this->_scopeConfig->getValue('elevok_widget_general/general/submit_text', ScopeInterface::SCOPE_STORE);
        //$this->logger->debug('Submit Text: ' . $value);
        return $value ?: 'Appliquer une remise:';
    }

    public function getDesktopSelector()
    {
        $value = $this->_scopeConfig->getValue(
            'elevok_widget_general/general/desktop_selector', // Adjust the path if needed
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
        $this->logger->debug("Desktop Selector : " . $value);
        return $value ?: 'Default Desktop Selector'; // Provide a default value if none is set
    }

    public function getMobileSelector()
    {
        $value = $this->_scopeConfig->getValue(
            'elevok_widget_general/general/mobile_selector', // Adjust the path if needed
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
        $this->logger->debug("Mobile Selector : " . $value);
        return $value ?: 'Default Mobile Selector'; // Provide a default value if none is set
        
    }


    public function getWidgetStyle()
    {
    $value = $this->_scopeConfig->getValue('elevok_widget_general/general/widget_style', \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
    return $value;
    }
    public function getDisplayDiscount()
    {
        $value = $this->_scopeConfig->getValue('elevok_widget_general/general/display_discount', \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
        //$this->logger->debug("Display Discount Value: " . $value);
        //$this->logger->debug("Display Discount Value bool: " . (bool)$value);
        return (bool)$value;
    }
    

    public function getCorporateAuth()
    {
        $publicKey = $this->getWidgetPublicKey();
        $secretKey = $this->getWidgetSecretKey();
        $appId = $this->getWidgetAppId();
    
        //$this->logger->debug("Public Key: " . $publicKey);
        //$this->logger->debug("Secret Key: " . $secretKey);
        //$this->logger->debug("App ID: " . $appId);
    
        $postData = json_encode([
            'publicKey' => $publicKey,
            'secretKey' => $secretKey,
            'client' => $appId,
        ]);
    
        $this->logger->debug("Post Data for Corporate Auth: " . $postData);
    
        $response = $this->sendRequest('/cauth/clogin', $postData);
        
        if ($response === null) {
            $this->logger->error("sendRequest returned null. Unable to authenticate.");
            return null; 
        }
    

    
        $responseData = json_decode($response, true);
        
        if ($responseData === null) {
            $this->logger->error("Failed to decode JSON response: " . json_last_error_msg());
            return null; 
        }
    
        //$this->logger->debug("Decoded Response Data: " . print_r($responseData, true));
        
        return $responseData['accessToken'] ?? null; // Use null coalescing operator for safety
    }
    
    
    public function fetchWalletInformation($user)
    {
        $accessToken = $this->getCorporateAuth();
        //$this->logger->debug("Access Token: " . $accessToken);
        
        if ($accessToken) {
            $postData = json_encode(['user' => $user]);
            //$this->logger->debug("Post Data for Wallet Info: " . $postData);
        
            $response = $this->sendAuthenticatedRequest('/wallet/check', $postData, $accessToken);
            $decodedResponse = json_decode($response, true);
         
            
            // Check if 'wallet' key exists before accessing it
            if (isset($decodedResponse)) {
                $this->logger->debug("Wallet information found in response." . print_r($decodedResponse, true));
                return $decodedResponse;
            } else {
                $this->logger->error("Wallet information not found in response.");
                return null; // Return null if 'wallet' key is not present
            }
        }
        
        $this->logger->warning("No Access Token available; Wallet info cannot be retrieved.");
        return null;
    }
    
    
    public function sendPushAmount($customerEmail, $amount, $deductAmount)
    {
        $accessToken = $this->getCorporateAuth();
        if ($accessToken) {
            $postData = json_encode([
                'user' => (string)$customerEmail,
                'source' => 'WEB',
                'amount' => $amount,
                'deductAmount' => (string)$deductAmount
            ]);
            //$this->logger->debug('sendPushAmount post data: ' . print_r($postData, true));
            $response = $this->sendAuthenticatedRequest('/wallet/push', $postData, $accessToken);
            //$this->logger->debug('sendPushAmount API Response: ' . print_r($response, true));
        }
    }

    public function sendRequest($endpoint, $postData)
    {
        $url = 'https://api.elevok.com' . $endpoint;
    
        $ch = curl_init($url);
    
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        // Set headers
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($postData),
            'User-Agent: Mozilla/5.0'
        ]);

        // Execute the cURL request
        $result = curl_exec($ch);
        
        // Check for cURL errors
        if (curl_errno($ch)) {
            $this->logger->error("cURL Error: " . curl_error($ch));
            curl_close($ch);
            return null; // Return null if there's an error
        }

        curl_close($ch);
        return $result;
    }
    
    
    
    
    public function sendAuthenticatedRequest($endpoint, $postData, $accessToken)
    {
        $url = 'https://api.elevok.com' . $endpoint;
    
        // Debug log for endpoint and post data
       // $this->logger->debug("sendAuthenticatedRequest Sending authenticated request to URL: " . $url);
       // $this->logger->debug("sendAuthenticatedRequest Post Data: " . print_r($postData, true));
    
    
        // Initialize cURL
        $ch = curl_init($url);
    
        // Configure cURL options
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        // Set headers
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($postData),
            'Authorization: Bearer ' . $accessToken,
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        ]);
    
        // Execute the request
        $result = curl_exec($ch);
    

        //$this->logger->debug("sendAuthenticatedRequest Response from API: " . $result);
    
        // Close the cURL session
        curl_close($ch);
    
        return $result;
    }
    

    private function _getConfig($path)
    {
        return $this->_scopeConfig->getValue("elevok_widget/general/{$path}", \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
    }

    public function detectAppChanges($customerEmail, $postDataType, $postValue)
    {
        $accessToken = $this->getCorporateAuth();
        if ($accessToken) {
            if ($postDataType='lang'){
                $postData = json_encode([
                    'reference' => (string)$customerEmail,
                    'lang' => $postValue
                ]);
            }
            elseif ($postDataType='theme'){
                $postData = json_encode([
                    'reference' => (string)$customerEmail,
                    'theme' => $postValue
                ]);
            }

            $this->logger->debug('detectAppChanges post data: ' . print_r($postData, true));
            $response = $this->sendAuthenticatedRequest('/widget/setup', $postData, $accessToken);
            $this->logger->debug('detectAppChanges API Response: ' . print_r($response, true));
        }

    }

    public function postOrderData($postData)
    {
        try {
            $accessToken = $this->getCorporateAuth();
            if ($accessToken) {
                $this->logger->debug('Post Data Order: ' . $postData);
                $response = $this->sendAuthenticatedRequest('/order/create', $postData, $accessToken);
                $this->logger->debug('Response: ' . $response);
            }
        } catch (\Exception $e) {
            $this->logger->debug('Error posting order data: ' . $e->getMessage());
        }
    }



    public function getCustomerEmail()
    {
        return $this->customerSession->getCustomer()->getEmail();
    }

    
    
}
