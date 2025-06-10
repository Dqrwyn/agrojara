// Importaciones de Firebase
import { auth } from '../js/firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { 
  getFirestore, collection, doc, 
  addDoc, updateDoc, deleteDoc,
  getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Inicializar Firestore
const db = getFirestore();

document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentEditingId = null;
    
    // Elementos del DOM
    const sidebar = document.querySelector('.admin-sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.admin-section');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Funciones de navegación
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
                document.getElementById('pageTitle').textContent = 
                    section.querySelector('h2').textContent;
                
                // Cargar datos cuando se muestra la sección correspondiente
                if (sectionId === 'products') {
                    loadProducts();
                } else if (sectionId === 'categories') {
                    loadCategories();
                }
            }
        });
        
        navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.parentElement.classList.add('active');
            }
        });
    }
    
    // Event listeners para navegación
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
    
    // Toggle sidebar en móviles
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Cerrar sesión
    logoutBtn.addEventListener('click', function() {
        signOut(auth).then(() => {
            window.location.href = '../login.html';
        }).catch(error => {
            console.error('Error al cerrar sesión:', error);
        });
    });
    
    // Mostrar dashboard por defecto
    showSection('dashboard');
    
    // Inicializar gráfico
    const ctx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Ventas mensuales (Bs)',
                data: [12000, 19000, 15000, 18000, 21000, 24580, 22000, 25000, 23000, 28000, 26000, 30000],
                backgroundColor: 'rgba(46, 125, 50, 0.2)',
                borderColor: 'rgba(46, 125, 50, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Gestión de productos
    const addProductBtn = document.getElementById('addProductBtn');
    const productModal = document.getElementById('productModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Cargar productos desde Firestore
    async function loadProducts() {
        try {
            const querySnapshot = await getDocs(collection(db, "products"));
            const productsTable = document.getElementById('productsTable').getElementsByTagName('tbody')[0];
            productsTable.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const product = doc.data();
                const row = `
                    <tr>
                        <td>${doc.id}</td>
                        <td><img src="${product.imageUrl || 'placeholder.jpg'}" width="50"></td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>Bs ${product.price}</td>
                        <td>${product.stock}</td>
                        <td><span class="badge ${product.featured ? 'featured' : ''}">${product.featured ? 'Sí' : 'No'}</span></td>
                        <td>
                            <button class="btn-edit" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" data-id="${doc.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                productsTable.innerHTML += row;
            });
            
            // Agregar eventos a los botones de editar y eliminar
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const productId = this.dataset.id;
                    const productDoc = await getDoc(doc(db, "products", productId));
                    
                    if (productDoc.exists()) {
                        const product = productDoc.data();
                        document.getElementById('modalProductTitle').textContent = 'Editar Producto';
                        document.getElementById('productName').value = product.name;
                        document.getElementById('productCategory').value = product.category;
                        document.getElementById('productPrice').value = product.price;
                        document.getElementById('productStock').value = product.stock;
                        document.getElementById('productFeatured').value = product.featured ? '1' : '0';
                        document.getElementById('productDescription').value = product.description || '';
                        
                        if (product.imageUrl) {
                            document.getElementById('imagePreview').innerHTML = `<img src="${product.imageUrl}" alt="Preview">`;
                        } else {
                            document.getElementById('imagePreview').innerHTML = '';
                        }
                        
                        currentEditingId = productId;
                        productModal.style.display = 'block';
                    }
                });
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const productId = this.dataset.id;
                    if (confirm('¿Estás seguro de eliminar este producto?')) {
                        try {
                            await deleteDoc(doc(db, "products", productId));
                            loadProducts();
                            alert('Producto eliminado correctamente');
                        } catch (error) {
                            console.error("Error al eliminar producto:", error);
                            alert('Error al eliminar producto');
                        }
                    }
                });
            });
            
        } catch (error) {
            console.error("Error al cargar productos:", error);
            alert('Error al cargar productos');
        }
    }
    
    addProductBtn.addEventListener('click', function() {
        document.getElementById('modalProductTitle').textContent = 'Agregar Nuevo Producto';
        document.getElementById('productForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        currentEditingId = null;
        productModal.style.display = 'block';
    });
    
    // Gestión de categorías
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const categoryModal = document.getElementById('categoryModal');
    
    // Cargar categorías desde Firestore
    async function loadCategories() {
        try {
            const querySnapshot = await getDocs(collection(db, "categories"));
            const categoriesTable = document.getElementById('categoriesTable').getElementsByTagName('tbody')[0];
            categoriesTable.innerHTML = '';
            
            querySnapshot.forEach((doc) => {
                const category = doc.data();
                const row = `
                    <tr>
                        <td>${doc.id}</td>
                        <td>${category.name}</td>
                        <td>${category.description || ''}</td>
                        <td>
                            <button class="btn-edit" data-id="${doc.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" data-id="${doc.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                categoriesTable.innerHTML += row;
            });
            
            // Agregar eventos a los botones de editar y eliminar
            document.querySelectorAll('#categoriesTable .btn-edit').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const categoryId = this.dataset.id;
                    const categoryDoc = await getDoc(doc(db, "categories", categoryId));
                    
                    if (categoryDoc.exists()) {
                        const category = categoryDoc.data();
                        document.getElementById('modalCategoryTitle').textContent = 'Editar Categoría';
                        document.getElementById('categoryName').value = category.name;
                        document.getElementById('categoryDescription').value = category.description || '';
                        
                        if (category.imageUrl) {
                            document.getElementById('categoryImagePreview').innerHTML = `<img src="${category.imageUrl}" alt="Preview">`;
                        } else {
                            document.getElementById('categoryImagePreview').innerHTML = '';
                        }
                        
                        currentEditingId = categoryId;
                        categoryModal.style.display = 'block';
                    }
                });
            });
            
            document.querySelectorAll('#categoriesTable .btn-delete').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const categoryId = this.dataset.id;
                    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
                        try {
                            await deleteDoc(doc(db, "categories", categoryId));
                            loadCategories();
                            alert('Categoría eliminada correctamente');
                        } catch (error) {
                            console.error("Error al eliminar categoría:", error);
                            alert('Error al eliminar categoría');
                        }
                    }
                });
            });
            
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            alert('Error al cargar categorías');
        }
    }
    
    addCategoryBtn.addEventListener('click', function() {
        document.getElementById('modalCategoryTitle').textContent = 'Agregar Nueva Categoría';
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryImagePreview').innerHTML = '';
        currentEditingId = null;
        categoryModal.style.display = 'block';
    });
    
    // Productos destacados
    const addFeaturedBtn = document.getElementById('addFeaturedBtn');
    const featuredModal = document.getElementById('featuredModal');
    const emptyFeaturedCards = document.querySelectorAll('.featured-card.empty');
    
    addFeaturedBtn.addEventListener('click', function() {
        featuredModal.style.display = 'block';
    });
    
    emptyFeaturedCards.forEach(card => {
        card.addEventListener('click', function() {
            featuredModal.style.display = 'block';
        });
    });
    
    // Agregar a destacados (ejemplo)
    document.querySelectorAll('.btn-add-to-featured').forEach(btn => {
        btn.addEventListener('click', function() {
            const productItem = this.closest('.product-item');
            const productName = productItem.querySelector('h4').textContent;
            const productPrice = productItem.querySelector('p').textContent;
            const imgSrc = productItem.querySelector('img').src;
            
            // Encontrar el primer card vacío
            const emptyCard = document.querySelector('.featured-card.empty');
            if (emptyCard) {
                emptyCard.classList.remove('empty');
                emptyCard.innerHTML = `
                    <img src="${imgSrc}" alt="${productName}">
                    <h4>${productName}</h4>
                    <p>${productPrice}</p>
                    <button class="btn-remove-featured"><i class="fas fa-times"></i> Quitar</button>
                `;
                
                // Agregar evento para quitar de destacados
                emptyCard.querySelector('.btn-remove-featured').addEventListener('click', function(e) {
                    e.stopPropagation();
                    const card = this.closest('.featured-card');
                    card.classList.add('empty');
                    card.innerHTML = `
                        <i class="fas fa-plus"></i>
                        <p>Agregar producto</p>
                    `;
                    // Volver a agregar el evento click
                    card.addEventListener('click', function() {
                        featuredModal.style.display = 'block';
                    });
                });
                
                featuredModal.style.display = 'none';
                alert('Producto agregado a destacados');
            } else {
                alert('Ya has alcanzado el límite de productos destacados (6)');
            }
        });
    });
    
    // Cerrar modales
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Previsualización de imágenes
    document.getElementById('productImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('imagePreview').innerHTML = 
                    `<img src="${event.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('categoryImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('categoryImagePreview').innerHTML = 
                    `<img src="${event.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Envío de formulario de productos
    document.getElementById('productForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            featured: document.getElementById('productFeatured').value === '1',
            description: document.getElementById('productDescription').value,
            imageUrl: document.getElementById('imagePreview').querySelector('img')?.src || ''
        };
        
        try {
            if (currentEditingId) {
                await updateDoc(doc(db, "products", currentEditingId), productData);
                alert('Producto actualizado correctamente');
            } else {
                await addDoc(collection(db, "products"), productData);
                alert('Producto agregado correctamente');
            }
            
            loadProducts();
            productModal.style.display = 'none';
        } catch (error) {
            console.error("Error al guardar producto:", error);
            alert('Error al guardar producto');
        }
    });
    
    // Envío de formulario de categorías
    document.getElementById('categoryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const categoryData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value,
            imageUrl: document.getElementById('categoryImagePreview').querySelector('img')?.src || ''
        };
        
        try {
            if (currentEditingId) {
                await updateDoc(doc(db, "categories", currentEditingId), categoryData);
                alert('Categoría actualizada correctamente');
            } else {
                await addDoc(collection(db, "categories"), categoryData);
                alert('Categoría agregada correctamente');
            }
            
            loadCategories();
            categoryModal.style.display = 'none';
        } catch (error) {
            console.error("Error al guardar categoría:", error);
            alert('Error al guardar categoría');
        }
    });
    
    // Filtrar productos
    document.getElementById('filterProductsBtn').addEventListener('click', function() {
        const categoryFilter = document.getElementById('productCategoryFilter').value.toLowerCase();
        const searchTerm = document.getElementById('productSearch').value.toLowerCase();
        
        document.querySelectorAll('#productsTable tbody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            const productCategory = cells[3].textContent.toLowerCase();
            const productName = cells[2].textContent.toLowerCase();
            
            const categoryMatch = !categoryFilter || productCategory.includes(categoryFilter);
            const searchMatch = !searchTerm || productName.includes(searchTerm);
            
            if (categoryMatch && searchMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
    
    // Restablecer filtros
    document.getElementById('resetFiltersBtn').addEventListener('click', function() {
        document.getElementById('productCategoryFilter').value = '';
        document.getElementById('productSearch').value = '';
        document.querySelectorAll('#productsTable tbody tr').forEach(row => {
            row.style.display = '';
        });
    });
});