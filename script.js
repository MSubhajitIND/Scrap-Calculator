document.addEventListener('DOMContentLoaded', function () {
    const workpieceContainer = document.getElementById('workpieceContainer');
    const addWorkpieceButton = document.getElementById('addWorkpiece');
    const calculateButton = document.getElementById('calculate');
    const resultSection = document.getElementById('resultSection');
    const scrapResult = document.getElementById('scrapResult');

    let workpieceCount = 0;

    // Add Workpiece Form
    addWorkpieceButton.addEventListener('click', function () {
        addWorkpiece();
    });

    // Function to add a new workpiece
    function addWorkpiece() {
        workpieceCount++;

        const workpieceForm = document.createElement('div');
        workpieceForm.classList.add('bg-white', 'shadow-md', 'rounded-lg', 'p-4', 'relative', 'transition', 'space-y-4');
        workpieceForm.dataset.index = workpieceCount;

        workpieceForm.innerHTML = `
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold">Workpiece ${workpieceCount}</h2>
                <div class="space-x-2 flex items-center">
                    <!-- Collapse/Expand Arrow -->
                    <button class="collapse-toggle" aria-label="Expand/Collapse">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>

                    <!-- Delete Workpiece Button -->
                    <button class="bg-red-500 text-white py-1 px-2 rounded-lg removeWorkpiece">Delete</button>
                </div>
            </div>

            <!-- Color Picker -->
            <div class="mb-4">
                <label for="color-${workpieceCount}" class="block text-gray-700">Workpiece Color</label>
                <input type="color" id="color-${workpieceCount}" class="w-full h-10 rounded-lg border p-2">
            </div>

            <div class="collapsible-content">
                <!-- Initial Workpiece Dimensions -->
                <h3 class="text-lg font-semibold mb-2">Initial Workpiece (Cylindrical)</h3>
                <div class="mb-4">
                    <label for="initialRadius-${workpieceCount}" class="block text-gray-700">Initial Radius (mm)</label>
                    <input type="number" id="initialRadius-${workpieceCount}" placeholder="Enter initial radius in mm" class="w-full p-2 border rounded" required>
                </div>
                <div class="mb-4">
                    <label for="initialHeight-${workpieceCount}" class="block text-gray-700">Initial Height (mm)</label>
                    <input type="number" id="initialHeight-${workpieceCount}" placeholder="Enter initial height in mm" class="w-full p-2 border rounded" required>
                </div>

                <!-- Final Workpiece Dimensions -->
                <h3 class="text-lg font-semibold mb-2">Final Workpiece</h3>
                <div class="mb-4">
                    <label for="shapeSelect-${workpieceCount}" class="block text-gray-700">Select Final Shape</label>
                    <select id="shapeSelect-${workpieceCount}" class="w-full p-2 border rounded">
                        <option value="cylinder">Cylinder</option>
                        <option value="cone">Cone</option>
                        <option value="frustum">Frustum</option>
                        <option value="spherical-cap">Spherical Cap</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label for="finalRadius-${workpieceCount}" class="block text-gray-700">Final Radius (mm)</label>
                    <input type="number" id="finalRadius-${workpieceCount}" placeholder="Enter final radius in mm" class="w-full p-2 border rounded">
                </div>
                <div class="mb-4" id="bottomRadiusContainer-${workpieceCount}" style="display: none;">
                    <label for="bottomRadius-${workpieceCount}" class="block text-gray-700">Bottom Radius (mm) - For Frustum</label>
                    <input type="number" id="bottomRadius-${workpieceCount}" placeholder="Enter bottom radius in mm" class="w-full p-2 border rounded">
                </div>
                <div class="mb-4">
                    <label for="finalHeight-${workpieceCount}" class="block text-gray-700">Final Height (mm)</label>
                    <input type="number" id="finalHeight-${workpieceCount}" placeholder="Enter final height in mm" class="w-full p-2 border rounded">
                </div>
            </div>
        `;

        workpieceContainer.appendChild(workpieceForm);

        // Add event listener for collapse/expand toggle
        workpieceForm.querySelector('.collapse-toggle').addEventListener('click', function () {
            const content = workpieceForm.querySelector('.collapsible-content');
            content.classList.toggle('hidden');
            const arrow = this.querySelector('svg path');
            arrow.setAttribute('d', content.classList.contains('hidden') ? 'M19 15l-7-7-7 7' : 'M19 9l-7 7-7-7');
        });

        // Add event listener to shape select for showing/hiding bottom radius field
        const shapeSelect = document.getElementById(`shapeSelect-${workpieceCount}`);
        const bottomRadiusContainer = document.getElementById(`bottomRadiusContainer-${workpieceCount}`);

        shapeSelect.addEventListener('change', function () {
            if (this.value === 'frustum') {
                bottomRadiusContainer.style.display = 'block';
            } else {
                bottomRadiusContainer.style.display = 'none';
            }
        });

        // Add event listener for removing a workpiece
        workpieceForm.querySelector('.removeWorkpiece').addEventListener('click', function () {
            workpieceForm.remove();
            workpieceCount--;
            updateWorkpieceNumbers();  // Call function to update the workpiece numbers
        });
    }

    // Function to update the workpiece numbers after deletion
    function updateWorkpieceNumbers() {
        const allWorkpieces = document.querySelectorAll('[data-index]');
        let newCount = 0;
        allWorkpieces.forEach(workpiece => {
            newCount++;
            workpiece.dataset.index = newCount;
            const h2 = workpiece.querySelector('h2');
            h2.textContent = `Workpiece ${newCount}`;
            const inputs = workpiece.querySelectorAll('input, select');
            inputs.forEach(input => {
                const newId = input.id.replace(/\d+$/, newCount);  // Update the ID for each input
                input.id = newId;
                const label = workpiece.querySelector(`label[for="${input.id}"]`);
                if (label) label.setAttribute('for', newId);
            });
        });
        workpieceCount = newCount;  // Update workpieceCount to the new total count
    }

    // Function to calculate scrap material
    calculateButton.addEventListener('click', function () {
        const workpieces = document.querySelectorAll('[data-index]');
        let totalScrapVolume = 0;

        workpieces.forEach(workpiece => {
            const index = workpiece.dataset.index;
            const initialRadius = parseFloat(document.getElementById(`initialRadius-${index}`).value);
            const initialHeight = parseFloat(document.getElementById(`initialHeight-${index}`).value);
            const finalRadius = parseFloat(document.getElementById(`finalRadius-${index}`).value);
            const finalHeight = parseFloat(document.getElementById(`finalHeight-${index}`).value);
            const shape = document.getElementById(`shapeSelect-${index}`).value;

            if (isNaN(initialRadius) || isNaN(initialHeight) || isNaN(finalRadius) || isNaN(finalHeight)) {
                alert('Please fill in all the required fields.');
                return;
            }

            // Volume of initial cylinder
            const initialVolume = Math.PI * Math.pow(initialRadius, 2) * initialHeight;

            // Volume of final workpiece based on shape
            let finalVolume = 0;
            if (shape === 'cylinder') {
                finalVolume = Math.PI * Math.pow(finalRadius, 2) * finalHeight;
            } else if (shape === 'cone') {
                finalVolume = (1 / 3) * Math.PI * Math.pow(finalRadius, 2) * finalHeight;
            } else if (shape === 'frustum') {
                const bottomRadius = parseFloat(document.getElementById(`bottomRadius-${index}`).value);
                if (isNaN(bottomRadius)) {
                    alert('Please enter the bottom radius for frustum.');
                    return;
                }
                finalVolume = (1 / 3) * Math.PI * finalHeight * (Math.pow(finalRadius, 2) + Math.pow(bottomRadius, 2) + finalRadius * bottomRadius);
            } else if (shape === 'spherical-cap') {
                finalVolume = (1 / 6) * Math.PI * Math.pow(finalRadius, 2) * (3 * finalHeight - Math.pow(finalHeight, 2));
            }

            // Scrap volume
            const scrapVolume = initialVolume - finalVolume;
            totalScrapVolume += scrapVolume;
        });

        // Display the scrap volume result
        resultSection.classList.remove('hidden');
        scrapResult.innerHTML = `
            <strong>Total Scrap Material:</strong> ${totalScrapVolume.toFixed(2)} mm³
        `;
    });
});
