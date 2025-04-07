// Load TensorFlow.js
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-backend-webgl');

// DOM Elements
const faceUpload = document.getElementById('faceUpload');
const clothingUpload = document.getElementById('clothingUpload');
const facePreview = document.getElementById('facePreview');
const clothingPreview = document.getElementById('clothingPreview');
const faceImage = document.getElementById('faceImage');
const clothingImage = document.getElementById('clothingImage');
const generateBtn = document.getElementById('generateBtn');
const faceSelect = document.getElementById('faceSelect');
const dressSelect = document.getElementById('dressSelect');

// Load images from virtual folders
async function loadFolderImages(folderPath) {
    try {
        const response = await fetch(`/api/list-folder?folder=${folderPath}`);
        const { files } = await response.json();
        return files.map(file => `/virtual_folders/${folderPath}/${file}`);
    } catch (error) {
        console.error(`Error loading ${folderPath} images:`, error);
        return [];
    }
}

// Initialize select dropdowns
async function initSelectors() {
    const faces = await loadFolderImages('client_faces');
    const dresses = await loadFolderImages('dress_images');

    faces.forEach(face => {
        const option = document.createElement('option');
        option.value = face;
        option.textContent = face.split('/').pop();
        faceSelect.appendChild(option);
    });

    dresses.forEach(dress => {
        const option = document.createElement('option');
        option.value = dress;
        option.textContent = dress.split('/').pop();
        dressSelect.appendChild(option);
    });
}

// Handle image selection from dropdown
function handleImageSelect(selectElement, previewElement, imageElement) {
    const imageUrl = selectElement.value;
    if (imageUrl) {
        imageElement.src = imageUrl;
        previewElement.classList.remove('hidden');
        checkUploads();
    }
}

// Original upload handler remains as fallback
function handleImageUpload(event, previewElement, imageElement) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageElement.src = e.target.result;
            previewElement.classList.remove('hidden');
            checkUploads();
        }
        reader.readAsDataURL(file);
    }
}

// Check if both images are selected
function checkUploads() {
    if ((faceImage.src || faceSelect.value) && (clothingImage.src || dressSelect.value)) {
        generateBtn.disabled = false;
    } else {
        generateBtn.disabled = true;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initSelectors();
    
    faceSelect.addEventListener('change', () => handleImageSelect(faceSelect, facePreview, faceImage));
    dressSelect.addEventListener('change', () => handleImageSelect(dressSelect, clothingPreview, clothingImage));
    
    faceUpload.addEventListener('change', (e) => handleImageUpload(e, facePreview, faceImage));
    clothingUpload.addEventListener('change', (e) => handleImageUpload(e, clothingPreview, clothingImage));
});

// Generate button click handler (same as before)
generateBtn.addEventListener('click', async () => {
    generateBtn.innerHTML = `<span class="spinner"></span> Processing...`;
    generateBtn.disabled = true;
    
    try {
        const faceSrc = faceSelect.value || faceImage.src;
        const clothingSrc = dressSelect.value || clothingImage.src;
        
        const { generateCombinations } = require('./api');
        const combinations = await generateCombinations(faceSrc, clothingSrc);
        
        localStorage.setItem('outfitCombinations', JSON.stringify(combinations));
        window.location.href = 'results.html';
    } catch (error) {
        console.error('Error generating outfits:', error);
        alert('Error processing images. Please try again.');
    } finally {
        generateBtn.innerHTML = `Generate Outfit Combinations`;
        generateBtn.disabled = false;
    }
});