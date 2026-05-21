window.APP_CONFIG = {
  API_ENDPOINT: 'https://eu-central-1.cdn.hygraph.com/content/ckhjzb03d2j4h01yx8ufd2es0/master',

  AUTH: {
    USERNAME: 'admin',
    PASSWORD: 'admin',
  },

  CDN: {
    ADMINLTE_JS: 'https://admin-lte-cdn.surge.sh/dist/js/adminlte.min.js',
    // REQUIRED SCRIPTS
    COMBINED_LIBS: 'https://cdn.jsdelivr.net/combine/npm/jquery@3.6.3,npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js,npm/handlebars@4.7.7/dist/handlebars.min.js',
    // DataTables & Plugins
    DATATABLES: [
      'https://admin-lte-cdn.surge.sh/plugins/datatables/jquery.dataTables.min.js',
      'https://admin-lte-cdn.surge.sh/plugins/datatables-bs4/js/dataTables.bootstrap4.min.js',
      'https://admin-lte-cdn.surge.sh/plugins/datatables-responsive/js/dataTables.responsive.min.js',
      'https://admin-lte-cdn.surge.sh/plugins/datatables-responsive/js/responsive.bootstrap4.min.js',
    ],
    EXTRA_LIBS: 'https://cdn.jsdelivr.net/combine/npm/accounting-js@1.1.1/dist/accounting.umd.min.js,npm/dayjs@1.11.13/dayjs.min.js,npm/dayjs@1.11.13/plugin/customParseFormat.min.js,npm/sweetalert2@11',
  },

  LOGIN_PATH: '/pages/login',

  LAYOUT_FILES: [
    { path: '/parts/layout.html', name: 'layout' },
    { path: '/parts/sidebar.html', name: 'sidebar' },
    { path: '/parts/header.html', name: 'header' },
    { path: '/parts/modals.html', name: 'modals' },
  ],
};
