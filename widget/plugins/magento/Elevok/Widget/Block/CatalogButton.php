<?php
namespace Elevok\Widget\Block;

use Magento\Backend\Block\Template\Context;
use Magento\Framework\Data\Form\Element\AbstractElement;
use Magento\Config\Block\System\Config\Form\Field;

class CatalogButton extends Field
{
    protected function _getElementHtml(AbstractElement $element)
    {
        // URL should point to the `DownloadXmlCatalog` controller
        $url = $this->getUrl('elevok_widget/catalog/downloadxmlcatalog');
        return "<button onclick=\"setLocation('$url')\">Export</button>";
    }
}
