const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares estándar
app.use(cors()); 
app.use(express.json()); 

// Base de datos simulada en memoria
let ciudadesFavoritas = [
    { id: 1, nombre: "Madrid", pais: "ES" },
    { id: 2, nombre: "Bogota", pais: "CO" }
];

// Endpoint GET: Obtener favoritos
app.get('/api/favoritos', (req, res) => {
    res.status(200).json(ciudadesFavoritas);
});

// Endpoint POST: Guardar favorito
app.post('/api/favoritos', (req, res) => {
    const { nombre, pais } = req.body;
    if (!nombre || !pais) {
        return res.status(400).json({ error: "El nombre y el país son requeridos." });
    }
    const nuevaCiudad = {
        id: ciudadesFavoritas.length > 0 ? ciudadesFavoritas[ciudadesFavoritas.length - 1].id + 1 : 1,
        nombre: nombre,
        pais: pais
    };
    ciudadesFavoritas.push(nuevaCiudad);
    res.status(201).json(nuevaCiudad);
});

// Endpoint DELETE: Eliminar favorito
app.delete('/api/favoritos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = ciudadesFavoritas.findIndex(c => c.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "La ciudad no existe." });
    }
    const eliminada = ciudadesFavoritas.splice(index, 1);
    res.status(200).json({ mensaje: "Eliminada con éxito", ciudad: eliminada[0] });
});

// Encender servidor
app.listen(PORT, () => {
    console.log(`🚀 Tu API propia está corriendo en http://localhost:${PORT}`);
});