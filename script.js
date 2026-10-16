
const userName = "user name";

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
