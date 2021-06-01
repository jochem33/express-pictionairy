const wordInputs = document.getElementsByClassName("wordsBox")

wordInputs.forEach(el => el.addEventListener('keyup', event => {
    if (event.key === "Enter") {
        const wordvalue = event.target.value
    
        if(wordvalue.lenght > 2) {
            socket.emit("wordSubmission", {who: wordvalue})
        }
    }
}))