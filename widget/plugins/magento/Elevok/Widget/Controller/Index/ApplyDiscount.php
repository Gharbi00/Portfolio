<?php

namespace Elevok\Widget\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Model\QuoteFactory;
use Magento\SalesRule\Api\Data\RuleInterfaceFactory;
use Magento\SalesRule\Api\RuleRepositoryInterface;
use Magento\Store\Model\StoreManagerInterface;
use Psr\Log\LoggerInterface;
use Magento\Customer\Model\Session as CustomerSession;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\App\CsrfAwareActionInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\App\Request\InvalidRequestException;
use Elevok\Widget\Block\WidgetSettings;

class ApplyDiscount extends Action implements CsrfAwareActionInterface
{
    protected $resultJsonFactory;
    protected $cartRepository;
    protected $quoteFactory;
    protected $ruleFactory;
    protected $ruleRepository;
    protected $storeManager;
    protected $logger;
    protected $customerSession;
    protected $widgetSettings;

    public function __construct(
        Context $context,
        WidgetSettings $widgetSettings,
        JsonFactory $resultJsonFactory,
        CartRepositoryInterface $cartRepository,
        QuoteFactory $quoteFactory,
        RuleInterfaceFactory $ruleFactory,
        RuleRepositoryInterface $ruleRepository,
        StoreManagerInterface $storeManager,
        LoggerInterface $logger,
        CustomerSession $customerSession
    ) {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->cartRepository = $cartRepository;
        $this->widgetSettings = $widgetSettings;
        $this->quoteFactory = $quoteFactory;
        $this->ruleFactory = $ruleFactory;
        $this->ruleRepository = $ruleRepository;
        $this->storeManager = $storeManager;
        $this->logger = $logger;
        $this->customerSession = $customerSession;
        parent::__construct($context);
    }

    public function execute()
    {
        if (!$this->getRequest()->isPost()) {
            $this->logger->debug("Request method is not POST.");
            return $this->respondWithJson(405, "Method Not Allowed");
        }

        $discountAmount = (float)$this->getRequest()->getParam("discount_amount");
        $this->customerSession->setDiscountAmount($discountAmount);
        $this->logger->debug("Discount Amount: " .  $discountAmount);
        $discountName = $this->widgetSettings->getDiscountName(); // Fetch dynamic discount name
        if (!$discountName) {
            $discountName = 'Réduction par points fidélité'; // Fallback if no name is set
        }
    
        $discountLabel = 'Réduction par points fidélité';
        $this->logger->debug("Received POST data: " . print_r($this->getRequest()->getPostValue(), true));

        try {
            $quote = $this->getCustomerQuote();
            if (!$quote || !$quote->getId()) {
                $this->logger->debug("No active cart found for customer.");
                return $this->respondWithJson(404, "No active cart found.");
            }

            $existingRule = $this->getExistingRule($discountLabel);
            if ($existingRule) {
                $this->updateRule($existingRule, $discountAmount);
                $updatedTotal = $quote->getGrandTotal();

                return $this->respondWithJson(200, "Réduction appliquée avec succès !", $updatedTotal);
            }

            $this->logger->debug("Creating a new discount rule.");
            $quote->setDiscountDescription($discountName);
            $quote->setDiscountName($discountName);
            $this->createNewRule($discountLabel, $discountAmount);
            $quote->collectTotals();
            $this->cartRepository->save($quote);

            return $this->respondWithJson(200, "Réduction appliquée avec succès !");
        } catch (\Exception $e) {
            $this->logger->error("Exception occurred: " . $e->getMessage());
            return $this->respondWithJson(500, "Échec de l'application de la réduction. Veuillez réessayer !");
        }
    }

    protected function getCustomerQuote()
    {
        $customerId = $this->customerSession->getCustomerId();
        if (!$customerId) {
            $this->logger->debug("Customer not logged in.");
            return null;
        }
        //$this->logger->debug("Loading quote for customer ID: " . $customerId);
        return $this->quoteFactory->create()->loadByCustomer($customerId);
    }

    protected function getExistingRule($discountLabel)
    {
        $searchCriteria = $this->_objectManager->create('Magento\Framework\Api\SearchCriteriaBuilder')
            ->addFilter('name', $discountLabel, 'eq')
            ->create();
        $rules = $this->ruleRepository->getList($searchCriteria)->getItems();
        $this->logger->debug("Searching for existing discount rules.");
    
        // Check if a rule is found and log the details
        $rule = reset($rules); // Returns the first matching rule or null
        if ($rule) {
            $this->logger->debug("Existing rule found with name: " . $rule->getName());
        }
        return $rule;
    }
    

    protected function updateRule($rule, $discountAmount)
    {
        $this->logger->debug("Updating discount rule with name: " . $rule->getName() . " and current discount amount: " . $rule->getDiscountAmount());
        
        // Set the new discount amount
        $rule->setDiscountAmount($discountAmount);
        $this->ruleRepository->save($rule);
        $this->_eventManager->dispatch('clean_cache_by_tags', ['tags' => ['catalog_rule']]);
    }
    

    protected function createNewRule($discountLabel, $discountAmount)
    {
        $this->logger->debug("Creating new discount rule with label: " . $discountLabel);
        $rule = $this->ruleFactory->create();
        $rule->setName($discountLabel)
            ->setDescription("This rule applies Réduction par points fidélité discount.")
            ->setIsActive(true)
            ->setSimpleAction('by_fixed')
            ->setDiscountAmount($discountAmount)
            ->setDiscountQty(1)
            ->setDiscountStep(0)
            ->setSimpleFreeShipping(false)
            ->setApplyToShipping(false)
            ->setIsRss(false)
            ->setStopRulesProcessing(false)
            ->setWebsiteIds([$this->storeManager->getStore()->getWebsiteId()])
            ->setCustomerGroupIds([0, 1, 2, 3])
            ->setFromDate(date('Y-m-d'))
            ->setToDate(date('Y-m-d', strtotime('+1 year')))
            ->setUsesPerCustomer(0);

        $this->ruleRepository->save($rule);
    }

    protected function respondWithJson($statusCode, $message, $total = null)
    {
        $this->logger->debug("Responding with message: " . $message);
        $result = $this->resultJsonFactory->create();
        $this->getResponse()->setHttpResponseCode($statusCode);
        $responseData = ["message" => $message];
        
        // Include total if provided
        if ($total !== null) {
            $responseData["total"] = $total;
        }
    
        $result->setData($responseData);
        return $result;
    }
    

    // Bypass CSRF validation for this action
    public function validateForCsrf(RequestInterface $request): ?bool
    {
        return true; // Bypass CSRF validation for this request
    }

    public function createCsrfValidationException(RequestInterface $request): ?InvalidRequestException
    {
        return null; // No exception thrown, as CSRF validation is bypassed
    }
}
