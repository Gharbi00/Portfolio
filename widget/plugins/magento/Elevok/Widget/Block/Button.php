<?php
namespace Elevok\Widget\Block;

use Magento\Backend\Block\Template\Context;
use Magento\Framework\Data\Form\Element\AbstractElement;
use Magento\Config\Block\System\Config\Form\Field;

class Button extends Field
{
    protected function _getElementHtml(AbstractElement $element)
    {
        $url = $this->getUrl('elevok_widget/orders/downloadxml');
        return "<button onclick=\"setLocation('$url')\">Export Orders</button>";
    }
}
