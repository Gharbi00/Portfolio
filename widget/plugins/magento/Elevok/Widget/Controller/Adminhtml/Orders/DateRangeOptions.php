<?php 
namespace Elevok\Widget\Controller\Adminhtml\Orders;
use Magento\Framework\Option\ArrayInterface;

class DateRangeOptions implements ArrayInterface
{
    public function toOptionArray()
    {
        return [
            ['value' => 'last_day', 'label' => __('Last Day')],
            ['value' => 'last_3_days', 'label' => __('Last 3 Days')],
            ['value' => 'last_week', 'label' => __('Last Week')],
            ['value' => 'last_month', 'label' => __('Last Month')],
            ['value' => 'last_year', 'label' => __('Last Year')],
            ['value' => 'all_time', 'label' => __('All Time')],
        ];
    }
}
