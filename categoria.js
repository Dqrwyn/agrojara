// Funcionalidad para las pestañas de información
document.addEventListener('DOMContentLoaded', function() {
    // Sistema de pestañas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y paneles
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Agregar clase active al botón y panel correspondiente
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Vista rápida de productos
    const quickViewButtons = document.querySelectorAll('.quick-view');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.producto-card');
            const productName = productCard.querySelector('h3').textContent;
            
            // Aquí iría la lógica para mostrar un modal con información detallada del producto
            alert(`Vista rápida de ${productName}. Funcionalidad completa en desarrollo.`);
        });
    });

    // Añadir al carrito
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.producto-card');
            const productName = productCard.querySelector('h3').textContent;
            
            // Animación de añadir al carrito
            const originalText = this.textContent;
            this.textContent = 'Añadiendo...';
            this.style.backgroundColor = '#4caf50';
            
            setTimeout(() => {
                this.textContent = 'Añadido ✓';
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '';
                }, 1500);
                
                // Notificación
                showNotification(`"${productName}" añadido al carrito`);
            }, 800);
        });
    });

    // Función para mostrar notificaciones
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Estilo para las notificaciones
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1000;
        }
        .notification.show {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // Filtrado de productos (simulado)
    const filterBtn = document.querySelector('.filter-btn');
    const resetBtn = document.querySelector('.reset-btn');
    
    if (filterBtn && resetBtn) {
        filterBtn.addEventListener('click', function() {
            // Aquí iría la lógica real de filtrado
            showNotification('Filtros aplicados');
        });
        
        resetBtn.addEventListener('click', function() {
            // Aquí iría la lógica para resetear los filtros
            const selects = document.querySelectorAll('.category-filter select');
            selects.forEach(select => {
                select.value = 'todos';
            });
            showNotification('Filtros reiniciados');
        });
    }
});