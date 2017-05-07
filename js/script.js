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
  const $profileDescription = $('#profile-description');


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

    $file.change(handleFileSelect);


  $btnSignUp.click(function(e){
    const email = $email.val();
    const password = $password.val();
    const auth = firebase.auth();


    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(currentUser){
      // console.log("SignUp user is "+currentUser.email);
      const dbUserid = dbUser.child(currentUser.uid);
      dbUserid.update({email:currentUser.email});
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
          'description': description,
          'imageUrl': currentUser.photoURL
        });

        findData(currentUser);

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

  function findData(currentUser){
    var dbUserInfo = firebase.database().ref('user/' + currentUser.uid);

    dbUserInfo.on("value", function(snapshot){
      var username = snapshot.val().username;
      var occupation = snapshot.val().occupation;
      var age = snapshot.val().age;
      var description = snapshot.val().description;

      $profileName.html(username);
      $profileEmail.html(currentUser.email);
      $profileOccupation.html(occupation);
      $profileAge.html(age);
      $profileDescription.html(description);
      $img.attr("src",currentUser.photoURL);

      //$img.attr("src", photoURL);
    });
  }

  firebase.auth().onAuthStateChanged(function(currentUser){
    if(currentUser){
      findData(currentUser);
      dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
        //GET DATA

        var data = snapshot.val();
        var username = data.user || "anonymous";
        var message = data.text;
        var imgUrl = data.imageUrl;
        console.log(imgUrl);
        // var dbUserInfo = firebase.database().ref('user/' + currentUser.uid);
        //
        // dbUserInfo.on("value", function(snapshot){
        //   var username = snapshot.val().username;
        //   var occupation = snapshot.val().occupation;
        //   var age = snapshot.val().age;
        //   var description = snapshot.val().description;
        //   $profileName.html(username);
        //   $profileEmail.html(currentUser.email);
        //   $profileOccupation.html(occupation);
        //   $profileAge.html(age);
        //   $profileDescription.html(description);
        //   $img.attr("src",currentUser.photoURL);
        // });
        findData(currentUser);


        var $messageElement = $("<li>");
        var $image = $("<img>");
        $image.attr("src", imgUrl);
        $messageElement.text(message).prepend(username + ":  ");
        $messageElement.prepend($image);

        //ADD MESSAGE
        //if(username !== 'anonymous'){
          $messageList.append($messageElement);
        //}
        $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });
    }
  });

  $messageField.keypress(function (e) {
    var currentUser = firebase.auth().currentUser;
    var dbUserInfo = firebase.database().ref('user/');
    var userName;

    if(currentUser){
      //console.log(currentUser.uid);
      dbUserInfo.on("value",function(snapshot) {
         //console.log(snapshot.val());
         snapshot.forEach(function(userId){
            //console.log(userId.key);
            if(userId.key === currentUser.uid){
              userId.forEach(function(profile){
                //console.log(profile.key + ": " + profile.val());
                if(profile.key === 'username'){
                    userName = profile.val();
                }
              });
            }
         });
      });

      if (e.keyCode == 13) {//When the user presses the "enter" key
        var message = $messageField.val();
        //console.log(userName);
        //console.log(message);
        //console.log(currentUser.photoURL);

        dbChatRoom.push({user:userName, text:message, imageUrl: currentUser.photoURL});
        $messageField.val('');
      }
    }


  });

  $removeData.click(function(){
    $messageList.empty();
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
