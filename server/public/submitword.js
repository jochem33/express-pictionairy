const wordInputs = document.getElementsByClassName("wordsBox")

// when enter is pressed on an input, sent the word to the server
wordInputs.forEach(el => el.addEventListener('keyup', event => {
    if (event.key === "Enter") {
        const wordvalue = event.target.value
        event.target.disabled = true
        
        if(wordvalue.lenght > 2) {
            socket.emit("wordSubmission", {who: wordvalue})
        }
    }
}))