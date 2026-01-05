// const carListEl = document.getElementById('car-container');
// const searchInput = document.getElementById('search-input');
// const uploadSection = document.getElementById('upload-section');
// const carForm = document.getElementById('car-form');
// const uploadStatus = document.getElementById('upload-status');

// const navUpload = document.getElementById('nav-upload');
// const navLogin = document.getElementById('nav-login');
// const navLogout = document.getElementById('nav-logout');

// let cars = [];
// let filteredCars = [];

// // Check if admin logged in by calling a protected API endpoint or checking session cookie
// async function checkAuth() {
//   // Try fetching cars with auth check via a dummy request with credentials
//   try {
//     const res = await fetch('/api/cars', { credentials: 'include' });
//     if (res.ok) {
//       showAdminUI(true);
//     } else {
//       showAdminUI(false);
//     }
//   } catch {
//     showAdminUI(false);
//   }
// }

// // Show/hide admin UI elements
//  function showAdminUI(isAdmin) {
//   // if (isAdmin) {
//   //   navUpload.style.display = 'inline';
//   //   navLogout.style.display = 'inline';
//   //   navLogin.style.display = 'none';
//   //   uploadSection.style.display = 'block';
//   // } else {
//     navUpload.style.display = 'none';
//     navLogout.style.display = 'none';
//     navLogin.style.display = 'inline';
//     uploadSection.style.display = 'none';
//   // }
// }

// // Fetch cars from API
// async function fetchCars() {
//   const res = await fetch('/api/cars');
//   cars = await res.json();
//   filteredCars = [...cars];
//   renderCars();
// }

// // Render cars with Edit/Delete buttons if admin
// function renderCars() {
//   carListEl.innerHTML = '';

//   const isAdmin = navUpload.style.display === 'inline';

//   filteredCars.forEach((car, idx) => {
//     const card = document.createElement('div');
//     card.className = 'car-card';

//     card.innerHTML = `
//       <img src="${car.image}" alt="${car.name}" />
//       <div class="details">
//         <h3>${car.name}</h3>
//         <p>${car.description}</p>
//       </div>
//     `;

//     if (isAdmin) {
//       const actions = document.createElement('div');
//       actions.className = 'actions';

//       const editBtn = document.createElement('button');
//       editBtn.textContent = 'Edit';
//       editBtn.onclick = () => openEditForm(idx);

//       const deleteBtn = document.createElement('button');
//       deleteBtn.textContent = 'Delete';
//       deleteBtn.onclick = () => deleteCar(idx);

//       actions.appendChild(editBtn);
//       actions.appendChild(deleteBtn);
//       card.appendChild(actions);
//     }

//     carListEl.appendChild(card);
//   });
// }

// // Filter cars by name
// searchInput.addEventListener('input', () => {
//   const term = searchInput.value.trim().toLowerCase();
//   filteredCars = cars.filter(c => c.name.toLowerCase().includes(term));
//   renderCars();
// });

// // Upload new car
// carForm.addEventListener('submit', async e => {
//   e.preventDefault();

//   const formData = new FormData(carForm);

//   // Check if editing or adding new (for simplicity, only adding here)
//   if (carForm.dataset.editIndex) {
//     const idx = carForm.dataset.editIndex;
//     const res = await fetch('/api/cars/' + idx, {
//       method: 'PUT',
//       body: formData,
//       credentials: 'include'
//     });

//     if (res.ok) {
//       uploadStatus.textContent = 'Car updated successfully!';
//       carForm.reset();
//       delete carForm.dataset.editIndex;
//       fetchCars();
//     } else {
//       const data = await res.json();
//       uploadStatus.textContent = 'Error: ' + (data.message || 'Failed to update car.');
//     }
//   } else {
//     const res = await fetch('/api/cars', {
//       method: 'POST',
//       body: formData,
//       credentials: 'include'
//     });

//     if (res.ok) {
//       uploadStatus.textContent = 'Car uploaded successfully!';
//       carForm.reset();
//       fetchCars();
//     } else {
//       const data = await res.json();
//       uploadStatus.textContent = 'Error: ' + (data.message || 'Failed to upload car.');
//     }
//   }
// });

// // Delete car
// async function deleteCar(idx) {
//   if (!confirm('Are you sure you want to delete this car?')) return;
//   const res = await fetch('/api/cars/' + idx, {
//     method: 'DELETE',
//     credentials: 'include'
//   });

//   if (res.ok) {
//     fetchCars();
//   } else {
//     alert('Failed to delete car');
//   }
// }

// // Open edit form with existing car data
// function openEditForm(idx) {
//   const car = filteredCars[idx];
//   if (!car) return;
//   document.getElementById('car-name').value = car.name;
//   document.getElementById('car-description').value = car.description;
//   document.getElementById('car-image').required = false; // image upload optional on edit
//   carForm.dataset.editIndex = idx;
//   uploadStatus.textContent = 'Editing car: ' + car.name;
// }

// // Logout
// navLogout.addEventListener('click', async () => {
//   await fetch('/api/logout', { method: 'POST', credentials: 'include' });
//   showAdminUI(false);
//   fetchCars();
// });

// // Clicking Upload nav scrolls to upload section
// navUpload.addEventListener('click', e => {
//   e.preventDefault();
//   uploadSection.scrollIntoView({ behavior: 'smooth' });
// });

// // On page load
// window.onload = async () => {
//   await checkAuth();
//   await fetchCars();
// };
const container = document.getElementById("car-container");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const emptyState = document.getElementById("empty-state");

let cars = [];

async function fetchCars() {
  const res = await fetch("/api/cars");
  cars = await res.json();
  render();
}

function render() {
  const term = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = cars.filter(car => {
    const matchName = car.name.toLowerCase().includes(term);
    const matchCat = category === "all" || car.category === category;
    return matchName && matchCat;
  });

  container.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  filtered.forEach((car, index) => {
    const card = document.createElement("div");
    card.className = "car-card";

    card.innerHTML = `
    <a href="car.html?id=${index}" class="details-btn">
      <img src="${car.image}">
      <div class="content">
        <span class="tag">${car.category || "premium"}</span>
        <h3>${car.name}</h3>
        <p>${car.description}</p>
        <h3> View Details </h3>
      </div>
       </a>
    `;

    container.appendChild(card);
  });
}

searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);

fetchCars();
