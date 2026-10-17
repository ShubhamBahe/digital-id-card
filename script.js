
const userName = "Life of Chai";

// Generate initials automatically
const nameParts = userName.trim().split(/\s+/).filter(Boolean);

const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0] || "U").slice(0, 2).toUpperCase();

// Update profile details
document.getElementById("brandInitials").textContent = initials;
document.getElementById("profileInitials").textContent = initials;
document.getElementById("profileName").textContent = userName;


// Generate QR Code
function generateQR() {
    const profileURL = window.location.href;

    const qrImage = document.getElementById("qrImage");
    const qrDisplay = document.getElementById("qrDisplay");

    qrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
        encodeURIComponent(profileURL);

    qrDisplay.hidden = false;
}


// Share Profile
async function shareProfile() {
    const profile = {
        title: "My Digital ID",
        text: "Check out my digital profile!",
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(profile);
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(profile.url);
            alert("Profile link copied!");
        } else {
            window.prompt("Copy your profile link:", profile.url);
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            alert("Unable to share. Please copy your profile link.");
        }
    }
}


function getLocation() {
    const status = document.getElementById("locationStatus");

    if (!navigator.geolocation) {
        status.textContent =
            "Location is not supported by this browser.";
        return;
    }

    status.textContent = "Requesting location permission...";

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const mapURL =
                `https://www.google.com/maps?q=${latitude},${longitude}`;

            const mapLink = document.createElement("a");
            mapLink.href = mapURL;
            mapLink.target = "_blank";
            mapLink.rel = "noopener noreferrer";
            mapLink.textContent = "Open in Google Maps";

            status.replaceChildren(
                document.createTextNode("Location found: "),
                mapLink
            );
        },

        function (error) {
            if (error.code === error.PERMISSION_DENIED) {
                status.textContent =
                    "Location permission denied. Please allow location access.";
            } else if (error.code === error.TIMEOUT) {
                status.textContent =
                    "Location request timed out. Please try again.";
            } else {
                status.textContent =
                    "Unable to get your location. Please try again.";
            }
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// WhatsApp contact details
const whatsappNumber = "919834748891";

const whatsappMessage =
    "Hello sir! I would like to know more about your services.";

// Create WhatsApp link automatically
document.getElementById("whatsappLink").href =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
