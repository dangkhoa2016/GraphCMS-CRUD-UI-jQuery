const config = window.APP_CONFIG;

(function() {
  'use strict';

  var login_page = config.LOGIN_PATH;
  var user_name = config.AUTH.USERNAME;
  var password = config.AUTH.PASSWORD;
  var cdn = config.CDN || {};
  var coreLibs = [
    cdn.COMBINED_LIBS,
    ...(cdn.DATATABLES || []),
    cdn.EXTRA_LIBS,
    cdn.ADMINLTE_JS,
    '/assets/js/api-service.js',
    '/assets/js/helper.js',
  ].filter(Boolean);

  function loadScript(file) {
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.src = file;
      script.onload = function() { resolve(); };
      script.onerror = function() {
        console.error('Failed to load script: ' + file);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  var LoadFile = function(file) {
    return new Promise(function(resolve) {
      $.ajax({
        url: file.path, type: 'get',
        contentType: 'text/plain',
        error: function() {
          file.content = '';
          resolve(file);
        },
        success: function(res) {
          file.content = res;
          resolve(file);
        }
      });
    });
  };

  function InitOther() {
    (new adminlte.Treeview($('[data-widget="treeview"]'), { trigger: '.nav-link' })).init();
    ActiveMenu();

    $('#btn-logout').click(function(e) {
      e.preventDefault();
      EraseCookie(user_name);
      location.href = login_page + '.html';
    });

    $('#btn-reload').click(function(e) {
      e.preventDefault();
      if (typeof window.table_js !== 'undefined')
        window.table_js.ajax.reload();
    });
  }

  function ProcessLayout(arr) {
    var indxLayout = arr.findIndex(function(elem) { return elem.name.toLowerCase() === 'layout'; });

    if (indxLayout === -1)
      return;

    var layout = arr.splice(indxLayout, 1)[0];

    $('body').find('layout').replaceWith(layout.content);
    $.each(arr, function(indx, elm) {
      $('body').find(elm.name).replaceWith(elm.content);
    });

    InitOther();

    if (typeof window.InitPage === 'function')
      window.InitPage(arr);
  }

  function ActiveMenu() {
    var page = location.pathname;
    if (page.length < 2)
      page = '/index';
    $('#navigation a[href="' + page + '"], #navigation a[href="' + page + '.html"]').addClass('active');
  }

  function LoadContent(files) {
    return Promise.all(files.map(function(file) { return LoadFile(file); })).then(function(arr) {
      ProcessLayout(arr);
    }).catch(function(err) {
      console.log('Error loading files', err);
    });
  }

  function Main() {

    $('#btn-admin-signin').click(function(e) {
      e.preventDefault();

      if ($('form input[name="user_name"]').val() === user_name &&
        $('form input[name="password"]').val() === password) {
        SetCookie(user_name, EncodeAuth(user_name, password), 1);

        var query = location.href.split('?')[1];
        var obj = QueryStringToObject(query);

        location.href = obj.return_url || '/';
        return;
      }

      alert('Invalid password.');
    });

    if (location.pathname.toLowerCase() !== login_page &&
      location.pathname.toLowerCase() !== login_page + '.html') {
      if (!GetCookie('admin')) {
        if (login_page.toLowerCase().indexOf('.html') === -1)
          login_page += '.html';
        location.href = login_page + '?return_url=' + location.pathname;
        return;
      }
    }

    var files = config.LAYOUT_FILES.slice();

    var layout = document.querySelector('layout');
    if (!layout)
      return;

    var content_to_load = layout.getAttribute('data-page');
    if (!content_to_load) {
      if (location.pathname.length > 1) {
        var seg = location.pathname.split('/');
        content_to_load = seg[seg.length - 1];
      } else
        content_to_load = 'index';
      content_to_load = content_to_load.toLowerCase().replace('.html', '');
    }

    files.push({ path: '/content/' + content_to_load + '.html', name: 'content' });
    if (typeof window.addition_file !== 'undefined') {
      if (Array.isArray(window.addition_file))
        files = files.concat(window.addition_file);
      else
        files.push(window.addition_file);

      delete window.addition_file;
    }

    LoadContent(files);
  }

  function loadScriptsSequentially(files) {
    return files.reduce(function(promise, file) {
      return promise.then(function() { return loadScript(file); });
    }, Promise.resolve());
  }

  loadScriptsSequentially(coreLibs).then(function() {
    if (Array.isArray(window.addition_libs) && window.addition_libs.length > 0) {
      return Promise.all(window.addition_libs.map(function(item) { return loadScript(item); }));
    }
  }).then(function() {
    Main();
  });

})();
