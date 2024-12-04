export interface MenuItem {
  id?: number;
  label?: any;
  icon?: string;
  link?: string;
  subItems?: any;
  isTitle?: boolean;
  badge?: any;
  parentId?: number;
  isLayout?: boolean;
}

export const MENU: MenuItem[] = [
  {
    id: 49,
    label: 'MENUITEMS.CUSTOMERENGAGEMENT.TEXT',
    isTitle: true,
  },
  {
    id: 54,
    label: 'MENUITEMS.TITLE.CAMPAIGNS',
    icon: 'mdi mdi-satellite-uplink',
    subItems: [
      {
        id: 56,
        label: 'MENUITEMS.TITLE.CAMPAIGNS',
        link: '/engagement/campaigns/campaigns',
        parentId: 55,
      },
      {
        id: 58,
        label: 'MENUITEMS.TITLE.BUTTONS',
        link: '/engagement/campaigns/buttons',
        parentId: 55,
      },
      {
        id: 59,
        label: 'MENUITEMS.TITLE.CHALLENGE',
        icon: 'bx bx-credit-card',
        link: '/engagement/campaigns/challenges',
      },
    ],
  },
  {
    id: 55,
    label: 'MENUITEMS.CUSTOMERENGAGEMENT.LIST.AUDIENCES',
    icon: 'mdi mdi-account-search',
    link: '/engagement/audiences',
  },
  {
    id: 56,
    label: 'MENUITEMS.CUSTOMERENGAGEMENT.LIST.COMMUNITY_NAME',
    icon: 'mdi mdi-account-convert',
    subItems: [
      {
        id: 56,
        label: 'MENUITEMS.CUSTOMERENGAGEMENT.LIST.COMMUNITY.SUBSCRIBERS',
        link: '/engagement/community/subscribers',
        parentId: 55,
      },
      {
        id: 58,
        label: 'MENUITEMS.CUSTOMERENGAGEMENT.LIST.COMMUNITY.LEADERBOARD',
        link: '/engagement/community/leaderboard',
        parentId: 55,
      },
      {
        id: 59,
        label: 'MENUITEMS.CUSTOMERENGAGEMENT.LIST.COMMUNITY.CARDS',
        icon: 'bx bx-credit-card',
        link: '/engagement/community/cards',
      },
      {
        id: 60,
        label: 'MODULES.SYSTEM.WALLETS',
        icon: 'bx bx-credit-card',
        link: '/engagement/community/wallets',
      },
      {
        id: 61,
        label: 'MODULES.ENGAGEMENT.REFERRALS',
        link: '/engagement/community/referrals',
      },
    ],
  },
  {
    id: 55,
    label: 'MENUITEMS.CUSTOMERENGAGEMENT.LIST.WALLET',
    icon: 'mdi mdi-wallet',
    link: '/engagement/wallet',
  },
  {
    id: 5,
    label: 'MENUITEMS.TITLE.COMMUNITY',
    isTitle: true,
  },
  {
    id: 55,
    label: 'MENUITEMS.ECOMMERCE.LIST.CUSTOMERS.LIST.CUSTOMERS',
    icon: 'mdi mdi-account-group',
    link: '/ecommerce/customers/customers',
  },
  {
    id: 55,
    label: 'MENUITEMS.TITLE.CHAT',
    icon: 'mdi mdi-chat-processing',
    link: '/ecommerce/customers/chat',
  },
  {
    id: 55,
    label: 'MENUITEMS.TITLE.OUTBOUND',
    icon: 'mdi mdi-near-me',
    link: '/ecommerce/customers/outbound',
  },
  {
    id: 49,
    label: 'MENUITEMS.TITLE.ECOMMERCE',
    isTitle: true,
  },
  {
    id: 55,
    label: 'MENUITEMS.WEBSITE.LIST.PROFILE',
    icon: 'mdi mdi-google-my-business',
    link: '/website/profile',
  },
  {
    id: 50,
    label: 'MENUITEMS.WEBSITE.LIST.CONTENT.TEXT',
    icon: 'mdi mdi-content-save-cog-outline',
    subItems: [
      {
        id: 56,
        label: 'MENUITEMS.WEBSITE.LIST.CONTENT.LIST.PAGES',
        link: '/website/content/pages',
        parentId: 55,
      },
      {
        id: 57,
        label: 'MENUITEMS.WEBSITE.LIST.CONTENT.LIST.VISUALS',
        link: '/website/content/visuals',
        parentId: 55,
      },
      {
        id: 58,
        label: 'MENUITEMS.WEBSITE.LIST.CONTENT.LIST.SLIDES',
        link: '/website/content/slides',
        parentId: 55,
      },
      {
        id: 58,
        label: 'MENUITEMS.WEBSITE.LIST.BLOG',
        link: '/website/blog',
        parentId: 55,
      },
      {
        id: 56,
        label: 'MENUITEMS.TITLE.STATIC',
        link: '/website/content/static',
        parentId: 55,
      },
    ],
  },
  {
    id: 55,
    label: 'MENUITEMS.WEBSITE.LIST.REQUESTS',
    icon: 'mdi mdi-frequently-asked-questions',
    link: '/website/requests',
  },
  {
    id: 50,
    label: 'MENUITEMS.ECOMMERCE.LIST.PRODUCTS.TEXT',
    icon: 'mdi mdi-cellphone-screenshot',
    subItems: [
      {
        id: 56,
        label: 'MENUITEMS.ECOMMERCE.LIST.PRODUCTS.LIST.GROUPS',
        link: '/ecommerce/products/groups',
        parentId: 55,
      },
      {
        id: 57,
        label: 'MENUITEMS.ECOMMERCE.LIST.PRODUCTS.LIST.RATING',
        link: '/ecommerce/products/ratings',
        parentId: 55,
      },
      {
        id: 57,
        label: 'MENUITEMS.ECOMMERCE.LIST.PRODUCTS.LIST.CLICKS',
        link: '/ecommerce/products/clicks',
        parentId: 55,
      },
    ],
  },
  {
    id: 50,
    label: 'MENUITEMS.ECOMMERCE.LIST.SALES.TEXT',
    icon: 'mdi mdi-cart-check',
    subItems: [
      {
        id: 56,
        label: 'MENUITEMS.ECOMMERCE.LIST.SALES.LIST.ORDERS',
        link: '/ecommerce/sales/orders',
        parentId: 55,
      },
      {
        id: 57,
        label: 'MENUITEMS.ECOMMERCE.LIST.SALES.LIST.OPENCARTS',
        link: '/ecommerce/sales/carts',
        parentId: 55,
      },
      {
        id: 58,
        label: 'MENUITEMS.ECOMMERCE.LIST.SALES.LIST.COUPONS',
        link: '/ecommerce/sales/coupons',
        parentId: 55,
      },
      {
        id: 59,
        label: 'MENUITEMS.ECOMMERCE.LIST.SALES.LIST.PROMOTIONS',
        link: '/ecommerce/sales/promotions',
        parentId: 55,
      },
    ],
  },
  // {
  //   id: 17,
  //   label: 'MENUITEMS.CXM.TEXT',
  //   isTitle: true,
  // },
  // {
  //   id: 18,
  //   label: 'MENUITEMS.CXM.LIST.CUSTOMERS.TEXT',
  //   icon: 'mdi mdi-human-greeting-proximity',
  //   subItems: [
  //     {
  //       id: 15,
  //       label: 'MENUITEMS.CXM.LIST.CUSTOMERS.LIST.COMPANIES',
  //       link: '/crm/customers/companies',
  //       parentId: 14,
  //     },
  //     {
  //       id: 16,
  //       label: 'MENUITEMS.CXM.LIST.CUSTOMERS.LIST.CONTACTS',
  //       link: '/crm/customers/contacts',
  //       parentId: 14,
  //     },
  //     {
  //       id: 16,
  //       label: 'MENUITEMS.CXM.LIST.CUSTOMERS.LIST.LEADS',
  //       link: '/crm/customers/leads',
  //       parentId: 14,
  //     },
  //   ],
  // },
  // {
  //   id: 20,
  //   label: 'MENUITEMS.CXM.LIST.PIPELINE',
  //   icon: 'mdi mdi-human-male-board-poll',
  //   link: '/crm/pipeline',
  // },
  // {
  //   id: 22,
  //   label: 'MENUITEMS.CXM.LIST.TICKETS',
  //   icon: 'mdi mdi-palette-swatch-outline',
  //   link: '/crm/tickets',
  // },
  // {
  //   id: 41,
  //   label: 'MENUITEMS.COLLABORATION.TEXT',
  //   isTitle: true,
  // },
  // {
  //   id: 42,
  //   label: 'MENUITEMS.COLLABORATION.LIST.PROJECTS.TEXT',
  //   icon: 'mdi mdi-projector-screen',
  //   subItems: [
  //     {
  //       id: 15,
  //       label: 'MENUITEMS.COLLABORATION.LIST.PROJECTS.LIST.PROJECTS',
  //       link: '/collaboration/projects/all',
  //       parentId: 14,
  //     },
  //     {
  //       id: 16,
  //       label: 'MENUITEMS.COLLABORATION.LIST.PROJECTS.LIST.TASKS',
  //       link: '/collaboration/tasks/all',
  //       parentId: 14,
  //     },
  //   ],
  // },
  // {
  //   id: 44,
  //   label: 'MENUITEMS.COLLABORATION.LIST.TODO',
  //   icon: 'mdi mdi-bookmark-check',
  //   link: '/collaboration/todo/all',
  // },
  // {
  //   id: 45,
  //   label: 'Mailbox',
  //   icon: 'mdi mdi-email',
  //   link: '/collaboration/mailbox',
  // },
  // {
  //   id: 46,
  //   label: 'Calendar',
  //   icon: 'mdi mdi-calendar',
  //   link: '/collaboration/calendar',
  // },
  // {
  //   id: 47,
  //   label: 'MENUITEMS.COLLABORATION.LIST.CHAT',
  //   icon: 'mdi mdi-chat-processing',
  //   link: '/collaboration/chat',
  // },
  // {
  //   id: 48,
  //   label: 'File Manager',
  //   icon: 'mdi mdi-folder-cog',
  //   link: '/collaboration/file-manager',
  // },
  // {
  //   id: 23,
  //   label: 'MENUITEMS.TITLE.INVOICING',
  //   isTitle: true,
  // },
  // {
  //   id: 179,
  //   label: 'MENUITEMS.ECOMMERCE.LIST.SALES.TEXT',
  //   icon: 'mdi mdi-cart',
  //   subItems: [
  //     {
  //       id: 24,
  //       label: 'MENUITEMS.SALES.LIST.QUOTATION',
  //       link: '/sales/quotations',
  //     },
  //     {
  //       id: 25,
  //       label: 'MENUITEMS.SALES.LIST.ORDERS',
  //       link: '/sales/orders',
  //     },
  //     {
  //       id: 26,
  //       label: 'MENUITEMS.SALES.LIST.NOTES.TEXT',
  //       subItems: [
  //         {
  //           id: 27,
  //           label: 'MENUITEMS.SALES.LIST.NOTES.LIST.DELIVERY',
  //           link: '/sales/delivery-notes',
  //           parentId: 26,
  //         },
  //         {
  //           id: 28,
  //           label: 'MENUITEMS.SALES.LIST.NOTES.LIST.ISSUE',
  //           link: '/sales/issue-notes',
  //           parentId: 26,
  //         },
  //       ],
  //     },
  //     {
  //       id: 29,
  //       label: 'MENUITEMS.SALES.LIST.INVOICES',
  //       link: '/sales/invoices',
  //     },
  //     {
  //       id: 30,
  //       label: 'MENUITEMS.SALES.LIST.RENTAL.TEXT',
  //       subItems: [
  //         {
  //           id: 33,
  //           label: 'MENUITEMS.SALES.LIST.RENTAL.LIST.CALENDAR',
  //           link: '/sales/rental/calendar',
  //           parentId: 30,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: 179,
  //   label: 'MENUITEMS.TITLE.PURCHASE',
  //   icon: 'mdi mdi-cart-arrow-down',
  //   subItems: [
  //     {
  //       id: 36,
  //       label: 'MENUITEMS.PURCHASE.LIST.PURCHASES',
  //       link: '/purchases/purchases',
  //     },
  //     {
  //       id: 37,
  //       label: 'MENUITEMS.PURCHASE.LIST.NOTES',
  //       link: '/purchases/notes',
  //     },
  //     {
  //       id: 38,
  //       label: 'MENUITEMS.PURCHASE.LIST.INVOICES',
  //       link: '/purchases/invoices',
  //     },
  //     {
  //       id: 39,
  //       label: 'MENUITEMS.PURCHASE.LIST.SUPPLIERS',
  //       link: '/purchases/suppliers',
  //     },
  //   ],
  // },
  {
    id: 5,
    label: 'MENUITEMS.INVENTORY.TEXT',
    isTitle: true,
  },
  {
    id: 4,
    label: 'MENUITEMS.INVENTORY.LIST.BRANDS',
    icon: 'mdi mdi-turtle',
    link: '/inventory/brands',
  },
  {
    id: 6,
    label: 'MENUITEMS.INVENTORY.LIST.PRODUCTS.TEXT',
    icon: 'mdi mdi-view-dashboard',
    subItems: [
      {
        id: 7,
        label: 'MENUITEMS.INVENTORY.LIST.PRODUCTS.LIST.PRODUCTS',
        link: '/inventory/products/products',
        parentId: 6,
      },
      {
        id: 8,
        label: 'MENUITEMS.INVENTORY.LIST.PRODUCTS.LIST.ARTICLES',
        link: '/inventory/products/articles',
        parentId: 6,
      },
      {
        id: 9,
        label: 'MENUITEMS.INVENTORY.LIST.PRODUCTS.LIST.CATEGORIES',
        link: '/inventory/products/categories',
        parentId: 6,
      },
      {
        id: 10,
        label: 'MENUITEMS.INVENTORY.LIST.PRODUCTS.LIST.ATTRIBUTES',
        link: '/inventory/products/attributes',
        parentId: 6,
      },
    ],
  },
  {
    id: 6,
    label: 'MENUITEMS.INVENTORY.LIST.SERVICES.TEXT',
    icon: 'mdi mdi-dance-pole',
    subItems: [
      {
        id: 7,
        label: 'MENUITEMS.INVENTORY.LIST.SERVICES.LIST.SERVICES',
        link: '/inventory/services/services',
        parentId: 6,
      },
      {
        id: 9,
        label: 'MENUITEMS.INVENTORY.LIST.SERVICES.LIST.CATEGORIES',
        link: '/inventory/services/categories',
        parentId: 6,
      },
    ],
  },
  {
    id: 11,
    label: 'MENUITEMS.INVENTORY.LIST.STOCK.TEXT',
    icon: 'mdi mdi-human-dolly',
    subItems: [
      {
        id: 12,
        label: 'MENUITEMS.INVENTORY.LIST.STOCK.LIST.WAREHOUSE',
        link: '/inventory/stock/warehouse',
        parentId: 11,
      },
      {
        id: 13,
        label: 'MENUITEMS.INVENTORY.LIST.STOCK.LIST.STOCK',
        link: '/inventory/stock/stock',
        parentId: 11,
      },
    ],
  },
  {
    id: 6,
    label: 'MENUITEMS.INVENTORY.LIST.EQUIPMENTS.TEXT',
    icon: 'mdi mdi-lamps',
    subItems: [
      {
        id: 7,
        label: 'MENUITEMS.INVENTORY.LIST.EQUIPMENTS.LIST.EQUIPMENTS',
        link: '/inventory/equipments/equipments',
        parentId: 6,
      },
      {
        id: 8,
        label: 'MENUITEMS.INVENTORY.LIST.EQUIPMENTS.LIST.ARTICLES',
        link: '/inventory/equipments/articles',
        parentId: 6,
      },
      {
        id: 9,
        label: 'MENUITEMS.INVENTORY.LIST.EQUIPMENTS.LIST.CATEGORIES',
        link: '/inventory/equipments/categories',
        parentId: 6,
      },
      {
        id: 10,
        label: 'MENUITEMS.INVENTORY.LIST.EQUIPMENTS.LIST.ATTRIBUTES',
        link: '/inventory/equipments/attributes',
        parentId: 6,
      },
    ],
  },
  // {
  //   id: 14,
  //   label: 'MENUITEMS.INVENTORY.LIST.MAINTENANCE.TEXT',
  //   icon: 'mdi mdi-wrench-clock',
  //   subItems: [
  //     {
  //       id: 16,
  //       label: 'MENUITEMS.INVENTORY.LIST.MAINTENANCE.LIST.SCHEDULE',
  //       link: '/inventory/maintenance/schedule',
  //       parentId: 14,
  //     },
  //     {
  //       id: 16,
  //       label: 'MENUITEMS.INVENTORY.LIST.MAINTENANCE.LIST.CALENDAR',
  //       link: '/inventory/maintenance/calendar',
  //       parentId: 14,
  //     },
  //   ],
  // },
  {
    id: 59,
    label: 'MENUITEMS.HR.TEXT',
    isTitle: true,
  },
  // {
  //   id: 50,
  //   label: 'Employees',
  //   icon: 'mdi mdi-account-multiple-check',
  //   subItems: [
  //     {
  //       id: 56,
  //       label: 'Employees',
  //       link: '/hr/employees',
  //       parentId: 55,
  //     },
  //     {
  //       id: 57,
  //       label: 'Contracts',
  //       link: '/hr/employees/contracts',
  //       parentId: 55,
  //     },
  //     {
  //       id: 57,
  //       label: 'Payroll',
  //       link: '/hr/employees/payroll',
  //       parentId: 55,
  //     },
  //   ],
  // },
  {
    id: 55,
    label: 'MENUITEMS.HR.LIST.RECRUITMENT.TEXT',
    icon: 'mdi mdi-briefcase',
    subItems: [
      {
        id: 56,
        label: 'MENUITEMS.HR.LIST.RECRUITMENT.LIST.POSITIONS',
        link: '/hr/career/positions/all',
        parentId: 55,
      },
      {
        id: 57,
        label: 'MENUITEMS.HR.LIST.RECRUITMENT.LIST.APPLICATIONS',
        link: '/hr/career/applications/all',
        parentId: 55,
      },
    ],
  },
  // {
  //   id: 52,
  //   label: 'Fleet',
  //   icon: 'mdi mdi-car-cog',
  //   subItems: [
  //     {
  //       id: 56,
  //       label: 'Vehicules',
  //       link: '/hr/fleet/vehicules',
  //       parentId: 55,
  //     },
  //     {
  //       id: 57,
  //       label: 'Contracts',
  //       link: '/hr/fleet/contracts',
  //       parentId: 55,
  //     },
  //   ],
  // },
  {
    id: 59,
    label: 'MENUITEMS.SYSTEM.TEXT',
    isTitle: true,
  },
  {
    id: 58,
    label: 'MENUITEMS.SYSTEM.LIST.TEAM',
    icon: 'mdi mdi-account-group',
    link: '/system/team',
  },
  {
    id: 58,
    label: 'MENUITEMS.SYSTEM.LIST.COMPANY.TEXT',
    icon: 'mdi mdi-garage',
    subItems: [
      {
        id: 56,
        label: 'MENUITEMS.SYSTEM.LIST.COMPANY.LIST.DETAILS',
        link: '/system/company',
        parentId: 55,
      },
      {
        id: 56,
        label: 'MENUITEMS.SYSTEM.LIST.COMPANY.LIST.LOCATIONS',
        link: '/hr/company/locations',
        parentId: 55,
      },
      {
        id: 57,
        label: 'MENUITEMS.SYSTEM.LIST.COMPANY.LIST.DEPARTMENTS',
        link: '/hr/company/departments',
        parentId: 55,
      },
      {
        id: 58,
        label: 'MENUITEMS.SYSTEM.LIST.COMPANY.LIST.PERMISSIONS',
        link: '/system/permissions',
      },
    ],
  },
  {
    id: 58,
    label: 'MENUITEMS.SYSTEM.LIST.APPS',
    icon: 'mdi mdi-motion-play-outline',
    link: '/system/apps',
  },
];
