//function that check username and password
function checkUserInput(userName, password) {
  //check if user type user name
  if (userName.trim().length === 0) {
    alert("You haven't type User Name");
    return false;
  }
  //check if user type password
  if (password.trim().length === 0) {
    alert("You haven't type password");

    return false;
  }

  return true;
}
export { checkUserInput };
