  // Initialize Firebase


const messageAppReference = firebase.database();

var performerUrl = 'https://api.seatgeek.com/2/events?&genres.slug=electronic&venue.slug=';
var startUrl = '&datetime_utc.gte='
var endUrl = '&datetime_utc.lte='
var clientId = '&client_id=MTExNDcwODh8MTUyMzEzOTY1Ni44NA';
var allResults;
var addList;

$(document).ready(function(){ 
  function getPosts() {
    // retrieve messages data when .on() initially executes
    // and when its data updates
    // https://firebase.google.com/docs/reference/js/firebase.database.Reference
    // https://firebase.google.com/docs/database/web/read-and-write#listen_for_value_events
    messageAppReference.ref('messages').on('value', function (results) {
      const $messageBoard = $('.message-board');
      const messages = [];
      console.log(messages);
      const allMsgs = results.val();
      console.log(allMsgs);
      // iterate through results coming from database call; messages
      for (let msg in allMsgs) {
        const message = allMsgs[msg].allResults;
        console.log(allMsgs[msg]);
        const concertLink = allMsgs[msg].concertLink;
        var concertPrice = Number(allMsgs[msg].concertPrice);
        const linkText = "Bought Tickets?";

        // create message element
        const $messageListElement = $('<li>');

        // create delete element
        const $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');
        $deleteElement.on('click', function(e){
            const id = $(e.target.parentNode).data('id');
            deleteMessage(id);
        });   

        //create check box element
        var $checkBoxElement = $("<input>");
        $checkBoxElement.attr("type", "checkbox");
        $checkBoxElement.attr("id", msg);
        $checkBoxElement.attr("data-id", concertPrice);

        // add id as data attribute so we can refer to later for updating
        $messageListElement.attr('data-id', msg);

        // add message to li
        $messageListElement.html(message);

        // add delete element
        $messageListElement.append($deleteElement);

        //add checkbox
        $messageListElement.append(linkText.link(concertLink)).append(" ").append($checkBoxElement);

       
        // push element to array of messages -- this is pushing to an array, not HTTP push
        messages.push($messageListElement);
      }
      
     function changeCalc(){
        console.log("changeCalc running");
        var totalCost = 0;
        $("#totalCost span").text(totalCost);
        $("input[type=checkbox]:checked").each(function(){
            concertPriceX = $(this).data('id');
            console.log(concertPriceX);
            totalCost += concertPriceX;
            $("#totalCost span").text(totalCost);
            console.log(totalCost);
            const checkId = $(this).attr('id');
            console.log(checkId);
            updateMessage(checkId, allMsgs[checkId].purchased);
        })
            
      
    }
     getPosts.changeCalc = changeCalc; 
      $messageBoard.empty();
      for (let i in messages) {
        $messageBoard.append(messages[i]);
    }
  });
}

function updateMessage(id, purchased) {
  // find message whose objectId is equal to the id we're searching with
  const messageReference =  messageAppReference.ref('messages').child(id);

  // update votes property
  messageReference.update({
    purchased: "yes"
  });
}

function deleteMessage(id){
    const messageReference = messageAppReference.ref('messages').child(id);
    messageReference.remove();
    getPosts.changeCalc();

}

$("ul").on('click', "li input[type=checkbox]",function (){
        getPosts.changeCalc();
        });

$(function() {
    $("#submit").click(function() {
        var venue = $("#venue").val();
        var startDate = $("#startDate").val();
        var endDate = $("#endDate").val();
        getData(venue,startDate,endDate);
        $("#popUp").removeClass('hidden');
    });

});

//Pull search results
function getData(venue,startDate,endDate) {
  fetch(performerUrl + venue + startUrl + startDate + endUrl + endDate  + clientId).then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      alert('Please try again later');
    }
  }).then(function(data) {
    $("#resultsList").empty();
    console.log(data);
    showResults(data);
    return allResults;
  // }).then(function(results){
  //   console.log(results);
  });
}


//Show search results
function showResults(data){
    if (data.events.length === 0){
        $("#popUp").addClass('hidden');
        alert("No events match your criteria, please search again!");
    }else{
        for (let i in data.events){
            var searchResults = {
            showDate: data.events[i].datetime_local,
            showVenue: data.events[i].venue.name,
            showName: data.events[i].title,
            showPrice: Math.ceil(data.events[i].stats.average_price),
            showUrl: data.events[i].url,
            addList: "Add to your list"
            } 
            // console.log("for loop index is" + i);
            if (searchResults.showPrice === 0){
                searchResults.showPrice = "Tickets unavailable";
                }

            allResults = `<div id="showResults-${i}"><p> Date: <span id="showDate-${i}">${searchResults.showDate}</span></p> <p>Venue: <span id="showVenue-${i}">${searchResults.showVenue}</span></p> <p>Event Name: <span id="showName-${i}">${searchResults.showName}</span></p> <p>Price: $<span id="showPrice-${i}">${searchResults.showPrice}</span></p></div><p><a id="showUrl-${i}" href='${searchResults.showUrl}'> Purchase Here! </a></p>`
            $("#popUp").addClass('hidden');
            $("#resultsList").append(`<li class="list" id="${i}">${allResults}<p><button type="button" class="btn" id="button-${i}">${searchResults.addList}</button></p></li>`); 
            console.log(allResults);
            }
        }
        $('#resultsList p').on('click',function (){
            var listItem = $(this).parent();
            console.log(listItem);
            var id = listItem.attr('id');
            console.log($(`#showResults-${id}`).html());
            console.log(id);
            const concertDate = $(`#showDate-${id}`).text();
            const concertVenue = $(`#showVenue-${id}`).text();
            const concertName = $(`#showName-${id}`).text();
            const concertPrice = $(`#showPrice-${id}`).text();
            const concertLink = $(`#showUrl-${id}`).attr('href');
            const allResults = $(`#showResults-${id}`).html();
            var purchased = "no";
            console.log($(`${id}`));
            // create a section for messages data in your db
            const messagesReference = messageAppReference.ref('messages');

            // use the push method to save data to the messages
            // https://firebase.google.com/docs/reference/js/firebase.database.Reference#push
            messagesReference.push({
                allResults: allResults,
                concertDate: concertDate,
                concertVenue: concertVenue,
                concertName: concertName,
                concertPrice: concertPrice,
                concertLink: concertLink,
                purchased: purchased
            });
            console.log($(listItem).attr('id'));
            getPosts();
        });
}
});

    