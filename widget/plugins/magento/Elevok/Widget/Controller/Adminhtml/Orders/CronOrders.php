<?php
namespace Elevok\Widget\Controller\Adminhtml\Orders;

use Elevok\Widget\Controller\Adminhtml\Orders\DownloadXml;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Psr\Log\LoggerInterface;
use Magento\Framework\Event\ObserverInterface;
use Magento\Sales\Model\ResourceModel\Order\CollectionFactory as OrderCollectionFactory;

class CronOrders implements ObserverInterface
{
    protected $scopeConfig;
    protected $logger;
    protected $downloadXml;
    protected $orderCollectionFactory;

    public function __construct(
        ScopeConfigInterface $scopeConfig,
        LoggerInterface $logger,
        DownloadXml $downloadXml,
        OrderCollectionFactory $orderCollectionFactory
    ) {
        $this->scopeConfig = $scopeConfig;
        $this->logger = $logger;
        $this->downloadXml = $downloadXml;
        $this->orderCollectionFactory = $orderCollectionFactory;
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        $cronEnabled = $this->scopeConfig->isSetFlag(
            'elevok_widget_orders/orders_group/run_cron',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
        $this->logger->debug("Cron Value Detector: " . $cronEnabled);

        if (!$cronEnabled) {
            $this->logger->debug('Cron is disabled. Skipping order export.');
            return;
        }

        // Check the total number of orders
        $orderCount = $this->getOrderCount();
        $this->logger->debug("Total Orders: " . $orderCount);

        if ($orderCount < 2) {
            $this->logger->debug("Order count is below 50. Skipping execution.");
            return;
        }

        $this->logger->debug('Order count reached 2. Triggering DownloadXml.');

        try {
            $this->downloadXml->execute();
        } catch (\Exception $e) {
            $this->logger->error('Error triggering DownloadXml: ' . $e->getMessage());
        }
    }

    /**
     * Get the total number of orders in the system.
     *
     * @return int
     */
    protected function getOrderCount()
    {
        $orderCollection = $this->orderCollectionFactory->create();
        return $orderCollection->getSize();
    }
}
