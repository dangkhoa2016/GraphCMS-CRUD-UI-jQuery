window.SetCookie = function (name, value, days) {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

window.GetCookie = function (name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

window.EraseCookie = function (name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

window.QueryStringToObject = function (queryString) {
  var obj = {};
  var x = (queryString || '').split('?');
  if (x && x.length > 1) queryString = x[1];
  if (queryString) {
    if (queryString.indexOf('?') === 0) queryString = queryString.slice(1);
    queryString.split('&').map(function (item) {
      var _item$split = item.split('='),
        k = _item$split[0],
        v = _item$split[1];
      return v ? (obj[k] = v) : null;
    });
  }

  return obj;
};

window.EncodeAuth = function (user, password) {
  var token = user + ':' + password;

  // Should i be encoding this value????? does it matter???
  // Base64 Encoding -> btoa
  var hash = btoa(token);

  return 'Basic ' + hash;
};

window.GetFormData = function ($form) {
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};

  $.map(unindexed_array, function (n, i) {
    indexed_array[n['name']] = n['value'];
  });

  return indexed_array;
};

window.TruncateLongString = function (str, n, useWordBoundary) {
  if (!str || str.length <= n) { return str; }
  const subString = str.substr(0, n - 1); // the original check
  return (useWordBoundary
    ? subString.substr(0, subString.lastIndexOf(' '))
    : subString) + '&hellip;';
};

Handlebars.registerHelper('formatTime', function (date, format) {
  return dayjs(date).format(format);
});

Handlebars.registerHelper('ifCond', function (v1, v2, options) {
  if (v1 === v2)
    return options.fn(this);
  else
    return options.inverse(this);
});

Handlebars.registerHelper('select', function (value, options) {
  // Create a select element 
  const select = document.createElement('select');

  // Populate it with the option HTML
  select.innerHTML = options.fn(this);

  // Set the value
  select.value = value;

  // Find the selected node, if it exists, add the selected attribute to it
  if (select.children[select.selectedIndex])
    select.children[select.selectedIndex].setAttribute('selected', 'selected');

  return select.innerHTML;
});

// --- Image preloading with fallback ---
window.IMAGE_FALLBACK = '/assets/images/default.jpg';

window.PreloadImages = function(urls) {
  if (!urls || !urls.length) return Promise.resolve();
  var promises = urls.filter(Boolean).map(function(url) {
    return new Promise(function(resolve) {
      var img = new Image();
      img.onload = function() { resolve(url); };
      img.onerror = function() { resolve(null); };
      img.src = url;
    });
  });
  return Promise.all(promises);
};

window.HandleImageFallback = function(img) {
  img.onerror = null;
  img.src = window.IMAGE_FALLBACK;
};

window.HandleImageLoad = function(img) {
  if (!img.naturalWidth) window.HandleImageFallback(img);
};

window.RenderImageWithFallback = function(src, alt, width, height) {
  var w = width ? 'width="' + width + '" ' : '';
  var h = height ? 'height="' + height + '" ' : '';
  return '<img src="' + src + '" alt="' + alt + '" ' + w + h +
    ' onload="window.HandleImageLoad(this)"' +
    ' onerror="window.HandleImageFallback(this)"' +
    ' />';
};
