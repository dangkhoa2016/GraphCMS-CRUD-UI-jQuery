window.table_js = null;
window.addition_file = { path: '/content/post_form.html', name: 'post_form' };
let formHelper = null;

const preloadData = {
  users: [],
  post: {}
};

const queryUsers = `
query { 
  authors { id, name, email, createdAt, updatedAt }
}
`;

const query = `
query {
  posts {
    id,photo,state,title,summary
    updatedAt,createdAt
    author {id,name,email}
  }
}
`;

const getById = `
query Get_Post($id: ID!) {
  post(where: {id: $id}) {
    id,photo,state,title,summary,content {text}
    updatedAt,createdAt
    author {id,name,email}
  }
}
`;

const mutationAdd = `
mutation Add_Post($title: String!,$summary: String!, $content: RichTextAST!,
  $photo: String, $state: String!, $userId: ID!) {
  createPost(data:{title: $title, summary: $summary, content: {children:[{type:"paragraph",children:[{text:$content}]}]},
    photo: $photo, state: $state, author: {connect: {id: $userId}}}) {
    id, title, content{raw}, state, photo, createdAt, updatedAt, author { id, email, name }
  }
}
`;

const mutationEdit = `
mutation Edit_Post($title: String!,$summary: String!, $content: String!,
  $photo: String, $state: String!, $userId: ID!, $id: ID!) {
  updatePost(data:{title: $title, summary: $summary, content: {children:[{type:"paragraph",children:[{text:$content}]}]},
    photo: $photo, state: $state, author: {connect: {id: $userId}}}, where:{id: $id}) {
    id, title, content{raw}, state, photo, createdAt, updatedAt, author { id, email, name }
  }
}
`;

const mutationDelete = `
mutation Delete_Post($id: ID!) {
  deletePost(where:{id: $id} {
    id, title, summary, state, photo, createdAt, updatedAt, author { id, email, name }
  }
}
`;



function SaveData(action, form_json) {
  if (!form_json || !(form_json.title || form_json.id)) {
    $('#msg-error').removeClass('d-none').find('.text-danger').html('Invalid data');
    return;
  }

  let mutation = '';
  switch (action) {
    case 'create':
      mutation = mutationAdd;
      break;
    case 'update':
      mutation = mutationEdit;
      break;
    case 'delete':
      mutation = mutationDelete;
      break;
  }

  if (!mutation)
    return;

  $.ajax({
    beforeSend: function () {
      $('#msg-error').addClass('d-none');
    },
    contentType: 'application/json',
    url: mainHost, type: 'post',
    data: JSON.stringify({ query: mutation, variables: form_json }),
    success: function (res) {
      // console.log('success', res);
      if (!res)
        return;

      if (res.errors) {
        $('#msg-error').removeClass('d-none').find('.text-danger').html(res.errors[0].message);
        return;
      }

      if (res.data) {
        formHelper.closeForm();
        table_js.ajax.reload();
      }
    },
    error: function (ex) {
      console.log('Error', ex);
    }
  });
};

function GetUsers() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      contentType: 'application/json',
      url: mainHost, type: 'post',
      data: JSON.stringify({ query: queryUsers }),
      success: function (res) {
        preloadData.users = res.data.authors;
        resolve();
      },
      error: function (ex) {
        // console.log('Error', ex);
        preloadData.users = [];
        resolve();
      }
    });
  });
};

function GetPost(id) {
  return new Promise(function (resolve, reject) {
    if (!id) {
      preloadData.post = {};
      return resolve();
    }

    $.ajax({
      contentType: 'application/json',
      url: mainHost, type: 'post',
      data: JSON.stringify({ query: getById, variables: { id } }),
      success: function (res) {
        preloadData.post = res.data.post;
        resolve();
      },
      error: function (ex) {
        console.log('Error', ex);
        preloadData.post = {};
        resolve();
      }
    });
  });
};

function LoadDataDropdown(id, callback) {
  Promise.all([GetUsers(), GetPost(id)]).then(() => {
    //console.log('done', preloadData);
    if (typeof callback === 'function')
      callback();
  }).catch((ex) => {
    console.log('error', ex);
    if (typeof callback === 'function')
      callback();
  });
};

window.ShowEditModal = function (indx) {
  if (typeof indx !== 'number')
    return;

  if (!formHelper)
    return;

  const data = table_js.rows(indx).data()[0];
  LoadDataDropdown(data.id, function () {
    data.users = preloadData.users;
    data.content = (preloadData.post.content || {}).text;
    formHelper.showFormEdit(data, 'update', SaveData);
  });
};

window.ConfirmDelete = function (indx) {
  if (typeof indx !== 'number')
    return;

  if (!formHelper)
    return;

  const data = table_js.rows(indx).data()[0];
  formHelper.showFormConfirmDelete(data, 'delete', SaveData);
};

window.InitPage = function (arrContent) {
  table_js = $('#dataTable').DataTable({
    'ajax': function (data, callback, settings) {
      // console.log(data, callback, settings);
      $.ajax({
        url: mainHost,
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({ query }),
        complete: function (res, status) {
          // console.log(res.responseJSON.data.posts, status)
          var result = { data: [] }
          if (status === 'success')
            result.data = res.responseJSON.data && res.responseJSON.data.posts;
          callback(result);
        }
      });
    },
    'columns': [
      { 'data': 'title' },
      {
        'data': 'summary', render: function (data, type, row) {
          return TruncateLongString(row['summary'], 100, true);
        }
      },
      {
        'data': 'photo', render: function (data, type, row) {
          return `<img src='${row['photo']}' alt='${row['title']}' />`;
        }
      },
      {
        'data': 'author', render: function (data, type, row) {
          return 'Name: ' + row['author']['name'] +
            '<br/>' + 'Email: ' + row['author']['email'];
        }
      },
      {
        'data': 'updatedAt',
        render: function (data, type, row) {
          return 'Created at:<br/>' + (row['createdAt'] ? Handlebars.helpers.formatTime(row['createdAt'], 'MMM Do YYYY, h:mm:ss a') : '') +
            '<br/>Updated at:<br/>' +
            (row['updatedAt'] ? `<span class='badge bg-info text-white'>` + Handlebars.helpers.formatTime(row['updatedAt'], 'MMM Do YYYY, h:mm:ss a') + '</span>' : '');
        }
      },
      {
        'data': '', 'orderable': false, className: 'project-actions text-right text-nowrap', render: function (data, type, row, meta) {
          return `
            <a class='btn btn-info btn-sm mx-1' href='javascript:ShowEditModal(${meta.row});'><i class='fas fa-pencil-alt'></i>
            Edit</a>
            <a class='btn btn-danger btn-sm' href='javascript:void(0);' onclick='ConfirmDelete(${meta.row});'><i class='fas fa-trash'></i>
            Delete</a>`;

        }
      }
    ]
  });

  $('#btn-add').click(function (e) {
    e.preventDefault();
    LoadDataDropdown('', function () {
      formHelper.showFormNew({ status: 'active', users: preloadData.users }, 'create', SaveData);
    });
  });

  const form = arrContent.find((el) => { return el.name.toLowerCase() === 'post_form' });
  formHelper = new ModalForm({ formTemplate: form.content, entityName: 'Post' });
};
