// =====================================
// K2 PHONE WORLD - WEBSITE APPLICATION
// =====================================

const SUPABASE_URL = "https://eclgmjvvwsstafwluoww.supabase.co";

const SUPABASE_KEY = "sb_publishable_IywcKGkUJbp1HYiKxepanA_SANmW6z0";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const BUCKET = "k2-media";

let currentUser = null;

// =====================================
// BUSINESS SETTINGS
// =====================================

function getSettings() {
  return JSON.parse(
    localStorage.getItem("k2_website_settings") || "{}"
  );
}

function updateContactDetails() {
  const settings = getSettings();

  const number = (settings.whatsapp || "0774579357")
    .replace(/\D/g, "");

  const internationalNumber =
    number.startsWith("256") ? number :
    number.startsWith("0") ? "256" + number.substring(1) :
    "256" + number;

  document.querySelectorAll(".whatsapp-link").forEach(link => {
    link.href = "https://wa.me/" + internationalNumber;
  });
}

// =====================================
// NAVIGATION
// =====================================

function toggleMenu() {
  document.getElementById("navigation")
    .classList.toggle("active");
}

function showAdminLogin() {
  document.getElementById("adminLogin").style.display = "block";
  document.getElementById("adminLogin")
    .scrollIntoView({ behavior: "smooth" });
}

function closeAdmin() {
  document.getElementById("adminLogin").style.display = "none";
  document.getElementById("adminDashboard").style.display = "none";
}

function showAdminTab(tabName) {
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.style.display = "none";
  });

  document.getElementById(tabName).style.display = "block";

  if (tabName === "manageProducts") {
    loadAdminProducts();
  }
}

// =====================================
// SECURITY - CHECK ADMIN
// =====================================

async function checkAdmin(user) {
  const { data, error } = await supabaseClient
    .from("k2_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Admin verification error:", error);
    return false;
  }

  return !!data;
}

// =====================================
// ADMIN LOGIN
// =====================================

document.getElementById("adminLoginForm")
  .addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    const { data, error } = await supabaseClient.auth
      .signInWithPassword({ email, password });

    if (error) {
      alert("Login failed: " + error.message);
      return;
    }

    const authorized = await checkAdmin(data.user);

    if (!authorized) {
      await supabaseClient.auth.signOut();
      alert("You are not authorized to access this dashboard.");
      return;
    }

    currentUser = data.user;

    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminDashboard").style.display = "block";

    showAdminTab("addProduct");

    alert("Welcome to K2 Phone World Admin!");
  });

// =====================================
// ADMIN LOGOUT
// =====================================

async function adminLogout() {
  await supabaseClient.auth.signOut();

  currentUser = null;

  document.getElementById("adminDashboard").style.display = "none";

  alert("You have logged out successfully.");
}

// Restore an existing authorized session
async function restoreSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    const authorized = await checkAdmin(data.session.user);

    if (authorized) {
      currentUser = data.session.user;
    } else {
      await supabaseClient.auth.signOut();
    }
  }
}

// =====================================
// HELPER FUNCTIONS
// =====================================

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatPrice(price) {
  return "UGX " + Number(price || 0).toLocaleString("en-UG");
}

function getImageURL(path) {
  const { data } = supabaseClient.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

function whatsappNumber() {
  return (getSettings().whatsapp || "0774579357")
    .replace(/\D/g, "")
    .replace(/^0/, "256");
}

// =====================================
// LOAD WEBSITE PRODUCTS
// =====================================

async function loadProducts() {

  const { data, error } = await supabaseClient
    .from("k2_items")
    .select("*")
    .eq("kind", "product")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    document.getElementById("phoneProducts").innerHTML =
      "<p>Unable to load products. Please try again later.</p>";
    return;
  }

  const phones = data.filter(item => item.category === "phone");
  const accessories = data.filter(item => item.category === "accessory");

  displayProducts(phones, "phoneProducts");
  displayProducts(accessories, "accessoryProducts");
}

// =====================================
// DISPLAY PRODUCTS
// =====================================

function displayProducts(products, containerId) {

  const container = document.getElementById(containerId);

  if (!products.length) {
    container.innerHTML = "<p>Products coming soon. Please check again.</p>";
    return;
  }

  container.innerHTML = products.map(product => {

    const image = getImageURL(product.file_path);

    const message = encodeURIComponent(
      "Hello K2 Phone World, I am interested in " +
      product.title + " priced at " + formatPrice(product.price_ugx)
    );

    return `
      <div class="product-card">
        <img src="${escapeHTML(image)}"
             alt="${escapeHTML(product.title)}"
             loading="lazy">

        <h3>${escapeHTML(product.title)}</h3>

        <p>${escapeHTML(product.description || "")}</p>

        <p class="product-price">
          ${formatPrice(product.price_ugx)}
        </p>

        <a class="main-btn"
           href="https://wa.me/${whatsappNumber()}?text=${message}"
           target="_blank"
           rel="noopener">
           Order on WhatsApp
        </a>
      </div>
    `;
  }).join("");
}
// =====================================
// ADD PRODUCT
// =====================================

document.getElementById("productForm")
  .addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!currentUser) {
      alert("Please log in as an authorized admin.");
      return;
    }

    const title = document.getElementById("productTitle").value.trim();
    const category = document.getElementById("productCategory").value;
    const brandElement = document.getElementById("productBrand");
    const brand = category === "phone" && brandElement
      ? brandElement.value
      : null;

    const price = Number(document.getElementById("productPrice").value);
    const description = document.getElementById("productDescription").value.trim();
    const file = document.getElementById("productImage").files[0];

    if (!title || !price || price <= 0 || !file) {
      alert("Enter a valid product name, price and image.");
      return;
    }

    if (category === "phone" && !brand) {
      alert("Please select a phone brand.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    const path = "products/" + Date.now() + "_" +
      file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const { error: uploadError } = await supabaseClient.storage
      .from(BUCKET)
      .upload(path, file);

    if (uploadError) {
      alert("Image upload failed: " + uploadError.message);
      return;
    }

    const { error } = await supabaseClient
      .from("k2_items")
      .insert({
        title: title,
        kind: "product",
        category: category,
        brand: brand,
        description: description,
        price_ugx: price,
        file_path: path,
        file_type: file.type
      });

    if (error) {
      await supabaseClient.storage.from(BUCKET).remove([path]);
      alert("Product saving failed: " + error.message);
      return;
    }

    alert("Product added successfully!");

    this.reset();

    const preview = document.getElementById("productImagePreview");
    if (preview) preview.style.display = "none";

    const brandSelect = document.getElementById("productBrand");
    if (brandSelect) brandSelect.remove();

    await loadProducts();
    await loadAdminProducts();
  });

// =====================================
// ADMIN PRODUCT MANAGEMENT
// =====================================

async function loadAdminProducts() {

  const container = document.getElementById("adminProductList");

  container.innerHTML = "<p>Loading products...</p>";

  const { data, error } = await supabaseClient
    .from("k2_items")
    .select("*")
    .eq("kind", "product")
    .order("created_at", { ascending: false });

  if (error) {
    container.innerHTML = "<p>Unable to load products.</p>";
    return;
  }

  if (!data.length) {
    container.innerHTML = "<p>No products have been added yet.</p>";
    return;
  }

  container.innerHTML = data.map(product => `
    <div class="product-card">
      <h3>${escapeHTML(product.title)}</h3>
      <p>${formatPrice(product.price_ugx)}</p>

      <button onclick="editProduct(${product.id})">
        Edit
      </button>

      <button onclick="deleteProduct(${product.id})">
        Delete
      </button>
    </div>
  `).join("");
}

// =====================================
// EDIT PRODUCT
// =====================================

async function editProduct(id) {

  if (!currentUser) return;

  const { data: product, error } = await supabaseClient
    .from("k2_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    alert("Product not found.");
    return;
  }

  const title = prompt("Enter product name:", product.title);
  if (title === null) return;

  const price = prompt("Enter new price in UGX:", product.price_ugx);
  if (price === null) return;

  const newPrice = Number(price);

  if (!title.trim() || !Number.isFinite(newPrice) || newPrice <= 0) {
    alert("Enter a valid product name and price.");
    return;
  }

  const { error: updateError } = await supabaseClient
    .from("k2_items")
    .update({
      title: title.trim(),
      price_ugx: newPrice
    })
    .eq("id", id);

  if (updateError) {
    alert("Update failed: " + updateError.message);
    return;
  }

  alert("Product updated!");

  await loadProducts();
  await loadAdminProducts();
}

// =====================================
// DELETE PRODUCT
// =====================================

async function deleteProduct(id) {

  if (!currentUser) return;

  if (!confirm("Are you sure you want to delete this product?")) {
    return;
  }

  const { data: product, error: readError } = await supabaseClient
    .from("k2_items")
    .select("file_path")
    .eq("id", id)
    .single();

  if (readError) {
    alert("Could not find product.");
    return;
  }

  const { error } = await supabaseClient
    .from("k2_items")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Delete failed: " + error.message);
    return;
  }

  if (product.file_path) {
    const { error: storageError } = await supabaseClient.storage
      .from(BUCKET)
      .remove([product.file_path]);

    if (storageError) {
      console.error("Image cleanup failed:", storageError);
    }
  }

  alert("Product deleted.");

  await loadProducts();
  await loadAdminProducts();
}

// =====================================
// UPLOAD PHOTOS AND VIDEOS
// =====================================

document.getElementById("mediaForm")
  .addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!currentUser) return;

    const title = document.getElementById("mediaTitle").value.trim();
    const file = document.getElementById("mediaFile").files[0];

    if (!file) {
      alert("Please select a photo or video.");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Only photos and videos are allowed.");
      return;
    }

    const kind = isImage ? "photo" : "video";

    const path = "media/" + Date.now() + "_" +
      file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const { error: uploadError } = await supabaseClient.storage
      .from(BUCKET)
      .upload(path, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      return;
    }

    const { error } = await supabaseClient
      .from("k2_items")
      .insert({
        title: title || file.name,
        kind: kind,
        category: "general",
        file_path: path,
        file_type: file.type
      });

    if (error) {
      await supabaseClient.storage.from(BUCKET).remove([path]);
      alert("Saving media failed: " + error.message);
      return;
    }

    alert("Media uploaded successfully!");

    this.reset();
    await loadGallery();
  });

// =====================================
// LOAD PHOTO AND VIDEO GALLERY
// =====================================

async function loadGallery() {

  const container = document.getElementById("mediaGallery");

  const { data, error } = await supabaseClient
    .from("k2_items")
    .select("*")
    .in("kind", ["photo", "video"])
    .order("created_at", { ascending: false });

  if (error) {
    container.innerHTML = "<p>Unable to load gallery.</p>";
    return;
  }

  if (!data.length) {
    container.innerHTML = "<p>Our gallery is coming soon.</p>";
    return;
  }

  container.innerHTML = data.map(item => {

    const url = escapeHTML(getImageURL(item.file_path));

    const media = item.kind === "video"
      ? `<video src="${url}" controls style="width:100%"></video>`
      : `<img src="${url}" alt="${escapeHTML(item.title)}" style="width:100%">`;

    return `
      <div class="product-card">
        ${media}
        <h3>${escapeHTML(item.title)}</h3>
      </div>
    `;
  }).join("");
}

// =====================================
// BUSINESS SETTINGS
// =====================================

document.getElementById("settingsForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    if (!currentUser) return;

    const settings = {
      name: document.getElementById("businessName").value,
      phone: document.getElementById("businessPhone").value,
      address: document.getElementById("businessAddress").value,
      whatsapp: document.getElementById("businessWhatsApp").value
    };

    localStorage.setItem(
      "k2_website_settings",
      JSON.stringify(settings)
    );

    updateContactDetails();

    alert("Business settings saved!");
  });

// =====================================
// INITIALIZE WEBSITE
// =====================================

async function initializeWebsite() {

  await restoreSession();

  await loadProducts();

  await loadGallery();

  updateContactDetails();

  const settings = getSettings();

  document.getElementById("businessName").value =
    settings.name || "K2 Phone World";

  document.getElementById("businessPhone").value =
    settings.phone || "";

  document.getElementById("businessAddress").value =
    settings.address || "Kampala Road";

  document.getElementById("businessWhatsApp").value =
    settings.whatsapp || "0774579357";
}

initializeWebsite();
