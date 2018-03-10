$(function() {
    $('.saveButton').on('click', function() {
        var headlineId = $(this).attr('data-id');
        $.ajax({
            method: 'POST',
            url: '/saved/' + headlineId,
        }).then(function(data) {
            console.log(data);
        });
    });

    $('.unsaveButton').on('click', function() {
        var headlineId = $(this).attr('data-id');
        console.log(headlineId);
        $.ajax({
            method: 'POST',
            url: '/unsaved/' + headlineId,
        }).then(function(data) {
            location.reload();
        });
    })

    $('.modalButton').on('click', function() {
        var headlineTarget = $(this).attr('data-target');
        var headlineId = headlineTarget.substr(1);
        $('#userNotes' + headlineId).empty();
        $.ajax({
            method: 'GET',
            url: '/api/headline/' + headlineId
        }).then(function(data) {
            console.log(data);
            if (data.note) {
                for (var i = 0; i < data.note.length; i++) {
                    var noteDiv = $('<div class="card"><div class="card-body"><p>' + data.note[i].body + '</p><button id="' + data.note[i]._id +'" class="btn btn-outline-danger btn-sm deleteButton float-right" type="submit">Delete Note</button></div></div><br />');
                    $('#userNotes' + headlineId).append(noteDiv);
                    $('#' + data.note[i]._id).on('click', function() {
                        var deleteId = $(this).attr('id');
                        $.ajax({
                            type: 'DELETE',
                            url: '/api/note/' + deleteId
                        }).then(function(data) {
                            location.reload();
                        });
                    });
                }         
            }
        });
    });

    $('.newNote').on('click', function() {
        var headlineId = $(this).attr('data-id');
        $.ajax({
            type: 'POST',
            url: '/api/headline/' + headlineId,
            data: {
                body: $('#noteInput' + headlineId).val().trim()
            }
        }).then(function(data) {
            location.reload();
        });
    });
});