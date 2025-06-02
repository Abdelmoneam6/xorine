// Main JavaScript file for the Hotel Booking Website

document.addEventListener('DOMContentLoaded', function() {
    // --- Navigation Highlighting ---
    // Determines the current page and adds the 'active' class to the corresponding nav link.
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Ensure other links are not active
        }
    });

    // --- Booking Page Specific JavaScript ---
    if (document.getElementById('bookingForm')) {
        handleBookingPage();
    }

    // --- Contact Page Specific JavaScript ---
    if (document.getElementById('contactForm')) {
        handleContactPage();
    }

    // --- General Utility Functions (can be expanded) ---
    // Example: Smooth scroll for anchor links (if any are added later)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            try {
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            } catch (error) {
                console.warn('Smooth scroll target not found:', this.getAttribute('href'));
            }
        });
    });

});


// --- HANDLERS FOR SPECIFIC PAGES ---

function handleBookingPage() {
    const bookingForm = document.getElementById('bookingForm');
    const roomTypeSelect = document.getElementById('roomType');
    const checkInInput = document.getElementById('checkInDate');
    const checkOutInput = document.getElementById('checkOutDate');
    const numAdultsInput = document.getElementById('numAdults');
    const numChildrenInput = document.getElementById('numChildren');

    // Summary elements
    const summaryCheckIn = document.getElementById('summaryCheckIn');
    const summaryCheckOut = document.getElementById('summaryCheckOut');
    const summaryRoomType = document.getElementById('summaryRoomType');
    const summaryGuests = document.getElementById('summaryGuests');
    const summaryEstimatedCost = document.getElementById('summaryEstimatedCost');

    // Pre-fill room type from URL parameter & initialize summary
    const params = new URLSearchParams(window.location.search);
    const roomTypeFromURL = params.get('room');
    if (roomTypeFromURL && roomTypeSelect) {
        roomTypeSelect.value = roomTypeFromURL;
    }
    updateBookingSummary(); // Initial call to populate summary

    // Event listeners for form inputs to update summary dynamically
    if (checkInInput) checkInInput.addEventListener('change', updateBookingSummary);
    if (checkOutInput) checkOutInput.addEventListener('change', updateBookingSummary);
    if (roomTypeSelect) roomTypeSelect.addEventListener('change', updateBookingSummary);
    if (numAdultsInput) numAdultsInput.addEventListener('change', updateBookingSummary);
    if (numChildrenInput) numChildrenInput.addEventListener('change', updateBookingSummary);
    
    bookingForm.addEventListener('submit', function(event) {
        if (!validateBookingForm()) {
            event.preventDefault(); // Prevent submission if validation fails
            // Consider showing a general error message or focusing the first invalid field
        } else {
            // On successful validation (for now, just an alert)
            event.preventDefault(); // Keep this to prevent actual submission for now
            alert('Booking form submitted (placeholder). Payment gateway integration needed.');
            // bookingForm.reset(); // Optionally reset form
            // updateBookingSummary(); // Update summary after reset
        }
    });

    function validateBookingForm() {
        let isValid = true;
        clearAllErrorMessages(bookingForm);

        // Guest Name
        const guestName = document.getElementById('guestName');
        if (!guestName.value.trim()) {
            showError(guestName, 'Guest name is required.');
            isValid = false;
        }

        // Email
        const email = document.getElementById('email');
        if (!email.value.trim()) {
            showError(email, 'Email address is required.');
            isValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            showError(email, 'Please enter a valid email address.');
            isValid = false;
        }

        // Phone
        const phone = document.getElementById('phone');
        if (!phone.value.trim()) {
            showError(phone, 'Phone number is required.');
            isValid = false;
        }
        // Basic phone validation (e.g. at least 7 digits) - can be improved
        else if (phone.value.trim().length < 7 || !/^[0-9\s+()-]*$/.test(phone.value.trim())) {
             showError(phone, 'Please enter a valid phone number.');
             isValid = false;
        }


        // Check-in Date
        if (!checkInInput.value) {
            showError(checkInInput, 'Check-in date is required.');
            isValid = false;
        }

        // Check-out Date
        if (!checkOutInput.value) {
            showError(checkOutInput, 'Check-out date is required.');
            isValid = false;
        }

        // Date comparison
        if (checkInInput.value && checkOutInput.value) {
            const checkInDate = new Date(checkInInput.value);
            const checkOutDate = new Date(checkOutInput.value);
            const today = new Date();
            today.setHours(0,0,0,0); // Compare dates only

            if (checkInDate < today) {
                showError(checkInInput, 'Check-in date cannot be in the past.');
                isValid = false;
            }
            if (checkOutDate <= checkInDate) {
                showError(checkOutInput, 'Check-out date must be after check-in date.');
                isValid = false;
            }
        }

        // Number of Adults
        if (parseInt(numAdultsInput.value) < 1) {
            showError(numAdultsInput, 'At least one adult is required.');
            isValid = false;
        }
        
        // Room Type (optional, but if you want to make it required)
        // if (roomTypeSelect && !roomTypeSelect.value) {
        //     showError(roomTypeSelect, 'Please select a room type.');
        //     isValid = false;
        // }

        return isValid;
    }

    function updateBookingSummary() {
        // Dates
        if (summaryCheckIn) summaryCheckIn.innerHTML = 'Check-in: <span>' + (checkInInput.value || 'N/A') + '</span>';
        if (summaryCheckOut) summaryCheckOut.innerHTML = 'Check-out: <span>' + (checkOutInput.value || 'N/A') + '</span>';

        // Room Type
        if (summaryRoomType && roomTypeSelect) {
            const selectedOption = roomTypeSelect.options[roomTypeSelect.selectedIndex];
            summaryRoomType.innerHTML = 'Room Type: <span>' + (selectedOption && selectedOption.value ? selectedOption.text : 'N/A') + '</span>';
        }

        // Guests
        if (summaryGuests && numAdultsInput && numChildrenInput) {
            const adults = parseInt(numAdultsInput.value) || 0;
            const children = parseInt(numChildrenInput.value) || 0;
            summaryGuests.innerHTML = 'Guests: <span>' + adults + ' Adult(s), ' + children + ' Child(ren)</span>';
        }
        
        // Estimated Cost Calculation
        if (summaryEstimatedCost && checkInInput.value && checkOutInput.value && roomTypeSelect.value) {
            const checkInDate = new Date(checkInInput.value);
            const checkOutDate = new Date(checkOutInput.value);
            const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

            let pricePerNight = 0;
            // Dummy prices - these could come from data attributes on the options or an object
            const roomPrices = {
                'standard-queen': 120,
                'deluxe-king': 250,
                'family-room': 180,
                'single-room': 90
            };
            pricePerNight = roomPrices[roomTypeSelect.value] || 0;

            if (nights > 0 && pricePerNight > 0) {
                const totalCost = nights * pricePerNight;
                summaryEstimatedCost.innerHTML = 'Estimated Cost: <span>$' + totalCost.toFixed(2) + '</span>';
            } else if (nights <= 0 && pricePerNight > 0) {
                 summaryEstimatedCost.innerHTML = 'Estimated Cost: <span>Invalid Dates</span>';
            } 
            else {
                summaryEstimatedCost.innerHTML = 'Estimated Cost: <span>N/A</span>';
            }
        } else if (summaryEstimatedCost) {
             summaryEstimatedCost.innerHTML = 'Estimated Cost: <span>N/A</span>';
        }
    }
}


function handleContactPage() {
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(event) {
        if (!validateContactForm()) {
            event.preventDefault(); // Prevent submission if validation fails
        } else {
            // On successful validation (for now, just an alert)
            event.preventDefault(); // Keep this to prevent actual submission for now
            alert('Contact form submitted (placeholder). Backend integration needed.');
            // contactForm.reset(); // Optionally reset form
        }
    });

    function validateContactForm() {
        let isValid = true;
        clearAllErrorMessages(contactForm);

        // Full Name
        const fullName = document.getElementById('fullName');
        if (!fullName.value.trim()) {
            showError(fullName, 'Full name is required.');
            isValid = false;
        }

        // Email
        const email = document.getElementById('email');
        if (!email.value.trim()) {
            showError(email, 'Email address is required.');
            isValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            showError(email, 'Please enter a valid email address.');
            isValid = false;
        }

        // Subject
        const subject = document.getElementById('subject');
        if (!subject.value.trim()) {
            showError(subject, 'Subject is required.');
            isValid = false;
        }

        // Message
        const message = document.getElementById('message');
        if (!message.value.trim()) {
            showError(message, 'Message is required.');
            isValid = false;
        }
        return isValid;
    }
}


// --- FORM VALIDATION HELPER FUNCTIONS ---
function isValidEmail(email) {
    // Basic email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(inputElement, message) {
    // Remove existing error message for this field first
    clearErrorMessage(inputElement);

    inputElement.classList.add('is-invalid'); // Add class for styling invalid field
    const error = document.createElement('div');
    error.className = 'error-message'; // For styling error messages
    // error.style.color = 'red'; // Style will be handled by CSS
    error.style.fontSize = '0.9em'; // Keeping this, can be moved to CSS if preferred
    error.style.marginTop = '4px'; // Keeping this, can be moved to CSS if preferred
    error.textContent = message;
    
    // Insert error message after the input element or its parent if it's part of a more complex group
    if (inputElement.parentNode.classList.contains('form-group') || inputElement.parentNode.classList.contains('filter-group')) {
        inputElement.parentNode.appendChild(error);
    } else {
        inputElement.insertAdjacentElement('afterend', error);
    }
}

function clearErrorMessage(inputElement) {
    inputElement.classList.remove('is-invalid');
    let parent = inputElement.parentNode;
    if (parent.classList.contains('form-group') || parent.classList.contains('filter-group')) {
        const existingError = parent.querySelector('.error-message');
        if (existingError) {
            parent.removeChild(existingError);
        }
    } else {
         const existingError = inputElement.nextElementSibling;
         if (existingError && existingError.classList.contains('error-message')) {
            existingError.remove();
        }
    }
}

function clearAllErrorMessages(form) {
    const invalidFields = form.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => field.classList.remove('is-invalid'));

    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
}
