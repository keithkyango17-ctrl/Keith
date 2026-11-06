// Comprehensive catalog array containing dynamic stock layouts
const products = [
    { id: 1, name: "Luxury Liquid Silicone Armor Protective Case", price: 35000, category: "covers", tag: "iPhone 15/14/13 Pro Max", img: "https://unsplash.com" },
    { id: 2, name: "Carbon Fiber Rugged Military Shockproof Shield", price: 45000, category: "covers", tag: "Samsung Galaxy S24/S23 Ultra", img: "https://unsplash.com" },
    { id: 3, name: "Crystal Clear Anti-Yellowing Magnetic MagSafe Guard", price: 40000, category: "covers", tag: "Universal Hybrid Clear", img: "https://unsplash.com" },
    { id: 4, name: "Translucent Matte Sleek Protection Shell Backplate", price: 30000, category: "covers", tag: "Xiaomi / Redmi Series", img: "https://unsplash.com" },
    { id: 5, name: "65W Multi-Port GaN Supercharger Power Block", price: 85000, category: "chargers", tag: "Dual Type-C + QuickCharge USB", img: "https://unsplash.com" },
    { id: 6, name: "20W PD Smart Adaptive Power Adapter Block", price: 55000, category: "chargers", tag: "Optimized For Apple & Samsung", img: "https://unsplash.com" },
    { id: 7, name: "15W Magnetic Snap Qi Fast Wireless Charger Pad", price: 75000, category: "chargers", tag: "Wireless Fast Charge Dock", img: "https://unsplash.com" },
    { id: 8, name: "Premium Braided Heavy-Duty Nylon USB-C to Lightning Cable", price: 25000, category: "chargers", tag: "Data Sync Cable - 2M", img: "https://unsplash.com" },
    { id: 9, name: "HD Tempered Glass Screen Shield Pro 9H", price: 15000, category: "accessories", tag: "Anti-Scratch Oleophobic Glass", img: "https://unsplash.com" },
    { id: 10, name: "Adjustable Lock Mechanical Desktop Car Mount Holder", price: 45000, category: "accessories", tag: "Dashboard Driving Utility", img: "https://unsplash.com" },
    { id: 11, name: "True Wireless Noise-Cancelling Bluetooth Earbuds", price: 120000, category: "accessories", tag: "Premium Smart Audio", img: "https://unsplash.com" },
    { id: 12, name: "Aldeepo AD-S96 Portable RGB Wireless Bluetooth Speaker", price: 65000, category: "accessories", tag: "Bass Enhanced Shell", img: "https://unsplash.com" }
];

let activeCart = [];

// App Lifecycle Entry Initialization
function initApp() {
    renderCatalogue(products);
    lucide.createIcons();
}

function renderCatalogue(productsList) {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = productsList.map(prod => `
        <div class="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
            <div>
                <div class="relative overflow-hidden rounded-xl bg-slate-100 mb-4 aspect-square">
                    <img src="${prod.img}" alt="${prod.name}" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md">${prod.tag}</span>
                </div>
                <h3 class="font-bold text-slate-800 text-base mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">${prod.name}</h3>
                <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">${prod.category}</p>
            </div>
            <div>
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                    <span class="text-indigo-600 font-extrabold text-sm">UGX ${prod.price.toLocaleString()}</span>
                    <button onclick="addToCart(${prod.id})" class="bg-slate-900 hover:bg-indigo-600 text-white p-2.5 rounded-xl transition flex items-center justify-center shadow-md cursor-pointer">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Refresh icons inside dynamically appended strings
    lucide.createIcons();
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.className = "cat-btn px-5 py-2.5 rounded-xl font-medium text-sm transition bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60 cursor-pointer";
    });
    
    document.getElementById(`btn-${cat}`).className = "cat-btn px-5 py-2.5 rounded-xl font-medium text-sm transition bg-indigo-600 text-white shadow-sm cursor-pointer";

    if (cat === 'all') {
        renderCatalogue(products);
    } else {
        const filtered = products.filter(p => p.category === cat);
        renderCatalogue(filtered);
    }
}

function addToCart(id) {
    const match = products.find(p => p.id === id);
    const exist = activeCart.find(item => item.id === id);

    if (exist) {
        exist.quantity += 1;
    } else {
        activeCart.push({ ...match, quantity: 1 });
    }
    updateCartUI();

    // Direct opening notification cue
    const drawer = document.getElementById("cart-drawer");
    drawer.classList.remove("translate-x-full");
}

function removeFromCart(id) {
    activeCart = activeCart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const totalCount = activeCart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").innerText = totalCount;

    const totalValue = activeCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById("cart-total").innerText = `UGX ${totalValue.toLocaleString()}`;

    const container = document.getElementById("cart-items");
    if (activeCart.length === 0) {
        container.innerHTML = `<p class="text-slate-400 text-center py-10 text-sm">Your tray looks empty. Click elements below to add stock selections.</p>`;
        return;
    }

    container.innerHTML = activeCart.map(item => `
        <div class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl relative group">
            <img src="${item.img}" class="w-14 h-14 object-cover rounded-lg bg-white">
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-sm text-slate-800 truncate">${item.name}</h4>
                <p class="text-xs text-indigo-600 font-semibold mt-0.5">${item.quantity}x • UGX ${item.price.toLocaleString()}</p>
            </div>
            <button onclick="removeFromCart(${item.id})" class="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 hover:border-red-100 transition shadow-sm cursor-pointer">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>
    `).join('');
    lucide.createIcons();
}

function toggleCart() {
    const drawer = document.getElementById("cart-drawer");
    drawer.classList.toggle("translate-x-full");
}

function checkoutWhatsApp() {
    if(activeCart.length === 0) {
        alert("Your shopping cart tray is empty!");
        return;
    }
    
    let text = "Hello K2 Phone World, I'd like to place an order for the following items:\n\n";
    activeCart.forEach(item => {
        text += `• ${item.name} (${item.tag}) x${item.quantity} - UGX ${(item.price * item.quantity).toLocaleString()}\n`;
    });
    
    const totalValue = activeCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    text += `\n*Total Order Value: UGX ${totalValue.toLocaleString()}*`;
    
    window.open(`https://wa.me{encodeURIComponent(text)}`, '_blank');
}

function handleContactSubmit(e) {
    e.preventDefault();
    alert("Inquiry logged successfully! Our sales team will reach out immediately regarding your phone compatibility request.");
    e.target.reset();
}

window.addEventListener('DOMContentLoaded', initApp);
