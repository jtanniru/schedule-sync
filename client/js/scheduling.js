"use strict";

// Get the user's email
const email = localStorage.getItem("email");

window.addEventListener("load", async function () {
  // Add event listeners to schedule button and remote/in person input
  const scheduleButton = document.getElementById("Schedule");
  const remoteInput = document.getElementById("remote");
  const inPersonInput = document.getElementById("inPerson");
  remoteInput.addEventListener("input", async () => {
    document.getElementById("inPerson").disabled = remoteInput.value != "";
  });
  inPersonInput.addEventListener("input", async () => {
    document.getElementById("remote").disabled = inPersonInput.value != "";
  });

  scheduleButton.addEventListener("click", scheduleMeeting);
});

async function scheduleMeeting() {
  // Get form information
  const addMeetingTitle = document.getElementById("meetingTitle").value;
  let meetingDate = document.getElementById("meetingDate").value;
  meetingDate = meetingDate.replace(/(\d{4})\-(\d{2})\-(\d{2})/, "$2/$3/$1");
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const description = document.getElementById("description").value;
  const attendeeEmails = document.getElementById("attendeeEmail").value;
  const attendeeEmailsArray = attendeeEmails.split(",");
  let locationValue = "";

  if (document.getElementById("remote").value != "") {
    locationValue = document.getElementById("remote").value;
  }
  if (document.getElementById("inPerson").value != "") {
    locationValue = document.getElementById("inPerson").value;
  }

  if (
    addMeetingTitle === "" ||
    meetingDate === "" ||
    startTime === "" ||
    endTime === "" ||
    description === "" ||
    attendeeEmails === "" ||
    remote === "" ||
    inPerson === ""
  ) {
    alert("Required information is missing.");
  } else {
    // Schedule meeting
    let response = await fetch("/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        title: addMeetingTitle,
        date: meetingDate,
        start_time: startTime,
        end_time: endTime,
        location: locationValue,
        description: description,
        attendees: attendeeEmailsArray,
      }),
    });
    // Get the returned meeting id
    let meeting_id = (await response.json()).id;
    // Update the attendees tentative meetings with the new meeting
    updateAttendeeMeetings(meeting_id, attendeeEmailsArray);
    // Update the host's meetings with the new meeting
    updateHostMeetings(meeting_id, email);
    // Alert user that meeting has been successfully scheduled
    alert("Meeting successfully scheduled.");
    // Rest form
    document.getElementById("schedule-meeting").reset();
  }
}

// Add the scheduled meeting to the attendees tentative meetings
async function updateAttendeeMeetings(meeting_id, attendees) {
  const response = await fetch(`/tentative-meetings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meeting_id: meeting_id,
      attendees: attendees,
    }),
  });
  const result = await response.json();
  console.log(result);
}

// Add the scheduled meeting to the host's meetings
async function updateHostMeetings(meeting_id, email) {
  const response = await fetch(`/upcoming-meetings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meeting_id: meeting_id,
      email: email,
    }),
  });
  const result = await response.json();
  console.log(result);
}
