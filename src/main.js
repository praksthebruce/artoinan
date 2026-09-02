import "./style.css";

const API_KEY = import.meta.env.VITE_NASA_API_KEY;
const app = document.querySelector("#app");

let current_date = new Date();

let favos = JSON.parse(localStorage.getItem("cosmicArchive")) || [];

function renderArchiveCard(item, index) {
  return `
      <article class="archive-card">
       <img src="${item.url}" alt="${item.title}">
       <h3>${item.title}</h3>
       <p>${item.date}</p>
      <button class="remove-favorite" data-index="${index}">
       Remove
      </button>
    </article>
  `;
}

function renderArchive() {
  if (favos.length === 0) {
    return `
      <section class="archive">
        <h2>Cosmic Archive</h2>
        <p>No discoveries saved yet.</p>
      </section>
    `;
  }

  return `
    <section class="archive">
      <h2> Cosmic Archive</h2>

      <div class="archive-grid">
        ${favos.map(renderArchiveCard).join("")}
      </div>
    </section>
  `;
}

function save_to_favorites(data) {
  
  const alreadySaved = favos.some((item) => item.date === data.date);

  if (alreadySaved) {
    alert("This APOD is already in your Cosmic Archive!");
    return;
  }

  favos.push(data);

  localStorage.setItem(
    "cosmicArchive",
    JSON.stringify(favos)
  );
   alert("Saved to your Cosmic Archive!");
   loadAPOD(current_date);
}

function remove_from_favorites(index) {
  favos.splice(index, 1);

  localStorage.setItem(
    "cosmicArchive",
    JSON.stringify(favos)
  );

  loadAPOD(current_date);
}

async function loadAPOD(date) {
  app.innerHTML = "<p>Loading...</p>";

  const isoDate = date.toISOString().split("T")[0];

  try {
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${isoDate}`
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    let media;

    if (data.media_type === "image") {
      media = `
        <img src="${data.url}" alt="${data.title}">
      `;
    } else {
      media = `
        <iframe
          src="${data.url}"
          frameborder="0"
          allowfullscreen>
        </iframe>
      `;
    }

    app.innerHTML = `
          <header class="site-header">
    <h2>ASTRA</h2>
    <p>NASA DAILY SPACE EXPLORER</p>
  </header>

        
      <h1>${data.title}</h1>
     

      ${media}

      <p>${data.explanation}</p>

      <div class="controls">
        <button id="prev">◀ Prev</button>

        <span>${data.date}</span>

      <button id="next">Next ▶</button>
      
       </div>

      <button id="Save_To_Favorites">
        Save to Cosmic Archive
      </button>

      ${renderArchive()}
    `;
   document.querySelector("#prev").onclick = () => {
      change_date(-1);
    };
   document.querySelector("#next").onclick = () => {
      change_date(1);
    };
   document.querySelector("#Save_To_Favorites").onclick = () => {
      save_to_favorites(data);
    };
   document.querySelectorAll(".remove-favorite").forEach((button) => {
      button.onclick = () => {
        const index = Number(button.dataset.index);
        remove_from_favorites(index);
      };
    });

  } catch (err) {
    app.innerHTML = `
      <p>Failed to load: ${err.message}</p>
    `;

    console.error(err);
  }
}

function change_date(days) {
  current_date.setDate(current_date.getDate() + days);

  loadAPOD(current_date);
}

loadAPOD(current_date);