localStorage.clear();

let form = document.getElementById("joinForm")
let gamecode = document.getElementById("gamecode")
let nickname = document.getElementById("nickname")


form.addEventListener("submit", function(){
    localStorage.setItem("gamecode", gamecode.value)
    localStorage.setItem("nickname", nickname.value)
    return true
})
