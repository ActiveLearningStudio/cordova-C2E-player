const localStorage = window.localStorage,
  token = localStorage.getItem("USER_TOKEN"),
  userID = localStorage.getItem("USER_ID"),
  adminToken = localStorage.getItem("ADMIN_TOKEN"),
  customApiToken = localStorage.getItem("CUSTOM_API_TOKEN"),
  currikiToken = localStorage.getItem("CURRIKI_TOKEN"),
  moodleBaseURL = localStorage.getItem("MOODLE_BASE_API_URL"),
  currikiBaseURL = localStorage.getItem("CURRIKI_BASE_API_URL"),
  additionalToken = localStorage.getItem("ADITIONAL_TOKEN"),
  moodleLoginURL = localStorage.getItem("MOODLE_LOGIN_URL");

const userLogin = (userName, password, callback) => {
  $.ajax({
    url: "https://map-lms.curriki.org/login/token.php",
    dataType: "json",
    data: {
      username: userName,
      password: password,
      service: "moodle_mobile_app",
    },
    success: (response) => {
      console.log("response 111", response);
      if (response.token) {
        getUserId(userName, (userId) => {
          localStorage.setItem("USER_ID", userId);
          localStorage.setItem("USER_TOKEN", response.token);
          callback(response);
        });
      } else {
        callback(response);
      }
    },
    error: (xhr, status, err) => {
      console.log("bye 222", status, err, xhr);
      callback(status);
    },
  });
};

const getUserId = (userName, userId) => {
  $.ajax({
    url: "https://map-lms.curriki.org/webservice/rest/server.php",
    dataType: "json",
    data: {
      moodlewsrestformat: "json",
      "criteria[0][key]": "username",
      "criteria[0][value]": userName,
      wsfunction: "core_user_get_users",
      wstoken: localStorage.getItem("ADITIONAL_TOKEN"),
    },
    success: (response) => {
      localStorage.setItem("LOGGED_USER_EMAIL", response.users[0].email);
      userId(response.users[0].id);
    },
    error: (xhr, status, err) => {
      console.log(status);
    },
  });
};

const getAssignedProjectIds = (idsArray) => {
  console.log("user", userID);
  $.ajax({
    url: moodleBaseURL,
    type: "get",
    data: {
      moodlewsrestformat: "json",
      user_id: 26,
      wsfunction: "local_curriki_moodle_plugin_get_user_projects",
      wstoken: customApiToken,
    },
    success: (project_ids) => {
      let projects_ids_arr = [];
      project_ids.forEach((el) => projects_ids_arr.push(el.projectid));
      let obj = {
        project_id: projects_ids_arr,
      };
      idsArray(obj);
    },
  });
};

const getProjects = (mode, projects) => {
  getAssignedProjectIds((data) => {
    if (mode == "dashboard")
      shuffle(data.project_id), (data.project_id.length = 3);
    $.ajax({
      url: `${currikiBaseURL}suborganization/1/projects/by-ids`, //'http://127.0.0.1:8000/api/v1/suborganization/1/projects/by-ids',
      headers: {
        Authorization: "Bearer " + currikiToken,
      },
      type: "POST",
      data: data,
      success: (response) => {
        projects(response);
      },
      error: (xhr, status, err) => {
        console.log("getAssignedProjectIds ~ status", status, xhr, err);
      },
    });
  });
};
const getCurrikiProjects = (mode, projects) => {
  $.ajax({
    url: `https://c2e.us-southeast-1.linodeobjects.com/projects.json`, //'http://127.0.0.1:8000/api/v1/suborganization/1/projects/by-ids',
    // headers: {
    //   Authorization: "Bearer " + currikiToken,
    // },
    type: "GET",
    data: "",
    dataType: "json",
    success: (response) => {
      projects(response);
    },
    error: (xhr, status, err) => {
      console.log("getProjects ~ status", status, xhr, err);
    },
  });
};

const getPlaylists = (projectId, projects) => {
  $.ajax({
    url: `${currikiBaseURL}projects/${projectId}/playlists?skipContent=false`,
    headers: {
      Authorization: "Bearer " + currikiToken,
    },
    success: (response) => {
      projects(response);
    },
    error: (xhr, status, err) => {
      console.log(status, xhr, err);
    },
  });
};

const getActivity = (activityId, activity) => {
  $.ajax({
    url: `${currikiBaseURL}activities/${activityId}/h5p`,
    headers: {
      Authorization: "Bearer " + currikiToken,
    },
    success: (res) => {
      let settings = res.activity.h5p.settings;
      window.H5PIntegration = { ...settings };
      activity(res);
    },
    error: (xhr, status, err) => {
      console.log(status);
    },
  });
};

const downloadProject = (projectId, project) => {
  $.ajax({
    url: `${currikiBaseURL}suborganization/1/projects/${projectId}/offline-project`,
    headers: {
      Authorization: "Bearer " + currikiToken,
    },
    success: (res) => {
      var getProjectpath = res.split("org"),
        projectName = getProjectpath.join("org/api"),
        downloadPath = projectName.replace("http", "https");
      project(downloadPath);
    },
  });
};

const deleteProject = (projectName, project) => {
  $.ajax({
    url: `${currikiBaseURL}project/delete/${projectName}`,
    headers: {
      Authorization: "Bearer " + currikiToken,
    },
    success: (res) => {
      project(res);
    },
  });
};

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

//get Activity Score
const getScore = (contentId, callback) => {
  var email = localStorage.getItem("LOGGED_USER_EMAIL");
  $.ajax({
    url: `${currikiBaseURL}/h5p/ajax/reader/getScore`,
    headers: {
      Authorization: "Bearer " + currikiToken,
    },
    dataType: "json",
    data: {
      contentId: contentId,
      email: email,
    },
    success: (response) => {
      callback(response);
    },
    error: (err) => {
      callback(response);
    },
  });
};
const downloadVideo = (url, content_id, callback) => {
  console.log({ url });

  $.ajax({
    url: url,
    method: "GET",
    success: (response) => {
      console.log("response", response.blob());
      callback(response, content_id);
    },
    error: (err) => {
      callback(err);
    },
  });
};
