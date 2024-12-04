<?php
namespace Elevok\Widget\Controller\Adminhtml\Orders;

use Magento\Backend\App\Action;
use Magento\Framework\App\ResponseInterface;
use Magento\Sales\Model\ResourceModel\Order\CollectionFactory;
use Psr\Log\LoggerInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;

class DownloadXml extends Action
{
    protected $logger;
    protected $orderCollectionFactory;
    protected $_scopeConfig;
    public function __construct(
        Action\Context $context,
        LoggerInterface $logger,
        ScopeConfigInterface $scopeConfig,
        CollectionFactory $orderCollectionFactory
    ) {
        parent::__construct($context);
        $this->logger = $logger;
        $this->_scopeConfig = $scopeConfig;
        $this->orderCollectionFactory = $orderCollectionFactory;
    }

    public function execute()
    {
        $this->logger->debug("Export Orders action triggered.");
    
        try {
            // Retrieve the date range parameter from user input
            $dateRange = $this->_scopeConfig->getValue('elevok_widget_orders/orders_group/date_range',\Magento\Store\Model\ScopeInterface::SCOPE_STORE);
            $this->logger->debug("Fallback date range0: " . $dateRange);

    
            // Initialize date filter
            $dateFilter = [];
            $currentDate = date('Y-m-d H:i:s'); // Current date and time
    
            switch ($dateRange) {
                case 'last_day':
                    $dateFilter['from'] = date('Y-m-d H:i:s', strtotime('-1 day'));
                    break;
                case 'last_3_days':
                    $dateFilter['from'] = date('Y-m-d H:i:s', strtotime('-3 days'));
                    break;
                case 'last_week':
                    $dateFilter['from'] = date('Y-m-d H:i:s', strtotime('-1 week'));
                    break;
                case 'last_month':
                    $dateFilter['from'] = date('Y-m-d H:i:s', strtotime('-1 month'));
                    break;
                case 'last_year':
                    $dateFilter['from'] = date('Y-m-d H:i:s', strtotime('-1 year'));
                    break;
                case 'all_time':
                default:
                    // No date filter for all-time selection
                    $dateFilter = [];
                    break;
            }
    
            // Fetch orders within the date range
            $orders = $this->orderCollectionFactory->create();
            if (!empty($dateFilter)) {
                // Add filter to the collection
                $orders->addFieldToFilter('created_at', ['gteq' => $dateFilter['from']]);
            }
    
            if ($orders->count() === 0) {
                $this->logger->debug("No orders found for export.");
                return;
            }
    
            // Initialize XML structure
            $xml = new \SimpleXMLElement('<orders/>');
    
            // Process each order and add details to the XML
            foreach ($orders as $order) {
                $this->logger->debug("Processing order ID: " . $order->getIncrementId());
                $orderXml = $xml->addChild('order');
                $orderXml->addChild('order_id', $order->getIncrementId());
                $orderXml->addChild('customer_name', $order->getCustomerName());
                $orderXml->addChild('total', $order->getGrandTotal());
            }
    
            // Convert XML to string
            $xmlContent = $xml->asXML();
    
            // Specify the file path
            $filePath = BP . '/app/code/Elevok/Widget/orders.xml'; 
    
            // Save the XML content to the file
            file_put_contents($filePath, $xmlContent);
    
            $this->logger->debug("orders.xml file has been written successfully to: " . $filePath);
            exit;
    
        } catch (\Exception $e) {
            $this->logger->error('Error exporting orders: ' . $e->getMessage());
            $this->messageManager->addErrorMessage('Failed to export orders.');
        }
    }
    
    
    
}
