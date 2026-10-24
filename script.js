console.log("Uravi Holidays script loaded");

// ================= PROFILE DETAILS =================
const CFG = window.CARD || {};
const userName = CFG.name || "Uravi Holidays";

const nameParts = userName.trim().split(/\s+/).filter(Boolean);

const initials = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0] || "U").slice(0, 2).toUpperCase();

const profileName = document.getElementById("profileName");

if (profileName) {
    profileName.textContent = userName;
}


// ================= GOOGLE MAPS LOCATION =================
const MAP_URL = CFG.mapUrl || "https://maps.app.goo.gl/xikMJF9QvYEE35hi8";
const CALL_NUMBER = CFG.phone || "+918766043591";

function getLocation() {
    window.open(MAP_URL, "_blank", "noopener,noreferrer");
}


// ================= WHATSAPP CONTACT =================
const whatsappNumber = String(CFG.whatsapp ?? "98329056457").replace(/\D/g, "");

const whatsappMessage =
    CFG.waMessage || "Hello! 👋 I'm interested in your travel packages. Please share the available holiday packages and pricing. ✈️🌍";

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

    // ================= GOOGLE REVIEW SETTINGS (EDIT HERE) =================
    // Paste your OFFICIAL Google review link between the quotes below.
    // Get it from your Google Business Profile:
    //   Business Profile > "Get more reviews" (or "Ask for reviews") > Copy link
    // It normally looks like:  https://g.page/r/XXXXXXXXXXXX/review
    // If this is empty or not a valid review link, the site opens your
    // Google Maps listing instead, and the customer must tap "Write a review".
    const GOOGLE_REVIEW_URL = CFG.googleReview || "https://g.page/r/CXPe05M9jvHUEAE/review";

    // Fallback only: your ordinary Google Maps listing page.
    // This does NOT open the review form by itself.
    const GOOGLE_LISTING_URL =
        CFG.googleListing || "https://www.google.com/maps/place/URAVI+HoLidays/@21.1427793,79.0859763,17z/data=!4m8!3m7!1s0x3bd4c10d0963e1ff:0xd4f18e3d93d3de73!8m2!3d21.1427793!4d79.0859763!9m1!1b1!16s%2Fg%2F11p20x75bp";

    // Only these hosts are accepted, so a typo can never send customers elsewhere.
    const ALLOWED_GOOGLE_HOSTS = [
        "g.page",
        "search.google.com",
        "www.google.com",
        "google.com",
        "maps.app.goo.gl",
        "goo.gl"
    ];

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
                `My experience with ${userName} was ${ratingWords[selectedRating]}`
            );
        } else if (positives.length) {
            parts.push(
                `My experience with ${userName} was enjoyable`
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


    // ---------- GOOGLE DESTINATION ----------
    function parseGoogleUrl(value) {
        if (typeof value !== "string" || !value.trim()) return null;

        try {
            const url = new URL(value.trim());

            if (
                url.protocol !== "https:" ||
                !ALLOWED_GOOGLE_HOSTS.includes(url.hostname)
            ) {
                return null;
            }

            return url;
        } catch (error) {
            return null;
        }
    }

    // A "dedicated" link is one of Google's official review-form formats.
    function isDedicatedReviewUrl(url) {
        if (!url) return false;

        const isGooglePageLink =
            url.hostname === "g.page" &&
            /^\/r\/[^/]+\/review\/?$/.test(url.pathname);

        const isWriteReviewLink =
            url.hostname === "search.google.com" &&
            url.pathname === "/local/writereview" &&
            Boolean(url.searchParams.get("placeid"));

        return isGooglePageLink || isWriteReviewLink;
    }

    function resolveGoogleDestination() {
        const reviewUrl = parseGoogleUrl(GOOGLE_REVIEW_URL);

        if (reviewUrl && isDedicatedReviewUrl(reviewUrl)) {
            return { href: reviewUrl.href, dedicated: true };
        }

        if (GOOGLE_REVIEW_URL.trim()) {
            console.warn(
                "GOOGLE_REVIEW_URL is not a recognised Google review link. " +
                "Expected https://g.page/r/.../review. Using the listing page instead."
            );
        }

        const listingUrl = parseGoogleUrl(GOOGLE_LISTING_URL);

        return listingUrl
            ? { href: listingUrl.href, dedicated: false }
            : null;
    }


    // ---------- COPY REVIEW TEXT ----------
    function legacyCopy(text) {
        const helper = document.createElement("textarea");

        helper.value = text;
        helper.setAttribute("readonly", "");
        helper.style.position = "fixed";
        helper.style.top = "0";
        helper.style.left = "-9999px";
        helper.style.opacity = "0";

        document.body.appendChild(helper);

        try {
            helper.focus();
            helper.select();
            helper.setSelectionRange(0, text.length);

            return document.execCommand("copy");
        } finally {
            document.body.removeChild(helper);
        }
    }

    async function copyReviewText(text) {
        // Modern clipboard API (needs HTTPS and may be blocked by the browser).
        try {
            if (navigator.clipboard?.writeText && window.isSecureContext) {
                await Promise.race([
                    navigator.clipboard.writeText(text),
                    new Promise((_, reject) =>
                        setTimeout(
                            () => reject(new Error("Clipboard request timed out")),
                            1500
                        )
                    )
                ]);

                return true;
            }
        } catch (error) {
            console.warn("Clipboard API unavailable or blocked:", error);
        }

        // Older-browser fallback.
        try {
            return legacyCopy(text);
        } catch (error) {
            console.warn("Fallback copy failed:", error);
            return false;
        }
    }


    // ---------- SUBMIT FEEDBACK ----------
    const submitButton = form.querySelector('button[type="submit"]');

    // Fallback buttons are created here in JavaScript (no HTML changes needed).
    // They reuse the existing "submit-review" button style and stay hidden
    // unless automatic copying fails.
    function createFallbackButton(id, iconClass, label) {
        const button = document.createElement("button");
        const icon = document.createElement("i");

        button.id = id;
        button.type = "button";
        button.className = "submit-review";

        icon.className = iconClass;
        icon.setAttribute("aria-hidden", "true");

        button.appendChild(icon);
        button.appendChild(document.createTextNode(" " + label));

        return button;
    }

    const copyReviewBtn = createFallbackButton(
        "copyReviewBtn",
        "fa-solid fa-copy",
        "Copy review"
    );

    const continueGoogleBtn = createFallbackButton(
        "continueGoogleBtn",
        "fa-brands fa-google",
        "Continue to Google"
    );

    const fallbackPanel = document.createElement("div");

    fallbackPanel.id = "reviewFallback";
    fallbackPanel.hidden = true;
    fallbackPanel.appendChild(copyReviewBtn);
    fallbackPanel.appendChild(continueGoogleBtn);

    if (status && status.parentNode) {
        status.parentNode.insertBefore(fallbackPanel, status.nextSibling);
    } else {
        form.appendChild(fallbackPanel);
    }

    let isRedirecting = false;
    let pending = null; // { text, destination } for the current submission

    function setSubmitting(active) {
        isRedirecting = active;

        if (submitButton) {
            submitButton.disabled = active;
            submitButton.style.opacity = active ? "0.7" : "";
        }

        if (!active && fallbackPanel) {
            fallbackPanel.hidden = true;
        }
    }

    // ---------- OPEN GOOGLE ----------
    function openGoogle(destination) {
        try {
            window.location.assign(destination.href);
        } catch (error) {
            console.error("Could not open Google:", error);
            setSubmitting(false);
            showStatus(
                "Could not open Google automatically. Please search for Uravi Holidays on Google Maps to leave your review."
            );
        }
    }

    // ---------- FALLBACK BUTTONS (shown only if auto-copy fails) ----------
    // A fresh tap counts as a user gesture, so copying usually works here.
    if (copyReviewBtn) {
        copyReviewBtn.addEventListener("click", async () => {
            if (!pending) return;

            const ok = await copyReviewText(pending.text);

            if (ok) {
                showStatus(
                    "Review copied. Now tap Continue to Google and paste it there.",
                    "#16734a"
                );
            } else {
                if (reviewText) {
                    reviewText.focus();
                    reviewText.select();
                }

                showStatus(
                    "Still could not copy. Press and hold your review text above and choose Copy, then tap Continue to Google."
                );
            }
        });
    }

    if (continueGoogleBtn) {
        continueGoogleBtn.addEventListener("click", () => {
            if (pending) {
                openGoogle(pending.destination);
            }
        });
    }

    // Re-enable the button if the customer returns with the Back button.
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            setSubmitting(false);
        }
    });

    if (!parseGoogleUrl(GOOGLE_REVIEW_URL)) {
        console.warn(
            "No official Google review link set. Edit GOOGLE_REVIEW_URL in script.js."
        );
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isRedirecting) return;

        // Validate star rating.
        if (!selectedRating) {
            showStatus("Please select a star rating first.");
            return;
        }

        // Validate review text.
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

        // Check the destination before saving anything.
        const destination = resolveGoogleDestination();

        if (!destination) {
            showStatus(
                "Google review link is not configured correctly. Please contact us directly."
            );
            return;
        }

        setSubmitting(true);

        // Create the feedback record.
        const review = {
            name: reviewerName?.value.trim() || "Guest",
            rating: selectedRating,
            text: text,
            date: new Date().toISOString()
        };

        // Save feedback in this browser's local storage (this device only).
        let savedLocally = false;

        try {
            const reviews = getReviews();

            reviews.unshift(review);

            localStorage.setItem(
                storageKey,
                JSON.stringify(reviews.slice(0, 30))
            );

            savedLocally = true;
            renderReviews();
        } catch (error) {
            console.warn("Local review saving failed:", error);
        }

        // Try copying the review text for the customer.
        const copied = await copyReviewText(text);

        pending = { text, destination };

        // Status message shown BEFORE leaving the page.
        // Nothing has been posted to Google at this point.
        const steps = destination.dedicated
            ? "Google will open next. Sign in if asked, choose your stars, paste your text, and tap Post."
            : "Google Maps will open next. Tap \"Write a review\", choose your stars, paste your text, and tap Post.";

        const savedNote = savedLocally
            ? ""
            : " (This device could not save a local copy.)";

        if (copied) {
            showStatus(
                `Your review text is copied. ${steps} It is not on Google until you post it there.${savedNote}`,
                "#16734a"
            );

            // Give the customer time to read the message, then open Google.
            setTimeout(() => openGoogle(destination), 2500);
            return;
        }

        // Copy failed: do NOT redirect automatically. Let the customer copy
        // the text first, then continue to Google themselves.
        if (reviewText) {
            reviewText.focus();
            reviewText.select();
        }

        if (fallbackPanel) {
            fallbackPanel.hidden = false;

            showStatus(
                `Could not copy automatically. Tap Copy review, then Continue to Google. It is not on Google until you post it there.${savedNote}`
            );
        } else {
            // Panel missing from the HTML: fall back to a delayed redirect.
            showStatus(
                `Could not copy automatically, so your text is selected above. Please copy it now. ${steps}${savedNote}`
            );

            setTimeout(() => openGoogle(destination), 5000);
        }
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

    function pageUrl() {
        return location.href.split("#")[0];
    }

    function toast(msg) {
        if (!toastEl) return;

        toastEl.textContent = msg;
        toastEl.classList.add("is-show");

        clearTimeout(toast.t);

        toast.t = setTimeout(function () {
            toastEl.classList.remove("is-show");
        }, 2200);
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

            try {
                ok = document.execCommand("copy");
            } catch (e) {}

            document.body.removeChild(ta);

            ok ? resolve() : reject();
        });
    }

    // ---------- MODAL ----------
    function openModal(title, html) {
        modalTitle.textContent = title;
        modalBody.innerHTML = html;
        modal.hidden = false;
        document.body.style.overflow = "hidden";

        modalClose?.focus({ preventScroll: true });
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = "";
    }

    if (modalClose) {
        modalClose.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    // ---------- SHARE ----------
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
            function () {
                toast("Link copied");
            },
            function () {
                toast("Copy failed");
            }
        );
    }

    // ---------- SAVE CONTACT ----------
    function saveContact() {
        var lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            "N:;" + userName + ";;;",
            "FN:" + userName,
            "ORG:" + userName,
            "TITLE:" + (CFG.tagline || "Your Trusted Travel Partner"),
            "TEL;TYPE=WORK,VOICE:" + CALL_NUMBER,
            "URL:" + MAP_URL
        ];

        if (/^https?:/.test(pageUrl())) {
            lines.push("URL:" + pageUrl());
        }

        lines.push("END:VCARD");

        var blob = new Blob(
            [lines.join("\r\n")],
            { type: "text/vcard;charset=utf-8" }
        );

        var a = document.createElement("a");

        a.href = URL.createObjectURL(blob);
        a.download = userName.replace(/\s+/g, "-") + ".vcf";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(function () {
            URL.revokeObjectURL(a.href);
        }, 1000);

        toast("Contact file downloaded");
    }

    // ---------- QR CODE ----------
    function showQr() {
        var src =
            "https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=" +
            encodeURIComponent(pageUrl());

        openModal(
            "Scan QR code",
            '<div class="qmodal__center">' +
                '<img src="' + src +
                '" alt="QR code for this card" width="240" height="240">' +
                "<p>Scan to open this digital card on another phone.</p>" +
                '<a class="qbtn" href="' + src +
                '" download="uravi-holidays-qr.png" target="_blank" rel="noopener">Download QR</a>' +
            "</div>"
        );
    }

    var actions = {
        save: saveContact,
        share: share,
        copy: copyLink,
        qr: showQr
    };

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

    // ---------- PROGRESS BAR + BACK TO TOP ----------
    function update() {
        var max = root.scrollHeight - root.clientHeight;
        var top = window.pageYOffset || root.scrollTop || 0;

        if (bar) {
            bar.style.transform =
                "scaleX(" + (max > 0 ? Math.min(top / max, 1) : 0) + ")";
        }

        if (toTop) {
            toTop.classList.toggle("is-show", top > 480);
        }

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
            window.scrollTo({
                top: 0,
                behavior: reduceMotion ? "auto" : "smooth"
            });
        });
    }

    // ---------- REVEAL SECTIONS ----------
    var items = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-in");
                    io.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -6% 0px"
        });

        items.forEach(function (el) {
            io.observe(el);
        });
    } else {
        items.forEach(function (el) {
            el.classList.add("is-in");
        });
    }

    // ---------- REDUCED MOTION ----------
    var art = document.getElementById("heroArt");

    if (reduceMotion && art && art.pauseAnimations) {
        art.pauseAnimations();
        art.setCurrentTime(3.5);
    }
})();