<?php
namespace Elevok\Widget\Controller\Adminhtml\Catalog;

use Magento\Framework\Data\OptionSourceInterface;

class EntityType implements OptionSourceInterface
{
    /**
     * Get options for the select field
     *
     * @return array
     */
    public function toOptionArray()
    {
        return [
            
            ['value' => 'products', 'label' => __('Products')],
            ['value' => 'brands', 'label' => __('Brands')],
            ['value' => 'categories', 'label' => __('Categories')],
            //['value' => 'articles', 'label' => __('Articles')],
            //['value' => 'attributes', 'label' => __('Attributes')],
            //['value' => 'attribute-values', 'label' => __('Attribute Values')],
        ];
    }
}
