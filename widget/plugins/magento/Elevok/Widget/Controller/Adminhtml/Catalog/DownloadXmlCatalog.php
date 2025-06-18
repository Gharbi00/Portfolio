<?php
namespace Elevok\Widget\Controller\Adminhtml\Catalog;


use Magento\Backend\App\Action;
use Magento\Catalog\Api\CategoryRepositoryInterface;
use Magento\Catalog\Model\CategoryRepository;
use Magento\Catalog\Model\ResourceModel\Category\CollectionFactory as CategoryCollectionFactory;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Eav\Api\AttributeRepositoryInterface;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\UrlInterface;
use Magento\Store\Model\StoreManagerInterface;
use Psr\Log\LoggerInterface;

//use Elevok\Widget\Api\ArticlesRepositoryInterface;

class DownloadXmlCatalog extends Action
{
    protected $logger;
    protected $productCollectionFactory;
    protected $scopeConfig;
    protected $attributeRepository;
    protected $searchCriteriaBuilder;
    protected $categoryRepository;
    protected $urlModel;
    protected $categoryCollectionFactory;
    protected $storeManager;
    //protected $articlesRepository;

    public function __construct(
        Action\Context $context,
        LoggerInterface $logger,
        ScopeConfigInterface $scopeConfig,
        CollectionFactory $productCollectionFactory,
        AttributeRepositoryInterface $attributeRepository,
        SearchCriteriaBuilder $searchCriteriaBuilder,
        CategoryRepositoryInterface $categoryRepository,
        UrlInterface $urlModel,
        StoreManagerInterface $storeManager,
        CategoryCollectionFactory $categoryCollectionFactory
        //ArticlesRepositoryInterface $articlesRepository
    ) {
        parent::__construct($context);
        $this->logger                    = $logger;
        $this->scopeConfig               = $scopeConfig;
        $this->productCollectionFactory  = $productCollectionFactory;
        $this->attributeRepository       = $attributeRepository;
        $this->searchCriteriaBuilder     = $searchCriteriaBuilder;
        $this->categoryRepository        = $categoryRepository;
        $this->urlModel                  = $urlModel;
        $this->categoryCollectionFactory = $categoryCollectionFactory;
        $this->storeManager              = $storeManager;
        //$this->articlesRepository = $articlesRepository;
    }
    public function execute()
    {
        $this->logger->debug("Export action triggered.");

        try {
            $entityType = $this->scopeConfig->getValue(
                'elevok_widget_catalog/catalog_group/entity_selection',
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE
            );
            $this->logger->debug("Entity Type Current Value: " . $entityType);

            // Fetch dynamic values for the website details
            $storeName = $this->scopeConfig->getValue(
                'general/store_information/name',
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE
            );
            $storeUrl         = $this->storeManager->getStore()->getBaseUrl();
            $storeDescription = $this->scopeConfig->getValue(
                'general/store_information/description',
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE
            );

            // Initialize the XML structure with the <channel> element
            $xml = new \SimpleXMLElement('<channel/>');
            $xml->addChild('title', htmlspecialchars($storeName ?? 'Default Store', ENT_QUOTES, 'UTF-8'));
            $xml->addChild('link', $storeUrl);
            $descriptionNode = dom_import_simplexml($xml->addChild('description'));
            $dom             = $descriptionNode->ownerDocument;
            $cdata           = $dom->createCDATASection('<p>' . htmlspecialchars($storeDescription ?? 'Welcome to our store!', ENT_QUOTES, 'UTF-8') . '</p>');
            $descriptionNode->appendChild($cdata);
            $filePath = '';

            // Handle entity types
            switch ($entityType) {
    case 'products':
        $this->logger->debug("Starting export for entity type: products");
        $this->exportProducts($xml);
        $filePath = BP . '/pub/catalog-products.xml';
        $this->logger->debug("Finished export for products, file path: $filePath");
        break;

    case 'categories':
        $this->logger->debug("Starting export for entity type: categories");
        $this->exportCategories($xml);
        $filePath = BP . '/pub/catalog-categories.xml';
        $this->logger->debug("Finished export for categories, file path: $filePath");
        break;

    case 'brands':
        $this->logger->debug("Starting export for entity type: brands");
        $this->exportBrands($xml);
        $filePath = BP . '/pub/catalog-brands.xml';
        $this->logger->debug("Finished export for brands, file path: $filePath");
        break;

    case 'articles':
        $this->logger->debug("Starting export for entity type: articles");
        $this->exportArticles($xml);
        $filePath = BP . '/pub/catalog-articles.xml';
        $this->logger->debug("Finished export for articles, file path: $filePath");
        break;

    case 'attributes':
        $this->logger->debug("Starting export for entity type: attributes");
        $this->exportAttributes($xml);
        $filePath = BP . '/pub/catalog-attributes.xml';
        $this->logger->debug("Finished export for attributes, file path: $filePath");
        break;

    case 'attribute-values':
        $this->logger->debug("Starting export for entity type: attribute-values");
        $this->exportAttributesValues($xml);
        $filePath = BP . '/pub/catalog-attribute-values.xml';
        $this->logger->debug("Finished export for attribute-values, file path: $filePath");
        break;

    default:
        $this->logger->error("Unknown entity type selected: " . $entityType);
        throw new \Exception("Invalid entity type selected.");
}


            // Save XML content to file
            $xmlContent = $xml->asXML();
            file_put_contents($filePath, $xmlContent);

            $this->logger->debug("$entityType XML file has been written successfully to: " . $filePath);
        } catch (\Exception $e) {
            $this->logger->error('Error exporting: ' . $e->getMessage());
            $this->messageManager->addErrorMessage('Failed to export.');
        }
    }


protected function exportAttributes(\SimpleXMLElement $xml)
{
    $this->logger->debug('Starting exportAttributes');

    $searchCriteria = $this->searchCriteriaBuilder->create();
    $attributes = $this->attributeRepository->getList($searchCriteria)->getItems();

    $i = 1;
    foreach ($attributes as $attribute) {
        $code = $attribute->getAttributeCode();
        $label = $attribute->getDefaultFrontendLabel();
        $inputType = $attribute->getFrontendInput();

        $this->logger->debug("Processing attribute: $code | Label: $label | Type: $inputType");

        if ($attribute->usesSource() && $inputType === 'select') {
            $item = $xml->addChild('item');
            $item->addChild('id', $i++);
            $item->addChild('name', $label);

            $this->logger->debug("Exported attribute: $code with ID: " . ($i - 1));
        }
    }

    $this->logger->debug('Finished exportAttributes');
}


protected function exportAttributesValues(\SimpleXMLElement $xml)
{
    $this->logger->debug('Starting exportAttributesValues');

    $searchCriteria = $this->searchCriteriaBuilder->create();
    $attributes = $this->attributeRepository->getList($searchCriteria)->getItems();

    $id = 1000;
    foreach ($attributes as $attribute) {
        $code = $attribute->getAttributeCode();
        $label = $attribute->getDefaultFrontendLabel();
        $inputType = $attribute->getFrontendInput();

        $this->logger->debug("Checking attribute for values: $code | Label: $label | Type: $inputType");

        if ($attribute->usesSource() && $inputType === 'select') {
            $options = $attribute->getSource()->getAllOptions(false);

            foreach ($options as $option) {
                $item = $xml->addChild('item');
                $item->addChild('id', $id);
                $item->addChild('value', $option['label']);

                $this->logger->debug("Exported attribute value: {$option['label']} (ID: $id) for attribute $code");
                $id++;
            }
        }
    }

    $this->logger->debug('Finished exportAttributesValues');
}



    protected function exportCategories(\SimpleXMLElement $xml)
    {
        $categoryCollection = $this->categoryCollectionFactory->create();
        $categoryCollection->addAttributeToSelect('*'); // Optional: Select all attributes
        foreach ($categoryCollection->getItems() as $category) {
            $categoryXml = $xml->addChild('category');
            $categoryXml->addChild('id', $category->getId());
            $categoryXml->addChild('layer', $category->getLevel());
            $categoryXml->addChild('rank', $category->getPosition());
            $categoryXml->addChild('name', $category->getName());
            $categoryXml->addChild('parent', $category->getParentId());
            $categoryXml->addChild('description', htmlspecialchars($category->getDescription() ?? '', ENT_QUOTES, 'UTF-8'));
            $categoryXml->addChild('deep-link', $this->urlModel->getUrl('catalog/category/view', ['id' => $category->getId()]));
        }
    }

    protected function exportBrands(\SimpleXMLElement $xml)
    {
        // Debugging: Start export process
        $this->logger->debug('Starting export of brand options.');

        try {
            // Retrieve the 'brand' attribute
            $attribute = $this->attributeRepository->get(
                \Magento\Catalog\Model\Product::ENTITY,
                'brand' // Attribute code
            );

            if (! $attribute) {
                $this->logger->debug('Brand attribute not found.');
                return;
            }

            if (! $attribute->usesSource()) {
                $this->logger->debug('Brand attribute does not use a source.');
                return;
            }

            // Debugging: Attribute information
            $this->logger->debug('Brand attribute found. Retrieving options.');

            // Get all options for the 'brand' attribute
            $options = $attribute->getSource()->getAllOptions(false);

            if (empty($options)) {
                $this->logger->debug('No brand options found for the attribute.');
                return;
            }

            // Debugging: Total number of brand options found
            $this->logger->debug('Number of brand options found: ' . count($options));

            // Loop through each option and add it to the XML
            foreach ($options as $option) {
                // Debugging: Log each brand option
                $this->logger->debug('Processing brand option: ID = ' . $option['value'] . ', Name = ' . $option['label']);

                $brandXml = $xml->addChild('brand');
                $brandXml->addChild('id', htmlspecialchars($option['value'], ENT_QUOTES, 'UTF-8'));   // Option ID
                $brandXml->addChild('name', htmlspecialchars($option['label'], ENT_QUOTES, 'UTF-8')); // Option Label

                // Optionally, generate a URL for the brand
                $url = $this->urlModel->getUrl('catalog/brand/view', ['id' => $option['value']]);
                $brandXml->addChild('website', htmlspecialchars($url, ENT_QUOTES, 'UTF-8'));

                // Debugging: Log the generated brand URL
                $this->logger->debug('Generated brand URL: ' . $url);
            }
        } catch (\Exception $e) {
            // Debugging: Log any exception that occurs during the process
            $this->logger->error('Error exporting brand options: ' . $e->getMessage());
        }

        // Debugging: End export process
        $this->logger->debug('Finished export of brand options.');
    }

    protected function exportProducts(\SimpleXMLElement $xml)
    {
        $productCollection = $this->productCollectionFactory->create();
        $productCollection->addAttributeToSelect('*');

        if ($productCollection->count() === 0) {
            $this->logger->debug("No products found for export.");
            return;
        }

        foreach ($productCollection as $product) {
            $this->logger->debug("Processing product ID: " . $product->getId());

            $productXml = $xml->addChild('item');

            // Add product details
            $productXml->addChild('id', $product->getId());
            $productXml->addChild('name', htmlspecialchars($product->getName(), ENT_QUOTES, 'UTF-8'));

            // Add first category ID (assuming there is at least one category)
            $categoryIds = $product->getCategoryIds();
            $category    = ! empty($categoryIds) ? $this->categoryRepository->get($categoryIds[0]) : null;
            $productXml->addChild('category', $category ? $category->getId() : '');
            $this->logger->debug('Brand (raw): ' . $product->getData('brand'));
            $brand = $product->getData('brand');
            $productXml->addChild('brand', htmlspecialchars($brand ?? '', ENT_QUOTES, 'UTF-8'));

            $vat = '1';
            $productXml->addChild('vat', $vat);

            $productXml->addChild('sku', $product->getSku());

                                         // Add tags (assuming "tags" is the attribute code)
            $tags = $product->getTags(); // Replace with actual attribute code if different
            $productXml->addChild('tags', htmlspecialchars($tags ?? '', ENT_QUOTES, 'UTF-8'));

            // Add condition (assuming "condition" is the attribute code)
            $productXml->addChild('condition', htmlspecialchars($condition ?? 'New', ENT_QUOTES, 'UTF-8'));

            // Add status
            $status = $product->getStatus() == \Magento\Catalog\Model\Product\Attribute\Source\Status::STATUS_ENABLED ? 'ACTIVE' : 'INACTIVE';
            $productXml->addChild('status', $status);

            // Add description
            $description = $product->getDescription() ?? 'Custom description';
            $productXml->addChild('description', htmlspecialchars($description, ENT_QUOTES, 'UTF-8'));

            // Add product URL
            $url = $this->urlModel->getUrl('catalog/product/view', ['id' => $product->getId()]);
            $productXml->addChild('url', htmlspecialchars($url, ENT_QUOTES, 'UTF-8'));
            $mainImage = $product->getImage();
            if ($mainImage) {
                $mainImageUrl = $product->getMediaConfig()->getMediaUrl($mainImage);
                $productXml->addChild('pictures', htmlspecialchars($url, ENT_QUOTES, 'UTF-8'));
                $this->logger->debug('Main image URL: ' . $mainImageUrl);
            } else {
                $this->logger->debug('No main image found for product ID: ' . $product->getId());
            }

            $mediaGallery = $product->getData('media_gallery');

            if (! empty($mediaGallery['images'])) {
                // Add a container for the images in XML
                $picturesXml = $productXml->addChild('pictures');

                foreach ($mediaGallery['images'] as $image) {
                    $imageUrl = $this->mediaConfig->getMediaUrl($image['file']); // Convert file path to full URL
                    $picturesXml->addChild('picture', htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8'));
                    $this->logger->debug('Gallery image URL: ' . $imageUrl);
                }
            } else {
                $this->logger->debug('No images found in media gallery for product ID: ' . $product->getId());
            }
            // Add price
            $productXml->addChild('price', $product->getPrice());
        }
    }


protected function exportArticles(\SimpleXMLElement $xml)
{
    // Retrieve the articles (assuming they are a custom entity or product type)
    $articleCollection = $this->productCollectionFactory->create();  // Use appropriate collection factory for articles
    $articleCollection->addFieldToSelect('*');  // Select all fields for articles

    if ($articleCollection->count() === 0) {
        $this->logger->debug("No articles found for export.");
        return;
    }

    foreach ($articleCollection as $article) {
        $this->logger->debug("Processing article ID: " . $article->getId());

        // Create XML element for each article
        $articleXml = $xml->addChild('item');

        // Add article details
        $articleXml->addChild('id', $article->getId());
        $articleXml->addChild('name', htmlspecialchars($article->getName(), ENT_QUOTES, 'UTF-8'));

        // Add barcode (assuming barcode is a custom attribute)
        $barcode = $article->getData('barcode');  // Adjust if using a different field name
        $articleXml->addChild('barcode', htmlspecialchars($barcode ?? '', ENT_QUOTES, 'UTF-8'));

        // Add attributes (this assumes attribute IDs are stored in a comma-separated list)
        $attributes = $article->getData('attributes');  // Replace with actual attribute code
        $articleXml->addChild('attributes', htmlspecialchars($attributes ?? '', ENT_QUOTES, 'UTF-8'));

        // Add price
        $articleXml->addChild('price', $article->getPrice());

        // Add pictures (assuming article has images, like a product)
        $mediaGallery = $article->getData('media_gallery');  // Assuming media_gallery is the attribute for images

        if (!empty($mediaGallery['images'])) {
            // Add a container for the images in XML
            $picturesXml = $articleXml->addChild('pictures');
            foreach ($mediaGallery['images'] as $image) {
                $imageUrl = $this->mediaConfig->getMediaUrl($image['file']);  // Convert file path to full URL
                $picturesXml->addChild('picture', htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8'));
                $this->logger->debug('Article image URL: ' . $imageUrl);
            }
        } else {
            $this->logger->debug('No images found in media gallery for article ID: ' . $article->getId());
        }

        // Example of how to add a custom picture URL if available
        $customImageUrl = $article->getData('custom_image_url');  // Assuming 'custom_image_url' is an attribute
        if ($customImageUrl) {
            $articleXml->addChild('pictures', htmlspecialchars($customImageUrl, ENT_QUOTES, 'UTF-8'));
        }

        // Optionally, add description if available
        $description = $article->getDescription() ?? 'Custom description for the article';
        $articleXml->addChild('description', htmlspecialchars($description, ENT_QUOTES, 'UTF-8'));

        // Add article URL (assuming a similar pattern to products)
        $url = $this->urlModel->getUrl('catalog/article/view', ['id' => $article->getId()]);
        $articleXml->addChild('url', htmlspecialchars($url, ENT_QUOTES, 'UTF-8'));
    }
}


    public function exportAll()
{
    $this->logger->debug("Starting exportAll process...");

    $entities = [
        'products'          => [
            'method' => 'exportProducts',
            'file'   => BP . '/pub/catalog-products.xml',
        ],
        'categories'        => [
            'method' => 'exportCategories',
            'file'   => BP . '/pub/catalog-categories.xml',
        ],
        'brands'            => [
            'method' => 'exportBrands',
            'file'   => BP . '/pub/catalog-brands.xml',
        ],
        'attributes'        => [
            'method' => 'exportAttributes',
            'file'   => BP . '/pub/catalog-attributes.xml',
        ],
        'attributes-values' => [
            'method' => 'exportAttributesValues',
            'file'   => BP . '/pub/catalog-attributes-values.xml',
        ],
        'articles' => [
            'method' => 'exportArticles',
            'file'   => BP . '/pub/catalog-articles.xml',
        ],
    ];

    foreach ($entities as $entityType => $config) {
        try {
            $this->logger->debug("Exporting entity type: $entityType using method: {$config['method']} to file: {$config['file']}");
            $this->exportEntity($entityType, $config['method'], $config['file']);
            $this->logger->debug("Successfully exported: $entityType");
        } catch (\Exception $e) {
            $this->logger->error("Failed to export $entityType: " . $e->getMessage());
        }
    }

    $this->logger->debug("All entities export process completed.");
}


    public function exportEntity(string $entityType, string $method, string $filePath)
    {
        try {
            // Fetch dynamic values for the website details
            $storeName = $this->scopeConfig->getValue(
                'general/store_information/name',
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE
            );
            $storeUrl         = $this->storeManager->getStore()->getBaseUrl();
            $storeDescription = $this->scopeConfig->getValue(
                'general/store_information/description',
                \Magento\Store\Model\ScopeInterface::SCOPE_STORE
            );

            // Initialize the XML structure for the specific entity
            $xml = new \SimpleXMLElement('<channel/>');
            $xml->addChild('title', htmlspecialchars($storeName ?? 'Default Store', ENT_QUOTES, 'UTF-8'));
            $xml->addChild('link', $storeUrl);
            $descriptionNode = dom_import_simplexml($xml->addChild('description'));
            $dom             = $descriptionNode->ownerDocument;
            $cdata           = $dom->createCDATASection('<p>' . htmlspecialchars($storeDescription ?? 'Welcome to our store!', ENT_QUOTES, 'UTF-8') . '</p>');
            $descriptionNode->appendChild($cdata);

            // Call the corresponding method to populate XML
            if (method_exists($this, $method)) {
                $this->$method($xml);
            } else {
                throw new \Exception("Export method $method does not exist.");
            }

            // Save XML content to file
            $xmlContent = $xml->asXML();
            file_put_contents($filePath, $xmlContent);

            $this->logger->debug("$entityType XML file has been written successfully to: " . $filePath);
        } catch (\Exception $e) {
            $this->logger->error("Error exporting $entityType: " . $e->getMessage());
        }
    }
}
