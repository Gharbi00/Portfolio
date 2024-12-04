<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Method Not Allowed");
}

require_once dirname(__FILE__) . '/../../config/config.inc.php';
require_once dirname(__FILE__) . '/../../init.php';

$cart = Context::getContext()->cart;
$discountLabel = 'Réduction par points fidélité';

try {
    $existingCartRules = $cart->getCartRules();
    
    foreach ($existingCartRules as $cartRule) {
        if ($cartRule['name'] === $discountLabel) {
            $cartRuleToDelete = new CartRule($cartRule['id_cart_rule']);
            $cartRuleToDelete->delete();
            $cart->removeCartRule($cartRule['id_cart_rule']); 
            $cart->update(); 
            http_response_code(200);
            exit("Discount removed successfully!");
        }
    }

    http_response_code(404);
    exit("Discount not found!");
} catch (Exception $e) {
    PrestaShopLogger::addLog("Exception occurred: " . $e->getMessage(), 3);
    http_response_code(500);
    exit("Failed to remove discount. Please try again!");
}
