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

// Event Listeners
faceUpload.addEventListener('change', (e) => handleImageUpload(e, facePreview, faceImage));
clothingUpload.addEventListener('change', (e) => handleImageUpload(e, clothingPreview, clothingImage));

// Check if both images are uploaded to enable generate button
function checkUploads() {
    if (faceImage.src && clothingImage.src) {
        generateBtn.disabled = false;
    } else {
        generateBtn.disabled = true;
    }
}

// Handle image upload and preview
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

// Generate button click handler
generateBtn.addEventListener('click', async () => {
    generateBtn.innerHTML = `<span class="spinner"></span> Processing...`;
    generateBtn.disabled = true;
    
    try {
        // Load model if not already loaded
        if (!model) {
            model = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/deeplab/pascal/1/default/1');
        }

        // Process images using API
        const { generateCombinations } = require('./api');
        const combinations = await generateCombinations(faceImage.src, clothingImage.src);
        
        // Store results temporarily
        localStorage.setItem('outfitCombinations', JSON.stringify(combinations));
        
        // Redirect to results page
        window.location.href = 'results.html';
    } catch (error) {
        console.error('Error generating outfits:', error);
        alert('Error processing images. Please try again.');
    } finally {
        generateBtn.innerHTML = `Generate Outfit Combinations`;
        generateBtn.disabled = false;
    }
});