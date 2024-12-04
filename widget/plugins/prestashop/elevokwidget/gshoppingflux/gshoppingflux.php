<?php
/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
 */

require dirname(__FILE__) . '/gcategories.class.php';
require dirname(__FILE__) . '/glangandcurrency.class.php';
include_once dirname(__FILE__) . '/array_column.php';

class GShoppingFlux extends Module
{
    private $_html = '';
    private $orderCount = 0;
    private $user_groups;
    private $date_range;

    const CHARSET = 'UTF-8';
    const REPLACE_FLAGS = ENT_COMPAT;

    public function __construct()
    {
        $this->name = 'gshoppingflux';
        $this->tab = 'smart_shopping';
        $this->version = '1.7.2';
        $this->author = 'Dim00z';

        $this->bootstrap = true;
        parent::__construct();

        $this->page = basename(__FILE__, '.php');
        $this->displayName = $this->l('Google Shopping Flux');
        $this->description = $this->l('Export your products to Google Merchant Center, easily.');

        $this->need_instance = 0;
        $this->ps_versions_compliancy = array('min' => '1.5.0.0', 'max' => _PS_VERSION_);
        $this->uri = ToolsCore::getCurrentUrlProtocolPrefix() . $this->context->shop->domain_ssl . $this->context->shop->physical_uri;
        if (empty($this->context->shop->domain_ssl)) {
            $this->uri = ToolsCore::getCurrentUrlProtocolPrefix() . $this->context->shop->domain . $this->context->shop->physical_uri;
        }
        $this->categories_values = array();
        $this->date_range = Tools::getValue('date_range', Configuration::get('DATE_RANGE', 'all_time'));
        $this->ps_stock_management = Configuration::get('PS_STOCK_MANAGEMENT');
        $this->ps_shipping_handling = (float) Configuration::get('PS_SHIPPING_HANDLING');
        $this->free_shipping = Configuration::getMultiple(array('PS_SHIPPING_FREE_PRICE', 'PS_SHIPPING_FREE_WEIGHT'));
    }



    public function installDb()
    {
        return Db::getInstance()->execute('
			CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'gshoppingflux` (
				`id_gcategory` INT(11) UNSIGNED NOT NULL,
				`export` INT(11) UNSIGNED NOT NULL,
				`condition` VARCHAR( 12 ) NOT NULL,
				`availability` VARCHAR( 12 ) NOT NULL,
				`gender` VARCHAR( 8 ) NOT NULL,
				`age_group` VARCHAR( 8 ) NOT NULL,
				`color` VARCHAR( 64 ) NOT NULL,
				`material` VARCHAR( 64 ) NOT NULL,
				`pattern` VARCHAR( 64 ) NOT NULL,
				`size` VARCHAR( 64 ) NOT NULL,
				`id_shop` INT(11) UNSIGNED NOT NULL,
		  	INDEX (`id_gcategory`, `id_shop`)
		  	) ENGINE = ' . _MYSQL_ENGINE_ . ' CHARACTER SET utf8 COLLATE utf8_general_ci;')

        && Db::getInstance()->execute('
				CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'gshoppingflux_lc` (
					`id_glang` INT(11) UNSIGNED NOT NULL,
					`id_currency` VARCHAR(255) NOT NULL,
					`tax_included` TINYINT(1) NOT NULL,
					`id_shop` INT(11) UNSIGNED NOT NULL,
			  INDEX (`id_glang`, `id_shop`)
			) ENGINE = ' . _MYSQL_ENGINE_ . ' CHARACTER SET utf8 COLLATE utf8_general_ci;')

        && Db::getInstance()->execute('
				CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'gshoppingflux_lang` (
					`id_gcategory` INT(11) UNSIGNED NOT NULL,
					`id_lang` INT(11) UNSIGNED NOT NULL,
					`id_shop` INT(11) UNSIGNED NOT NULL,
					`gcategory` VARCHAR( 255 ) NOT NULL,
			  INDEX (`id_gcategory`, `id_lang`, `id_shop`)
			) ENGINE = ' . _MYSQL_ENGINE_ . ' CHARACTER SET utf8 COLLATE utf8_general_ci;');
    }

    public function initDb($id_shop)
    {
        $languages = Language::getLanguages(true, $id_shop);
        $id_lang = $this->context->language->id;
        $str = array();

        $shop = new Shop($id_shop);
        $root = Category::getRootCategory($id_lang, $shop);

        $categs = Db::getInstance()->executeS('
			SELECT c.id_category, c.id_parent, c.active
			FROM ' . _DB_PREFIX_ . 'category c
			INNER JOIN `' . _DB_PREFIX_ . 'category_shop` cs ON (cs.id_category=c.id_category AND cs.id_shop=' . (int) $id_shop . ')
			ORDER BY c.id_category ASC, c.level_depth ASC, cs.position ASC;');

        foreach ($categs as $kc => $cat) {
            foreach ($languages as $key => $lang) {
                $str[$lang['id_lang']] = '';
            }

            $condition = '';
            $availability = '';
            $gender = '';
            $age_group = '';
            $color = '';
            $material = '';
            $pattern = '';
            $size = '';

            $cat_exists = GCategories::get($cat['id_category'], $id_lang, $id_shop);
            if ((!count($cat_exists) || $cat_exists === false) && ($cat['id_category'] > 0)) {
                if ($root->id_category == $cat['id_category']) {
                    foreach ($languages as $key => $lang) {
                        $str[$lang['id_lang']] = $this->l('Google Category Example > Google Sub-Category Example');
                    }

                    $condition = 'new';
                    $availability = 'in stock';
                }
                GCategories::add($cat['id_category'], $str, $cat['active'], $condition, $availability, $gender, $age_group, $color, $material, $pattern, $size, $id_shop);
            }
        }

        foreach ($languages as $lang) {
            if (!count(GLangAndCurrency::getLangCurrencies($lang['id_lang'], $id_shop))) {
                GLangAndCurrency::add($lang['id_lang'], $this->context->currency->id, 1, $id_shop);
            }
        }

        return true;
    }

    public function uninstall($delete_params = true)
    {
        if (!parent::uninstall()) {
            return false;
        }

        if ($delete_params) {
            if (!$this->uninstallDB() || !Configuration::deleteByName('GS_PRODUCT_TYPE') || !Configuration::deleteByName('GS_DESCRIPTION') || !Configuration::deleteByName('GS_SHIPPING_MODE') || !Configuration::deleteByName('GS_SHIPPING_PRICE') || !Configuration::deleteByName('GS_SHIPPING_COUNTRY') || !Configuration::deleteByName('GS_SHIPPING_COUNTRIES') || !Configuration::deleteByName('GS_CARRIERS_EXCLUDED') || !Configuration::deleteByName('GS_IMG_TYPE') || !Configuration::deleteByName('GS_MPN_TYPE') || !Configuration::deleteByName('GS_GENDER') || !Configuration::deleteByName('GS_AGE_GROUP') || !Configuration::deleteByName('GS_ATTRIBUTES') || !Configuration::deleteByName('GS_COLOR') || !Configuration::deleteByName('GS_MATERIAL') || !Configuration::deleteByName('GS_PATTERN') || !Configuration::deleteByName('GS_SIZE') || !Configuration::deleteByName('GS_EXPORT_MIN_PRICE') || !Configuration::deleteByName('GS_NO_GTIN') || !Configuration::deleteByName('GS_SHIPPING_DIMENSION') || !Configuration::deleteByName('GS_NO_BRAND') || !Configuration::deleteByName('GS_ID_EXISTS_TAG') || !Configuration::deleteByName('GS_EXPORT_NAP') || !Configuration::deleteByName('GS_QUANTITY') || !Configuration::deleteByName('GS_FEATURED_PRODUCTS') || !Configuration::deleteByName('GS_GEN_FILE_IN_ROOT') || !Configuration::deleteByName('GS_FILE_PREFIX')) {
                return false;
            }
        }

        return true;
    }

    public function uninstallDb()
    {
        Db::getInstance()->execute('DROP TABLE `' . _DB_PREFIX_ . 'gshoppingflux`');
        Db::getInstance()->execute('DROP TABLE `' . _DB_PREFIX_ . 'gshoppingflux_lc`');
        Db::getInstance()->execute('DROP TABLE `' . _DB_PREFIX_ . 'gshoppingflux_lang`');

        return true;
    }

    public function reset()
    {
        if (!$this->uninstall(false)) {
            return false;
        }
        if (!$this->install(false)) {
            return false;
        }

        return true;
    }

    public function hookActionObjectCategoryAddAfter($params)
    {
        $shops = Shop::getShops(true, null, true);
        foreach ($shops as $id_shop) {
            $this->initDb($id_shop);
        }
    }

    public function hookActionObjectCategoryDeleteAfter($params)
    {
        $shops = Shop::getShops(true, null, true);
        foreach ($shops as $id_shop) {
            $this->initDb($id_shop);
        }
    }

    public function hookActionShopDataDuplication($params)
    {
        $gcategories = Db::getInstance()->executeS('
			SELECT *
			FROM ' . _DB_PREFIX_ . 'gshoppingflux
			WHERE id_shop = ' . (int) $params['old_id_shop']);

        foreach ($gcategories as $id => $gcateg) {
            Db::getInstance()->insert('gshoppingflux', array(
                'id_gcategory' => null,
                'id_shop' => (int) $params['new_id_shop'],
            ));

            $gcategories[$id]['new_id_gcategory'] = Db::getInstance()->Insert_ID();
        }

        foreach ($gcategories as $id => $gcateg) {
            $lang = Db::getInstance()->executeS('
					SELECT id_lang, ' . (int) $params['new_id_shop'] . ', gcategory
					FROM ' . _DB_PREFIX_ . 'gshoppingflux_lang
					WHERE id_gcategory = ' . (int) $gcateg['id_gcategory'] . ' AND id_shop = ' . (int) $params['old_id_shop']);

            foreach ($lang as $l) {
                Db::getInstance()->insert('gshoppingflux_lang', array(
                    'id_gcategory' => (int) $gcateg['new_id_gcategory'],
                    'id_lang' => (int) $l['id_lang'],
                    'id_shop' => (int) $params['new_id_shop'],
                    'gcategory' => (int) $l['gcategory'],
                ));
            }
        }
    }

    public function hookActionCarrierUpdate($params)
    {
        $shop_id = $this->context->shop->id;
        $shop_group_id = Shop::getGroupFromShop($shop_id);
        $id_carrier_old = (int) ($params['id_carrier']);
        $id_carrier_new = (int) ($params['carrier']->id);
        $carriers_excluded = explode(';', Configuration::get('GS_CARRIERS_EXCLUDED', 0, $shop_group_id, $shop_id));
        if ($key = array_search($id_carrier_old, $carriers_excluded) !== false) {
            unset($carriers_excluded[$key]);
            array_push($carriers_excluded, $id_carrier_new);
            Configuration::updateValue('GS_CARRIERS_EXCLUDED', implode(';', $carriers_excluded), false, (int) $shop_group_id, (int) $shop_id);
        }
    }

    public function shoppingFluxCatalog()
    {
        $id_lang = $this->context->language->id;
        $languages = $this->context->controller->getLanguages();
        $shops = Shop::getShops(true, null, true);
        $shop_id = $this->context->shop->id;
        $shop_group_id = Shop::getGroupFromShop($shop_id);

        $gcategories = Tools::getValue('gcategory') ? array_filter(Tools::getValue('gcategory'), 'strlen') : array();
        if (count($shops) > 1 && Shop::getContext() != 1) {
            $this->_html .= $this->getWarningMultishopHtml();

            return $this->_html;
        }

        if (Shop::isFeatureActive()) {
            $this->_html .= $this->getCurrentShopInfoMsg();
        }

        if (Tools::isSubmit('submitFluxOptions')) {
            $errors_update_shops = array();
            $updated = true;
            $product_type_lang = Tools::getValue('product_type');
            foreach ($languages as $k => $lang) {
                $product_type[$lang['id_lang']] = $product_type_lang[$k];
            }

            $updated &= Configuration::updateValue('GS_PRODUCT_TYPE', $product_type, false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_DESCRIPTION', Tools::getValue('description'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_SHIPPING_MODE', Tools::getValue('shipping_mode'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_SHIPPING_PRICE', (float) Tools::getValue('shipping_price'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_SHIPPING_COUNTRY', Tools::getValue('shipping_country'), false, (int) $shop_group_id, (int) $shop_id);
            //$updated &= Configuration::updateValue('GS_SHIPPING_COUNTRIES', implode(';', Tools::getValue('shipping_countries')), false, (int)$shop_group_id, (int)$shop_id);
            //$updated &= Configuration::updateValue('GS_CARRIERS_EXCLUDED', implode(';', Tools::getValue('carriers_excluded')), false, (int)$shop_group_id, (int)$shop_id);
            $updated &= Configuration::updateValue('GS_IMG_TYPE', Tools::getValue('img_type'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_MPN_TYPE', Tools::getValue('mpn_type'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_GENDER', Tools::getValue('gender'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_AGE_GROUP', Tools::getValue('age_group'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_ATTRIBUTES', Tools::getValue('export_attributes'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_COLOR', implode(';', Tools::getValue('color')), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_MATERIAL', implode(';', Tools::getValue('material')), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_PATTERN', implode(';', Tools::getValue('pattern')), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_SIZE', implode(';', Tools::getValue('size')), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_EXPORT_MIN_PRICE', (float) Tools::getValue('export_min_price'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_NO_GTIN', (bool) Tools::getValue('no_gtin'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_SHIPPING_DIMENSION', (bool) Tools::getValue('shipping_dimension'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_NO_BRAND', (bool) Tools::getValue('no_brand'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_ID_EXISTS_TAG', (bool) Tools::getValue('id_exists_tag'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_EXPORT_NAP', (bool) Tools::getValue('export_nap'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_QUANTITY', (bool) Tools::getValue('quantity'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_FEATURED_PRODUCTS', (bool) Tools::getValue('featured_products'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_GEN_FILE_IN_ROOT', (bool) Tools::getValue('gen_file_in_root'), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_FILE_PREFIX', trim(Tools::getValue('file_prefix')), false, (int) $shop_group_id, (int) $shop_id);
            $updated &= Configuration::updateValue('GS_AUTOEXPORT_ON_SAVE', (bool) Tools::getValue('autoexport_on_save'), false, (int) $shop_group_id, (int) $shop_id);

            if (!$updated) {
                $shop = new Shop($shop_id);
                $errors_update_shops[] = $shop->name;
            }

            if (!count($errors_update_shops)) {
                $this->confirm = $this->l('The settings have been updated.');
                $this->generateXMLFiles(0, $shop_id, $shop_group_id);
            } else {
                $this->_html .= $this->displayError(sprintf($this->l('Unable to update settings for the following shop: %s'), implode(', ', $errors_update_shops)));
            }
        } elseif (Tools::isSubmit('updateCategory')) {
            $id_gcategory = (int) Tools::getValue('id_gcategory', 0);
            $export = (int) Tools::getValue('export', 0);
            $condition = Tools::getValue('condition');
            $availability = Tools::getValue('availability');
            $gender = Tools::getValue('gender');
            $age_group = Tools::getValue('age_group');
            $color = implode(';', Tools::getValue('color'));
            $material = implode(';', Tools::getValue('material'));
            $pattern = implode(';', Tools::getValue('pattern'));
            $size = implode(';', Tools::getValue('size'));
            $id_shop = (int) Shop::getContextShopID();

            if (Tools::isSubmit('updatecateg')) {
                $gcateg = array();
                foreach (Language::getLanguages(false) as $lang) {
                    $gcateg[$lang['id_lang']] = Tools::getValue('gcategory_' . (int) $lang['id_lang']);
                }

                GCategories::update($id_gcategory, $gcateg, $export, $condition, $availability, $gender, $age_group, $color, $material, $pattern, $size, $id_shop);
                $this->confirm = $this->l('Google category has been updated.');
            }
            if (Configuration::get('GS_AUTOEXPORT_ON_SAVE', 0, $shop_group_id, $shop_id) == 1) {
                $this->generateXMLFiles(0, $shop_id, $shop_group_id);
            }
        } elseif (Tools::isSubmit('updateLanguage')) {
            $id_glang = (int) Tools::getValue('id_glang', 0);
            $currencies = implode(';', Tools::getValue('currencies'));
            $tax_included = (int) Tools::getValue('tax_included', 0);
            $export = (int) Tools::getValue('active', 0);
            if (Tools::isSubmit('updatelang')) {
                GLangAndCurrency::update($id_glang, $currencies, $tax_included, (int) Shop::getContextShopID());
                if (count(Tools::getValue('currencies')) > 1) {
                    $this->confirm = $this->l('Selected currencies for this language have been saved.');
                } else {
                    $this->confirm = $this->l('Selected currency for this language has been saved.');
                }
            }
            if ($export && Configuration::get('GS_AUTOEXPORT_ON_SAVE', 0, $shop_group_id, $shop_id) == 1) {
                $this->generateXMLFiles($id_glang, $shop_id, $shop_group_id);
            } else {
                $this->_html .= $this->displayConfirmation(html_entity_decode($this->confirm));
            }
        }

        $gcategories = GCategories::gets((int) $id_lang, null, (int) $shop_id);
        if (!count($gcategories)) {
            return $this->_html;
        }

        $this->_html .= $this->renderForm('catalog');
        //$this->_html .= $this->renderCategList();
        //$this->_html .= $this->renderLangList();
        $this->_html .= $this->renderInfo('catalog');

        return $this->_html;
    }

    public function shoppingFluxOrders()
    {
        $id_lang = $this->context->language->id;
        $languages = $this->context->controller->getLanguages();
        $shops = Shop::getShops(true, null, true);
        $shop_id = $this->context->shop->id;
        $shop_group_id = Shop::getGroupFromShop($shop_id);

        $gcategories = Tools::getValue('gcategory') ? array_filter(Tools::getValue('gcategory'), 'strlen') : array();
        if (count($shops) > 1 && Shop::getContext() != 1) {
            $this->_html .= $this->getWarningMultishopHtml();

            return $this->_html;
        }

        if (Shop::isFeatureActive()) {
            $this->_html .= $this->getCurrentShopInfoMsg();
        }

        if (Tools::isSubmit('submitFluxOptions')) {
            $errors_update_shops = array();
            $updated = true;
            $product_type_lang = Tools::getValue('product_type');
            $updated &= Configuration::updateValue('GS_AUTOEXPORT_ON_SAVE', (bool) Tools::getValue('autoexport_on_save'), false, (int) $shop_group_id, (int) $shop_id);
            $newDateRange = Tools::getValue('date_range');
            $validRanges = ['last_day', 'last_3_days', 'last_week', 'last_month', 'last_year', 'all_time'];
            if (in_array($newDateRange, $validRanges)) {
                Configuration::updateValue('DATE_RANGE', $newDateRange);
                $this->date_range = $newDateRange;
                $output = $this->displayConfirmation($this->l('Date range updated successfully.'));
                PrestaShopLogger::addLog('displayConfirmation : ' . print_r($this->date_range, true));
            } else {
                $output = $this->displayError($this->l('Invalid date range selection.'));
            }
            if (!$updated) {
                $shop = new Shop($shop_id);
                $errors_update_shops[] = $shop->name;
            }

            if (!count($errors_update_shops)) {
                $this->confirm = $this->l('The settings have been updated.');
                $this->generateXMLFilesOrder(0, $shop_id, $shop_group_id);
            } else {
                $this->_html .= $this->displayError(sprintf($this->l('Unable to update settings for the following shop: %s'), implode(', ', $errors_update_shops)));
            }
        } elseif (Tools::isSubmit('updateCategory')) {
            $id_gcategory = (int) Tools::getValue('id_gcategory', 0);
            $export = (int) Tools::getValue('export', 0);
            $condition = Tools::getValue('condition');
            $availability = Tools::getValue('availability');
            $gender = Tools::getValue('gender');
            $age_group = Tools::getValue('age_group');
            $color = implode(';', Tools::getValue('color'));
            $material = implode(';', Tools::getValue('material'));
            $pattern = implode(';', Tools::getValue('pattern'));
            $size = implode(';', Tools::getValue('size'));
            $id_shop = (int) Shop::getContextShopID();

            if (Tools::isSubmit('updatecateg')) {
                $gcateg = array();
                foreach (Language::getLanguages(false) as $lang) {
                    $gcateg[$lang['id_lang']] = Tools::getValue('gcategory_' . (int) $lang['id_lang']);
                }

                GCategories::update($id_gcategory, $gcateg, $export, $condition, $availability, $gender, $age_group, $color, $material, $pattern, $size, $id_shop);
                $this->confirm = $this->l('Google category has been updated.');
            }
            if (Configuration::get('GS_AUTOEXPORT_ON_SAVE', 0, $shop_group_id, $shop_id) == 1) {
                $this->generateXMLFiles(0, $shop_id, $shop_group_id);
            }
        } elseif (Tools::isSubmit('updateLanguage')) {
            $id_glang = (int) Tools::getValue('id_glang', 0);
            $currencies = implode(';', Tools::getValue('currencies'));
            $tax_included = (int) Tools::getValue('tax_included', 0);
            $export = (int) Tools::getValue('active', 0);
            if (Tools::isSubmit('updatelang')) {
                GLangAndCurrency::update($id_glang, $currencies, $tax_included, (int) Shop::getContextShopID());
                if (count(Tools::getValue('currencies')) > 1) {
                    $this->confirm = $this->l('Selected currencies for this language have been saved.');
                } else {
                    $this->confirm = $this->l('Selected currency for this language has been saved.');
                }
            }
            if ($export && Configuration::get('GS_AUTOEXPORT_ON_SAVE', 0, $shop_group_id, $shop_id) == 1) {
                $this->generateXMLFiles($id_glang, $shop_id, $shop_group_id);
            } else {
                $this->_html .= $this->displayConfirmation(html_entity_decode($this->confirm));
            }
        }

        $gcategories = GCategories::gets((int) $id_lang, null, (int) $shop_id);
        if (!count($gcategories)) {
            return $this->_html;
        } else {
            $this->_html .= $this->renderForm('order');
            $this->_html .= $this->renderInfo('order');

        }

        return $this->_html;
    }

    public function generateXMLFiles($lang_id, $shop_id, $shop_group_id)
    {
        if (isset($lang_id) && $lang_id != 0) {
            $count = $this->generateLangFileList($lang_id, $shop_id);
            $languages = GLangAndCurrency::getLangCurrencies($lang_id, $shop_id);
        } else {
            $count = $this->generateShopFileList($shop_id);
            $languages = GLangAndCurrency::getAllLangCurrencies(1);
        }

        
        $id_lang = Context::getContext()->language->id; 
        $id_currency = Context::getContext()->currency->id; 

       
        $lang = new Language($id_lang);
        $currency = new Currency($id_currency);

       
        $shop_group_id = Shop::getGroupFromShop($shop_id);
        $shop_id = Context::getContext()->shop->id;

        
        if (Configuration::get('GS_GEN_FILE_IN_ROOT', 0, $shop_group_id, $shop_id) == 1) {
            // Generating file URLs for different file types (products, categories, brands)
            $products_file_url = $this->uri . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $shop_id, 'elevok-products');
            $categories_file_url = $this->uri . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $shop_id, 'elevok-categories');
            $brands_file_url = $this->uri . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $shop_id, 'elevok-brands');
        } else {
            // Generating file URLs for different file types (products, categories, brands) in the export folder
            $products_file_url = $this->uri . 'modules/elevokwidget/' . $this->name . '/export/' . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $shop_id, 'elevok-products');
            $categories_file_url = $this->uri . 'modules/elevokwidget/' . $this->name . '/export/' . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $shop_id, 'elevok-categories');
            $brands_file_url = $this->uri . 'modules/elevokwidget/' . $this->name . '/export/' . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $shop_id, 'elevok-brands');
        }
        
        // Example of using the URLs
        $this->confirm .= '<br /> <a href="' . $products_file_url . '" target="_blank">' . $products_file_url . '</a>';
        $this->confirm .= '<br /> <a href="' . $categories_file_url . '" target="_blank">' . $categories_file_url . '</a>';
        $this->confirm .= '<br /> <a href="' . $brands_file_url . '" target="_blank">' . $brands_file_url . '</a>';

        if ($count[0]['nb_combinations'] > 0) {
            $this->confirm .= ': ' . $count[0]['nb_prod_w_attr'] . ' ' . $this->l('products with attributes');
            $this->confirm .= ', ' . $count[0]['nb_combinations'] . ' ' . $this->l('attributes combinations');
            $this->confirm .= '.<br/> ' . $this->l('Total') . ': ' . ($count[0]['nb_products']) . ' ' . $this->l('exported products');

            if ($count[0]['non_exported_products'] > 0) {
                $this->confirm .= ', ' . $this->l('and') . ' ' . $count[0]['non_exported_products'] . ' ' . $this->l('not-exported products (non-available)');
            }
            $this->confirm .= '.';
        } else {
            $this->confirm .= '.';
        }

        $this->_html .= $this->displayConfirmation(html_entity_decode($this->confirm));

        return;
    }

    public function getWarningMultishopHtml()
    {
        return '<p class="alert alert-warning">' . $this->l('You cannot manage Google categories from a "All Shops" or a "Group Shop" context, select directly the shop you want to edit') . '</p>';
    }

    public function getCurrentShopInfoMsg()
    {
        $shop_info = null;

        if (Shop::getContext() == Shop::CONTEXT_SHOP) {
            $shop_info = sprintf($this->l('The modifications will be applied to shop: %s'), $this->context->shop->name);
        } elseif (Shop::getContext() == Shop::CONTEXT_GROUP) {
            $shop_info = sprintf($this->l('The modifications will be applied to this group: %s'), Shop::getContextShopGroup()->name);
        } else {
            $shop_info = $this->l('The modifications will be applied to all shops');
        }

        return '<div class="alert alert-info">' . $shop_info . '</div>';
    }

    public function getShopFeatures($id_lang, $id_shop)
    {
        return Db::getInstance()->executeS('
			SELECT fl.* FROM ' . _DB_PREFIX_ . 'feature f
			LEFT JOIN ' . _DB_PREFIX_ . 'feature_lang fl ON (fl.id_feature = f.id_feature)
			LEFT JOIN ' . _DB_PREFIX_ . 'feature_shop fs ON (fs.id_feature = f.id_feature)
			WHERE fl.id_lang = ' . (int) $id_lang . ' AND fs.id_shop = ' . (int) $id_shop . '
			ORDER BY f.id_feature ASC');
    }

    public function getShopAttributes($id_lang, $id_shop)
    {
        return Db::getInstance()->executeS('
			SELECT agl.* FROM ' . _DB_PREFIX_ . 'attribute_group_lang agl
			LEFT JOIN ' . _DB_PREFIX_ . 'attribute_group_shop ags ON (ags.id_attribute_group = agl.id_attribute_group)
			WHERE agl.id_lang = ' . (int) $id_lang . ' AND ags.id_shop = ' . (int) $id_shop . '
			ORDER BY ags.id_attribute_group ASC');
    }

    public function getProductFeatures($id_product, $id_lang, $id_shop)
    {
        return Db::getInstance()->executeS('
			SELECT fl.*, fv.value FROM ' . _DB_PREFIX_ . 'feature_product fp
			LEFT JOIN ' . _DB_PREFIX_ . 'feature_lang fl ON (fl.id_feature = fp.id_feature)
			LEFT JOIN ' . _DB_PREFIX_ . 'feature_shop fs ON (fs.id_feature = fp.id_feature)
			LEFT JOIN ' . _DB_PREFIX_ . 'feature_value_lang fv ON (fv.id_feature_value = fp.id_feature_value AND fv.id_lang = fl.id_lang)
			WHERE fp.id_product = ' . (int) $id_product . ' AND fl.id_lang = ' . (int) $id_lang . ' AND fs.id_shop = ' . (int) $id_shop . '
			ORDER BY fp.id_feature ASC');
    }

    public function renderForm($formName)
    {
        $helper = new HelperForm();
        $helper->show_toolbar = false;
        $helper->table = $this->table;

        $lang = new Language((int) Configuration::get('PS_LANG_DEFAULT'));
        $helper->default_form_language = $lang->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') ? Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') : 0;
        $this->fields_form = array();
        $helper->module = $this;
        $helper->identifier = $this->identifier;
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false) . '&configure=' . $this->name . '&tab_module=' . $this->tab . '&module_name=' . $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->tpl_vars = array(
            'fields_value' => $this->getConfigFieldsValues($this->context->shop->id),
            'id_language' => $this->context->language->id,
            'languages' => $this->context->controller->getLanguages(),
        );

        $id_lang = $this->context->language->id;
        $id_shop = $this->context->shop->id;
        $img_types = ImageType::getImagesTypes('products');

        $features = array(
            array(
                'id_feature' => '',
                'name' => $this->l('Product feature doesn\'t exist'),
            ),
        );
        $features = array_merge($features, $this->getShopFeatures($id_lang, $id_shop));
        $descriptions = array(
            array(
                'id_desc' => 'short',
                'name' => $this->l('Short description'),
            ),
            array(
                'id_desc' => 'long',
                'name' => $this->l('Long description'),
            ),
            array(
                'id_desc' => 'meta',
                'name' => $this->l('Meta description'),
            ),
        );
        $mpn_types = array(
            array(
                'id_mpn' => 'reference',
                'name' => $this->l('Reference'),
            ),
            array(
                'id_mpn' => 'supplier_reference',
                'name' => $this->l('Supplier reference'),
            ),
        );
        $form_desc = html_entity_decode($this->l('Please visit and read the <a href="https://diktup.com/" target="_blank">Diktup</a> if you don\'t know how to configure these options. <br/> If all your shop products match the same Google Shopping category, you can attach it to your home category in the table below, sub-categories will automatically get the same setting. No need to fill each Google category field. <br/> Products in categories with no Google category specified are exported in the Google Shopping category linked to the nearest parent.'));

        $catalogForm = array(
            'form' => array(
                'legend' => array(
                    'title' => $this->l('Catalog Parameters'),
                    'icon' => 'icon-cogs',
                ),
                'input' => array(

                    array(
                        'type' => 'text',
                        'label' => $this->l('Default product type'),
                        'name' => 'product_type[]',
                        //'class' => 'fixed-width-xl',
                        'lang' => true,
                        'desc' => $this->l('Your shop\'s default product type, ie: if you sell pants and shirts, and your main categories are "Men", "Women", "Kids", enter "Clothing" here. That will be exported as your shop main category. This setting is optional and can be left empty. Besides the module requires that at least main category of your shop is correctly linked to a Google product category.'),
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Description type'),
                        'name' => 'description',
                        'default_value' => $helper->tpl_vars['fields_value']['description'],
                        'options' => array(
                            //'default' => array('value' => 0, 'label' => $this->l('Choose description type')),
                            'query' => $descriptions,
                            'id' => 'id_desc',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Shipping Methods'),
                        'name' => 'shipping_mode',
                        'options' => array(
                            'query' => array(
                                array(
                                    'id_mode' => 'none',
                                    'name' => $this->l('No shipping method'),
                                ),
                                array(
                                    'id_mode' => 'fixed',
                                    'name' => $this->l('Price fixed'),
                                ),
                                array(
                                    'id_mode' => 'full',
                                    'name' => $this->l('Generate shipping costs in several countries [EXPERIMENTAL]'),
                                ),
                            ),
                            'id' => 'id_mode',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('Shipping price'),
                        'name' => 'shipping_price',
                        'class' => 'fixed-width-xs',
                        'prefix' => $this->context->currency->sign,
                        'desc' => $this->l('This field is used for "Price fixed".'),
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('Shipping country'),
                        'name' => 'shipping_country',
                        'class' => 'fixed-width-xs',
                        //'suffix' => strtoupper($this->context->language->iso_code),
                        'desc' => $this->l('This field is used for "Price fixed".'),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Shipping countries'),
                        'name' => 'shipping_countries[]',
                        'options' => array(
                            'query' => array_merge(array(
                                array(
                                    'id_country' => 'all',
                                    'name' => $this->l('All'),
                                ),
                            ), Country::getCountries($this->context->language->id, true)),
                            'id' => 'id_country',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('This field is used for "Generate shipping costs in several countries". Hold [Ctrl] key pressed to select multiple country.'),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Carriers to exclude'),
                        'name' => 'carriers_excluded[]',
                        'options' => array(
                            'query' => array_merge(array(
                                array(
                                    'id_carrier' => 'no',
                                    'name' => $this->l('No'),
                                ),
                            ), Carrier::getCarriers($this->context->language->id)),
                            'id' => 'id_carrier',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('This field is used for "Generate shipping costs in several countries". Hold [Ctrl] key pressed to select multiple carriers.'),
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Images type'),
                        'name' => 'img_type',
                        'default_value' => $helper->tpl_vars['fields_value']['img_type'],
                        'options' => array(
                            //'default' => array('value' => 0, 'label' => $this->l('Choose image type')),
                            'query' => $img_types,
                            'id' => 'name',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Manufacturers References type (MPN)'),
                        'name' => 'mpn_type',
                        'default_value' => $helper->tpl_vars['fields_value']['mpn_type'],
                        'options' => array(
                            'query' => $mpn_types,
                            'id' => 'id_mpn',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('Minimum product price'),
                        'name' => 'export_min_price',
                        'class' => 'fixed-width-xs',
                        'prefix' => $this->context->currency->sign,
                        'desc' => $this->l('Products at lower price are not exported. Enter 0.00 for no use.'),
                        'required' => true,
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Products gender feature'),
                        'name' => 'gender',
                        'default_value' => $helper->tpl_vars['fields_value']['gender'],
                        'options' => array(
                            'query' => $features,
                            'id' => 'id_feature',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Products age group feature'),
                        'name' => 'age_group',
                        'default_value' => $helper->tpl_vars['fields_value']['age_group'],
                        'options' => array(
                            'query' => $features,
                            'id' => 'id_feature',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Products color feature'),
                        'name' => 'color[]',
                        'default_value' => $helper->tpl_vars['fields_value']['color[]'],
                        'options' => array(
                            'query' => $features,
                            'id' => 'id_feature',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('Hold [Ctrl] key pressed to select multiple color features.'),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Products material feature'),
                        'name' => 'material[]',
                        'default_value' => $helper->tpl_vars['fields_value']['material[]'],
                        'options' => array(
                            'query' => $features,
                            'id' => 'id_feature',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('Hold [Ctrl] key pressed to select multiple material features.'),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Products pattern feature'),
                        'name' => 'pattern[]',
                        'default_value' => $helper->tpl_vars['fields_value']['pattern[]'],
                        'options' => array(
                            'query' => $features,
                            'id' => 'id_feature',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('Hold [Ctrl] key pressed to select multiple pattern features.'),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Products size feature'),
                        'name' => 'size[]',
                        'default_value' => $helper->tpl_vars['fields_value']['size[]'],
                        'options' => array(
                            'query' => $features,
                            'id' => 'id_feature',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('Hold [Ctrl] key pressed to select multiple size features.'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Export attributes combinations'),
                        'name' => 'export_attributes',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                        'desc' => $this->l('If checked, one product is exported for each attributes combination. Products should have at least one attribute filled in order to be exported as combinations.'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Export products with no GTIN code'),
                        'name' => 'no_gtin',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                        'desc' => $this->l('Allow export of products, that no not have a GTIN code (EAN13/UPC)'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Export products shipping dimensions'),
                        'name' => 'shipping_dimension',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                        'desc' => $this->l('Allow export of dimension for each products, if typed in product details'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Export products with no brand'),
                        'name' => 'no_brand',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                        'desc' => $this->l('Allow export of products, that no not have a brand (Manufacturer)'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Set <identifier_exists> tag to FALSE'),
                        'name' => 'id_exists_tag',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                        'desc' => $this->l('If your product is new (which you submit through the condition attribute) and it doesn’t have a gtin and brand or mpn and brand.') . ' <a href="https://support.google.com/merchants/answer/6324478?hl=en" target="_blank">' . $this->l('identifier_exists: Definition') . '</a>',
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Export non-available products'),
                        'name' => 'export_nap',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Export product quantity'),
                        'name' => 'quantity',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Export "On Sale" indication'),
                        'name' => 'featured_products',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Generate the files to the root of the site'),
                        'name' => 'gen_file_in_root',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('prefix for output filename'),
                        'name' => 'file_prefix',
                        'class' => 'fixed-width-lg',
                        'desc' => $this->l('Allows you to prefix feed filename. Makes it a little harder for other to guess your feed names'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Automatic export on saves?'),
                        'name' => 'autoexport_on_save',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                        'desc' => $this->l('When disabled, you have to "Save & Export" manually or run the CRON job, to generate new files.'),
                    ),
                ),
                'description' => $form_desc,
                'submit' => array(
                    'name' => 'submitFluxOptions',
                    'title' => $this->l('Save & Export'),
                ),
            ),
        );

        $orderForm = array(
            'form' => array(
                'legend' => array(
                    'title' => $this->l('Order Parameters'),
                    'icon' => 'icon-cogs',
                ),
                'input' => array(
                    array(
                        'type' => 'select',
                        'label' => $this->l('Select Order Date'),
                        'name' => 'date_range',
                        'required' => true,
                        'options' => array(
                            'query' => array(
                                array('id' => 'last_day', 'name' => $this->l('Last Day')),
                                array('id' => 'last_3_days', 'name' => $this->l('Last 3 Days')),
                                array('id' => 'last_week', 'name' => $this->l('Last Week')),
                                array('id' => 'last_month', 'name' => $this->l('Last Month')),
                                array('id' => 'last_year', 'name' => $this->l('Last Year')),
                                array('id' => 'all_time', 'name' => $this->l('All Time')),
                            ),
                            'id' => 'id', // The key to be used as the option value
                            'name' => 'name', // The key to be used as the option label
                        ),
                        'desc' => $this->l('Select a date range for which orders will be extracted to the XML.'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Automatic export on saves?'),
                        'name' => 'autoexport_on_save',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                        'desc' => $this->l('When disabled, you have to "Save & Export" manually or run the CRON job, to generate new files.'),
                    ),
                ),
                'description' => '', // Add your form description if needed
                'submit' => array(
                    'name' => 'submitFluxOptions',
                    'title' => $this->l('Save & Export'),
                ),
            ),
        );

        if ($formName == 'catalog') {
            return $helper->generateForm(array(
                $catalogForm,
            ));
        } elseif ($formName == 'order') {
            return $helper->generateForm(array(
                $orderForm,
            ));
        }

    }

    public function getConfigFieldsValues($shop_id)
    {
        $shop_group_id = Shop::getGroupFromShop($shop_id);
        $product_type = array();
        $description = 'short';
        $shipping_price_fixed = true;
        $shipping_mode = 'fixed';
        $shipping_price = 0;
        $shipping_country = 'UK';
        $shipping_countries = 'all';
        $img_type = 'large_default';
        $mpn_type = '';
        $gender = '';
        $age_group = '';
        $export_attributes = '';
        $color = array();
        $material = array();
        $pattern = array();
        $size = array();
        $export_min_price = 0;
        $no_gtin = true;
        $shipping_dimension = true;
        $no_brand = true;
        $id_exists_tag = true;
        $export_nap = true;
        $quantity = true;
        $featured_products = true;
        $gen_file_in_root = true;
        $autoexport_on_save = true;
        $file_prefix = "";

        foreach (Language::getLanguages(false) as $lang) {
            $product_type[$lang['id_lang']] = Configuration::get('GS_PRODUCT_TYPE', $lang['id_lang'], $shop_group_id, $shop_id);
        }

        $description = Configuration::get('GS_DESCRIPTION', 0, $shop_group_id, $shop_id);
        $shipping_mode = Configuration::get('GS_SHIPPING_MODE', 0, $shop_group_id, $shop_id);
        $shipping_price_fixed &= (bool) Configuration::get('GS_SHIPPING_PRICE_FIXED', 0, $shop_group_id, $shop_id);
        $shipping_price = (float) Configuration::get('GS_SHIPPING_PRICE', 0, $shop_group_id, $shop_id);
        $shipping_country = Configuration::get('GS_SHIPPING_COUNTRY', 0, $shop_group_id, $shop_id);
        $shipping_countries = explode(';', Configuration::get('GS_SHIPPING_COUNTRIES', 0, $shop_group_id, $shop_id));
        $carriers_excluded = explode(';', Configuration::get('GS_CARRIERS_EXCLUDED', 0, $shop_group_id, $shop_id));
        $img_type = Configuration::get('GS_IMG_TYPE', 0, $shop_group_id, $shop_id);
        $mpn_type = Configuration::get('GS_MPN_TYPE', 0, $shop_group_id, $shop_id);
        $gender = Configuration::get('GS_GENDER', 0, $shop_group_id, $shop_id);
        $age_group = Configuration::get('GS_AGE_GROUP', 0, $shop_group_id, $shop_id);
        $export_attributes = Configuration::get('GS_ATTRIBUTES', 0, $shop_group_id, $shop_id);
        $color = explode(';', Configuration::get('GS_COLOR', 0, $shop_group_id, $shop_id));
        $material = explode(';', Configuration::get('GS_MATERIAL', 0, $shop_group_id, $shop_id));
        $pattern = explode(';', Configuration::get('GS_PATTERN', 0, $shop_group_id, $shop_id));
        $size = explode(';', Configuration::get('GS_SIZE', 0, $shop_group_id, $shop_id));
        $export_min_price = (float) Configuration::get('GS_EXPORT_MIN_PRICE', 0, $shop_group_id, $shop_id);
        $no_gtin &= (bool) Configuration::get('GS_NO_GTIN', 0, $shop_group_id, $shop_id);
        $shipping_dimension &= (bool) Configuration::get('GS_SHIPPING_DIMENSION', 0, $shop_group_id, $shop_id);
        $no_brand &= (bool) Configuration::get('GS_NO_BRAND', 0, $shop_group_id, $shop_id);
        $id_exists_tag &= (bool) Configuration::get('GS_ID_EXISTS_TAG', 0, $shop_group_id, $shop_id);
        $export_nap &= (bool) Configuration::get('GS_EXPORT_NAP', 0, $shop_group_id, $shop_id);
        $quantity &= (bool) Configuration::get('GS_QUANTITY', 0, $shop_group_id, $shop_id);
        $featured_products &= (bool) Configuration::get('GS_FEATURED_PRODUCTS', 0, $shop_group_id, $shop_id);
        $gen_file_in_root &= (bool) Configuration::get('GS_GEN_FILE_IN_ROOT', 0, $shop_group_id, $shop_id);
        $autoexport_on_save &= (bool) Configuration::get('GS_AUTOEXPORT_ON_SAVE', 0, $shop_group_id, $shop_id);
        $file_prefix = Configuration::get('GS_FILE_PREFIX', 0, $shop_group_id, $shop_id);

        return array(
            'product_type[]' => $product_type,
            'description' => $description,
            'shipping_mode' => $shipping_mode,
            'shipping_price_fixed' => (int) $shipping_price_fixed,
            'shipping_price' => (float) $shipping_price,
            'shipping_country' => $shipping_country,
            'shipping_countries[]' => $shipping_countries,
            'carriers_excluded[]' => $carriers_excluded,
            'img_type' => $img_type,
            'mpn_type' => $mpn_type,
            'gender' => $gender,
            'age_group' => $age_group,
            'export_attributes' => (int) $export_attributes,
            'color[]' => $color,
            'material[]' => $material,
            'pattern[]' => $pattern,
            'size[]' => $size,
            'export_min_price' => (float) $export_min_price,
            'no_gtin' => (int) $no_gtin,
            'shipping_dimension' => (int) $shipping_dimension,
            'no_brand' => (int) $no_brand,
            'id_exists_tag' => (int) $id_exists_tag,
            'export_nap' => (int) $export_nap,
            'quantity' => (int) $quantity,
            'featured_products' => (int) $featured_products,
            'gen_file_in_root' => (int) $gen_file_in_root,
            'file_prefix' => $file_prefix,
            'autoexport_on_save' => (int) $autoexport_on_save,
        );
    }

    public function renderCategForm()
    {
        $helper = new HelperForm();
        $helper->show_toolbar = false;
        $helper->module = $this;
        $helper->table = $this->table;
        $helper->default_form_language = (int) $this->context->language->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') ? Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') : 0;
        $this->fields_form = array();
        $helper->identifier = $this->identifier;
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false) . '&configure=' . $this->name . '&tab_module=' . $this->tab . '&module_name=' . $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $back_url = $helper->currentIndex . '&token=' . $helper->token;
        $helper->fields_value = $this->getGCategFieldsValues();
        $helper->languages = $this->context->controller->getLanguages();
        $helper->tpl_vars = array(
            'back_url' => $back_url,
            'show_cancel_button' => true,
        );
        $id_lang = $this->context->language->id;
        $id_shop = $this->context->shop->id;

        $conditions = array(
            array(
                'id_cond' => '',
                'name' => $this->l('Default'),
            ),
            array(
                'id_cond' => 'new',
                'name' => $this->l('Category\'s products are new'),
            ),
            array(
                'id_cond' => 'used',
                'name' => $this->l('Category\'s products are used'),
            ),
            array(
                'id_cond' => 'refurbished',
                'name' => $this->l('Category\'s products are refurbished'),
            ),
        );
        $avail_modes = array(
            array(
                'id_mode' => '',
                'name' => $this->l('Default'),
            ),
            array(
                'id_mode' => 'in stock',
                'name' => $this->l('Category\'s products are in stock'),
            ),
            array(
                'id_mode' => 'preorder',
                'name' => $this->l('Category\'s products avail. on preorder'),
            ),
        );
        $gender_modes = array(
            array(
                'id' => '',
                'name' => $this->l('Default'),
            ),
            array(
                'id' => 'male',
                'name' => $this->l('Category\'s products are for men'),
            ),
            array(
                'id' => 'female',
                'name' => $this->l('Category\'s products are for women'),
            ),
            array(
                'id' => 'unisex',
                'name' => $this->l('Category\'s products are unisex'),
            ),
        );
        $age_modes = array(
            array(
                'id' => '',
                'name' => $this->l('Default'),
            ),
            array(
                'id' => 'newborn',
                'name' => $this->l('Newborn'),
            ),
            array(
                'id' => 'infant',
                'name' => $this->l('Infant'),
            ),
            array(
                'id' => 'toddler',
                'name' => $this->l('Toddler'),
            ),
            array(
                'id' => 'kids',
                'name' => $this->l('Kids'),
            ),
            array(
                'id' => 'adult',
                'name' => $this->l('Adult'),
            ),
        );
        $attributes = array(
            array(
                'id_attribute_group' => '',
                'name' => $this->l('Products attribute doesn\'t exist'),
            ),
        );
        $attributes = array_merge($attributes, $this->getShopAttributes($id_lang, $id_shop));
        $gcat_desc = '<a href="http://www.google.com/support/merchants/bin/answer.py?answer=160081&query=product_type" target="_blank">' . $this->l('See Google Categories') . '</a> ';
        $form_desc = html_entity_decode($this->l('Default: System tries to get the value of the product attribute. If not found, system tries to get the category\'s attribute value. <br> If not found, it tries to get the parent category\'s attribute, and so till the root category. At last, if empty, value is not exported.'));

        $fields_form = array(
            'form' => array(
                'legend' => array(
                    'title' => ((Tools::getIsset('updategshoppingflux') || Tools::getIsset('statusgshoppingflux')) && !Tools::getValue('updategshoppingflux')) ? $this->l('Update the matching Google category') : $this->l('Add a new Google category'),
                    'icon' => 'icon-link',
                ),
                'input' => array(
                    array(
                        'type' => 'free',
                        'label' => $this->l('Category'),
                        'name' => 'breadcrumb',
                    ),
                    array(
                        'type' => 'text',
                        'label' => $this->l('Matching Google category'),
                        'name' => 'gcategory',
                        'lang' => true,
                        'desc' => $gcat_desc,
                    ),
                    array(
                        'type' => 'switch',
                        'name' => 'export',
                        'label' => $this->l('Export products from this category'),
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Condition'),
                        'name' => 'condition',
                        'default_value' => $helper->fields_value['condition'],
                        'options' => array(
                            'query' => $conditions,
                            'id' => 'id_cond',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Products\' availability'),
                        'name' => 'availability',
                        'default_value' => $helper->fields_value['availability'],
                        'options' => array(
                            'query' => $avail_modes,
                            'id' => 'id_mode',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Gender attribute'),
                        'name' => 'gender',
                        'default_value' => $helper->fields_value['gender'],
                        'options' => array(
                            'query' => $gender_modes,
                            'id' => 'id',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'label' => $this->l('Age group'),
                        'name' => 'age_group',
                        'default_value' => $helper->fields_value['age_group'],
                        'options' => array(
                            'query' => $age_modes,
                            'id' => 'id',
                            'name' => 'name',
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Products color attribute'),
                        'name' => 'color[]',
                        'default_value' => $helper->fields_value['color[]'],
                        'options' => array(
                            'query' => $attributes,
                            'id' => 'id_attribute_group',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('Hold [Ctrl] key pressed to select multiple color attributes.'),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Products material attribute'),
                        'name' => 'material[]',
                        'default_value' => $helper->fields_value['material[]'],
                        'options' => array(
                            'query' => $attributes,
                            'id' => 'id_attribute_group',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('Hold [Ctrl] key pressed to select multiple material attributes.'),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Products pattern attribute'),
                        'name' => 'pattern[]',
                        'default_value' => $helper->fields_value['pattern[]'],
                        'options' => array(
                            'query' => $attributes,
                            'id' => 'id_attribute_group',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('Hold [Ctrl] key pressed to select multiple pattern attributes.'),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Products size attribute'),
                        'name' => 'size[]',
                        'default_value' => $helper->fields_value['size[]'],
                        'options' => array(
                            'query' => $attributes,
                            'id' => 'id_attribute_group',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('Hold [Ctrl] key pressed to select multiple size attributes.'),
                    ),
                ),
                'description' => $form_desc,
                'submit' => array(
                    'name' => 'submitCategory',
                    'title' => $this->l('Save'),
                ),
            ),
        );

        if ((Tools::getIsset('updategshoppingflux') || Tools::getIsset('statusgshoppingflux')) && !Tools::getValue('updategshoppingflux')) {
            $fields_form['form']['submit'] = array(
                'name' => 'updateCategory',
                'title' => $this->l('Update'),
            );
        }

        if (Tools::isSubmit('updategshoppingflux') || Tools::isSubmit('statusgshoppingflux')) {
            $fields_form['form']['input'][] = array(
                'type' => 'hidden',
                'name' => 'updatecateg',
            );
            $fields_form['form']['input'][] = array(
                'type' => 'hidden',
                'name' => 'id_gcategory',
            );
            $helper->fields_value['updatecateg'] = '';
        }

        return $helper->generateForm(
            array(
                $fields_form,
            )
        );
    }

    public function getGCategFieldsValues()
    {
        $gcatexport_active = '';
        $gcatcondition_edit = '';
        $gcatavail_edit = '';
        $gcatgender_edit = '';
        $gcatage_edit = '';
        $gcatcolor_edit = '';
        $gcatmaterial_edit = '';
        $gcatpattern_edit = '';
        $gcatsize_edit = '';
        $gcategory_edit = '';
        $gcatlabel_edit = '';

        if (Tools::isSubmit('updategshoppingflux') || Tools::isSubmit('statusgshoppingflux')) {
            $id_lang = $this->context->cookie->id_lang;
            $gcateg = GCategories::getCategLang(Tools::getValue('id_gcategory'), (int) Shop::getContextShopID(), $id_lang);

            foreach ($gcateg['gcategory'] as $key => $categ) {
                $gcateg['gcategory'][$key] = Tools::htmlentitiesDecodeUTF8($categ);
            }

            $gcatexport_active = $gcateg['export'];
            $gcatcondition_edit = $gcateg['condition'];
            $gcatavail_edit = $gcateg['availability'];
            $gcatgender_edit = $gcateg['gender'];
            $gcatage_edit = $gcateg['age_group'];
            $gcatcolor_edit = $gcateg['color'];
            $gcatmaterial_edit = $gcateg['material'];
            $gcatpattern_edit = $gcateg['pattern'];
            $gcatsize_edit = $gcateg['size'];
            $gcategory_edit = $gcateg['gcategory'];
            $gcatlabel_edit = $gcateg['breadcrumb'];
        }

        $fields_values = array(
            'id_gcategory' => Tools::getValue('id_gcategory'),
            'breadcrumb' => (isset($gcatlabel_edit) ? $gcatlabel_edit : ''),
            'export' => Tools::getValue('export', isset($gcatexport_active) ? $gcatexport_active : ''),
            'condition' => Tools::getValue('condition', isset($gcatcondition_edit) ? $gcatcondition_edit : ''),
            'availability' => Tools::getValue('availability', isset($gcatavail_edit) ? $gcatavail_edit : ''),
            'gender' => Tools::getValue('gender', isset($gcatgender_edit) ? $gcatgender_edit : ''),
            'age_group' => Tools::getValue('age_group', isset($gcatage_edit) ? $gcatage_edit : ''),
            'color[]' => explode(';', Tools::getValue('color[]', isset($gcatcolor_edit) ? $gcatcolor_edit : '')),
            'material[]' => explode(';', Tools::getValue('material[]', isset($gcatmaterial_edit) ? $gcatmaterial_edit : '')),
            'pattern[]' => explode(';', Tools::getValue('pattern[]', isset($gcatpattern_edit) ? $gcatpattern_edit : '')),
            'size[]' => explode(';', Tools::getValue('size[]', isset($gcatsize_edit) ? $gcatsize_edit : '')),
        );

        if (Tools::getValue('submitAddmodule')) {
            foreach (Language::getLanguages(false) as $lang) {
                $fields_values['gcategory'][$lang['id_lang']] = '';
            }
        } else {
            foreach (Language::getLanguages(false) as $lang) {
                $fields_values['gcategory'][$lang['id_lang']] = Tools::getValue('gcategory_' . (int) $lang['id_lang'], isset($gcategory_edit[$lang['id_lang']]) ? html_entity_decode($gcategory_edit[$lang['id_lang']]) : '');
            }
        }

        return $fields_values;
    }
    public function getGLangFieldsValues()
    {
        $glangcurrency_edit = '';
        $glangexport_active = '';

        if (Tools::isSubmit('updategshoppingflux_lc') || Tools::isSubmit('statusgshoppingflux_lc')) {
            $glang = GLangAndCurrency::getLangCurrencies(Tools::getValue('id_glang'), (int) Shop::getContextShopID());
            $glangcurrency_edit = explode(';', $glang[0]['id_currency']);
            $glangtax_included = $glang[0]['tax_included'];
            $glangexport_active = $glang[0]['active'];
        }
        $language = Language::getLanguage(Tools::getValue('id_glang'));
        $fields_values = array(
            'id_glang' => Tools::getValue('id_glang'),
            'name' => $language['name'],
            'iso_code' => $language['iso_code'],
            'language_code' => $language['language_code'],
            'currencies[]' => Tools::getValue('currencies[]', $glangcurrency_edit),
            'tax_included' => Tools::getValue('tax_included', $glangtax_included),
            'active' => Tools::getValue('active', $glangexport_active),
        );

        return $fields_values;
    }

    public function renderLangForm()
    {
        $this->fields_form = array();
        $helper = new HelperForm();
        $helper->show_toolbar = false;
        $helper->module = $this;
        $helper->table = 'gshoppingflux_lc';
        $helper->default_form_language = (int) $this->context->language->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') ? Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') : 0;
        $helper->identifier = $this->identifier;
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false) . '&configure=' . $this->name . '&tab_module=' . $this->tab . '&module_name=' . $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $back_url = $helper->currentIndex . '&token=' . $helper->token;
        $helper->fields_value = $this->getGLangFieldsValues();
        $helper->tpl_vars = array(
            'back_url' => $back_url,
            'show_cancel_button' => true,
        );
        $currencies = Currency::getCurrencies();

        $form_desc = html_entity_decode($this->l('Select currency to export with this language.'));

        $fields_form = array(
            'form' => array(
                'legend' => array(
                    'title' => $this->l('Language export settings'),
                    'icon' => 'icon-globe',
                ),
                'input' => array(
                    array(
                        'type' => 'free',
                        'label' => $this->l('Language'),
                        'name' => 'name',
                    ),
                    array(
                        'type' => 'free',
                        'label' => $this->l('Language code'),
                        'name' => 'language_code',
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Enabled'),
                        'name' => 'active',
                        'is_bool' => true,
                        'disabled' => true,
                        'values' => array(
                            array(
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                    ),
                    array(
                        'type' => 'select',
                        'multiple' => true,
                        'label' => $this->l('Currencies'),
                        'name' => 'currencies[]',
                        'default_value' => $helper->fields_value['currencies[]'],
                        'options' => array(
                            'query' => $currencies,
                            'id' => 'id_currency',
                            'name' => 'name',
                        ),
                        'desc' => $this->l('Hold [Ctrl] key pressed to select multiple currencies.'),
                    ),
                    array(
                        'type' => 'switch',
                        'label' => $this->l('Prices exported tax included'),
                        'name' => 'tax_included',
                        'is_bool' => true,
                        'values' => array(
                            array(
                                'id' => 'inc_tax',
                                'value' => 1,
                                'label' => $this->l('Enabled'),
                            ),
                            array(
                                'id' => 'ex_tax',
                                'value' => 0,
                                'label' => $this->l('Disabled'),
                            ),
                        ),
                        'desc' => $this->l('If disabled, prices are exported ex tax.'),
                    ),
                ),
                'description' => $form_desc,
                'submit' => array(
                    'name' => 'submitCategory',
                    'title' => $this->l('Save'),
                ),
            ),
        );

        if ((Tools::getIsset('updategshoppingflux_lc') || Tools::getIsset('statusgshoppingflux_lc')) && !Tools::getValue('updategshoppingflux_lc')) {
            $fields_form['form']['submit'] = array(
                'name' => 'updateLanguage',
                'title' => $this->l('Update'),
            );
        }

        if (Tools::isSubmit('updategshoppingflux_lc') || Tools::isSubmit('statusgshoppingflux_lc')) {
            $fields_form['form']['input'][] = array(
                'type' => 'hidden',
                'name' => 'updatelang',
            );
            $fields_form['form']['input'][] = array(
                'type' => 'hidden',
                'name' => 'id_glang',
            );
            $helper->fields_value['updatelang'] = '';
        }

        return $helper->generateForm(
            array(
                $fields_form,
            )
        );
    }

    public function renderLangList()
    {
        $fields_list = array(
            'id_glang' => array(
                'title' => $this->l('ID'),
            ),
            'flag' => array(
                'title' => $this->l('Flag'),
                'image' => 'l',
            ),
            'name' => array(
                'title' => $this->l('Language'),
            ),
            'language_code' => array(
                'title' => $this->l('Language code'),
                'align' => 'center',
                'class' => 'fixed-width-xs',
            ),
            'currency' => array(
                'title' => $this->l('Currency'),
            ),
            'tax_included' => array(
                'title' => $this->l('Tax'),
            ),
            'active' => array(
                'title' => $this->l('Enabled'),
                'align' => 'center',
                'active' => 'status',
                'type' => 'bool',
                'class' => 'fixed-width-sm',
            ),
        );

        if (Configuration::get('PS_MULTISHOP_FEATURE_ACTIVE') && count(Shop::getShops(true, null, true)) > 1) {
            $fields_list = array_merge($fields_list, array(
                'shop_name' => array(
                    'title' => $this->l('Shop name'),
                    'width' => '15%',
                ),
            ));
        }

        $form_desc = 'Export currencies you need with the language you want.';

        $helper = new HelperList();
        $helper->shopLinkType = '';
        $helper->show_toolbar = false;
        $helper->simple_header = true;
        $helper->identifier = 'id_glang';
        $helper->imageType = 'jpg';
        $helper->table = 'gshoppingflux_lc';
        $helper->actions = array(
            'edit',
        );
        $helper->title = $this->l('Export languages and currencies');
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;
        $helper->tpl_vars = array(
            'languages' => $this->context->controller->getLanguages(),
        );
        $glangflux = GLangAndCurrency::getAllLangCurrencies(0);
        foreach ($glangflux as $k => $v) {
            $currencies = explode(';', $glangflux[$k]['id_currency']);
            $arrCurr = array();
            foreach ($currencies as $idc) {
                $currency = new Currency($idc);
                $arrCurr[] = $currency->iso_code;
            }
            if (Configuration::get('PS_MULTISHOP_FEATURE_ACTIVE')) {
                $shop = Shop::getShop($glangflux[$k]['id_shop']);
                $glangflux[$k]['shop_name'] = $shop['name'];
            }
            $glangflux[$k]['currency'] = implode(' - ', $arrCurr);
            if ($glangflux[$k]['tax_included'] == 1) {
                $glangflux[$k]['tax_included'] = $this->l('Inc Tax ');
            } else {
                $glangflux[$k]['tax_included'] = $this->l('Ex Tax');
            }
        }

        return $helper->generateList($glangflux, $fields_list);
    }

    public function renderCategList()
    {
        $gcategories = $this->makeCatTree();

        $fields_list = array(
            'id_gcategory' => array(
                'title' => $this->l('ID'),
            ),
        );

        if (Configuration::get('PS_MULTISHOP_FEATURE_ACTIVE') && count(Shop::getShops(true, null, true)) > 1) {
            $fields_list = array_merge($fields_list, array(
                'shop_name' => array(
                    'title' => $this->l('Shop name'),
                    'width' => '15%',
                ),
            ));
        }

        $form_desc = 'If all your products match the same Google category, you can attach it to your home category, sub-categories will automatically get the same setting. Products in categories with no Google category specified are exported in the same place than the one from parent categories.';

        $fields_list = array_merge($fields_list, array(
            'gcat_name' => array(
                'title' => $this->l('Category'),
                'width' => '30%',
            ),
            'gcategory' => array(
                'title' => $this->l('Matching Google category'),
                'width' => '70%',
            ),
            'condition' => array(
                'title' => $this->l('Condit.'),
            ),
            'availability' => array(
                'title' => $this->l('Avail.'),
            ),
            'gender' => array(
                'title' => $this->l('Gender'),
            ),
            'age_group' => array(
                'title' => $this->l('Age'),
            ),
            'gid_colors' => array(
                'title' => $this->l('Color'),
            ),
            'gid_materials' => array(
                'title' => $this->l('Material'),
            ),
            'gid_patterns' => array(
                'title' => $this->l('Pattern'),
            ),
            'gid_sizes' => array(
                'title' => $this->l('Size'),
            ),
            'export' => array(
                'title' => $this->l('Export'),
                'align' => 'center',
                'is_bool' => true,
                'active' => 'status',
            ),
        ));

        $helper = new HelperList();
        $helper->shopLinkType = '';
        $helper->simple_header = true;
        $helper->identifier = 'id_gcategory';
        $helper->table = 'gshoppingflux';
        $helper->actions = array(
            'edit',
        );
        $helper->show_toolbar = false;
        $helper->module = $this;
        $helper->title = $this->l('Google categories');
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;

        return $helper->generateList($gcategories, $fields_list);
    }

    public function renderInfo($formName)
    {
        $helper = new HelperForm();
        $helper->show_toolbar = false;
        $helper->table = $this->table;
        $helper->languages = $this->context->controller->getLanguages();
        $helper->default_form_language = (int) $this->context->language->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') ? Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG') : 0;
        $this->fields_form = array();
        $helper->identifier = $this->identifier;
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false) . '&configure=' . $this->name . '&tab_module=' . $this->tab . '&module_name=' . $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');

        // Get active langs on shop
        $languages = GLangAndCurrency::getAllLangCurrencies(1);
        $shops = Shop::getShops(true, null, true);
        $output = '';
        $get_file_url = [];


        $lang = Context::getContext()->language;
        $currency = Context::getContext()->currency;

        // Check if the formName is "catalog" or "order"
        if ($formName == "catalog") {
            // Check if the file should be generated in the root
            if (Configuration::get('GS_GEN_FILE_IN_ROOT', 0, $this->context->shop->id_shop_group, $this->context->shop->id) == 1) {
                // Generate the file URLs for products, categories, and brands using system language and currency
                $get_file_url[] = $this->uri . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $this->context->shop->id, 'elevok-products');
                $get_file_url[] = $this->uri . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $this->context->shop->id, 'elevok-categories');
                $get_file_url[] = $this->uri . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $this->context->shop->id, 'elevok-brands');
            } else {
                // Generate the file URLs for products, categories, and brands in the export folder
                $get_file_url[] = $this->uri . 'modules/' . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $this->context->shop->id, 'elevok-products');
                $get_file_url[] = $this->uri . 'modules/' . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $this->context->shop->id, 'elevok-categories');
                $get_file_url[] = $this->uri . 'modules/' . $this->_getOutputFileName($lang->iso_code, $currency->iso_code, $this->context->shop->id, 'elevok-brands');
            }
        } elseif ($formName == "order") {
            // Generate order file URLs based on system language and currency
            if (Configuration::get('GS_GEN_FILE_IN_ROOT', 0, $this->context->shop->id_shop_group, $this->context->shop->id) == 1) {
                $get_file_url[] = $this->uri . $this->_getOutputFileNameOrders($lang->iso_code, $currency->iso_code, $this->context->shop->id);
            } else {
                $get_file_url[] = $this->uri . 'modules/' . $this->_getOutputFileNameOrders($lang->iso_code, $currency->iso_code, $this->context->shop->id);
            }
        }

        // Output the file URLs
        foreach ($get_file_url as $file_url) {
            $output .= '<a href="' . htmlspecialchars($file_url) . '">' . htmlspecialchars($file_url) . '</a> <br />';
        }

        $info_cron = '<a href="' . $this->uri . 'modules/' . '/cron.php" target="_blank">' . $this->uri . 'modules/' . '/cron.php</a>';

        if (count($languages) > 1) {
            $files_desc = $this->l('Configure these URLs in your Google Merchant Center account.');
        } else {
            $files_desc = $this->l('Configure this URL in your Google Merchant Center account.');
        }

        $cron_desc = $this->l('Install a CRON task to update the feed frequently.');

        if (count($shops) > 1) {
            $cron_desc .= ' ' . $this->l('Please note that as multishop feature is active, you\'ll have to install several CRON tasks, one for each shop.');
        }

        $form_desc = $this->l('Report bugs and find help on forum: <a href="https://diktup.com/" target="_blank">https://diktup.com/</a>');
        $helper->fields_value = array(
            'info_files' => $output,
            'info_cron' => $info_cron,
        );

        $fields_form = array(
            'form' => array(
                'legend' => array(
                    'title' => $this->l('Files information'),
                    'icon' => 'icon-info',
                ),
                'input' => array(
                    array(
                        'type' => 'free',
                        'label' => $this->l('Generated files links:'),
                        'name' => 'info_files',
                        'desc' => $files_desc,
                    ),
                    array(
                        'type' => 'free',
                        'label' => $this->l('Automatic files generation:'),
                        'name' => 'info_cron',
                        'desc' => $cron_desc,
                    ),
                ),
                'description' => html_entity_decode($form_desc, self::REPLACE_FLAGS, self::CHARSET),
            ),
        );

        return $helper->generateForm(array(
            $fields_form,
        ));
    }

    public function customGetNestedCategories($shop_id, $root_category = null, $id_lang = false, $active = true, $groups = null, $use_shop_restriction = true, $sql_filter = '', $sql_sort = '', $sql_limit = '')
    {
        if (isset($root_category) && !Validate::isInt($root_category)) {
            die(Tools::displayError());
        }

        if (!Validate::isBool($active)) {
            die(Tools::displayError());
        }

        if (isset($groups) && Group::isFeatureActive() && !is_array($groups)) {
            $groups = (array) $groups;
        }

        $cache_id = 'Category::getNestedCategories_' . md5((int) $shop_id . (int) $root_category . (int) $id_lang . (int) $active . (int) $active . (isset($groups) && Group::isFeatureActive() ? implode('', $groups) : ''));
        if (!Cache::isStored($cache_id)) {
            $result = Db::getInstance()->executeS('
				SELECT c.*, cl.`name` as gcat_name, g.*, gl.*, s.name as shop_name
				FROM `' . _DB_PREFIX_ . 'category` c
				INNER JOIN `' . _DB_PREFIX_ . 'category_shop` cs ON (cs.`id_category` = c.`id_category` AND cs.`id_shop` = "' . (int) $shop_id . '")
				LEFT JOIN `' . _DB_PREFIX_ . 'category_lang` cl ON c.`id_category` = cl.`id_category` AND cl.`id_shop` = "' . (int) $shop_id . '"
				LEFT JOIN `' . _DB_PREFIX_ . 'gshoppingflux` g ON g.`id_gcategory` = c.`id_category` AND g.`id_shop` = "' . (int) $shop_id . '"
				LEFT JOIN `' . _DB_PREFIX_ . 'gshoppingflux_lang` gl ON gl.`id_gcategory` = c.`id_category` AND gl.`id_shop` = "' . (int) $shop_id . '"
				LEFT JOIN ' . _DB_PREFIX_ . 'shop s ON s.`id_shop` = "' . (int) $shop_id . '"
				WHERE 1 ' . $sql_filter . ' ' . ($id_lang ? 'AND cl.`id_lang` = ' . (int) $id_lang . ' AND gl.`id_lang` = ' . (int) $id_lang : '')
                . ($active ? ' AND c.`active` = 1' : '')
                . (isset($groups) && Group::isFeatureActive() ? ' AND cg.`id_group` IN (' . implode(',', $groups) . ')' : '')
                . (!$id_lang || (isset($groups) && Group::isFeatureActive()) ? ' GROUP BY c.`id_category`' : '')
                . ($sql_sort != '' ? $sql_sort : ' ORDER BY c.`level_depth` ASC')
                . ($sql_sort == '' && $use_shop_restriction ? ', cs.`position` ASC' : '')
                . ($sql_limit != '' ? $sql_limit : ''));

            $attributes = $this->getShopAttributes($this->context->language->id, $this->context->shop->id);

            foreach ($result as $k => $cat) {
                $result[$k]['gcategory'] = html_entity_decode($result[$k]['gcategory']);
                $gid_colors = array();
                $gid_materials = array();
                $gid_patterns = array();
                $gid_sizes = array();

                if ($result[$k]['level_depth'] > 0) {
                    $tree = ' > ';
                    $str = '';
                    for ($i = 0; $i < $result[$k]['level_depth'] - 1; ++$i) {
                        $str .= $tree;
                    }

                    $result[$k]['gcat_name'] = $str . ' ' . $result[$k]['gcat_name'];
                    $shop_group_id = Shop::getGroupFromShop($shop_id);

                    $result[$k]['color'] = explode(';', $result[$k]['color']);
                    foreach ($result[$k]['color'] as $a => $v) {
                        $key = array_search($v, array_column($attributes, 'id_attribute_group'));
                        if ($key !== false) {
                            $gid_colors[] = $attributes[$key]['name'];
                        }
                    }
                    $result[$k]['material'] = explode(';', $result[$k]['material']);
                    foreach ($result[$k]['material'] as $a => $v) {
                        $key = array_search($v, array_column($attributes, 'id_attribute_group'));
                        if ($key !== false) {
                            $gid_materials[] = $attributes[$key]['name'];
                        }
                    }

                    $result[$k]['pattern'] = explode(';', $result[$k]['pattern']);
                    foreach ($result[$k]['pattern'] as $a => $v) {
                        $key = array_search($v, array_column($attributes, 'id_attribute_group'));
                        if ($key !== false) {
                            $gid_patterns[] = $attributes[$key]['name'];
                        }
                    }

                    $result[$k]['size'] = explode(';', $result[$k]['size']);
                    foreach ($result[$k]['size'] as $a => $v) {
                        $key = array_search($v, array_column($attributes, 'id_attribute_group'));
                        if ($key !== false) {
                            $gid_sizes[] = $attributes[$key]['name'];
                        }
                    }

                    $result[$k]['gid_colors'] = implode(' ; ', $gid_colors);
                    $result[$k]['gid_materials'] = implode(' ; ', $gid_materials);
                    $result[$k]['gid_patterns'] = implode(' ; ', $gid_patterns);
                    $result[$k]['gid_sizes'] = implode(' ; ', $gid_sizes);
                }
            }

            $categories = array();
            $buff = array();

            if (!isset($root_category)) {
                $root_category = 1;
            }

            foreach ($result as $row) {
                $current = &$buff[$row['id_category']];
                $current = $row;

                if ($row['id_category'] == $root_category) {
                    $categories[$row['id_category']] = &$current;
                } else {
                    $buff[$row['id_parent']]['children'][$row['id_category']] = &$current;
                }
            }

            Cache::store($cache_id, $categories);
        }

        return Cache::retrieve($cache_id);
    }

    public function makeCatTree($id_cat = 0, $catlist = 0)
    {
        $id_lang = (int) $this->context->language->id;
        $id_shop = (int) Shop::getContextShopID();
        $sql_filter = '';
        $sql_sort = '';
        $sql_limit = '';

        if ($id_cat == 0 && $catlist == 0) {
            $catlist = array();
            $shop = new Shop($id_shop);
            $id_cat = Category::getRootCategory($id_lang, $shop);
            $id_cat = $id_cat->id_category;
            $sql_limit = ';';
        }

        $category = new Category((int) $id_cat, (int) $id_lang);

        if (Validate::isLoadedObject($category)) {
            $tabcat = $this->customGetNestedCategories($id_shop, $id_cat, $id_lang, true, $this->user_groups, true, $sql_filter, $sql_sort, $sql_limit);
            $catlist = array_merge($catlist, $tabcat);
        }

        foreach ($tabcat as $k => $c) {
            if (!empty($c['children'])) {
                foreach ($c['children'] as $j) {
                    $catlist = $this->makeCatTree($j['id_category'], $catlist);
                }
            }
        }

        return $catlist;
    }

    public function getGCategValues($id_lang, $id_shop)
    {
        // Get categories' export values, or it's parents ones :
        // Matching Google category, condition, availability, gender, age_group...
        $sql = 'SELECT k.*, g.*, gl.*
		FROM ' . _DB_PREFIX_ . 'category k
		LEFT JOIN ' . _DB_PREFIX_ . 'gshoppingflux g ON (g.id_gcategory=k.id_category AND g.id_shop=' . $id_shop . ')
		LEFT JOIN ' . _DB_PREFIX_ . 'gshoppingflux_lang gl ON (gl.id_gcategory=k.id_category AND gl.id_lang = ' . (int) $id_lang . ' AND gl.id_shop=' . (int) $id_shop . ')
		WHERE g.id_shop = ' . (int) $id_shop;

        $ret = Db::getInstance()->executeS($sql);
        $shop = new Shop($id_shop);
        $root = Category::getRootCategory($id_lang, $shop);

        foreach ($ret as $cat) {
            $parent_id = $cat['id_category'];
            $gcategory = $cat['gcategory'];
            $condition = $cat['condition'];
            $availability = $cat['availability'];
            $gender = $cat['gender'];
            $age_group = $cat['age_group'];
            $color = $cat['color'];
            $material = $cat['material'];
            $pattern = $cat['pattern'];
            $size = $cat['size'];

            while ((empty($gcategory) || empty($condition) || empty($availability) || empty($gender) || empty($age_group) || empty($color) || empty($material) || empty($pattern) || empty($size)) && $parent_id >= $root->id_category) {
                $parentsql = $sql . ' AND k.id_category = ' . $parent_id . ';';
                $parentret = Db::getInstance()->executeS($parentsql);

                if (!count($parentret)) {
                    break;
                }

                foreach ($parentret as $parentcat) {
                    $parent_id = $parentcat['id_parent'];
                    if (empty($gcategory)) {
                        $gcategory = $parentcat['gcategory'];
                    }
                    if (empty($condition)) {
                        $condition = $parentcat['condition'];
                    }
                    if (empty($availability)) {
                        $availability = $parentcat['availability'];
                    }
                    if (empty($gender)) {
                        $gender = $parentcat['gender'];
                    }
                    if (empty($age_group)) {
                        $age_group = $parentcat['age_group'];
                    }
                    if (empty($color)) {
                        $color = $parentcat['color'];
                    }
                    if (empty($material)) {
                        $material = $parentcat['material'];
                    }
                    if (empty($pattern)) {
                        $pattern = $parentcat['pattern'];
                    }
                    if (empty($size)) {
                        $size = $parentcat['size'];
                    }
                }
            }

            if (!$color && !empty($this->module_conf['color'])) {
                $color = $this->module_conf['color'];
            }
            if (!$material && !empty($this->module_conf['material'])) {
                $material = $this->module_conf['material'];
            }
            if (!$pattern && !empty($this->module_conf['pattern'])) {
                $pattern = $this->module_conf['pattern'];
            }
            if (!$size && !empty($this->module_conf['size'])) {
                $size = $this->module_conf['size'];
            }

            $this->categories_values[$cat['id_category']]['gcategory'] = html_entity_decode($gcategory);
            $this->categories_values[$cat['id_category']]['gcat_condition'] = $condition;
            $this->categories_values[$cat['id_category']]['gcat_avail'] = $availability;
            $this->categories_values[$cat['id_category']]['gcat_gender'] = $gender;
            $this->categories_values[$cat['id_category']]['gcat_age_group'] = $age_group;
            $this->categories_values[$cat['id_category']]['gcat_color'] = explode(';', $color);
            $this->categories_values[$cat['id_category']]['gcat_material'] = explode(';', $material);
            $this->categories_values[$cat['id_category']]['gcat_pattern'] = explode(';', $pattern);
            $this->categories_values[$cat['id_category']]['gcat_size'] = explode(';', $size);
        }
    }

    public function rip_tags($string)
    {
        // ----- remove HTML TAGs -----
        $string = preg_replace('/<[^>]*>/', ' ', $string);

        // ----- remove control characters -----
        $string = str_replace("\r", '', $string); // --- replace with empty space
        $string = str_replace("\n", ' ', $string); // --- replace with space
        $string = str_replace("\t", ' ', $string); // --- replace with space

        // ----- remove multiple spaces -----
        $string = trim(preg_replace('/ {2,}/', ' ', $string));

        return $string;
    }

    public function _getOutputFileName($lang, $curr, $shop, $fileName)
    {
        if (Configuration::get('GS_FILE_PREFIX', '', $this->context->shop->id_shop_group, $this->context->shop->id)) {
            return Configuration::get('GS_FILE_PREFIX', '', $this->context->shop->id_shop_group, $this->context->shop->id) . '_elevok-catalog' . $shop . '-' . $lang . '-' . $curr . '.xml';
        }
        return $fileName  . '.xml';
    }

    public function getShopDescription($id_lang, $id_shop)
    {
        $ret = Db::getInstance()->executeS('
			SELECT ml.description
			FROM ' . _DB_PREFIX_ . 'meta_lang ml
			LEFT JOIN ' . _DB_PREFIX_ . 'meta m ON (m.id_meta = ml.id_meta)
			WHERE m.page="index"
				AND ml.id_shop = ' . (int) $id_shop . '
				AND ml.id_lang = ' . (int) $id_lang);

        return $ret[0]['description'];
    }

    public function generateAllShopsFileList()
    {
        // Get all shops
        $shops = Shop::getShops(true, null, true);
        foreach ($shops as $i => $shop) {
            $ret[$i] = $this->generateShopFileList($shop);
        }

        return $ret;
    }

    public function generateShopFileList($id_shop)
    {
        $ret = [];  // Initialize an empty array to store generated file paths
    
        // Get all shop languages and their currencies
        $languages = GLangAndCurrency::getAllLangCurrencies(1);
    
        foreach ($languages as $lang) {
            $currencies = explode(';', $lang['id_currency']);
    
            // Generate product files for each currency
            foreach ($currencies as $id_curr) {
                $productsFile = $this->generateFileProducts($lang, $id_curr, $id_shop);
                if ($productsFile) {
                    $ret[] = $productsFile;  // Add the product file path to the list
                } else {
                    error_log("Failed to generate product file for lang: {$lang['iso_code']}, currency: $id_curr");
                }
            }
    
            // Generate categories file
            $categoriesFile = $this->generateFileCategories($lang, $id_shop);
            if ($categoriesFile) {
                $ret[] = $categoriesFile;
            } else {
                error_log("Failed to generate categories file for lang: {$lang['iso_code']}");
            }
    
            // Generate brands file
            $brandsFile = $this->generateFileBrands($lang, $id_shop);
            if ($brandsFile) {
                $ret[] = $brandsFile;
            } else {
                error_log("Failed to generate brands file for lang: {$lang['iso_code']}");
            }
        }
    
        return $ret;  // Return the list of generated file paths
    }
    

    public function generateLangFileList($id_lang, $id_shop)
    {
        $ret = []; // Initialize the return array

        // Get all shop languages
        $languages = GLangAndCurrency::getLangCurrencies($id_lang, $id_shop);

        foreach ($languages as $lang) {
            $currencies = explode(';', $lang['id_currency']);

            foreach ($currencies as $id_curr) {
                // Generate Products File
                $productsFile = $this->generateFileProducts($lang, $id_curr, $id_shop);
                if ($productsFile) {
                    $ret['products'][] = $productsFile;
                }

                // Generate Categories File
                $categoriesFile = $this->generateFileCategories($lang, $id_shop);
                if ($categoriesFile) {
                    $ret['categories'][] = $categoriesFile;
                }

                // Generate Brands File
                $brandsFile = $this->generateFileBrands($lang, $id_shop);
                if ($brandsFile) {
                    $ret['brands'][] = $brandsFile;
                }
            }
        }

        return $ret;
    }

    public function generateFileProducts($lang, $id_curr, $id_shop)
    {
        $id_lang = (int) $lang['id_lang'];
        $curr = new Currency($id_curr);
        $this->shop = new Shop($id_shop);
        $root = Category::getRootCategory($id_lang, $this->shop);
        $this->id_root = $root->id_category;

        // Get module configuration for this shop
        $this->module_conf = $this->getConfigFieldsValues($id_shop);

        // Get Google's category values
        $this->getGCategValues($id_lang, $id_shop);

        // Init file path
        $generate_file_path = $this->module_conf['gen_file_in_root']
        ? dirname(__FILE__) . '/../../../' . $this->_getOutputFileName($lang['iso_code'], $curr->iso_code, $id_shop, 'elevok-products')
        : dirname(__FILE__) . '/export/' . $this->_getOutputFileName($lang['iso_code'], $curr->iso_code, $id_shop, 'elevok-products');

        if ($this->shop->name == 'Prestashop') {
            $this->shop->name = Configuration::get('PS_SHOP_NAME');
        }

        // Start the XML file
        $xml_header = '<?xml version="1.0" encoding="' . self::CHARSET . '" ?>' . "\n";
        $xml_header .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
        $xml_header .= '<channel>' . "\n";
        $xml_header .= '<title>' . $this->shop->name . '</title>' . "\n";
        $xml_header .= '<description>' . $this->getShopDescription($id_lang, $id_shop) . '</description>' . "\n";
        $xml_header .= '<link href="' . htmlspecialchars($this->uri, self::REPLACE_FLAGS, self::CHARSET, false) . '" rel="alternate" type="text/html"/>' . "\n";

        // Open file for writing
        $catalogFile = fopen($generate_file_path, 'w');

        // Add UTF-8 byte order mark
        fwrite($catalogFile, pack('CCC', 0xef, 0xbb, 0xbf));

        // Write the XML header
        fwrite($catalogFile, $xml_header);

        // Query products
        $sql = 'SELECT DISTINCT p.*, pl.*, ps.id_category_default as category_default, gc.export, glc.tax_included, gl.* '
            . 'FROM ' . _DB_PREFIX_ . 'product p '
            . 'INNER JOIN ' . _DB_PREFIX_ . 'product_lang pl ON pl.id_product = p.id_product '
            . 'INNER JOIN ' . _DB_PREFIX_ . 'product_shop ps ON ps.id_product = p.id_product '
            . 'INNER JOIN ' . _DB_PREFIX_ . 'category c ON c.id_category = p.id_category_default '
            . 'INNER JOIN ' . _DB_PREFIX_ . 'gshoppingflux gc ON gc.id_gcategory = ps.id_category_default '
            . 'INNER JOIN ' . _DB_PREFIX_ . 'gshoppingflux_lc glc ON glc.`id_glang` = ' . $id_lang . ' '
            . 'INNER JOIN ' . _DB_PREFIX_ . 'gshoppingflux_lang gl ON gl.id_gcategory = ps.id_category_default '
            . 'WHERE `p`.`price` >= 0 AND `c`.`active` = 1 AND `gc`.`export` = 1 '
            . 'AND `pl`.`id_lang` = ' . $id_lang . ' AND `gl`.`id_lang` = ' . $id_lang;

        // Multishop filter
        if (Configuration::get('PS_MULTISHOP_FEATURE_ACTIVE') && count(Shop::getShops(true, null, true)) > 1) {
            $sql .= ' AND `ps`.`active` = 1 AND `gc`.`id_shop` = ' . $id_shop . ' AND `pl`.`id_shop` = ' . $id_shop . ' AND `ps`.`id_shop` = ' . $id_shop . ' AND `gl`.`id_shop` = ' . $id_shop;
        } else {
            $sql .= ' AND `p`.`active` = 1';
        }

        // Check EAN13/UPC
        if ($this->module_conf['no_gtin'] != 1) {
            $sql .= ' AND ( (`p`.`ean13` != "" AND `p`.`ean13` != 0) OR (`p`.`upc` != "" AND `p`.`upc` != 0) )';
        }

        // Check BRAND
        if ($this->module_conf['no_brand'] != 1) {
            $sql .= ' AND `p`.`id_manufacturer` != "" AND `p`.`id_manufacturer` != 0';
        }

        $sql .= ' GROUP BY `p`.`id_product`;';
        $products = Db::getInstance()->ExecuteS($sql);
        $this->nb_total_products = 0;
        $this->nb_not_exported_products = 0;
        $this->nb_combinations = 0;
        $this->nb_prd_w_attr = array();

        // Loop through products and write XML data for each
        foreach ($products as $product) {
            $p = new Product($product['id_product'], true, $id_lang, $id_shop, $this->context);

            $attributesResume = null;
            if ($this->module_conf['export_attributes'] == 1) {
                $attributesResume = $p->getAttributesResume($id_lang);
            }
            $product['gid'] = $product['id_product'];
            $product['color'] = '';
            $product['material'] = '';
            $product['pattern'] = '';
            $product['size'] = '';

            if (is_array($attributesResume) && count($attributesResume) > 0 && $this->module_conf['export_attributes'] == 1) {
                $original_product = $product;
                $categories_value = $this->categories_values[$product['id_gcategory']];
                foreach ($attributesResume as $productCombination) {
                    $product = $original_product;
                    $attributes = $p->getAttributeCombinationsById($productCombination['id_product_attribute'], $id_lang);
                    foreach ($attributes as $a) {
                        if (in_array($a['id_attribute_group'], $categories_value['gcat_color'])) {
                            $product['color'] = $a['attribute_name'];
                        }
                        if (in_array($a['id_attribute_group'], $categories_value['gcat_material'])) {
                            $product['material'] = $a['attribute_name'];
                        }
                        if (in_array($a['id_attribute_group'], $categories_value['gcat_pattern'])) {
                            $product['pattern'] = $a['attribute_name'];
                        }
                        if (in_array($a['id_attribute_group'], $categories_value['gcat_size'])) {
                            $product['size'] = $a['attribute_name'];
                        }
                    }
                    $xml_googleshopping = $this->getItemXML($product, $lang, $id_curr, $id_shop, $productCombination['id_product_attribute']);
                    fwrite($catalogFile, $xml_googleshopping);
                }
                unset($original_product);
            } else {
                $xml_googleshopping = $this->getItemXML($product, $lang, $id_curr, $id_shop);
                fwrite($catalogFile, $xml_googleshopping);
            }
        }

        // Write the closing XML tags after all products are processed
        $xml_footer = '</channel>' . "\n" . '</rss>';
        fwrite($catalogFile, $xml_footer);

        fclose($catalogFile);

        @chmod($generate_file_path, 0777);

        return array(
            'nb_products' => $this->nb_total_products,
            'nb_combinations' => $this->nb_combinations,
            'nb_prod_w_attr' => count($this->nb_prd_w_attr),
            'non_exported_products' => $this->nb_not_exported_products,
        );
    }

    public function generateFileCategories($lang, $id_shop)
    {
        $id_lang = (int) $lang['id_lang'];
        $this->shop = new Shop($id_shop);

        // Get module configuration for this shop
        $this->module_conf = $this->getConfigFieldsValues($id_shop);

        // Init file path
        $generate_file_path = $this->module_conf['gen_file_in_root']
        ? dirname(__FILE__) . '/../../../' . $this->_getOutputFileName($lang['iso_code'], 'category', $id_shop, 'elevok-categories')
        : dirname(__FILE__) . '/export/' . $this->_getOutputFileName($lang['iso_code'], 'category', $id_shop, 'elevok-categories');


        $xml_header = '<?xml version="1.0" encoding="' . self::CHARSET . '" ?>' . "\n";
        $xml_header .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
        $xml_header .= '<channel>' . "\n";
        $xml_header .= '<title>' . $this->shop->name . '</title>' . "\n";
        $xml_header .= '<description>' . $this->getShopDescription($id_lang, $id_shop) . '</description>' . "\n";
        $xml_header .= '<link href="' . htmlspecialchars($this->uri, self::REPLACE_FLAGS, self::CHARSET, false) . '" rel="alternate" type="text/html"/>' . "\n";
        
        // Open file for writing
        $categoryFile = fopen($generate_file_path, 'w');

        // Add UTF-8 byte order mark
        fwrite($categoryFile, pack('CCC', 0xef, 0xbb, 0xbf));

        // Write the XML header
        fwrite($categoryFile, $xml_header);

        // Query categories
        $sql = 'SELECT c.id_category, cl.name, c.id_parent, cl.description, c.active '
            . 'FROM ' . _DB_PREFIX_ . 'category c '
            . 'INNER JOIN ' . _DB_PREFIX_ . 'category_lang cl ON c.id_category = cl.id_category '
            . 'WHERE cl.id_lang = ' . $id_lang . ' AND c.active = 1';

        $categories = Db::getInstance()->ExecuteS($sql);

        // Loop through categories and write XML data for each
        foreach ($categories as $category) {
            $xml_category = '<item>' . "\n"
            . '<id>' . $category['id_category'] . '</id>' . "\n"
            . '<name>' . $category['name'] . '</name>' . "\n"
            . '<parent>' . $category['id_parent'] . '</parent>' . "\n"
            . '<description>' . $category['description'] . '</description>' . "\n"
            . '<deeplink>' . Tools::link_rewrite($category['name']) . '</deeplink>' . "\n"
                . '</item>' . "\n";

            fwrite($categoryFile, $xml_category);
        }

        // Write the closing XML tags after all categories are processed
        $xml_footer = '</channel>' . "\n";  // ONLY include closing </channel>
        $xml_footer .= '</rss>' . "\n";
        fwrite($categoryFile, $xml_footer);

        fclose($categoryFile);

        @chmod($generate_file_path, 0777);

        return array(
            'nb_categories' => count($categories),
        );
    }

    public function generateFileBrands($lang, $id_shop)
    {
        $id_lang = (int) $lang['id_lang'];
        $this->shop = new Shop($id_shop);

        // Get module configuration for this shop
        $this->module_conf = $this->getConfigFieldsValues($id_shop);

        // Init file path
        $generate_file_path = $this->module_conf['gen_file_in_root']
        ? dirname(__FILE__) . '/../../../' . $this->_getOutputFileName($lang['iso_code'], 'brand', $id_shop, 'elevok-brands')
        : dirname(__FILE__) . '/export/' . $this->_getOutputFileName($lang['iso_code'], 'brand', $id_shop, 'elevok-brands');

        // Start the XML file
        $xml_header = '<?xml version="1.0" encoding="' . self::CHARSET . '" ?>' . "\n";
        $xml_header .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
        $xml_header .= '<channel>' . "\n";
        $xml_header .= '<title>' . $this->shop->name . '</title>' . "\n";
        $xml_header .= '<description>' . $this->getShopDescription($id_lang, $id_shop) . '</description>' . "\n";
        $xml_header .= '<link href="' . htmlspecialchars($this->uri, self::REPLACE_FLAGS, self::CHARSET, false) . '" rel="alternate" type="text/html"/>' . "\n";

        // Open file for writing
        $brandFile = fopen($generate_file_path, 'w');

        // Add UTF-8 byte order mark
        fwrite($brandFile, pack('CCC', 0xef, 0xbb, 0xbf));

        // Write the XML header
        fwrite($brandFile, $xml_header);

        // Query brands (manufacturers)
        $sql = 'SELECT m.id_manufacturer, m.name '
            . 'FROM ' . _DB_PREFIX_ . 'manufacturer m '
            . 'WHERE m.active = 1';

        $brands = Db::getInstance()->ExecuteS($sql);

        // Loop through brands and write XML data for each
        foreach ($brands as $brand) {
            $xml_brand = '<item>' . "\n"
                . '<id>' . $brand['id_manufacturer'] . '</id>' . "\n"
                . '<name>' . $brand['name'] . '</name>' . "\n"
                . '</item>' . "\n";

            fwrite($brandFile, $xml_brand);
        }

        // Write the closing XML tags after all brands are processed
        $xml_footer = '</channel>' . "\n";  // ONLY include closing </channel>
        $xml_footer .= '</rss>' . "\n";
        fwrite($brandFile, $xml_footer);

        fclose($brandFile);

        @chmod($generate_file_path, 0777);

        return array(
            'nb_brands' => count($brands),
        );
    }

    public function getProductTaxRate($product)
    {
        $taxRulesGroupId = $product->id_tax_rules_group;
        $address = Address::initialize();
        $taxManager = TaxManagerFactory::getManager($address, $taxRulesGroupId);
        $taxCalculator = $taxManager->getTaxCalculator();
        return (float) $taxCalculator->getTotalRate(); 
    }

    public function getProductTags($id_product, $id_lang)
    {
        $sql = 'SELECT t.name 
                FROM ' . _DB_PREFIX_ . 'tag t
                INNER JOIN ' . _DB_PREFIX_ . 'product_tag pt ON t.id_tag = pt.id_tag
                WHERE pt.id_product = ' . (int)$id_product . ' 
                AND t.id_lang = ' . (int)$id_lang;

        return Db::getInstance()->executeS($sql, true);
    }



    public function getItemXML($product, $lang, $id_curr, $id_shop, $combination = false)
    {
        $xml_googleshopping = '';
        $id_lang = (int) $lang['id_lang'];
        $title_limit = 70;
        $description_limit = 4990;
        $languages = Language::getLanguages();
        $tailleTabLang = sizeof($languages);
        $this->context->language->id = $id_lang;
        $this->context->shop->id = $id_shop;
        $p = new Product($product['id_product'], true, $id_lang, $id_shop, $this->context);

        // Get module configuration for this shop
        if (!$combination) {
            $product['quantity'] = StockAvailable::getQuantityAvailableByProduct($product['id_product'], 0, $id_shop);
        } else {
            $product['quantity'] = StockAvailable::getQuantityAvailableByProduct($product['id_product'], $combination, $id_shop);
        }

        // Exclude non-available products
        if ($this->module_conf['export_nap'] === 0 && ($product['quantity'] < 1 || $product['available_for_order'] == 0)) {
            ++$this->nb_not_exported_products;

            return;
        }

        // Check minimum product price
        $price = Product::getPriceStatic((int) $product['id_product'], true);
        if ((float) $this->module_conf['export_min_price'] > 0 && (float) $this->module_conf['export_min_price'] > (float) $price) {
            return;
        }

        $cat_link_rew = Category::getLinkRewrite($product['id_gcategory'], $id_lang);
        $product_link = $this->context->link->getProductLink((int) ($product['id_product']), $product['link_rewrite'], $cat_link_rew, $product['ean13'], (int) ($product['id_lang']), $id_shop, $combination, null, null, true);

        // Product name
        $title_crop = $product['name'];

        //  Product color attribute, if any
        if (!empty($product['color'])) {
            $title_crop .= ' ' . $product['color'];
        }
        if (!empty($product['material'])) {
            $title_crop .= ' ' . $product['material'];
        }
        if (!empty($product['pattern'])) {
            $title_crop .= ' ' . $product['pattern'];
        }
        if (!empty($product['size'])) {
            $title_crop .= ' ' . $product['size'];
        }

        if (Tools::strlen($product['name']) > $title_limit) {
            $title_crop = Tools::substr($title_crop, 0, ($title_limit - 1));
            $title_crop = Tools::substr($title_crop, 0, strrpos($title_crop, ' '));
        }

        // Description type
        if ($this->module_conf['description'] == 'long') {
            $description_crop = $product['description'];
        } elseif ($this->module_conf['description'] == 'short') {
            $description_crop = $product['description_short'];
        } elseif ($this->module_conf['description'] == 'meta') {
            $description_crop = $product['meta_description'];
        }
        $productId = $product['gid']; // Product ID
        $productObj = new Product($productId);

        $defaultCategoryId = $productObj->id_category_default;
        $description_crop = $this->rip_tags($description_crop);
        $brandId = $productObj->id_manufacturer;
        $brandName = Manufacturer::getNameById($brandId);
        $sku = $productObj->reference;
        $productTags = $this->getProductTags($product['id_product'], $id_lang);
        // Retrieve VAT (tax rate) for the product
        $taxRate = $this->getProductTaxRate($productObj);

        if (Tools::strlen($description_crop) > $description_limit) {
            $description_crop = Tools::substr($description_crop, 0, ($description_limit - 1));
            $description_crop = Tools::substr($description_crop, 0, strrpos($description_crop, ' ')) . ' ...';
        }

        $xml_googleshopping .= '<item>' . "\n";
        $xml_googleshopping .= '<id>' . $product['gid'] . '</id>';
        $xml_googleshopping .= '<name>' . $title_crop . '</name>';
        $xml_googleshopping .= '<category>' . $defaultCategoryId . '</category>' . "\n";
        if ($this->module_conf['no_brand'] != 0 && !empty($product['id_manufacturer'])) {
        $xml_googleshopping .= '<brand>' . $brandId . '</brand>' . "\n";
        }
        $xml_googleshopping .= '<vat>' . $taxRate . '</vat>' . "\n";
        $xml_googleshopping .= '<sku>' . htmlspecialchars($sku, ENT_XML1) . '</sku>' . "\n";


        if (!empty($productTags)) {
            $xml_googleshopping .= '<tags>' . "\n";
            foreach ($productTags as $tag) {
                $xml_googleshopping .= '<tag>' . htmlspecialchars($tag) . '</tag>' . "\n";
            }
            $xml_googleshopping .= '</tags>' . "\n";
        }
        if (!empty($product['condition'])) {
            $xml_googleshopping .= '<condition>' . $product['condition'] . '</condition>' . "\n";
        }
        $xml_googleshopping .= '<status>active</status>';
        $xml_googleshopping .= '<description>' . $description_crop . '</description>';
        $xml_googleshopping .= '<url>' . $product_link . '</url>';
        


        // Image links
        $images = Image::getImages($lang['id_lang'], $product['id_product'], $combination);
        if (count($images) == 0 && $combination != false) {
            $images = Image::getImages($lang['id_lang'], $product['id_product']);
        }
        $indexTabLang = 0;
        if ($tailleTabLang > 1) {
            while (sizeof($images) < 1 && $indexTabLang < $tailleTabLang) {
                if ($languages[$indexTabLang]['id_lang'] != $lang['id_lang']) {
                    $images = Image::getImages($languages[$indexTabLang]['id_lang'], $product['id_product']);
                }

                ++$indexTabLang;
            }
        }
        $nbimages = 0;
        $image_type = $this->module_conf['img_type'];

        if ($image_type == '') {
            $image_type = 'large_default';
        }
        $cover_key = array_search('1', array_column($images, 'cover'));
        $nbimages = 0;
        foreach ($images as $im_key => $im) {
            // Get the product image URL
            $image = $this->context->link->getImageLink($product['link_rewrite'], $im['id_image'], 'large_default');
        
            // Append image to the XML
            $xml_googleshopping .= '<pictures>' . htmlspecialchars($image) . '</pictures>' . "\n";
        
            // Limit the number of images if needed (max 10 in this case)
            if (++$nbimages == 10) {
                break;
            }
        }
        $xml_googleshopping .= '<price>' . $product['price'] . '</price>' . "\n";        
        $xml_googleshopping .= '</item>' . "\n\n";

        if ($combination) {
            ++$this->nb_combinations;
            $this->nb_prd_w_attr[$product['id_product']] = 1;
        }
        ++$this->nb_total_products;

        return $xml_googleshopping;
    }

    public function linkencode($p_url)
    {
        $ta = parse_url($p_url);
        if (!empty($ta['scheme'])) {
            $ta['scheme'] .= '://';
        }
        if (!empty($ta['pass']) and !empty($ta['user'])) {
            $ta['user'] .= ':';
            $ta['pass'] = rawurlencode($ta['pass']) . '@';
        } elseif (!empty($ta['user'])) {
            $ta['user'] .= '@';
        } else {
            $ta['user'] = '';
            $ta['pass'] = '';
        }
        if (!empty($ta['port']) and !empty($ta['host'])) {
            $ta['host'] = '' . $ta['host'] . ':';
        } elseif (!empty($ta['host'])) {
            $ta['host'] = $ta['host'];
            $ta['port'] = '';
        }
        if (!empty($ta['path'])) {
            $tu = '';
            $tok = strtok($ta['path'], "\\/");
            while (strlen($tok)) {
                $tu .= rawurlencode($tok) . '/';
                $tok = strtok("\\/");
            }
            $ta['path'] = '/' . trim($tu, '/');
        }
        if (!empty($ta['query'])) {
            $ta['query'] = '?' . $ta['query'];
        } else {
            $ta['query'] = "";
        }
        if (!empty($ta['fragment'])) {
            $ta['fragment'] = '#' . $ta['fragment'];
        } else {
            $ta['fragment'] = "";
        }
        return implode('', array($ta['scheme'], $ta['user'], $ta['pass'], $ta['host'], $ta['port'], $ta['path'], $ta['query'], $ta['fragment']));

    }

    public function generateShopFileListOrder($id_shop)
    {
        // Get all shop languages
        $languages = GLangAndCurrency::getAllLangCurrencies(1);
        foreach ($languages as $i => $lang) {
            $currencies = explode(';', $lang['id_currency']);
            foreach ($currencies as $id_curr) {
                $ret[] = $this->generateFileOrder($lang, $id_curr, $id_shop);
            }
        }

        return $ret;
    }

    public function generateLangFileListOrder($id_lang, $id_shop)
    {
        // Get all shop languages
        $languages = GLangAndCurrency::getLangCurrencies($id_lang, $id_shop);
        foreach ($languages as $i => $lang) {
            $currencies = explode(';', $lang['id_currency']);
            foreach ($currencies as $id_curr) {
                $ret[] = $this->generateFileOrder($lang, $id_curr, $id_shop);
            }
        }

        return $ret;
    }

    public function generateFileOrder($lang, $id_curr, $id_shop)
    {
        // Initialize variables for language, currency, and shop
        $id_lang = (int) $lang['id_lang'];
        $curr = new Currency($id_curr);
        $this->shop = new Shop($id_shop);

        $this->module_conf = $this->getConfigFieldsValues($id_shop);

        // File path initialization
        $generate_file_path = $this->module_conf['gen_file_in_root']
        ? dirname(__FILE__) . '/../../../' . $this->_getOutputFileNameOrders($lang['iso_code'], $curr->iso_code, $id_shop)
        : dirname(__FILE__) . '/export/' . $this->_getOutputFileNameOrders($lang['iso_code'], $curr->iso_code, $id_shop);

        // Start the XML file
        $xml_header = '<?xml version="1.0" encoding="' . self::CHARSET . '" ?>' . "\n";
        $xml_header .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">' . "\n";
        $xml_header .= '<channel>' . "\n";
        $xml_header .= '<title>' . $this->shop->name . '</title>' . "\n";
        $xml_header .= '<description>' . $this->getShopDescription($id_lang, $id_shop) . '</description>' . "\n";
        $xml_header .= '<link href="' . htmlspecialchars($this->uri, self::REPLACE_FLAGS, self::CHARSET, false) . '" rel="alternate" type="text/html"/>' . "\n";

        // Open file for writing
        $orderFile = fopen($generate_file_path, 'w');

        fwrite($orderFile, pack('CCC', 0xef, 0xbb, 0xbf)); // Add UTF-8 BOM
        fwrite($orderFile, $xml_header); // Write the initial XML structure

        // Fetch orders
        $sql = 'SELECT o.id_order, o.reference, o.date_add, o.total_paid, o.total_shipping, o.id_customer, o.id_currency '
            . 'FROM ' . _DB_PREFIX_ . 'orders o '
            . 'WHERE o.id_shop = ' . $id_shop . ' AND o.current_state != 0';

        $orders = Db::getInstance()->ExecuteS($sql);

        $this->nb_total_orders = 0;
        $this->nb_failed_orders = 0;

        // Loop through each order and append XML data
        foreach ($orders as $order) {
            $this->nb_total_orders++;
            $xml_order = $this->getOrderXML($order, $lang, $id_curr, $id_shop); // No need to pass date_range
            fwrite($orderFile, $xml_order); // Write each order's XML
        }

        // Write the closing XML tags after processing all orders
        $xml_footer = '</channel>' . "\n" . '</rss>';
        fwrite($orderFile, $xml_footer); // Write the closing XML structure

        fclose($orderFile);

        @chmod($generate_file_path, 0777); // Set file permissions

        return array(
            'nb_orders' => $this->nb_total_orders,
            'nb_failed_orders' => $this->nb_failed_orders,
        );
    }

    public function getOrderXML($order, $lang, $id_curr, $id_shop) //RETREIVING THE XML ORDERS
    {
        $xml_orders = '';

        $now = new DateTime();

        switch ($this->date_range) { // Use the class property here
            case 'last_day':
                $start_date = $now->modify('-1 day')->format('Y-m-d H:i:s');
                break;
            case 'last_3_days':
                $start_date = $now->modify('-3 days')->format('Y-m-d H:i:s');
                break;
            case 'last_week':
                $start_date = $now->modify('-1 week')->format('Y-m-d H:i:s');
                break;
            case 'last_month':
                $start_date = $now->modify('-1 month')->format('Y-m-d H:i:s');
                break;
            case 'last_year':
                $start_date = $now->modify('-1 year')->format('Y-m-d H:i:s');
                break;
            case 'all_time':
            default:
                $start_date = null; // No filtering for 'all_time'
                break;
        }

        // Check if the order date is within the selected range
        $o = new Order((int) $order['id_order']);
        if ($start_date && $o->date_add < $start_date) {
            // If the order date is older than the start date, skip this order
            return '';
        }
        $this->orderCount++;

        // Fetch customer and currency details
        $customer = new Customer($o->id_customer);
        $currency = new Currency((int) $o->id_currency);
        $id_lang = (int) $lang['id_lang'];

        // Order reference and date
        $order_reference = $o->reference;
        $order_date = $o->date_add;
        $total_paid = $o->total_paid;
        $total_shipping = $o->total_shipping;

        // XML structure for each order
        $xml_orders .= '<order>' . "\n";
        $xml_orders .= '<order_id>' . $order_reference . '</order_id>' . "\n";
        $xml_orders .= '<order_date>' . $order_date . '</order_date>' . "\n";

        // Customer information
        $xml_orders .= '<customer>' . "\n";
        $xml_orders .= '<customer_id>' . $customer->id . '</customer_id>' . "\n";
        $xml_orders .= '<first_name>' . $customer->firstname . '</first_name>' . "\n";
        $xml_orders .= '<last_name>' . $customer->lastname . '</last_name>' . "\n";
        $xml_orders .= '<email>' . $customer->email . '</email>' . "\n";
        $xml_orders .= '</customer>' . "\n";

        // Ordered products
        $xml_orders .= '<products>' . "\n";
        foreach ($o->getProducts() as $product) {
            $xml_orders .= '<product>' . "\n";
            $xml_orders .= '<product_id>' . $product['product_id'] . '</product_id>' . "\n";
            $xml_orders .= '<product_name>' . $product['product_name'] . '</product_name>' . "\n";
            $xml_orders .= '<product_quantity>' . $product['product_quantity'] . '</product_quantity>' . "\n";
            $xml_orders .= '<product_price>' . $product['total_price_tax_incl'] . ' ' . $currency->iso_code . '</product_price>' . "\n";
            $xml_orders .= '</product>' . "\n";
        }
        $xml_orders .= '</products>' . "\n";

        // Total prices
        $xml_orders .= '<totals>' . "\n";
        $xml_orders .= '<total_paid>' . $total_paid . ' ' . $currency->iso_code . '</total_paid>' . "\n";
        $xml_orders .= '<total_shipping>' . $total_shipping . ' ' . $currency->iso_code . '</total_shipping>' . "\n";
        $xml_orders .= '</totals>' . "\n";

        // Shipping information
        $xml_orders .= '<shipping>' . "\n";
        $xml_orders .= '<shipping_cost>' . $total_shipping . ' ' . $currency->iso_code . '</shipping_cost>' . "\n";
        $xml_orders .= '</shipping>' . "\n";
        $xml_orders .= '</order>' . "\n\n";

        return $xml_orders;
    }

    public function generateXMLFilesOrder($lang_id, $shop_id, $shop_group_id) //GENERATE THE ORDER XML FILE
    {
        // Get languages and generate file list for orders
        if (isset($lang_id) && $lang_id != 0) {
            // Generate order file list for a specific language
            $count = $this->generateLangFileListOrder($lang_id, $shop_id);
            $languages = GLangAndCurrency::getLangCurrencies($lang_id, $shop_id);
        } else {
            // Generate order file list for the entire shop
            $count = $this->generateShopFileListOrder($shop_id);
            $languages = GLangAndCurrency::getAllLangCurrencies(1);
        }


        $language = $this->context->language; 
        $currency = $this->context->currency; 

        if (Configuration::get('GS_GEN_FILE_IN_ROOT', 0, $this->context->shop->id_shop_group, $this->context->shop->id) == 1) {
            $get_file_url = $this->uri . $this->_getOutputFileNameOrders($language->iso_code, $currency->iso_code, $this->context->shop->id);
        } else {
            $get_file_url = $this->uri . 'modules/elevokwidget/' . $this->name . '/export/' . $this->_getOutputFileNameOrders($language->iso_code, $currency->iso_code, $this->context->shop->id);
        }

        // Confirmation message for exported orders
        $this->confirm .= '<br /> <a href="' . $get_file_url . '" target="_blank">' . $get_file_url . '</a> : ' 
            . $this->l('Orders exported: ') . $this->orderCount / 1; // Divide by 1 because we're only exporting for one language and currency

        if ($count[0]['nb_failed_orders'] > 0) { // Assuming $count[0] is the only entry now
            $this->confirm .= ', ' . $this->l('Failed orders: ') . $count[0]['nb_failed_orders'];
        }

        $this->confirm .= '.';


        // Display confirmation message after processing all files
        $this->_html .= $this->displayConfirmation(html_entity_decode($this->confirm));

        return;
    }

    public function _getOutputFileNameOrders($lang, $curr, $shop) //NAMING THE XML FILE ORDERS
    {
        // Retrieve the shop ID and shop group ID from the context, if available
        $shop_id = isset($this->context->shop->id) ? $this->context->shop->id : $shop;
        $shop_group_id = isset($this->context->shop->id_shop_group) ? $this->context->shop->id_shop_group : null;

        // Retrieve the file prefix from the configuration, fallback to empty string if not found
        $file_prefix = Configuration::get('GS_FILE_PREFIX', '', $shop_group_id, $shop_id);

        // If a file prefix is set in the configuration, use it to generate the file name
        if (!empty($file_prefix)) {
            return $file_prefix . '_elevok-orders' . $shop . '-' . $lang . '-' . $curr . '.xml';
        }

        // Default file name if no prefix is set
        return 'elevok-orders' . '.xml';
    }

}
