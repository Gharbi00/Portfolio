<?php
namespace Elevok\Widget\Controller\Adminhtml\Catalog;

use Elevok\Widget\Controller\Adminhtml\Catalog\DownloadXmlCatalog;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Psr\Log\LoggerInterface;
use Magento\Framework\Event\ObserverInterface;

class CronCatalog implements ObserverInterface
{
    protected $scopeConfig;
    protected $logger;
    protected $downloadXml;

    public function __construct(
        ScopeConfigInterface $scopeConfig,
        LoggerInterface $logger,
        DownloadXmlCatalog $downloadXml
    ) {
        $this->scopeConfig = $scopeConfig;
        $this->logger = $logger;
        $this->downloadXml = $downloadXml;
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        $cronEnabled = $this->scopeConfig->isSetFlag(
            'elevok_widget_catalog/catalog_group/cron_catalog',
            \Magento\Store\Model\ScopeInterface::SCOPE_STORE
        );
        $this->logger->debug("Cron Catalog Value Detector: " . $cronEnabled);

        if (!$cronEnabled) {
            $this->logger->debug('Cron Catalog is disabled. Skipping order export.');
            return;
        }

        $this->logger->debug('Cron Catalog is enabled. Triggering DownloadXml.');

        try {
            $this->downloadXml->execute();
        } catch (\Exception $e) {
            $this->logger->error('Error triggering DownloadXml: ' . $e->getMessage());
        }
    }
}
