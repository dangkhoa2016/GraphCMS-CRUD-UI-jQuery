(function() {
  'use strict';

  var queries = {
    list:
      'query {\n' +
      '  authors {\n' +
      '    id, email, name, phone, state, points, updatedAt, createdAt\n' +
      '    posts {\n' +
      '      id, title\n' +
      '    }\n' +
      '    comments {\n' +
      '      id, comment\n' +
      '    }\n' +
      '  }\n' +
      '}',
    getById:
      'query Get_User($id: ID!) {\n' +
      '  author(where: {id: $id}) {\n' +
      '    birthday\n' +
      '    createdAt\n' +
      '    email\n' +
      '    id\n' +
      '    name\n' +
      '    phone\n' +
      '    points\n' +
      '    state\n' +
      '    updatedAt\n' +
      '  }\n' +
      '}',
    mutationAdd:
      'mutation Add_User($name: String!, $email: String!, $phone: String, $state: String!, $birthday: String, $points: Int) {\n' +
      '  createAuthor(data: {name: $name, email: $email, state: $state, phone: $phone, birthday: $birthday, points: $points}) {\n' +
      '    id,name,email,phone,birthday,state,points, createdAt, updatedAt\n' +
      '  }\n' +
      '}',
    mutationEdit:
      'mutation Edit_User($name: String!, $email: String!, $phone: String, $state: String!, $birthday: String, $points: Int, $id: ID!) {\n' +
      '  updateAuthor(data: {name: $name, email: $email, state: $state, phone: $phone, birthday: $birthday, points: $points}, where:{id: $id}) {\n' +
      '    id,name,email,phone,birthday,state,points, createdAt, updatedAt\n' +
      '  }\n' +
      '}',
    mutationDelete:
      'mutation Delete_User($id: ID!) {\n' +
      '  deleteAuthor(where:{id: $id}) {\n' +
      '    id,name,email,phone,birthday,state,points, createdAt, updatedAt\n' +
      '  }\n' +
      '}'
  };

  var crud = new window.CrudBase({
    entityName: 'User',
    formName: 'user_form',
    additionFile: { path: '/content/user_form.html', name: 'user_form' },
    queries: queries,
    dataPath: 'authors',
    validateField: 'name',
    transformPayload: function(form_json) {
      form_json.points = parseInt(form_json.points);
      return form_json;
    },
    preloadFns: [
      function(id) {
        if (!id) { crud.preloadData.user = {}; return Promise.resolve(); }
        return ApiService.query(queries.getById, { id: id }).then(function(data) {
          crud.preloadData.user = data.author;
        }).catch(function() {
          crud.preloadData.user = {};
        });
      }
    ],
    getEditData: function(rowData, preloadData) {
      return preloadData.user;
    },
    getNewDefaults: function() {
      return { points: 0, state: 'active' };
    },
    columns: [
      {
        'data': 'name', render: function(data, type, row) {
          if (type === 'display') {
            var badge = row.state === 'active'
              ? '<span class="badge badge-success">Active</span>'
              : '<span class="badge badge-secondary">Inactive</span>';
            return data + '<br/>' + badge;
          }
          return data;
        }
      },
      {
        'data': 'email', render: function(data, type, row) {
          if (type === 'display') {
            var badge = row.state === 'active'
              ? '<span class="badge badge-success">Active</span>'
              : '<span class="badge badge-secondary">Inactive</span>';
            return data + '<br/>' + badge;
          }
          return data;
        }
      },
      {
        'data': 'posts.length', render: function(data, type, row) {
          return accounting.formatNumber(row['posts'].length);
        }
      },
      {
        'data': 'points', render: function(data, type, row) {
          return accounting.formatNumber(row['points']);
        }
      },
      {
        'data': 'updatedAt',
        render: function(data, type, row) {
          return 'Created at:<br/>' + (row['createdAt'] ? Handlebars.helpers.formatTime(row['createdAt'], 'MMM Do YYYY, h:mm:ss a') : '') +
            '<br/>Updated at:<br/>' +
            (row['updatedAt'] ? `<span class='badge bg-info text-white'>` + Handlebars.helpers.formatTime(row['updatedAt'], 'MMM Do YYYY, h:mm:ss a') + '</span>' : '');
        }
      },
      {
        'data': '', 'orderable': false, className: 'project-actions text-right text-nowrap', render: function(data, type, row, meta) {
          return `
            <a class='btn btn-info btn-sm mx-1' href='javascript:ShowEditModal(${meta.row});'><i class='fas fa-pencil-alt'></i>
            Edit</a>
            <a class='btn btn-danger btn-sm' href='javascript:void(0);' onclick='ConfirmDelete(${meta.row});'><i class='fas fa-trash'></i>
            Delete</a>`;
        }
      }
    ]
  });

  window.InitPage = function(arrContent) {
    crud.initPage(arrContent);
  };
})();
