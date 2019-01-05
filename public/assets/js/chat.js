$(document).ready(function() {
    const gamecode = extractGameCodeFromUrl();

    // pass player name and start chat
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var playerName = user.displayName;
            var playerName = playerName.charAt(0).toUpperCase()+ playerName.slice(1);  //capitalize player name
            startChat(playerName);        
          }
    });

    function startChat(playerName) {
        // grab message ID
        var submit = $("#submit-btn");

        //grab text that user enters
        var enteredText = $("#entered-text");

        // when enter is clicked
        submit.on('click').click(function() {   
            // create message object to be stored in firebase
            var messageInfo = {
                displayName: playerName,
                txt: enteredText.val()
            }

            //push message into firebase database
            firebase.database().ref(nodes.games).child(gamecode).child(nodes.messages).push(messageInfo); 

            // clear text box display afterward
            $("#entered-text").val('');
        });

        // when a new message is added, display message onto chat screen
        firebase.database().ref(nodes.games).child(gamecode).child(nodes.messages).on('child_added', function(snap){
            var playerInfo = snap.val();
            var playerName = playerInfo.displayName;
            var msg = playerInfo.txt;    
            displayMessage(playerName, msg);
        });
    }


    // function gives each user icon a different color to provide differentiation
    function getRandomColor() {
        return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
    }
    var color = getRandomColor();


    // function creates message element
    function displayMessage(p, m) {
        //outer div
        var iDiv = document.createElement('div');
        iDiv.className = "chat user"
        //document.getElementsByTagName('body')[0].appendChild(iDiv);
        
        // inner div
        var innerDiv = document.createElement('div');
        innerDiv.style = "vertical-align:text-bottom; background:"+color+";";
        innerDiv.className = 'user';
        innerDiv.id = "user-name";
        var content = document.createTextNode(p);   // insert player Name
        innerDiv.appendChild(content);

        iDiv.appendChild(innerDiv);

        // 2nd inner div
        var para = document.createElement("P");
        para.style = "background: rgb(241, 193, 58);";
        para.className = "chat-message";
        para.id = "msg-entry";
        var t = document.createTextNode(m);  // insert user's message
        para.appendChild(t);

        iDiv.appendChild(para);

        document.getElementById("textBoxID").appendChild(iDiv);
    } // end display Message function

});

