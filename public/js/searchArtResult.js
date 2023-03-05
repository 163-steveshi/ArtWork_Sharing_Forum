//global variable that stores current search result page
let currentPage = 0;
//get the button for search result
const previous = document.getElementById("previous");
const next = document.getElementById("next");
//function that request to send result page depend on input variable
function requestPage(page) {
  //create a request object
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    //If the response is available and was successful
    if (this.readyState == 4 && this.status == 200) {
      //use the respond text(search result) to insert to the div container
      let result = JSON.parse(this.responseText);
      console.log(result);
      let resultArray = result["searchResult"];

      let lastPage = result["lastPage"];
      let resultHtml = "";
      //load the result
      for (let i = 0; i < resultArray.length; i++) {
        resultHtml += `<h3><a href="/artworks/${resultArray[i]._id}" target="_blank"> ${resultArray[i].name}</a></h3>`;
      }
      document.getElementById("results").innerHTML = resultHtml;
      //when the current page is 0
      //hide the previous button
      if (currentPage === 0) previous.classList.add("hide");
      else previous.classList.remove("hide");
      //last page will hide next button
      if (lastPage) next.classList.add("hide");
      else next.classList.remove("hide");
    }
  };
  //send the requst to server
  xhttp.open("Get", `/artworks/searchresult/${page}`, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.send();
}

window.addEventListener("DOMContentLoaded", (event) => {
  //active the button's functionality
  //add fucntionality to the buttons

  previous.addEventListener("click", (e) => {
    currentPage--;
    //request Server for previous Page
    requestPage(currentPage);
  });
  next.addEventListener("click", (e) => {
    currentPage++;
    //request Server for next page
    requestPage(currentPage);
  });
});
