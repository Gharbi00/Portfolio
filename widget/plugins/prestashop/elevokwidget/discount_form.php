
<?php

$displayDiscountForm = (bool)Configuration::get('ELEVOKWIDGET_DISPLAY_DISCOUNT');
if ($displayDiscountForm) {
?>
<div id="wallet-info">
    <span class="wallet-label"><?php echo $moneyAmountText; ?></span>
    <strong><?php echo $walletAmount; ?></strong>
    <img src="<?php echo $walletIconUrl; ?>" alt="<?php echo $walletAlt; ?>" />
</div>

<div id="input-coins-step">
    <label for="coins_input" class="coins-label"><?php echo $pointsToUseText; ?></label>
    <input type="number" id="coins_input" name="coins_input" min="0" max="<?php echo $walletAmount; ?>" />
    <img src="<?php echo $walletIconUrl; ?>" alt="<?php echo $walletAlt; ?>" />
</div>

<div id="apply_discount_btn_wrapper">
    <button id="apply_discount_btn" class="apply-btn"><?php echo $submitButtonText; ?></button>
</div>
<?php
} else {
    echo '<p>Discount form is disabled.</p>';
}
?>
<script>
    var rootFolderName = "<?php echo addslashes(basename(realpath(_PS_ROOT_DIR_))); ?>";
    console.log('Root Folder Name:', rootFolderName);
    function showAlert(message, type) {
    var alertBox = document.getElementById("custom-alert");
    var alertMessage = document.getElementById("alert-message");

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
    }
    document.getElementById("apply_discount_btn").addEventListener("click", function() {
        var coinsInput = document.getElementById("coins_input").value;
        var discountAmount = coinsInput * <?php echo $unitValue; ?>;
        var maxDiscountAmount = Math.min(discountAmount, <?php echo $walletAmount; ?>);
        if (coinsInput <= 0 || isNaN(coinsInput)) {
            showAlert("Please enter a valid amount of coins.","error");
            return;
        }
        if (coinsInput > <?php echo htmlspecialchars($walletAmount, ENT_QUOTES, 'UTF-8'); ?>) {
        showAlert("The entered amount exceeds your wallet balance.", "error");
        return;
        }
        
        var form = new FormData();
        form.append("action", "apply_discount");
        form.append("discount_amount", maxDiscountAmount);
        fetch(`/${encodeURIComponent(rootFolderName)}/modules/elevokwidget/ajax-discount-handler.php`, {
            method: "POST",
            body: form
        }).then(response => {
            if (response.ok) {
                showAlert("Réduction appliquée avec succès !","success");
                location.reload();
            } else {
                response.text().then(errorMessage => {
                    console.error("Failed to apply discount:", errorMessage);
                    showAlert("Échec de l'application de la réduction. Veuillez réessayer !","error");
                });
            }
        }).catch(error => {
            console.error("Error applying discount:", error);
        });
    });

    document.addEventListener("DOMContentLoaded", function() {
    var discountCard = document.querySelector('.promo-name'); 
    if (discountCard) {
        var closeButton = document.createElement('button');
        closeButton.innerHTML = '×'; 
        closeButton.className = 'close-button'; 
        closeButton.style.position = 'absolute';
        closeButton.style.right = '10px'; 
        closeButton.style.top = '10px'; 
        closeButton.onclick = function() {
            removeDiscount();
            discountCard.style.display = 'none'; 
        };
        discountCard.style.position = 'relative'; 
        discountCard.appendChild(closeButton); 
    }

    function removeDiscount() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `/${encodeURIComponent(rootFolderName)}/modules/elevokwidget/remove-discount.php`, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            showAlert("Discount removed successfully!", "remove");
            location.reload();
        } else if (xhr.readyState === 4) {
            showAlert("Failed to remove discount. Please try again.", "error");
        }
    };

    xhr.send("action=remove_discount");
}
});
</script>
<style>
            .close-button {
                background: transparent;
                border: none;
                color: #000; 
                font-size: 20px; 
                cursor: pointer; 
                padding: 0; 
                }
            .custom-alert {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: #f44336;
                color: white;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                opacity: 0;
                z-index: 1000;
                visibility: hidden;
                transition: all 0.3s ease-in-out;
            }

            .custom-alert.visible {
                opacity: 1;
                visibility: visible;
            }

            .custom-alert.hidden {
                opacity: 0;
                visibility: hidden;
            }

            .alert-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
            }

            .alert-close-btn:hover {
                color: #ddd;
            }
            </style>
            <div id="custom-alert" class="custom-alert hidden">
                <span id="alert-message"></span>
                <button id="alert-close-btn" class="alert-close-btn">&times;</button>
            </div>