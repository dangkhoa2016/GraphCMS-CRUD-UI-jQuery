window.CrudBase = function(config) {
  'use strict';

  var self = this;

  // --- State ---
  this.entityName = config.entityName;
  this.preloadData = {};
  this.formHelper = null;

  // --- Set global expected by script.js ---
  window.addition_file = config.additionFile;

  // --- Internal references ---
  var queries = config.queries;
  var dataPath = config.dataPath;
  var validateField = config.validateField;
  var transformPayload = config.transformPayload || function(d) { return d; };
  var preloadFns = config.preloadFns || [];

  // --- Private methods ---

  function saveData(action, form_json) {
    var isValid = true;
    if (!form_json) {
      isValid = false;
    } else if (typeof validateField === 'function') {
      isValid = validateField(form_json);
    } else if (validateField) {
      isValid = !!(form_json[validateField] || form_json.id);
    }

    if (!isValid) {
      Swal.fire({ icon: 'warning', title: 'Invalid Data', text: 'Please fill in the required fields.' });
      return;
    }

    var mutation = '';
    switch (action) {
      case 'create': mutation = queries.mutationAdd; break;
      case 'update': mutation = queries.mutationEdit; break;
      case 'delete': mutation = queries.mutationDelete; break;
    }

    if (!mutation) return;

    form_json = transformPayload(form_json);

    Swal.fire({ title: 'Saving...', allowOutsideClick: false, didOpen: function() { Swal.showLoading(); } });
    ApiService.query(mutation, form_json).then(function(data) {
      self.formHelper.closeForm();
      Swal.fire({ icon: 'success', title: 'Success', text: 'Record saved successfully.', timer: 2000, showConfirmButton: false });
      window.table_js.ajax.reload();
    }).catch(function(err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Request failed' });
    });
  }

  function loadDataDropdown(id, callback) {
    var promises = preloadFns.map(function(fn) { return fn(id); });
    Promise.all(promises).then(function() {
      if (typeof callback === 'function') callback();
    }).catch(function(ex) {
      console.log('preload error', ex);
      if (typeof callback === 'function') callback();
    });
  }

  // --- Public methods ---

  this.showEditModal = function(indx) {
    if (typeof indx !== 'number' || !self.formHelper) return;

    var rowData = window.table_js.rows(indx).data()[0];
    loadDataDropdown(rowData.id, function() {
      var data = config.getEditData(rowData, self.preloadData);
      self.formHelper.showFormEdit(data, 'update', saveData);
    });
  };

  this.confirmDelete = function(indx) {
    if (typeof indx !== 'number' || !self.formHelper) return;

    var data = window.table_js.rows(indx).data()[0];
    self.formHelper.showFormConfirmDelete(data, 'delete', saveData);
  };

  this.initPage = function(arrContent) {
    var imageField = config.imageField;

    window.table_js = $('#dataTable').DataTable($.extend({}, config.tableOptions, {
      ajax: function(data, callback, settings) {
        ApiService.queryAjax(queries.list).then(function(res) {
          var rows = res.data ? res.data[dataPath] : [];
          if (imageField && typeof PreloadImages === 'function') {
            var urls = rows.map(function(r) { return r[imageField]; }).filter(Boolean);
            PreloadImages(urls);
          }
          callback({ data: rows });
        }).catch(function() {
          callback({ data: [] });
        });
      },
      columns: config.columns
    }));

    window.ShowEditModal = self.showEditModal;
    window.ConfirmDelete = self.confirmDelete;

    $('#btn-add').click(function(e) {
      e.preventDefault();
      loadDataDropdown('', function() {
        var defaults = config.getNewDefaults(self.preloadData);
        self.formHelper.showFormNew(defaults, 'create', saveData);
      });
    });

    var formName = config.formName;
    var formEntry = arrContent.find(function(el) {
      return el.name.toLowerCase() === formName.toLowerCase();
    });
    self.formHelper = new ModalForm({
      formTemplate: formEntry ? formEntry.content : '',
      entityName: self.entityName
    });
  };
};
