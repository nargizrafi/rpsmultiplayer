// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAywzDmJkZyfZFkXwoAMZ-Gyl8fMCkFEFQ",
    authDomain: "herta-87eff.firebaseapp.com",
    projectId: "herta-87eff",
    storageBucket: "herta-87eff.appspot.com",
    messagingSenderId: "685905035660",
    appId: "1:685905035660:web:2128419fec9653a51c96a9"
  };

  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  
  var database = firebase.database();

  var chatData = database.ref("/chat");
  var playersBranch = database.ref("players");
  var currentTurnBranch = database.ref("turn");

  var username = "Test";

  var currentPlayers = null;
  var currentTurn = null;

  var playerNum = false;
  
  var player1Exists = false;
  var player2Exists = false;

  var player1Data = null;
  var player2Data = null;

  //input section in the beginning
  $("#start").click(function(){
      if($("#username").val().trim() !== ""){
          username = $("#username").val();
          playGame();
      }
  });

  $("#username").keypress(function(event){
      if(event.which === 13 && $("#username").val().trim() !== ""){
          username = capitalize($("#username").val());
          playGame();
      }
  });

  //chat section
  $("#chatSendBtn").click(function(){
      if($("#chat-input").val() !== ""){
          var message = $("#chat-input").val();

          chatData.push({
              name: username,
              message: message,
              time: firebase.database.ServerValue.TIMESTAMP,
              idNum: playerNum
          });

          $("#chat-input").val() = "";
      }
  });

  $(document).on('click', "li", function(){
      var clickedChoice = $(this).text();
      playersBranch.child("choice").set(clickedChoice);

      $("#player" + playerNum + " ul").empty();
      $("#player" + playerNum + "chosen").text(clickedChoice);

      //Transactional data is used when you need to return some data from the database then make some calculation with it and store it back.
      //We want to retrieve property, add one and return it back to Firebase.
      currentTurnBranch.transaction(function(turn){
          return turn + 1;
      });
  });

  //The child_added event is typically used when retrieving a list of items from the database.

  //child_added is triggered once for each existing child and then again every time a new child is added to the specified path. The event callback is passed a snapshot containing the new child's data. For ordering purposes, it is also passed a second argument containing the key of the previous child.

  chatData.orderByChild("time").on("child_added", function(snapshot){
    
    if(snapshot.val().idNum === 0){
        $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>" + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
    }else{
        $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>" + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
    }

    //console.log($("#chat-messages")[0]);
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight)
  })


  playersBranch.on('value', function(snapshot){
      currentPlayers = snapshot.numChildren();

      player1Exists = snapshot.child("1").exists();
      player2Exists = snapshot.child("2").exists();

      player1Data = snapshot.child("1").val();
      player2Data = snapshot.child("2").val();

      if(player1Exists){
          $("#player1-name").text(player1Data.name);
          $("#player1-win").text("Wins: " + player1Data.wins);
          $("#player1-lose").text("Losses: " +player1Data.losses);
      }else{
          $("#player1-name").text("Waiting for Player1");
          $("#player1-win").empty();
          $("#player1-lose").empty();
      }

      if(player2Exists){
        $("#player2-name").text(player2Data.name);
        $("#player2-win").text("Wins: " + player2Data.wins);
        $("#player2-lose").text("Losses: " + player2Data.losses)
      }else{
        $("#player2-name").text("Waiting for Player2");
        $("#player2-win").empty();
        $("#player2-lose").empty();
    }
  })


currentTurnBranch.on('value', function(snapshot){
      currentTurn = snapshot.val();

      if(playerNum){
          if(currentTurn === 1){
              if(currentTurn === playerNum){
                $("#current-turn").html("<h2>Your turn!</h2>");
                $("#player" + playerNum + " ul").append(`<li>Rock <i class="fa-solid fa-hand-back-fist"></i></li><li>Scissors <i class="fa-solid fa-hand-scissors"></i></li><li>Paper <i class="fa-solid fa-hand"></i></li>`)
                
            }else{
                  $("#current-turn").html("<h2>Waiting for " + player1Data.name + " to choose</h2>");
              }
              $("#player1").css("border", "2px solid green");
              $("#player2").css("border", "2px solid white");
          }else if(currentTurn === 2){
              if(currentTurn === playerNum){
                $("#current-turn").html("<h2>Your turn!</h2>");
                $("#player" + playerNum + " ul").append(`<li>Rock <i class="fa-solid fa-hand-back-fist"></i></li><li>Scissors <i class="fa-solid fa-hand-scissors"></i></li><li>Paper <i class="fa-solid fa-hand"></i></li>`)
              }else{
                  $("#current-turn").html("<h2>Waiting for " + player2Data.name + " to choose</h2>");
              }
              
              $("#player1").css("border", "2px solid white");
              $("#player2").css("border", "2px solid green");
          }else if(currentTurn === 3){
              gameLogic(player1Data.choice, player2Data.choice);

              $("#player1-chosen").text(player1Data.choice);
              $("#player2-chosen").text(player2Data.choice);

              var moveOn = function(){
                  $("#player1-chosen").empty();
                  $("#player2-chosen").empty();
                  $("#result").empty();

                  if(player1Exists && player2Exists){
                      currentTurnBranch.set(1);
                  }
              }

              setTimeout(moveOn, 3000);
          }else{
              $("#player1 ul").empty();
              $("#player2 ul").empty();
              $("current-turn").html("<h2>Waiting for another player to join</h2>");

              $("#player1").css("border", "1px solid white");
              $("#player2").css("border", "1px solid white");
          }
      }
});


playersBranch.on('child_added', function(snapshot){
    if(currentPlayers === 1){
        currentTurnBranch.set(1);
    }
});


function playGame(){
    var chatDataDisconnect = database.ref("/chat/" + Date.now());

    if(currentPlayers < 2){
        if(player1Exists){
            playerNum = 2;
        }else{
            playerNum = 1;
        }

        playersBranchs=database.ref("/players")
        playersBranch = database.ref("/players/" + playerNum);

        playersBranch.set({
            name: username,
            wins: 0,
            losses: 0,
            choice: null
        });

        playersBranch.onDisconnect().remove();
        currentTurnBranch.onDisconnect().remove();

        chatDataDisconnect.onDisconnect().set({
            name: username,
            time: firebase.database.ServerValue.TIMESTAMP,
            message: "is not online and has left the game",
            idNum: 0
        })


        $("#swap-zone").html("<h2>Hey " + username + ", you're player " + playerNum + "</h2>")
    }else{
        alert("Sorry, it seems the game is full, pls try again");
    }
}

function gameLogic(p1Choice, p2Choice){
    var player1Won = function(){
        $("#result").html("<h2>" + player1Data.name + " Wins!</h2>");

        if(playerNum === 1){
            playersBranchs.child("1").child("wins").set(player1Data.wins + 1);
            playersBranchs.child("2").child("losses").set(player2Data.losses + 1);
        }
    }

    var player2Won = function(){
        $("#result").html("<h2>" + player2Data.name + " Wins!</h2>");

        if(playerNum === 2){
            playersBranchs.child("1").child("losses").set(player1Data.losses + 1);
            playersBranchs.child("2").child("wins").set(player2Data.wins + 1);
        }
    }


    var tie = function(){
        $("#result").html("<h2>Tie!</h2>");
    }

    if(p1Choice === "Rock " && p2Choice === "Rock "){
        tie();
    }else if(p1Choice === "Scissors " && p2Choice === "Scissors "){
        tie();
    }else if(p1Choice === "Paper " && p2Choice === "Paper "){
        tie();
    }else if(p1Choice === "Rock " && p2Choice === "Scissors "){
        player1Won();
    }else if(p1Choice === "Rock " && p2Choice === "Paper "){
        player2Won();
    }else if(p1Choice === "Scissors " && p2Choice === "Rock "){
        player2Won();
    }else if(p1Choice === "Paper " && p2Choice === "Rock "){
        player1Won();
    }else if(p1Choice === "Scissors " && p2Choice === "Paper "){
        player1Won();
    }else if(p1Choice === "Paper " && p2Choice === "Scissors "){
        player2Won();
    }
}







