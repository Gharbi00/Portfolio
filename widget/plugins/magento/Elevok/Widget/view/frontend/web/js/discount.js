document.addEventListener("DOMContentLoaded", function() {
    var discountData = document.getElementById("discount-data");
    var unitValue = parseFloat(discountData.getAttribute("data-unit-value"));
    var walletAmount = parseFloat(discountData.getAttribute("data-wallet-amount"))
    

    function showAlert(message, type) {
        var alertBox = document.getElementById("custom-alert");
        var alertMessage = document.getElementById("alert-message");
        var closeButton = document.getElementById("alert-close-btn");
        
        alertMessage.textContent = message;
        alertBox.classList.remove("hidden", "success", "error", "remove");
        alertBox.classList.add("visible");
    
        if (type === "success") {
            alertBox.style.backgroundColor = "#4CAF50"; // Green for success
        } else if (type === "error") {
            alertBox.style.backgroundColor = "#f44336"; // Red for error
        } else if (type === "remove") {
            alertBox.style.backgroundColor = "#005aff"; // Blue for remove discount
        }
        closeButton.onclick = function() {
            alertBox.classList.remove("visible");
            alertBox.classList.add("hidden");
        };
    }
    
        document.getElementById("apply_discount_btn").addEventListener("click", function() {
            var coinsInput = document.getElementById("coins_input").value;
            var discountAmount = coinsInput * unitValue; // Use unitValue from the data attribute
            var maxDiscountAmount = Math.min(discountAmount, walletAmount); // Assuming $walletAmount is defined
    
            if (coinsInput <= 0 || isNaN(coinsInput)) {
                showAlert("Please enter a valid amount of coins.", "error");
                return;
            }
            if (coinsInput > walletAmount) {
                showAlert("The entered amount exceeds your wallet balance.", "error");
                return;
            }
    
            var form = new FormData();
            form.append("action", "apply_discount");
            form.append("discount_amount", maxDiscountAmount);
    
            require(['mage/url'], function(url) {
                var discountUrl = url.build('widget/index/applydiscount');
                
                // Assume "form" is the FormData object with the necessary data
                fetch(discountUrl, {
                    method: "POST",
                    body: form
                }).then(response => {
                    if (response.ok) {
                        return response.json(); // Parse the JSON response
                    } else {
                        throw new Error("Failed to apply discount");
                    }
                }).then(data => {
                    // Show the success alert with the new total amount
                    showAlert(data.message + " Total: " + data.total, "success");
                    location.reload();
                }).catch(error => {
                    //console.error("Error applying discount:", error);
                    showAlert("Échec de l'application de la réduction. Veuillez réessayer !", "error");
                });
            });
            
            
        });
        
        
            //console.log("DOM fully loaded and parsed");
        
            var discountCard = document.querySelector('.totals.discount');
            
            //console.log("Initial discountCard detection:", discountCard);
        
            var checkElementInterval = setInterval(function() {
                discountCard = document.querySelector('.totals.discount');
                
                if (discountCard) {
                    //console.log("Found discountCard element dynamically");
                    clearInterval(checkElementInterval); // Stop the interval once we find it
                    var closeButton = document.createElement('button');
                    closeButton.innerHTML = '×';
                    closeButton.className = 'close-button';
                    closeButton.style.position = 'absolute';
                    closeButton.style.right = '50px';
                    closeButton.style.top = '8px';
                    closeButton.onclick = function() {
                        removeDiscount();
                        discountCard.style.display = 'none'; // Hide the discount element
                    };
                    discountCard.style.position = 'relative';
                    discountCard.appendChild(closeButton);
                } else {
                    //console.log("Waiting for discountCard element...");
                }
            }, 5000); 
        
            function removeDiscount() {
                //console.log("Attempting to remove discount...");
            
                require(['mage/url'], function(url) {
                    var removeUrl = url.build('widget/index/removediscount'); // Updated to correct path
            
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", removeUrl, true); // Open the request inside the callback after setting removeUrl
                    xhr.setRequestHeader("Content-Type", "application/json");
            
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            try {
                                var contentType = xhr.getResponseHeader("Content-Type");
                                
                                // Ensure response is JSON
                                if (contentType && contentType.includes("application/json")) {
                                    var response = JSON.parse(xhr.responseText);
                                    //console.log("Server response:", response);
                                    if (xhr.status === 200 && response.success) {
                                        showAlert(response.message, "remove");
                                        location.reload();
                                    } else {
                                        showAlert(response.message || "Failed to remove discount. Please try again.", "error");
                                    }
                                } else {
                                    //console.error("Unexpected response format:", xhr.responseText);
                                    showAlert("Unexpected error. Please try again.", "error");
                                }
                            } catch (e) {
                                //console.error("Response parsing error:", e, xhr.responseText);
                                showAlert("An unexpected error occurred. Please try again.", "error");
                            }
                        }
                    };
            
                    xhr.send(JSON.stringify({ action: 'remove_discount' }));
                });
            }
            
            

            
            
            
            
});

require([
    'jquery',
    'domReady!'
], function ($) {
    try {
        // Debug: Start of script
        console.log("Starting to reposition and toggle the discount widget...");

        const waitForElements = function (callback) {
            const interval = setInterval(function () {
                const discountWidget = $('#discount-widget');
                const actionsToolbar = $('.actions-toolbar');
                const agreementsBlock = $('.checkout-agreements-block');

                // Check if all elements are present
                if (discountWidget.length && actionsToolbar.length && agreementsBlock.length) {
                    clearInterval(interval); // Stop the interval
                    callback(discountWidget, actionsToolbar, agreementsBlock); // Execute callback
                } else {
                    // Debug: Log the current status of element availability
                    console.log("Waiting for elements to load...");
                    console.log("Discount widget found:", discountWidget.length > 0);
                    console.log("actions-toolbar found:", actionsToolbar.length > 0);
                    console.log("checkout-agreements-block found:", agreementsBlock.length > 0);
                }
            }, 100); // Check every 100ms
        };

        const repositionAndToggleWidget = function (discountWidget, actionsToolbar, agreementsBlock) {
            // Reposition the discount widget
            agreementsBlock.after(discountWidget);
            console.log("Discount widget successfully repositioned.");

            // Function to toggle visibility of the discount widget
            const toggleDiscountWidget = function () {
                const hash = window.location.hash;

                if (hash === '#payment') {
                    discountWidget.show(); // Show the widget only on the payment step
                    console.log("Discount widget displayed.");
                } else {
                    discountWidget.hide(); // Hide the widget on other steps
                    console.log("Discount widget hidden.");
                }
            };

            // Initial toggle based on current hash
            toggleDiscountWidget();

            // Listen for hash changes to toggle visibility dynamically
            $(window).on('hashchange', function () {
                toggleDiscountWidget();
            });
        };

        // Wait for the elements to load and then reposition and toggle the widget
        waitForElements(repositionAndToggleWidget);

    } catch (error) {
        // Debug: Catch and log errors
        console.error("Error during discount widget setup:", error);
    }
});


