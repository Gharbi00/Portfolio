<?php
namespace Elevok\Widget\Controller\Index;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\Message\ManagerInterface;

class Save extends Action
{
    protected $configWriter;
    protected $messageManager;

    public function __construct(
        Context $context,
        WriterInterface $configWriter,
        ManagerInterface $messageManager
    ) {
        $this->configWriter = $configWriter;
        $this->messageManager = $messageManager;
        parent::__construct($context);
    }

    public function execute()
    {
        $post = $this->getRequest()->getPostValue();
        
        if ($post) {
            // Save the settings using the config writer
            $this->configWriter->save('elevok_widget/general/widget_app_id', $post['widget_app_id']);
            $this->configWriter->save('elevok_widget/general/widget_public_key', $post['widget_public_key']);
            $this->configWriter->save('elevok_widget/general/widget_secret_key', $post['widget_secret_key']);
            $this->configWriter->save('elevok_widget/general/first_text', $post['first_text']);
            $this->configWriter->save('elevok_widget/general/second_text', $post['second_text']);
            $this->configWriter->save('elevok_widget/general/submit_text', $post['submit_text']);
            $this->configWriter->save('elevok_widget/general/widget_style', $post['widget_style']);
            $this->configWriter->save('elevok_widget_general/general/desktop_selector', $post['desktop_selector']);
            $this->configWriter->save('elevok_widget_general/general/mobile_selector', $post['mobile_selector']);

            $this->messageManager->addSuccessMessage(__('Settings saved successfully.'));
        } else {
            $this->messageManager->addErrorMessage(__('Failed to save settings.'));
        }

        return $this->_redirect('widget/index/index');
    }
}
