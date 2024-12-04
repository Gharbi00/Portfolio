<?php

namespace Elevok\Widget\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Elevok\Widget\Block\WidgetSettings;
use Psr\Log\LoggerInterface;
use Magento\Quote\Model\QuoteFactory;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Customer\Model\Session as CustomerSession;
use Magento\SalesRule\Api\RuleRepositoryInterface;
use Magento\SalesRule\Model\RuleFactory;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\Api\SearchCriteriaBuilder;

class SendPushAmountObserver implements ObserverInterface 
{
    protected $widgetSettings;
    protected $logger;
    protected $customerSession;
    protected $quoteFactory;
    protected $cartRepository;
    protected $ruleRepository;
    protected $ruleFactory;
    protected $storeManager;
    protected $searchCriteriaBuilder;

    public function __construct(
        WidgetSettings $widgetSettings,
        LoggerInterface $logger,
        QuoteFactory $quoteFactory,
        CartRepositoryInterface $cartRepository,
        CustomerSession $customerSession,
        RuleRepositoryInterface $ruleRepository,
        RuleFactory $ruleFactory,
        StoreManagerInterface $storeManager,
        SearchCriteriaBuilder $searchCriteriaBuilder
    ) {
        $this->widgetSettings = $widgetSettings;
        $this->logger = $logger;
        $this->quoteFactory = $quoteFactory;
        $this->cartRepository = $cartRepository;
        $this->customerSession = $customerSession;
        $this->ruleRepository = $ruleRepository;
        $this->ruleFactory = $ruleFactory;
        $this->storeManager = $storeManager;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
    }

    public function execute(Observer $observer)
    {
        $order = $observer->getEvent()->getOrder();

        // Basic order details
        $customerId = $order->getCustomerId();
        $amount = $order->getGrandTotal();
        $customerEmail = $order->getCustomerEmail();
        $deductAmount = $this->customerSession->getDiscountAmount() * 1000;
        $orderTime = $order->getCreatedAt();
        $orderType = $this->getOrderType($order);
        $currency = $order->getOrderCurrency()->getCode();
        $appId = $this->widgetSettings->getWidgetAppId();
        
        // Log basic order details
        $this->logger->debug("Customer Email: " . $customerEmail);
        $this->logger->debug("Order Time: " . $orderTime);
        $this->logger->debug("Currency: " . $currency);
        $this->logger->debug("Order Type: " . $orderType);
        $this->logger->debug("Client Id: " . $appId);
        
        $deliveryAddress = $order->getShippingAddress();
        if ($deliveryAddress) {
            $addressDetails = [
                'street' => $deliveryAddress->getStreet(),
                'city' => $deliveryAddress->getCity(),
                'region' => $deliveryAddress->getRegion(),
                'postcode' => $deliveryAddress->getPostcode(),
                'country_id' => $deliveryAddress->getCountryId(),
                'telephone' => $deliveryAddress->getTelephone(),
            ];
            $this->logger->debug("Delivery Address: " . json_encode($addressDetails));
        } else {
            $this->logger->debug("No delivery address found for this order.");
        }
        
        // Retrieve and log product details
        $products = [];
        foreach ($order->getAllVisibleItems() as $item) {
            $products[] = [
                'id' =>  $item->getSku(),
                'quantity' => $item->getQtyOrdered(),

            ];
        }
        $this->logger->debug("Ordered Products: " . json_encode($products));
        
        
        $postData = json_encode([
            'user' => (string)$customerEmail,
            'orderTime' => (string)$orderTime,
            'currency' => $currency,
            'orderType' => $orderType,
            'client' => $appId,
            'deliveryAddress' => $addressDetails,
            'products' => $products
        ]);
        $this->logger->debug("Post Data: " . $postData);
        
        $this->widgetSettings->postOrderData($postData);

    
        // Log initial discount amount in session
        $this->logger->debug("Initial discount amount in session: " . $this->customerSession->getDiscountAmount());
    
        if ($customerEmail) {
            try {
                // Trigger the push amount function
                $this->widgetSettings->sendPushAmount($customerEmail, $amount, $deductAmount);
    
                // Clear the discount amount from the session and log the new value
                $this->customerSession->unsDiscountAmount();
                $this->logger->debug("Discount amount after clearing session: " . $this->customerSession->getDiscountAmount());
    
                // Globally reset discount for all quotes with the specified rule
                $discountLabel = 'Réduction par points fidélité'; // Define your discount rule label here
                $existingRule = $this->getExistingRule($discountLabel);
                if ($existingRule) {
                    $this->logger->debug("Current discount amount in rule before update: " . $existingRule->getDiscountAmount());
    
                    // Update the rule with a 0 discount and save it
                    $this->updateRule($existingRule, 0);
                    $this->logger->debug("Discount amount in rule after update: " . $existingRule->getDiscountAmount());
                    
                    // Clear any existing discount from active quotes
                    $this->resetDiscountForAllQuotes($discountLabel);
                }
    
            } catch (\Exception $e) {
                $this->logger->debug("Error in sendPushAmount: " . $e->getMessage());
            }
        }
    }
    
    /**
     * Reset discount for all quotes that have the specified rule.
     */
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

    private function getOrderType(\Magento\Sales\Model\Order $order): string
    {
        $shippingAddress = $order->getShippingAddress();
        if ($shippingAddress) {
            return 'DELIVERY';
        }
        return 'PICKUP';
    }
}
