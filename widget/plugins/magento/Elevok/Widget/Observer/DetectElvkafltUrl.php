<?php

namespace Elevok\Widget\Observer;

use Magento\Framework\Event\ObserverInterface;
use Psr\Log\LoggerInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Stdlib\CookieManagerInterface;
use Magento\Framework\Stdlib\Cookie\CookieMetadataFactory;

class DetectElvkafltUrl implements ObserverInterface
{
    protected $logger;
    protected $request;
    protected $cookieManager;
    protected $cookieMetadataFactory;

    public function __construct(
        LoggerInterface $logger,
        RequestInterface $request,
        CookieManagerInterface $cookieManager,
        CookieMetadataFactory $cookieMetadataFactory
    ) {
        $this->logger = $logger;
        $this->request = $request;
        $this->cookieManager = $cookieManager;
        $this->cookieMetadataFactory = $cookieMetadataFactory;
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        // Get the full URL path
        $fullUrl = $this->request->getRequestUri();
    
        // Check if 'elvkaflt' is in the URL
        if (strpos($fullUrl, 'elvkaflt') !== false) {
            $queryString = parse_url($fullUrl, PHP_URL_QUERY);
    
            if ($queryString) {
                parse_str($queryString, $params);
    
                if (isset($params['elvkaflt'])) {
                    $elvkafltValue = $params['elvkaflt']; // Extract value of 'elvkaflt'
    
                    $cookieName = 'elvkaflt';
                    $cookieValue = $elvkafltValue;
                    $cookieDuration = 3600; // Cookie duration in seconds (1 hour)
    
                    $metadata = $this->cookieMetadataFactory->createPublicCookieMetadata()
                    ->setDuration(864000 * 300) // Cookie duration
                    ->setPath('/')              // Set path to root for visibility across the site
                    ->setDomain($this->request->getServer('HTTP_HOST')) // Dynamically set domain
                    ->setHttpOnly(false)        // Allow client-side access
                    ->setSecure(false);          // Set for HTTPS only
                
    
                    $this->cookieManager->setPublicCookie($cookieName, $cookieValue, $metadata);
                    setcookie(
                        'elvkaflt',
                        $elvkafltValue,
                        [
                            'expires' => time() + 864000 * 300,
                            'path' => '/',
                            'domain' => $this->request->getServer('HTTP_HOST'),
                            'secure' => false, // Set true for HTTPS
                            'httponly' => false,
                            'samesite' => 'None', // Requires PHP 7.3+ if used directly
                        ]
                    );
                    
                    $this->logger->debug("Full URL: " . $fullUrl);
                    $this->logger->debug("Extracted value: " . $elvkafltValue);
                    $this->logger->debug("Setting cookie: " . $cookieName . " = " . $cookieValue);
                    $this->logger->debug("Cookie set for 'elvkaflt' with value: " . $elvkafltValue);
                } else {
                    $this->logger->debug("'elvkaflt' parameter not found in the URL.");
                }
            } else {
                $this->logger->debug("No query string detected in the URL.");
            }
        } else {
            $this->logger->debug("'elvkaflt' not found in the URL.");
        }
    }
    
}