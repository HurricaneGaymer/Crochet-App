// 🔹 Global Variables
var userData = {};  
var currentUser = "";
var currentProject = "";
var currentCount = 0;

// Start at login
setScreen("LoginScreen");

// Switch screens
onEvent("GotoSignupButton", "click", function() {
  setScreen("SignupScreen");
});
onEvent("GotoLoginButton", "click", function() {
  setScreen("LoginScreen");
});

// 🔹 Signup
onEvent("SignupButton", "click", function() {
  var newUser = getText("SignupUsernameInput");
  var newPass = getText("SignupPasswordInput");
  
  if (newUser == "" || newPass == "") {
    setText("SignupError", "⚠️ Please fill in all fields!");
  } else {
    userData = {password: newPass, projects: {}}; // store new user
    setKeyValue(newUser, JSON.stringify(userData), function() { // save as string
      currentUser = newUser;
      currentCount = 0;
      setText("SignupError", "");
      setText("Count-Display", currentCount);
      setScreen("Projects");
      updateProjectList();
    });
  }
});

// 🔹 Login
onEvent("LoginButton", "click", function() {
  var username = getText("LoginUsernameInput");
  var password = getText("LoginPasswordInput");
  
  getKeyValue(username, function(value) {
    if (value !== undefined) {
      var parsedData = JSON.parse(value); // turn back into object
      if (parsedData.password === password) {
        currentUser = username;
        userData = parsedData;
        setText("LoginError", "");
        setScreen("Projects");
        updateProjectList();
      } else {
        setText("LoginError", "❌ Incorrect password!");
      }
    } else {
      setText("LoginError", "❌ User not found!");
    }
  });
});

// 🔹 Update Project List (safe: no duplicate events)
function updateProjectList() {
  var projectNames = Object.keys(userData.projects);

  // Hide all pre-made buttons first (only 4 exist)
  for (var i = 0; i < 4; i++) {
    setProperty("ProjectBtn" + i, "hidden", true);
  }

  // Show up to 4 projects (stop if more exist)
  for (var i = 0; i < projectNames.length && i < 4; i++) {
    var btnId = "ProjectBtn" + i;
    setProperty(btnId, "text", projectNames[i]);
    setProperty(btnId, "hidden", false);

    // Reset handler (avoid stacking)
    onEvent(btnId, "click", function() {}); // dummy clears old handler

    // Capture correct project name
    (function(name) {
      onEvent(btnId, "click", function() {
        currentProject = name;
        currentCount = userData.projects[name];
        setText("Count-Display", currentCount);
        setScreen("CounterScreen");
      });
    })(projectNames[i]);
  }
}

// 🔹 New Project (limit to 4)
onEvent("NewProjectButton", "click", function() {
  var newProjectName = getText("NewProjectInput");

  if (newProjectName !== "") {
    if (Object.keys(userData.projects).length >= 4) {
      setText("NewProjectError", "⚠️ You can only have 4 projects!");
      return;
    }
    // Prevent duplicate project names
    if (userData.projects.hasOwnProperty(newProjectName)) {
      setText("NewProjectError", "⚠️ Project already exists!");
      return;
    }

    // Add the project
    userData.projects[newProjectName] = 0;
    setKeyValue(currentUser, JSON.stringify(userData), function() {
      updateProjectList();
      setText("NewProjectInput", "");  // clear input
      setText("NewProjectError", "");  // clear error
    });
  } else {
    setText("NewProjectError", "⚠️ Please enter a project name!");
  }
});


// Going to the Project Screen
onEvent("Project-Management", "click", function( ) {
  setScreen("Projects");
});

// Delete current project
onEvent("DeleteProjectButton", "click", function() {
  if (currentProject !== "") {
    // Switches to the next screen
    setScreen("ConfirmDeleteScreen");
    setText("ConfirmDeleteLabel","Delete Project: " + currentProject + "?");
  }
});
// ✅ Yes: delete project
onEvent("ConfirmDeleteYes", "click", function() {
  delete userData.projects[currentProject];
  setKeyValue(currentUser, JSON.stringify(userData), function() {
    currentProject = "";
    currentCount = 0;
    setScreen("Projects");
    updateProjectList();
  });
});

// ❌ No: cancel
onEvent("ConfirmDeleteNo", "click", function() {
  setScreen("CounterScreen"); // back to project counter
});

// Edit Projects
onEvent("GotoEditScreen", "click", function() {
  setScreen("EditScreen");
  setText("EditProjectInput", currentProject); // pre-fill input
  setText("EditProjectError", ""); // clear previous error
});

onEvent("ChangeNameButton", "click", function() {
  var newProjectName = getText("EditProjectInput").trim();

  // Make sure the name is entered
  if (newProjectName === "") {
    setText("EditProjectError", "⚠️ Please enter a project name!");
    return;
  }

  // Make sure the new name isn't already used
  if (userData.projects.hasOwnProperty(newProjectName)) {
    setText("EditProjectError", "⚠️ Project name already exists!");
    return;
  }

  // Rename the project in userData
  userData.projects[newProjectName] = userData.projects[currentProject];
  delete userData.projects[currentProject];

  // Save to database
  setKeyValue(currentUser, JSON.stringify(userData), function() {
    currentProject = newProjectName; // update currentProject
    setScreen("Projects");
    updateProjectList();
  });
});


// 🔹 Counter (with save to userData + database)
onEvent("Count_Button_Addition", "click", function() {
  currentCount++;
  setText("Count-Display", currentCount);
  userData.projects[currentProject] = currentCount;
  setKeyValue(currentUser, JSON.stringify(userData));
});

onEvent("Count-Subtraction", "click", function() {
  currentCount--;
  setText("Count-Display", currentCount);
  userData.projects[currentProject] = currentCount;
  setKeyValue(currentUser, JSON.stringify(userData));
});

onEvent("Reset", "click", function() {
  currentCount = 0;
  setText("Count-Display", currentCount);
  userData.projects[currentProject] = currentCount;
  setKeyValue(currentUser, JSON.stringify(userData));
});

