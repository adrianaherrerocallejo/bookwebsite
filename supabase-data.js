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
  meta.textContent = item.book_name || prettyBook;

  const text = document.createElement("p");
  text.className = "review-text";
  text.textContent = textBlock([
    ["Descripción", item.description],
    ["Notas", item.notes]
  ]);

  const button = document.createElement("button");
  button.className = "delete-button admin-only";
  button.textContent = "borrar";
  button.onclick = () => deleteRow("book_places", item.id, refresh);

  article.appendChild(title);
  article.appendChild(meta);
  article.appendChild(text);
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
    formId: "world-form",
    containerId: "places",
    table: "book_places",
    emptyText: "Todavía no hay lugares.",
    payload: async book => ({
      book_slug: book,
      name: document.getElementById("name").value,
      book_name: document.getElementById("bookName").value,
      description: document.getElementById("description").value,
      notes: document.getElementById("notes").value,
      photo_data: await readPhotoAsCompressedBase64(document.getElementById("photo").files[0])
    }),
    render: renderPlace
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
