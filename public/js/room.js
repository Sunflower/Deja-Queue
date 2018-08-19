let socket = io();

$('#queueForm').submit(function(){
    console.log('Client side printing');
    let decodedPath = decodeURI(window.location.pathname);
    console.log(decodedPath);
    let pathParts = decodedPath.split("/");
    let roomName = pathParts[2];
    socket.emit('enqueue', {[roomName]: $('#name').val()});
    $('#name').val('');
    return false;
});

// Click on checkmark to dequeue student
$("ul").on("click", ".delete", function(event) {
    event.stopPropagation();

    let decodedPath = decodeURI(window.location.pathname);
    console.log(decodedPath);
    let pathParts = decodedPath.split("/");
    let roomName = pathParts[2];
    socket.emit('dequeue',
        {[roomName]: $(this).parent().children(".sName")[0].innerText});
});
        
socket.on('enqueue', function(student){
    $('#queue').append("<li>" + "<span class='sName'>" + student
    + " </span><span class='delete'><i class='fas fa-check-circle'></i></span></li>");
});

socket.on('dequeue', function(student){
    $("ul li:contains(" + student + ")").first().fadeOut(400, function() {
        $(this).remove();
    });
});