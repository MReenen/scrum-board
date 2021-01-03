/**
 * scrum-board
 *
 * @category   scrum-board
 * @author     Vaibhav Mehta <vaibhav@decodingweb.com>
 * @copyright  Copyright (c) 2016 Vaibhav Mehta <https://github.com/i-break-codes>
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @version    1.0 Beta
 */

var App = function() {
  function init() {
    tips();
    preset();
    addStatusColumns();
    changeStatus();
    draggable();
    droppable();
    openCard();
    createTask();
    closeModal();
    printNotes();
    editTask();
    exitEditMode();
    exportData();
    importData();
  }

  function exportData(){
    function getFullData(){
      var data = {};
      data['status'] = JSON.parse(localStorage.getItem('status'));
      data['taskCounter'] = parseInt(localStorage.getItem('taskCounter'));
      for(var i=0; i <= data['taskCounter']; i++){
        const task = localStorage.getItem('task-' + i);
        if(task != null)
          data['task-' + i] = JSON.parse(task)
      }
      console.log(data);
      return data;
    }

    $('#export').on('click', function(e){
      var btn = document.createElement('a');
      btn.setAttribute('download', 'scrum-backup.json');
      btn.style.display = 'none';
    
      var url = JSON.stringify(getFullData());
      url = encodeURI("data:text/json;charset=utf-8," + url);
      btn.setAttribute('href', url);
      
      document.body.appendChild(btn);
      btn.click();
      btn.remove();
    })
  }

  function importData(){
    $('#import').on('click', function(e){
        e.preventDefault();

        $('#import-modal').removeClass('hide');
    });
    $('#import-modal').find('form').on('submit', function(e){
      e.preventDefault();
      var file = e.target[0].files[0];

      var fr = new FileReader();
      fr.onload = function(){
        var data = JSON.parse(fr.result);
        for(key in data){
          if(!data.hasOwnProperty(key))
            continue;
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
        window.location.reload()
      }
      fr.readAsText(file);

      $('.close-modal').trigger('click');
    });
  }
  
  function preset() {
    $('#remove').on('click', function(e) {
      e.preventDefault();
    });
    
    var defaultTask = {
      id: 1,
      title: 'This is a sample task',
      description: 'Sample tasks are useful to get started',
      remote_url: 'https://asana.com/12345/1234',
      assigned_to: 'Jon Doe',
      status: 'pending'
    }
    
    if(!localStorage.getItem('appInitialized', true)) {
      localStorage.setItem('taskCounter', 1);
      localStorage.setItem('status', JSON.stringify([
        {key: 'rejected', value: 'Rejected'}, 
        {key: 'pending', value: 'Pending'}, 
        {key: 'development', value: 'Development'}, 
        {key: 'testing', value: 'Testing'}, 
        {key: 'production', value: 'Production'}]));
      localStorage.setItem('task-1', JSON.stringify(defaultTask));
      localStorage.setItem('appInitialized', true);
    }
  }

  function addStatusColumns(){

    var statusArr = JSON.parse(localStorage.getItem('status'));
    var headerObj = $('header ul');
    var myDashboard = $('#dashboard');
    statusArr.map(function(item){
      var newLi = $('<li>' + item.value + '</li>');
      newLi.attr('data-id', item.key);
      headerObj.append(newLi);

      var newDiv = $('<div id=' + item.key + ' class=' + item.key + '></div>');
      myDashboard.append(newDiv);
    });
    
  }

  function changeStatus(){
    $('header li').on('dblclick', function(e){
        e.preventDefault();
        var statusToChange = $(this).attr('data-id');

        $('#change-status-modal').removeClass('hide');

        $('#new_status').val($(this).text());
        $('#new_status_id').val(statusToChange);
    });
    $('#change-status-modal').find('form').on('submit', function(e){
      e.preventDefault();
      var newStatus = $('#new_status').val();
      var newStatusId = $('#new_status_id').val();
      var currentStatus = JSON.parse(localStorage.getItem('status'));
      currentStatus.map(function(obj){
        if(obj.key == newStatusId)
        {
          obj.value = newStatus;
        }
      });

      $('header ul li[data-id=' + newStatusId + ']').html(newStatus);

      localStorage.setItem('status', JSON.stringify(currentStatus));

      $('.close-modal').trigger('click');
    });
  }
  
  function createTask() {
    var source = $("#task-card-template").html();
    var template = Handlebars.compile(source);
    
    $('#add-task').on('click', function(e) {
      e.preventDefault();
      $('#add-task-modal').removeClass('hide');
      
      $('#add-task-modal').find('form').on('submit', function(e) {
        e.preventDefault();
        var obj = {};
        var params = $(this).serialize();
        var splitParams = params.split('&');
        
        for(var i = 0, l = splitParams.length; i < l; i++) {
          var keyVal = splitParams[i].split('=');
          obj[keyVal[0]] = unescape(keyVal[1]);
        }

        // TODO: Add validations
        if(obj.description === '' || obj.title === '') {
          return;
        }
        
        var iid = localStorage.getItem('taskCounter');
        obj.id = ++iid;
        obj.status = 'pending';
        localStorage.setItem('task-' + obj.id, JSON.stringify(obj));
        localStorage.setItem('taskCounter', iid);
        
        var newCard = template([obj]);
        $('#dashboard #' + obj.status).append(newCard);
        draggable();
        
        $('.close-modal').trigger('click');
        
        //Clear form fields after submit
        $(this).find('input[type=text], textarea').val('');
      });
      
    });
  }
  
  function editTask() {
    $(document).on('dblclick', '.card-details', function(e) {
      e.stopPropagation();
      $(this).find('p').attr('contenteditable','true').parents('.card').addClass('edit-mode');
    });
    
    $(document).on('input', '.card p', function() {
      var taskId = $(this).parents('.card').data('task-id');
      var fieldToEdit = $(this).data('field');
      var getTaskData = JSON.parse(localStorage.getItem('task-' + taskId));
      
      getTaskData[fieldToEdit] = $(this).text();
      
      localStorage.setItem('task-' + taskId, JSON.stringify(getTaskData));
    });
  }
  
  function exitEditMode() {
    $(document).on('dblclick', function(e) {
      $('.card').removeClass('edit-mode').find('[contenteditable]').removeAttr('contenteditable');
    });
  }
  
  function closeModal() {
    $('.close-modal').on('click', function() {
      $('.modal').addClass('hide');
    })
  }
  
  function draggable() {
    $('.card').draggable({
      handle: 'h5',
      revert: false,
      helper: function(e) {
        //Cloning element, to enable draggable elements move out of scrollable parent element.
        var original = $(e.target).hasClass("ui-draggable") ? $(e.target) : $(e.target).closest(".ui-draggable");
        return original.clone().css({
          width: original.width()
        });
      },
      scroll: false,
      cursor: 'move',
      start: function(event, ui) {},
      stop: function(event, ui) {}
    });
  }
  
  function droppable() {
    var droppableConfig = {
      tolerance: 'pointer',
      drop: function(event, ui) {
        var elm = ui.draggable,
            parentId = elm.parent().attr('id'),
            currentId = $(this).attr('id'),
            taskId = elm.data('task-id');
        
        if($(this).attr('id') == 'remove') {
          //Deletes task
          elm.remove();
          localStorage.removeItem('task-' + taskId);
          $('#removed-task-notification').text('Task removed successfully').removeClass('hide');
          
          
          setTimeout(function() {
            $('#removed-task-notification').text('').addClass('hide');
          }, 3000);
        } else {
          //Moves task
          if(parentId != currentId) {
            $(elm).detach().removeAttr('style').appendTo(this);
            
            var getTaskData = JSON.parse(localStorage.getItem('task-' + taskId));
            getTaskData.status = currentId;
            
            localStorage.setItem('task-' + taskId, JSON.stringify(getTaskData));
          }
        }
        
        $(this).removeClass('dragged-over');
      },
      over: function(event, ui) {
        $(this).addClass('dragged-over');
      },
      out: function(event, ui) {
        $(this).removeClass('dragged-over');
      }
    }
    
    $('#dashboard > div, #remove').droppable(droppableConfig);
  }
  
  function openCard() {
    $(document).on('click', '.expand-card', function(e) {
      $(this).parent().toggleClass('expanded');
      e.preventDefault();
    });
  }
  
  function getAllNotes() {
    var getAllData = localStorage;
    var getTasks = [];
    
    for(var data in getAllData) {
      if(data.split('-')[0] == 'task') {
        getTasks.push(JSON.parse(localStorage[data]));
      }
    }
    
    return getTasks;
  }
  
  function printNotes() {
    var source = $("#task-card-template").html();
    var template = Handlebars.compile(source);
    
    var status = JSON.parse(localStorage.getItem('status'));
    
    for(var i = 0, l = status.length; i < l; i++) {
      var result = App.getAllNotes().filter(function(obj) {
        return obj.status == status[i].key;
      });
      
      if(result) {
        var cards = template(result);
        $('#dashboard #' + status[i].key).append(cards);
        draggable();
      }
    }
  }
  
  function tips() {
    if(!JSON.parse(localStorage.getItem('showedTip'))) {
      $('#tips').removeClass('hide').addClass('tips');
    }
    
    $('#tips').on('click', function() {
      $(this).addClass('hide');
      localStorage.setItem('showedTip', true);
    });
  }
  
  return {
    init: init,
    getAllNotes: getAllNotes
  }
}();

App.init();