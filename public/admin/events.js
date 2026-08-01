/* ==========================================================
   EVENTS
========================================================== */

const form =
    document.getElementById("event-form");

if (form) {

    form.addEventListener(
        "submit",
        createEvent
    );

}

/* ==========================================================
   CREATE EVENT
========================================================== */

async function createEvent(e) {

    e.preventDefault();

    const title =
        document.getElementById("title").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const file =
        document.getElementById("banner_image").files[0];

    if (!file) {

        alert("Please select a banner image.");

        return;

    }

    try {

        // Upload image to R2
        const formData = new FormData();

        formData.append("file", file);

        const uploadResponse = await fetch(
            "/api/upload",
            {
                method: "POST",
                body: formData
            }
        );

        if (!uploadResponse.ok) {

            throw new Error("Image upload failed.");

        }

        const uploadResult =
            await uploadResponse.json();

        // Save event
        const payload = {

            title,
            category,
            description,
            banner_image: uploadResult.url

        };

        const response = await fetch(
            "/api/events",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(payload)

            }
        );

        if (!response.ok) {

            throw new Error(
                "Unable to save event."
            );

        }

        alert("Event published successfully.");

        form.reset();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}