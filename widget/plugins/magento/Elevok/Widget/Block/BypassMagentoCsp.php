<?php
namespace Elevok\Widget\Block;

use Magento\Csp\Observer\Render;

class BypassMagentoCsp
{
    public function aroundExecute(Render $subject, callable $proceed)
    {
      
    }
}
