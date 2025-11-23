const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080; 
const VALID_STATUSES = ['BELUM_DIKERJAKAN', 'SEDANG_DIKERJAKAN', 'SELESAI'];

app.use(cors()); 
app.use(express.json());

let mataKuliah = [];
let tugas = [];

const augmentTugas = (tugasItem) => {
    const matkul = mataKuliah.find(m => m.id === tugasItem.mataKuliahId);
    return {
        ...tugasItem,
        mataKuliah: matkul ? { id: matkul.id, nama: matkul.nama } : null
    };
};

const validateStatus = (status) => {
    return VALID_STATUSES.includes(status);
};



// POST /api/matkul (Create)
app.post('/api/matkul', (req, res) => {
    const { nama, sks, deskripsi } = req.body;
    if (!nama || !sks) return res.status(400).json({ error: 'Nama dan SKS wajib diisi.' });

    const newId = 'M' + (Math.random().toString(36).substring(2, 9));
    const newMatkul = { id: newId, nama, sks, deskripsi: deskripsi || "" };
    mataKuliah.push(newMatkul);
    res.status(201).json(newMatkul);
});

// GET /api/matkul (Read All)
app.get('/api/matkul', (req, res) => {
    res.status(200).json(mataKuliah);
});

// PUT /api/matkul/:id (Update)
app.put('/api/matkul/:id', (req, res) => {
    const { id } = req.params;
    const { nama, sks, deskripsi } = req.body;
    const index = mataKuliah.findIndex(m => m.id === id);

    if (index === -1) return res.status(404).json({ error: 'Mata Kuliah not found' });
    if (!nama || !sks) return res.status(400).json({ error: 'Nama dan SKS wajib diisi.' });

    mataKuliah[index] = { ...mataKuliah[index], nama, sks, deskripsi: deskripsi || "" };
    res.status(200).json(mataKuliah[index]);
});

// DELETE /api/matkul/:id (Delete)
app.delete('/api/matkul/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = mataKuliah.length;
    mataKuliah = mataKuliah.filter(m => m.id !== id);

    if (mataKuliah.length === initialLength) {
        return res.status(404).json({ error: 'Mata Kuliah not found' });
    }
    res.status(204).send(); 
});



// POST /api/tugas (Create)
app.post('/api/tugas', (req, res) => {
    const { nama, deskripsi, deadline, mataKuliahId } = req.body;
    
    if (!nama || !deadline || !mataKuliahId) {
         return res.status(400).json({ error: 'Nama, deadline, dan mata kuliah wajib diisi.' });
    }

    const newId = 'T' + (Math.random().toString(36).substring(2, 9));
    const newTugas = { id: newId, nama, deskripsi: deskripsi || "", deadline, mataKuliahId, status: 'BELUM_DIKERJAKAN' };
    tugas.push(newTugas);
    
    res.status(201).json(augmentTugas(newTugas));
});

// GET /api/tugas (Read All)
app.get('/api/tugas', (req, res) => {
    const augmentedList = tugas.map(augmentTugas);
    res.status(200).json(augmentedList);
});

// PUT /api/tugas/:id (Update & Tracker Status)
app.put('/api/tugas/:id', (req, res) => {
    const { id } = req.params;
    const { nama, deskripsi, deadline, mataKuliahId, status } = req.body;
    const index = tugas.findIndex(t => t.id === id);

    if (index === -1) return res.status(404).json({ error: 'Tugas not found' });

    // PENTING: Validasi Status 3-Pilihan
    if (!validateStatus(status)) {
        // Ini akan muncul jika front-end mengirim status yang tidak ada di VALID_STATUSES
        return res.status(400).json({ error: 'Invalid status' });
    }
    if (!nama || !deadline || !mataKuliahId) {
         return res.status(400).json({ error: 'Nama, deadline, dan mata kuliah wajib diisi.' });
    }

    // Update data Tugas
    tugas[index] = { ...tugas[index], nama, deskripsi: deskripsi || "", deadline, mataKuliahId, status };
    res.status(200).json(augmentTugas(tugas[index]));
});

// DELETE /api/tugas/:id (Delete)
app.delete('/api/tugas/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = tugas.length;
    tugas = tugas.filter(t => t.id !== id);

    if (tugas.length === initialLength) {
        return res.status(404).json({ error: 'Tugas not found' });
    }
    res.status(204).send();
});


// GET /api/health (Health Check)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'API is running successfully!' });
});

// GET /api (Root API)
app.get('/api', (req, res) => {
    res.status(200).json({ 
        message: 'Welcome to Tugas Tracker API!',
        routes: ['/api/matkul', '/api/tugas', '/api/health'] 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
});