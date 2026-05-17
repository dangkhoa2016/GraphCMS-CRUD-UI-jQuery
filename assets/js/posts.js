(function() {
  'use strict';

  var queries = {
    list:
      'query {\n' +
      '  posts {\n' +
      '    id,photo,state,title,summary\n' +
      '    updatedAt,createdAt\n' +
      '    author {id,name,email}\n' +
      '  }\n' +
      '}',
    getById:
      'query Get_Post($id: ID!) {\n' +
      '  post(where: {id: $id}) {\n' +
      '    id,photo,state,title,summary,content {text}\n' +
      '    updatedAt,createdAt\n' +
      '    author {id,name,email}\n' +
      '  }\n' +
      '}',
    queryUsers:
      'query {\n' +
      '  authors { id, name, email, createdAt, updatedAt }\n' +
      '}',
    mutationAdd:
      'mutation Add_Post($title: String!,$summary: String!, $content: RichTextAST!,\n' +
      '  $photo: String, $state: String!, $userId: ID!) {\n' +
      '  createPost(data:{title: $title, summary: $summary, content: {children:[{type:"paragraph",children:[{text:$content}]}]},\n' +
      '    photo: $photo, state: $state, author: {connect: {id: $userId}}) {\n' +
      '    id, title, content{raw}, state, photo, createdAt, updatedAt, author { id, email, name }\n' +
      '  }\n' +
      '}',
    mutationEdit:
      'mutation Edit_Post($title: String!,$summary: String!, $content: String!,\n' +
      '  $photo: String, $state: String!, $userId: ID!, $id: ID!) {\n' +
      '  updatePost(data:{title: $title, summary: $summary, content: {children:[{type:"paragraph",children:[{text:$content}]}]},\n' +
      '    photo: $photo, state: $state, author: {connect: {id: $userId}}}, where:{id: $id}) {\n' +
      '    id, title, content{raw}, state, photo, createdAt, updatedAt, author { id, email, name }\n' +
      '  }\n' +
      '}',
    mutationDelete:
      'mutation Delete_Post($id: ID!) {\n' +
      '  deletePost(where:{id: $id} {\n' +
      '    id, title, summary, state, photo, createdAt, updatedAt, author { id, email, name }\n' +
      '  }\n' +
      '}'
  };

  var crud = new window.CrudBase({
    entityName: 'Post',
    formName: 'post_form',
    additionFile: { path: '/content/post_form.html', name: 'post_form' },
    queries: queries,
    dataPath: 'posts',
    validateField: 'title',
    preloadFns: [
      function() {
        return ApiService.query(queries.queryUsers).then(function(data) {
          crud.preloadData.users = data.authors;
        }).catch(function() {
          crud.preloadData.users = [];
        });
      },
      function(id) {
        if (!id) { crud.preloadData.post = {}; return Promise.resolve(); }
        return ApiService.query(queries.getById, { id: id }).then(function(data) {
          crud.preloadData.post = data.post;
        }).catch(function() {
          crud.preloadData.post = {};
        });
      }
    ],
    getEditData: function(rowData, preloadData) {
      rowData.users = preloadData.users;
      rowData.content = (preloadData.post.content || {}).text;
      return rowData;
    },
    getNewDefaults: function(preloadData) {
      return { status: 'active', users: preloadData.users };
    },
    columns: [
      { 'data': 'title' },
      {
        'data': 'summary', render: function(data, type, row) {
          return TruncateLongString(row['summary'], 100, true);
        }
      },
      {
        'data': 'photo', render: function(data, type, row) {
          return `<img src='${row['photo']}' alt='${row['title']}' />`;
        }
      },
      {
        'data': 'author', render: function(data, type, row) {
          return 'Name: ' + row['author']['name'] +
            '<br/>' + 'Email: ' + row['author']['email'];
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
