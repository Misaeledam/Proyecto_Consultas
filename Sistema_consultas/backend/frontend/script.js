async function searchProduct() {
    const query = document.getElementById('search').value;
    if (!query) {
        alert('Ingrese lo que quiere buscar');
        return;
    }

    const response = await fetch(`https://192.168.100.18:1433/api/productos?query=${encodeURIComponent(query)}`); //linea a modificar segun ip

    const products = await response.json();

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (products.length === 0) {
        resultsDiv.innerHTML = '<p>No se encontraron productos</p>';
        return;
    }

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Código</th>
        <th>Nombre</th>
        <th>Precio</th>
    `;
    table.appendChild(headerRow);

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.codigo}</td>
            <td>${product.nombreProducto}</td>
            <td>${new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(product.precio)}</td>
        `;
        table.appendChild(row);
    });
    

    resultsDiv.appendChild(table);
}
