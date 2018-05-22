let socket = io();

$('form').submit(function(){
    console.log('client side printing wowowowowwo!!');
    console.log(window.location.pathname);
    let path = window.location.pathname;
    let pathParts = path.split("/");
    let roomName = pathParts[2];
    socket.emit('enqueue', {[roomName]: $('#name').val()});
    $('#name').val('');
    return false;
});

// Click on checkmark to dequeue student
$("ul").on("click", ".delete", function(event) {
    event.stopPropagation();

    let path = window.location.pathname;
    let pathParts = path.split("/");
    let roomName = pathParts[2];
    socket.emit('dequeue',
        {[roomName]: $(this).parent().children(".sName")[0].innerText});
});
        
socket.on('enqueue', function(student){
    $('#queue').append("<li>" + "<span class='sName'>" + student
    + " </span><span class='delete'><i class='fas fa-check'></i></span></li>");
});

socket.on('dequeue', function(student){
    $("ul li:contains(" + student + ")").first().fadeOut(400, function() {
        $(this).remove();
    });
});