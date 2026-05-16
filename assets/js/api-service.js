window.ApiService = (function() {
  'use strict';

  const endpoint = window.APP_CONFIG.API_ENDPOINT;

  function request(query, variables) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: endpoint,
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({ query: query, variables: variables }),
        success: function(res) {
          if (res.errors) {
            reject(new Error(res.errors[0].message));
            return;
          }
          resolve(res.data);
        },
        error: function(ex) {
          reject(ex);
        }
      });
    });
  }

  function requestAjax(query, variables) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: endpoint,
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({ query: query, variables: variables }),
        complete: function(res, status) {
          if (status === 'success' && res.responseJSON) {
            resolve(res.responseJSON);
          } else {
            reject(new Error('Request failed'));
          }
        }
      });
    });
  }

  return {
    query: function(graphqlQuery, variables) {
      return request(graphqlQuery, variables);
    },
    queryAjax: function(graphqlQuery, variables) {
      return requestAjax(graphqlQuery, variables);
    },
    getEndpoint: function() {
      return endpoint;
    }
  };
})();
