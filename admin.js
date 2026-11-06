// =====================================
// K2 PHONE WORLD - ADMIN EXTENSIONS
// =====================================

// Phone brands
const K2_PHONE_BRANDS = [
  "Samsung",
  "iPhone",
  "Tecno",
  "Infinix",
  "itel",
  "Redmi",
  "Oppo",
  "Vivo",
  "Nokia",
  "Other"
];

// Product image preview
document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("productImage");

  if (imageInput) {
    imageInput.addEventListener("change", function () {
      const file = this.files[0];

      let preview = document.getElementById("productImagePreview");

      if (!preview) {
        preview = document.createElement("img");
        preview.id = "productImagePreview";
        preview.style.cssText =
          "width:150px;height:150px;object-fit:contain;background:white;border-radius:10px;margin:10px 0;";

        this.insertAdjacentElement("afterend", preview);
      }

      if (file && file.type.startsWith("image/")) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
      } else {
        preview.style.display = "none";
      }
    });
  }
});

// Populate phone brands when category is phone
function setupK2BrandOptions() {
  const category = document.getElementById("productCategory");

  if (!category) return;

  category.addEventListener("change", function () {
    const existing = document.getElementById("productBrand");

    if (this.value === "phone") {
      if (!existing) {
        const select = document.createElement("select");
        select.id = "productBrand";
        select.required = true;

        select.innerHTML =
          '<option value="">Select Phone Brand</option>' +
          K2_PHONE_BRANDS.map(brand =>
            `<option value="${brand}">${brand}</option>`
          ).join("");

        category.insertAdjacentElement("afterend", select);
      }
    } else if (existing) {
      existing.remove();
    }
  });
}

document.addEventListener("DOMContentLoaded", setupK2BrandOptions);

console.log("K2 Admin Extensions Loaded");
