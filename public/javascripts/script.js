const registerForm = document.getElementById("registerForm");
const logInForm = document.getElementById("logInForm");

function toggle() {
    if(registerForm.classList.contains("hidden")) {
        registerForm.classList.remove("hidden");
        logInForm.classList.add("hidden");
    }
    else {
        registerForm.classList.add("hidden");
        logInForm.classList.remove("hidden");
    }
}