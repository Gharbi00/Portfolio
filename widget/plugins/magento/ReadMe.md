To run this plugin you have to place it  MagentoFolderName\app\code
and then run 
php -d memory_limit=-1 bin/magento setup:upgrade
php -d memory_limit=-1 bin/magento setup:static-content:deploy -f
php -d memory_limit=-1 bin/magento cache:flush

Optional Commands:
php -d memory_limit=-1 bin/magento setup:di:compile
php -d memory_limit=-1 bin/magento cache:clean
php -d memory_limit=-1 bin/magento index:reindex