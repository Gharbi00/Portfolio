<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    exit("Method Not Allowed");
}

error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once dirname(__FILE__) . '/../../config/config.inc.php';
require_once dirname(__FILE__) . '/../../init.php';
require_once dirname(__FILE__) . '/elevokwidget.php';

$elevokWidget = new ElevokWidget();
$discountAmount = (float)$_POST["discount_amount"] ;
PrestaShopLogger::addLog("Received POST data: " . print_r($_POST, true));

$cart = Context::getContext()->cart;
$discountLabel = 'Réduction par points fidélité';
$descriptionLabel = 'This rule applies Réduction par points fidélité discount.';
try {
    $existingCartRules = $cart->getCartRules();
    $existingRuleToUpdate = null;

    // Check if the discount already exists in the cart
    foreach ($existingCartRules as $cartRule) {
        if ($cartRule['name'] === $discountLabel) {
            $existingRuleToUpdate = $cartRule;
            break;
        }
    }

        if (!is_null($existingRuleToUpdate)) {
            try {
                $existingRuleId = $existingRuleToUpdate['id_cart_rule'];
                $existingCartRule = new CartRule($existingRuleId);
                $existingCartRule->reduction_amount = $discountAmount;
                $existingCartRule->update();

                http_response_code(200);
                exit("Réduction mise à jour avec succès !");
            } catch (Exception $e) {
                http_response_code(500);
                exit("Échec de la mise à jour de la réduction. Veuillez réessayer !");
            }
        
        }
        $cartRule = new CartRule();
        $defaultLang = (int) Configuration::get('PS_LANG_DEFAULT');
        $languages = Language::getLanguages();
        foreach ($languages as $language) {
            $cartRule->name[$language['id_lang']] = $discountLabel;
            
        }




$cartRuleName = isset($cartRule->name[$defaultLang]) ? $cartRule->name[$defaultLang] : 'Name not set';
$cartRuleDescription = isset($cartRule->description[$defaultLang]) ? $cartRule->description[$defaultLang] : 'Description not set';

        $cartRule->reduction_amount = $discountAmount;
        $cartRule->reduction_tax = true; 
        $cartRule->reduction_currency = 0; 
        $cartRule->quantity = 1;
        $cartRule->quantity_per_user = 1;
        $cartRule->date_from = date('Y-m-d H:i:s');
        $cartRule->date_to = date('Y-m-d H:i:s', strtotime('+1 year'));
        
        // Now add the cart rule
        if ($cartRule->add()) {
            $cart->addCartRule($cartRule->id);
            $cart->update();
        } else {

            http_response_code(500);
            exit("Échec de l'application de la réduction. Veuillez réessayer !");
        }
    

        

        http_response_code(200);
        exit("Réduction appliquée avec succès !");
   
} catch (Exception $e) {
    PrestaShopLogger::addLog("Exception occurred: " . $e->getMessage(), 3); // Error severity
    http_response_code(500);
    exit("Échec de l'application de la réduction. Veuillez réessayer !");
}
