// dicynebt,addEventListener("DOMcontentLoaded", () => {
//     const loginForm = document.getSelector("#login");
//     const createAccountForm = document.getSelector("#creatAccount");

//     document.getSelector("#linkCreateAccount").addEventListener("click", () => {
//         loginForm.classList.add("form-hidden");
//         createAccountForm.classList.remove("form-hidden");
//     });

//     document.getSelector("#linkLogin").addEventListener("click", () => {
//         loginForm.classList.remove("form-hidden");
//         createAccountForm.classList.add("form-hidden");
//     });
// });


const clearInput = () => {
    const input = document.getElementsByTagName("input")[0];
    input.value = "";
  }
  
  const clearBtn = document.getElementById("clear-btn");
  clearBtn.addEventListener("click", clearInput);