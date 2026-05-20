(function() {
  'use strict';

  var queries = {
    list:
      'query {\n' +
      '  comments {\n' +
      '    id,comment,state,createdAt,updatedAt\n' +
      '    post {\n' +
      '      id,title,state\n' +
      '    }\n' +
      '    author {\n' +
      '      id,name,email,state\n' +
      '    }\n' +
      '  }\n' +
      '}',
    queryUsers:
      'query {\n' +
      '  authors { id, name, email, createdAt, updatedAt }\n' +
      '}',
    queryPosts:
      'query {\n' +
      '  posts { id, title, createdAt, updatedAt }\n' +
      '}',
    mutationAdd:
      'mutation Add_Comment($comment: String!, $state: String!, $userId: ID!, $postId: ID!) {\n' +
      '  createComment(data:{comment: $comment,\n' +
      '    state: $state, author: {connect: {id: $userId}}, post: {connect: {id: $postId}}}) {\n' +
      '    id, comment, state, createdAt, updatedAt, author { id, email, name }, post { id, title }\n' +
      '  }\n' +
      '}',
    mutationEdit:
      'mutation Edit_Comment($comment: String!, $state: String!, $userId: ID!, $postId: ID!, $id: ID!) {\n' +
      '  updateComment(data:{comment: $comment,\n' +
      '    state: $state, author: {connect: {id: $userId}}, post: {connect: {id: $postId}}}, where:{id: $id}) {\n' +
      '    id, comment, state, createdAt, updatedAt, author { id, email, name }, post { id, title }\n' +
      '  }\n' +
      '}',
    mutationDelete:
      'mutation Delete_Comment($id: ID!) {\n' +
      '  deleteComment(where:{id: $id}) {\n' +
      '    id, comment, state, createdAt, updatedAt, author { id, email, name }, post { id, title }\n' +
      '  }\n' +
      '}'
  };

  var crud = new window.CrudBase({
    entityName: 'Comment',
    formName: 'comment_form',
    additionFile: { path: '/content/comment_form.html', name: 'comment_form' },
    queries: queries,
    dataPath: 'comments',
    validateField: 'comment',
    preloadFns: [
      function() {
        return ApiService.query(queries.queryPosts).then(function(data) {
          crud.preloadData.posts = data.posts;
        }).catch(function() {
          crud.preloadData.posts = [];
        });
      },
      function() {
        return ApiService.query(queries.queryUsers).then(function(data) {
          crud.preloadData.users = data.authors;
        }).catch(function() {
          crud.preloadData.users = [];
        });
      }
    ],
    getEditData: function(rowData, preloadData) {
      rowData.users = preloadData.users;
      rowData.posts = preloadData.posts;
      return rowData;
    },
    getNewDefaults: function(preloadData) {
      return { status: 'active', users: preloadData.users, posts: preloadData.posts };
    },
    columns: [
      {
        'data': 'comment', render: function(data, type, row) {
          if (type === 'display') {
            var badge;
            switch (row.state) {
              case 'active':   badge = '<span class="badge badge-success">Active</span>'; break;
              case 'draft':    badge = '<span class="badge badge-secondary">Draft</span>'; break;
              case 'disabled': badge = '<span class="badge badge-danger">Disabled</span>'; break;
              default:         badge = '';
            }
            return TruncateLongString(row['comment'], 100, true) + '<br/>' + badge;
          }
          return data;
        }
      },
      {
        'data': 'post.title', render: function(data, type, row) {
          if (type === 'display') {
            var postState = row['post'].state;
            var badge;
            switch (postState) {
              case 'active':   badge = '<span class="badge badge-success">Published</span>'; break;
              case 'draft':    badge = '<span class="badge badge-secondary">Draft</span>'; break;
              case 'disabled': badge = '<span class="badge badge-danger">Disabled</span>'; break;
              default:         badge = '';
            }
            return data + '<br/>' + badge;
          }
          return data;
        }
      },
      {
        'data': 'author', render: function(data, type, row) {
          if (type === 'display') {
            var authorState = row['author'].state;
            var badge = authorState === 'active'
              ? '<span class="badge badge-success">Active</span>'
              : '<span class="badge badge-secondary">Inactive</span>';
            return 'Name: ' + row['author']['name'] +
              '<br/>' + 'Email: ' + row['author']['email'] +
              '<br/>' + badge;
          }
          return data;
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
