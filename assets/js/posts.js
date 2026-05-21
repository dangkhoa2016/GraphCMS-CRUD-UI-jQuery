(function() {
  'use strict';

  var queries = {
    list:
      'query {\n' +
      '  posts {\n' +
      '    id,photo,state,title,summary\n' +
      '    updatedAt,createdAt\n' +
      '    author {id,name,email,state}\n' +
      '  }\n' +
      '}',
    getById:
      'query Get_Post($id: ID!) {\n' +
      '  post(where: {id: $id}) {\n' +
      '    id,photo,state,title,summary,content {text}\n' +
      '    updatedAt,createdAt\n' +
      '    author {id,name,email,state}\n' +
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
    imageField: 'photo',
    getEditData: function(rowData, preloadData) {
      rowData.users = preloadData.users;
      rowData.content = (preloadData.post.content || {}).text;
      return rowData;
    },
    getNewDefaults: function(preloadData) {
      return { status: 'active', users: preloadData.users };
    },
    columns: [
      {
        'data': 'title', render: function(data, type, row) {
          if (type === 'display') {
            var badge;
            switch (row.state) {
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
        'data': 'summary', render: function(data, type, row) {
          return TruncateLongString(row['summary'], 100, true);
        }
      },
      {
        'data': 'photo', render: function(data, type, row) {
          if (type === 'display') {
            var src = row['photo'] || window.IMAGE_FALLBACK;
            return RenderImageWithFallback(src, row['title'] || '', '', '');
          }
          return data;
        }
      },
      {
        'data': 'author', render: function(data, type, row) {
          if (type === 'display') {
            var authorState = row['author'].state;
            var badge;
            switch (authorState) {
              case 'active':   badge = '<span class="badge badge-success">Active</span>'; break;
              case 'disabled': badge = '<span class="badge badge-secondary">Inactive</span>'; break;
              default:         badge = '';
            }
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
