$(function(){
    $('td').on('click', function(e) {
        // Get the winner
        var winner = state.winner;

        // If there is no winner and the cell has not been clicked yet
        if (!winner && $(this).attr('play') == '0') {
            // Get the id of the state
            var id = state.id;
            // Get the current player
            var player = state.current;
            // Get the id of the clicked cell
            var cell = $(this).attr('id');

            $.ajax({
                // Route
                url : '/play/'+id+'/'+player+'/'+cell,
                type: 'GET',
                success : function(data, statut) {
                    // Reload page
                    window.location.href = '/state/'+id;
                }
            });
        }
    });
});
