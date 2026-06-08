function showMessage(container, text) {
  if (container) {
    container.innerHTML = `<p>${text}</p>`;
  }
}

function getFormStatus(form) {
  let status = form.querySelector(".form-status");

  if (!status) {
    status = document.createElement("p");
    status.className = "form-status";
    form.appendChild(status);
  }

  return status;
}

function setFormStatus(form, text) {
  const status = getFormStatus(form);
  status.textContent = text;
}

async function requireSession() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

function readPhotoAsBase64(file) {
  return new Promise(resolve => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.readAsDataURL(file);
  });
}

function readPhotoAsCompressedBase64(file) {
  return new Promise(resolve => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      image.onerror = () => resolve(event.target.result);
      image.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}

async function deleteRow(table, id, afterDelete) {
  const session = await requireSession();
  if (!session) {
    alert("Tienes que entrar en login para borrar.");
    return;
  }

  const { error } = await supabaseClient
    .from(table)
    .delete()
    .eq("id", id);

  if (error) {
    alert("No se ha podido borrar: " + error.message);
    return;
  }

  afterDelete();
}

async function initFilosofia() {
  const form = document.getElementById("diary-form");
  const container = document.getElementById("entries");

  if (!form || !container) {
    return;
  }

  const dateInput = document.getElementById("date");
  const titleInput = document.getElementById("title");
  const textInput = document.getElementById("text");
  dateInput.valueAsDate = new Date();

  async function showEntries() {
    showMessage(container, "cargando entradas...");

    const { data, error } = await supabaseClient
      .from("filosofia_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      showMessage(container, "No se han podido cargar las entradas: " + error.message);
      return;
    }

    container.innerHTML = "";

    if (!data.length) {
      showMessage(container, "Todavía no hay entradas.");
      return;
    }

    data.forEach(entry => {
      const article = document.createElement("article");
      article.className = "diary-entry";

      const meta = document.createElement("p");
      meta.className = "diary-meta";
      meta.textContent = `${entry.entry_date} · ${entry.title}`;

      const text = document.createElement("p");
      text.className = "diary-text";
      text.textContent = entry.body;

      const button = document.createElement("button");
      button.className = "delete-button admin-only";
      button.textContent = "borrar";
      button.onclick = () => deleteRow("filosofia_entries", entry.id, showEntries);

      article.appendChild(meta);
      article.appendChild(text);
      article.appendChild(button);
      container.appendChild(article);
    });

    window.applyAdminVisibility();
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const session = await requireSession();
    if (!session) {
      alert("Tienes que entrar en login para guardar.");
      return;
    }

    const { error } = await supabaseClient.from("filosofia_entries").insert({
      entry_date: dateInput.value,
      title: titleInput.value,
      body: textInput.value
    });

    if (error) {
      alert("No se ha podido guardar: " + error.message);
      return;
    }

    titleInput.value = "";
    textInput.value = "";
    showEntries();
  });

  showEntries();
}

async function initRecomendaciones() {
  const form = document.getElementById("review-form");
  const container = document.getElementById("reviews");

  if (!form || !container) {
    return;
  }

  const dateInput = document.getElementById("date");
  const categoryInput = document.getElementById("category");
  const titleInput = document.getElementById("title");
  const ratingInput = document.getElementById("rating");
  const photoInput = document.getElementById("photo");
  const textInput = document.getElementById("text");
  dateInput.valueAsDate = new Date();

  async function showReviews() {
    showMessage(container, "cargando recomendaciones...");

    const { data, error } = await supabaseClient
      .from("recommendation_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      showMessage(container, "No se han podido cargar las recomendaciones: " + error.message);
      return;
    }

    container.innerHTML = "";

    if (!data.length) {
      showMessage(container, "Todavía no hay recomendaciones.");
      return;
    }

    data.forEach(review => {
      const article = document.createElement("article");
      article.className = "review-entry";

      if (review.photo_data) {
        const image = document.createElement("img");
        image.className = "review-photo";
        image.src = review.photo_data;
        image.alt = review.title;
        article.appendChild(image);
      }

      const meta = document.createElement("p");
      meta.className = "review-meta";
      meta.textContent = `${review.entry_date} · ${review.category}`;

      const title = document.createElement("h3");
      title.textContent = review.title;

      const rating = document.createElement("p");
      rating.className = "review-rating";
      rating.textContent = review.rating;

      const text = document.createElement("p");
      text.className = "review-text";
      text.textContent = review.body;

      const button = document.createElement("button");
      button.className = "delete-button admin-only";
      button.textContent = "borrar";
      button.onclick = () => deleteRow("recommendation_entries", review.id, showReviews);

      article.appendChild(meta);
      article.appendChild(title);
      article.appendChild(rating);
      article.appendChild(text);
      article.appendChild(button);
      container.appendChild(article);
    });

    window.applyAdminVisibility();
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const session = await requireSession();
    if (!session) {
      alert("Tienes que entrar en login para guardar.");
      return;
    }

    const photoData = await readPhotoAsBase64(photoInput.files[0]);
    const { error } = await supabaseClient.from("recommendation_entries").insert({
      entry_date: dateInput.value,
      category: categoryInput.value,
      title: titleInput.value,
      rating: ratingInput.value,
      photo_data: photoData,
      body: textInput.value
    });

    if (error) {
      alert("No se ha podido guardar: " + error.message);
      return;
    }

    form.reset();
    dateInput.valueAsDate = new Date();
    showReviews();
  });

  showReviews();
}

async function initTodo() {
  const form = document.getElementById("todo-form");
  const container = document.getElementById("todo-list");

  if (!form || !container) {
    return;
  }

  async function showTasks() {
    showMessage(container, "cargando tareas...");

    const { data, error } = await supabaseClient
      .from("web_todo_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showMessage(container, "No se han podido cargar las tareas: " + error.message);
      return;
    }

    container.innerHTML = "";

    if (!data.length) {
      showMessage(container, "No hay tareas pendientes. Milagro absoluto.");
      return;
    }

    data.forEach(task => {
      const article = document.createElement("article");
      article.className = "todo-entry";

      if (task.done) {
        article.classList.add("todo-done");
      }

      const topLine = document.createElement("p");
      topLine.className = "todo-meta";
      topLine.textContent = `${task.category} · prioridad ${task.priority}`;

      const text = document.createElement("p");
      text.className = "todo-text";
      text.textContent = task.body;

      const buttons = document.createElement("div");
      buttons.className = "todo-buttons admin-only";

      const doneButton = document.createElement("button");
      doneButton.className = "todo-button";
      doneButton.textContent = task.done ? "marcar pendiente" : "hecho";
      doneButton.onclick = async () => {
        const { error } = await supabaseClient.from("web_todo_tasks").update({ done: !task.done }).eq("id", task.id);
        if (error) {
          alert("No se ha podido actualizar: " + error.message);
          return;
        }
        showTasks();
      };

      const deleteButton = document.createElement("button");
      deleteButton.className = "todo-button delete-button";
      deleteButton.textContent = "borrar";
      deleteButton.onclick = () => deleteRow("web_todo_tasks", task.id, showTasks);

      buttons.appendChild(doneButton);
      buttons.appendChild(deleteButton);
      article.appendChild(topLine);
      article.appendChild(text);
      article.appendChild(buttons);
      container.appendChild(article);
    });

    window.applyAdminVisibility();
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const session = await requireSession();
    if (!session) {
      alert("Tienes que entrar en login para guardar.");
      return;
    }

    const { error } = await supabaseClient.from("web_todo_tasks").insert({
      body: document.getElementById("task").value,
      category: document.getElementById("category").value,
      priority: document.getElementById("priority").value,
      done: false
    });

    if (error) {
      alert("No se ha podido guardar: " + error.message);
      return;
    }

    form.reset();
    showTasks();
  });

  showTasks();
}

async function initBookItems(config) {
  const params = new URLSearchParams(window.location.search);
  const book = params.get("book") || "sin-libro";
  const prettyBook = book.replaceAll("-", " ");
  const title = document.getElementById("book-title");

  if (title) {
    title.textContent = prettyBook;
  }

  const form = document.getElementById(config.formId);
  const container = document.getElementById(config.containerId);

  if (!form || !container) {
    return;
  }

  async function showItems() {
    showMessage(container, "cargando...");

    const { data, error } = await supabaseClient
      .from(config.table)
      .select("*")
      .eq("book_slug", book)
      .order("created_at", { ascending: false });

    if (error) {
      showMessage(container, "No se han podido cargar los datos: " + error.message);
      return;
    }

    container.innerHTML = "";

    if (!data.length) {
      showMessage(container, config.emptyText);
      return;
    }

    data.forEach(item => {
      container.appendChild(config.render(item, prettyBook, showItems));
    });

    window.applyAdminVisibility();
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    try {
      setFormStatus(form, "guardando...");

      const session = await requireSession();
      if (!session) {
        setFormStatus(form, "Tienes que entrar en login para guardar.");
        return;
      }

      const payload = await config.payload(book);
      const { error } = await supabaseClient.from(config.table).insert(payload);

      if (error) {
        setFormStatus(form, "No se ha podido guardar: " + error.message);
        return;
      }

      form.reset();
      setFormStatus(form, "guardado.");
      showItems();
    } catch (error) {
      setFormStatus(form, "No se ha podido guardar: " + error.message);
    }
  });

  showItems();
}

async function initWorldPage() {
  const worldMapForm = document.getElementById("world-map-form");
  const kingdomForm = document.getElementById("kingdom-form");
  const placeForm = document.getElementById("place-form");
  const kingdomsContainer = document.getElementById("kingdoms");
  const placesContainer = document.getElementById("places");
  const mapGallery = document.getElementById("world-map-gallery");
  const worldIndex = document.getElementById("world-index");
  const kingdomDetail = document.getElementById("kingdom-detail");
  const kingdomDetailContent = document.getElementById("kingdom-detail-content");
  const backToKingdoms = document.getElementById("back-to-kingdoms");

  if (!worldMapForm && !kingdomForm && !placeForm) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const book = params.get("book") || "sin-saga";
  const prettyBook = book.replaceAll("-", " ");
  const title = document.getElementById("book-title");
  let selectedKingdom = null;

  if (title) {
    title.textContent = prettyBook;
  }

  const hideKingdoms = book === "las-memorias-del-fuego";

  if (hideKingdoms) {
    document.querySelectorAll(".kingdoms-section").forEach(element => {
      element.style.display = "none";
    });
  }

  function addImages(container, images) {
    images.filter(image => image.src).forEach(imageData => {
      const image = document.createElement("img");
      image.className = imageData.className;
      image.src = imageData.src;
      image.alt = imageData.alt;
      container.appendChild(image);
    });
  }

  function showWorldIndex() {
    selectedKingdom = null;

    if (worldIndex) {
      worldIndex.hidden = false;
    }

    if (kingdomDetail) {
      kingdomDetail.hidden = true;
    }

    if (placesContainer) {
      placesContainer.innerHTML = "";
    }
  }

  function showKingdomDetail(item) {
    selectedKingdom = item;

    if (worldIndex) {
      worldIndex.hidden = true;
    }

    if (kingdomDetail) {
      kingdomDetail.hidden = false;
    }

    const placeKingdomInput = document.getElementById("placeKingdom");
    if (placeKingdomInput) {
      placeKingdomInput.value = item.name;
    }

    kingdomDetailContent.innerHTML = "";

    const images = document.createElement("div");
    images.className = "world-image-pair";
    addImages(images, [
      { src: item.flag_data, alt: `bandera de ${item.name}`, className: "world-small-image" },
      { src: item.map_data, alt: `mapa de ${item.name}`, className: "world-small-image world-detail-map" }
    ]);
    if (images.children.length) {
      kingdomDetailContent.appendChild(images);
    }

    const heading = document.createElement("h2");
    heading.textContent = item.display_order ? `${item.display_order}. ${item.name}` : item.name;

    const meta = document.createElement("p");
    meta.className = "review-meta";
    meta.textContent = [
      item.capital ? `capital: ${item.capital}` : "",
      item.languages ? `idioma/s: ${item.languages}` : "",
      item.explored_in_book ? `explorado en: ${item.explored_in_book}` : ""
    ].filter(Boolean).join(" · ");

    const text = document.createElement("p");
    text.className = "review-text";
    text.textContent = textBlock([
      ["Tipo de reino", item.kingdom_type],
      ["Gobernante / familia real", item.government],
      ["Cultura", item.culture],
      ["Religión", item.religion],
      ["Historia", item.history],
      ["Alianzas", item.alliances],
      ["Enemigos", item.enemies],
      ["Info extra", item.extra_info]
    ]);

    kingdomDetailContent.appendChild(heading);
    if (meta.textContent) {
      kingdomDetailContent.appendChild(meta);
    }
    if (text.textContent) {
      kingdomDetailContent.appendChild(text);
    }

    showPlaces();
    window.applyAdminVisibility();
  }

  if (backToKingdoms) {
    backToKingdoms.addEventListener("click", showWorldIndex);
  }

  async function showGeneralMap() {
    if (!mapGallery) {
      return;
    }

    mapGallery.innerHTML = "";

    const { data, error } = await supabaseClient
      .from("book_world_maps")
      .select("*")
      .eq("book_slug", book)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      showMessage(mapGallery, "No se ha podido cargar el mapa general: " + error.message);
      return;
    }

    if (!data.length || !data[0].map_data) {
      showMessage(mapGallery, "Todavía no hay mapa general.");
      return;
    }

    addImages(mapGallery, [{
      src: data[0].map_data,
      alt: `mapa general de ${prettyBook}`,
      className: "world-map-image general-world-map"
    }]);
  }

  if (worldMapForm) {
    worldMapForm.addEventListener("submit", async event => {
      event.preventDefault();

      try {
        setFormStatus(worldMapForm, "guardando...");
        const session = await requireSession();

        if (!session) {
          setFormStatus(worldMapForm, "Tienes que entrar en login para guardar.");
          return;
        }

        const file = document.getElementById("generalMap").files[0];
        if (!file) {
          setFormStatus(worldMapForm, "Elige una imagen antes de guardar.");
          return;
        }

        await supabaseClient
          .from("book_world_maps")
          .delete()
          .eq("book_slug", book);

        const { error } = await supabaseClient.from("book_world_maps").insert({
          book_slug: book,
          map_data: await readPhotoAsCompressedBase64(file)
        });

        if (error) {
          setFormStatus(worldMapForm, "No se ha podido guardar: " + error.message);
          return;
        }

        worldMapForm.reset();
        setFormStatus(worldMapForm, "mapa guardado.");
        showGeneralMap();
      } catch (error) {
        setFormStatus(worldMapForm, "No se ha podido guardar: " + error.message);
      }
    });
  }

  async function showKingdoms() {
    if (!kingdomsContainer || hideKingdoms) {
      return;
    }

    showMessage(kingdomsContainer, "cargando reinos...");

    const { data, error } = await supabaseClient
      .from("book_kingdoms")
      .select("*")
      .eq("book_slug", book)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) {
      showMessage(kingdomsContainer, "No se han podido cargar los reinos: " + error.message);
      return;
    }

    kingdomsContainer.innerHTML = "";

    if (!data.length) {
      showMessage(kingdomsContainer, "Todavía no hay reinos.");
      return;
    }

    data.forEach(item => {
      const article = document.createElement("article");
      article.className = "review-entry kingdom-list-entry";

      const openButton = document.createElement("button");
      openButton.className = "kingdom-open-button";
      openButton.type = "button";
      openButton.onclick = () => showKingdomDetail(item);

      const number = document.createElement("span");
      number.textContent = item.display_order || "";

      const content = document.createElement("div");

      const heading = document.createElement("h3");
      heading.textContent = item.name;

      const meta = document.createElement("p");
      meta.textContent = [
        item.capital ? `capital: ${item.capital}` : "",
        item.languages ? `idioma/s: ${item.languages}` : "",
        item.explored_in_book ? `explorado en: ${item.explored_in_book}` : ""
      ].filter(Boolean).join(" · ");

      content.appendChild(heading);
      if (meta.textContent) {
        content.appendChild(meta);
      }
      openButton.appendChild(number);
      openButton.appendChild(content);

      const button = document.createElement("button");
      button.className = "delete-button admin-only";
      button.textContent = "borrar";
      button.onclick = () => deleteRow("book_kingdoms", item.id, showKingdoms);

      article.appendChild(openButton);
      article.appendChild(button);
      kingdomsContainer.appendChild(article);
    });

    window.applyAdminVisibility();
  }

  async function showPlaces() {
    if (!placesContainer) {
      return;
    }

    if (!selectedKingdom) {
      showMessage(placesContainer, "Entra en un reino para ver sus lugares.");
      return;
    }

    showMessage(placesContainer, "cargando lugares...");

    const { data, error } = await supabaseClient
      .from("book_places")
      .select("*")
      .eq("book_slug", book)
      .eq("kingdom_name", selectedKingdom.name)
      .order("created_at", { ascending: false });

    if (error) {
      showMessage(placesContainer, "No se han podido cargar los lugares: " + error.message);
      return;
    }

    placesContainer.innerHTML = "";

    if (!data.length) {
      showMessage(placesContainer, "Todavía no hay lugares en este reino.");
      return;
    }

    data.forEach(item => {
      placesContainer.appendChild(renderPlace(item, prettyBook, showPlaces));
    });

    window.applyAdminVisibility();
  }

  if (kingdomForm && !hideKingdoms) {
    kingdomForm.addEventListener("submit", async event => {
      event.preventDefault();

      try {
        setFormStatus(kingdomForm, "guardando...");
        const session = await requireSession();

        if (!session) {
          setFormStatus(kingdomForm, "Tienes que entrar en login para guardar.");
          return;
        }

        const orderValue = document.getElementById("kingdomOrder").value;
        const { error } = await supabaseClient.from("book_kingdoms").insert({
          book_slug: book,
          name: document.getElementById("kingdomName").value,
          display_order: orderValue ? Number(orderValue) : null,
          flag_data: await readPhotoAsCompressedBase64(document.getElementById("flag").files[0]),
          map_data: await readPhotoAsCompressedBase64(document.getElementById("map").files[0]),
          capital: document.getElementById("capital").value,
          languages: document.getElementById("languages").value,
          culture: document.getElementById("culture").value,
          religion: document.getElementById("religion").value,
          history: document.getElementById("history").value,
          government: document.getElementById("government").value,
          kingdom_type: document.getElementById("kingdomType").value,
          alliances: document.getElementById("alliances").value,
          enemies: document.getElementById("enemies").value,
          explored_in_book: document.getElementById("exploredInBook").value,
          extra_info: document.getElementById("kingdomExtra").value
        });

        if (error) {
          setFormStatus(kingdomForm, "No se ha podido guardar: " + error.message);
          return;
        }

        kingdomForm.reset();
        setFormStatus(kingdomForm, "guardado.");
        showKingdoms();
      } catch (error) {
        setFormStatus(kingdomForm, "No se ha podido guardar: " + error.message);
      }
    });
  }

  if (placeForm) {
    placeForm.addEventListener("submit", async event => {
      event.preventDefault();

      try {
        setFormStatus(placeForm, "guardando...");
        const session = await requireSession();

        if (!session) {
          setFormStatus(placeForm, "Tienes que entrar en login para guardar.");
          return;
        }

        if (!selectedKingdom) {
          setFormStatus(placeForm, "Entra en un reino antes de guardar un lugar.");
          return;
        }

        const extraInfo = document.getElementById("placeExtra").value;
        const importance = document.getElementById("placeImportance").value;
        const { error } = await supabaseClient.from("book_places").insert({
          book_slug: book,
          name: document.getElementById("placeName").value,
          book_name: document.getElementById("placeBook").value,
          kingdom_name: selectedKingdom.name,
          place_type: document.getElementById("placeType").value,
          importance: importance,
          notes: extraInfo,
          description: extraInfo || importance || "-",
          photo_data: await readPhotoAsCompressedBase64(document.getElementById("placePhoto").files[0])
        });

        if (error) {
          setFormStatus(placeForm, "No se ha podido guardar: " + error.message);
          return;
        }

        placeForm.reset();
        document.getElementById("placeKingdom").value = selectedKingdom.name;
        setFormStatus(placeForm, "guardado.");
        showPlaces();
      } catch (error) {
        setFormStatus(placeForm, "No se ha podido guardar: " + error.message);
      }
    });
  }

  showGeneralMap();
  showKingdoms();
  showWorldIndex();
}

function textBlock(parts) {
  return parts
    .filter(([, value]) => value && value.trim())
    .map(([label, value]) => `${label}:\n${value}`)
    .join("\n\n");
}

function renderCharacter(item, prettyBook, refresh) {
  const article = document.createElement("article");
  article.className = "review-entry";

  if (item.photo_data) {
    const image = document.createElement("img");
    image.className = "review-photo";
    image.src = item.photo_data;
    image.alt = item.name;
    article.appendChild(image);
  }

  const title = document.createElement("h3");
  title.textContent = item.name;

  const meta = document.createElement("p");
  meta.className = "review-meta";
  const metaParts = [
    item.role_in_story,
    item.birth,
    item.mbti,
    item.favorite_color ? `color: ${item.favorite_color}` : "",
    item.favorite_food ? `comida: ${item.favorite_food}` : ""
  ].filter(Boolean);
  meta.textContent = metaParts.join(" · ");

  const text = document.createElement("p");
  text.className = "review-text";
  text.textContent = textBlock([
    ["Apodo", item.nickname],
    ["Gustos", item.likes],
    ["Mascota", item.pet],
    ["Cosas que detesta", item.hates],
    ["Talentos", item.talents],
    ["Debilidades", item.weaknesses],
    ["Miedo", item.fear],
    ["Deseo o sueño", item.dream],
    ["Secreto", item.secret],
    ["Frase", item.quote],
    ["Descripción", item.description]
  ]);

  const button = document.createElement("button");
  button.className = "delete-button admin-only";
  button.textContent = "borrar";
  button.onclick = () => deleteRow("book_characters", item.id, refresh);

  article.appendChild(title);
  if (meta.textContent) {
    article.appendChild(meta);
  }
  if (text.textContent) {
    article.appendChild(text);
  }
  article.appendChild(button);
  return article;
}

function renderPlace(item, prettyBook, refresh) {
  const article = document.createElement("article");
  article.className = "review-entry";

  if (item.photo_data) {
    const image = document.createElement("img");
    image.className = "review-photo";
    image.src = item.photo_data;
    image.alt = item.name;
    article.appendChild(image);
  }

  const title = document.createElement("h3");
  title.textContent = item.name;

  const meta = document.createElement("p");
  meta.className = "review-meta";
  meta.textContent = [
    item.kingdom_name ? `reino: ${item.kingdom_name}` : "",
    item.book_name ? `libro: ${item.book_name}` : "",
    item.place_type
  ].filter(Boolean).join(" · ");

  const text = document.createElement("p");
  text.className = "review-text";
  text.textContent = textBlock([
    ["Importancia en la historia", item.importance],
    ["Info extra", item.notes || (item.description === "-" ? "" : item.description)]
  ]);

  const button = document.createElement("button");
  button.className = "delete-button admin-only";
  button.textContent = "borrar";
  button.onclick = () => deleteRow("book_places", item.id, refresh);

  article.appendChild(title);
  if (meta.textContent) {
    article.appendChild(meta);
  }
  if (text.textContent) {
    article.appendChild(text);
  }
  article.appendChild(button);
  return article;
}

function renderSynopsis(item, prettyBook, refresh) {
  const article = document.createElement("article");
  article.className = "review-entry";

  const meta = document.createElement("p");
  meta.className = "review-meta";
  meta.textContent = item.type;

  const title = document.createElement("h3");
  title.textContent = item.title;

  const text = document.createElement("p");
  text.className = "review-text";
  text.textContent = item.body;

  const button = document.createElement("button");
  button.className = "delete-button admin-only";
  button.textContent = "borrar";
  button.onclick = () => deleteRow("book_synopsis", item.id, refresh);

  article.appendChild(meta);
  article.appendChild(title);
  article.appendChild(text);
  article.appendChild(button);
  return article;
}

document.addEventListener("DOMContentLoaded", () => {
  initFilosofia();
  initRecomendaciones();
  initTodo();
  initWorldPage();

  initBookItems({
    formId: "character-form",
    containerId: "characters",
    table: "book_characters",
    emptyText: "Todavía no hay personajes.",
    payload: async book => ({
      book_slug: book,
      name: document.getElementById("name").value,
      birth: document.getElementById("birth").value,
      nickname: document.getElementById("nickname").value,
      role_in_story: document.getElementById("role").value,
      mbti: document.getElementById("mbti").value,
      likes: document.getElementById("likes").value,
      favorite_color: document.getElementById("color").value,
      favorite_food: document.getElementById("food").value,
      pet: document.getElementById("pet").value,
      hates: document.getElementById("hates").value,
      talents: document.getElementById("talents").value,
      weaknesses: document.getElementById("weaknesses").value,
      fear: document.getElementById("fear").value,
      dream: document.getElementById("dream").value,
      secret: document.getElementById("secret").value,
      quote: document.getElementById("quote").value,
      description: document.getElementById("description").value,
      photo_data: await readPhotoAsCompressedBase64(document.getElementById("photo").files[0])
    }),
    render: renderCharacter
  });


  initBookItems({
    formId: "synopsis-form",
    containerId: "synopsis-list",
    table: "book_synopsis",
    emptyText: "Todavía no hay información guardada.",
    payload: async book => ({
      book_slug: book,
      title: document.getElementById("title").value,
      type: document.getElementById("type").value,
      body: document.getElementById("text").value
    }),
    render: renderSynopsis
  });
});
