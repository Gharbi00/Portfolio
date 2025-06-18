<?php

namespace Elevok\Widget\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Customer\Model\Session as CustomerSession;
use Magento\Framework\Message\ManagerInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\App\Action\Context;
use Psr\Log\LoggerInterface;
use Elevok\Widget\Block\WidgetSettings;
use Magento\Framework\Locale\Resolver;

use Magento\Store\Model\StoreManagerInterface;

class Register extends Action implements ObserverInterface
{
    protected $logger;
    protected $scopeConfig;
    protected $customerSession;
    protected $messageManager;
    protected $widgetSettings;
    protected $localeResolver;
    protected $storeManager;
    

    public function __construct(
        Context $context,
        WidgetSettings $widgetSettings,
        ScopeConfigInterface $scopeConfig,
        CustomerSession $customerSession,
        ManagerInterface $messageManager,
        LoggerInterface $logger,
        StoreManagerInterface $storeManager,
        Resolver $localeResolver
    ) {
        $this->scopeConfig = $scopeConfig;
        $this->widgetSettings = $widgetSettings;
        $this->customerSession = $customerSession;
        $this->messageManager = $messageManager;
        $this->logger = $logger;
        $this->localeResolver = $localeResolver;
        $this->storeManager = $storeManager;
        parent::__construct($context);
    }

    // This method will handle both login and registration events
    public function execute(Observer $observer = null)
    {
if ($observer && $observer->getEvent()->getName() === 'customer_logout') {
    // Clear cookies
    setcookie('elvkwdigttoken', '', time() - 3600, '/');
    setcookie('elvwdigtauth', '', time() - 3600, '/');
    setcookie('elvwdigtauth', 'false', time() + (864000 * 300), '/');

    // Inject JavaScript for local storage operations
    echo '<script>
        document.addEventListener("DOMContentLoaded", function() {
            console.log("Customer logout detected. Clearing local storage...");
            localStorage.removeItem("elvkwdigttoken");
            localStorage.removeItem("elvwdigtauth");
            localStorage.setItem("elvwdigtauth", "false");
            console.log("Local storage cleared successfully.");
        });
    </script>';
    $this->logger->debug('User logged out and cookies cleared.');
    return;
}

        if (!$this->customerSession->isLoggedIn()) {
            $this->messageManager->addErrorMessage(__('Please log in to register.'));
            return $this->_redirect('customer/account/login');
        }

        $customer = $this->customerSession->getCustomer();
        $email = $customer->getEmail();
        $firstName = $customer->getFirstname();
        $lastName = $customer->getLastname();
        //$locale = $this->storeManager->getStore($storeId)->getConfig('general/locale/code');
        //$this->logger->debug('Store Language is :' . $locale );

        //$this->logger->debug("Customer details: Email - $email, First Name - $firstName, Last Name - $lastName");

        // Get configuration settings
        $appId = $this->widgetSettings->getWidgetAppId();
        $publicKey = $this->widgetSettings->getWidgetPublicKey();
        $secretKey = $this->widgetSettings->getWidgetSecretKey();

        //$this->logger->debug("Public Key: $publicKey, Secret Key: $secretKey, App ID: $appId");

        // Authentication URL
        $url = 'https://api.elevok.com/cauth/clogin';

        // Prepare authentication request
        $postData = json_encode([
            'publicKey' => $publicKey,
            'secretKey' => $secretKey,
            'client' => $appId
        ]);
        //$this->logger->debug("Auth URL: $url, Post Data: $postData");
        // Send cURL request for authentication
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($postData),
            'User-Agent: Mozilla/5.0'
        ]);

        $result = curl_exec($ch);
        curl_close($ch);

        $response = json_decode($result, true);
        //$this->logger->debug("Auth Response: " . print_r($response, true));
        if ($response && isset($response['accessToken'])) {
            $accessToken = $response['accessToken'];

            // Mutualize URL
            $mutualizeUrl = 'https://api.elevok.com/cauth/login';
            $mutualizeData = json_encode([
                'identifier' => (string)$email,
                'email' => $email,
                'firstName' => $firstName,
                'lastName' => $lastName,
            ]);
            //$this->logger->debug("Mutualization URL: " . $mutualizeUrl);
            //$this->logger->debug("Mutualization Body: " . $mutualizeData);

            // Send cURL request for mutualization
            $ch = curl_init($mutualizeUrl);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $mutualizeData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $accessToken,
                'User-Agent: Mozilla/5.0'
            ]);

            $mutualizeResult = curl_exec($ch);
            curl_close($ch);

            $mutualizeResponse = json_decode($mutualizeResult, true);
            $this->logger->debug("Mutualization Response: " . print_r($mutualizeResponse, true));
            if ($mutualizeResponse && isset($mutualizeResponse['accessToken'])) {
                $accessTokenConsumer = $mutualizeResponse['accessToken'];
                setcookie('elvkwdigttoken', $accessTokenConsumer, time() + (864000 * 300), "/");
                $this->logger->debug('User authenticated successfully.');
                return $this->_redirect('customer/account');
            } else {
                $this->logger->debug('Authentication failed.');
              
            }
        } else {
            $this->logger->debug('Authentication request failed.');
        }

        return $this->_redirect('customer/account');
    }
}
