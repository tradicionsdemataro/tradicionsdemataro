function protectSession() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.replace("https://tradicionsdemataro.github.io/tradicionsdemataro/");
  }
}

protectSession();