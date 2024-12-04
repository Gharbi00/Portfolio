<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Method Not Allowed");
}

$discountAmount = (float) $_POST["discount_amount"];

// Get the WooCommerce cart
$cart = WC()->cart;

$discountLabel = 'Réduction par points fidélité';
$user_id = get_current_user_id();
$customer_email = wp_get_current_user()->user_email; 
$unitValue = 1; 
try {

    $applied_coupons = $cart->get_applied_coupons();
    $existingRuleToUpdate = null;
    
    foreach ($applied_coupons as $coupon_code) {
        if ($coupon_code === sanitize_title($discountLabel)) {
            $existingRuleToUpdate = $coupon_code;
            break;
        }
    }

    if (!is_null($existingRuleToUpdate)) {
        // Update the existing discount
        WC()->cart->remove_coupon($existingRuleToUpdate);
        WC()->cart->apply_coupon(sanitize_title($discountLabel), $discountAmount);
        WC()->cart->calculate_totals();
        $pointsToDeduct = $discountAmount / $unitValue;
        http_response_code(200);
        echo json_encode(["success" => true]);
        exit();
    }

    $coupon_code = sanitize_title($discountLabel);
    $amount = $discountAmount;
    $discount_type = 'fixed_cart';

    $new_coupon = array(
        'post_title' => $coupon_code,
        'post_content' => '',
        'post_status' => 'publish',
        'post_author' => 1,
        'post_type' => 'shop_coupon'
    );

    $coupon_id = wp_insert_post($new_coupon);

    update_post_meta($coupon_id, 'discount_type', $discount_type);
    update_post_meta($coupon_id, 'coupon_amount', $amount);
    update_post_meta($coupon_id, 'individual_use', 'no');
    update_post_meta($coupon_id, 'product_ids', '');
    update_post_meta($coupon_id, 'exclude_product_ids', '');
    update_post_meta($coupon_id, 'usage_limit', '1');
    update_post_meta($coupon_id, 'expiry_date', date('Y-m-d', strtotime('+1 year')));
    update_post_meta($coupon_id, 'apply_before_tax', 'yes');
    update_post_meta($coupon_id, 'free_shipping', 'no');

    $cart->apply_coupon($coupon_code);
    $cart->calculate_totals();

    $pointsToDeduct = $discountAmount / $unitValue;
    error_log('$pointsToDeduct  '.$pointsToDeduct .'$user_id  '. $user_id .'$customer_email' .$customer_email);


    http_response_code(200);
    echo json_encode(["success" => true]);
    exit();
} catch (Exception $e) {
    http_response_code(500);
    exit("Échec de l'application de la réduction. Veuillez réessayer !");
}
