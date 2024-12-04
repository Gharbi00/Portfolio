<?php
if (!defined('_PS_VERSION_')) {
    exit;
}
use PrestaShop\PrestaShop\Adapter\Entity\Order;    // For Order
use PrestaShop\PrestaShop\Adapter\Entity\Cart;     // For Cart
use PrestaShop\PrestaShop\Adapter\Entity\Customer; // For Customer
use PrestaShop\PrestaShop\Adapter\Entity\Address;  // For Address
use PrestaShop\PrestaShop\Adapter\Entity\Currency; // For Currency

require dirname(__FILE__).'/gshoppingflux/gshoppingflux.php';

class ElevokWidget extends Module
{   
    
    public $config_form = false;
    private $accessToken = null;
    public $widget_url = "https://widgt-sbx-app.bosk.app";
    public $backend_url = "https://sfca-sbx-bck.diktup.cloud";
    public $logFilePath = "/var/www/vhosts/proitshop.com/httpdocs/cutomlog.log";

    public function __construct()
    {
        $this->name = 'elevokwidget';
        $this->version = '1.0.0';
        $this->author = 'Diktup';

        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Elevok Widget');
        $this->description = $this->l('Elevok widget module');

        $this->ps_versions_compliancy = array('min' => '1.7', 'max' => _PS_VERSION_);
    }

    public function install()
    {
        if (
            !parent::install() ||
            !$this->registerHook('actionAuthentication') ||
            !$this->registerHook('actionCustomerAccountAdd') ||
            !$this->registerHook('actionCustomerLogoutAfter') ||
            !$this->registerHook('actionValidateOrder') ||
            !$this->registerHook('displayAfterCarrier') ||
            !$this->registerHook('displayHeader') ||
            !$this->registerHook('displayFooter')
        ) {
            return false;
        }
        $helper = new \GShoppingFlux();
        if (
            !$this->registerHook('actionObjectCategoryAddAfter') ||
            !$this->registerHook('actionObjectCategoryDeleteAfter') ||
            !$this->registerHook('actionShopDataDuplication') ||
            !$this->registerHook('actionCarrierUpdate') ||
            !$helper->installDb()
        ) {
            return false;
        }

        $shops = Shop::getShops(true, null, true);
        foreach ($shops as $shop_id) {
            $shop_group_id = Shop::getGroupFromShop($shop_id);
    
            if (!$helper->initDb((int)$shop_id)) {
                return false;
            }
    
            if (!Configuration::updateValue('GS_PRODUCT_TYPE', '', true, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_DESCRIPTION', 'short', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_SHIPPING_MODE', 'fixed', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_SHIPPING_PRICE_FIXED', '1', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_SHIPPING_PRICE', '0.00', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_SHIPPING_COUNTRY', 'UK', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_SHIPPING_COUNTRIES', '0', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_CARRIERS_EXCLUDED', '0', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_IMG_TYPE', 'large_default', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_MPN_TYPE', 'reference', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_GENDER', '', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_AGE_GROUP', '', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_ATTRIBUTES', '0', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_COLOR', '', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_MATERIAL', '', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_PATTERN', '', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_SIZE', '', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_EXPORT_MIN_PRICE', '0.00', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_NO_GTIN', '1', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_SHIPPING_DIMENSION', '1', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_NO_BRAND', '1', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_ID_EXISTS_TAG', '1', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_EXPORT_NAP', '0', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_QUANTITY', '1', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_FEATURED_PRODUCTS', '1', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_GEN_FILE_IN_ROOT', '1', false, (int)$shop_group_id, (int)$shop_id) ||
                !Configuration::updateValue('GS_FILE_PREFIX', '', true, (int)$shop_group_id, (int)$shop_id)
            ) {
                return false;
            }
        }
    
        // Create export directory
        if (!is_dir(dirname(__FILE__) . '/export')) {
            @mkdir(dirname(__FILE__) . '/export', 0755, true);
        }
    
        @chmod(dirname(__FILE__) . '/export', 0755);
    
        return true;
    }
    



    public function getContent()
    {
        $output = '';

        $currentTab = isset($_GET['tab']) ? $_GET['tab'] : 'first';

        $output .= $this->renderTabNavigation($currentTab);

        $output .= '<form id="tabForm" method="post" action="' . $_SERVER['REQUEST_URI'] . '">';

        if ($currentTab === 'first') {
            if (Tools::isSubmit('submit' . $this->name)) {
                $configValue = (string) Tools::getValue('ELEVOKWIDGET_APP_ID');
                $publicKey = (string) Tools::getValue('ELEVOKWIDGET_PUBLIC_KEY');
                $secretKey = (string) Tools::getValue('ELEVOKWIDGET_SECRET_KEY');
                $customCSS = (string) Tools::getValue('ELEVOKWIDGET_CUSTOM_CSS');
                $moneyAmountText = (string) Tools::getValue('MONEY_AMOUNT_TEXT');
                $pointsToUseText = (string) Tools::getValue('POINT_TO_USE_TEXT');
                $submitButtonText = (string) Tools::getValue('SUBMIT_BUTTON_TEXT');
                $desktopLoginSelector = (string) Tools::getValue('DESKTOP_LOGIN_SELECTOR');
                $mobileLoginSelector = (string) Tools::getValue('MOBILE_LOGIN_SELECTOR');
                $displayDiscount = (int)Tools::getValue('ELEVOKWIDGET_DISPLAY_DISCOUNT');
        

    
                if (empty($configValue) || !Validate::isGenericName($configValue) || empty($publicKey) || empty($secretKey)) {
                    $output = $this->displayError($this->l('Invalid Configuration value'));
                } else {
                    Configuration::updateValue('ELEVOKWIDGET_APP_ID', $configValue);
                    Configuration::updateValue('ELEVOKWIDGET_PUBLIC_KEY', $publicKey);
                    Configuration::updateValue('ELEVOKWIDGET_SECRET_KEY', $secretKey);
                    Configuration::updateValue('ELEVOKWIDGET_CUSTOM_CSS', $customCSS);
                    Configuration::updateValue('MONEY_AMOUNT_TEXT', $moneyAmountText);
                    Configuration::updateValue('POINT_TO_USE_TEXT', $pointsToUseText);
                    Configuration::updateValue('SUBMIT_BUTTON_TEXT', $submitButtonText);
                    Configuration::updateValue('DESKTOP_LOGIN_SELECTOR', $desktopLoginSelector);
                    Configuration::updateValue('MOBILE_LOGIN_SELECTOR', $mobileLoginSelector);
                    Configuration::updateValue('ELEVOKWIDGET_DISPLAY_DISCOUNT', $displayDiscount);
                    $output = $this->displayConfirmation($this->l('Settings updated'));
                }
            }
             $output .=$this->displayForm();
        }
        elseif ($currentTab === 'second') {
            $gshoppingflux = new GShoppingFlux($this->context);
            if (method_exists($gshoppingflux, 'renderForm')) {
                $output .= $gshoppingflux->shoppingFluxCatalog();     
            }
        }
        elseif ($currentTab === 'third') {
            $gshoppingflux = new GShoppingFlux($this->context);
            if (method_exists($gshoppingflux, 'renderForm')) {
                $output .= $gshoppingflux->shoppingFluxOrders();     
            }
        }
        $output .= '</form>'; 
        
        return $output;
    }
    
    
    private function renderTabNavigation($currentTab)
    {
        $tabs = [
            'first' => $this->l('Widget'),
            'second' => $this->l('Catalog'),
            'third' => $this->l('Orders'),
        ];
    
        $output = '<ul class="nav nav-tabs">';
    
        foreach ($tabs as $key => $label) {
            $activeClass = ($currentTab === $key) ? 'active' : '';
            $output .= '<li class="nav-item">
                <a href="#" onclick="changeTab(\'' . $key . '\'); return false;" class="nav-link ' . $activeClass . '">' . $label . '</a>
            </li>';
        }
    
        $output .= '</ul>';
        
        $output .= '
        <script>
        function changeTab(tab) {
            var form = document.getElementById("tabForm"); // Get the form element
            var currentAction = form.action.split("&tab=")[0]; // Get the current action without the tab parameter
            form.action = currentAction + "&tab=" + tab; // Set the action to the new tab
            form.submit(); // Submit the form
        }
        </script>
        ';
    
        return $output;
    }
    

    public function displayForm()
    {
        $form = [
            'form' => [
                'legend' => [
                    'title' => $this->l('Settings'),
                ],
                'input' => [
                    [
                        'type' => 'text',
                        'label' => $this->l('App Id'),
                        'name' => 'ELEVOKWIDGET_APP_ID',
                        'size' => 20,
                        'required' => true,
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Public Key'),
                        'name' => 'ELEVOKWIDGET_PUBLIC_KEY',
                        'size' => 20,
                        'required' => true,
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Secret Key'),
                        'name' => 'ELEVOKWIDGET_SECRET_KEY',
                        'size' => 20,
                        'required' => true,
                    ],
                    [
                        'type' => 'textarea',
                        'label' => $this->l('Custom Style'),
                        'name' => 'ELEVOKWIDGET_CUSTOM_CSS',
                        'size' => 800000,
                        'required' => false,
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Money Amount Text'),
                        'name' => 'MONEY_AMOUNT_TEXT',
                        'size' => 20,
                        'required' => true,
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Points To use Text'),
                        'name' => 'POINT_TO_USE_TEXT',
                        'size' => 20,
                        'required' => true,
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Submit Button Text'),
                        'name' => 'SUBMIT_BUTTON_TEXT',
                        'size' => 20,
                        'required' => true,
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Desktop Login Selector'),
                        'name' => 'DESKTOP_LOGIN_SELECTOR',
                        'size' => 20,
                        'required' => true,
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Mobile Login Selector'),
                        'name' => 'MOBILE_LOGIN_SELECTOR',
                        'size' => 20,
                        'required' => true,
                    ],
                    [
                        'type' => 'switch',
                        'label' => $this->l('Display Discount Form'),
                        'name' => 'ELEVOKWIDGET_DISPLAY_DISCOUNT',
                        'required' => false,
                        'is_bool' => true,
                        'values' => [
                            [
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Yes')
                            ],
                            [
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('No')
                            ]
                        ],
                    ],
                ],
                'submit' => [
                    'title' => $this->l('Save'),
                    'class' => 'btn btn-default pull-right',
                ],
            ],
        ];

        $helper = new HelperForm();

  
        $helper->table = $this->table;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&' . http_build_query(['configure' => $this->name]);
        $helper->submit_action = 'submit' . $this->name;

        // Default language
        $helper->default_form_language = (int) Configuration::get('PS_LANG_DEFAULT');

        // Load current value into the form
        $helper->fields_value['ELEVOKWIDGET_APP_ID'] = Tools::getValue('ELEVOKWIDGET_APP_ID', Configuration::get('ELEVOKWIDGET_APP_ID'));
        $helper->fields_value['ELEVOKWIDGET_PUBLIC_KEY'] = Tools::getValue('ELEVOKWIDGET_PUBLIC_KEY', Configuration::get('ELEVOKWIDGET_PUBLIC_KEY'));
        $helper->fields_value['ELEVOKWIDGET_SECRET_KEY'] = Tools::getValue('ELEVOKWIDGET_SECRET_KEY', Configuration::get('ELEVOKWIDGET_SECRET_KEY'));
        $helper->fields_value['ELEVOKWIDGET_CUSTOM_CSS'] = Tools::getValue('ELEVOKWIDGET_CUSTOM_CSS', Configuration::get('ELEVOKWIDGET_CUSTOM_CSS'));
        $helper->fields_value['MONEY_AMOUNT_TEXT'] = Tools::getValue('MONEY_AMOUNT_TEXT', Configuration::get('MONEY_AMOUNT_TEXT'));
        $helper->fields_value['POINT_TO_USE_TEXT'] = Tools::getValue('POINT_TO_USE_TEXT', Configuration::get('POINT_TO_USE_TEXT'));
        $helper->fields_value['SUBMIT_BUTTON_TEXT'] = Tools::getValue('SUBMIT_BUTTON_TEXT', Configuration::get('SUBMIT_BUTTON_TEXT'));
        $helper->fields_value['DESKTOP_LOGIN_SELECTOR'] = Tools::getValue('DESKTOP_LOGIN_SELECTOR', Configuration::get('DESKTOP_LOGIN_SELECTOR'));
        $helper->fields_value['MOBILE_LOGIN_SELECTOR'] = Tools::getValue('MOBILE_LOGIN_SELECTOR', Configuration::get('MOBILE_LOGIN_SELECTOR'));
        $helper->fields_value['ELEVOKWIDGET_DISPLAY_DISCOUNT'] = Tools::getValue('ELEVOKWIDGET_DISPLAY_DISCOUNT', Configuration::get('ELEVOKWIDGET_DISPLAY_DISCOUNT'));
        return $helper->generateForm([$form]);
    }




    public function hookDisplayHeader($params)
    {
        
        $query = $_SERVER['QUERY_STRING']; 
        if (strpos($query, 'elvkaflt=') !== false) {
            PrestaShopLogger::addLog('elvkaflt exists');
            parse_str($query, $params);

            if (isset($params['elvkaflt'])) {
                $elvkafltValue = $params['elvkaflt'];

                // Set a cookie with the extracted value (expires in 30 days)
                setcookie('elvkaflt', $elvkafltValue, time() + (30 * 24 * 60 * 60), '/');
            }
        }
        else{
            //PrestaShopLogger::addLog('elvkaflt do not exists'); 
        }
        $appId = Configuration::get('ELEVOKWIDGET_APP_ID');
        $widgetUrl = $this->widget_url;
        

        $customStylesheet = Configuration::get('ELEVOKWIDGET_CUSTOM_CSS');
        $customStylesheetLink = '';

        if (!empty($customStylesheet)) {
            $customStylesheetLink = '<style>' . $customStylesheet . '</style>';
        }

        //get the prestashop language
        $context = Context::getContext();
        $id_lang = (int)$context->cookie->id_lang;
        $language = new Language($id_lang);
        $language_iso_code = $language->iso_code;

        
        $widget_lang='fr-fr';
        $valid_languages = ['en-en', 'fr-fr', 'ar', 'de', 'ar_tn'];
        //set default language
        $theme='light';
        if (in_array($language_iso_code, $valid_languages)) {
            $widget_lang =$language_iso_code;
        } 

        
        $scriptTag = '
        <script>
            // Define the widget configuration before the external script is loaded
            window.widgetInit = { 
                appId: \'' . $appId . '\', 
                locale: \'' . $widget_lang . '\', 
                theme: \'' . $theme . '\'
            };


        </script>
        <script src="' . $widgetUrl . '/sdk.js" defer></script>
    ';

    $desktopLoginSelector = Configuration::get('DESKTOP_LOGIN_SELECTOR');
    $mobileLoginSelector = Configuration::get('MOBILE_LOGIN_SELECTOR');
    
    if (empty($desktopLoginSelector)) {
        $desktopLoginSelector = '_desktop_user_info';
    }
    
    if (empty($mobileLoginSelector)) {
        $mobileLoginSelector = '_mobile_user_info';
    }


    $loginAnimationScript= '
    <script>
    document.addEventListener("DOMContentLoaded", function() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        console.log("Added node:", node.tagName);
    
                        if (node.tagName.toLowerCase() === "index-component") {
                            const indexShadowRoot = node.shadowRoot;
                            if (indexShadowRoot) {
                                const circularMenu = indexShadowRoot.querySelector("fw-circular-menu");
                                if (circularMenu) {
                                    const circularMenuShadowRoot = circularMenu.shadowRoot;
                                    if (circularMenuShadowRoot) {
                                        const profileCnt = circularMenuShadowRoot.querySelector(".profile-cnt");
                                        if (profileCnt) {
                                            profileCnt.addEventListener("click", function() {
                                                console.log(".profile-cnt clicked!");
    
                                                const appGuestMode = indexShadowRoot.querySelector("app-guest-mode");
                                                if (appGuestMode) {
                                                    console.log("app-guest-mode found:", appGuestMode);
    
                                                    const guestModeShadowRoot = appGuestMode.shadowRoot;
                                                    if (guestModeShadowRoot) {
                                                        console.log("Guest mode shadow root found.");
    
                                                        setTimeout(function() {
                                                            const widgetButton = guestModeShadowRoot.querySelector(".widget-box-button");
                                                            if (widgetButton) {
                                                                widgetButton.addEventListener("click", function() {
                                                                    alert("Widget button clicked!");
    
                                                                    const desktopInfo = document.getElementById("' . $desktopLoginSelector . '");
                                                                    const mobileInfo = document.getElementById("' . $mobileLoginSelector . '");
    
                                                                    if (desktopInfo) {
                                                                        desktopInfo.classList.add("elevok-animate-login");
                                                                    }
    
                                                                    if (mobileInfo) {
                                                                        mobileInfo.classList.add("elevok-animate-login");
                                                                    }
                                                                });
                                                            } else {
                                                                console.error("Widget button not found inside the shadow DOM.");
                                                            }
                                                        }, 1000);
                                                    } else {
                                                        console.error("Shadow root of app-guest-mode not found.");
                                                    }
                                                } else {
                                                    console.warn("app-guest-mode not found inside index-component.");
                                                }
                                            });
                                        } else {
                                            console.warn(".profile-cnt not found inside fw-circular-menu shadow DOM.");
                                        }
                                    } else {
                                        console.error("Shadow root of fw-circular-menu not found.");
                                    }
                                } else {
                                    console.warn("fw-circular-menu not found inside index-component shadow DOM.");
                                }
                            } else {
                                console.error("Shadow root of index-component not found.");
                            }
                        }
                    }
                });
            });
        });
    
        observer.observe(document.body, { childList: true, subtree: true });
    });
    </script>
    ';
    
    
    
    

        $headerContent = $customStylesheetLink . $scriptTag .$loginAnimationScript;
    
        return $headerContent;
    }        

    public function hookActionAuthentication($params)
    {
        $email = $params['cookie']->email;
        $firstName = $params['cookie']->customer_firstname;
        $lastName = $params['cookie']->customer_lastname;
        $id = $this->context->customer->id;
        $this->authenticate($email, $firstName, $lastName);
        //PrestaShopLogger::addLog('customer id' . print_r($id));
    }


    public function hookActionCustomerAccountAdd($params)
    {
        $email = $params['newCustomer']->email;
        $firstName = $params['newCustomer']->firstname;
        $lastName = $params['newCustomer']->lastname;
        $id = $params['newCustomer']->id;
        $this->authenticate($email, $firstName, $lastName);
    }

    private function authenticate($email, $firstName, $lastName)
    {
        $publicKey = Configuration::get('ELEVOKWIDGET_PUBLIC_KEY');
        $secretKey = Configuration::get('ELEVOKWIDGET_SECRET_KEY');
        $appId = Configuration::get('ELEVOKWIDGET_APP_ID');
        $url = $this->backend_url . '/cauth/clogin';

        $postData = json_encode(
            array(
                'publicKey' => $publicKey,
                'secretKey' => $secretKey,
                'client' => $appId,
            )
        );

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt(
            $ch,
            CURLOPT_HTTPHEADER,
            array(
                'Content-Type: application/json',
                'Content-Length: ' . strlen($postData),
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            )
        );

        $result = curl_exec($ch);
        curl_close($ch);

        $response = json_decode($result, true);
        if ($response && isset($response['accessToken'])) {
            $accessToken = $response['accessToken'];

            $mutualizeUrl = $this->backend_url . '/cauth/login';
            $mutualizeData = json_encode(
                array(
                    'identifier' => (string)$email,
                    'email' => $email,
                    'firstName' => $firstName,
                    'lastName' => $lastName
                )
            );

            $ch = curl_init($mutualizeUrl);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $mutualizeData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt(
                $ch,
                CURLOPT_HTTPHEADER,
                array(
                    'Content-Type: application/json',
                    'Authorization: Bearer ' . $accessToken,
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
                )
            );

            $mutualizeResult = curl_exec($ch);
            curl_close($ch);

            $mutualizeResponse = json_decode($mutualizeResult, true);
            if ($mutualizeResponse && isset($mutualizeResponse['accessToken'])) {
                $accessTokenConsumer = $mutualizeResponse['accessToken'];
                setcookie('elvkwdigttoken', $accessTokenConsumer, time() + (864000 * 300), "/");
                //PrestaShopLogger::addLog('loggin succesful :' . $accessTokenConsumer);
            } else {
                //PrestaShopLogger::addLog('Error during mutualization: ' . json_encode($mutualizeResponse), 3, null, 'ElevokWidget');
            }
        } else {
         //PrestaShopLogger::addLog('Error during authentication: ' . json_encode($response), 3, null, 'ElevokWidget');
        }
    }

    public function hookActionCustomerLogoutAfter($email)
    {
        setcookie('elvkwdigttoken', '', time() - 3600, '/');
        setcookie('elvwdigtauth', '', time() - 3600, '/');
        setcookie('elvwdigtauth', 'false', time() + (864000 * 300), "/");
    }

    public function hookActionValidateOrder($params)
    {
        $orderId = $params['order']->id;
        $order = new Order($orderId);
        $orderAmount = $order->total_paid;
        $cart = new Cart($order->id_cart);  // Get the associated cart
    
        $appId = Configuration::get('ELEVOKWIDGET_APP_ID');
        $orderType = ($order->module == 'storepickup') ? 'PICKUP' : 'DELIVERY';
        $orderTime = $order->date_add;
        $products = $cart->getProducts();
        $productsOrdered = [];
    
        foreach ($products as $product) {
            $productId = $product['id_product'];
            $productObj = new Product($productId);
    
            $productsOrdered[] = [
                'id' => $productObj->reference, 
                'quantity' => $product['cart_quantity'],
            ];
        }
    
        $customerId = $order->id_customer;
    
        $sql = new DbQuery();
        $sql->select('*')
            ->from('address')
            ->where('id_customer = ' . (int)$customerId)
            ->where('deleted = 0');
        
        $addresses = Db::getInstance()->executeS($sql);
        
        if (!empty($addresses)) {
            $address = $addresses[0];
    
            $deliveryAddress = [
                'address' => 'firstname: ' . $address['firstname'] . ', ' .
                             'lastname: ' . $address['lastname'] . ', ' .
                             'address1: ' . $address['address1'] . ', ' .
                             'address2: ' . $address['address2'] . ', ' .
                             'postcode: ' . $address['postcode'] . ', ' .
                             'city: ' . $address['city'] . ', ' .
                             'country: ' . Country::getNameById(Context::getContext()->language->id, $address['id_country']) . ', ' .
                             'phone: ' . $address['phone']
            ];
        } 
    
        $currency = new Currency($order->id_currency);
        $customerEmail = $params['cookie']->email;
        $cartRules = $order->getCartRules(); // This will get the cart rules applied to the order
        PrestaShopLogger::addLog('Cart Rules: ' . json_encode($cartRules), 1);
    
        $coinsAmount = 0;
        if (!empty($cartRules)) {
            foreach ($cartRules as $cartRule) {
                if ($cartRule['name'] === 'Réduction par points fidélité') {
                    $checkResponse = $this->fetchWalletInformation();
                    $unitValue = $checkResponse['wallet']['coin']['unitValue']['amount'];
                    $coinsAmount = $cartRule['value'] / $unitValue;
                    $cartRuleId = $cartRule['id_cart_rule'];
                    $cartRuleObject = new CartRule($cartRuleId);
                    $cartRuleObject->delete();
                } else {
                    PrestaShopLogger::addLog("Cart Rules not found", 3);
                }
            }
        } else {
            PrestaShopLogger::addLog("No cart rules found for the cart.", 3);
        }
        

        $postData = json_encode([
            'orderType' => $orderType,
            'orderTime' => (string)$orderTime,
            'currency' => $currency->iso_code,
            'user' => (string)$customerEmail,
            'client' => $appId,
            'deliveryAddress' => $deliveryAddress,
            'products' => $productsOrdered
        ], JSON_PRETTY_PRINT);
    
        PrestaShopLogger::addLog('Encoded Order Data: ' . $postData, 1);
        $this->postOrderData($postData);
        $this->sendPushAmount($customerEmail, $orderAmount, $coinsAmount); // Post the data to external service
    }
    
    

    private function sendRequest($endpoint, $postData)
    {
        $url = $this->backend_url . $endpoint;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt(
            $ch,
            CURLOPT_HTTPHEADER,
            array(
                'Content-Type: application/json',
                'Content-Length: ' . strlen($postData),
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            )
        );

        $result = curl_exec($ch);
        curl_close($ch);

        return $result;
    }

    private function sendAuthenticatedRequest($endpoint, $postData, $accessToken)
    {
        $url = $this->backend_url . $endpoint;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt(
            $ch,
            CURLOPT_HTTPHEADER,
            array(
                'Content-Type: application/json',
                'Content-Length: ' . strlen($postData),
                'Authorization: Bearer ' . $accessToken,
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            )
        );

        $result = curl_exec($ch);
        curl_close($ch);

        return $result;
    }

    private function corporateAuth()
    {
        $publicKey = Configuration::get('ELEVOKWIDGET_PUBLIC_KEY');
        $secretKey = Configuration::get('ELEVOKWIDGET_SECRET_KEY');
        $appId = Configuration::get('ELEVOKWIDGET_APP_ID');

        $postData = json_encode(
            array(
                'publicKey' => $publicKey,
                'secretKey' => $secretKey,
                'client' => $appId,
            )
        );

        $result = $this->sendRequest('/cauth/clogin', $postData);
        $response = json_decode($result, true);
        //PrestaShopLogger::addLog("corporateauth response  :". $response);

        if ($response && isset($response['accessToken'])) {
            $this->accessToken = $response['accessToken'];
            //PrestaShopLogger::addLog("corporateauth accessToken  :". $this->accessToken);
            return $response['accessToken'];
        }

        return null;
    }

    private function sendPushAmount($customerEmail, $amount,$coinsAmount) //
    {
        if (!$this->accessToken) {
            $this->accessToken = $this->corporateAuth();
        }
        if ($this->accessToken) {
            $pushData = json_encode(
                array(
                    'user' => $customerEmail,
                    'source' => 'WEB',
                    'amount' => $amount,
                    'deductAmount'=>(string)$coinsAmount
                )
            );

            $this->sendAuthenticatedRequest('/wallet/push', $pushData, $this->accessToken);
           // PrestaShopLogger::addLog("coinsAmount from push function :". $coinsAmount);
        }
    }

    public function postOrderData($postData)
    {
        if (!$this->accessToken) {
            $this->accessToken = $this->corporateAuth();
            //PrestaShopLogger::addLog("postorder :". $this->accessToken);
        }
            if ($this->accessToken) {
                //PrestaShopLogger::addLog('Post Data Order: ' . json_encode($postData));
                $response = $this->sendAuthenticatedRequest('/order/create', $postData, $this->accessToken);
                //PrestaShopLogger::addLog('accessToken: ' . $this->accessToken);
                PrestaShopLogger::addLog('Response: ' . $response);
                
            }
    }



    public function fetchWalletInformation()
    {
        if (!$this->accessToken) {
            $this->accessToken = $this->corporateAuth();
        }
        if ($this->accessToken) {
            $customerEmail = $this->context->customer->email;
            $checkData = json_encode(
                array(
                    'user' => (string)$customerEmail
                )
            );

            $result = $this->sendAuthenticatedRequest('/wallet/check', $checkData, $this->accessToken);
            $checkResponse = json_decode($result, true);
            return $checkResponse;
        }

        return null;
    }

    public function hookDisplayAfterCarrier($params)
    {
        $checkResponse = $this->fetchWalletInformation();
        $email = $params['cookie']->email;
        $moneyAmountText = Configuration::get('MONEY_AMOUNT_TEXT');
        $pointsToUseText = Configuration::get('POINT_TO_USE_TEXT');
        $submitButtonText = Configuration::get('SUBMIT_BUTTON_TEXT');
    
        if ($checkResponse) {
            $walletAmount = $checkResponse['wallet']['amount'];
            $walletIconUrl = $checkResponse['wallet']['coin']['picture']['baseUrl'] . '/' . $checkResponse['wallet']['coin']['picture']['path'];
            $walletAlt = $checkResponse['wallet']['coin']['name'];
            $unitValue = $checkResponse['wallet']['coin']['unitValue']['amount'];

            ob_start();

            ?>

            <?php
            include('discount_form.php');
            return ob_get_clean();
        }
        
    }

    }
