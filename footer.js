var siteBasePath = window.location.pathname.includes("/libros/") ? "../" : "";

fetch(siteBasePath + "footer.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
    document.querySelectorAll("#footer img").forEach(image => {
      const src = image.getAttribute("src");
      if (src && !src.startsWith("http") && !src.startsWith("/") && siteBasePath) {
        image.setAttribute("src", siteBasePath + src);
      }
    });
  });
