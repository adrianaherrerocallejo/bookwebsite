var siteBasePath = window.location.pathname.includes("/libros/") ? "../" : "";

fetch(siteBasePath + "menu.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("menu").innerHTML = data;
    document.querySelectorAll("#menu a").forEach(link => {
      const href = link.getAttribute("href");
      if (href && !href.startsWith("http") && !href.startsWith("/") && siteBasePath) {
        link.setAttribute("href", siteBasePath + href);
      }
    });
  });
