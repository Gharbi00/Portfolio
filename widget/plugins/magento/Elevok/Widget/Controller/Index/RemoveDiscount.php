<?php

namespace Elevok\Widget\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Model\QuoteFactory;
use Psr\Log\LoggerInterface;
use Magento\Customer\Model\Session as CustomerSession;
use Magento\Sales\Model\Order;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\App\Request\InvalidRequestException;
use Magento\Framework\App\CsrfAwareActionInterface;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\SalesRule\Api\RuleRepositoryInterface;

class RemoveDiscount extends Action implements CsrfAwareActionInterface

{
    protected $resultJsonFactory;
    protected $quoteFactory;
    protected $logger;
    protected $customerSession;
    protected $cartRepository;
    protected $ruleRepository;
    protected $searchCriteriaBuilder;

    public function __construct(
        Context $context,
        RuleRepositoryInterface $ruleRepository,
        JsonFactory $resultJsonFactory,
        CartRepositoryInterface $cartRepository,
        QuoteFactory $quoteFactory,
        LoggerInterface $logger,
        CustomerSession $customerSession,
        SearchCriteriaBuilder $searchCriteriaBuilder

    ) {
        $this->resultJsonFactory = $resultJsonFactory;
        $this->cartRepository = $cartRepository;
        $this->quoteFactory = $quoteFactory;
        $this->logger = $logger;
        $this->customerSession = $customerSession;
        $this->ruleRepository = $ruleRepository;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
        parent::__construct($context);
    }

    public function execute()
    {
        $resultJson = $this->resultJsonFactory->create();
        $customerId = $this->customerSession->getCustomerId(); // Getting customer ID from session
    
        if (!$customerId) {
            return $resultJson->setData([
                'success' => false,
                'message' => __('Customer not logged in.')
            ])->setHttpResponseCode(403);
        }
    
        $quote = $this->quoteFactory->create()->loadByCustomer($customerId);
    
        if (!$quote || !$quote->getId()) {
            return $resultJson->setData([
                'success' => false,
                'message' => __('No active cart found.')
            ])->setHttpResponseCode(404);
        }
    
        $discountLabel = 'Réduction par points fidélité';
        $cartRules = $quote->getAllVisibleItems(); // Get all visible items in the quote
    
        try {
            // Step 1: Clear the discount amount from session
            $this->customerSession->unsDiscountAmount();
            $this->logger->debug("Discount amount after clearing session REMOVEDISCOUNT: " . $this->customerSession->getDiscountAmount());
    
            // Step 2: Check if the discount rule is applied and remove it
            $existingRule = $this->getExistingRule($discountLabel);
            if ($existingRule) {
                $this->logger->debug("Current discount amount in rule before update: " . $existingRule->getDiscountAmount());
    
                // Update the rule with a 0 discount and save it
                $this->updateRule($existingRule, 0);
                $this->logger->debug("Discount amount in rule after update: " . $existingRule->getDiscountAmount());
    
                // Step 3: Clear any existing discount from active quotes
                $this->resetDiscountForAllQuotes($discountLabel);
    
                return $resultJson->setData([
                    'success' => true,
                    'message' => __('Discount removed successfully!')
                ])->setHttpResponseCode(200);
            }
    
            // If no rule found
            return $resultJson->setData([
                'success' => false,
                'message' => __('Discount not found.')
            ])->setHttpResponseCode(404);
    
        } catch (\Exception $e) {
            $this->logger->error("Exception occurred while removing discount: " . $e->getMessage());
            return $resultJson->setData([
                'success' => false,
                'message' => __('Failed to remove discount. Please try again.')
            ])->setHttpResponseCode(500);
        }
    }
    
    protected function updateDiscountRule($discountLabel)
    {
        $existingRule = $this->getExistingRule($discountLabel);
        if ($existingRule) {
            $this->logger->debug("Current discount amount in rule before update: " . $existingRule->getDiscountAmount());
            $this->updateRule($existingRule, 0);
            $this->logger->debug("Discount amount in rule after update: " . $existingRule->getDiscountAmount());
        }
    }
    
    protected function resetDiscountForAllQuotes($discountLabel)
    {
        // Load all active quotes that could have the discount
        $quoteCollection = $this->quoteFactory->create()->getCollection()
            ->addFieldToFilter('is_active', 1); // Only active carts
    
        foreach ($quoteCollection as $quote) {
            // Recalculate totals after resetting the discount amount
            $quote->setTotalsCollectedFlag(false)->collectTotals();
            $this->cartRepository->save($quote);
    
            $this->logger->debug("Reset discount in quote ID " . $quote->getId() . " for rule: " . $discountLabel);
        }
    }
    
    protected function getExistingRule($discountLabel)
    {
        $searchCriteria = $this->searchCriteriaBuilder
            ->addFilter('name', $discountLabel, 'eq')
            ->create();
        $rules = $this->ruleRepository->getList($searchCriteria)->getItems();
    
        $rule = reset($rules);
        return $rule ?: null;
    }
    
    protected function updateRule($rule, $discountAmount)
    {
        $rule->setDiscountAmount($discountAmount);
        $this->ruleRepository->save($rule);
    }
    





    public function validateForCsrf(RequestInterface $request): ?bool
    {
        return true; // Bypass CSRF validation for this request
    }

    public function createCsrfValidationException(RequestInterface $request): ?InvalidRequestException
    {
        return null; // No exception thrown, as CSRF validation is bypassed
    }
}
