console.log("Uravi Holidays script loaded");

// ================= PROFILE DETAILS =================
const userName = "Uravi Holidays";

const nameParts = userName.trim().split(/\s+/).filter(Boolean);

const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0] || "U").slice(0, 2).toUpperCase();

const profileName = document.getElementById("profileName");

if (profileName) {
    profileName.textContent = userName;
}


// ================= GOOGLE MAPS LOCATION =================
const MAP_URL = "https://maps.app.goo.gl/xikMJF9QvYEE35hi8";
const CALL_NUMBER = "+918766043591";

function getLocation() {
    window.open(MAP_URL, "_blank", "noopener,noreferrer");
}


// ================= WHATSAPP CONTACT =================
const whatsappNumber = "98329056457";

const whatsappMessage =
    "Hello! 👋 I'm interested in your travel packages. Please share the available holiday packages and pricing. ✈️🌍";

const whatsappLink = document.getElementById("whatsappLink");

if (whatsappLink) {
    whatsappLink.href =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
}


// ================= FEEDBACK SYSTEM =================
(() => {
    const form = document.getElementById("feedbackForm");

    if (!form) {
        console.error("Feedback form not found.");
        return;
    }

    const stars = [...form.querySelectorAll(".star")];
    const ratingHint = document.getElementById("ratingHint");
    const reviewText = document.getElementById("reviewText");
    const reviewerName = document.getElementById("reviewerName");
    const status = document.getElementById("feedbackStatus");
    const reviewList = document.getElementById("reviewList");

    const storageKey = "uraviHolidaysReviews";

    // Replace with the official Google review destination if needed.
    const googleReviewURL =
        "https://maps.app.goo.gl/rsNz66sUUWWkuaWY8";

    let selectedRating = 0;
    let reviewWasEdited = false;

    const ratingWords = {
        1: "poor",
        2: "fair",
        3: "good",
        4: "very good",
        5: "excellent"
    };


    // ---------- STATUS MESSAGE ----------
    function showStatus(message, color = "#b45309") {
        if (status) {
            status.textContent = message;
            status.style.color = color;
        }
    }


    // ---------- STAR RATING ----------
    function updateStars(rating) {
        selectedRating = rating;

        stars.forEach((star) => {
            const starRating = Number(star.dataset.rating);
            const active = starRating <= rating;

            star.classList.toggle("active", active);
            star.setAttribute(
                "aria-pressed",
                String(starRating === rating)
            );
        });

        if (ratingHint) {
            ratingHint.textContent = rating
                ? `${rating} out of 5 stars — ${ratingWords[rating]}`
                : "Tap a star to rate us";
        }

        generateSentence();
    }


    // ---------- SELECTED SUGGESTIONS ----------
    function selectedValues(name) {
        return [
            ...form.querySelectorAll(
                `input[name="${name}"]:checked`
            )
        ].map((input) => input.value);
    }


    // ---------- GENERATE REVIEW TEXT ----------
    function generateSentence() {
        if (!reviewText || reviewWasEdited) return;

        const positives = selectedValues("positive");
        const improvements = selectedValues("improvement");
        const parts = [];

        if (selectedRating) {
            parts.push(
                `My experience with Uravi Holidays was ${ratingWords[selectedRating]}`
            );
        } else if (positives.length) {
            parts.push(
                "My experience with Uravi Holidays was enjoyable"
            );
        }

        if (positives.length) {
            const list = positives.length === 1
                ? positives[0]
                : positives.slice(0, -1).join(", ") +
                  " and " +
                  positives[positives.length - 1];

            parts.push(`I especially appreciated the ${list}`);
        }

        let sentence = parts.length
            ? parts.join(". ") + "."
            : "";

        if (improvements.length) {
            sentence += (sentence ? " " : "") +
                `I would appreciate ${improvements.join(" and ")} in the future.`;
        }

        reviewText.value = sentence;
    }


    // ---------- STAR CLICK EVENTS ----------
    stars.forEach((star) => {
        star.addEventListener("click", () => {
            const rating = Number(star.dataset.rating);

            if (rating < 1 || rating > 5) return;

            reviewWasEdited = false;
            updateStars(rating);
        });
    });


    // ---------- SUGGESTION CHECKBOXES ----------
    form.querySelectorAll('input[type="checkbox"]').forEach((input) => {
        input.addEventListener("change", () => {
            reviewWasEdited = false;
            generateSentence();
        });
    });


    // ---------- MANUAL REVIEW EDITING ----------
    if (reviewText) {
        reviewText.addEventListener("input", () => {
            reviewWasEdited = true;
        });
    }


    // ---------- READ LOCAL REVIEWS ----------
    function getReviews() {
        try {
            const value = JSON.parse(
                localStorage.getItem(storageKey) || "[]"
            );

            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.error("Unable to read saved reviews:", error);
            return [];
        }
    }


    // ---------- ESCAPE HTML ----------
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }


    // ---------- DISPLAY LOCAL REVIEWS ----------
    function renderReviews() {
        if (!reviewList) return;

        const reviews = getReviews();

        if (!reviews.length) {
            reviewList.innerHTML =
                '<p class="empty-reviews">Your feedback will appear here after submission.</p>';
            return;
        }

        reviewList.innerHTML = reviews.slice(0, 5).map((review) => {
            const safeName = escapeHTML(review.name || "Guest");
            const safeText = escapeHTML(review.text);

            const rating = Math.max(
                0,
                Math.min(5, Number(review.rating) || 0)
            );

            const starsText =
                "★".repeat(rating) + "☆".repeat(5 - rating);

            const date = new Date(review.date);

            const dateText = Number.isNaN(date.getTime())
                ? ""
                : date.toLocaleDateString();

            return `
                <article class="review-card">
                    <div class="review-card-top">
                        <span class="review-author">${safeName}</span>
                        <span class="review-stars"
                              aria-label="${rating} out of 5 stars">
                            ${starsText}
                        </span>
                    </div>
                    <p class="review-copy">${safeText}</p>
                    <p class="review-date">${dateText}</p>
                </article>
            `;
        }).join("");
    }


    // ---------- SUBMIT FEEDBACK ----------
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        console.log("Feedback form submitted");

        // Check rating.
        if (!selectedRating) {
            showStatus("Please select a star rating first.");
            return;
        }

        // Check review text.
        const text = reviewText
            ? reviewText.value.trim()
            : "";

        if (!text) {
            showStatus("Please select a suggestion or write your review.");

            if (reviewText) {
                reviewText.focus();
            }

            return;
        }

        // Create local review.
        const review = {
            name: reviewerName?.value.trim() || "Guest",
            rating: selectedRating,
            text: text,
            date: new Date().toISOString()
        };

        // Save locally if browser storage is available.
        try {
            const reviews = getReviews();

            reviews.unshift(review);

            localStorage.setItem(
                storageKey,
                JSON.stringify(reviews.slice(0, 30))
            );

            renderReviews();
        } catch (error) {
            console.warn("Local review saving failed:", error);
        }

        // Try to copy the review before redirecting.
        let copied = false;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                copied = true;
            }
        } catch (error) {
            console.warn("Could not copy review automatically:", error);
        }

        // Show the appropriate message.
        if (copied) {
            showStatus(
                "Review copied! Opening Google Maps. Paste and submit your review there.",
                "#16734a"
            );
        } else {
            showStatus(
                "Opening Google Maps. You can write your review there.",
                "#16734a"
            );
        }

        console.log("Opening Google Maps review destination");

        // Redirect in the current tab.
        window.location.assign(googleReviewURL);
    });


    // ---------- INITIALIZE ----------
    renderReviews();
    updateStars(0);

    console.log("Feedback system initialized successfully");
})();


// ================= SAVE & SHARE TOOLS =================
(function () {
    "use strict";

    var tools = document.getElementById("tools");
    var modal = document.getElementById("qmodal");
    var modalTitle = document.getElementById("qmodalTitle");
    var modalBody = document.getElementById("qmodalBody");
    var modalClose = document.getElementById("qmodalClose");
    var toastEl = document.getElementById("qtoast");
    if (!tools || !modal) return;

    function pageUrl() { return location.href.split("#")[0]; }

    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add("is-show");
        clearTimeout(toast.t);
        toast.t = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2200);
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand("copy"); } catch (e) {}
            document.body.removeChild(ta);
            ok ? resolve() : reject();
        });
    }

    // ---------- popup (used by QR code) ----------
    function openModal(title, html) {
        modalTitle.textContent = title;
        modalBody.innerHTML = html;
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        modalClose.focus({ preventScroll: true });
    }
    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
    }
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    // ---------- actions ----------
    function share() {
        var data = {
            title: userName,
            text: "Check out " + userName + " – your trusted travel partner",
            url: pageUrl()
        };
        if (navigator.share) {
            navigator.share(data).catch(function () {});
        } else {
            copyLink();
        }
    }

    function copyLink() {
        copyText(pageUrl()).then(
            function () { toast("Link copied"); },
            function () { toast("Copy failed"); }
        );
    }

    function saveContact() {
        var lines = [
            "BEGIN:VCARD", "VERSION:3.0",
            "N:;" + userName + ";;;", "FN:" + userName,
            "ORG:" + userName, "TITLE:Your Trusted Travel Partner",
            "TEL;TYPE=WORK,VOICE:" + CALL_NUMBER,
            "URL:" + MAP_URL
        ];
        if (/^https?:/.test(pageUrl())) lines.push("URL:" + pageUrl());
        lines.push("END:VCARD");

        var blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "Uravi-Holidays.vcf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
        toast("Contact file downloaded");
    }

    function showQr() {
        var src = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=" +
            encodeURIComponent(pageUrl());
        openModal(
            "Scan QR code",
            '<div class="qmodal__center">' +
                '<img src="' + src + '" alt="QR code for this card" width="240" height="240">' +
                "<p>Scan to open this digital card on another phone.</p>" +
                '<a class="qbtn" href="' + src + '" download="uravi-holidays-qr.png" target="_blank" rel="noopener">Download QR</a>' +
            "</div>"
        );
    }

    var actions = { save: saveContact, share: share, copy: copyLink, qr: showQr };

    tools.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-action]");
        if (!btn) return;
        var run = actions[btn.getAttribute("data-action")];
        if (run) run();
    });
})();


// ================= SCROLL EFFECTS =================
(function () {
    "use strict";

    var bar = document.getElementById("scrollProgress");
    var toTop = document.getElementById("toTop");
    var root = document.documentElement;
    var reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ticking = false;

    // progress bar + back-to-top button
    function update() {
        var max = root.scrollHeight - root.clientHeight;
        var top = window.pageYOffset || root.scrollTop || 0;
        if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(top / max, 1) : 0) + ")";
        if (toTop) toTop.classList.toggle("is-show", top > 480);
        ticking = false;
    }
    function onScroll() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    if (toTop) {
        toTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        });
    }

    // reveal sections as they scroll into view
    var items = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
        items.forEach(function (el) { io.observe(el); });
    } else {
        items.forEach(function (el) { el.classList.add("is-in"); });
    }

    // keep the paper plane still (mid-flight) when motion is reduced
    var art = document.getElementById("heroArt");
    if (reduceMotion && art && art.pauseAnimations) {
        art.pauseAnimations();
        art.setCurrentTime(3.5);
    }
})();
