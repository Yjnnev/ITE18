
function getCategory(value){
    switch (value){
        case 0.1: return "Student";
        case 0.05: return "Staff";
        case 0: return "Guest";
        default: return "Invalid Category";
    }
}


// Menu Data
const menu_meals = ["rice", "chicken", "juice"];
const menu_prices = [50, 80, 20];

function calculate(){
    // Customer object
    let customer = {};

    // Collected Prices. Quantity x Corresponding Price from menu_meals
    let collected_prices = []
    
    // Prompt for the users age
    let customer_name = prompt("What's your name?");
    if (customer_name === null || customer_name.trim() === ""){
        console.log("Invalid Input!");
        return;
    }

    customer.name = customer_name.trim().toUpperCase();
    
    // Prompt for the customer's category
    let category = prompt("Enter the category: student, staff, guest");
    if (category === null){
        console.log("Invalid Input!");
        return;
    }

    category = category.trim().toLowerCase();

    switch (category) {
        case "student":
            customer.category = 0.1;
            break;
        case "staff":
            customer.category = 0.05;
            break;
        default:
            customer.category = 0;
    }

    // counts how many quantities were set to zero
    let quantity_zeroes = 0; 

    // Get quantity for each meal
    for (let quantity_index=0; quantity_index<3; quantity_index++){
        let quantity  = prompt("Enter quantity");
        let quantity_number = Number(quantity);
        
        if ( 
            quantity === null ||                      // Reject null values
            quantity.trim() === "" ||                   // Reject empty strings
            !Number.isFinite(quantity_number) ||      // Reject infinities 
            !Number.isInteger(quantity_number) ||     // Reject non integers
            quantity_number < 0 ||                    // Ensure quantity is within range of 10
            quantity_number > 10
        ) {
            console.log("Invalid Input!");
            return;
        }

        // Check if quantity is zero
        if (quantity_number === 0) quantity_zeroes++;

        // Multiply the quantity to its menu price
        collected_prices.push(quantity_number * menu_prices[quantity_index]);
    }

    // Calculate the result
    const subtotal = collected_prices[0] + collected_prices[1] + collected_prices[2];
    const discount = subtotal * customer.category;
    const total = subtotal - discount;

    let receipt = "";
    if (quantity_zeroes == 3) receipt = "No items ordered.";
    else {
        receipt = `
            Name: ${customer.name}
            Category: ${getCategory(customer.category)}
            Item Totals: ${collected_prices[0]}, ${collected_prices[1]}, ${collected_prices[2]}
            Subtotal: ${subtotal.toFixed(2)}
            Discount: ${discount.toFixed(2)}
            Total: ${total.toFixed(2)}
        `;
    }

    // Display the receipt using both alert() and console.log()
    console.log(receipt);
    alert(receipt);

}

calculate();