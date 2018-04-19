"use strict";

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBu-FKu4A9qVzRP4DiiRfPZQNXvK4JZQLU",
    authDomain: "greenappl-ebc12.firebaseapp.com",
    databaseURL: "https://greenappl-ebc12.firebaseio.com",
    projectId: "greenappl-ebc12",
    storageBucket: "greenappl-ebc12.appspot.com",
    messagingSenderId: "863899792848"
};
firebase.initializeApp(config);

var messageAppReference = firebase.database();

$(document).ready(function () {
    $('#message-form').submit(function (event) {
        event.preventDefault();
        var message = $('#message').val();
        $('#message').val('');

        // create a section for messages data in your db
        var messagesReference = messageAppReference.ref('messages');

        // use the push method to save data to the messages
        // https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
        messagesReference.push({
            message: message,
            votes: 0
        });
    });
    messageClass.get();
});

var messageClass = function () {
    function getPosts() {
        // retrieve messages data when .on() initially executes
        // and when its data updates
        // https://firebase.google.com/docs/reference/js/firebase.database.Reference
        // https://firebase.google.com/docs/database/web/read-and-write#listen_for_value_events
        messageAppReference.ref('messages').on('value', function (results) {
            var $messageBoard = $('.message-board');
            var messages = [];

            var allMsgs = results.val();
            // iterate through results coming from database call; messages
            for (var msg in allMsgs) {
                var message = allMsgs[msg].message;
                var votes = allMsgs[msg].votes;

                // create message element
                var $messageListElement = $('<li>');

                // create delete element
                var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');
                $deleteElement.on('click', function (e) {
                    var id = $(e.target.parentNode).data('id');
                    deleteMessage(id);
                });

                // create up vote element
                var $upVoteElement = $('<i class="fa fa-thumbs-up pull-right"></i>');
                $upVoteElement.on('click', function (e) {
                    var id = $(e.target.parentNode).data('id'); //go to element that was clicked, then go to parent and look for data
                    updateMessage(id, ++allMsgs[id].votes); //look up existing number of votes, then add 1
                });

                // create down vote element
                var $downVoteElement = $('<i class="fa fa-thumbs-down pull-right"></i>');
                $downVoteElement.on('click', function (e) {
                    var id = $(e.target.parentNode).data('id'); //go to element that was clicked, then go to parent and look for data
                    updateMessage(id, --allMsgs[id].votes); //look up existing number of votes, then add 1
                });

                // add id as data attribute so we can refer to later for updating
                $messageListElement.attr('data-id', msg);

                // add message to li
                $messageListElement.html(message);

                // add delete element
                $messageListElement.append($deleteElement);

                // add voting elements
                $messageListElement.append($upVoteElement);
                $messageListElement.append($downVoteElement);

                // show votes
                $messageListElement.append('<div class="pull-right">' + votes + '</div>');

                // push element to array of messages -- this is pushing to an array, not HTTP push
                messages.push($messageListElement);
            }

            // remove lis to avoid dupes 
            // .empty() is a jQuery method to remove all child nodes
            $messageBoard.empty();
            for (var i in messages) {
                $messageBoard.append(messages[i]);
            }
        });
    }

    function updateMessage(id, votes) {
        var messageReference = messageAppReference.ref('messages').child(id);
        messageReference.update({ //reference to record i want to change
            votes: votes //key+value pairs for records I want to change
        });
    }

    function deleteMessage(id) {
        var messageReference = messageAppReference.ref('messages').child(id);
        messageReference.remove();
    }
    return {
        get: getPosts
    };
}();