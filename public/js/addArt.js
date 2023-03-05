//function for add artwork
function postArtWork() {
  //start by checking the Input from User
  const artName = document.querySelector("#name").value;
  const artist = document.querySelector("#artist").value;
  const year = document.querySelector("#year").value;
  const category = document.querySelector("#category").value;
  const medium = document.querySelector("#medium").value;
  const description = document.querySelector("#description").value;
  const imgLink = document.querySelector("#image").value;

  let artwork = {};
  //user input validation part
  if (artName.trim().length > 0) artwork["name"] = artName;
  else {
    alert("Please type the name in the textbox");
    return;
  }

  if (artist.trim().length > 0) artwork["artist"] = artist;
  else {
    alert("Please type the artist in the textbox");
    return;
  }

  if (
    year.trim().length > 0 &&
    Number.isInteger(Number(year)) &&
    Number(year) > 0
  )
    artwork["year"] = year;
  else {
    alert("Please type a valid year in the text box");
    return;
  }
  if (category.trim().length > 0) artwork["category"] = category.toLowerCase();
  else {
    alert("Please type the category in the textbox");
    return;
  }
  if (medium.trim().length > 0) artwork["medium"] = medium.toLowerCase();
  else {
    alert("Please type the medium in the textbox");
    return;
  }

  if (description.trim().length > 0) artwork["description"] = description;
  else {
    alert("Please type the description in the textbox");
    return;
  }
  //check user input an valid url of the image

  if (imgLink.trim().length > 0 && imgLink.startsWith("https://"))
    artwork["image"] = imgLink;
  else {
    alert("Please type an valid url starts with https:// for image");
    return;
  }
  //if user pass all the input test
  //send the request to the server
  let xhttp = new XMLHttpRequest();
  //This is only going to get called when readyState changes
  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      alert("Uploaded Success!");
      //refresh the page to diplay account status changed
    } else if (this.readyState == 4 && this.status == 403) {
      alert("You can't post some artwork that is not your");
      //refresh the page for reupload
    } else if (this.readyState == 4 && this.status == 404) {
      alert("You can't post repeated Artwork ");
    } else if (this.readyState == 4 && this.status == 401) {
      alert("You need to login in before post artwork");
    }
  };
  //send the requst to server

  xhttp.open("POST", `/artworks`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send(JSON.stringify(artwork));
}
window.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();
  //active the button's functionality

  const button = document.getElementById("submit");
  button.addEventListener("click", postArtWork);
});
