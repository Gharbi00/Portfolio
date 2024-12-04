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
    $first_text= get_option('first_text');
    $second_text= get_option('second_text');
    $submit_text= get_option('submit_text');
    $style = get_option('widget_style');

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

        window.onload = function() {
            // Load the widget SDK
            var script = document.createElement('script');
            script.src = "https://widgt-sbx-app.bosk.app/sdk.js";
            script.async = true;
            script.defer = true;
            script.onload = function() {
                // Reinitialize widgetInit with new values after the SDK is loaded
                window.widgetInit = {
                    appId: '<?php echo esc_js($app_id); ?>',  // You can dynamically use the same appId here
                    locale: 'en', // Switch locale
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
    <style>
        <?php echo esc_html($style); ?>
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

    register_setting('widget_options_group', 'widget_app_id', 'sanitize_text_field');
    register_setting('widget_options_group', 'widget_public_key', 'sanitize_text_field');
    register_setting('widget_options_group', 'widget_secret_key', 'sanitize_text_field');
    register_setting('widget_options_group', 'first_text', 'sanitize_text_field');
    register_setting('widget_options_group', 'second_text', 'sanitize_text_field');
    register_setting('widget_options_group', 'submit_text', 'sanitize_text_field');
    register_setting('widget_options_group', 'widget_style', 'sanitize_text_field');
}


// Create settings menu in the WordPress admin
function widget_register_options_page()
{
    add_options_page('Widget Settings', 'Widget', 'manage_options', 'widget-settings', 'options_page');
}

// Settings page HTML
function options_page()
{
    ?>
    <div class="wrap">
        <h1>Widget Setup</h1>
        <form method="post" action="options.php">
            <?php
settings_fields('widget_options_group');
    do_settings_sections('widget-settings');
    ?>
    <div class="special-container form-table">
            <table >
                <tr>
                    <th scope="row"><label for="widget_app_id">App ID</label></th>
                    <td><input type="text" id="widget_app_id" name="widget_app_id" value="<?php echo esc_attr(get_option('widget_app_id')); ?>" class="regular-text" required /></td>
                    <td scope="row"><label for="first_text">Available amount text</label></td>
                    <td><input type="text" id="first_text" name="first_text" placeholder="Available amount text:" value="<?php echo esc_attr(get_option('first_text')); ?>" class="regular-text" required /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="widget_public_key">Public Key</label></th>
                    <td><input type="text" id="widget_public_key" name="widget_public_key" value="<?php echo esc_attr(get_option('widget_public_key')); ?>" class="regular-text" required /></td>
                    <td scope="row"><label for="second_text">Select amount text</label></td>
                    <td><input type="text" id="second_text" name="second_text" placeholder="Select amount :" value="<?php echo esc_attr(get_option('second_text')); ?>" class="regular-text" required /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="widget_secret_key">Secret Key</label></th>
                    <td><input type="text" id="widget_secret_key" name="widget_secret_key" value="<?php echo esc_attr(get_option('widget_secret_key')); ?>" class="regular-text" required /></td>
                    <td scope="row"><label for="submit_text">Submit Text</label></td>
                    <td><input type="text" id="submit_text" name="submit_text" placeholder="Appliquez une remise" value="<?php echo esc_attr(get_option('submit_text')); ?>" class="regular-text" required /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="widget_style">Custom CSS</label></th>
                    <td><textarea id="widget_style" name="widget_style" rows="5" class="regular-text"><?php echo esc_textarea(get_option('widget_style')); ?></textarea></td>

                </tr>

            </table>



    </div>
    <?php submit_button('Save Settings');?>
    </form>
    </div>

    <style>
        @media (min-width:1000px) {
            .col-md-6{
            width: 50%;
        }
        .special-container{
            display: flex;
        }
        }

    </style>
    <?php
}

function user_registration($user_id)
{
    $user = get_userdata($user_id);
    $email = $user->user_email;
    $first_name = $user->first_name;
    $last_name = $user->last_name;


        $this->authenticate($email, $email, $first_name, $last_name);

}

function user_logout()
{
    setcookie('elvkwdigttoken', '', time() - 3600, '/');
    setcookie('elvkwdigtauth', '', time() - 3600, '/');
    setcookie('elvkwdigtauth', 'false', time() + (864000 * 300), "/");
}

function order_validation($order_id)
{
    $order = wc_get_order($order_id);
    $order_amount = $order->get_total();
    $customer_id = $order->get_customer_id();
    $customer_email = $order->get_billing_email();
    process_order($customer_id, $order_amount, $order_id);
}

function process_order($customer_id, $order_amount, $order_id)

{
    $coinsInput = WC()->session->get('coins_input');
    $checkResponse = fetch_wallet_information($customer_id);
    if (!empty($checkResponse)) {
        $unitValue = $checkResponse['wallet']['coin']['unitValue']['amount'];
        $coinsAmount = $order_amount / $unitValue;
    }
    send_push_amount($customer_id, $order_amount,$coinsInput);

}

function authenticate($id_customer, $email, $firstName, $lastName)
{
    $publicKey = get_option('widget_public_key');
    $secretKey = get_option('widget_secret_key');
    $appId = get_option('widget_app_id');
    $url = 'https://sfca-sbx-bck.diktup.cloud/cauth/clogin';

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
        $mutualizeUrl = 'https://sfca-sbx-bck.diktup.cloud/cauth/login';
        $mutualizeData = json_encode(array(
            'identifier' => (string) $id_customer,
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
    $accessToken = authenticate($user->ID, $email, $first_name, $last_name);
}

function display_wallet_form_on_checkout()
{
    if (is_checkout()) {
        $user_id = get_current_user_id();
        if ($user_id) {

            $checkResponse = fetch_wallet_information($user_id);

            if ($checkResponse) {
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

function inject_wallet_form_at_top() {
    if (is_checkout()) {
        $user_id = get_current_user_id();
        if ($user_id) {

            $checkResponse = fetch_wallet_information($user_id);

            if ($checkResponse) {
                $walletAmount = $checkResponse['wallet']['amount'];
                $unitValue = $checkResponse['wallet']['coin']['unitValue']['amount']; }
        ?>
<div id="hidden-wallet-form" class="wallet-content" style="display:none;">
    <?php display_wallet_form_on_checkout(); ?>
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
                        if (applyDiscountBtn) {
                            applyDiscountBtn.addEventListener("click", function() {
                                var coinsInput = document.getElementById("coins_input").value;

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
                                });
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
    }}
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

function send_push_amount($customer_id, $amount,$deductamount)
{
    $accessToken = get_corporate_auth();
    if ($accessToken) {
        $pushData = json_encode(array(
            'user' => (string)$customer_id,
            'source' => 'WEB',
            'amount' => $amount,
            'deductAmount'=>(string)$deductamount
        ));}

        $response = send_authenticated_request('/wallet/push', $pushData, $accessToken);
    error_log('API Response: ' . print_r($response, true));
}




function send_request($endpoint, $postData)
{
    $url = 'https://sfca-sbx-bck.diktup.cloud' . $endpoint;
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
    $url = 'https://sfca-sbx-bck.diktup.cloud' . $endpoint;
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

?>
