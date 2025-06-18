<?php
/*
Plugin Name: Widget Plugin
Plugin URI: https://developer.elevok.com/wordpress
Description: A plugin to configure and inject widget script and styles with authentication.
Version: 1.0
Author: Diktup
Author URI: https://diktup.com/

 */

add_action('admin_init', 'register_settings');
add_action('admin_menu', 'widget_register_options_page');
add_action('wp_head', 'enqueue_script_in_head');
add_action('wp_login', 'user_authentication', 10, 2);
add_action('user_register', 'user_registration');
add_action('wp_logout', 'user_logout');
add_action('woocommerce_thankyou', 'order_validation');
add_action('wp_ajax_apply_discount', 'handle_apply_discount');
add_action('wp_ajax_nopriv_apply_discount', 'handle_apply_discount');
add_action('wp_ajax_generate_products_xml', 'ajax_generate_products_xml');
add_action('wp_ajax_generate_categories_xml', 'ajax_generate_categories_xml');
add_action('wp_ajax_generate_brands_xml', 'ajax_generate_brands_xml');
add_action('wp_ajax_generate_attributes_xml', 'ajax_generate_attributes_xml');
add_action('wp_ajax_generate_attribute_values_xml', 'ajax_generate_attribute_values_xml');
add_action('wp_ajax_generate_articles_xml', 'ajax_generate_articles_xml');
function activation_redirect()
{
    if (get_option('activation_redirect', false)) {
        delete_option('activation_redirect');
        wp_safe_redirect(admin_url('options-general.php?page=widget-settings'));
        exit;
    }
}

add_action('admin_init', 'activation_redirect');

function activate()
{
    add_option('activation_redirect', true);
}

register_activation_hook(__FILE__, 'activate');

function enqueue_script_in_head()
{
    $app_id = get_option('widget_app_id');
    $public_key = get_option('widget_public_key');
    $secret_key = get_option('widget_secret_key');
    $first_text = get_option('first_text');
    $second_text = get_option('second_text');
    $submit_text = get_option('submit_text');
    $style = get_option('widget_style');
    $desktopLoginSelector = esc_attr(get_option('desktop_login_selector'));
    $mobileLoginSelector = esc_attr(get_option('mobile_login_selector'));

    $widget_lang = 'fr-fr';
    $valid_languages = ['en-en', 'fr-fr', 'ar', 'de', 'ar_tn'];

    $query = $_SERVER['QUERY_STRING'];

    if (strpos($query, 'elvkaflt=') !== false) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('elvkaflt exists in query string');
        }
        
        if (preg_match('/elvkaflt=([^&]+)/', $query, $matches)) {
            $elvkafltValue = $matches[1];
            setcookie('elvkaflt', $elvkafltValue, time() + (30 * 24 * 60 * 60), '/');
            echo "<script>
            document.cookie = 'elvkaflt={$elvkafltValue}; path=/; max-age=' + (30 * 24 * 60 * 60);
            console.log('Cookie elvkaflt set with value: {$elvkafltValue}');
            </script>";

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Cookie "elvkaflt" set with value: ' . $elvkafltValue);
            }
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Failed to extract elvkaflt value');
            }
        }
    } else {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('elvkaflt does not exist in query string');
        }
    }

    if (empty($desktopLoginSelector)) {
        $desktopLoginSelector = '_desktop_user_info';
    }

    if (empty($mobileLoginSelector)) {
        $mobileLoginSelector = '_mobile_user_info';
    }
    ?>
    <script>
        window.widgetInit = {
            appId: '<?php echo esc_js($app_id); ?>',
            publicKey: '<?php echo esc_js($public_key); ?>',
            secretKey: '<?php echo esc_js($secret_key); ?>',
            theme: 'dark',
            embed: false,
            locale: 'ar'
        };
	document.addEventListener("DOMContentLoaded", function () {
    // Check if the logout flag is set in the cookie
    if (document.cookie.includes("logout_flag=true")) {
        console.log("User logged out, clearing local storage.");

        // Clear local storage items
        localStorage.removeItem('elvkwdigttoken');
        localStorage.removeItem('elvwdigtauth');
        localStorage.setItem('elvwdigtauth', 'false'); // Optional reset value

        console.log("Local storage items cleared successfully.");

        // Remove the logout flag cookie after processing
        document.cookie = "logout_flag=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
});

        window.onload = function() {
            // Load the widget SDK
            var script = document.createElement('script');
            script.src = "https://widget.elevok.com/sdk.js";
            script.async = true;
            script.defer = true;
            script.onload = function() {
                // Reinitialize widgetInit with new values after the SDK is loaded
                window.widgetInit = {
                    appId: '<?php echo esc_js($app_id); ?>',  // You can dynamically use the same appId here
                    locale: '<?php echo esc_js($widget_lang); ?>', // Switch locale
                    theme: 'light' // Switch to light theme
                };
            };
            document.head.appendChild(script);

            // Initialize Facebook SDK
            var fbScript = document.createElement('script');
            fbScript.src = "https://connect.facebook.net/en_US/sdk.js";
            fbScript.async = true;
            fbScript.defer = true;
            fbScript.onload = function() {
                window.fbAsyncInit = function () {
                    FB.init({
                        appId: '278013208459559', // Facebook appId
                        autoLogAppEvents: true,
                        xfbml: true,
                        version: 'v12.0'
                    });
                };
            };
            document.head.appendChild(fbScript);
        };
    </script>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            //console.log("Added node:", node.tagName);

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
                                                    //console.log(".profile-cnt clicked!");

                                                    const appGuestMode = indexShadowRoot.querySelector("app-guest-mode");
                                                    if (appGuestMode) {
                                                        //console.log("app-guest-mode found:", appGuestMode);

                                                        const guestModeShadowRoot = appGuestMode.shadowRoot;
                                                        if (guestModeShadowRoot) {
                                                            //console.log("Guest mode shadow root found.");

                                                            setTimeout(function() {
                                                                const widgetButton = guestModeShadowRoot.querySelector(".widget-box-button");
                                                                if (widgetButton) {
                                                                    widgetButton.addEventListener("click", function() {
                                                                        //alert("Widget button clicked!");
                                                                        const desktopInfo = document.getElementsByClassName('<?php echo esc_js(trim($desktopLoginSelector)); ?>');
                                                                        const mobileInfo = document.getElementsByClassName('<?php echo esc_js(trim(get_option('mobile_login_selector'))); ?>');

                                                                        //console.log("Desktop Info Element:", desktopInfo);
                                                                        //console.log("Mobile Info Element:", mobileInfo);

                                                                        if (desktopInfo.length > 0) {
                                                                            desktopInfo[0].classList.add("elevok-animate-login");
                                                                        }

                                                                        if (mobileInfo.length > 0) {
                                                                            mobileInfo[0].classList.add("elevok-animate-login");
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
    <style>
        <?php echo esc_html($style); ?>
        .elevok-animate-login {
        animation: bouncePulse 2s infinite;
        transition: background-color .3s ease;
        }

    </style>

    <?php
}

function register_settings()
{
    add_option('widget_app_id', '');
    add_option('widget_public_key', '');
    add_option('widget_secret_key', '');
    add_option('first_text', '');
    add_option('second_text', '');
    add_option('submit_text', '');
    add_option('widget_style', '');
    add_option('desktop_login_selector', '');
    add_option('mobile_login_selector', '');
    add_option('display_option', '');

    register_setting('widget_options_group', 'widget_app_id', 'sanitize_text_field');
    register_setting('widget_options_group', 'widget_public_key', 'sanitize_text_field');
    register_setting('widget_options_group', 'widget_secret_key', 'sanitize_text_field');
    register_setting('widget_options_group', 'first_text', 'sanitize_text_field');
    register_setting('widget_options_group', 'second_text', 'sanitize_text_field');
    register_setting('widget_options_group', 'submit_text', 'sanitize_text_field');
    register_setting('widget_options_group', 'widget_style', 'sanitize_text_field');
    register_setting('widget_options_group', 'desktop_login_selector', 'sanitize_text_field');
    register_setting('widget_options_group', 'mobile_login_selector', 'sanitize_text_field');
    register_setting('widget_options_group', 'display_option', 'sanitize_text_field');
    register_setting('widget_options_group', 'display_option', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_display_option',
        'default' => 'yes',
    ]);
}

function sanitize_display_option($input) {
    return ($input === 'yes') ? 'yes' : 'no';
}


function widget_register_options_page()
{
    // Add a top-level menu item
    add_menu_page(
        'Elevok Settings', // Page title
        'Elevok Settings', // Menu title
        'manage_options', // Capability required
        'widget-settings', // Menu slug (unique identifier)
        'options_page', // Callback function to display the page
        'dashicons-admin-generic', // Icon for the menu (you can choose a different Dashicon)
        60// Position in the menu
    );
}

// Settings page HTML
function options_page() {
$upload_dir = wp_upload_dir();
$base_url = $upload_dir['baseurl'] . '/elevok-xml/';
    ?>
    <div class="wrap">
        <h1>Widget Setup</h1>

        <!-- Tab navigation -->
        <h2 class="nav-tab-wrapper">
            <a href="#tab-general" class="nav-tab nav-tab-active">General Settings</a>
            <a href="#tab-display" class="nav-tab">Catalog</a>
            <a href="#tab-advanced" class="nav-tab">Orders</a>
        </h2>

        <!-- Tab content -->
        <form method="post" action="options.php">
            <?php
            settings_fields('widget_options_group');
            ?>

            <!-- General Settings Tab -->
            <div id="tab-general" class="tab-content" style="display: block;">
                <h2>General Settings</h2>
                <table class="
form-table">
                    <tr>
                        <th scope="row"><label for="widget_app_id">App ID</label></th>
                        <td><input type="text" id="widget_app_id" name="widget_app_id" value="<?php echo esc_attr(get_option('widget_app_id')); ?>" class="regular-text" required /></td>
                        <td scope="row"><label for="first_text">Available amount text</label></td>
                        <td><input type="text" id="first_text" name="first_text" placeholder="Available amount text:" value="<?php echo esc_attr(get_option('first_text')); ?>" class="regular-text"  /></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="widget_public_key">Public Key</label></th>
                        <td><input type="text" id="widget_public_key" name="widget_public_key" value="<?php echo esc_attr(get_option('widget_public_key')); ?>" class="regular-text" required /></td>
                        <td scope="row"><label for="second_text">Select amount text</label></td>
                        <td><input type="text" id="second_text" name="second_text" placeholder="Select amount :" value="<?php echo esc_attr(get_option('second_text')); ?>" class="regular-text"  /></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="widget_secret_key">Secret Key</label></th>
                        <td><input type="text" id="widget_secret_key" name="widget_secret_key" value="<?php echo esc_attr(get_option('widget_secret_key')); ?>" class="regular-text" required /></td>
                        <td scope="row"><label for="submit_text">Submit Text</label></td>
                        <td><input type="text" id="submit_text" name="submit_text" placeholder="Appliquez une remise" value="<?php echo esc_attr(get_option('submit_text')); ?>" class="regular-text"  /></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="desktop_login_selector">Desktop Selector</label></th>
                        <td><input type="text" id="desktop_login_selector"  placeholder="Enter The Desktop Login Selector" name="desktop_login_selector" value="<?php echo esc_attr(get_option('desktop_login_selector')); ?>" class="regular-text"  /></td>
                        <td scope="row"><label for="mobile_login_selector">Mobile Selector</label></td>
                        <td><input type="text" id="mobile_login_selector" name="mobile_login_selector" placeholder="Enter The Mobile Login Selector" value="<?php echo esc_attr(get_option('mobile_login_selector')); ?>" class="regular-text"  /></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="display_option">Display Option</label></th>
                        <td>
                            <select id="display_option" name="display_option" class="regular-text">
                                <option value="yes" <?php echo (get_option('display_option') == 'yes') ? 'selected' : ''; ?>>Yes</option>
                                <option value="no" <?php echo (get_option('display_option') == 'no') ? 'selected' : ''; ?>>No</option>
                            </select>
                        </td>
                        <th scope="row"><label for="widget_style">Custom CSS</label></th>
                        <td><textarea id="widget_style" name="widget_style" rows="5" class="regular-text"><?php echo esc_textarea(get_option('widget_style')); ?></textarea></td>
                    </tr>

                </table>
            </div>

            <div id="tab-display" class="tab-content" style="display: none;"> 
                <h2>Catalog</h2>
                <table class="form-table">
    <tr>
        <th scope="row"><label for="retrieve_products">Retrieve Products</label></th>
        <td>
            <button type="button" id="retrieve_products" class="button">Retrieve Products</button><br>
            <a id="products_link" href="<?php echo esc_url($base_url . 'elevok-products.xml'); ?>" target="_blank">View Products XML</a>
        </td>
    </tr>
    <tr>
        <th scope="row"><label for="retrieve_categories">Retrieve Categories</label></th>
        <td>
            <button type="button" id="retrieve_categories" class="button">Retrieve Categories</button><br>
            <a id="categories_link" href="<?php echo esc_url($base_url . 'elevok-categories.xml'); ?>" target="_blank">View Categories XML</a>
        </td>
    </tr>
    <tr>
        <th scope="row"><label for="retrieve_brands">Retrieve Brands</label></th>
        <td>
            <button type="button" id="retrieve_brands" class="button">Retrieve Brands</button><br>
            <a id="brands_link" href="<?php echo esc_url($base_url . 'elevok-brands.xml'); ?>" target="_blank">View Brands XML</a>
        </td>
    </tr>
    <tr>
        <th scope="row"><label for="retrieve_attributes">Retrieve Attributes</label></th>
        <td>
            <button type="button" id="retrieve_attributes" class="button">Retrieve Attributes</button><br>
            <a id="attributes_link" href="<?php echo esc_url($base_url . 'elevok-attributes.xml'); ?>" target="_blank">View Attributes XML</a>
        </td>
    </tr>
    <tr>
        <th scope="row"><label for="retrieve_attribute_values">Retrieve Attribute Values</label></th>
        <td>
            <button type="button" id="retrieve_attribute_values" class="button">Retrieve Attribute Values</button><br>
            <a id="attribute_values_link" href="<?php echo esc_url($base_url . 'elevok-attribute-values.xml'); ?>" target="_blank">View Attribute Values XML</a>
        </td>
    </tr>
    <tr>
        <th scope="row"><label for="retrieve_articles">Retrieve Articles</label></th>
        <td>
            <button type="button" id="retrieve_articles" class="button">Retrieve Articles</button><br>
            <a id="articles_link" href="<?php echo esc_url($base_url . 'elevok-articles.xml'); ?>" target="_blank">View Articles XML</a>
        </td>
    </tr>
</table>        </div>



            <div id="tab-advanced" class="tab-content" style="display: none;">
                <h2>Orders</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="date_range">Select Date Range</label></th>
                        <td>
                            <select id="date_range" name="date_range" class="regular-text">
                                <option value="last_day">Last Day</option>
                                <option value="last_3_days">Last 3 Days</option>
                                <option value="last_week">Last Week</option>
                                <option value="last_month">Last Month</option>
                                <option value="last_year">Last Year</option>
                                <option value="all_time">All Time</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="retrieve_orders">Retrieve Orders</label></th>
                        <td><button type="button" id="retrieve_orders" class="button">Retrieve Orders</button>
                        <a id="brands_link" href="http://localhost/wptest/wp-content/uploads/elevok-xml/elevok-orders.xml" target="_blank" >View Brands XML</a>
                        </td>
                    </tr>
                </table>
            </div>

            <?php submit_button('Save Settings'); ?>
        </form>
    </div>

    <style>
        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }
    </style>

    <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('retrieve_products').addEventListener('click', function () {
                fetchXMLFile('generate_products_xml');
            });

            document.getElementById('retrieve_categories').addEventListener('click', function () {
                fetchXMLFile('generate_categories_xml');
            });

            document.getElementById('retrieve_brands').addEventListener('click', function () {
                fetchXMLFile('generate_brands_xml');
            });

            document.getElementById('retrieve_orders').addEventListener('click', function () {
                const dateRange = document.getElementById('date_range').value;
                fetchOrdersXML(dateRange);
            });

	    document.getElementById('retrieve_attributes').addEventListener('click', function () {
        fetchXMLFile('generate_attributes_xml');
    });

    document.getElementById('retrieve_attribute_values').addEventListener('click', function () {
        fetchXMLFile('generate_attribute_values_xml');
    });
document.getElementById('retrieve_articles').addEventListener('click', function () {
    fetchXMLFile('generate_articles_xml');
});


            // Function to fetch XML file for products, categories, and brands
            function fetchXMLFile(action) {
                    fetch(ajaxurl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({
                            'action': action,
                            'security': '<?php echo wp_create_nonce('generate_xml_nonce'); ?>'
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(`${action.replace('_', ' ')} successfully executed!`);
                        } else {
                            alert('Error: ' + data.data.message);
                        }
                    })
                    .catch(error => alert('Error: ' + error));
            }

            function fetchOrdersXML(dateRange) {
                fetch(ajaxurl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        'action': 'generate_orders_xml',
                        'security': '<?php echo wp_create_nonce('generate_xml_nonce'); ?>',
                        'date_range': dateRange
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Orders XML successfully executed!');
                        // Optionally, you can show the download link or something else here
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => alert('Error: ' + error));
            }

        });
    </script>





        <script>
            document.addEventListener('DOMContentLoaded', function () {
                const tabs = document.querySelectorAll('.nav-tab');
                const contents = document.querySelectorAll('.tab-content');

                tabs.forEach(tab => {
                    tab.addEventListener('click', function (e) {
                        e.preventDefault();
                        tabs.forEach(t => t.classList.remove('nav-tab-active'));
                        contents.forEach(c => c.style.display = 'none');

                        this.classList.add('nav-tab-active');
                        const target = document.querySelector(this.getAttribute('href'));
                        target.style.display = 'block';
                    });
                });

                // Show the first tab by default
                tabs[0].classList.add('nav-tab-active');
                contents[0].style.display = 'block';
            });
        </script>
        <?php
}


function user_registration($user_id)
{
    $user = get_userdata($user_id);
    $email = $user->user_email;
    $first_name = $user->first_name;
    $last_name = $user->last_name;

    authenticate($email,$first_name, $last_name);

}

function user_logout() {
    // Clear cookies
    setcookie('elvkwdigttoken', '', time() - 3600, '/');
    setcookie('elvwdigtauth', '', time() - 3600, '/');
    setcookie('elvwdigtauth', 'false', time() + (864000 * 300), "/");

    // Set a flag to indicate logout
    setcookie('logout_flag', 'true', time() + 3600, '/');  // 1-hour expiry
    header('Location: /logout-confirmation');  // Redirect after logout
    exit;
}

function order_validation($order_id)
{
    $order = wc_get_order($order_id);
    $order_amount = $order->get_total();
    $customer_id = $order->get_customer_id();
    $customer_email = $order->get_billing_email();
    process_order($customer_email, $order_amount, $order_id);
}

function process_order($customer_email, $order_amount, $order_id)
{   $displayDiscount = get_option('display_option');
    if ($displayDiscount ==="yes"){
    $coinsInput = WC()->session->get('coins_input');
    $checkResponse = fetch_wallet_information($customer_email);
    if (!empty($checkResponse)) {
        $unitValue = $checkResponse['wallet']['coin']['unitValue']['amount'];
        $coinsAmount = $order_amount / $unitValue;
    }
    $order = wc_get_order($order_id);
    $orderType = 'DELIVERY'; 
    
    foreach ($shipping_methods as $shipping_method) {
        $method_id = $shipping_method->get_method_id();
    
        if (strpos(strtolower($method_id), 'pickup') !== false || strpos(strtolower($method_id), 'local_pickup') !== false) {
            $orderType = 'PICKUP';
            break;
        }
    }
    
    $orderTime = $order->get_date_created()->format('Y-m-d\TH:i:s.u\Z');  
    $currency = $order->get_currency(); 
    $customerEmail = $order->get_billing_email();  
    $appId = get_option('widget_app_id'); 
    $billing_address = $order->get_formatted_billing_address();
    
    $deliveryAddress = [
        'address' => $billing_address 
    ];

    $productsOrdered = [];
    foreach ($order->get_items() as $item_id => $item) {
        $product = $item->get_product();  
        $product_sku = $product ? $product->get_sku() : '';  
        $quantity = $item->get_quantity(); 
        $productsOrdered[] = [
            'id' => $product_sku,
            'quantity' => $quantity
        ];
    }
    
    $postData = json_encode([
        'orderType' => $orderType,
        'orderTime' => $orderTime,
        'currency' => $currency,
        'user' => $customerEmail,
        'client' => $appId,
        'deliveryAddress' => $deliveryAddress,
        'products' => $productsOrdered
    ], JSON_PRETTY_PRINT);
    
    error_log('Order Data: ' . $postData);

    send_push_amount($customer_email, $order_amount, $coinsInput);
    post_order_data($postData);
}
}

function authenticate($email, $firstName, $lastName)
{
    $publicKey = get_option('widget_public_key');
    $secretKey = get_option('widget_secret_key');
    $appId = get_option('widget_app_id');
    $url = 'https://api.elevok.com/cauth/clogin';

    //authentication request
    $postData = json_encode(array(
        'publicKey' => $publicKey,
        'secretKey' => $secretKey,
        'client' => $appId,
    ));

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Content-Length: ' . strlen($postData),
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    ));

    $result = curl_exec($ch);
    curl_close($ch);

    $response = json_decode($result, true);
    if ($response && isset($response['accessToken'])) {
        $accessToken = $response['accessToken'];
        $mutualizeUrl = 'https://api.elevok.com/cauth/login';
        $mutualizeData = json_encode(array(
            'identifier' => (string) $email,
            'email' => $email,
            'firstName' => $firstName,
            'lastName' => $lastName,
        ));

        $ch = curl_init($mutualizeUrl);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $mutualizeData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Authorization: Bearer ' . $accessToken,
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        ));

        $mutualizeResult = curl_exec($ch);
        curl_close($ch);

        $mutualizeResponse = json_decode($mutualizeResult, true);
        if ($mutualizeResponse && isset($mutualizeResponse['accessToken'])) {
            $accessTokenConsumer = $mutualizeResponse['accessToken'];
            setcookie('elvkwdigttoken', $accessTokenConsumer, time() + (864000 * 300), "/");
            return $accessTokenConsumer;
        }
    }

    return null;
}

function fetch_wallet_information($user)
{
    $accessToken = get_corporate_auth();
    if ($accessToken) {
        $checkData = json_encode(array('user' => $user));
        $result = send_authenticated_request('/wallet/check', $checkData, $accessToken);
        return json_decode($result, true);
    }
}

function user_authentication($user_login, $user)
{
    global $wpdb;
    $email = $user->user_email;
    $first_name = $user->first_name;
    $last_name = $user->last_name;
    $accessToken = authenticate($email, $first_name, $last_name);
}

function display_wallet_form_on_checkout()
{
    $displayDiscount = get_option('display_option');
    //error_log('display discount value is :' . $displayDiscount);
    if ($displayDiscount ==="yes"){ 
        if (is_checkout()) {
            $user_email = wp_get_current_user()->user_email;
            echo 'Current User Email: ' . esc_html($user_email);
            if ($user_email) {
                $checkResponse = fetch_wallet_information($user_email);
                if ($checkResponse)
                    {
                    //wallet data
                    $walletAmount = $checkResponse['wallet']['amount'];
                    $walletIconUrl = $checkResponse['wallet']['coin']['picture']['baseUrl'] . '/' . $checkResponse['wallet']['coin']['picture']['path'];
                    $walletAlt = $checkResponse['wallet']['coin']['name'];
                    $unitValue = $checkResponse['wallet']['coin']['unitValue']['amount'];
                    $first_text = get_option('first_text', 'Montant de votre portefeuille en points de fidélité:');
                    $second_text = get_option('second_text', 'Points à utiliser pour une réduction:');
                    $submit_text = get_option('submit_text', 'Appliquer une remise');

                    ?>
                    <div class="wallet-block"  id="wallet-info">
                    <div class="col-md-special-6"  style="margin-bottom: 20px;">
                        <span class="wallet-label"><?php echo esc_html($first_text); ?></span>
                        <strong><?php echo esc_html($walletAmount); ?></strong>
                        <img class="wallet-img" src="<?php echo esc_url($walletIconUrl); ?>" alt="<?php echo esc_attr($walletAlt); ?>" />
                    </div>

                    <div class="col-md-special-6" id="input-coins-step" style="margin-bottom: 20px;">
                        <label for="coins_input" class="coins-label"><?php echo esc_html($second_text); ?></label>
                        <input type="number" id="coins_input" name="coins_input" min="0" max="<?php echo esc_attr($walletAmount); ?>" />
                        <img class="wallet-img" src="<?php echo esc_url($walletIconUrl); ?>" alt="<?php echo esc_attr($walletAlt); ?>" />
                    </div>


                    </div>
                    <div id="apply_discount_btn_wrapper" class="submit-button" style="margin-bottom: 20px;">
                        <button id="apply_discount_btn" class="apply-btn" type="button"><?php echo esc_html($submit_text); ?></button>
                    </div>

                    <div id="custom-alert" class="custom-alert hidden">
                    <span id="alert-message"></span>
                    <button id="alert-close-btn" class="alert-close-btn">&times;</button>
                </div>
                    <?php
                }
            }
        }
    }
}

function handle_apply_discount()
{
    if (isset($_POST['coins_input'])) {
        $coinsInput = sanitize_text_field($_POST['coins_input']);
        WC()->session->set('coins_input', $coinsInput);
        wp_send_json_success(array('coins' => $coinsInput));
    } else {
        wp_send_json_error('No coins input provided');
    }
    include plugin_dir_path(__FILE__) . 'ajax.php';
    wp_die();
}

add_action('wp_footer', 'inject_wallet_form_at_top');

function inject_wallet_form_at_top()
{
    if (is_checkout()) {
        $user_id = get_current_user_id();
        if ($user_id) {

            $checkResponse = fetch_wallet_information($user_id);

            if ($checkResponse) {
                $walletAmount = $checkResponse['wallet']['amount'];
                $unitValue = $checkResponse['wallet']['coin']['unitValue']['amount'];
            }
    ?>
    <div id="hidden-wallet-form" class="wallet-content" style="display:none;">
        <?php display_wallet_form_on_checkout();?>
    </div>

    <script type="text/javascript">
        function showAlert(message, type) {
            var alertBox = document.getElementById("custom-alert");
            var alertMessage = document.getElementById("alert-message");

            alertMessage.textContent = message;
            alertBox.classList.remove("hidden", "success", "error");
            alertBox.classList.add("visible");

            // Apply color based on type
            if (type === "success") {
                alertBox.style.backgroundColor = "#4CAF50"; // Green for success
            } else if (type === "error") {
                alertBox.style.backgroundColor = "#f44336"; // Red for error
            }
            document.getElementById("alert-close-btn").addEventListener("click", function() {
                alertBox.classList.remove("visible");
                alertBox.classList.add("hidden");
            });
        }

        document.addEventListener('DOMContentLoaded', function() {
            var walletForm = document.getElementById('hidden-wallet-form');

            if (walletForm) {
                var observer = new MutationObserver(function(mutations, observerInstance) {
                    var blockGroup = document.querySelector('.wc-block-checkout__order-notes');
                    if (blockGroup) {
                        var clonedForm = walletForm.cloneNode(true);
                        clonedForm.style.display = 'block';
                        blockGroup.appendChild(clonedForm);
                        observerInstance.disconnect();
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
            }
        });
    </script>
            <script type="text/javascript">


document.addEventListener('DOMContentLoaded', function() {
                           var applyDiscountBtn = document.getElementById("apply_discount_btn");          
				console.log("submit button detector" ,applyDiscountBtn );
				if (applyDiscountBtn) {
				console.log("detection works" );
                                document.addEventListener("click", function(e) {

    if (e.target && e.target.id === "apply_discount_btn") {
        console.log("Delegated click works!");
    console.log("Click detected!");                                 	
    var coinsInput = document.getElementById("coins_input").value;
					console.log("button is clicked" );
                                    if (coinsInput <= 0 || isNaN(coinsInput)) {
                                    showAlert("Please enter a valid amount of coins.", "error");
                                        return;
                                    }
                                    if (coinsInput > <?php echo esc_js($walletAmount); ?>) {
                                        showAlert("The entered amount exceeds your wallet balance.", "error");
                                        return;
                                    }

                                    var discountAmount = coinsInput * <?php echo esc_js($unitValue); ?>;
                                    var maxDiscountAmount = Math.min(discountAmount, <?php echo esc_js($walletAmount); ?>);
                                    var form = new FormData();
                                    form.append("discount_amount", maxDiscountAmount);
                                    form.append("action", "apply_discount");
                                    form.append("coins_input", coinsInput);

                                    fetch("<?php echo admin_url('admin-ajax.php'); ?>", {
                                        method: "POST",
                                        body: form
                                    }).then(response => {
                                        if (response.ok) {
                                            return response.json();
                                        } else {
                                            return response.text().then(errorMessage => {
                                                throw new Error(errorMessage);
                                            });
                                        }
                                    }).then(result => {
                                        if (result.success) {
                                            showAlert("Réduction appliquée avec succès !","success");
                                            location.reload();
                                        } else {
                                            showAlert("Échec de l'application de la réduction. Veuillez réessayer !", "error");
                                        }
                                    }).catch(error => {
                                        showAlert("Échec de l'application de la réduction. Veuillez réessayer !", "error");
                                    });}
                                });
                            }
                        });
                    </script>
                    <style>
                /* Styling for custom alert */
                .custom-alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background-color: #f44336;
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease-in-out;
                }

                .custom-alert.visible {
                    opacity: 1;
                    visibility: visible;
                }

                .custom-alert.hidden {
                    opacity: 0;
                    visibility: hidden;
                }

                .alert-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                }

                .alert-close-btn:hover {
                    color: #ddd;
                }
                </style>
            <?php
    }
        }
}

function get_corporate_auth()
{
    $publicKey = get_option('widget_public_key');
    $secretKey = get_option('widget_secret_key');
    $appId = get_option('widget_app_id');
    $postData = json_encode(
        array(
            'publicKey' => $publicKey,
            'secretKey' => $secretKey,
            'client' => $appId,
        )
    );

    $result = send_request('/cauth/clogin', $postData);
    $response = json_decode($result, true);

    if ($response && isset($response['accessToken'])) {
        return $response['accessToken'];
    }
    return null;
}

function send_push_amount($customer_email, $amount, $deductamount)
{
    $accessToken = get_corporate_auth();
    if ($accessToken) {
        $pushData = json_encode(array(
            'user' => (string) $customer_email,
            'source' => 'WEB',
            'amount' => $amount,
            'deductAmount' => (string) $deductamount,
        ));
    }

    $response = send_authenticated_request('/wallet/push', $pushData, $accessToken);
    error_log('API Response: ' . print_r($response, true));
}

 function post_order_data($postData)
{
    $accessToken = get_corporate_auth();
        if ($accessToken) {
            error_log('Post Data Order: ' . json_encode($postData));
            $response = send_authenticated_request('/order/create', $postData, $accessToken);
            error_log('accessToken: ' . $accessToken);
            error_log('Response: ' . $response);
            
        }
}

function send_request($endpoint, $postData)
{
    $url = 'https://api.elevok.com' . $endpoint;
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
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        )
    );

    $result = curl_exec($ch);
    curl_close($ch);

    return $result;
}

function send_authenticated_request($endpoint, $postData, $accessToken)
{
    $url = 'https://api.elevok.com' . $endpoint;
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
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        )
    );

    $result = curl_exec($ch);
    curl_close($ch);

    return $result;
}

function create_xml_file($filename, $content) {
    // Get the WordPress uploads directory
    $upload_dir = wp_upload_dir();
    $upload_path = $upload_dir['basedir'] . '/elevok-xml/';

    // Ensure the directory exists, if not, create it
    if (!file_exists($upload_path)) {
        mkdir($upload_path, 0755, true);
    }

    // Create the full file path
    $file_path = $upload_path . $filename;

    // Save the content to the XML file
    file_put_contents($file_path, $content);
}



function generate_products_xml() {
    $products = wc_get_products(['limit' => -1]);
    $xml = new SimpleXMLElement('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"></rss>');
    $channel = $xml->addChild('channel');

    $channel->addChild('title', get_bloginfo('name')); // Site title
    $channel->addChild('link', home_url()); // Site home URL
    $channel->addChild('description', get_bloginfo('description')); // Site description

    foreach ($products as $product) {
        $item = $channel->addChild('item');
        $item->addChild('id', $product->get_id());
        $item->addChild('name', $product->get_name());
        $item->addChild('category', implode(', ', $product->get_category_ids()));
        $item->addChild('brand', get_post_meta($product->get_id(), 'brand', true) ?: 'Unknown');
        $item->addChild('vat', '1'); // Static VAT value, adjust if needed
        $item->addChild('sku', $product->get_sku());
        $item->addChild('tags', implode(';', wp_get_post_terms($product->get_id(), 'product_tag', ['fields' => 'names'])));
        $item->addChild('condition', 'NEW'); // Static value
        $item->addChild('status', $product->get_status() == 'publish' ? 'ACTIVE' : 'INACTIVE');
        $item->addChild('description', $product->get_description());
        $item->addChild('url', get_permalink($product->get_id()));
        $pictures = $product->get_gallery_image_ids();
        foreach ($pictures as $picture) {
            $item->addChild('pictures', wp_get_attachment_url($picture));
        }
        $item->addChild('price', $product->get_price());
    }

    create_xml_file('elevok-products.xml', $xml->asXML());
}


function generate_categories_xml() {
    $categories = get_terms('product_cat', ['hide_empty' => false]);
    $xml = new SimpleXMLElement('<rss version="2.0"></rss>');
    $channel = $xml->addChild('channel');

    $channel->addChild('title', get_bloginfo('name')); // Site title
    $channel->addChild('link', home_url()); // Site home URL
    $channel->addChild('description', get_bloginfo('description')); // Site description

    foreach ($categories as $category) {
        $item = $channel->addChild('item');
        $item->addChild('id', $category->term_id);
        $item->addChild('layer', $category->parent > 0 ? 2 : 1); // Simple layer logic
        $item->addChild('rank', '1'); // Static rank
        $item->addChild('name', $category->name);
        $item->addChild('parent', $category->parent);
        $item->addChild('description', $category->description);
        $item->addChild('deeplink', get_term_link($category));
    }

    create_xml_file('elevok-categories.xml', $xml->asXML());
}


function generate_brands_xml() {
    // Assuming brands are stored as a custom taxonomy or meta field
    $brands = get_terms('product_brand', ['hide_empty' => false]);
    $xml = new SimpleXMLElement('<rss version="2.0"></rss>');
    $channel = $xml->addChild('channel');

    $channel->addChild('title', get_bloginfo('name')); // Site title
    $channel->addChild('link', home_url()); // Site home URL
    $channel->addChild('description', get_bloginfo('description')); // Site description

    foreach ($brands as $brand) {
        $item = $channel->addChild('item');
        //$item->addChild('id', $brand->term_id);
        //$item->addChild('name', $brand->name);
        //$item->addChild('website', get_term_meta($brand->term_id, 'brand_website', true) ?: '');
    }

    create_xml_file('elevok-brands.xml', $xml->asXML());
}

function ajax_generate_products_xml() {
    check_ajax_referer('generate_xml_nonce', 'security');

    try {
        generate_products_xml();
        wp_send_json_success('Products XML generated successfully.');
    } catch (Exception $e) {
        wp_send_json_error($e->getMessage());
    }
}

function ajax_generate_categories_xml() {
    check_ajax_referer('generate_xml_nonce', 'security');

    try {
        generate_categories_xml();
        wp_send_json_success('Categories XML generated successfully.');
    } catch (Exception $e) {
        wp_send_json_error($e->getMessage());
    }
}

function ajax_generate_brands_xml() {
    check_ajax_referer('generate_xml_nonce', 'security');

    try {
        generate_brands_xml();
        wp_send_json_success('Brands XML generated successfully.');
    } catch (Exception $e) {
        wp_send_json_error($e->getMessage());
    }
}

function ajax_generate_attributes_xml() {
    check_ajax_referer('generate_xml_nonce', 'security');

    try {
        generate_attributes_xml();
        wp_send_json_success('Attributes XML generated successfully.');
    } catch (Exception $e) {
        wp_send_json_error($e->getMessage());
    }
}

function ajax_generate_attribute_values_xml() {
    check_ajax_referer('generate_xml_nonce', 'security');

    try {
        generate_attribute_values_xml();
        wp_send_json_success('Attribute Values XML generated successfully.');
    } catch (Exception $e) {
        wp_send_json_error($e->getMessage());
    }
}

// Function to generate Attributes XML
function generate_attributes_xml() {
    $attributes = wc_get_attribute_taxonomies(); // Get registered attributes

    $xml = new SimpleXMLElement('<channel/>');
    $xml->addChild('title', 'Elevok Widget Demo');
    $xml->addChild('description', 'List of attributes');

    foreach ($attributes as $index => $attribute) {
        $item = $xml->addChild('item');
        $item->addChild('id', intval($index) + 1); // ✅ Fix: Convert to integer
        $item->addChild('name', esc_xml($attribute->attribute_label)); // Attribute name
    }

    // Save to file or output directly
    $xml->asXML(ABSPATH . 'wp-content/uploads/elevok-xml/elevok-attributes.xml');
}

// Function to generate Attribute Values XML
function generate_attribute_values_xml() {
    $attributes = wc_get_attribute_taxonomies(); // Get registered attributes

    $xml = new SimpleXMLElement('<channel/>');
    $xml->addChild('title', 'Elevok Widget Demo');
    $xml->addChild('description', 'List of attribute values');

    $id_counter = 1000; // Starting ID for values

    foreach ($attributes as $attribute) {
        $taxonomy = 'pa_' . $attribute->attribute_name; // WooCommerce attribute taxonomy
        $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]);

        foreach ($terms as $term) {
            $item = $xml->addChild('item');
            $item->addChild('id', $id_counter++);
            $item->addChild('value', esc_xml($term->name)); // Attribute value
        }
    }

    // Save to file or output directly
    $xml->asXML(ABSPATH . 'wp-content/uploads/elevok-xml/elevok-attribute-values.xml');
}

function generate_articles_xml() {
    $args = array(
        'post_type'      => 'product',
        'posts_per_page' => -1,
    );

    $products = get_posts($args);
    $xml = new SimpleXMLElement('<channel/>');
    $xml->addChild('title', 'Elevok Widget Demo');
    $xml->addChild('description', 'List of articles with attribute values');

    // ✅ Step 1: Create attribute ID mapping
    $attribute_id_map = [];
    $id_counter = 1000; // Start ID for first attribute value

    // Get WooCommerce attributes
    $attributes = wc_get_attribute_taxonomies();
    foreach ($attributes as $attribute) {
        $taxonomy = 'pa_' . $attribute->attribute_name;
        $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]);

        foreach ($terms as $term) {
            if (!isset($attribute_id_map[$term->slug])) {
                $attribute_id_map[$term->slug] = $id_counter++;
            }
        }
    }

    foreach ($products as $product) {
        $wc_product = wc_get_product($product->ID);
        $item = $xml->addChild('item');

        // ✅ Step 2: Add product ID and name
        $item->addChild('id', $product->ID);
        $item->addChild('barcode', 'demo_' . $product->ID);
        $item->addChild('name', esc_xml($wc_product->get_name()));

        // ✅ Step 3: Fetch product attributes
        $attributes_data = $wc_product->get_attributes();
        $attribute_values = [];

        foreach ($attributes_data as $attribute_key => $attribute) {
            // Ensure it's a taxonomy attribute
            if ($attribute->is_taxonomy()) {
                $taxonomy = 'pa_' . str_replace('pa_', '', $attribute_key); // Ensure correct taxonomy name
                $terms = wp_get_post_terms($product->ID, $taxonomy);

                foreach ($terms as $term) {
                    if (isset($attribute_id_map[$term->slug])) {
                        $attribute_values[] = $attribute_id_map[$term->slug];
                    }
                }
            }
        }

        // ✅ Step 4: Add attributes in required format
        if (!empty($attribute_values)) {
            $item->addChild('attributes', implode(', ', $attribute_values));
        } else {
            $item->addChild('attributes', 'No Attributes Found'); // Ensure tag is always present
        }

        // ✅ Step 5: Add price
        $item->addChild('price', $wc_product->get_price());

        // ✅ Step 6: Add images
        $image_ids = $wc_product->get_gallery_image_ids();
        if ($image_ids) {
            foreach ($image_ids as $image_id) {
                $image_url = wp_get_attachment_url($image_id);
                if ($image_url) {
                    $item->addChild('pictures', esc_url($image_url));
                }
            }
        } else {
            // Add default product image
            $image_url = wp_get_attachment_url($wc_product->get_image_id());
            if ($image_url) {
                $item->addChild('pictures', esc_url($image_url));
            }
        }
    }

    // ✅ Step 7: Save XML to file
    $xml->asXML(ABSPATH . 'wp-content/uploads/elevok-xml/elevok-articles.xml');
}


function ajax_generate_articles_xml() {
    check_ajax_referer('generate_xml_nonce', 'security');

    try {
        generate_articles_xml();
        wp_send_json_success('Articles XML generated successfully.');
    } catch (Exception $e) {
        wp_send_json_error($e->getMessage());
    }
}

add_action('wp_ajax_generate_orders_xml', 'ajax_generate_orders_xml');


function generate_orders_xml($date_range) {
    
        $date_query = generate_date_query($date_range);
        if (!empty($date_query)) {
            $orders = wc_get_orders([
                'date_after'    => $date_query['date_after'], 
                'date_before'   => $date_query['date_before'],
            ]);
        } else {
            $orders = wc_get_orders("*");
        }

    error_log("orders count: " . count($orders));

    // If no orders are found, throw an exception
    if (empty($orders)) {
        error_log("No orders found for the selected date range.");
        throw new Exception('No orders found for the selected date range.');
    }

    // Create XML structure
    $xml = new SimpleXMLElement('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"></rss>');
    $channel = $xml->addChild('channel');

    // Add site information
    $channel->addChild('title', get_bloginfo('name')); // Site title
    $channel->addChild('link', home_url()); // Site home URL
    $channel->addChild('description', get_bloginfo('description')); // Site description

    // Add orders data
    foreach ($orders as $order) {
        $item = $channel->addChild('item');
        $item->addChild('order_id', $order->get_id());
        $item->addChild('order_date', $order->get_date_created()->date('Y-m-d H:i:s'));
        $item->addChild('customer_name', $order->get_formatted_billing_full_name());
        $item->addChild('email', $order->get_billing_email());
        $item->addChild('total', wc_format_decimal($order->get_total(), 2));
        $item->addChild('payment_method', $order->get_payment_method_title());
        $item->addChild('order_status', $order->get_status());

        // Add order items
        $order_items = $order->get_items();
        foreach ($order_items as $item_id => $item_data) {
            $product_name = $item_data->get_name();
            $quantity = $item_data->get_quantity();
            $order_product = $item->addChild('product');
            $order_product->addChild('product_name', $product_name);
            $order_product->addChild('quantity', $quantity);
        }
    }

    // Call the function to create the XML file
    create_xml_file('elevok-orders.xml', $xml->asXML());
}




function ajax_generate_orders_xml() {
    check_ajax_referer('generate_xml_nonce', 'security');
    $date_range = isset($_POST['date_range']) ? sanitize_text_field($_POST['date_range']) : 'all_time';
    error_log("date range :" . $date_range);
        try {
            
            generate_orders_xml($date_range); 
            wp_send_json_success('Orders XML generated successfully.');
        } catch (Exception $e) {
            //error_log("Orders XML generated failed.");
            wp_send_json_error($e->getMessage());
            
            //error_log($e->getMessage());
        }
}

function generate_date_query($date_range) {
    // Initialize date variables
    $date_after = '';
    $date_before = '';

    // Check the date range and build the date query accordingly
    switch ($date_range) {
        case 'last_day':
            $date_after = date('Y-m-d H:i:s', strtotime('-1 day')); // 24 hours ago
            $date_before = date('Y-m-d H:i:s'); // Now
            break;
        case 'last_3_days':
            $date_after = date('Y-m-d H:i:s', strtotime('-3 days'));
            $date_before = date('Y-m-d H:i:s');
            break;
        case 'last_week':
            $date_after = date('Y-m-d H:i:s', strtotime('-1 week'));
            $date_before = date('Y-m-d H:i:s');
            break;
        case 'last_month':
            $date_after = date('Y-m-d H:i:s', strtotime('-1 month'));
            $date_before = date('Y-m-d H:i:s');
            break;
        case 'last_year':
            $date_after = date('Y-m-d H:i:s', strtotime('-1 year'));
            $date_before = date('Y-m-d H:i:s');
            break;
        case 'all_time':
            // For all time, don't filter by date
            return [];
        default:
            // Default case if something unexpected is passed
            $date_after = date('Y-m-d H:i:s', strtotime('-1 day')); // Default to last day
            $date_before = date('Y-m-d H:i:s');
            break;
    }

    return [
        'date_after'  => $date_after,
        'date_before' => $date_before,
    ];
}

add_filter('cron_schedules', function ($schedules) {
    if (!isset($schedules['every_ten_minutes'])) {
        $schedules['every_ten_minutes'] = [
            'interval' => 600, // 600 seconds = 10 minutes
            'display'  => __('Every 10 Minutes')
        ];
    }
    return $schedules;
});

// Schedule the event if not already scheduled
add_action('init', function () {
    if (!wp_next_scheduled('generate_all_xml_files')) {
        wp_schedule_event(time(), 'every_ten_minutes', 'generate_all_xml_files');
    }
});

// Hook to the cron event
add_action('generate_all_xml_files', 'run_xml_generators');



// Function to generate XML files
function run_xml_generators() {
    error_log("Cron: run_xml_generators called.");
    generate_products_xml();    // Generate products XML
    generate_categories_xml();  // Generate categories XML
    generate_brands_xml();      // Generate brands XML
    generate_attributes_xml();  // Generate attributes XML
    generate_attribute_values_xml(); // Generate attribute values XML
    generate_articles_xml(); // ✅ New: Generate articles XML
}





?>
