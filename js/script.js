$(document).ready(function(){
  var config = {
    apiKey: "AIzaSyAn3NJE89W9uxH0N1r44bPnbgtbmMRY37s",
    authDomain: "fir-homework-153e5.firebaseapp.com",
    databaseURL: "https://fir-homework-153e5.firebaseio.com",
    projectId: "fir-homework-153e5",
    storageBucket: "fir-homework-153e5.appspot.com",
    messagingSenderId: "1066064164363"
  };
  firebase.initializeApp(config);

  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');
  var $img = $('img');
  var photoURL;
  var currentUser = firebase.auth().currentUser;
  var currentUserName = "";
  var userProfile = [];

  const $email = $('#email');
  const $password = $('#password');
  const $btnSignUp = $('#btnSignUp');

  const $userName = $('#userName');
  const $occupation = $('#occupation');
  const $age = $('#age');
  const $file = $('#file');
  const $description = $('#description');
  const $btnSubmit = $('#btnSubmit');

  const $btnLogIn = $('#btnLogIn');
  const $signInfo = $('#sign-info');

  const $messageField = $('#messageField');
  const $messageList = $('#messageList');
  const $removeData = $('#remove');
  const $update = $('#update');
  const $logOut = $('#logOut');

  const $updateProfile = $('#updateProfile');

  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileOccupation = $('#profile-occupation');
  const $profileAge = $('#profile-age');


  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      console.error('Upload failed:', error);
    });
  }

    console.log("xxx");
    $file.change(handleFileSelect);


  $btnSignUp.click(function(e){
    const email = $email.val();
    const password = $password.val();
    const auth = firebase.auth();

    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(function(e){
      console.log(e.message);
    });
    promise.then(function(currentUser){
      console.log("SignUp user is "+currentUser.email);
      const dbUserid = dbUser.child(currentUser.uid);
      dbUserid.update({email:currentUser.email});
      alert("Create Account Success!!")
      window.location.href = "./profile.html";
    });
  });

  $btnLogIn.click(function(e){
    const email = $email.val();
    const password = $password.val();
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      console.log("Log in success!");
      window.location.href = "./chatroom.html";
    });
  });

  function updateOrSetProfile(choice){
    var userName = $userName.val();
    var occupation = $occupation.val();
    var age = $age.val();
    var description = $description.val();
    var currentUser = firebase.auth().currentUser;

    var promise = currentUser.updateProfile({
      displayName: userName,
      photoURL: photoURL
    });

    promise.then(function() {
      var dbUserid = dbUser.child(currentUser.uid);
      currentUser = firebase.auth().currentUser;
      if (currentUser) {
        dbUserid.update({
          'username': userName,
          'occupation': occupation,
          'age': age,
          'description': description
        });
        userProfile[0] = userName;
        userProfile[1] = occupation;
        userProfile[2] = age;
        userProfile[3] = description;
        console.log(userName,occupation,age);
        $profileName.html(userName);
        $profileEmail.html(currentUser.email);
        $profileOccupation.html(occupation);
        $profileAge.html(age);
        $img.attr("src", photoURL);
        // alert("Set profile success!!");

        if(choice === "set"){
          window.location.href = "./index.html";
        }
        else{
          alert("Update profile success!!");
          window.location.href = "./chatroom.html";
        }

      }
    });
  }

  $btnSubmit.click(function(e){
    updateOrSetProfile("set");
  });

  $update.click(function(e){
    window.location.href = "./updateProfile.html";
  });

  $updateProfile.click(function(e){
    updateOrSetProfile("update");
  });

  firebase.auth().onAuthStateChanged(function(currentUser){
    if(currentUser){
      console.log(userProfile[0]);
      dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
        //GET DATA

        var data = snapshot.val();
        var username = data.user || "anonymous";
        var message = data.text;

        //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
        var $messageElement = $("<li>");
        $messageElement.text(message).prepend(username + ":  ");

        //ADD MESSAGE
        $messageList.append($messageElement);

        $profileName.html(userProfile[0]);
        $profileEmail.html(currentUser.email);
        $profileOccupation.html(userProfile[1]);
        $profileAge.html(userProfile[2]);
        $img.attr("src",currentUser.photoURL);

        //SCROLL TO BOTTOM OF MESSAGE LIST
        // $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });//child_added callback
    }
  });

  $messageField.keypress(function (e) {
    var currentUser = firebase.auth().currentUser;
    var dbUserInfo = firebase.database().ref('user/');
    var userName;

    if(currentUser){
      console.log(currentUser.uid);
      dbUserInfo.on("value",function(snapshot) {
         console.log(snapshot.val());
         snapshot.forEach(function(userId){
            console.log(userId.key);
            if(userId.key === currentUser.uid){
              userId.forEach(function(profile){
                console.log(profile.key + ": " + profile.val());
                if(profile.key === 'username'){
                    userName = profile.val();
                }
              });
            }
         });
      });

      if (e.keyCode == 13) {//When the user presses the "enter" key
        var message = $messageField.val();
        console.log(userName);
        console.log(message);

        dbChatRoom.push({user:userName, text:message});
        $messageField.val('');
      }
    }


  });

  $removeData.click(function(){
    dbChatRoom.remove().then(function() {
      alert("Remove succeeded")
    });
  });

  $logOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    window.location.href = "./index.html";
  });

});
